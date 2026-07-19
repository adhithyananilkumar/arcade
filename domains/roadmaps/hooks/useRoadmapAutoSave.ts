import { useState, useCallback, useRef, useEffect } from 'react';
import { roadmapService } from '../services/roadmap';
import type { RoadmapData } from '../types';

export type SaveState = 'saved' | 'saving' | 'unsaved' | 'error' | 'conflict';

export function useRoadmapAutoSave(
  roadmap: RoadmapData,
  onSaveSuccess: (updatedRoadmap: RoadmapData) => void
) {
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pendingDataRef = useRef<{ graphJson: string; version: number } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const currentVersionRef = useRef(roadmap.version);

  // Sync ref if external prop changes
  useEffect(() => {
    currentVersionRef.current = roadmap.version;
  }, [roadmap.version]);

  const performSave = useCallback(async (graphJson: string, version: number) => {
    if (isSavingRef.current) return;
    
    isSavingRef.current = true;
    setSaveState('saving');
    setErrorMessage(null);

    try {
      const updated = await roadmapService.updateRoadmap(roadmap.id, {
        graphJson,
        version,
      });
      
      currentVersionRef.current = updated.version;
      onSaveSuccess(updated);
      setSaveState('saved');
      pendingDataRef.current = null;
    } catch (error: any) {
      if (error.message && error.message.includes('409') || error.message.toLowerCase().includes('conflict')) {
        setSaveState('conflict');
        setErrorMessage('Save conflict: Graph was updated elsewhere.');
      } else {
        setSaveState('error');
        setErrorMessage(error.message || 'Failed to save changes.');
      }
      // Leave pendingDataRef intact so we can retry
    } finally {
      isSavingRef.current = false;
      
      // If another change came in while we were saving, trigger again
      if (pendingDataRef.current && saveState !== 'conflict') {
        const nextData = pendingDataRef.current;
        pendingDataRef.current = null;
        performSave(nextData.graphJson, currentVersionRef.current);
      }
    }
  }, [roadmap.id, onSaveSuccess, saveState]);

  const scheduleSave = useCallback((graphJson: string) => {
    if (saveState === 'conflict') return; // Stop saving if conflicted
    
    setSaveState('unsaved');
    pendingDataRef.current = { graphJson, version: currentVersionRef.current };
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      if (pendingDataRef.current) {
        performSave(pendingDataRef.current.graphJson, currentVersionRef.current);
      }
    }, 1000);
  }, [performSave, saveState]);

  const manualSave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (pendingDataRef.current) {
      performSave(pendingDataRef.current.graphJson, currentVersionRef.current);
    }
  }, [performSave]);

  const forceOverride = useCallback(async (graphJson: string) => {
    // If conflicted, force override by ignoring version check
    // Since our backend strictly checks version, to override we need to fetch the latest version and use it.
    try {
      setSaveState('saving');
      const latest = await roadmapService.getRoadmap(roadmap.id);
      await performSave(graphJson, latest.version);
    } catch (e: any) {
      setSaveState('error');
      setErrorMessage(e.message || 'Failed to override.');
    }
  }, [roadmap.id, performSave]);

  return {
    saveState,
    errorMessage,
    scheduleSave,
    manualSave,
    forceOverride
  };
}
