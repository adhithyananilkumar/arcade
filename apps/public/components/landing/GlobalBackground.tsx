"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import "./GlobalBackground.css";

export default function GlobalBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="global-bg-canvas" aria-hidden="true">
      {/* Base Canvas Gradient Overlay */}
      <div className="global-bg-gradient-layer" />

      {/* Animated Floating Glow Blobs */}
      <div className="global-bg-blobs-layer">
        <motion.div
          className="global-bg-blob blob-lavender"
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, 30, -20, 0],
                  y: [0, -40, 20, 0],
                  scale: [1, 1.08, 0.95, 1],
                }
          }
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="global-bg-blob blob-skyblue"
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, -40, 25, 0],
                  y: [0, 30, -30, 0],
                  scale: [1, 0.92, 1.06, 1],
                }
          }
          transition={{
            duration: 22,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="global-bg-blob blob-cyan"
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, 35, -35, 0],
                  y: [0, -25, 35, 0],
                  scale: [1, 1.05, 0.95, 1],
                }
          }
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="global-bg-blob blob-mint"
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, -30, 30, 0],
                  y: [0, 35, -25, 0],
                  scale: [1, 0.94, 1.08, 1],
                }
          }
          transition={{
            duration: 24,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Subtle Noise / Grain Overlay */}
      <svg className="global-bg-noise-svg">
        <filter id="global-canvas-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#global-canvas-noise)" />
      </svg>
    </div>
  );
}
