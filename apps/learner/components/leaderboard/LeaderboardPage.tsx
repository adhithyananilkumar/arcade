'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Flame, Zap, Search, Users, Globe, Calendar,
  Star, Clock, Info, Award, Medal
} from 'lucide-react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { Card, CardContent } from '@/shared/design-system/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/design-system/ui/avatar';
import { Badge } from '@/shared/design-system/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/design-system/ui/select';
import TextType from '@/shared/design-system/ui/TextType';
import BadgeGraphic from './BadgeGraphic';

// ─── Smooth Counter Component ────────────────────────────────────────────────
function SmoothCounter({ value, duration = 1200, delay = 0, suffix = "" }: { value: number; duration?: number; delay?: number; suffix?: string }) {
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

  return <span>{displayValue.toLocaleString()}{suffix}</span>;
}

// ─── Falling Confetti Canvas (Matching Achievement Hero Animation) ─────────────
function HeroConfettiCanvas() {
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
        canvas.height = 360;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    const colors = ['#2962D6', '#38BDF8', '#27C5D8', '#F59E0B', '#A855F7', '#10B981', '#EC4899'];

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
      shape: 'square' | 'circle' | 'star' | 'diamond';
    }

    const particles: Particle[] = [];
    const leftX = canvas.width * 0.15;
    const rightX = canvas.width * 0.85;
    const startY = 30;

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: leftX,
        y: startY,
        vx: 2 + Math.random() * 7,
        vy: -7 - Math.random() * 9,
        size: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.15,
        opacity: 1,
        decay: 0.0035 + Math.random() * 0.002,
        shape: ['square', 'circle', 'star', 'diamond'][Math.floor(Math.random() * 4)] as any,
      });

      particles.push({
        x: rightX,
        y: startY,
        vx: -2 - Math.random() * 7,
        vy: -7 - Math.random() * 9,
        size: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.15,
        opacity: 1,
        decay: 0.0035 + Math.random() * 0.002,
        shape: ['square', 'circle', 'star', 'diamond'][Math.floor(Math.random() * 4)] as any,
      });
    }

    let animationId: number;
    const gravity = 0.15;
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

// ─── Reference Crown Icons (Color Tiered: #F4B400 Gold, #BFC6D1 Silver, #C97A38 Bronze) ─────
function FlatGoldCrown({ className = "w-9 h-7 sm:w-10 sm:h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 20 62 C 18 48, 12 36, 16 30 C 24 38, 36 48, 43 40 C 40 34, 43 22, 50 12 C 57 22, 60 34, 57 40 C 64 48, 76 38, 84 30 C 88 36, 82 48, 80 62 Z"
        stroke="#0F172A"
        strokeWidth="5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 50 12 C 57 22, 60 34, 57 40 C 64 48, 76 38, 84 30 C 88 36, 82 48, 80 62 L 50 62 Z"
        fill="#F4B400"
      />
      <path
        d="M 20 62 C 18 48, 12 36, 16 30 C 24 38, 36 48, 43 40 C 40 34, 43 22, 50 12 L 50 62 Z"
        fill="#FFE875"
      />
      <polygon
        points="50,28 57,37 50,46 43,37"
        fill="#F43F5E"
        stroke="#0F172A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <rect
        x="18"
        y="60"
        width="64"
        height="12"
        rx="6"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth="4.5"
      />
    </svg>
  );
}

function FlatSilverCrown({ className = "w-8.5 h-6.5 sm:w-9.5 sm:h-7.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 20 62 C 18 48, 12 36, 16 30 C 24 38, 36 48, 43 40 C 40 34, 43 22, 50 12 C 57 22, 60 34, 57 40 C 64 48, 76 38, 84 30 C 88 36, 82 48, 80 62 Z"
        stroke="#0F172A"
        strokeWidth="5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 50 12 C 57 22, 60 34, 57 40 C 64 48, 76 38, 84 30 C 88 36, 82 48, 80 62 L 50 62 Z"
        fill="#BFC6D1"
      />
      <path
        d="M 20 62 C 18 48, 12 36, 16 30 C 24 38, 36 48, 43 40 C 40 34, 43 22, 50 12 L 50 62 Z"
        fill="#E2E8F0"
      />
      <polygon
        points="50,28 57,37 50,46 43,37"
        fill="#38BDF8"
        stroke="#0F172A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <rect
        x="18"
        y="60"
        width="64"
        height="12"
        rx="6"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth="4.5"
      />
    </svg>
  );
}

