'use client';

// Redesigned My Learning Dashboard Page
// Vibrant Page Gradient Background with Pure White Card Surfaces

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { UserService } from "@/domains/identity";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  BookOpen,
  Clock,
  ArrowRight,
  Play,
  CheckCircle2,
  Search,
  Award,
  Bookmark,
  Calendar,
  Layers,
  Map,
  TrendingUp,
  Video,
  FileText,
  Wrench,
  Grid,
  ChevronRight,
  Lock,
  MoreVertical,
  Heart,
  Target,
  BarChart3,
  MessageSquare,
  Globe,
  Mail,
  Lightbulb,
  Home,
  PieChart,
  User,
  Filter,
  Compass,
  ArrowUpRight,
  GraduationCap,
  MonitorPlay,
  Newspaper,
  Hourglass,
  Activity,
  CalendarDays,
  Info,
  SlidersHorizontal,
  X,
  Sparkles,
  Bot,
  Cpu,
  Server,
  Users,
  Shield,
  Star
} from 'lucide-react';
import Link from 'next/link';

interface LearningItem {
  id: string;
  title: string;
  type: 'Course' | 'Webinar' | 'Workshop' | 'Article';
  category: string;
  status: 'In Progress' | 'Completed' | 'Upcoming' | 'Live';
  progress?: number; // Courses
  completedModules?: number;
  totalModules?: number;
  timeLeft?: string; // e.g. "8h 15m left"
  readTime?: string; // Articles
  instructor: string;
  date?: string;
  time?: string;
  coverImage: string;
  accentColor: string;
}

// Character Star 1: Angry Red Star with "AARGHH!" badge
const CharacterStar1 = ({ isSelected }: { isSelected: boolean }) => (
  <div className={`relative flex flex-col items-center justify-center transition-transform duration-200 ${isSelected ? 'scale-110' : ''}`}>
    <svg viewBox="0 0 100 100" className="w-11 h-11 sm:w-13 sm:h-13 drop-shadow-md">
      <polygon points="50,5 64,34 96,38 72,60 78,92 50,76 22,92 28,60 4,38 36,34" fill="#e54839" />
      <line x1="34" y1="36" x2="44" y2="42" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="66" y1="36" x2="56" y2="42" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
    <div className="absolute top-[46%] bg-[#1e293b] text-white text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-xs -rotate-6 shadow-md border border-red-500/40 uppercase tracking-tighter whitespace-nowrap">
      AARGHH!
    </div>
  </div>
);

// Character Star 2: Sad Sweat Drop Star
const CharacterStar2 = ({ isSelected }: { isSelected: boolean }) => (
  <div className={`relative flex flex-col items-center justify-center transition-transform duration-200 ${isSelected ? 'scale-110' : ''}`}>
    <svg viewBox="0 0 100 100" className="w-11 h-11 sm:w-13 sm:h-13 drop-shadow-md">
      <polygon points="50,5 64,34 96,38 72,60 78,92 50,76 22,92 28,60 4,38 36,34" fill="#e5b567" />
      <path d="M34 38 L42 42 L34 46" stroke="#5c4014" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M66 38 L58 42 L66 46" stroke="#5c4014" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <ellipse cx="50" cy="56" rx="5" ry="7" fill="#603813" />
      <path d="M28 30 C28 26 24 22 24 22 C24 22 20 26 20 30 C20 33 23.5 35 28 30 Z" fill="#0284c7" />
    </svg>
  </div>
);

// Character Star 3: Surprised / Neutral Star
const CharacterStar3 = ({ isSelected }: { isSelected: boolean }) => (
  <div className={`relative flex flex-col items-center justify-center transition-transform duration-200 ${isSelected ? 'scale-110' : ''}`}>
    <svg viewBox="0 0 100 100" className="w-11 h-11 sm:w-13 sm:h-13 drop-shadow-md">
      <polygon points="50,5 64,34 96,38 72,60 78,92 50,76 22,92 28,60 4,38 36,34" fill="#deb15a" />
      <circle cx="38" cy="42" r="3.5" fill="#5c4014" />
      <circle cx="62" cy="42" r="3.5" fill="#5c4014" />
      <circle cx="50" cy="54" r="4" fill="#603813" />
    </svg>
  </div>
);

// Character Star 4: Happy Star with "YUMM!" text
const CharacterStar4 = ({ isSelected }: { isSelected: boolean }) => (
  <div className={`relative flex flex-col items-center justify-center transition-transform duration-200 ${isSelected ? 'scale-110' : ''}`}>
    <svg viewBox="0 0 100 100" className="w-11 h-11 sm:w-13 sm:h-13 drop-shadow-md">
      <polygon points="50,5 64,34 96,38 72,60 78,92 50,76 22,92 28,60 4,38 36,34" fill="#eab308" />
      <circle cx="38" cy="40" r="3.5" fill="#5c4014" />
      <circle cx="62" cy="40" r="3.5" fill="#5c4014" />
      <path d="M38 52 C38 62, 62 62, 62 52 Z" fill="#603813" />
    </svg>
    <span className="absolute -top-1 -right-1 text-[8px] sm:text-[9px] font-black text-[#5c4014] dark:text-amber-300 tracking-tighter uppercase">
      YUMM!
    </span>
    <span className="absolute -bottom-2 text-[7px] font-bold text-slate-500 dark:text-zinc-400 tracking-tighter uppercase">
      YUMMAI
    </span>
  </div>
);

// Character Star 5: In Love / Kissing Star with Hearts
const CharacterStar5 = ({ isSelected }: { isSelected: boolean }) => (
  <div className={`relative flex flex-col items-center justify-center transition-transform duration-200 ${isSelected ? 'scale-110' : ''}`}>
    <div className="absolute -top-2 left-0.5 flex gap-0.5 text-rose-500 animate-bounce">
      <span className="text-[10px]">❤️</span>
      <span className="text-[8px]">❤️</span>
    </div>
    <svg viewBox="0 0 100 100" className="w-11 h-11 sm:w-13 sm:h-13 drop-shadow-md">
      <polygon points="50,5 64,34 96,38 72,60 78,92 50,76 22,92 28,60 4,38 36,34" fill="#eab308" />
      <circle cx="38" cy="40" r="3" fill="#5c4014" />
      <path d="M60 40 Q64 36 68 40" stroke="#5c4014" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M48 54 C51 52 54 54 51 57 C54 60 51 62 48 60" stroke="#5c4014" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  </div>
);

const EXPRESSIVE_STARS_CONFIG = [
  { rating: 1, Component: CharacterStar1 },
  { rating: 2, Component: CharacterStar2 },
  { rating: 3, Component: CharacterStar3 },
  { rating: 4, Component: CharacterStar4 },
  { rating: 5, Component: CharacterStar5 },
];

