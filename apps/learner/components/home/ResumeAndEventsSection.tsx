'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  MapPin,
  Users,
  ArrowRight,
  Play,
  BookOpen,
} from 'lucide-react';
import Lottie from 'lottie-react';
import searchingAnimation from '@/public/searching.json';

export type EventCard = {
  id: string;
  title: string;
  tagline: string;
  when: string;
  where: string;
  seats: string;
  tone: 'coral' | 'blue' | 'emerald' | 'violet';
  href: string;
  statusLabel?: string;
};

export type ResumeCourse = {
  id: string;
  title: string;
  coverImageUrl?: string | null;
  progress: number;
  authorName?: string | null;
};

function ResumeLearningCard({ course }: { course: ResumeCourse | null }) {
  if (!course) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-full min-h-[260px] flex-col overflow-hidden text-[#14142b]"
      >
        <div className="flex-1 flex flex-col justify-center items-center gap-2">
          <div className="h-[120px] w-[120px] opacity-25">
            <Lottie animationData={searchingAnimation} loop={true} />
          </div>
          <div className="text-center">
            <h3 className="text-[17px] font-bold tracking-tight mb-1">Nothing in progress</h3>
            <p className="text-[13px] font-medium text-slate-500 leading-snug">
              Pick up a course and continue your journey.
            </p>
          </div>
        </div>
        <Link
          href="/search"
          className="mt-6 mx-auto flex w-fit items-center gap-2 rounded-xl bg-[#12141C] text-white px-5 py-2.5 text-[14px] font-bold shadow-sm transition-colors hover:bg-[#232735]"
        >
          <BookOpen size={17} /> Explore courses
        </Link>
      </motion.div>
    );
  }

  const pct = Math.max(0, Math.min(100, Math.round(course.progress)));
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full min-h-[260px] flex-col overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-gradient-to-br from-[#EEF2FF] via-white to-[#F8FAFC] p-7 shadow-sm text-[#14142b]"
    >
      <div className="flex-1 flex flex-col justify-center gap-6">
        <div className="relative flex h-[85px] w-[85px] items-center justify-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90 transform">
            <circle cx="42.5" cy="42.5" r="36" fill="none" stroke="#E2E8F0" strokeWidth="8" />
            <circle 
              cx="42.5" cy="42.5" r="36" fill="none" stroke="#5C4FFF" strokeWidth="8" 
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} 
              strokeLinecap="round" className="transition-all duration-1000"
            />
          </svg>
          <span className="text-[19px] font-bold">{pct}%</span>
        </div>
        <div>
          <h3 className="text-[17px] font-bold tracking-tight mb-1.5 line-clamp-2">{course.title}</h3>
          <p className="text-[13.5px] font-medium text-slate-500 leading-snug line-clamp-1">
            {course.authorName || 'Continue where you left off'}
          </p>
        </div>
      </div>
      <Link
        href={`/learn/${course.id}/learn`}
        className="mt-8 flex w-fit items-center gap-2 rounded-xl bg-[#12141C] text-white px-5 py-2.5 text-[14px] font-bold shadow-sm transition-colors hover:bg-[#232735]"
      >
        <Play size={17} className="fill-current" /> Continue
      </Link>
    </motion.div>
  );
}

