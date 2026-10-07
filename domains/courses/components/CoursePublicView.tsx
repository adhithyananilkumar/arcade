'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Courses
 *
 * Purpose:
 * Dedicated public course landing & details page component for /courses/[id].
 * Adopts the signature styling of the learner overview page (Dancing Script
 * title flourish, ink asymmetric buttons, signature asymmetric card corners,
 * and clean typography) while maintaining the landing page structure.
 * ------------------------------------------------------------------
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  GraduationCap,
  Layers,
  PlayCircle,
  Radio,
  Sparkles,
  Star,
  Users,
  Flag,
  Globe,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Dancing_Script } from 'next/font/google';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { examRoutes } from '@/shared/routes/content.routes';
import { api } from '@/infrastructure/http/api';
import type {
  CourseChannelSummary,
  CourseCollaboratorSummary,
  CourseResponse,
  CourseReviewStats,
} from '@/shared/types/api.types';
import { courseReviewService, type CourseReview } from '@/domains/learning';
import { formatMoney } from '@/shared/utils/money';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import {
  EnrollmentButton,
  useMyEnrollmentForResourceQuery,
} from '@/domains/enrollment';
import { toast } from 'sonner';
import { ReportModal } from '@/shared/design-system/ui/ReportModal';
import { getContentCertification, type ContentCertificationView } from '@/domains/assessments';
import { ChannelAvatar } from '@/shared/design-system/ui/cards';
import { ContentArt } from '@/shared/design-system/art';
import { getAvatarUrl } from '@/shared/utils/avatar';
import BadgeGraphic, { getBadgeForCourse } from '@/components/ui/BadgeGraphic';
import FoldText from '@/components/ui/FoldText';
import { motion } from 'framer-motion';
import PartyPopper, { PartyPopperRef } from '@/components/ui/PartyPopper';

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['600', '700'],
});

const COURSE_TITLE = 'Design interfaces people actually love';

const REVIEW_ACCENTS = [
  '#3b82f6',
  '#f59e0b',
  '#8b5cf6',
  '#10b981',
];

function formatCollaboratorRole(role?: string): string {
  if (!role) return 'Instructor';
  const cleaned = role.replace(/_/g, ' ').toLowerCase();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function Avatar({
  name,
  imageUrl,
  accent = '#8C6453',
  size = 40,
}: {
  name: string;
  imageUrl?: string | null;
  accent?: string;
  size?: number;
}) {
  const resolvedUrl = getAvatarUrl(imageUrl);
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (resolvedUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolvedUrl}
        alt={name}
        className="shrink-0 rounded-2xl object-cover border border-slate-100"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-2xl font-bold text-white shadow-xs"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: accent,
      }}
    >
      {initials}
    </div>
  );
}

