import React, { useCallback } from "react";
import { useRoadmapAutoSave } from "../hooks/useRoadmapAutoSave";
import { AlertCircle, Clock, CheckCircle2, ArrowLeft, X } from "lucide-react";
import { RoadmapCanvas } from "./RoadmapCanvas";
import type { RoadmapData } from "../types";

interface RoadmapStudioProps {
  roadmap: RoadmapData;
  onClose?: () => void;
}

export function RoadmapStudio({ roadmap, onClose }: RoadmapStudioProps) {
  const handleSaveSuccess = useCallback((updated: RoadmapData) => {
    // Let the hook manage local state timestamps for now
  }, []);

  const { saveState, errorMessage, scheduleSave, manualSave, forceOverride } = useRoadmapAutoSave(
    roadmap,
    handleSaveSuccess
  );

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 absolute inset-0 z-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close Studio"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-bold text-gray-900 text-lg leading-tight">{roadmap.title}</h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={12} className="mr-1" /> Published
              </span>
            </div>
            {roadmap.description && (
              <p className="text-sm text-gray-500 leading-tight">{roadmap.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end text-xs text-gray-500 gap-1">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            Last Saved: {new Date(roadmap.updatedAt).toLocaleTimeString()}
          </span>
          <span>By {roadmap.createdByName}</span>
        </div>
      </header>

      {saveState === 'conflict' && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-amber-800 text-sm">
            <AlertCircle size={16} />
            <span><strong>Conflict:</strong> This roadmap was modified in another session.</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-white border border-amber-200 text-amber-700 rounded text-xs font-medium hover:bg-amber-50"
            >
              Reload Latest
            </button>
            <button 
              onClick={() => {
                const dummyJson = JSON.stringify({ nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } });
                forceOverride(dummyJson); 
              }}
              className="px-3 py-1 bg-amber-600 text-white rounded text-xs font-medium hover:bg-amber-700"
            >
              Force Override
            </button>
          </div>
        </div>
      )}

      {saveState === 'error' && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2 flex items-center gap-2 text-red-700 text-xs font-medium shrink-0">
          <AlertCircle size={14} />
          {errorMessage || 'Failed to save roadmap changes.'}
        </div>
      )}

      <div className="flex-1 w-full relative">
        <RoadmapCanvas 
          roadmap={roadmap} 
          saveState={saveState}
          onGraphChange={scheduleSave}
          onManualSave={manualSave}
        />
      </div>
    </div>
  );
}
