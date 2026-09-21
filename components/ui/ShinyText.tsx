'use client';

import React from 'react';

export interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  shimmerColor?: string;
}

export default function ShinyText({
  text,
  disabled = false,
  speed = 4,
  className = '',
  shimmerColor = 'rgba(255, 255, 255, 0.95)',
}: ShinyTextProps) {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`inline-block select-none ${disabled ? '' : 'shiny-text-animated'} ${className}`}
      style={
        disabled
          ? {}
          : ({
              backgroundImage: `linear-gradient(120deg, rgba(20, 20, 43, 0.9) 0%, rgba(20, 20, 43, 0.9) 35%, ${shimmerColor} 50%, rgba(20, 20, 43, 0.9) 65%, rgba(20, 20, 43, 0.9) 100%)`,
              backgroundSize: '250% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: `shiny-sweep ${animationDuration} ease-in-out infinite`,
            } as React.CSSProperties)
      }
    >
      {text}
      <style jsx>{`
        @keyframes shiny-sweep {
          0% {
            background-position: 150% 0;
          }
          100% {
            background-position: -150% 0;
          }
        }
      `}</style>
    </span>
  );
}
