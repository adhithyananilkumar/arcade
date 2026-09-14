'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps (learner) — orchestrator
 *
 * My Learning — the learner's workspace.
 *
 * DATA SOURCES (all backend-owned, all paginated server-side)
 *   Courses tab : GET /api/v1/me/enrollments?resourceType=COURSE   (D2 read model)
 *   Events tab  : GET /api/v1/me/events?timeframe=…                (D2 read model)
 *   Activity    : GET /api/v1/me/activity                          (LearnerDailyActivity)
 *
 * WHAT THIS REPLACED
 * The previous implementation read the learner's library off `user.enrolledCourses` — a private
 * learning list smuggled onto the identity payload — then fired one `getCourseProgress` request
 * per card (N+1), materialised the whole library in the browser, and filtered/sorted/paginated it
 * client-side. On top of that it invented: a keyword-based course category ("react" in the title
 * ⇒ "React"), a `progress || 40` fallback, a hardcoded Unsplash cover photo, five hardcoded
 * "learning history" log rows, a review submission that showed a success toast without any
 * backend call, a course-count-driven "Learning Journey" level, and a "Learning Time … Hours/Day"
 * chart built from page-presence timestamps.
 *
 * None of that survives. Every number on this page now comes from the server, and where the
 * server has nothing to say the UI says so rather than filling the gap.
 * ------------------------------------------------------------------
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Play,
  AlertCircle,
  Compass,
} from 'lucide-react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import {
  useMyEnrollmentsQuery,
  useMyEventsQuery,
  type EnrollmentRecordStatus,
  type EventTimeframe,
  type MyEnrollmentsQueryParams,
} from '@/domains/enrollment';
import TextType from '@/shared/design-system/ui/TextType/TextType';
import { LibraryCard } from './LibraryCard';
import { EventRegistrationCard } from './EventRegistrationCard';
import { LearningActivityPanel } from './LearningActivityPanel';
import { LearningJourneyPlaceholder } from './LearningJourneyPlaceholder';
import { progressDisplayFor, resourceHrefFor } from './enrollmentPresentation';

const PAGE_SIZE = 12;

/**
 * Tabs map 1:1 onto a backend resource type. The old Webinars / Workshops / Articles tabs are
 * gone: the backend enrollment `ResourceType` enum is `{COURSE, EVENT}` only, and webinar /
 * workshop / bootcamp are *subtypes of Event*, surfaced as `eventType` on each event card rather
 * than as separate tabs. "Articles" had no backend source at all and was permanently empty.
 */
type Tab = 'courses' | 'events';

/**
 * The two status scopes the backend actually supports on `/me/enrollments`.
 *
 * Omitting `status` yields the active library (GRANTED, PENDING, REQUESTED); `status=ALL` yields
 * full history including REVOKED and DENIED. There is deliberately no "Completed" option here:
 * completion is a *progress* state derived from lesson progress and course completions, not an
 * enrollment status, and the read model exposes no progress filter. Filtering client-side would
 * only filter the current page, which is worse than not offering it. See the implementation
 * report for the contract addition this would need.
 */
const STATUS_SCOPES = [
  { id: 'active', label: 'Active library', status: undefined },
  { id: 'all', label: 'All history', status: ['ALL'] as (EnrollmentRecordStatus | 'ALL')[] },
] as const;

const SORT_OPTIONS = [
  { id: 'recent', label: 'Recently enrolled', sort: 'enrolledAt', direction: 'desc' },
  { id: 'oldest', label: 'Oldest first', sort: 'enrolledAt', direction: 'asc' },
  { id: 'updated', label: 'Recently updated', sort: 'updatedAt', direction: 'desc' },
] as const;

const TIMEFRAMES: { id: EventTimeframe; label: string }[] = [
  { id: 'UPCOMING', label: 'Upcoming' },
  { id: 'PAST', label: 'Past' },
  { id: 'ALL', label: 'All' },
];

