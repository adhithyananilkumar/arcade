"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Simplified neural pathways representing a brain structure
const NEURAL_PATHS = [
  "M150,280 C150,220 120,200 80,160 C40,120 40,60 90,40",
  "M150,280 C150,220 180,200 220,160 C260,120 260,60 210,40",
  "M150,280 C150,220 150,170 110,130 C70,90 90,50 140,40",
  "M150,280 C150,220 150,170 190,130 C230,90 210,50 160,40",
  "M150,280 C150,200 150,150 150,100 C150,70 150,50 150,40",
  "M80,160 C110,180 190,180 220,160",
  "M110,130 C130,110 170,110 190,130",
  "M90,40 C110,20 190,20 210,40",
  "M40,100 C70,90 120,100 150,100",
  "M260,100 C230,90 180,100 150,100",
];

const NODES = [
  { x: 150, y: 280, size: 8 }, // Stem base
  { x: 150, y: 220, size: 6 },
  { x: 120, y: 200, size: 4 },
  { x: 180, y: 200, size: 4 },
  { x: 80, y: 160, size: 7 },
  { x: 220, y: 160, size: 7 },
  { x: 40, y: 100, size: 5 },
  { x: 260, y: 100, size: 5 },
  { x: 90, y: 40, size: 6 },
  { x: 210, y: 40, size: 6 },
  { x: 140, y: 40, size: 4 },
  { x: 160, y: 40, size: 4 },
  { x: 110, y: 130, size: 5 },
  { x: 190, y: 130, size: 5 },
  { x: 150, y: 100, size: 9 }, // Central core
];

export default function BrainEnergy() {
  const [pulses, setPulses] = useState<{ id: number; pathIndex: number }[]>([]);
  const [activeNodes, setActiveNodes] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger 1-3 new pulses
      const numPulses = Math.floor(Math.random() * 3) + 1;
      const newPulses = Array.from({ length: numPulses }).map(() => ({
        id: Date.now() + Math.random(),
        pathIndex: Math.floor(Math.random() * NEURAL_PATHS.length),
      }));
      
      setPulses((prev) => [...prev, ...newPulses].slice(-8)); // keep last 8
      
      // Randomly light up nodes
      const numNodes = Math.floor(Math.random() * 5) + 2;
      const nodes = Array.from({ length: numNodes }).map(() => Math.floor(Math.random() * NODES.length));
      setActiveNodes(nodes);
      
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden rounded-3xl">
      <div className="absolute inset-0 bg-amber-500/5 blur-[100px] rounded-full scale-150" />
      
      <svg
        viewBox="0 0 300 320"
        className="w-full max-w-[400px] h-auto z-10"
        style={{ filter: "drop-shadow(0 0 15px rgba(251, 191, 36, 0.3))" }}
      >
        <defs>
          <linearGradient id="energyGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Base Neural Pathways */}
        {NEURAL_PATHS.map((path, idx) => (
          <path
            key={`base-${idx}`}
            d={path}
            fill="none"
            stroke="#fcd34d"
            strokeWidth="1.5"
            strokeOpacity="0.3"
            strokeLinecap="round"
          />
        ))}

        {/* Energy Pulses along pathways */}
        <AnimatePresence>
          {pulses.map((pulse) => (
            <motion.path
              key={pulse.id}
              d={NEURAL_PATHS[pulse.pathIndex]}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          ))}
        </AnimatePresence>

        {/* Neural Nodes (Synapses) */}
        {NODES.map((node, idx) => {
          const isActive = activeNodes.includes(idx);
          return (
            <motion.circle
              key={`node-${idx}`}
              cx={node.x}
              cy={node.y}
              r={node.size / 2}
              fill={isActive ? "#fbbf24" : "#fef3c7"}
              animate={{
                scale: isActive ? [1, 1.8, 1] : 1,
                opacity: isActive ? [0.6, 1, 0.6] : 0.4,
              }}
              transition={{ duration: 1, ease: "easeInOut" }}
              filter={isActive ? "url(#glow)" : ""}
            />
          );
        })}
        
        {/* Central glowing core pulse */}
        <motion.circle
          cx="150"
          cy="130"
          r="40"
          fill="url(#energyGrad)"
          filter="url(#glow)"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </svg>
    </div>
  );
}
