"use client";

import React from 'react';
import { Pencil, Copy, Trash2, Palette, Link2, Lock, Unlock, ArrowUp, ArrowDown } from 'lucide-react';
import { Node } from '@xyflow/react';

interface CanvasContextMenuProps {
  x: number;
  y: number;
  node: Node | null;
  onClose: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onChangeColor: () => void;
  onConnect: () => void;
  onToggleLock: () => void;
  onBringForward: () => void;
  onSendBack: () => void;
  onUpdateColor: (color: string) => void;
}

const COLOR_PRESETS = [
  { value: "bg-white", hex: "#ffffff" },
  { value: "bg-indigo-600", hex: "#4f46e5" },
  { value: "bg-rose-500", hex: "#f43f5e" },
  { value: "bg-amber-500", hex: "#f59e0b" },
  { value: "bg-emerald-500", hex: "#10b981" },
];

export function CanvasContextMenu({
  x,
  y,
  node,
  onClose,
  onRename,
  onDuplicate,
  onDelete,
  onChangeColor,
  onConnect,
  onToggleLock,
  onBringForward,
  onSendBack,
  onUpdateColor,
}: CanvasContextMenuProps) {
  if (!node) return null;

  const isLocked = !!node.data?.locked;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      <div
        className="fixed z-50 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 animate-in zoom-in-95 duration-100"
        style={{ top: y, left: x }}
      >
        {/* Title */}
        <div className="px-3.5 py-1.5 border-b border-gray-50 mb-1 max-w-[200px]">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
            {node.data.label as string || "Untitled Topic"}
          </p>
        </div>

        {/* Rename */}
        <button
          onClick={() => { onRename(); onClose(); }}
          className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left font-medium transition-colors"
        >
          <Pencil size={13} className="text-gray-400" /> Rename
        </button>

        {/* Duplicate */}
        <button
          onClick={() => { onDuplicate(); onClose(); }}
          className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left font-medium transition-colors"
        >
          <Copy size={13} className="text-gray-400" /> Duplicate (Ctrl+D)
        </button>

        {/* Connect */}
        <button
          onClick={() => { onConnect(); onClose(); }}
          className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left font-medium transition-colors"
        >
          <Link2 size={13} className="text-gray-400" /> Connect (C)
        </button>

        <div className="my-1 border-t border-gray-50" />

        {/* Toggle Lock */}
        <button
          onClick={() => { onToggleLock(); onClose(); }}
          className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left font-medium transition-colors"
        >
          {isLocked ? (
            <>
              <Unlock size={13} className="text-gray-400" /> Unlock Topic
            </>
          ) : (
            <>
              <Lock size={13} className="text-gray-400" /> Lock as Prerequisite
            </>
          )}
        </button>

        {/* Bring Forward */}
        <button
          onClick={() => { onBringForward(); onClose(); }}
          className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left font-medium transition-colors"
        >
          <ArrowUp size={13} className="text-gray-400" /> Bring to Front
        </button>

        {/* Send Back */}
        <button
          onClick={() => { onSendBack(); onClose(); }}
          className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left font-medium transition-colors"
        >
          <ArrowDown size={13} className="text-gray-400" /> Send to Back
        </button>

        <div className="my-1 border-t border-gray-50" />

        {/* Preset Colors Grid */}
        <div className="px-3.5 py-2 flex items-center justify-between gap-1">
          <Palette size={13} className="text-gray-400 shrink-0 mr-1" />
          <div className="flex items-center gap-1.5">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => { onUpdateColor(color.value); onClose(); }}
                className="w-4 h-4 rounded-full border border-gray-200 shadow-xs transition-transform hover:scale-110"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>

        <div className="my-1 border-t border-gray-50" />

        {/* Delete */}
        <button
          onClick={() => { onDelete(); onClose(); }}
          className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 text-left font-semibold transition-colors"
        >
          <Trash2 size={13} className="text-red-400" /> Delete Topic
        </button>
      </div>
    </>
  );
}
