'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, CheckCircle2, BookOpen, Sparkles, User as UserIcon } from 'lucide-react';
import type { User } from '@/infrastructure/auth/auth.store';

interface UserInfoCardProps {
  user: User | null;
  completedCoursesCount: number;
  activeCoursesCount: number;
  achievementsCount?: number;
  points?: number;
}

export function UserInfoCard({
  user,
  completedCoursesCount,
  activeCoursesCount,
  achievementsCount = 3,
  points,
}: UserInfoCardProps) {
  const displayName = user?.fullName || user?.username || 'Learner';
  const handleOrEmail = user?.username ? `@${user.username}` : user?.email || 'learning@arcade.dev';
  const calculatedPoints = points ?? Math.max(120, completedCoursesCount * 150 + activeCoursesCount * 40);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 sm:p-7 shadow-[0_8px_30px_rgba(20,20,43,0.04)] backdrop-blur-md"
    >
      {/* Subtle ambient gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-[#2962D6]/10 via-[#27C5D8]/8 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-gradient-to-tr from-[#FFD166]/10 via-[#1DB876]/8 to-transparent blur-3xl"
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: User Identity */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Avatar with gradient ring */}
          <div className="relative shrink-0">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-[#2962D6] via-[#2C83F5] to-[#27C5D8] p-0.5 shadow-md">
              <div className="h-full w-full overflow-hidden rounded-[14px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl sm:text-2xl font-black text-[#2962D6] dark:text-[#2C83F5] select-none">
                    {getInitials(displayName) || <UserIcon className="w-8 h-8 text-slate-400" />}
                  </span>
                )}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 shadow-xs">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          </div>

          {/* Name & Handle */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {displayName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-blue-50 dark:bg-blue-950/60 text-[#2962D6] dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                Learner
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
              {handleOrEmail}
            </p>
          </div>
        </div>

        {/* Right: Key Stats Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5">
          {/* Points / XP */}
          <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-center min-w-[90px] sm:min-w-[110px]">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-0.5">
              <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">Points</span>
            </div>
            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {calculatedPoints.toLocaleString()}
            </span>
          </div>

          {/* Courses Completed */}
          <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-center min-w-[90px] sm:min-w-[110px]">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">Finished</span>
            </div>
            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {completedCoursesCount}
            </span>
          </div>

          {/* Achievements */}
          <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 text-center min-w-[90px] sm:min-w-[110px]">
            <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 mb-0.5">
              <Trophy className="w-4 h-4 text-purple-500" />
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">Badges</span>
            </div>
            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {achievementsCount}
            </span>
          </div>

          {/* Active Learning */}
          <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-center min-w-[90px] sm:min-w-[110px]">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-0.5">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">In Progress</span>
            </div>
            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {activeCoursesCount}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
