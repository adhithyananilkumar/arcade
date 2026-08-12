"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * JourneyToWorkflowTransition
 *
 * Seamless background gradient blending between CreatorJourney and CreatorEverythingInOnePlace.
 * Provides a continuous canvas feel without modifying any layout, content, or cards.
 */
export default function JourneyToWorkflowTransition() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [-40, 40]);
  const y2 = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative w-full pointer-events-none"
      style={{ height: 0, overflow: "visible", zIndex: 1 }}
    >


      {/* Ambient background light blobs */}
      <motion.div
        style={{ y: y1, position: "absolute", left: "50%", x: "-50%" }}
        aria-hidden="true"
      >
        <div
          style={{
            width: 1100,
            height: 700,
            marginTop: -350,
            background:
              "radial-gradient(ellipse 90% 70% at 50% 50%, rgba(232, 236, 251, 0.65) 0%, rgba(232, 236, 251, 0.20) 50%, transparent 85%)",
            borderRadius: "50%",
            filter: "blur(120px)",
          }}
        />
      </motion.div>

      <motion.div
        style={{ y: y2, position: "absolute", left: "5vw" }}
        aria-hidden="true"
      >
        <div
          style={{
            width: 800,
            height: 600,
            marginTop: -300,
            background:
              "radial-gradient(ellipse 85% 65% at 50% 50%, rgba(227, 249, 245, 0.60) 0%, rgba(227, 249, 245, 0.15) 50%, transparent 80%)",
            borderRadius: "50%",
            filter: "blur(120px)",
          }}
        />
      </motion.div>
    </div>
  );
}