function CourseBadge({ type = 'crystal' }: { type?: string }) {
  const popperRef = useRef<PartyPopperRef>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (popperRef.current) {
        popperRef.current.burst(20, 70);
        popperRef.current.burst(140, 70);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PartyPopper ref={popperRef} className="relative flex shrink-0 items-center justify-center p-2">
      <motion.div
        initial={{ rotateY: 1080, rotateZ: -20, scale: 0.3, opacity: 0 }}
        animate={{ rotateY: 0, rotateZ: 0, scale: 1, opacity: 1 }}
        transition={{
          duration: 2.2,
          ease: [0.25, 1, 0.5, 1],
        }}
        whileHover={{ scale: 1.08, rotate: 4 }}
        onClick={() => {
          popperRef.current?.burst(20, 70);
          popperRef.current?.burst(140, 70);
        }}
        className="relative flex items-center justify-center cursor-pointer"
        style={{ perspective: 1000 }}
      >
        <div className="h-32 w-24 drop-shadow-lg">
          <BadgeGraphic type={type} />
        </div>
      </motion.div>
    </PartyPopper>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero Section (Two-Column Layout with /learn signature aesthetics)  */
/* ------------------------------------------------------------------ */

interface CourseHeroProps {
  title: string;
  description?: string;
  authorName?: string;
  authorUsername?: string;
  authorAvatarUrl?: string | null;
  lessonCount?: number;
  duration?: string | null;
  enrollmentCount?: number;
  onEnroll?: () => void;
  isEnrolled?: boolean;
  initialState?: 'ENROLLED' | 'NOT_ENROLLED' | 'PENDING' | 'WAITLISTED';
  pendingReason?: 'PAYMENT' | 'REQUIREMENTS';
  pricingModel?: string;
  priceAmount?: number;
  currency?: string;
  courseId?: string;
  onReportClick?: () => void;
  channel?: CourseChannelSummary | null;
  collaborators?: CourseCollaboratorSummary[] | null;
  authorId?: string | null;
  moduleCount?: number;
  hasExam?: boolean;
  hasBadge?: boolean;
}

function CourseHero({
  title,
  description,
  authorName,
  authorUsername,
  authorAvatarUrl,
  lessonCount = 0,
  duration,
  enrollmentCount,
  onEnroll,
  initialState = 'NOT_ENROLLED',
  pendingReason,
  pricingModel,
  priceAmount,
  currency,
  courseId,
  onReportClick,
  channel,
  collaborators,
  authorId,
  moduleCount = 0,
  hasExam,
  hasBadge,
}: CourseHeroProps) {
  const instructors: Array<Pick<CourseCollaboratorSummary, 'id' | 'name' | 'username' | 'avatarUrl'>> =
    (collaborators?.length ?? 0) > 0
      ? collaborators!
      : authorName
        ? [{ id: authorId ?? 'author', name: authorName, username: authorUsername, avatarUrl: authorAvatarUrl }]
        : [];

  const isPaid = pricingModel === 'PAID';
  const priceDisplay = isPaid ? formatMoney(priceAmount ?? 0, currency ?? 'INR') : 'Free';

  return (
    <section className="relative pt-4 pb-8 sm:pt-6 sm:pb-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 items-start">
        {/* LEFT COLUMN: Course Details, Cursive Title Flourish & CTA */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
          {/* Publishing Channel Tag */}
          {channel?.name && (
            <div className="pt-1">
              <Link
                href={`/channels/${channel.id}`}
                className="group inline-flex items-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-xs rounded-bl-xs border border-slate-200/90 bg-surface/95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:border-blue-400 hover:bg-slate-50 dark:hover:border-blue-500 transition-all select-none"
              >
                {getAvatarUrl(channel.iconUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getAvatarUrl(channel.iconUrl)}
                    alt={channel.name}
                    className="size-4.5 rounded-md object-cover"
                  />
                ) : (
                  <span className="flex size-4.5 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                    <Radio size={11} className="stroke-[2.5]" />
                  </span>
                )}
                <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {channel.name}
                </span>
                <ChevronRight size={12} className="text-slate-400 group-hover:translate-x-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all" />
              </Link>
            </div>
          )}

          {/* Title in Dancing Script font with hand-drawn SVG flourish */}
          <div className="relative inline-block mt-1">
            <h1
              className={`${dancingScript.className} text-5xl sm:text-6xl lg:text-7xl font-bold tracking-normal text-slate-900 leading-[1.15]`}
            >
              {title}
            </h1>

            {/* Signature hand-drawn blue underline flourish from /learn */}
            <div className="flex mt-1">
              <svg
                className="h-4 w-56 sm:w-72 text-blue-300 dark:text-blue-400 opacity-90"
                viewBox="0 0 200 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 8C45 3.5 155 9.5 197 5"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Short Course Description */}
          {description && (
            <p className="text-sm sm:text-base leading-relaxed text-slate-600 font-normal line-clamp-3 pt-1">
              {description}
            </p>
          )}

          {/* Instructor Byline */}
          {instructors.length > 0 && (
            <div className="flex items-center gap-3 pt-2">
              <Avatar
                name={instructors[0].name}
                imageUrl={instructors[0].avatarUrl}
                size={40}
              />
              <div className="text-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Taught by
                </span>
                <span className="font-bold text-slate-900">
                  {instructors[0].username ? (
                    <Link
                      href={`/${instructors[0].username}`}
                      className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                    >
                      {instructors[0].name}
                    </Link>
                  ) : (
                    instructors[0].name
                  )}
                  {instructors.length > 1 && (
                    <span className="text-slate-500 font-normal"> & {instructors.length - 1} more</span>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Course Metadata Pill Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-surface/95 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_2px_8px_rgba(20,20,43,0.03)] backdrop-blur-sm">
              <Clock size={14} className="text-slate-400 shrink-0" />
              {duration || 'Self-paced'}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-surface/95 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_2px_8px_rgba(20,20,43,0.03)] backdrop-blur-sm">
              <BookOpen size={14} className="text-slate-400 shrink-0" />
              {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
            </span>

            {moduleCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-surface/95 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_2px_8px_rgba(20,20,43,0.03)] backdrop-blur-sm">
                <Layers size={14} className="text-slate-400 shrink-0" />
                {moduleCount} {moduleCount === 1 ? 'module' : 'modules'}
              </span>
            )}

            {(enrollmentCount ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-surface/95 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_2px_8px_rgba(20,20,43,0.03)] backdrop-blur-sm">
                <Users size={14} className="text-slate-400 shrink-0" />
                {(enrollmentCount!).toLocaleString()} learners
              </span>
            )}
          </div>

          {/* Primary Action & Pricing Row */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-3">
            {isPaid ? (
              <div className="flex flex-col pr-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none">
                  {priceDisplay}
                </span>
                <span className="text-[11px] font-medium text-slate-400 mt-1">One-time payment</span>
              </div>
            ) : (
              <div className="inline-flex items-center">
                <span className="h-11 px-4 inline-flex items-center justify-center gap-2 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs shrink-0 select-none">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Free Course
                </span>
              </div>
            )}

            {courseId && (
              <div className="inline-flex items-center [&>div]:w-auto [&>div]:inline-flex [&_button]:h-11 [&_button]:!rounded-tl-2xl [&_button]:!rounded-br-2xl [&_button]:!rounded-tr-md [&_button]:!rounded-bl-md [&_button]:!py-0 [&_button]:!px-5 sm:[&_button]:!px-6 [&_button]:!flex-initial [&_button]:w-auto [&_button]:border [&_button]:border-slate-300/80 [&_button]:text-xs sm:[&_button]:text-sm">
                <EnrollmentButton
                  resourceType="COURSE"
                  resourceId={courseId}
                  initialState={initialState}
                  pendingReason={pendingReason}
                  className="!rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md !py-0 !h-11 !px-5 sm:!px-6 !flex-initial font-bold shadow-2xs hover:shadow-xs transition-all"
                  onStateChange={(state) => {
                    if (state === 'ENROLLED' && onEnroll) {
                      onEnroll();
                    }
                  }}
                />
              </div>
            )}

            <button
              type="button"
              onClick={onReportClick}
              aria-label="Report course"
              className="h-11 w-11 shrink-0 grid place-items-center rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md border border-slate-300/80 bg-surface/95 hover:bg-slate-100 active:scale-95 text-slate-400 hover:text-red-600 dark:hover:text-red-400 shadow-2xs transition-all cursor-pointer"
              title="Report this course"
            >
              <Flag size={15} />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Course Visual Artwork & Key Highlights (Non-redundant) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="w-full max-w-sm overflow-hidden rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 p-3.5 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm">
            {/* Generative Course Artwork */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-lg rounded-bl-lg border border-slate-200/70 shadow-xs">
              <ContentArt
                seed={courseId || title || 'default'}
                kind="COURSE"
                category={channel?.name || 'Technology'}
                title={title}
              />
              <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 rounded-full bg-slate-950/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                <Zap size={11} className="text-amber-400 fill-amber-400" />
                {isPaid ? 'Premium Course' : 'Free Access'}
              </div>
            </div>

            {/* Non-redundant Course Inclusions */}
            <div className="p-3 pt-4 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Full lifetime access to materials</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Globe size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Access on mobile, tablet and desktop</span>
              </div>
              {(hasExam || hasBadge) && (
                <div className="flex items-center gap-2 font-medium">
                  <Award size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>Shareable Certificate & Profile Badge</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Tabs Section (Overview, Curriculum, Instructor, Reviews, etc.)    */
/* ------------------------------------------------------------------ */

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative px-5 sm:px-6 py-2.5 rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-md rounded-bl-md text-xs sm:text-sm font-black tracking-tight transition-all duration-200 select-none cursor-pointer min-w-[96px] text-center ${
        active
          ? 'bg-surface text-[#2962D6] dark:text-[#3B82F6] border-2 border-[#2962D6] dark:border-[#3B82F6] shadow-2xs'
          : 'bg-slate-100/80 text-slate-700 border border-slate-200/70 hover:bg-slate-200/70 hover:text-slate-900'
      }`}
    >
      <span className="relative z-10">{label}</span>
    </button>
  );
}

interface CourseTabsProps {
  courseTitle?: string;
  course?: CourseResponse | null;
  courseId: string;
}

function CourseTabs({ courseTitle, course, courseId }: CourseTabsProps) {
  const [openMod, setOpenMod] = useState(0);
  const [certification, setCertification] = useState<ContentCertificationView | null>(null);
  const params = useParams<{ id?: string }>();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!course?.id) return;
    let cancelled = false;
    getContentCertification('COURSE', course.id)
      .then((c) => {
        if (!cancelled) setCertification(c && c.published ? c : null);
      })
      .catch(() => {
        if (!cancelled) setCertification(null);
      });
    return () => {
      cancelled = true;
    };
  }, [course?.id]);

  const hasBadge = (course?.badges && course.badges.length > 0) || false;
  const hasCertification = Boolean(course?.hasExam || (certification && certification.published));
  const hasCredentials = hasBadge || hasCertification;

  const tabs = [
    'Overview',
    'Curriculum',
    'Instructor',
    'Reviews',
    ...(hasCredentials ? (['Credentials'] as const) : []),
  ] as const;
  type Tab = (typeof tabs)[number];

  const [tab, setTab] = useState<Tab>('Overview');

  useEffect(() => {
    if (!tabs.includes(tab as any)) {
      setTab('Overview');
    }
  }, [tabs, tab]);

  const modules = course?.modules ?? [];
  const lessonTotal = modules.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0);
  const learningOutcomes = (course?.learningOutcomes ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const instructors: Array<Pick<CourseCollaboratorSummary, 'id' | 'name' | 'username' | 'avatarUrl' | 'bio' | 'role' | 'specialities' | 'experienceYears' | 'courseCount'>> =
    (course?.collaborators?.length ?? 0) > 0
      ? course!.collaborators!
      : course?.authorName
        ? [{
            id: course.authorId ?? 'author',
            name: course.authorName,
            username: course.authorUsername,
            avatarUrl: course.authorAvatarUrl,
            role: 'Author',
            bio: null,
            specialities: [],
            experienceYears: null,
            courseCount: 1,
          }]
        : [];

  const orgName = course?.channel && !course.channel.isPersonal ? course.channel.name : null;
  const titleFromQuery = searchParams?.get('title');
  const badgeInfo = getBadgeForCourse(courseTitle || titleFromQuery || params?.id);

  return (
    <div className="pt-4 sm:pt-6">
      {/* Tabs Header - matching My Learning page style */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
        {tabs.map((t) => (
          <TabButton
            key={t}
            active={tab === t}
            onClick={() => setTab(t)}
            label={t}
          />
        ))}
      </div>

      <div key={tab} className="mt-8 arcade-fade">
        {/* ================= OVERVIEW TAB ================= */}
        {tab === 'Overview' && (
          <div className="space-y-8">
            {/* What You'll Learn Section */}
            <div className="rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 p-6 sm:p-8 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                What You&apos;ll Learn:
              </h2>

              {learningOutcomes.length > 0 ? (
                <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
                  {learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-slate-500 font-normal">
                  Specific learning outcomes will be updated as new curriculum milestones are published.
                </p>
              )}
            </div>

            {/* About This Course */}
            <div className="rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 p-6 sm:p-8 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                About this course
              </h2>

              {course?.description ? (
                <div className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600 font-normal whitespace-pre-wrap">
                  {course.description}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500 font-normal">
                  The course author will publish an in-depth course description soon.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ================= CURRICULUM TAB ================= */}
        {tab === 'Curriculum' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Course Curriculum
                </h2>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                  {modules.length} {modules.length === 1 ? 'MODULE' : 'MODULES'} • {lessonTotal} LESSONS
                  {course?.duration && ` • ${course.duration.toUpperCase()}`}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpenMod(openMod === -1 ? 0 : -1)}
                  className="rounded-lg border border-slate-200 bg-surface px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  {openMod === -1 ? 'Expand all' : 'Collapse all'}
                </button>
              </div>
            </div>

            <div className="space-y-5">
              {modules.map((m, idx) => {
                const open = openMod === idx || openMod === -1;
                const moduleLessons = m.lessons ?? [];
                return (
                  <div
                    key={m.id}
                    className="rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm p-5 sm:p-6"
                  >
                    <div className="flex items-center justify-between gap-4 pb-2">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                          Chapter {idx + 1}: {m.title}
                        </h3>
                        <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          {moduleLessons.length} {moduleLessons.length === 1 ? 'LESSON' : 'LESSONS'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setOpenMod(open ? -2 : idx)}
                        aria-expanded={open}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                      >
                        <ChevronDown
                          size={18}
                          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </div>

                    {open && moduleLessons.length > 0 && (
                      <ul className="mt-4 space-y-2.5">
                        {moduleLessons.map((lesson, li) => (
                          <li
                            key={lesson.id}
                            className="group flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <PlayCircle size={17} className="shrink-0 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                              <span className="truncate text-slate-800 group-hover:text-slate-900">
                                {lesson.title}
                              </span>
                            </div>

                            <span className="text-xs text-slate-400 font-normal shrink-0 ml-4">
                              Lesson {li + 1}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}

              {modules.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
                  This course hasn&apos;t published curriculum lessons yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= INSTRUCTOR TAB ================= */}
        {tab === 'Instructor' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Instructor Profile
            </h2>

            {instructors.map((person) => (
              <div
                key={person.id}
                className="rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm p-6 sm:p-8"
              >
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <Avatar
                    name={person.name || 'Unknown'}
                    imageUrl={person.avatarUrl}
                    size={64}
                  />

                  <div className="flex-1 min-w-0">
                    {orgName && (
                      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                        <BadgeCheck size={13} className="text-blue-600 dark:text-blue-400" /> {orgName}
                      </div>
                    )}

                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                      {person.name || 'Unknown'}
                    </h3>

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                      {formatCollaboratorRole(person.role)}
                      {person.username && ` • @${person.username}`}
                    </p>

                    {person.bio ? (
                      <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 font-normal">
                        {person.bio}
                      </p>
                    ) : (
                      <p className="mt-4 text-sm italic text-slate-400">
                        {`${person.name || 'This instructor'} hasn't added a bio yet.`}
                      </p>
                    )}

                    {(person.specialities && person.specialities.length > 0) && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {person.specialities.map((e) => (
                          <span
                            key={e}
                            className="rounded-full border border-slate-200 bg-surface px-3 py-1 text-xs font-semibold text-slate-700"
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 text-center">
                  <div>
                    <p className="text-xl font-bold text-slate-900">
                      {person.courseCount ?? 1}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {person.courseCount === 1 ? 'Course' : 'Courses'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">
                      {person.experienceYears != null ? `${person.experienceYears} yrs` : '—'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Experience</p>
                  </div>
                </div>
              </div>
            ))}

            {instructors.length === 0 && (
              <div className="rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 p-8 text-center text-sm text-slate-400 shadow-[0_8px_30px_rgba(20,20,43,0.05)]">
                Instructor bio will be updated soon.
              </div>
            )}
          </div>
        )}

        {/* ================= REVIEWS TAB ================= */}
        {tab === 'Reviews' && (
          <div className="space-y-6">
            <ReviewsBlock courseId={courseId} />
          </div>
        )}

        {/* ================= CREDENTIALS TAB ================= */}
        {tab === 'Credentials' && (
          <div className="space-y-8 max-w-3xl mx-auto">
            {hasBadge && (
              <div className="rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <CourseBadge type={badgeInfo.type} />
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-300 mb-2">
                      <Sparkles size={13} className="text-amber-500" /> Verifiable Badge
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">
                      <FoldText
                        text={`Earn the ${course?.badges?.[0]?.title || badgeInfo.title}`}
                        splitBy="char"
                        hinge="top"
                        trigger="mount"
                        duration={0.65}
                        stagger={0.03}
                        fontSize="inherit"
                        fontWeight="inherit"
                        color="currentColor"
                      />
                    </h3>
                    <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600 font-normal">
                      Complete all curriculum lessons and checkpoints to earn the official digital{' '}
                      <span className="font-semibold text-slate-900">
                        {course?.badges?.[0]?.title || badgeInfo.badgeName}
                      </span>{' '}
                      badge for your public profile.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {hasCertification && (
              <div className="overflow-hidden rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-violet-200/80 bg-gradient-to-b from-violet-50/70 to-surface p-6 sm:p-8 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm dark:border-violet-500/25 dark:from-violet-500/10 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                      <Award size={14} /> Official Certification Exam
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {certification?.title || 'Course Certification Exam'}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 font-normal">
                      Completing this course qualifies you to take the verified certification exam.
                    </p>
                    {certification?.feeMinor && certification.feeMinor > 0 && (
                      <p className="mt-1 text-xs text-slate-500">
                        Exam registration fee: {formatMoney(certification.feeMinor, certification.currency ?? 'INR')}
                      </p>
                    )}
                  </div>

                  <Link
                    href={examRoutes.landing(certification?.examId || (params?.id as string))}
                    className="shrink-0 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-ink px-6 py-3.5 text-center text-[15px] font-semibold text-on-ink shadow-[0_8px_24px_-8px_rgba(20,20,43,0.45)] transition-all hover:-translate-y-0.5 hover:bg-ink-hover hover:shadow-[0_12px_28px_-8px_rgba(20,20,43,0.5)] active:translate-y-0 active:scale-[0.98] flex items-center gap-2"
                  >
                    View Exam Details <ChevronRight size={15} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reviews Block (Clean, Compact Empty State)                         */
/* ------------------------------------------------------------------ */

function ReviewsBlock({ courseId }: { courseId?: string }) {
  const [reviews, setReviews] = useState<CourseReview[] | null>(null);
  const [stats, setStats] = useState<CourseReviewStats | null>(null);

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    courseReviewService
      .listPublicForCourse(courseId)
      .then((rows) => {
        if (!cancelled) setReviews(rows);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      });
    courseReviewService
      .statsFor([courseId])
      .then((byCourse) => {
        if (!cancelled) setStats(byCourse[courseId] ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  if (reviews === null) return null;

  if (reviews.length === 0) {
    return (
      <div className="rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 p-6 sm:p-8 text-center shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 mb-3">
          <Star size={18} fill="currentColor" />
        </div>
        <h3 className="text-base font-bold text-slate-900">
          No reviews yet
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Be the first learner to review this course after finishing.
        </p>
      </div>
    );
  }

  const average = stats?.averageRating ?? 0;
  const totalRatings = stats?.reviewsCount ?? reviews.length;

  return (
    <div className="space-y-6">
      {/* Header with Average Rating */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 p-6 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Learner Feedback
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Based on {totalRatings.toLocaleString()} verified ratings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-3xl font-extrabold text-slate-900">
            {average.toFixed(1)}
          </span>
          <div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={15}
                  className={i <= Math.round(average) ? 'text-amber-500' : 'text-slate-200'}
                  fill={i <= Math.round(average) ? '#f59e0b' : 'none'}
                  strokeWidth={i <= Math.round(average) ? 0 : 1.5}
                />
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Course Rating</p>
          </div>
        </div>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((r, i) => {
          const accent = REVIEW_ACCENTS[i % REVIEW_ACCENTS.length];
          return (
            <div
              key={r.id}
              className="rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 p-5 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm flex flex-col justify-between"
            >
              {r.reviewText ? (
                <p className="text-sm leading-relaxed text-slate-700 font-normal">
                  &ldquo;{r.reviewText}&rdquo;
                </p>
              ) : (
                <p className="text-sm italic text-slate-400">
                  Rated this course {r.rating} out of 5 stars.
                </p>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2.5">
                  <Avatar name={r.userName} imageUrl={r.userAvatarUrl} accent={accent} size={28} />
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {r.userName}
                    </p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={10}
                          className={star <= r.rating ? 'text-amber-500' : 'text-slate-200'}
                          fill={star <= r.rating ? '#f59e0b' : 'none'}
                          strokeWidth={star <= r.rating ? 0 : 1.5}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getTitleFromSlug(slug?: string): string {
  if (!slug) return '';
  const knownTitles: Record<string, string> = {
    'intro-to-programming': 'Intro to Programming',
    'data-structures-and-algorithms': 'Data Structures & Algorithms',
    'data-structures-algorithms': 'Data Structures & Algorithms',
    'database-management-systems': 'Database Management Systems',
    'software-engineering': 'Software Engineering',
    'programming-logic': 'Programming Logic',
    'relational-databases': 'Relational Databases',
    'ui-ux-product-design': 'UI / UX & Product Design',
    'design-interfaces-people-actually-love': 'Design interfaces people actually love',
  };

  const normalized = slug.toLowerCase().trim();
  if (knownTitles[normalized]) {
    return knownTitles[normalized];
  }

  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower === 'and') return '&';
      if (lower === 'ui') return 'UI';
      if (lower === 'ux') return 'UX';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/* ------------------------------------------------------------------ */
/*  Sticky Enrollment Bottom Bar                                       */
/* ------------------------------------------------------------------ */

function StickyEnrollBar({
  title,
  pricingModel,
  priceAmount,
  currency,
  courseId,
  initialState,
  pendingReason,
  onEnroll,
}: {
  title: string;
  pricingModel?: string;
  priceAmount?: number;
  currency?: string;
  courseId: string;
  initialState: 'ENROLLED' | 'NOT_ENROLLED' | 'PENDING' | 'WAITLISTED';
  pendingReason?: 'PAYMENT' | 'REQUIREMENTS';
  onEnroll?: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 450) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  const isPaid = pricingModel === 'PAID';
  const priceDisplay = isPaid ? formatMoney(priceAmount ?? 0, currency ?? 'INR') : 'Free';

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 border-t border-slate-200 shadow-lg backdrop-blur-md transition-all duration-300">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 hidden sm:block">
            Course
          </p>
          <p className="text-sm font-bold text-slate-900 truncate">
            {title}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {isPaid ? (
            <span className="text-base font-extrabold text-slate-900 hidden sm:block">
              {priceDisplay}
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 dark:border-emerald-500/25">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Free Course
            </span>
          )}

          <div className="min-w-[180px] sm:min-w-[210px]">
            <EnrollmentButton
              resourceType="COURSE"
              resourceId={courseId}
              initialState={initialState}
              pendingReason={pendingReason}
              className="rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md shadow-[0_8px_24px_-8px_rgba(20,20,43,0.45)] hover:shadow-[0_12px_28px_-8px_rgba(20,20,43,0.5)] font-semibold"
              onStateChange={(state) => {
                if (state === 'ENROLLED' && onEnroll) {
                  onEnroll();
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Dedicated Public View Component                              */
/* ------------------------------------------------------------------ */

export interface CoursePublicViewProps {
  courseId?: string;
}

export function CoursePublicView({ courseId: propCourseId }: CoursePublicViewProps) {
  const params = useParams<{ id?: string }>();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const courseId = propCourseId || (params?.id as string) || '';

  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const handleReportSubmit = async (combinedNote: string) => {
    await api.post('/api/v1/reports', {
      contentId: courseId,
      contentType: 'COURSE',
      note: combinedNote,
    });
    toast.success('Course reported. Our moderation team will review it shortly.');
  };

  const titleFromQuery = searchParams.get('title');

  const { data: myEnrollment } = useMyEnrollmentForResourceQuery(
    'COURSE',
    courseId || undefined,
    Boolean(user)
  );
  const isEnrolled = myEnrollment?.enrollment?.accessState === 'ACCESSIBLE';

  const handleEnrollSuccess = () => {};

  useEffect(() => {
    if (courseId) {
      api
        .get<CourseResponse>(`/api/v1/public/courses/${courseId}`)
        .then(setCourse)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [courseId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-surface theme-page-bg flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
      </main>
    );
  }

  const displayTitle = titleFromQuery || course?.title || getTitleFromSlug(courseId) || COURSE_TITLE;
  const authorName = course?.authorName;
  const authorUsername = course?.authorUsername;
  const authorAvatarUrl = course?.authorAvatarUrl;
  const lessonCount = course?.modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0) || 0;
  const moduleCount = course?.modules.length || 0;

  const enrollmentStatus = myEnrollment?.enrollment?.enrollmentStatus;
  const enrollButtonState: 'ENROLLED' | 'NOT_ENROLLED' | 'PENDING' | 'WAITLISTED' = isEnrolled
    ? 'ENROLLED'
    : myEnrollment?.enrollment?.waitlisted
      ? 'WAITLISTED'
      : enrollmentStatus === 'PENDING' || enrollmentStatus === 'REQUESTED'
        ? 'PENDING'
        : 'NOT_ENROLLED';
  const pendingReason = myEnrollment?.enrollment?.requiresPayment ? 'PAYMENT' : 'REQUIREMENTS';

  const hasBadge = (course?.badges && course.badges.length > 0) || false;
  const hasExam = Boolean(course?.hasExam);

  return (
    <main className="min-h-screen w-full bg-surface theme-page-bg theme-wallpaper-frost text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 pt-20 sm:pt-24 pb-28 sm:pb-32 space-y-8">
        {/* Two-Column Hero Section with /learn Aesthetics */}
        <CourseHero
          title={displayTitle}
          description={course?.description}
          authorName={authorName}
          authorUsername={authorUsername}
          authorAvatarUrl={authorAvatarUrl}
          lessonCount={lessonCount}
          moduleCount={moduleCount}
          duration={course?.duration}
          enrollmentCount={course?.enrollmentCount}
          onEnroll={handleEnrollSuccess}
          isEnrolled={isEnrolled}
          initialState={enrollButtonState}
          pendingReason={pendingReason}
          channel={course?.channel}
          collaborators={course?.collaborators}
          authorId={course?.authorId}
          pricingModel={course?.pricingModel}
          priceAmount={course?.priceAmount}
          currency={course?.currency}
          courseId={courseId}
          hasBadge={hasBadge}
          hasExam={hasExam}
          onReportClick={() => setReportModalOpen(true)}
        />

        {/* Tabbed Content Navigation & Details Sections */}
        <CourseTabs
          courseTitle={displayTitle}
          course={course}
          courseId={courseId}
        />
      </div>

      {/* Sticky Bottom Bar on Scroll */}
      <StickyEnrollBar
        title={displayTitle}
        pricingModel={course?.pricingModel}
        priceAmount={course?.priceAmount}
        currency={course?.currency}
        courseId={courseId}
        initialState={enrollButtonState}
        pendingReason={pendingReason}
        onEnroll={handleEnrollSuccess}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmit={handleReportSubmit}
        title="Report Course"
        description="Help us understand what is wrong with this course."
        contentType="COURSE"
      />
    </main>
  );
}
