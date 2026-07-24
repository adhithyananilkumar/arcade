"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";

// ─── Floating Particle Interface ─────────────────────────────────────────────

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  factor: number;
}

// ─── HeroBlobImage Component ─────────────────────────────────────────────────

export default function HeroBlobImage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Mouse position state & Framer Motion spring physics for 3D tilt
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [lightPos, setLightPos] = useState({ x: 50, y: 50 });

  // Motion values for normalized cursor coordinates (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for 3D perspective rotation & liquid displacement
  const springConfig = { stiffness: 180, damping: 20 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), springConfig);
  const shiftX = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), springConfig);
  const shiftY = useSpring(useTransform(y, [-0.5, 0.5], [-12, 12]), springConfig);

  // Particles state
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Touch device check
    const touchCheck = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(touchCheck);

    // Generate ambient floating particles around the blob
    const colors = [
      "rgba(255, 255, 255, 0.85)", // Glossy White
      "rgba(147, 197, 253, 0.75)", // Light Blue
      "rgba(192, 132, 252, 0.75)", // Light Purple
      "rgba(165, 243, 252, 0.8)",  // Soft Cyan
    ];

    const initialParticles: Particle[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 3 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 0.35 + Math.random() * 0.45,
      factor: 8 + Math.random() * 20,
    }));

    setParticles(initialParticles);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || shouldReduceMotion || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate normalized mouse coords (-0.5 to 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    x.set(mouseX);
    y.set(mouseY);

    // Light reflection percentage (0% to 100%)
    setLightPos({
      x: Math.round(((e.clientX - rect.left) / width) * 100),
      y: Math.round(((e.clientY - rect.top) / height) * 100),
    });
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
    setLightPos({ x: 50, y: 50 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[540px] xl:max-w-[600px] aspect-[4/3] sm:aspect-square flex items-center justify-center select-none cursor-pointer"
      style={{ perspective: 1000 }}
      aria-label="Arcade hero blob image interactive visual"
    >
      {/* --- Outer Ambient Radial Glow Aura --- */}
      <motion.div
        className="absolute inset-4 rounded-full bg-gradient-to-tr from-blue-600/30 via-purple-600/25 to-indigo-500/30 blur-3xl pointer-events-none"
        animate={
          shouldReduceMotion
            ? {}
            : {
                scale: isHovered ? 1.18 : [1, 1.08, 1],
                opacity: isHovered ? 0.95 : [0.65, 0.85, 0.65],
              }
        }
        transition={
          isHovered
            ? { duration: 0.4, ease: "easeOut" }
            : { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
      />

      {/* --- Concentric Orbit Rings (Floating in background) --- */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-70"
        viewBox="0 0 500 500"
      >
        <defs>
          <linearGradient id="blob-orbit-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#C084FC" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <circle
          cx="250"
          cy="250"
          r="220"
          fill="none"
          stroke="url(#blob-orbit-1)"
          strokeWidth="1.2"
          strokeDasharray="6 10"
          className="animate-[spin_60s_linear_infinite]"
        />
        <circle
          cx="250"
          cy="250"
          r="180"
          fill="none"
          stroke="rgba(147, 197, 253, 0.2)"
          strokeWidth="1.5"
        />
        <circle
          cx="250"
          cy="250"
          r="145"
          fill="none"
          stroke="rgba(192, 132, 252, 0.18)"
          strokeWidth="1"
          strokeDasharray="4 8"
          className="animate-[spin_40s_linear_infinite_reverse]"
        />
      </svg>

      {/* --- Floating Soft Particles Overlay --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.x}%`,
              top: `${p.y}%`,
              background: p.color,
              boxShadow: `0 0 ${p.size * 3.5}px ${p.color}`,
            }}
            animate={
              shouldReduceMotion
                ? { opacity: p.opacity }
                : {
                    y: [0, -10, 0],
                    x: [0, 5, 0],
                    opacity: isHovered ? p.opacity * 1.4 : [p.opacity, p.opacity * 1.3, p.opacity],
                  }
            }
            transition={
              shouldReduceMotion
                ? {}
                : {
                    duration: 3 + (p.id % 4),
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: p.id * 0.15,
                  }
            }
          />
        ))}
      </div>

      {/* --- 3D Tilted Wrapper around Image & Light Reflection --- */}
      <motion.div
        className="relative z-20 w-full h-full flex items-center justify-center transform-gpu"
        style={{
          rotateX: isTouchDevice || shouldReduceMotion ? 0 : rotateX,
          rotateY: isTouchDevice || shouldReduceMotion ? 0 : rotateY,
          x: isTouchDevice || shouldReduceMotion ? 0 : shiftX,
          y: isTouchDevice || shouldReduceMotion ? 0 : shiftY,
          transformStyle: "preserve-3d",
        }}
        animate={
          shouldReduceMotion
            ? { scale: 1 }
            : {
                scale: isHovered ? 1.03 : 1,
                y: isHovered ? 0 : [0, -8, 0],
                rotateZ: isHovered ? 0 : [0, 1.2, 0, -1.2, 0],
              }
        }
        transition={
          isHovered
            ? { type: "spring", stiffness: 200, damping: 22 }
            : {
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                rotateZ: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 0.3, ease: "easeOut" },
              }
        }
      >
        {/* --- Dynamic Light Reflection Sheen Overlay --- */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none z-30 transition-opacity duration-300 mix-blend-overlay"
          style={{
            opacity: isHovered ? 0.65 : 0,
            background: `radial-gradient(circle 280px at ${lightPos.x}% ${lightPos.y}%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.15) 45%, transparent 80%)`,
          }}
        />

        {/* --- High-Quality Transparent PNG Image --- */}
        <Image
          src="/images/hero-blob-transparent.png"
          alt="Arcade liquid glass hero blob visual"
          width={640}
          height={480}
          priority
          quality={100}
          className="w-full h-full object-contain transition-all duration-300 pointer-events-none"
          style={{
            maxHeight: "100%",
            maxWidth: "100%",
            WebkitMaskImage: "radial-gradient(circle at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0.8) 75%, transparent 95%)",
            maskImage: "radial-gradient(circle at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0.8) 75%, transparent 95%)",
            filter: "drop-shadow(0 16px 36px rgba(59, 130, 246, 0.35))",
          }}
        />
      </motion.div>
    </div>
  );
}
