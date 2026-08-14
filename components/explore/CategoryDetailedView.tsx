"use client";

import React, { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValue, MotionValue } from "framer-motion";
import { CATEGORY_DATA, categoriesList, CategoryWatermark } from "@/app/(public)/explore/page";
import DotGrid from "@/components/landing/DotGrid";
import GradientText from "@/components/landing/GradientText";
import BorderGlow from "./BorderGlow";
import { gsap } from "gsap";
import { api } from "@/infrastructure/http/api";
import CoursesView, { CourseCard } from "./CoursesView";
import EventsView from "./EventsView";
import ArticlesView from "./ArticlesView";
import WindmillAnimation from "./WindmillAnimation";
import FilterSidebar, { ExploreFilters } from "./FilterSidebar";

export { CourseCard };

function hexToRgbStr(hex: string): string {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}


// Dummy data and header for live learning events
const WEBINARS_DATA = [
  { title: "Scaling React & Next.js App Router Performance", category: "Computer Science", host: "Next.js Core Team", date: "Friday, 10:00 AM", status: "Upcoming", duration: "90 mins" },
  { title: "Building Secure & Resilient APIs", category: "Information Technology", host: "Security DevOps Lead", date: "Thursday, 2:00 PM", status: "Upcoming", duration: "75 mins" },
  { title: "Cloud Computing & Serverless AWS Architectures", category: "Information Technology", host: "AWS Solution Architect", date: "Recorded", status: "Recorded Video", duration: "120 mins" },
  { title: "Strategic Product Management Sprints", category: "Business & Management", host: "VP of Product", date: "Recorded", status: "Recorded Video", duration: "45 mins" },
  { title: "Structural Analysis & Materials Mechanics", category: "Civil & Mechanical", host: "Senior Civil Engineer", date: "Recorded", status: "Recorded Video", duration: "80 mins" }
];