// Exact 3D Bevelled Golden Star Component matching user screenshot
const Exact3DGoldStar = ({
  size = 36,
  isFilled = true,
  className = ""
}: {
  size?: number;
  isFilled?: boolean;
  className?: string;
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`drop-shadow-xs ${className}`}
      fill="none"
    >
      {isFilled ? (
        <g>
          {/* Top & Left facets (Light Yellow-Gold) */}
          <polygon points="50,8 63,33 50,52" fill="#fde047" />
          <polygon points="50,8 37,33 50,52" fill="#eab308" />
          <polygon points="28,60 6,38 50,52" fill="#fde047" />

          {/* Center & Right facets (Warm Amber Gold) */}
          <polygon points="63,33 94,38 50,52" fill="#eab308" />
          <polygon points="94,38 72,60 50,52" fill="#d97706" />

          {/* Bottom facets (Dark Amber Shadow) */}
          <polygon points="72,60 77,92 50,52" fill="#d97706" />
          <polygon points="77,92 50,76 50,52" fill="#b45309" />
          <polygon points="50,76 23,92 50,52" fill="#eab308" />
          <polygon points="23,92 28,60 50,52" fill="#d97706" />
          <polygon points="6,38 37,33 50,52" fill="#eab308" />

          {/* Subtle Outer Stroke */}
          <polygon
            points="50,8 63,33 94,38 72,60 77,92 50,76 23,92 28,60 6,38 37,33"
            fill="none"
            stroke="#b45309"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </g>
      ) : (
        /* Empty Unfilled Star */
        <polygon
          points="50,8 63,33 94,38 72,60 77,92 50,76 23,92 28,60 6,38 37,33"
          fill="#cbd5e1"
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeLinejoin="round"
          className="dark:fill-zinc-800 dark:stroke-zinc-700 opacity-60"
        />
      )}
    </svg>
  );
};

