"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue } from "framer-motion";
import { Doodle, DoodleType, ALL_DOODLE_TYPES } from "./DoodleElements";

// A precise, highly legible cursive/block path for "arcade"
const ARCADE_PATH = [
  "M 50,70 C 30,70 30,100 50,100 C 60,100 60,70 50,70 L 50,100 C 50,110 60,100 70,95",
  "M 70,95 L 70,70 M 70,80 C 75,65 85,65 95,75",
  "M 125,75 C 110,60 95,70 95,85 C 95,100 110,110 125,95",
  "M 155,70 C 135,70 135,100 155,100 C 165,100 165,70 155,70 L 155,100 C 155,110 165,100 175,95",
  "M 205,70 C 185,70 185,100 205,100 C 215,100 215,70 205,70 L 205,30 L 205,100 C 205,110 215,100 225,95",
  "M 225,95 C 240,95 250,85 245,75 C 240,65 225,75 225,90 C 225,105 245,105 255,95"
].join(" ");

interface PlacedDoodle {
  id: string;
  type: DoodleType;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  delay: number;
}

export default function ArcadeSignature() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [doodles, setDoodles] = useState<PlacedDoodle[]>([]);
  const [idleIndex, setIdleIndex] = useState<number | null>(null);

  // Global mouse position
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  // Generate random doodles on client mount to avoid hydration mismatch
  useEffect(() => {
    // Generate between 10 and 15 doodles
    const numDoodles = Math.floor(Math.random() * 6) + 10;
    const selectedTypes = [...ALL_DOODLE_TYPES].sort(() => Math.random() - 0.5).slice(0, numDoodles);

    const placed: PlacedDoodle[] = [];
    
    selectedTypes.forEach((type, index) => {
      let x = 0;
      let y = 0;
      let valid = false;
      let attempts = 0;

      // Find a spot that isn't too close to the center "arcade" text
      // The text roughly occupies x: 30%-70%, y: 40%-60%
      while (!valid && attempts < 50) {
        x = Math.random() * 90 + 5; // 5% to 95%
        y = Math.random() * 90 + 5; // 5% to 95%
        
        // Check if inside the exclusion zone
        const inCenterBox = (x > 25 && x < 75) && (y > 35 && y < 65);
        
        if (!inCenterBox) {
          // Check distance from other doodles to avoid overlapping clumps
          let tooClose = false;
          for (const p of placed) {
            const dx = p.x - x;
            const dy = p.y - y;
            if (Math.sqrt(dx * dx + dy * dy) < 12) { // min 12% distance
              tooClose = true;
              break;
            }
          }
          if (!tooClose) valid = true;
        }
        attempts++;
      }

      placed.push({
        id: `${type}-${index}`,
        type,
        x,
        y,
        scale: Math.random() * 0.4 + 1, // 1 to 1.4
        rotation: Math.random() * 60 - 30, // -30 to 30 deg
        delay: index * 0.15 + 0.5,
      });
    });

    setDoodles(placed);
  }, []);

  // Idle animation loop
  useEffect(() => {
    if (doodles.length === 0) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        setIdleIndex(Math.floor(Math.random() * doodles.length));
        setTimeout(() => setIdleIndex(null), 2000);
      } else {
        setIdleIndex(null);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [doodles]);

  // Track mouse over the whole container
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
      className="relative w-full h-[500px] flex items-center justify-center overflow-hidden rounded-3xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background doodles scattered around */}
      {doodles.map((d, i) => (
        <Doodle
          key={d.id}
          type={d.type}
          x={d.x}
          y={d.y}
          scale={d.scale}
          rotation={d.rotation}
          delay={d.delay}
          mouseX={mouseX}
          mouseY={mouseY}
          isIdleAnimating={idleIndex === i}
          parentRef={containerRef}
        />
      ))}

      {/* Center "arcade" signature */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 pointer-events-none"
      >
        <svg
          viewBox="0 0 300 150"
          className="w-full max-w-[450px] h-auto drop-shadow-md text-slate-900"
        >
          <motion.path
            d={ARCADE_PATH}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, ease: "easeInOut", delay: 0.2 }}
          />
        </svg>
      </motion.div>
    </div>
  );
}
