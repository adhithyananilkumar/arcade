'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  fontFamily?: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
  editable?: boolean;
  showHandles?: boolean;
  onRename?: (id: string, newLabel: string) => void;
  onCheckboxClick?: (e: React.MouseEvent) => void;
  onClick?: () => void;
  isDimmed?: boolean;
  onMouseEnter?: (rect: DOMRect) => void;
  onMouseLeave?: () => void;
  validationError?: string;
  selected?: boolean;
  hideCheckbox?: boolean;
}

const BG_MAP: Record<string, string> = {
  'bg-white':        '#ffffff',
  'bg-indigo-50':    '#eef2ff',
  'bg-indigo-600':   '#4f46e5',
  'bg-rose-500':     '#f43f5e',
  'bg-amber-500':    '#f59e0b',
  'bg-emerald-500':  '#10b981',
  'bg-sky-500':      '#0ea5e9',
  'bg-slate-800':    '#1e293b',
};

const TEXT_MAP: Record<string, string> = {
  'text-gray-900':   '#111827',
  'text-white':      '#ffffff',
  'text-indigo-600': '#4f46e5',
  'text-rose-600':   '#e11d48',
  'text-emerald-600':'#059669',
};

const FONT_MAP: Record<string, string> = {
  'font-sans':  'ui-sans-serif, system-ui, sans-serif',
  'font-serif': 'ui-serif, Georgia, serif',
  'font-mono':  'ui-monospace, monospace',
};

const STATUS_BG: Record<string, string>   = { draft: '#f3f4f6', review: '#fef3c7', published: '#d1fae5', archived: '#fee2e2' };
const STATUS_TXT: Record<string, string>  = { draft: '#4b5563', review: '#b45309', published: '#065f46', archived: '#9f1239' };
const STATUS_BDR: Record<string, string>  = { draft: '#e5e7eb', review: '#fde68a', published: '#6ee7b7', archived: '#fca5a5' };

function bgHex(cls: string | null | undefined, fallback: string): string {
  if (!cls) return fallback;
  return BG_MAP[cls] ?? (cls.startsWith('#') ? cls : fallback);
}

function textHex(cls: string | null | undefined, fallback: string): string {
  if (!cls) return fallback;
  return TEXT_MAP[cls] ?? (cls.startsWith('#') ? cls : fallback);
}

