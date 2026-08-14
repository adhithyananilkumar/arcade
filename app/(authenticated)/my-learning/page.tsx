'use client';

// High-UX Redesigned My Learning Dashboard Page
// Vibrant Mesh Gradient, Glassmorphism Controls, 3D Golden Stars & Smooth Stacking Contexts

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { UserService } from "@/domains/identity";
import { toast } from 'sonner';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Loader2,
  BookOpen,
  Clock,
  Play,
  CheckCircle2,
  Search,
  Bookmark,
  Calendar,
  Video,
  FileText,
  Wrench,
  Grid,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  Info,
  TrendingUp,
  BarChart3,
  X,
  Sprout,
  Flag,
  Lock,
  Code,
  Database,
  Palette,
  Layers,
  Cpu,
  Award,
  Target,
  Star,
  Medal,
  Trophy,
  Crown,
  Zap,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

interface LearningItem {
  id: string;
  title: string;
  type: 'Course' | 'Webinar' | 'Event' | 'Article';
  category: string;
  status: 'In Progress' | 'Completed' | 'Upcoming' | 'Live' | 'Not Started';
  progress?: number;
  completedModules?: number;
  totalModules?: number;
  timeLeft?: string;
  readTime?: string;
  instructor: string;
  date?: string;
  time?: string;
  coverImage: string;
  accentColor: string;
}

// 3D Bevelled Golden Star Component
const Exact3DGoldStar = ({
  size = 32,
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
      className={`drop-shadow-xs transition-transform duration-200 ${className}`}
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

const formatDateISO = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDefault7DaysRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  return {
    start: formatDateISO(start),
    end: formatDateISO(end)
  };
};

const getDefault30DaysRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return {
    start: formatDateISO(start),
    end: formatDateISO(end)
  };
};

const motionEase = [0.22, 1, 0.36, 1] as const;

const surfaceShell =
  'relative overflow-hidden rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/75 backdrop-blur-xl shadow-[0_12px_48px_rgba(15,23,42,0.06)]';

const spotlightFill = (accent: string) =>
  `radial-gradient(420px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), ${accent}, transparent 68%)`;

