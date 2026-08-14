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
  Trophy,
  Sparkles,
  Rocket,
  Palette,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';
import type { CourseResponse } from '@/shared/types/api.types';

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

const TONE_CONFIG: Record<
  EventCard['tone'],
  {
    bgTint: string;
    iconColor: string;
    borderAccent: string;
    borderLeft: string;
    badgeBg: string;
    badgeText: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
  }
> = {
  coral: {
    bgTint: 'bg-[#FF6B4A]/12',
    iconColor: 'text-[#FF6B4A]',
    borderAccent: 'border-[#FF6B4A]/30',
    borderLeft: 'border-l-[#FF6B4A]',
    badgeBg: 'bg-[#FF6B4A]/15',
    badgeText: 'text-[#D94F32]',
    icon: Trophy,
  },
  blue: {
    bgTint: 'bg-[#4C6FFF]/12',
    iconColor: 'text-[#4C6FFF]',
    borderAccent: 'border-[#4C6FFF]/30',
    borderLeft: 'border-l-[#4C6FFF]',
    badgeBg: 'bg-[#4C6FFF]/15',
    badgeText: 'text-[#3A56D4]',
    icon: Sparkles,
  },
  emerald: {
    bgTint: 'bg-[#1DB876]/12',
    iconColor: 'text-[#1DB876]',
    borderAccent: 'border-[#1DB876]/30',
    borderLeft: 'border-l-[#1DB876]',
    badgeBg: 'bg-[#1DB876]/15',
    badgeText: 'text-[#0F9A5F]',
    icon: Rocket,
  },
  violet: {
    bgTint: 'bg-[#9B5DE5]/12',
    iconColor: 'text-[#9B5DE5]',
    borderAccent: 'border-[#9B5DE5]/30',
    borderLeft: 'border-l-[#9B5DE5]',
    badgeBg: 'bg-[#9B5DE5]/15',
    badgeText: 'text-[#7A3FC0]',
    icon: Palette,
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

/** Pick events that change each calendar day. */
export function pickDailyEvents(pool: EventCard[], count = 3): EventCard[] {
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

function RecommendedFeaturedCard({ course }: { course: CourseResponse }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex h-full flex-col justify-between overflow-hidden rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-white/95 p-4 sm:p-5 shadow-[0_8px_30px_rgba(20,20,43,0.05)] transition-all hover:shadow-[0_12px_36px_rgba(20,20,43,0.08)] backdrop-blur-sm"
    >
      <div className="relative z-10 flex flex-1 flex-col justify-between gap-4">
        {/* Large Cover Image Banner */}
        <div className="relative h-44 sm:h-48 w-full shrink-0 overflow-hidden rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-md rounded-bl-md border border-slate-200/70 bg-slate-100 shadow-sm">
          <img
            src={
              course.coverImageUrl ||
              'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80'
            }
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <span className="absolute top-3 left-3 rounded-full bg-[#12141C]/80 backdrop-blur-md px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            Recommended
          </span>
        </div>

        {/* Title and Author */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#4C6FFF]">
            {course.authorName || 'Featured Course'}
          </span>
          <h3 className="line-clamp-1 text-base sm:text-lg font-bold tracking-tight text-[#14142b] mt-0.5">
            {course.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs sm:text-[13px] font-medium leading-relaxed text-slate-500">
            {course.description || `${course.modules?.length ?? 0} modules · Self-paced learning`}
          </p>
        </div>

        {/* CTA Button */}
        <div className="pt-1">
          <Link
            href={`/learn/${course.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-[#4C6FFF] px-5 py-3 text-[13px] font-semibold text-white transition-all shadow-sm hover:bg-[#3a5ae6] hover:shadow-md"
          >
            <BookOpen size={16} /> Start Learning
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function ResumeLearningCard({ course }: { course: ResumeCourse | null }) {
  if (!course) {
    return (
      <div className="relative flex h-full min-h-[260px] flex-col justify-between overflow-hidden rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-dashed border-slate-200 bg-white/80 p-6 shadow-[0_4px_20px_rgba(20,20,43,0.03)] backdrop-blur-sm">
        <div>
          <h3 className="text-base font-bold text-[#14142b]">Nothing in progress</h3>
          <p className="mt-1 text-[13px] font-medium leading-relaxed text-slate-500">
            Enroll in a course and pick up right where you left off.
          </p>
        </div>
        <Link
          href="/search"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-[#12141C] px-5 py-3 text-[13px] font-semibold text-white transition-all shadow-sm hover:bg-[#232735] hover:shadow-md"
        >
          <BookOpen size={16} /> Find a course
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
      className="relative flex h-full flex-col justify-between overflow-hidden rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-white/95 p-4 sm:p-5 shadow-[0_8px_30px_rgba(20,20,43,0.05)] transition-all hover:shadow-[0_12px_36px_rgba(20,20,43,0.08)] backdrop-blur-sm"
    >
      {/* Decorative background ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -bottom-12 h-44 w-44 rounded-full bg-gradient-to-br from-[#4C6FFF]/10 via-[#1DB876]/8 to-transparent blur-2xl"
      />

      <div className="relative z-10 flex flex-1 flex-col justify-between gap-4">
        {/* Prominent Large Course Cover Image Banner */}
        <div className="relative h-44 sm:h-48 w-full shrink-0 overflow-hidden rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-md rounded-bl-md border border-slate-200/70 bg-slate-100 shadow-sm">
          <img
            src={
              course.coverImageUrl ||
              'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80'
            }
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Title and Author details */}
        <div>
          <h3 className="line-clamp-1 text-base sm:text-lg font-bold tracking-tight text-[#14142b]">
            {course.title}
          </h3>
          <p className="mt-0.5 truncate text-xs sm:text-[13px] font-medium text-slate-500">
            {course.authorName || 'Continue where you left off'}
          </p>
        </div>

        {/* Course Progress Bar Section */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500">Course Progress</span>
            <span className="font-bold text-[#14142b]">{pct}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#4C6FFF] via-[#0EA5E9] to-[#1DB876]"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        {/* Bottom CTA Action Button */}
        <div className="pt-1">
          <Link
            href={`/learn/${course.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-[#12141C] px-5 py-3 text-[13px] font-semibold text-white transition-all shadow-sm hover:bg-[#232735] hover:shadow-md"
          >
            <Play size={15} className="fill-current" /> Continue Learning
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function EventRowItem({ event, index }: { event: EventCard; index: number }) {
  const tone = TONE_CONFIG[event.tone];

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: 0.06 * index,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-tr-[1.75rem] rounded-bl-[1.75rem] rounded-tl-lg rounded-br-lg border-l-4 ${tone.borderLeft} border-y border-r border-slate-200/80 bg-white/95 p-4 sm:p-5 shadow-[0_4px_16px_rgba(20,20,43,0.03)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(20,20,43,0.07)]`}
    >
      {/* Content details */}
      <div className="min-w-0 flex-1">
        <h3 className="text-[15px] font-bold tracking-tight text-[#14142b] transition-colors group-hover:text-[#4C6FFF]">
          {event.title}
        </h3>
        <p className="mt-0.5 text-[13px] font-medium leading-relaxed text-slate-500 line-clamp-2">
          {event.tagline}
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-2.5">
          <div className="flex flex-wrap items-center gap-3 text-[11.5px] font-medium text-slate-500">
            <span className="flex items-center gap-1">
              <CalendarDays size={12} className="text-slate-400" />
              {event.when}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-slate-400" />
              {event.where}
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} className="text-slate-400" />
              {event.seats}
            </span>
          </div>

          <Link
            href={event.href}
            className="inline-flex items-center gap-1 rounded-tr-lg rounded-bl-lg rounded-tl-xs rounded-br-xs bg-[#12141C] px-3.5 py-1.5 text-[12px] font-semibold text-white transition-all hover:bg-[#232735] hover:gap-1.5 shadow-sm"
          >
            Register <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export function ResumeAndEventsSection({
  resumeCourse,
  events,
  recommendedCourses = [],
}: {
  resumeCourse: ResumeCourse | null;
  events: EventCard[];
  recommendedCourses?: CourseResponse[];
}) {
  const displayedEvents = events.slice(0, 3);
  const featuredRecommended = recommendedCourses[0] || null;

  return (
    <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1.15fr] lg:gap-8">
      {/* Left Column: Resume Learning OR Recommended for you */}
      <div className="flex h-full flex-col gap-3.5">
        <div className="flex min-h-[28px] items-center justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight text-[#14142b]">
            {resumeCourse ? 'Resume learning' : 'Recommended for you'}
          </h2>
          {!resumeCourse && (
            <Link
              href="/search"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#4C6FFF] transition-all hover:gap-1.5 hover:text-[#3a5ae6]"
            >
              View all <ChevronRight size={15} />
            </Link>
          )}
        </div>
        <div className="min-h-0 flex-1">
          {resumeCourse ? (
            <ResumeLearningCard course={resumeCourse} />
          ) : featuredRecommended ? (
            <RecommendedFeaturedCard course={featuredRecommended} />
          ) : (
            <ResumeLearningCard course={null} />
          )}
        </div>
      </div>

      {/* Right Column: Upcoming Events */}
      <div className="flex h-full flex-col gap-3.5">
        <div className="flex min-h-[28px] items-center justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight text-[#14142b]">
            Upcoming events
          </h2>
          <Link
            href="/search"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#4C6FFF] transition-all hover:gap-1.5 hover:text-[#3a5ae6]"
          >
            Browse all <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="min-h-0 flex-1">
          {displayedEvents.length === 0 ? (
            <div className="flex h-full min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-8 text-center text-sm font-medium text-slate-500">
              No upcoming events right now. Check back soon.
            </div>
          ) : (
            <div className="space-y-3.5 sm:space-y-4">
              {displayedEvents.map((event, i) => (
                <EventRowItem key={event.id} event={event} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