function EventRowCard({ event, index }: { event: EventCard; index: number }) {
  const parts = event.when.split(' ');
  const month = parts.length > 1 ? parts[0] : 'AUG';
  const day = parts.length > 1 ? parts[1].replace(',', '') : '08';
  const isHybrid = event.where.toLowerCase().includes('hybrid');
  const isOnline = event.where.toLowerCase().includes('online');

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col sm:flex-row items-center gap-5 rounded-[1.25rem] border border-slate-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(20,20,43,0.02)] transition-shadow hover:shadow-[0_4px_15px_rgba(20,20,43,0.04)]"
    >
      {/* Date Box */}
      <div className="flex h-[85px] w-[80px] shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-50/50 border border-emerald-100/50">
        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 mb-0.5">{month}</span>
        <span className="text-[28px] font-black tracking-tight text-[#14142b] leading-none">{day}</span>
      </div>

      {/* Info Content */}
      <div className="flex flex-1 flex-col justify-center">
        <span className="mb-2 inline-flex w-fit rounded-md bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
          {event.statusLabel || 'Registration open'}
        </span>
        <h3 className="mb-1 text-[16px] font-bold tracking-tight text-[#14142b]">{event.title}</h3>
        <p className="mb-3 text-[13px] font-medium text-slate-500 line-clamp-1">{event.tagline}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-medium text-slate-400">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={14} /> {event.when}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={14} /> {event.where}
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={14} /> {event.seats}
          </div>
        </div>
      </div>

      {/* Button & Image Area */}
      <div className="flex shrink-0 flex-col items-center justify-end gap-3 w-full sm:w-[130px] h-full pt-1">
        <div className="flex-1 w-full flex items-center justify-center">
           {/* Illustration placeholder */}
           <div className="text-[40px] opacity-30 filter grayscale drop-shadow-sm">
             {isOnline ? '💻' : isHybrid ? '☁️' : '🏙️'}
           </div>
        </div>
        <Link
          href={event.href}
          className="flex w-full items-center justify-center rounded-xl bg-[#14142b] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#5C4FFF]"
        >
          Register
        </Link>
      </div>
    </motion.article>
  );
}

export function ResumeAndEventsSection({
  resumeCourse,
  events,
}: {
  resumeCourse: ResumeCourse | null;
  events: EventCard[];
}) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-6 items-stretch">
      
      {/* Left side: Resume Learning */}
      <div className="flex h-full flex-col">
        <h2 className="mb-6 text-[19px] font-bold tracking-tight text-[#14142b]">Resume learning</h2>
        <div className="flex-1">
          <ResumeLearningCard course={resumeCourse} />
        </div>
      </div>

      {/* Right side: Upcoming Events */}
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[19px] font-bold tracking-tight text-[#14142b]">Upcoming events</h2>
          <Link href="/search" className="flex items-center gap-1 text-[14px] font-semibold text-[#4C6FFF] transition-colors hover:text-[#3a5ae6]">
            Browse all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="flex flex-col gap-4 flex-1 justify-center">
          {events.length === 0 ? (
            <div className="flex h-full min-h-[150px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-sm font-medium text-slate-500">
              No upcoming events right now. Check back soon.
            </div>
          ) : (
            events.slice(0, 2).map((event, i) => (
              <EventRowCard key={event.id} event={event} index={i} />
            ))
          )}
        </div>
      </div>

    </section>
  );
}

export const FALLBACK_EVENTS: EventCard[] = [
  {
    id: 'ev-1',
    title: 'Cloud Deploy Night',
    tagline: 'CI/CD, containers, and a live rollout.',
    when: 'Aug 08',
    where: 'Hybrid',
    seats: 'Open registration',
    tone: 'blue',
    href: '#',
    statusLabel: 'Registration open',
  },
  {
    id: 'ev-2',
    title: 'Frontend Performance Clinic',
    tagline: 'Core Web Vitals, profiling, and quick wins.',
    when: 'Aug 10',
    where: 'Online',
    seats: '24 seats left',
    tone: 'violet',
    href: '#',
    statusLabel: 'Registration open',
  }
];

export function pickDailyEvents(pool: EventCard[], count: number): EventCard[] {
  if (pool.length <= count) return pool;
  const day = Math.floor(Date.now() / 86_400_000);
  const scored = pool.map((event, i) => {
    const seed = (day * 31 + i * 17 + event.id.charCodeAt(0)) % 997;
    return { event, seed };
  });
  scored.sort((a, b) => a.seed - b.seed);
  return scored.slice(0, count).map((s) => s.event);
}
