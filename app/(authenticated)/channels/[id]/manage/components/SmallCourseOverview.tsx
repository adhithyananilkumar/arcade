'use client';

import { useState, useMemo } from 'react';
import {
  BarChart3,
  Crown,
  Star,
  Sparkles,
  Play,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockContent } from './CourseManagementSection';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/design-system/ui/select';

interface SmallCourseOverviewProps {
  onNavigateToCatalog: () => void;
  onNavigateToAnalytics?: () => void;
  onAddCourse?: () => void;
}

const RANK_THEMES = [
  {
    cardBorder: 'border border-blue-200/80',
    offsetShadow: 'shadow-[4px_4px_0px_rgba(59,130,246,0.22)] hover:shadow-[6px_6px_0px_rgba(37,99,235,0.30)]',
    cardBg: 'bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/20',
  },
  {
    cardBorder: 'border border-purple-200/80',
    offsetShadow: 'shadow-[4px_4px_0px_rgba(139,92,246,0.22)] hover:shadow-[6px_6px_0px_rgba(124,58,237,0.30)]',
    cardBg: 'bg-gradient-to-r from-purple-50/50 via-white to-slate-50/20',
  },
  {
    cardBorder: 'border border-indigo-200/80',
    offsetShadow: 'shadow-[4px_4px_0px_rgba(99,102,241,0.22)] hover:shadow-[6px_6px_0px_rgba(79,70,229,0.30)]',
    cardBg: 'bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/20',
  },
  {
    cardBorder: 'border border-emerald-200/80',
    offsetShadow: 'shadow-[4px_4px_0px_rgba(16,185,129,0.22)] hover:shadow-[6px_6px_0px_rgba(5,150,105,0.30)]',
    cardBg: 'bg-gradient-to-r from-emerald-50/50 via-white to-teal-50/20',
  },
  {
    cardBorder: 'border border-amber-200/80',
    offsetShadow: 'shadow-[4px_4px_0px_rgba(245,158,11,0.22)] hover:shadow-[6px_6px_0px_rgba(217,119,6,0.30)]',
    cardBg: 'bg-gradient-to-r from-amber-50/50 via-white to-orange-50/20',
  },
];

// Simple, colorless monochrome SVG Pie Chart Component
function ColorlessCompletionPie({ percentage }: { percentage: number }) {
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-2 text-xs font-black text-slate-700 shrink-0">
      <svg className="h-5 w-5 -rotate-90" viewBox="0 0 24 24">
        {/* Neutral background track */}
        <circle
          cx="12"
          cy="12"
          r={radius}
          className="stroke-slate-200"
          strokeWidth="3.2"
          fill="transparent"
        />
        {/* Colorless dark slate pie segment */}
        <circle
          cx="12"
          cy="12"
          r={radius}
          className="stroke-slate-800 transition-all duration-700"
          strokeWidth="3.2"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <span>{percentage}% completion</span>
    </div>
  );
}

