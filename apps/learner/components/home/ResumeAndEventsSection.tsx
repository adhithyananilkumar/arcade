'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  MapPin,
  Users,
  ArrowUpRight,
  Play,
  BookOpen,
} from 'lucide-react';

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

const TONE: Record<
  EventCard['tone'],
  { wash: string; chip: string; accent: string }
> = {
  coral: {
    wash: 'from-[#FFF1EC] to-white',
    chip: 'bg-[#FF6B4A]/15 text-[#D94F32]',
    accent: 'bg-[#FF6B4A]',
  },
  blue: {
    wash: 'from-[#EEF2FF] to-white',
    chip: 'bg-[#4C6FFF]/15 text-[#3A56D4]',
    accent: 'bg-[#4C6FFF]',
  },
  emerald: {
    wash: 'from-[#ECFDF5] to-white',
    chip: 'bg-[#1DB876]/15 text-[#0F9A5F]',
    accent: 'bg-[#1DB876]',
  },
  violet: {
    wash: 'from-[#F5F0FF] to-white',
    chip: 'bg-[#9B5DE5]/15 text-[#7A3FC0]',
    accent: 'bg-[#9B5DE5]',
  },
};

/** Fallback pool when no published workshops — rotated daily. */
export const FALLBACK_EVENTS: EventCard[] = [
  {
    id: 'fb-1',
    title: 'Arcade Build Sprint',
    tagline: '48 hours. One product. Ship it live.',
    when: 'This weekend',
    where: 'Campus + Online',
    seats: 'Limited seats',
    tone: 'coral',
    href: '/search',
  },
  {
    id: 'fb-2',
    title: 'AI for Good Challenge',
    tagline: 'Solve a real campus problem with ML.',
    when: 'Coming soon',
    where: 'Innovation Lab',
    seats: 'Open registration',
    tone: 'blue',
    href: '/search',
  },
  {
    id: 'fb-3',
    title: 'Design Systems Lab',
    tagline: 'Tokens, components, and critique in one evening.',
    when: 'Next week',
    where: 'Online',
    seats: '30 seats left',
    tone: 'violet',
    href: '/search',
  },
  {
    id: 'fb-4',
    title: 'Cloud Deploy Night',
    tagline: 'CI/CD, containers, and a live rollout.',
    when: 'Fri 6–9 PM',
    where: 'Hybrid',
    seats: 'Open registration',
    tone: 'emerald',
    href: '/search',
  },
  {
    id: 'fb-5',
    title: 'Frontend Performance Clinic',
    tagline: 'Core Web Vitals, profiling, and quick wins.',
    when: 'Thu evening',
    where: 'Online',
    seats: '24 seats left',
    tone: 'blue',
    href: '/search',
  },
  {
    id: 'fb-6',
    title: 'Startup Pitch Arena',
    tagline: 'Three minutes. One idea. Real feedback.',
    when: 'Sat afternoon',
    where: 'Campus hall',
    seats: 'Registration open',
    tone: 'coral',
    href: '/search',
  },
];

/** Pick two events that change each calendar day. */
export function pickDailyEvents(pool: EventCard[], count = 2): EventCard[] {
  if (pool.length === 0) return [];
  if (pool.length <= count) return pool;
  const day = Math.floor(Date.now() / 86_400_000);
  const start = day % pool.length;
  const picked: EventCard[] = [];
  for (let i = 0; i < count; i++) {
    picked.push(pool[(start + i) % pool.length]);
  }
  return picked;
}

