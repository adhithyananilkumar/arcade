"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import "./CreatorsBackground.css";

export default function CreatorsBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="creators-bg-canvas" aria-hidden="true">
      {/* Mesh Base Gradient Layer */}
      <div className="creators-bg-mesh" />

      {/* Floating Animated Gradient Orbs */}
      <div className="creators-bg-blobs">
        <motion.div
          className="creators-blob blob-1"
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, 45, -30, 0],
                  y: [0, -40, 35, 0],
                  scale: [1, 1.12, 0.95, 1],
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
          className="creators-blob blob-2"
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, -50, 35, 0],
                  y: [0, 45, -30, 0],
                  scale: [1, 0.92, 1.1, 1],
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
          className="creators-blob blob-3"
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, 40, -45, 0],
                  y: [0, -35, 40, 0],
                  scale: [1, 1.08, 0.92, 1],
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
          className="creators-blob blob-4"
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, -40, 40, 0],
                  y: [0, 50, -35, 0],
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
        <motion.div
          className="creators-blob blob-5"
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, 35, -35, 0],
                  y: [0, -45, 30, 0],
                  scale: [1, 1.1, 0.94, 1],
                }
          }
          transition={{
            duration: 21,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="creators-blob blob-6"
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, -45, 30, 0],
                  y: [0, 35, -45, 0],
                  scale: [1, 0.95, 1.09, 1],
                }
          }
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="creators-blob blob-7"
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, 40, -30, 0],
                  y: [0, -40, 35, 0],
                  scale: [1, 1.08, 0.93, 1],
                }
          }
          transition={{
            duration: 23,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="creators-blob blob-8"
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, -35, 45, 0],
                  y: [0, 40, -30, 0],
                  scale: [1, 0.92, 1.12, 1],
                }
          }
          transition={{
            duration: 26,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Subtle Soft Floating Particles / Noise Texture */}
      <svg className="creators-bg-noise">
        <filter id="creators-noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#creators-noise-filter)" />
      </svg>
    </div>
  );
}
