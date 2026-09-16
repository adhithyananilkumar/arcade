"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type StudioSaveState = "idle" | "saving" | "saved" | "error";

export interface StudioSaveAdapter<T> {
  save(snapshot: T): Promise<void>;
}

export interface UseStudioSaveManagerOptions {
  debounceMs?: number;
  savedStateDurationMs?: number;
}

export interface StudioSaveManager<T> {
  isDirty: boolean;
  saveState: StudioSaveState;
  error: Error | null;
  lastSavedAt: Date | null;
  scheduleSave: (snapshot: T) => void;
  flush: () => Promise<void>;
}

/**
 * Headless, snapshot-safe save manager for Studio workspaces.
 *
 * Owns the save lifecycle:
 * edit -> mark dirty -> debounce -> save latest snapshot -> saving -> saved | error
 *
 * Concurrency & Snapshot Safety:
 * If an edit occurs while a previous save is in-flight:
 * saving -> new edit -> dirty again -> queue latest snapshot -> save again once in-flight completes.
 * Older save requests never overwrite newer edits.
 */
export function useStudioSaveManager<T>(
  adapter: StudioSaveAdapter<T>,
  options: UseStudioSaveManagerOptions = {}
): StudioSaveManager<T> {
  const { debounceMs = 1000, savedStateDurationMs = 2500 } = options;

  const [isDirty, setIsDirty] = useState(false);
  const [saveState, setSaveState] = useState<StudioSaveState>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Mutable refs to prevent stale closure captures across async save steps
  const adapterRef = useRef(adapter);
  adapterRef.current = adapter;

  const pendingSnapshotRef = useRef<T | null>(null);
  const hasPendingSaveRef = useRef(false);
  const isSavingRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSavedTimer = useCallback(() => {
    if (savedTimerRef.current) {
      clearTimeout(savedTimerRef.current);
      savedTimerRef.current = null;
    }
  }, []);

  const flush = useCallback(async (): Promise<void> => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Nothing pending to save
    if (!hasPendingSaveRef.current || pendingSnapshotRef.current === null) {
      return;
    }

    // If already saving, the in-flight save's completion handler will trigger flush again
    if (isSavingRef.current) {
      return;
    }

    const snapshotToSave = pendingSnapshotRef.current;
    hasPendingSaveRef.current = false;
    isSavingRef.current = true;
    setSaveState("saving");
    setError(null);
    clearSavedTimer();

    try {
      await adapterRef.current.save(snapshotToSave);

      // If edits occurred while saving was in-flight, flush the latest pending snapshot
      if (hasPendingSaveRef.current) {
        isSavingRef.current = false;
        setIsDirty(true);
        // Trigger next flush asynchronously
        flush();
      } else {
        isSavingRef.current = false;
        setIsDirty(false);
        setSaveState("saved");
        const now = new Date();
        setLastSavedAt(now);

        // Transition "saved" back to "idle" after duration
        savedTimerRef.current = setTimeout(() => {
          setSaveState((prev) => (prev === "saved" ? "idle" : prev));
        }, savedStateDurationMs);
      }
    } catch (err) {
      isSavingRef.current = false;
      // Reinstate pending save flag so retry or flush will try again with the latest snapshot
      hasPendingSaveRef.current = true;
      setIsDirty(true);
      const saveError = err instanceof Error ? err : new Error(String(err));
      setError(saveError);
      setSaveState("error");
    }
  }, [clearSavedTimer, savedStateDurationMs]);

  const scheduleSave = useCallback(
    (snapshot: T) => {
      pendingSnapshotRef.current = snapshot;
      hasPendingSaveRef.current = true;
      setIsDirty(true);
      clearSavedTimer();

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        flush();
      }, debounceMs);
    },
    [debounceMs, flush, clearSavedTimer]
  );

  // Unmount safety flush: trigger immediate save for any pending snapshot
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
      }
      if (hasPendingSaveRef.current && pendingSnapshotRef.current !== null && !isSavingRef.current) {
        // Fire and forget save on unmount
        adapterRef.current.save(pendingSnapshotRef.current).catch((err) => {
          console.error("Failed unmount save flush:", err);
        });
      }
    };
  }, []);

  return {
    isDirty,
    saveState,
    error,
    lastSavedAt,
    scheduleSave,
    flush,
  };
}
