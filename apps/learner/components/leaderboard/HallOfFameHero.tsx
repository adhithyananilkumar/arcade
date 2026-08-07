'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export interface Top3Winner {
  rank: number;
  avatar: string;
  name?: string;
  level?: number;
  xp?: number;
  coursesCount?: number;
  certificatesCount?: number;
}

interface HallOfFameHeroProps {
  top3?: Top3Winner[];
}

const DEFAULT_TOP3: Top3Winner[] = [
  {
    rank: 1,
    avatar: '/hall-of-fame/avatar1.jpg',
    name: 'First Place Winner',
    level: 54,
    xp: 48900,
    coursesCount: 24,
    certificatesCount: 18,
  },
  {
    rank: 2,
    avatar: '/hall-of-fame/avatar2.jpg',
    name: 'Second Place Winner',
    level: 50,
    xp: 41300,
    coursesCount: 18,
    certificatesCount: 15,
  },
  {
    rank: 3,
    avatar: '/hall-of-fame/avatar3.jpg',
    name: 'Third Place Winner',
    level: 49,
    xp: 39800,
    coursesCount: 16,
    certificatesCount: 12,
  },
];

export default function HallOfFameHero({ top3 = DEFAULT_TOP3 }: HallOfFameHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const first = top3.find((u) => u.rank === 1) || DEFAULT_TOP3[0];
  const second = top3.find((u) => u.rank === 2) || DEFAULT_TOP3[1];
  const third = top3.find((u) => u.rank === 3) || DEFAULT_TOP3[2];

  // Canvas particle engine: Tiny Pink Particles across card + Golden Sparkles around crown only
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const pinkShades = ['#FF5FA2', '#FF7EB6', '#F472B6'];

    // Tiny pink floating particles (slowly drifting)
    const particleCount = 40;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.6,
      alpha: Math.random() * 0.35 + 0.15,
      speedX: (Math.random() - 0.5) * 0.18,
      speedY: -Math.random() * 0.22 - 0.05,
      pulseSpeed: Math.random() * 0.012 + 0.004,
      pulsePhase: Math.random() * Math.PI * 2,
      color: pinkShades[Math.floor(Math.random() * pinkShades.length)],
    }));

    // Tiny golden sparkles (#F4B942) around the crown ONLY (center top)
    const crownSparkles = Array.from({ length: 6 }, () => ({
      offsetX: (Math.random() - 0.5) * 80,
      offsetY: Math.random() * 30 - 15,
      size: Math.random() * 3 + 1.8,
      alpha: 0,
      maxAlpha: Math.random() * 0.5 + 0.3,
      speed: Math.random() * 0.02 + 0.008,
      phase: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render drifting pink particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulsePhase += p.pulseSpeed;

        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = (Math.sin(p.pulsePhase) * 0.5 + 0.5) * p.alpha;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.restore();
      });

      // Render golden sparkles around crown (center top: x = width / 2, y = 65)
      const crownCenterX = width / 2;
      const crownCenterY = 65;

      crownSparkles.forEach((s) => {
        s.phase += s.speed;
        const currentAlpha = Math.max(0, Math.sin(s.phase)) * s.maxAlpha;

        if (currentAlpha > 0.01) {
          const sx = crownCenterX + s.offsetX;
          const sy = crownCenterY + s.offsetY;

          ctx.save();
          ctx.translate(sx, sy);
          ctx.fillStyle = '#F4B942';
          ctx.shadowColor = '#F4B942';
          ctx.shadowBlur = 6;
          ctx.globalAlpha = currentAlpha;

          // Tiny 4-point star sparkle
          ctx.beginPath();
          ctx.moveTo(-s.size, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s.size);
          ctx.quadraticCurveTo(0, 0, s.size, 0);
          ctx.quadraticCurveTo(0, 0, 0, s.size);
          ctx.quadraticCurveTo(0, 0, -s.size, 0);
          ctx.fill();
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const formatXp = (xp?: number) => {
    if (!xp) return '48.9K';
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
    return xp.toString();
  };

  return (
    <div className="relative mx-auto w-full max-w-[1400px]">
      {/* Pure White Hall of Fame Card Container */}
      <div
        className="hallOfFameCard relative min-h-[420px] w-full overflow-hidden rounded-[30.5px] bg-white px-6 py-8 sm:px-12 md:py-10"
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '30.5px',
          isolation: 'isolate',
          background: '#FFFFFF',
          border: '1px solid #EFEFEF',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Layer 0: Pure White Background Base */}
        <div
          className="galaxyLayer absolute inset-0 z-0 pointer-events-none bg-white"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            background: '#FFFFFF',
          }}
        />

        {/* Layer 1: Moving Pink Particles & Crown Golden Sparkles Canvas Layer */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
        />

        {/* Layer 2: Winner Content Layer */}
        <div
          className="contentLayer relative z-2 flex h-full min-h-[330px] w-full items-center justify-center"
          style={{ position: 'relative', zIndex: 2 }}
        >
          <div className="grid w-full max-w-4xl grid-cols-3 items-center justify-items-center gap-3 sm:gap-6 md:gap-12">
            
            {/* ================= SECOND PLACE (LEFT) ================= */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group relative flex flex-col items-center text-center"
            >
              {/* Avatar Frame (Subtle shadow & thin border only) */}
              <div className="relative">
                <div className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full border border-[#EFEFEF] bg-white p-[3px] shadow-sm transition-transform duration-500 group-hover:scale-102 sm:h-[128px] sm:w-[128px]">
                  <div
                    className="absolute inset-0 rounded-full p-[2px]"
                    style={{
                      background:
                        'linear-gradient(135deg, #F1F5F9 0%, #CBD5E1 50%, #94A3B8 100%)',
                    }}
                  />
                  <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-white bg-slate-50">
                    <img
                      src={second.avatar}
                      alt="2nd Place Winner"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>

              {/* Rank Badge #2 */}
              <div className="mt-2.5 flex flex-col items-center">
                <div className="flex items-center justify-center rounded-full border border-[#EFEFEF] bg-white px-3.5 py-0.5 shadow-xs">
                  <span className="font-sans text-2xl font-black tracking-tight text-[#1F2937] sm:text-3xl">
                    2
                  </span>
                </div>

                {/* Compact Integrated Stats Row */}
                <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[12px] font-bold text-[#1F2937]">
                  <span className="inline-flex items-center gap-0.5">
                    <span>🥇</span> {second.coursesCount ? second.coursesCount * 2 : 36}
                  </span>
                  <span className="text-[#6B7280]">•</span>
                  <span className="inline-flex items-center gap-0.5">
                    <span>📜</span> {second.certificatesCount || 15}
                  </span>
                  <span className="text-[#6B7280]">•</span>
                  <span className="inline-flex items-center gap-0.5 text-[#F4B942]">
                    <span>⭐</span> {formatXp(second.xp || 41300)}
                  </span>
                </div>

                <span className="mt-0.5 text-[11px] font-semibold text-[#6B7280]">
                  Lv.{second.level || 50}
                </span>
              </div>
            </motion.div>

            {/* ================= FIRST PLACE (CENTER - ELEVATED) ================= */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, type: 'spring', bounce: 0.25 }}
              className="group relative -mt-6 flex flex-col items-center text-center sm:-mt-8"
            >
              {/* Soft Radial Golden Glow behind #1 only */}
              <div
                className="pointer-events-none absolute -inset-10 rounded-full opacity-40 transition-all duration-700 group-hover:opacity-60 group-hover:scale-105"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(244, 185, 66, 0.25) 45%, transparent 70%)',
                  filter: 'blur(24px)',
                }}
              />

              {/* Handcrafted Flat 2D Royal Crown (Matte Gold #F4B942 & Dark Outline #D89A1D) */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-2 z-20 relative flex items-center justify-center"
              >
                {/* Subtle Crown Shimmer Animation */}
                <motion.div
                  animate={{ opacity: [0.85, 1, 0.85] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <svg
                    className="h-9 w-12 sm:h-11 sm:w-14"
                    viewBox="0 0 48 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      filter: 'drop-shadow(0 3px 8px rgba(244, 185, 66, 0.35))',
                    }}
                  >
                    {/* Crown Main Body - Flat Matte Gold #F4B942 with #D89A1D Stroke */}
                    <path
                      d="M6 25H42L45 9.5L33.5 15.5L24 3.5L14.5 15.5L3 9.5L6 25Z"
                      fill="#F4B942"
                      stroke="#D89A1D"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    {/* Crown Base Strip */}
                    <path
                      d="M6 25C6 25 15 27 24 27C33 27 42 25 42 25V28.5C42 28.5 33 30.5 24 30.5C15 30.5 6 28.5 6 28.5V25Z"
                      fill="#D89A1D"
                    />
                    {/* Minimal Gemstone Accents (Ivory #FFF9EC) */}
                    <circle cx="24" cy="3.5" r="2.2" fill="#FFF9EC" stroke="#D89A1D" strokeWidth="1" />
                    <circle cx="3" cy="9.5" r="1.8" fill="#FFF9EC" stroke="#D89A1D" strokeWidth="1" />
                    <circle cx="45" cy="9.5" r="1.8" fill="#FFF9EC" stroke="#D89A1D" strokeWidth="1" />
                    <circle cx="24" cy="16" r="1.6" fill="#FFF9EC" />
                  </svg>
                </motion.div>
              </motion.div>

              {/* Avatar Frame with Curved Vector Laurel Branches & Gentle 2-3px Float */}
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative flex items-center justify-center"
              >
                {/* Handcrafted Symmetrical 2D Vector Laurel Branches (Replaces Wings) */}
                <div
                  className="pointer-events-none absolute -inset-x-8 -inset-y-4 z-10 flex items-center justify-between opacity-95 sm:-inset-x-11 sm:-inset-y-6"
                  style={{
                    filter: 'drop-shadow(0 3px 8px rgba(244, 185, 66, 0.3))',
                  }}
                >
                  {/* Left Laurel Branch */}
                  <svg className="h-28 w-12 sm:h-36 sm:w-16" viewBox="0 0 60 120" fill="none">
                    <path
                      d="M48 105C32 90 20 68 22 40C23 26 29 12 36 2"
                      stroke="#D89A1D"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                    <path d="M42 98C28 98 16 88 18 78C24 78 36 86 42 98Z" fill="#F4B942" stroke="#D89A1D" strokeWidth="1" />
                    <path d="M34 82C20 78 12 66 16 56C22 58 30 68 34 82Z" fill="#F4B942" stroke="#D89A1D" strokeWidth="1" />
                    <path d="M28 64C16 58 10 44 16 36C21 38 27 50 28 64Z" fill="#F4B942" stroke="#D89A1D" strokeWidth="1" />
                    <path d="M26 44C16 36 12 24 20 16C24 20 27 32 26 44Z" fill="#F4B942" stroke="#D89A1D" strokeWidth="1" />
                    <path d="M30 25C22 15 22 4 30 0C32 6 32 18 30 25Z" fill="#FFF9EC" stroke="#D89A1D" strokeWidth="1" />
                  </svg>

                  {/* Right Laurel Branch */}
                  <svg className="h-28 w-12 sm:h-36 sm:w-16" viewBox="0 0 60 120" fill="none">
                    <path
                      d="M12 105C28 90 40 68 38 40C37 26 31 12 24 2"
                      stroke="#D89A1D"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                    <path d="M18 98C32 98 44 88 42 78C36 78 24 86 18 98Z" fill="#F4B942" stroke="#D89A1D" strokeWidth="1" />
                    <path d="M26 82C40 78 48 66 44 56C38 58 30 68 26 82Z" fill="#F4B942" stroke="#D89A1D" strokeWidth="1" />
                    <path d="M32 64C44 58 50 44 44 36C39 38 33 50 32 64Z" fill="#F4B942" stroke="#D89A1D" strokeWidth="1" />
                    <path d="M34 44C44 36 48 24 40 16C36 20 33 32 34 44Z" fill="#F4B942" stroke="#D89A1D" strokeWidth="1" />
                    <path d="M30 25C38 15 38 4 30 0C28 6 28 18 30 25Z" fill="#FFF9EC" stroke="#D89A1D" strokeWidth="1" />
                  </svg>
                </div>

                {/* Double-Ring Avatar Design (Outer Gold #F4B942 + Inner Ivory #FFF9EC) */}
                <div className="relative flex h-[155px] w-[155px] items-center justify-center rounded-full border-2 border-[#F4B942] bg-[#FFF9EC] p-[4px] shadow-[0_16px_36px_-8px_rgba(244,185,66,0.3)] transition-transform duration-500 group-hover:scale-102 sm:h-[168px] sm:w-[168px]">
                  {/* Subtle Metallic Ring Accent */}
                  <div
                    className="absolute inset-0 rounded-full p-[2.5px]"
                    style={{
                      background:
                        'linear-gradient(135deg, #FFF9EC 0%, #FDE047 35%, #F4B942 70%, #D89A1D 100%)',
                    }}
                  />
                  <div className="relative h-full w-full overflow-hidden rounded-full border-[3px] border-[#FFF9EC] bg-[#FFF9EC] shadow-[inset_0_3px_6px_rgba(0,0,0,0.1)]">
                    <img
                      src={first.avatar}
                      alt="1st Place Winner"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Gold Rank Badge #1 */}
              <div className="mt-2.5 flex flex-col items-center">
                <div className="flex items-center justify-center rounded-full border border-amber-300/80 bg-gradient-to-b from-amber-50 via-amber-100/70 to-yellow-100/90 px-4.5 py-0.5 shadow-[0_4px_14px_rgba(244,185,66,0.35)]">
                  <span
                    className="font-sans text-3xl font-black tracking-tight text-[#F4B942] sm:text-4xl"
                    style={{
                      backgroundImage:
                        'linear-gradient(180deg, #FDE047 0%, #F4B942 50%, #CA8A04 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 2px 4px rgba(244,185,66,0.4))',
                    }}
                  >
                    1
                  </span>
                </div>

                {/* Compact One-Row Stats Line for #1 */}
                <div className="mt-2.5 flex items-center justify-center gap-2 text-[13px] font-bold text-[#1F2937]">
                  <span className="inline-flex items-center gap-1">
                    <span>🥇</span> {first.coursesCount ? first.coursesCount * 2 : 48}
                  </span>
                  <span className="text-[#6B7280]">•</span>
                  <span className="inline-flex items-center gap-1">
                    <span>📜</span> {first.certificatesCount || 18}
                  </span>
                  <span className="text-[#6B7280]">•</span>
                  <span className="inline-flex items-center gap-1 text-[#F4B942]">
                    <span>⭐</span> {formatXp(first.xp || 48900)}
                  </span>
                </div>

                <span className="mt-0.5 text-[11px] font-semibold text-[#6B7280]">
                  Lv.{first.level || 54}
                </span>
              </div>
            </motion.div>

            {/* ================= THIRD PLACE (RIGHT) ================= */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative flex flex-col items-center text-center"
            >
              {/* Avatar Frame (Subtle shadow & thin border only) */}
              <div className="relative">
                <div className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full border border-[#EFEFEF] bg-white p-[3px] shadow-sm transition-transform duration-500 group-hover:scale-102 sm:h-[128px] sm:w-[128px]">
                  <div
                    className="absolute inset-0 rounded-full p-[2px]"
                    style={{
                      background:
                        'linear-gradient(135deg, #FFEDD5 0%, #FB923C 50%, #C2410C 100%)',
                    }}
                  />
                  <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-white bg-orange-50">
                    <img
                      src={third.avatar}
                      alt="3rd Place Winner"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>

              {/* Rank Badge #3 */}
              <div className="mt-2.5 flex flex-col items-center">
                <div className="flex items-center justify-center rounded-full border border-[#EFEFEF] bg-white px-3.5 py-0.5 shadow-xs">
                  <span className="font-sans text-2xl font-black tracking-tight text-[#1F2937] sm:text-3xl">
                    3
                  </span>
                </div>

                {/* Compact Integrated Stats Row */}
                <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[12px] font-bold text-[#1F2937]">
                  <span className="inline-flex items-center gap-0.5">
                    <span>🥇</span> {third.coursesCount ? third.coursesCount * 2 : 32}
                  </span>
                  <span className="text-[#6B7280]">•</span>
                  <span className="inline-flex items-center gap-0.5">
                    <span>📜</span> {third.certificatesCount || 12}
                  </span>
                  <span className="text-[#6B7280]">•</span>
                  <span className="inline-flex items-center gap-0.5 text-[#F4B942]">
                    <span>⭐</span> {formatXp(third.xp || 39800)}
                  </span>
                </div>

                <span className="mt-0.5 text-[11px] font-semibold text-[#6B7280]">
                  Lv.{third.level || 49}
                </span>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
