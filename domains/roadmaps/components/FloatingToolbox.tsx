"use client";

import React, { useState } from "react";
import {
  MousePointer,
  Hand,
  Plus,
  Link as LinkIcon,
  LayoutGrid,
  Maximize2,
  Map,
  Palette,
  Search,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Trash2,
  CheckCircle,
  Loader2,
  FolderKanban,
} from "lucide-react";
import { useViewport } from "@xyflow/react";
import { useRoadmap } from "../store/RoadmapStore";

const PRESET_TOPIC_COLORS = [
  { label: "White", class: "bg-white", hex: "#ffffff" },
  { label: "Indigo", class: "bg-indigo-600", hex: "#4f46e5" },
  { label: "Blue", class: "bg-sky-500", hex: "#0ea5e9" },
  { label: "Green", class: "bg-emerald-500", hex: "#10b981" },
  { label: "Rose", class: "bg-rose-500", hex: "#f43f5e" },
  { label: "Amber", class: "bg-amber-500", hex: "#f59e0b" },
  { label: "Dark", class: "bg-slate-800", hex: "#1e293b" },
];

const BACKGROUND_PRESETS = [
  { label: "Plain White", type: "color", color: "#ffffff", gridShow: false },
  { label: "Light Gray", type: "color", color: "#f8fafc", gridShow: false },
  { label: "Dark Canvas", type: "color", color: "#0f172a", gridShow: true, gridType: "dots", gridColor: "#334155" },
  { label: "Dot Grid", type: "color", color: "#f8fafc", gridShow: true, gridType: "dots" },
  { label: "Line Grid", type: "color", color: "#ffffff", gridShow: true, gridType: "lines" },
];