export function WebinarCardHeader({ title, status, duration, category }: any) {
  const isLive = status === "Live Today";
  const isUpcoming = status === "Upcoming";

  const getBgTheme = () => {
    switch (category) {
      case "Computer Science": return "linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)";
      case "Information Technology": return "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)";
      case "Business & Management": return "linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)";
      case "Civil & Mechanical": return "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)";
      default: return "linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)";
    }
  };

  const getAccentColor = () => {
    switch (category) {
      case "Computer Science": return "#4F46E5";
      case "Information Technology": return "#2563EB";
      case "Business & Management": return "#EA580C";
      case "Civil & Mechanical": return "#059669";
      default: return "#4B5563";
    }
  };

  return (
    <div style={{ height: "140px", background: getBgTheme(), position: "relative", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ position: "absolute", top: "-50px", right: "-50px", opacity: 0.1, color: getAccentColor() }}>
        <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="10 10" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M50 100 L150 100 M100 50 L100 150" stroke="currentColor" strokeWidth="2" />
      </svg>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
        <div style={{ display: "inline-block", padding: "4px 10px", background: "#FFFFFF", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "800", color: getAccentColor(), boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          {category}
        </div>
        <div style={{ display: "inline-block", padding: "4px 8px", background: isLive ? "#EF4444" : (isUpcoming ? "#F59E0B" : "#6B7280"), borderRadius: "6px", fontSize: "0.7rem", fontWeight: "700", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {status}
        </div>
      </div>
    </div>
  );
}

const RocketJourney: React.FC<{ activeColor: string; progress: MotionValue<number> }> = ({ activeColor, progress }) => {
  const t = progress;

  const P0 = { x: 350, y: 400 }; // Bottom-right start
  const P1 = { x: 150, y: 300 }; // Curve up and left
  const P2 = { x: 150, y: 150 }; // High arc
  const P3 = { x: 320, y: 150 }; // Land on moon surface

  const bezierX = (val: number) => {
    const mt = 1 - val;
    return mt * mt * mt * P0.x + 3 * mt * mt * val * P1.x + 3 * mt * val * val * P2.x + val * val * val * P3.x;
  };
  const bezierY = (val: number) => {
    const mt = 1 - val;
    return mt * mt * mt * P0.y + 3 * mt * mt * val * P1.y + 3 * mt * val * val * P2.y + val * val * val * P3.y;
  };

  const tRocket = useTransform(t, [0, 0.85], [0, 1]);
  const x = useTransform(tRocket, bezierX);
  const y = useTransform(tRocket, bezierY);
  const angle = useTransform(tRocket, (val) => {
    const mt = 1 - val;
    const dx = 3 * mt * mt * (P1.x - P0.x) + 6 * mt * val * (P2.x - P1.x) + 3 * val * val * (P3.x - P2.x);
    const dy = 3 * mt * mt * (P1.y - P0.y) + 6 * mt * val * (P2.y - P1.y) + 3 * val * val * (P3.y - P2.y);
    const targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;

    // Start upright (0 in SVG rotation is pointing straight up) 
    // and smoothly tilt into the flight path as it lifts off
    if (val < 0.02) {
      return 0;
    } else if (val < 0.15) {
      const p = (val - 0.02) / 0.13;
      return 0 * (1 - p) + targetAngle * p;
    }
    return targetAngle;
  });

  const flameOpacity = useTransform(t, [0, 0.03, 0.85, 0.92], [0, 1, 1, 0]);
  const flameLen = useTransform(t, (v) => (v <= 0 || v >= 0.88) ? 0 : 0.7 + Math.abs(Math.sin(v * 60)) * 0.45);
  const rocketFade = useTransform(t, [0.84, 0.91], [1, 0]);
  const astronautX = useTransform(t, (v) => v < 0.85 ? P3.x - 4 : P3.x - 4 + Math.min((v - 0.85) / 0.08, 1) * 60);
  const astronautOp = useTransform(t, [0.82, 0.88], [0, 1]);
  const flagScale = useTransform(t, [0.90, 1.0], [0, 1]);
  const trailOp = useTransform(t, [0, 0.06, 0.82, 1], [0, 0.5, 0.5, 0]);
  const dustOp = useTransform(t, [0.82, 0.88, 0.95, 1], [0, 0.85, 0.3, 0]);
  const dustSc = useTransform(t, [0.82, 1], [0.2, 2.8]);
  const moonScale = useTransform(t, [0, 0.6, 1], [0.8, 1.2, 2.8]);
  const moonX = useTransform(t, [0, 0.6, 1], [380, 350, P3.x + 30]);
  const moonY = useTransform(t, [0, 0.6, 1], [80, 200, P3.y + 148]);

  return (
    <div style={{ position: "relative", width: "100%", height: "460px", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <svg viewBox="35 30 430 400" width="100%" height="100%" style={{ overflow: "visible", display: "block" }}>
        <defs>

          {/* Trajectory gradient */}
          <linearGradient id="traj" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={activeColor} stopOpacity="0.04" />
            <stop offset="100%" stopColor={activeColor} stopOpacity="0.55" />
          </linearGradient>

          {/* Dust plume */}
          <radialGradient id="dustg" cx="50%" cy="60%" r="50%">
            <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.8" />
            <stop offset="55%" stopColor="#cbd5e1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
          </radialGradient>

          {/* Glow bloom filters */}
          <filter id="bloom" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="b1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b2" />
            <feMerge>
              <feMergeNode in="b1" />
              <feMergeNode in="b2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softglow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
          <filter id="ao" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        <style>{`
          @keyframes twinkle { 0%,100%{opacity:0.15;} 50%{opacity:0.9;} }
          @keyframes flagWave {
            0%  { d: path("M 0,0 Q 20,-2 40,0 L 40,22 Q 20,24 0,22 Z"); }
            30% { d: path("M 0,0 Q 18,5 40,1 L 40,22 Q 18,17 0,22 Z"); }
            65% { d: path("M 0,0 Q 22,-5 40,0 L 40,22 Q 22,27 0,22 Z"); }
            100%{ d: path("M 0,0 Q 20,-2 40,0 L 40,22 Q 20,24 0,22 Z"); }
          }
          .fw { animation: flagWave 2.8s ease-in-out infinite; }
          .st-a { animation: twinkle 2.3s ease-in-out infinite; }
          .st-b { animation: twinkle 3.2s ease-in-out infinite 0.7s; }
          .st-c { animation: twinkle 2.8s ease-in-out infinite 1.2s; }
          .st-d { animation: twinkle 1.9s ease-in-out infinite 0.4s; }
        `}</style>

        {/* ── Stars — soft circular dots, photographic ── */}
        {([
          [42, 35, 1.6, "st-a"], [120, 20, 1.1, "st-b"], [225, 50, 1.9, "st-c"],
          [315, 18, 1.3, "st-d"], [405, 44, 1.7, "st-a"], [470, 14, 1.0, "st-b"],
          [492, 95, 1.4, "st-c"], [25, 175, 1.6, "st-d"], [488, 295, 1.2, "st-a"],
          [172, 84, 1.0, "st-b"], [335, 375, 1.5, "st-c"], [478, 355, 1.3, "st-d"],
          [88, 135, 0.9, "st-a"], [448, 210, 1.1, "st-b"], [265, 310, 0.8, "st-c"],
        ] as [number, number, number, string][]).map(([cx, cy, r, cls], i) => (
          <circle key={i} className={cls} cx={cx} cy={cy} r={r} fill="white" opacity="0.7" />
        ))}

        {/* ── Launch Cloud ── */}
        <motion.g style={{ opacity: useTransform(t, [0, 0.15], [1, 0]) }}>
          <path d="M 320,410 Q 330,380 350,380 Q 370,380 380,400 Q 400,400 400,420 Q 400,440 370,440 L 320,440 Q 290,440 290,420 Q 290,400 320,410 Z" fill="#ffffff" filter="url(#shadow)" opacity="0.4" />
          <path d="M 325,415 Q 335,390 350,390 Q 365,390 375,405 Q 390,405 390,420 Q 390,435 365,435 L 320,435 Q 300,435 300,420 Q 300,405 325,415 Z" fill="#f8fafc" />
        </motion.g>

        {/* ── Trajectory ── */}
        <path
          d={`M ${P0.x},${P0.y} C ${P1.x},${P1.y} ${P2.x},${P2.y} ${P3.x},${P3.y}`}
          fill="none" stroke="url(#traj)" strokeWidth="1" strokeDasharray="4 9" opacity="0.45"
        />

        {/* ── Exhaust trail (volumetric smoke puffs) ── */}
        <motion.g style={{ opacity: trailOp }}>
          {[0.10, 0.22, 0.36, 0.50, 0.63].map((frac, i) => (
            <ellipse key={i}
              cx={bezierX(frac)} cy={bezierY(frac)}
              rx={4 + i * 2.2} ry={3 + i * 1.4}
              fill="url(#exhg)"
            />
          ))}
        </motion.g>

        {/* ── Moon ── */}
        <motion.g style={{ x: moonX, y: moonY, scale: moonScale }}>
          <circle cx="0" cy="0" r="53" fill="#f8fafc" filter="url(#shadow)" />
          <circle cx="0" cy="0" r="53" fill="#f1f5f9" />

          {/* Soft cute craters */}
          <circle cx="-15" cy="-10" r="8" fill="#e2e8f0" opacity="0.8" />
          <circle cx="20" cy="-5" r="12" fill="#e2e8f0" opacity="0.8" />
          <circle cx="-5" cy="22" r="10" fill="#e2e8f0" opacity="0.8" />
          <circle cx="-25" cy="15" r="4" fill="#e2e8f0" opacity="0.8" />
          <circle cx="15" cy="20" r="5" fill="#e2e8f0" opacity="0.8" />
        </motion.g>

        {/* ── Landing dust cloud (photographic dusty haze) ── */}
        <motion.g style={{ opacity: dustOp, scale: dustSc, originX: `${P3.x}px`, originY: `${P3.y + 18}px` }}>
          <ellipse cx={P3.x} cy={P3.y + 15} rx="35" ry="9" fill="url(#dustg)" />
          <ellipse cx={P3.x - 20} cy={P3.y + 17} rx="16" ry="6" fill="url(#dustg)" opacity="0.7" />
          <ellipse cx={P3.x + 20} cy={P3.y + 17} rx="16" ry="6" fill="url(#dustg)" opacity="0.7" />
          <ellipse cx={P3.x} cy={P3.y + 12} rx="12" ry="4" fill="url(#dustg)" opacity="0.45" />
        </motion.g>

        {/* ── Flag ── */}
        <motion.g style={{ x: P3.x + 82, y: P3.y, scale: flagScale, originX: "0px", originY: "0px" }}>
          <g transform="scale(1.8)">
            {/* Pole — metallic cylinder suggestion */}
            <line x1="0.5" y1="2" x2="0.5" y2="-58" stroke="#8898a8" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="0" y1="2" x2="0" y2="-58" stroke="#c0d0dc" strokeWidth="1.0" strokeLinecap="round" opacity="0.5" />
            {/* Flag fabric with wave */}
            <g transform="translate(0,-58)">
              <path className="fw" d="M 0,0 Q 20,-2 40,0 L 40,22 Q 20,24 0,22 Z" fill={activeColor} />
              {/* Lighting fold */}
              <path d="M 0,0 L 16,0 L 16,22 L 0,22 Z" fill="white" opacity="0.12" />
              {/* Right shadow */}
              <path d="M 32,0 L 40,0 L 40,22 L 32,22 Z" fill="#000" opacity="0.15" />
              <text x="3" y="14" fill="white" fontSize="8.5" fontWeight="900"
                fontFamily="'Inter','Outfit',sans-serif" letterSpacing="-0.5">arcade.</text>
            </g>
          </g>
        </motion.g>

        {/* ── Astronaut — cute cartoon style ── */}
        <motion.g style={{ x: astronautX, y: P3.y + 26, opacity: astronautOp }}>
          <g transform="scale(1.8) translate(0, -9)">
            <ellipse cx="0" cy="16" rx="8" ry="2" fill="#94a3b8" opacity="0.3" />

            {/* Legs */}
            <path d="M -3,6 L -5,14 Q -6,16 -3,15 Z" fill="#ffffff" />
            <path d="M 3,6 L 5,14 Q 6,16 3,15 Z" fill="#ffffff" />

            {/* Torso */}
            <rect x="-6" y="-2" width="12" height="10" rx="4" fill="#ffffff" />
            <rect x="-4" y="0" width="8" height="6" rx="2" fill="#f1f5f9" />

            {/* Backpack */}
            <rect x="5" y="-3" width="4" height="10" rx="2" fill="#e2e8f0" />

            {/* Arms */}
            <path d="M -5,0 Q -9,4 -7,10" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <path d="M 5,0 Q 9,4 7,10" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />

            {/* Helmet */}
            <circle cx="0" cy="-8" r="7" fill="#ffffff" />
            <circle cx="0" cy="-8" r="5" fill={activeColor} />
            {/* Visor shine */}
            <ellipse cx="-2" cy="-10" rx="2" ry="1" fill="#ffffff" opacity="0.4" transform="rotate(-30,-2,-10)" />
          </g>
        </motion.g>


        {/* ── Rocket ── */}
        <motion.g style={{ x, y, rotate: angle, opacity: rocketFade, originX: "0.5", originY: "0.5" }}>
          <g transform="scale(1.2)">

            {/* ── Cute Cartoon Flame ── */}
            <motion.g style={{ opacity: flameOpacity, scaleY: flameLen, originX: "0.5", originY: "0" }} transform="translate(0,18)">
              <path d="M -8,0 Q -12,15 0,35 Q 12,15 8,0 Z" fill="#f59e0b" filter="url(#bloom)" />
              <path d="M -4,0 Q -6,10 0,22 Q 6,10 4,0 Z" fill="#fbbf24" />
              <path d="M -2,0 Q -3,5 0,12 Q 3,5 2,0 Z" fill="#fef08a" />
            </motion.g>

            {/* Rocket body group */}
            <g transform="translate(0,-8)">

              {/* ── Left fin ── */}
              <path d="M -12,12 Q -22,25 -22,32 Q -22,35 -16,35 L -10,25 Z" fill={activeColor} />
              {/* ── Right fin ── */}
              <path d="M 12,12 Q 22,25 22,32 Q 22,35 16,35 L 10,25 Z" fill={activeColor} />

              {/* Engine nozzle */}
              <path d="M -8,22 L -10,28 L 10,28 L 8,22 Z" fill="#64748b" />

              {/* ── Main body — glossy white capsule ── */}
              <path d="M 0,-30 C -18,-10 -16,25 0,25 C 16,25 18,-10 0,-30 Z" fill="#ffffff" filter="url(#shadow)" />
              <path d="M 0,-30 C -18,-10 -16,25 0,25 C 16,25 18,-10 0,-30 Z" fill="#f8fafc" />

              {/* Soft inner shadow/gloss */}
              <path d="M -8,-10 C -10,5 -8,15 -2,20" fill="none" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" opacity="0.7" />

              {/* ── Nose cone ── */}
              <path d="M 0,-30 C -9,-15 -11,-5 -12,0 L 12,0 C 11,-5 9,-15 0,-30 Z" fill={activeColor} />
              <path d="M -4,-25 C -6,-15 -6,-5 -5,0" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.3" />

              {/* ── Porthole window ── */}
              <circle cx="0" cy="5" r="7" fill="#cbd5e1" />
              <circle cx="0" cy="5" r="5" fill="#ffffff" filter="url(#softglow)" />
              <circle cx="0" cy="5" r="5" fill="#f1f5f9" />
              <path d="M -2,2 Q 0,4 2,2" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </g>
        </motion.g>

      </svg>
    </div>
  );
};
const HoneycombIllustration: React.FC<{ animate?: boolean }> = ({ animate = true }) => {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <svg
        viewBox="0 0 450 300"
        width="100%"
        height="100%"
        style={{ overflow: "visible", display: "block", maxWidth: "450px" }}
      >
        <style>{`
          @keyframes flowForward {
            from { stroke-dashoffset: 24; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes flowBackward {
            from { stroke-dashoffset: -24; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes shuttleFlight {
            0% {
              transform: translate(350px, 45px) rotate(-30deg);
            }
            35% {
              /* Flying towards the racket */
              transform: translate(322px, 60px) rotate(-55deg);
            }
            45% {
              /* Contact with racket, flip orientation */
              transform: translate(316px, 66px) rotate(35deg);
            }
            80% {
              /* Flying back to peak height */
              transform: translate(372px, 28px) rotate(10deg);
            }
            100% {
              /* Returning to resting orbit position */
              transform: translate(350px, 45px) rotate(-30deg);
            }
          }
          @keyframes racketSwing {
            0%, 100% { transform: rotate(0deg); }
            30% { transform: rotate(-8deg); }     /* Swing back */
            38% { transform: rotate(15deg); }    /* Forward strike */
            50% { transform: rotate(5deg); }     /* Follow through */
            65% { transform: rotate(0deg); }     /* Return to idle */
          }
          @keyframes sparkleTwinkleRight {
            0%, 100% { transform: translate(380px, 210px) scale(0.8); opacity: 0.6; }
            50% { transform: translate(380px, 210px) scale(1.05); opacity: 1; }
          }
          @keyframes sparkleTwinkleLeft {
            0%, 100% { transform: translate(60px, 60px) scale(0.6); opacity: 0.5; }
            50% { transform: translate(60px, 60px) scale(0.85); opacity: 1; }
          }
          @keyframes clinkSparksPulse {
            0%, 100% { transform: translate(210px, 208px) scale(0.85); opacity: 0.6; }
            50% { transform: translate(210px, 208px) scale(1.15); opacity: 1; }
          }
          @keyframes expandArrowsPulse {
            0%, 100% { transform: translate(390px, 250px) scale(0.95); }
            50% { transform: translate(390px, 250px) scale(1.15); }
          }

          .flow-forward {
            ${animate ? "animation: flowForward 2s linear infinite;" : ""}
          }
          .flow-backward {
            ${animate ? "animation: flowBackward 2s linear infinite;" : ""}
          }
          .animate-shuttle {
            ${animate ? "animation: shuttleFlight 5s ease-in-out infinite;" : "transform: translate(350px, 45px) rotate(-30deg);"}
          }
          .animate-racket {
            ${animate ? "animation: racketSwing 5s ease-in-out infinite;" : ""}
            transform-origin: -2px 2px;
          }
          .animate-sparkle-right {
            ${animate ? "animation: sparkleTwinkleRight 3s ease-in-out infinite;" : "transform: translate(380px, 210px) scale(0.8);"}
          }
          .animate-sparkle-left {
            ${animate ? "animation: sparkleTwinkleLeft 3s ease-in-out infinite 1.5s;" : "transform: translate(60px, 60px) scale(0.6);"}
          }
          .animate-clink-sparks {
            ${animate ? "animation: clinkSparksPulse 2.5s ease-in-out infinite;" : "transform: translate(210px, 208px) scale(0.85);"}
          }
          .animate-expand-arrows {
            ${animate ? "animation: expandArrowsPulse 4s ease-in-out infinite;" : "transform: translate(390px, 250px) scale(0.95);"}
          }
        `}</style>

        {/* Background dotted line paths / orbits */}
        <path
          className={animate ? "flow-forward" : undefined}
          d="M 120,40 C 200,-10 320,10 340,90"
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          fill="none"
        />
        <path
          className={animate ? "flow-backward" : undefined}
          d="M 50,110 C 30,50 120,10 200,60"
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          fill="none"
        />
        <path
          className={animate ? "flow-forward" : undefined}
          d="M 280,240 C 360,250 430,190 410,120"
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          fill="none"
        />
        <path
          className={animate ? "flow-backward" : undefined}
          d="M 60,190 C 80,250 180,270 230,240"
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          fill="none"
        />

        {/* Glitter particles sliding along dotted paths */}
        {animate && (
          <>
            <circle r="2.5" fill="#FBBF24" style={{ filter: "drop-shadow(0px 0px 3px #FBBF24)" }}>
              <animateMotion
                path="M 120,40 C 200,-10 320,10 340,90"
                dur="6s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="2" fill="#FBBF24" style={{ filter: "drop-shadow(0px 0px 2px #FBBF24)" }}>
              <animateMotion
                path="M 50,110 C 30,50 120,10 200,60"
                dur="7s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="2.5" fill="#FBBF24" style={{ filter: "drop-shadow(0px 0px 3px #FBBF24)" }}>
              <animateMotion
                path="M 280,240 C 360,250 430,190 410,120"
                dur="8s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="2" fill="#FBBF24" style={{ filter: "drop-shadow(0px 0px 2px #FBBF24)" }}>
              <animateMotion
                path="M 60,190 C 80,250 180,270 230,240"
                dur="6.5s"
                repeatCount="indefinite"
              />
            </circle>
          </>
        )}

        {/* Small floating elements like badminton shuttles or balls */}
        <g className={animate ? "animate-shuttle" : undefined} transform={animate ? undefined : "translate(350, 45) rotate(-30)"}>
          <path d="M 0,0 L -8,-15 L 8,-15 Z" fill="none" stroke="#1E293B" strokeWidth="1.2" />
          <path d="M -6,-11 L 6,-11 M -4,-7 L 4,-7" stroke="#1E293B" strokeWidth="1.2" />
          <circle cx="0" cy="1" r="3.5" fill="#1E293B" />
        </g>

        {/* Sparkles / star outlines */}
        <g className={animate ? "animate-sparkle-right" : undefined} transform={animate ? undefined : "translate(380, 210) scale(0.8)"}>
          <path d="M 0,-8 L 2,-2 L 8,0 L 2,2 L 0,8 L -2,2 L -8,0 L -2,-2 Z" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.2" />
        </g>
        <g className={animate ? "animate-sparkle-left" : undefined} transform={animate ? undefined : "translate(60, 60) scale(0.6)"}>
          <path d="M 0,-8 L 2,-2 L 8,0 L 2,2 L 0,8 L -2,2 L -8,0 L -2,-2 Z" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.2" />
        </g>

        {/* Diagonal Expand Arrows in bottom-right */}
        <g className={animate ? "animate-expand-arrows" : undefined} transform={animate ? undefined : "translate(390, 250)"}>
          <line x1="-8" y1="8" x2="8" y2="-8" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
          <polyline points="0,8 -8,8 -8,0" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="0,-8 8,-8 8,0" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Center Hexagon: Girl with Clipboard (Center: 210, 150, radius: 52) */}
        <g transform="translate(210, 150)">
          <polygon
            points="-52,0 -26,-45 26,-45 52,0 26,45 -26,45"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1.8"
          />
          {/* Sketch: Girl with Clipboard */}
          <path d="M-18,-2 C-22,12 -16,28 -14,38 M18,-2 C22,12 16,28 14,38" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M-13,-8 C-13,8 13,8 13,-8 C13,-18 -13,-18 -13,-8" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M-14,-10 Q0,-22 14,-10 M-14,-10 C-18,-5 -15,10 -15,10 M14,-10 C18,-5 15,10 15,10" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <ellipse cx="-5" cy="-8" rx="1.2" ry="1.8" fill="#1E293B" />
          <ellipse cx="5" cy="-8" rx="1.2" ry="1.8" fill="#1E293B" />
          <path d="M-3,-2 Q0,1 3,-2" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M-4,4 L-4,10 M4,4 L4,10" stroke="#1E293B" strokeWidth="1.6" fill="none" />
          <rect x="-14" y="10" width="28" height="30" rx="3" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" />
          <path d="M-6,10 L-6,7 C-6,6 -5,5 -4,5 H4 C5,5 6,6 6,7 L6,10 Z" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.6" />
          <path d="M-18,22 Q-13,20 -12,23" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M18,22 Q13,20 12,23" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <line x1="-8" y1="18" x2="8" y2="18" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="-8" y1="24" x2="4" y2="24" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="-8" y1="30" x2="0" y2="30" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Top-Left Hexagon: Old Man with flat cap (Center: 132, 105, radius: 52) */}
        <g transform="translate(132, 105)">
          <polygon
            points="-52,0 -26,-45 26,-45 52,0 26,45 -26,45"
            fill="#FEF08A"
            stroke="#F59E0B"
            strokeWidth="1.8"
          />
          <path d="M-15,-6 C-15,10 15,10 15,-6 C15,-16 -15,-16 -15,-6" fill="none" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M-22,-12 C-15,-28 15,-28 22,-12 Z" fill="#F1F5F9" stroke="#1E293B" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M-26,-10 C-10,-2 10,-2 26,-10" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M-10,8 C-5,22 5,22 10,8" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M-10,3 Q0,-1 10,3 Q5,7 0,5 Q-5,7 -10,3" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" />
          <circle cx="-6" cy="-6" r="4.5" stroke="#1E293B" strokeWidth="1.6" fill="none" />
          <circle cx="6" cy="-6" r="4.5" stroke="#1E293B" strokeWidth="1.6" fill="none" />
          <line x1="-1.5" y1="-6" x2="1.5" y2="-6" stroke="#1E293B" strokeWidth="1.6" />
          <path d="M-10.5,-6 L-15,-8" stroke="#1E293B" strokeWidth="1.6" />
          <path d="M10.5,-6 L15,-8" stroke="#1E293B" strokeWidth="1.6" />
          <path d="M0,-4 Q2,0 -1,2" stroke="#1E293B" strokeWidth="1.6" fill="none" />
          <path d="M-25,32 Q-12,18 0,22 Q12,18 25,32" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <line x1="0" y1="22" x2="0" y2="35" stroke="#1E293B" strokeWidth="1.6" />
          <path d="M-10,24 L-5,32 M10,24 L5,32" stroke="#1E293B" strokeWidth="1.6" />
        </g>

        {/* Top-Right Hexagon: Badminton Player (Center: 288, 105, radius: 52) */}
        <g transform="translate(288, 105)">
          <polygon
            points="-52,0 -26,-45 26,-45 52,0 26,45 -26,45"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1.8"
          />
          <circle cx="-6" cy="-5" r="7" stroke="#1E293B" strokeWidth="1.6" fill="none" />
          <path d="M1,-5 L4,-4 L1,-3" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <circle cx="-4" cy="-7" r="1" fill="#1E293B" />
          <path d="M-13,-5 C-12,-15 -2,-15 -2,-12 M-13,-5 C-16,-3 -13,4 -13,4" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <g className="animate-racket">
            <path d="M-2,2 Q10,-10 18,-20" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <circle cx="18" cy="-20" r="2.5" fill="#1E293B" stroke="#1E293B" />
            <line x1="18" y1="-20" x2="25" y2="-28" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
            <g transform="translate(28, -32) rotate(45)">
              <ellipse cx="0" cy="0" rx="6" ry="8" stroke="#1E293B" strokeWidth="1.6" fill="none" />
              <line x1="-6" y1="0" x2="6" y2="0" stroke="#1E293B" strokeWidth="1" />
              <line x1="0" y1="-8" x2="0" y2="8" stroke="#1E293B" strokeWidth="1" />
              <line x1="-4" y1="-4" x2="4" y2="4" stroke="#1E293B" strokeWidth="0.8" />
              <line x1="4" y1="-4" x2="-4" y2="4" stroke="#1E293B" strokeWidth="0.8" />
            </g>
          </g>
          <path d="M-10,5 C-8,18 -15,38 -15,38 M-4,5 C-2,15 5,30 8,38" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>

        {/* Middle-Left Hexagon: Spiky Hair waving`,StartLine:24,TargetContent: (Center: 54, 150, radius: 52) */}
        <g transform="translate(54, 150)">
          <polygon
            points="-52,0 -26,-45 26,-45 52,0 26,45 -26,45"
            fill="#FCA5A5"
            stroke="#F87171"
            strokeWidth="1.8"
          />
          <path d="M-18,-8 L-14,-22 L-6,-16 L2,-25 L8,-15 L16,-20 L18,-6 L14,4 L-15,4 Z" fill="#1E293B" stroke="#1E293B" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M-13,-6 C-13,10 13,10 13,-6 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="-5" cy="-2" r="1.2" fill="#1E293B" />
          <circle cx="5" cy="-2" r="1.2" fill="#1E293B" />
          <path d="M-3,3 Q0,6 3,3" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M-13,6 C-22,-2 -26,-12 -28,-18" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M-28,-18 Q-32,-21 -29,-23 M-28,-18 Q-28,-22 -26,-22 M-28,-18 Q-24,-20 -24,-18" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M-10,12 L-14,35 M10,12 L14,35" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>

        {/* Middle-Right Hexagon: Child pointing to target (Center: 366, 150, radius: 52) */}
        <g transform="translate(366, 150)">
          <polygon
            points="-52,0 -26,-45 26,-45 52,0 26,45 -26,45"
            fill="#F472B6"
            stroke="#EC4899"
            strokeWidth="1.8"
          />
          <g transform="translate(24, 0)">
            <circle cx="0" cy="0" r="12" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            <circle cx="0" cy="0" r="7" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
            <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
          </g>
          <circle cx="-10" cy="-6" r="8" stroke="#1E293B" strokeWidth="1.6" fill="#FFFFFF" />
          <path d="M-18,-8 C-21,-12 -16,-17 -12,-14 C-10,-19 -4,-18 -4,-14 C-1,-17 3,-12 1,-8 M-18,-8 C-21,-5 -20,2 -18,4" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <circle cx="-5" cy="-7" r="1" fill="#1E293B" />
          <path d="M-7,-3 Q-5,-1 -3,-3" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M-2,2 Q8,-2 18,-2" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M18,-2 C20,-2 22,-2 24,-2 M18,-2 L17,1 L15,1" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M-14,7 C-12,20 -18,36 -18,36 M-6,7 C-4,18 -2,30 -1,36" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>

        {/* Bottom-Left Hexagon: Girl clinking glass (Center: 132, 195, radius: 52) */}
        <g transform="translate(132, 195)">
          <polygon
            points="-52,0 -26,-45 26,-45 52,0 26,45 -26,45"
            fill="#A7F3D0"
            stroke="#10B981"
            strokeWidth="1.8"
          />
          <path d="M-12,-8 C-12,8 12,8 12,-8 C12,-18 -12,-18 -12,-8" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M-15,-6 C-17,-18 17,-18 15,-6 C16,4 12,12 12,12 L-12,12 C-12,12 -16,4 -15,-6" fill="none" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="-4" cy="-8" r="1.2" fill="#1E293B" />
          <circle cx="4" cy="-8" r="1.2" fill="#1E293B" />
          <path d="M-2.5,-3 Q0,-1 2.5,-3" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M6,10 Q14,8 18,13" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M18,10 L24,11 L22,20 L16,19 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M22,13 Q25,14 24,16 Q23,17 21,16" stroke="#1E293B" strokeWidth="1.6" fill="none" />
          <path d="M-12,14 L-15,35 M6,14 L4,35" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>

        {/* Bottom-Right Hexagon: Man clinking glass (Center: 288, 195, radius: 52) */}
        <g transform="translate(288, 195)">
          <polygon
            points="-52,0 -26,-45 26,-45 52,0 26,45 -26,45"
            fill="#94A3B8"
            stroke="#475569"
            strokeWidth="1.8"
          />
          <path d="M-12,-6 C-12,8 12,8 12,-6 C12,-16 -12,-16 -12,-6" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M-15,-10 C-10,-22 10,-22 15,-10 L-15,-10" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M-18,-8 L-22,-6 L-16,-6" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <rect x="-9" y="-8" width="7" height="5" rx="1" stroke="#1E293B" strokeWidth="1.6" fill="none" />
          <rect x="2" y="-8" width="7" height="5" rx="1" stroke="#1E293B" strokeWidth="1.6" fill="none" />
          <line x1="-2" y1="-6" x2="2" y2="-6" stroke="#1E293B" strokeWidth="1.6" />
          <path d="M-3,1 Q0,3 3,1" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M-6,10 Q-14,8 -18,13" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M-18,10 L-24,11 L-22,20 L-16,19 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M-22,13 Q-25,14 -24,16 Q-23,17 -21,16" stroke="#1E293B" strokeWidth="1.6" fill="none" />
          <path d="M-6,14 L-4,35 M12,14 L15,35" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>

        {/* Clink sparks between bottom left & right cups */}
        <g className="animate-clink-sparks" transform="translate(210, 208)" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round">
          <line x1="-8" y1="-8" x2="-3" y2="-3" />
          <line x1="8" y1="-8" x2="3" y2="-3" />
          <line x1="-8" y1="8" x2="-3" y2="3" />
          <line x1="8" y1="8" x2="3" y2="3" />
          <line x1="0" y1="-10" x2="0" y2="-4" />
          <line x1="0" y1="10" x2="0" y2="4" />
        </g>
      </svg>
    </div>
  );
};


function hexToHslStr(hex: string): string {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)} ${Math.round(l * 100)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .trim();
}

interface EnrichedCourse {
  title: string;
  duration: string;
  level: string;
  desc: string;
  rating: number;
  reviewsCount: number;
  categoryTag: string;
  instructor: {
    name: string;
    role: string;
    avatarUrl: string;
  };
}

function getEnrichedCourse(course: { title: string; duration: string; level: string; desc: string }, index: number, categoryName: string): EnrichedCourse {
  const ratings = [4.8, 4.9, 4.7, 4.6];
  const reviews = [320, 240, 185, 95];
  const rating = ratings[index % ratings.length];
  const reviewsCount = reviews[index % reviews.length];

  let categoryTag = categoryName;
  if (categoryName === "Computer Science") {
    const tags = ["Programming", "Algorithms", "Databases", "Software Engineering"];
    categoryTag = tags[index % tags.length];
  } else if (categoryName === "Information Technology") {
    const tags = ["Networking", "Cybersecurity", "Cloud Computing", "Systems"];
    categoryTag = tags[index % tags.length];
  } else if (categoryName === "Business & Management") {
    const tags = ["Entrepreneurship", "Marketing", "Finance", "Product"];
    categoryTag = tags[index % tags.length];
  } else if (categoryName === "Civil & Mechanical") {
    const tags = ["CAD Design", "Fluid Mechanics", "Structural", "Robotics"];
    categoryTag = tags[index % tags.length];
  } else if (categoryName === "Basic Sciences") {
    const tags = ["Mathematics", "Physics", "Chemistry", "Biology"];
    categoryTag = tags[index % tags.length];
  } else if (categoryName === "Humanities & Languages") {
    const tags = ["Literature", "Linguistics", "Philosophy", "History"];
    categoryTag = tags[index % tags.length];
  } else if (categoryName === "Personal Development") {
    const tags = ["Productivity", "Leadership", "Communication", "Mindfulness"];
    categoryTag = tags[index % tags.length];
  }

  const instructors = [
    { name: "Dr. Sarah Jenkins", role: "Course Author", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
    { name: "Alex Rivera", role: "Instructor", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
    { name: "Prof. David Miller", role: "Course Author", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" },
    { name: "Elena Rostova", role: "Instructor", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150" }
  ];
  const instructor = instructors[index % instructors.length];

  return {
    ...course,
    rating,
    reviewsCount,
    categoryTag,
    instructor
  };
}

const CATEGORY_TOPICS: Record<string, string[]> = {
  "Computer Science": ["Programming Logic", "Algorithms", "Relational Databases", "Software Engineering"],
  "Information Technology": ["IP Routing", "Cyber Security", "VPC Cloud", "Linux Bash", "DevOps CI/CD"],
  "Business & Management": ["Startup Valuation", "PPC SEO Marketing", "Corporate Accounting", "Product PRDs"],
  "Civil & Mechanical": ["CAD blueprints", "Fluid Dynamics", "Materials Stress", "Robotics Arms"],
  "Basic Sciences": ["Linear Algebra", "Vector Calculus", "Electromagnetism", "Chemical Dynamics"],
  "Humanities & Languages": ["Professional Writing", "Spoken English", "Public Speech", "Corporate Ethics"],
  "Personal Development": ["Time Management", "Financial IQ", "Personal Branding", "Public Speaking"]
};

const CATEGORY_HEADLINES: Record<string, { main: string; highlight: string }> = {
  "Computer Science": { main: "Build the Future of ", highlight: "Software" },
  "Information Technology": { main: "Secure & Scale Modern ", highlight: "Infrastructure" },
  "Business & Management": { main: "Lead Teams & Scale ", highlight: "Enterprises" },
  "Civil & Mechanical": { main: "Design & Engineer the ", highlight: "Physical World" },
  "Basic Sciences": { main: "Uncover the Laws of ", highlight: "Nature" },
  "Humanities & Languages": { main: "Express, Connect & ", highlight: "Communicate" },
  "Personal Development": { main: "Invest in Your Infinite ", highlight: "Potential" }
};

interface Token {
  text: string;
  type?: "kw" | "str" | "fn" | "com" | "var" | "num";
}

interface EditorLine {
  ln: number;
  tokens: Token[];
}

interface EditorContent {
  filename: string;
  language: string;
  matchedText: string;
  lines: EditorLine[];
}

const CATEGORY_EDITOR_TABS: Record<string, EditorContent[]> = {
  "Computer Science": [
    {
      filename: "query.sql",
      language: "sql",
      matchedText: "4 rows matched",
      lines: [
        { ln: 1, tokens: [{ text: "-- find the right course for you", type: "com" }] },
        { ln: 2, tokens: [{ text: "SELECT ", type: "kw" }, { text: "title, level, duration", type: "var" }] },
        { ln: 3, tokens: [{ text: "FROM ", type: "kw" }, { text: "courses", type: "fn" }] },
        { ln: 4, tokens: [{ text: "WHERE ", type: "kw" }, { text: "category = ", type: "var" }, { text: "'computer_science'", type: "str" }] },
        { ln: 5, tokens: [{ text: "AND ", type: "kw" }, { text: "rating >= ", type: "var" }, { text: "4.7", type: "num" }] },
        { ln: 6, tokens: [{ text: "ORDER BY ", type: "kw" }, { text: "rating ", type: "var" }, { text: "DESC", type: "kw" }, { text: ";" }] }
      ]
    },
    {
      filename: "schema.ts",
      language: "typescript",
      matchedText: "Compiled successfully",
      lines: [
        { ln: 1, tokens: [{ text: "// database table schema definitions", type: "com" }] },
        { ln: 2, tokens: [{ text: "export const ", type: "kw" }, { text: "courses = ", type: "var" }, { text: "pgTable", type: "fn" }, { text: "(", type: "var" }, { text: '"courses"', type: "str" }, { text: ", {" }] },
        { ln: 3, tokens: [{ text: "  id: ", type: "var" }, { text: "uuid", type: "fn" }, { text: "(", type: "var" }, { text: '"id"', type: "str" }, { text: ").", type: "var" }, { text: "defaultRandom", type: "fn" }, { text: "().", type: "var" }, { text: "primaryKey", type: "fn" }, { text: "()," }] },
        { ln: 4, tokens: [{ text: "  title: ", type: "var" }, { text: "text", type: "fn" }, { text: "(", type: "var" }, { text: '"title"', type: "str" }, { text: ").", type: "var" }, { text: "notNull", type: "fn" }, { text: "()," }] },
        { ln: 5, tokens: [{ text: "  level: ", type: "var" }, { text: "text", type: "fn" }, { text: "(", type: "var" }, { text: '"level"', type: "str" }, { text: ").", type: "var" }, { text: "notNull", type: "fn" }, { text: "()" }] },
        { ln: 6, tokens: [{ text: "});", type: "var" }] }
      ]
    }
  ],
  "Information Technology": [
    {
      filename: "deploy.yml",
      language: "yaml",
      matchedText: "playbook: ok=3 failed=0",
      lines: [
        { ln: 1, tokens: [{ text: "# provision modern cloud infrastructure", type: "com" }] },
        { ln: 2, tokens: [{ text: "- hosts: ", type: "kw" }, { text: "webservers", type: "str" }] },
        { ln: 3, tokens: [{ text: "  tasks:", type: "kw" }] },
        { ln: 4, tokens: [{ text: "    - name: ", type: "kw" }, { text: "start application backend", type: "str" }] },
        { ln: 5, tokens: [{ text: "      service: ", type: "kw" }, { text: "name=arcade state=started", type: "var" }] },
        { ln: 6, tokens: [{ text: "    - name: ", type: "kw" }, { text: "verify secure ssl routing", type: "str" }] }
      ]
    },
    {
      filename: "nginx.conf",
      language: "nginx",
      matchedText: "Syntax check OK",
      lines: [
        { ln: 1, tokens: [{ text: "# configure reverse proxy load balancer", type: "com" }] },
        { ln: 2, tokens: [{ text: "server {", type: "var" }] },
        { ln: 3, tokens: [{ text: "    listen ", type: "kw" }, { text: "80", type: "num" }, { text: ";", type: "var" }] },
        { ln: 4, tokens: [{ text: "    server_name ", type: "kw" }, { text: "arcade.college.edu", type: "str" }, { text: ";", type: "var" }] },
        { ln: 5, tokens: [{ text: "    location /api/ {", type: "var" }] },
        { ln: 6, tokens: [{ text: "        proxy_pass ", type: "kw" }, { text: "http://backend_upstream", type: "str" }, { text: ";", type: "var" }] }
      ]
    }
  ],
  "Business & Management": [
    {
      filename: "dashboard.gs",
      language: "javascript",
      matchedText: "Execution finished",
      lines: [
        { ln: 1, tokens: [{ text: "// calculate student cohort conversion", type: "com" }] },
        { ln: 2, tokens: [{ text: "function ", type: "kw" }, { text: "getConversionRate", type: "fn" }, { text: "(users, cohort) {", type: "var" }] },
        { ln: 3, tokens: [{ text: "  const active = users.", type: "var" }, { text: "filter", type: "fn" }, { text: "(u => u.isAcquired);", type: "var" }] },
        { ln: 4, tokens: [{ text: "  return ", type: "kw" }, { text: "(active.length / users.length) * ", type: "var" }, { text: "100", type: "num" }, { text: ";", type: "var" }] },
        { ln: 5, tokens: [{ text: "}", type: "var" }] }
      ]
    },
    {
      filename: "report.csv",
      language: "csv",
      matchedText: "3 cohorts parsed",
      lines: [
        { ln: 1, tokens: [{ text: "# marketing conversions report Q3", type: "com" }] },
        { ln: 2, tokens: [{ text: "Cohort,Impressions,AcquisitionRate", type: "var" }] },
        { ln: 3, tokens: [{ text: "AdWords_CS,", type: "var" }, { text: "14200", type: "num" }, { text: ",", type: "var" }, { text: "0.038", type: "num" }] },
        { ln: 4, tokens: [{ text: "LinkedIn_AI,", type: "var" }, { text: "8400", type: "num" }, { text: ",", type: "var" }, { text: "0.052", type: "num" }] },
        { ln: 5, tokens: [{ text: "Organic_Direct,", type: "var" }, { text: "45000", type: "num" }, { text: ",", type: "var" }, { text: "0.095", type: "num" }] }
      ]
    }
  ],
  "Civil & Mechanical": [
    {
      filename: "cad.gcode",
      language: "gcode",
      matchedText: "G-Code syntax OK",
      lines: [
        { ln: 1, tokens: [{ text: "; compute mechanical stress coordinates", type: "com" }] },
        { ln: 2, tokens: [{ text: "G21 ", type: "kw" }, { text: "; set units to millimeters", type: "com" }] },
        { ln: 3, tokens: [{ text: "G90 ", type: "kw" }, { text: "; absolute positioning", type: "com" }] },
        { ln: 4, tokens: [{ text: "G0 ", type: "kw" }, { text: "X0 Y0 Z10 ", type: "var" }, { text: "; lift nozzle", type: "com" }] },
        { ln: 5, tokens: [{ text: "G1 ", type: "kw" }, { text: "Z0.2 F3000 ", type: "var" }, { text: "; begin print layer", type: "com" }] }
      ]
    },
    {
      filename: "bridge.stl",
      language: "stl",
      matchedText: "Mesh verified",
      lines: [
        { ln: 1, tokens: [{ text: "# stl triangular mesh representation", type: "com" }] },
        { ln: 2, tokens: [{ text: "solid ", type: "kw" }, { text: "BridgeBearing", type: "fn" }] },
        { ln: 3, tokens: [{ text: "  facet normal ", type: "var" }, { text: "0 0 1", type: "num" }] },
        { ln: 4, tokens: [{ text: "    outer loop", type: "var" }] },
        { ln: 5, tokens: [{ text: "      vertex ", type: "var" }, { text: "0.0 0.0 0.0", type: "num" }] },
        { ln: 6, tokens: [{ text: "      vertex ", type: "var" }, { text: "10.0 0.0 0.0", type: "num" }] }
      ]
    }
  ],
  "Basic Sciences": [
    {
      filename: "math.py",
      language: "python",
      matchedText: "Determinant: -2.00",
      lines: [
        { ln: 1, tokens: [{ text: "# compute matrix transformation", type: "com" }] },
        { ln: 2, tokens: [{ text: "import ", type: "kw" }, { text: "numpy ", type: "var" }, { text: "as ", type: "kw" }, { text: "np", type: "var" }] },
        { ln: 3, tokens: [{ text: "A = np.", type: "var" }, { text: "array", type: "fn" }, { text: "([[", type: "var" }, { text: "1", type: "num" }, { text: ", ", type: "var" }, { text: "2", type: "num" }, { text: "], [", type: "var" }, { text: "3", type: "num" }, { text: ", ", type: "var" }, { text: "4", type: "num" }, { text: "]])", type: "var" }] },
        { ln: 4, tokens: [{ text: "vals, vecs = np.linalg.", type: "var" }, { text: "eig", type: "fn" }, { text: "(A)", type: "var" }] },
        { ln: 5, tokens: [{ text: "print", type: "kw" }, { text: "(", type: "var" }, { text: '"Eigenvalues:", vals', type: "str" }, { text: ")" }] }
      ]
    },
    {
      filename: "plot.m",
      language: "matlab",
      matchedText: "Render complete",
      lines: [
        { ln: 1, tokens: [{ text: "% plot differential equation field", type: "com" }] },
        { ln: 2, tokens: [{ text: "[X, Y] = ", type: "var" }, { text: "meshgrid", type: "fn" }, { text: "(", type: "var" }, { text: "-2:.2:2", type: "num" }, { text: ", ", type: "var" }, { text: "-2:.2:2", type: "num" }, { text: ");", type: "var" }] },
        { ln: 3, tokens: [{ text: "DY = X - Y.^", type: "var" }, { text: "2", type: "num" }, { text: ";", type: "var" }] },
        { ln: 4, tokens: [{ text: "DX = ", type: "var" }, { text: "ones", type: "fn" }, { text: "(", type: "var" }, { text: "size", type: "fn" }, { text: "(DY));", type: "var" }] },
        { ln: 5, tokens: [{ text: "quiver", type: "fn" }, { text: "(X, Y, DX, DY);", type: "var" }] }
      ]
    }
  ],
  "Humanities & Languages": [
    {
      filename: "essay.md",
      language: "markdown",
      matchedText: "Word count: 350",
      lines: [
        { ln: 1, tokens: [{ text: "# The Power of Rhetoric and Writing", type: "com" }] },
        { ln: 2, tokens: [{ text: "Professional communication bridges technical silos.", type: "var" }] },
        { ln: 3, tokens: [{ text: "* Active voice", type: "str" }] },
        { ln: 4, tokens: [{ text: "* Clear organization", type: "str" }] },
        { ln: 5, tokens: [{ text: "* Contextual vocabulary", type: "str" }] }
      ]
    },
    {
      filename: "dict.json",
      language: "json",
      matchedText: "3 terms loaded",
      lines: [
        { ln: 1, tokens: [{ text: "{", type: "var" }] },
        { ln: 2, tokens: [{ text: '  "vocab": ', type: "kw" }, { text: "{", type: "var" }] },
        { ln: 3, tokens: [{ text: '    "rhetoric": ', type: "kw" }, { text: '"persuasive speaking"', type: "str" }, { text: ",", type: "var" }] },
        { ln: 4, tokens: [{ text: '    "syntax": ', type: "kw" }, { text: '"word arrangement"', type: "str" }] },
        { ln: 5, tokens: [{ text: "  }", type: "var" }] },
        { ln: 6, tokens: [{ text: "}", type: "var" }] }
      ]
    }
  ],
  "Personal Development": [
    {
      filename: "goals.json",
      language: "json",
      matchedText: "Validated JSON",
      lines: [
        { ln: 1, tokens: [{ text: "{", type: "var" }] },
        { ln: 2, tokens: [{ text: '  "objective": ', type: "kw" }, { text: '"continuous_growth"', type: "str" }, { text: "," }] },
        { ln: 3, tokens: [{ text: '  "habits": ', type: "kw" }, { text: "[", type: "var" }] },
        { ln: 4, tokens: [{ text: '    "read_20_mins_daily"', type: "str" }, { text: ",", type: "var" }] },
        { ln: 5, tokens: [{ text: '    "code_practice"', type: "str" }] },
        { ln: 6, tokens: [{ text: '  ]', type: "var" }, { text: ",", type: "var" }] },
        { ln: 7, tokens: [{ text: '  "status": ', type: "kw" }, { text: '"in_progress"', type: "str" }] },
        { ln: 8, tokens: [{ text: "}", type: "var" }] }
      ]
    },
    {
      filename: "journal.txt",
      language: "text",
      matchedText: "Reflection logged",
      lines: [
        { ln: 1, tokens: [{ text: "-- weekly reflection & habit tracker", type: "com" }] },
        { ln: 2, tokens: [{ text: "1. Read 20 mins every morning [OK]", type: "var" }] },
        { ln: 3, tokens: [{ text: "2. Exercise 3 times a week [OK]", type: "var" }] },
        { ln: 4, tokens: [{ text: "3. Learn new coding skills daily [OK]", type: "var" }] }
      ]
    }
  ]
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Computer Science": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),

  "Information Technology": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  ),
  "Business & Management": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  "Civil & Mechanical": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  "Basic Sciences": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  "Humanities & Languages": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5v-15z" />
    </svg>
  ),
  "Personal Development": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  )
};

// Color presets for custom graphic header meshes
const HEADER_COLOR_MESHES: Record<string, string> = {
  "Computer Science": "radial-gradient(at 10% 20%, rgba(139, 92, 246, 0.15) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(59, 130, 246, 0.1) 0px, transparent 50%)",

  "Information Technology": "radial-gradient(at 10% 20%, rgba(59, 130, 246, 0.15) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(6, 182, 212, 0.1) 0px, transparent 50%)",
  "Business & Management": "radial-gradient(at 10% 20%, rgba(245, 158, 11, 0.15) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(239, 68, 68, 0.1) 0px, transparent 50%)",
  "Civil & Mechanical": "radial-gradient(at 10% 20%, rgba(16, 185, 129, 0.15) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(14, 165, 233, 0.1) 0px, transparent 50%)",
  "Basic Sciences": "radial-gradient(at 10% 20%, rgba(20, 184, 166, 0.15) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(99, 102, 241, 0.1) 0px, transparent 50%)",
  "Humanities & Languages": "radial-gradient(at 10% 20%, rgba(79, 70, 229, 0.15) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(219, 39, 119, 0.1) 0px, transparent 50%)",
  "Personal Development": "radial-gradient(at 10% 20%, rgba(101, 163, 13, 0.15) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(234, 179, 8, 0.1) 0px, transparent 50%)"
};

function getCourseGlyph(title: string, index: number, color: string): React.ReactNode {
  const norm = title.toLowerCase();

  if (norm.includes("database") || norm.includes("sql") || norm.includes("query")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <rect x="4" y="3" width="16" height="12" rx="1.5" />
        <line x1="9" y1="21" x2="16" y2="21" />
        <line x1="12" y1="15" x2="12" y2="21" />
      </svg>
    );
  }
  if (norm.includes("structure") || norm.includes("algorithm")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <path d="M4 6h16M4 12h10M4 18h13" />
        <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (norm.includes("principle") || norm.includes("architecture") || norm.includes("design") || norm.includes("software")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
        <path d="M12 12v9M4 7.5l8 4.5 8-4.5" />
      </svg>
    );
  }
  if (norm.includes("operating") || norm.includes("system") || norm.includes("concurrency") || norm.includes("network")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <rect x="4" y="4" width="16" height="7" rx="1.5" />
        <rect x="4" y="13" width="16" height="7" rx="1.5" />
        <circle cx="7.5" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="7.5" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  // Fallbacks by index
  const m = index % 4;
  if (m === 0) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <rect x="4" y="3" width="16" height="12" rx="1.5" />
        <line x1="9" y1="21" x2="16" y2="21" />
        <line x1="12" y1="15" x2="12" y2="21" />
      </svg>
    );
  }
  if (m === 1) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <path d="M4 6h16M4 12h10M4 18h13" />
        <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (m === 2) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
        <path d="M12 12v9M4 7.5l8 4.5 8-4.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
      <rect x="4" y="4" width="16" height="7" rx="1.5" />
      <rect x="4" y="13" width="16" height="7" rx="1.5" />
      <circle cx="7.5" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="7.5" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

interface CategoryPillButtonProps {
  item: string;
  isActive: boolean;
  itemData: any;
  onClick: () => void;
  children: React.ReactNode;
}

const CategoryPillButton: React.FC<CategoryPillButtonProps> = ({
  item,
  isActive,
  itemData,
  onClick,
  children
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const isHoveredRef = useRef(false);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

  const glowColor = hexToRgbStr(itemData.colors.primary);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        }
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!buttonRef.current || !isHoveredRef.current) return;

    const { width, height } = buttonRef.current.getBoundingClientRect();

    // Subtle star particles tailored for smaller button sizes
    for (let i = 0; i < 6; i++) {
      const px = Math.random() * width;
      const py = Math.random() * height;

      const particle = document.createElement("div");
      particle.className = "category-particle";
      particle.style.cssText = `
        position: absolute;
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: rgba(${glowColor}, 1);
        box-shadow: 0 0 4px rgba(${glowColor}, 0.6);
        pointer-events: none;
        z-index: 10;
        left: ${px}px;
        top: ${py}px;
      `;

      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !buttonRef.current) return;
        buttonRef.current.appendChild(particle);
        particlesRef.current.push(particle);

        gsap.fromTo(particle, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" });

        gsap.to(particle, {
          x: (Math.random() - 0.5) * 50,
          y: (Math.random() - 0.5) * 50,
          rotation: Math.random() * 360,
          duration: 1.5 + Math.random() * 1.5,
          ease: "none",
          repeat: -1,
          yoyo: true
        });

        gsap.to(particle, {
          opacity: 0.3,
          duration: 1.2,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true
        });
      }, i * 120);

      timeoutsRef.current.push(timeoutId);
    }
  }, [glowColor]);

  useEffect(() => {
    const element = buttonRef.current;
    if (!element) return;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      // Subtle 3D tilt on hover
      gsap.to(element, {
        rotateX: 4,
        rotateY: 4,
        duration: 0.3,
        ease: "power2.out",
        transformPerspective: 600
      });
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();

      gsap.to(element, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.3,
        ease: "power2.out"
      });

      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      gsap.to(element, {
        rotateX,
        rotateY,
        duration: 0.1,
        ease: "power2.out",
        transformPerspective: 600
      });

      // Magnetism: subtle attraction to cursor
      const magnetX = (x - centerX) * 0.08;
      const magnetY = (y - centerY) * 0.08;
      magnetismAnimationRef.current = gsap.to(element, {
        x: magnetX,
        y: magnetY,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const handleClick = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.3) 0%, rgba(${glowColor}, 0.1) 40%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 10;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
          onComplete: () => ripple.remove()
        }
      );
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("click", handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("click", handleClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, glowColor]);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={`magic-bento-card category-bento-card category-bento-card--border-glow`}
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 20px",
        borderRadius: "14px",
        border: isActive ? `1.5px solid ${itemData.colors.primary}` : "1.5px solid rgba(20, 23, 31, 0.06)",
        background: isActive ? itemData.colors.secondary : "rgba(255, 255, 255, 0.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        color: isActive ? itemData.colors.primary : "#5E606A",
        fontSize: "0.9rem",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow: isActive
          ? `0 10px 20px -8px ${itemData.colors.primary}33`
          : "0 4px 10px -2px rgba(0,0,0,0.02)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "--glow-color": glowColor
      } as React.CSSProperties}
    >
      {children}
    </button>
  );
};



