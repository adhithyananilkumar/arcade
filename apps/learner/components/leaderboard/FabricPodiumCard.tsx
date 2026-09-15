'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface LeaderboardUser {
  rank: number;
  name: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  roleBadge?: string;
  coursesCount: number;
  hackathonsCount: number;
  certificatesCount: number;
  weeklyChange: number;
}

const PLACE_TONE = {
  1: {
    ring: 'ring-[#D4AF37]',
    label: '1st',
    accentColor: '#D4AF37',
    badgeBorder: '#D4AF37',
    badgeAccent: '#FFFFFF',
    badgeGradStart: '#F59E0B',
    badgeGradMid: '#D97706',
    badgeGradEnd: '#B45309',
    cardBorder: 'rgba(212, 175, 55, 0.45)',
    dropShadow: 'drop-shadow(0 16px 32px rgba(212, 175, 55, 0.22))',
  },
  2: {
    ring: 'ring-slate-400',
    label: '2nd',
    accentColor: '#94A3B8',
    badgeBorder: '#94A3B8',
    badgeAccent: '#FFFFFF',
    badgeGradStart: '#475569',
    badgeGradMid: '#334155',
    badgeGradEnd: '#1E293B',
    cardBorder: 'rgba(203, 213, 225, 0.9)',
    dropShadow: 'drop-shadow(0 12px 28px rgba(148, 163, 184, 0.18))',
  },
  3: {
    ring: 'ring-[#C47B4A]',
    label: '3rd',
    accentColor: '#C47B4A',
    badgeBorder: '#C47B4A',
    badgeAccent: '#FFFFFF',
    badgeGradStart: '#EA580C',
    badgeGradMid: '#C2410C',
    badgeGradEnd: '#9A3412',
    cardBorder: 'rgba(196, 123, 74, 0.45)',
    dropShadow: 'drop-shadow(0 12px 28px rgba(196, 123, 74, 0.18))',
  },
} as const;

