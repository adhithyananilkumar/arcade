'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { JourneyNodeAttachment, JourneyRoadPath, JourneyChapter } from '../types';
import { Check } from 'lucide-react';

interface RoadSVGProps {
  attachments: JourneyNodeAttachment[];
  chapters: JourneyChapter[];
  roadPath: JourneyRoadPath;
  width: number;
  height: number;
  activeNodeId?: string | null;
  hoveredNodeId?: string | null;
}

export const RoadSVG: React.FC<RoadSVGProps> = ({
  attachments,
  chapters,
  roadPath,
  width,
  height,
  activeNodeId,
  hoveredNodeId,
}) => {
  const { mainRoadD, completedPathsD, currentPathD } = roadPath;
  const centerX = width / 2;

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible"
      style={{ minWidth: width, minHeight: height }}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        {/* Subtle Path Glow Filters */}
        <filter id="path-glow-completed" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="path-glow-current" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ========================================================================= */}
      {/* LAYER 1: BASE PATH LINE (Locked/Future Winding Path - Slate-200 Dashed)   */}
      {/* ========================================================================= */}
      <path
        d={mainRoadD}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="6 8"
      />

      {/* ========================================================================= */}
      {/* LAYER 2: COMPLETED PATH SEGMENTS (Solid Purple/Indigo Line)              */}
      {/* ========================================================================= */}
      {completedPathsD.map((pathD, idx) => (
        <React.Fragment key={`completed-seg-${idx}`}>
          <path
            d={pathD}
            fill="none"
            stroke="#6366f1"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#path-glow-completed)"
            opacity={0.35}
          />
          <path
            d={pathD}
            fill="none"
            stroke="#6366f1"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </React.Fragment>
      ))}

      {/* ========================================================================= */}
      {/* LAYER 3: CURRENT PATH SEGMENT (Dashed/Animated Indigo/Orange Line)       */}
      {/* ========================================================================= */}
      {currentPathD && (
        <React.Fragment>
          <path
            d={currentPathD}
            fill="none"
            stroke="#f97316"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#path-glow-current)"
            opacity={0.3}
          />
          {/* Pulsing Dash Wave on Current Path */}
          <motion.path
            d={currentPathD}
            fill="none"
            stroke="#6366f1"
            strokeWidth={3.5}
            strokeDasharray="8 8"
            animate={{ strokeDashoffset: [-64, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </React.Fragment>
      )}

      {/* ========================================================================= */}
      {/* LAYER 4: WAYPOINT DOTS & CONNECTORS                                      */}
      {/* ========================================================================= */}

      {/* 4a. Tiny Waypoint Path Dots */}
      {attachments.map(att => {
        const isCompleted = att.state === 'completed';
        const isCurrent = att.state === 'current';
        const isLocked = att.state === 'locked';

        const dotColor = isCompleted
          ? '#2563eb' // Blue
          : isCurrent
          ? '#f97316' // Orange
          : '#94a3b8'; // Slate Gray

        const ringColor = isCompleted
          ? '#dbeafe'
          : isCurrent
          ? '#ffedd5'
          : '#f1f5f9';

        return (
          <g key={`dot-${att.node.id}`}>
            {/* Outer halo */}
            <circle
              cx={att.waypoint.x}
              cy={att.waypoint.y}
              r={11}
              fill={ringColor}
              opacity={isLocked ? 0.4 : 0.8}
            />
            {/* Central core dot */}
            <circle
              cx={att.waypoint.x}
              cy={att.waypoint.y}
              r={5.5}
              fill={dotColor}
              stroke="#ffffff"
              strokeWidth={1.5}
              className={isCurrent ? "animate-pulse" : ""}
            />
          </g>
        );
      })}

      {/* 4b. Chapter Section Header Banners (Light Glassmorphic Cards) */}
      {chapters.map(chap => (
        <g key={chap.id} transform={`translate(${centerX}, ${chap.y})`}>
          <foreignObject x={-180} y={-40} width={360} height={80} className="overflow-visible">
            <div className="w-full flex flex-col items-center justify-center">
              <div
                className={`px-4 py-2 rounded-2xl border shadow-sm backdrop-blur-md flex items-center gap-3 transition-all ${
                  chap.isCompleted
                    ? 'bg-white/95 border-blue-100 text-slate-800'
                    : 'bg-white/90 border-slate-100 text-slate-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-xl flex items-center justify-center font-extrabold text-[10px] text-white ${
                    chap.isCompleted ? 'bg-blue-600' : 'bg-indigo-500'
                  }`}
                >
                  {chap.chapterIndex}
                </div>
                <div className="text-left">
                  <h4 className="text-[11px] font-extrabold tracking-wide uppercase leading-tight text-slate-800">
                    {chap.title}
                  </h4>
                  <p className="text-[9.5px] text-slate-400 font-semibold truncate max-w-[200px]">
                    {chap.subtitle}
                  </p>
                </div>
                {chap.isCompleted && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3.5] ml-0.5" />}
              </div>
            </div>
          </foreignObject>
        </g>
      ))}

      {/* 4c. Curved Connector Lines to Card Anchors */}
      {attachments.map(({ node, waypoint, state }) => {
        const isActive = activeNodeId === node.id;
        const isHovered = hoveredNodeId === node.id;
        const isCompleted = state === 'completed';
        const isCurrent = state === 'current';

        const strokeColor = isCompleted
          ? '#2563eb' // Blue
          : isCurrent
          ? '#6366f1' // Indigo
          : '#cbd5e1'; // Light Slate Gray

        return (
          <g key={`road-connector-${node.id}`}>
            <motion.path
              d={waypoint.connectorPathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth={isHovered || isActive ? 2.5 : 1.5}
              strokeDasharray={state === 'locked' ? '4 4' : undefined}
              opacity={isHovered || isActive ? 1 : state === 'locked' ? 0.35 : 0.6}
              transition={{ duration: 0.2 }}
            />
          </g>
        );
      })}
    </svg>
  );
};

