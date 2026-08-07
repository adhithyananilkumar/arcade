'use client';

import { useState, useMemo } from 'react';
import {
  BookOpen,
  UserPlus,
  Video,
  Rocket,
  Star,
  FileText,
  Award,
  Edit3,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';

export interface ActivityFeedItem {
  id: string;
  type: 'COURSE' | 'STAFF' | 'WEBINAR' | 'BOOTCAMP' | 'REVIEW' | 'ARTICLE' | 'CERTIFICATE' | 'UPDATE';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  userAvatar?: string;
}

const mockActivities: ActivityFeedItem[] = [
  {
    id: 'act-1',
    type: 'COURSE',
    title: 'New Course Published',
    description: '"AI Agent Architecture & Tool Use Masterclass" was published by Dr. Sarah Chen.',
    timestamp: '10 mins ago',
    user: 'Dr. Sarah Chen',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'act-2',
    type: 'STAFF',
    title: 'New Staff Member Joined',
    description: 'Elena Rostova accepted invitation to join as MLOps Lead Instructor.',
    timestamp: '1 hour ago',
    user: 'Elena Rostova',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'act-3',
    type: 'WEBINAR',
    title: 'Webinar Completed',
    description: '"Future of Autonomous AI Agents" completed with 1,420 live attendees (96% feedback score).',
    timestamp: '3 hours ago',
    user: 'Dr. Sarah Chen',
  },
  {
    id: 'act-4',
    type: 'BOOTCAMP',
    title: 'Bootcamp Cohort Started',
    description: '"Full-Stack AI Engineer Cohort 8" commenced with 240 active students.',
    timestamp: '5 hours ago',
    user: 'Prof. Michael Vance',
  },
  {
    id: 'act-5',
    type: 'REVIEW',
    title: 'New 5-Star Review Received',
    description: 'Marcus Vance left a 5-star review: "Single best enterprise AI course I have taken!"',
    timestamp: '6 hours ago',
    user: 'Marcus Vance',
  },
  {
    id: 'act-6',
    type: 'ARTICLE',
    title: 'Article Published',
    description: '"Architecting Scalable RAG Systems with Vector Databases" published in Publications.',
    timestamp: '1 day ago',
    user: 'Dr. Sarah Chen',
  },
  {
    id: 'act-7',
    type: 'CERTIFICATE',
    title: 'Certificates Generated',
    description: '150 accredited completion certificates generated for Machine Learning Fundamentals.',
    timestamp: '1 day ago',
    user: 'Arcade System',
  },
  {
    id: 'act-8',
    type: 'UPDATE',
    title: 'Content Module Updated',
    description: 'Updated Module 4 lab exercises in "Neural Networks from Scratch".',
    timestamp: '2 days ago',
    user: 'Prof. Michael Vance',
  },
];

const iconMap = {
  COURSE: {
    icon: BookOpen,
    badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-200/80',
    borderBg: 'bg-indigo-200/60 shadow-[0_4px_16px_rgba(99,102,241,0.05)]',
    triangleBorder: 'border-r-indigo-200/60',
  },
  STAFF: {
    icon: UserPlus,
    badgeColor: 'text-purple-600 bg-purple-50 border-purple-200/80',
    borderBg: 'bg-purple-200/60 shadow-[0_4px_16px_rgba(168,85,247,0.05)]',
    triangleBorder: 'border-r-purple-200/60',
  },
  WEBINAR: {
    icon: Video,
    badgeColor: 'text-sky-600 bg-sky-50 border-sky-200/80',
    borderBg: 'bg-sky-200/60 shadow-[0_4px_16px_rgba(14,165,233,0.05)]',
    triangleBorder: 'border-r-sky-200/60',
  },
  BOOTCAMP: {
    icon: Rocket,
    badgeColor: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200/80',
    borderBg: 'bg-fuchsia-200/60 shadow-[0_4px_16px_rgba(217,70,239,0.05)]',
    triangleBorder: 'border-r-fuchsia-200/60',
  },
  REVIEW: {
    icon: Star,
    badgeColor: 'text-amber-600 bg-amber-50 border-amber-200/80',
    borderBg: 'bg-amber-200/60 shadow-[0_4px_16px_rgba(245,158,11,0.05)]',
    triangleBorder: 'border-r-amber-200/60',
  },
  ARTICLE: {
    icon: FileText,
    badgeColor: 'text-emerald-600 bg-emerald-50 border-emerald-200/80',
    borderBg: 'bg-emerald-200/60 shadow-[0_4px_16px_rgba(16,185,129,0.05)]',
    triangleBorder: 'border-r-emerald-200/60',
  },
  CERTIFICATE: {
    icon: Award,
    badgeColor: 'text-teal-600 bg-teal-50 border-teal-200/80',
    borderBg: 'bg-teal-200/60 shadow-[0_4px_16px_rgba(20,184,166,0.05)]',
    triangleBorder: 'border-r-teal-200/60',
  },
  UPDATE: {
    icon: Edit3,
    badgeColor: 'text-slate-600 bg-slate-100 border-slate-200/80',
    borderBg: 'bg-slate-200/60 shadow-[0_4px_16px_rgba(100,116,139,0.04)]',
    triangleBorder: 'border-r-slate-200/60',
  },
};

const TRIANGLE_RIGHT_CLIP = 'polygon(0% 0%, calc(100% - 24px) 0%, 100% 50%, calc(100% - 24px) 100%, 0% 100%)';

export function RecentActivityTimeline() {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredActivities = useMemo(() => {
    return filterType === 'ALL'
      ? mockActivities
      : mockActivities.filter((a) => a.type === filterType);
  }, [filterType]);

  const itemSpacing = 118;
  const startY = 20;

  // Generate SVG wavy path passing through every badge center continuously
  const wavePath = useMemo(() => {
    let path = `M 20 0 L 20 ${startY}`;
    for (let idx = 0; idx < filteredActivities.length; idx++) {
      const currY = startY + idx * itemSpacing;
      const nextY = startY + (idx + 1) * itemSpacing;
      const curveRight = idx % 2 === 0;

      const controlX1 = curveRight ? 36 : 4;
      const controlX2 = curveRight ? 4 : 36;
      const midY = (currY + nextY) / 2;

      path += ` C ${controlX1} ${currY + 30}, ${controlX2} ${midY + 15}, 20 ${nextY}`;
    }
    path += ` L 20 ${(filteredActivities.length + 0.5) * itemSpacing}`;
    return path;
  }, [filteredActivities.length]);

  return (
    <div className="space-y-6">
      {/* Header & Category Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#14142b]">
            Recent Activity Timeline
          </h2>
          <p className="text-xs font-semibold text-slate-500">
            Real-time audit log of content releases, staff actions, and learner engagements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`rounded-xl px-3 py-1.5 transition-all cursor-pointer ${
              filterType === 'ALL' ? 'bg-white text-indigo-600 shadow-2xs font-extrabold' : 'text-slate-500'
            }`}
          >
            All Activity
          </button>
          <button
            type="button"
            onClick={() => setFilterType('COURSE')}
            className={`rounded-xl px-3 py-1.5 transition-all cursor-pointer ${
              filterType === 'COURSE' ? 'bg-white text-indigo-600 shadow-2xs font-extrabold' : 'text-slate-500'
            }`}
          >
            Courses
          </button>
          <button
            type="button"
            onClick={() => setFilterType('STAFF')}
            className={`rounded-xl px-3 py-1.5 transition-all cursor-pointer ${
              filterType === 'STAFF' ? 'bg-white text-indigo-600 shadow-2xs font-extrabold' : 'text-slate-500'
            }`}
          >
            Staff
          </button>
          <button
            type="button"
            onClick={() => setFilterType('WEBINAR')}
            className={`rounded-xl px-3 py-1.5 transition-all cursor-pointer ${
              filterType === 'WEBINAR' ? 'bg-white text-indigo-600 shadow-2xs font-extrabold' : 'text-slate-500'
            }`}
          >
            Webinars
          </button>
        </div>
      </div>

      {/* Wavy Timeline Feed Container */}
      <div className="relative pl-12 space-y-6">
        {/* Continuous Vertical Wavy SVG Line */}
        <div className="absolute left-0 top-0 bottom-0 w-12 pointer-events-none overflow-visible">
          <svg className="h-full w-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="timelineWavyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="35%" stopColor="#8b5cf6" />
                <stop offset="70%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Wavy SVG Background Soft Blur Path */}
            <path
              d={wavePath}
              fill="none"
              stroke="url(#timelineWavyGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.2"
              className="blur-[3px]"
            />

            {/* Primary Wavy Dashed Path */}
            <motion.path
              d={wavePath}
              fill="none"
              stroke="url(#timelineWavyGrad)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="4 3"
              animate={{ strokeDashoffset: [0, -28] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
            />
          </svg>
        </div>

        {/* Timeline Event Feed Cards */}
        {filteredActivities.map((act, index) => {
          const config = iconMap[act.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group transition-all"
            >
              {/* Circular Node Icon Badge */}
              <span
                className={`absolute -left-[44px] top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border ring-4 ring-white shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-transform group-hover:scale-115 ${config.badgeColor}`}
              >
                <Icon size={15} />
              </span>

              {/* Light Bordered Left Pointer Triangle */}
              <div className={`absolute -left-[10px] top-[13px] z-15 h-0 w-0 border-y-[7px] border-y-transparent border-r-[10px] ${config.triangleBorder}`} />
              <div className="absolute -left-[8px] top-[14px] z-20 h-0 w-0 border-y-[6px] border-y-transparent border-r-[9px] border-r-white" />

              {/* Polygon Border Wrapper with Lightened Border Color */}
              <div
                className={`relative rounded-2xl rounded-r-none p-[1.5px] transition-all hover:shadow-md ${config.borderBg}`}
                style={{ clipPath: TRIANGLE_RIGHT_CLIP }}
              >
                {/* Pure White Inner Card Content */}
                <div
                  className="bg-white p-4 pr-12 rounded-[14.5px] rounded-r-none w-full h-full"
                  style={{ clipPath: TRIANGLE_RIGHT_CLIP }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-black text-[#14142b]">{act.title}</h4>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                      <Clock size={12} />
                      {act.timestamp}
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-semibold text-slate-600 leading-relaxed">
                    {act.description}
                  </p>

                  <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-500">
                    {act.userAvatar && (
                      <img
                        src={act.userAvatar}
                        alt={act.user}
                        className="h-4 w-4 rounded-full object-cover"
                      />
                    )}
                    <span>
                      Action by: <span className="text-[#14142b] font-black">{act.user}</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
