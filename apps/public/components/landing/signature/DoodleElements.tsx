"use client";

import React, { useMemo } from "react";
import { motion, MotionValue, useTransform, useSpring } from "framer-motion";

export type DoodleType =
  | "gear"
  | "cap"
  | "bulb"
  | "atom"
  | "rocket"
  | "satellite"
  | "cpu"
  | "terminal"
  | "code"
  | "database"
  | "cloud"
  | "wifi"
  | "book"
  | "pencil"
  | "ruler"
  | "graph"
  | "globe"
  | "aichip"
  | "star"
  | "sparkle"
  | "compass"
  | "cube"
  | "cursor"
  | "play"
  | "ribbon";

export const ALL_DOODLE_TYPES: DoodleType[] = [
  "gear", "cap", "bulb", "atom", "rocket", "satellite", "cpu", "terminal",
  "code", "database", "cloud", "wifi", "book", "pencil", "ruler", "graph",
  "globe", "aichip", "star", "sparkle", "compass", "cube", "cursor", "play", "ribbon"
];

export interface DoodleProps {
  type: DoodleType;
  x: number; // Percentage or absolute coordinates based on parent
  y: number;
  scale?: number;
  rotation?: number;
  delay: number;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  isIdleAnimating: boolean;
  parentRef: React.RefObject<HTMLDivElement | null>;
}

