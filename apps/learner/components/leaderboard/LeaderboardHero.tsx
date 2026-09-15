'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import TextType from '@/shared/design-system/ui/TextType/TextType';

interface LeaderboardHeroProps {
  topXp?: number;
  totalLearners?: number;
  userRank?: number;
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

  return <span>{displayValue.toLocaleString()}</span>;
}

// ─── Twin-Cannon Party Popper Particle Burst (HTML5 Canvas) ──────
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

    // Cannon burst 1: Left & Right Flanks
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
        decay: 0.0032 + Math.random() * 0.0022,
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
        decay: 0.0032 + Math.random() * 0.0022,
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
        decay: 0.0028 + Math.random() * 0.0020,
        shape: ['circle', 'star', 'diamond'][Math.floor(Math.random() * 3)] as any,
      });
    }

    let animationId: number;
    const gravity = 0.18;
    const drag = 0.988;

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
              ctx.lineTo((Math.cos(((18 + s * 72) * Math.PI) / 180) * p.size), (-Math.sin(((18 + s * 72) * Math.PI) / 180) * p.size));
              ctx.lineTo((Math.cos(((54 + s * 72) * Math.PI) / 180) * (p.size / 2)), (-Math.sin(((54 + s * 72) * Math.PI) / 180) * (p.size / 2)));
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

// ─── Main Leaderboard Hero Component ─────────────────────────────────────────
export default function LeaderboardHero({
  topXp = 48920,
  totalLearners = 1240,
  userRank = 47,
}: LeaderboardHeroProps) {
  const cubicEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

  return (
    <div className="relative w-full overflow-hidden pt-4 pb-4 flex flex-col items-center justify-center text-center">
      {/* ── 1. Twin Cannon Party Popper Canvas Animation Layer ── */}
      <ProfessionalPartyPopperCanvas />

      {/* Cannon Origin Blast Shockwave Rings */}
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

      {/* ── 2. Centered Main Hero Composition ── */}
      <div className="max-w-2xl mx-auto flex flex-col items-center text-center relative z-10 px-4 py-1">
        {/* Cursive Handwritten Heading: "Top Leaderboard" */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-3 flex items-baseline justify-center flex-wrap gap-2.5">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: cubicEase }}
            className="inline-block text-slate-900 dark:text-white font-extrabold text-4xl sm:text-5xl lg:text-6xl"
          >
            Top
          </motion.span>

          <div className="relative inline-block pb-2">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22, ease: cubicEase }}
              className="inline-block bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] bg-clip-text text-transparent px-1 text-5xl sm:text-6xl lg:text-7xl font-bold italic"
              style={{ fontFamily: "'Dancing Script', 'Satisfy', 'Amira-Grace', cursive" }}
            >
              Leaderboard
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
                stroke="url(#leaderboardBrushGradient)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="leaderboardBrushGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2962D6" />
                  <stop offset="55%" stopColor="#2C83F5" />
                  <stop offset="100%" stopColor="#27C5D8" />
                </linearGradient>
              </defs>
            </motion.svg>
          </div>
        </h1>

        {/* Subtitle with TextType typing animation */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: cubicEase }}
          className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-semibold max-w-lg leading-relaxed my-2 min-h-[30px] flex items-center justify-center text-center"
        >
          <TextType
            text={[
              'Top learners by XP — podium up top, ranks 4–20 below.',
              'Compete, complete challenges, and rise up the leaderboard!',
            ]}
            typingSpeed={50}
            deletingSpeed={25}
            pauseDuration={2200}
            showCursor={true}
            cursorCharacter="|"
            loop={true}
            className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-semibold"
          />
        </motion.div>
      </div>
    </div>
  );
}
