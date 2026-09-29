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
 *   Exams tab   : GET /api/exams/hub/mine + /api/exams/grade-cards/mine
 *   Activity    : GET /api/v1/me/activity                          (LearnerDailyActivity)
 *
 * ------------------------------------------------------------------
 */

import { useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Compass,
  ChevronDown,
  Check,
  Search,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import {
  useMyEnrollmentsQuery,
  useMyEventsQuery,
  type MyEnrollmentsQueryParams,
} from '@/domains/enrollment';
import {
  ExamGradesDialog,
  ExamHubCardView,
  getMyGradeCards,
  getMyHubExams,
  type ExamHubCard,
  type GradeCardResponse,
} from '@/domains/assessments';
import { examRoutes } from '@/shared/routes/content.routes';
import { LibraryCard } from './LibraryCard';
import { EventRegistrationCard } from './EventRegistrationCard';
import { LearningActivityPanel } from './LearningActivityPanel';

const PAGE_SIZE = 12;

type Tab = 'courses' | 'events' | 'exams';

const LEARNING_MESSAGES = [
  'Track active course progress',
  'Resume your latest modules',
  'See your registered events',
  'Review your exam grade cards',
  'Keep up the great work!',
];

const SORT_OPTIONS = [
  { id: 'recent-activity', label: 'Recent Activity', sort: 'updatedAt', direction: 'desc' },
  { id: 'name-asc', label: 'Name [A-Z]', sort: 'title', direction: 'asc' },
  { id: 'name-desc', label: 'Name [Z-A]', sort: 'title', direction: 'desc' },
  { id: 'completed', label: 'Completed', sort: 'completedAt', direction: 'desc' },
  { id: 'completion-date', label: 'Last Completion date', sort: 'completedAt', direction: 'desc' },
  { id: 'enrollment-date', label: 'Enrollment Date', sort: 'enrolledAt', direction: 'desc' },
  { id: 'due-date', label: 'Due Date', sort: 'dueDate', direction: 'asc' },
] as const;

export default function MyLearningPage() {
  const { user } = useAuthStore();
  const isAuthenticated = Boolean(user);

  const shouldReduceMotion = useReducedMotion();
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LEARNING_MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const router = useRouter();
  // Deep links: /learning?tab=exams (where finished exams and grade cards point).
  const requestedTab = useSearchParams().get('tab');
  const [tab, setTab] = useState<Tab>(
    requestedTab === 'events' || requestedTab === 'exams' ? requestedTab : 'courses'
  );
  const [sortId, setSortId] = useState<(typeof SORT_OPTIONS)[number]['id']>('recent-activity');
  const [coursePage, setCoursePage] = useState(0);
  const [eventPage, setEventPage] = useState(0);

  const courseParams: MyEnrollmentsQueryParams = useMemo(() => {
    const sort = SORT_OPTIONS.find((s) => s.id === sortId) ?? SORT_OPTIONS[0];
    return {
      resourceType: 'COURSE',
      page: coursePage,
      size: PAGE_SIZE,
      sort: sort.sort,
      direction: sort.direction,
    };
  }, [sortId, coursePage]);

  const coursesQuery = useMyEnrollmentsQuery(courseParams, isAuthenticated);
  const upcomingEventsQuery = useMyEventsQuery('UPCOMING', eventPage, PAGE_SIZE, isAuthenticated);
  const pastEventsQuery = useMyEventsQuery('PAST', 0, PAGE_SIZE, isAuthenticated);

  // Exams: the ones the learner registered for (with where they stand), and their grade cards —
  // opened per exam from its card. Only fetched once the tab is opened.
  const myExamsQuery = useQuery({
    queryKey: ['exams', 'hub', 'mine'],
    queryFn: getMyHubExams,
    enabled: isAuthenticated && tab === 'exams',
  });
  const gradeCardsQuery = useQuery({
    queryKey: ['exams', 'grade-cards', 'mine'],
    queryFn: getMyGradeCards,
    enabled: isAuthenticated && tab === 'exams',
  });

  const rawCourses = useMemo(() => coursesQuery.data?.content ?? [], [coursesQuery.data]);
  const upcomingEventsRaw = useMemo(() => upcomingEventsQuery.data?.content ?? [], [upcomingEventsQuery.data]);
  const pastEventsRaw = useMemo(() => pastEventsQuery.data?.content ?? [], [pastEventsQuery.data]);

  // When 'completed' filter is selected, prioritize/filter completed courses or sort by completed
  const displayCourses = useMemo(() => {
    if (sortId === 'completed') {
      const completed = rawCourses.filter((c) => c.progressState === 'COMPLETED');
      const others = rawCourses.filter((c) => c.progressState !== 'COMPLETED');
      return [...completed, ...others];
    }
    return rawCourses;
  }, [rawCourses, sortId]);

  const displayEvents = useMemo(() => {
    const upcoming = upcomingEventsRaw.filter((e) => e.upcoming !== false);
    const past = pastEventsRaw.filter((e) => e.upcoming === false);
    const all = sortId === 'completed' ? [...past, ...upcoming] : [...upcoming, ...past];
    const copy = [...all];
    if (sortId === 'name-asc') {
      return copy.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
    }
    if (sortId === 'name-desc') {
      return copy.sort((a, b) => (b.title ?? '').localeCompare(a.title ?? ''));
    }
    if (sortId === 'due-date') {
      return copy.sort(
        (a, b) => new Date(a.firstSessionStartsAt ?? 0).getTime() - new Date(b.firstSessionStartsAt ?? 0).getTime()
      );
    }
    return copy.sort(
      (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
    );
  }, [upcomingEventsRaw, pastEventsRaw, sortId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Filter courses by search query
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return displayCourses;
    const q = searchQuery.toLowerCase().trim();
    return displayCourses.filter((c) => (c.title ?? '').toLowerCase().includes(q));
  }, [displayCourses, searchQuery]);

  // Filter events by search query
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return displayEvents;
    const q = searchQuery.toLowerCase().trim();
    return displayEvents.filter((e) => (e.title ?? '').toLowerCase().includes(q));
  }, [displayEvents, searchQuery]);

  // An exam's grades are its attempt cards on the plans listed here (certifications and standalone
  // exams). Assessments inside a tied course or event belong to that content, not to this tab.
  const gradesByExam = useMemo(() => {
    const map = new Map<string, GradeCardResponse[]>();
    for (const exam of myExamsQuery.data ?? []) {
      const planIds = new Set(exam.plans.map((pl) => pl.planId));
      const cards = (gradeCardsQuery.data ?? []).filter(
        (c) => c.kind === 'ATTEMPT' && c.examId === exam.examId && c.planId !== null && planIds.has(c.planId)
      );
      if (cards.length > 0) map.set(exam.examId, cards);
    }
    return map;
  }, [myExamsQuery.data, gradeCardsQuery.data]);
  const [gradesFor, setGradesFor] = useState<ExamHubCard | null>(null);

  const filteredExams = useMemo(() => {
    const exams = myExamsQuery.data ?? [];
    if (!searchQuery.trim()) return exams;
    const q = searchQuery.toLowerCase().trim();
    return exams.filter(
      (e) => (e.title ?? '').toLowerCase().includes(q) || (e.channelName ?? '').toLowerCase().includes(q)
    );
  }, [myExamsQuery.data, searchQuery]);

  return (
    <div className="relative min-h-screen w-full text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/40">
      {/* Background — vibrant ambient gradient matching Home and Explore pages */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 dark:hidden -z-10"
        style={{
          background: `
            radial-gradient(ellipse 55% 40% at 8% 12%, rgba(41, 98, 214, 0.16) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 92% 20%, rgba(39, 197, 216, 0.14) 0%, transparent 60%),
            radial-gradient(ellipse 45% 35% at 5% 50%, rgba(99, 102, 241, 0.09) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 95% 52%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 6% 78%, rgba(14, 165, 233, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 94% 80%, rgba(20, 184, 166, 0.11) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 50% 95%, rgba(44, 131, 245, 0.08) 0%, transparent 60%),
            linear-gradient(to bottom, #E9EEFB 0%, #F5F9FD 25%, #FFFFFF 50%, #FFFFFF 75%, #E8F7F8 100%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 hidden dark:block -z-10 bg-slate-950"
        style={{
          background: `
            radial-gradient(ellipse 65% 45% at 8% 12%, rgba(41, 98, 214, 0.22) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 92% 24%, rgba(39, 197, 216, 0.16) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 5% 52%, rgba(99, 102, 241, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 6% 76%, rgba(14, 165, 233, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 94% 76%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
            linear-gradient(to bottom, #020617 0%, #081126 35%, #0B1528 70%, #020617 100%)
          `,
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-20 space-y-6 sm:space-y-8">
        {/* PAGE HEADER / TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="pb-1 text-center flex flex-col items-center justify-center"
        >
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Satisfy&display=swap');
          `}</style>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-3 flex items-baseline justify-center flex-wrap gap-2.5">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block text-slate-900 dark:text-white font-extrabold text-4xl sm:text-5xl lg:text-6xl"
            >
              My
            </motion.span>

            <div className="relative inline-block pb-2">
              <motion.span
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] bg-clip-text text-transparent px-1 text-5xl sm:text-6xl lg:text-7xl font-bold italic"
                style={{ fontFamily: "'Dancing Script', 'Satisfy', 'Amira-Grace', cursive" }}
              >
                Learning
              </motion.span>

              {/* Blue-to-Cyan Gradient Curved Underline Stroke */}
              <motion.svg
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                viewBox="0 0 300 20"
                fill="none"
                className="absolute -bottom-1 left-0 w-full h-4 pointer-events-none"
              >
                <path
                  d="M 8 13 C 90 4, 210 3, 292 11"
                  stroke="url(#mylearningBrushGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="mylearningBrushGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2962D6" />
                    <stop offset="55%" stopColor="#2C83F5" />
                    <stop offset="100%" stopColor="#27C5D8" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </div>
          </h1>

          <div className="mt-1 relative h-[30px] flex items-center justify-center w-full max-w-lg mx-auto overflow-hidden">
            <AnimatePresence>
              <motion.p
                key={msgIndex}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold leading-relaxed text-center w-full px-4"
              >
                {LEARNING_MESSAGES[msgIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── TOOLBAR: LEFT TABS | RIGHT SEARCH & SORT ── */}
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2">
          {/* LEFT: Arcade Signature Geometric Asymmetric Tabs */}
          <div
            id="learning-items-section"
            className="scroll-mt-24 flex flex-wrap items-center justify-start gap-2.5 sm:gap-3 w-full md:w-auto shrink-0"
            role="tablist"
            aria-label="My Learning sections"
          >
            <TabButton
              active={tab === 'courses'}
              onClick={() => {
                setTab('courses');
                setSearchQuery('');
              }}
              label="Courses"
            />
            <TabButton
              active={tab === 'events'}
              onClick={() => {
                setTab('events');
                setSearchQuery('');
              }}
              label="Events"
            />
            <TabButton
              active={tab === 'exams'}
              onClick={() => {
                setTab('exams');
                setSearchQuery('');
              }}
              label="Exams"
            />
          </div>

          {/* RIGHT: Search & Sort Dropdown */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center justify-start md:justify-end gap-3 sm:gap-4 shrink-0">
            {/* Search Field */}
            <div className="w-full sm:w-64 flex items-center justify-start sm:justify-end shrink-0">
              <AnimatePresence initial={false}>
                {isSearchOpen || searchQuery ? (
                  <motion.div
                    key="search-input-field"
                    initial={{ opacity: 0, width: '40px' }}
                    animate={{ opacity: 1, width: '100%' }}
                    exit={{ opacity: 0, width: '40px' }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="relative w-full flex items-center"
                  >
                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                    />
                    <input
                      ref={(el) => {
                        searchInputRef.current = el;
                        if (el) {
                          el.focus();
                        }
                      }}
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setSearchQuery('');
                          setIsSearchOpen(false);
                        }
                      }}
                      placeholder={tab === 'courses' ? 'Search courses...' : tab === 'events' ? 'Search events...' : 'Search exams...'}
                      className="w-full pl-9 pr-8 py-2.5 rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-md rounded-bl-md text-xs sm:text-sm bg-transparent border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-700 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setIsSearchOpen(false);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      aria-label="Close search"
                      title="Close search"
                    >
                      <X size={15} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="search-icon-toggle"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.15 }}
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-center cursor-pointer"
                    aria-label="Open search"
                    title="Search"
                  >
                    <Search size={21} className="stroke-[2.2]" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Sort Dropdown — exams are ordered by the server (in progress first) */}
            <div className={`w-full sm:w-auto items-center justify-start sm:justify-end shrink-0 ${tab === 'exams' ? 'hidden' : 'flex'}`}>
              <SortDropdown
                selectedId={sortId}
                onChange={(id) => {
                  setSortId(id);
                  if (tab === 'courses') setCoursePage(0);
                  else setEventPage(0);
                }}
              />
            </div>
          </div>
        </div>

        {/* ── SECTION 2: LEARNING ACTIVITY (ALL COURSES / EVENTS) ────────── */}
        <section
          aria-label="Learning Activity"
          className="relative space-y-4 sm:space-y-5 pt-0"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Learning Activity
            </h2>
          </div>

          <div className="relative z-10 space-y-6">
            {/* CONTENT */}
            {tab === 'courses' ? (
              <SectionState
                isLoading={coursesQuery.isLoading}
                isError={coursesQuery.isError}
                onRetry={() => coursesQuery.refetch()}
                isEmpty={filteredCourses.length === 0}
                empty={
                  <EmptyState
                    tab="courses"
                    title={searchQuery ? 'No matching courses' : 'Your library is empty'}
                    body={
                      searchQuery
                        ? `No courses matched "${searchQuery}". Try a different search term.`
                        : 'Courses you enrol in will appear here with their real progress.'
                    }
                    ctaHref={searchQuery ? undefined : '/search'}
                    ctaLabel={searchQuery ? undefined : 'Browse courses'}
                  />
                }
                skeletonKind="grid"
              >
                <motion.div
                  key={`courses-${sortId}-${coursePage}-${searchQuery}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
                >
                  {filteredCourses.map((item, idx) => (
                    <LibraryCard key={item.enrollmentId} item={item} index={idx} />
                  ))}
                </motion.div>
                <Pagination
                  page={coursesQuery.data?.number ?? 0}
                  totalPages={coursesQuery.data?.totalPages ?? 1}
                  onChange={setCoursePage}
                />
              </SectionState>
            ) : tab === 'events' ? (
              <SectionState
                isLoading={upcomingEventsQuery.isLoading || pastEventsQuery.isLoading}
                isError={upcomingEventsQuery.isError || pastEventsQuery.isError}
                onRetry={() => {
                  upcomingEventsQuery.refetch();
                  pastEventsQuery.refetch();
                }}
                isEmpty={filteredEvents.length === 0}
                empty={
                  <EmptyState
                    tab="events"
                    title={searchQuery ? 'No matching events' : 'No upcoming events'}
                    body={
                      searchQuery
                        ? `No events matched "${searchQuery}". Try a different search term.`
                        : 'Workshops, webinars and bootcamps you register for appear here.'
                    }
                    ctaHref={searchQuery ? undefined : '/events'}
                    ctaLabel={searchQuery ? undefined : 'Browse events'}
                  />
                }
                skeletonKind="grid"
              >
                <motion.div
                  key={`events-${sortId}-${eventPage}-${searchQuery}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
                >
                  {filteredEvents.map((reg, idx) => (
                    <EventRegistrationCard
                      key={reg.enrollmentId}
                      registration={reg}
                      index={idx}
                    />
                  ))}
                </motion.div>
                <Pagination
                  page={upcomingEventsQuery.data?.number ?? 0}
                  totalPages={upcomingEventsQuery.data?.totalPages ?? 1}
                  onChange={setEventPage}
                />
              </SectionState>
            ) : (
              <div className="space-y-10">
                <SectionState
                  isLoading={myExamsQuery.isLoading}
                  isError={myExamsQuery.isError}
                  onRetry={() => myExamsQuery.refetch()}
                  isEmpty={filteredExams.length === 0}
                  empty={
                    <EmptyState
                      tab="exams"
                      title={searchQuery ? 'No matching exams' : 'No exams yet'}
                      body={
                        searchQuery
                          ? `No exams matched "${searchQuery}". Try a different search term.`
                          : 'Certifications and exams you register for appear here with where you stand.'
                      }
                      ctaHref={searchQuery ? undefined : examRoutes.catalogue}
                      ctaLabel={searchQuery ? undefined : 'Browse exams'}
                    />
                  }
                  skeletonKind="grid"
                >
                  <motion.div
                    key={`exams-${searchQuery}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
                  >
                    {filteredExams.map((card, idx) => (
                      <ExamHubCardView
                        key={card.examId}
                        card={card}
                        index={idx}
                        hideTypeAndFeeBadge
                        onOpen={() => router.push(examRoutes.landing(card.examId))}
                        onViewGrades={gradesByExam.has(card.examId) ? () => setGradesFor(card) : undefined}
                      />
                    ))}
                  </motion.div>
                </SectionState>

                <ExamGradesDialog
                  open={gradesFor !== null}
                  onOpenChange={(open) => !open && setGradesFor(null)}
                  examTitle={gradesFor?.title ?? ''}
                  cards={gradesFor ? gradesByExam.get(gradesFor.examId) ?? [] : []}
                  onOpenPrintable={(id) => router.push(examRoutes.gradeCard(id))}
                />
              </div>
            )}
          </div>
        </section>

        {/* ── SECTION 3: LEARNING ACTIVITY TIME CHART ────────────────────────── */}
        <section aria-label="Learning Activity Chart">
          <LearningActivityPanel enabled={isAuthenticated} />
        </section>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Local presentation helpers
// ─────────────────────────────────────────────────────────────────────────────

function SortDropdown({
  selectedId,
  onChange,
}: {
  selectedId: string;
  onChange: (id: (typeof SORT_OPTIONS)[number]['id']) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = SORT_OPTIONS.find((s) => s.id === selectedId) ?? SORT_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left z-20">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-md rounded-bl-md bg-transparent border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors select-none cursor-pointer"
      >
        <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">Sort by:</span>
        <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
          {selectedOption.label}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-1.5 w-56 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl py-2 z-50 overflow-hidden"
            role="listbox"
          >
            {SORT_OPTIONS.map((option) => {
              const isSelected = option.id === selectedId;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <span className="w-4 flex items-center justify-center shrink-0">
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                    )}
                  </span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
      className={`relative px-5 sm:px-6 py-2 rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-md rounded-bl-md text-xs sm:text-sm font-black tracking-tight transition-all duration-200 select-none cursor-pointer min-w-[96px] text-center ${
        active
          ? 'bg-white dark:bg-slate-900 text-[#2962D6] dark:text-[#3B82F6] border-2 border-[#2962D6] dark:border-[#3B82F6]'
          : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      <span className="relative z-10">{label}</span>
    </button>
  );
}

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
    return skeletonKind === 'grid' ? <GridSkeleton /> : <RowsSkeleton />;
  }
  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-3xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20 p-8 text-center"
      >
        <AlertCircle className="mx-auto h-8 w-8 text-rose-500 mb-2" />
        <p className="text-sm font-bold text-rose-900 dark:text-rose-200">
          We could not load this right now.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition"
        >
          Try again
        </button>
      </div>
    );
  }
  if (isEmpty) {
    return <>{empty}</>;
  }
  return <>{children}</>;
}

function CoursesDoodle() {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-3 flex items-center justify-center select-none"
    >
      <svg
        width="110"
        height="100"
        viewBox="0 0 110 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* Soft blue/indigo background glow ellipse */}
        <ellipse cx="55" cy="50" rx="38" ry="32" className="fill-[#2962D6]/10 dark:fill-[#3B82F6]/15" />

        {/* Tilted bottom book in stack */}
        <rect
          x="26"
          y="48"
          width="54"
          height="14"
          rx="4"
          transform="rotate(-4 26 48)"
          className="fill-slate-100 dark:fill-slate-800 stroke-slate-800 dark:stroke-slate-200"
          strokeWidth="2"
        />
        <path d="M72 45L78 45" className="stroke-[#2962D6] dark:stroke-[#3B82F6]" strokeWidth="2" strokeLinecap="round" />

        {/* Middle book in stack */}
        <rect
          x="30"
          y="34"
          width="50"
          height="14"
          rx="4"
          transform="rotate(2 30 34)"
          className="fill-white dark:fill-slate-900 stroke-slate-800 dark:stroke-slate-200"
          strokeWidth="2"
        />
        <path d="M34 37L48 37" className="stroke-emerald-500 dark:stroke-emerald-400" strokeWidth="2" strokeLinecap="round" />

        {/* Top open notebook / book */}
        <g transform="translate(32, 16)">
          {/* Left page */}
          <path
            d="M22 24C14 22 4 23 2 24V6C4 5 14 4 22 6V24Z"
            className="fill-white dark:fill-slate-900 stroke-slate-800 dark:stroke-slate-200"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Right page */}
          <path
            d="M22 24C30 22 40 23 42 24V6C40 5 30 4 22 6V24Z"
            className="fill-white dark:fill-slate-900 stroke-slate-800 dark:stroke-slate-200"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Center spine */}
          <line x1="22" y1="6" x2="22" y2="24" className="stroke-slate-800 dark:stroke-slate-200" strokeWidth="2" />
          {/* Left page text lines */}
          <line x1="6" y1="10" x2="18" y2="10" className="stroke-[#2962D6] dark:stroke-[#3B82F6]" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="6" y1="14" x2="15" y2="14" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="6" y1="18" x2="17" y2="18" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" strokeLinecap="round" />
          {/* Right page text lines */}
          <line x1="26" y1="10" x2="38" y2="10" className="stroke-emerald-500 dark:stroke-emerald-400" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="26" y1="14" x2="35" y2="14" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="26" y1="18" x2="37" y2="18" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Minimal Bookmark ribbon */}
        <path d="M72 26V38L75 35L78 38V26" className="fill-amber-400 stroke-slate-800 dark:stroke-slate-200" strokeWidth="1.2" strokeLinejoin="round" />

        {/* Sparkles */}
        <path d="M18 30L19 26L23 25L19 24L18 20L17 24L13 25L17 26Z" className="fill-amber-400 dark:fill-amber-300" />
        <path d="M90 24L91 21L94 20L91 19L90 16L89 19L86 20L89 21Z" className="fill-[#27C5D8]" />
      </svg>
    </motion.div>
  );
}

function EventsDoodle() {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-3 flex items-center justify-center select-none"
    >
      <svg
        width="110"
        height="100"
        viewBox="0 0 110 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* Soft cyan/teal background glow ellipse */}
        <ellipse cx="55" cy="50" rx="38" ry="32" className="fill-[#27C5D8]/10 dark:fill-[#27C5D8]/15" />

        {/* Calendar Body */}
        <rect
          x="30"
          y="22"
          width="50"
          height="56"
          rx="10"
          className="fill-white dark:fill-slate-900 stroke-slate-800 dark:stroke-slate-200"
          strokeWidth="2"
        />

        {/* Calendar Top Header Banner */}
        <path
          d="M31 34 C31 27 34 23 41 23 H69 C76 23 79 27 79 34 V36 H31 V34 Z"
          className="fill-[#2962D6]/20 dark:fill-[#2962D6]/40"
        />
        <line x1="30" y1="36" x2="80" y2="36" className="stroke-slate-800 dark:stroke-slate-200" strokeWidth="2" />

        {/* Calendar Rings / Binders at top */}
        <rect x="40" y="16" width="4" height="10" rx="2" className="fill-slate-800 dark:fill-slate-200" />
        <rect x="66" y="16" width="4" height="10" rx="2" className="fill-slate-800 dark:fill-slate-200" />

        {/* Calendar Grid Dates */}
        <circle cx="41" cy="45" r="2.5" className="fill-slate-300 dark:fill-slate-600" />
        <circle cx="55" cy="45" r="2.5" className="fill-slate-300 dark:fill-slate-600" />
        <circle cx="69" cy="45" r="2.5" className="fill-slate-300 dark:fill-slate-600" />

        <circle cx="41" cy="56" r="2.5" className="fill-slate-300 dark:fill-slate-600" />
        {/* Highlighted Event Date Star/Pill */}
        <rect x="49" y="50" width="12" height="12" rx="4" className="fill-[#2962D6] dark:fill-[#3B82F6]" />
        <path d="M53 56L54.5 57.5L57.5 54.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

        <circle cx="69" cy="56" r="2.5" className="fill-slate-300 dark:fill-slate-600" />

        <circle cx="41" cy="67" r="2.5" className="fill-slate-300 dark:fill-slate-600" />
        <circle cx="55" cy="67" r="2.5" className="fill-slate-300 dark:fill-slate-600" />
        <circle cx="69" cy="67" r="2.5" className="fill-[#27C5D8]" />

        {/* Sparkles */}
        <path d="M18 34L19 30L23 29L19 28L18 24L17 28L13 29L17 30Z" className="fill-amber-400 dark:fill-amber-300" />
        <path d="M88 26L89 23L92 22L89 21L88 18L87 21L84 22L87 23Z" className="fill-[#27C5D8]" />
      </svg>
    </motion.div>
  );
}

function EmptyState({
  tab,
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  tab: Tab;
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
      {tab === 'events' ? <EventsDoodle /> : <CoursesDoodle />}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">{body}</p>
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-slate-900 dark:bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-white dark:text-slate-900 hover:opacity-90 transition shadow-sm"
        >
          <Compass className="h-3.5 w-3.5" />
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-6 border-t border-slate-200/60 dark:border-slate-800">
      <span className="text-xs font-medium text-slate-500">
        Page {page + 1} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
          className="p-2 rounded-full border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => onChange(page + 1)}
          className="p-2 rounded-full border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-72 rounded-3xl bg-slate-200/70 dark:bg-slate-800/70"
        />
      ))}
    </div>
  );
}

function RowsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-24 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />
      ))}
    </div>
  );
}