export default function MyLearningPage() {
  const { user, updateUser } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search State
  const [activeTab, setActiveTab] = useState<'all' | 'courses' | 'webinars' | 'workshops' | 'articles' | 'completed'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'In Progress' | 'Upcoming' | 'Not Started' | 'Completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [instructorFilter, setInstructorFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  // Dropdown States
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isTabDropdownOpen, setIsTabDropdownOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isInstructorOpen, setIsInstructorOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds(prev => {
      const isBookmarked = prev.includes(id);
      if (isBookmarked) {
        toast.info('Removed from saved items');
        return prev.filter(item => item !== id);
      } else {
        toast.success('Saved to your bookmarks! 🔖');
        return [...prev, id];
      }
    });
  };

  // Vibrant Multi-Color Sleek Still Border Gradients for Course Cards
  const stillBorderGradients = [
    'bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500',
    'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500',
    'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500',
    'bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500',
    'bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600',
    'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
  ];

  // Learning Time Analytics State (Infosys Springboard Style)
  const [learningTimeTab, setLearningTimeTab] = useState<'time' | 'history'>('time');
  const [weekOffset, setWeekOffset] = useState(0);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [showLearningTimeInfo, setShowLearningTimeInfo] = useState(false);
  const [enableDateRangeFilter, setEnableDateRangeFilter] = useState(true);

  // Date Picker & Date Search State
  const [selectedStartDate, setSelectedStartDate] = useState(() => getDefault7DaysRange().start);
  const [selectedEndDate, setSelectedEndDate] = useState(() => getDefault7DaysRange().end);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [activeDatePreset, setActiveDatePreset] = useState<'7d' | '30d' | 'custom'>('7d');
  const [userActivityMap, setUserActivityMap] = useState<Record<string, number>>({});
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Dynamic Date Search calculation using real user activity map
  const getDynamicDateRangeData = (startStr: string, endStr: string, offset: number, activityMap: Record<string, number>) => {
    try {
      const start = new Date(startStr);
      const end = new Date(endStr);

      let daysCount = 7;
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
        const diffMs = Math.abs(end.getTime() - start.getTime());
        daysCount = Math.min(Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1, 5), 31);
      }

      const daysList = [];
      for (let i = 0; i < daysCount; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i + offset * daysCount);

        const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
        const dayNum = String(d.getDate()).padStart(2, '0');
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

        const dateKey = formatDateISO(d);
        const secondsSpent = activityMap[dateKey] || 0;
        const mins = Math.round(secondsSpent / 60);

        daysList.push({
          label: `${monthStr} ${dayNum}`,
          day: dayName,
          mins: mins
        });
      }
      return daysList;
    } catch {
      return [];
    }
  };

  const learningTimeWeekData = getDynamicDateRangeData(selectedStartDate, selectedEndDate, weekOffset, userActivityMap);
  const calculatedAverageHrs = learningTimeWeekData.length > 0
    ? (learningTimeWeekData.reduce((acc, curr) => acc + curr.mins, 0) / (learningTimeWeekData.length * 60)).toFixed(1)
    : '0.0';

  const learningHistoryLogs = [
    { date: 'Jul 27, 2026', time: '14:30', title: 'Completed Intensive Fullstack Sprint', duration: '9.5 hrs', category: 'Course & Event' },
    { date: 'Jul 28, 2026', time: '09:15', title: 'Database Migration & API Security Module', duration: '4.0 hrs', category: 'Course' },
    { date: 'Jul 25, 2026', time: '16:00', title: 'Fullstack Event Lab Session', duration: '5.5 hrs', category: 'Event' },
    { date: 'Jul 23, 2026', time: '11:20', title: 'TypeScript & Next.js Advanced Patterns', duration: '3.0 hrs', category: 'Article' },
    { date: 'Jul 22, 2026', time: '10:00', title: 'React Masterclass Intro', duration: '1.5 hrs', category: 'Course' },
  ];

  const tabDropdownRef = useRef<HTMLDivElement>(null);

  // Course Review State
  const [reviewingItem, setReviewingItem] = useState<LearningItem | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewTitle, setReviewTitle] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewTags, setReviewTags] = useState<string[]>([]);
  const [userReviews, setUserReviews] = useState<Record<string, { rating: number; title: string; comment: string; tags: string[]; date: string }>>({});
  const [skillsPage, setSkillsPage] = useState(0);

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
      toast.error('Please write a short review before submitting.');
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
      if (tabDropdownRef.current && !tabDropdownRef.current.contains(event.target as Node)) {
        setIsTabDropdownOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
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
  const userName = currentUser?.name || currentUser?.full_name || 'Learner';

  useEffect(() => {
    if (currentUser?.username) {
      UserService.getUserActivity(currentUser.username)
        .then(data => {
          const map: Record<string, number> = {};
          if (Array.isArray(data)) {
            data.forEach((item: any) => {
              if (item?.date && typeof item.secondsSpent === 'number') {
                map[item.date] = item.secondsSpent;
              }
            });
          }
          setUserActivityMap(map);
        })
        .catch(err => {
          console.error('Failed to load user activity details:', err);
          setUserActivityMap({});
        });
    }
  }, [currentUser?.username]);

  const toggleBookmark = (id: string, title: string) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(prev => prev.filter(i => i !== id));
      toast.success(`Removed "${title}" from bookmarks`);
    } else {
      setBookmarkedIds(prev => [...prev, id]);
      toast.success(`Bookmarked "${title}"`);
    }
  };

  // Learning Content State
  const [learningItems, setLearningItems] = useState<LearningItem[]>([]);

  useEffect(() => {
    if (currentUser?.enrolledCourses) {
      const mappedItems: LearningItem[] = currentUser.enrolledCourses.map((course: any) => {
        let mappedType: LearningItem['type'] = 'Course';
        if (course.type) {
          const upperType = course.type.toUpperCase();
          if (upperType === 'WEBINAR') mappedType = 'Webinar';
          else if (upperType === 'WORKSHOP') mappedType = 'Event';
          else if (upperType === 'ARTICLE') mappedType = 'Article';
        }
        let inferredCategory = course.category;
        if (!inferredCategory || inferredCategory === 'General') {
          const t = (course.title || '').toLowerCase();
          if (t.includes('data science') || t.includes('python') || t.includes('machine learning') || t.includes('ai') || t.includes('analytics') || t.includes('data')) {
            inferredCategory = 'Data Science';
          } else if (t.includes('react') || t.includes('frontend') || t.includes('web') || t.includes('next') || t.includes('javascript') || t.includes('typescript')) {
            inferredCategory = 'React';
          } else if (t.includes('ux') || t.includes('ui') || t.includes('design') || t.includes('figma')) {
            inferredCategory = 'UI/UX Design';
          } else if (t.includes('sql') || t.includes('database') || t.includes('backend') || t.includes('node') || t.includes('java')) {
            inferredCategory = 'SQL & Databases';
          } else if (t.includes('structure') || t.includes('algorithm')) {
            inferredCategory = 'Data Structures';
          } else {
            inferredCategory = 'Software Engineering';
          }
        }

        const isItemCompleted = course.status === 'Completed' || course.status === 'COMPLETED' || course.progress === 100;

        return {
          id: course.courseId || course.id || `course-${Math.random()}`,
          title: course.title || 'Enrolled Course',
          type: mappedType,
          category: inferredCategory,
          status: isItemCompleted ? 'Completed' : 'In Progress',
          progress: isItemCompleted ? 100 : (course.progress || 0),
          instructor: course.instructor || 'Instructor',
          date: course.date || '',
          coverImage: course.coverImage || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80',
          accentColor: 'indigo'
        };
      });
      setLearningItems(mappedItems);

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

  // Dynamic Metrics
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

  // Dynamic Skills Progress derived from actual platform user courses & completed credentials
  const dynamicSkillsProgress = (() => {
    const skillsMap: Record<string, { totalProgress: number; count: number; isCompleted: boolean }> = {};

    learningItems.forEach(item => {
      const cat = item.category || 'General';
      if (!skillsMap[cat]) {
        skillsMap[cat] = { totalProgress: 0, count: 0, isCompleted: false };
      }
      const isComp = item.status === 'Completed' || (item.progress || 0) >= 100;
      skillsMap[cat].totalProgress += isComp ? 100 : (item.progress || 40);
      skillsMap[cat].count += 1;
      if (isComp) skillsMap[cat].isCompleted = true;
    });

    const skillStyles: Record<string, { icon: any; barColor: string; iconBg: string }> = {
      'Data Science': { icon: Cpu, barColor: 'bg-emerald-400/75 dark:bg-emerald-500/60', iconBg: 'bg-emerald-50/80 text-emerald-600/75 dark:bg-emerald-950/40 dark:text-emerald-400/75' },
      'React': { icon: Code, barColor: 'bg-sky-400/75 dark:bg-sky-500/60', iconBg: 'bg-sky-50/80 text-sky-600/75 dark:bg-sky-950/40 dark:text-sky-400/75' },
      'UI/UX Design': { icon: Palette, barColor: 'bg-rose-300/80 dark:bg-rose-400/60', iconBg: 'bg-rose-50/80 text-rose-500/75 dark:bg-rose-950/40 dark:text-rose-400/75' },
      'SQL & Databases': { icon: Database, barColor: 'bg-purple-300/80 dark:bg-purple-400/60', iconBg: 'bg-purple-50/80 text-purple-600/75 dark:bg-purple-950/40 dark:text-purple-400/75' },
      'Data Structures': { icon: Layers, barColor: 'bg-amber-300/80 dark:bg-amber-400/60', iconBg: 'bg-amber-50/80 text-amber-600/75 dark:bg-amber-950/40 dark:text-amber-400/75' },
      'Software Engineering': { icon: Wrench, barColor: 'bg-indigo-400/75 dark:bg-violet-500/60', iconBg: 'bg-violet-50/80 text-violet-600/75 dark:bg-violet-950/40 dark:text-violet-400/75' },
    };

    const categoriesPresent = Object.keys(skillsMap).filter(k => k !== 'General');

    // If categories exist in user items, compute exact progress per category
    if (categoriesPresent.length > 0) {
      return categoriesPresent.map(cat => {
        const d = skillsMap[cat];
        const avg = Math.round(d.totalProgress / d.count);
        const style = skillStyles[cat] || { icon: Code, barColor: 'bg-indigo-400/75 dark:bg-violet-500/60', iconBg: 'bg-violet-50/80 text-violet-600/75 dark:bg-violet-950/40 dark:text-violet-400/75' };
        return {
          name: cat,
          progress: d.isCompleted ? 100 : avg,
          icon: style.icon,
          barColor: style.barColor,
          iconBg: style.iconBg
        };
      });
    }

    return [];
  })();

  const hasLearningActivity = learningItems.length > 0 || Object.values(userActivityMap).some(sec => sec > 0);

  // Filtering Logic
  const filteredItems = learningItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTab = true;
    if (activeTab === 'courses') matchesTab = item.type === 'Course';
    else if (activeTab === 'webinars') matchesTab = item.type === 'Webinar';
    else if (activeTab === 'workshops') matchesTab = item.type === 'Event';
    else if (activeTab === 'articles') matchesTab = item.type === 'Article';
    else if (activeTab === 'completed') matchesTab = item.status === 'Completed';

    let matchesStatus = true;
    if (statusFilter === 'In Progress') matchesStatus = item.status === 'In Progress';
    else if (statusFilter === 'Completed') matchesStatus = item.status === 'Completed';
    else if (statusFilter === 'Not Started') matchesStatus = item.status === 'Not Started' || item.status === 'Upcoming' || (item.progress || 0) === 0;

    let matchesCategory = true;
    if (categoryFilter !== 'all') matchesCategory = item.category === categoryFilter;

    let matchesInstructor = true;
    if (instructorFilter !== 'all') matchesInstructor = item.instructor === instructorFilter;

    return matchesSearch && matchesTab && matchesStatus && matchesCategory && matchesInstructor;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'progress') {
      const aProgress = a.progress ?? 0;
      const bProgress = b.progress ?? 0;
      return bProgress - aProgress;
    }
    return 0;
  });

  // Pagination Logic (Max 6 courses per page)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, statusFilter, sortBy, categoryFilter, instructorFilter]);

  const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const shouldReduceMotion = useReducedMotion();

  const heroStats = useMemo(() => ([
    {
      label: 'Courses in progress',
      value: inProgressCount,
      hint: 'Active tracks',
      icon: Play,
      tone: 'from-violet-500/14 to-fuchsia-500/10 text-violet-700 dark:text-violet-300'
    },
    {
      label: 'Completed learning',
      value: completedCount,
      hint: 'Finished milestones',
      icon: CheckCircle2,
      tone: 'from-emerald-500/14 to-cyan-500/10 text-emerald-700 dark:text-emerald-300'
    },
    {
      label: 'Knowledge formats',
      value: enrolledCount + attendedCount + readCount,
      hint: 'Courses, events, articles',
      icon: Layers,
      tone: 'from-amber-500/14 to-orange-500/10 text-amber-700 dark:text-amber-300'
    },
    {
      label: 'Learning hours',
      value: calculatedAverageHrs,
      hint: 'Average per day',
      icon: Clock,
      tone: 'from-sky-500/14 to-indigo-500/10 text-sky-700 dark:text-sky-300'
    }
  ]), [attendedCount, calculatedAverageHrs, completedCount, enrolledCount, inProgressCount, readCount]);

  const journeyNodes = useMemo(() => {
    const currentLevel = completedCount >= 30 ? 5 : completedCount >= 20 ? 4 : completedCount >= 10 ? 3 : completedCount >= 3 ? 2 : 1;
    const nodes = [
      { level: 1, title: 'Beginner', req: 0, nextReq: 3, icon: Sprout, desc: 'Start your journey', tone: 'sky' },
      { level: 2, title: 'Explorer', req: 3, nextReq: 10, icon: Target, desc: '3 courses completed', tone: 'emerald' },
      { level: 3, title: 'Adventurer', req: 10, nextReq: 20, icon: Flag, desc: '10 courses completed', tone: 'amber' },
      { level: 4, title: 'Scholar', req: 20, nextReq: 30, icon: Award, desc: '20 courses completed', tone: 'violet' },
      { level: 5, title: 'Master', req: 30, nextReq: 30, icon: Crown, desc: '30 courses completed', tone: 'rose' }
    ];

    const activeNode = nodes.find(n => n.level === currentLevel) || nodes[0];
    const nextNode = nodes.find(n => n.level === currentLevel + 1);
    const coursesToNext = nextNode ? Math.max(0, nextNode.req - completedCount) : 0;
    const prevReq = activeNode.req;
    const nextTarget = nextNode ? nextNode.req : 30;
    const progressToNext = nextNode ? Math.min(100, Math.max(0, ((completedCount - prevReq) / (nextTarget - prevReq)) * 100)) : 100;
    const overallPercent = Math.min(100, Math.round((completedCount / 30) * 100));

    return { currentLevel, nodes, activeNode, nextNode, coursesToNext, progressToNext, overallPercent };
  }, [completedCount]);

  const JourneyActiveIcon = journeyNodes.activeNode.icon;



  if (isLoading || !currentUser) {
    return (
      <div
        className="flex h-[calc(100vh-80px)] items-center justify-center bg-slate-50 dark:bg-slate-950"
      >
        <Loader2 className="animate-spin text-violet-600" size={36} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/40">

      {/* Fixed Viewport ambient background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-white dark:bg-[#050816]"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 10% 10%, rgba(99, 102, 241, 0.08) 0%, transparent 55%),
            radial-gradient(ellipse 55% 45% at 88% 18%, rgba(14, 165, 233, 0.08) 0%, transparent 52%),
            radial-gradient(ellipse 48% 38% at 18% 82%, rgba(245, 158, 11, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse 42% 34% at 92% 78%, rgba(168, 85, 247, 0.06) 0%, transparent 48%),
            linear-gradient(to bottom, rgba(248,250,252,1) 0%, rgba(255,255,255,1) 45%, rgba(248,250,252,1) 100%)
          `
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.18] dark:opacity-[0.14]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.16) 1px, transparent 1px)',
          backgroundSize: '72px 72px'
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-32 space-y-8">

        {/* 1. HERO HEADER SECTION */}
        <motion.section
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: motionEase }}
          className={`${surfaceShell} px-5 sm:px-7 lg:px-8 py-6 sm:py-7`}
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,255,255,0.58))] dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.72),rgba(2,6,23,0.42))]" />
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute -left-16 bottom-0 h-52 w-52 rounded-full bg-violet-500/18 blur-3xl" />

          <div className="relative grid gap-7 lg:grid-cols-[1.25fr_0.75fr] lg:items-center min-h-[520px] lg:min-h-[560px] py-4 sm:py-6">
            <div className="space-y-5 lg:self-center">
              <div className="space-y-3 max-w-3xl">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-950 dark:text-white leading-[0.94]">
                  <span className="block">
                    {['A', 'sharper', 'view', 'of', 'your', 'learning', 'momentum.'].map((word, wordIndex) => (
                      <span key={word} className="inline-block mr-[0.22em] align-baseline">
                        {wordIndex === 6 ? (
                          <motion.span
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 16, scale: 0.96, filter: 'blur(8px)' }}
                            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                            transition={{ duration: 0.65, delay: 0.72, ease: motionEase }}
                            className="inline-block bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-[length:180%_180%] bg-clip-text text-transparent"
                          >
                            {word.split('').map((letter, letterIndex) => (
                              <motion.span
                                key={`${word}-${letterIndex}`}
                                initial={shouldReduceMotion ? false : { opacity: 0, y: 14, scale: 0.94, filter: 'blur(6px)' }}
                                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                transition={{ duration: 0.34, delay: 0.72 + letterIndex * 0.03, ease: motionEase }}
                                className="inline-block"
                              >
                                {letter}
                              </motion.span>
                            ))}
                          </motion.span>
                        ) : (
                          word.split('').map((letter, letterIndex) => (
                            <motion.span
                              key={`${word}-${letterIndex}`}
                              initial={shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.98, filter: 'blur(4px)' }}
                              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                              transition={{ duration: 0.26, delay: wordIndex * 0.07 + letterIndex * 0.016, ease: motionEase }}
                              className="inline-block"
                            >
                              {letter}
                            </motion.span>
                          ))
                        )}
                      </span>
                    ))}
                  </span>
                </h1>
                <p className="max-w-2xl text-sm sm:text-base leading-7 text-slate-600 dark:text-slate-300">
                  Review progress, resume the right course fast, and stay oriented with a cleaner dashboard that balances insight with focus.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={continueLearningItem ? `/learn/${continueLearningItem.id}` : '/explore'}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4.5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition-transform duration-200 hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                >
                  <Play size={15} />
                  Resume learning
                </Link>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4.5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200 dark:hover:border-slate-700"
                >
                  Browse catalog
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_16px_35px_rgba(15,23,42,0.06)] dark:border-slate-800/80 dark:bg-slate-950/80">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800/80">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Current focus</p>
                    <h2 className="mt-1 text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                      {continueLearningItem ? continueLearningItem.title : 'No active course yet'}
                    </h2>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-[0_12px_28px_rgba(99,102,241,0.24)]">
                    <Play size={16} className="fill-current" />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {heroStats.map((stat) => {
                    const StatIcon = stat.icon;
                    return (
                      <div key={stat.label} className={`rounded-2xl bg-gradient-to-br ${stat.tone} px-3.5 py-3`}>
                        <div className="flex items-center justify-between gap-2">
                          <StatIcon size={14} className="text-current/80" />
                          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-current/60">Insight</span>
                        </div>
                        <div className="mt-3">
                          <div className="text-2xl font-semibold text-slate-950 dark:text-white">{stat.value}</div>
                          <p className="mt-1 text-[11px] leading-4 text-slate-500 dark:text-slate-300">{stat.label}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-400">{stat.hint}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200/80 bg-white/90 px-4 py-3 dark:border-slate-800/80 dark:bg-slate-950/80">
                <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold uppercase tracking-[0.18em]">Learning pulse</span>
                  <span>{currentUser?.username ? `Synced for ${userName}` : 'Ready to sync'}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <motion.div
                    initial={shouldReduceMotion ? false : { width: 0 }}
                    animate={{ width: `${Math.max(completedCount, 1) / 30 * 100}%` }}
                    transition={{ duration: 0.9, ease: motionEase }}
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <span>{completedCount} courses complete</span>
                  <span>{inProgressCount} currently active</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 2. MAIN ASYMMETRIC GRID: LEFT 3/4 (SEARCH & COURSES) & RIGHT 1/4 (CONTINUE LEARNING, JOURNEY & SKILLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-9 lg:gap-10 items-start pt-2">

          {/* LEFT SIDE COLUMN (lg:col-span-9): SEARCH BAR & COURSE CONTENT LIBRARY */}
          <div className="lg:col-span-9 space-y-6">

            {/* SEARCH BAR & FILTERS (CONSTRAINED TO 3/4 LEFT COLUMN LENGTH) */}
            <div id="learning-items-section" className={`scroll-mt-24 relative isolate z-[60] w-full overflow-visible ${surfaceShell} p-3 sm:p-4`}>
              <div className="flex flex-col xl:flex-row xl:items-center gap-3">
              {/* Content Type Filter Dropdown */}
              {(() => {
                const contentTypeOptions = [
                  { id: 'all', label: 'All Content', icon: Grid, count: learningItems.length },
                  { id: 'courses', label: 'Courses', icon: BookOpen, count: enrolledCount },
                  { id: 'webinars', label: 'Webinars', icon: Video, count: attendedCount },
                  { id: 'workshops', label: 'Events', icon: Wrench, count: learningItems.filter(i => i.type === 'Event').length },
                  { id: 'articles', label: 'Articles', icon: FileText, count: readCount },
                ];
                const selectedOption = contentTypeOptions.find(o => o.id === activeTab) || contentTypeOptions[0];
                const SelectedIcon = selectedOption.icon;

                return (
                  <div ref={tabDropdownRef} className="relative z-[70] shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsTabDropdownOpen(!isTabDropdownOpen)}
                      className="w-full sm:w-44 px-3.5 py-2.5 bg-slate-50/90 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between gap-2 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <SelectedIcon size={15} className="text-violet-600 dark:text-violet-400 shrink-0" />
                        <span className="truncate">{selectedOption.label}</span>
                      </div>
                      <ChevronRight size={14} className={`shrink-0 transition-transform duration-200 ${isTabDropdownOpen ? '-rotate-90 text-violet-600' : 'rotate-90 text-slate-400'}`} />
                    </button>

                    <AnimatePresence>
                      {isTabDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-full mt-2 w-48 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-[80] overflow-hidden"
                        >
                          {contentTypeOptions.map((opt) => {
                            const OptIcon = opt.icon;
                            const isSelected = activeTab === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  setActiveTab(opt.id as any);
                                  setIsTabDropdownOpen(false);
                                }}
                                className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-colors ${isSelected
                                  ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-indigo-300'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                  }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <OptIcon size={14} className={isSelected ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'} />
                                  <span>{opt.label}</span>
                                </div>
                                {isSelected && <span className="text-violet-600 font-black">✓</span>}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })()}

              {/* Status Filter Dropdown */}
              {(() => {
                const statusOptions = [
                  { id: 'all', label: 'All Status' },
                  { id: 'Completed', label: 'Completed' },
                  { id: 'In Progress', label: 'In Progress' },
                  { id: 'Not Started', label: 'Not Started' },
                ];
                const selectedStatus = statusOptions.find(o => o.id === statusFilter) || statusOptions[0];

                return (
                  <div ref={filterBarRef} className="relative z-[70] shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsStatusOpen(!isStatusOpen)}
                      className="w-full sm:w-44 px-3.5 py-2.5 bg-slate-50/90 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between gap-2 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <SlidersHorizontal size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />
                        <span className="truncate">{selectedStatus.label}</span>
                      </div>
                      <ChevronRight size={14} className={`shrink-0 transition-transform duration-200 ${isStatusOpen ? '-rotate-90 text-violet-600' : 'rotate-90 text-slate-400'}`} />
                    </button>

                    <AnimatePresence>
                      {isStatusOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-full mt-2 w-48 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-[80] overflow-hidden"
                        >
                          {statusOptions.map((opt) => {
                            const isSelected = statusFilter === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  setStatusFilter(opt.id as any);
                                  setIsStatusOpen(false);
                                }}
                                className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-colors ${isSelected
                                  ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-indigo-300'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                  }`}
                              >
                                <span>{opt.label}</span>
                                {isSelected && <span className="text-violet-600 font-black">✓</span>}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })()}

              {/* Search Input (Expands to fit card space) */}
              <div className="relative flex-1 min-w-0 w-full z-[65]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search courses by title, instructor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50/90 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-700 absolute right-2.5 top-1/2 -translate-y-1/2"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {(() => {
                const sortOptions = [
                  { value: 'recent', label: 'Recently Accessed' },
                  { value: 'title', label: 'Title (A-Z)' },
                  { value: 'progress', label: 'Progress (High to Low)' }
                ];

                return (
                  <div ref={sortRef} className="relative z-[70] shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsSortOpen(!isSortOpen)}
                      className="w-full sm:w-52 px-3.5 py-2.5 bg-slate-950 text-white dark:bg-white dark:text-slate-950 border border-slate-950/5 dark:border-white/5 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 shadow-[0_10px_24px_rgba(15,23,42,0.12)] hover:scale-[1.01] transition-transform"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Zap size={14} className="text-amber-400 shrink-0" />
                        <span className="truncate">{currentSortLabel}</span>
                      </div>
                      <ChevronRight size={14} className={`shrink-0 transition-transform duration-200 ${isSortOpen ? '-rotate-90' : 'rotate-90'}`} />
                    </button>

                    <AnimatePresence>
                      {isSortOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-[80] overflow-hidden"
                        >
                          {sortOptions.map((opt) => {
                            const isSelected = sortBy === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  setSortBy(opt.value);
                                  setIsSortOpen(false);
                                }}
                                className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-colors ${isSelected
                                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                  }`}
                              >
                                <span>{opt.label}</span>
                                {isSelected && <span className="font-black">✓</span>}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })()}
              </div>
            </div>

            {/* Learning Cards Grid */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={`${activeTab}-${statusFilter}-${sortBy}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
              >
                {paginatedItems.map((item, idx) => {
                  const isBookmarked = bookmarkedIds.includes(item.id);

                  // Dynamic color themes per card (Light, bright, vibrant pastel styling)
                  const cardThemes = [
                    {
                      accent: 'from-violet-500 to-fuchsia-500',
                      tagBg: 'bg-violet-50 text-violet-700 border-violet-200',
                      bar: 'from-violet-500 via-fuchsia-400 to-pink-400',
                      btn: 'bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 hover:border-violet-300 shadow-xs',
                      dot: 'bg-violet-500',
                      hoverGlow: 'hover:shadow-[0_12px_28px_rgba(139,92,246,0.12)] hover:border-violet-300'
                    },
                    {
                      accent: 'from-amber-500 to-orange-400',
                      tagBg: 'bg-amber-50 text-amber-800 border-amber-200',
                      bar: 'from-amber-400 via-orange-400 to-rose-400',
                      btn: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 hover:border-amber-300 shadow-xs',
                      dot: 'bg-amber-500',
                      hoverGlow: 'hover:shadow-[0_12px_28px_rgba(245,158,11,0.12)] hover:border-amber-300'
                    },
                    {
                      accent: 'from-rose-500 to-pink-400',
                      tagBg: 'bg-rose-50 text-rose-700 border-rose-200',
                      bar: 'from-rose-400 via-pink-400 to-fuchsia-400',
                      btn: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 shadow-xs',
                      dot: 'bg-rose-500',
                      hoverGlow: 'hover:shadow-[0_12px_28px_rgba(244,63,94,0.12)] hover:border-rose-300'
                    },
                    {
                      accent: 'from-emerald-500 to-teal-400',
                      tagBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                      bar: 'from-emerald-400 via-teal-400 to-cyan-400',
                      btn: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 hover:border-emerald-300 shadow-xs',
                      dot: 'bg-emerald-500',
                      hoverGlow: 'hover:shadow-[0_12px_28px_rgba(16,185,129,0.12)] hover:border-emerald-300'
                    }
                  ];

                  const theme = cardThemes[idx % cardThemes.length];

                  return (
                    <motion.div
                      key={item.id}
                      layout="position"
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.1 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{
                        duration: 0.35,
                        ease: 'easeOut',
                        delay: Math.min(idx * 0.04, 0.2)
                      }}
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        e.currentTarget.style.setProperty('--spotlight-x', `${x}px`);
                        e.currentTarget.style.setProperty('--spotlight-y', `${y}px`);
                      }}
                      className={`${surfaceShell} group/card flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(15,23,42,0.12)] ${theme.hoverGlow} border-t-4 border-t-transparent`}
                      style={{ borderTopColor: item.type === 'Course' ? '#8b5cf6' : item.type === 'Webinar' ? '#22c55e' : item.type === 'Article' ? '#0ea5e9' : '#f59e0b' }}
                    >
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" style={{ background: spotlightFill('rgba(168, 85, 247, 0.12)') }} />

                      {/* Top Media Banner */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/48 via-slate-950/10 to-transparent pointer-events-none" />
                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/90 via-white/45 to-transparent dark:from-slate-950/88 dark:via-slate-950/35" />

                        {/* Floating Category Pill */}
                        <div className="absolute top-3 left-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md shadow-xs border bg-white/90 dark:bg-slate-950/80 text-slate-700 dark:text-slate-200 border-white/70 dark:border-slate-700/70`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                            {item.category || item.type || 'Course'}
                          </span>
                        </div>

                        {/* Floating Bookmark Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleToggleBookmark(item.id);
                          }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-950/90 text-slate-700 dark:text-slate-200 backdrop-blur-md flex items-center justify-center shadow-xs hover:scale-110 active:scale-95 transition-all border border-white/70 dark:border-slate-700/70"
                        >
                          <Bookmark size={13} className={isBookmarked ? 'fill-violet-600 text-violet-600 dark:fill-violet-400 dark:text-violet-400' : ''} />
                        </button>

                        {/* Bottom Overlay Info on Image */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-semibold text-white">
                          <span className="flex items-center gap-1.5 bg-slate-950/70 text-white backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-xs"><BookOpen size={11} className="text-slate-200" />
                            {item.totalModules ? `${item.totalModules} Modules` : 'Interactive'}
                          </span>
                          {item.timeLeft && (
                            <span className="flex items-center gap-1.5 bg-slate-950/70 text-white backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-xs"><Clock size={11} className="text-slate-200" />
                              {item.timeLeft}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="relative z-10 p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <h4 className="text-[15px] font-semibold text-slate-950 dark:text-white line-clamp-2 leading-snug transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />
                            By <span className="font-semibold text-slate-700 dark:text-slate-300">{item.instructor}</span>
                          </p>
                        </div>

                        {/* Progress Track & Action Section */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                          {item.status === 'Completed' ? (
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => handleOpenReview(item)}
                                className="flex flex-col items-start cursor-pointer group/ratingBtn"
                              >
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => {
                                    const itemRating = userReviews[item.id]?.rating || 0;
                                    return (
                                      <Exact3DGoldStar
                                        key={i}
                                        size={14}
                                        isFilled={i < itemRating}
                                      />
                                    );
                                  })}
                                </div>
                                <span className="text-[10px] font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors mt-0.5">
                                  {userReviews[item.id] ? 'Edit Rating' : 'Leave Rating'}
                                </span>
                              </button>

                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 flex items-center gap-1.5">
                                <CheckCircle2 size={11} /> Completed
                              </span>
                            </div>
                          ) : (
                            <>
                              {/* Progress row */}
                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-[11px]">
                                  <span className="font-medium text-slate-500 dark:text-slate-400">Progress</span>
                                  <span className="font-bold text-slate-900 dark:text-white">{item.progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-px">
                                  <motion.div
                                    initial={shouldReduceMotion ? false : { width: 0 }}
                                    whileInView={{ width: `${item.progress}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, ease: motionEase }}
                                    className="h-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 rounded-full"
                                  />
                                </div>
                              </div>

                              {/* Button CTA (Light Blue) */}
                              <Link
                                href={`/learn/${item.id}`}
                                className="w-full py-2.5 px-3 rounded-2xl text-white text-xs font-semibold bg-slate-950 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-md shadow-slate-950/15 transition-all flex items-center justify-center gap-1.5 active:scale-98"
                              >
                                <span>Continue Learning</span>
                                <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {sortedItems.length === 0 && (
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: motionEase }}
                className={`${surfaceShell} p-8 sm:p-12 text-center my-6 flex flex-col items-center justify-center overflow-hidden relative group/empty`}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  e.currentTarget.style.setProperty('--spotlight-x', `${x}px`);
                  e.currentTarget.style.setProperty('--spotlight-y', `${y}px`);
                }}
              >
                {/* ReactBits Dynamic Radial Spotlight */}
                <div
                  className="pointer-events-none absolute -inset-px opacity-0 group-hover/empty:opacity-100 transition-opacity duration-500 ease-out z-0"
                  style={{
                    background: 'radial-gradient(500px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(139, 92, 246, 0.10), transparent 70%)'
                  }}
                />

                {/* Interactive Orbiting Knowledge Portal / Radar */}
                <div className="relative z-10 mx-auto w-64 h-56 flex items-center justify-center select-none">
                  {/* Outer Orbit Ring */}
                  <motion.div
                    animate={shouldReduceMotion ? {} : { rotate: 360 }}
                    transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-52 h-52 rounded-full border border-dashed border-violet-300/50 dark:border-violet-700/40 pointer-events-none"
                  />

                  {/* Inner Orbit Ring */}
                  <motion.div
                    animate={shouldReduceMotion ? {} : { rotate: -360 }}
                    transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-36 h-36 rounded-full border border-dashed border-sky-300/60 dark:border-sky-700/40 pointer-events-none"
                  />

                  {/* Ambient Glow Aura */}
                  <motion.div
                    animate={shouldReduceMotion ? {} : { scale: [1, 1.15, 1], opacity: [0.35, 0.65, 0.35] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute w-28 h-28 rounded-full bg-gradient-to-tr from-violet-500/20 via-sky-400/25 to-emerald-400/20 blur-xl pointer-events-none"
                  />

                  {/* Central Interactive Glass Core */}
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    animate={shouldReduceMotion ? {} : { y: [-3, 3, -3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-20 w-20 h-20 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-700/90 shadow-[0_12px_32px_rgba(99,102,241,0.2)] flex items-center justify-center backdrop-blur-md cursor-pointer group/core"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-violet-500/30 group-hover/core:rotate-12 transition-transform duration-300">
                      <Sparkles size={22} className="animate-pulse" />
                    </div>
                  </motion.div>

                  {/* Orbiting Interactive Skill Satellite Chips */}
                  <motion.div
                    animate={shouldReduceMotion ? {} : { y: [-4, 4, -4] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                    whileHover={{ scale: 1.08, y: -6 }}
                    className="absolute -top-1 left-2 z-20 px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 border border-violet-200/90 dark:border-violet-800/90 shadow-sm text-[11px] font-bold text-violet-700 dark:text-violet-300 flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                    <span>AI & ML</span>
                  </motion.div>

                  <motion.div
                    animate={shouldReduceMotion ? {} : { y: [4, -4, 4] }}
                    transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                    whileHover={{ scale: 1.08, y: -6 }}
                    className="absolute top-8 -right-3 z-20 px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 border border-sky-200/90 dark:border-sky-800/90 shadow-sm text-[11px] font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    <span>Full Stack</span>
                  </motion.div>

                  <motion.div
                    animate={shouldReduceMotion ? {} : { y: [-3, 3, -3] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                    whileHover={{ scale: 1.08, y: -6 }}
                    className="absolute -bottom-1 right-2 z-20 px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 border border-emerald-200/90 dark:border-emerald-800/90 shadow-sm text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>DevOps</span>
                  </motion.div>

                  <motion.div
                    animate={shouldReduceMotion ? {} : { y: [3, -3, 3] }}
                    transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                    whileHover={{ scale: 1.08, y: -6 }}
                    className="absolute bottom-6 -left-3 z-20 px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 border border-amber-200/90 dark:border-amber-800/90 shadow-sm text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>UI/UX</span>
                  </motion.div>
                </div>

                {/* Content Message */}
                <div className="relative z-10 space-y-2 max-w-md mx-auto pt-2">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {learningItems.length === 0 ? "Your Learning Journey Begins Here" : "No Courses Match Your Filter"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {learningItems.length === 0
                      ? "Explore our curated catalog of interactive tracks, workshops, and courses to start building your skills."
                      : "Try adjusting your search query or reset your active filters to view all enrolled courses."}
                  </p>
                </div>

                {/* Interactive Action Buttons */}
                <div className="relative z-10 pt-4 flex flex-wrap items-center justify-center gap-3">
                  {learningItems.length === 0 ? (
                    <Link
                      href="/explore"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 hover:from-blue-700 hover:to-sky-600 text-white text-xs font-bold shadow-md shadow-blue-500/25 hover:shadow-lg transition-all active:scale-98"
                    >
                      <BookOpen size={14} />
                      <span>Explore Catalog</span>
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('all');
                          setSearchQuery('');
                          setStatusFilter('all');
                        }}
                        className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-2xl text-xs font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/60 border border-violet-200/80 dark:border-violet-800/80 transition-all active:scale-98 shadow-xs"
                      >
                        <span>Reset all filters</span>
                      </button>
                      <Link
                        href="/explore"
                        className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 hover:from-blue-700 hover:to-sky-600 shadow-md shadow-blue-500/20 transition-all active:scale-98"
                      >
                        <BookOpen size={13} />
                        <span>Browse More Courses</span>
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2 border-t border-slate-200/60 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Showing Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                      document.getElementById('learning-items-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1 shadow-xs"
                  >
                    <ChevronLeft size={14} />
                    <span>Previous</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pageNum);
                        document.getElementById('learning-items-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${currentPage === pageNum
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-600/25'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs'
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage(prev => Math.min(prev + 1, totalPages));
                      document.getElementById('learning-items-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1 shadow-xs"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* LEARNING TIME ANALYTICS (INLINE TO FILL LEFT COLUMN SPACE) */}
            {hasLearningActivity && (
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4 mt-6">

                {/* Header & Date Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <BarChart3 size={18} className="text-violet-600" />
                      <span>Learning Time</span>
                    </h3>

                  </div>

                  {/* Date Search Controls & Average Display */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div ref={datePickerRef} className="relative z-40">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 shadow-xs">
                        <button
                          type="button"
                          onClick={() => setWeekOffset(w => w - 1)}
                          className="p-0.5 text-slate-400 hover:text-violet-600 transition-colors"
                        >
                          <ChevronLeft size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                          className="flex items-center gap-1.5 hover:text-violet-600 transition-colors"
                        >
                          <Calendar size={13} className="text-violet-600 dark:text-violet-400 shrink-0" />
                          <span>{selectedStartDate} to {selectedEndDate}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setWeekOffset(w => w + 1)}
                          className="p-0.5 text-slate-400 hover:text-violet-600 transition-colors"
                        >
                          <ChevronRight size={13} />
                        </button>
                      </div>

                      {/* Always-visible warning if < 5 days selected and picker is closed */}
                      {(() => {
                        const s = new Date(selectedStartDate);
                        const e = new Date(selectedEndDate);
                        const diffDays = Math.ceil(Math.abs(e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                        if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e >= s && diffDays < 5 && !isDatePickerOpen) {
                          return (
                            <div className="absolute -bottom-4 right-1 pointer-events-none">
                              <span className="text-[9px] font-extrabold text-amber-500 flex items-center gap-1 opacity-90 shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-1.5 py-0.5 rounded-full">
                                <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                                Select at least 5 days
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      <AnimatePresence>
                        {isDatePickerOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 6 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 w-72 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 space-y-3"
                          >
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                              <span className="text-xs font-black text-slate-900 dark:text-white">Search Learning Time by Date</span>
                              <button
                                type="button"
                                onClick={() => setIsDatePickerOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                              >
                                <X size={13} />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const { start, end } = getDefault7DaysRange();
                                  setSelectedStartDate(start);
                                  setSelectedEndDate(end);
                                  setActiveDatePreset('7d');
                                  setWeekOffset(0);
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-center transition-colors ${activeDatePreset === '7d'
                                  ? 'bg-violet-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                  }`}
                              >
                                Last 7 Days
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const { start, end } = getDefault30DaysRange();
                                  setSelectedStartDate(start);
                                  setSelectedEndDate(end);
                                  setActiveDatePreset('30d');
                                  setWeekOffset(0);
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-center transition-colors ${activeDatePreset === '30d'
                                  ? 'bg-violet-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                  }`}
                              >
                                Last 30 Days
                              </button>
                            </div>

                            <div className="space-y-2 pt-1">
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                  From Date
                                </label>
                                <input
                                  type="date"
                                  value={selectedStartDate}
                                  onChange={(e) => {
                                    setSelectedStartDate(e.target.value);
                                    setActiveDatePreset('custom');
                                  }}
                                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                  To Date
                                </label>
                                <input
                                  type="date"
                                  value={selectedEndDate}
                                  onChange={(e) => {
                                    setSelectedEndDate(e.target.value);
                                    setActiveDatePreset('custom');
                                  }}
                                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                              </div>
                            </div>

                            {/* Permanent 5 days hint */}
                            <div className="pt-1 pb-0.5">
                              <p className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg py-1.5 border border-slate-100 dark:border-slate-800/80">
                                <Info size={12} className="text-indigo-500 dark:text-violet-400" />
                                Please select at least 5 days
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      Average : <span className="font-extrabold text-violet-600 dark:text-amber-400">{calculatedAverageHrs} Hours/Day</span>
                    </span>
                  </div>
                </div>

                {/* Bar Chart Container */}
                <div className="pt-2">
                  <div className="relative h-48 w-full flex items-end">
                    <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.08),transparent_42%),radial-gradient(circle_at_90%_10%,rgba(16,185,129,0.08),transparent_30%),linear-gradient(to_bottom,rgba(255,255,255,0.0),rgba(255,255,255,0.0))] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.12),transparent_42%),radial-gradient(circle_at_90%_10%,rgba(16,185,129,0.1),transparent_30%)]" />
                    {/* Grid Lines & Y-Axis Scale (Hours) */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pr-4 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                      {[12, 9, 6, 3, 0].map((val) => (
                        <div key={val} className="flex items-center gap-3 w-full">
                          <span className="w-9 text-right shrink-0">{val} hrs</span>
                            <div className="w-full h-px bg-slate-200/80 dark:bg-slate-800" />
                        </div>
                      ))}
                    </div>

                    {/* Bars Render */}
                    <div className="w-full pl-12 h-full flex items-end justify-between gap-2 z-10 pt-4">
                      {learningTimeWeekData.map((d, i) => {
                        const hrs = (d.mins / 60).toFixed(1);
                        const heightPercent = Math.min((d.mins / (12 * 60)) * 100, 100);
                        const isHovered = hoveredBarIndex === i;
                        const isManyBars = learningTimeWeekData.length > 14;

                        return (
                          <div
                            key={i}
                            className="relative flex-1 flex flex-col items-center h-full justify-end group/bar cursor-pointer"
                            onMouseEnter={() => setHoveredBarIndex(i)}
                            onMouseLeave={() => setHoveredBarIndex(null)}
                          >
                            <AnimatePresence>
                              {isHovered && (
                                <motion.div
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 4 }}
                                  className="absolute bottom-full mb-2 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-semibold text-center shadow-md z-30 pointer-events-none whitespace-nowrap"
                                >
                                  {d.label} ({d.day}): {hrs} hrs
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="w-full max-w-[36px] h-[82%] flex items-end justify-center">
                              <motion.div
                                key={`bar-${i}-${weekOffset}-${d.mins}`}
                                initial={{ height: 0 }}
                                whileInView={{ height: `${d.mins > 0 ? Math.max(heightPercent, 2) : 0}%` }}
                                viewport={{ once: false, amount: 0.2 }}
                                transition={{ duration: 0.4, ease: 'easeOut', delay: Math.min(i * 0.02, 0.5) }}
                                className="w-full rounded-t-[0.6rem] bg-gradient-to-t from-sky-600 via-cyan-500 to-emerald-400 dark:from-sky-500 dark:via-cyan-400 dark:to-emerald-300 opacity-85 shadow-[0_8px_18px_rgba(14,165,233,0.12)] group-hover/bar:opacity-100 transition-opacity"
                              />
                            </div>

                            <div className="mt-1.5 text-center">
                              <p className={`font-semibold text-slate-700 dark:text-slate-300 ${isManyBars ? 'text-[8px] truncate max-w-[24px]' : 'text-[10px]'}`}>
                                {isManyBars ? d.label.replace('Jul ', '7/').replace('Jun ', '6/') : d.label}
                              </p>
                              {!isManyBars && (
                                <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
                                  {d.day}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

                    {/* RIGHT SIDEBAR COLUMN */}
          <div className="lg:col-span-3 space-y-6 sticky top-28 self-start pb-8">

            {continueLearningItem && (
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: motionEase }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  e.currentTarget.style.setProperty('--spotlight-x', `${x}px`);
                  e.currentTarget.style.setProperty('--spotlight-y', `${y}px`);
                }}
                className={`${surfaceShell} group/resume`}
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/resume:opacity-100" style={{ background: spotlightFill('rgba(14, 165, 233, 0.12)') }} />

                {continueLearningItem.coverImage && (
                  <div className="relative h-32 w-full overflow-hidden">
                    <img
                      src={continueLearningItem.coverImage}
                      alt={continueLearningItem.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/resume:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-transparent" />
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-slate-950/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Resume
                    </div>
                    <span className="absolute top-3 right-3 rounded-full border border-white/15 bg-slate-950/75 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
                      {continueLearningItem.category || 'Course'}
                    </span>
                  </div>
                )}

                <div className="relative z-10 p-5 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                      Continue where you left off
                    </p>
                    <h3 className="text-[17px] font-semibold leading-snug text-slate-950 dark:text-white line-clamp-2">
                      {continueLearningItem.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Instructor <span className="font-semibold text-slate-700 dark:text-slate-300">{continueLearningItem.instructor}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="rounded-2xl bg-slate-50 px-3 py-2 dark:bg-slate-900/80">
                      <p className="font-semibold text-slate-900 dark:text-white">Progress</p>
                      <p>{continueLearningItem.progress}% complete</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-2 dark:bg-slate-900/80">
                      <p className="font-semibold text-slate-900 dark:text-white">Modules</p>
                      <p>{continueLearningItem.totalModules || 'Interactive track'}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500 dark:text-slate-400">Course progress</span>
                      <span className="font-semibold text-slate-950 dark:text-white">{continueLearningItem.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <motion.div
                        initial={shouldReduceMotion ? false : { width: 0 }}
                        animate={{ width: `${continueLearningItem.progress}%` }}
                        transition={{ duration: 1, ease: motionEase }}
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/learn/${continueLearningItem.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                    >
                      <Play size={13} className="fill-current" />
                      Resume course
                    </Link>
                    <Link
                      href={`/learn/${continueLearningItem.id}`}
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                    >
                      Details
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            <div className={`${surfaceShell} p-5 space-y-4`}>
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800/80">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Learning Journey</p>
                  <h3 className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">Learning journey</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {completedCount} of 30 courses finished
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 to-slate-800 text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)] dark:from-white dark:to-slate-200 dark:text-slate-950">
                  <JourneyActiveIcon size={16} />
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/80 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-950/70">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Current stage</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                        <JourneyActiveIcon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">{journeyNodes.activeNode.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {journeyNodes.nextNode ? `${journeyNodes.coursesToNext} more to ${journeyNodes.nextNode.title}` : 'Top level reached'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Progress</p>
                    <p className="text-2xl font-bold text-slate-950 dark:text-white">{journeyNodes.overallPercent}%</p>
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <motion.div
                    initial={shouldReduceMotion ? false : { width: 0 }}
                    animate={{ width: `${journeyNodes.overallPercent}%` }}
                    transition={{ duration: 0.9, ease: motionEase }}
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400"
                  />
                </div>
              </div>

              <div className="relative pl-4">
                <div className="absolute bottom-8 top-2 left-[19px] w-px bg-gradient-to-b from-sky-200 via-slate-200 to-emerald-200 dark:from-sky-800 dark:via-slate-800 dark:to-emerald-800" />

                <div className="space-y-3">
                  {journeyNodes.nodes.map((node) => {
                    const isCompleted = journeyNodes.currentLevel > node.level;
                    const isActive = journeyNodes.currentLevel === node.level;
                    const NodeIcon = node.icon;
                    const stageToneMap = {
                      sky: {
                        ring: 'border-sky-200 dark:border-sky-500/30',
                        soft: 'bg-sky-50/75 dark:bg-sky-950/25',
                        icon: 'bg-slate-950 text-white dark:bg-sky-400 dark:text-slate-950',
                        chip: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-950/30 dark:text-sky-300',
                        gradient: 'from-sky-500 via-cyan-500 to-indigo-500'
                      },
                      emerald: {
                        ring: 'border-emerald-200 dark:border-emerald-500/30',
                        soft: 'bg-emerald-50/75 dark:bg-emerald-950/25',
                        icon: 'bg-slate-950 text-white dark:bg-emerald-400 dark:text-slate-950',
                        chip: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-300',
                        gradient: 'from-emerald-500 via-cyan-500 to-sky-500'
                      },
                      amber: {
                        ring: 'border-amber-200 dark:border-amber-500/30',
                        soft: 'bg-amber-50/75 dark:bg-amber-950/25',
                        icon: 'bg-slate-950 text-white dark:bg-amber-400 dark:text-slate-950',
                        chip: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-300',
                        gradient: 'from-amber-500 via-orange-500 to-rose-500'
                      },
                      violet: {
                        ring: 'border-violet-200 dark:border-violet-500/30',
                        soft: 'bg-violet-50/75 dark:bg-violet-950/25',
                        icon: 'bg-slate-950 text-white dark:bg-violet-400 dark:text-slate-950',
                        chip: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-950/30 dark:text-violet-300',
                        gradient: 'from-violet-500 via-fuchsia-500 to-cyan-500'
                      },
                      rose: {
                        ring: 'border-rose-200 dark:border-rose-500/30',
                        soft: 'bg-rose-50/75 dark:bg-rose-950/25',
                        icon: 'bg-slate-950 text-white dark:bg-rose-400 dark:text-slate-950',
                        chip: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-300',
                        gradient: 'from-rose-500 via-pink-500 to-fuchsia-500'
                      }
                    } as const;
                    const stageTone: (typeof stageToneMap)[keyof typeof stageToneMap] = stageToneMap[node.tone as keyof typeof stageToneMap] ?? stageToneMap.sky;

                    return (
                      <motion.div
                        key={node.level}
                        initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        whileHover={isCompleted || isActive ? { y: -2, scale: 1.01 } : { x: 4, scale: 1.01 }}
                        transition={{ duration: 0.22, ease: motionEase }}
                        className="relative flex items-start gap-3"
                      >
                        <motion.div
                          whileHover={isActive || isCompleted ? { rotate: 6 } : { rotate: 0 }}
                          animate={isActive && !shouldReduceMotion ? { boxShadow: ['0 0 0 0 rgba(14,165,233,0.18)', '0 0 0 12px rgba(14,165,233,0)'] } : {}}
                          transition={{ duration: 1.8, repeat: isActive && !shouldReduceMotion ? Infinity : 0, ease: 'easeOut' }}
                          className={`relative z-10 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                            isCompleted
                              ? stageTone.ring + ' ' + stageTone.icon
                              : isActive
                              ? stageTone.ring + ' ' + stageTone.icon
                              : 'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-500'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 size={15} /> : <NodeIcon size={15} />}
                        </motion.div>

                        <div className={`group flex-1 rounded-[1.4rem] border px-4 py-3 ${
                          isActive
                            ? `${stageTone.ring} ${stageTone.soft}`
                            : isCompleted
                            ? 'border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/70'
                            : 'border-slate-100 bg-slate-50/70 dark:border-slate-800/60 dark:bg-slate-900/40'
                        }`}>
                          <div className="pointer-events-none absolute inset-0 rounded-[1.4rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.0), rgba(255,255,255,0.22))` }} />
                          {!isCompleted && !isActive && (
                            <motion.div
                              aria-hidden
                              initial={false}
                              animate={shouldReduceMotion ? { opacity: 0 } : { x: ['-120%', '120%'] }}
                              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
                              className={`pointer-events-none absolute inset-0 rounded-[1.4rem] bg-gradient-to-r ${stageTone.gradient} opacity-0 group-hover:opacity-25`}
                            />
                          )}
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-950 dark:text-white">{node.title}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{node.desc}</p>
                            </div>
                            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${isActive ? stageTone.chip : 'border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400'}`}>
                              {node.req} courses
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

</div>
        </div>

      </div>

      {/* RATING & REVIEW MODAL */}
      <AnimatePresence>
        {reviewingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-tl-none rounded-br-none rounded-tr-[3rem] rounded-bl-[3rem] p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Rate & Review Course</h3>
                  <p className="text-[11px] text-slate-400">{reviewingItem.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewingItem(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* 3D Star Rating Bar */}
                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 flex items-center justify-center gap-3 border border-slate-200/80 dark:border-slate-800">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(starVal)}
                      className="cursor-pointer transition-transform duration-200 hover:scale-125 focus:outline-none"
                    >
                      <Exact3DGoldStar size={38} isFilled={(hoverRating || rating) >= starVal} />
                    </button>
                  ))}
                </div>

                {/* Review Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Feedback</label>
                  <textarea
                    rows={3}
                    placeholder="Share what you liked or learned in this course..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setReviewingItem(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-indigo-700 transition-colors shadow-xs"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
