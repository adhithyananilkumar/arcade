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
  shape?: 'rectangle' | 'circle' | 'diamond' | 'hexagon' | string;
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
  isCompleted = false,
  isCurrent = false,
  shape = 'rectangle',
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
    ? '#6366f1'
    : dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.12)');

  // ── Shape SVG outlines ───────────────────────────────────────────────────────
  let shapeSvg = null;
  let width = '200px';
  let height = '100px';
  let paddingClass = 'px-4 py-3';

  if (shape === 'circle') {
    width = '130px';
    height = '130px';
    paddingClass = 'px-4 py-4';
    shapeSvg = (
      <svg width="130" height="130" viewBox="0 0 130 130" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none drop-shadow-md">
        <circle cx="65" cy="65" r="61" fill={bgColor} stroke={cardBorder} strokeWidth={selected ? 4 : 2.5} />
      </svg>
    );
  } else if (shape === 'diamond') {
    width = '150px';
    height = '150px';
    paddingClass = 'px-6 py-6';
    shapeSvg = (
      <svg width="150" height="150" viewBox="0 0 150 150" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none drop-shadow-md">
        <polygon points="75,4 146,75 75,146 4,75" fill={bgColor} stroke={cardBorder} strokeWidth={selected ? 4 : 2.5} />
      </svg>
    );
  } else if (shape === 'hexagon') {
    width = '180px';
    height = '110px';
    paddingClass = 'px-6 py-3';
    shapeSvg = (
      <svg width="180" height="110" viewBox="0 0 180 110" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none drop-shadow-md">
        <polygon points="45,4 135,4 176,55 135,106 45,106 4,55" fill={bgColor} stroke={cardBorder} strokeWidth={selected ? 4 : 2.5} />
      </svg>
    );
  } else {
    // default rectangle
    width = '200px';
    height = '100px';
    paddingClass = 'px-4 py-3';
    shapeSvg = (
      <svg width="200" height="100" viewBox="0 0 200 100" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none drop-shadow-md">
        <rect x="2" y="2" width="196" height="96" rx="16" ry="16" fill={bgColor} stroke={cardBorder} strokeWidth={selected ? 4 : 2.5} />
      </svg>
    );
  }

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

      {/* ── Shape Render Card ─────────────────────────────────────────────── */}
      <div
        className={`
          relative select-none flex flex-col items-center justify-center text-center
          transition-all duration-200
          ${selected ? 'scale-[1.03]' : 'hover:scale-[1.01]'}
          ${editable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
        `}
        style={{
          width,
          height,
          color: textColor,
        }}
        onDoubleClick={() => { if (editable) setIsEditing(true); }}
      >
        {/* Render background SVG shape */}
        {shapeSvg}

        {/* Validation badge */}
        {editable && validationError && (
          <div
            className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-red-500 border-2 border-white z-10 animate-pulse shadow"
            title={validationError}
          />
        )}

        {/* Completion badge */}
        {isCompleted && (
          <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white rounded-full border-2 border-white shadow-md z-10 w-5.5 h-5.5 flex items-center justify-center">
            <span className="text-[10px] font-extrabold font-sans">✓</span>
          </div>
        )}

        {/* Active progress badge */}
        {!isCompleted && isCurrent && (
          <div className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white rounded-full border-2 border-white shadow-md z-10 w-5.5 h-5.5 flex items-center justify-center animate-pulse">
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
        )}

        {/* Contents */}
        <div className={`w-full h-full flex flex-col items-center justify-center z-10 ${paddingClass}`}>
          {/* Title / Edit input */}
          {isEditing ? (
            <input
              ref={inputRef}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="w-[85%] text-center text-xs font-bold bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-lg px-2 py-0.5 outline-none ring-2 ring-white/50"
              placeholder="Topic title..."
            />
          ) : (
            <h3
              className="text-[13px] font-extrabold leading-tight text-center w-full break-words line-clamp-2"
              style={{ color: textColor }}
            >
              {label || <span className="italic opacity-40">Untitled</span>}
            </h3>
          )}

          {/* Description (hidden in circle/diamond to ensure fits) */}
          {!isEditing && description && shape !== 'circle' && shape !== 'diamond' && (
            <p className="text-[10px] opacity-70 leading-snug line-clamp-1 w-full mt-0.5" style={{ color: textColor }}>
              {description}
            </p>
          )}

          {/* Status / Difficulty / Duration badges */}
          {!isEditing && (
            <div className="flex items-center gap-1 flex-wrap justify-center mt-1 scale-90 origin-center max-w-full">

              {difficulty && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-black/10" style={{ color: textColor }}>
                  {difficulty}
                </span>
              )}
              {duration && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-black/10" style={{ color: textColor }}>
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
