'use client';

import { useState, useMemo } from 'react';
import {
  Video,
  Calendar,
  Clock,
  Users,
  Star,
  Play,
  Settings,
  Edit3,
  BarChart3,
  Film,
  Plus,
  Radio,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export interface WebinarItem {
  id: string;
  title: string;
  banner: string;
  speaker: string;
  speakerAvatar: string;
  date: string;
  time: string;
  duration: string;
  registrations: number;
  attendanceRate: number;
  rating: number;
  feedbackScore: number;
  status: 'LIVE' | 'UPCOMING' | 'COMPLETED';
}

const mockWebinars: WebinarItem[] = [
  {
    id: 'web-1',
    title: 'Future of Autonomous AI Agents & Real-World Deployments',
    banner: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=600&q=80',
    speaker: 'Dr. Sarah Chen',
    speakerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    date: 'Aug 10, 2026',
    time: '6:00 PM EST',
    duration: '90 mins',
    registrations: 1420,
    attendanceRate: 88.5,
    rating: 4.94,
    feedbackScore: 96,
    status: 'LIVE',
  },
  {
    id: 'web-2',
    title: 'Building Enterprise Search with Hybrid Vector & Sparse Retrieval',
    banner: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
    speaker: 'Alex Rivera',
    speakerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    date: 'Aug 18, 2026',
    time: '4:00 PM EST',
    duration: '60 mins',
    registrations: 890,
    attendanceRate: 0,
    rating: 0,
    feedbackScore: 0,
    status: 'UPCOMING',
  },
  {
    id: 'web-3',
    title: 'LLM Benchmarking & Evaluation Frameworks Masterclass',
    banner: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80',
    speaker: 'Prof. Michael Vance',
    speakerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    date: 'Jul 24, 2026',
    time: '5:00 PM EST',
    duration: '75 mins',
    registrations: 2100,
    attendanceRate: 92.4,
    rating: 4.98,
    feedbackScore: 98,
    status: 'COMPLETED',
  },
];

export function WebinarManagementSection() {
  const [webinars] = useState<WebinarItem[]>(mockWebinars);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST' | 'TRENDS'>('UPCOMING');

  const filteredWebinars = useMemo(() => {
    if (activeTab === 'UPCOMING') {
      return webinars.filter((w) => w.status === 'UPCOMING' || w.status === 'LIVE');
    }
    if (activeTab === 'PAST') {
      return webinars.filter((w) => w.status === 'COMPLETED');
    }
    return webinars;
  }, [webinars, activeTab]);

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tab Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#14142b]">
            Webinars & Live Streams
          </h2>
          <p className="text-xs font-semibold text-slate-500">
            Host live interactive workshops, Q&A panels, and keynote presentations
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub-tabs */}
          <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50/80 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('UPCOMING')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition-all ${
                activeTab === 'UPCOMING'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Upcoming ({webinars.filter((w) => w.status !== 'COMPLETED').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PAST')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition-all ${
                activeTab === 'PAST'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Past ({webinars.filter((w) => w.status === 'COMPLETED').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('TRENDS')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition-all ${
                activeTab === 'TRENDS'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Trends
            </button>
          </div>

          <button
            type="button"
            onClick={() => toast.info('Opening Webinar Scheduler...')}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            <Plus size={15} />
            <span>Schedule Webinar</span>
          </button>
        </div>
      </div>

      {activeTab === 'TRENDS' ? (
        /* Attendance Trends & Performance Widget */
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#14142b]">Webinar Attendance & Engagement Trends</h3>
              <p className="text-xs text-slate-500">Average attendance rate: 90.45% (Highest on Saturdays at 6 PM)</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
              <TrendingUp size={14} /> +14.2% Attendance Growth
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400 font-bold uppercase">Total Registrations</p>
              <p className="text-2xl font-black text-[#14142b] mt-1">4,410</p>
              <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">+24% vs last quarter</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400 font-bold uppercase">Avg Attendee Stay</p>
              <p className="text-2xl font-black text-[#14142b] mt-1">54 mins</p>
              <p className="text-[11px] font-semibold text-indigo-600 mt-0.5">82% retention rate</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400 font-bold uppercase">Average Rating</p>
              <p className="text-2xl font-black text-amber-500 mt-1 flex items-center justify-center gap-1">
                <Star size={20} className="fill-amber-400 text-amber-400" /> 4.96 / 5.0
              </p>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Based on 1.2k responses</p>
            </div>
          </div>
        </div>
      ) : (
        /* Webinar Cards Grid */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredWebinars.map((webinar) => (
            <motion.div
              key={webinar.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(20,20,43,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Banner Header */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={webinar.banner}
                  alt={webinar.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  {webinar.status === 'LIVE' ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1 text-[11px] font-black text-white shadow-md animate-pulse">
                      <Radio size={13} /> LIVE NOW
                    </span>
                  ) : webinar.status === 'UPCOMING' ? (
                    <span className="rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white shadow-md">
                      UPCOMING
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-bold text-white">
                      RECORDED
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-white">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {webinar.date} · {webinar.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {webinar.duration}
                  </span>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-extrabold text-[#14142b] line-clamp-2 leading-snug">
                    {webinar.title}
                  </h3>

                  <div className="mt-3 flex items-center gap-2">
                    <img
                      src={webinar.speakerAvatar}
                      alt={webinar.speaker}
                      className="h-6 w-6 rounded-full object-cover border border-slate-200"
                    />
                    <span className="text-xs font-bold text-slate-700">Speaker: {webinar.speaker}</span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-100 py-3 text-center text-xs font-semibold">
                  <div>
                    <p className="text-[10px] uppercase text-slate-400">Registrations</p>
                    <p className="font-extrabold text-slate-900">{webinar.registrations.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400">Attendance</p>
                    <p className="font-extrabold text-emerald-600">
                      {webinar.status === 'UPCOMING' ? 'N/A' : `${webinar.attendanceRate}%`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400">Feedback</p>
                    <p className="font-extrabold text-amber-500">
                      {webinar.status === 'UPCOMING' ? 'N/A' : `${webinar.feedbackScore}/100`}
                    </p>
                  </div>
                </div>

                {/* Buttons Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  {webinar.status === 'LIVE' ? (
                    <button
                      type="button"
                      onClick={() => toast.success('Joining Live Broadcast Studio...')}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-black text-white shadow-md hover:bg-rose-700 transition-all w-full justify-center"
                    >
                      <Radio size={14} className="animate-spin" />
                      <span>Start Broadcast</span>
                    </button>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => toast.info(`Managing ${webinar.title}`)}
                          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50"
                          title="Settings"
                        >
                          <Settings size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.info(`Viewing Analytics for ${webinar.title}`)}
                          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50"
                          title="Analytics"
                        >
                          <BarChart3 size={14} />
                        </button>
                        {webinar.status === 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => toast.info(`Playing recording for ${webinar.title}`)}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-indigo-600 hover:bg-indigo-50"
                            title="Recordings"
                          >
                            <Film size={14} />
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => toast.info(`Editing ${webinar.title}`)}
                        className="rounded-xl bg-[#14142b] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-900"
                      >
                        Edit Webinar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
