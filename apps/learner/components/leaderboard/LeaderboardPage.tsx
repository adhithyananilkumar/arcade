'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Trophy, Search, Calendar, Award, Star, Clock, Info, Medal
} from 'lucide-react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/design-system/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/design-system/ui/select';
import TextType from '@/shared/design-system/ui/TextType';

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
  isCurrentUser?: boolean;
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
    roleBadge: 'Cloud & DevOps',
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
    roleBadge: 'AI & ML',
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
    roleBadge: 'Web Development',
    coursesCount: 16,
    certificatesCount: 12,
    badgeTypes: ['shield-book', 'lightning'],
    weeklyChange: 3,
    isFriend: false,
  },
  {
    rank: 4,
    name: 'Rahul Kumar',
    username: '@rkumar',
    avatar: AVATARS[4],
    level: 38,
    xp: 7410,
    roleBadge: 'AI & ML',
    coursesCount: 14,
    certificatesCount: 10,
    badgeTypes: ['shield-book', 'lightning', 'flower'],
    weeklyChange: 3,
    isFriend: false,
  },
  {
    rank: 5,
    name: 'Ananya Sharma',
    username: '@asharma',
    avatar: AVATARS[5],
    level: 35,
    xp: 6840,
    roleBadge: 'Web Development',
    coursesCount: 12,
    certificatesCount: 9,
    badgeTypes: ['star', 'shield-book', 'flower'],
    weeklyChange: -1,
    isFriend: true,
  },
  {
    rank: 6,
    name: 'Adithya Raj',
    username: '@araj',
    avatar: AVATARS[6],
    level: 31,
    xp: 6210,
    roleBadge: 'Cybersecurity',
    coursesCount: 11,
    certificatesCount: 8,
    badgeTypes: ['lightning', 'shield-book', 'star'],
    weeklyChange: 2,
    isFriend: false,
  },
  {
    rank: 7,
    name: 'Sneha Iyer',
    username: '@siyer',
    avatar: AVATARS[7],
    level: 28,
    xp: 5750,
    roleBadge: 'UI/UX Design',
    coursesCount: 10,
    certificatesCount: 8,
    badgeTypes: ['shield-book', 'flower', 'star'],
    weeklyChange: 0,
    isFriend: true,
  },
  {
    rank: 8,
    name: 'Kabir Singh',
    username: '@ksingh',
    avatar: AVATARS[8],
    level: 25,
    xp: 5320,
    roleBadge: 'Fullstack Engineering',
    coursesCount: 9,
    certificatesCount: 7,
    badgeTypes: ['lightning', 'shield-book', 'flower'],
    weeklyChange: -2,
    isFriend: false,
  },
  {
    rank: 9,
    name: 'Ananya Reddy',
    username: '@areddy',
    avatar: AVATARS[9],
    level: 22,
    xp: 4950,
    roleBadge: 'Data Science',
    coursesCount: 8,
    certificatesCount: 7,
    badgeTypes: ['star', 'flower', 'shield-book'],
    weeklyChange: 4,
    isFriend: true,
  },
  {
    rank: 10,
    name: 'Vikram Patil',
    username: '@vpatil',
    avatar: AVATARS[0],
    level: 20,
    xp: 4610,
    roleBadge: 'Backend Engineering',
    coursesCount: 8,
    certificatesCount: 6,
    badgeTypes: ['shield-book', 'star'],
    weeklyChange: 0,
    isFriend: false,
  },
  {
    rank: 11,
    name: 'Vikram Patil',
    username: '@vpatil',
    avatar: AVATARS[0],
    level: 20,
    xp: 4320,
    roleBadge: 'Backend Engineering',
    coursesCount: 8,
    certificatesCount: 6,
    badgeTypes: ['shield-book', 'star'],
    weeklyChange: 1,
    isFriend: false,
  },
  {
    rank: 12,
    name: 'Pooja Hegde',
    username: '@phegde',
    avatar: AVATARS[1],
    level: 19,
    xp: 4050,
    roleBadge: 'Frontend Engineering',
    coursesCount: 7,
    certificatesCount: 6,
    badgeTypes: ['flower', 'star'],
    weeklyChange: -1,
    isFriend: false,
  },
  {
    rank: 13,
    name: 'Rohan Das',
    username: '@rdas',
    avatar: AVATARS[2],
    level: 18,
    xp: 3810,
    roleBadge: 'DevOps & Cloud',
    coursesCount: 7,
    certificatesCount: 6,
    badgeTypes: ['lightning', 'shield-book'],
    weeklyChange: 3,
    isFriend: true,
  },
  {
    rank: 14,
    name: 'Priya Nair',
    username: '@pnair',
    avatar: AVATARS[3],
    level: 17,
    xp: 3600,
    roleBadge: 'Mobile Development',
    coursesCount: 7,
    certificatesCount: 5,
    badgeTypes: ['star', 'flower'],
    weeklyChange: 0,
    isFriend: false,
  },
  {
    rank: 15,
    name: 'Amit Trivedi',
    username: '@atrivedi',
    avatar: AVATARS[4],
    level: 16,
    xp: 3420,
    roleBadge: 'AI & Data Science',
    coursesCount: 6,
    certificatesCount: 5,
    badgeTypes: ['shield-book'],
    weeklyChange: -2,
    isFriend: false,
  },
  {
    rank: 16,
    name: 'Kavya Krishnan',
    username: '@kkavya',
    avatar: AVATARS[5],
    level: 15,
    xp: 3250,
    roleBadge: 'UI/UX Design',
    coursesCount: 6,
    certificatesCount: 5,
    badgeTypes: ['flower'],
    weeklyChange: 1,
    isFriend: true,
  },
  {
    rank: 17,
    name: 'Siddharth Rao',
    username: '@srao',
    avatar: AVATARS[6],
    level: 14,
    xp: 3080,
    roleBadge: 'Systems Programming',
    coursesCount: 6,
    certificatesCount: 5,
    badgeTypes: ['star'],
    weeklyChange: 0,
    isFriend: false,
  },
  {
    rank: 18,
    name: 'Meera Joshi',
    username: '@mjoshi',
    avatar: AVATARS[7],
    level: 13,
    xp: 2940,
    roleBadge: 'Web Development',
    coursesCount: 5,
    certificatesCount: 4,
    badgeTypes: ['lightning'],
    weeklyChange: 2,
    isFriend: false,
  },
  {
    rank: 19,
    name: 'Tarun Malik',
    username: '@tmalik',
    avatar: AVATARS[8],
    level: 12,
    xp: 2810,
    roleBadge: 'Cybersecurity',
    coursesCount: 5,
    certificatesCount: 4,
    badgeTypes: ['shield-book'],
    weeklyChange: -1,
    isFriend: false,
  },
  {
    rank: 20,
    name: 'Divya Menon',
    username: '@dmenon',
    avatar: AVATARS[9],
    level: 11,
    xp: 2690,
    roleBadge: 'Cloud Architecture',
    coursesCount: 5,
    certificatesCount: 4,
    badgeTypes: ['star', 'flower'],
    weeklyChange: 5,
    isFriend: true,
  },
  {
    rank: 21,
    name: 'Nishant Bhat',
    username: '@nbhat',
    avatar: AVATARS[0],
    level: 10,
    xp: 2550,
    roleBadge: 'Fullstack Engineering',
    coursesCount: 5,
    certificatesCount: 4,
    badgeTypes: ['shield-book'],
    weeklyChange: 0,
    isFriend: false,
  },
  {
    rank: 22,
    name: 'Ritu Saxena',
    username: '@rsaxena',
    avatar: AVATARS[1],
    level: 9,
    xp: 2420,
    roleBadge: 'Data Analytics',
    coursesCount: 4,
    certificatesCount: 3,
    badgeTypes: ['flower'],
    weeklyChange: -3,
    isFriend: false,
  },
  {
    rank: 23,
    name: 'Karthik Pillai',
    username: '@kpillai',
    avatar: AVATARS[2],
    level: 9,
    xp: 2300,
    roleBadge: 'Backend Engineering',
    coursesCount: 4,
    certificatesCount: 3,
    badgeTypes: ['lightning'],
    weeklyChange: 1,
    isFriend: false,
  },
  {
    rank: 24,
    name: 'Ishaan Roy',
    username: '@iroy',
    avatar: AVATARS[3],
    level: 8,
    xp: 2190,
    roleBadge: 'Machine Learning',
    coursesCount: 4,
    certificatesCount: 3,
    badgeTypes: ['star'],
    weeklyChange: 0,
    isFriend: false,
  },
  {
    rank: 25,
    name: 'Simran Kaur',
    username: '@skaur',
    avatar: AVATARS[4],
    level: 8,
    xp: 2080,
    roleBadge: 'Web Development',
    coursesCount: 4,
    certificatesCount: 3,
    badgeTypes: ['shield-book'],
    weeklyChange: 2,
    isFriend: true,
  },
  {
    rank: 26,
    name: 'Varun Kapoor',
    username: '@vkapoor',
    avatar: AVATARS[5],
    level: 7,
    xp: 1970,
    roleBadge: 'Cloud Computing',
    coursesCount: 3,
    certificatesCount: 3,
    badgeTypes: ['flower'],
    weeklyChange: -1,
    isFriend: false,
  },
  {
    rank: 27,
    name: 'Tanvi Verma',
    username: '@tverma',
    avatar: AVATARS[6],
    level: 7,
    xp: 1860,
    roleBadge: 'UI/UX Design',
    coursesCount: 3,
    certificatesCount: 2,
    badgeTypes: ['star'],
    weeklyChange: 0,
    isFriend: false,
  },
  {
    rank: 28,
    name: 'Yash Agarwal',
    username: '@yagarwal',
    avatar: AVATARS[7],
    level: 6,
    xp: 1750,
    roleBadge: 'DevOps',
    coursesCount: 3,
    certificatesCount: 2,
    badgeTypes: ['lightning'],
    weeklyChange: 1,
    isFriend: false,
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
      { rank: 3, name: 'Sneha Iyer', username: '@siyer', avatar: AVATARS[7], xp: 28500 },
    ],
  },
  {
    id: 'june-2026',
    month: 'June',
    year: 2026,
    totalParticipants: 1080,
    champions: [
      { rank: 1, name: 'Rohit Verma', username: '@rverma', avatar: AVATARS[2], xp: 32900 },
      { rank: 2, name: 'Ananya Reddy', username: '@areddy', avatar: AVATARS[9], xp: 29400 },
      { rank: 3, name: 'Kabir Singh', username: '@ksingh', avatar: AVATARS[8], xp: 27100 },
    ],
  },
  {
    id: 'may-2026',
    month: 'May',
    year: 2026,
    totalParticipants: 990,
    champions: [
      { rank: 1, name: 'Kabir Singh', username: '@ksingh', avatar: AVATARS[8], xp: 30500 },
      { rank: 2, name: 'Vivek Nair', username: '@vnair', avatar: AVATARS[6], xp: 28200 },
      { rank: 3, name: 'Diya Sharma', username: '@dsharma', avatar: AVATARS[1], xp: 26400 },
    ],
  },
];

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<'current' | 'archives'>('current');
  const [timeFilter, setTimeFilter] = useState<string>('this-week');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const cubicEase = [0.16, 1, 0.3, 1] as const;

  // Separate object for the current user's position (independent from main table)
  const currentUserPosition = useMemo<LeaderboardUser>(() => ({
    rank: 50,
    name: user?.name || user?.fullName || 'Neeraj V V',
    username: `@${user?.username || 'neerajvv'}`,
    avatar: user?.avatarUrl || AVATARS[3],
    level: 42,
    xp: 2710,
    roleBadge: 'Cloud & DevOps',
    coursesCount: 15,
    certificatesCount: 11,
    badgeTypes: ['shield-book', 'star', 'flower'],
    weeklyChange: 3,
    isFriend: true,
    isCurrentUser: true,
  }), [user]);

  // Dataset filter based on time period
  const dataset = useMemo(() => {
    let source = [...GLOBAL_USERS];

    if (user?.fullName || user?.firstName) {
      const currentUserName = user.fullName || `${user.firstName} ${user.lastName || ''}`.trim();
      // Ensure current user is in data set if logged in
      const existingIdx = source.findIndex((u) => u.isCurrentUser || u.username === `@${user.username}`);
      if (existingIdx !== -1) {
        source[existingIdx] = {
          ...source[existingIdx],
          name: currentUserName,
          avatar: user.avatarUrl || source[existingIdx].avatar,
          isCurrentUser: true,
        };
      }
    }

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
  }, [timeFilter, user]);

  const top3 = dataset.slice(0, 3);
  const firstUser = top3[0];
  const secondUser = top3[1];
  const thirdUser = top3[2];

  // Main leaderboard table lists ranks #4 through #25 (Total #1-#25 on page including Top 3)
  const remainingList = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return dataset.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.roleBadge.toLowerCase().includes(q)
      );
    }

    return dataset.slice(3, 25);
  }, [dataset, searchQuery]);

  return (
    <div className="w-full min-h-screen text-slate-900 dark:text-slate-100 font-sans relative overflow-hidden bg-white dark:bg-neutral-950">

      {/* Subtle ambient light gradient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[400px]"
        style={{
          backgroundImage: [
            'radial-gradient(ellipse 50% 35% at 50% 0%, rgba(41, 98, 214, 0.04) 0%, transparent 70%)',
            'radial-gradient(ellipse 40% 25% at 85% 5%, rgba(39, 197, 216, 0.03) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      <div className="max-w-[1440px] mx-auto pt-8 pb-20 px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">

        {/* 1. HEADER (CENTERED) */}
        <div className="w-full max-w-3xl mx-auto text-center pt-2 pb-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display-leaderboard tracking-[-0.035em] leading-tight bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] bg-clip-text text-transparent inline-block pb-1">
            Leaderboard
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1.5 inline-flex items-center justify-center text-center w-full sm:whitespace-nowrap">
            <span>Compete with fellow learners and&nbsp;</span>
            <TextType
              text={[
                "climb the rankings",
                "take the lead",
                "move up the board",
                "challenge the top",
                "reach the top"
              ]}
              as="span"
              typingSpeed={50}
              deletingSpeed={30}
              pauseDuration={2000}
              showCursor={true}
              cursorCharacter="|"
              cursorClassName="text-[#2962D6] dark:text-blue-400 font-normal ml-0.5"
              className="inline-block font-semibold text-slate-700 dark:text-slate-200"
            />
          </p>
        </div>

        {/* 2. USER RANK SUMMARY (CENTERED) */}
        <div className="w-full max-w-md mx-auto mt-4 mb-6 pt-1 pb-1 flex items-center justify-center gap-8 sm:gap-12">
          
          {/* Your Rank */}
          <div className="flex flex-col items-center text-center">
            <span className="text-xl sm:text-2xl font-extrabold text-[#2962D6] dark:text-blue-400 tracking-tight">
              04
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
              Your Rank
            </span>
          </div>

          <span className="text-slate-200 dark:text-neutral-800 font-light text-lg">|</span>

          {/* Your Score */}
          <div className="flex flex-col items-center text-center">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              2,710
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
              Your Score
            </span>
          </div>

          <span className="text-slate-200 dark:text-neutral-800 font-light text-lg">|</span>

          {/* Badges Earned */}
          <div className="flex flex-col items-center text-center">
            <span className="text-xl sm:text-2xl font-extrabold text-[#2962D6] dark:text-blue-400 tracking-tight">
              11
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
              Badges Earned
            </span>
          </div>

        </div>

        {/* 2. TOP 3 PROFILES (CENTERED GROUP) */}
        <div className="w-full max-w-2xl mx-auto pt-6 pb-2 mb-8 flex items-end justify-center gap-6 sm:gap-12">
          
          {/* Rank #2 (Left) */}
          {secondUser && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
              className="group flex flex-col items-center text-center cursor-default"
            >
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                #2
              </span>
              
              {/* Subtle 1.5px Ambient Floating Animation (5.0s cycle, ease-in-out, respects reduced-motion) */}
              <motion.div
                animate={shouldReduceMotion ? {} : { y: [0, -1.5, 0] }}
                transition={{ duration: 5.0, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Avatar with 3px upward movement + 1.02 scale + ring emphasis + subtle shadow on hover */}
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full p-0.5 border-2 border-slate-200 dark:border-neutral-700 group-hover:border-slate-400 dark:group-hover:border-neutral-500 bg-white dark:bg-neutral-900 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:shadow-slate-300/60 dark:group-hover:shadow-none transform group-hover:-translate-y-[3px] group-hover:scale-[1.02] transition-all duration-200 ease-out">
                  <Avatar className="w-full h-full rounded-full">
                    <AvatarImage src={secondUser.avatar} alt={secondUser.name} className="object-cover" />
                    <AvatarFallback className="font-bold text-slate-700 dark:text-slate-300 text-base">
                      {secondUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </motion.div>

              {/* Name with 1px upward movement on hover */}
              <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white mt-2 max-w-[120px] truncate transform group-hover:-translate-y-[1px] transition-all duration-200 ease-out">
                {secondUser.name}
              </h3>

              {/* Points with stronger text on hover */}
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:font-extrabold mt-0.5 transition-all duration-200 ease-out">
                <SmoothCounter value={secondUser.xp} duration={650} suffix=" pts" />
              </p>
            </motion.div>
          )}

          {/* Rank #1 (Center - Slightly Larger & Positioned Slightly Higher) */}
          {firstUser && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.0, ease: 'easeOut' }}
              className="group flex flex-col items-center text-center -translate-y-3 sm:-translate-y-4 cursor-default"
            >
              <span className="text-xs font-extrabold text-[#2962D6] dark:text-blue-400 uppercase tracking-wider mb-1.5">
                #1
              </span>
              
              {/* Subtle 2px Ambient Floating Animation (4.5s cycle, ease-in-out, respects reduced-motion) */}
              <motion.div
                animate={shouldReduceMotion ? {} : { y: [0, -2, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Avatar with 3px upward movement + 1.02 scale + stronger blue ring + soft shadow on hover */}
                <div className="w-24 h-24 sm:w-26 sm:h-26 rounded-full p-0.5 border-2 border-[#2962D6] dark:border-blue-500 group-hover:border-[#1e4bb5] dark:group-hover:border-blue-400 bg-white dark:bg-neutral-900 flex items-center justify-center shadow-sm shadow-blue-500/10 group-hover:shadow-md group-hover:shadow-blue-500/20 dark:group-hover:shadow-none transform group-hover:-translate-y-[3px] group-hover:scale-[1.02] transition-all duration-200 ease-out">
                  <Avatar className="w-full h-full rounded-full">
                    <AvatarImage src={firstUser.avatar} alt={firstUser.name} className="object-cover" />
                    <AvatarFallback className="font-bold text-[#2962D6] text-xl">
                      {firstUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </motion.div>

              {/* Name with 1px upward movement on hover */}
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white mt-2 max-w-[140px] truncate transform group-hover:-translate-y-[1px] transition-all duration-200 ease-out">
                {firstUser.name}
              </h3>

              {/* Points with stronger text on hover */}
              <p className="text-xs font-bold text-[#2962D6] dark:text-blue-400 group-hover:font-extrabold mt-0.5 transition-all duration-200 ease-out">
                <SmoothCounter value={firstUser.xp} duration={650} suffix=" pts" />
              </p>
            </motion.div>
          )}

          {/* Rank #3 (Right) */}
          {thirdUser && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16, ease: 'easeOut' }}
              className="group flex flex-col items-center text-center cursor-default"
            >
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                #3
              </span>
              
              {/* Subtle 1.5px Ambient Floating Animation (5.3s cycle, ease-in-out, respects reduced-motion) */}
              <motion.div
                animate={shouldReduceMotion ? {} : { y: [0, -1.5, 0] }}
                transition={{ duration: 5.3, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Avatar with 3px upward movement + 1.02 scale + ring emphasis + subtle shadow on hover */}
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full p-0.5 border-2 border-slate-200 dark:border-neutral-700 group-hover:border-slate-400 dark:group-hover:border-neutral-500 bg-white dark:bg-neutral-900 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:shadow-slate-300/60 dark:group-hover:shadow-none transform group-hover:-translate-y-[3px] group-hover:scale-[1.02] transition-all duration-200 ease-out">
                  <Avatar className="w-full h-full rounded-full">
                    <AvatarImage src={thirdUser.avatar} alt={thirdUser.name} className="object-cover" />
                    <AvatarFallback className="font-bold text-slate-700 dark:text-slate-300 text-base">
                      {thirdUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </motion.div>

              {/* Name with 1px upward movement on hover */}
              <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white mt-2 max-w-[120px] truncate transform group-hover:-translate-y-[1px] transition-all duration-200 ease-out">
                {thirdUser.name}
              </h3>

              {/* Points with stronger text on hover */}
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:font-extrabold mt-0.5 transition-all duration-200 ease-out">
                <SmoothCounter value={thirdUser.xp} duration={650} suffix=" pts" />
              </p>
            </motion.div>
          )}

        </div>

        {/* 3. LEADERBOARD NAVIGATION BAR (FULL DESKTOP WIDTH) */}
        <div className="w-full max-w-full lg:max-w-[1400px] mx-auto mt-8 mb-6 border-b border-slate-200/60 dark:border-neutral-800/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-3">
            
            {/* LEFT SIDE: TRUE NAVIGATION TABS */}
            <div className="flex items-center gap-8 sm:gap-10 overflow-x-auto no-scrollbar scroll-smooth">
              
              {/* Active Tab: Current Leaderboard */}
              <button
                type="button"
                onClick={() => setActiveTab('current')}
                className={`relative pb-3 flex items-center gap-2.5 text-sm sm:text-base transition-colors duration-150 ease-out cursor-pointer shrink-0 ${
                  activeTab === 'current'
                    ? 'text-slate-900 dark:text-white font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
                }`}
              >
                <Trophy className={`w-4 h-4 transition-colors ${activeTab === 'current' ? 'text-[#2962D6] dark:text-blue-400' : 'text-slate-400'}`} />
                <span>Current Leaderboard</span>
                {activeTab === 'current' && (
                  <motion.div
                    layoutId="leaderboardNavUnderline"
                    className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-[#2962D6] dark:bg-blue-400 rounded-full"
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  />
                )}
              </button>

              {/* Inactive Tab: Monthly Archives */}
              <button
                type="button"
                onClick={() => setActiveTab('archives')}
                className={`relative pb-3 flex items-center gap-2.5 text-sm sm:text-base transition-colors duration-150 ease-out cursor-pointer shrink-0 ${
                  activeTab === 'archives'
                    ? 'text-slate-900 dark:text-white font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
                }`}
              >
                <Medal className={`w-4 h-4 transition-colors ${activeTab === 'archives' ? 'text-[#2962D6] dark:text-blue-400' : 'text-slate-400'}`} />
                <span>Monthly Archives</span>
                {activeTab === 'archives' && (
                  <motion.div
                    layoutId="leaderboardNavUnderline"
                    className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-[#2962D6] dark:bg-blue-400 rounded-full"
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  />
                )}
              </button>

            </div>

            {/* RIGHT SIDE: SEARCH & COMPACT FILTER */}
            {activeTab === 'current' && (
              <div className="flex items-center gap-3 w-full md:w-auto">
                
                {/* Search Field */}
                <div className="relative flex-1 md:w-64 lg:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search competitors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-full bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-[9px] pl-9 pr-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2962D6]/15 focus:border-[#2962D6] transition-colors duration-150"
                  />
                </div>

                {/* Compact Filter Control */}
                <Select value={timeFilter} onValueChange={(val) => setTimeFilter(val || 'this-week')}>
                  <SelectTrigger className="h-9 shrink-0 bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 rounded-[9px] px-3 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1.5 transition-colors duration-150">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <SelectValue placeholder="All-time" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200/80 dark:border-neutral-800 shadow-md">
                    <SelectItem value="this-week" className="text-xs sm:text-sm font-medium cursor-pointer">This Week</SelectItem>
                    <SelectItem value="this-month" className="text-xs sm:text-sm font-medium cursor-pointer">This Month</SelectItem>
                    <SelectItem value="all-time" className="text-xs sm:text-sm font-medium cursor-pointer">All Time</SelectItem>
                  </SelectContent>
                </Select>

              </div>
            )}

          </div>
        </div>

        {/* 4. LEADERBOARD TABLE OR ARCHIVES CONTENT (FULL DESKTOP WIDTH) */}
        {activeTab === 'current' ? (
          <div className="space-y-4">
            


            {/* 4. LEADERBOARD TABLE CONTAINER */}
            <div className="w-full max-w-full lg:max-w-[1400px] mx-auto bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-xl overflow-hidden shadow-2xs">
              
              {/* Refined Header Row with Proportions: RANK 10% | USER 42% | LEVEL 18% | POINTS 20% | BADGES 10% */}
              <div className="grid grid-cols-12 items-center px-5 sm:px-6 md:px-8 py-3 bg-slate-50/90 dark:bg-neutral-800/60 border-b border-slate-200/80 dark:border-neutral-800 sticky top-0 z-10 backdrop-blur-xs text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <div className="col-span-2 sm:col-span-1">RANK</div>
                <div className="col-span-6 sm:col-span-5">USER</div>
                <div className="hidden sm:block sm:col-span-2">LEVEL</div>
                <div className="col-span-4 sm:col-span-2 text-right">POINTS</div>
                <div className="hidden sm:block sm:col-span-2 text-right">BADGES</div>
              </div>

              {/* Rows with subtle 1px dividers & staggered entrance animation */}
              <div className="divide-y divide-slate-100 dark:divide-neutral-800/70">
                {remainingList.map((userItem, index) => {
                  const isCurrent = userItem.isCurrentUser || (user?.username && userItem.username === `@${user.username}`);
                  const userLevel = Math.max(1, Math.round(userItem.xp / 1000));
                  const badgesCount = userItem.certificatesCount || (userItem.badgeTypes ? userItem.badgeTypes.length + 3 : 5);
                  const progressPercent = Math.min(100, Math.max(15, (userItem.xp % 1000) / 10));

                  return (
                    <motion.div
                      key={userItem.username}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: Math.min(index * 0.02, 0.25), ease: 'easeOut' }}
                      className={`group grid grid-cols-12 items-center px-5 sm:px-6 md:px-8 py-3.5 h-[68px] transition-all duration-150 ease-out cursor-default ${
                        isCurrent
                          ? 'bg-blue-50/70 dark:bg-blue-950/20 border-l-[3px] border-l-[#2962D6]'
                          : 'hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 border-l-[3px] border-l-transparent'
                      }`}
                    >
                      {/* RANK */}
                      <div className="col-span-2 sm:col-span-1 font-medium text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        {userItem.rank < 10 ? `0${userItem.rank}` : userItem.rank}
                      </div>

                      {/* USER (Avatar + Name with hover lift) */}
                      <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0 pr-2">
                        <div className="shrink-0 transition-transform duration-150 ease-out group-hover:-translate-y-[1px]">
                          <Avatar className="w-8 h-8 rounded-full border border-slate-200/80 dark:border-neutral-700 transition-colors group-hover:border-slate-300 dark:group-hover:border-neutral-600">
                            <AvatarImage src={userItem.avatar} alt={userItem.name} className="object-cover" />
                            <AvatarFallback className="font-medium text-xs text-slate-700 dark:text-slate-300">
                              {userItem.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="min-w-0">
                          <h4 className={`text-xs sm:text-sm truncate transition-colors duration-150 ${
                            isCurrent
                              ? 'font-extrabold text-slate-900 dark:text-white'
                              : 'font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                          }`}>
                            {userItem.name}
                          </h4>
                        </div>
                      </div>

                      {/* LEVEL + SUBTLE PROGRESS LINE */}
                      <div className="hidden sm:flex sm:col-span-2 flex-col justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
                        <span>Level {userLevel}</span>
                        {/* 3px Subtle Progress Line */}
                        <div className="w-16 h-1 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-[#2962D6]/80 dark:bg-blue-400/80 rounded-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* POINTS (Bold Dark Navy Typography, Right-aligned) */}
                      <div className="col-span-4 sm:col-span-2 text-right font-extrabold text-xs sm:text-sm md:text-base text-slate-900 dark:text-slate-100 group-hover:font-black transition-all duration-150">
                        <SmoothCounter value={userItem.xp} duration={650} />
                      </div>

                      {/* BADGES (Clean numeric count with tiny neutral outline icon) */}
                      <div className="hidden sm:flex sm:col-span-2 items-center justify-end font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        <Award className="w-3.5 h-3.5 text-slate-400/80 mr-1.5 shrink-0 inline" />
                        <span>{badgesCount}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* 5. SEPARATE "YOUR POSITION" SECTION (PERSONAL RANKING ANCHOR) */}
            <div className="w-full max-w-full lg:max-w-[1400px] mx-auto mt-8 sm:mt-10">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">
                Your Position
              </div>

              <div className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800/80 rounded-xl px-5 sm:px-6 py-3.5 border-l-[3px] border-l-[#2962D6] flex items-center justify-between gap-4">
                
                {/* Left: [ #50 ] [ avatar ] Neeraj v */}
                <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                  {/* Rank Number (#50) */}
                  <div className="font-extrabold text-base sm:text-lg text-[#2962D6] dark:text-blue-400 shrink-0">
                    #{currentUserPosition.rank}
                  </div>

                  {/* Avatar + User Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-8 h-8 rounded-full border border-slate-200/80 dark:border-neutral-700 shrink-0">
                      <AvatarImage src={currentUserPosition.avatar} alt={currentUserPosition.name} className="object-cover" />
                      <AvatarFallback className="font-bold text-xs">
                        {currentUserPosition.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                      {currentUserPosition.name}
                    </h4>
                  </div>
                </div>

                {/* Right: 2,710 pts */}
                <div className="text-right shrink-0">
                  <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                    {currentUserPosition.xp.toLocaleString()} pts
                  </span>
                </div>

              </div>
            </div>

          </div>
        ) : (
          /* ── TAB CONTENT: MONTHLY ARCHIVES (FULL DESKTOP WIDTH) ── */
          <div className="w-full max-w-full lg:max-w-[1400px] mx-auto my-6 relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MONTHLY_ARCHIVES.map((arch) => (
                <div
                  key={arch.id}
                  className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-xl p-5 pb-6 shadow-2xs"
                >
                  {/* 1. MONTH HEADER */}
                  <div className="pb-3 border-b border-slate-100 dark:border-neutral-800">
                    <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white uppercase tracking-tight">
                      {arch.month} {arch.year}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      {arch.totalParticipants.toLocaleString()} participants
                    </p>
                  </div>

                  {/* 2. TOP 3 LABEL */}
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-4 mb-3">
                    TOP 3
                  </p>

                  {/* 3. RANKED LIST */}
                  <div className="space-y-2.5">
                    {arch.champions.map((champ) => (
                      <div
                        key={champ.username}
                        className="flex items-center justify-between min-w-0"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* RANK NUMBER: 01, 02, 03 */}
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 w-5 shrink-0">
                            0{champ.rank}
                          </span>
                          
                          {/* AVATAR */}
                          <Avatar className="w-7 h-7 rounded-full border border-slate-200/80 dark:border-neutral-700 shrink-0">
                            <AvatarImage src={champ.avatar} alt={champ.name} className="object-cover" />
                            <AvatarFallback className="font-medium text-xs">
                              {champ.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          {/* PLAYER NAME */}
                          <h4 className="font-medium text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">
                            {champ.name}
                          </h4>
                        </div>

                        {/* POINTS (RIGHT-ALIGNED) */}
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 shrink-0 ml-2">
                          {champ.xp.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
