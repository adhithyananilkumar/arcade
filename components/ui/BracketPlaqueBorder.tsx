'use client';

import React from 'react';

export interface BracketPlaqueBorderProps {
  className?: string;
  strokeWidth?: number;
}

export const BracketPlaqueBorder: React.FC<BracketPlaqueBorderProps> = ({
  className = 'text-slate-300 dark:text-slate-700',
  strokeWidth = 2
}) => {
  return (
    <>
      {/* SVG ClipPath Definition */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="bracket-plaque-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.07,0.02 C 0.25,0.02 0.44,0.02 0.47,0.02 C 0.485,0.01 0.495,0.00 0.50,0.00 C 0.505,0.00 0.515,0.01 0.53,0.02 C 0.56,0.02 0.75,0.02 0.93,0.02 C 0.97,0.02 0.98,0.04 0.98,0.07 C 0.98,0.25 0.98,0.44 0.98,0.47 C 0.99,0.485 1.00,0.495 1.00,0.50 C 1.00,0.505 0.99,0.515 0.98,0.53 C 0.98,0.56 0.98,0.75 0.98,0.93 C 0.98,0.97 0.97,0.98 0.93,0.98 C 0.75,0.98 0.56,0.98 0.53,0.98 C 0.515,0.99 0.505,1.00 0.50,1.00 C 0.495,1.00 0.485,0.99 0.47,0.98 C 0.44,0.98 0.25,0.98 0.07,0.98 C 0.03,0.98 0.02,0.97 0.02,0.93 C 0.02,0.75 0.02,0.56 0.02,0.53 C 0.01,0.515 0.00,0.505 0.00,0.50 C 0.00,0.495 0.01,0.485 0.02,0.47 C 0.02,0.44 0.02,0.25 0.02,0.07 C 0.02,0.03 0.03,0.02 0.07,0.02 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Border Outline SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d="M 7,2 C 25,2 44,2 47,2 C 48.5,1 49.5,0 50,0 C 50.5,0 51.5,1 53,2 C 56,2 75,2 93,2 C 97,2 98,4 98,7 C 98,25 98,44 98,47 C 99,48.5 100,49.5 100,50 C 100,50.5 99,51.5 98,53 C 98,56 98,75 98,93 C 98,97 97,98 93,98 C 75,98 56,98 53,98 C 51.5,99 50.5,100 50,100 C 49.5,100 48.5,99 47,98 C 44,98 25,98 7,98 C 3,98 2,97 2,93 C 2,75 2,56 2,53 C 1,51.5 0,50.5 0,50 C 0,49.5 1,48.5 2,47 C 2,44 2,25 2,7 C 2,3 3,2 7,2 Z"
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

export default BracketPlaqueBorder;
