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
 * ------------------------------------------------------------------
 */

import { useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
import TextType from '@/shared/design-system/ui/TextType/TextType';
import { LibraryCard } from './LibraryCard';
import { EventRegistrationCard } from './EventRegistrationCard';
import { LearningActivityPanel } from './LearningActivityPanel';

const PAGE_SIZE = 12;

type Tab = 'courses' | 'events';

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

  const [tab, setTab] = useState<Tab>('courses');
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

          <div className="mt-1 min-h-[30px] flex items-center justify-center">
            <TextType
              as="p"
              className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold leading-relaxed max-w-lg mx-auto"
              text={[
                'Track active course progress',
                'Resume your latest modules',
                'See your registered events',
                'Keep up the great work!',
              ]}
              typingSpeed={50}
              deletingSpeed={25}
              pauseDuration={2200}
              showCursor
              cursorCharacter="|"
              loop
            />
          </div>
        </motion.div>

        {/* ── TOOLBAR: LEFT SEARCH | CENTER CAPSULE TABS | RIGHT SORT ── */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
          {/* LEFT: Search Icon Button (expands on click) */}
          <div className="w-full md:w-72 flex items-center justify-start shrink-0">
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
                    placeholder={tab === 'courses' ? 'Search courses...' : 'Search events...'}
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

          {/* CENTER: Arcade Signature Geometric Asymmetric Tabs */}
          <div
            id="learning-items-section"
            className="scroll-mt-24 flex items-center justify-center gap-2.5 sm:gap-3"
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
          </div>

          {/* RIGHT: Sort Dropdown */}
          <div className="w-full md:w-72 flex items-center justify-end shrink-0">
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
                    icon={BookOpen}
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
            ) : (
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
                    icon={Calendar}
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
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">{body}</p>
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-slate-900 dark:bg-white px-4 py-2 text-xs font-bold text-white dark:text-slate-900 hover:opacity-90 transition"
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
