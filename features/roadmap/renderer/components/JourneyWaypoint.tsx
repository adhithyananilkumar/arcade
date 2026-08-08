'use client';
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoadmapNode, JourneyNodeAttachment } from '../types';
import { Lock } from 'lucide-react';

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

  const { state, waypoint } = attachment;
  const isCompleted = state === 'completed';
  const isCurrent = state === 'current';
  const isLocked = state === 'locked';

  // Click handler on Waypoint (Primary Action Target)
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id);

    if (isLocked) {
      setShowTooltip(true);
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = setTimeout(() => setShowTooltip(false), 2500);
      return;
    }

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

  const statusLabel = isCompleted
    ? 'Completed'
    : isCurrent
    ? 'Current lesson'
    : isLocked
    ? 'Locked'
    : 'Not started';

  return (
    <div
      style={{
        position: 'absolute',
        left: `${waypoint.x}px`,
        top: `${waypoint.y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: isActive || isHovered ? 45 : 30,
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
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900/95 text-slate-200 text-[10px] font-semibold rounded-lg shadow-xl border border-slate-700 whitespace-nowrap z-50 flex items-center gap-1.5 pointer-events-none"
          >
            <Lock className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Complete previous lessons to unlock</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive invisible/halo click target directly over the path node */}
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
        onMouseLeave={onMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        whileHover={{ scale: 1.3 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          opacity: isDimmed ? 0.35 : 1,
        }}
        className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 focus:outline-none ${
          isFocused || isActive ? 'ring-2 ring-indigo-500/50' : 'hover:bg-indigo-500/10'
        }`}
      >
        {/* Transparent core that covers the dot */}
        <div className="w-3.5 h-3.5 rounded-full" />
      </motion.button>
    </div>
  );
};

