'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoadmapNode } from '../types';
import { useRoadmapViewerStore } from '../store/useRoadmapViewerStore';

interface NodeCardProps {
  node: RoadmapNode;
  onMouseEnter?: (nodeId: string, rect: DOMRect) => void;
  onMouseLeave?: () => void;
  isDimmed?: boolean;
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

const FONT_MAP: Record<string, string> = {
  'font-sans':  'ui-sans-serif, system-ui, sans-serif',
  'font-serif': 'ui-serif, Georgia, serif',
  'font-mono':  'ui-monospace, monospace',
};

function resolveBg(colorClass: string | null | undefined): string {
  if (!colorClass) return '#ffffff';
  return BG_MAP[colorClass] ?? (colorClass.startsWith('#') ? colorClass : '#ffffff');
}

function fontStack(cls: string | null | undefined): string | undefined {
  if (!cls) return undefined;
  return FONT_MAP[cls] ?? undefined;
}

// Automatic WCAG Relative Luminance / Contrast Color Detection
function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return '#111827';
  
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map(v => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  const luminance = 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  return luminance > 0.179 ? '#111827' : '#ffffff';
}

export const NodeCard: React.FC<NodeCardProps> = ({ node, onMouseEnter, onMouseLeave, isDimmed }) => {
  const {
    nodes,
    activeNodeId,
    setActiveNode,
    progress,
    toggleNodeCompletion,
  } = useRoadmapViewerStore();

  const cardRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<any[]>([]);

  const nodeProgress = progress[node.id];
  const isCompleted = nodeProgress?.status === 'COMPLETED';
  const isActive = activeNodeId === node.id;

  const isFirstIncomplete = useMemo(() => {
    const next = nodes.find(n => progress[n.id]?.status !== 'COMPLETED');
    return next?.id === node.id;
  }, [nodes, progress, node.id]);

  const isCurrent = isActive || (activeNodeId === null && isFirstIncomplete);

  // Trigger celebration on completion transition
  const prevCompletedRef = useRef(isCompleted);
  useEffect(() => {
    if (isCompleted && !prevCompletedRef.current) {
      // Confetti burst: 12-15 lightweight particles
      const newParticles = Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * 2 * Math.PI + (Math.random() - 0.5) * 0.3;
        const velocity = 35 + Math.random() * 45;
        return {
          id: Date.now() + i,
          x: Math.cos(angle) * velocity,
          y: Math.sin(angle) * velocity - 15,
          color: ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e', '#ec4899'][Math.floor(Math.random() * 5)],
          size: 5 + Math.random() * 4,
        };
      });
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 800);
    }
    prevCompletedRef.current = isCompleted;
  }, [isCompleted]);

  // Auto-scroll when this node becomes active
  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [isActive]);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNodeCompletion(node.id);
  };

  const handleCardClick = () => {
    setActiveNode(isActive ? null : node.id);
  };

  const handleMouseEnterCard = () => {
    if (onMouseEnter && cardRef.current) {
      onMouseEnter(node.id, cardRef.current.getBoundingClientRect());
    }
  };

  const nodeBg = resolveBg(node.color);
  const contrastColor = getContrastColor(nodeBg);
  const isDarkNode = contrastColor === '#ffffff';

  const duration = node.duration || (node.durationMinutes ? `${node.durationMinutes}m` : '');

  return (
    <motion.div
      ref={cardRef}
      initial={false}
      animate={{ left: node.x, top: node.y }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        width: `${node.width}px`,
        zIndex: isActive ? 10 : 1,
      }}
    >
      {/* Celebration Sparkles overlay */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              backgroundColor: p.color,
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: '40px',
              top: '50%',
              zIndex: 50,
            }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: p.x, y: p.y, scale: 0, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Ambient Color Glow Behind the Card */}
      <div
        className="absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none"
        style={{
          filter: 'blur(26px)',
          backgroundColor: nodeBg,
          opacity: isActive ? 0.35 : isCompleted ? 0.28 : 0.18,
          transform: 'scale(0.95)',
          zIndex: -1,
        }}
      />

      {/* Outer Card with Premium Hover Liftoff */}
      <motion.div
        onClick={handleCardClick}
        onMouseEnter={handleMouseEnterCard}
        onMouseLeave={onMouseLeave}
        whileHover={{
          y: -4,
          scale: 1.04,
          boxShadow: isDarkNode 
            ? `0 20px 25px -5px ${nodeBg}, 0 0 15px 2px ${nodeBg}` 
            : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 0 15px 2px rgba(255, 255, 255, 0.6)',
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full min-h-[140px] rounded-2xl border-2 flex items-start gap-4 p-4 cursor-pointer select-none transition-colors duration-200"
        style={{
          backgroundColor: nodeBg,
          borderColor: isCompleted 
            ? '#10b981' 
            : isCurrent 
            ? '#6366f1' 
            : isDarkNode 
            ? 'rgba(255,255,255,0.1)' 
            : '#e5e7eb',
          fontFamily: fontStack(node.fontFamily),
          opacity: isDimmed ? 0.3 : 1,
        }}
      >
        {/* Checkbox Complete Indicator (Left) */}
        <motion.button
          onClick={handleCheckboxClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 mt-0.5 shadow-sm hover:shadow-md"
          style={{
            borderColor: isCompleted 
              ? '#10b981' 
              : contrastColor,
            backgroundColor: isCompleted 
              ? '#10b981' 
              : 'transparent',
          }}
        >
          <AnimatePresence mode="wait">
            {isCompleted ? (
              <motion.svg
                key="checked"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                width="12"
                height="12"
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
                key="unchecked"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="w-2.5 h-2.5 rounded-full bg-transparent"
              />
            )}
          </AnimatePresence>

          {/* Smooth Expanding Ripple on activation */}
          {isCompleted && (
            <motion.span
              className="absolute inset-0 rounded-full border border-emerald-500 pointer-events-none"
              initial={{ scale: 0.8, opacity: 0.9 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          )}
        </motion.button>

        {/* Content Box (Right) */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          <div>
            <h3
              className="text-sm font-bold line-clamp-2 leading-snug"
              style={{ color: contrastColor }}
            >
              {node.label || 'Untitled Topic'}
            </h3>

            {/* Description Preview (truncated at 2 lines) */}
            <p
              className="text-[11px] mt-1 line-clamp-2 leading-relaxed opacity-70 transition-opacity duration-200"
              style={{ color: contrastColor }}
            >
              {node.description?.trim() ? node.description : 'No description available.'}
            </p>
          </div>

          {/* Metadata Row */}
          <div className="flex items-center gap-2 mt-auto pt-1.5 border-t border-black/5">
            {/* Difficulty Badge */}
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border transition-colors"
              style={{
                backgroundColor: isDarkNode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.05)',
                borderColor: isDarkNode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
                color: contrastColor,
              }}
            >
              {node.difficulty || 'Intermediate'}
            </span>

            {/* Duration */}
            {duration && (
              <span
                className="text-[10px] font-medium opacity-60"
                style={{ color: contrastColor }}
              >
                {duration}
              </span>
            )}

            {/* Completed status tag */}
            {isCompleted && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-100/90 text-emerald-800 border border-emerald-200/50 ml-auto">
                Completed
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