function fontStack(cls: string | null | undefined): string | undefined {
  if (!cls) return undefined;
  return FONT_MAP[cls] ?? undefined;
}

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
  fontFamily,
  isCompleted = false,
  isCurrent = false,
  editable = false,
  showHandles = false,
  onRename,
  onCheckboxClick,
  onClick,
  isDimmed = false,
  onMouseEnter,
  onMouseLeave,
  validationError,
  selected = false,
  hideCheckbox = false,
}: RoadmapNodeProps) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(initialLabel);
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLabel(initialLabel);
  }, [initialLabel]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleDoubleClick = () => {
    if (editable) {
      setEditing(true);
    }
  };

  const saveRename = () => {
    setEditing(false);
    if (onRename) {
      onRename(id, label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveRename();
    if (e.key === 'Escape') {
      setLabel(initialLabel);
      setEditing(false);
    }
  };

  const handleMouseEnterCard = () => {
    if (onMouseEnter && cardRef.current) {
      onMouseEnter(cardRef.current.getBoundingClientRect());
    }
  };

  const baseBg = bgHex(color, nodeType === 'section' ? '#eef2ff' : '#ffffff');
  const baseText = textHex(fontColor, '#111827');
  const baseBorder = nodeType === 'section' ? '#c7d2fe' : '#e5e7eb';

  // Truncate description for description preview
  const descriptionPreview = description && description.length > 70 
    ? `${description.slice(0, 70)}...` 
    : description;

  return (
    <motion.div
      ref={cardRef}
      onMouseEnter={handleMouseEnterCard}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
      tabIndex={0}
      className={`relative select-none transition-all rounded-xl border-2 duration-200 min-w-[200px] max-w-[280px] break-words ${
        editable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${selected ? 'ring-4 ring-indigo-500/20' : ''}`}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: baseBg,
        borderColor: isCompleted 
          ? '#10b981' 
          : isCurrent 
          ? '#6366f1' 
          : baseBorder,
        fontFamily: fontStack(fontFamily),
        opacity: isDimmed ? 0.3 : 1,
        // Completion Glow / Pulse overlay
        boxShadow: isCompleted 
          ? '0 0 12px rgba(16, 185, 129, 0.25)' 
          : isCurrent 
          ? '0 0 0 4px rgba(99, 102, 241, 0.15)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Conditionally render React Flow Handles */}
      {showHandles && (
        <>
          <Handle type="target" position={Position.Top} id="top" className="w-2.5 h-2.5 border-2 border-white bg-indigo-500" />
          <Handle type="target" position={Position.Left} id="target-left" className="w-2.5 h-2.5 border-2 border-white bg-indigo-500" style={{ top: '50%' }} />
          <Handle type="source" position={Position.Right} id="source-right" className="w-2.5 h-2.5 border-2 border-white bg-indigo-500" style={{ top: '50%' }} />
          <Handle type="source" position={Position.Bottom} id="bottom" className="w-2.5 h-2.5 border-2 border-white bg-indigo-500" />
        </>
      )}

      {/* Validation Errors for Editor */}
      {editable && validationError && (
        <div className="absolute -top-2.5 -right-2.5 bg-red-100 border border-red-300 text-red-600 rounded-full p-1.5 shadow-sm z-10 animate-bounce" title={validationError}>
          <AlertTriangle size={14} />
        </div>
      )}

      {/* Inner Node Layout */}
      <div className="p-3.5 h-full flex items-start gap-4">
        {/* Left side: Circular Checkbox */}
        {!hideCheckbox && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              if (onCheckboxClick) onCheckboxClick(e);
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="relative flex items-center justify-center shrink-0 w-6 h-6 rounded-full border-2 transition-all mt-0.5"
            style={{
              borderColor: isCompleted ? '#10b981' : baseText,
              backgroundColor: isCompleted ? '#10b981' : 'transparent',
            }}
          >
            <AnimatePresence mode="wait">
              {isCompleted ? (
                <motion.svg
                  key="check"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </motion.svg>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-1.5 h-1.5 rounded-full bg-transparent"
                />
              )}
            </AnimatePresence>

            {/* Ripple animation on completion */}
            {isCompleted && (
              <motion.span
                className="absolute inset-0 rounded-full border border-emerald-500 pointer-events-none"
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            )}
          </motion.button>
        )}

        {/* Right side: Title & Sub-metadata layout */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          <div>
            {editing ? (
              <input
                ref={inputRef}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={saveRename}
                onKeyDown={handleKeyDown}
                className="w-full bg-white bg-opacity-70 text-sm font-bold outline-none ring-1 ring-indigo-500 rounded px-1.5 py-0.5 text-gray-900"
              />
            ) : (
              <h3 
                className="text-sm font-bold truncate leading-tight" 
                style={{ color: baseText }}
              >
                {label || <span className="italic opacity-40">Untitled {nodeType}</span>}
              </h3>
            )}

            {/* Description Preview (Non-section view only) */}
            {nodeType !== 'section' && descriptionPreview && (
              <p 
                className="text-xs mt-1 line-clamp-2 opacity-70 leading-normal"
                style={{ color: baseText }}
              >
                {descriptionPreview}
              </p>
            )}
          </div>

          {/* Badges & Meta Row */}
          <div className="flex items-center gap-2 mt-2 pt-1 border-t border-black/5">
            {/* Completed Badge */}
            {isCompleted && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Completed
              </span>
            )}

            {/* Difficulty Badge */}
            {difficulty && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-black/5 text-current opacity-80 border border-black/5">
                {difficulty}
              </span>
            )}

            {/* Duration */}
            {duration && (
              <span className="text-[10px] font-medium opacity-60">
                {duration}
              </span>
            )}

            {/* Status (Editor metadata only shown when editable) */}
            {editable && status && (
              <span 
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border"
                style={{
                  backgroundColor: STATUS_BG[status] ?? STATUS_BG.draft,
                  color: STATUS_TXT[status] ?? STATUS_TXT.draft,
                  borderColor: STATUS_BDR[status] ?? STATUS_BDR.draft
                }}
              >
                {status}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