function FlatBronzeCrown({ className = "w-8.5 h-6.5 sm:w-9.5 sm:h-7.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 20 62 C 18 48, 12 36, 16 30 C 24 38, 36 48, 43 40 C 40 34, 43 22, 50 12 C 57 22, 60 34, 57 40 C 64 48, 76 38, 84 30 C 88 36, 82 48, 80 62 Z"
        stroke="#0F172A"
        strokeWidth="5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 50 12 C 57 22, 60 34, 57 40 C 64 48, 76 38, 84 30 C 88 36, 82 48, 80 62 L 50 62 Z"
        fill="#C97A38"
      />
      <path
        d="M 20 62 C 18 48, 12 36, 16 30 C 24 38, 36 48, 43 40 C 40 34, 43 22, 50 12 L 50 62 Z"
        fill="#FFEDD5"
      />
      <polygon
        points="50,28 57,37 50,46 43,37"
        fill="#F59E0B"
        stroke="#0F172A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <rect
        x="18"
        y="60"
        width="64"
        height="12"
        rx="6"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth="4.5"
      />
    </svg>
  );
}

// ─── Data Types & Initial Data ─────────────────────────────────────────────────
export interface LeaderboardUser {
  rank: number;
  name: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  roleBadge: string;
  coursesCount: number;
  certificatesCount: number;
  badgeTypes: string[];
  weeklyChange: number;
  isFriend?: boolean;
}

export interface MonthlyArchiveData {
  id: string;
  month: string;
  year: number;
  totalParticipants: number;
  champions: {
    rank: 1 | 2 | 3;
    name: string;
    username: string;
    avatar: string;
    xp: number;
  }[];
}

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
];

const GLOBAL_USERS: LeaderboardUser[] = [
  {
    rank: 1,
    name: 'Arjun Mehta',
    username: '@amehta',
    avatar: AVATARS[0],
    level: 54,
    xp: 12850,
    roleBadge: 'Master Coder',
    coursesCount: 24,
    certificatesCount: 18,
    badgeTypes: ['sword-crown', 'mountain', 'star'],
    weeklyChange: 2,
    isFriend: true,
  },
  {
    rank: 2,
    name: 'Diya Sharma',
    username: '@dsharma',
    avatar: AVATARS[1],
    level: 50,
    xp: 10230,
    roleBadge: 'Code Explorer',
    coursesCount: 18,
    certificatesCount: 15,
    badgeTypes: ['potion', 'flower'],
    weeklyChange: 1,
    isFriend: true,
  },
  {
    rank: 3,
    name: 'Rohit Verma',
    username: '@rverma',
    avatar: AVATARS[2],
    level: 49,
    xp: 8760,
    roleBadge: 'Bug Slayer',
    coursesCount: 16,
    certificatesCount: 12,
    badgeTypes: ['shield-book', 'lightning'],
    weeklyChange: 3,
    isFriend: false,
  },
  {
    rank: 4,
    name: 'Sneha Iyer',
    username: '@siyer',
    avatar: AVATARS[3],
    level: 14,
    xp: 6540,
    roleBadge: 'UI Wizard',
    coursesCount: 15,
    certificatesCount: 11,
    badgeTypes: ['shield-book', 'star', 'flower'],
    weeklyChange: -1,
    isFriend: true,
  },
  {
    rank: 5,
    name: 'Kabir Singh',
    username: '@ksingh',
    avatar: AVATARS[4],
    level: 13,
    xp: 5980,
    roleBadge: 'Code Architect',
    coursesCount: 14,
    certificatesCount: 10,
    badgeTypes: ['shield-book', 'lightning', 'flower'],
    weeklyChange: 4,
    isFriend: false,
  },
  {
    rank: 6,
    name: 'Ananya Reddy',
    username: '@areddy',
    avatar: AVATARS[5],
    level: 12,
    xp: 5210,
    roleBadge: 'Problem Solver',
    coursesCount: 12,
    certificatesCount: 9,
    badgeTypes: ['star', 'shield-book', 'flower'],
    weeklyChange: 0,
    isFriend: true,
  },
  {
    rank: 7,
    name: 'Vivek Nair',
    username: '@vnair',
    avatar: AVATARS[6],
    level: 11,
    xp: 4760,
    roleBadge: 'Debug Master',
    coursesCount: 11,
    certificatesCount: 8,
    badgeTypes: ['lightning', 'shield-book', 'star'],
    weeklyChange: 2,
    isFriend: false,
  },
  {
    rank: 8,
    name: 'Meera Joshi',
    username: '@mjoshi',
    avatar: AVATARS[7],
    level: 10,
    xp: 4120,
    roleBadge: 'Logic Builder',
    coursesCount: 10,
    certificatesCount: 7,
    badgeTypes: ['shield-book', 'flower', 'star'],
    weeklyChange: -2,
    isFriend: true,
  },
  {
    rank: 9,
    name: 'Aditya Patil',
    username: '@apatil',
    avatar: AVATARS[8],
    level: 10,
    xp: 3890,
    roleBadge: 'Backend Pro',
    coursesCount: 9,
    certificatesCount: 6,
    badgeTypes: ['lightning', 'shield-book', 'flower'],
    weeklyChange: 1,
    isFriend: false,
  },
  {
    rank: 10,
    name: 'Pavan Kumar',
    username: '@pkumar',
    avatar: AVATARS[9],
    level: 9,
    xp: 3240,
    roleBadge: 'Code Rookie',
    coursesCount: 8,
    certificatesCount: 6,
    badgeTypes: ['star', 'flower', 'shield-book'],
    weeklyChange: 3,
    isFriend: true,
  },
];

