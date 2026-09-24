'use client';

import Link from 'next/link';
import { courseRoutes } from '@/shared/routes/content.routes';
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
  ChevronRight,
  Compass,
} from 'lucide-react';
import type { CourseSummaryResponse } from '@/shared/types/api.types';
import { RubiksCube3D } from './RubiksCube3D';

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
  /**
   * Backend `progressPercent`. **Null is not zero** — it means the read model has no percentage
   * to report (unpublished course, or a course with no lessons). Rendering null as a 0% bar would
   * assert "you have completed none of it", which is a different and unverified claim.
   */
  progress: number | null;
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

function EmptyRecommendationsIllustration() {
  return (
    <svg
      width="170"
      height="130"
      viewBox="0 0 170 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="recGlowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4C6FFF" stopOpacity="0.2" />
          <stop offset="60%" stopColor="#9B5DE5" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#4C6FFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="recPrimaryGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4C6FFF" />
          <stop offset="100%" stopColor="#9B5DE5" />
        </linearGradient>
        <linearGradient id="recCardGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
      </defs>

      {/* Ambient background glow circle */}
      <circle cx="85" cy="65" r="58" fill="url(#recGlowGrad)" />

      {/* Orbit ring */}
      <ellipse
        cx="85"
        cy="68"
        rx="64"
        ry="26"
        stroke="#E2E8F0"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        strokeOpacity="0.8"
      />

      {/* Floating orbital dots */}
      <circle cx="28" cy="60" r="3.5" fill="#4C6FFF" fillOpacity="0.75" />
      <circle cx="142" cy="74" r="4" fill="#9B5DE5" fillOpacity="0.65" />
      <circle cx="118" cy="38" r="2.5" fill="#0EA5E9" fillOpacity="0.8" />

      {/* Shadow under book */}
      <ellipse cx="85" cy="100" rx="38" ry="6" fill="#14142B" fillOpacity="0.06" />

      {/* Stylized Open Learning Hub / Book */}
      {/* Left page */}
      <path
        d="M46 62 C46 56 62 50 83 54 L83 90 C62 86 46 92 46 92 Z"
        fill="url(#recCardGrad)"
        stroke="#CBD5E1"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Right page */}
      <path
        d="M124 62 C124 56 108 50 87 54 L87 90 C108 86 124 92 124 92 Z"
        fill="#FFFFFF"
        stroke="#CBD5E1"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Spine & Center Line */}
      <path
        d="M85 54 L85 90"
        stroke="#94A3B8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Page detail lines */}
      <line x1="55" y1="65" x2="74" y2="67" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
      <line x1="55" y1="71" x2="71" y2="73" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
      <line x1="55" y1="77" x2="76" y2="79" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

      <line x1="96" y1="67" x2="115" y2="65" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
      <line x1="96" y1="73" x2="112" y2="71" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
      <line x1="96" y1="79" x2="117" y2="77" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

      {/* Floating Center Compass / Star Badge above the book */}
      <g transform="translate(85, 42)">
        <circle cx="0" cy="0" r="14" fill="white" stroke="#E2E8F0" strokeWidth="1" />
        <path
          d="M0 -8 C0.5 -2.5 2.5 -0.5 8 0 C2.5 0.5 0.5 2.5 0 8 C-0.5 2.5 -2.5 0.5 -8 0 C-2.5 -0.5 -0.5 -2.5 0 -8 Z"
          fill="url(#recPrimaryGrad)"
        />
      </g>

      {/* Sparkle accents */}
      <path
        d="M130 32 L131.5 35.5 L135 37 L131.5 38.5 L130 42 L128.5 38.5 L125 37 L128.5 35.5 Z"
        fill="#FF6B4A"
        opacity="0.85"
      />
      <path
        d="M40 44 L41 46.5 L43.5 47.5 L41 48.5 L40 51 L39 48.5 L36.5 47.5 L39 46.5 Z"
        fill="#0EA5E9"
        opacity="0.8"
      />
    </svg>
  );
}

function EmptyRecommendedCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex h-full min-h-[340px] flex-col items-center justify-center overflow-hidden rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-white/95 p-6 sm:p-7 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm text-center"
    >
      {/* Decorative ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#4C6FFF]/8 via-[#9B5DE5]/4 to-transparent opacity-80"
      />

      <div className="relative z-10 flex flex-col items-center max-w-sm">
        {/* SVG Illustration */}
        <div className="mb-3">
          <EmptyRecommendationsIllustration />
        </div>

        {/* Headline */}
        <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#14142b]">
          No recommendations yet
        </h3>

        {/* Descriptive Copy */}
        <p className="mt-1 text-xs sm:text-[13px] font-medium leading-relaxed text-slate-500">
          Discover courses in the catalog to kickstart your journey. We&apos;ll tailor recommendations as you explore.
        </p>

        {/* CTA Button */}
        <div className="mt-5 w-full">
          <Link
            href="/search"
            className="inline-flex w-full items-center justify-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-[#12141C] px-5 py-3 text-[13px] font-semibold text-white transition-all shadow-sm hover:bg-[#232735] hover:shadow-md cursor-pointer"
          >
            <Compass size={16} /> Explore courses
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function RecommendedFeaturedCard({ course }: { course: CourseSummaryResponse }) {
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
          {course.coverImageUrl ? (
            <img
              src={course.coverImageUrl}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div
              aria-hidden
              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#4C6FFF]/15 via-slate-100 to-[#9B5DE5]/10"
            >
              <span className="text-4xl font-black text-slate-400 select-none">
                {(course.title || '?').trim().charAt(0).toUpperCase()}
              </span>
            </div>
          )}
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
            {course.description || `${course.moduleCount} modules · Self-paced learning`}
          </p>
        </div>

        {/* CTA Button */}
        <div className="pt-1">
          <Link
            href={courseRoutes.landing(course.id)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-[#4C6FFF] px-5 py-3 text-[13px] font-semibold text-white transition-all shadow-sm hover:bg-[#3a5ae6] hover:shadow-md"
          >
            <BookOpen size={16} /> View Course
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function ResumeLearningCard({ course }: { course: ResumeCourse | null }) {
  if (!course) {
    return <EmptyRecommendedCard />;
  }

  const pct =
    course.progress === null || course.progress === undefined
      ? null
      : Math.max(0, Math.min(100, Math.round(course.progress)));

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
          {course.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.coverImageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div
              aria-hidden
              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200"
            >
              <span className="text-4xl font-black text-slate-400 select-none">
                {(course.title || '?').trim().charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="absolute top-3 left-3 rounded-full bg-[#12141C]/80 backdrop-blur-md px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            In progress
          </span>
        </div>

        {/* Title and Author details */}
        <div>
          <h3 className="line-clamp-1 text-base sm:text-lg font-bold tracking-tight text-[#14142b]">
            {course.title}
          </h3>
          <p className="mt-0.5 truncate text-xs sm:text-[13px] font-medium text-slate-500">
            {course.authorName || (pct && pct > 0 ? 'Pick up right where you left off' : 'Continue where you left off')}
          </p>
        </div>

        {/* Course Progress Bar Section */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500">Course Progress</span>
            <span className="font-bold text-[#14142b]">
              {pct === null ? 'Not tracked' : `${pct}%`}
            </span>
          </div>
          {pct !== null && (
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#4C6FFF] via-[#0EA5E9] to-[#1DB876]"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          )}
        </div>

        {/* Bottom CTA Action Button */}
        <div className="pt-1">
          <Link
            href={courseRoutes.overview(course.id)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-[#12141C] px-5 py-3 text-[13px] font-semibold text-white transition-all shadow-sm hover:bg-[#232735] hover:shadow-md"
          >
            <Play size={15} className="fill-current" /> {pct && pct > 0 ? 'Continue Learning' : 'Start Learning'}
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
  recommendedCourses?: CourseSummaryResponse[];
}) {
  const displayedEvents = events.slice(0, 3);
  const featuredRecommended = recommendedCourses[0] || null;

  return (
    <div className="space-y-8">
      {/* 2-Column Split: Resume Learning on Left, Rubik on Right */}
      <section className="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Left Column: Resume Learning OR Recommended for you */}
        <div className="flex h-full flex-col gap-3.5">
          <div className="flex min-h-[28px] items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-tight text-[#14142b]">
              {resumeCourse ? 'Resume learning' : 'Recommended for you'}
            </h2>
            {resumeCourse ? (
              <Link
                href="/my-learning"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#4C6FFF] transition-all hover:gap-1.5 hover:text-[#3a5ae6]"
              >
                My learning <ChevronRight size={15} />
              </Link>
            ) : featuredRecommended ? (
              <Link
                href="/search"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#4C6FFF] transition-all hover:gap-1.5 hover:text-[#3a5ae6]"
              >
                View all <ChevronRight size={15} />
              </Link>
            ) : null}
          </div>
          <div className="min-h-0 flex-1 flex flex-col">
            {resumeCourse ? (
              <ResumeLearningCard course={resumeCourse} />
            ) : featuredRecommended ? (
              <RecommendedFeaturedCard course={featuredRecommended} />
            ) : (
              <EmptyRecommendedCard />
            )}
          </div>
        </div>

        {/* Right Column: Daily Rubik */}
        <div className="flex h-full flex-col gap-3.5">
          <div className="flex min-h-[28px] items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-tight text-[#14142b]">
              Daily puzzle
            </h2>
            <span className="text-xs font-mono font-medium text-slate-400">
              Interactive 3D
            </span>
          </div>
          <div className="min-h-0 flex-1 flex flex-col justify-center">
            <RubiksCube3D />
          </div>
        </div>
      </section>

      {/* Full-Width Section Below: Upcoming Events — only rendered if actual events exist */}
      {displayedEvents.length > 0 && (
        <section className="space-y-3.5">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {displayedEvents.map((event, i) => (
                <EventRowItem key={event.id} event={event} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
