"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, MotionValue } from "framer-motion";

// Each connecting segment is its own SVG path (node1→2, node2→3, node3→4)
const SEGMENTS = [
  "M 25 12.5 C 25 25, 75 25, 75 37.5",
  "M 75 37.5 C 75 50, 25 50, 25 62.5",
  "M 25 62.5 C 25 75, 75 75, 75 87.5",
];

// Each segment takes 3s, staggered so the light travels continuously node-to-node
const SEG_DURATION = 3;   // seconds per segment
const TOTAL_DURATION = SEG_DURATION * SEGMENTS.length; // 9s total cycle

function SegmentOrb({
  d,
  segIndex,
}: {
  d: string;
  segIndex: number;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  // Each orb cycles on the full TOTAL_DURATION loop,
  // but is only "active" during its own window.
  // We encode this as: progress 0→1 over TOTAL_DURATION,
  // the orb lives in [segIndex/3 … (segIndex+1)/3].
  const progress = useMotionValue(0);

  useEffect(() => {
    const animate = async () => {
      const { animate: fm } = await import("framer-motion");
      fm(progress, [0, 1], {
        duration: TOTAL_DURATION,
        ease: "linear",
        repeat: Infinity,
      });
    };
    animate();
  }, [progress]);

  const segStart = segIndex / 3;
  const segEnd = (segIndex + 1) / 3;

  // Local t: 0 → 1 only while progress is inside this segment's window
  const localT = useTransform(progress, (p) => {
    if (p < segStart || p > segEnd) return -1; // outside window → hide
    return (p - segStart) / (segEnd - segStart);
  });

  const cx = useTransform(localT, (t) => {
    if (t < 0 || !pathRef.current || pathLength === 0) return -999;
    return pathRef.current.getPointAtLength(t * pathLength).x;
  });

  const cy = useTransform(localT, (t) => {
    if (t < 0 || !pathRef.current || pathLength === 0) return -999;
    return pathRef.current.getPointAtLength(t * pathLength).y;
  });

  const orbOpacity = useTransform(localT, (t) => {
    if (t < 0) return 0;
    // Fade in at start, fade out at end for smooth hand-off
    if (t < 0.08) return t / 0.08;
    if (t > 0.92) return (1 - t) / 0.08;
    return 1;
  });

  return (
    <>
      {/* Hidden measurement path */}
      <path ref={pathRef} d={d} fill="none" stroke="none" />

      {/* Trail glow */}
      {pathLength > 0 && (
        <motion.circle
          cx={cx}
          cy={cy}
          r="2.6"
          fill="rgba(253,224,71,0.25)"
          filter="url(#glow-soft)"
          style={{ opacity: orbOpacity }}
        />
      )}

      {/* Core orb */}
      {pathLength > 0 && (
        <motion.circle
          cx={cx}
          cy={cy}
          r="1.6"
          fill="rgba(250,204,21,0.85)"
          filter="url(#glow-hard)"
          style={{ opacity: orbOpacity }}
        />
      )}
    </>
  );
}

export default function AnimatedTimeline({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none hidden md:block">
      <svg
        className="w-full h-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Soft outer bloom — completely blurred, no hard core */}
          <filter id="glow-soft" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
          {/* Medium glow for the orb itself */}
          <filter id="glow-hard" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
        </defs>

        {/* ── Base pipe segments (idle, breathing) ── */}
        {SEGMENTS.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke="#DDE5F0"
            strokeWidth="0.35"
            strokeLinecap="round"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: [0.8, 0.96, 0.8] }}
            transition={{
              duration: 8,
              delay: i * 0.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* ── Animated orbs — one per segment, staggered ── */}
        {SEGMENTS.map((d, i) => (
          <SegmentOrb key={i} d={d} segIndex={i} />
        ))}
      </svg>
    </div>
  );
}