const MONTHLY_ARCHIVES: MonthlyArchiveData[] = [
  {
    id: 'july-2026',
    month: 'July',
    year: 2026,
    totalParticipants: 1140,
    champions: [
      { rank: 1, name: 'Diya Sharma', username: '@dsharma', avatar: AVATARS[1], xp: 34200 },
      { rank: 2, name: 'Arjun Mehta', username: '@amehta', avatar: AVATARS[0], xp: 31800 },
      { rank: 3, name: 'Sneha Iyer', username: '@siyer', avatar: AVATARS[3], xp: 28500 },
    ],
  },
  {
    id: 'june-2026',
    month: 'June',
    year: 2026,
    totalParticipants: 1080,
    champions: [
      { rank: 1, name: 'Rohit Verma', username: '@rverma', avatar: AVATARS[2], xp: 32900 },
      { rank: 2, name: 'Ananya Reddy', username: '@areddy', avatar: AVATARS[5], xp: 29400 },
      { rank: 3, name: 'Kabir Singh', username: '@ksingh', avatar: AVATARS[4], xp: 27100 },
    ],
  },
  {
    id: 'may-2026',
    month: 'May',
    year: 2026,
    totalParticipants: 990,
    champions: [
      { rank: 1, name: 'Kabir Singh', username: '@ksingh', avatar: AVATARS[4], xp: 30500 },
      { rank: 2, name: 'Vivek Nair', username: '@vnair', avatar: AVATARS[6], xp: 28200 },
      { rank: 3, name: 'Diya Sharma', username: '@dsharma', avatar: AVATARS[1], xp: 26400 },
    ],
  },
  {
    id: 'april-2026',
    month: 'April',
    year: 2026,
    totalParticipants: 920,
    champions: [
      { rank: 1, name: 'Sneha Iyer', username: '@siyer', avatar: AVATARS[3], xp: 29800 },
      { rank: 2, name: 'Meera Joshi', username: '@mjoshi', avatar: AVATARS[7], xp: 27300 },
      { rank: 3, name: 'Aditya Patil', username: '@apatil', avatar: AVATARS[8], xp: 25100 },
    ],
  },
  {
    id: 'march-2026',
    month: 'March',
    year: 2026,
    totalParticipants: 860,
    champions: [
      { rank: 1, name: 'Arjun Mehta', username: '@amehta', avatar: AVATARS[0], xp: 33100 },
      { rank: 2, name: 'Rohit Verma', username: '@rverma', avatar: AVATARS[2], xp: 30200 },
      { rank: 3, name: 'Pavan Kumar', username: '@pkumar', avatar: AVATARS[9], xp: 26800 },
    ],
  },
  {
    id: 'february-2026',
    month: 'February',
    year: 2026,
    totalParticipants: 790,
    champions: [
      { rank: 1, name: 'Ananya Reddy', username: '@areddy', avatar: AVATARS[5], xp: 28900 },
      { rank: 2, name: 'Diya Sharma', username: '@dsharma', avatar: AVATARS[1], xp: 26500 },
      { rank: 3, name: 'Vivek Nair', username: '@vnair', avatar: AVATARS[6], xp: 24700 },
    ],
  },
];

