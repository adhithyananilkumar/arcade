'use client';

import React from 'react';

export interface DottedTrapezoidBorderProps {
  className?: string;
  strokeWidth?: number;
  dashArray?: string;
  speed?: number;
}

export const DottedTrapezoidBorder: React.FC<DottedTrapezoidBorderProps> = ({
  className = 'text-slate-400 dark:text-slate-500',
  strokeWidth = 2.5,
  dashArray = '6 5',
  speed = 1.2
}) => {
  return (
    <>
      <style>{`
        @keyframes trapezoidDashMove {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -22;
          }
        }
        .moving-dotted-border {
          animation: trapezoidDashMove ${speed}s linear infinite;
        }
      `}</style>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon
          points="10,1.5 90,1.5 98.5,98.5 1.5,98.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          vectorEffect="non-scaling-stroke"
          className={`moving-dotted-border ${className}`}
        />
      </svg>
    </>
  );
};

export default DottedTrapezoidBorder;
