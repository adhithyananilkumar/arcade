'use client';

import React from 'react';

export interface TicketNotchBorderProps {
  className?: string;
  strokeWidth?: number;
  speed?: number;
}

export const TicketNotchBorder: React.FC<TicketNotchBorderProps> = ({
  className = 'text-slate-400 dark:text-slate-600',
  strokeWidth = 1.5,
  speed = 1.8
}) => {
  return (
    <>
      <style>{`
        @keyframes flowMovingBars {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -68;
          }
        }
        .moving-multi-bars {
          animation: flowMovingBars ${speed}s linear infinite;
        }
      `}</style>

      {/* SVG ClipPath Definition for Asymmetric Leaf Shape (0px 44px 0px 44px) */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="asymmetric-leaf-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0,0 L 0.84,0 Q 1,0 1,0.16 L 1,1 L 0.16,1 Q 0,1 0,0.84 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* SVG Border Outline + Moving Multi-Color Gradient Small Bars */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Multi-Color Gradient with vibrant spectrum colors */}
          <linearGradient id="multiColorBarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="20%" stopColor="#a855f7" />
            <stop offset="40%" stopColor="#6366f1" />
            <stop offset="60%" stopColor="#06b6d4" />
            <stop offset="80%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Small Moving Multi-Color Gradient Bars between the two border lines */}
        <path
          d="M 2.15,2.15 L 85,2.15 A 11.75,11.75 0 0,1 97.85,14 L 97.85,97.85 L 14,97.85 A 11.75,11.75 0 0,1 2.15,85 Z"
          fill="none"
          stroke="url(#multiColorBarGradient)"
          strokeWidth={3.5}
          strokeDasharray="14 20"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="moving-multi-bars"
        />

        {/* Outer Contour Line (Asymmetric Leaf 0px 44px 0px 44px) */}
        <path
          d="M 0.8,0.8 L 86,0.8 A 13,13 0 0,1 99.2,14 L 99.2,99.2 L 14,99.2 A 13,13 0 0,1 0.8,86 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
          className={className}
        />

        {/* Inner Contour Line */}
        <path
          d="M 3.5,3.5 L 84,3.5 A 10.5,10.5 0 0,1 96.5,14 L 96.5,96.5 L 14,96.5 A 10.5,10.5 0 0,1 3.5,84 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
          className={className}
        />
      </svg>
    </>
  );
};

export default TicketNotchBorder;