const USER_OUTSIDE: LeaderboardUser = {
  rank: 18,
  name: 'You',
  username: '@you',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
  level: 8,
  xp: 2840,
  roleBadge: 'Learner',
  coursesCount: 7,
  certificatesCount: 4,
  badgeTypes: ['mountain', 'star'],
  weeklyChange: 4,
  isFriend: true,
};

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'current' | 'archives'>('current');
  const [timeFilter, setTimeFilter] = useState<string>('this-week');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const cubicEase = [0.16, 1, 0.3, 1] as const;

  // Sync logged in user profile
  const meUser: LeaderboardUser = useMemo(() => ({
    ...USER_OUTSIDE,
    name: user?.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'You'),
    username: user?.username ? `@${user.username}` : USER_OUTSIDE.username,
    avatar: user?.avatarUrl || USER_OUTSIDE.avatar,
  }), [user]);

  // Dataset filter based on tab & time period
  const dataset = useMemo(() => {
    let source = GLOBAL_USERS;

    if (timeFilter === 'all-time') {
      source = source.map((u) => ({
        ...u,
        xp: Math.round(u.xp * 3.8),
        level: Math.round(u.level * 2),
      }));
    } else if (timeFilter === 'this-month') {
      source = source.map((u) => ({
        ...u,
        xp: Math.round(u.xp * 1.8),
      }));
    }

    return source.sort((a, b) => b.xp - a.xp).map((u, i) => ({ ...u, rank: i + 1 }));
  }, [timeFilter]);

  const top3 = dataset.slice(0, 3);
  const firstUser = top3[0];
  const secondUser = top3[1];
  const thirdUser = top3[2];

  const remainingList = useMemo(() => {
    const list = dataset.slice(3);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.roleBadge.toLowerCase().includes(q)
    );
  }, [dataset, searchQuery]);

  return (
    <div className="w-full min-h-screen text-slate-900 dark:text-slate-100 font-sans relative overflow-hidden bg-white dark:bg-neutral-950">

      {/* Subtle ambient light gradient background matching Explore & Achievements */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[400px]"
        style={{
          backgroundImage: [
            'radial-gradient(ellipse 50% 35% at 50% 0%, rgba(41, 98, 214, 0.05) 0%, transparent 70%)',
            'radial-gradient(ellipse 40% 25% at 85% 5%, rgba(39, 197, 216, 0.04) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      <div className="max-w-6xl mx-auto pt-8 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── HERO SECTION (Strict Vertical Rhythm: Title -> Subtitle -> Stats -> Nav) ── */}
        <div className="relative w-full overflow-hidden pt-4 pb-4 mb-4 flex flex-col items-center justify-center text-center">
          <HeroConfettiCanvas />

          <div className="max-w-2xl mx-auto flex flex-col items-center text-center relative z-10 px-4">
            
            {/* Title: Top Performers */}
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
                  Performers
                </motion.span>

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
                    stroke="url(#titleBrushGradientLeaderboard)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="titleBrushGradientLeaderboard" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2962D6" />
                      <stop offset="55%" stopColor="#2C83F5" />
                      <stop offset="100%" stopColor="#27C5D8" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              </div>
            </h1>

            {/* Subtitle with TextType animation */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: cubicEase }}
              className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-semibold max-w-lg leading-relaxed mb-6 min-h-[36px] flex items-center justify-center text-center"
            >
              <TextType
                text={[
                  "Compete, climb the ranks, and be the best!",
                  "Earn points each week to reach the Hall of Champions."
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

            {/* ── 3 Text-Only Statistics Row (Perfect Equal Spacing & Label Alignment) ── */}
            <div className="grid grid-cols-3 gap-6 sm:gap-12 w-full max-w-md mx-auto my-4 pt-2">

              {/* Stat 1: Participants */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.3, ease: cubicEase }}
                className="flex flex-col items-center text-center"
              >
                <div className="text-2xl sm:text-3xl font-black text-[#2962D6] dark:text-blue-400 tracking-tight">
                  <SmoothCounter value={1287} delay={0.35} />
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">
                  Participants
                </p>
              </motion.div>

              {/* Stat 2: Weekly XP */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.4, ease: cubicEase }}
                className="flex flex-col items-center text-center"
              >
                <div className="text-2xl sm:text-3xl font-black text-[#F43F5E] dark:text-rose-400 tracking-tight">
                  <SmoothCounter value={8420} delay={0.45} />
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">
                  Weekly XP
                </p>
              </motion.div>

              {/* Stat 3: Days Left */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.5, ease: cubicEase }}
                className="flex flex-col items-center text-center"
              >
                <div className="text-2xl sm:text-3xl font-black text-[#10B981] dark:text-emerald-400 tracking-tight">
                  <SmoothCounter value={4} delay={0.55} />
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">
                  Days Left
                </p>
              </motion.div>

            </div>

          </div>
        </div>

        {/* ── TABS & CONTROLS SECTION (Minimal SaaS Navigation - Linear/GitHub/Stripe Style) ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pb-0 mt-8 mb-8 border-b border-slate-200/80 dark:border-neutral-800 gap-4 max-w-4xl mx-auto">
          
          {/* Minimal SaaS Text Navigation Tabs (34px gap, text-width 2px animated blue underline) */}
          <div className="flex items-center gap-[34px] relative">
            
            {/* Current Leaderboard Tab */}
            <button
              type="button"
              onClick={() => setActiveTab('current')}
              className={`relative pb-3 flex items-center gap-2.5 text-base transition-colors duration-200 ease-out cursor-pointer group ${
                activeTab === 'current'
                  ? 'text-[#2563EB] dark:text-blue-400 font-semibold'
                  : 'text-[#64748B] hover:text-[#2563EB] dark:text-slate-400 dark:hover:text-blue-400 font-medium'
              }`}
            >
              <Trophy className={`w-4 h-4 transition-colors duration-200 ease-out ${
                activeTab === 'current'
                  ? 'text-[#2563EB] dark:text-blue-400'
                  : 'text-[#64748B] group-hover:text-[#2563EB] dark:text-slate-400 dark:group-hover:text-blue-400'
              }`} />
              <span className="relative inline-block">
                Current Leaderboard
                {activeTab === 'current' && (
                  <motion.div
                    layoutId="leaderboardActiveTabUnderline"
                    className="absolute -bottom-3 left-0 right-0 h-[2px] bg-[#2563EB] dark:bg-blue-400"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
              </span>
            </button>

            {/* Monthly Archives Tab */}
            <button
              type="button"
              onClick={() => setActiveTab('archives')}
              className={`relative pb-3 flex items-center gap-2.5 text-base transition-colors duration-200 ease-out cursor-pointer group ${
                activeTab === 'archives'
                  ? 'text-[#2563EB] dark:text-blue-400 font-semibold'
                  : 'text-[#64748B] hover:text-[#2563EB] dark:text-slate-400 dark:hover:text-blue-400 font-medium'
              }`}
            >
              <Award className={`w-4 h-4 transition-colors duration-200 ease-out ${
                activeTab === 'archives'
                  ? 'text-[#2563EB] dark:text-blue-400'
                  : 'text-[#64748B] group-hover:text-[#2563EB] dark:text-slate-400 dark:group-hover:text-blue-400'
              }`} />
              <span className="relative inline-block">
                Monthly Archives
                {activeTab === 'archives' && (
                  <motion.div
                    layoutId="leaderboardActiveTabUnderline"
                    className="absolute -bottom-3 left-0 right-0 h-[2px] bg-[#2563EB] dark:bg-blue-400"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
              </span>
            </button>

          </div>

          {/* Time Filter Dropdown & Search (Shown in Current Leaderboard, Baseline Aligned) */}
          {activeTab === 'current' && (
            <div className="flex items-center gap-4 pb-3 sm:pb-2">
              
              {/* Primary Control: Search Competitors */}
              <div className="relative w-52 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search competitors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all duration-200 ease-out"
                />
              </div>

              {/* Secondary Control: Premium Compact Date Filter Pill */}
              <Select value={timeFilter} onValueChange={(val) => setTimeFilter(val || 'this-week')}>
                <SelectTrigger className="h-[38px] w-auto bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 hover:border-[#2962D6]/60 dark:hover:border-[#38BDF8]/60 focus:ring-2 focus:ring-[#2962D6]/20 dark:focus:ring-[#38BDF8]/20 focus:border-[#2962D6] rounded-full px-4 text-sm font-medium text-slate-700 dark:text-slate-300 hover:shadow-2xs transition-all duration-[180ms] ease-out cursor-pointer flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 mr-0.5" />
                  <SelectValue placeholder="This Week" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-200/80 dark:border-neutral-800 shadow-md">
                  <SelectItem value="this-week" className="text-sm font-medium cursor-pointer">This Week</SelectItem>
                  <SelectItem value="this-month" className="text-sm font-medium cursor-pointer">This Month</SelectItem>
                  <SelectItem value="all-time" className="text-sm font-medium cursor-pointer">All Time</SelectItem>
                </SelectContent>
              </Select>

            </div>
          )}

        </div>

        {/* ── TAB CONTENT: CURRENT LEADERBOARD ── */}
        {activeTab === 'current' ? (
          <>
            {/* ── TOP 3 PODIUM SECTION (Hall of Champions) ── */}
            <div className="w-full max-w-3xl mx-auto my-8 relative">
              
              {/* Section Heading: Hall of Champions */}
              <div className="text-center mb-11 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111827] dark:text-white">
                  Hall of Champions
                </h2>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Top 3 performers this period
                </p>
              </div>

              {/* Podium Grid */}
              <div className="grid grid-cols-3 gap-5 sm:gap-6 items-end justify-items-center">

                {/* SECOND PLACE (Left - Silver #BFC6D1 Top Accent Line) */}
                {secondUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="w-full translate-y-2 sm:translate-y-3"
                  >
                    <Card className="relative overflow-hidden bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-[20px] p-4 sm:p-4.5 shadow-sm hover:shadow transition-all text-center flex flex-col items-center group">
                      <div className="absolute inset-x-0 top-0 h-[2px] bg-[#BFC6D1] rounded-t-[20px] pointer-events-none" />

                      <CardContent className="p-0 flex flex-col items-center w-full">
                        <motion.div
                          animate={{ y: [0, -2, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                          className="mb-2 flex justify-center"
                        >
                          <FlatSilverCrown />
                        </motion.div>

                        <div className="relative mb-2">
                          <div className="rounded-full p-0.5 ring-3 ring-[#BFC6D1] bg-white dark:bg-neutral-900">
                            <Avatar className="w-[84px] h-[84px] transition-transform duration-200 group-hover:scale-[1.02]">
                              <AvatarImage src={secondUser.avatar} alt={secondUser.name} className="rounded-full object-cover" />
                              <AvatarFallback className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                                {secondUser.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </div>

                          <div className="absolute -bottom-2 inset-x-0 mx-auto w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center text-xs font-extrabold shadow-2xs border-2 border-white dark:border-neutral-900">
                            2
                          </div>
                        </div>

                        <div className="mt-1 flex flex-col items-center w-full">
                          <h3 className="font-extrabold text-sm sm:text-base text-[#111827] dark:text-white truncate max-w-full">
                            {secondUser.name}
                          </h3>
                          <p className="text-xs font-medium text-[#2962D6] dark:text-[#38BDF8] mt-0.5 truncate max-w-full">
                            {secondUser.roleBadge}
                          </p>

                          <div className="mt-2.5 inline-flex items-center justify-between gap-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-full px-4 py-1.5 w-fit">
                            <div className="flex items-center gap-1.5">
                              <Star className="w-3.5 h-3.5 text-blue-600 fill-blue-600 shrink-0" />
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                {secondUser.xp.toLocaleString()} XP
                              </span>
                            </div>
                            <div className="w-5 h-6 shrink-0 flex items-center">
                              <BadgeGraphic type={secondUser.badgeTypes[0] || 'potion'} unlocked={true} />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* FIRST PLACE (Center Winner - Gold #F4B400 Top Accent Line) */}
                {firstUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="w-full z-10 -translate-y-3 sm:-translate-y-4"
                  >
                    <Card className="relative overflow-hidden bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-[20px] p-6 sm:p-7 shadow-md hover:shadow-lg transition-all text-center flex flex-col items-center group">
                      <div className="absolute inset-x-0 top-0 h-[2px] bg-[#F4B400] rounded-t-[20px] pointer-events-none" />

                      <CardContent className="p-0 flex flex-col items-center w-full">
                        <motion.div
                          animate={{ y: [0, -2, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                          className="mb-2 flex justify-center"
                        >
                          <FlatGoldCrown />
                        </motion.div>

                        <div className="relative mb-2">
                          <div className="rounded-full p-0.5 ring-3 ring-[#F4B400] bg-white dark:bg-neutral-900">
                            <Avatar className="w-[96px] h-[96px] transition-transform duration-200 group-hover:scale-[1.02]">
                              <AvatarImage src={firstUser.avatar} alt={firstUser.name} className="rounded-full object-cover" />
                              <AvatarFallback className="font-bold text-slate-700 dark:text-slate-300 text-base">
                                {firstUser.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </div>

                          <div className="absolute -bottom-2 inset-x-0 mx-auto w-8 h-8 rounded-full bg-[#F4B400] text-amber-950 flex items-center justify-center text-xs font-black shadow-2xs border-2 border-white dark:border-neutral-900">
                            1
                          </div>
                        </div>

                        <div className="mt-1 flex flex-col items-center w-full">
                          <h3 className="font-extrabold text-base sm:text-lg text-[#111827] dark:text-white truncate max-w-full">
                            {firstUser.name}
                          </h3>
                          <p className="text-xs sm:text-sm font-medium text-[#2962D6] dark:text-[#38BDF8] mt-0.5 truncate max-w-full">
                            {firstUser.roleBadge}
                          </p>

                          <div className="mt-2.5 inline-flex items-center justify-between gap-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-full px-4 py-1.5 w-fit">
                            <div className="flex items-center gap-1.5">
                              <Star className="w-4 h-4 text-blue-600 fill-blue-600 shrink-0" />
                              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {firstUser.xp.toLocaleString()} XP
                              </span>
                            </div>
                            <div className="w-5.5 h-6.5 shrink-0 flex items-center">
                              <BadgeGraphic type={firstUser.badgeTypes[0] || 'sword-crown'} unlocked={true} />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* THIRD PLACE (Right - Bronze #C97A38 Top Accent Line) */}
                {thirdUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="w-full translate-y-2 sm:translate-y-3"
                  >
                    <Card className="relative overflow-hidden bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-[20px] p-4 sm:p-4.5 shadow-sm hover:shadow transition-all text-center flex flex-col items-center group">
                      <div className="absolute inset-x-0 top-0 h-[2px] bg-[#C97A38] rounded-t-[20px] pointer-events-none" />

                      <CardContent className="p-0 flex flex-col items-center w-full">
                        <motion.div
                          animate={{ y: [0, -2, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                          className="mb-2 flex justify-center"
                        >
                          <FlatBronzeCrown />
                        </motion.div>

                        <div className="relative mb-2">
                          <div className="rounded-full p-0.5 ring-3 ring-[#C97A38] bg-white dark:bg-neutral-900">
                            <Avatar className="w-[84px] h-[84px] transition-transform duration-200 group-hover:scale-[1.02]">
                              <AvatarImage src={thirdUser.avatar} alt={thirdUser.name} className="rounded-full object-cover" />
                              <AvatarFallback className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                                {thirdUser.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </div>

                          <div className="absolute -bottom-2 inset-x-0 mx-auto w-7 h-7 rounded-full bg-[#C97A38] text-white flex items-center justify-center text-xs font-extrabold shadow-2xs border-2 border-white dark:border-neutral-900">
                            3
                          </div>
                        </div>

                        <div className="mt-1 flex flex-col items-center w-full">
                          <h3 className="font-extrabold text-sm sm:text-base text-[#111827] dark:text-white truncate max-w-full">
                            {thirdUser.name}
                          </h3>
                          <p className="text-xs font-medium text-[#2962D6] dark:text-[#38BDF8] mt-0.5 truncate max-w-full">
                            {thirdUser.roleBadge}
                          </p>

                          <div className="mt-2.5 inline-flex items-center justify-between gap-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-full px-4 py-1.5 w-fit">
                            <div className="flex items-center gap-1.5">
                              <Star className="w-3.5 h-3.5 text-blue-600 fill-blue-600 shrink-0" />
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                {thirdUser.xp.toLocaleString()} XP
                              </span>
                            </div>
                            <div className="w-5 h-6 shrink-0 flex items-center">
                              <BadgeGraphic type={thirdUser.badgeTypes[0] || 'mountain'} unlocked={true} />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

              </div>
            </div>

            {/* ── LEADERBOARD TABLE (Row Lift 2px, 180ms ease-out, Shadow Increase) ── */}
            <div className="w-full max-w-4xl mx-auto mt-12 space-y-3">
              
              <div className="grid grid-cols-12 items-center px-4 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <div className="col-span-1">Rank</div>
                <div className="col-span-5 sm:col-span-4">User</div>
                <div className="hidden sm:block sm:col-span-3 text-center">Level</div>
                <div className="col-span-4 sm:col-span-2 text-right">Points</div>
                <div className="col-span-2 sm:col-span-2 text-right hidden md:block">Badges</div>
              </div>

              <div className="space-y-2.5">
                {remainingList.map((userItem) => (
                  <motion.div
                    key={userItem.username}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    <Card className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-xl p-3.5 shadow-2xs hover:shadow-xs hover:bg-slate-50/80 dark:hover:bg-neutral-800/60 transition-all duration-[180ms] ease-out group">
                      <CardContent className="p-0 grid grid-cols-12 items-center">
                        
                        <div className="col-span-1 font-extrabold text-sm text-slate-700 dark:text-slate-300">
                          {userItem.rank}
                        </div>

                        <div className="col-span-5 sm:col-span-4 flex items-center gap-3 min-w-0">
                          <Avatar className="w-9 h-9 shrink-0 border border-slate-200 dark:border-neutral-700">
                            <AvatarImage src={userItem.avatar} alt={userItem.name} />
                            <AvatarFallback className="font-bold text-xs text-slate-700 dark:text-slate-300">
                              {userItem.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate group-hover:text-[#2962D6] dark:group-hover:text-[#38BDF8] transition-colors">
                              {userItem.name}
                            </h4>
                            <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 truncate">
                              {userItem.roleBadge}
                            </p>
                          </div>
                        </div>

                        <div className="hidden sm:flex sm:col-span-3 items-center justify-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                          <div className="w-5 h-5 rounded-md bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 text-[10px]">
                            ⬡
                          </div>
                          <span>Level {userItem.level}</span>
                        </div>

                        <div className="col-span-4 sm:col-span-2 text-right flex items-center justify-end gap-1 font-extrabold text-xs sm:text-sm text-[#2962D6] dark:text-[#38BDF8]">
                          <Star className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
                          <span>{userItem.xp.toLocaleString()} XP</span>
                        </div>

                        <div className="col-span-2 sm:col-span-2 justify-end items-center gap-1 hidden md:flex">
                          {userItem.badgeTypes.slice(0, 3).map((bType, idx) => (
                            <div key={idx} className="w-5 h-6 shrink-0">
                              <BadgeGraphic type={bType} unlocked={true} />
                            </div>
                          ))}
                        </div>

                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2 text-[#2962D6] dark:text-[#38BDF8]">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Keep learning, keep growing, and climb to the top!</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Updates every 5 minutes</span>
                </div>
              </div>

            </div>
          </>
        ) : (
          /* ── TAB CONTENT: MONTHLY ARCHIVES (Monthly Hall of Fame) ── */
          <div className="w-full max-w-5xl mx-auto my-6 relative">
            
            {/* Section Header: Monthly Hall of Fame */}
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111827] dark:text-white">
                Monthly Hall of Fame
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                Top 3 champions from previous months
              </p>
            </div>

            {/* Responsive Archives Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MONTHLY_ARCHIVES.map((arch) => (
                <motion.div
                  key={arch.id}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <Card className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-[20px] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full group">
                    <CardContent className="p-0 flex flex-col justify-between h-full">
                      
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
                          <div>
                            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                              {arch.month} {arch.year}
                            </h3>
                            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                              {arch.totalParticipants.toLocaleString()} Participants
                            </p>
                          </div>
                          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 border border-amber-200/80 dark:border-amber-800/80 flex items-center justify-center shrink-0">
                            <Medal className="w-5 h-5 stroke-[2]" />
                          </div>
                        </div>

                        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider my-3">
                          Top 3 Champions
                        </p>
                      </div>

                      <div className="space-y-2">
                        {arch.champions.map((champ) => {
                          const isGold = champ.rank === 1;
                          const isSilver = champ.rank === 2;
                          const isBronze = champ.rank === 3;

                          return (
                            <div
                              key={champ.username}
                              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                                isGold
                                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40'
                                  : isSilver
                                  ? 'bg-slate-50 dark:bg-neutral-800/50 border-slate-200/60 dark:border-neutral-800'
                                  : 'bg-orange-50/30 dark:bg-orange-950/10 border-orange-200/40 dark:border-orange-950/30'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="relative shrink-0">
                                  <Avatar className="w-9 h-9 border border-white dark:border-neutral-800">
                                    <AvatarImage src={champ.avatar} alt={champ.name} />
                                    <AvatarFallback className="font-bold text-xs">
                                      {champ.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div
                                    className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-extrabold border border-white dark:border-neutral-900 ${
                                      isGold
                                        ? 'bg-[#F4B400] text-amber-950'
                                        : isSilver
                                        ? 'bg-[#BFC6D1] text-slate-900'
                                        : 'bg-[#C97A38] text-white'
                                    }`}
                                  >
                                    {champ.rank}
                                  </div>
                                </div>

                                <div className="min-w-0">
                                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                                    {champ.name}
                                  </h4>
                                  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate">
                                    {champ.username}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 text-xs font-extrabold text-[#2962D6] dark:text-[#38BDF8] shrink-0 ml-2">
                                <Star className="w-3 h-3 fill-current" />
                                <span>{champ.xp.toLocaleString()}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
