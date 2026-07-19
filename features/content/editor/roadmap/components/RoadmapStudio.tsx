import React, { useCallback, useState, useMemo } from "react";
import { useRoadmapAutoSave } from "../hooks/useRoadmapAutoSave";
import { AlertCircle } from "lucide-react";
import { RoadmapCanvas } from "./RoadmapCanvas";
import { RoadmapHeader } from "./RoadmapHeader";
import { PublishConfirmationModal } from "./PublishConfirmationModal";
import { SaveAsTemplateModal } from "./SaveAsTemplateModal";

import { CollaborationPanel } from "./CollaborationPanel";
import type { RoadmapData } from "../types";

interface RoadmapStudioProps {
  roadmap: RoadmapData;
  onClose?: () => void;
}

export function RoadmapStudio({ roadmap: initialRoadmap, onClose }: RoadmapStudioProps) {
  const [roadmap, setRoadmap] = useState<RoadmapData>(initialRoadmap);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "collaboration">("editor");

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(roadmap, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${roadmap.title.replace(/\s+/g, '_').toLowerCase()}_export.json`;
    a.click();
  };

  const handleSaveSuccess = useCallback((updated: RoadmapData) => {
    setRoadmap(updated);
  }, []);

  const { saveState, errorMessage, scheduleSave, manualSave, forceOverride } = useRoadmapAutoSave(
    roadmap,
    handleSaveSuccess
  );

  const isReadOnly = roadmap.status === 'published' || roadmap.status === 'archived';

  // Compute validation errors for publishing
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!roadmap.title || roadmap.title.trim() === '') {
      errors.push("Roadmap must have a title.");
    }

    try {
      const graph = JSON.parse(roadmap.graphJson);
      const nodes = graph.nodes || [];
      const edges = graph.edges || [];

      if (nodes.length === 0) {
        errors.push("Roadmap must have at least one learning node.");
      }

      const contentIds = new Set<string>();
      let hasMissingTitle = false;
      let hasDuplicateContent = false;
      
      const nodeIds = new Set<string>(nodes.map((n: any) => n.id));
      const connectedNodeIds = new Set<string>();
      
      edges.forEach((e: any) => {
        connectedNodeIds.add(e.source);
        connectedNodeIds.add(e.target);
      });

      let hasOrphans = false;

      nodes.forEach((n: any) => {
        const label = n.data?.label as string;
        const cid = n.data?.contentId as string;
        
        if (!label || label.trim() === '') hasMissingTitle = true;
        if (cid) {
          if (contentIds.has(cid)) hasDuplicateContent = true;
          contentIds.add(cid);
        }
        
        // Check orphans if there's more than 1 node total
        if (nodes.length > 1 && !connectedNodeIds.has(n.id)) {
          hasOrphans = true;
        }
      });

      if (hasMissingTitle) errors.push("One or more nodes are missing a title.");
      if (hasDuplicateContent) errors.push("Duplicate content linked across multiple nodes.");
      if (hasOrphans) errors.push("There are orphaned (unconnected) nodes in the roadmap.");
      
    } catch (e) {
      errors.push("Invalid roadmap graph data.");
    }

    return errors;
  }, [roadmap.graphJson, roadmap.title]);

  // Compute counts for modal
  const counts = useMemo(() => {
    try {
      const graph = JSON.parse(roadmap.graphJson);
      return { nodes: (graph.nodes || []).length, edges: (graph.edges || []).length };
    } catch {
      return { nodes: 0, edges: 0 };
    }
  }, [roadmap.graphJson]);

  const handleStatusChange = async (newStatus: RoadmapData['status']) => {
    try {
      const response = await fetch(`/api/roadmaps/${roadmap.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus, 
          version: roadmap.version,
          title: roadmap.title,
          description: roadmap.description,
          graphJson: roadmap.graphJson
        })
      });
      if (response.ok) {
        const updated = await response.json();
        setRoadmap(updated);
      } else {
        alert("Failed to update status.");
      }
    } catch (e) {
      alert("Network error.");
    }
  };

  const handlePublishConfirm = async () => {
    if (saveState === 'unsaved' || saveState === 'saving') {
      // Force manual save first, then update status
      manualSave();
      // Wait slightly to ensure save finishes
      setTimeout(() => handleStatusChange('published'), 1000);
    } else {
      handleStatusChange('published');
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 absolute inset-0 z-50">
      <div className="bg-white border-b border-gray-200">
        <RoadmapHeader 
          roadmap={roadmap}
          saveState={saveState}
          onClose={onClose}
          onStatusChange={handleStatusChange}
          onPublishClick={() => setIsPublishModalOpen(true)}
          onManualSave={manualSave}
          onSaveAsTemplateClick={() => setIsTemplateModalOpen(true)}
          onExportClick={handleExport}
        />
        <div className="px-6 py-2 border-t border-gray-100 flex gap-4 text-sm font-medium">
          <button 
            onClick={() => setActiveTab("editor")}
            className={`pb-2 px-1 border-b-2 transition-colors ${activeTab === 'editor' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Graph Editor
          </button>

          <button 
            onClick={() => setActiveTab("collaboration")}
            className={`pb-2 px-1 border-b-2 transition-colors ${activeTab === 'collaboration' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Collaboration
          </button>
        </div>
      </div>

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

      {isReadOnly && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-emerald-800 text-sm font-medium shrink-0 flex items-center justify-center">
          This roadmap is currently {roadmap.status}. Editing is disabled.
        </div>
      )}

      <div className="flex-1 relative flex overflow-hidden">
        <>
          <RoadmapCanvas 
            roadmap={roadmap} 
            saveState={saveState}
            onGraphChange={scheduleSave}
            onManualSave={manualSave}
            readOnly={isReadOnly}
          />
          {activeTab === "collaboration" && (
             <CollaborationPanel roadmapId={roadmap.id} />
          )}
        </>
      </div>

      <PublishConfirmationModal 
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={handlePublishConfirm}
        nodeCount={counts.nodes}
        edgeCount={counts.edges}
        validationErrors={validationErrors}
        hasUnsavedChanges={saveState === 'unsaved' || saveState === 'saving'}
      />

      {isTemplateModalOpen && (
        <SaveAsTemplateModal
          roadmapId={roadmap.id}
          defaultName={roadmap.title}
          defaultDescription={roadmap.description}
          onClose={() => setIsTemplateModalOpen(false)}
          onSaved={() => {
            setIsTemplateModalOpen(false);
            alert("Template saved successfully!");
          }}
        />
      )}
    </div>
  );
}
