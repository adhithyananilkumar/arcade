"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

/**
 * Reusable Vintage Engraved Lightbulb Component
 * Retains the exact hand-drawn linework, filament, rays, and screw base
 */
function VintageEngravedBulb({
  idx,
  isLit,
  isActive,
  signatureColor,
}: {
  idx: number;
  isLit: boolean;
  isActive: boolean;
  signatureColor: string;
}) {
  // Different gentle swing durations and slight delays for each bulb for organic, realistic floating
  const swingDurations = [4.8, 5.4, 5.0, 5.6];
  const duration = swingDurations[idx % swingDurations.length];
  const delay = idx * 0.4;

  return (
    <motion.div
      animate={{
        rotate: [-3.5, 3.5, -3.5],
        x: [-3, 3, -3],
        scale: isActive ? 1.03 : 1,
        opacity: isLit ? 1 : 0.85,
      }}
      transition={{
        rotate: {
          duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        },
        x: {
          duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        },
        scale: { duration: 0.3 },
        opacity: { duration: 0.3 },
      }}
      style={{
        originX: "50%",
        originY: "8%", // Pivot swing from top screw cap where wire connects
      }}
      className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[280/300] flex items-center justify-center select-none"
    >
      <svg
        viewBox="0 0 280 300"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glow halo when lit */}
          <radialGradient
            id={`vintage-bulb-glow-${idx}`}
            cx="140"
            cy="180"
            r="110"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#fef08a" stopOpacity="0.8" />
            <stop offset="55%" stopColor="#fde047" stopOpacity="0.45" />
            <stop offset="75%" stopColor={signatureColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={signatureColor} stopOpacity="0" />
          </radialGradient>

          {/* Warm glass interior gradient when active/lit */}
          <radialGradient
            id={`bulb-glass-fill-${idx}`}
            cx="140"
            cy="185"
            r="85"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="0%"
              stopColor={isLit ? "#fffbeb" : "#ffffff"}
              stopOpacity={isLit ? 0.95 : 0.9}
            />
            <stop
              offset="70%"
              stopColor={isLit ? "#fef3c7" : "#f8fafc"}
              stopOpacity={isLit ? 0.85 : 0.75}
            />
            <stop
              offset="100%"
              stopColor={isLit ? "#fde68a" : "#f1f5f9"}
              stopOpacity={isLit ? 0.9 : 0.8}
            />
          </radialGradient>

          {/* Filter for glowing tungsten filament */}
          <filter
            id={`filament-glow-${idx}`}
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          {/* Screw cap thread ridge gradients matching each bulb's signature color */}
          <linearGradient
            id={`screw-cap-tint-${idx}`}
            x1="116"
            y1="208"
            x2="164"
            y2="257"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={isLit ? signatureColor : "#64748b"} stopOpacity="0.95" />
            <stop offset="40%" stopColor={isLit ? "#ffffff" : "#cbd5e1"} stopOpacity="0.4" />
            <stop offset="70%" stopColor={isLit ? signatureColor : "#475569"} stopOpacity="0.85" />
            <stop offset="100%" stopColor={isLit ? "#0f172a" : "#1e293b"} stopOpacity="0.95" />
          </linearGradient>

          <linearGradient
            id={`screw-tip-tint-${idx}`}
            x1="128"
            y1="257"
            x2="152"
            y2="266"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={signatureColor} />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>
        </defs>

        {/* Rotated 180° so the screw cap hangs from the cord & glass bulb radiates downward */}
        <g transform="rotate(180, 140, 150)">
          {/* --- 1. Radiating Engraved Sunburst Ray Lines --- */}
          <motion.g
            animate={{
              opacity: isLit ? (isActive ? 1 : 0.75) : 0.28,
              scale: isLit ? (isActive ? 1.02 : 1) : 0.96,
            }}
            transition={{ duration: 0.35 }}
            style={{ originX: "140px", originY: "125px" }}
            stroke="#1e293b"
            strokeLinecap="round"
          >
            {/* Outer Burst Rays */}
            <line x1="140" y1="28" x2="140" y2="4" strokeWidth="1.8" />
            <line x1="140" y1="12" x2="140" y2="18" strokeWidth="2.2" />
            <circle cx="140" cy="2" r="1.2" fill="#1e293b" />

            <line x1="158" y1="30" x2="168" y2="7" strokeWidth="1.6" />
            <line x1="172" y1="34" x2="192" y2="12" strokeWidth="2" />
            <line x1="184" y1="41" x2="212" y2="24" strokeWidth="1.5" />
            <circle cx="198" cy="18" r="1.3" fill="#1e293b" />
            <circle cx="218" cy="30" r="1.1" fill="#1e293b" />

            <line x1="122" y1="30" x2="112" y2="7" strokeWidth="1.6" />
            <line x1="108" y1="34" x2="88" y2="12" strokeWidth="2" />
            <line x1="96" y1="41" x2="68" y2="24" strokeWidth="1.5" />
            <circle cx="82" cy="18" r="1.3" fill="#1e293b" />
            <circle cx="62" cy="30" r="1.1" fill="#1e293b" />

            {/* Upper-Side Angled Burst Rays */}
            <line x1="195" y1="52" x2="230" y2="40" strokeWidth="1.8" />
            <line x1="202" y1="67" x2="244" y2="60" strokeWidth="1.5" />
            <line x1="206" y1="84" x2="252" y2="82" strokeWidth="2.1" />
            <circle cx="236" cy="53" r="1.4" fill="#1e293b" />

            <line x1="85" y1="52" x2="50" y2="40" strokeWidth="1.8" />
            <line x1="78" y1="67" x2="36" y2="60" strokeWidth="1.5" />
            <line x1="74" y1="84" x2="28" y2="82" strokeWidth="2.1" />
            <circle cx="44" cy="53" r="1.4" fill="#1e293b" />

            {/* Mid Flank Burst Rays */}
            <line x1="207" y1="104" x2="256" y2="108" strokeWidth="1.6" />
            <line x1="204" y1="124" x2="250" y2="132" strokeWidth="2" />
            <line x1="196" y1="144" x2="240" y2="157" strokeWidth="1.5" />
            <circle cx="248" cy="122" r="1.5" fill="#1e293b" />

            <line x1="73" y1="104" x2="24" y2="108" strokeWidth="1.6" />
            <line x1="76" y1="124" x2="30" y2="132" strokeWidth="2" />
            <line x1="84" y1="144" x2="40" y2="157" strokeWidth="1.5" />
            <circle cx="32" cy="122" r="1.5" fill="#1e293b" />

            {/* Lower Waist Burst Rays */}
            <line x1="184" y1="164" x2="226" y2="182" strokeWidth="1.8" />
            <line x1="172" y1="184" x2="208" y2="210" strokeWidth="1.5" />
            <line x1="162" y1="204" x2="190" y2="234" strokeWidth="1.7" />
            <circle cx="218" cy="198" r="1.3" fill="#1e293b" />

            <line x1="96" y1="164" x2="54" y2="182" strokeWidth="1.8" />
            <line x1="108" y1="184" x2="72" y2="210" strokeWidth="1.5" />
            <line x1="118" y1="204" x2="90" y2="234" strokeWidth="1.7" />
            <circle cx="62" cy="198" r="1.3" fill="#1e293b" />

            {/* Bottom Shading Stipple Accent Dots */}
            <circle cx="178" cy="226" r="1.2" fill="#1e293b" />
            <circle cx="102" cy="226" r="1.2" fill="#1e293b" />
          </motion.g>

          {/* --- 2. Ambient Radiant Glow Overlay --- */}
          <motion.circle
            cx="140"
            cy="125"
            r="95"
            fill={`url(#vintage-bulb-glow-${idx})`}
            animate={{
              opacity: isLit ? (isActive ? 1 : 0.75) : 0,
              scale: isLit ? 1 : 0.7,
            }}
            transition={{ duration: 0.35 }}
            className="pointer-events-none"
          />

          {/* --- 3. Lightbulb Glass Body Fill & Hand-drawn Contour --- */}
          <path
            d="M 116 208
               C 106 195, 84 165, 84 122
               C 84 64, 109 42, 140 42
               C 171 42, 196 64, 196 122
               C 196 165, 174 195, 164 208
               Z"
            fill={`url(#bulb-glass-fill-${idx})`}
          />

          {/* Main Outer Inked Bulb Glass Contour */}
          <path
            d="M 116 208
               C 106 195, 84 165, 84 122
               C 84 64, 109 42, 140 42
               C 171 42, 196 64, 196 122
               C 196 165, 174 195, 164 208"
            stroke="#1e293b"
            strokeWidth="3.4"
            strokeLinecap="round"
            fill="none"
          />

          {/* Inner Glass Contour Line (Hand-Drawn Engraving Feel) */}
          <path
            d="M 119 203
               C 110 190, 89 162, 89 122
               C 89 69, 112 47, 140 47
               C 168 47, 191 69, 191 122
               C 191 162, 170 190, 161 203"
            stroke="#1e293b"
            strokeWidth="1.2"
            strokeOpacity="0.85"
            strokeLinecap="round"
            fill="none"
          />

          {/* Glass Curved Hatching Highlights (Upper Right & Shoulder) */}
          <path
            d="M 165 58 C 176 70, 184 88, 186 108"
            stroke="#1e293b"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 172 66 C 180 78, 186 94, 188 112"
            stroke="#1e293b"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />
          <path
            d="M 178 76 C 184 86, 188 100, 189 116"
            stroke="#1e293b"
            strokeWidth="1.1"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />

          {/* Left Waist Shading Hatch Lines */}
          <path
            d="M 94 148 C 96 162, 102 176, 112 188"
            stroke="#1e293b"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.65"
          />
          <path
            d="M 98 156 C 101 168, 106 178, 115 188"
            stroke="#1e293b"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M 103 166 C 106 174, 110 182, 117 190"
            stroke="#1e293b"
            strokeWidth="0.9"
            strokeLinecap="round"
            fill="none"
            opacity="0.4"
          />

          {/* Right Waist Shading Hatch Lines */}
          <path
            d="M 186 148 C 184 162, 178 176, 168 188"
            stroke="#1e293b"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.65"
          />
          <path
            d="M 182 156 C 179 168, 174 178, 165 188"
            stroke="#1e293b"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />

          {/* --- 4. Central Glass Stem & Filament Mount --- */}
          <path
            d="M 130 208
               L 130 156
               C 130 151, 135 147, 140 147
               C 145 147, 150 151, 150 156
               L 150 208
               Z"
            fill={isLit ? "#fffbeb" : "#f1f5f9"}
            stroke="#1e293b"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Stem Engraved Vertical Hatch Lines */}
          <line x1="134" y1="158" x2="134" y2="206" stroke="#1e293b" strokeWidth="1" opacity="0.75" />
          <line x1="137" y1="154" x2="137" y2="206" stroke="#1e293b" strokeWidth="1.2" opacity="0.85" />
          <line x1="140" y1="152" x2="140" y2="206" stroke="#1e293b" strokeWidth="1.2" opacity="0.9" />
          <line x1="143" y1="154" x2="143" y2="206" stroke="#1e293b" strokeWidth="1.2" opacity="0.85" />
          <line x1="146" y1="158" x2="146" y2="206" stroke="#1e293b" strokeWidth="1" opacity="0.75" />
          <circle cx="140" cy="180" r="3.5" fill="#1e293b" />
          <circle cx="140" cy="195" r="4" fill="#1e293b" />

          {/* Two Support Wire Prongs */}
          <line x1="133" y1="156" x2="122" y2="102" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="147" y1="156" x2="158" y2="102" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />

          {/* --- 5. Tungsten Filament Arc --- */}
          <motion.g
            animate={{
              filter: isLit ? `url(#filament-glow-${idx})` : "none",
            }}
            transition={{ duration: 0.2 }}
          >
            {/* Filament Curl Details */}
            <path
              d="M 122 102 C 117 106, 114 98, 122 96 C 126 95, 130 99, 135 99"
              stroke={isLit ? "#ea580c" : "#1e293b"}
              strokeWidth={isLit ? 2.2 : 1.6}
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 135 99 C 137 99, 137 94, 140 94 C 143 94, 143 99, 145 99"
              stroke={isLit ? "#facc15" : "#1e293b"}
              strokeWidth={isLit ? 2.6 : 1.8}
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 145 99 C 150 99, 154 95, 158 96 C 166 98, 163 106, 158 102"
              stroke={isLit ? "#ea580c" : "#1e293b"}
              strokeWidth={isLit ? 2.2 : 1.6}
              strokeLinecap="round"
              fill="none"
            />

            {/* Lit Filament Hot Core */}
            {isLit && (
              <path
                d="M 122 98 Q 140 93 158 98"
                stroke="#ffffff"
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </motion.g>

          {/* --- 6. Hand-Engraved Screw Base (Colored with signature color) --- */}
          <g className="vintage-screw-base">
            {/* Glass Collar Transition */}
            <path
              d="M 116 208 L 164 208 L 163 214 L 117 214 Z"
              fill={isLit ? `${signatureColor}30` : "#e2e8f0"}
              stroke="#1e293b"
              strokeWidth="1.5"
            />
            <line x1="120" y1="211" x2="160" y2="211" stroke="#1e293b" strokeWidth="1" />

            {/* Thread Ridge 1 */}
            <path
              d="M 117 214 C 117 214, 130 216, 140 216 C 150 216, 163 214, 163 214 L 162 225 C 162 225, 149 227, 140 227 C 131 227, 118 225, 118 225 Z"
              fill={`url(#screw-cap-tint-${idx})`}
              stroke="#1e293b"
              strokeWidth="1.8"
            />
            <line x1="122" y1="216" x2="122" y2="223" stroke="#1e293b" strokeWidth="1.2" />
            <line x1="126" y1="217" x2="126" y2="224" stroke="#1e293b" strokeWidth="1" />
            <line x1="130" y1="218" x2="130" y2="225" stroke="#1e293b" strokeWidth="1" />
            <line x1="150" y1="218" x2="150" y2="225" stroke="#1e293b" strokeWidth="1" />
            <line x1="154" y1="217" x2="154" y2="224" stroke="#1e293b" strokeWidth="1" />
            <line x1="158" y1="216" x2="158" y2="223" stroke="#1e293b" strokeWidth="1.2" />

            {/* Thread Ridge 2 */}
            <path
              d="M 118 225 C 118 225, 131 227, 140 227 C 149 227, 162 225, 162 225 L 161 236 C 161 236, 148 238, 140 238 C 132 238, 119 236, 119 236 Z"
              fill={`url(#screw-cap-tint-${idx})`}
              stroke="#1e293b"
              strokeWidth="1.8"
            />
            <line x1="123" y1="227" x2="123" y2="234" stroke="#1e293b" strokeWidth="1.2" />
            <line x1="127" y1="228" x2="127" y2="235" stroke="#1e293b" strokeWidth="1" />
            <line x1="131" y1="229" x2="131" y2="236" stroke="#1e293b" strokeWidth="1" />
            <line x1="149" y1="229" x2="149" y2="236" stroke="#1e293b" strokeWidth="1" />
            <line x1="153" y1="228" x2="153" y2="235" stroke="#1e293b" strokeWidth="1" />
            <line x1="157" y1="227" x2="157" y2="234" stroke="#1e293b" strokeWidth="1.2" />

            {/* Thread Ridge 3 */}
            <path
              d="M 119 236 C 119 236, 132 238, 140 238 C 148 238, 161 236, 161 236 L 159 247 C 159 247, 147 249, 140 249 C 133 249, 121 247, 121 247 Z"
              fill={`url(#screw-cap-tint-${idx})`}
              stroke="#1e293b"
              strokeWidth="1.8"
            />
            <line x1="125" y1="238" x2="125" y2="245" stroke="#1e293b" strokeWidth="1.2" />
            <line x1="129" y1="239" x2="129" y2="246" stroke="#1e293b" strokeWidth="1" />
            <line x1="151" y1="239" x2="151" y2="246" stroke="#1e293b" strokeWidth="1" />
            <line x1="155" y1="238" x2="155" y2="245" stroke="#1e293b" strokeWidth="1.2" />

            {/* Thread Ridge 4 */}
            <path
              d="M 121 247 C 121 247, 133 249, 140 249 C 147 249, 159 247, 159 247 L 156 257 C 156 257, 146 259, 140 259 C 134 259, 124 257, 124 257 Z"
              fill={`url(#screw-cap-tint-${idx})`}
              stroke="#1e293b"
              strokeWidth="1.8"
            />
            <line x1="128" y1="249" x2="128" y2="255" stroke="#1e293b" strokeWidth="1.2" />
            <line x1="152" y1="249" x2="152" y2="255" stroke="#1e293b" strokeWidth="1.2" />

            {/* Contact Tip Button */}
            <path
              d="M 128 257 C 128 257, 134 266, 140 266 C 146 266, 152 257, 152 257 Z"
              fill={`url(#screw-tip-tint-${idx})`}
              stroke="#1e293b"
              strokeWidth="1.5"
            />
            <circle cx="140" cy="262" r="2" fill={isLit ? "#ffffff" : "#475569"} />
          </g>
        </g>
      </svg>
    </motion.div>
  );
}

export default function CreatorJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bulbRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  const [wirePaths, setWirePaths] = useState<{
    leadIn: string;
    seg1: string;
    seg2: string;
    seg3: string;
  }>({ leadIn: "", seg1: "", seg2: "", seg3: "" });

  const [activeMilestone, setActiveMilestone] = useState<number>(0);

  // Measure exact pixel anchor positions of the bulb screw bases dynamically
  useEffect(() => {
    const calculateWirePaths = () => {
      if (!containerRef.current) return;
      const cRect = containerRef.current.getBoundingClientRect();

      const getBulbTopCenter = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (!ref.current) return null;
        const bRect = ref.current.getBoundingClientRect();
        return {
          x: bRect.left + bRect.width / 2 - cRect.left,
          y: bRect.top + 38 - cRect.top, // top screw collar connection point
        };
      };

      const p0 = getBulbTopCenter(bulbRefs[0]);
      const p1 = getBulbTopCenter(bulbRefs[1]);
      const p2 = getBulbTopCenter(bulbRefs[2]);
      const p3 = getBulbTopCenter(bulbRefs[3]);

      if (p0 && p1 && p2 && p3) {
        // 1. Clean straight vertical suspension cord dropping from ceiling into Bulb 0
        const leadIn = `M ${p0.x} -40 L ${p0.x} ${p0.y}`;

        // 2. Wire from Bulb 0 (Left) -> Bulb 1 (Right):
        // KNOT TYPE A: Classic 360° Teardrop Loop with gravitational sag
        const mid1X = (p0.x + p1.x) / 2;
        const mid1Y = (p0.y + p1.y) / 2 + 25;
        const seg1 = `
          M ${p0.x} ${p0.y}
          C ${p0.x + 80} ${p0.y + 120}, ${mid1X - 70} ${mid1Y - 60}, ${mid1X - 15} ${mid1Y - 10}
          C ${mid1X + 40} ${mid1Y + 45}, ${mid1X + 60} ${mid1Y - 50}, ${mid1X} ${mid1Y - 45}
          C ${mid1X - 50} ${mid1Y - 40}, ${mid1X - 35} ${mid1Y + 30}, ${mid1X + 45} ${mid1Y + 65}
          C ${p1.x - 85} ${mid1Y + 95}, ${p1.x - 55} ${p1.y + 110}, ${p1.x} ${p1.y}
        `;

        // 3. Wire from Bulb 1 (Right) -> Bulb 2 (Left):
        // KNOT TYPE B: Figure-8 Overhand Knot (two crossing interlooped curls)
        const mid2X = (p1.x + p2.x) / 2;
        const mid2Y = (p1.y + p2.y) / 2 + 20;
        const seg2 = `
          M ${p1.x} ${p1.y}
          C ${p1.x - 80} ${p1.y + 110}, ${mid2X + 90} ${mid2Y - 70}, ${mid2X + 30} ${mid2Y - 30}
          C ${mid2X - 35} ${mid2Y + 15}, ${mid2X - 55} ${mid2Y - 45}, ${mid2X - 15} ${mid2Y - 55}
          C ${mid2X + 35} ${mid2Y - 65}, ${mid2X + 60} ${mid2Y + 25}, ${mid2X} ${mid2Y + 45}
          C ${mid2X - 55} ${mid2Y + 65}, ${mid2X - 35} ${mid2Y + 10}, ${mid2X - 60} ${mid2Y + 60}
          C ${p2.x + 85} ${mid2Y + 95}, ${p2.x + 55} ${p2.y + 110}, ${p2.x} ${p2.y}
        `;

        // 4. Wire from Bulb 2 (Left) -> Bulb 3 (Right):
        // KNOT TYPE C: Double-Coil Telephone / Corkscrew Spring Knot (tight twin loops)
        const mid3X = (p2.x + p3.x) / 2;
        const mid3Y = (p2.y + p3.y) / 2 + 30;
        const seg3 = `
          M ${p2.x} ${p2.y}
          C ${p2.x + 70} ${p2.y + 110}, ${mid3X - 90} ${mid3Y - 50}, ${mid3X - 45} ${mid3Y - 10}
          C ${mid3X - 5} ${mid3Y + 30}, ${mid3X + 15} ${mid3Y - 40}, ${mid3X - 25} ${mid3Y - 35}
          C ${mid3X - 55} ${mid3Y - 30}, ${mid3X - 30} ${mid3Y + 25}, ${mid3X + 10} ${mid3Y + 20}
          C ${mid3X + 45} ${mid3Y + 15}, ${mid3X + 60} ${mid3Y - 55}, ${mid3X + 25} ${mid3Y - 45}
          C ${mid3X - 10} ${mid3Y - 35}, ${mid3X + 20} ${mid3Y + 40}, ${mid3X + 70} ${mid3Y + 65}
          C ${p3.x - 75} ${mid3Y + 95}, ${p3.x - 50} ${p3.y + 110}, ${p3.x} ${p3.y}
        `;

        setWirePaths({ leadIn, seg1, seg2, seg3 });
      }
    };

    calculateWirePaths();
    window.addEventListener("resize", calculateWirePaths);
    const timer = setTimeout(calculateWirePaths, 250); // recalculate after layout settle

    return () => {
      window.removeEventListener("resize", calculateWirePaths);
      clearTimeout(timer);
    };
  }, []);

  // Scroll tracking to trigger milestone lighting as user scrolls down the zig-zag path
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));

      if (p < 0.28) setActiveMilestone(0);
      else if (p < 0.50) setActiveMilestone(1);
      else if (p < 0.72) setActiveMilestone(2);
      else setActiveMilestone(3);
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const journeySteps = [
    {
      num: "01",
      title: "Verify identity",
      desc: "Complete a secure KYC identity check in minutes to unlock instructor privileges and direct payout settings.",
      tag: "Step 1 • Onboarding",
    },
    {
      num: "02",
      title: "Build course",
      desc: "Construct lessons, upload HD videos, and configure live in-browser interactive terminal playgrounds.",
      tag: "Step 2 • Creation",
    },
    {
      num: "03",
      title: "Content review",
      desc: "Our automated validation & QA team reviews syllabus structure and coding environments within 24 hours.",
      tag: "Step 3 • Quality Check",
    },
    {
      num: "04",
      title: "Track & optimize",
      desc: "Go live globally, analyze enrollment conversion metrics, and engage directly with your student community.",
      tag: "Step 4 • Launch & Growth",
    },
  ];

  const nodeColors = ["#2563EB", "#7C3AED", "#D97706", "#059669"];

  return (
    <section className="milestone-sec relative py-12 md:py-20" id="path">
      <div className="wrap max-w-5xl mx-auto px-4 sm:px-6 relative">
        {/* Section Header */}
        <div className="sec-head text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <span className="eyebrow">How it works</span>
          <h2>Your path from idea to published course</h2>
          <p>Four simple stages take you from verification to a growing catalog of global learning experiences.</p>
        </div>

        {/* ── Zig-Zag Journey Track with Natural Gravitational Connecting Wire ── */}
        <div ref={containerRef} className="relative w-full">
          {/* SVG Canvas for Heavy Black Physical Hanging Cable with Weight & Shadow */}
          {wirePaths.leadIn && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden md:block overflow-visible"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Heavy solid black/charcoal gradient with metallic specular rim */}
                <linearGradient id="heavy-black-cable" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#090d16" />
                  <stop offset="35%" stopColor="#1e293b" />
                  <stop offset="70%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>

                {/* Weight drop shadow to give 3D depth and gravity feel */}
                <filter id="cable-heavy-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#090d16" floodOpacity="0.32" />
                </filter>
              </defs>

              {/* 1. Top Ceiling Lead-in Cable */}
              <path
                d={wirePaths.leadIn}
                stroke="url(#heavy-black-cable)"
                strokeWidth="4.5"
                strokeLinecap="round"
                filter="url(#cable-heavy-shadow)"
              />

              {/* 2. Cable Segment 1: Bulb 0 (Left) -> Bulb 1 (Right) */}
              <path
                d={wirePaths.seg1}
                stroke="url(#heavy-black-cable)"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
                filter="url(#cable-heavy-shadow)"
              />

              {/* 3. Cable Segment 2: Bulb 1 (Right) -> Bulb 2 (Left) */}
              <path
                d={wirePaths.seg2}
                stroke="url(#heavy-black-cable)"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
                filter="url(#cable-heavy-shadow)"
              />

              {/* 4. Cable Segment 3: Bulb 2 (Left) -> Bulb 3 (Right) */}
              <path
                d={wirePaths.seg3}
                stroke="url(#heavy-black-cable)"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
                filter="url(#cable-heavy-shadow)"
              />
            </svg>
          )}

          {/* ── 4 Zig-Zag Milestone Rows ── */}
          <div className="flex flex-col gap-16 md:gap-28 relative z-10">
            {journeySteps.map((step, idx) => {
              const isLit = idx <= activeMilestone;
              const isActive = idx === activeMilestone;
              const signatureColor = nodeColors[idx];
              // Even indices (0, 2): Bulb LEFT, Text RIGHT
              // Odd indices (1, 3): Text LEFT, Bulb RIGHT
              const isBulbOnLeft = idx % 2 === 0;

              return (
                <div
                  key={idx}
                  className={`flex flex-col md:flex-row items-center justify-between gap-8 md:gap-14 ${
                    isBulbOnLeft ? "" : "md:flex-row-reverse"
                  }`}
                >
                  {/* --- Bulb Column --- */}
                  <div
                    ref={bulbRefs[idx]}
                    className="w-full md:w-1/2 flex flex-col items-center relative"
                  >
                    <VintageEngravedBulb
                      idx={idx}
                      isLit={isLit}
                      isActive={isActive}
                      signatureColor={signatureColor}
                    />
                  </div>

                  {/* --- Content Description Column (Opposite Side) --- */}
                  <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left px-4 lg:px-8">
                    <div className="max-w-md">
                      {/* Step Tag (Static Color Matching Each Stage) */}
                      <span
                        className="block text-xs sm:text-sm font-bold uppercase tracking-widest mb-2"
                        style={{ color: signatureColor }}
                      >
                        {step.tag}
                      </span>

                      {/* Main Title (Static Font & Color) */}
                      <h3 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-slate-900 tracking-tight mb-3">
                        {step.title}
                      </h3>

                      {/* Description (Static Font & Color) */}
                      <p className="text-sm sm:text-base leading-relaxed text-slate-600 font-normal">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
