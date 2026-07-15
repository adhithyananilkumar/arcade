import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { useRoadmap } from "../hooks/useRoadmap";
import { Loader2, AlertCircle, Maximize2, Route } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { RoadmapStudio } from "./RoadmapStudio";
import type { RoadmapData } from "../types";

function RoadmapPreviewCard({ roadmap, onOpenStudio }: { roadmap: RoadmapData, onOpenStudio: () => void }) {
  // Parse graph to get basic stats
  let topicsCount = 0;
  let edgesCount = 0;
  try {
    const graph = JSON.parse(roadmap.graphJson || '{"nodes":[],"edges":[]}');
    topicsCount = graph.nodes?.length || 0;
    edgesCount = graph.edges?.length || 0;
  } catch (e) {
    // Ignore parse errors for preview
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex justify-between items-start">
        <div className="flex gap-4">
          <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
            <Route size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{roadmap.title}</h3>
            {roadmap.description ? (
              <p className="text-sm text-gray-500 line-clamp-2 max-w-md">{roadmap.description}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">No description</p>
            )}
          </div>
        </div>
        <button 
          onClick={onOpenStudio}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Maximize2 size={16} />
          Open Roadmap Studio
        </button>
      </div>
      <div className="px-6 py-3 bg-gray-50 flex items-center gap-6 text-sm text-gray-600">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{topicsCount}</span>
          <span className="text-xs text-gray-500 uppercase tracking-wider">Topics</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{edgesCount}</span>
          <span className="text-xs text-gray-500 uppercase tracking-wider">Connections</span>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{new Date(roadmap.updatedAt).toLocaleDateString()}</span>
          <span className="text-xs text-gray-500 uppercase tracking-wider">Last Updated</span>
        </div>
      </div>
    </div>
  );
}

export function RoadmapView({ node }: NodeViewProps) {
  const roadmapId = node.attrs.roadmapId;
  const { roadmap, loading, error } = useRoadmap(roadmapId);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  return (
    <NodeViewWrapper className="roadmap-node my-6">
      <div contentEditable={false}>
        {loading && (
          <div className="flex items-center justify-center p-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
            <Loader2 size={24} className="animate-spin mr-2" />
            <span>Loading Roadmap Preview...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 p-6 rounded-xl border border-red-200">
            <AlertCircle size={20} />
            <span>Failed to load roadmap preview.</span>
          </div>
        )}

        {!loading && !error && !roadmap && (
          <div className="flex items-center justify-center p-8 bg-gray-50 text-gray-500 rounded-xl border border-gray-200">
            <span>Invalid roadmap ID or roadmap not found.</span>
          </div>
        )}

        {roadmap && (
          <>
            <RoadmapPreviewCard roadmap={roadmap} onOpenStudio={() => setIsStudioOpen(true)} />
            
            {isStudioOpen && document.body && createPortal(
              <RoadmapStudio 
                roadmap={roadmap} 
                onClose={() => setIsStudioOpen(false)} 
              />,
              document.body
            )}
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}
