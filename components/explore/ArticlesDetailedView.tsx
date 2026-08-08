"use client";

import React, { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CATEGORY_DATA, categoriesList, CategoryWatermark, WEBINARS_DATA } from "@/app/(public)/explore/data";
import { BootcampCard } from "./BootcampCard";
import { WebinarCard } from "./WebinarCard";
import DotGrid from "@/components/landing/DotGrid";
import GradientText from "@/components/landing/GradientText";
import BorderGlow from "./BorderGlow";
import { gsap } from "gsap";
import { api } from "@/infrastructure/http/api";
import { FeaturedKnowledgeIllustration } from "./FeaturedKnowledgeIllustration";
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

const ArticlesIllustration: React.FC = () => {
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
            0% { transform: translate(350px, 45px) rotate(-30deg); }
            35% { transform: translate(322px, 60px) rotate(-55deg); }
            45% { transform: translate(316px, 66px) rotate(35deg); }
            80% { transform: translate(372px, 28px) rotate(10deg); }
            100% { transform: translate(350px, 45px) rotate(-30deg); }
          }
          @keyframes racketSwing {
            0%, 100% { transform: rotate(0deg); }
            30% { transform: rotate(-8deg); }
            38% { transform: rotate(15deg); }
            50% { transform: rotate(5deg); }
            65% { transform: rotate(0deg); }
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
          .flow-forward { animation: flowForward 2s linear infinite; }
          .flow-backward { animation: flowBackward 2s linear infinite; }
          .animate-shuttle { animation: shuttleFlight 5s ease-in-out infinite; }
          .animate-racket { animation: racketSwing 5s ease-in-out infinite; transform-origin: -2px 2px; }
          .animate-sparkle-right { animation: sparkleTwinkleRight 3s ease-in-out infinite; }
          .animate-sparkle-left { animation: sparkleTwinkleLeft 3s ease-in-out infinite 1.5s; }
          .animate-clink-sparks { animation: clinkSparksPulse 2.5s ease-in-out infinite; }
          .animate-expand-arrows { animation: expandArrowsPulse 4s ease-in-out infinite; }
        `}</style>

        {/* Background dotted line paths / orbits */}
        <path className="flow-forward" d="M 120,40 C 200,-10 320,10 340,90" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
        <path className="flow-backward" d="M 50,110 C 30,50 120,10 200,60" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
        <path className="flow-forward" d="M 280,240 C 360,250 430,190 410,120" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
        <path className="flow-backward" d="M 60,190 C 80,250 180,270 230,240" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />

        <circle r="2.5" fill="#FBBF24" style={{ filter: "drop-shadow(0px 0px 3px #FBBF24)" }}>
          <animateMotion path="M 120,40 C 200,-10 320,10 340,90" dur="6s" repeatCount="indefinite" />
        </circle>
        <circle r="2" fill="#FBBF24" style={{ filter: "drop-shadow(0px 0px 2px #FBBF24)" }}>
          <animateMotion path="M 50,110 C 30,50 120,10 200,60" dur="7s" repeatCount="indefinite" />
        </circle>
        <circle r="2.5" fill="#FBBF24" style={{ filter: "drop-shadow(0px 0px 3px #FBBF24)" }}>
          <animateMotion path="M 280,240 C 360,250 430,190 410,120" dur="8s" repeatCount="indefinite" />
        </circle>
        <circle r="2" fill="#FBBF24" style={{ filter: "drop-shadow(0px 0px 2px #FBBF24)" }}>
          <animateMotion path="M 60,190 C 80,250 180,270 230,240" dur="6.5s" repeatCount="indefinite" />
        </circle>

        {/* Small floating elements */}
        <g className="animate-shuttle" transform="translate(350, 45) rotate(-30)">
          <path d="M 0,0 L -8,-15 L 8,-15 Z" fill="none" stroke="#1E293B" strokeWidth="1.2" />
          <path d="M -6,-11 L 6,-11 M -4,-7 L 4,-7" stroke="#1E293B" strokeWidth="1.2" />
          <circle cx="0" cy="1" r="3.5" fill="#1E293B" />
        </g>
        
        <g className="animate-sparkle-right" transform="translate(380, 210) scale(0.8)">
          <path d="M 0,-8 L 2,-2 L 8,0 L 2,2 L 0,8 L -2,2 L -8,0 L -2,-2 Z" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.2" />
        </g>
        <g className="animate-sparkle-left" transform="translate(60, 60) scale(0.6)">
          <path d="M 0,-8 L 2,-2 L 8,0 L 2,2 L 0,8 L -2,2 L -8,0 L -2,-2 Z" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.2" />
        </g>

        <g className="animate-expand-arrows" transform="translate(390, 250)">
          <line x1="-8" y1="8" x2="8" y2="-8" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
          <polyline points="0,8 -8,8 -8,0" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="0,-8 8,-8 8,0" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Center Square: Reader with Book */}
        <g transform="translate(210, 150)">
          <rect x="-45" y="-45" width="90" height="90" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.8" />
          <g transform="translate(0, -6)">
            {/* Body */}
            <path d="M-14,35 C-14,15 14,15 14,35" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.6" />
            {/* Head */}
            <circle cx="0" cy="-2" r="10" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" />
            {/* Reading Glasses */}
            <circle cx="-4" cy="-4" r="3" fill="none" stroke="#1E293B" strokeWidth="1.6" />
            <circle cx="4" cy="-4" r="3" fill="none" stroke="#1E293B" strokeWidth="1.6" />
            <line x1="-1" y1="-4" x2="1" y2="-4" stroke="#1E293B" strokeWidth="1.6" />
            {/* Smile */}
            <path d="M-3,2 Q0,5 3,2" fill="none" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
            {/* Book */}
            <path d="M-12,18 L0,22 L12,18 L12,8 L0,12 L-12,8 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" strokeLinejoin="round" />
            <line x1="0" y1="12" x2="0" y2="22" stroke="#1E293B" strokeWidth="1.6" />
            <line x1="-8" y1="12" x2="-2" y2="14" stroke="#CBD5E1" strokeWidth="1.2" />
            <line x1="-8" y1="15" x2="-2" y2="17" stroke="#CBD5E1" strokeWidth="1.2" />
            <line x1="2" y1="14" x2="8" y2="12" stroke="#CBD5E1" strokeWidth="1.2" />
            <line x1="2" y1="17" x2="8" y2="15" stroke="#CBD5E1" strokeWidth="1.2" />
            {/* Arms holding book */}
            <path d="M-14,20 L-10,16 L-8,18" fill="none" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M14,20 L10,16 L8,18" fill="none" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </g>

        {/* Top-Left Square: Journalist with Notepad */}
        <g transform="translate(132, 105)">
          <rect x="-45" y="-45" width="90" height="90" rx="8" fill="#FEF08A" stroke="#F59E0B" strokeWidth="1.8" />
          <g transform="translate(0, -5)">
            {/* Body */}
            <path d="M-16,35 C-16,15 16,15 16,35" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" />
            {/* Press Hat */}
            <path d="M-10,-8 C-10,-18 10,-18 10,-8 Z" fill="#F59E0B" stroke="#1E293B" strokeWidth="1.6" />
            <rect x="-4" y="-14" width="8" height="4" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1" />
            {/* Head */}
            <path d="M-10,-8 C-10,4 10,4 10,-8" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" />
            {/* Eyes */}
            <circle cx="-4" cy="-2" r="1.5" fill="#1E293B" />
            <circle cx="4" cy="-2" r="1.5" fill="#1E293B" />
            {/* Notepad */}
            <rect x="-12" y="10" width="14" height="18" rx="2" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" />
            <line x1="-8" y1="14" x2="-2" y2="14" stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1="-8" y1="18" x2="-2" y2="18" stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1="-8" y1="22" x2="0" y2="22" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* Pen */}
            <path d="M12,12 L6,22" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="6" cy="22" r="1" fill="#1E293B" />
            {/* Arms */}
            <path d="M-16,22 L-12,18" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M16,22 L10,16 L12,12" fill="none" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </g>

        {/* Top-Right Square: Scholar with Graduation Cap */}
        <g transform="translate(288, 105)">
          <rect x="-45" y="-45" width="90" height="90" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.8" />
          <g transform="translate(0, -2)">
            {/* Body (Robe) */}
            <path d="M-18,35 C-12,15 12,15 18,35" fill="#1E293B" stroke="#1E293B" strokeWidth="1.6" />
            {/* Head */}
            <circle cx="0" cy="-2" r="9" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" />
            {/* Graduation Cap */}
            <path d="M-16,-9 L0,-15 L16,-9 L0,-3 Z" fill="#1E293B" stroke="#1E293B" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M-8,-6 L-8,0 C-8,4 8,4 8,0 L8,-6" fill="none" stroke="#1E293B" strokeWidth="1.6" />
            {/* Tassel */}
            <path d="M0,-9 Q8,-9 10,-4 L10,2" fill="none" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" />
            {/* Glasses */}
            <rect x="-7" y="-3" width="5" height="4" rx="1" fill="none" stroke="#1E293B" strokeWidth="1.6" />
            <rect x="2" y="-3" width="5" height="4" rx="1" fill="none" stroke="#1E293B" strokeWidth="1.6" />
            <line x1="-2" y1="-1" x2="2" y2="-1" stroke="#1E293B" strokeWidth="1.6" />
            {/* Diploma */}
            <g transform="translate(10, 15) rotate(-20)">
              <rect x="-6" y="-3" width="12" height="6" rx="2" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" />
              <line x1="-2" y1="-5" x2="-2" y2="5" stroke="#EF4444" strokeWidth="1.6" />
            </g>
          </g>
        </g>

        {/* Middle-Left Square: Reader with Newspaper */}
        <g transform="translate(54, 150)">
          <rect x="-45" y="-45" width="90" height="90" rx="8" fill="#FCA5A5" stroke="#F87171" strokeWidth="1.8" />
          <g transform="translate(0, -6)">
            {/* Body */}
            <path d="M-14,35 C-14,10 14,10 14,35" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" />
            {/* Head */}
            <circle cx="0" cy="-2" r="9" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" />
            {/* Hair */}
            <path d="M-9,-2 C-9,-12 9,-12 9,-2" fill="#1E293B" />
            {/* Eyes */}
            <circle cx="-3" cy="0" r="1.5" fill="#FFFFFF" />
            <circle cx="3" cy="0" r="1.5" fill="#FFFFFF" />
            {/* Newspaper (covers bottom of face) */}
            <path d="M-18,8 L0,12 L18,8 L20,24 L0,28 L-20,24 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" strokeLinejoin="round" />
            <line x1="0" y1="12" x2="0" y2="28" stroke="#1E293B" strokeWidth="1.6" />
            {/* Newspaper Text Lines */}
            <line x1="-16" y1="12" x2="-4" y2="14" stroke="#94A3B8" strokeWidth="1.5" />
            <line x1="-16" y1="16" x2="-4" y2="18" stroke="#94A3B8" strokeWidth="1.5" />
            <line x1="-16" y1="20" x2="-8" y2="22" stroke="#94A3B8" strokeWidth="1.5" />
            <line x1="4" y1="14" x2="16" y2="12" stroke="#94A3B8" strokeWidth="1.5" />
            <line x1="4" y1="18" x2="16" y2="16" stroke="#94A3B8" strokeWidth="1.5" />
            {/* Hands holding newspaper */}
            <path d="M-18,24 L-22,18 L-14,14" fill="none" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M18,24 L22,18 L14,14" fill="none" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </g>

        {/* Middle-Right Square: Researcher with Magnifying Glass */}
        <g transform="translate(366, 150)">
          <rect x="-45" y="-45" width="90" height="90" rx="8" fill="#F472B6" stroke="#EC4899" strokeWidth="1.8" />
          <g transform="translate(0, -6)">
            {/* Body */}
            <path d="M-16,35 C-16,15 16,15 16,35" fill="#1E293B" stroke="#1E293B" strokeWidth="1.6" />
            {/* Head */}
            <path d="M-9,-4 C-9,6 9,6 9,-4 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" />
            <path d="M-9,-4 C-9,-14 9,-14 9,-4 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" />
            {/* Left Eye */}
            <circle cx="-4" cy="-2" r="1.5" fill="#1E293B" />
            {/* Magnifying Glass over Right Eye */}
            <g transform="translate(4, -2)">
              <circle cx="0" cy="0" r="5" fill="#A7F3D0" stroke="#1E293B" strokeWidth="1.6" />
              <circle cx="0" cy="0" r="1.5" fill="#1E293B" />
              <line x1="4" y1="4" x2="8" y2="8" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
            </g>
            {/* Hand holding magnifier */}
            <path d="M14,14 L12,8 L8,6" fill="none" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
            {/* Small book floating */}
            <g transform="translate(-14, 10) rotate(-15)">
              <rect x="-6" y="-8" width="12" height="16" rx="1" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.2" />
              <line x1="-4" y1="-4" x2="4" y2="-4" stroke="#CBD5E1" strokeWidth="1" />
              <line x1="-4" y1="0" x2="4" y2="0" stroke="#CBD5E1" strokeWidth="1" />
            </g>
          </g>
        </g>

        {/* Bottom-Left Square: Writer with Quill */}
        <g transform="translate(132, 195)">
          <rect x="-45" y="-45" width="90" height="90" rx="8" fill="#A7F3D0" stroke="#10B981" strokeWidth="1.8" />
          <g transform="translate(0, -6)">
            {/* Body */}
            <path d="M-15,35 C-15,10 15,10 15,35" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" />
            {/* Head */}
            <circle cx="0" cy="-2" r="9" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" />
            {/* Hair Bun */}
            <circle cx="0" cy="-12" r="4" fill="#1E293B" />
            {/* Eyes (looking down) */}
            <path d="M-4,-2 Q-3,0 -1,-2" fill="none" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M1,-2 Q3,0 4,-2" fill="none" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
            {/* Scroll/Paper */}
            <path d="M-10,12 L10,8 L12,24 L-8,28 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" strokeLinejoin="round" />
            {/* Giant Quill */}
            <g transform="translate(8, 14) rotate(30)">
              <path d="M0,0 Q10,-10 15,-20 Q5,-15 0,0" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" strokeLinejoin="round" />
              <line x1="0" y1="0" x2="12" y2="-16" stroke="#1E293B" strokeWidth="1.6" />
            </g>
            {/* Hands */}
            <path d="M-12,22 L-8,16" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M14,24 L10,18" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </g>

        {/* Bottom-Right Square: Person with Tea */}
        <g transform="translate(288, 195)">
          <rect x="-45" y="-45" width="90" height="90" rx="8" fill="#94A3B8" stroke="#475569" strokeWidth="1.8" />
          <g transform="translate(0, -6)">
            {/* Stack of books on the right */}
            <g transform="translate(14, 25)">
              <rect x="-6" y="-12" width="12" height="4" rx="1" fill="#3B82F6" stroke="#1E293B" strokeWidth="1.2" />
              <rect x="-5" y="-8" width="12" height="4" rx="1" fill="#EF4444" stroke="#1E293B" strokeWidth="1.2" />
              <rect x="-7" y="-4" width="14" height="4" rx="1" fill="#10B981" stroke="#1E293B" strokeWidth="1.2" />
            </g>
            {/* Body */}
            <path d="M-14,35 C-14,10 8,10 8,35" fill="#F8FAFC" stroke="#1E293B" strokeWidth="1.6" />
            {/* Head */}
            <circle cx="-2" cy="-4" r="9" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" />
            {/* Eyes (contented closed) */}
            <path d="M-6,-5 Q-4,-3 -2,-5" fill="none" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M0,-5 Q2,-3 4,-5" fill="none" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
            {/* Smile */}
            <path d="M-2,0 Q0,3 2,0" fill="none" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
            {/* Tea Cup */}
            <g transform="translate(-10, 14)">
              <path d="M-4,0 L4,0 L3,6 C3,8 -3,8 -3,6 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M4,1 C6,1 6,4 4,4" fill="none" stroke="#1E293B" strokeWidth="1.6" />
              {/* Steam */}
              <path d="M-2,-2 Q-4,-6 -2,-10" fill="none" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M2,-4 Q4,-8 2,-12" fill="none" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Arm holding tea */}
            <path d="M-2,20 L-6,14" fill="none" stroke="#1E293B" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </g>
        
        {/* Clink sparks */}
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
        <rect x="4" y="3" width="16" height="12" rx="1.5"/>
        <line x1="9" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="15" x2="12" y2="21"/>
      </svg>
    );
  }
  if (norm.includes("structure") || norm.includes("algorithm")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <path d="M4 6h16M4 12h10M4 18h13"/>
        <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/>
      </svg>
    );
  }
  if (norm.includes("principle") || norm.includes("architecture") || norm.includes("design") || norm.includes("software")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/>
        <path d="M12 12v9M4 7.5l8 4.5 8-4.5"/>
      </svg>
    );
  }
  if (norm.includes("operating") || norm.includes("system") || norm.includes("concurrency") || norm.includes("network")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <rect x="4" y="4" width="16" height="7" rx="1.5"/>
        <rect x="4" y="13" width="16" height="7" rx="1.5"/>
        <circle cx="7.5" cy="7.5" r="0.9" fill="currentColor" stroke="none"/>
        <circle cx="7.5" cy="16.5" r="0.9" fill="currentColor" stroke="none"/>
      </svg>
    );
  }

  // Fallbacks by index
  const m = index % 4;
  if (m === 0) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <rect x="4" y="3" width="16" height="12" rx="1.5"/>
        <line x1="9" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="15" x2="12" y2="21"/>
      </svg>
    );
  }
  if (m === 1) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <path d="M4 6h16M4 12h10M4 18h13"/>
        <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/>
      </svg>
    );
  }
  if (m === 2) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/>
        <path d="M12 12v9M4 7.5l8 4.5 8-4.5"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
      <rect x="4" y="4" width="16" height="7" rx="1.5"/>
      <rect x="4" y="13" width="16" height="7" rx="1.5"/>
      <circle cx="7.5" cy="7.5" r="0.9" fill="currentColor" stroke="none"/>
      <circle cx="7.5" cy="16.5" r="0.9" fill="currentColor" stroke="none"/>
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
      className={`category-bento-card category-bento-card--border-glow`}
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

interface FilterPillButtonProps {
  isActive: boolean;
  activeData: any;
  onClick: () => void;
  children: React.ReactNode;
}

const FilterPillButton: React.FC<FilterPillButtonProps> = ({
  isActive,
  activeData,
  onClick,
  children
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const isHoveredRef = useRef(false);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

  const glowColor = hexToRgbStr(activeData.colors.primary);

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
      className={`category-bento-card category-bento-card--border-glow`}
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        borderRadius: "10px",
        border: isActive ? `1.5px solid ${activeData.colors.primary}` : "1.5px solid rgba(20, 23, 31, 0.06)",
        background: isActive ? activeData.colors.secondary : "rgba(255, 255, 255, 0.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        color: isActive ? activeData.colors.primary : "#5E606A",
        fontSize: "0.82rem",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow: isActive 
          ? `0 10px 20px -8px ${activeData.colors.primary}33` 
          : "0 4px 10px -2px rgba(0,0,0,0.02)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "--glow-color": glowColor
      } as React.CSSProperties}
    >
      {children}
    </button>
  );
};

interface CategoryGlobalSpotlightProps {
  gridRef: React.RefObject<HTMLDivElement | null>;
  spotlightRadius?: number;
}

const CategoryGlobalSpotlight: React.FC<CategoryGlobalSpotlightProps> = ({
  gridRef,
  spotlightRadius = 160
}) => {
  useEffect(() => {
    if (!gridRef?.current) return;

    const container = gridRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const cards = container.querySelectorAll(".category-bento-card");

      cards.forEach(card => {
        const cardElement = card as HTMLElement;
        const cardRect = cardElement.getBoundingClientRect();
        
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        const proximity = spotlightRadius * 0.5;
        const fadeDistance = spotlightRadius * 0.75;

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        const relativeX = ((e.clientX - cardRect.left) / cardRect.width) * 100;
        const relativeY = ((e.clientY - cardRect.top) / cardRect.height) * 100;

        cardElement.style.setProperty("--glow-x", `${relativeX}%`);
        cardElement.style.setProperty("--glow-y", `${relativeY}%`);
        cardElement.style.setProperty("--glow-intensity", glowIntensity.toString());
        cardElement.style.setProperty("--glow-radius", `${spotlightRadius}px`);
      });
    };

    const handleMouseLeave = () => {
      container.querySelectorAll(".category-bento-card").forEach(card => {
        (card as HTMLElement).style.setProperty("--glow-intensity", "0");
      });
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [gridRef, spotlightRadius]);

  return null;
};

export interface CourseCardProps {
  course: any;
  index: number;
  activeCategoryName: string;
  activeData: any;
  router: any;
  realRating: number;
  realReviewsCount: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  index,
  activeCategoryName,
  activeData,
  router,
  realRating,
  realReviewsCount
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);

  const enriched = getEnrichedCourse(course, index, activeCategoryName);
  const courseSlug = slugify(course.title);

  useEffect(() => {
    if (descRef.current) {
      // Line-height is 1.5. If the height of element > line-height * 2, it overflows.
      // Two lines is approx 44px. If scrollHeight is greater, it overflows 2 lines.
      setIsOverflowing(descRef.current.scrollHeight > 45);
    }
  }, [course.desc]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column"
      }}
    >
      <BorderGlow
        edgeSensitivity={30}
        glowColor={hexToHslStr(activeData.colors.primary)}
        backgroundColor="#FFFFFF"
        borderRadius={14}
        glowRadius={40}
        glowIntensity={0.3}
        coneSpread={25}
        animated={false}
        colors={[`${activeData.colors.primary}40`, '#E6E3F1', `${activeData.colors.primary}40`]}
        fillOpacity={0.08}
        className="w-full h-full"
      >
        <div
          style={{
            background: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            width: "100%",
            height: "100%",
            minHeight: "360px"
          }}
          className="course-card-premium"
        >
          {/* Card Graphic Header */}
          <div
            style={{
              height: "90px",
              position: "relative",
              overflow: "hidden",
              background: `
                radial-gradient(circle at 25% 25%, ${activeData.colors.primary}12, transparent 55%),
                repeating-linear-gradient(135deg, ${activeData.colors.primary}08 0 2px, transparent 2px 14px),
                #F9FAFB
              `,
              borderBottom: "1px solid #E6E3F1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {/* Accent outline category visual watermark */}
            <div style={{ color: activeData.colors.primary, opacity: 0.25 }}>
              {getCourseGlyph(course.title, index, activeData.colors.primary)}
            </div>
          </div>

          {/* Card Body */}
          <div style={{ padding: "16px 16px 14px", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "8px" }}>
            <div>
              {/* Title */}
              <h3
                style={{
                  fontSize: "1.05rem",
                  fontWeight: "800",
                  color: "var(--l-ink)",
                  margin: "0 0 6px",
                  lineHeight: "1.3",
                  fontFamily: "'Space Grotesk', sans-serif"
                }}
              >
                {course.title}
              </h3>

              {/* Rating Row */}
              <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.82rem", color: "#5A5870", fontWeight: "600" }}>
                  <span style={{ color: "#F59E0B", fontSize: "0.95rem" }}>★</span>
                  <span style={{ fontWeight: "700", color: "var(--l-ink)" }}>{realReviewsCount > 0 ? realRating.toFixed(1) : "0.0"}</span>
                  <span style={{ color: "#8886A0" }}>({realReviewsCount} {realReviewsCount === 1 ? "Review" : "Reviews"})</span>
                </div>
              </div>

              {/* Description with Read More */}
              <div style={{ position: "relative", marginBottom: "12px" }}>
                <p
                  ref={descRef}
                  style={isExpanded ? {
                    fontSize: "0.86rem",
                    color: "#5A5870",
                    lineHeight: "1.5",
                    margin: 0
                  } : {
                    fontSize: "0.86rem",
                    color: "#5A5870",
                    lineHeight: "1.5",
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    maxHeight: "3em"
                  }}
                >
                  {course.desc}
                </p>
                {isOverflowing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: activeData.colors.primary,
                      fontSize: "0.8rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      padding: "2px 0 0 0",
                      marginTop: "4px",
                      display: "block",
                      outline: "none"
                    }}
                  >
                    {isExpanded ? "Read less" : "Read more"}
                  </button>
                )}
              </div>

              {/* Instructor Info */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <img
                  src={enriched.instructor.avatarUrl}
                  alt={enriched.instructor.name}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #E6E3F1"
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.3" }}>
                  <span style={{ fontSize: "0.84rem", fontWeight: "700", color: "var(--l-ink)" }}>
                    {enriched.instructor.name}
                  </span>
                  <span style={{ fontSize: "0.68rem", color: "#8886A0", fontWeight: "600" }}>
                    {enriched.instructor.role}
                  </span>
                </div>
              </div>

              {/* Primary Action Button */}
              <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                <button
                  onClick={() => router.push("/courses/" + courseSlug)}
                  style={{
                    width: "100%",
                    background: activeData.colors.secondary,
                    color: activeData.colors.primary,
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "10px",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.25s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = activeData.colors.secondary.replace('0.08', '0.16');
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = activeData.colors.secondary;
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  Enroll Now
                </button>
              </div>
            </div>

            {/* Bottom Info Row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E6E3F1", paddingTop: "10px", marginTop: "2px" }}>
              <span
                onClick={() => router.push("/courses/" + courseSlug)}
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  color: "#5A5870",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                  transition: "color 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = activeData.colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#5A5870";
                }}
              >
                View Course
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="view-arrow" style={{ transition: "transform .15s" }}>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
              
              <span style={{ fontSize: "0.84rem", color: "#8886A0", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                {course.duration}
              </span>
            </div>
          </div>
        </div>
      </BorderGlow>
    </div>
  );
};

type ArticlesDetailedViewProps = {
  /** When set (e.g. `/search`), stay inside the authenticated hub instead of public landing routes. */
  hubBasePath?: string;
  viewType?: "courses" | "livesession" | "webinars" | "articles";
};

function ArticlesDetailedViewContent({ hubBasePath, viewType = "courses" }: ArticlesDetailedViewProps = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const exploreHome = hubBasePath || "/explore";
  const isEmbeddedHub = Boolean(hubBasePath);

  // Route selector
  const initialCategory = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [wishlistedCourses, setWishlistedCourses] = useState<Record<string, boolean>>({});
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels");
  const [selectedTopic, setSelectedTopic] = useState("All Topics");

  const [courseStats, setCourseStats] = useState<Record<string, { averageRating: number; reviewsCount: number }>>({});

  useEffect(() => {
    // The endpoint is not implemented on the backend yet, so we just set empty stats
    // to prevent Spring Boot from throwing NoResourceFoundException on the server.
    setCourseStats({});
  }, []);

  const coursesSectionRef = useRef<HTMLDivElement>(null);
  const categoriesGridRef = useRef<HTMLDivElement>(null);
  const filtersGridRef = useRef<HTMLDivElement>(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  useEffect(() => {
    if (initialCategory && categoriesList.includes(initialCategory)) {
      setActiveCategory(initialCategory);
    } else {
      setActiveCategory("Computer Science"); // Fallback default
    }
  }, [initialCategory]);

  const handleCategorySwitch = (category: string) => {
    setActiveCategory(category);
    setCourseSearchQuery("");
    setSelectedDifficulty("All Levels");
    setSelectedTopic("All Topics");

    const base = hubBasePath || window.location.pathname;
    const newUrl = `${base}?category=${encodeURIComponent(category)}`;
    window.history.replaceState(null, "", newUrl);

    coursesSectionRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
  };

  const goToExploreHome = () => {
    router.push(exploreHome);
  };

  const toggleWishlist = (courseTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlistedCourses(prev => ({
      ...prev,
      [courseTitle]: !prev[courseTitle]
    }));
  };

  const activeCategoryName = activeCategory || "Computer Science";
  const activeData = CATEGORY_DATA[activeCategoryName];

  const difficultyLevels = ["All Levels", "Beginner", "Intermediate", "Advanced"];
  const topics = ["All Topics", ...Array.from(new Set(activeData.courses.map((c, i) => getEnrichedCourse(c, i, activeCategoryName).categoryTag)))];

  const filteredCourses = activeData.courses.filter((course, index) => {
    const enriched = getEnrichedCourse(course, index, activeCategoryName);
    const matchesSearch = course.title.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
                          course.desc.toLowerCase().includes(courseSearchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "All Levels" || course.level === selectedDifficulty;
    const matchesTopic = selectedTopic === "All Topics" || enriched.categoryTag === selectedTopic;
    return matchesSearch && matchesDifficulty && matchesTopic;
  });

  return (
    <div
      className="landing-root"
      style={{
        // Authenticated hub already clears the dock via LearnerShell pb-28.
        // Override .landing-root { min-height: 100vh } so short pages don't leave a blank footer.
        minHeight: isEmbeddedHub ? "auto" : "100vh",
        paddingBottom: isEmbeddedHub ? "8px" : "100px",
        background: "linear-gradient(to bottom, #f0fdf4 0%, #ffffff 30%, #ffffff 70%, #eff6ff 100%)",
      }}
    >
      <style>{`
        .landing-root::before {
          background-image:
            radial-gradient(ellipse 55% 40% at 8% 12%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 92% 24%, rgba(6, 182, 212, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 45% 35% at 5% 52%, rgba(59, 130, 246, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 6% 76%, rgba(14, 165, 233, 0.11) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 94% 76%, rgba(99, 102, 241, 0.11) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 48% 94%, rgba(16, 185, 129, 0.07) 0%, transparent 60%) !important;
        }
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
        <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", marginBottom: isEmbeddedHub ? "16px" : "28px" }}>
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
            <span
              onClick={goToExploreHome}
              style={{ cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = activeData.colors.primary; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "inherit"; }}
            >
              Explore
            </span>
            <span>/</span>
            <span
              onClick={goToExploreHome}
              style={{ cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = activeData.colors.primary; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "inherit"; }}
            >
              Departments
            </span>
            <span>/</span>
            <span style={{ color: activeData.colors.primary, fontWeight: "700" }}>{activeCategoryName}</span>
          </div>
        </div>

        {/* Hero Section Container (No background card, border, or shadow) */}
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
              {CATEGORY_HEADLINES[activeCategoryName]?.main || "Discover. Learn. "}
              <GradientText
                colors={['#2563EB', '#0EA5E9', '#06B6D4', '#10B981', '#4F46E5', '#2563EB']}
                animationSpeed={8}
                showBorder={false}
              >
                {CATEGORY_HEADLINES[activeCategoryName]?.highlight || "Grow."}
              </GradientText>
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

          {/* Banner Right Panel: Articles Illustration */}
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
            <FeaturedKnowledgeIllustration />
          </div>
        </div>

        {/* Removed Sections A & B for Articles view */}

        {/* Section C: Resources */}
        {(viewType === "courses" || viewType === "articles") && (
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "4px", height: "24px", borderRadius: "2px", background: activeData.colors.primary }} />
                <h2 style={{ fontSize: "1.5rem", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--l-ink)", fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>
                  Featured Articles & Guides
                </h2>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
              {activeData.resources.map((doc) => (
                <div
                  key={doc.title}
                  style={{
                    background: "rgba(255, 255, 255, 0.65)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(20, 23, 31, 0.06)",
                    borderRadius: "16px",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "140px",
                    boxShadow: "0 4px 12px rgba(20, 23, 31, 0.02)"
                  }}
                  className="hover-card-y"
                >
                  <div>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: "800",
                        color: activeData.colors.primary,
                        background: activeData.colors.secondary,
                        padding: "3px 8px",
                        borderRadius: "8px",
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                        display: "inline-block",
                        marginBottom: "12px"
                      }}
                    >
                      {doc.type}
                    </span>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--l-ink)", margin: "0 0 8px", lineHeight: "1.4", fontFamily: "'Space Grotesk', sans-serif" }}>
                      {doc.title}
                    </h3>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(20, 23, 31, 0.06)", paddingTop: "12px" }}>
                    <span style={{ fontSize: "0.75rem", color: "rgba(20, 20, 43, 0.45)", fontWeight: "600" }}>{doc.readTime}</span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: "800",
                        color: activeData.colors.primary,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      Read Guide
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default function ArticlesDetailedView(props: ArticlesDetailedViewProps) {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>Loading Explore Content...</div>}>
      <ArticlesDetailedViewContent {...props} />
    </Suspense>
  );
}


