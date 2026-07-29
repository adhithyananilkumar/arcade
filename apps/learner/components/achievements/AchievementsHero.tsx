'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Award, Medal } from 'lucide-react';

interface AchievementsHeroProps {
  unlockedCount: number;
  totalBadges: number;
  streakDays?: number;
  certificatesCount: number;
}

// ─── Custom Smooth Counter Component ───────────────────────────────────────────
function SmoothCounter({ value, duration = 1200, delay = 0 }: { value: number; duration?: number; delay?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    let startTime: number | null = null;
    const timer = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.floor(easedProgress * value));

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          setDisplayValue(value);
        }
      };
      animationFrameId = requestAnimationFrame(step);
    }, delay * 1000);

    return () => {
      clearTimeout(timer);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration, delay]);

  return <span>{displayValue}</span>;
}

// ─── Professional Twin-Cannon Party Popper Particle Burst (HTML5 Canvas) ──────
function ProfessionalPartyPopperCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      if (canvas) {
        canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
        canvas.height = 420;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    const colors = ['#2962D6', '#38BDF8', '#27C5D8', '#F59E0B', '#A855F7', '#10B981', '#EC4899', '#FFFFFF'];

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      vRot: number;
      opacity: number;
      decay: number;
      shape: 'square' | 'circle' | 'ribbon' | 'star' | 'diamond';
    }

    const particles: Particle[] = [];
    const leftX = canvas.width * 0.12;
    const rightX = canvas.width * 0.88;
    const startY = 60;

    for (let i = 0; i < 55; i++) {
      particles.push({
        x: leftX,
        y: startY,
        vx: 3 + Math.random() * 9,
        vy: -9 - Math.random() * 10,
        size: 5 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        opacity: 1,
        decay: 0.008 + Math.random() * 0.006,
        shape: ['square', 'circle', 'ribbon', 'star', 'diamond'][Math.floor(Math.random() * 5)] as any,
      });

      particles.push({
        x: rightX,
        y: startY,
        vx: -3 - Math.random() * 9,
        vy: -9 - Math.random() * 10,
        size: 5 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        opacity: 1,
        decay: 0.008 + Math.random() * 0.006,
        shape: ['square', 'circle', 'ribbon', 'star', 'diamond'][Math.floor(Math.random() * 5)] as any,
      });
    }

    for (let i = 0; i < 25; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 60,
        vx: (Math.random() - 0.5) * 2,
        vy: 2 + Math.random() * 4,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.15,
        opacity: 1,
        decay: 0.006 + Math.random() * 0.005,
        shape: ['circle', 'star', 'diamond'][Math.floor(Math.random() * 3)] as any,
      });
    }

    let animationId: number;
    const gravity = 0.32;
    const drag = 0.985;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let aliveCount = 0;
      particles.forEach((p) => {
        if (p.opacity <= 0) return;
        aliveCount++;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += gravity;
        p.vx *= drag;
        p.vy *= drag;
        p.rotation += p.vRot;
        p.opacity -= p.decay;

        if (p.opacity > 0) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.strokeStyle = p.color;

          if (p.shape === 'square') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          } else if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === 'diamond') {
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.lineTo(p.size / 1.5, 0);
            ctx.lineTo(0, p.size);
            ctx.lineTo(-p.size / 1.5, 0);
            ctx.closePath();
            ctx.fill();
          } else if (p.shape === 'ribbon') {
            ctx.beginPath();
            ctx.rect(-p.size / 3, -p.size * 1.2, p.size / 1.8, p.size * 2.4);
            ctx.fill();
          } else if (p.shape === 'star') {
            ctx.beginPath();
            for (let s = 0; s < 5; s++) {
              ctx.lineTo(Math.cos((18 + s * 72) * Math.PI / 180) * p.size, -Math.sin((18 + s * 72) * Math.PI / 180) * p.size);
              ctx.lineTo(Math.cos((54 + s * 72) * Math.PI / 180) * (p.size / 2), -Math.sin((54 + s * 72) * Math.PI / 180) * (p.size / 2));
            }
            ctx.closePath();
            ctx.fill();
          }

          ctx.restore();
        }
      });

      if (aliveCount > 0) {
        animationId = requestAnimationFrame(render);
      } else {
        setActive(false);
      }
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
    />
  );
}

