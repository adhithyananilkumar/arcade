'use client';

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ReactFlow, Background, Controls, Node, Edge, MarkerType } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowLeft, Play, CheckCircle, Clock } from "lucide-react";
import { StudentLearningObjectNode } from "./StudentLearningObjectNode";
import { roadmapService } from "../services/roadmap";
import { roadmapProgressService } from "../services/progress";
import type { RoadmapData, RoadmapProgressData, NodeProgressData } from "../types";
import Link from "next/link";

const nodeTypes = {
  learningObject: StudentLearningObjectNode,
};

interface StudentRoadmapViewProps {
  roadmapId: string;
}

export function StudentRoadmapView({ roadmapId }: StudentRoadmapViewProps) {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [progress, setProgress] = useState<RoadmapProgressData | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [timeSpent, setTimeSpent] = useState(0); // active session time

  // Polling for time spent when a node is in progress
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (selectedNodeId && getProgress(selectedNodeId)?.status === "IN_PROGRESS") {
      timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    } else {
      setTimeSpent(0);
    }
    return () => clearInterval(timer);
  }, [selectedNodeId, progress]);

  const fetchData = async () => {
    try {
      const [rmData, progData] = await Promise.all([
        roadmapService.getRoadmap(roadmapId),
        roadmapProgressService.getProgress(roadmapId)
      ]);
      setRoadmap(rmData);
      setProgress(progData);
      
      if (rmData.graphJson) {
        const parsed = JSON.parse(rmData.graphJson);
        const edges = parsed.edges || [];
        setEdges(edges.map((e: any) => ({
          ...e,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#9ca3af' },
          style: { stroke: '#9ca3af', strokeWidth: 2 }
        })));
        
        // Re-inject progress into nodes
        const rawNodes = parsed.nodes || [];
        updateNodesWithProgress(rawNodes, edges, progData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [roadmapId]);

  const updateNodesWithProgress = (rawNodes: Node[], currentEdges: Edge[], progData: RoadmapProgressData) => {
    const updated = rawNodes.map(node => {
      const p = progData.nodes.find(n => n.nodeId === node.id);
      
      // Determine lock state: A node is locked if any of its incoming edges come from a node that is not completed.
      const incomingEdges = currentEdges.filter(e => e.target === node.id);
      let isLocked = false;
      if (incomingEdges.length > 0) {
        const uncompletedParents = incomingEdges.some(e => {
          const parentProgress = progData.nodes.find(n => n.nodeId === e.source);
          return !parentProgress || parentProgress.status !== "COMPLETED";
        });
        isLocked = uncompletedParents;
      }

      return {
        ...node,
        draggable: false,
        data: {
          ...node.data,
          progress: p,
          isLocked,
          onClick: handleNodeClick
        }
      };
    });
    setNodes(updated);
  };

  const getProgress = (nodeId: string) => progress?.nodes.find(n => n.nodeId === nodeId);
  
  const handleNodeClick = useCallback((nodeId: string, data: any) => {
    if (data.isLocked) return;
    setSelectedNodeId(nodeId);
    setTimeSpent(0);
  }, []);

  const handleUpdateStatus = async (nodeId: string, status: "IN_PROGRESS" | "COMPLETED") => {
    try {
      const p = getProgress(nodeId);
      const sessionTime = timeSpent;
      await roadmapProgressService.updateNodeProgress(roadmapId, nodeId, status, sessionTime);
      setTimeSpent(0);
      await fetchData(); // Refresh entirely to recalculate locks and overall progress
      if (status === "COMPLETED") {
        setSelectedNodeId(null);
      }
    } catch (err) {
      alert("Failed to update progress");
    }
  };

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId]);

  if (loading) return <div className="flex-1 flex items-center justify-center">Loading learning path...</div>;
  if (error || !roadmap) return <div className="flex-1 flex items-center justify-center text-red-500">Error: {error}</div>;

  const totalNodes = nodes.length;
  const completedNodes = progress?.completedNodesCount || 0;
  const percentage = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 relative">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{roadmap.title}</h1>
            <p className="text-xs text-gray-500">Learning Path View</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-semibold text-gray-700">{percentage}% Completed</div>
            <div className="text-[10px] text-gray-500">{completedNodes} / {totalNodes} modules</div>
          </div>
          <div className="w-32 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${percentage}%` }} />
          </div>
        </div>
      </header>

      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.5}
          maxZoom={1.5}
        >
          <Background color="#ccc" gap={16} />
          <Controls />
        </ReactFlow>

        {/* Node Properties / Progress Panel */}
        {selectedNode && (
          <div className="absolute top-4 right-4 bottom-4 w-80 bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col z-20">
            <div className="p-5 border-b border-gray-100 flex-1 overflow-y-auto">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                {String(selectedNode.data.type || "unknown")}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{String(selectedNode.data.title || "Untitled")}</h2>
              <p className="text-sm text-gray-600 mb-6">{String(selectedNode.data.description || "")}</p>
              
              <div className="space-y-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Your Progress</h4>
                
                {getProgress(selectedNode.id)?.status === "COMPLETED" ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                      <CheckCircle size={16} /> Completed
                    </div>
                    <div className="text-xs text-gray-500">
                      Time spent: {Math.round(((getProgress(selectedNode.id)?.timeSpentSeconds || 0) + timeSpent) / 60)} minutes
                    </div>
                  </div>
                ) : getProgress(selectedNode.id)?.status === "IN_PROGRESS" ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-indigo-600 text-sm font-semibold">
                      <Clock size={16} /> In Progress
                    </div>
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>Session time: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s</span>
                    </div>
                    <button 
                      onClick={() => handleUpdateStatus(selectedNode.id, "COMPLETED")}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      <CheckCircle size={16} /> Mark Completed
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="text-xs text-gray-500">Not started yet.</div>
                    <button 
                      onClick={() => handleUpdateStatus(selectedNode.id, "IN_PROGRESS")}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      <Play size={16} className="fill-current" /> Start Learning
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
               <button onClick={() => setSelectedNodeId(null)} className="w-full text-center text-sm font-medium text-gray-600 hover:text-gray-900">
                 Close Panel
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
