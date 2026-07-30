'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoadmapNode, JourneyNodeAttachment } from '../types';
import {
  Check,
  Lock,
  Play,
  Star,
  Rocket,
  ClipboardList,
  Trophy,
  Sparkles,
} from 'lucide-react';

interface JourneyWaypointProps {
  node: RoadmapNode;
  attachment: JourneyNodeAttachment;
  isActive: boolean;
  isHovered: boolean;
  onSelect: (nodeId: string) => void;
  onAction: (node: RoadmapNode, state: string) => void;
  onMouseEnter: (nodeId: string, rect: DOMRect) => void;
  onMouseLeave: () => void;
  isDimmed?: boolean;
}

export const JourneyWaypoint: React.FC<JourneyWaypointProps> = ({
  node,
  attachment,
  isActive,
  isHovered,
  onSelect,
  onAction,
  onMouseEnter,
  onMouseLeave,
  isDimmed,
}) => {
  const waypointRef = useRef<HTMLButtonElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { state, waypoint, isMilestone, milestoneType } = attachment;

  const isCompleted = state === 'completed';
  const isCurrent = state === 'current';
  const isLocked = state === 'locked';
  const isOptional = state === 'optional';

  // Completion particles / ripple effect
  const [particles, setParticles] = useState<any[]>([]);
  const prevCompletedRef = useRef(isCompleted);

  useEffect(() => {
    if (isCompleted && !prevCompletedRef.current) {
      const newParticles = Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 2 * Math.PI;
        const dist = 30 + Math.random() * 25;
        return {
          id: Date.now() + i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          color: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'][i % 4],
          size: 4 + Math.random() * 4,
        };
      });
      setParticles(newParticles);
      const timer = setTimeout(() => setParticles([]), 800);
      return () => clearTimeout(timer);
    }
    prevCompletedRef.current = isCompleted;
  }, [isCompleted]);

  // Click handler on Waypoint (Primary Action Target)
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Select this waypoint to open its info card
    onSelect(node.id);

    if (isLocked) {
      // Show prerequisite tooltip for locked state
      setShowTooltip(true);
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = setTimeout(() => setShowTooltip(false), 2500);
      return;
    }

    // Perform primary action (Open / Resume / Review)
    onAction(node, state);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(node.id);
      if (isLocked) {
        setShowTooltip(true);
        if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
        tooltipTimeoutRef.current = setTimeout(() => setShowTooltip(false), 2500);
      } else {
        onAction(node, state);
      }
    }
  };

  const handleMouseEnter = () => {
    onSelect(node.id);
    if (waypointRef.current) {
      onMouseEnter(node.id, waypointRef.current.getBoundingClientRect());
    }
  };

  const handleMouseLeave = () => {
    onMouseLeave();
  };

  const handleFocus = () => {
    setIsFocused(true);
    onSelect(node.id);
    if (waypointRef.current) {
      onMouseEnter(node.id, waypointRef.current.getBoundingClientRect());
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    onMouseLeave();
  };

  // Determine center icon based on type and status
  const renderIcon = () => {
    const rawType = (node.type || '').toLowerCase();
    
    // Type specific icons (if specified in node type or milestone type)
    if (rawType.includes('project') || milestoneType === 'project') {
      return <Rocket className="w-4 h-4 text-blue-400" />;
    }
    if (rawType.includes('quiz') || rawType.includes('assessment') || milestoneType === 'quiz' || milestoneType === 'assessment') {
      return <ClipboardList className="w-4 h-4 text-amber-400" />;
    }
    if (rawType.includes('cert') || milestoneType === 'certificate') {
      return <Trophy className="w-4 h-4 text-yellow-400" />;
    }
    if (isOptional) {
      return <Star className="w-4 h-4 text-purple-400 fill-purple-400" />;
    }

    // State based default icons
    if (isCompleted) {
      return (
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        >
          <Check className="w-4 h-4 text-white stroke-[3.5]" />
        </motion.div>
      );
    }

    if (isCurrent) {
      return <Play className="w-4 h-4 text-white fill-white ml-0.5" />;
    }

    if (isLocked) {
      return <Lock className="w-3.5 h-3.5 text-slate-400" />;
    }

    // NOT_STARTED state: show play icon on hover, or dot
    return isHovered ? (
      <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400 ml-0.5" />
    ) : (
      <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
    );
  };

  // Status label for screen reader
  const statusLabel = isCompleted
    ? 'Completed'
    : isCurrent
    ? 'Current lesson'
    : isLocked
    ? 'Locked'
    : 'Not started';

  const radius = isMilestone ? 24 : 20;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${waypoint.x}px`,
        top: `${waypoint.y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: isActive || isHovered ? 40 : 25,
      }}
      className="pointer-events-auto select-none"
    >
      {/* Prerequisite Tooltip on Locked Click */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: -12, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900/95 text-slate-200 text-[11px] font-semibold rounded-lg shadow-xl border border-slate-700 whitespace-nowrap z-50 flex items-center gap-1.5 pointer-events-none"
          >
            <Lock className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Complete previous lessons to unlock</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Confetti Particles */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full pointer-events-none z-50"
            style={{
              backgroundColor: p.color,
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: '50%',
              top: '50%',
            }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: p.x, y: p.y, scale: 0, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* CURRENT LESSON: Pulsing Outer Ring & Soft Glow */}
      {isCurrent && (
        <>
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: radius * 2 + 24,
              height: radius * 2 + 24,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              border: '2px solid rgba(99, 102, 241, 0.6)',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
            }}
            initial={{ scale: 0.85, opacity: 0.8 }}
            animate={{ scale: 1.45, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />

          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: radius * 2 + 12,
              height: radius * 2 + 12,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%)',
              filter: 'blur(6px)',
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* COMPLETED RIPPLE ANIMATION */}
      {isCompleted && (
        <motion.div
          className="absolute rounded-full pointer-events-none border-2 border-emerald-500/40"
          style={{
            width: radius * 2 + 16,
            height: radius * 2 + 16,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Primary Interactive Button Container */}
      <motion.button
        ref={waypointRef}
        role="button"
        tabIndex={0}
        aria-label={`Waypoint lesson: ${node.label}. Status: ${statusLabel}.`}
        aria-disabled={isLocked}
        aria-expanded={isActive || isHovered}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        whileHover={{ scale: 1.18 }}
        whileTap={{ scale: 0.92 }}
        animate={{
          y: isCurrent ? [0, -4, 0] : 0,
          opacity: isDimmed ? 0.35 : 1,
        }}
        transition={{
          y: isCurrent ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 },
          scale: { type: 'spring', stiffness: 350, damping: 20 },
        }}
        style={{
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
        }}
        className={`relative rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 focus:outline-none ${
          isFocused || isActive ? 'ring-4 ring-indigo-500/70 ring-offset-2 ring-offset-slate-950' : ''
        } ${
          isCompleted
            ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] border-2 border-emerald-300'
            : isCurrent
            ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-[0_0_25px_rgba(99,102,241,0.65)] border-2 border-indigo-300'
            : isLocked
            ? 'bg-slate-900/90 border-2 border-slate-700 text-slate-400 opacity-80 cursor-not-allowed hover:border-slate-500'
            : 'bg-slate-900 border-2 border-indigo-400/70 text-indigo-300 hover:border-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.35)]'
        }`}
      >
        {/* Subtle Inner Glow for Active Waypoints */}
        {(isCurrent || isCompleted) && (
          <div className="absolute inset-0 rounded-full bg-white/20 blur-xs pointer-events-none" />
        )}

        {/* Icon Center */}
        <div className="relative z-10 flex items-center justify-center">
          {renderIcon()}
        </div>

        {/* Optional Star Badge Indicator */}
        {isOptional && !isCompleted && (
          <div className="absolute -top-1 -right-1 bg-purple-600 rounded-full p-0.5 border border-purple-300 shadow-md">
            <Star className="w-2.5 h-2.5 text-white fill-white" />
          </div>
        )}
      </motion.button>
    </div>
  );
};