// ─── Main Hero Component (Clean & Centered, Refined Scale) ────────────────────
export default function AchievementsHero({
  unlockedCount,
  totalBadges,
  streakDays = 14,
  certificatesCount,
}: AchievementsHeroProps) {
  const cubicEase = [0.16, 1, 0.3, 1];

  return (
    <div className="relative w-full overflow-hidden pt-4 pb-6 mb-6 flex flex-col items-center justify-center text-center">

      {/* ── 1. Twin Cannon Party Popper Canvas Animation Layer ── */}
      <ProfessionalPartyPopperCanvas />

      {/* Cannon Origin Blast Shockwave Rings (Left & Right Flanks) */}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 2.2], opacity: [1, 0] }}
        transition={{ duration: 0.7, delay: 0.05 }}
        className="absolute top-12 left-[12%] w-10 h-10 rounded-full border-2 border-cyan-400 pointer-events-none hidden md:block"
      />
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 2.2], opacity: [1, 0] }}
        transition={{ duration: 0.7, delay: 0.05 }}
        className="absolute top-12 right-[12%] w-10 h-10 rounded-full border-2 border-blue-500 pointer-events-none hidden md:block"
      />

      {/* ── 2. Ambient Background Soft Glow Halos ── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[480px] h-[200px] bg-gradient-to-r from-blue-500/10 via-cyan-400/10 to-purple-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* ── 3. Centered Main Hero Composition ── */}
      <div className="max-w-2xl mx-auto flex flex-col items-center text-center relative z-10 px-4 py-1">

        {/* Refined Compact Heading: "My Achievements" */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-1">
          {/* "My" in bold dark text */}
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: cubicEase }}
            className="inline-block mr-2.5 text-slate-900 dark:text-white"
          >
            My
          </motion.span>

          {/* "Achievements" in Blue-to-Cyan Gradient text */}
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease: cubicEase }}
            className="inline-block bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] bg-clip-text text-transparent py-0.5"
          >
            Achievements
          </motion.span>
        </h1>

        {/* Centered Line Accent with Center Diamond */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.32, ease: cubicEase }}
          className="flex items-center justify-center gap-2.5 my-2 w-44 sm:w-60"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2962D6]/40 to-[#27C5D8]/80" />
          <div className="w-1.5 h-1.5 rotate-45 bg-[#27C5D8]" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#2962D6]/40 to-[#27C5D8]/80" />
        </motion.div>

        {/* Centered Subtitle Description */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: cubicEase }}
          className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-semibold max-w-lg leading-relaxed my-2"
        >
          Track your learning milestones, earn badges, unlock certificates, and level up your skills as you complete interactive challenges.
        </motion.p>

        {/* ── Centered 3-Column Statistics Row (Exact 1:1 Match to Reference Image) ── */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6 w-full max-w-lg mx-auto mt-3 pt-1">

          {/* Stat 1: Badges Unlocked */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.5, ease: cubicEase }}
            className="flex flex-col items-center text-center group"
          >
            <DiamondBadgeGraphic type="blue-trophy" />
            <div className="text-xl sm:text-3xl font-black text-[#1877F2] dark:text-blue-400 tracking-tight mt-1">
              <SmoothCounter value={unlockedCount} delay={0.55} />
              <span className="text-base sm:text-xl font-bold text-slate-400 font-sans ml-1.5">/ {totalBadges}</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mt-1 mb-2">
              Badges Unlocked
            </p>
            {/* Bottom Horizontal Line with Centered Dot */}
            <div className="relative w-18 sm:w-28 h-px bg-slate-200 dark:bg-neutral-800 mx-auto flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#1877F2]" />
            </div>
          </motion.div>

          {/* Stat 2: Active Streak */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.62, ease: cubicEase }}
            className="flex flex-col items-center text-center group"
          >
            <DiamondBadgeGraphic type="pink-flame" />
            <div className="text-xl sm:text-3xl font-black text-[#F43F5E] dark:text-rose-400 tracking-tight mt-1">
              <SmoothCounter value={streakDays} delay={0.67} />
              <span className="text-sm sm:text-base font-bold text-slate-500 dark:text-slate-400 font-sans ml-1.5">Days</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mt-1 mb-2">
              Active Streak
            </p>
            {/* Bottom Horizontal Line with Centered Dot */}
            <div className="relative w-18 sm:w-28 h-px bg-slate-200 dark:bg-neutral-800 mx-auto flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#F43F5E]" />
            </div>
          </motion.div>

          {/* Stat 3: Certificates */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.74, ease: cubicEase }}
            className="flex flex-col items-center text-center group"
          >
            <DiamondBadgeGraphic type="green-medal" />
            <div className="text-xl sm:text-3xl font-black text-[#10B981] dark:text-emerald-400 tracking-tight mt-1">
              <SmoothCounter value={certificatesCount} delay={0.78} />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mt-1 mb-2">
              Certificates
            </p>
            {/* Bottom Horizontal Line with Centered Dot */}
            <div className="relative w-18 sm:w-28 h-px bg-slate-200 dark:bg-neutral-800 mx-auto flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#10B981]" />
            </div>
          </motion.div>

        </div>

      </div>

    </div>
  );
}

