"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useAnimation, useReducedMotion } from "framer-motion";

// 4-facet pinwheel SVG — one facet per platform pillar color
export default function PinwheelToken() {
  const controls = useAnimation();
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hovered, setHovered] = useState(false);
  const [entered, setEntered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Start idle spin loop after entrance is done
  const startIdle = async () => {
    if (shouldReduceMotion) return;
    await controls.start({
      rotate: 360,
      transition: {
        duration: 20,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      },
    });
  };

  const stopIdle = () => {
    controls.stop();
  };

  const handleEntranceDone = () => {
    setEntered(true);
    startIdle();
  };

  const handleMouseEnter = () => {
    if (!entered || shouldReduceMotion) return;
    setHovered(true);
    stopIdle();
  };

  const handleMouseLeave = () => {
    if (!entered || shouldReduceMotion) return;
    setHovered(false);
    startIdle();
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      controls.stop();
      if (idleRef.current) clearTimeout(idleRef.current);
    };
  }, [controls]);

  const entranceVariant = {
    hidden: shouldReduceMotion
      ? { scale: 1, rotate: 0, opacity: 0 }
      : { scale: 0, rotate: -90, opacity: 0 },
    visible: {
      scale: hovered ? 1.05 : 1,
      rotate: 0,
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0.3 }
        : {
            type: "spring" as const,
            stiffness: 280,
            damping: 18,
            delay: 0.1,
          },
    },
  };

  return (
    <motion.div
      className="l-token-wrap"
      variants={entranceVariant}
      initial="hidden"
      animate="visible"
      onAnimationComplete={handleEntranceDone}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: "pointer" }}
    >
      <motion.div animate={controls} style={{ width: "100%", height: "100%" }}>
        <svg
          width="52"
          height="52"
          viewBox="0 0 52 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Arcade platform token"
        >
          {/* 4-facet pinwheel: each facet is a curved petal rotated 90° */}
          {/* Blue facet — top-right */}
          <path
            d="M26 26 C26 14 38 14 38 26 C38 26 32 26 26 26Z"
            fill="#4C6FFF"
            opacity="0.95"
          />
          {/* Coral facet — bottom-right */}
          <path
            d="M26 26 C38 26 38 38 26 38 C26 38 26 32 26 26Z"
            fill="#FF6B4A"
            opacity="0.95"
          />
          {/* Emerald facet — bottom-left */}
          <path
            d="M26 26 C26 38 14 38 14 26 C14 26 20 26 26 26Z"
            fill="#1DB876"
            opacity="0.95"
          />
          {/* Violet facet — top-left */}
          <path
            d="M26 26 C14 26 14 14 26 14 C26 14 26 20 26 26Z"
            fill="#9B5DE5"
            opacity="0.95"
          />
          {/* Center dot */}
          <circle cx="26" cy="26" r="3.5" fill="white" />
        </svg>
      </motion.div>
    </motion.div>
  );
}
