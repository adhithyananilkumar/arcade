"use client";

import React, { useState } from "react";
import { Search, Layers, ChevronLeft, ArrowLeft, Settings, CheckCircle } from "lucide-react";
import type { Node } from "@xyflow/react";
import { useRoadmap } from "../store/RoadmapStore";

interface LayerOutlinePanelProps {
  collapsed?: boolean;
  setCollapsed?: (val: boolean) => void;
}

export function LayerOutlinePanel({ collapsed, setCollapsed }: LayerOutlinePanelProps = {}) {
  const { 
    nodes, 
    selectedNodeId, 
    setSelectedNodeId, 
    setNodes, 
    centerNode,
    contentType,
  } = useRoadmap();
  
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNodes = nodes.filter((n) => {
    if (!searchQuery) return true;
    const label = (n.data?.label as string) || "";
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const onSelectNode = (id: string) => {
    setSelectedNodeId(id);
    setNodes(nds => nds.map(n => ({ ...n, selected: n.id === id })));
    centerNode(id);
  };

  const isDocked = contentType === "roadmap";

  // Class names for container: docked vs floating absolute card
  const containerClasses = isDocked
    ? "w-72 h-full border-r border-gray-200 bg-white flex flex-col shrink-0 relative transition-all duration-200 z-30"
    : "absolute top-4 left-4 z-30 w-72 max-h-[calc(100vh-140px)] bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-xl flex flex-col overflow-hidden transition-all duration-200";

  return (
    <div className={containerClasses}>
      {/* Panel Header */}
      {isDocked && (
        <div className="p-2 border-b border-gray-100 bg-white">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('roadmap-action-back'))}
            className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>
        </div>
      )}
      
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/40">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wider">
          <Layers size={14} className="text-indigo-600" />
          <span>Layers</span>
          <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold">
            {nodes.length}
          </span>
        </div>
        {setCollapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-200/60 hover:text-gray-600 transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft size={15} />
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-gray-100 bg-white">
        <div className="relative flex items-center">
          <Search size={13} className="absolute left-3 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="🔍 Search Topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 text-xs text-gray-800 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Topic Layer List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-white">
        {filteredNodes.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400 italic">
            No matching topics found
          </div>
        ) : (
          filteredNodes.map((n, idx) => {
            const isSelected = n.id === selectedNodeId;
            const label = (n.data?.label as string) || `Topic ${idx + 1}`;
            const isCompleted = !!n.data?.completed;

            return (
              <button
                key={n.id}
                onClick={() => onSelectNode(n.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
                  isSelected
                    ? "bg-indigo-50/80 text-indigo-700 font-semibold border border-indigo-100 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isCompleted ? "bg-emerald-500 shadow-sm" : "bg-indigo-400 shadow-sm"
                    }`}
                  />
                  <span className="truncate">{label}</span>
                </div>
                {isCompleted && (
                  <CheckCircle size={13} className="text-emerald-500 shrink-0 ml-1.5" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Settings Footer */}
      <div className="p-2 border-t border-gray-100 bg-white">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('roadmap-action-settings'))}
          className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-100"
        >
          <Settings size={14} className="text-gray-400" />
          <span>Roadmap Settings</span>
        </button>
      </div>
    </div>
  );
}
