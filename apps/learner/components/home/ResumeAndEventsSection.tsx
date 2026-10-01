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
import { UnifiedContentCard } from '@/shared/design-system/ui/cards';


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
    <UnifiedContentCard
      id={course.id}
      title={course.title}
      description={course.description || `${course.moduleCount || 0} modules · Self-paced learning`}
      type="COURSE"
      typeLabel="Featured Course"
      authorName={course.authorName}
      categoryId={course.categoryId}
      actionHref={courseRoutes.landing(course.id)}
      actionLabel="View Course"
      actionIcon={BookOpen}
    />
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
    <UnifiedContentCard
      id={course.id}
      title={course.title}
      description={course.authorName ? `Instructor: ${course.authorName}` : (pct && pct > 0 ? 'Pick up right where you left off' : 'Continue where you left off')}
      type="COURSE"
      authorName={course.authorName}
      progressPercent={pct}
      actionHref={courseRoutes.overview(course.id)}
      actionLabel={pct && pct > 0 ? 'Continue Learning' : 'Start Learning'}
      actionIcon={Play}
    />
  );
}

function EventRowItem({ event, index }: { event: EventCard; index: number }) {
  return (
    <UnifiedContentCard
      id={event.id}
      title={event.title}
      description={event.tagline}
      type="EVENT"
      typeLabel="Event"
      metaTags={[
        event.when ? event.when : null,
        event.where ? event.where : null,
        event.seats ? event.seats : null,
      ].filter(Boolean)}
      actionHref={event.href}
      actionLabel="Register"
    />
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

        {/* Right Column: Rubiks */}
        <RubiksCube3D />
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
