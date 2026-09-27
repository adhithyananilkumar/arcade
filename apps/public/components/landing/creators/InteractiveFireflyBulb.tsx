"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Interactive Firefly Bulb Illustration
 *
 * Faithfully recreates the vintage handcrafted poster illustration:
 * - Teal / Turquoise canvas with subtle grain and vignette
 * - Hand-drawn organic bulb silhouette with white rim highlights and halftone print dots
 * - Heavy vintage dark-ribbed screw cap at the top
 * - Thin vertical hanging wire inside
 * - Illustrated cute firefly / bug sitting & floating inside
 * - Warm radiant glowing yellow-lime light source at the lower-left abdomen with layered atmospheric caustics
 * - Organic parallax to mouse movement, breathing glow, subtle flicker, and floating swing physics
 */
export default function InteractiveFireflyBulb() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse parallax motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for organic, non-mechanical motion
  const springConfig = { damping: 25, stiffness: 80, mass: 0.8 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax transforms for various depth layers
  const characterX = useTransform(smoothX, [-1, 1], [-14, 14]);
  const characterY = useTransform(smoothY, [-1, 1], [-10, 10]);
  const characterRotate = useTransform(smoothX, [-1, 1], [-3.5, 3.5]);

  const lightX = useTransform(smoothX, [-1, 1], [-20, 20]);
  const lightY = useTransform(smoothY, [-1, 1], [-14, 14]);

  const bulbRotate = useTransform(smoothX, [-1, 1], [-1.2, 1.2]);
  const bulbX = useTransform(smoothX, [-1, 1], [-4, 4]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0 to 1
    const y = (e.clientY - rect.top) / rect.height; // 0 to 1
    mouseX.set((x - 0.5) * 2); // -1 to 1
    mouseY.set((y - 0.5) * 2); // -1 to 1
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden select-none"
      style={{
        // Teal / Turquoise background matching the reference image palette
        backgroundColor: "#0F8B88",
        backgroundImage: `
          radial-gradient(circle at 48% 60%, rgba(20, 168, 160, 0.95) 0%, rgba(15, 139, 136, 0.98) 45%, #0a6b68 85%, #075250 100%)
        `,
      }}
    >
      {/* ── Background Film Grain / Noise Overlay ────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-25 mix-blend-overlay z-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="bg-grain-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#bg-grain-noise)" />
      </svg>

      {/* ── Deep Background Ambient Light Spill from Bulb ────────────────── */}
      <motion.div
        style={{
          x: lightX,
          y: lightY,
        }}
        className="absolute w-[500px] h-[500px] sm:w-[650px] sm:h-[650px] rounded-full pointer-events-none z-0"
      >
        <motion.div
          animate={{
            scale: [1, 1.08, 0.97, 1.04, 1],
            opacity: [0.35, 0.45, 0.38, 0.48, 0.35],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-full h-full rounded-full"
          style={{
            background:
              "radial-gradient(circle at 40% 65%, rgba(210, 255, 90, 0.35) 0%, rgba(130, 230, 160, 0.2) 35%, rgba(15, 139, 136, 0) 70%)",
            filter: "blur(60px)",
          }}
        />
      </motion.div>

      {/* ── Main Illustration Container (55-65vh on Desktop, Scaled on Mobile) ── */}
      <motion.div
        style={{
          rotate: bulbRotate,
          x: bulbX,
        }}
        className="relative z-10 w-[90vw] max-w-[460px] h-[75vh] max-h-[700px] sm:h-[68vh] flex items-center justify-center"
      >
        <svg
          viewBox="0 0 500 700"
          className="w-full h-full overflow-visible drop-shadow-[0_25px_50px_rgba(0,35,35,0.45)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 1. Fine Halftone Dotted Texture visible inside the glass */}
            <pattern
              id="vintage-halftone-pattern"
              x="0"
              y="0"
              width="6.5"
              height="6.5"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="3.25" cy="3.25" r="1.15" fill="#ffffff" fillOpacity="0.45" />
            </pattern>

            {/* Finer darker stipple / shading for the top of the bulb */}
            <pattern
              id="dark-stipple-pattern"
              x="0"
              y="0"
              width="5"
              height="5"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2.5" cy="2.5" r="0.8" fill="#063836" fillOpacity="0.35" />
            </pattern>

            {/* 2. Glass Body Inner Glow Gradient */}
            <radialGradient
              id="glass-inner-radial"
              cx="210"
              cy="480"
              r="220"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#E9FFA6" stopOpacity="0.85" />
              <stop offset="28%" stopColor="#7EE787" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#109B96" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0D7D7A" stopOpacity="0.1" />
            </radialGradient>

            {/* 3. Intense Core Light Radial Gradient (Lower-Left) */}
            <radialGradient
              id="firefly-core-light"
              cx="195"
              cy="510"
              r="130"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="20%" stopColor="#FFFFCC" stopOpacity="0.95" />
              <stop offset="42%" stopColor="#E6F96A" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#87E58C" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0F8B88" stopOpacity="0" />
            </radialGradient>

            {/* 4. Layered Outer Soft Glow Orbs */}
            <radialGradient
              id="glow-orb-soft"
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor="#F5FF9E" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#87E58C" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#109B96" stopOpacity="0" />
            </radialGradient>

            {/* 5. Screw Cap Charcoal / Ink Texture Linear Gradient */}
            <linearGradient id="screw-cap-texture" x1="180" y1="90" x2="320" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0B1313" />
              <stop offset="15%" stopColor="#1C2D2B" />
              <stop offset="35%" stopColor="#091514" />
              <stop offset="65%" stopColor="#182A28" />
              <stop offset="85%" stopColor="#0D1A19" />
              <stop offset="100%" stopColor="#060C0C" />
            </linearGradient>

            {/* 6. Filter for slight organic hand-drawn stroke wobble */}
            <filter id="hand-drawn-wobble" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.04"
                numOctaves="2"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="1.8"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>

            {/* 7. Glass Specular Highlight Gradient */}
            <linearGradient id="specular-white-rim" x1="110" y1="360" x2="390" y2="580" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* LAYER 1: BULB INTERIOR BACKGROUND & HALFTONE TEXTURE        */}
          {/* ──────────────────────────────────────────────────────────── */}

          {/* Clip path defining the organic interior bulb shape */}
          <clipPath id="bulb-interior-clip">
            <path
              d="M 185 242
                 C 185 300, 122 368, 122 470
                 C 122 575, 178 630, 250 630
                 C 322 630, 378 575, 378 470
                 C 378 368, 315 300, 315 242
                 Z"
            />
          </clipPath>

          {/* Bulb interior fill with dark teal & translucent depth */}
          <path
            d="M 185 242
               C 185 300, 122 368, 122 470
               C 122 575, 178 630, 250 630
               C 322 630, 378 575, 378 470
               C 378 368, 315 300, 315 242
               Z"
            fill="#0D7F7C"
            fillOpacity="0.55"
          />

          {/* Group clipped inside the bulb */}
          <g clipPath="url(#bulb-interior-clip)">
            {/* Fine halftone pattern overlay filling entire glass chamber */}
            <rect
              x="100"
              y="200"
              width="300"
              height="450"
              fill="url(#vintage-halftone-pattern)"
              opacity="0.9"
            />

            {/* Darker subtle stipple along the top & right curvature for depth */}
            <rect
              x="100"
              y="200"
              width="300"
              height="450"
              fill="url(#dark-stipple-pattern)"
              opacity="0.4"
            />

            {/* Internal ambient glowing base */}
            <rect
              x="100"
              y="200"
              width="300"
              height="450"
              fill="url(#glass-inner-radial)"
              style={{ mixBlendMode: "screen" }}
            />
          </g>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* LAYER 2: MULTIPLE RADIAL GLOW LAYERS (LOWER-LEFT ACCENT)    */}
          {/* ──────────────────────────────────────────────────────────── */}

          {/* Soft outer aura circles overlapping towards lower left */}
          <g className="pointer-events-none" style={{ mixBlendMode: "screen" }}>
            {/* Ambient halo 1 (Lowest Left) */}
            <motion.circle
              animate={{
                scale: [1, 1.06, 0.96, 1.03, 1],
                opacity: [0.45, 0.6, 0.48, 0.65, 0.45],
              }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
              cx="160"
              cy="580"
              r="85"
              fill="url(#glow-orb-soft)"
            />

            {/* Ambient halo 2 (Middle Left) */}
            <motion.circle
              animate={{
                scale: [1, 1.09, 0.98, 1.05, 1],
                opacity: [0.55, 0.72, 0.52, 0.75, 0.55],
              }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              cx="175"
              cy="530"
              r="95"
              fill="url(#glow-orb-soft)"
            />

            {/* Primary soft radiant sphere */}
            <motion.circle
              animate={{
                scale: [1, 1.05, 0.98, 1.03, 1],
                opacity: [0.85, 0.98, 0.88, 1, 0.85],
              }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              cx="195"
              cy="510"
              r="90"
              fill="url(#firefly-core-light)"
            />

            {/* Intense white-hot central core hotspot */}
            <motion.ellipse
              animate={{
                rx: [22, 25, 21, 26, 22],
                ry: [20, 23, 19, 24, 20],
                opacity: [0.95, 1, 0.9, 1, 0.95],
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              cx="192"
              cy="512"
              rx="23"
              ry="21"
              fill="#FFFFFF"
              filter="drop-shadow(0 0 16px #FFFF88)"
            />
          </g>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* LAYER 3: HANGING WIRE & SWINGING FIREFLY CHARACTER          */}
          {/* ──────────────────────────────────────────────────────────── */}
          <g>
            {/* Top suspension wires anchored inside top socket */}
            <motion.g
              style={{
                x: characterX,
                y: characterY,
                rotate: characterRotate,
                transformOrigin: "250px 242px",
              }}
            >
              {/* Left hanging wire */}
              <path
                d="M 205 242 L 205 450 L 195 500"
                stroke="#FFFFFF"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeOpacity="0.85"
              />

              {/* Right hanging wire */}
              <path
                d="M 295 242 L 295 450 L 265 520"
                stroke="#FFFFFF"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeOpacity="0.85"
              />

              {/* ── Cute Hand-Drawn Firefly / Bug Character ────────── */}
              <g id="firefly-character" transform="translate(235, 435)">
                {/* Translucent Gossamer Wings (Spanning out to sides) */}
                <g opacity="0.88">
                  {/* Left Wing */}
                  <ellipse
                    cx="-32"
                    cy="8"
                    rx="28"
                    ry="15"
                    transform="rotate(-22 -32 8)"
                    fill="#FFFFFF"
                    fillOpacity="0.75"
                    stroke="#0A3F3D"
                    strokeWidth="1.4"
                  />
                  {/* Left wing texture veining */}
                  <path
                    d="M -50 4 Q -32 8 -12 12"
                    stroke="#A3F0E8"
                    strokeWidth="1"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.8"
                  />

                  {/* Right Wing */}
                  <ellipse
                    cx="32"
                    cy="8"
                    rx="28"
                    ry="15"
                    transform="rotate(22 32 8)"
                    fill="#FFFFFF"
                    fillOpacity="0.75"
                    stroke="#0A3F3D"
                    strokeWidth="1.4"
                  />
                  {/* Right wing texture veining */}
                  <path
                    d="M 50 4 Q 32 8 12 12"
                    stroke="#A3F0E8"
                    strokeWidth="1"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.8"
                  />
                </g>

                {/* Glowing Lower Abdomen (Sitting near the core light) */}
                <ellipse
                  cx="-14"
                  cy="42"
                  rx="26"
                  ry="24"
                  fill="#D8F946"
                  stroke="#0A3F3D"
                  strokeWidth="2.2"
                />

                {/* Firefly Body Stripes */}
                <path
                  d="M -34 36 Q -14 44 6 36"
                  stroke="#163836"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M -30 46 Q -14 54 2 46"
                  stroke="#163836"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Character Head / Upper Thorax (Dark Olive-Charcoal) */}
                <ellipse
                  cx="-4"
                  cy="12"
                  rx="18"
                  ry="17"
                  fill="#1C3836"
                  stroke="#081E1D"
                  strokeWidth="2"
                />

                {/* Cute Big Cartoon Eyes */}
                {/* Left Eye */}
                <circle cx="-10" cy="10" r="4.2" fill="#8CE855" />
                <circle cx="-10" cy="10" r="2.2" fill="#0A2220" />
                <circle cx="-11" cy="9" r="1.1" fill="#FFFFFF" />

                {/* Right Eye */}
                <circle cx="2" cy="10" r="4.2" fill="#8CE855" />
                <circle cx="2" cy="10" r="2.2" fill="#0A2220" />
                <circle cx="1" cy="9" r="1.1" fill="#FFFFFF" />

                {/* Happy Smile */}
                <path
                  d="M -8 18 Q -4 22 0 18"
                  stroke="#FFFFFF"
                  strokeWidth="1.4"
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Antennae */}
                <path
                  d="M -9 -2 Q -18 -18 -26 -14"
                  stroke="#0A2220"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle cx="-26" cy="-14" r="2.8" fill="#1C3836" />

                <path
                  d="M 1 -2 Q 10 -18 18 -14"
                  stroke="#0A2220"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle cx="18" cy="-14" r="2.8" fill="#1C3836" />

                {/* Little Hands Gripping the Hanging Wires */}
                {/* Left hand gripping left wire */}
                <path
                  d="M -22 18 Q -30 20 -30 35"
                  stroke="#1C3836"
                  strokeWidth="2.4"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle cx="-30" cy="35" r="3.2" fill="#8CE855" stroke="#1C3836" strokeWidth="1.5" />

                {/* Right hand gripping right wire */}
                <path
                  d="M 14 18 Q 28 22 30 42"
                  stroke="#1C3836"
                  strokeWidth="2.4"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle cx="30" cy="42" r="3.2" fill="#8CE855" stroke="#1C3836" strokeWidth="1.5" />

                {/* Tiny Dangler Legs */}
                <path
                  d="M -20 62 L -20 72"
                  stroke="#0A2220"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M -6 64 L -6 74"
                  stroke="#0A2220"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </g>
            </motion.g>
          </g>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* LAYER 4: GLASS BULB OUTLINE & SPECULAR HIGHLIGHTS           */}
          {/* ──────────────────────────────────────────────────────────── */}

          {/* Thick Solid White Hand-Drawn Bulb Outline (Matching reference) */}
          <path
            d="M 185 242
               C 185 300, 122 368, 122 470
               C 122 575, 178 630, 250 630
               C 322 630, 378 575, 378 470
               C 378 368, 315 300, 315 242"
            stroke="url(#specular-white-rim)"
            strokeWidth="5.5"
            strokeLinecap="round"
            fill="none"
            filter="url(#hand-drawn-wobble)"
          />

          {/* Inner Secondary Rim Highlight (Left side caustic sheen) */}
          <path
            d="M 129 450
               C 129 550, 175 620, 250 620
               C 300 620, 350 580, 370 510"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.75"
            fill="none"
          />

          {/* Specular Glare Arc on Upper-Right Shoulder */}
          <path
            d="M 345 350 C 365 395, 372 440, 372 475"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeOpacity="0.85"
            fill="none"
          />

          {/* Specular Glare on Upper-Left Neck */}
          <path
            d="M 188 255 C 188 280, 168 315, 148 350"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeOpacity="0.85"
            fill="none"
          />

          {/* ──────────────────────────────────────────────────────────── */}
          {/* LAYER 5: THICK DARK RIBBED BLACK SCREW CAP AT THE TOP       */}
          {/* ──────────────────────────────────────────────────────────── */}
          <g id="screw-cap" filter="drop-shadow(0 8px 14px rgba(0,0,0,0.5))">
            {/* Top rounded finial nipple */}
            <path
              d="M 215 92 C 215 80, 285 80, 285 92 Z"
              fill="#060C0C"
              stroke="#1C2D2B"
              strokeWidth="1.2"
            />

            {/* Screw Rib 1 (Top) */}
            <path
              d="M 182 92 L 318 92 C 324 92, 328 98, 328 106 C 328 114, 324 120, 318 120 L 182 120 C 176 120, 172 114, 172 106 C 172 98, 176 92, 182 92 Z"
              fill="url(#screw-cap-texture)"
              stroke="#040808"
              strokeWidth="1.5"
            />
            {/* Rib 1 Charcoal Chalk Highlight */}
            <path
              d="M 185 98 C 220 95, 280 95, 315 98"
              stroke="#405C59"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />

            {/* Screw Rib 2 */}
            <path
              d="M 180 120 L 320 120 C 326 120, 330 126, 330 134 C 330 142, 326 148, 320 148 L 180 148 C 174 148, 170 142, 170 134 C 170 126, 174 120, 180 120 Z"
              fill="url(#screw-cap-texture)"
              stroke="#040808"
              strokeWidth="1.5"
            />
            {/* Rib 2 Highlight */}
            <path
              d="M 184 126 C 220 123, 280 123, 316 126"
              stroke="#405C59"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />

            {/* Screw Rib 3 */}
            <path
              d="M 180 148 L 320 148 C 326 148, 330 154, 330 162 C 330 170, 326 176, 320 176 L 180 176 C 174 176, 170 170, 170 162 C 170 154, 174 148, 180 148 Z"
              fill="url(#screw-cap-texture)"
              stroke="#040808"
              strokeWidth="1.5"
            />
            {/* Rib 3 Highlight */}
            <path
              d="M 184 154 C 220 151, 280 151, 316 154"
              stroke="#405C59"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />

            {/* Screw Rib 4 (Bottom Base Ring) */}
            <path
              d="M 178 176 L 322 176 C 328 176, 332 184, 332 196 C 332 208, 328 216, 322 216 L 178 216 C 172 216, 168 208, 168 196 C 168 184, 172 176, 178 176 Z"
              fill="url(#screw-cap-texture)"
              stroke="#040808"
              strokeWidth="1.5"
            />
            {/* Rib 4 Highlight */}
            <path
              d="M 182 184 C 220 180, 280 180, 318 184"
              stroke="#405C59"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
              opacity="0.65"
            />

            {/* Lower socket collar that meets the glass */}
            <path
              d="M 185 216 L 315 216 L 315 242 L 185 242 Z"
              fill="#081010"
              stroke="#040808"
              strokeWidth="1.5"
            />

            {/* Subtle stipple / texture over the screw cap to give handcrafted look */}
            <rect
              x="165"
              y="90"
              width="170"
              height="155"
              fill="url(#dark-stipple-pattern)"
              opacity="0.5"
              className="pointer-events-none"
            />
          </g>
        </svg>
      </motion.div>
    </div>
  );
}
