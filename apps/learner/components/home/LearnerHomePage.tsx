'use client';

import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { motion } from 'framer-motion';
import {
  Search,
  BookOpen,
  ChevronRight,
  ArrowUpRight,
  ArrowRight,
  Code2,
  Brain,
  Palette,
  Cloud,
  Zap,
  Terminal,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/infrastructure/http/api';
import { usePublicCoursesPage } from '@/shared/hooks/usePublicCourses';
import type { CourseSummaryResponse } from '@/shared/types/api.types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLoading from '@/app/(authenticated)/loading';
import { useActivitySummaryQuery, useDailyActivityQuery } from '@/domains/learning';
import { useMyEnrollmentsQuery } from '@/domains/enrollment';
import GradientText from '@/apps/public/components/landing/GradientText';
import { getPublishedEvents } from '@/app/(public)/events/api/event.service';
import type { EventDto } from '@/app/(public)/events/types/event.types';
import { DeliveryMode } from '@/app/(authenticated)/studio/events/types';
import { getDynamicGreeting, HOME_SEEN_KEY } from './greeting';
import { StreakCalendar } from './StreakCalendar';
import { SuperSearchModal } from './SuperSearchModal';
import {
  FALLBACK_EVENTS,
  pickDailyEvents,
  ResumeAndEventsSection,
  type EventCard,
  type ResumeCourse,
} from './ResumeAndEventsSection';
const NAME_GRADIENT = [
  '#4C6FFF',
  '#0EA5E9',
  '#06B6D4',
  '#1DB876',
  '#F59E0B',
  '#FF6B4A',
  '#EC4899',
  '#9B5DE5',
  '#6366F1',
  '#4C6FFF',
];

/**
 * How many courses to consider when picking the four recommendation cards. Enough that removing
 * the learner's existing enrolments still leaves a full set, without fetching the catalogue.
 */
const RECOMMENDATION_POOL_SIZE = 24;

const RECOMMEND_HOVER_BORDERS = [
  'hover:border-[#4C6FFF]',
  'hover:border-[#FF6B4A]',
  'hover:border-[#1DB876]',
  'hover:border-[#9B5DE5]',
  'hover:border-[#F59E0B]',
  'hover:border-[#0EA5E9]',
];

const COURSE_ICON_CONFIG = [
  { bg: 'bg-[#4C6FFF]/12', text: 'text-[#4C6FFF]', border: 'border-[#4C6FFF]/25', icon: Code2 },
  { bg: 'bg-[#1DB876]/12', text: 'text-[#1DB876]', border: 'border-[#1DB876]/25', icon: Brain },
  { bg: 'bg-[#FF6B4A]/12', text: 'text-[#FF6B4A]', border: 'border-[#FF6B4A]/25', icon: Zap },
  { bg: 'bg-[#9B5DE5]/12', text: 'text-[#9B5DE5]', border: 'border-[#9B5DE5]/25', icon: Palette },
  { bg: 'bg-[#0EA5E9]/12', text: 'text-[#0EA5E9]', border: 'border-[#0EA5E9]/25', icon: Cloud },
  { bg: 'bg-[#F59E0B]/12', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/25', icon: Terminal },
];

const EVENT_TONES: EventCard['tone'][] = ['coral', 'blue', 'emerald', 'violet'];

function deliveryLabel(mode?: DeliveryMode | string) {
  switch (mode) {
    case DeliveryMode.ONLINE:
      return 'Online';
    case DeliveryMode.OFFLINE:
      return 'On campus';
    case DeliveryMode.HYBRID:
      return 'Hybrid';
    case DeliveryMode.RECORDED:
      return 'Recorded';
    default:
      return 'Open event';
  }
}

function eventToCard(e: EventDto, index: number): EventCard {
  const typeLabel = String(e.eventType || 'Event')
    .toLowerCase()
    .replace(/_/g, ' ');
  return {
    id: e.id,
    title: e.title,
    tagline:
      e.subtitle ||
      e.description?.slice(0, 90) ||
      `${typeLabel.charAt(0).toUpperCase()}${typeLabel.slice(1)} · ${e.category || 'General'}`,
    when: new Date(e.updatedAt || e.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
    where: deliveryLabel(e.deliveryMode as DeliveryMode),
    seats:
      typeof e.capacity === 'number' && e.capacity > 0
        ? `${e.capacity} seats`
        : 'Open registration',
    tone: EVENT_TONES[index % EVENT_TONES.length],
    href: `/events/${e.slug || e.id}`,
    statusLabel: typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1),
  };
}

/** Stable daily shuffle so recommendations change without jumping every refresh. */
function pickDailyCourses(pool: CourseSummaryResponse[], count: number): CourseSummaryResponse[] {
  if (pool.length <= count) return pool;
  const day = Math.floor(Date.now() / 86_400_000);
  const scored = pool.map((course, i) => {
    const seed = (day * 31 + i * 17 + course.id.charCodeAt(0)) % 997;
    return { course, seed };
  });
  scored.sort((a, b) => a.seed - b.seed);
  return scored.slice(0, count).map((s) => s.course);
}

export default function LearnerHomePage() {
  const { user, status } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [hasSeenHomeBefore, setHasSeenHomeBefore] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<EventCard[]>([]);
  const [superSearchOpen, setSuperSearchOpen] = useState(false);

  // ⌘K / Ctrl+K opens the super search from anywhere on the dashboard home, not just by clicking
  // the search bar — the shortcut a command palette is expected to answer to.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSuperSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const seen = typeof window !== 'undefined' && localStorage.getItem(HOME_SEEN_KEY);
    setHasSeenHomeBefore(!!seen);
    if (!seen) localStorage.setItem(HOME_SEEN_KEY, '1');
  }, []);

  // A page of candidates, not the catalogue. This used to fetch every published course —
  // 1.68 MB over 2.35 s — in order to show four recommendation cards. The pool only has to be
  // large enough that filtering out already-enrolled courses still leaves four.
  // A bounded pool, not a browsable list — four cards are chosen from it, so there is nothing to
  // scroll and no reason for the infinite variant.
  const { courses, isLoading: coursesLoading } = usePublicCoursesPage({
    size: RECOMMENDATION_POOL_SIZE,
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (!coursesLoading) setLoading(false);
  }, [coursesLoading]);

  useEffect(() => {
    getPublishedEvents({ size: 12 })
      .then((page) => {
        const list = page?.content ?? [];
        if (list.length > 0) {
          const mapped = list.map(eventToCard);
          setUpcomingEvents(pickDailyEvents(mapped, 3));
        } else {
          setUpcomingEvents(pickDailyEvents(FALLBACK_EVENTS, 3));
        }
      })
      .catch(() => {
        setUpcomingEvents(pickDailyEvents(FALLBACK_EVENTS, 3));
      });
  }, []);

  // Bounded 400-day trailing window (backend's max range) — canonical LearnerDailyActivity
  // source, not TimeLog (see docs/architecture/LEARNING_ACTIVITY_STREAK.md).
  const { activityFromISO, activityToISO } = useMemo(() => {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 399);
    return {
      activityFromISO: from.toISOString().split('T')[0],
      activityToISO: to.toISOString().split('T')[0],
    };
  }, []);
  const { data: activitySummary } = useActivitySummaryQuery(Boolean(user));
  const { data: dailyActivity } = useDailyActivityQuery(activityFromISO, activityToISO, Boolean(user));
  const activityByDate = useMemo(() => {
    const map: Record<string, number> = {};
    (dailyActivity ?? []).forEach((d) => {
      map[d.date] = d.activityCount;
    });
    return map;
  }, [dailyActivity]);

  /**
   * The learner's own course enrollments, from the D2 read model.
   *
   * Replaces `user.enrolledCourses` (private learning state carried on the identity payload) plus
   * a follow-up `getCourseProgress` request. One bounded request now covers the resume card, the
   * enrolled count and the recommendation exclusion set — the percentage arrives already joined in
   * by the server, so there is no second round-trip and no N+1.
   *
   * `sort=updatedAt desc` puts the most recently touched enrollment first, which is what "resume"
   * means. Size 100 is the server's maximum page size: bounded by construction, and strictly less
   * data than the old profile payload, which carried the learner's entire enrollment list with no
   * limit at all.
   */
  const { data: myCourses } = useMyEnrollmentsQuery(
    { resourceType: 'COURSE', page: 0, size: 100, sort: 'updatedAt', direction: 'desc' },
    Boolean(user),
  );

  // Derived, not stored: the resume card is a pure projection of the query result, so there is no
  // second copy of server state to fall out of sync.
  const resumeCourse: ResumeCourse | null = useMemo(() => {
    const rows = myCourses?.content ?? [];
    // Only an ACCESSIBLE enrollment can be resumed: a pending (unpaid) or revoked one must never
    // present a "Continue Learning" button that leads to a locked course.
    const pick =
      rows.find((r) => r.accessState === 'ACCESSIBLE' && r.progressState === 'IN_PROGRESS') ??
      rows.find((r) => r.accessState === 'ACCESSIBLE' && r.progressState === 'NOT_STARTED') ??
      null;

    if (!pick) return null;

    return {
      id: pick.resourceId,
      title: pick.title ?? 'Your course',
      coverImageUrl: pick.imageUrl,
      // Passed through verbatim: null stays null and renders as "Not tracked", never as 0%.
      progress: pick.progressPercent,
      authorName: null,
    };
  }, [myCourses]);

  const streak = activitySummary?.currentStreak ?? 0;
  const enrolledCount = myCourses?.totalElements ?? 0;

  const recommendedCourses = useMemo(() => {
    const enrolledIds = new Set((myCourses?.content ?? []).map((r) => r.resourceId));
    const pool = courses.filter((c) => !enrolledIds.has(c.id));
    const source = pool.length > 0 ? pool : courses;
    return pickDailyCourses(source, 4);
  }, [courses, myCourses]);

  const greeting = useMemo(
    () =>
      getDynamicGreeting({
        firstName: user?.firstName || user?.fullName,
        userKey: user?.id || user?.username || user?.email || user?.firstName,
        createdAt: user?.createdAt,
        enrolledCount,
        streak,
        hasSeenHomeBefore,
      }),
    [user, enrolledCount, streak, hasSeenHomeBefore],
  );

  const parsedGreeting = useMemo(() => {
    const beforeStr = greeting.before ? greeting.before.trim() : '';
    const words = beforeStr ? beforeStr.split(/\s+/) : [];

    let line1 = '';
    let line2 = '';
    let line3 = `${greeting.name}${greeting.after}`;

    if (words.length >= 2) {
      line1 = words.slice(0, -1).join(' ');
      line2 = words[words.length - 1];
    } else if (words.length === 1) {
      line1 = words[0];
      line2 = '';
    }

    return { line1, line2, line3 };
  }, [greeting]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSuperSearchOpen(true);
  };

  if (status === 'loading' || !user) return <DashboardLoading />;

  return (
    <div
      className="relative w-full min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 35%, #FFFFFF 70%)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          backgroundImage: [
            'radial-gradient(ellipse 50% 40% at 10% 20%, rgba(59,130,246,0.12) 0%, transparent 60%)',
            'radial-gradient(ellipse 40% 35% at 90% 15%, rgba(255,107,74,0.09) 0%, transparent 55%)',
          ].join(', '),
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-9 px-4 pb-20 pt-28 md:space-y-10 md:px-8 md:pt-32">
        <section className="grid items-start gap-6 lg:grid-cols-[1.2fr_0.85fr] lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="max-w-xl text-left flex flex-col items-start select-none">
              {/* Line 1: Script font, dark color with sparkle accent */}
              {parsedGreeting.line1 && (
                <div className="relative inline-flex items-center gap-1.5">
                  <span className="font-script text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide text-[#14142b] dark:text-slate-100 leading-tight">
                    {parsedGreeting.line1}
                  </span>
                  {/* 3 Sparkle lines accent (matching top-right accent in Image 2) */}
                  <svg
                    className="ml-1 -mt-3 size-5 sm:size-6 text-[#4C6FFF] shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M12 3v3M18.36 5.64l-2.12 2.12M21 12h-3" />
                  </svg>
                </div>
              )}

              {/* Line 2: Sans-serif keyword in dark/black + Script font name with gradient */}
              <div className="relative inline-flex items-baseline flex-wrap gap-x-2.5 gap-y-1 my-0.5">
                {parsedGreeting.line2 && (
                  <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none text-[#14142b] cursor-default">
                    {parsedGreeting.line2}
                  </span>
                )}
                <GradientText
                  colors={NAME_GRADIENT}
                  animationSpeed={4.5}
                  className="font-script !cursor-default !text-4xl sm:!text-5xl md:!text-6xl lg:!text-7xl !font-bold !leading-none"
                >
                  {parsedGreeting.line3}
                </GradientText>
              </div>
            </h1>
            <p className="mt-2 max-w-md text-[14px] font-medium leading-relaxed text-slate-500">
              {greeting.subline}
            </p>

            <form onSubmit={handleSearch} className="relative mt-7 w-full max-w-lg">
              <div className="group relative flex items-center w-full rounded-full border border-slate-200/90 bg-white/95 pl-5 pr-1.5 py-1.5 shadow-[0_10px_30px_rgba(20,20,43,0.06)] transition-all focus-within:border-[#4C6FFF]/60 focus-within:shadow-[0_12px_36px_rgba(76,111,255,0.14)]">
                {/* Left Search Icon */}
                <div className="pointer-events-none flex items-center pr-3 text-slate-400 group-focus-within:text-[#4C6FFF] transition-colors shrink-0">
                  <Search size={20} strokeWidth={2.2} />
                </div>

                {/* Input Field — opens the super search modal rather than typing inline.
                    Opening on `onClick` (not `onFocus`/mousedown) matters: the dialog it opens
                    dismisses itself on an outside press, and if it mounted mid-click the paired
                    mouseup of that same click would land on the new backdrop and close it again
                    instantly. `onMouseDown` prevents the input from ever taking focus, and
                    `onClick` only fires once the browser has fully finished dispatching this
                    click on the original target — after which the dialog can safely mount. */}
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setSuperSearchOpen(true)}
                  readOnly
                  placeholder="Search courses, skills, mentors…"
                  className="block w-full cursor-pointer bg-transparent py-2 text-[14px] sm:text-[15px] font-medium text-[#14142b] outline-none placeholder:text-slate-400"
                />

                {/* Keyboard shortcut hint */}
                <kbd className="hidden shrink-0 items-center gap-0.5 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 sm:flex">
                  <span>⌘</span>K
                </kbd>

                {/* Right Circular Blue-Violet Gradient Search Button */}
                <button
                  type="submit"
                  aria-label="Search"
                  className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#4C6FFF] to-[#635BFF] text-white shadow-[0_6px_20px_rgba(76,111,255,0.38)] transition-all hover:scale-105 hover:shadow-[0_8px_24px_rgba(76,111,255,0.48)] active:scale-95 cursor-pointer ml-2"
                >
                  <Search size={20} strokeWidth={2.5} />
                </button>
              </div>
            </form>
          </motion.div>

          {/* Floating elevation wrapper for Streak Calendar - Fixed Height Container */}
          <div className="relative flex items-center justify-center h-[395px] shrink-0">
            {/* Ambient glow halo underneath */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-6 -bottom-2 h-16 rounded-[40px] blur-2xl opacity-70"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(76,111,255,0.20) 0%, rgba(255,107,74,0.15) 60%, transparent 100%)',
              }}
            />
            <div className="w-full h-full flex justify-center">
              <StreakCalendar activityByDate={activityByDate} streak={streak} />
            </div>
          </div>
        </section>

        <ResumeAndEventsSection
          resumeCourse={resumeCourse}
          events={upcomingEvents}
          recommendedCourses={recommendedCourses}
        />

        {((resumeCourse && (loading || recommendedCourses.length > 0)) ||
          (!resumeCourse && (loading || recommendedCourses.length > 1))) && (
          <section className="space-y-3.5">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-xl font-bold tracking-tight text-[#14142b]">
                {resumeCourse ? 'Recommended for you' : 'More recommendations'}
              </h2>
              <Link
                href="/search"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#4C6FFF] transition-colors hover:text-[#3a5ae6]"
              >
                View all <ChevronRight size={15} />
              </Link>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[96px] animate-pulse rounded-lg border border-slate-200 bg-white/70"
                  />
                ))}
              </div>
            ) : (resumeCourse ? recommendedCourses : recommendedCourses.slice(1)).length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white/60 px-5 py-10 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-slate-100">
                  <BookOpen size={18} className="text-slate-400" />
                </div>
                <h3 className="mb-0.5 text-base font-bold text-[#14142b]">No courses yet</h3>
                <p className="text-sm font-medium text-slate-500">
                  Published courses will show up here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {(resumeCourse ? recommendedCourses : recommendedCourses.slice(1)).map((course, i) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: 0.03 * i,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link
                      href={`/learn/${course.id}`}
                      className={`group flex items-center overflow-hidden rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-md rounded-bl-md border border-slate-200/80 bg-white/95 p-3.5 sm:p-4 shadow-[0_4px_18px_rgba(20,20,43,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(20,20,43,0.07)] ${RECOMMEND_HOVER_BORDERS[i % RECOMMEND_HOVER_BORDERS.length]}`}
                    >
                      <div className="relative h-[80px] w-[96px] shrink-0 overflow-hidden rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-xs rounded-bl-xs bg-slate-100 sm:h-[88px] sm:w-[110px]">
                        <img
                          src={
                            course.coverImageUrl ||
                            'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80'
                          }
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-center pl-3.5 pr-2 sm:pl-4">
                        <div className="mb-0.5 flex items-center gap-2">
                          <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            {course.authorName || 'Instructor'}
                          </span>
                        </div>
                        <h3 className="truncate text-[15px] font-bold tracking-tight text-[#14142b]">
                          {course.title}
                        </h3>
                        <p className="mt-0.5 line-clamp-1 text-[12px] font-medium text-slate-500">
                          {course.description ||
                            `${course.moduleCount} modules · Self-paced`}
                        </p>
                      </div>

                      <div className="hidden items-center pr-2 sm:flex">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-colors group-hover:border-current group-hover:text-[#14142b]">
                          <ArrowUpRight size={15} />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <SuperSearchModal
        open={superSearchOpen}
        onOpenChange={setSuperSearchOpen}
        initialQuery={query}
      />
    </div>
  );
}

