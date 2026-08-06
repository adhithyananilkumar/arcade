'use client';

import React, { useRef } from 'react';
import { useMotionValue } from 'framer-motion';
import { Doodle, DoodleType } from '@/apps/public/components/landing/signature/DoodleElements';

interface Props {
  bannerUrl?: string | null;
  className?: string;
}

export function ChannelDoodleBanner({ bannerUrl, className = "h-40 w-full sm:h-52" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  if (bannerUrl) {
    return (
      <div className={`relative overflow-hidden border-b border-slate-200/80 ${className}`}>
        <img src={bannerUrl} alt="Channel Banner" className="h-full w-full object-cover" />
      </div>
    );
  }

  // Curated layout of doodles for a stylish hand-drawn feel on beige
  const doodleItems: { type: DoodleType; x: number; y: number; scale: number; rotation: number }[] = [
    { type: 'bulb', x: 7, y: 22, scale: 1.1, rotation: -12 },
    { type: 'code', x: 20, y: 58, scale: 1.25, rotation: 8 },
    { type: 'sparkle', x: 34, y: 18, scale: 1.3, rotation: 15 },
    { type: 'rocket', x: 48, y: 52, scale: 1.15, rotation: -20 },
    { type: 'cap', x: 62, y: 20, scale: 1.2, rotation: 10 },
    { type: 'atom', x: 75, y: 60, scale: 1.1, rotation: -15 },
    { type: 'star', x: 88, y: 22, scale: 1.2, rotation: 25 },
    { type: 'pencil', x: 13, y: 68, scale: 1.0, rotation: 40 },
    { type: 'gear', x: 27, y: 24, scale: 1.15, rotation: -10 },
    { type: 'book', x: 41, y: 70, scale: 1.1, rotation: 5 },
    { type: 'compass', x: 55, y: 65, scale: 1.1, rotation: -12 },
    { type: 'terminal', x: 69, y: 26, scale: 1.15, rotation: 8 },
    { type: 'ribbon', x: 83, y: 65, scale: 1.05, rotation: -18 },
  ];

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const handleMouseLeave = () => {
    mouseX.set(-1000);
    mouseY.set(-1000);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full overflow-hidden border-b border-slate-200/80 bg-[#F5F0E6] text-black ${className}`}
      style={{
        backgroundColor: '#F5F0E6',
        backgroundImage: `radial-gradient(#14142b 0.8px, transparent 0.8px)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Background Doodles */}
      {doodleItems.map((item, idx) => (
        <Doodle
          key={`${item.type}-${idx}`}
          type={item.type}
          x={item.x}
          y={item.y}
          scale={item.scale}
          rotation={item.rotation}
          delay={idx * 0.08}
          mouseX={mouseX}
          mouseY={mouseY}
          isIdleAnimating={idx % 3 === 0}
          parentRef={containerRef}
        />
      ))}

      {/* Sleek Subtle Bottom Shadow Line */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10 pointer-events-none" />
    </div>
  );
}
