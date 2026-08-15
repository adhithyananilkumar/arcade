"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export interface DepthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  depth?: number; // max Z depth in px (default 30)
  rotationFactor?: number; // max tilt rotation angle in deg (default 12)
  variant?: "tr-bl" | "tl-br" | "all"; // variety shape brackets
  cardId?: string;
}

/**
 * DepthCard Layer wrapper for 3D parallax element positioning
 */
export function DepthLayer({
  children,
  className = "",
  z = 20,
}: {
  children: React.ReactNode;
  className?: string;
  z?: number;
}) {
  return (
    <div
      className={className}
      style={{
        transform: `translateZ(${z}px)`,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
}

/**
 * DepthCard Component — React Bits Pro Perspective Depth Card Effect
 * Interactive 3D mouse tilt with depth layers, specular glare reflection, and variety corner shapes.
 */
export function DepthCard({
  children,
  className = "",
  depth = 30,
  rotationFactor = 12,
  variant = "tr-bl",
  cardId = "card",
  onClick,
  ...props
}: DepthCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Raw mouse position relative to card center (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for rotation
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [rotationFactor, -rotationFactor]), {
    stiffness: 260,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-rotationFactor, rotationFactor]), {
    stiffness: 260,
    damping: 20,
  });

  // Specular glare reflection coordinates (0% to 100%)
  const glareX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="group relative select-none"
      style={{ perspective: 1000 }}
      {...props}
    >
      <motion.div
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`relative flex flex-col gap-4 rounded-[26px] border border-slate-200/90 bg-white p-6 shadow-[0_8px_24px_rgba(20,20,43,0.06)] transition-shadow duration-300 group-hover:shadow-[0_20px_40px_rgba(41,98,214,0.18)] ${className}`}
      >
        {/* Specular Glare Overlay */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[26px] opacity-0 group-hover:opacity-30 transition-opacity duration-300 z-30"
          style={{
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]) => `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.85) 0%, transparent 65%)`
            ),
          }}
        />

        {/* Variety Shape Bracket Accent Lines (Arcade Logo Gradient #2962D6 via #2C83F5 to #27C5D8) */}
        {variant === "tr-bl" && (
          <>
            {/* Top-Right Bracket */}
            <div className="pointer-events-none absolute -top-[2px] -right-[2px] h-12 w-12 z-20" style={{ transform: "translateZ(25px)", transformStyle: "preserve-3d" }}>
              <svg className="h-full w-full" viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id={`grad-tr-${cardId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2962D6" />
                    <stop offset="50%" stopColor="#2C83F5" />
                    <stop offset="100%" stopColor="#27C5D8" />
                  </linearGradient>
                </defs>
                <path d="M 2 2 H 24 C 36 2 46 12 46 24 V 46" stroke={`url(#grad-tr-${cardId})`} strokeWidth="2.25" strokeLinecap="round" />
              </svg>
            </div>
            {/* Bottom-Left Bracket */}
            <div className="pointer-events-none absolute -bottom-[2px] -left-[2px] h-12 w-12 z-20" style={{ transform: "translateZ(25px)", transformStyle: "preserve-3d" }}>
              <svg className="h-full w-full" viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id={`grad-bl-${cardId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#27C5D8" />
                    <stop offset="50%" stopColor="#2C83F5" />
                    <stop offset="100%" stopColor="#2962D6" />
                  </linearGradient>
                </defs>
                <path d="M 46 46 H 24 C 12 46 2 36 2 24 V 2" stroke={`url(#grad-bl-${cardId})`} strokeWidth="2.25" strokeLinecap="round" />
              </svg>
            </div>
          </>
        )}

        {variant === "tl-br" && (
          <>
            {/* Top-Left Bracket */}
            <div className="pointer-events-none absolute -top-[2px] -left-[2px] h-12 w-12 z-20" style={{ transform: "translateZ(25px)", transformStyle: "preserve-3d" }}>
              <svg className="h-full w-full" viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id={`grad-tl-${cardId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2962D6" />
                    <stop offset="50%" stopColor="#2C83F5" />
                    <stop offset="100%" stopColor="#27C5D8" />
                  </linearGradient>
                </defs>
                <path d="M 46 2 H 24 C 12 2 2 12 2 24 V 46" stroke={`url(#grad-tl-${cardId})`} strokeWidth="2.25" strokeLinecap="round" />
              </svg>
            </div>
            {/* Bottom-Right Bracket */}
            <div className="pointer-events-none absolute -bottom-[2px] -right-[2px] h-12 w-12 z-20" style={{ transform: "translateZ(25px)", transformStyle: "preserve-3d" }}>
              <svg className="h-full w-full" viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id={`grad-br-${cardId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#27C5D8" />
                    <stop offset="50%" stopColor="#2C83F5" />
                    <stop offset="100%" stopColor="#2962D6" />
                  </linearGradient>
                </defs>
                <path d="M 2 46 H 24 C 36 46 46 36 46 24 V 2" stroke={`url(#grad-br-${cardId})`} strokeWidth="2.25" strokeLinecap="round" />
              </svg>
            </div>
          </>
        )}

        {variant === "all" && (
          <>
            {/* All 4 Corners Accent Brackets */}
            <div className="pointer-events-none absolute -top-[2px] -right-[2px] h-10 w-10 z-20" style={{ transform: "translateZ(25px)" }}>
              <svg className="h-full w-full" viewBox="0 0 40 40" fill="none">
                <path d="M 2 2 H 20 C 30 2 38 10 38 20 V 38" stroke="#2962D6" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="pointer-events-none absolute -bottom-[2px] -left-[2px] h-10 w-10 z-20" style={{ transform: "translateZ(25px)" }}>
              <svg className="h-full w-full" viewBox="0 0 40 40" fill="none">
                <path d="M 38 38 H 20 C 10 38 2 30 2 20 V 2" stroke="#27C5D8" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="pointer-events-none absolute -top-[2px] -left-[2px] h-10 w-10 z-20" style={{ transform: "translateZ(25px)" }}>
              <svg className="h-full w-full" viewBox="0 0 40 40" fill="none">
                <path d="M 38 2 H 20 C 10 2 2 10 2 20 V 38" stroke="#2C83F5" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="pointer-events-none absolute -bottom-[2px] -right-[2px] h-10 w-10 z-20" style={{ transform: "translateZ(25px)" }}>
              <svg className="h-full w-full" viewBox="0 0 40 40" fill="none">
                <path d="M 2 38 H 20 C 30 38 38 30 38 20 V 2" stroke="#2962D6" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </>
        )}

        {/* Card Content with 3D Depth Layering */}
        <div style={{ transformStyle: "preserve-3d" }} className="flex flex-col gap-4 flex-1">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