function ResumeLearningCard({ course }: { course: ResumeCourse | null }) {
  if (!course) {
    return (
      <div className="flex h-full min-h-[260px] flex-col justify-between rounded-lg border border-dashed border-slate-200 bg-white/70 p-5">
        <div>
          <h3 className="text-[15px] font-bold text-[#14142b]">Nothing in progress</h3>
          <p className="mt-1.5 text-[13px] font-medium text-slate-500">
            Enroll in a course and pick up right where you left off.
          </p>
        </div>
        <Link
          href="/search"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#12141C] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#232735]"
        >
          <BookOpen size={15} /> Find a course
        </Link>
      </div>
    );
  }

  const pct = Math.max(0, Math.min(100, Math.round(course.progress)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full min-h-[260px] flex-col overflow-hidden rounded-lg border border-slate-200/80 bg-gradient-to-br from-[#EEF2FF] via-white to-[#F8FAFC] p-4 shadow-[0_6px_20px_rgba(20,20,43,0.04)]"
    >
      <div className="flex gap-3">
        <div className="h-[72px] w-[88px] shrink-0 overflow-hidden rounded-md bg-slate-100">
          <img
            src={
              course.coverImageUrl ||
              'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80'
            }
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[15px] font-bold tracking-tight text-[#14142b]">
            {course.title}
          </h3>
          <p className="mt-0.5 truncate text-[12px] font-medium text-slate-500">
            {course.authorName || 'Continue where you left off'}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold">
          <span className="text-slate-500">Progress</span>
          <span className="text-[#14142b]">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-sm bg-slate-100">
          <motion.div
            className="h-full rounded-sm bg-gradient-to-r from-[#4C6FFF] to-[#1DB876]"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <Link
        href={`/learn/${course.id}/learn`}
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#12141C] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#232735]"
      >
        <Play size={14} className="fill-current" /> Continue
      </Link>
    </motion.div>
  );
}

function EventMiniCard({ event, index }: { event: EventCard; index: number }) {
  const tone = TONE[event.tone];
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: 0.05 * index,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`flex h-full flex-col overflow-hidden rounded-lg border border-slate-200/80 bg-gradient-to-br ${tone.wash} p-4 shadow-[0_6px_20px_rgba(20,20,43,0.04)]`}
    >
      <div className={`mb-2.5 h-1 w-9 rounded-sm ${tone.accent}`} />
      <span
        className={`mb-2 inline-flex w-fit rounded-md px-2 py-0.5 text-[10px] font-bold ${tone.chip}`}
      >
        {event.statusLabel || 'Registration open'}
      </span>
      <h3 className="mb-1 text-[14px] font-bold tracking-tight text-[#14142b]">
        {event.title}
      </h3>
      <p className="mb-3 line-clamp-2 text-[12px] font-medium leading-snug text-slate-500">
        {event.tagline}
      </p>
      <div className="mt-auto space-y-1 text-[11.5px] font-medium text-slate-600">
        <div className="flex items-center gap-1.5">
          <CalendarDays size={12} className="text-slate-400" />
          {event.when}
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={12} className="text-slate-400" />
          {event.where}
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={12} className="text-slate-400" />
          {event.seats}
        </div>
      </div>
      <Link
        href={event.href}
        className="mt-3 inline-flex items-center justify-center rounded-md bg-[#12141C] px-3.5 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#232735]"
      >
        Register
      </Link>
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
    <section className="grid items-stretch gap-3.5 lg:grid-cols-[1fr_1.15fr] lg:gap-4">
      <div className="flex h-full flex-col gap-3">
        <div className="flex min-h-[28px] items-end justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight text-[#14142b]">
            Resume learning
          </h2>
        </div>
        <div className="min-h-0 flex-1">
          <ResumeLearningCard course={resumeCourse} />
        </div>
      </div>

      <div className="flex h-full flex-col gap-3">
        <div className="flex min-h-[28px] items-end justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight text-[#14142b]">
            Upcoming events
          </h2>
          <Link
            href="/search"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#4C6FFF] transition-colors hover:text-[#3a5ae6]"
          >
            Browse all <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="grid min-h-0 flex-1 gap-3 sm:grid-cols-2">
          {events.length === 0 ? (
            <div className="col-span-full flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/60 px-4 py-8 text-center text-sm font-medium text-slate-500">
              No upcoming events right now. Check back soon.
            </div>
          ) : (
            events.slice(0, 2).map((event, i) => (
              <EventMiniCard key={event.id} event={event} index={i} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
