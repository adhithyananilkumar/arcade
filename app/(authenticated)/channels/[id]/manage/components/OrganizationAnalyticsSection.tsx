'use client';

import { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  BarChart3,
  Star,
  MessageSquare,
  CornerDownRight,
  TrendingUp,
  ThumbsUp,
  Meh,
  ThumbsDown,
  Tag,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  Users,
  DollarSign,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export interface ReviewItem {
  id: string;
  learnerName: string;
  learnerAvatar: string;
  courseName: string;
  rating: number;
  date: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'CONSTRUCTIVE';
  reviewText: string;
  instructorResponse?: string;
  cardSize?: 'wide' | 'normal';
}

const mockReviews: ReviewItem[] = [
  {
    id: 'rev-1',
    learnerName: 'Marcus Vance',
    learnerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    courseName: 'AI Agent Architecture & Tool Use Masterclass',
    rating: 5,
    date: '2 hours ago',
    sentiment: 'POSITIVE',
    reviewText:
      'Hands down the single best enterprise AI course I have taken! The hands-on labs with vector search and multi-agent coordination were immediately applicable to our engineering team.',
    instructorResponse:
      'Thank you Marcus! So glad the multi-agent labs resonated with your engineering workflow.',
  },
  {
    id: 'rev-2',
    learnerName: 'Sophia Lin',
    learnerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    courseName: 'Prompt Engineering & Context Window Optimization',
    rating: 5,
    date: '1 day ago',
    sentiment: 'POSITIVE',
    reviewText:
      'Extremely clear explanations and excellent benchmark datasets provided. Learned how to cut our token costs by 40% using prompt caching.',
  },
  {
    id: 'rev-3',
    learnerName: 'David K.',
    learnerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
    courseName: 'Neural Networks from Scratch in Python',
    rating: 4,
    date: '3 days ago',
    sentiment: 'CONSTRUCTIVE',
    reviewText:
      'Great math breakdown in Module 3. Would love to see additional PyTorch GPU acceleration examples in the bonus section!',
  },
];

const ratingDistribution = [
  { stars: 5, percentage: 88, count: 3379 },
  { stars: 4, percentage: 8, count: 307 },
  { stars: 3, percentage: 2, count: 76 },
  { stars: 2, percentage: 1, count: 48 },
  { stars: 1, percentage: 1, count: 30 },
];

type TimeframeOption = '7D' | '30D' | '90D' | '1Y';

interface TimeframeData {
  timeframeLabel: string;
  enrollments: string;
  enrollmentGrowth: string;
  rating: string;
  reviewsCount: string;
  completionRate: string;
  revenue: string;
  revenueGrowth: string;
  summaryHeadline: string;
  labels: string[];
  chartPoints: number[];
}

const TIMEFRAME_DATA: Record<TimeframeOption, TimeframeData> = {
  '7D': {
    timeframeLabel: 'last 7 days',
    enrollments: '1,840',
    enrollmentGrowth: '+12.3%',
    rating: '4.94 ★',
    reviewsCount: '142 reviews',
    completionRate: '89.2%',
    revenue: '$8,400',
    revenueGrowth: '+14.1%',
    summaryHeadline: 'Your channel got 1,840 enrollments in the last 7 days',
    labels: ['Aug 1', 'Aug 2', 'Aug 3', 'Aug 4', 'Aug 5', 'Aug 6', 'Aug 7 (Today)'],
    chartPoints: [180, 290, 410, 680, 950, 1420, 1840],
  },
  '30D': {
    timeframeLabel: 'last 30 days',
    enrollments: '14,890',
    enrollmentGrowth: '+18.4%',
    rating: '4.92 ★',
    reviewsCount: '840 reviews',
    completionRate: '84.6%',
    revenue: '$42,500',
    revenueGrowth: '+18.2%',
    summaryHeadline: 'Your channel got 14,890 enrollments in the last 30 days',
    labels: ['Jul 8 - 15', 'Jul 16 - 23', 'Jul 24 - 31', 'Aug 1 - 7'],
    chartPoints: [2800, 5900, 10400, 14890],
  },
  '90D': {
    timeframeLabel: 'last 90 days',
    enrollments: '42,890',
    enrollmentGrowth: '+24.1%',
    rating: '4.91 ★',
    reviewsCount: '3.8k reviews',
    completionRate: '83.1%',
    revenue: '$128,500',
    revenueGrowth: '+22.1%',
    summaryHeadline: 'Your channel got 42,890 enrollments in the last 90 days',
    labels: ['June 2026', 'July 2026', 'August 2026'],
    chartPoints: [12000, 27500, 42890],
  },
  '1Y': {
    timeframeLabel: 'last 365 days',
    enrollments: '168,400',
    enrollmentGrowth: '+42.0%',
    rating: '4.89 ★',
    reviewsCount: '12.4k reviews',
    completionRate: '81.4%',
    revenue: '$492,000',
    revenueGrowth: '+38.5%',
    summaryHeadline: 'Your channel got 168,400 enrollments in the last 365 days',
    labels: ['Aug 2025', 'Nov 2025', 'Feb 2026', 'May 2026', 'Aug 2026'],
    chartPoints: [38000, 84000, 128000, 168400],
  },
};

function getSmoothPath(coords: { x: number; y: number }[]) {
  if (coords.length < 2) return '';
  let path = `M ${coords[0].x},${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i];
    const next = coords[i + 1];
    const cp1x = curr.x + (next.x - curr.x) / 2;
    const cp1y = curr.y;
    const cp2x = curr.x + (next.x - curr.x) / 2;
    const cp2y = next.y;
    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
  }
  return path;
}

export function OrganizationAnalyticsSection() {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('7D');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>(mockReviews);
  const [categories] = useState([
    { name: 'Web & Frontend', percentage: 32, color: 'bg-indigo-600' },
    { name: 'Backend & Cloud', percentage: 24, color: 'bg-blue-500' },
    { name: 'AI & Data Science', percentage: 18, color: 'bg-purple-600' },
    { name: 'Cybersecurity', percentage: 12, color: 'bg-rose-500' },
    { name: 'Mobile Apps', percentage: 8, color: 'bg-emerald-500' },
    { name: 'DevOps & SRE', percentage: 4, color: 'bg-amber-500' },
    { name: 'UI/UX & Product', percentage: 2, color: 'bg-cyan-500' },
  ]);
  const [categoryPage, setCategoryPage] = useState(0);
  const [feedbackPage, setFeedbackPage] = useState(0);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const ratingDistribution = [
    { stars: 5, percentage: 88, count: 3379 },
    { stars: 4, percentage: 8, count: 307 },
    { stars: 3, percentage: 2, count: 76 },
    { stars: 2, percentage: 1, count: 48 },
    { stars: 1, percentage: 1, count: 30 },
  ];

  const topics = ['Hands-on Labs', 'AI Code Assistant', 'Clear Explanations', 'Real Projects', 'Token Cost Reduction'];

  const activeData = useMemo(() => TIMEFRAME_DATA[timeframe], [timeframe]);

  const triggerPoppers = () => {
    try {
      confetti({
        particleCount: 55,
        spread: 75,
        origin: { y: 0.38, x: 0.5 },
        colors: ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'],
        disableForReducedMotion: true,
      });
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerPoppers();
    }, 250);
    return () => clearTimeout(timer);
  }, [timeframe]);

  const handleSendResponse = (id: string) => {
    if (!replyText[id]?.trim()) return;
    setReviews(
      reviews.map((r) =>
        r.id === id ? { ...r, instructorResponse: replyText[id] } : r,
      ),
    );
    toast.success('Instructor response posted');
    setActiveReplyId(null);
    setReplyText({ ...replyText, [id]: '' });
  };

  const categoriesPerPage = 4;
  const totalCategoryPages = Math.ceil(categories.length / categoriesPerPage);
  const currentCategories = categories.slice(
    categoryPage * categoriesPerPage,
    (categoryPage + 1) * categoriesPerPage
  );

  const reviewsPerPage = 10;

  const sortedReviews = useMemo(() => {
    return [...reviews].reverse();
  }, [reviews]);

  const totalFeedbackPages = Math.ceil(sortedReviews.length / reviewsPerPage);
  const currentReviews = sortedReviews.slice(
    feedbackPage * reviewsPerPage,
    (feedbackPage + 1) * reviewsPerPage
  );

  const svgChart = useMemo(() => {
    const pts = activeData.chartPoints;
    const maxVal = Math.max(...pts);
    const minVal = Math.min(...pts);
    const range = maxVal - minVal || 1;

    const width = 540;
    const height = 170;
    const chartBottom = 135;

    const coords = pts.map((pt, idx) => {
      const x = (idx / (pts.length - 1)) * width;
      const y = chartBottom - ((pt - minVal) / range) * (chartBottom - 30);
      return { x: Math.round(x), y: Math.round(y), pt };
    });

    const smoothLine = getSmoothPath(coords);
    const smoothArea = `${smoothLine} L ${width},${chartBottom} L 0,${chartBottom} Z`;

    return { coords, smoothLine, smoothArea, width, height, chartBottom };
  }, [activeData]);

  return (
    <div className="space-y-8">
      {/* Top Header & Dynamic Timeframe Filter (Standalone without outer card) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
            <BarChart3 size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-0.5">
              <span>Unified Dashboard</span>
              <span className="inline-block h-1 w-1 rounded-full bg-indigo-400" />
              <span>Real-Time Intelligence</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#14142b] tracking-tight">
              Analytics & Learner Reviews
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-2xl bg-white/90 p-1.5 text-xs font-bold border border-slate-200/80 shadow-2xs">
          {(['7D', '30D', '90D', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => {
                setTimeframe(tf);
                setHoverIdx(null);
              }}
              className={`rounded-xl px-4 py-1.5 transition-all duration-200 cursor-pointer ${timeframe === tf
                  ? 'bg-indigo-600 text-white shadow-2xs font-extrabold scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Banner with Party Poppers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-white to-indigo-50/50 p-4 border border-emerald-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white font-black shadow-xs">
            <TrendingUp size={18} />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-extrabold text-[#14142b]">
              {activeData.summaryHeadline}
            </p>
            <motion.span
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.25, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              className="text-base select-none cursor-pointer"
              onClick={triggerPoppers}
              title="Pop Party Confetti!"
            >
              🎉
            </motion.span>
          </div>
        </div>
      </div>

      {/* Analytics Chart & Category Breakdown Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-stretch">
        {/* Enrollment Trend Chart (Bare Content) */}
        <div className="lg:col-span-2 space-y-3 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                Enrollment Trend • {activeData.timeframeLabel}
              </h3>
            </div>

            <div className="relative h-56 w-full pt-1">
              <svg
                className="h-full w-full overflow-visible"
                viewBox="0 0 540 170"
                onMouseLeave={() => setHoverIdx(null)}
              >
                <defs>
                  <linearGradient id="ytStudioGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="30" x2="540" y2="30" stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="0" y1="75" x2="540" y2="75" stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="0" y1="120" x2="540" y2="120" stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" />
                <path
                  fill="url(#ytStudioGrad)"
                  d={svgChart.smoothArea}
                  className="transition-all duration-300 ease-out"
                />
                <path
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={svgChart.smoothLine}
                  className="transition-all duration-300 ease-out"
                />
                {svgChart.coords.map((c, i) => (
                  <g key={i} className="cursor-pointer" onMouseEnter={() => setHoverIdx(i)}>
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r={hoverIdx === i ? '6' : '4'}
                      fill={hoverIdx === i ? '#059669' : '#10b981'}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="transition-all duration-200"
                    />
                    {hoverIdx === i && (
                      <line
                        x1={c.x}
                        y1="0"
                        x2={c.x}
                        y2={svgChart.chartBottom}
                        stroke="#10b981"
                        strokeDasharray="3 3"
                        strokeWidth="1.5"
                      />
                    )}
                  </g>
                ))}

                {/* X-Axis Date Labels */}
                {activeData.labels.map((lbl, i) => {
                  const cx = (i / (activeData.labels.length - 1)) * 540;
                  const textAnchor =
                    i === 0 ? 'start' : i === activeData.labels.length - 1 ? 'end' : 'middle';
                  return (
                    <text
                      key={lbl}
                      x={cx}
                      y="158"
                      textAnchor={textAnchor}
                      className="text-[11px] font-bold fill-slate-400 select-none font-sans"
                    >
                      {lbl}
                    </text>
                  );
                })}
              </svg>

              {hoverIdx !== null && svgChart.coords[hoverIdx] && (
                <div
                  className="absolute z-30 pointer-events-none bg-[#14142b]/95 border border-slate-700/60 text-white px-3 py-2 rounded-xl text-xs shadow-xl backdrop-blur-md whitespace-nowrap transition-all duration-150"
                  style={{
                    left: `${(svgChart.coords[hoverIdx].x / 540) * 100}%`,
                    top: `${(svgChart.coords[hoverIdx].y / 170) * 100}%`,
                    transform:
                      hoverIdx === 0
                        ? 'translate(0%, -125%)'
                        : hoverIdx === svgChart.coords.length - 1
                          ? 'translate(-100%, -125%)'
                          : 'translate(-50%, -125%)',
                  }}
                >
                  <span className="font-extrabold text-emerald-400 block">
                    {svgChart.coords[hoverIdx].pt.toLocaleString()} enrollments
                  </span>
                  <span className="text-[10px] text-slate-300 font-semibold block mt-0.5">
                    {activeData.labels[hoverIdx]}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Breakdown (Bare Content with Vertical Divider Separation) */}
        <div className="space-y-4 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200/80 pt-6 lg:pt-0 pl-0 lg:pl-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Category Breakdown</h3>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">
                  {categoryPage + 1}/{totalCategoryPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCategoryPage((p) => Math.max(0, p - 1))}
                  disabled={categoryPage === 0}
                  className="grid h-6 w-6 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                  title="Previous Category Page"
                >
                  <ChevronLeft size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryPage((p) => Math.min(totalCategoryPages - 1, p + 1))}
                  disabled={categoryPage === totalCategoryPages - 1}
                  className="grid h-6 w-6 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                  title="Next Category Page"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            <div className="space-y-3.5 pt-3">
              {currentCategories.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">{cat.name}</span>
                    <span className="text-slate-900 font-extrabold">{cat.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/60">
                    <div
                      className={`h-full rounded-full ${cat.color} transition-all duration-300`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Learner Feedback Analytics Section - Production-Grade SaaS UI */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-stretch">
        {/* Rating Overview Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:border-slate-300">
          <div>
            {/* Header Row */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Star size={16} className="text-sky-500 fill-sky-500" />
                <span>Rating Overview</span>
              </h3>
            </div>

            {/* Content Body: Two-Column Internal Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 pt-5 items-center">
              {/* Left Column: Primary Rating Metric */}
              <div className="sm:col-span-4 flex flex-col items-start pr-0 sm:pr-2">
                <span className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
                  4.92
                </span>
                <div className="flex items-center gap-1 text-sky-500 my-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-sky-500 text-sky-500" />
                  ))}
                </div>
                <span className="text-xs font-medium text-slate-500">
                  3,972 ratings
                </span>
              </div>

              {/* Right Column: 5-Star through 1-Star Progress Bars */}
              <div className="sm:col-span-8 space-y-2">
                {ratingDistribution.map((dist) => (
                  <div key={dist.stars} className="flex items-center gap-2 text-xs">
                    <div className="w-6 flex items-center gap-0.5 text-slate-600 font-semibold shrink-0">
                      <span>{dist.stars}</span>
                      <Star size={10} className="fill-sky-500 text-sky-500" />
                    </div>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-sky-500 transition-all duration-500"
                        style={{ width: `${dist.percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs font-medium text-slate-400 tabular-nums shrink-0">
                      {dist.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Most Mentioned Topics Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:border-slate-300">
          <div>
            {/* Header Row */}
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag size={16} className="text-indigo-600" />
                <span>Most Mentioned Topics</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Frequently cited keywords across recent learner feedback
              </p>
            </div>

            {/* Keyword Tag Collection */}
            <div className="pt-5">
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center rounded-lg border border-sky-200/70 bg-sky-50/60 px-3 py-1.5 text-xs font-medium text-sky-700 transition-colors hover:bg-sky-100/80 hover:border-sky-300"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learner Reviews Feed Section (Bare Content Header + Review Cards) */}
      <div className="space-y-5 pt-2">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-[#14142b] flex items-center gap-2">
              <MessageSquare size={18} className="text-indigo-600" />
              Recent Learner Reviews & Engagement
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Read feedback, track sentiments, and post instructor responses directly
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">
              Page {feedbackPage + 1} of {totalFeedbackPages}
            </span>
            <button
              type="button"
              onClick={() => setFeedbackPage((p) => Math.max(0, p - 1))}
              disabled={feedbackPage === 0}
              className="grid h-7 w-7 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-colors cursor-pointer"
              title="Previous Feedback Page"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => setFeedbackPage((p) => Math.min(totalFeedbackPages - 1, p + 1))}
              disabled={feedbackPage === totalFeedbackPages - 1}
              className="grid h-7 w-7 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-colors cursor-pointer"
              title="Next Feedback Page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentReviews.map((rev, idx) => {
            const isWide = (rev as any).cardSize === 'wide';
            const themes = [
              'border border-indigo-200/90 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 shadow-[-5px_5px_0px_rgba(99,102,241,0.25)] hover:shadow-[-7px_7px_0px_rgba(79,70,229,0.35)]',
              'border border-purple-200/90 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30 shadow-[-5px_5px_0px_rgba(139,92,246,0.25)] hover:shadow-[-7px_7px_0px_rgba(124,58,237,0.35)]',
              'border border-blue-200/90 bg-gradient-to-br from-blue-50/50 via-white to-sky-50/30 shadow-[-5px_5px_0px_rgba(59,130,246,0.25)] hover:shadow-[-7px_7px_0px_rgba(37,99,235,0.35)]',
              'border border-emerald-200/90 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 shadow-[-5px_5px_0px_rgba(16,185,129,0.25)] hover:shadow-[-7px_7px_0px_rgba(5,150,105,0.35)]',
            ];
            const cardStyle = themes[idx % themes.length];

            return (
              <div
                key={rev.id}
                className={`rounded-[2.25rem] rounded-tl-xs rounded-br-xs transition-all duration-200 flex flex-col justify-between p-5 cursor-pointer ${cardStyle} ${isWide ? 'md:col-span-2' : ''
                  }`}
              >
                <div className="space-y-2.5">
                  {/* Top Row: Learner Info & Rating */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={rev.learnerAvatar}
                        alt={rev.learnerName}
                        className="h-8 w-8 rounded-full object-cover shrink-0 ring-2 ring-white shadow-2xs"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-black text-[#14142b] truncate block">{rev.learnerName}</span>
                        <span className="text-[10px] text-slate-500 font-semibold block truncate">{rev.courseName}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={11} className="fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[9.5px] font-extrabold text-slate-400 mt-0.5">{rev.date}</span>
                    </div>
                  </div>

                  {/* Review Quote Body */}
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed bg-white/70 p-3 rounded-2xl border border-slate-100">
                    "{rev.reviewText}"
                  </p>
                </div>

                {/* Reply or Response Trigger */}
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  {rev.instructorResponse ? (
                    <div className="flex items-start gap-2 text-xs text-slate-800 bg-indigo-50/70 p-2.5 rounded-2xl border border-indigo-100/80">
                      <CornerDownRight size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-[10px] font-black text-indigo-900 block">Instructor Response</span>
                        <p className="text-[11px] font-semibold text-slate-700 leading-snug">{rev.instructorResponse}</p>
                      </div>
                    </div>
                  ) : activeReplyId === rev.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Write a response..."
                        value={replyText[rev.id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [rev.id]: e.target.value })}
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendResponse(rev.id)}
                        className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-black text-white hover:bg-indigo-700 transition-colors"
                      >
                        Post
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveReplyId(rev.id)}
                      className="text-[11px] font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                    >
                      <MessageSquare size={12} /> Respond to Learner
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

