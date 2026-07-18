"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Slow-drifting aurora using the landing-page radial palette.
 * Transform/opacity only — no layout thrash.
 * Renders a static layer on SSR/first paint to avoid hydration mismatch.
 */
export default function AuroraBackground() {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const animate = mounted && prefersReduced !== true;

  if (!animate) {
    return <div className="about-aurora about-aurora--static" aria-hidden="true" />;
  }

  return (
    <div className="about-aurora" aria-hidden="true">
      <motion.span
        className="about-aurora__blob about-aurora__blob--blue"
        animate={{
          x: ["0%", "8%", "-4%", "0%"],
          y: ["0%", "-6%", "5%", "0%"],
          scale: [1, 1.08, 0.96, 1],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="about-aurora__blob about-aurora__blob--emerald"
        animate={{
          x: ["0%", "-10%", "6%", "0%"],
          y: ["0%", "8%", "-4%", "0%"],
          scale: [1, 0.94, 1.1, 1],
        }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.span
        className="about-aurora__blob about-aurora__blob--violet"
        animate={{
          x: ["0%", "5%", "-8%", "0%"],
          y: ["0%", "-5%", "7%", "0%"],
          scale: [1, 1.06, 0.92, 1],
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <motion.span
        className="about-aurora__blob about-aurora__blob--sky"
        animate={{
          x: ["0%", "-6%", "9%", "0%"],
          y: ["0%", "4%", "-8%", "0%"],
        }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
}