export function SmallCourseOverview({
  onNavigateToAnalytics,
}: SmallCourseOverviewProps) {
  const [topPerformanceFilter, setTopPerformanceFilter] = useState<
    'TOP_COMPLETION' | 'MOST_ENROLLED' | 'HIGHEST_RATED' | 'NEEDS_ATTENTION' | 'RECENTLY_UPDATED'
  >('TOP_COMPLETION');

  const rankedTopCourses = useMemo(() => {
    const sorted = [...mockContent];
    if (topPerformanceFilter === 'TOP_COMPLETION') {
      return sorted.sort((a, b) => b.completionRate - a.completionRate);
    }
    if (topPerformanceFilter === 'MOST_ENROLLED') {
      return sorted.sort((a, b) => b.enrollments - a.enrollments);
    }
    if (topPerformanceFilter === 'HIGHEST_RATED') {
      return sorted.sort((a, b) => b.rating - a.rating);
    }
    if (topPerformanceFilter === 'NEEDS_ATTENTION') {
      return sorted.sort((a, b) => a.completionRate - b.completionRate);
    }
    return sorted; // RECENTLY_UPDATED
  }, [topPerformanceFilter]);

  return (
    <div className="space-y-4">
      {/* Top Performing Content Container */}
      <div className="space-y-3.5">
        {/* Header & Filter Controls */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xs"
            >
              <Crown size={16} />
            </motion.div>
            <div>
              <h2 className="text-base font-black tracking-tight text-[#14142b]">
                Top Performing Content
              </h2>
              <p className="text-[11px] font-semibold text-slate-500">
                Content rankings based on real-time engagement metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400">Order by:</span>
            <Select
              value={topPerformanceFilter}
              onValueChange={(val) => setTopPerformanceFilter(val as any)}
            >
              <SelectTrigger className="rounded-xl border border-slate-200 bg-white px-3 h-[32px] py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-50/80 hover:border-blue-200 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs transition-all cursor-pointer">
                <SelectValue placeholder="Order by">
                  {topPerformanceFilter === 'TOP_COMPLETION'
                    ? 'Top Completion Rate'
                    : topPerformanceFilter === 'MOST_ENROLLED'
                    ? 'Most Enrolled Students'
                    : topPerformanceFilter === 'HIGHEST_RATED'
                    ? 'Highest Learner Rating'
                    : topPerformanceFilter === 'NEEDS_ATTENTION'
                    ? 'Needs Attention (Lowest)'
                    : 'Recently Updated'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-2xl p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-200/60 bg-white/95 backdrop-blur-xl">
                <SelectItem
                  value="TOP_COMPLETION"
                  className="rounded-lg cursor-pointer py-1.5 px-2.5 mb-0.5 text-[11px] font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  Top Completion Rate
                </SelectItem>
                <SelectItem
                  value="MOST_ENROLLED"
                  className="rounded-lg cursor-pointer py-1.5 px-2.5 mb-0.5 text-[11px] font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  Most Enrolled Students
                </SelectItem>
                <SelectItem
                  value="HIGHEST_RATED"
                  className="rounded-lg cursor-pointer py-1.5 px-2.5 mb-0.5 text-[11px] font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  Highest Learner Rating
                </SelectItem>
                <SelectItem
                  value="NEEDS_ATTENTION"
                  className="rounded-lg cursor-pointer py-1.5 px-2.5 mb-0.5 text-[11px] font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  Needs Attention (Lowest)
                </SelectItem>
                <SelectItem
                  value="RECENTLY_UPDATED"
                  className="rounded-lg cursor-pointer py-1.5 px-2.5 text-[11px] font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  Recently Updated
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Horizontal Full-Width Rows Stack with 3D Offset Effect */}
        <div className="flex flex-col gap-3 pt-1 pb-2">
          <AnimatePresence mode="popLayout">
            {rankedTopCourses.slice(0, 5).map((course, idx) => {
              const theme = RANK_THEMES[idx % RANK_THEMES.length];

              return (
                <motion.div
                  key={course.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -6 }}
                  whileHover={{ x: -2, y: -2 }}
                  transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                  className={`group relative rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 transition-all duration-200 cursor-pointer ${theme.cardBorder} ${theme.offsetShadow} ${theme.cardBg}`}
                >
                  {/* Left Section: Rank Badge + Video Thumbnail + Title/Instructor */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Rank Number Badge */}
                    <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-xl bg-white text-xs font-mono font-black text-blue-600 border border-slate-200/80 shadow-2xs">
                      0{idx + 1}
                    </span>

                    {/* Video Thumbnail */}
                    <div className="relative h-14 w-22 shrink-0 overflow-hidden rounded-xl border border-slate-200/70 shadow-2xs">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <span className="absolute bottom-1 right-1 flex items-center gap-0.5 text-[8.5px] font-extrabold text-white bg-black/60 backdrop-blur-xs px-1.5 py-0.2 rounded-full border border-white/20">
                        <Play size={7} className="fill-white text-white" />
                        <span>{course.duration}</span>
                      </span>
                    </div>

                    {/* Title & Instructor */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs sm:text-sm font-black text-[#14142b] truncate group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
                        <span className="text-slate-700 font-extrabold">{course.category}</span>
                        <span>•</span>
                        <span>Instructor: <span className="text-slate-800 font-bold">{course.instructor}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Colorless Completion Pie + Bare Symbol (Without Oval/Text) */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                    {/* Colorless Monochrome SVG Pie Chart for Completion Rate */}
                    <ColorlessCompletionPie percentage={course.completionRate} />

                    {/* Bare Analytics Symbol without Oval or Background */}
                    <button
                      type="button"
                      onClick={onNavigateToAnalytics}
                      title="View Analytics"
                      className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <BarChart3 size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
