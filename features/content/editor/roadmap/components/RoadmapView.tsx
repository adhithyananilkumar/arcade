import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { useRoadmap } from "../hooks/useRoadmap";
import { useRoadmapAutoSave } from "../hooks/useRoadmapAutoSave";
import { Loader2, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { RoadmapCanvas } from "./RoadmapCanvas";
import { useCallback } from "react";
import type { RoadmapData } from "../types";

function RoadmapViewInner({ roadmap }: { roadmap: RoadmapData }) {
  const handleSaveSuccess = useCallback((updated: RoadmapData) => {
    // We could update local roadmap state here if we wanted to reflect new timestamps
    // For now we just let the hook manage it internally.
  }, []);

  const { saveState, errorMessage, scheduleSave, manualSave, forceOverride } = useRoadmapAutoSave(
    roadmap,
    handleSaveSuccess
  );

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-bold text-gray-900 text-lg">{roadmap.title}</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={12} className="mr-1" /> Published
            </span>
          </div>
          {roadmap.description && (
            <p className="text-sm text-gray-500">{roadmap.description}</p>
          )}
        </div>
        
        <div className="flex flex-col items-end text-xs text-gray-500 gap-1">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            Last Saved: {new Date(roadmap.updatedAt).toLocaleTimeString()}
          </span>
          <span>By {roadmap.createdByName}</span>
        </div>
      </div>

      {saveState === 'conflict' && (
        <div className="bg-amber-50 border-y border-amber-200 px-6 py-3 flex items-center justify-between">
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
              // Passing empty string here as a hack, forceOverride actually takes the latest JSON from pendingData
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
        <div className="bg-red-50 border-y border-red-200 px-6 py-2 flex items-center gap-2 text-red-700 text-xs font-medium">
          <AlertCircle size={14} />
          {errorMessage || 'Failed to save roadmap changes.'}
        </div>
      )}

      <div className="w-full bg-gray-50">
        <RoadmapCanvas 
          roadmap={roadmap} 
          saveState={saveState}
          onGraphChange={scheduleSave}
          onManualSave={manualSave}
        />
      </div>
    </>
  );
}

export function RoadmapView({ node }: NodeViewProps) {
  const roadmapId = node.attrs.roadmapId;
  const { roadmap, loading, error } = useRoadmap(roadmapId);

  return (
    <NodeViewWrapper className="roadmap-node my-6">
      <div
        className="rounded-xl border border-gray-200 bg-gray-50 shadow-sm overflow-hidden flex flex-col"
        contentEditable={false}
      >
        {loading && (
          <div className="flex items-center justify-center p-12 text-gray-500 bg-white">
            <Loader2 size={24} className="animate-spin mr-2" />
            <span>Loading Roadmap Studio...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center p-12 bg-white">
            <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-lg">
              <AlertCircle size={20} />
              <span>Failed to load roadmap. Ensure the backend is running and you have access.</span>
            </div>
          </div>
        )}

        {!loading && !error && !roadmap && (
          <div className="flex items-center justify-center p-12 bg-white text-gray-500">
            <span>Invalid roadmap ID or roadmap not found.</span>
          </div>
        )}

        {roadmap && <RoadmapViewInner roadmap={roadmap} />}
      </div>
    </NodeViewWrapper>
  );
}
