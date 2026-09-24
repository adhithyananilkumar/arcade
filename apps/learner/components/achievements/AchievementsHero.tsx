'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

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

// ─── Main Hero Component (Matches My Learning Design System) ───────────────────
export default function AchievementsHero({
  unlockedCount,
  totalBadges,
  streakDays = 14,
  certificatesCount,
}: AchievementsHeroProps) {
  const cubicEase: [number, number, number, number] = [0.16, 1, 0.3, 1];
  const shouldReduceMotion = useReducedMotion();
  const [msgIndex, setMsgIndex] = useState(0);

  const MESSAGES = [
    'Track your learning milestones & level up your skills',
    'Earn badges and showcase achievements',
    'Verify and share your certificates',
    'Keep up the great work!',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="pb-2 text-center flex flex-col items-center justify-center"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Satisfy&display=swap');
      `}</style>

      {/* Cursive Handwritten Heading matching reference style: "My Achievements" */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-3 flex items-baseline justify-center flex-wrap gap-2.5">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: cubicEase }}
          className="inline-block text-slate-900 dark:text-white font-extrabold text-4xl sm:text-5xl lg:text-6xl"
        >
          My
        </motion.span>

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

          {/* Blue-to-Cyan Gradient Curved Underline Stroke matching My Learning */}
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
              stroke="url(#myachievementsBrushGradient)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="myachievementsBrushGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2962D6" />
                <stop offset="55%" stopColor="#2C83F5" />
                <stop offset="100%" stopColor="#27C5D8" />
              </linearGradient>
            </defs>
          </motion.svg>
        </div>
      </h1>

      {/* Centered Subtitle Description */}
      <div className="mt-1 relative h-[30px] flex items-center justify-center w-full max-w-lg mx-auto overflow-hidden">
        <AnimatePresence>
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold leading-relaxed text-center w-full px-4"
          >
            {MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

    </motion.div>
  );
}