// ─── Diamond Badge Container (Ultra-Clean Centered Diamond Emblem) ──────
function DiamondBadgeGraphic({
  type,
}: {
  type: 'blue-trophy' | 'pink-flame' | 'green-medal';
}) {
  const isBlue = type === 'blue-trophy';
  const isPink = type === 'pink-flame';
  const strokeColor = isBlue ? '#1877F2' : isPink ? '#F43F5E' : '#10B981';
  const gradientId = `diamondBg_${type}`;

  return (
    <div className="relative w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center mx-auto my-1 group-hover:scale-105 transition-transform duration-300">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.12" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Outer Rotated Diamond Polygon */}
        <polygon
          points="50,14 86,50 50,86 14,50"
          fill={`url(#${gradientId})`}
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Inner Faint Diamond Accent Ring */}
        <polygon
          points="50,21 79,50 50,79 21,50"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1"
          strokeOpacity="0.22"
          strokeLinejoin="round"
        />
      </svg>

      {/* Center Flat Icon Stage */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isBlue && (
          <svg viewBox="0 0 100 100" className="w-8 h-8 sm:w-9 sm:h-9 filter drop-shadow-xs" fill="none">
            {/* Shield Outer Body */}
            <path d="M 50 18 L 74 26 C 74 54, 50 72, 50 72 C 50 72, 26 54, 26 26 Z" fill="#1877F2" />
            {/* White Star in Center */}
            <polygon points="50,32 52.2,38.5 59,38.5 53.5,42.5 55.5,49 50,44.5 44.5,49 46.5,42.5 41,38.5 47.8,38.5" fill="#FFFFFF" />
          </svg>
        )}

        {isPink && (
          <svg viewBox="0 0 100 100" className="w-8 h-8 sm:w-9 sm:h-9 filter drop-shadow-xs" fill="none">
            {/* Dual Lightning Zap */}
            <path d="M 54 16 L 24 50 L 48 50 L 42 78 L 76 44 L 52 44 Z" fill="#F43F5E" />
            {/* Inner Core Glow */}
            <path d="M 52 24 L 34 47 L 50 47 L 46 66 L 66 43 L 50 43 Z" fill="#FFE4E8" />
          </svg>
        )}

        {!isBlue && !isPink && (
          <svg viewBox="0 0 100 100" className="w-8 h-8 sm:w-9 sm:h-9 filter drop-shadow-xs" fill="none">
            {/* Graduation Cap Diamond Top */}
            <polygon points="50,20 84,36 50,52 16,36" fill="#10B981" />
            {/* Cap Base Bowl */}
            <path d="M 30 44 L 30 58 C 30 64, 70 64, 70 58 L 70 44 Z" fill="#10B981" opacity="0.9" />
            {/* Right Tassel Ribbon & Ribbon Knob */}
            <circle cx="50" cy="36" r="3" fill="#FFFFFF" />
            <path d="M 50 36 L 76 44 L 76 60" stroke="#34D399" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="76" cy="60" r="3.5" fill="#34D399" />
          </svg>
        )}
      </div>
    </div>
  );
}

