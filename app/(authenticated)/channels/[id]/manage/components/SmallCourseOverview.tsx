'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
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

export function SmallCourseOverview({ onNavigateToCatalog, onNavigateToAnalytics, onAddCourse }: SmallCourseOverviewProps) {
  // YouTube Studio style performance filter state
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
    <div className="space-y-6">
      {/* YouTube Studio Style: Top Performing Courses Widget */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div>
              <h2 className="text-base font-black tracking-tight text-[#14142b]">
                Top Performing Content
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                Content ranking and performance analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Performance Filter Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Order by:</span>
              <Select value={topPerformanceFilter} onValueChange={(val) => setTopPerformanceFilter(val as any)}>
                <SelectTrigger className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 h-[34px] py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50/80 hover:border-indigo-200 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-[0_2px_10px_rgba(20,20,43,0.02)] transition-all cursor-pointer">
                  <SelectValue placeholder="Order by">
                    {topPerformanceFilter === 'TOP_COMPLETION' ? 'Top Completion Rate' : topPerformanceFilter === 'MOST_ENROLLED' ? 'Most Enrolled Students' : topPerformanceFilter === 'HIGHEST_RATED' ? 'Highest Learner Rating' : topPerformanceFilter === 'NEEDS_ATTENTION' ? 'Needs Attention (Lowest)' : 'Recently Updated'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-3xl p-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-200/60 bg-white/95 backdrop-blur-xl">
                  <SelectItem value="TOP_COMPLETION" className="rounded-xl cursor-pointer py-2 px-3 mb-1 last:mb-0 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 transition-colors duration-150">Top Completion Rate</SelectItem>
                  <SelectItem value="MOST_ENROLLED" className="rounded-xl cursor-pointer py-2 px-3 mb-1 last:mb-0 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 transition-colors duration-150">Most Enrolled Students</SelectItem>
                  <SelectItem value="HIGHEST_RATED" className="rounded-xl cursor-pointer py-2 px-3 mb-1 last:mb-0 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 transition-colors duration-150">Highest Learner Rating</SelectItem>
                  <SelectItem value="NEEDS_ATTENTION" className="rounded-xl cursor-pointer py-2 px-3 mb-1 last:mb-0 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 transition-colors duration-150">Needs Attention (Lowest)</SelectItem>
                  <SelectItem value="RECENTLY_UPDATED" className="rounded-xl cursor-pointer py-2 px-3 mb-1 last:mb-0 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 transition-colors duration-150">Recently Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Youtube Studio Style Ranked List */}
        <div className="space-y-2.5">
          {rankedTopCourses.slice(0, 5).map((course, idx) => {
            const isTop = idx === 0;
            const rankBadgeColors = [
              'bg-indigo-600 text-white font-extrabold shadow-xs',
              'bg-purple-600 text-white font-extrabold shadow-xs',
              'bg-sky-600 text-white font-extrabold shadow-xs',
              'bg-amber-500 text-white font-extrabold shadow-xs',
              'bg-emerald-600 text-white font-extrabold shadow-xs',
            ];
            const rankBadgeColor = rankBadgeColors[idx % rankBadgeColors.length];

            return (
              <div
                key={course.id}
                className={`flex flex-col gap-3 rounded-2xl p-3.5 sm:flex-row sm:items-center sm:justify-between transition-colors ${
                  isTop ? 'bg-indigo-50/50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Rank Badge */}
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs ${rankBadgeColor}`}
                  >
                    0{idx + 1}
                  </span>

                  {/* Thumbnail */}
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-12 w-20 shrink-0 rounded-xl object-cover border border-slate-200"
                  />

                  {/* Title & Metadata */}
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#14142b] truncate">
                      {course.title}
                    </h3>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
                      <span className="text-indigo-600 font-bold">{course.category}</span>
                      <span>·</span>
                      {course.addedByStaff && (
                        <span className="inline-flex items-center gap-1 text-slate-700 font-bold">
                          <img
                            src={course.addedByStaff.avatar}
                            alt=""
                            className="h-3.5 w-3.5 rounded-full object-cover"
                          />
                          Added by {course.addedByStaff.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Performance Metric & Quick Analytics Text Link */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-xs font-extrabold ${
                        topPerformanceFilter === 'NEEDS_ATTENTION'
                          ? 'text-rose-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {topPerformanceFilter === 'MOST_ENROLLED'
                        ? `${course.enrollments.toLocaleString()} students`
                        : topPerformanceFilter === 'HIGHEST_RATED'
                        ? `${course.rating} ★ (${course.reviewsCount})`
                        : `${course.completionRate}% completion`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={onNavigateToAnalytics}
                    title="View Analytics"
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:scale-105 transition-all cursor-pointer"
                  >
                    <BarChart3 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
