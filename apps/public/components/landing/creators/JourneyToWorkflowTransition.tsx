"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * JourneyToWorkflowTransition
 *
 * Zero-height, pointer-events-none passthrough.
 * Large overflow-visible blobs with parallax overlap both the
 * preceding CreatorJourney and the following CreatorEverythingInOnePlace
 * sections so there is no visible boundary between them.
 *
 * No SVG line, no divider, no separator — just shared ambient light.
 */
export default function JourneyToWorkflowTransition() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Slow parallax — blobs drift gently as user scrolls through the zone
  const y1 = useTransform(scrollYProgress, [0, 1], [-80, 80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y3 = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative w-full pointer-events-none"
      // Zero height — this element takes up no layout space.
      // Blobs extend via overflow:visible into the sections above and below.
      style={{ height: 0, overflow: "visible", zIndex: 5 }}
    >
      {/*
       * Blob 1 — large lavender centred, bleeds ~325px up into Journey
       * and ~325px down into EverythingInOnePlace
       */}
      <motion.div
        style={{ y: y1, position: "absolute", left: "50%", x: "-50%" }}
        aria-hidden="true"
      >
        <div
          style={{
            width: 800,
            height: 650,
            marginTop: -325,
            background:
              "radial-gradient(ellipse, rgba(122,90,248,0.16) 0%, rgba(122,90,248,0.05) 50%, transparent 75%)",
            borderRadius: "50%",
            filter: "blur(90px)",
          }}
        />
      </motion.div>

      {/*
       * Blob 2 — indigo-blue, offset left, slower drift
       */}
      <motion.div
        style={{ y: y2, position: "absolute", left: "2vw" }}
        aria-hidden="true"
      >
        <div
          style={{
            width: 620,
            height: 560,
            marginTop: -280,
            background:
              "radial-gradient(ellipse, rgba(36,81,214,0.13) 0%, rgba(36,81,214,0.04) 52%, transparent 72%)",
            borderRadius: "50%",
            filter: "blur(95px)",
          }}
        />
      </motion.div>

      {/*
       * Blob 3 — cyan-mint, offset right, opposite drift
       */}
      <motion.div
        style={{ y: y3, position: "absolute", right: "-2vw" }}
        aria-hidden="true"
      >
        <div
          style={{
            width: 580,
            height: 520,
            marginTop: -260,
            background:
              "radial-gradient(ellipse, rgba(32,184,207,0.12) 0%, rgba(32,184,207,0.035) 50%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(90px)",
          }}
        />
      </motion.div>
    </div>
  );
}
