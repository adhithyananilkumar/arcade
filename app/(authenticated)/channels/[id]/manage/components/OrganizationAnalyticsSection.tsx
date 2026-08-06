'use client';

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Award,
  CheckCircle2,
  PieChart,
  Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function OrganizationAnalyticsSection() {
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');

  const monthlyEnrollments = [
    { month: 'Jan', count: 4200 },
    { month: 'Feb', count: 5800 },
    { month: 'Mar', count: 7400 },
    { month: 'Apr', count: 9100 },
    { month: 'May', count: 11200 },
    { month: 'Jun', count: 14800 },
  ];

  const categoryBreakdown = [
    { name: 'AI Engineering', percentage: 42, color: 'bg-indigo-600' },
    { name: 'GenAI & LLMs', percentage: 28, color: 'bg-purple-600' },
    { name: 'Deep Learning', percentage: 18, color: 'bg-emerald-500' },
    { name: 'Software Architecture', percentage: 12, color: 'bg-amber-500' },
  ];

  const radialMetrics = [
    { label: 'Course Completion', val: 84.6, color: '#10B981' },
    { label: 'Webinar Attendance', val: 90.5, color: '#6366F1' },
    { label: 'Article Engagement', val: 78.2, color: '#8B5CF6' },
    { label: 'Bootcamp Retention', val: 94.2, color: '#EC4899' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#14142b]">
            Organization Analytics & Metrics Dashboard
          </h2>
          <p className="text-xs font-semibold text-slate-500">
            Comprehensive breakdown of enrollments, revenue, completion rates, and content engagement
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold">
          {(['7D', '30D', '90D', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`rounded-xl px-3 py-1.5 transition-all ${
                timeframe === tf
                  ? 'bg-white text-indigo-600 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Enrollment Line/Area Chart & Category Donut */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Enrollments Over Time SVG Line Chart */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#14142b]">Course Enrollments Over Time</h3>
              <p className="text-xs text-slate-500">Total active enrollments (+18.4% growth)</p>
            </div>
            <span className="text-xl font-black text-indigo-600">42,890 Total</span>
          </div>

          {/* SVG Area Chart */}
          <div className="relative h-56 w-full pt-4">
            <svg className="h-full w-full overflow-visible" viewBox="0 0 500 180">
              <defs>
                <linearGradient id="gradientEnroll" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area Fill */}
              <polygon
                fill="url(#gradientEnroll)"
                points="0,150 0,130 100,100 200,80 300,55 400,35 500,15 500,150"
              />

              {/* Stroke Line */}
              <polyline
                fill="none"
                stroke="#6366F1"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,130 100,100 200,80 300,55 400,35 500,15"
              />

              {/* Dots */}
              {[
                { x: 0, y: 130 },
                { x: 100, y: 100 },
                { x: 200, y: 80 },
                { x: 300, y: 55 },
                { x: 400, y: 35 },
                { x: 500, y: 15 },
              ].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="5" fill="#6366F1" stroke="#FFFFFF" strokeWidth="2" />
              ))}
            </svg>

            {/* X-Axis Month Labels */}
            <div className="mt-2 flex justify-between text-xs font-bold text-slate-400">
              {monthlyEnrollments.map((m) => (
                <span key={m.month}>{m.month}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Donut Chart: Top Performing Categories */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-[#14142b] flex items-center gap-2">
              <PieChart size={18} className="text-indigo-600" />
              Top Categories
            </h3>
            <p className="text-xs text-slate-500">Distribution by active learner hours</p>
          </div>

          <div className="space-y-3">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">{cat.name}</span>
                  <span className="text-slate-900 font-extrabold">{cat.percentage}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${cat.color}`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-indigo-50/70 p-3.5 text-center text-xs font-bold text-indigo-700">
            AI Engineering is the fastest growing segment (+34% MoM)
          </div>
        </div>
      </div>

      {/* Radial Progress Rings Grid */}
      <div>
        <h3 className="text-sm font-extrabold text-[#14142b] mb-3">Radial Performance Indicators</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {radialMetrics.map((rm) => (
            <div
              key={rm.label}
              className="flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs"
            >
              {/* SVG Radial Ring */}
              <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
                <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    strokeWidth="3.5"
                    strokeDasharray={`${rm.val}, 100`}
                    strokeLinecap="round"
                    stroke={rm.color}
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-black text-[#14142b]">{rm.val}%</span>
              </div>

              <div>
                <p className="text-xs font-extrabold text-slate-800">{rm.label}</p>
                <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">Top tier benchmarking</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