export function Doodle({
  type,
  x,
  y,
  scale = 1,
  rotation = 0,
  delay,
  mouseX,
  mouseY,
  isIdleAnimating,
  parentRef,
}: DoodleProps) {
  // We need to calculate proximity based on actual screen coordinates, not SVG coordinates.
  // We'll use a relatively simple distance check.
  
  // Random floating values for this specific doodle instance
  const floatX = useMemo(() => [Math.random() * -6 - 2, Math.random() * 6 + 2, Math.random() * -6 - 2], []);
  const floatY = useMemo(() => [Math.random() * -8 - 2, Math.random() * 8 + 2, Math.random() * -8 - 2], []);
  const floatRotate = useMemo(() => [rotation - (Math.random() * 4 + 1), rotation + (Math.random() * 4 + 1), rotation - (Math.random() * 4 + 1)], [rotation]);
  const floatDuration = useMemo(() => Math.random() * 6 + 6, []); // 6 to 12s

  // For mouse repulsion, since elements are absolute and positioned by %, 
  // we'll apply a simpler motion value logic directly using offset from mouse
  // We assume mouseX and mouseY are global client coordinates.
  const [repelX, setRepelX] = React.useState(0);
  const [repelY, setRepelY] = React.useState(0);
  const elRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let animationFrameId: number;
    
    const checkProximity = () => {
      if (!elRef.current) return;
      const rect = elRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mx = mouseX.get();
      const my = mouseY.get();
      
      // If mouse is off screen
      if (mx < 0 || my < 0) {
        setRepelX(0);
        setRepelY(0);
        animationFrameId = requestAnimationFrame(checkProximity);
        return;
      }

      const dx = centerX - mx;
      const dy = centerY - my;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const maxDist = 80;
      if (distance < maxDist && distance > 0) {
        // Push away
        const intensity = 1 - distance / maxDist;
        const push = 12 * intensity; // max 12px
        setRepelX((dx / distance) * push);
        setRepelY((dy / distance) * push);
      } else {
        setRepelX(0);
        setRepelY(0);
      }
      
      animationFrameId = requestAnimationFrame(checkProximity);
    };

    animationFrameId = requestAnimationFrame(checkProximity);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mouseX, mouseY]);

  const springRepelX = useSpring(repelX, { stiffness: 100, damping: 20 });
  const springRepelY = useSpring(repelY, { stiffness: 100, damping: 20 });

  const getDoodleContent = () => {
    const strokeProps = {
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
    };
    
    // Some SVGs get a tiny blue accent dot or line. We define an accent stroke or fill.
    const accentStroke = "text-blue-500";
    const accentFill = "fill-blue-500";

    switch (type) {
      case "gear":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { rotate: [0, 8, 8, 0] } : {}} transition={{ duration: 1 }}>
            <circle cx="12" cy="12" r="6" {...strokeProps} />
            <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-7.364l-1.414 1.414M6.05 17.95l-1.414 1.414M17.95 17.95l1.414 1.414M6.05 6.05L4.636 4.636" {...strokeProps} />
            <circle cx="12" cy="12" r="2" className={accentFill} />
          </motion.svg>
        );
      case "cap":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { y: [0, -5, 0] } : {}}>
            <path d="M12 4L3 9l9 5 9-5-9-5z" {...strokeProps} />
            <path d="M6 10.7V16c0 2 3 4 6 4s6-2 6-4v-5.3" {...strokeProps} />
            <path d="M21 9v6" {...strokeProps} className={accentStroke} />
          </motion.svg>
        );
      case "bulb":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { opacity: [1, 0.4, 1] } : {}}>
            <path d="M9 18h6m-3-1v4m-4.5-9a4.5 4.5 0 119 0c0 1.5-1.5 3-1.5 4.5h-6C7.5 13.5 6 12 6 10.5z" {...strokeProps} />
            <path d="M10 7l1 1m2-1l-1 1" {...strokeProps} className={accentStroke} />
          </motion.svg>
        );
      case "atom":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { rotate: [0, 45, 90] } : {}}>
            <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)" {...strokeProps} />
            <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(90 12 12)" {...strokeProps} />
            <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(150 12 12)" {...strokeProps} />
            <circle cx="12" cy="12" r="1.5" className={accentFill} />
          </motion.svg>
        );
      case "rocket":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { y: [0, -4, 0] } : {}}>
            <path d="M4 14.899A7 7 0 1115.658 3.513M20 20l-4.5-4.5m0 0a7 7 0 10-11.658 11.386L4 20l16-16z" {...strokeProps} />
            <path d="M15.5 15.5l-4-4" {...strokeProps} className={accentStroke} />
            <path d="M20 4s-4-2-9 3-4.5 10.5-4.5 10.5l4-1.5 1.5-4s5.5.5 10.5-4.5S20 4 20 4z" {...strokeProps} />
            <circle cx="14" cy="10" r="1" className={accentFill} />
            <path d="M4 20l2.5-4 M20 20l-2-2" {...strokeProps} />
          </motion.svg>
        );
      case "satellite":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { rotate: [0, -5, 0] } : {}}>
            <path d="M17 13l-6-6M8 21l-5-5m18-3l-5-5M8 8L3 3" {...strokeProps} />
            <rect x="4" y="9" width="4" height="8" rx="1" transform="rotate(-45 6 13)" {...strokeProps} />
            <rect x="11" y="4" width="4" height="8" rx="1" transform="rotate(-45 13 8)" {...strokeProps} />
            <circle cx="12" cy="12" r="2" {...strokeProps} />
            <circle cx="17" cy="7" r="1" className={accentFill} />
          </motion.svg>
        );
      case "cpu":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { scale: [1, 1.05, 1] } : {}}>
            <rect x="4" y="4" width="16" height="16" rx="2" {...strokeProps} />
            <rect x="9" y="9" width="6" height="6" rx="1" {...strokeProps} className={accentStroke} />
            <path d="M9 2v2m3-2v2m3-2v2M9 20v2m3-2v2m3-2v2M2 9h2m-2 3h2m-2 3h2M20 9h2m-2 3h2m-2 3h2" {...strokeProps} />
          </motion.svg>
        );
      case "terminal":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { opacity: [1, 0.7, 1] } : {}}>
            <rect x="2" y="4" width="20" height="16" rx="2" {...strokeProps} />
            <path d="M6 8l4 4-4 4M14 16h4" {...strokeProps} />
            <path d="M14 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={accentStroke} animate={isIdleAnimating ? { opacity: [1, 0, 1, 0, 1] } : {}} />
          </motion.svg>
        );
      case "code":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { scale: [1, 0.95, 1] } : {}}>
            <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" {...strokeProps} />
            <path d="M14 4l-4 16" {...strokeProps} className={accentStroke} />
          </motion.svg>
        );
      case "database":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { y: [0, -3, 0] } : {}}>
            <ellipse cx="12" cy="5" rx="8" ry="3" {...strokeProps} />
            <path d="M4 5v14c0 1.657 3.582 3 8 3s8-1.343 8-3V5" {...strokeProps} />
            <path d="M4 12c0 1.657 3.582 3 8 3s8-1.343 8-3" {...strokeProps} />
            <path d="M4 12c0 1.657 3.582 3 8 3s8-1.343 8-3" {...strokeProps} className={accentStroke} />
          </motion.svg>
        );
      case "cloud":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { x: [0, 4, 0] } : {}}>
            <path d="M17.5 19H9a5 5 0 110-10 1 1 0 011 .103A6 6 0 1117.5 19z" {...strokeProps} />
            <path d="M9 13h4" {...strokeProps} className={accentStroke} />
          </motion.svg>
        );
      case "wifi":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { opacity: [1, 0.5, 1] } : {}}>
            <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0" {...strokeProps} />
            <path d="M8.53 16.11a6 6 0 016.95 0" {...strokeProps} className={accentStroke} />
            <circle cx="12" cy="20" r="1.5" className={accentFill} />
          </motion.svg>
        );
      case "book":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { rotateY: [0, -20, 0] } : {}}>
            <path d="M2 4v16c0 1 1 1 1 1h8V4s-1-1-1-1H2zM22 4v16c0 1-1 1-1 1h-8V4s1-1 1-1h8z" {...strokeProps} />
            <path d="M6 8h4M6 12h3M14 8h4" {...strokeProps} className={accentStroke} />
          </motion.svg>
        );
      case "pencil":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { rotate: [0, 10, 0] } : {}}>
            <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" {...strokeProps} />
            <path d="M15.232 5.232l3.536 3.536" {...strokeProps} className={accentStroke} />
          </motion.svg>
        );
      case "ruler":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { y: [0, -2, 0] } : {}}>
            <path d="M21 21L3 3l5-5 18 18-5 5zM8 2l2 2M12 6l2 2M16 10l2 2M20 14l2 2" transform="translate(0 2)" {...strokeProps} />
            <path d="M12 6l2 2" {...strokeProps} className={accentStroke} />
          </motion.svg>
        );
      case "graph":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { scale: [1, 1.05, 1] } : {}}>
            <path d="M4 20h16M4 4v16M8 12l4-4 4 4 4-8" {...strokeProps} />
            <circle cx="12" cy="8" r="1.5" className={accentFill} />
            <circle cx="16" cy="12" r="1.5" className={accentFill} />
          </motion.svg>
        );
      case "globe":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { rotate: [0, 15, 0] } : {}}>
            <circle cx="12" cy="12" r="10" {...strokeProps} />
            <ellipse cx="12" cy="12" rx="4" ry="10" {...strokeProps} className={accentStroke} />
            <path d="M2 12h20" {...strokeProps} />
          </motion.svg>
        );
      case "aichip":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { opacity: [1, 0.6, 1] } : {}}>
            <rect x="6" y="6" width="12" height="12" rx="2" {...strokeProps} />
            <path d="M12 9v6M9 12h6" {...strokeProps} className={accentStroke} />
            <path d="M6 3v3M18 3v3M6 18v3M18 18v3M3 6h3M18 6h3M3 18h3M18 18h3M3 12h3M18 12h3M12 3v3M12 18v3" {...strokeProps} />
          </motion.svg>
        );
      case "star":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { opacity: [1, 0.2, 1] } : {}}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" {...strokeProps} />
          </motion.svg>
        );
      case "sparkle":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { scale: [1, 1.2, 1], opacity: [1, 0.5, 1] } : {}}>
            <path d="M12 2c0 5 3 8 8 8-5 0-8 3-8 8 0-5-3-8-8-8 5 0 8-3 8-8z" {...strokeProps} className={accentStroke} />
          </motion.svg>
        );
      case "compass":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { rotate: [0, -10, 0] } : {}}>
            <circle cx="12" cy="12" r="10" {...strokeProps} />
            <path d="M12 4l3 8-3 8-3-8 3-8z" {...strokeProps} />
            <path d="M12 4l3 8h-6z" fill="currentColor" opacity="0.3" />
            <path d="M12 4v16" {...strokeProps} />
          </motion.svg>
        );
      case "cube":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { y: [0, -3, 0] } : {}}>
            <path d="M12 3l9 5-9 5-9-5 9-5z" {...strokeProps} />
            <path d="M21 8v8l-9 5-9-5V8" {...strokeProps} />
            <path d="M12 13v9" {...strokeProps} className={accentStroke} />
          </motion.svg>
        );
      case "cursor":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { x: [0, 3, 0], y: [0, -2, 0] } : {}}>
            <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" {...strokeProps} />
            <path d="M13.58 13.58l4.42 4.42" {...strokeProps} className={accentStroke} />
          </motion.svg>
        );
      case "play":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { scale: [1, 1.1, 1] } : {}}>
            <circle cx="12" cy="12" r="10" {...strokeProps} />
            <path d="M10 8l6 4-6 4V8z" {...strokeProps} className={accentStroke} />
          </motion.svg>
        );
      case "ribbon":
        return (
          <motion.svg width="24" height="24" viewBox="0 0 24 24" animate={isIdleAnimating ? { rotate: [0, 8, 0] } : {}}>
            <circle cx="12" cy="8" r="5" {...strokeProps} />
            <path d="M8.5 11.5L6 21l6-3 6 3-2.5-9.5" {...strokeProps} />
            <circle cx="12" cy="8" r="1.5" className={accentFill} />
          </motion.svg>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={elRef}
      className="absolute text-slate-800"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale }}
      transition={{ delay: delay, duration: 0.8, type: "spring", bounce: 0.4 }}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        x: springRepelX,
        y: springRepelY,
      }}
    >
      <motion.div
        animate={{
          x: floatX,
          y: floatY,
          rotate: floatRotate,
        }}
        transition={{
          duration: floatDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {getDoodleContent()}
      </motion.div>
    </motion.div>
  );
}
