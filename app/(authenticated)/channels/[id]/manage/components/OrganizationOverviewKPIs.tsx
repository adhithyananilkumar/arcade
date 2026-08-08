'use client';

import {
  BookOpen,
  FileText,
  Video,
  Rocket,
  Users,
  GraduationCap,
  Award,
  Star,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface KPIItem {
  id: string;
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  comparison: string;
  icon: typeof BookOpen;
  sparkline: number[];
  color: 'indigo' | 'purple' | 'emerald' | 'amber' | 'rose' | 'sky' | 'teal' | 'fuchsia';
}

interface OrganizationOverviewKPIsProps {
  courseCount?: number;
  staffCount?: number;
}

export function OrganizationOverviewKPIs({
  courseCount = 48,
  staffCount = 34,
}: OrganizationOverviewKPIsProps) {
  const kpiData: KPIItem[] = [
    {
      id: 'courses',
      label: 'Total Courses',
      value: `${courseCount || 48}`,
      change: '+14.2%',
      isPositive: true,
      comparison: '+6 vs last month',
      icon: BookOpen,
      sparkline: [32, 35, 38, 40, 44, 48],
      color: 'indigo',
    },
    {
      id: 'articles',
      label: 'Published Articles',
      value: '124',
      change: '+22.5%',
      isPositive: true,
      comparison: '+18 vs last month',
      icon: FileText,
      sparkline: [80, 92, 100, 110, 118, 124],
      color: 'purple',
    },
    {
      id: 'webinars',
      label: 'Active Webinars',
      value: '12',
      change: '+8.3%',
      isPositive: true,
      comparison: '+2 scheduled',
      icon: Video,
      sparkline: [8, 9, 10, 10, 11, 12],
      color: 'sky',
    },
    {
      id: 'bootcamps',
      label: 'Bootcamps',
      value: '6',
      change: '+50.0%',
      isPositive: true,
      comparison: '+2 cohorts live',
      icon: Rocket,
      sparkline: [2, 3, 4, 4, 5, 6],
      color: 'fuchsia',
    },
    {
      id: 'staff',
      label: 'Total Staff',
      value: `${staffCount || 34}`,
      change: '+12.0%',
      isPositive: true,
      comparison: '+4 new members',
      icon: Users,
      sparkline: [26, 28, 30, 30, 32, 34],
      color: 'teal',
    },
    {
      id: 'learners',
      label: 'Active Learners',
      value: '42,890',
      change: '+18.4%',
      isPositive: true,
      comparison: '+6,640 vs last month',
      icon: GraduationCap,
      sparkline: [28000, 31000, 35000, 38000, 40000, 42890],
      color: 'emerald',
    },
    {
      id: 'certificates',
      label: 'Certificates Issued',
      value: '18,420',
      change: '+25.1%',
      isPositive: true,
      comparison: '+3,700 vs last month',
      icon: Award,
      sparkline: [11000, 13000, 14500, 16000, 17200, 18420],
      color: 'amber',
    },
    {
      id: 'rating',
      label: 'Average Rating',
      value: '4.92 / 5.0',
      change: '+0.3',
      isPositive: true,
      comparison: 'Based on 3.8k reviews',
      icon: Star,
      sparkline: [4.6, 4.7, 4.8, 4.85, 4.9, 4.92],
      color: 'amber',
    },
    {
      id: 'completion',
      label: 'Course Completion Rate',
      value: '84.6%',
      change: '+5.2%',
      isPositive: true,
      comparison: '+3.1% platform avg',
      icon: CheckCircle2,
      sparkline: [72, 75, 78, 81, 83, 84.6],
      color: 'teal',
    },
    {
      id: 'revenue',
      label: 'Monthly Revenue',
      value: '$128,450',
      change: '+31.2%',
      isPositive: true,
      comparison: '+$30.5k vs last month',
      icon: DollarSign,
      sparkline: [82000, 91000, 104000, 112000, 119000, 128450],
      color: 'emerald',
    },
  ];

  const colorStyles = {
    indigo: 'from-indigo-50/70 via-indigo-50/30 to-white text-indigo-700 border-indigo-200/70 icon-bg-indigo',
    purple: 'from-purple-50/70 via-purple-50/30 to-white text-purple-700 border-purple-200/70 icon-bg-purple',
    sky: 'from-sky-50/70 via-sky-50/30 to-white text-sky-700 border-sky-200/70 icon-bg-sky',
    fuchsia: 'from-fuchsia-50/70 via-fuchsia-50/30 to-white text-fuchsia-700 border-fuchsia-200/70 icon-bg-fuchsia',
    teal: 'from-teal-50/70 via-teal-50/30 to-white text-teal-700 border-teal-200/70 icon-bg-teal',
    emerald: 'from-emerald-50/70 via-emerald-50/30 to-white text-emerald-700 border-emerald-200/70 icon-bg-emerald',
    amber: 'from-amber-50/70 via-amber-50/30 to-white text-amber-700 border-amber-200/70 icon-bg-amber',
    rose: 'from-rose-50/70 via-rose-50/30 to-white text-rose-700 border-rose-200/70 icon-bg-rose',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#14142b]">
            Organization Key Performance Indicators
          </h2>
          <p className="text-xs font-semibold text-slate-500">
            Real-time metrics with month-over-month growth insights
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200/60">
          <span className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
          Live Analytics
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpiData.map((kpi, idx) => {
          const Icon = kpi.icon;
          const min = Math.min(...kpi.sparkline);
          const max = Math.max(...kpi.sparkline);
          const range = max - min || 1;
          const points = kpi.sparkline
            .map((val, i) => {
              const x = (i / (kpi.sparkline.length - 1)) * 100;
              const y = 30 - ((val - min) / range) * 24;
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className={`group relative overflow-hidden rounded-3xl border bg-gradient-to-br p-5 shadow-[0_6px_24px_rgba(20,20,43,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${colorStyles[kpi.color]}`}
            >
              {/* Card Header: Icon & Growth Tag */}
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-2xs border border-black/5">
                  <Icon size={20} />
                </div>
                <div
                  className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                    kpi.isPositive
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200/60'
                      : 'bg-rose-500/10 text-rose-600 border border-rose-200/60'
                  }`}
                >
                  {kpi.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span>{kpi.change}</span>
                </div>
              </div>

              {/* Metric Value & Label */}
              <div className="mt-4">
                <p className="text-2xl sm:text-3xl font-black tracking-tight text-[#14142b] tabular-nums">
                  {kpi.value}
                </p>
                <p className="mt-0.5 text-xs font-bold text-slate-600 truncate">{kpi.label}</p>
              </div>

              {/* Sparkline Chart SVG */}
              <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold text-slate-400 truncate">
                  {kpi.comparison}
                </span>
                <svg className="h-7 w-16 overflow-visible" viewBox="0 0 100 32">
                  <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                    className="opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                </svg>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
