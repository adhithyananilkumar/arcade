'use client';

import React from 'react';

export interface WavyScallopedBorderProps {
  className?: string;
  strokeWidth?: number;
}

export const WavyScallopedBorder: React.FC<WavyScallopedBorderProps> = ({
  className = 'text-slate-400 dark:text-slate-500',
  strokeWidth = 2.5
}) => {
  // Smooth continuous wavy/scalloped bezier curve around all 4 sides matching reference image
  const pathData = `
    M 30,15
    C 45,8 60,22 75,15 C 90,8 105,22 120,15 C 135,8 150,22 165,15 C 180,8 195,22 210,15 C 225,8 240,22 255,15 C 270,8 285,22 300,15 C 315,8 330,22 345,15 C 360,8 375,22 385,15
    C 392,25 378,40 385,55 C 392,70 378,85 385,100 C 392,115 378,130 385,145 C 392,160 378,175 385,190 C 392,205 378,220 385,235 C 392,250 378,265 385,280 C 392,295 378,310 385,325 C 392,340 378,355 385,370 C 392,385 378,400 385,415 C 392,430 378,445 385,460 C 392,475 378,490 385,505
    C 375,498 360,512 345,505 C 330,498 315,512 300,505 C 285,498 270,512 255,505 C 240,498 225,512 210,505 C 195,498 180,512 165,505 C 150,498 135,512 120,505 C 105,498 90,512 75,505 C 60,498 45,512 30,505
    C 15,490 22,475 15,460 C 8,445 22,430 15,415 C 8,400 22,385 15,370 C 8,355 22,340 15,325 C 8,310 22,295 15,280 C 8,265 22,250 15,235 C 8,220 22,205 15,190 C 8,175 22,160 15,145 C 8,130 22,115 15,100 C 8,85 22,70 15,55 C 8,40 22,25 15,15
    Z
  `;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible"
      viewBox="0 0 400 520"
      preserveAspectRatio="none"
    >
      <path
        d={pathData}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      />
    </svg>
  );
};

export default WavyScallopedBorder;