// ── Hanging Circular Laurel Medal SVG Stamp ──────────────────────────────────
function HangingLaurelMedalStamp({
  place,
  tone,
}: {
  place: 1 | 2 | 3;
  tone: typeof PLACE_TONE[1];
}) {
  const numberText = place === 1 ? '1st' : place === 2 ? '2nd' : '3rd';

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-24 h-24 sm:w-28 sm:h-28 filter drop-shadow-xl transition-transform hover:scale-105">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
        fill="none"
      >
        <defs>
          <radialGradient id={`medalBgGrad-${place}`} cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor={tone.badgeGradStart} />
            <stop offset="60%" stopColor={tone.badgeGradMid} />
            <stop offset="100%" stopColor={tone.badgeGradEnd} />
          </radialGradient>
        </defs>

        {/* Outer Circular Medal Body with metallic border ring */}
        <circle
          cx="50"
          cy="50"
          r="47"
          fill={`url(#medalBgGrad-${place})`}
          stroke={tone.badgeBorder}
          strokeWidth="3"
        />
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1"
          fill="none"
        />

        {/* Scaled group for generous inner padding */}
        <g transform="translate(5, 4) scale(0.90)">
          {/* Left Laurel Leaves Branch */}
          <g stroke={tone.badgeAccent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={tone.badgeAccent}>
            <path d="M 50 86 C 24 84, 15 62, 20 32" fill="none" strokeWidth="2.2" />
            <path d="M 50 86 C 42 83, 37 88, 33 84 C 37 78, 44 80, 50 86 Z" />
            <path d="M 41 83 C 33 78, 26 82, 22 76 C 28 71, 35 74, 41 83 Z" />
            <path d="M 32 76 C 24 69, 17 72, 14 65 C 20 60, 27 64, 32 76 Z" />
            <path d="M 24 65 C 16 57, 11 58, 9 50 C 16 46, 22 51, 24 65 Z" />
            <path d="M 19 52 C 13 42, 10 42, 10 33 C 17 31, 21 38, 19 52 Z" />
            <path d="M 18 38 C 14 27, 13 25, 16 17 C 22 19, 23 27, 18 38 Z" />
            <path d="M 20 29 C 20 19, 22 15, 28 11 C 31 17, 28 24, 20 29 Z" />
          </g>

          {/* Right Laurel Leaves Branch */}
          <g stroke={tone.badgeAccent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={tone.badgeAccent}>
            <path d="M 50 86 C 76 84, 85 62, 80 32" fill="none" strokeWidth="2.2" />
            <path d="M 50 86 C 58 83, 63 88, 67 84 C 63 78, 56 80, 50 86 Z" />
            <path d="M 59 83 C 67 78, 74 82, 78 76 C 72 71, 65 74, 59 83 Z" />
            <path d="M 68 76 C 76 69, 83 72, 86 65 C 80 60, 73 64, 68 76 Z" />
            <path d="M 76 65 C 84 57, 89 58, 91 50 C 84 46, 78 51, 76 65 Z" />
            <path d="M 81 52 C 87 42, 90 42, 90 33 C 83 31, 79 38, 81 52 Z" />
            <path d="M 82 38 C 86 27, 87 25, 84 17 C 78 19, 77 27, 82 38 Z" />
            <path d="M 80 29 C 80 19, 78 15, 72 11 C 69 17, 72 24, 80 29 Z" />
          </g>

          {/* Center Rank Text (e.g. 1st, 2nd, 3rd) */}
          <text
            x="50"
            y="45"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="23"
            fontWeight="900"
            fontFamily="serif, system-ui"
            className="font-black"
          >
            {numberText}
          </text>

          {/* Divider bar with star */}
          <line x1="32" y1="54" x2="68" y2="54" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
          <circle cx="50" cy="54" r="2.2" fill="#FFFFFF" />

          {/* WINNER label */}
          <text
            x="50"
            y="68"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="8"
            fontWeight="900"
            letterSpacing="1.4"
            className="uppercase tracking-widest font-black"
            opacity="0.95"
          >
            WINNER
          </text>
        </g>
      </svg>
    </div>
  );
}

interface PodiumCardProps {
  user: LeaderboardUser;
  place: 1 | 2 | 3;
}

export function FabricPodiumCard({ user, place }: PodiumCardProps) {
  const tone = PLACE_TONE[place];
  
  // Step elevation:
  // 1st is elevated significantly upward above 2nd & 3rd for clear Olympic first place stance
  // 2nd is neutral (0)
  // 3rd is stepped down
  const elevationClass =
    place === 1
      ? '-translate-y-4 sm:-translate-y-12 md:-translate-y-16 z-20'
      : place === 2
      ? 'translate-y-0 z-10'
      : 'translate-y-2 sm:translate-y-8 md:translate-y-10 z-10';

  // Staggered entrance animation
  const delay = place === 2 ? 0.05 : place === 1 ? 0.15 : 0.25;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: place === 1 ? -6 : -4, transition: { duration: 0.2 } }}
      className={`relative w-full max-w-[290px] mx-auto pt-14 sm:pt-16 ${elevationClass}`}
      style={{ filter: tone.dropShadow }}
    >
      {/* ── Top Hanging Circular Laurel Winner Medal Stamp (At Top V-Tip) ── */}
      <div className={`absolute ${place === 1 ? '-top-5 sm:-top-6' : '-top-3'} inset-x-0 flex justify-center z-20 pointer-events-none`}>
        <HangingLaurelMedalStamp place={place} tone={tone} />
      </div>

      {/* ── Background Shield Card (Pointed V at TOP, Straight Line with rounded corners at BOTTOM) ── */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full h-[calc(100%-2rem)] pointer-events-none"
        viewBox="0 0 320 420"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`pennantBodyGrad-${place}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#FCFDFF" />
            <stop offset="100%" stopColor="#F8FAFC" />
          </linearGradient>
        </defs>
        {/* Pointed V at TOP (160, 5), Straight flat line at BOTTOM with rounded corners (radius 16) */}
        <path
          d="M 0 80 
             L 160 5 
             L 320 80 
             L 320 404 
             A 16 16 0 0 1 304 420 
             L 16 420 
             A 16 16 0 0 1 0 404 Z"
          fill={`url(#pennantBodyGrad-${place})`}
          stroke={tone.cardBorder}
          strokeWidth="1.5"
        />
      </svg>

      {/* ── Card Content Container ── */}
      <div className="relative z-10 flex flex-col pt-18 sm:pt-20 px-6 pb-8 text-center">
        {/* 1. Student Avatar + Name + XP */}
        <div className="flex flex-col items-center justify-center space-y-1.5 mt-2">
          <div className={`relative h-15 w-15 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-white shadow-md ${tone.ring} mb-1.5`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
            {user.name}
          </h3>
          <p className="text-xs sm:text-sm font-black text-[#2962D6]">
            {user.xp.toLocaleString()} XP
          </p>
        </div>

        {/* 2. Vertical Metrics List (Level, Courses, Certs with values aligned on right) */}
        <div className="mt-7 mx-auto w-full max-w-[210px] space-y-2.5 text-left">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700">
            <span>Level</span>
            <span className="font-extrabold text-slate-900">{user.level}</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700">
            <span>Courses</span>
            <span className="font-extrabold text-slate-900">{user.coursesCount}</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700">
            <span>Certs</span>
            <span className="font-extrabold text-slate-900">{user.certificatesCount}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
