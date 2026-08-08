'use client';

import React from 'react';

export interface OrnamentalFlourishFrameProps {
  className?: string;
  strokeWidth?: number;
}

export const OrnamentalFlourishFrame: React.FC<OrnamentalFlourishFrameProps> = ({
  className = 'text-slate-700 dark:text-slate-300',
  strokeWidth = 2.5
}) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible"
      viewBox="0 0 400 520"
      preserveAspectRatio="none"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={className}
      >
        {/* Top-Left Flourish Corner */}
        <path d="M 182,24 C 176,14 162,14 165,24 C 168,32 178,28 184,23 C 140,16 75,12 35,32 C 16,65 32,130 20,200 C 14,220 28,236 34,226 C 38,218 28,212 24,222" />

        {/* Top-Right Flourish Corner */}
        <path d="M 218,24 C 224,14 238,14 235,24 C 232,32 222,28 216,23 C 260,16 325,12 365,32 C 384,65 368,130 380,200 C 386,220 372,236 366,226 C 362,218 372,212 376,222" />

        {/* Bottom-Left Flourish Corner */}
        <path d="M 24,298 C 28,308 38,302 34,294 C 28,284 14,300 20,320 C 32,390 16,455 35,488 C 75,508 140,504 184,497 C 178,492 168,488 165,496 C 162,506 176,506 182,496" />

        {/* Bottom-Right Flourish Corner */}
        <path d="M 376,298 C 372,308 362,302 366,294 C 372,284 386,300 380,320 C 368,390 384,455 365,488 C 325,508 260,504 216,497 C 222,492 232,488 235,496 C 238,506 224,506 218,496" />
      </g>
    </svg>
  );
};

export default OrnamentalFlourishFrame;
