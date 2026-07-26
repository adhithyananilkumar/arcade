"use client";

// IMPORTANT: This component is rendered inside React Flow's node renderer,
// which is OUTSIDE the RoadmapEditorProvider context tree.
// It must NOT call useRoadmap() or any other custom React context.
// All data and callbacks must come through props only.

import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Plus } from 'lucide-react';

// ─── Color helpers ────────────────────────────────────────────────────────────
const BG_ALIASES: Record<string, string> = {
  'bg-white':        '#ffffff',
  'bg-indigo-50':    '#eef2ff',
  'bg-indigo-600':   '#4f46e5',
  'bg-rose-500':     '#f43f5e',
  'bg-amber-500':    '#f59e0b',
  'bg-emerald-500':  '#10b981',
  'bg-sky-500':      '#0ea5e9',
  'bg-slate-800':    '#1e293b',
};

function resolveBg(color?: string): string {
  if (!color) return '#f59e0b';
  return BG_ALIASES[color] ?? color;
}

function isDark(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length !== 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

const STATUS_DOT: Record<string, string> = {
  draft:     '#94a3b8',
  published: '#22c55e',
  review:    '#f59e0b',
  archived:  '#6b7280',
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface RoadmapNodeProps {
  id: string;
  label: string;
  description?: string;
  nodeType?: string;
  status?: string;
  difficulty?: string;
  duration?: string;
  color?: string;
  fontColor?: string;
  borderColor?: string;
  icon?: string;
  isCompleted?: boolean;
  editable?: boolean;
  isEditing?: boolean;
  showHandles?: boolean;
  selected?: boolean;
  validationError?: string;
  onRename?: (id: string, newLabel: string) => void;
  // Kept for backwards compatibility, ignored in this context-free version:
  onClick?: () => void;
  isDimmed?: boolean;
  onMouseEnter?: (rect: DOMRect) => void;
  onMouseLeave?: () => void;
  hideCheckbox?: boolean;
  onCheckboxClick?: (e: React.MouseEvent) => void;
  isCurrent?: boolean;
  fontFamily?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function RoadmapNode({
  id,
  label: initialLabel,
  description,
  nodeType = 'lesson',
  status = 'draft',
  difficulty,
  duration,
  color,
  fontColor,
  borderColor,
  editable = false,
  isEditing: initialIsEditing = false,
  showHandles = false,
  selected = false,
  validationError,
  onRename,
  isDimmed = false,
}: RoadmapNodeProps) {
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [label, setLabel] = useState(initialLabel);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setLabel(initialLabel); }, [initialLabel]);
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  useEffect(() => {
    if (initialIsEditing) setIsEditing(true);
  }, [initialIsEditing]);

  const commitRename = () => {
    setIsEditing(false);
    const trimmed = label.trim() || initialLabel;
    setLabel(trimmed);
    onRename?.(id, trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
    if (e.key === 'Escape') { setLabel(initialLabel); setIsEditing(false); }
  };

  // ── Derived colours ──────────────────────────────────────────────────────────
  const bgColor    = resolveBg(color);
  const dark       = isDark(bgColor);
  const textColor  = fontColor ?? (dark ? '#ffffff' : '#111827');
  const cardBorder = borderColor ?? (selected
    ? '#ffffff'
    : dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)');

  return (
    <div style={{ opacity: isDimmed ? 0.35 : 1 }}>

      {/* ── Connection Handles ─────────────────────────────────────────────── */}
      {showHandles && (
        <>
          <Handle type="target"  position={Position.Top}    id="top"    className="!w-3.5 !h-3.5 !border-2 !border-white !bg-slate-900 !rounded-full" style={{ zIndex: 20 }} />
          <Handle type="target"  position={Position.Left}   id="left"   className="!w-3.5 !h-3.5 !border-2 !border-white !bg-slate-900 !rounded-full" style={{ zIndex: 20 }} />
          <Handle type="source"  position={Position.Right}  id="right"  className="!w-3.5 !h-3.5 !border-2 !border-white !bg-slate-900 !rounded-full" style={{ zIndex: 20 }} />
          <Handle type="source"  position={Position.Bottom} id="bottom" className="!w-3.5 !h-3.5 !border-2 !border-white !bg-slate-900 !rounded-full" style={{ zIndex: 20 }} />
        </>
      )}

      {/* ── Card ──────────────────────────────────────────────────────────── */}
      <div
        className={`
          relative select-none rounded-2xl border-2
          min-w-[180px] max-w-[240px] min-h-[100px]
          flex flex-col items-center justify-center text-center
          transition-all duration-200 shadow-lg
          ${selected ? 'ring-4 ring-white shadow-2xl scale-[1.02]' : 'hover:shadow-xl hover:scale-[1.01]'}
          ${editable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
        `}
        style={{ backgroundColor: bgColor, borderColor: cardBorder, color: textColor }}
        onDoubleClick={() => { if (editable) setIsEditing(true); }}
      >
        {/* Validation badge */}
        {editable && validationError && (
          <div
            className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 border-2 border-white z-10"
            title={validationError}
          />
        )}

        <div className="w-full px-4 py-3 flex flex-col items-center gap-2">
          {/* Title / Edit input */}
          {isEditing ? (
            <input
              ref={inputRef}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="w-full text-center text-sm font-bold bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-lg px-2 py-1 outline-none ring-2 ring-white/50"
              placeholder="Topic title..."
            />
          ) : (
            <h3
              className="text-[15px] font-extrabold leading-tight"
              style={{ color: textColor }}
            >
              {label || <span className="italic opacity-40">Untitled</span>}
            </h3>
          )}

          {/* Description */}
          {!isEditing && description && (
            <p className="text-[11px] opacity-70 leading-snug line-clamp-2" style={{ color: textColor }}>
              {description}
            </p>
          )}

          {/* Status / Difficulty / Duration badges */}
          {!isEditing && (
            <div className="flex items-center gap-1.5 flex-wrap justify-center mt-0.5">
              {status && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-widest bg-white/90 text-gray-900 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_DOT[status] ?? '#94a3b8' }} />
                  {status}
                </span>
              )}
              {difficulty && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-black/10" style={{ color: textColor }}>
                  {difficulty}
                </span>
              )}
              {duration && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-black/10" style={{ color: textColor }}>
                  {duration}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