type CategoryDetailedViewProps = {
  /** When set (e.g. `/search`), stay inside the authenticated hub instead of public landing routes. */
  hubBasePath?: string;
  mode?: "courses" | "events" | "articles";
};

export default function CategoryDetailedView({ hubBasePath, mode = "courses" }: CategoryDetailedViewProps = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const exploreHome = hubBasePath || (mode === "events" ? "/events" : mode === "articles" ? "/articles" : "/explore");
  const isEmbeddedHub = Boolean(hubBasePath);

  // Route selector
  const initialCategory = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [courseStats, setCourseStats] = useState<Record<string, { averageRating: number; reviewsCount: number }>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<ExploreFilters>({
    courseLevel: "All Levels",
    courseDuration: "All",
    coursePrice: "All",
    courseAuthor: "All",
    eventStatus: "All",
    articleType: "All",
  });

  const [journeyCompleted, setJourneyCompleted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const progressValue = useMotionValue(0);

  useEffect(() => {
    setJourneyCompleted(false);
    progressValue.set(0);
  }, [activeCategory, progressValue]);

  useEffect(() => {
    if (mode !== "events") return;

    if (journeyCompleted) {
      progressValue.set(1);
      return;
    }

    // Lock page scroll initially
    document.body.style.overflow = "hidden";

    let currentProgress = 0;
    const scrollStep = 0.15;

    const handleWheel = (e: WheelEvent) => {
      if (currentProgress >= 1) return;

      // Prevent page from scrolling
      e.preventDefault();

      // Support scroll down (forward) and scroll up (backward)
      if (e.deltaY > 0) {
        currentProgress = Math.min(currentProgress + scrollStep, 1);
      } else {
        currentProgress = Math.max(currentProgress - scrollStep, 0);
      }
      progressValue.set(currentProgress);

      if (currentProgress >= 1) {
        // Unlock page scroll
        document.body.style.overflow = "";
        setJourneyCompleted(true);
      }
    };

    let touchStart = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStart = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (currentProgress >= 1) return;

      e.preventDefault();

      const touchEnd = e.touches[0].clientY;
      const diff = touchStart - touchEnd;

      if (diff > 8) {
        currentProgress = Math.min(currentProgress + scrollStep, 1);
      } else if (diff < -8) {
        currentProgress = Math.max(currentProgress - scrollStep, 0);
      }
      progressValue.set(currentProgress);
      touchStart = touchEnd;

      if (currentProgress >= 1) {
        document.body.style.overflow = "";
        setJourneyCompleted(true);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [mode, progressValue, journeyCompleted]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await api.get<Record<string, { averageRating: number; reviewsCount: number }>>("/api/v1/reviews/stats");
        setCourseStats(stats);
      } catch (err: any) {
        // Silently ignore dummy fetch errors
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (initialCategory && categoriesList.includes(initialCategory)) {
      setActiveCategory(initialCategory);
    } else {
      setActiveCategory("Computer Science"); // Fallback default
    }
  }, [initialCategory]);

  const activeCategoryName = activeCategory || "Computer Science";
  const activeData = CATEGORY_DATA[activeCategoryName];

  // Sync body background so the footer (rendered outside this component) blends seamlessly.
  // Only active on articles mode — cleans up on unmount so other pages are unaffected.
  useEffect(() => {
    if (mode !== "articles") return;

    const ARTICLES_BODY_BG: Record<string, string> = {
      "Computer Science":       "linear-gradient(160deg, #FDF6E3 0%, #FAF0D4 35%, #FFF8EA 70%, #F5EFD8 100%)",
      "Information Technology": "linear-gradient(160deg, #FFF8F0 0%, #FEECD8 35%, #FFF3E0 70%, #FDE8C8 100%)",
      "Business & Management":  "linear-gradient(160deg, #FFF9EC 0%, #FEF2D0 35%, #FFFBF0 70%, #FAEAC0 100%)",
      "Civil & Mechanical":     "linear-gradient(160deg, #F6F9F0 0%, #EBF3E0 35%, #F5FAF0 70%, #E2EED4 100%)",
      "Basic Sciences":         "linear-gradient(160deg, #FDF8F0 0%, #FAF0E0 35%, #FEFAF5 70%, #F5EDE0 100%)",
      "Humanities & Languages": "linear-gradient(160deg, #FDF4EE 0%, #FBEAD8 35%, #FDF8F0 70%, #F7E4D0 100%)",
      "Personal Development":   "linear-gradient(160deg, #FDFAF0 0%, #FAF3D8 35%, #FDFDF5 70%, #F3EDD0 100%)",
    };

    const bg = ARTICLES_BODY_BG[activeCategoryName] ?? ARTICLES_BODY_BG["Computer Science"];
    const prev = document.body.style.background;
    document.body.style.background = bg;

    return () => {
      document.body.style.background = prev;
    };
  }, [mode, activeCategoryName]);

  const handleCategorySwitch = (category: string) => {
    setActiveCategory(category);
    setCourseSearchQuery("");

    const base = hubBasePath || window.location.pathname;
    const newUrl = `${base}?category=${encodeURIComponent(category)}`;
    window.history.replaceState(null, "", newUrl);
  };

  const goToExploreHome = () => {
    router.push(exploreHome);
  };

  const ARTICLES_BG: Record<string, string> = {
    "Computer Science":       "linear-gradient(160deg, #FDF6E3 0%, #FAF0D4 35%, #FFF8EA 70%, #F5EFD8 100%)", // warm antique parchment
    "Information Technology": "linear-gradient(160deg, #FFF8F0 0%, #FEECD8 35%, #FFF3E0 70%, #FDE8C8 100%)", // soft amber scroll
    "Business & Management":  "linear-gradient(160deg, #FFF9EC 0%, #FEF2D0 35%, #FFFBF0 70%, #FAEAC0 100%)", // golden honey
    "Civil & Mechanical":     "linear-gradient(160deg, #F6F9F0 0%, #EBF3E0 35%, #F5FAF0 70%, #E2EED4 100%)", // earthy sage parchment
    "Basic Sciences":         "linear-gradient(160deg, #FDF8F0 0%, #FAF0E0 35%, #FEFAF5 70%, #F5EDE0 100%)", // warm cream linen
    "Humanities & Languages": "linear-gradient(160deg, #FDF4EE 0%, #FBEAD8 35%, #FDF8F0 70%, #F7E4D0 100%)", // warm terracotta scroll
    "Personal Development":   "linear-gradient(160deg, #FDFAF0 0%, #FAF3D8 35%, #FDFDF5 70%, #F3EDD0 100%)", // old vellum yellow
  };

  const articlesBackground = ARTICLES_BG[activeCategoryName] ?? "linear-gradient(160deg, #FDF6E3 0%, #FAF0D4 35%, #FFF8EA 70%, #F5EFD8 100%)";

  return (
    <div
      className="landing-root"
      style={{
        background: mode === "events" ? "linear-gradient(135deg, #FDF4FF 0%, #F5F3FF 50%, #E0F2FE 100%)" : // Pastel lavender-violet-blue sunset mix
          mode === "articles" ? articlesBackground : // Dynamic per-category gradient
            "#f8fafc",
        // Authenticated hub already clears the dock via LearnerShell pb-28.
        // Override .landing-root { min-height: 100vh } so short pages don't leave a blank footer.
        minHeight: isEmbeddedHub ? "auto" : "100vh",
        paddingBottom: isEmbeddedHub ? "8px" : "100px",
        color: "inherit"
      }}
    >
      <style>{`
        .course-card-premium {
          transition: all 0.18s ease !important;
        }
        .hover-card-y {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .hover-card-y:hover {
          transform: translateY(-4px) !important;
          background: rgba(255, 255, 255, 0.85) !important;
          box-shadow: 0 12px 30px -8px rgba(20, 23, 31, 0.06) !important;
          border-color: rgba(20, 23, 31, 0.12) !important;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hero-visual {
          background: #1b192a !important;
          display: flex;
          flex-direction: column;
          position: relative;
          min-height: 100%;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
          width: 100%;
        }
        .editor-topbar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          border-bottom: 1px solid #2c2a42;
        }
        .editor-dots {
          display: flex;
          gap: 6px;
        }
        .editor-dots span {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #3a3856;
        }
        .editor-tabs {
          display: flex;
          gap: 2px;
          margin-left: 14px;
        }
        .editor-tab {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.75rem;
          color: #8b88a8;
          padding: 6px 12px;
          border-radius: 7px 7px 0 0;
        }
        .editor-tab.active {
          background: #252340;
          color: #e3e1f5;
        }
        .editor-body {
          padding: 24px 24px 28px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.86rem;
          line-height: 1.9;
          flex: 1;
          overflow: hidden;
          color: #e3e1f5;
          text-align: left;
        }
        .editor-body .ln {
          color: #4c4a6b;
          display: inline-block;
          width: 22px;
          user-select: none;
        }
        .tok-kw { color: #c792ea; }
        .tok-str { color: #9ad189; }
        .tok-fn { color: #82aaff; }
        .tok-com { color: #5c5a7c; font-style: italic; }
        .tok-var { color: #e3e1f5; }
        .tok-num { color: #f2a65a; }
        .caret {
          display: inline-block;
          width: 7px;
          height: 16px;
          background: #e8a23a;
          vertical-align: middle;
          margin-left: 2px;
          animation: blink 1.1s steps(1) infinite;
        }
        @keyframes blink { 50% { opacity: 0; } }
        .editor-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
          border-top: 1px solid #2c2a42;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.72rem;
          color: #736f97;
        }
        .editor-status .ok { color: #9ad189; }
        .course-card-premium:hover .view-arrow {
          transform: translateX(3px) !important;
        }

        /* Magic Bento Banner Styles */
        .magic-bento-banner {
          --glow-x: 50%;
          --glow-y: 50%;
          --glow-intensity: 0;
          --glow-radius: 400px;
          --glow-color: 139, 92, 246;
          position: relative;
          background: rgba(255, 255, 255, 0.65) !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(20, 23, 31, 0.06) !important;
          border-radius: 24px !important;
          padding: 48px 48px;
          color: var(--l-ink) !important;
          overflow: hidden;
          box-shadow: 0 12px 30px -10px rgba(20, 23, 31, 0.04), 0 4px 10px -4px rgba(20, 23, 31, 0.02);
          margin-bottom: 56px;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          align-items: center;
          gap: 40px;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          z-index: 10;
        }

        .magic-bento-banner--border-glow::after {
          content: '';
          position: absolute;
          inset: 0;
          padding: 1.5px;
          background: radial-gradient(
            var(--glow-radius) circle at var(--glow-x) var(--glow-y),
            rgba(var(--glow-color), calc(var(--glow-intensity) * 0.8)) 0%,
            rgba(var(--glow-color), calc(var(--glow-intensity) * 0.3)) 30%,
            transparent 60%
          );
          border-radius: inherit;
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          mask-composite: exclude;
          pointer-events: none;
          opacity: 1;
          transition: opacity 0.3s ease;
          z-index: 1;
        }

        .magic-bento-banner--border-glow:hover {
          box-shadow:
            0 20px 45px -15px rgba(var(--glow-color), 0.2),
            0 8px 20px -8px rgba(20, 23, 31, 0.04) !important;
          border-color: rgba(var(--glow-color), 0.2) !important;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 100;
        }

        .particle::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: rgba(var(--glow-color), 0.2);
          border-radius: 50%;
          z-index: -1;
        }

        /* Category Selector MagicBento Styles */
        .category-bento-card {
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          --glow-x: 50%;
          --glow-y: 50%;
          --glow-intensity: 0;
          --glow-radius: 120px;
        }

        .category-bento-card--border-glow::after {
          content: '';
          position: absolute;
          inset: 0;
          padding: 1.5px;
          background: radial-gradient(
            var(--glow-radius) circle at var(--glow-x) var(--glow-y),
            rgba(var(--glow-color), calc(var(--glow-intensity) * 0.85)) 0%,
            rgba(var(--glow-color), calc(var(--glow-intensity) * 0.4)) 30%,
            transparent 60%
          );
          border-radius: inherit;
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          mask-composite: exclude;
          pointer-events: none;
          opacity: 1;
          transition: opacity 0.3s ease;
          z-index: 1;
        }

        .category-bento-card--border-glow:hover {
          box-shadow:
            0 8px 20px -6px rgba(var(--glow-color), 0.25),
            0 4px 10px -4px rgba(20, 23, 31, 0.02) !important;
        }

        .category-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 10;
        }

        .category-particle::before {
          content: '';
          position: absolute;
          top: -1.5px;
          left: -1.5px;
          right: -1.5px;
          bottom: -1.5px;
          background: rgba(var(--glow-color), 0.2);
          border-radius: 50%;
          z-index: -1;
        }
      `}</style>

      {/* Main Container — embedded hub needs clearance under fixed learner navbar (top-6 + h-12) */}
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: isEmbeddedHub ? "88px 24px 0" : "100px 24px 0",
          position: "relative",
          zIndex: 1,
        }}
      >

        {/* Breadcrumb back into explore hub (authenticated) or public explore */}
        <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", marginBottom: isEmbeddedHub ? "16px" : "28px", gap: "12px" }}>
          
          {/* Hamburger Filter Toggle Button */}
          <button 
            onClick={() => {
              if (mode === "events" && !journeyCompleted) {
                setJourneyCompleted(true);
                progressValue.set(1);
                document.body.style.overflow = "";
              }
              setIsSidebarOpen(!isSidebarOpen);
            }}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              width: "42px", 
              height: "42px", 
              borderRadius: "12px", 
              background: "rgba(255, 255, 255, 0.65)",
              border: "1px solid rgba(20, 23, 31, 0.06)",
              cursor: "pointer", 
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.02)",
              color: "var(--l-ink)",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = activeData.colors.primary; e.currentTarget.style.borderColor = activeData.colors.primary; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--l-ink)"; e.currentTarget.style.borderColor = "rgba(20, 23, 31, 0.06)"; }}
            title="Toggle Filters Sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "rgba(20, 20, 43, 0.55)",
              background: "rgba(255, 255, 255, 0.65)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(20, 23, 31, 0.06)",
              padding: "10px 18px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.02)"
            }}
          >
            <a
              href="/explore"
              style={{ cursor: "pointer", transition: "color 0.2s", textDecoration: "none", color: "inherit" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = activeData.colors.primary; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "inherit"; }}
            >
              Explore
            </a>
            <span>/</span>
            <a
              href="/explore"
              style={{ cursor: "pointer", transition: "color 0.2s", textDecoration: "none", color: "inherit" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = activeData.colors.primary; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "inherit"; }}
            >
              Departments
            </a>
            <span>/</span>
            <span style={{ color: activeData.colors.primary, fontWeight: "700" }}>{activeCategoryName}</span>
          </div>
        </div>

        {mode === "events" ? (
          /* Redesigned Hero Section for Events / Live Sessions */
          <div
            ref={heroRef}
            style={{
              position: "relative",
              marginBottom: isEmbeddedHub ? "20px" : "56px",
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              alignItems: isEmbeddedHub ? "start" : "center",
              gap: isEmbeddedHub ? "24px" : "40px",
              zIndex: 10,
              padding: isEmbeddedHub ? "0" : "24px 0",
            }}
          >
            {/* Banner Left Info */}
            <div style={{ position: "relative", zIndex: 2 }}>
              {/* Removed Eyebrow Label as requested */}

              {/* 2. MAIN HEADING */}
              <h1
                style={{
                  fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  lineHeight: "1.1",
                  marginBottom: "20px",
                  color: "var(--l-ink)",
                  fontFamily: "'Space Grotesk', sans-serif"
                }}
              >
                Build the Future <br />
                <span style={{ fontSize: "0.85em", fontWeight: 700 }}>with </span>
                <span
                  style={{
                    background: "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    display: "inline-block"
                  }}
                >
                  {activeCategoryName}
                </span>
              </h1>

              {/* 3. SUPPORTING TEXT */}
              <p
                style={{
                  fontSize: "0.98rem",
                  color: "rgba(20, 20, 43, 0.65)",
                  lineHeight: "1.65",
                  maxWidth: "580px",
                  marginBottom: "28px",
                  fontWeight: 500
                }}
              >
                Learn from experts, join live sessions, and build practical skills through events, bootcamps, and hands-on experiences designed for the next generation of developers.
              </p>

              {/* 5. FEATURE HIGHLIGHTS */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "16px",
                  marginBottom: "32px",
                  maxWidth: "580px"
                }}
              >
                {[
                  {
                    title: "Live & Interactive",
                    desc: "Real-time learning",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="3" fill="currentColor" />
                      </svg>
                    )
                  },
                  {
                    title: "Expert Speakers",
                    desc: "Industry professionals",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    )
                  },
                  {
                    title: "Hands-on Learning",
                    desc: "Build real-world skills",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    )
                  },
                  {
                    title: "Flexible Schedule",
                    desc: "Learn at your pace",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    )
                  }
                ].map((feat, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      background: "rgba(255, 255, 255, 0.55)",
                      border: "1px solid rgba(20, 23, 31, 0.05)",
                      padding: "10px 14px",
                      borderRadius: "12px"
                    }}
                  >
                    <div
                      style={{
                        color: activeData.colors.primary,
                        background: `${activeData.colors.secondary}`,
                        padding: "6px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {feat.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: "800", color: "var(--l-ink)" }}>{feat.title}</div>
                      <div style={{ fontSize: "0.72rem", color: "rgba(20, 20, 43, 0.5)" }}>{feat.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 6. SEARCH */}
              <div style={{ position: "relative", maxWidth: "480px", marginBottom: isEmbeddedHub ? "0" : "20px" }}>
                <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search courses under this category..."
                  value={courseSearchQuery}
                  onChange={(e) => setCourseSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 20px 14px 48px",
                    borderRadius: "14px",
                    border: "1px solid rgba(20, 23, 31, 0.06)",
                    background: "rgba(255, 255, 255, 0.8)",
                    color: "var(--l-ink)",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    outline: "none",
                    boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.02)",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = activeData.colors.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 4px ${activeData.colors.primary}1A`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(20, 23, 31, 0.06)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* 7. RIGHT-SIDE ILLUSTRATION */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minHeight: isEmbeddedHub ? "220px" : "300px",
                maxHeight: isEmbeddedHub ? "340px" : undefined,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              {/* Soft Radial Glow */}
              <div style={{ position: "absolute", width: "240px", height: "240px", borderRadius: "50%", background: `radial-gradient(circle, ${activeData.colors.primary}1e 0%, transparent 70%)`, filter: "blur(20px)", zIndex: -1 }} />
              <RocketJourney activeColor={activeData.colors.primary} progress={progressValue} />
            </div>
          </div>
        ) : (
          /* Original Hero Section for Courses / Articles */
          <div
            style={{
              position: "relative",
              marginBottom: isEmbeddedHub ? "20px" : "56px",
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              alignItems: isEmbeddedHub ? "start" : "center",
              gap: isEmbeddedHub ? "24px" : "40px",
              zIndex: 10,
              padding: isEmbeddedHub ? "0" : "24px 0",
            }}
          >
            {/* Banner Left Info */}
            <div style={{ position: "relative", zIndex: 2 }}>
              <h1
                style={{
                  fontSize: "clamp(2rem, 4.5vw, 3rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  lineHeight: "1.15",
                  marginBottom: "16px",
                  color: "var(--l-ink)",
                  fontFamily: "'Space Grotesk', sans-serif"
                }}
              >
                {mode === "courses" ? (
                  <>
                    {CATEGORY_HEADLINES[activeCategoryName]?.main || "Discover. Learn. "}
                    <GradientText colors={["#2563EB", "#0EA5E9", "#06B6D4", "#10B981", "#4F46E5", "#2563EB"]} animationSpeed={8} showBorder={false}>
                      {CATEGORY_HEADLINES[activeCategoryName]?.highlight || "Grow."}
                    </GradientText>
                  </>
                ) : (
                  <>
                    Latest Research & Articles in <br />
                    <GradientText colors={["#10B981", "#059669", "#2563EB", "#3B82F6", "#10B981"]} animationSpeed={8} showBorder={false}>
                      {activeCategoryName}
                    </GradientText>
                  </>
                )}
              </h1>
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "rgba(20, 20, 43, 0.6)",
                  lineHeight: "1.6",
                  maxWidth: "600px",
                  marginBottom: "28px",
                  fontWeight: 500
                }}
              >
                {activeData.desc} Browse the courses, practical bootcamps, and resources curated to level up your career.
              </p>

              {/* Banner Inner Search */}
              <div style={{ position: "relative", maxWidth: "480px", marginBottom: isEmbeddedHub ? "0" : "20px" }}>
                <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search courses under this category..."
                  value={courseSearchQuery}
                  onChange={(e) => setCourseSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 20px 14px 48px",
                    borderRadius: "14px",
                    border: "1px solid rgba(20, 23, 31, 0.06)",
                    background: "rgba(255, 255, 255, 0.8)",
                    color: "var(--l-ink)",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    outline: "none",
                    boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.02)",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = activeData.colors.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 4px ${activeData.colors.primary}1A`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(20, 23, 31, 0.06)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

            </div>

            {/* Banner Right Panel: Honeycomb Sketch Illustration */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minHeight: isEmbeddedHub ? "220px" : "300px",
                maxHeight: isEmbeddedHub ? "260px" : undefined,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              {mode === "articles" ? (
                <WindmillAnimation />
              ) : (
                <HoneycombIllustration />
              )}
            </div>
          </div>
        )}


        {mode === "courses" && (
          <CoursesView
            activeData={activeData}
            activeCategoryName={activeCategoryName}
            router={router}
            isEmbeddedHub={isEmbeddedHub}
            courseSearchQuery={courseSearchQuery}
            setCourseSearchQuery={setCourseSearchQuery}
            courseStats={courseStats}
            filters={filters}
          />
        )}

        {mode === "events" && (
          <EventsView
            activeData={activeData}
            activeCategoryName={activeCategoryName}
            isEmbeddedHub={isEmbeddedHub}
            filters={filters}
          />
        )}

        {mode === "articles" && (
          <ArticlesView
            activeData={activeData}
            isEmbeddedHub={isEmbeddedHub}
            filters={filters}
          />
        )}

      </main>

      <FilterSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        mode={mode}
        activeData={activeData}
        activeCategoryName={activeCategoryName}
        handleCategorySwitch={handleCategorySwitch}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
}