export function FloatingToolbox() {
  const {
    activeTool,
    setActiveTool,
    addTopic,
    fitView,
    autoLayout,
    isSettingsOpen,
    setIsSettingsOpen,
    setIsTemplateOpen,
    zoomIn,
    zoomOut,
    appearance,
    setCanvasBackground,
    selectedNodeId,
    deleteTopic,
    updateTopic,
    nodes,
    undo,
    redo,
    readOnly,
    showMinimap,
    setShowMinimap,
    isSearchOpen,
    setIsSearchOpen,
  } = useRoadmap();

  const { zoom } = useViewport();
  const zoomPercentage = Math.round(zoom * 100);

  const [showColorPopover, setShowColorPopover] = useState(false);
  const [showBgPopover, setShowBgPopover] = useState(false);

  const handleApplyColor = (colorClass: string) => {
    if (selectedNodeId) {
      updateTopic(selectedNodeId, { color: colorClass });
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const currentNodeColor = (selectedNode?.data?.color as string) || "#ffffff";

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 p-2 bg-[#1E1E1E]/90 text-white border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl select-none shrink-0 transition-all duration-200">
      
      {/* 1. Pointer vs Hand vs Connect Modes */}
      <div className="flex items-center gap-0.5 bg-white/5 p-1 rounded-xl border border-white/5">
        <button
          type="button"
          title="Pointer Tool (V)"
          onClick={() => setActiveTool("pointer")}
          className={`p-2 rounded-lg transition-colors ${
            activeTool === "pointer"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <MousePointer size={15} />
        </button>
        <button
          type="button"
          title="Hand / Pan Canvas (H)"
          onClick={() => setActiveTool("hand")}
          className={`p-2 rounded-lg transition-colors ${
            activeTool === "hand"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <Hand size={15} />
        </button>
        {!readOnly && (
          <button
            type="button"
            title="Connect Topics (C)"
            onClick={() => setActiveTool("connect")}
            className={`p-2 rounded-lg transition-colors ${
              activeTool === "connect"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <LinkIcon size={15} />
          </button>
        )}
      </div>

      <div className="w-px h-5 bg-white/10 my-auto mx-0.5 shrink-0" />

      {/* 2. Topic Creation & Quick Actions */}
      {!readOnly && (
        <button
          type="button"
          title="Add Topic at Center (A)"
          onClick={() => addTopic()}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus size={16} />
        </button>
      )}

      {/* Quick Color Palette Popover */}
      {!readOnly && selectedNodeId && (
        <div className="relative">
          <button
            type="button"
            title="Quick Topic Color"
            onClick={() => {
              setShowColorPopover(!showColorPopover);
              setShowBgPopover(false);
            }}
            className={`p-2 rounded-xl transition-colors ${
              showColorPopover ? "bg-white/20 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Palette size={15} />
          </button>

          {showColorPopover && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-[#252526] border border-white/10 rounded-xl shadow-2xl p-2 z-50 flex items-center gap-1.5 animate-in zoom-in-95 duration-150">
              {PRESET_TOPIC_COLORS.map((c) => (
                <button
                  key={c.class}
                  type="button"
                  title={c.label}
                  onClick={() => {
                    handleApplyColor(c.class);
                    setShowColorPopover(false);
                  }}
                  className="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-110 shadow-xs shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
              ))}

              <div className="w-px h-4 bg-white/10 mx-0.5 shrink-0" />

              <div className="relative w-5 h-5 rounded-full border border-white/20 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                <input
                  type="color"
                  value={currentNodeColor.startsWith("#") ? currentNodeColor : "#ffffff"}
                  onChange={(e) => handleApplyColor(e.target.value)}
                  className="absolute inset-[-10px] w-10 h-10 cursor-pointer border-0 p-0"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auto Layout */}
      <button
        type="button"
        title="Auto Layout Graph (L)"
        onClick={autoLayout}
        className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
      >
        <LayoutGrid size={15} />
      </button>

      {/* Fit / Center View */}
      <button
        type="button"
        title="Center / Fit View (F)"
        onClick={() => fitView()}
        className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
      >
        <Maximize2 size={15} />
      </button>

      {/* Mini Map Toggle */}
      <button
        type="button"
        title="Toggle Mini Map"
        onClick={() => setShowMinimap((prev: boolean) => !prev)}
        className={`p-2 rounded-xl transition-colors shrink-0 ${
          showMinimap ? "bg-white/20 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"
        }`}
      >
        <Map size={15} />
      </button>

      {/* Theme Settings */}
      {appearance && (
        <div className="relative">
          <button
            type="button"
            title="Theme & Canvas Settings"
            onClick={() => {
              setShowBgPopover(!showBgPopover);
              setShowColorPopover(false);
            }}
            className={`p-2 rounded-xl transition-colors ${
              showBgPopover ? "bg-white/20 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Palette size={15} />
          </button>

          {showBgPopover && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-44 bg-[#252526] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 animate-in zoom-in-95 duration-150">
              <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                Canvas Theme
              </div>
              {BACKGROUND_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setCanvasBackground({
                      ...appearance,
                      backgroundType: preset.type as any,
                      backgroundColor: preset.color,
                      grid: {
                        ...appearance.grid,
                        show: preset.gridShow,
                        type: (preset.gridType as any) || appearance.grid.type,
                        color: preset.gridColor || appearance.grid.color,
                      },
                    });
                    setShowBgPopover(false);
                  }}
                  className="w-full flex items-center px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:bg-indigo-600 hover:text-white transition-colors text-left"
                >
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Button */}
      <button
        type="button"
        title="Search Topics (Ctrl+K)"
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className={`p-2 rounded-xl transition-colors shrink-0 ${
          isSearchOpen ? "bg-white/20 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"
        }`}
      >
        <Search size={15} />
      </button>

      {/* Undo & Redo */}
      {!readOnly && (
        <>
          <button
            type="button"
            title="Undo (Ctrl+Z)"
            onClick={undo}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <UndoIcon size={15} />
          </button>
          <button
            type="button"
            title="Redo (Ctrl+Y)"
            onClick={redo}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <RedoIcon size={15} />
          </button>
        </>
      )}

      {/* Delete selected topic */}
      {!readOnly && selectedNodeId && (
        <button
          type="button"
          title="Delete Selected Topic (Delete)"
          onClick={() => deleteTopic(selectedNodeId)}
          className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors shrink-0"
        >
          <Trash2 size={15} />
        </button>
      )}

      <div className="w-px h-5 bg-white/10 my-auto mx-0.5 shrink-0" />

      {/* 3. Zoom Display & Save Status */}
      <div className="flex items-center gap-2 pl-1 pr-1.5">
        <span className="text-[10px] font-bold text-gray-400 select-none font-mono">
          {zoomPercentage}%
        </span>
        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold" title="Saved to Document">
          <CheckCircle size={12} />
        </div>
      </div>

    </div>
  );
}
