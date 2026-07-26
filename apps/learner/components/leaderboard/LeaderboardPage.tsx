'use client';

import { useState } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  TrendingUp, 
  Search,
  Filter,
  BookOpen,
  Trophy,
  Award
} from 'lucide-react';

// ─── Filter Tabs & Mock Data Types ───────────────────────────────────────────
type FilterTab = 'All Time' | 'This Month' | 'Courses' | 'Hackathons' | 'Events';
type SortOption = 'rank' | 'xp' | 'level';

interface LeaderboardUser {
  rank: number;
  name: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  currentLevelXp: number;
  weeklyChange: number;
  roleBadge?: string;
  coursesCount: number;
  hackathonsCount: number;
  certificatesCount: number;
}

const mockData: Record<FilterTab, { podium: LeaderboardUser[]; list: LeaderboardUser[]; userRank: LeaderboardUser }> = {
  'All Time': {
    podium: [
      {
        rank: 1,
        name: 'Alex Rivera',
        username: '@arivera',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
        level: 54,
        xp: 48920,
        nextLevelXp: 50000,
        currentLevelXp: 45000,
        weeklyChange: 2,
        roleBadge: 'ML Engineer',
        coursesCount: 24,
        hackathonsCount: 6,
        certificatesCount: 18
      },
      {
        rank: 2,
        name: 'Elena Rostova',
        username: '@erostova',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
        level: 51,
        xp: 43150,
        nextLevelXp: 45000,
        currentLevelXp: 40000,
        weeklyChange: 0,
        roleBadge: 'AI Mentor',
        coursesCount: 21,
        hackathonsCount: 4,
        certificatesCount: 15
      },
      {
        rank: 3,
        name: 'Marcus Vance',
        username: '@mvance',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        level: 48,
        xp: 39800,
        nextLevelXp: 42000,
        currentLevelXp: 38000,
        weeklyChange: 1,
        roleBadge: 'Full Stack',
        coursesCount: 19,
        hackathonsCount: 5,
        certificatesCount: 13
      }
    ],
    userRank: {
      rank: 12,
      name: 'You',
      username: '@you',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
      level: 32,
      xp: 18450,
      nextLevelXp: 20000,
      currentLevelXp: 16000,
      weeklyChange: 4,
      roleBadge: 'Frontend Lead',
      coursesCount: 12,
      hackathonsCount: 2,
      certificatesCount: 8
    },
    list: [
      { rank: 4, name: 'Sarah Chen', username: '@schen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', level: 46, xp: 36400, nextLevelXp: 38000, currentLevelXp: 34000, weeklyChange: -1, roleBadge: 'Frontend Lead', coursesCount: 18, hackathonsCount: 3, certificatesCount: 12 },
      { rank: 5, name: 'Devon Knight', username: '@dknight', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', level: 44, xp: 33900, nextLevelXp: 35000, currentLevelXp: 32000, weeklyChange: 3, roleBadge: 'Rust Specialist', coursesCount: 16, hackathonsCount: 4, certificatesCount: 11 },
      { rank: 6, name: 'Maya Patel', username: '@mpatel', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80', level: 43, xp: 31200, nextLevelXp: 33000, currentLevelXp: 30000, weeklyChange: 0, roleBadge: 'AI Mentor', coursesCount: 15, hackathonsCount: 3, certificatesCount: 10 },
      { rank: 7, name: 'Lucas Scott', username: '@lscott', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80', level: 41, xp: 28650, nextLevelXp: 30000, currentLevelXp: 27000, weeklyChange: -2, roleBadge: 'Full Stack', coursesCount: 14, hackathonsCount: 2, certificatesCount: 9 },
      { rank: 8, name: 'Amara Okafor', username: '@aokafor', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80', level: 39, xp: 26100, nextLevelXp: 28000, currentLevelXp: 25000, weeklyChange: 5, roleBadge: 'ML Engineer', coursesCount: 13, hackathonsCount: 3, certificatesCount: 8 },
      { rank: 9, name: 'Liam Zhang', username: '@lzhang', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80', level: 37, xp: 23800, nextLevelXp: 25000, currentLevelXp: 22000, weeklyChange: 1, roleBadge: 'UI Designer', coursesCount: 12, hackathonsCount: 2, certificatesCount: 8 },
      { rank: 10, name: 'Chloe Dubois', username: '@cdubois', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80', level: 35, xp: 21400, nextLevelXp: 23000, currentLevelXp: 20000, weeklyChange: -1, roleBadge: 'Full Stack', coursesCount: 11, hackathonsCount: 2, certificatesCount: 7 },
      { rank: 11, name: 'Javier Gomez', username: '@jgomez', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80', level: 33, xp: 19800, nextLevelXp: 21000, currentLevelXp: 18000, weeklyChange: 2, roleBadge: 'Frontend Lead', coursesCount: 10, hackathonsCount: 1, certificatesCount: 6 },
      { rank: 12, name: 'You (Current User)', username: '@you', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80', level: 32, xp: 18450, nextLevelXp: 20000, currentLevelXp: 16000, weeklyChange: 4, roleBadge: 'Frontend Lead', coursesCount: 12, hackathonsCount: 2, certificatesCount: 8 },
      { rank: 13, name: 'Sofia Rossi', username: '@srossi', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80', level: 30, xp: 16900, nextLevelXp: 18000, currentLevelXp: 15000, weeklyChange: -3, roleBadge: 'AI Mentor', coursesCount: 9, hackathonsCount: 1, certificatesCount: 5 },
      { rank: 14, name: 'David Kim', username: '@dkim', avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&q=80', level: 29, xp: 15200, nextLevelXp: 17000, currentLevelXp: 14000, weeklyChange: 1, roleBadge: 'ML Engineer', coursesCount: 8, hackathonsCount: 1, certificatesCount: 5 },
      { rank: 15, name: 'Zoe Andersen', username: '@zandersen', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80', level: 28, xp: 14100, nextLevelXp: 16000, currentLevelXp: 13000, weeklyChange: 0, roleBadge: 'Full Stack', coursesCount: 8, hackathonsCount: 1, certificatesCount: 4 },
    ]
  },
  'This Month': {
    podium: [
      { rank: 1, name: 'Maya Patel', username: '@mpatel', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80', level: 43, xp: 8450, nextLevelXp: 9000, currentLevelXp: 7500, weeklyChange: 4, roleBadge: 'AI Mentor', coursesCount: 5, hackathonsCount: 1, certificatesCount: 3 },
      { rank: 2, name: 'Alex Rivera', username: '@arivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80', level: 54, xp: 7920, nextLevelXp: 8500, currentLevelXp: 7000, weeklyChange: -1, roleBadge: 'ML Engineer', coursesCount: 4, hackathonsCount: 1, certificatesCount: 3 },
      { rank: 3, name: 'Devon Knight', username: '@dknight', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', level: 44, xp: 7100, nextLevelXp: 8000, currentLevelXp: 6500, weeklyChange: 6, roleBadge: 'Rust Specialist', coursesCount: 4, hackathonsCount: 2, certificatesCount: 2 },
    ],
    userRank: { rank: 8, name: 'You', username: '@you', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80', level: 32, xp: 4850, nextLevelXp: 6000, currentLevelXp: 4000, weeklyChange: 5, roleBadge: 'Frontend Lead', coursesCount: 3, hackathonsCount: 1, certificatesCount: 2 },
    list: [
      { rank: 4, name: 'Amara Okafor', username: '@aokafor', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80', level: 39, xp: 6800, nextLevelXp: 7500, currentLevelXp: 6000, weeklyChange: 3, roleBadge: 'ML Engineer', coursesCount: 4, hackathonsCount: 1, certificatesCount: 2 },
      { rank: 5, name: 'Elena Rostova', username: '@erostova', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80', level: 51, xp: 6350, nextLevelXp: 7000, currentLevelXp: 5500, weeklyChange: -2, roleBadge: 'AI Mentor', coursesCount: 3, hackathonsCount: 0, certificatesCount: 2 },
      { rank: 6, name: 'Sarah Chen', username: '@schen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', level: 46, xp: 5900, nextLevelXp: 6500, currentLevelXp: 5000, weeklyChange: 1, roleBadge: 'Frontend Lead', coursesCount: 3, hackathonsCount: 1, certificatesCount: 1 },
      { rank: 7, name: 'Marcus Vance', username: '@mvance', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', level: 48, xp: 5400, nextLevelXp: 6000, currentLevelXp: 4800, weeklyChange: 0, roleBadge: 'Full Stack', coursesCount: 3, hackathonsCount: 1, certificatesCount: 1 },
      { rank: 8, name: 'You (Current User)', username: '@you', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80', level: 32, xp: 4850, nextLevelXp: 6000, currentLevelXp: 4000, weeklyChange: 5, roleBadge: 'Frontend Lead', coursesCount: 3, hackathonsCount: 1, certificatesCount: 2 },
      { rank: 9, name: 'Javier Gomez', username: '@jgomez', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80', level: 33, xp: 4200, nextLevelXp: 5000, currentLevelXp: 3800, weeklyChange: -1, roleBadge: 'Frontend Lead', coursesCount: 2, hackathonsCount: 0, certificatesCount: 1 },
      { rank: 10, name: 'Lucas Scott', username: '@lscott', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80', level: 41, xp: 3950, nextLevelXp: 4500, currentLevelXp: 3500, weeklyChange: -4, roleBadge: 'Full Stack', coursesCount: 2, hackathonsCount: 0, certificatesCount: 1 },
    ]
  },
  'Courses': {
    podium: [
      { rank: 1, name: 'Elena Rostova', username: '@erostova', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80', level: 51, xp: 21500, nextLevelXp: 23000, currentLevelXp: 20000, weeklyChange: 1, roleBadge: 'AI Mentor', coursesCount: 21, hackathonsCount: 4, certificatesCount: 15 },
      { rank: 2, name: 'Sarah Chen', username: '@schen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', level: 46, xp: 19800, nextLevelXp: 21000, currentLevelXp: 18000, weeklyChange: 2, roleBadge: 'Frontend Lead', coursesCount: 18, hackathonsCount: 3, certificatesCount: 12 },
      { rank: 3, name: 'Alex Rivera', username: '@arivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80', level: 54, xp: 18900, nextLevelXp: 20000, currentLevelXp: 17500, weeklyChange: -1, roleBadge: 'ML Engineer', coursesCount: 24, hackathonsCount: 6, certificatesCount: 18 },
    ],
    userRank: { rank: 14, name: 'You', username: '@you', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80', level: 32, xp: 9100, nextLevelXp: 11000, currentLevelXp: 8000, weeklyChange: 2, roleBadge: 'Frontend Lead', coursesCount: 12, hackathonsCount: 2, certificatesCount: 8 },
    list: [
      { rank: 4, name: 'Liam Zhang', username: '@lzhang', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80', level: 37, xp: 16400, nextLevelXp: 18000, currentLevelXp: 15000, weeklyChange: 0, roleBadge: 'UI Designer', coursesCount: 12, hackathonsCount: 2, certificatesCount: 8 },
      { rank: 5, name: 'Marcus Vance', username: '@mvance', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', level: 48, xp: 15100, nextLevelXp: 17000, currentLevelXp: 14000, weeklyChange: -2, roleBadge: 'Full Stack', coursesCount: 19, hackathonsCount: 5, certificatesCount: 13 },
      { rank: 6, name: 'Amara Okafor', username: '@aokafor', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80', level: 39, xp: 14200, nextLevelXp: 16000, currentLevelXp: 13000, weeklyChange: 3, roleBadge: 'ML Engineer', coursesCount: 13, hackathonsCount: 3, certificatesCount: 8 },
    ]
  },
  'Hackathons': {
    podium: [
      { rank: 1, name: 'Devon Knight', username: '@dknight', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', level: 44, xp: 14500, nextLevelXp: 16000, currentLevelXp: 13000, weeklyChange: 0, roleBadge: 'Rust Specialist', coursesCount: 16, hackathonsCount: 7, certificatesCount: 11 },
      { rank: 2, name: 'Marcus Vance', username: '@mvance', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', level: 48, xp: 12900, nextLevelXp: 14000, currentLevelXp: 11500, weeklyChange: 1, roleBadge: 'Full Stack', coursesCount: 19, hackathonsCount: 6, certificatesCount: 13 },
      { rank: 3, name: 'Maya Patel', username: '@mpatel', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80', level: 43, xp: 11800, nextLevelXp: 13000, currentLevelXp: 10000, weeklyChange: -1, roleBadge: 'AI Mentor', coursesCount: 15, hackathonsCount: 5, certificatesCount: 10 },
    ],
    userRank: { rank: 5, name: 'You', username: '@you', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80', level: 32, xp: 8400, nextLevelXp: 10000, currentLevelXp: 7000, weeklyChange: 3, roleBadge: 'Frontend Lead', coursesCount: 12, hackathonsCount: 4, certificatesCount: 8 },
    list: [
      { rank: 4, name: 'Chloe Dubois', username: '@cdubois', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80', level: 35, xp: 9500, nextLevelXp: 11000, currentLevelXp: 8500, weeklyChange: 2, roleBadge: 'Full Stack', coursesCount: 11, hackathonsCount: 4, certificatesCount: 7 },
      { rank: 5, name: 'You (Current User)', username: '@you', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80', level: 32, xp: 8400, nextLevelXp: 10000, currentLevelXp: 7000, weeklyChange: 3, roleBadge: 'Frontend Lead', coursesCount: 12, hackathonsCount: 4, certificatesCount: 8 },
      { rank: 6, name: 'Lucas Scott', username: '@lscott', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80', level: 41, xp: 7600, nextLevelXp: 9000, currentLevelXp: 6500, weeklyChange: -2, roleBadge: 'Full Stack', coursesCount: 14, hackathonsCount: 3, certificatesCount: 9 },
    ]
  },
  'Events': {
    podium: [
      { rank: 1, name: 'Chloe Dubois', username: '@cdubois', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80', level: 35, xp: 6200, nextLevelXp: 7000, currentLevelXp: 5500, weeklyChange: 2, roleBadge: 'Full Stack', coursesCount: 11, hackathonsCount: 4, certificatesCount: 7 },
      { rank: 2, name: 'Alex Rivera', username: '@arivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80', level: 54, xp: 5800, nextLevelXp: 6500, currentLevelXp: 5000, weeklyChange: 0, roleBadge: 'ML Engineer', coursesCount: 24, hackathonsCount: 6, certificatesCount: 18 },
      { rank: 3, name: 'Amara Okafor', username: '@aokafor', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80', level: 39, xp: 5350, nextLevelXp: 6000, currentLevelXp: 4500, weeklyChange: 1, roleBadge: 'ML Engineer', coursesCount: 13, hackathonsCount: 3, certificatesCount: 8 },
    ],
    userRank: { rank: 9, name: 'You', username: '@you', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80', level: 32, xp: 3100, nextLevelXp: 4000, currentLevelXp: 2500, weeklyChange: 2, roleBadge: 'Frontend Lead', coursesCount: 12, hackathonsCount: 2, certificatesCount: 8 },
    list: [
      { rank: 4, name: 'Sarah Chen', username: '@schen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', level: 46, xp: 4900, nextLevelXp: 5500, currentLevelXp: 4200, weeklyChange: -1, roleBadge: 'Frontend Lead', coursesCount: 18, hackathonsCount: 3, certificatesCount: 12 },
      { rank: 5, name: 'Devon Knight', username: '@dknight', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', level: 44, xp: 4400, nextLevelXp: 5000, currentLevelXp: 3800, weeklyChange: 1, roleBadge: 'Rust Specialist', coursesCount: 16, hackathonsCount: 4, certificatesCount: 11 },
    ]
  }
};

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<FilterTab>('All Time');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [sortOption, setSortOption] = useState<SortOption>('rank');

  const currentTabContent = mockData[activeTab];

  // Derive current user details if authenticated
  const currentUserObj: LeaderboardUser = {
    ...currentTabContent.userRank,
    name: user?.fullName || user?.firstName || user?.username || currentTabContent.userRank.name,
    avatar: user?.avatarUrl || currentTabContent.userRank.avatar,
    username: user?.username ? `@${user.username}` : currentTabContent.userRank.username,
  };

  let filteredList = currentTabContent.list.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (departmentFilter !== 'All Departments') {
    filteredList = filteredList.filter(item => item.roleBadge?.toLowerCase().includes(departmentFilter.toLowerCase().replace(' engineering', '').replace(' design', '')));
  }

  if (sortOption === 'xp') {
    filteredList = [...filteredList].sort((a, b) => b.xp - a.xp);
  } else if (sortOption === 'level') {
    filteredList = [...filteredList].sort((a, b) => b.level - a.level);
  }

  return (
    <div className="relative min-h-screen w-full bg-[#FCFCFD] dark:bg-black text-[#111827] dark:text-white font-sans antialiased transition-colors duration-[180ms] ease-out">
      
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-12 pt-28 md:pt-32 pb-16 space-y-12">
        
        {/* ─── SECTION 1: HERO ───────────────────────────────────────────────── */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-[48px] font-bold tracking-tight text-[#111827] dark:text-white leading-tight">
            Leaderboard
          </h1>
          <p className="text-base text-[#6B7280] dark:text-neutral-400 font-normal">
            Recognizing the highest-performing learners in the Arcade community.
          </p>
        </div>

        {/* ─── SECTION 2: TOP RANKED LEARNERS (3 Horizontal Cards: 🥇 1st → 🥈 2nd → 🥉 3rd) ─ */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div>
              <h2 className="text-[22px] font-semibold text-[#111827] dark:text-white tracking-tight">
                Top Ranked Learners
              </h2>
              <p className="text-[13px] font-normal text-[#6B7280] dark:text-neutral-400 mt-0.5">
                Recognizing the highest XP earners in the Arcade community.
              </p>
            </div>
            <span className="text-[12px] font-normal text-[#6B7280] dark:text-neutral-400">
              Ranked #1 to #3
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center"
            >
              {/* 🥇 1st Place Card (Left, ~8-10% larger visual emphasis) */}
              <TopLearnerCard user={currentTabContent.podium[0]} place={1} />

              {/* 🥈 2nd Place Card (Middle) */}
              <TopLearnerCard user={currentTabContent.podium[1]} place={2} />

              {/* 🥉 3rd Place Card (Right) */}
              <TopLearnerCard user={currentTabContent.podium[2]} place={3} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ─── SECTION 3: YOUR PERFORMANCE (Full-Width Dashboard Card) ────────── */}
        <div className="space-y-4">
          <h2 className="text-[22px] font-semibold text-[#111827] dark:text-white tracking-tight">
            Your Performance
          </h2>
          
          <div className="relative overflow-hidden rounded-2xl border border-[#E8ECF3] dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 md:p-8 shadow-[0_4px_18px_rgba(0,0,0,0.04)] transition-all duration-[180ms] ease-out">
            
            {/* Very faint subtle blue highlight on right side only */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-50/40 dark:from-indigo-950/20 to-transparent pointer-events-none" />

            {/* Four Equal Columns */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center divide-y sm:divide-y-0 sm:divide-x divide-[#E8ECF3] dark:divide-neutral-800">
              
              {/* Column 1: Rank, Avatar, Name, Level */}
              <div className="flex items-center gap-4 pr-2">
                <div className="flex flex-col items-center justify-center min-w-[56px] h-14 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs px-3">
                  <span className="text-[10px] font-bold tracking-wider uppercase opacity-75">Rank</span>
                  <span className="text-xl font-extrabold tracking-tight">#{currentUserObj.rank}</span>
                </div>

                <div className="relative flex-shrink-0">
                  <div className="h-14 w-14 rounded-full overflow-hidden border border-[#E8ECF3] dark:border-neutral-800 shadow-xs">
                    <img 
                      src={currentUserObj.avatar} 
                      alt={currentUserObj.name}
                      className="h-full w-full object-cover" 
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white dark:border-neutral-900">
                    YOU
                  </div>
                </div>

                <div className="space-y-0.5 min-w-0">
                  <h3 className="text-[18px] font-semibold text-[#111827] dark:text-white tracking-tight truncate">{currentUserObj.name}</h3>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-indigo-700 dark:text-indigo-300 text-[12px] font-medium border border-indigo-200/80 dark:border-indigo-800/60">
                    Lvl {currentUserObj.level}
                  </span>
                </div>
              </div>

              {/* Column 2: Next Goal */}
              <div className="pt-4 sm:pt-0 sm:pl-6 space-y-1">
                <span className="text-[13px] font-medium text-[#6B7280] dark:text-neutral-400 uppercase tracking-wider block">
                  Next Goal
                </span>
                <p className="text-[14px] text-[#111827] dark:text-white font-medium leading-snug">
                  Need <span className="font-bold text-indigo-600 dark:text-indigo-400">12,470 XP</span> to enter <span className="font-bold">Top 10</span>
                </p>
              </div>

              {/* Column 3: Progress to Level 33 */}
              <div className="pt-4 sm:pt-0 sm:pl-6 space-y-2">
                <div className="flex items-center justify-between text-[13px] font-medium text-[#6B7280] dark:text-neutral-400">
                  <span>Progress to Level {currentUserObj.level + 1}</span>
                  <span className="text-[#111827] dark:text-white font-bold">{currentUserObj.xp.toLocaleString()} XP</span>
                </div>

                <div className="h-2 w-full bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min(100, Math.max(10, ((currentUserObj.xp - currentUserObj.currentLevelXp) / (currentUserObj.nextLevelXp - currentUserObj.currentLevelXp)) * 100))}%` 
                    }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                  />
                </div>

                <span className="text-[12px] text-[#6B7280] dark:text-neutral-400 font-normal block">
                  {(currentUserObj.nextLevelXp - currentUserObj.xp).toLocaleString()} XP remaining
                </span>
              </div>

              {/* Column 4: Weekly Movement */}
              <div className="pt-4 sm:pt-0 sm:pl-6 space-y-1.5">
                <span className="text-[13px] font-medium text-[#6B7280] dark:text-neutral-400 uppercase tracking-wider block">
                  Weekly Movement
                </span>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[13px] font-medium border border-emerald-200/80 dark:border-emerald-900/60">
                    <TrendingUp size={14} />
                    <span>▲ +{currentUserObj.weeklyChange} this week</span>
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ─── SECTION 4: COMMUNITY RANKINGS (Table) ──────────────────────────── */}
        <div className="space-y-5 pt-2">
          
          {/* Controls Bar (Aligned on ONE horizontal line) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E8ECF3] dark:border-neutral-800 pb-4">
            <div>
              <h2 className="text-[22px] font-semibold text-[#111827] dark:text-white tracking-tight">
                Community Rankings
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B7280] dark:text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search learners..."
                  className="w-full pl-9 pr-3 py-1.5 text-[13px] font-medium rounded-lg border border-[#E8ECF3] dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[#111827] dark:text-white placeholder:text-[#6B7280] dark:placeholder:text-neutral-500 focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500 transition-all duration-[180ms]"
                />
              </div>

              {/* Department Filter */}
              <div className="relative flex items-center">
                <Filter className="absolute left-2.5 h-3.5 w-3.5 text-[#6B7280] dark:text-neutral-400 pointer-events-none" />
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="pl-8 pr-7 py-1.5 text-[13px] font-medium rounded-lg border border-[#E8ECF3] dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[#111827] dark:text-white focus:outline-none focus:border-indigo-600 appearance-none cursor-pointer"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Full Stack</option>
                  <option value="AI">AI & ML</option>
                  <option value="Mobile">Mobile & Rust</option>
                </select>
              </div>

              {/* Time Filter Tabs */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-neutral-800 rounded-lg border border-[#E8ECF3] dark:border-neutral-700">
                {(['All Time', 'This Month', 'Courses', 'Hackathons', 'Events'] as FilterTab[]).map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-all duration-[180ms] cursor-pointer ${
                        isActive 
                          ? 'bg-white dark:bg-neutral-900 text-[#111827] dark:text-white shadow-xs font-semibold' 
                          : 'text-[#6B7280] dark:text-neutral-400 hover:text-[#111827] dark:hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl border border-[#E8ECF3] dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-[0_4px_18px_rgba(0,0,0,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="sticky top-0 bg-slate-50 dark:bg-neutral-900 z-10 border-b border-[#E8ECF3] dark:border-neutral-800 text-[12px] font-medium text-[#6B7280] dark:text-neutral-400 uppercase tracking-wider">
                    <th className="py-3.5 px-5 w-16 text-center">Rank</th>
                    <th className="py-3.5 px-6">Learner</th>
                    <th className="py-3.5 px-4 text-center">Level</th>
                    <th className="py-3.5 px-6 text-right">XP</th>
                    <th className="py-3.5 px-4 text-center">Courses</th>
                    <th className="py-3.5 px-4 text-center">Hackathons</th>
                    <th className="py-3.5 px-4 text-center">Certificates</th>
                    <th className="py-3.5 px-6 text-center">Badges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF3] dark:divide-neutral-800/60 text-[14px]">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#6B7280] dark:text-neutral-400 text-[13px] font-medium">
                        No learners found matching search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((item) => {
                      const isCurrentUser = item.rank === currentUserObj.rank;
                      return (
                        <tr
                          key={item.rank}
                          className={`group h-[68px] transition-colors duration-[180ms] ease-out ${
                            isCurrentUser 
                              ? 'bg-indigo-50/60 dark:bg-indigo-950/30 font-semibold border-l-4 border-l-indigo-600' 
                              : 'hover:bg-slate-50/80 dark:hover:bg-neutral-800/40'
                          }`}
                        >
                          {/* Rank */}
                          <td className="py-4 px-5 text-center">
                            <span className={`inline-flex items-center justify-center font-bold text-[14px] ${
                              isCurrentUser ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-[#6B7280] dark:text-neutral-400'
                            }`}>
                              #{item.rank}
                            </span>
                          </td>

                          {/* Learner Info */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full overflow-hidden border border-[#E8ECF3] dark:border-neutral-800 flex-shrink-0">
                                <img src={item.avatar} alt={item.name} className="h-full w-full object-cover" />
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-[#111827] dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {item.name}
                                  </span>
                                  {isCurrentUser && (
                                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <span className="text-[12px] text-[#6B7280] dark:text-neutral-400 font-normal block">{item.username}</span>
                              </div>
                            </div>
                          </td>

                          {/* Level */}
                          <td className="py-4 px-4 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-[12px] font-medium text-[#111827] dark:text-neutral-300 border border-[#E8ECF3] dark:border-neutral-700">
                              Lvl {item.level}
                            </span>
                          </td>

                          {/* XP */}
                          <td className="py-4 px-6 text-right font-bold text-[#111827] dark:text-white">
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                              {item.xp.toLocaleString()} XP
                            </span>
                          </td>

                          {/* Courses */}
                          <td className="py-4 px-4 text-center text-[13px] font-medium text-[#111827] dark:text-neutral-300">
                            {item.coursesCount}
                          </td>

                          {/* Hackathons */}
                          <td className="py-4 px-4 text-center text-[13px] font-medium text-[#111827] dark:text-neutral-300">
                            {item.hackathonsCount}
                          </td>

                          {/* Certificates */}
                          <td className="py-4 px-4 text-center text-[13px] font-medium text-[#111827] dark:text-neutral-300">
                            {item.certificatesCount}
                          </td>

                          {/* Badges / Role Chip */}
                          <td className="py-4 px-6 text-center">
                            {item.roleBadge ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-[11px] font-medium text-[#6B7280] dark:text-neutral-400 border border-[#E8ECF3] dark:border-neutral-700">
                                {item.roleBadge}
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-neutral-600 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Flat 2D Vector Medal Component (Olympic Hanging Ribbon) ─────────────────
function FlatVectorMedal({ place }: { place: 1 | 2 | 3 }) {
  const medalConfig = {
    1: {
      fill: '#D4AF37',    // Premium Gold
      textFill: '#FFFFFF'  // White Number
    },
    2: {
      fill: '#C0C6D4',    // Premium Silver
      textFill: '#1E293B'  // Dark Grey Number
    },
    3: {
      fill: '#B87333',    // Rich Bronze
      textFill: '#3B1A08'  // Dark Brown Number
    }
  }[place];

  return (
    <svg width="28" height="34" viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      {/* V-Shaped Red / White / Blue Olympic Ribbon */}
      {/* Left Strand: Red, White, Blue */}
      <path d="M2 0L14 15L11 15L0 0H2Z" fill="#DC2626" />
      <path d="M5 0L14 15L12.5 15L3.5 0H5Z" fill="#FFFFFF" />
      <path d="M8 0L14 15L14 15L6.5 0H8Z" fill="#2563EB" />

      {/* Right Strand: Blue, White, Red */}
      <path d="M26 0L14 15L17 15L28 0H26Z" fill="#2563EB" />
      <path d="M23 0L14 15L15.5 15L24.5 0H23Z" fill="#FFFFFF" />
      <path d="M20 0L14 15L14 15L21.5 0H20Z" fill="#DC2626" />

      {/* Circular Medal Body */}
      <circle cx="14" cy="22" r="9.5" fill={medalConfig.fill} />
      <circle cx="14" cy="22" r="8" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.45" fill="none" />

      {/* Centered Rank Number */}
      <text 
        x="14" 
        y="25.5" 
        textAnchor="middle" 
        fill={medalConfig.textFill} 
        fontSize="10.5" 
        fontWeight="800" 
        fontFamily="sans-serif"
      >
        {place}
      </text>
    </svg>
  );
}

// ─── Premium 2D Flat Vector Crown Component ─────────────────────────────────
function Premium2DCrown() {
  return (
    <svg width="22" height="15" viewBox="0 0 22 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      {/* Crown base & body with 5 smooth points */}
      <path 
        d="M2.5 13.5H19.5L20.5 5.5L16 9L11 2L6 9L1.5 5.5L2.5 13.5Z" 
        fill="#D4AF37" 
      />
      {/* 5 Circular Tips at the top of points */}
      <circle cx="1.5" cy="5" r="1.2" fill="#D4AF37" />
      <circle cx="6" cy="8.5" r="1" fill="#D4AF37" />
      <circle cx="11" cy="1.5" r="1.4" fill="#D4AF37" />
      <circle cx="16" cy="8.5" r="1" fill="#D4AF37" />
      <circle cx="20.5" cy="5" r="1.2" fill="#D4AF37" />
      {/* Refined bottom rim line */}
      <rect x="2.5" y="12" width="17" height="1.2" rx="0.6" fill="#B38F24" fillOpacity="0.35" />
    </svg>
  );
}

// ─── SECTION 2: TOP LEARNER CARD (🥇 1st → 🥈 2nd → 🥉 3rd) ─────────────────
function TopLearnerCard({ user, place }: { user: LeaderboardUser; place: 1 | 2 | 3 }) {
  if (!user) return null;

  const isFirst = place === 1;

  const cardConfig = {
    1: {
      border: 'border border-[#D4AF37] dark:border-[#D4AF37]/60',
      bg: 'bg-[#FFFCF5] dark:bg-amber-950/10',
      shadow: 'shadow-[0_6px_20px_rgba(212,175,55,0.08)]',
    },
    2: {
      border: 'border border-[#E6EAF2] dark:border-neutral-800',
      bg: 'bg-white dark:bg-neutral-900',
      shadow: 'shadow-[0_6px_20px_rgba(15,23,42,0.05)]',
    },
    3: {
      border: 'border border-[#E6EAF2] dark:border-neutral-800',
      bg: 'bg-white dark:bg-neutral-900',
      shadow: 'shadow-[0_6px_20px_rgba(15,23,42,0.05)]',
    }
  }[place];

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.18, ease: "easeOut" } }}
      className={`relative rounded-[18px] ${cardConfig.bg} ${cardConfig.border} ${cardConfig.shadow} p-7 md:p-8 flex flex-col justify-between transition-all duration-[180ms] ease-out`}
    >
      <div>
        {/* Upper-Left Small Flat Vector Medal Icon (32px padding clearance) */}
        <div className="flex items-center justify-between w-full mb-4">
          <FlatVectorMedal place={place} />
        </div>

        {/* Horizontal Profile Section: Avatar on Left, Info on Right */}
        <div className="flex items-center gap-4 mt-1">
          {/* Avatar Container (2px white border + subtle shadow, Crown ONLY for 1st Place) */}
          <div className="relative flex-shrink-0">
            {isFirst && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 flex justify-center">
                <Premium2DCrown />
              </div>
            )}
            <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-white dark:border-neutral-800 shadow-xs">
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="text-[18px] font-bold text-[#111827] dark:text-white tracking-tight truncate">
              {user.name}
            </h3>
            <p className="text-[13px] font-normal text-[#6B7280] dark:text-neutral-400 truncate">
              {user.username}
            </p>
            
            {/* Level Badge + XP on the SAME line */}
            <div className="pt-1 flex items-center gap-2 text-[13px]">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-[#111827] dark:text-neutral-300 font-medium border border-[#E6EAF2] dark:border-neutral-700 text-[12px]">
                Lvl {user.level}
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {user.xp.toLocaleString()} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider & Three Equal Column Statistics (Apple / Stripe style) */}
      <div className="w-full mt-6 pt-5 border-t border-[#F1F3F7] dark:border-neutral-800 grid grid-cols-3 divide-x divide-[#F1F3F7] dark:divide-neutral-800 text-center">
        <div className="px-1">
          <span className="block text-base font-bold text-[#111827] dark:text-white leading-none">{user.coursesCount}</span>
          <span className="block text-[11px] font-normal text-[#6B7280] dark:text-neutral-400 mt-1">Courses</span>
        </div>
        <div className="px-1">
          <span className="block text-base font-bold text-[#111827] dark:text-white leading-none">{user.hackathonsCount}</span>
          <span className="block text-[11px] font-normal text-[#6B7280] dark:text-neutral-400 mt-1">Hackathons</span>
        </div>
        <div className="px-1">
          <span className="block text-base font-bold text-[#111827] dark:text-white leading-none">{user.certificatesCount}</span>
          <span className="block text-[11px] font-normal text-[#6B7280] dark:text-neutral-400 mt-1">Certificates</span>
        </div>
      </div>
    </motion.div>
  );
}
