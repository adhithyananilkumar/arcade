'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Award, Medal } from 'lucide-react';
import TextType from '@/shared/design-system/ui/TextType';

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
        canvas.height = 500;
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

    // Cannon burst 1: Left & Right Flanks (Slower decay for 3.5-4s duration)
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: leftX,
        y: startY,
        vx: 3 + Math.random() * 10,
        vy: -10 - Math.random() * 12,
        size: 5 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.18,
        opacity: 1,
        decay: 0.0032 + Math.random() * 0.0022, // 3.5 to 4 seconds lifespan
        shape: ['square', 'circle', 'ribbon', 'star', 'diamond'][Math.floor(Math.random() * 5)] as any,
      });

      particles.push({
        x: rightX,
        y: startY,
        vx: -3 - Math.random() * 10,
        vy: -10 - Math.random() * 12,
        size: 5 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.18,
        opacity: 1,
        decay: 0.0032 + Math.random() * 0.0022, // 3.5 to 4 seconds lifespan
        shape: ['square', 'circle', 'ribbon', 'star', 'diamond'][Math.floor(Math.random() * 5)] as any,
      });
    }

    // Top raining confetti cascade
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 80,
        vx: (Math.random() - 0.5) * 2.5,
        vy: 1.5 + Math.random() * 3.5,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.15,
        opacity: 1,
        decay: 0.0028 + Math.random() * 0.0020, // 3.5 to 4 seconds lifespan
        shape: ['circle', 'star', 'diamond'][Math.floor(Math.random() * 3)] as any,
      });
    }

    let animationId: number;
    const gravity = 0.18; // Soft fluttery gravity
    const drag = 0.988; // Gentle drag for 3-4s motion

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
  const cubicEase = [0.16, 1, 0.3, 1] as const;

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

      {/* ── 3. Centered Main Hero Composition ── */}
      <div className="max-w-2xl mx-auto flex flex-col items-center text-center relative z-10 px-4 py-1">

        {/* Cursive Handwritten Heading matching reference style: "My Achievements" */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-3 flex items-baseline justify-center flex-wrap gap-2.5">
          {/* "My" in bold dark text */}
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: cubicEase }}
            className="inline-block text-slate-900 dark:text-white font-extrabold text-4xl sm:text-5xl lg:text-6xl"
          >
            My
          </motion.span>

          {/* "Achievements" in Dancing Script with Blue-to-Cyan Gradient & Curved Underline */}
          <div className="relative inline-block pb-2">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22, ease: cubicEase }}
              className="inline-block bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] bg-clip-text text-transparent px-1 text-5xl sm:text-6xl lg:text-7xl font-bold italic"
              style={{ fontFamily: "'Dancing Script', 'Satisfy', 'Amira-Grace', cursive" }}
            >
              Achievements
            </motion.span>

            {/* Blue-to-Cyan Gradient Curved Underline Stroke */}
            <motion.svg
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.35, ease: cubicEase }}
              viewBox="0 0 300 20"
              fill="none"
              className="absolute -bottom-1 left-0 w-full h-4 pointer-events-none"
            >
              <path
                d="M 8 13 C 90 4, 210 3, 292 11"
                stroke="url(#titleBrushGradient)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="titleBrushGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2962D6" />
                  <stop offset="55%" stopColor="#2C83F5" />
                  <stop offset="100%" stopColor="#27C5D8" />
                </linearGradient>
              </defs>
            </motion.svg>
          </div>
        </h1>

        {/* Centered Subtitle Description with React Bits TextType Component */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: cubicEase }}
          className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-semibold max-w-lg leading-relaxed my-2 min-h-[40px] flex items-center justify-center text-center"
        >
          <TextType
            text={[
              "Track your learning milestones & level up your skills.",
              "Earn certificates, unlock badges, & complete challenges."
            ]}
            typingSpeed={55}
            deletingSpeed={30}
            pauseDuration={2200}
            showCursor={true}
            cursorCharacter="|"
            loop={true}
            className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-semibold"
          />
        </motion.div>

        {/* ── Centered 3-Column Statistics Row (Exact 1:1 Match to Reference Image) ── */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6 w-full max-w-lg mx-auto mt-3 pt-1">

          {/* Stat 1: Badges Unlocked */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.5, ease: cubicEase }}
            className="flex flex-col items-center text-center group"
          >
            <div className="text-xl sm:text-3xl font-black text-[#1877F2] dark:text-blue-400 tracking-tight mt-1">
              <SmoothCounter value={unlockedCount} delay={0.55} />
              <span className="text-base sm:text-xl font-bold text-slate-400 font-sans ml-1.5">/ {totalBadges}</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mt-1 mb-2">
              Badges Unlocked
            </p>
          </motion.div>

          {/* Stat 2: Active Streak */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.62, ease: cubicEase }}
            className="flex flex-col items-center text-center group"
          >
            <div className="text-xl sm:text-3xl font-black text-[#F43F5E] dark:text-rose-400 tracking-tight mt-1">
              <SmoothCounter value={streakDays} delay={0.67} />
              <span className="text-sm sm:text-base font-bold text-slate-500 dark:text-slate-400 font-sans ml-1.5">Days</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mt-1 mb-2">
              Active Streak
            </p>
          </motion.div>

          {/* Stat 3: Certificates */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.74, ease: cubicEase }}
            className="flex flex-col items-center text-center group"
          >
            <div className="text-xl sm:text-3xl font-black text-[#10B981] dark:text-emerald-400 tracking-tight mt-1">
              <SmoothCounter value={certificatesCount} delay={0.78} />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mt-1 mb-2">
              Certificates
            </p>
          </motion.div>

        </div>

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