// ── Realistic Trophy Icon with Star Badge ──
function Trophy3DIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} filter drop-shadow-md`} fill="none">
      <defs>
        <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="40%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      {/* Base Pedestal */}
      <ellipse cx="50" cy="82" rx="20" ry="6" fill="url(#trophyGrad)" />
      <path d="M 34 81 C 34 75, 66 75, 66 81 Z" fill="#1E40AF" opacity="0.5" />
      {/* Stem */}
      <path d="M 44 58 C 44 74, 56 74, 56 58 Z" fill="url(#trophyGrad)" />
      {/* Handles */}
      <path d="M 22 24 C 6 24, 6 48, 24 48" stroke="url(#trophyGrad)" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M 78 24 C 94 24, 94 48, 76 48" stroke="url(#trophyGrad)" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* Cup Bowl */}
      <path d="M 22 20 C 22 52, 36 62, 50 62 C 64 62, 78 52, 78 20 Z" fill="url(#trophyGrad)" />
      {/* Cup Rim */}
      <ellipse cx="50" cy="20" rx="28" ry="5.5" fill="#93C5FD" />
      <ellipse cx="50" cy="20" rx="25" ry="4" fill="#1D4ED8" />
      {/* Center White Star */}
      <polygon points="50,28 52.5,35 60,35 54,39.5 56.5,47 50,42.5 43.5,47 46,39.5 40,35 47.5,35" fill="#FFFFFF" />
    </svg>
  );
}

// ── Realistic Multi-Layer Flame Icon ──
function Flame3DIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} filter drop-shadow-md`} fill="none">
      <defs>
        <linearGradient id="flameOuterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF65A3" />
          <stop offset="40%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>
        <linearGradient id="flameCoreGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="60%" stopColor="#FF9F1C" />
          <stop offset="100%" stopColor="#F55D3E" />
        </linearGradient>
      </defs>
      {/* Outer Flame */}
      <path
        d="M 50 10
           C 55 22, 68 28, 74 38
           C 84 54, 78 78, 58 88
           C 34 98, 18 78, 26 56
           C 30 46, 40 38, 42 26
           C 44 32, 46 36, 50 10 Z"
        fill="url(#flameOuterGrad)"
      />
      {/* Specular Edge Highlight */}
      <path
        d="M 50 14 C 44 28, 38 34, 32 46 C 26 62, 34 80, 52 84 C 38 80, 30 64, 36 50 Z"
        fill="#FFFFFF"
        opacity="0.3"
      />
      {/* Inner Core Flame */}
      <path
        d="M 52 38
           C 56 46, 64 50, 66 58
           C 70 68, 64 80, 52 84
           C 36 88, 30 76, 36 62
           C 40 54, 48 48, 52 38 Z"
        fill="url(#flameCoreGrad)"
      />
    </svg>
  );
}

// ── Realistic Medal Icon with White Star Badge ──
function Medal3DIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} filter drop-shadow-md`} fill="none">
      <defs>
        <linearGradient id="ribbonGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="medalDiskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      {/* Left Ribbon Loop */}
      <path d="M 30 12 L 48 52 L 34 52 L 18 16 Z" fill="url(#ribbonGreenGrad)" />
      {/* Right Ribbon Loop */}
      <path d="M 70 12 L 52 52 L 66 52 L 82 16 Z" fill="url(#ribbonGreenGrad)" />
      {/* Top Ribbon Connector Bar */}
      <rect x="24" y="12" width="52" height="9" rx="4.5" fill="url(#ribbonGreenGrad)" />
      {/* Circular Medal Disc */}
      <circle cx="50" cy="64" r="22" fill="url(#medalDiskGrad)" />
      <circle cx="50" cy="64" r="18" stroke="#A7F3D0" strokeWidth="1.8" fill="none" opacity="0.6" />
      {/* Center White Star */}
      <polygon points="50,52 52.5,59 60,59 54,63.5 56.5,71 50,66.5 43.5,71 46,63.5 40,59 47.5,59" fill="#FFFFFF" />
    </svg>
  );
}