export default function MyLearningPage() {
  const { user } = useAuthStore();
  const isAuthenticated = Boolean(user);

  const [tab, setTab] = useState<Tab>('courses');
  const [statusScope, setStatusScope] = useState<(typeof STATUS_SCOPES)[number]['id']>('active');
  const [sortId, setSortId] = useState<(typeof SORT_OPTIONS)[number]['id']>('recent');
  const [coursePage, setCoursePage] = useState(0);
  const [timeframe, setTimeframe] = useState<EventTimeframe>('UPCOMING');
  const [eventPage, setEventPage] = useState(0);

  const courseParams: MyEnrollmentsQueryParams = useMemo(() => {
    const scope = STATUS_SCOPES.find((s) => s.id === statusScope) ?? STATUS_SCOPES[0];
    const sort = SORT_OPTIONS.find((s) => s.id === sortId) ?? SORT_OPTIONS[0];
    return {
      resourceType: 'COURSE',
      ...(scope.status ? { status: scope.status } : {}),
      page: coursePage,
      size: PAGE_SIZE,
      sort: sort.sort,
      direction: sort.direction,
    };
  }, [statusScope, sortId, coursePage]);

  const coursesQuery = useMyEnrollmentsQuery(courseParams, isAuthenticated);
  const eventsQuery = useMyEventsQuery(timeframe, eventPage, PAGE_SIZE, isAuthenticated);

  const courses = useMemo(() => coursesQuery.data?.content ?? [], [coursesQuery.data]);
  const events = eventsQuery.data?.content ?? [];

  /**
   * "Continue learning" is the first genuinely in-progress, accessible course on the page the
   * learner is currently looking at. It is not a separate query and it is not a guess: if no
   * course on this page is in progress, the panel simply does not render.
   */
  const continueItem = useMemo(
    () =>
      courses.find((c) => c.accessState === 'ACCESSIBLE' && c.progressState === 'IN_PROGRESS') ??
      null,
    [courses]
  );

  return (
    <div className="relative min-h-screen w-full text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/40">
      {/* Background — unchanged Arcade visual language */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 dark:hidden -z-10"
        style={{
          background: `
            radial-gradient(ellipse 65% 45% at 8% 12%, rgba(59, 130, 246, 0.05) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 92% 24%, rgba(16, 185, 129, 0.04) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 5% 52%, rgba(155, 93, 229, 0.03) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 6% 76%, rgba(14, 165, 233, 0.04) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 94% 76%, rgba(14, 165, 233, 0.04) 0%, transparent 60%),
            radial-gradient(ellipse 45% 35% at 48% 94%, rgba(249, 200, 70, 0.03) 0%, transparent 60%),
            linear-gradient(to bottom, #F8FAFC 0%, #FAFCFF 30%, #FFFFFF 60%, #F8FAFC 100%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 hidden dark:block -z-10 bg-slate-950"
        style={{
          background: `
            radial-gradient(ellipse 65% 45% at 8% 12%, rgba(59, 130, 246, 0.14) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 92% 24%, rgba(16, 185, 129, 0.10) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 5% 52%, rgba(155, 93, 229, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 6% 76%, rgba(14, 165, 233, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 94% 76%, rgba(14, 165, 233, 0.08) 0%, transparent 60%),
            linear-gradient(to bottom, #020617 0%, #0F172A 50%, #020617 100%)
          `,
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20 space-y-6">
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="pb-1 text-center flex flex-col items-center justify-center"
        >
          <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&display=swap');
            .font-serif-heading {
              font-family: 'Playfair Display', Georgia, Cambria, 'Times New Roman', Times, serif;
            }
            @keyframes gradientShift {
              0% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
              100% {
                background-position: 0% 50%;
              }
            }
            .animate-changing-gradient {
              background-size: 250% 250%;
              animation: gradientShift 4s ease infinite;
            }
          `}</style>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-heading text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2.5">
            <span>My</span>
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 via-indigo-600 to-teal-400 dark:from-blue-400 dark:via-sky-300 dark:to-teal-300 bg-clip-text text-transparent">
              Learning
            </span>
          </h1>
          <div className="mt-2 min-h-[20px] flex items-center justify-center">
            <TextType
              as="p"
              className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-md mx-auto"
              text={[
                'Track active course progress',
                'Resume your latest modules',
                'See your registered events',
                'Keep up the great work!',
              ]}
              typingSpeed={40}
              deletingSpeed={20}
              pauseDuration={2000}
              showCursor
              cursorCharacter="|"
              loop
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-9 lg:gap-10 items-start pt-2">
          {/* LEFT — library / events */}
          <div className="lg:col-span-9 space-y-6">
            {/* TABS */}
            <div
              id="learning-items-section"
              className="scroll-mt-24 flex flex-wrap items-center gap-2"
              role="tablist"
              aria-label="My Learning sections"
            >
              <TabButton
                active={tab === 'courses'}
                onClick={() => setTab('courses')}
                icon={BookOpen}
                label="Courses"
                count={coursesQuery.data?.totalElements}
              />
              <TabButton
                active={tab === 'events'}
                onClick={() => setTab('events')}
                icon={Calendar}
                label="Events"
                count={eventsQuery.data?.totalElements}
              />
            </div>

            {/* FILTER BAR — backend-supported options only */}
            <div className="flex flex-wrap items-center gap-2">
              {tab === 'courses' ? (
                <>
                  <FilterGroup label="Show">
                    {STATUS_SCOPES.map((s) => (
                      <Chip
                        key={s.id}
                        active={statusScope === s.id}
                        onClick={() => {
                          setStatusScope(s.id);
                          setCoursePage(0);
                        }}
                      >
                        {s.label}
                      </Chip>
                    ))}
                  </FilterGroup>
                  <FilterGroup label="Sort">
                    {SORT_OPTIONS.map((s) => (
                      <Chip
                        key={s.id}
                        active={sortId === s.id}
                        onClick={() => {
                          setSortId(s.id);
                          setCoursePage(0);
                        }}
                      >
                        {s.label}
                      </Chip>
                    ))}
                  </FilterGroup>
                </>
              ) : (
                <FilterGroup label="When">
                  {TIMEFRAMES.map((t) => (
                    <Chip
                      key={t.id}
                      active={timeframe === t.id}
                      onClick={() => {
                        setTimeframe(t.id);
                        setEventPage(0);
                      }}
                    >
                      {t.label}
                    </Chip>
                  ))}
                </FilterGroup>
              )}
            </div>

            {/* CONTENT */}
            {tab === 'courses' ? (
              <SectionState
                isLoading={coursesQuery.isLoading}
                isError={coursesQuery.isError}
                onRetry={() => coursesQuery.refetch()}
                isEmpty={courses.length === 0}
                empty={
                  <EmptyState
                    icon={BookOpen}
                    title={
                      statusScope === 'active'
                        ? 'Your library is empty'
                        : 'No enrollment history yet'
                    }
                    body="Courses you enrol in will appear here with their real progress."
                    ctaHref="/search"
                    ctaLabel="Browse courses"
                  />
                }
                skeletonKind="grid"
              >
                <motion.div
                  key={`courses-${statusScope}-${sortId}-${coursePage}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
                >
                  {courses.map((item, idx) => (
                    <LibraryCard key={item.enrollmentId} item={item} index={idx} />
                  ))}
                </motion.div>
                <Pagination
                  page={coursesQuery.data?.number ?? 0}
                  totalPages={coursesQuery.data?.totalPages ?? 1}
                  onChange={setCoursePage}
                />
              </SectionState>
            ) : (
              <SectionState
                isLoading={eventsQuery.isLoading}
                isError={eventsQuery.isError}
                onRetry={() => eventsQuery.refetch()}
                isEmpty={events.length === 0}
                empty={
                  <EmptyState
                    icon={Calendar}
                    title={
                      timeframe === 'UPCOMING'
                        ? 'No upcoming events'
                        : timeframe === 'PAST'
                          ? 'No past events'
                          : 'You have not registered for any events'
                    }
                    body="Workshops, webinars and bootcamps you register for appear here."
                    ctaHref="/events"
                    ctaLabel="Browse events"
                  />
                }
                skeletonKind="rows"
              >
                <motion.div
                  key={`events-${timeframe}-${eventPage}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5"
                >
                  {events.map((reg, idx) => (
                    <EventRegistrationCard
                      key={reg.enrollmentId}
                      registration={reg}
                      index={idx}
                    />
                  ))}
                </motion.div>
                <Pagination
                  page={eventsQuery.data?.number ?? 0}
                  totalPages={eventsQuery.data?.totalPages ?? 1}
                  onChange={setEventPage}
                />
              </SectionState>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-3 space-y-8">
            {continueItem && <ContinuePanel item={continueItem} />}
            <LearningJourneyPlaceholder />
          </div>
        </div>

        <LearningActivityPanel enabled={isAuthenticated} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Local presentation helpers
// ─────────────────────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-colors shadow-xs ${
        active
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
      }`}
    >
      <Icon size={15} className={active ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'} />
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black ${
            active ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {label}
      </span>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-colors ${
        active
          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
      }`}
    >
      {children}
    </button>
  );
}

/** Loading / error / empty / content — one place, so no branch is ever forgotten. */
function SectionState({
  isLoading,
  isError,
  onRetry,
  isEmpty,
  empty,
  skeletonKind,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  isEmpty: boolean;
  empty: React.ReactNode;
  skeletonKind: 'grid' | 'rows';
  children: React.ReactNode;
}) {
  if (isLoading) {
    return skeletonKind === 'grid' ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-72 rounded-tr-3xl rounded-bl-3xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 animate-pulse"
          />
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-tr-3xl rounded-bl-3xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-12 text-center border border-dashed border-rose-200 dark:border-rose-900/60 rounded-3xl space-y-3">
        <AlertCircle className="mx-auto text-rose-400" size={30} />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
          We could not load this right now.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="text-xs font-bold text-indigo-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (isEmpty) return <>{empty}</>;

  return <AnimatePresence mode="popLayout">{children}</AnimatePresence>;
}

function EmptyState({
  icon: Icon,
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
      <Icon className="mx-auto text-slate-300 dark:text-slate-700" size={32} />
      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{title}</p>
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
        {body}
      </p>
      <Link
        href={ctaHref}
        className="inline-flex items-center gap-1.5 mt-1 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
      >
        <Compass size={13} />
        {ctaLabel}
      </Link>
    </div>
  );
}

/** Server-side pagination controls. `page` is the backend's zero-based page number. */
function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (next: number) => void;
}) {
  if (totalPages <= 1) return null;

  const go = (next: number) => {
    onChange(Math.max(0, Math.min(next, totalPages - 1)));
    document.getElementById('learning-items-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2 border-t border-slate-200/60 dark:border-slate-800"
    >
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        Page <span className="font-bold text-slate-900 dark:text-white">{page + 1}</span> of{' '}
        <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => go(page - 1)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1 shadow-xs"
        >
          <ChevronLeft size={14} />
          <span>Previous</span>
        </button>
        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => go(page + 1)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1 shadow-xs"
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </nav>
  );
}

function ContinuePanel({
  item,
}: {
  item: import('@/domains/enrollment').LearnerEnrollmentSummary;
}) {
  const href = resourceHrefFor(item);
  const progress = progressDisplayFor(item);
  if (!href) return null;

  return (
    <section className="relative overflow-hidden rounded-tr-none rounded-bl-none rounded-tl-[2.5rem] rounded-br-[2.5rem] bg-slate-200/80 dark:bg-slate-800 p-[1px] shadow-xs hover:shadow-md transition-all">
      <div className="absolute inset-[-100%] opacity-100 animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_60%,#ec4899_80%,#8b5cf6_90%,#06b6d4_100%)]" />
      <div className="relative z-10 h-full w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-tr-none rounded-bl-none rounded-tl-[calc(2.5rem-1px)] rounded-br-[calc(2.5rem-1px)] p-5 sm:p-6 space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Continue learning
          </p>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
            {item.title ?? 'Untitled course'}
          </h3>
        </div>

        {progress.kind === 'bar' ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
              <span>Course progress</span>
              <span className="text-sky-500 dark:text-sky-400 font-extrabold">
                {progress.percent}%
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.percent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500/70 to-sky-400/70"
              />
            </div>
          </div>
        ) : (
          <p className="text-xs font-bold text-slate-400">{progress.label}</p>
        )}

        <Link
          href={href}
          className="w-full py-3 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-sky-500 via-indigo-600 to-purple-600 animate-changing-gradient hover:shadow-lg"
        >
          <Play size={13} className="fill-current" />
          <span>Resume</span>
        </Link>
      </div>
    </section>
  );
}

/** Exported for the route-level suspense/loading boundary. */
export function MyLearningLoading() {
  return (
    <div className="flex h-[calc(100vh-80px)] items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600" size={36} />
    </div>
  );
}
