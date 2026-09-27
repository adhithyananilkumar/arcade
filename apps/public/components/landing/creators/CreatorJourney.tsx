"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import BorderGlow from "@/apps/public/components/landing/BorderGlow";

export default function CreatorJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeMilestone, setActiveMilestone] = useState<number>(-1);

  // Progress line visual: keeps spring smoothing for a fluid feel
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 28,
    restDelta: 0.001,
  });

  // Line completes at p=0.55 so the visual reaches node 4 (at 87.5% of track)
  // while the section is still well within the viewport.
  const progressLineWidth = useTransform(smoothProgress, [0.20, 0.55], ["0%", "100%"], { clamp: true });

  // MILESTONE STATE: use a native scroll listener on getBoundingClientRect() so
  // threshold detection is based on real DOM position — no Framer Motion
  // internals, no spring lag, works regardless of section height or viewport.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const vh   = window.innerHeight;

      // Mirrors ["start end", "end start"]: 0 when section top = viewport bottom,
      // 1 when section bottom = viewport top.
      const p = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));

      // Thresholds calibrated against line mapping [0.20, 0.55]:
      //   Node 1 (line 12.5%) → p ≈ 0.24   section fully visible ✓
      //   Node 2 (line 37.5%) → p ≈ 0.34   section fully visible ✓
      //   Node 3 (line 62.5%) → p ≈ 0.43   section fully visible ✓
      //   Node 4 (line 87.5%) → p ≈ 0.50   section fully visible ✓ (fires at 50% scroll)
      if      (p < 0.22) setActiveMilestone(-1);
      else if (p < 0.32) setActiveMilestone(0);
      else if (p < 0.42) setActiveMilestone(1);
      else if (p < 0.50) setActiveMilestone(2);
      else               setActiveMilestone(3);
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update(); // evaluate on mount

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const journeySteps = [
    {
      num: "01",
      title: "Verify identity",
      desc: "Complete a secure KYC identity check in minutes.",
    },
    {
      num: "02",
      title: "Build course",
      desc: "Construct lessons, upload videos, and set playground terminals.",
    },
    {
      num: "03",
      title: "Content review",
      desc: "QA check validates lesson structure within 24 hours.",
    },
    {
      num: "04",
      title: "Track & optimize",
      desc: "Go live globally and monitor enrollment metrics.",
    },
  ];

  return (
    <section ref={sectionRef} className="milestone-sec" id="path">
      <div className="wrap max-w-6xl mx-auto">
        <div className="sec-head">
          <span className="eyebrow">How it works</span>
          <h2>Your path from idea to published course</h2>
          <p>Four simple stages take you from verification to a growing catalog of global learning experiences.</p>
        </div>

        <div ref={trackRef} className="milestones-track">
          {/* Dashed connector line between hanging mounts */}
          <div className="milestones-line">
            <motion.div
              className="milestones-line-active"
              style={{
                width: progressLineWidth,
                background: "linear-gradient(90deg, #2563EB 0%, #7C3AED 33%, #D97706 66%, #059669 100%)",
              }}
            />
          </div>

          {journeySteps.map((step, idx) => {
            // isLit: true for every bulb the progress line has reached or passed
            const isLit = idx <= activeMilestone;
            // isActive: the most recently lit bulb (for extra glow/scale emphasis)
            const isActive = idx === activeMilestone;
            // isCompleted: lit but no longer the newest active one
            const isCompleted = idx < activeMilestone;
            const nodeColors = ["#2563EB", "#7C3AED", "#D97706", "#059669"];
            const signatureColor = nodeColors[idx];

            return (
              <div
                key={idx}
                className={`milestone-item flex flex-col items-center select-none ${isActive ? "active" : ""}`}
                style={{ cursor: "default", width: "24.5%" }}
              >
                {/* Top Ceiling Fixture Node */}
                <motion.div
                  animate={{
                    backgroundColor: isLit
                      ? signatureColor
                      : "#ffffff",
                    borderColor: isLit
                      ? signatureColor
                      : "#e2e8f0",
                    color: isLit ? "#ffffff" : "#94a3b8",
                    scale: isActive ? 1.08 : 1,
                    boxShadow: isActive
                      ? `0 0 0 4px #ffffff, 0 8px 24px ${signatureColor}45`
                      : isCompleted
                        ? `0 0 0 4px #ffffff, 0 4px 14px ${signatureColor}25`
                        : "0 0 0 4px #ffffff, 0 2px 6px rgba(0,0,0,0.04)"
                  }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="milestone-node relative z-20 flex items-center justify-center font-bold text-xs"
                >
                  <motion.div
                    key={isLit ? "check" : "num"}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {isLit ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <span>{step.num}</span>
                    )}
                  </motion.div>
                </motion.div>

                {/* Braided Vintage Suspension Cord */}
                <div className="w-[2px] h-3.5 bg-gradient-to-b from-zinc-700 via-zinc-900 to-zinc-800 dark:from-zinc-400 dark:to-zinc-600 relative z-10 shadow-sm" />

                {/* Realistic Physical Glass Lightbulb Container */}
                <motion.div
                  animate={{
                    y: isActive ? 0 : 3,
                    opacity: isLit ? 1 : 0.85,
                  }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="relative w-full max-w-[275px] flex flex-col items-center z-10"
                >
                  <div className="relative w-full aspect-[260/300] flex items-center justify-center">
                    <svg
                      viewBox="0 0 260 300"
                      className="w-full h-full overflow-visible drop-shadow-xl"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        {/* 1. Halftone Dot Pattern inside the glass matching reference */}
                        <pattern
                          id={`vintage-halftone-${idx}`}
                          x="0"
                          y="0"
                          width="5.5"
                          height="5.5"
                          patternUnits="userSpaceOnUse"
                        >
                          <circle cx="2.75" cy="2.75" r="1" fill="#0d9488" fillOpacity={isLit ? "0.38" : "0.15"} />
                        </pattern>

                        {/* 2. Vintage Screw Cap Charcoal / Ink Gradient */}
                        <linearGradient id={`screw-cap-ink-${idx}`} x1="95" y1="0" x2="165" y2="0" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#0a0f0f" />
                          <stop offset="20%" stopColor="#1e2928" />
                          <stop offset="50%" stopColor="#0f1717" />
                          <stop offset="80%" stopColor="#253836" />
                          <stop offset="100%" stopColor="#070c0c" />
                        </linearGradient>

                        {/* 3. Intense Lower-Left Firefly Glow Gradient (Centered on the Firefly) */}
                        <radialGradient id={`firefly-radiant-${idx}`} cx="118" cy="154" r="50" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                          <stop offset="25%" stopColor="#fef08a" stopOpacity="1" />
                          <stop offset="55%" stopColor="#bef264" stopOpacity="0.8" />
                          <stop offset="80%" stopColor="#2dd4bf" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
                        </radialGradient>

                        {/* 4. Ambient Halo Atmosphere */}
                        <radialGradient id={`halo-soft-${idx}`} cx="118" cy="154" r="85" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#fde047" stopOpacity="0.45" />
                          <stop offset="50%" stopColor={signatureColor} stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                        </radialGradient>

                        {/* 5. Glass Wall Specular Reflection */}
                        <linearGradient id={`glass-wall-specular-${idx}`} x1="20" y1="120" x2="240" y2="270" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.55" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
                        </linearGradient>

                        {/* 6. Gossamer Iridescent Wing Gradient */}
                        <linearGradient id="firefly-wing-shimmer" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                          <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.85" />
                          <stop offset="100%" stopColor="#ccfbf1" stopOpacity="0.9" />
                        </linearGradient>

                        {/* 7. Front Glass Volumetric Highlight */}
                        <radialGradient id="front-glass-gloss" cx="35%" cy="30%" r="65%">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
                          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.08" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                        </radialGradient>

                        {/* Clip Path for Wide Inner Glass Chamber */}
                        <clipPath id={`bulb-clip-${idx}`}>
                          <path
                            d="M 102 64
                               C 102 110, 22 136, 22 192
                               C 22 256, 68 290, 130 290
                               C 192 290, 238 256, 238 192
                               C 238 136, 158 110, 158 64
                               Z"
                          />
                        </clipPath>
                      </defs>

                      {/* --- Ambient Volumetric Soft Halo centered on Firefly (Shines whenever reached or passed) --- */}
                      <motion.circle
                        cx="118"
                        cy="154"
                        r="75"
                        fill={`url(#halo-soft-${idx})`}
                        animate={{
                          opacity: isLit ? (isActive ? 1 : 0.85) : 0,
                          scale: isLit ? 1 : 0.7,
                        }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="blur-lg pointer-events-none"
                      />

                      {/* --- Wide Glass Interior Fill & Halftone Grid --- */}
                      <path
                        d="M 102 64
                           C 102 110, 22 136, 22 192
                           C 22 256, 68 290, 130 290
                           C 192 290, 238 256, 238 192
                           C 238 136, 158 110, 158 64
                           Z"
                        fill="#ffffff"
                        fillOpacity={isLit ? "0.95" : "0.75"}
                      />

                      {/* Halftone Pattern Inside Bulb */}
                      <g clipPath={`url(#bulb-clip-${idx})`}>
                        <rect
                          x="15"
                          y="60"
                          width="230"
                          height="240"
                          fill={`url(#vintage-halftone-${idx})`}
                        />
                        {/* Soft tint over halftone */}
                        <rect
                          x="15"
                          y="60"
                          width="230"
                          height="240"
                          fill="#14b8a6"
                          fillOpacity={isLit ? "0.08" : "0.02"}
                        />
                      </g>

                      {/* --- Hanging Wires inside Bulb --- */}
                      <line x1="110" y1="64" x2="104" y2="152" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.9" />
                      <line x1="110" y1="64" x2="104" y2="152" stroke="#134e4a" strokeWidth="0.9" strokeLinecap="round" strokeOpacity="0.6" />
                      <line x1="150" y1="64" x2="146" y2="155" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.9" />
                      <line x1="150" y1="64" x2="146" y2="155" stroke="#134e4a" strokeWidth="0.9" strokeLinecap="round" strokeOpacity="0.6" />

                      {/* Trapeze Wire Bar */}
                      <line x1="98" y1="152" x2="152" y2="155" stroke="#134e4a" strokeWidth="1.8" strokeLinecap="round" />

                      {/* --- Warm Radiant Glow emanating from the Firefly (Shines whenever reached or passed) --- */}
                      <motion.g
                        animate={{
                          opacity: isLit ? (isActive ? 1 : 0.85) : 0,
                          scale: isLit ? 1 : 0.6,
                        }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        style={{ originX: "118px", originY: "154px" }}
                      >
                        <circle
                          cx="118"
                          cy="154"
                          r="48"
                          fill={`url(#firefly-radiant-${idx})`}
                          style={{ mixBlendMode: "screen" }}
                          pointerEvents="none"
                        />
                        <ellipse
                          cx="117"
                          cy="153"
                          rx="13"
                          ry="11"
                          fill="#fef08a"
                          fillOpacity="0.95"
                          filter="drop-shadow(0 0 10px #fef08a)"
                          pointerEvents="none"
                        />
                      </motion.g>

                      {/* --- Cute Premium Illustrated Firefly Character --- */}
                      <g transform="translate(126, 138)">
                        <motion.g
                          animate={isLit ? {
                            y: [0, -3, 0],
                            rotate: [0, 1.5, 0, -1.5, 0],
                          } : {
                            y: 0,
                          }}
                          transition={{
                            duration: 3.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          {/* Gossamer Iridescent Wings (Back Wings with Veins) */}
                          <g opacity="0.95">
                          {/* Left Wing */}
                          <path
                            d="M -5 2 C -18 -8, -32 -2, -30 9 C -28 17, -14 14, -5 6 Z"
                            fill="url(#firefly-wing-shimmer)"
                            stroke="#0f172a"
                            strokeWidth="1.3"
                          />
                          <path d="M -7 4 C -18 1, -26 5, -28 9" stroke="#38bdf8" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" fill="none" />
                          <path d="M -16 2 C -20 -3, -25 -1, -26 2" stroke="#38bdf8" strokeWidth="0.7" strokeLinecap="round" opacity="0.6" fill="none" />

                          {/* Right Wing */}
                          <path
                            d="M 1 2 C 14 -8, 28 -2, 26 9 C 24 17, 10 14, 1 6 Z"
                            fill="url(#firefly-wing-shimmer)"
                            stroke="#0f172a"
                            strokeWidth="1.3"
                          />
                          <path d="M 3 4 C 14 1, 22 5, 24 9" stroke="#38bdf8" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" fill="none" />
                          <path d="M 12 2 C 16 -3, 21 -1, 22 2" stroke="#38bdf8" strokeWidth="0.7" strokeLinecap="round" opacity="0.6" fill="none" />
                        </g>

                        {/* Firefly Glowing Bulbous Abdomen */}
                        <g>
                          {/* Base abdomen: bright bioluminescent green when lit, soft unlit tone when upcoming */}
                          <motion.ellipse
                            cx="-7"
                            cy="17"
                            rx="15"
                            ry="13"
                            animate={{
                              fill: isLit ? "#bef264" : "#65a30d",
                              fillOpacity: isLit ? 1 : 0.4,
                            }}
                            transition={{ duration: 0.35 }}
                            stroke="#0f172a"
                            strokeWidth="1.6"
                          />
                          {/* Inner radiant lantern core: illuminates whenever reached or passed */}
                          <motion.g
                            animate={{
                              opacity: isLit ? 1 : 0,
                              scale: isLit ? 1 : 0.6,
                            }}
                            transition={{ duration: 0.35 }}
                            style={{ originX: "-8px", originY: "16px" }}
                          >
                            <ellipse
                              cx="-8"
                              cy="16"
                              rx="10"
                              ry="8.5"
                              fill="#fef08a"
                              opacity="0.95"
                            />
                            <circle
                              cx="-9"
                              cy="15"
                              r="5"
                              fill="#ffffff"
                              opacity="0.95"
                            />
                          </motion.g>

                          {/* Black organic body stripes */}
                          <path
                            d="M -19 13.5 C -13 17, -1 17, 5 13.5"
                            stroke="#0f172a"
                            strokeWidth="1.8"
                            fill="none"
                            strokeLinecap="round"
                          />
                          <path
                            d="M -17 19.5 C -12 23, -2 23, 3 19.5"
                            stroke="#0f172a"
                            strokeWidth="1.8"
                            fill="none"
                            strokeLinecap="round"
                          />
                        </g>

                        {/* Thorax & Head */}
                        <circle
                          cx="-2"
                          cy="1.5"
                          r="9.5"
                          fill="#0f2922"
                          stroke="#0f172a"
                          strokeWidth="1.4"
                        />

                        {/* Sweet Blushing Cheeks */}
                        <circle cx="-8.5" cy="5" r="2.2" fill="#f43f5e" opacity="0.45" />
                        <circle cx="4.5" cy="5" r="2.2" fill="#f43f5e" opacity="0.45" />

                        {/* Large Expressive Eyes */}
                        {/* Left Eye */}
                        <circle cx="-5.8" cy="0.8" r="3.2" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" />
                        <circle cx="-5.4" cy="0.8" r="2" fill="#0f172a" />
                        <circle cx="-6.2" cy="0.1" r="0.8" fill="#ffffff" />
                        <circle cx="-4.8" cy="1.6" r="0.4" fill="#ffffff" />

                        {/* Right Eye */}
                        <circle cx="1.8" cy="0.8" r="3.2" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" />
                        <circle cx="1.4" cy="0.8" r="2" fill="#0f172a" />
                        <circle cx="0.6" cy="0.1" r="0.8" fill="#ffffff" />
                        <circle cx="2.0" cy="1.6" r="0.4" fill="#ffffff" />

                        {/* Cheerful Kawaii Smile */}
                        <path
                          d="M -4 5.5 Q -2 8 0 5.5"
                          stroke="#bef264"
                          strokeWidth="1.3"
                          fill="none"
                          strokeLinecap="round"
                        />

                        {/* Curled Expressive Antennae */}
                        <path
                          d="M -5 -6 C -9 -14, -18 -18, -20 -13 C -21 -10, -17 -8, -15 -11"
                          stroke="#0f172a"
                          strokeWidth="1.4"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <circle cx="-16.5" cy="-11.5" r="2" fill="#bef264" stroke="#0f172a" strokeWidth="0.8" />

                        <path
                          d="M 1 -6 C 5 -14, 14 -18, 16 -13 C 17 -10, 13 -8, 11 -11"
                          stroke="#0f172a"
                          strokeWidth="1.4"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <circle cx="12.5" cy="-11.5" r="2" fill="#bef264" stroke="#0f172a" strokeWidth="0.8" />

                        {/* Little Cute Paws Grasping the Trapeze Wire */}
                        <path d="M -11 6 C -17 8, -22 12, -24 14" stroke="#0f172a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        <circle cx="-24" cy="14.5" r="2.2" fill="#bef264" stroke="#0f172a" strokeWidth="0.8" />

                        <path d="M 7 6 C 13 8, 18 12, 21 15" stroke="#0f172a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        <circle cx="21" cy="15.5" r="2.2" fill="#bef264" stroke="#0f172a" strokeWidth="0.8" />

                        {/* Dangling Little Legs */}
                        <path d="M -11 28 C -11 33, -13 36, -15 36" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                        <path d="M -3 29 C -3 34, -1 37, 1 37" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                      </motion.g>
                    </g>

                      {/* --- Front Glass Wall Reflections & Sheen (Encasing the firefly inside) --- */}
                      {/* 1. Curved Glass Surface Reflection across Left & Center */}
                      <path
                        d="M 52 130 C 36 165, 36 210, 56 250"
                        stroke="#ffffff"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeOpacity="0.45"
                        fill="none"
                        filter="blur(1px)"
                      />
                      <path
                        d="M 62 140 C 48 170, 48 205, 66 238"
                        stroke="#ffffff"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeOpacity="0.75"
                        fill="none"
                      />

                      {/* 2. Glass Dome Volumetric Front Gloss */}
                      <ellipse
                        cx="130"
                        cy="185"
                        rx="95"
                        ry="90"
                        fill="url(#front-glass-gloss)"
                        pointerEvents="none"
                      />

                      {/* --- Heavy White Hand-Drawn Glass Outline (Wide Contour) --- */}
                      <path
                        d="M 102 64
                           C 102 110, 22 136, 22 192
                           C 22 256, 68 290, 130 290
                           C 192 290, 238 256, 238 192
                           C 238 136, 158 110, 158 64"
                        stroke={`url(#glass-wall-specular-${idx})`}
                        strokeWidth="4.2"
                        strokeLinecap="round"
                        fill="none"
                      />

                      {/* Inner Glass Contour Highlight */}
                      <path
                        d="M 28 186
                           C 28 242, 70 282, 130 282
                           C 185 282, 230 244, 230 192"
                        stroke="#ffffff"
                        strokeWidth="1.8"
                        strokeOpacity="0.75"
                        strokeLinecap="round"
                        fill="none"
                      />

                      {/* Right Shoulder Highlight */}
                      <path
                        d="M 218 142 C 230 166, 234 192, 230 214"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeOpacity="0.8"
                        fill="none"
                      />

                      {/* --- Thick Dark Ribbed Screw Cap at Top (Matching reference) --- */}
                      <g className="vintage-screw-cap" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.45))">
                        {/* Top Cap Finial Tip */}
                        <path d="M 115 8 C 115 4, 145 4, 145 8 Z" fill="#070c0c" stroke="#1e2928" strokeWidth="0.8" />

                        {/* Screw Rib 1 */}
                        <rect x="98" y="8" width="64" height="13" rx="4" fill={`url(#screw-cap-ink-${idx})`} stroke="#000000" strokeWidth="1" />
                        <line x1="102" y1="12" x2="158" y2="12" stroke="#374151" strokeWidth="1" opacity="0.6" />

                        {/* Screw Rib 2 */}
                        <rect x="97" y="21" width="66" height="13" rx="4" fill={`url(#screw-cap-ink-${idx})`} stroke="#000000" strokeWidth="1" />
                        <line x1="101" y1="25" x2="159" y2="25" stroke="#374151" strokeWidth="1" opacity="0.6" />

                        {/* Screw Rib 3 */}
                        <rect x="97" y="34" width="66" height="13" rx="4" fill={`url(#screw-cap-ink-${idx})`} stroke="#000000" strokeWidth="1" />
                        <line x1="101" y1="38" x2="159" y2="38" stroke="#374151" strokeWidth="1" opacity="0.6" />

                        {/* Screw Rib 4 (Bottom Base Ring) */}
                        <rect x="95" y="47" width="70" height="14" rx="4" fill={`url(#screw-cap-ink-${idx})`} stroke="#000000" strokeWidth="1" />
                        <line x1="100" y1="52" x2="162" y2="52" stroke="#4b5563" strokeWidth="1.2" opacity="0.7" />

                        {/* Collar meeting the glass */}
                        <path d="M 101 61 L 159 61 L 158 65 L 102 65 Z" fill="#070c0c" stroke="#000000" strokeWidth="0.8" />
                      </g>
                    </svg>

                    {/* Step Title & Description Integrated inside Lower Glass Dome */}
                    <div className="absolute inset-x-0 bottom-6 px-4 flex flex-col items-center text-center z-20 pointer-events-none">
                      <h4
                        className={`text-[13px] font-black tracking-tight leading-tight mb-1 transition-colors duration-300 ${
                          isActive ? "text-slate-950" : "text-slate-800"
                        }`}
                      >
                        {step.title}
                      </h4>
                      <p
                        className={`text-[10.5px] leading-snug max-w-[160px] font-medium transition-colors duration-300 ${
                          isActive ? "text-slate-600" : "text-slate-500"
                        }`}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Mobile timeline cards */}
        <div className="mobile-milestones">
          {journeySteps.map((step, idx) => {
            const isCompleted = idx < activeMilestone;
            const isActive = idx === activeMilestone;
            const nodeColors = ["#6366f1", "#f59e0b", "#14b8a6", "#10b981"];
            const signatureColor = nodeColors[idx];

            return (
              <div
                key={idx}
                className="w-full flex items-center gap-3 bg-white/95 border rounded-2xl p-3.5 my-2"
                style={{
                  borderColor: isActive ? `${signatureColor}60` : "#e4e4e7",
                  boxShadow: isActive ? `0 8px 24px -4px ${signatureColor}25` : "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                {/* Lamp shape badge on mobile */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-2.5 h-1.5 bg-zinc-700 rounded-t-sm" />
                  <div
                    className="w-10 h-10 rounded-b-full rounded-t-sm flex items-center justify-center font-bold text-xs"
                    style={{
                      backgroundColor: isCompleted || isActive ? signatureColor : "#f4f4f5",
                      color: isCompleted || isActive ? "#ffffff" : "#a1a1aa",
                      boxShadow: isActive ? `0 0 12px ${signatureColor}60` : "none",
                    }}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      step.num
                    )}
                  </div>
                </div>

                <div className="text-left flex-1">
                  <h4 className={`text-sm font-bold ${isActive ? "text-zinc-950" : "text-zinc-600"}`}>{step.title}</h4>
                  <p className={`text-xs ${isActive ? "text-zinc-600" : "text-zinc-400"}`}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

