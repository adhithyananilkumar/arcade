'use client';

import React from 'react';
import { Pencil, Copy, Trash2, Palette } from 'lucide-react';
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
}

export function CanvasContextMenu({ x, y, node, onClose, onRename, onDuplicate, onDelete, onChangeColor }: CanvasContextMenuProps) {
  if (!node) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      <div
        className="fixed z-50 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1"
        style={{ top: y, left: x }}
      >
        <div className="px-3 py-1.5 border-b border-gray-100 mb-1">
          <p className="text-xs font-semibold text-gray-500 truncate">
            {node.data.label as string}
          </p>
        </div>
        <button
          onClick={() => { onRename(); onClose(); }}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
        >
          <Pencil size={14} /> Rename
        </button>
        <button
          onClick={() => { onDuplicate(); onClose(); }}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
        >
          <Copy size={14} /> Duplicate
        </button>
        <button
          onClick={() => { onChangeColor(); onClose(); }}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
        >
          <Palette size={14} /> Change Color
        </button>
        <div className="my-1 border-t border-gray-100" />
        <button
          onClick={() => { onDelete(); onClose(); }}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </>
  );
}
