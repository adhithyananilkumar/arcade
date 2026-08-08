'use client';

import { useState, useMemo } from 'react';
import {
  Calendar,
  Video,
  Rocket,
  Users,
  Clock,
  Star,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  PlayCircle,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export interface ChannelEvent {
  id: string;
  title: string;
  type: 'WEBINAR' | 'WORKSHOP';
  thumbnail: string;
  speaker: string;
  speakerRole: string;
  dateTime: string;
  duration: string;
  registeredCount: number;
  maxAttendees?: number;
  status: 'UPCOMING' | 'LIVE' | 'RECORDED' | 'COMPLETED';
  recordingUrl?: string;
  tags: string[];
}

const mockEvents: ChannelEvent[] = [
  {
    id: 'evt-1',
    title: 'Future of Autonomous AI Agents & Real-World Deployments',
    type: 'WEBINAR',
    thumbnail: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=600&q=80',
    speaker: 'Dr. Sarah Chen',
    speakerRole: 'Lead AI Scientist',
    dateTime: 'Tomorrow at 4:00 PM EST',
    duration: '90 mins',
    registeredCount: 1420,
    status: 'UPCOMING',
    tags: ['AI Agents', 'LLMs', 'Keynote'],
  },
  {
    id: 'evt-2',
    title: 'Hands-on RAG Pipeline & Vector DB Optimization Workshop',
    type: 'WORKSHOP',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    speaker: 'Alex Rivera',
    speakerRole: 'Senior Prompt Engineer',
    dateTime: 'Aug 12, 2026 at 2:00 PM EST',
    duration: '3 hours',
    registeredCount: 240,
    maxAttendees: 300,
    status: 'UPCOMING',
    tags: ['Hands-on', 'Vector Search', 'Live Lab'],
  },
  {
    id: 'evt-3',
    title: 'Fine-Tuning Llama 3 & Open Source Models Masterclass',
    type: 'WORKSHOP',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
    speaker: 'Elena Rostova',
    speakerRole: 'MLOps Lead Instructor',
    dateTime: 'Jul 28, 2026',
    duration: '2h 30m',
    registeredCount: 890,
    status: 'RECORDED',
    recordingUrl: 'https://arcade.ai/recordings/llama-fine-tune',
    tags: ['Model Tuning', 'PyTorch', 'GPU Clusters'],
  },
  {
    id: 'evt-4',
    title: 'Enterprise AI Governance, Safety & Guardrails Live Q&A',
    type: 'WEBINAR',
    thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
    speaker: 'Prof. Michael Vance',
    speakerRole: 'Head of Curriculum',
    dateTime: 'Jul 15, 2026',
    duration: '60 mins',
    registeredCount: 2100,
    status: 'RECORDED',
    recordingUrl: 'https://arcade.ai/recordings/ai-safety-qa',
    tags: ['AI Ethics', 'Compliance', 'Security'],
  },
];

interface EventsManagementSectionProps {
  onScheduleEvent?: () => void;
}

export function EventsManagementSection({ onScheduleEvent }: EventsManagementSectionProps) {
  const [events, setEvents] = useState<ChannelEvent[]>(mockEvents);
  const [activeSubTab, setActiveSubTab] = useState<'ALL' | 'WEBINARS' | 'WORKSHOPS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesType =
        activeSubTab === 'ALL'
          ? true
          : activeSubTab === 'WEBINARS'
          ? evt.type === 'WEBINAR'
          : evt.type === 'WORKSHOP';
      const matchesSearch =
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.speaker.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [events, activeSubTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tabs Row */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 shadow-2xs">
              <Calendar size={18} />
            </div>
            <h2 className="text-base font-black tracking-tight text-[#14142b]">
              Events & Live Sessions (Webinars & Workshops)
            </h2>
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Host live webinars, hands-on interactive workshops, and access past event recordings
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onScheduleEvent || (() => toast.info('Opening Event Scheduler...'))}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-[0.98] shrink-0"
        >
          <Plus size={15} />
          <span>Schedule New Event</span>
        </button>
      </div>

      {/* Control Bar: Sub-Tabs & Search */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Sub-Tab Filter Pills */}
        <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1 text-xs font-extrabold">
          <button
            type="button"
            onClick={() => setActiveSubTab('ALL')}
            className={`rounded-xl px-4 py-1.5 transition-all ${
              activeSubTab === 'ALL' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('WEBINARS')}
            className={`rounded-xl px-4 py-1.5 transition-all ${
              activeSubTab === 'WEBINARS' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'
            }`}
          >
            Webinars ({events.filter((e) => e.type === 'WEBINAR').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('WORKSHOPS')}
            className={`rounded-xl px-4 py-1.5 transition-all ${
              activeSubTab === 'WORKSHOPS' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'
            }`}
          >
            Workshops ({events.filter((e) => e.type === 'WORKSHOP').length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search webinars & workshops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
        {filteredEvents.map((evt) => {
          const isWebinar = evt.type === 'WEBINAR';
          return (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(20,20,43,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail Header */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                  <img
                    src={evt.thumbnail}
                    alt={evt.title}
                    className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Type Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-black text-white shadow-md backdrop-blur-md ${
                        isWebinar ? 'bg-indigo-600' : 'bg-purple-600'
                      }`}
                    >
                      {isWebinar ? <Video size={13} /> : <Rocket size={13} />}
                      <span>{evt.type}</span>
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                        evt.status === 'UPCOMING'
                          ? 'bg-amber-500 text-white'
                          : evt.status === 'LIVE'
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] font-extrabold text-indigo-600">
                    <Clock size={13} />
                    <span>{evt.dateTime}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 font-semibold">{evt.duration}</span>
                  </div>

                  <h3 className="text-sm font-extrabold text-[#14142b] leading-snug line-clamp-2">
                    {evt.title}
                  </h3>

                  <div className="flex items-center justify-between border-t border-b border-slate-100 py-3 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs">
                        {evt.speaker.charAt(0)}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900">{evt.speaker}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{evt.speakerRole}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] uppercase text-slate-400 font-bold">Attendees</p>
                      <p className="font-extrabold text-indigo-600">
                        {evt.registeredCount.toLocaleString()} {evt.maxAttendees ? `/ ${evt.maxAttendees}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {evt.tags.map((tag) => (
                    <span key={tag} className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    evt.recordingUrl
                      ? window.open(evt.recordingUrl, '_blank')
                      : toast.success(`Registered for ${evt.title}`)
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#14142b] px-3.5 py-1.5 text-xs font-extrabold text-white hover:bg-indigo-900 transition-colors"
                >
                  {evt.recordingUrl ? (
                    <>
                      <PlayCircle size={13} /> Watch Recording
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={13} /> Manage Event
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
