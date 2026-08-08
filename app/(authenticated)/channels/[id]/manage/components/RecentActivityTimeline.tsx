'use client';

import { useState } from 'react';
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
  CheckCircle2,
  Filter,
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
  COURSE: { icon: BookOpen, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  STAFF: { icon: UserPlus, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  WEBINAR: { icon: Video, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  BOOTCAMP: { icon: Rocket, color: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200' },
  REVIEW: { icon: Star, color: 'text-amber-500 bg-amber-50 border-amber-200' },
  ARTICLE: { icon: FileText, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  CERTIFICATE: { icon: Award, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  UPDATE: { icon: Edit3, color: 'text-slate-600 bg-slate-100 border-slate-200' },
};

export function RecentActivityTimeline() {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredActivities = filterType === 'ALL'
    ? mockActivities
    : mockActivities.filter((a) => a.type === filterType);

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
            className={`rounded-xl px-3 py-1.5 transition-all ${
              filterType === 'ALL' ? 'bg-white text-indigo-600 shadow-2xs font-extrabold' : 'text-slate-500'
            }`}
          >
            All Activity
          </button>
          <button
            type="button"
            onClick={() => setFilterType('COURSE')}
            className={`rounded-xl px-3 py-1.5 transition-all ${
              filterType === 'COURSE' ? 'bg-white text-indigo-600 shadow-2xs font-extrabold' : 'text-slate-500'
            }`}
          >
            Courses
          </button>
          <button
            type="button"
            onClick={() => setFilterType('STAFF')}
            className={`rounded-xl px-3 py-1.5 transition-all ${
              filterType === 'STAFF' ? 'bg-white text-indigo-600 shadow-2xs font-extrabold' : 'text-slate-500'
            }`}
          >
            Staff
          </button>
          <button
            type="button"
            onClick={() => setFilterType('WEBINAR')}
            className={`rounded-xl px-3 py-1.5 transition-all ${
              filterType === 'WEBINAR' ? 'bg-white text-indigo-600 shadow-2xs font-extrabold' : 'text-slate-500'
            }`}
          >
            Webinars
          </button>
        </div>
      </div>

      {/* Timeline Feed */}
      <div className="relative border-l-2 border-slate-200/80 ml-4 pl-6 space-y-6">
        {filteredActivities.map((act) => {
          const config = iconMap[act.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative group"
            >
              {/* Timeline Bullet Icon */}
              <span className={`absolute -left-[37px] top-0 flex h-8 w-8 items-center justify-center rounded-full border shadow-2xs transition-transform group-hover:scale-110 ${config.color}`}>
                <Icon size={14} />
              </span>

              {/* Feed Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-black text-[#14142b]">{act.title}</h4>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                    <Clock size={12} />
                    {act.timestamp}
                  </span>
                </div>

                <p className="mt-1 text-xs font-medium text-slate-600">{act.description}</p>

                <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-500">
                  {act.userAvatar && (
                    <img
                      src={act.userAvatar}
                      alt={act.user}
                      className="h-4 w-4 rounded-full object-cover"
                    />
                  )}
                  <span>Action by: <span className="text-slate-800 font-extrabold">{act.user}</span></span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
