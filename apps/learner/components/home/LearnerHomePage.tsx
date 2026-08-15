'use client';

import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { motion } from 'framer-motion';
import { Search, BookOpen, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/infrastructure/http/api';
import type { CourseResponse } from '@/shared/types/api.types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLoading from '@/app/(authenticated)/loading';
import { UserService } from '@/domains/identity';
import { courseProgressService } from '@/domains/learning/progress/api/courseProgress';
import GradientText from '@/apps/public/components/landing/GradientText';
import { getPublishedEvents } from '@/app/(public)/events/api/event.service';
import type { EventDto } from '@/app/(public)/events/types/event.types';
import { DeliveryMode } from '@/app/(authenticated)/studio/events/types';
import { getDynamicGreeting, HOME_SEEN_KEY } from './greeting';
import { StreakCalendar } from './StreakCalendar';
import {
  FALLBACK_EVENTS,
  pickDailyEvents,
  ResumeAndEventsSection,
  type EventCard,
  type ResumeCourse,
} from './ResumeAndEventsSection';
import { HomeRoadmapPreview } from './HomeRoadmapPreview';
import { ColorThemeProjectCard, CardColorTheme } from '@/features/roadmap/renderer/components/ColorThemeProjectCard';
import { RoadmapProjectDetailView, RoadmapProjectDetail } from '@/features/roadmap/renderer/components/RoadmapProjectDetailView';
import { Code, Layout, FileText, Cloud as CloudIcon } from 'lucide-react';

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

const RECOMMEND_HOVER_BORDERS = [
  'hover:border-[#4C6FFF]',
  'hover:border-[#FF6B4A]',
  'hover:border-[#1DB876]',
  'hover:border-[#9B5DE5]',
  'hover:border-[#F59E0B]',
  'hover:border-[#0EA5E9]',
];

const EVENT_TONES: EventCard['tone'][] = ['coral', 'blue', 'emerald', 'violet'];

function computeStreak(activityByDate: Record<string, number>) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const target = new Date(today);
    target.setDate(today.getDate() - i);
    const iso = target.toISOString().split('T')[0];
    const minutes = Math.floor((activityByDate[iso] ?? 0) / 60);
    if (minutes > 0) streak++;
    else if (i === 0) continue;
    else break;
  }
  return streak;
}

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
function pickDailyCourses(pool: CourseResponse[], count: number): CourseResponse[] {
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
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityByDate, setActivityByDate] = useState<Record<string, number>>({});
  const [query, setQuery] = useState('');
  const [hasSeenHomeBefore, setHasSeenHomeBefore] = useState(true);
  const [resumeCourse, setResumeCourse] = useState<ResumeCourse | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<EventCard[]>([]);

  useEffect(() => {
    const seen = typeof window !== 'undefined' && localStorage.getItem(HOME_SEEN_KEY);
    setHasSeenHomeBefore(!!seen);
    if (!seen) localStorage.setItem(HOME_SEEN_KEY, '1');
  }, []);

  useEffect(() => {
    api
      .get<CourseResponse[]>('/api/v1/public/courses')
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getPublishedEvents({ size: 12 })
      .then((page) => {
        const list = page?.content ?? [];
        if (list.length > 0) {
          const mapped = list.map(eventToCard);
          setUpcomingEvents(pickDailyEvents(mapped, 2));
        } else {
          setUpcomingEvents(pickDailyEvents(FALLBACK_EVENTS, 2));
        }
      })
      .catch(() => {
        setUpcomingEvents(pickDailyEvents(FALLBACK_EVENTS, 2));
      });
  }, []);

  useEffect(() => {
    if (!user?.username) return;
    UserService.getUserActivity(user.username)
      .then((data) => {
        const map: Record<string, number> = {};
        data.forEach((item) => {
          map[item.date] = item.secondsSpent;
        });
        setActivityByDate(map);
      })
      .catch(() => setActivityByDate({}));
  }, [user?.username]);

  // Pick most recent in-progress enrollment for Resume learning
  useEffect(() => {
    const enrolled = user?.enrolledCourses;
    if (!enrolled?.length) {
      setResumeCourse(null);
      return;
    }

    const candidates = [...enrolled]
      .filter((c: any) => {
        const s = String(c.status || '').toLowerCase();
        return s !== 'completed' && s !== 'dropped';
      })
      .sort((a: any, b: any) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
      });

    const pick = candidates[0] || enrolled[0];
    if (!pick?.courseId) {
      setResumeCourse(null);
      return;
    }

    const coverFromCatalog = courses.find((c) => c.id === pick.courseId)?.coverImageUrl;

    setResumeCourse({
      id: pick.courseId,
      title: pick.title || 'Your course',
      coverImageUrl: coverFromCatalog || pick.coverImageUrl,
      progress: 0,
      authorName: pick.authorName || pick.instructor,
    });

    courseProgressService
      .getCourseProgress(pick.courseId)
      .then((p) => {
        setResumeCourse((prev) =>
          prev && prev.id === pick.courseId
            ? { ...prev, progress: p.percent ?? 0 }
            : prev,
        );
      })
      .catch(() => {});
  }, [user?.enrolledCourses, courses]);

  const streak = useMemo(() => computeStreak(activityByDate), [activityByDate]);
  const enrolledCount = user?.enrolledCourses?.length ?? 0;

  const recommendedCourses = useMemo(() => {
    const enrolledIds = new Set(
      (user?.enrolledCourses || []).map((c: any) => c.courseId).filter(Boolean),
    );
    const pool = courses.filter((c) => !enrolledIds.has(c.id));
    const source = pool.length > 0 ? pool : courses;
    return pickDailyCourses(source, 4);
  }, [courses, user?.enrolledCourses]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  const [selectedProject, setSelectedProject] = useState<RoadmapProjectDetail | null>(null);

  const homeProjects = useMemo<RoadmapProjectDetail[]>(() => [
    {
      id: 'proj-1',
      title: 'Single-Page CV Website',
      description: 'Build a clean, semantic single-page resume site to present your professional experience, technical skills, and key projects.',
      difficulty: 'beginner',
      category: 'HTML & CSS',
      colorTheme: 'yellow',
      membersCount: '25,850 Learners',
      timeAgo: 'Est. 2-3 Hours',
      overview: 'Build a clean, semantic single-page resume site to present your professional experience, technical skills, and key projects.',
      userStories: [
        'The layout must render cleanly across mobile, tablet, and desktop screens.',
        'All semantic HTML tags (<header>, <main>, <section>, <footer>) must be used properly.',
        'No horizontal scrollbars should appear on mobile viewport widths (320px+).',
        'Page must pass W3C HTML markup validation without critical errors.',
      ],
      starterCode: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Single-Page CV</title>\n</head>\n<body>\n  <header><h1>Alex Rivera</h1></header>\n</body>\n</html>`,
      tasks: [
        { id: 'proj-1-t1', title: 'HTML Setup', description: 'Create semantic HTML5 structure with <header>, <main>, and <footer> tags.' },
        { id: 'proj-1-t2', title: 'Responsive Styling', description: 'Add Google Fonts, flexbox container layouts, and mobile media queries.' },
        { id: 'proj-1-t3', title: 'Skills Badges', description: 'Add CSS hover styling for skill tags.' },
        { id: 'proj-1-t4', title: 'GitHub Deployment', description: 'Publish your CV live on GitHub Pages.' },
      ],
    },
    {
      id: 'proj-2',
      title: 'Multi-Page HTML Website',
      description: 'Design a structured multi-page website with semantic navigation links, contact form controls, and embedded media.',
      difficulty: 'intermediate',
      category: 'HTML & CSS',
      colorTheme: 'white',
      membersCount: '18,420 Learners',
      timeAgo: 'Est. 3-5 Hours',
      overview: 'Design a structured multi-page website with semantic navigation links, contact form controls, and embedded media.',
      userStories: [
        'The layout must render cleanly across mobile, tablet, and desktop screens.',
        'Navigation header must stay active across all 3 HTML pages.',
      ],
      starterCode: `<!-- index.html -->\n<!DOCTYPE html>\n<html lang="en">\n<head><title>Company</title></head>\n<body><nav><a href="index.html">Home</a></nav></body>\n</html>`,
      tasks: [
        { id: 'proj-2-t1', title: 'Navigation Bar', description: 'Build reusable navigation links across HTML pages.' },
        { id: 'proj-2-t2', title: 'Page Content Grid', description: 'Use CSS Grid to create multi-column feature sections.' },
        { id: 'proj-2-t3', title: 'Validated Contact Form', description: 'Add HTML5 input attributes for contact forms.' },
      ],
    },
    {
      id: 'proj-3',
      title: 'Personal Developer Portfolio',
      description: 'Craft a responsive personal portfolio featuring smooth section scrolling, dark mode theme toggles, and interactive project cards.',
      difficulty: 'advanced',
      category: 'CSS & Flexbox',
      colorTheme: 'green',
      membersCount: '14,910 Learners',
      timeAgo: 'Est. 4-6 Hours',
      overview: 'Craft a responsive personal portfolio featuring smooth section scrolling, dark mode theme toggles, and interactive project cards.',
      userStories: ['Dark mode toggle must switch CSS variables dynamically.'],
      starterCode: `:root { --bg: #ffffff; } [data-theme="dark"] { --bg: #0f172a; }`,
      tasks: [
        { id: 'proj-3-t1', title: 'CSS Theme Variables', description: 'Define CSS variables for light/dark themes.' },
        { id: 'proj-3-t2', title: 'Hero Section & Bio', description: 'Create an engaging hero section with profile badge.' },
        { id: 'proj-3-t3', title: 'Dark Mode Switcher', description: 'Add a theme toggle button.' },
      ],
    },
    {
      id: 'proj-4',
      title: 'Interactive Task Manager',
      description: 'Develop a web application with drag-and-drop task columns, localStorage data persistence, and category filter pills.',
      difficulty: 'beginner',
      category: 'JavaScript',
      colorTheme: 'blue',
      membersCount: '12,300 Learners',
      timeAgo: 'Est. 5-7 Hours',
      overview: 'Develop a web application with drag-and-drop task columns, localStorage data persistence, and category filter pills.',
      userStories: ['Tasks must persist across page refreshes using LocalStorage.'],
      starterCode: `const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');`,
      tasks: [
        { id: 'proj-4-t1', title: 'Task Board UI', description: 'Create columns for To Do, In Progress, and Completed.' },
        { id: 'proj-4-t2', title: 'JavaScript State Sync', description: 'Write functions to add and remove tasks from DOM.' },
      ],
    },
  ], []);

  if (status === 'loading' || !user) return <DashboardLoading />;

  return (
    <div
      className="relative w-full"
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

      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-9 px-4 pb-8 pt-28 md:space-y-10 md:px-8 md:pt-32">
        <section className="grid items-start gap-6 lg:grid-cols-[1.2fr_0.85fr] lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="max-w-xl text-[1.85rem] font-bold leading-[1.15] tracking-tight text-[#14142b] md:text-[2.35rem]">
              {greeting.before}
              <GradientText
                colors={NAME_GRADIENT}
                animationSpeed={4.5}
                className="!cursor-default !text-[1.05em] !font-extrabold"
              >
                {greeting.name}
              </GradientText>
              {greeting.after}
            </h1>
            <p className="mt-2 max-w-md text-[14px] font-medium leading-relaxed text-slate-500">
              {greeting.subline}
            </p>

            <form onSubmit={handleSearch} className="relative mt-6 max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Search size={18} className="text-slate-400" />
              </div>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses, skills, mentors…"
                className="block w-full rounded-full border border-slate-200 bg-white/95 py-3 pl-11 pr-24 text-[14px] font-medium text-[#14142b] outline-none placeholder:text-slate-400 shadow-[0_6px_20px_rgba(20,20,43,0.05)] focus:border-[#4C6FFF]/45 focus:ring-4 focus:ring-[#4C6FFF]/10"
              />
              <button
                type="submit"
                className="absolute inset-y-1.5 right-1.5 rounded-full bg-[#12141C] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#232735]"
              >
                Search
              </button>
            </form>

            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {[
                'Web Development',
                'UI/UX',
                'Data Science',
                'AI',
                'Machine Learning',
                'Cloud Computing',
                'Cybersecurity',
                'Mobile Apps',
                'DevOps',
                'Product Design',
              ].map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-slate-200/90 bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-white hover:text-[#14142b]"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </motion.div>

          <StreakCalendar activityByDate={activityByDate} streak={streak} />
        </section>

        {selectedProject ? (
          <div className="fixed inset-0 z-50 bg-[#F8FAFC] overflow-y-auto pt-16">
            <RoadmapProjectDetailView
              project={selectedProject}
              onBack={() => setSelectedProject(null)}
            />
          </div>
        ) : (
          <>
            <HomeRoadmapPreview />

            {/* FEATURED COMPACT PRACTICE PROJECTS SECTION */}
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-[#14142b]">
                    Featured Practice Projects
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Interactive hands-on labs with step-by-step task checklists & starter templates.
                  </p>
                </div>
                <Link
                  href="/roadmap/f6e2eee0-dd8a-4405-b35b-470000d0450b"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#4C6FFF] transition-colors hover:text-[#3a5ae6]"
                >
                  View Roadmap <ChevronRight size={14} />
                </Link>
              </div>

              {/* 4-Column Compact Soft Pastel Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                {homeProjects.map((p) => {
                  const cardIcons = {
                    'proj-1': Code,
                    'proj-2': Layout,
                    'proj-3': FileText,
                    'proj-4': CloudIcon,
                  };
                  const IconComp = cardIcons[p.id as keyof typeof cardIcons] || Code;

                  return (
                    <div key={p.id} onClick={() => setSelectedProject(p)}>
                      <ColorThemeProjectCard
                        id={p.id}
                        title={p.title}
                        description={p.description}
                        membersCount={p.membersCount}
                        timeAgo={p.timeAgo}
                        colorTheme={p.colorTheme as CardColorTheme}
                        icon={IconComp}
                        onJoin={() => setSelectedProject(p)}
                        onShare={() => setSelectedProject(p)}
                      />
                    </div>
                  );
                })}
              </div>
            </section>

            <ResumeAndEventsSection resumeCourse={resumeCourse} events={upcomingEvents} />
          </>
        )}

        <section className="space-y-3.5">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-bold tracking-tight text-[#14142b]">
              Recommended for you
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
          ) : recommendedCourses.length === 0 ? (
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
              {recommendedCourses.map((course, i) => (
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
                    className={`group flex overflow-hidden rounded-lg border border-slate-200/80 bg-white/95 shadow-[0_4px_18px_rgba(20,20,43,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(20,20,43,0.07)] ${RECOMMEND_HOVER_BORDERS[i % RECOMMEND_HOVER_BORDERS.length]}`}
                  >
                    <div className="relative h-[88px] w-[96px] shrink-0 overflow-hidden bg-slate-100 sm:h-[96px] sm:w-[120px]">
                      <img
                        src={
                          course.coverImageUrl ||
                          'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80'
                        }
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center px-3.5 py-2.5 sm:px-4">
                      <div className="mb-0.5 flex items-center gap-2">
                        <span className="rounded-md bg-[#4C6FFF]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#3A56D4]">
                          Course
                        </span>
                        <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          {course.authorName || 'Instructor'}
                        </span>
                      </div>
                      <h3 className="truncate text-[15px] font-bold tracking-tight text-[#14142b]">
                        {course.title}
                      </h3>
                      <p className="mt-0.5 line-clamp-1 text-[12px] font-medium text-slate-500">
                        {course.description ||
                          `${course.modules?.length ?? 0} modules · Self-paced`}
                      </p>
                    </div>
                    <div className="hidden items-center pr-4 sm:flex">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-400 transition-colors group-hover:border-current group-hover:text-[#14142b]">
                        <ArrowUpRight size={15} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