export default function MyLearningPage() {
  const { user, updateUser } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [activeTab, setActiveTab] = useState<'all' | 'courses' | 'webinars' | 'workshops' | 'articles' | 'completed'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'In Progress' | 'Upcoming' | 'Not Started' | 'Completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [instructorFilter, setInstructorFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isInstructorOpen, setIsInstructorOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Course Review Provision State
  const [reviewingItem, setReviewingItem] = useState<LearningItem | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewTitle, setReviewTitle] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewTags, setReviewTags] = useState<string[]>([]);
  const [userReviews, setUserReviews] = useState<Record<string, { rating: number; title: string; comment: string; tags: string[]; date: string }>>({});

  const availableReviewTags = [
    'Well Explained',
    'Hands-on Projects',
    'Great Instructor',
    'Comprehensive',
    'Engaging Content',
    'Practical Exercises'
  ];

  const handleOpenReview = (item: LearningItem) => {
    setReviewingItem(item);
    const existing = userReviews[item.id];
    if (existing) {
      setRating(existing.rating);
      setReviewTitle(existing.title);
      setReviewComment(existing.comment);
      setReviewTags(existing.tags);
    } else {
      setRating(5);
      setReviewTitle('');
      setReviewComment('');
      setReviewTags([]);
    }
  };

  const toggleReviewTag = (tag: string) => {
    if (reviewTags.includes(tag)) {
      setReviewTags(prev => prev.filter(t => t !== tag));
    } else {
      setReviewTags(prev => [...prev, tag]);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingItem) return;
    if (!reviewComment.trim()) {
      toast.error('Please write a short review comment before submitting.');
      return;
    }
    setUserReviews(prev => ({
      ...prev,
      [reviewingItem.id]: {
        rating,
        title: reviewTitle.trim() || 'Course Review',
        comment: reviewComment.trim(),
        tags: reviewTags,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      }
    }));
    toast.success(`Review for "${reviewingItem.title}" submitted successfully! 🎉`);
    setReviewingItem(null);
  };

  const sortOptions = [
    { value: 'recent', label: 'Recently Accessed' },
    { value: 'title', label: 'Title (A-Z)' },
    { value: 'progress', label: 'Progress (High to Low)' }
  ];

  const currentSortLabel = sortOptions.find(o => o.value === sortBy)?.label || 'Recently Accessed';

  const filterBarRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (filterBarRef.current && !filterBarRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
        setIsCategoryOpen(false);
        setIsInstructorOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await UserService.getMe();
        updateUser(data);
        setProfileData(data);
      } catch (err) {
        console.error('Failed to load profile details from DB:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [updateUser]);

  const currentUser = profileData || user;

  const toggleBookmark = (id: string, title: string) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(prev => prev.filter(i => i !== id));
      toast.success(`Removed "${title}" from bookmarks`);
    } else {
      setBookmarkedIds(prev => [...prev, id]);
      toast.success(`Bookmarked "${title}"`);
    }
  };

  // Learning Content
  const [learningItems, setLearningItems] = useState<LearningItem[]>([]);

  useEffect(() => {
    if (currentUser?.enrolledCourses) {
      // The backend enrollment summary API provides basic details but omits coverImageUrl and numeric progress.
      // For now, we use a placeholder cover image and set progress to 0% as fallbacks.
      // Ensure all enrolled things will be here in this section.
      const mappedItems: LearningItem[] = currentUser.enrolledCourses.map((course: any) => {
        let mappedType: LearningItem['type'] = 'Course';
        if (course.type) {
          const upperType = course.type.toUpperCase();
          if (upperType === 'WEBINAR') mappedType = 'Webinar';
          else if (upperType === 'WORKSHOP') mappedType = 'Workshop';
          else if (upperType === 'ARTICLE') mappedType = 'Article';
        }
        return {
          id: course.courseId,
          title: course.title,
          type: mappedType,
          category: 'General', // Not currently provided by backend
          status: course.status === 'Completed' ? 'Completed' : 'In Progress',
          progress: 0, // Placeholder, updated async below
          instructor: 'Instructor', // Placeholder
          date: course.date || '',
          coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80', // Placeholder
          accentColor: 'indigo'
        };
      });
      setLearningItems(mappedItems);

      // Async fetch real progress for courses
      const courseItems = mappedItems.filter(item => item.type === 'Course');
      if (courseItems.length > 0) {
        import('@/domains/learning/progress/api/courseProgress').then(({ courseProgressService }) => {
          Promise.allSettled(
            courseItems.map(item => courseProgressService.getCourseProgress(item.id))
          ).then(results => {
            setLearningItems(prev => prev.map(item => {
              if (item.type !== 'Course') return item;
              const index = courseItems.findIndex(c => c.id === item.id);
              const result = results[index];
              if (result && result.status === 'fulfilled' && result.value) {
                return { ...item, progress: result.value.percent || 0 };
              }
              return item;
            }));
          });
        }).catch(err => console.error("Failed to load course progress", err));
      }
    }
  }, [currentUser]);

  // Dynamic Counts
  const inProgressCount = learningItems.filter(i => i.status === 'In Progress').length;
  const upcomingCount = learningItems.filter(i => i.status === 'Upcoming' || i.status === 'Live').length;
  const completedCount = learningItems.filter(i => i.status === 'Completed').length;
  const enrolledCount = learningItems.filter(i => i.type === 'Course').length;
  const attendedCount = learningItems.filter(i => i.type === 'Webinar').length;
  const readCount = learningItems.filter(i => i.type === 'Article').length;

  const continueLearningItem = [...learningItems]
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    })
    .find(i => i.status === 'In Progress');

  const scrollToItems = () => {
    const el = document.getElementById('learning-items-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // LineSidebar Items & Counts (No count on Overview Metrics)
  const lineSidebarItems = [
    'Overview Metrics',
    'Enrolled Courses',
    'Attended Webinars',
    'Read Articles',
    'Learning Time',
    'In Progress',
    'Completed',
    'Upcoming Events'
  ];

  const lineSidebarCounts = [
    null,
    '12',
    '5',
    '8',
    '36h',
    inProgressCount,
    completedCount,
    upcomingCount
  ];

  const handleLineSidebarClick = (index: number, label: string) => {
    if (label === 'Enrolled Courses') {
      setActiveTab('courses');
      setStatusFilter('all');
    } else if (label === 'Attended Webinars') {
      setActiveTab('webinars');
      setStatusFilter('all');
    } else if (label === 'Read Articles') {
      setActiveTab('articles');
      setStatusFilter('all');
    } else if (label === 'In Progress') {
      setActiveTab('all');
      setStatusFilter('In Progress');
    } else if (label === 'Completed') {
      setActiveTab('all');
      setStatusFilter('Completed');
    } else if (label === 'Upcoming Events') {
      setActiveTab('all');
      setStatusFilter('Upcoming');
    } else {
      setActiveTab('all');
      setStatusFilter('all');
    }
    scrollToItems();
  };

  // Filtering Logic
  const filteredItems = learningItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTab = true;
    if (activeTab === 'courses') matchesTab = item.type === 'Course';
    else if (activeTab === 'webinars') matchesTab = item.type === 'Webinar';
    else if (activeTab === 'workshops') matchesTab = item.type === 'Workshop';
    else if (activeTab === 'articles') matchesTab = item.type === 'Article';
    else if (activeTab === 'completed') matchesTab = item.status === 'Completed';

    let matchesStatus = true;
    if (statusFilter === 'In Progress') matchesStatus = item.status === 'In Progress';
    else if (statusFilter === 'Upcoming') matchesStatus = item.status === 'Upcoming' || item.status === 'Live';
    else if (statusFilter === 'Completed') matchesStatus = item.status === 'Completed';
    else if (statusFilter === 'Not Started') matchesStatus = item.status === 'Upcoming';

    let matchesCategory = true;
    if (categoryFilter !== 'all') matchesCategory = item.category === categoryFilter;

    let matchesInstructor = true;
    if (instructorFilter !== 'all') matchesInstructor = item.instructor === instructorFilter;

    return matchesSearch && matchesTab && matchesStatus && matchesCategory && matchesInstructor;
  });

  // Sort logic
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'progress') {
      const aProgress = a.progress ?? 0;
      const bProgress = b.progress ?? 0;
      return bProgress - aProgress;
    }
    return 0; // default (recent)
  });

  if (isLoading || !currentUser) {
    return (
      <div
        className="flex h-[calc(100vh-80px)] items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 35%, #FFFFFF 70%)' }}
      >
        <Loader2 className="animate-spin text-[#4C6FFF]" size={32} />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen w-full"
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

      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-8 px-4 pb-32 pt-28 md:px-8 md:pt-32">

        {/* Hero — centered My Learning */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-2xl pt-1 text-center"
        >
          <h1 className="text-[clamp(2rem,4.2vw,2.75rem)] font-bold leading-[1.08] tracking-tight text-[#14142b]">
            My Learning
          </h1>
          <div
            aria-hidden
            className="mx-auto mt-3 h-[2px] w-14 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #4C6FFF, #0EA5E9)',
            }}
          />
          <p className="mx-auto mt-3.5 max-w-md text-[14px] font-medium leading-relaxed text-slate-500">
            Search what you enrolled in. Resume unfinished lessons. Filter courses,
            workshops, and webinars without leaving this page.
          </p>
        </motion.div>

        {/* 2. MAIN CONTENT AREA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >

          {/* Search + sort — home-style capsules */}
          <div className="relative z-30 flex w-full flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Search size={16} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search your shelf — courses, instructors, topics…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    document.getElementById('learning-items-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="block w-full rounded-full border border-slate-200 bg-white/95 py-3 pl-11 pr-24 text-[14px] font-medium text-[#14142b] outline-none placeholder:text-slate-400 shadow-[0_6px_20px_rgba(20,20,43,0.05)] focus:border-[#4C6FFF]/45 focus:ring-4 focus:ring-[#4C6FFF]/10"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-20 flex items-center text-slate-400 transition-colors hover:text-slate-700"
                >
                  <X size={15} />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  document.getElementById('learning-items-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="absolute inset-y-1.5 right-1.5 rounded-full bg-[#12141C] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#232735]"
              >
                Search
              </button>
            </div>

            <div ref={sortRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex w-full items-center justify-between gap-2.5 rounded-full border border-slate-200 bg-white/95 px-4 py-3 text-xs font-semibold text-slate-700 shadow-[0_6px_20px_rgba(20,20,43,0.05)] transition-colors hover:border-slate-300 sm:w-auto"
              >
                <SlidersHorizontal size={14} className={isSortOpen ? 'text-[#4C6FFF]' : 'text-slate-500'} />
                <span>{currentSortLabel}</span>
                <motion.div animate={{ rotate: isSortOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronRight size={14} className={`rotate-90 ${isSortOpen ? 'text-[#4C6FFF]' : 'text-slate-400'}`} />
                </motion.div>
              </button>

              <AnimatePresence>
                {isSortOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full z-50 mt-2 w-54 overflow-hidden rounded-lg border border-slate-200/80 bg-white p-1.5 shadow-xl"
                  >
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSortBy(opt.value);
                          setIsSortOpen(false);
                          document.getElementById('learning-items-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-md px-3.5 py-2.5 text-left text-xs font-semibold transition-colors ${
                          sortBy === opt.value
                            ? 'bg-[#4C6FFF]/10 text-[#4C6FFF]'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {sortBy === opt.value && <span className="text-[#4C6FFF]">✓</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Continue learning — header outside card (home pattern) */}
          {continueLearningItem && (
            <div className="space-y-3">
              <div className="flex items-end justify-between gap-3">
                <h2 className="text-xl font-bold tracking-tight text-[#14142b]">
                  Continue learning
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-[#4C6FFF]/20 bg-[#4C6FFF]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#3A56D4]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4C6FFF]" />
                  In progress
                </span>
              </div>

              <div className="relative overflow-hidden rounded-lg border border-slate-200/80 bg-gradient-to-br from-[#EEF2FF] via-white to-[#F8FAFC] p-4 shadow-[0_6px_20px_rgba(20,20,43,0.04)] sm:p-5">
                <div className="relative z-10 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
                  <div className="relative group/img h-28 w-full shrink-0 overflow-hidden rounded-md border border-slate-200/80 bg-slate-100 shadow-sm sm:w-44">
                    <img
                      src={continueLearningItem.coverImage}
                      alt={continueLearningItem.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-[#14142b]/25 transition-colors group-hover/img:bg-[#14142b]/15">
                      <div className="rounded-md bg-white p-2.5 text-[#4C6FFF] shadow-md">
                        <Play size={14} className="ml-0.5 fill-current" />
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 w-full flex-1 space-y-3.5">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#4C6FFF]">
                        {continueLearningItem.category}
                      </span>
                      <h3 className="truncate text-lg font-bold tracking-tight text-[#14142b]">
                        {continueLearningItem.title}
                      </h3>
                      <p className="text-xs font-medium text-slate-500">
                        {continueLearningItem.type} • {continueLearningItem.instructor}
                      </p>
                    </div>

                    <div className="max-w-md space-y-1.5">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                        <span>Progress</span>
                        <span className="text-[#14142b]">{continueLearningItem.progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-sm bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${continueLearningItem.progress}%` }}
                          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                          className="h-full rounded-sm bg-gradient-to-r from-[#4C6FFF] to-[#1DB876]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:border-l sm:border-slate-200/80 sm:pl-6">
                    <Link
                      href={`/learn/${continueLearningItem.id}/learn`}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-[#12141C] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#232735]"
                    >
                      <Play size={13} className="fill-current" />
                      Resume
                    </Link>
                    <Link
                      href={`/learn/${continueLearningItem.id}`}
                      className="inline-flex items-center justify-center gap-1 py-1 text-[12px] font-semibold text-[#4C6FFF] transition-colors hover:text-[#3a5ae6]"
                    >
                      View details
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Learning library */}
          <div id="learning-items-section" className="scroll-mt-28 space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-[#14142b]">Your library</h2>
            <div className="space-y-5 rounded-lg border border-slate-200/80 bg-white/95 p-4 shadow-[0_4px_18px_rgba(20,20,43,0.04)] sm:p-6">

            {/* CONTROLS BAR (Segmented Dock & Filter Pills with Search Bar Effect) */}
            <div className="flex flex-col gap-4 relative z-30 space-y-1">

              {/* Bottom Row: Segmented Sliding Dock (Search Bar Arcade Gradient & Glow Effect) */}
              <div className="w-full pt-1 relative group/arcadeDock">
                {/* Backlight Arcade Logo Gradient Ambient Glow Halo */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#4C6FFF]/40 via-[#4C6FFF]/50 to-[#0EA5E9]/40 blur-md opacity-0 transition-all duration-500 pointer-events-none" />

                {/* Arcade Logo Gradient Border Wrapper */}
                <div className="p-[1.5px] rounded-full bg-gradient-to-r from-[#4C6FFF]/40 via-[#4C6FFF]/50 to-[#0EA5E9]/40 hover:from-[#4C6FFF] hover:via-[#4C6FFF] hover:to-[#0EA5E9] transition-all duration-300 shadow-xs">
                  <div className="relative flex items-center justify-between gap-1.5 bg-white dark:bg-slate-950 p-2 rounded-full max-w-full overflow-x-auto scrollbar-none">
                    {[
                      {
                        id: 'all',
                        label: 'All',
                        icon: Grid,
                        count: learningItems.length,
                        gradient: 'from-[#4C6FFF]/40 via-[#4C6FFF]/40 to-[#0EA5E9]/40',
                        innerBg: 'bg-blue-50/90 dark:bg-blue-950/80',
                        textColor: 'text-[#4C6FFF] dark:text-blue-300',
                        iconColor: 'text-[#4C6FFF] dark:text-blue-300',
                        badgeStyle: 'bg-white dark:bg-blue-900/60 text-[#4C6FFF] dark:text-blue-200 border border-blue-200/60 dark:border-blue-800/50',
                        glowShadow: 'shadow-[0_2px_12px_rgba(44,131,245,0.2)]'
                      },
                      {
                        id: 'courses',
                        label: 'Courses',
                        icon: BookOpen,
                        count: enrolledCount,
                        gradient: 'from-purple-400/50 via-violet-400/50 to-purple-400/50',
                        innerBg: 'bg-purple-50/90 dark:bg-purple-950/80',
                        textColor: 'text-purple-700 dark:text-purple-300',
                        iconColor: 'text-purple-700 dark:text-purple-300',
                        badgeStyle: 'bg-white dark:bg-purple-900/60 text-purple-700 dark:text-purple-200 border border-purple-200/60 dark:border-purple-800/50',
                        glowShadow: 'shadow-[0_2px_12px_rgba(168,85,247,0.2)]'
                      },
                      {
                        id: 'webinars',
                        label: 'Webinars',
                        icon: Video,
                        count: attendedCount,
                        gradient: 'from-blue-400/50 via-sky-400/50 to-blue-400/50',
                        innerBg: 'bg-blue-50/90 dark:bg-blue-950/80',
                        textColor: 'text-blue-700 dark:text-blue-300',
                        iconColor: 'text-blue-700 dark:text-blue-300',
                        badgeStyle: 'bg-white dark:bg-blue-900/60 text-blue-700 dark:text-blue-200 border border-blue-200/60 dark:border-blue-800/50',
                        glowShadow: 'shadow-[0_2px_12px_rgba(59,130,246,0.2)]'
                      },
                      {
                        id: 'workshops',
                        label: 'Workshops',
                        icon: Wrench,
                        count: learningItems.filter(i => i.type === 'Workshop').length,
                        gradient: 'from-orange-400/50 via-amber-400/50 to-orange-400/50',
                        innerBg: 'bg-orange-50/90 dark:bg-orange-950/80',
                        textColor: 'text-orange-700 dark:text-orange-300',
                        iconColor: 'text-orange-700 dark:text-orange-300',
                        badgeStyle: 'bg-white dark:bg-orange-900/60 text-orange-700 dark:text-orange-200 border border-orange-200/60 dark:border-orange-800/50',
                        glowShadow: 'shadow-[0_2px_12px_rgba(249,115,22,0.2)]'
                      },
                      {
                        id: 'articles',
                        label: 'Articles',
                        icon: FileText,
                        count: readCount,
                        gradient: 'from-teal-400/50 via-emerald-400/50 to-teal-400/50',
                        innerBg: 'bg-teal-50/90 dark:bg-teal-950/80',
                        textColor: 'text-teal-700 dark:text-teal-300',
                        iconColor: 'text-teal-700 dark:text-teal-300',
                        badgeStyle: 'bg-white dark:bg-teal-900/60 text-teal-700 dark:text-teal-200 border border-teal-200/60 dark:border-teal-800/50',
                        glowShadow: 'shadow-[0_2px_12px_rgba(20,184,166,0.2)]'
                      },
                      {
                        id: 'completed',
                        label: 'Completed',
                        icon: CheckCircle2,
                        count: completedCount,
                        gradient: 'from-lime-400/50 via-green-400/50 to-lime-400/50',
                        innerBg: 'bg-lime-50/90 dark:bg-lime-950/80',
                        textColor: 'text-lime-700 dark:text-lime-300',
                        iconColor: 'text-lime-700 dark:text-lime-300',
                        badgeStyle: 'bg-white dark:bg-lime-900/60 text-lime-700 dark:text-lime-200 border border-lime-200/60 dark:border-lime-800/50',
                        glowShadow: 'shadow-[0_2px_12px_rgba(132,204,22,0.2)]'
                      }
                    ].map((tab) => {
                      const TabIcon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <motion.button
                          key={tab.id}
                          type="button"
                          whileHover={{ scale: 1.04, y: -1 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => {
                            setActiveTab(tab.id as any);
                            document.getElementById('learning-items-section')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className={`relative flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap cursor-pointer z-10 select-none outline-none ${isActive
                            ? `${tab.textColor} font-black`
                            : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                            }`}
                        >
                          {/* Smooth Sliding Active Background Pill with Light Tinted Surface & Soft Border */}
                          {isActive && (
                            <motion.div
                              layoutId="activeTabPill"
                              className={`absolute inset-0 rounded-full p-[1.5px] bg-gradient-to-r ${tab.gradient} ${tab.glowShadow} z-[-1]`}
                              transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 30
                              }}
                            >
                              {/* Light Tinted Inner Pill Surface */}
                              <div className={`w-full h-full rounded-full ${tab.innerBg}`} />
                            </motion.div>
                          )}

                          {/* Animated Icon with subtle scale on hover/active */}
                          <motion.div
                            animate={isActive ? { scale: [1, 1.25, 1], rotate: [0, -8, 0] } : { scale: 1, rotate: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <TabIcon
                              size={15}
                              className={isActive ? `stroke-[2.5] ${tab.iconColor}` : 'text-slate-400 dark:text-zinc-500'}
                            />
                          </motion.div>

                          <span className="font-[family-name:var(--font-outfit)] tracking-tight">{tab.label}</span>

                          {/* Item Count Pill Badge */}
                          <span
                            className={`ml-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-all duration-200 ${isActive
                              ? tab.badgeStyle
                              : 'bg-slate-200/80 dark:bg-zinc-700/60 text-slate-600 dark:text-zinc-400'
                              }`}
                          >
                            {tab.count}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* Filter Pills Bar (Search Bar Style Arcade Gradient, Halo Glow & White Inner Capsule) */}
            <div ref={filterBarRef} className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full pt-1.5">

              {/* Pill 1: Status Dropdown / Active Pill */}
              <div className="relative w-full group/arcadeFilterStatus">
                {/* Backlight Ambient Glow Halo */}
                <div
                  className={`absolute -inset-1 rounded-full bg-gradient-to-r from-[#4C6FFF]/50 via-[#4C6FFF]/60 to-[#0EA5E9]/50 blur-md opacity-0 transition-all duration-500 pointer-events-none ${isStatusOpen || statusFilter !== 'all'
                    ? 'opacity-100 scale-100 '
                    : 'opacity-0 scale-95 group-hover/arcadeFilterStatus:opacity-60'
                    }`}
                />

                {/* Arcade Logo Gradient Border Wrapper */}
                <div
                  className={`p-[1.5px] rounded-full transition-all duration-300 ${isStatusOpen || statusFilter !== 'all'
                    ? 'bg-gradient-to-r from-[#4C6FFF] via-[#4C6FFF] to-[#0EA5E9] shadow-[0_8px_30px_rgba(44,131,245,0.35)]'
                    : 'bg-gradient-to-r from-[#4C6FFF]/40 via-[#4C6FFF]/50 to-[#0EA5E9]/40 hover:from-[#4C6FFF] hover:via-[#4C6FFF] hover:to-[#0EA5E9] shadow-xs'
                    }`}
                >
                  {statusFilter !== 'all' ? (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStatusFilter('all')}
                      className="relative z-10 w-full flex items-center justify-between px-5 py-2.5 rounded-full text-xs font-black bg-white dark:bg-slate-950 text-[#4C6FFF] dark:text-blue-300 cursor-pointer transition-all"
                    >
                      <span className="font-[family-name:var(--font-outfit)] truncate">{statusFilter}</span>
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#4C6FFF] dark:text-blue-200 shrink-0 ml-2">
                        <X size={12} className="stroke-[3]" />
                      </span>
                    </motion.button>
                  ) : (
                    <div className="w-full">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setIsStatusOpen(prev => !prev);
                          setIsCategoryOpen(false);
                          setIsInstructorOpen(false);
                        }}
                        className="relative z-10 w-full flex items-center justify-between px-5 py-2.5 rounded-full text-xs font-bold bg-white dark:bg-slate-950 text-slate-700 dark:text-zinc-200 cursor-pointer transition-all"
                      >
                        <span className="font-[family-name:var(--font-outfit)] tracking-tight">Status</span>
                        <ChevronRight size={14} className={`transition-transform duration-200 ${isStatusOpen ? '-rotate-90 text-[#4C6FFF]' : 'rotate-90 text-slate-500 dark:text-zinc-400'}`} />
                      </motion.button>

                      <AnimatePresence>
                        {isStatusOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 6 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="absolute left-0 right-0 top-full mt-2 w-full p-1.5 rounded-lg bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-200/80 shadow-2xl z-50 overflow-hidden"
                          >
                            {['all', 'In Progress', 'Not Started', 'Upcoming'].map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => {
                                  setStatusFilter(st as any);
                                  setIsStatusOpen(false);
                                }}
                                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between cursor-pointer transition-colors ${statusFilter === st
                                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#4C6FFF] dark:text-blue-300 font-extrabold'
                                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100/80 dark:hover:bg-zinc-800/80'
                                  }`}
                              >
                                <span>{st === 'all' ? 'All Statuses' : st}</span>
                                {statusFilter === st && <span className="text-[#4C6FFF] font-black text-sm">✓</span>}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>

              {/* Pill 2: Categories Dropdown / Active Pill */}
              <div className="relative w-full group/arcadeFilterCat">
                {/* Backlight Ambient Glow Halo */}
                <div
                  className={`absolute -inset-1 rounded-full bg-gradient-to-r from-[#4C6FFF]/50 via-[#4C6FFF]/60 to-[#0EA5E9]/50 blur-md opacity-0 transition-all duration-500 pointer-events-none ${isCategoryOpen || categoryFilter !== 'all'
                    ? 'opacity-100 scale-100 '
                    : 'opacity-0 scale-95 group-hover/arcadeFilterCat:opacity-60'
                    }`}
                />

                {/* Arcade Logo Gradient Border Wrapper */}
                <div
                  className={`p-[1.5px] rounded-full transition-all duration-300 ${isCategoryOpen || categoryFilter !== 'all'
                    ? 'bg-gradient-to-r from-[#4C6FFF] via-[#4C6FFF] to-[#0EA5E9] shadow-[0_8px_30px_rgba(44,131,245,0.35)]'
                    : 'bg-gradient-to-r from-[#4C6FFF]/40 via-[#4C6FFF]/50 to-[#0EA5E9]/40 hover:from-[#4C6FFF] hover:via-[#4C6FFF] hover:to-[#0EA5E9] shadow-xs'
                    }`}
                >
                  {categoryFilter !== 'all' ? (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCategoryFilter('all')}
                      className="relative z-10 w-full flex items-center justify-between px-5 py-2.5 rounded-full text-xs font-black bg-white dark:bg-slate-950 text-[#4C6FFF] dark:text-blue-300 cursor-pointer transition-all"
                    >
                      <span className="font-[family-name:var(--font-outfit)] truncate">{categoryFilter}</span>
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#4C6FFF] dark:text-blue-200 shrink-0 ml-2">
                        <X size={12} className="stroke-[3]" />
                      </span>
                    </motion.button>
                  ) : (
                    <div className="w-full">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setIsCategoryOpen(prev => !prev);
                          setIsStatusOpen(false);
                          setIsInstructorOpen(false);
                        }}
                        className="relative z-10 w-full flex items-center justify-between px-5 py-2.5 rounded-full text-xs font-bold bg-white dark:bg-slate-950 text-slate-700 dark:text-zinc-200 cursor-pointer transition-all"
                      >
                        <span className="font-[family-name:var(--font-outfit)] tracking-tight">Categories</span>
                        <ChevronRight size={14} className={`transition-transform duration-200 ${isCategoryOpen ? '-rotate-90 text-[#4C6FFF]' : 'rotate-90 text-slate-500 dark:text-zinc-400'}`} />
                      </motion.button>

                      <AnimatePresence>
                        {isCategoryOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 6 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="absolute left-0 right-0 top-full mt-2 w-full p-1.5 rounded-lg bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-200/80 shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto scrollbar-thin"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setCategoryFilter('all');
                                setIsCategoryOpen(false);
                              }}
                              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between cursor-pointer transition-colors ${categoryFilter === 'all'
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-[#4C6FFF] dark:text-blue-300 font-extrabold'
                                : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100/80 dark:hover:bg-zinc-800/80'
                                }`}
                            >
                              <span>All Categories</span>
                              {categoryFilter === 'all' && <span className="text-[#4C6FFF] font-black text-sm">✓</span>}
                            </button>

                            {Array.from(new Set(learningItems.map(i => i.category))).map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  setCategoryFilter(cat);
                                  setIsCategoryOpen(false);
                                }}
                                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between cursor-pointer transition-colors ${categoryFilter === cat
                                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#4C6FFF] dark:text-blue-300 font-extrabold'
                                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100/80 dark:hover:bg-zinc-800/80'
                                  }`}
                              >
                                <span>{cat}</span>
                                {categoryFilter === cat && <span className="text-[#4C6FFF] font-black text-sm">✓</span>}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>

              {/* Pill 3: Instructor Dropdown / Active Pill */}
              <div className="relative w-full group/arcadeFilterInst">
                {/* Backlight Ambient Glow Halo */}
                <div
                  className={`absolute -inset-1 rounded-full bg-gradient-to-r from-[#4C6FFF]/50 via-[#4C6FFF]/60 to-[#0EA5E9]/50 blur-md opacity-0 transition-all duration-500 pointer-events-none ${isInstructorOpen || instructorFilter !== 'all'
                    ? 'opacity-100 scale-100 '
                    : 'opacity-0 scale-95 group-hover/arcadeFilterInst:opacity-60'
                    }`}
                />

                {/* Arcade Logo Gradient Border Wrapper */}
                <div
                  className={`p-[1.5px] rounded-full transition-all duration-300 ${isInstructorOpen || instructorFilter !== 'all'
                    ? 'bg-gradient-to-r from-[#4C6FFF] via-[#4C6FFF] to-[#0EA5E9] shadow-[0_8px_30px_rgba(44,131,245,0.35)]'
                    : 'bg-gradient-to-r from-[#4C6FFF]/40 via-[#4C6FFF]/50 to-[#0EA5E9]/40 hover:from-[#4C6FFF] hover:via-[#4C6FFF] hover:to-[#0EA5E9] shadow-xs'
                    }`}
                >
                  {instructorFilter !== 'all' ? (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setInstructorFilter('all')}
                      className="relative z-10 w-full flex items-center justify-between px-5 py-2.5 rounded-full text-xs font-black bg-white dark:bg-slate-950 text-[#4C6FFF] dark:text-blue-300 cursor-pointer transition-all"
                    >
                      <span className="font-[family-name:var(--font-outfit)] truncate">{instructorFilter}</span>
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#4C6FFF] dark:text-blue-200 shrink-0 ml-2">
                        <X size={12} className="stroke-[3]" />
                      </span>
                    </motion.button>
                  ) : (
                    <div className="w-full">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setIsInstructorOpen(prev => !prev);
                          setIsStatusOpen(false);
                          setIsCategoryOpen(false);
                        }}
                        className="relative z-10 w-full flex items-center justify-between px-5 py-2.5 rounded-full text-xs font-bold bg-white dark:bg-slate-950 text-slate-700 dark:text-zinc-200 cursor-pointer transition-all"
                      >
                        <span className="font-[family-name:var(--font-outfit)] tracking-tight">Instructor</span>
                        <ChevronRight size={14} className={`transition-transform duration-200 ${isInstructorOpen ? '-rotate-90 text-[#4C6FFF]' : 'rotate-90 text-slate-500 dark:text-zinc-400'}`} />
                      </motion.button>

                      <AnimatePresence>
                        {isInstructorOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 6 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="absolute left-0 right-0 top-full mt-2 w-full p-1.5 rounded-lg bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-200/80 shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto scrollbar-thin"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setInstructorFilter('all');
                                setIsInstructorOpen(false);
                              }}
                              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between cursor-pointer transition-colors ${instructorFilter === 'all'
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-[#4C6FFF] dark:text-blue-300 font-extrabold'
                                : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100/80 dark:hover:bg-zinc-800/80'
                                }`}
                            >
                              <span>All Instructors</span>
                              {instructorFilter === 'all' && <span className="text-[#4C6FFF] font-black text-sm">✓</span>}
                            </button>

                            {Array.from(new Set(learningItems.map(i => i.instructor))).map((inst) => (
                              <button
                                key={inst}
                                type="button"
                                onClick={() => {
                                  setInstructorFilter(inst);
                                  setIsInstructorOpen(false);
                                }}
                                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between cursor-pointer transition-colors ${instructorFilter === inst
                                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#4C6FFF] dark:text-blue-300 font-extrabold'
                                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100/80 dark:hover:bg-zinc-800/80'
                                  }`}
                              >
                                <span>{inst}</span>
                                {instructorFilter === inst && <span className="text-[#4C6FFF] font-black text-sm">✓</span>}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Cards Grid with Elevated Premium Design */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={`${activeTab}-${statusFilter}-${sortBy}`}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              >
                {sortedItems.map((item, idx) => {
                  const isBookmarked = bookmarkedIds.includes(item.id);

                  // Dynamic lighter shade color styling per type
                  let cardStyle = {
                    categoryText: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-900/40',
                    btnBg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-300/60 dark:border-purple-800 hover:bg-purple-100/90 shadow-2xs',
                    progressFill: 'bg-purple-500'
                  };

                  if (item.type === 'Webinar') {
                    cardStyle = {
                      categoryText: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/40',
                      btnBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-300/60 dark:border-blue-800 hover:bg-blue-100/90 shadow-2xs',
                      progressFill: 'bg-blue-500'
                    };
                  } else if (item.type === 'Workshop') {
                    cardStyle = {
                      categoryText: 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/60 border border-orange-200/60 dark:border-orange-900/40',
                      btnBg: 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-300/60 dark:border-orange-800 hover:bg-orange-100/90 shadow-2xs',
                      progressFill: 'bg-orange-500'
                    };
                  } else if (item.type === 'Article') {
                    cardStyle = {
                      categoryText: 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-900/40',
                      btnBg: 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-300/60 dark:border-teal-800 hover:bg-teal-100/90 shadow-2xs',
                      progressFill: 'bg-teal-500'
                    };
                  }

                  return (
                    <motion.div
                      layout="position"
                      initial={{ opacity: 0, scale: 0.96, y: 12 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: Math.min(idx * 0.05, 0.2),
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      key={item.id}
                      className={`group relative flex flex-col justify-between overflow-hidden rounded-lg border border-slate-200/80 bg-white/95 p-4 shadow-[0_4px_18px_rgba(20,20,43,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(20,20,43,0.07)] ${
                        ['hover:border-[#4C6FFF]', 'hover:border-[#FF6B4A]', 'hover:border-[#1DB876]', 'hover:border-[#9B5DE5]'][idx % 4]
                      }`}
                    >
                      {/* Image header (Shimmer Light Sweep on Hover) */}
                      <div className="relative h-32 w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="w-full h-full object-cover filter contrast-[0.95] group-hover:contrast-[1.05] group-hover:brightness-[1.05] transition-all duration-500"
                        />
                        {/* Shimmer Light Sweep Beam */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none z-10" />

                        {/* Gradient overlay for contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                        {/* Type badge overlay */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-900/80 backdrop-blur-md text-white border border-white/20 shadow-xs z-20">
                          {item.type === 'Course' && <BookOpen size={10} />}
                          {item.type === 'Webinar' && <Video size={10} />}
                          {item.type === 'Workshop' && <Wrench size={10} />}
                          {item.type === 'Article' && <FileText size={10} />}
                          <span className="tracking-wide">{item.type}</span>
                        </div>

                        {/* Bookmark Button */}
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() => toggleBookmark(item.id, item.title)}
                          className={`absolute top-2.5 right-2.5 p-1.5 rounded-xl backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xs z-20 ${isBookmarked
                            ? 'bg-gradient-to-r from-[#4C6FFF] via-[#4C6FFF] to-[#0EA5E9] text-white border border-cyan-300/50'
                            : 'bg-slate-900/60 text-slate-200 hover:text-white border border-white/20 hover:bg-slate-900/90'
                            }`}
                        >
                          <Bookmark size={12} className={isBookmarked ? 'fill-current' : ''} />
                        </motion.button>
                      </div>

                      {/* Content */}
                      <div className="mt-3.5 space-y-1.5">
                        <div className="flex justify-between items-center gap-2">
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${cardStyle.categoryText}`}>
                            {item.category}
                          </span>
                          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-700/50 transition-colors">
                            <MoreVertical size={14} />
                          </button>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2 min-h-[40px] group-hover:text-[#4C6FFF] dark:group-hover:text-cyan-400 transition-colors font-[family-name:var(--font-outfit)]">
                          {item.title}
                        </h4>
                        <p className="text-xs font-semibold text-slate-400 dark:text-zinc-400">
                          By {item.instructor}
                        </p>
                      </div>

                      {/* Custom Footer: Rating Provision ONLY for Completed Items */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-200/80">
                        {item.status === 'Completed' ? (
                          <div className="w-full space-y-2">
                            {/* Full-width Purple Bar Line for Completed Content */}
                            <div className="w-full h-1 bg-[#7c3aed] rounded-full" />

                            {/* Footer Row: LEFT = 5 Stars & Leave a rating, RIGHT = Completed Button */}
                            <div className="flex items-center justify-between pt-0.5">
                              {/* LEFT SIDE: Exact 3D Golden Stars & "Leave a rating" Link */}
                              <button
                                type="button"
                                onClick={() => handleOpenReview(item)}
                                className="flex flex-col items-start gap-0.5 cursor-pointer focus:outline-none group/ratingBtn"
                              >
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => {
                                    const itemRating = userReviews[item.id]?.rating || 0;
                                    const isFilled = i < itemRating;
                                    return (
                                      <Exact3DGoldStar
                                        key={i}
                                        size={14}
                                        isFilled={isFilled}
                                      />
                                    );
                                  })}
                                </div>
                                <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 group-hover/ratingBtn:underline tracking-tight">
                                  {userReviews[item.id] ? 'Edit rating' : 'Leave a rating'}
                                </span>
                              </button>

                              {/* RIGHT SIDE: Completed Button */}
                              <Link
                                href={`/learn/${item.id}`}
                                className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs hover:bg-emerald-100/80 transition-all"
                              >
                                <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                                <span>Completed</span>
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            {item.type === 'Course' && (
                              <>
                                <div className="flex-1 max-w-[58%] space-y-1">
                                  <div className="flex justify-between text-[10px] font-extrabold text-slate-500 dark:text-zinc-400">
                                    <span>{item.completedModules}/{item.totalModules} modules</span>
                                    <span>{item.progress}%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden p-[0.5px]">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${item.progress}%` }}
                                      transition={{ duration: 0.8, ease: 'easeOut' }}
                                      className={`h-full ${cardStyle.progressFill} rounded-full`}
                                    />
                                  </div>
                                </div>
                                <Link
                                  href={`/learn/${item.id}`}
                                  className="px-4 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#4C6FFF] via-[#4C6FFF] to-[#0EA5E9] hover:opacity-95 text-white border-cyan-400/30 shadow-md shadow-cyan-500/20 hover:scale-[1.02] transition-all"
                                >
                                  Continue
                                </Link>
                              </>
                            )}

                            {item.type === 'Webinar' && (
                              <>
                                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-red-500 " />
                                  {item.date}
                                </span>
                                <button className={`px-4 py-1.5 rounded-xl ${cardStyle.btnBg} font-extrabold text-xs transition-all cursor-pointer`}>
                                  Watch Recording
                                </button>
                              </>
                            )}

                            {item.type === 'Workshop' && (
                              <>
                                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                                  <Calendar size={12} />
                                  {item.date}
                                </span>
                                <button className={`px-4 py-1.5 rounded-xl ${cardStyle.btnBg} font-extrabold text-xs transition-all cursor-pointer`}>
                                  View Details
                                </button>
                              </>
                            )}

                            {item.type === 'Article' && (
                              <>
                                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                                  <Clock size={12} />
                                  {item.readTime}
                                </span>
                                <button className={`px-4 py-1.5 rounded-xl ${cardStyle.btnBg} font-extrabold text-xs transition-all cursor-pointer`}>
                                  Read Article
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {sortedItems.length === 0 && (
                  <div className="col-span-full rounded-lg border border-dashed border-slate-200 bg-white/60 py-12 text-center">
                    <Grid className="mx-auto text-slate-400 mb-2" size={32} />
                    <p className="text-sm font-bold text-slate-800 dark:text-white">No items found</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing your filters or searches.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            </div>
          </div>

        </motion.div>

        {/* Clean & Sleek Course Rating Modal */}
        <AnimatePresence>
          {reviewingItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setReviewingItem(null)}
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
              />

              {/* Modal Card Container with Sleek Arcade Gradient Border & Glow */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-md z-10 group/modalBorder"
              >
                {/* Backlight Ambient Glow Halo */}
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#4C6FFF]/30 via-[#4C6FFF]/40 to-[#0EA5E9]/30 blur-md opacity-60 pointer-events-none" />

                {/* Sleek Arcade Logo Gradient Border Wrapper */}
                <div className="p-[1.5px] rounded-lg bg-gradient-to-r from-[#4C6FFF]/50 via-[#4C6FFF]/60 to-[#0EA5E9]/50 shadow-2xl">
                  <div className="relative w-full bg-white dark:bg-slate-950 rounded-lg p-6 space-y-4 overflow-hidden">

                    {/* Modal Header */}
                    <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-200/80 pb-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={reviewingItem.coverImage}
                          alt={reviewingItem.title}
                          className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-200 shadow-xs"
                        />
                        <div className="max-w-[260px] pt-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4C6FFF] dark:text-cyan-400 block mb-0.5">
                            {reviewingItem.category}
                          </span>
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug font-[family-name:var(--font-outfit)] line-clamp-2">
                            {reviewingItem.title}
                          </h3>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReviewingItem(null)}
                        className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer mt-0.5"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Review Form */}
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      {/* Exact Reference Image 5 3D Golden Star Rating Bar */}
                      <div className="bg-[#e5e7eb]/80 dark:bg-slate-950 rounded-lg p-5 sm:p-6 my-2 border border-slate-200/50 dark:border-slate-200/50 flex items-center justify-center gap-3 sm:gap-5 shadow-xs">
                        {[1, 2, 3, 4, 5].map((starVal) => {
                          const isFilled = (hoverRating || rating) >= starVal;

                          return (
                            <button
                              key={starVal}
                              type="button"
                              onMouseEnter={() => setHoverRating(starVal)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setRating(starVal)}
                              className="cursor-pointer transition-transform duration-200 hover:scale-125 focus:outline-none p-1"
                            >
                              <Exact3DGoldStar size={42} isFilled={isFilled} />
                            </button>
                          );
                        })}
                      </div>

                      {/* Simple Feedback Comment Textarea with Exterior Arcade Glow Effect */}
                      <div className="relative group/arcadeReviewTextarea w-full my-1">
                        {/* Backlight Ambient Glow Halo (Strictly OUTSIDE the box) */}
                        <div className="absolute -inset-2 rounded-lg bg-gradient-to-r from-[#4C6FFF]/40 via-[#4C6FFF]/50 to-[#0EA5E9]/40 blur-md opacity-0 group-focus-within/arcadeReviewTextarea:opacity-100 group-hover/arcadeReviewTextarea:opacity-60 transition-all duration-500 pointer-events-none" />

                        {/* Arcade Logo Gradient Border Wrapper (Exterior Ring) */}
                        <div className="p-[1.5px] rounded-lg bg-gradient-to-r from-[#4C6FFF]/40 via-[#4C6FFF]/50 to-[#0EA5E9]/40 group-focus-within/arcadeReviewTextarea:from-[#4C6FFF] group-focus-within/arcadeReviewTextarea:via-[#4C6FFF] group-focus-within/arcadeReviewTextarea:to-[#0EA5E9] hover:from-[#4C6FFF] hover:via-[#4C6FFF] hover:to-[#0EA5E9] transition-all duration-300 shadow-xs relative z-10">
                          {/* 100% Opaque Solid Inner Box */}
                          <textarea
                            rows={3}
                            placeholder="Write a review (optional)..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            className="w-full px-4 py-3 text-xs rounded-[14px] bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-0 transition-colors resize-none border-none block relative z-10"
                          />
                        </div>
                      </div>

                      {/* Modal Footer Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-200/80">
                        <button
                          type="button"
                          onClick={() => setReviewingItem(null)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#4C6FFF] hover:bg-[#2051b8] shadow-xs cursor-pointer transition-colors"
                        >
                          Submit Rating
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
