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
  const { mainRoadD, completedPathsD, currentPathD, centerLineD } = roadPath;
  const centerX = width / 2;

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible"
      style={{ minWidth: width, minHeight: height }}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        {/* Glow Filters */}
        <filter id="road-glow-completed" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="road-glow-current" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="road-locked-surface" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="road-completed-surface" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="road-current-surface" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        {/* Waypoint Road Cutout Mask (Cuts out circular holes in road surface for embedded waypoints) */}
        <mask id="road-waypoint-sockets">
          <rect width="100%" height="100%" fill="white" />
          {attachments.map(att => (
            <circle
              key={`mask-wp-${att.node.id}`}
              cx={att.waypoint.x}
              cy={att.waypoint.y}
              r={att.isMilestone ? 25 : 21}
              fill="black"
            />
          ))}
        </mask>
      </defs>

      {/* ========================================================================= */}
      {/* LAYER 1: ROAD SHADOW                                                     */}
      {/* ========================================================================= */}
      <path
        d={mainRoadD}
        fill="none"
        stroke="#020617"
        strokeWidth={46}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.35}
        style={{ filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.5))' }}
      />

      {/* Group with Waypoint Cutout Mask applied so road cuts cleanly around waypoints */}
      <g mask="url(#road-waypoint-sockets)">
        {/* ======================================================================= */}
        {/* LAYER 2: ROAD SURFACE (Full-Width Asphalt Color Changes)                */}
        {/* ======================================================================= */}

        {/* 2a. Outer Shoulder Curb (Dark Border) */}
        <path
          d={mainRoadD}
          fill="none"
          stroke="#334155"
          strokeWidth={38}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 2b. Base Asphalt Surface (Locked / Future Sections - Dark Charcoal) */}
        <path
          d={mainRoadD}
          fill="none"
          stroke="url(#road-locked-surface)"
          strokeWidth={30}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 2c. Completed Progression Segments (Entire Asphalt Surface Becomes Green) */}
        {completedPathsD.map((pathD, idx) => (
          <React.Fragment key={`completed-seg-${idx}`}>
            <path
              d={pathD}
              fill="none"
              stroke="#10b981"
              strokeWidth={30}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.25}
              style={{ filter: 'url(#road-glow-completed)' }}
            />
            <path
              d={pathD}
              fill="none"
              stroke="url(#road-completed-surface)"
              strokeWidth={30}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </React.Fragment>
        ))}

        {/* 2d. Current Active Progression Segment (Entire Asphalt Surface Becomes Indigo) */}
        {currentPathD && (
          <React.Fragment>
            <path
              d={currentPathD}
              fill="none"
              stroke="#6366f1"
              strokeWidth={34}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.4}
              style={{ filter: 'url(#road-glow-current)' }}
            />
            <path
              d={currentPathD}
              fill="none"
              stroke="url(#road-current-surface)"
              strokeWidth={30}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Subtle Lightwave Pulse on Current Asphalt */}
            <motion.path
              d={currentPathD}
              fill="none"
              stroke="#a5b4fc"
              strokeWidth={4}
              strokeDasharray="10 24"
              animate={{ strokeDashoffset: [-100, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.85}
            />
          </React.Fragment>
        )}

        {/* ======================================================================= */}
        {/* LAYER 3: LANE MARKINGS (Untinted White Center Dashed Line)               */}
        {/* ======================================================================= */}
        <path
          d={centerLineD}
          fill="none"
          stroke="#f8fafc"
          strokeWidth={2.5}
          strokeDasharray="12 16"
          strokeLinecap="round"
          opacity={0.85}
        />
      </g>

      {/* ========================================================================= */}
      {/* LAYER 4: WAYPOINTS & CONNECTORS                                          */}
      {/* ========================================================================= */}

      {/* 4a. Embedded Waypoint Socket Rings */}
      {attachments.map(att => (
        <g key={`socket-${att.node.id}`}>
          <circle
            cx={att.waypoint.x}
            cy={att.waypoint.y}
            r={att.isMilestone ? 25 : 21}
            fill="#090d16"
            stroke="#1e293b"
            strokeWidth={2}
          />
          <circle
            cx={att.waypoint.x}
            cy={att.waypoint.y}
            r={att.isMilestone ? 27 : 23}
            fill="none"
            stroke="#334155"
            strokeWidth={1.5}
            opacity={0.6}
          />
        </g>
      ))}

      {/* 4b. Chapter Section Header Banners */}
      {chapters.map(chap => (
        <g key={chap.id} transform={`translate(${centerX}, ${chap.y})`}>
          <foreignObject x={-200} y={-45} width={400} height={90} className="overflow-visible">
            <div className="w-full flex flex-col items-center justify-center">
              <div
                className={`px-5 py-2.5 rounded-2xl border shadow-xl backdrop-blur-md flex items-center gap-3 transition-all ${
                  chap.isCompleted
                    ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100 shadow-emerald-950/40'
                    : 'bg-slate-900/90 border-indigo-500/40 text-white shadow-indigo-950/40'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                    chap.isCompleted ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'
                  }`}
                >
                  {chap.chapterIndex}
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-extrabold tracking-wide uppercase leading-tight">
                    {chap.title}
                  </h4>
                  <p className="text-[10px] opacity-75 font-medium line-clamp-1">
                    {chap.subtitle}
                  </p>
                </div>
                {chap.isCompleted && <Check className="w-4 h-4 text-emerald-400 stroke-[3] ml-1" />}
              </div>
            </div>
          </foreignObject>
        </g>
      ))}

      {/* 4c. Smooth Bezier Connector Paths connecting Waypoints to Cards */}
      {attachments.map(({ node, waypoint, state }) => {
        const isActive = activeNodeId === node.id;
        const isHovered = hoveredNodeId === node.id;
        const isCompleted = state === 'completed';
        const isCurrent = state === 'current';

        return (
          <g key={`road-connector-${node.id}`}>
            <motion.path
              d={waypoint.connectorPathD}
              fill="none"
              stroke={
                isCompleted
                  ? '#10b981'
                  : isCurrent
                  ? '#6366f1'
                  : '#475569'
              }
              strokeWidth={isHovered || isActive ? 3.5 : 2}
              strokeDasharray={state === 'locked' ? '4 4' : undefined}
              opacity={isHovered || isActive ? 1 : state === 'locked' ? 0.35 : 0.7}
              transition={{ duration: 0.2 }}
            />
          </g>
        );
      })}
    </svg>
  );
};
