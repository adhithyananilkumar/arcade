'use client';

// High-UX Redesigned My Learning Dashboard Page
// Vibrant Mesh Gradient, Glassmorphism Controls, 3D Golden Stars & Smooth Stacking Contexts

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { UserService } from "@/domains/identity";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
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
  Zap
} from 'lucide-react';
import Link from 'next/link';
import TextType from '@/shared/design-system/ui/TextType/TextType';

interface LearningItem {
  id: string;
  title: string;
  type: 'Course' | 'Webinar' | 'Workshop' | 'Article';
  category: string;
  status: 'In Progress' | 'Completed' | 'Upcoming' | 'Live';
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

  // Learning Time Analytics State (Infosys Springboard Style)
  const [learningTimeTab, setLearningTimeTab] = useState<'time' | 'history'>('time');
  const [weekOffset, setWeekOffset] = useState(0);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [showLearningTimeInfo, setShowLearningTimeInfo] = useState(false);
  const [enableDateRangeFilter, setEnableDateRangeFilter] = useState(true);

  // Date Picker & Date Search State
  const [selectedStartDate, setSelectedStartDate] = useState('2026-07-22');
  const [selectedEndDate, setSelectedEndDate] = useState('2026-07-28');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [activeDatePreset, setActiveDatePreset] = useState<'7d' | '30d' | 'custom'>('7d');
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Dynamic Date Search calculation
  const getDynamicDateRangeData = (startStr: string, endStr: string, offset: number) => {
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

        // Deterministic realistic daily study mins
        const dayVal = d.getDate();
        const minsPattern = [90, 180, 120, 330, 60, 570, 240, 300, 420, 150, 480, 210, 0, 180, 240];
        const mins = minsPattern[(dayVal + Math.abs(offset)) % minsPattern.length];

        daysList.push({
          label: `${monthStr} ${dayNum}`,
          day: dayName,
          mins: mins
        });
      }
      return daysList;
    } catch {
      return [
        { label: 'Jul 22', day: 'Wed', mins: 90 },
        { label: 'Jul 23', day: 'Thu', mins: 180 },
        { label: 'Jul 24', day: 'Fri', mins: 120 },
        { label: 'Jul 25', day: 'Sat', mins: 330 },
        { label: 'Jul 26', day: 'Sun', mins: 60 },
        { label: 'Jul 27', day: 'Mon', mins: 570 },
        { label: 'Jul 28', day: 'Tue', mins: 240 },
      ];
    }
  };

  const learningTimeWeekData = getDynamicDateRangeData(selectedStartDate, selectedEndDate, weekOffset);
  const calculatedAverageHrs = (
    learningTimeWeekData.reduce((acc, curr) => acc + curr.mins, 0) / (learningTimeWeekData.length * 60)
  ).toFixed(1);

  const learningHistoryLogs = [
    { date: 'Jul 27, 2026', time: '14:30', title: 'Completed Intensive Fullstack Sprint', duration: '9.5 hrs', category: 'Course & Workshop' },
    { date: 'Jul 28, 2026', time: '09:15', title: 'Database Migration & API Security Module', duration: '4.0 hrs', category: 'Course' },
    { date: 'Jul 25, 2026', time: '16:00', title: 'Fullstack Workshop Lab Session', duration: '5.5 hrs', category: 'Workshop' },
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
          else if (upperType === 'WORKSHOP') mappedType = 'Workshop';
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
      'Data Science': { icon: Cpu, barColor: 'bg-emerald-500', iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400' },
      'React': { icon: Code, barColor: 'bg-[#2962D6]', iconBg: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/80 dark:text-cyan-400' },
      'UI/UX Design': { icon: Palette, barColor: 'bg-pink-500', iconBg: 'bg-pink-100 text-pink-600 dark:bg-pink-950/80 dark:text-pink-400' },
      'SQL & Databases': { icon: Database, barColor: 'bg-purple-600', iconBg: 'bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400' },
      'Data Structures': { icon: Layers, barColor: 'bg-amber-500', iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400' },
      'Software Engineering': { icon: Wrench, barColor: 'bg-indigo-600', iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400' },
    };

    const categoriesPresent = Object.keys(skillsMap).filter(k => k !== 'General');

    // If categories exist in user items, compute exact progress per category
    if (categoriesPresent.length > 0) {
      return categoriesPresent.map(cat => {
        const d = skillsMap[cat];
        const avg = Math.round(d.totalProgress / d.count);
        const style = skillStyles[cat] || { icon: Code, barColor: 'bg-[#2962D6]', iconBg: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/80 dark:text-cyan-400' };
        return {
          name: cat,
          progress: d.isCompleted ? 100 : avg,
          icon: style.icon,
          barColor: style.barColor,
          iconBg: style.iconBg
        };
      });
    }

    // Default dynamic skills when platform is initializing (Data Science is marked 100% completed)
    return [
      { name: 'Data Science', progress: 100, icon: Cpu, barColor: 'bg-emerald-500', iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400' },
      { name: 'React', progress: 72, icon: Code, barColor: 'bg-[#2962D6]', iconBg: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/80 dark:text-cyan-400' },
      { name: 'UI/UX Design', progress: 54, icon: Palette, barColor: 'bg-pink-500', iconBg: 'bg-pink-100 text-pink-600 dark:bg-pink-950/80 dark:text-pink-400' },
      { name: 'Data Structures', progress: 46, icon: Layers, barColor: 'bg-amber-500', iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400' },
      { name: 'SQL', progress: 60, icon: Database, barColor: 'bg-purple-600', iconBg: 'bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400' },
    ];
  })();

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



  if (isLoading || !currentUser) {
    return (
      <div
        className="flex h-[calc(100vh-80px)] items-center justify-center bg-slate-50 dark:bg-slate-950"
      >
        <Loader2 className="animate-spin text-indigo-600" size={36} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/40">

      {/* Fixed Viewport Landing-style Multi-Layer Gradient Background (Light & Dark Mode) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 dark:hidden -z-10"
        style={{
          background: `
            radial-gradient(ellipse 65% 45% at 8% 12%, rgba(59, 130, 246, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 92% 24%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 5% 52%, rgba(155, 93, 229, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 6% 76%, rgba(14, 165, 233, 0.11) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 94% 76%, rgba(14, 165, 233, 0.11) 0%, transparent 60%),
            radial-gradient(ellipse 45% 35% at 48% 94%, rgba(249, 200, 70, 0.08) 0%, transparent 60%),
            linear-gradient(to bottom, #E9EEFB 0%, #F3F6FD 30%, #F8FAFC 60%, #EEF7F2 100%)
          `
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
          `
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-32 space-y-6">

        {/* 1. HERO HEADER SECTION (CENTER ALIGNED) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="pb-1 text-center flex flex-col items-center justify-center"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              My <span className="bg-gradient-to-r from-[#4C6FFF] via-[#4C6FFF] to-[#0EA5E9] bg-clip-text text-transparent">Learning</span>
            </h1>
            <div className="mt-2 min-h-[20px] flex items-center justify-center">
              <TextType
                as="p"
                className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-md mx-auto"
                text={[
                  "Track active course progress",
                  "Resume your latest modules",
                  "View comprehensive learning stats",
                  "Keep up the great work!"
                ]}
                typingSpeed={40}
                deletingSpeed={20}
                pauseDuration={2000}
                showCursor={true}
                cursorCharacter="|"
                loop={true}
              />
            </div>
          </div>
        </motion.div>

        {/* 2. MAIN ASYMMETRIC GRID: LEFT 3/4 (SEARCH & COURSES) & RIGHT 1/4 (CONTINUE LEARNING, JOURNEY & SKILLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">

          {/* LEFT SIDE COLUMN (3/4 WIDTH - lg:col-span-8): SEARCH BAR & COURSE CONTENT LIBRARY */}
          <div className="lg:col-span-8 relative group/library">

            {/* Non-Common Card Background (Asymmetric Glassmorphism) */}
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl rounded-tl-none rounded-br-none rounded-tr-[3rem] rounded-bl-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] border border-white dark:border-slate-700/50 -z-20 transition-all duration-500" />

            {/* Decorative Inner Glows & Floating Accents */}
            <div className="absolute inset-0 overflow-hidden rounded-tl-none rounded-br-none rounded-tr-[3rem] rounded-bl-[3rem] -z-10 pointer-events-none">
              <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[80px] group-hover/library:scale-150 transition-transform duration-1000 ease-out" />
              <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-sky-400/20 dark:bg-sky-600/10 blur-[80px] group-hover/library:scale-150 transition-transform duration-1000 ease-out" />

              {/* Left edge neon tab marker */}
              <div className="absolute top-12 -left-px w-1.5 h-20 bg-gradient-to-b from-indigo-500 to-sky-400 rounded-r-md shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
            </div>

            {/* Padded Content Container */}
            <div className="p-6 sm:p-8 space-y-7 relative z-10">

              {/* SEARCH BAR & FILTERS (CONSTRAINED TO 3/4 LEFT COLUMN LENGTH) */}
              <div id="learning-items-section" className="scroll-mt-24 relative z-50 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                {/* Content Type Filter Dropdown */}
                {(() => {
                  const contentTypeOptions = [
                    { id: 'all', label: 'All Content', icon: Grid, count: learningItems.length },
                    { id: 'courses', label: 'Courses', icon: BookOpen, count: enrolledCount },
                    { id: 'webinars', label: 'Webinars', icon: Video, count: attendedCount },
                    { id: 'workshops', label: 'Workshops', icon: Wrench, count: learningItems.filter(i => i.type === 'Workshop').length },
                    { id: 'articles', label: 'Articles', icon: FileText, count: readCount },
                    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: completedCount },
                  ];
                  const selectedOption = contentTypeOptions.find(o => o.id === activeTab) || contentTypeOptions[0];
                  const SelectedIcon = selectedOption.icon;

                  return (
                    <div ref={tabDropdownRef} className="relative z-50 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsTabDropdownOpen(!isTabDropdownOpen)}
                        className="w-full sm:w-52 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between gap-2 shadow-xs hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <SelectedIcon size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span className="truncate">{selectedOption.label}</span>
                        </div>
                        <ChevronRight size={14} className={`shrink-0 transition-transform duration-200 ${isTabDropdownOpen ? '-rotate-90 text-indigo-600' : 'rotate-90 text-slate-400'}`} />
                      </button>

                      <AnimatePresence>
                        {isTabDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 6 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 top-full mt-2 w-56 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden"
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
                                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-colors ${isSelected
                                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <OptIcon size={15} className={isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
                                    <span>{opt.label}</span>
                                  </div>
                                  {isSelected && <span className="text-indigo-600 font-black">✓</span>}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })()}

                {/* Search Input */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search courses by title, instructor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
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
              </div>

              {/* Learning Cards Grid */}
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={`${activeTab}-${statusFilter}-${sortBy}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {paginatedItems.map((item, idx) => {
                    const isBookmarked = bookmarkedIds.includes(item.id);

                    return (
                      <motion.div
                        key={item.id}
                        layout="position"
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{
                          duration: 0.35,
                          ease: 'easeOut',
                          delay: Math.min(idx * 0.04, 0.2)
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-tl-none rounded-br-none rounded-tr-3xl rounded-bl-3xl bg-slate-200/80 dark:bg-slate-800 p-[1px] shadow-xs hover:shadow-lg transition-all duration-300"
                      >
                        {/* Animated Running Border Effect */}
                        <div className="absolute inset-[-100%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_70%,#6366f1_100%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_70%,#818cf8_100%)]" />

                        <div className="relative z-10 flex flex-col justify-between h-full w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-tl-none rounded-br-none rounded-tr-[calc(1.5rem-1px)] rounded-bl-[calc(1.5rem-1px)] p-4 overflow-hidden">
                          {/* Image Header with Category Hover Badge */}
                          <div className="relative h-36 w-full rounded-tl-none rounded-tr-2xl rounded-br-2xl rounded-bl-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                            <img
                              src={item.coverImage}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                            {/* Content Type Badge */}
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-900/80 backdrop-blur-md text-white border border-white/20">
                              {item.type === 'Course' && <BookOpen size={11} />}
                              {item.type === 'Webinar' && <Video size={11} />}
                              {item.type === 'Workshop' && <Wrench size={11} />}
                              {item.type === 'Article' && <FileText size={11} />}
                              <span>{item.type}</span>
                            </div>

                            {/* Category Badge */}
                            <div className="absolute bottom-2.5 left-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform group-hover:translate-y-0 translate-y-2 pointer-events-none z-20">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 backdrop-blur-md shadow-md border border-white/20 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>{item.category}</span>
                              </span>
                            </div>

                            {/* Bookmark Button */}
                            <button
                              type="button"
                              onClick={() => toggleBookmark(item.id, item.title)}
                              className={`absolute top-2.5 right-2.5 p-1.5 rounded-xl backdrop-blur-md transition-all ${isBookmarked
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                : 'bg-slate-900/60 text-slate-200 hover:text-white'
                                }`}
                            >
                              <Bookmark size={12} className={isBookmarked ? 'fill-current' : ''} />
                            </button>
                          </div>

                          {/* Content Section */}
                          <div className="mt-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mt-0.5 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                                By {item.instructor}
                              </p>
                            </div>

                            {/* Footer & Actions */}
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3">
                              {item.status === 'Completed' ? (
                                <div className="space-y-2">
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
                                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 group-hover/ratingBtn:underline">
                                        {userReviews[item.id] ? 'Edit Rating' : 'Leave Rating'}
                                      </span>
                                    </button>

                                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 flex items-center gap-1">
                                      <CheckCircle2 size={11} /> Completed
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1 max-w-[60%] space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                      <span>Progress</span>
                                      <span>{item.progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                      <div
                                        style={{ width: `${item.progress}%` }}
                                        className="h-full bg-slate-900 dark:bg-slate-200 rounded-full"
                                      />
                                    </div>
                                  </div>

                                  <Link
                                    href={`/learn/${item.id}`}
                                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs"
                                  >
                                    Continue
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              {sortedItems.length === 0 && (
                <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <Grid className="mx-auto text-slate-300 mb-2" size={32} />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No content items found matching your filters.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('all');
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                    className="mt-3 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Reset all filters
                  </button>
                </div>
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
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
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

              {/* LEARNING TIME ANALYTICS (INLINE IF CONTENT COUNT <= 3) */}
              {sortedItems.length <= 3 && (
                <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4">

                  {/* Header & Date Controls */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <BarChart3 size={18} className="text-[#2C83F5]" />
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
                            className="p-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            <ChevronLeft size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                            className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                          >
                            <Calendar size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span>{selectedStartDate} to {selectedEndDate}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setWeekOffset(w => w + 1)}
                            className="p-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
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
                                    setSelectedStartDate('2026-07-22');
                                    setSelectedEndDate('2026-07-28');
                                    setActiveDatePreset('7d');
                                    setWeekOffset(0);
                                  }}
                                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-center transition-colors ${activeDatePreset === '7d'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                    }`}
                                >
                                  Last 7 Days
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedStartDate('2026-06-29');
                                    setSelectedEndDate('2026-07-28');
                                    setActiveDatePreset('30d');
                                    setWeekOffset(0);
                                  }}
                                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-center transition-colors ${activeDatePreset === '30d'
                                    ? 'bg-indigo-600 text-white'
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
                                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                              </div>

                              {/* Permanent 5 days hint */}
                              <div className="pt-1 pb-0.5">
                                <p className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg py-1.5 border border-slate-100 dark:border-slate-800/80">
                                  <Info size={12} className="text-indigo-500 dark:text-indigo-400" />
                                  Please select at least 5 days
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        Average : <span className="font-extrabold text-[#2C83F5] dark:text-[#27C5D8]">{calculatedAverageHrs} Hours/Day</span>
                      </span>
                    </div>
                  </div>

                  {/* Bar Chart Container */}
                  <div className="pt-2">
                    <div className="relative h-48 w-full flex items-end">
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
                                  whileInView={{ height: `${Math.max(heightPercent, 2)}%` }}
                                  viewport={{ once: false, amount: 0.2 }}
                                  transition={{ duration: 0.4, ease: 'easeOut', delay: Math.min(i * 0.02, 0.5) }}
                                  className="w-full rounded-t-sm bg-gradient-to-t from-blue-800 to-sky-300 dark:from-blue-900 dark:to-sky-400 opacity-80 group-hover/bar:opacity-100 transition-opacity"
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
          </div>

          {/* RIGHT SIDEBAR COLUMN (1/4 WIDTH - lg:col-span-4): OTHER DASHBOARD WIDGETS & SKILLS AT END */}
          <div className="lg:col-span-4 space-y-6">

            {/* 1. Continue Learning Focus Panel */}
            {continueLearningItem && (
              <div className="relative overflow-hidden rounded-tr-none rounded-bl-none rounded-tl-[3rem] rounded-br-[3rem] bg-slate-200/80 dark:bg-slate-800 p-[2px] shadow-xs hover:shadow-md transition-all">
                {/* Always Animated Running Border Effect */}
                <div className="absolute inset-[-100%] opacity-100 animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_70%,#6366f1_100%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_70%,#818cf8_100%)]" />

                <div className="relative z-10 h-full w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-tr-none rounded-bl-none rounded-tl-[calc(3rem-2px)] rounded-br-[calc(3rem-2px)] p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Active Course Focus
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {continueLearningItem.category}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group/img h-24 w-full sm:w-36 shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                      <img
                        src={continueLearningItem.coverImage}
                        alt={continueLearningItem.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center group-hover/img:bg-slate-950/30 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg transform group-hover/img:scale-110 transition-transform">
                          <Play size={14} className="fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1 text-left">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 tracking-tight">
                        {continueLearningItem.title}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Instructor: <span className="font-semibold text-slate-800 dark:text-slate-200">{continueLearningItem.instructor}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>Course Progress</span>
                      <span className="text-sky-500 dark:text-sky-400 font-extrabold">{continueLearningItem.progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${continueLearningItem.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-800 to-sky-300 dark:from-blue-900 dark:to-sky-400"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <Link
                      href={`/learn/${continueLearningItem.id}/learn`}
                      className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-blue-800 to-sky-400 hover:from-blue-700 hover:to-sky-300 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Play size={13} className="fill-current" />
                      <span>Resume Learning</span>
                    </Link>
                    <Link
                      href={`/learn/${continueLearningItem.id}`}
                      className="px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            )}



            {/* 4. SKILLS PROGRESS (MOVED ABOVE LEARNING JOURNEY) */}
            <div className="rounded-tr-none rounded-bl-none rounded-tl-[3rem] rounded-br-[3rem] border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Target size={17} className="text-[#2C83F5]" />
                  <span>Skills Progress</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400">{dynamicSkillsProgress.length} Active Skills</span>
                  {dynamicSkillsProgress.length > 3 && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSkillsPage(p => Math.max(0, p - 1))}
                        disabled={skillsPage === 0}
                        className="p-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <ChevronLeft size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSkillsPage(p => Math.min(Math.ceil(dynamicSkillsProgress.length / 3) - 1, p + 1))}
                        disabled={skillsPage >= Math.ceil(dynamicSkillsProgress.length / 3) - 1}
                        className="p-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3.5">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={skillsPage}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3.5"
                  >
                    {dynamicSkillsProgress.slice(skillsPage * 3, skillsPage * 3 + 3).map((skill) => {
                  const SkillIcon = skill.icon;
                  return (
                    <div key={skill.name} className="flex items-center gap-3">
                      <div className={`w-8.5 h-8.5 rounded-2xl ${skill.iconBg} flex items-center justify-center shrink-0 font-bold shadow-xs`}>
                        <SkillIcon size={15} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-extrabold">
                          <span className="text-slate-900 dark:text-slate-100">{skill.name}</span>
                          <span className="text-slate-900 dark:text-slate-100">{skill.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.progress}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${skill.barColor}`}
                          />
                        </div>
                      </div>
                      </div>
                    );
                  })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* 5. Your Learning Journey (Ascending Growth Stepper & Level Describers) */}
            <div className="rounded-tr-none rounded-bl-none rounded-tl-[3rem] rounded-br-[3rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs relative overflow-hidden">

              {/* Subtle Landscape Background */}
              <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none opacity-40 dark:opacity-20 flex items-end">
                <svg viewBox="0 0 1000 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                  <path d="M0,80 Q100,60 250,90 T500,70 T750,90 T1000,60 L1000,100 L0,100 Z" fill="#E9D5FF" />
                  <path d="M0,100 Q150,70 300,95 T600,80 T850,95 T1000,75 L1000,100 L0,100 Z" fill="#F3E8FF" />
                  <g fill="#D8B4FE">
                    <path d="M750,90 L760,50 L770,90 Z M760,90 L760,100" stroke="#D8B4FE" strokeWidth="2" />
                    <path d="M820,80 L835,30 L850,80 Z M835,80 L835,100" stroke="#D8B4FE" strokeWidth="2" />
                    <path d="M880,85 L890,45 L900,85 Z M890,85 L890,100" stroke="#D8B4FE" strokeWidth="2" />
                  </g>
                </svg>
              </div>

              <div className="p-5 pb-0 relative z-10">
                <h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                  Your Learning Journey
                </h3>
              </div>

              {/* Fully Responsive Container */}
              <div className="w-full pb-4 relative z-10 mt-4">
                <div className="w-full h-[160px] relative mx-auto">

                  {/* SVG Wavy Line & Nodes generated dynamically */}
                  {(() => {
                    const currentLevel = completedCount >= 30 ? 5 : completedCount >= 20 ? 4 : completedCount >= 10 ? 3 : completedCount >= 3 ? 2 : 1;
                    const nodes = [
                      { level: 1, title: 'Beginner', subtitle: 'Start your<br/>learning', req: 0, left: '10%', top: '100px', stemH: 'h-4', mt: 'mt-5', activeStem: 'h-12', Icon: Sprout },
                      { level: 2, title: 'Explorer', subtitle: 'Complete<br/>3 courses', req: 3, left: '30%', top: '110px', stemH: 'h-6', mt: 'mt-8', activeStem: 'h-16', Icon: Target },
                      { level: 3, title: 'Adventurer', subtitle: 'Complete<br/>10 courses', req: 10, left: '50%', top: '90px', stemH: 'h-6', mt: 'mt-8', activeStem: 'h-16', Icon: Flag },
                      { level: 4, title: 'Scholar', subtitle: 'Complete<br/>20 courses', req: 20, left: '70%', top: '100px', stemH: 'h-6', mt: 'mt-8', activeStem: 'h-16', Icon: Award },
                      { level: 5, title: 'Master', subtitle: 'Complete<br/>30 courses', req: 30, left: '90%', top: '80px', stemH: 'h-8', mt: 'mt-10', activeStem: 'h-20', Icon: Crown }
                    ];

                    const getActiveLinePath = (lvl: number) => {
                      if (lvl === 1) return "M 0 100 C 30 100, 30 100, 60 100";
                      if (lvl === 2) return "M 0 100 C 30 100, 30 100, 60 100 C 120 100, 120 110, 180 110";
                      if (lvl === 3) return "M 0 100 C 30 100, 30 100, 60 100 C 120 100, 120 110, 180 110 C 240 110, 240 90, 300 90";
                      if (lvl === 4) return "M 0 100 C 30 100, 30 100, 60 100 C 120 100, 120 110, 180 110 C 240 110, 240 90, 300 90 C 360 90, 360 100, 420 100";
                      return "M 0 100 C 30 100, 30 100, 60 100 C 120 100, 120 110, 180 110 C 240 110, 240 90, 300 90 C 360 90, 360 100, 420 100 C 480 100, 480 80, 540 80 C 570 80, 600 80, 600 80";
                    };

                    return (
                      <>
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 160" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="activeLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#C4B5FD" />
                              <stop offset="100%" stopColor="#C4B5FD" />
                            </linearGradient>
                            <linearGradient id="inactiveLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#EDE9FE" />
                              <stop offset="100%" stopColor="#EDE9FE" />
                            </linearGradient>
                          </defs>

                          {/* Full Inactive Line (Background) */}
                          <path
                            d="M 0 100 C 30 100, 30 100, 60 100 C 120 100, 120 110, 180 110 C 240 110, 240 90, 300 90 C 360 90, 360 100, 420 100 C 480 100, 480 80, 540 80 C 570 80, 600 80, 600 80"
                            fill="none"
                            stroke="url(#inactiveLineGrad)"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />

                          {/* Dynamic Active Line */}
                          <path
                            d={getActiveLinePath(currentLevel)}
                            fill="none"
                            stroke="url(#activeLineGrad)"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                        </svg>

                        {/* Render All Journey Nodes */}
                        {nodes.map(node => {
                          const isCompleted = currentLevel > node.level;
                          const isActive = currentLevel === node.level;
                          const isLocked = currentLevel < node.level;
                          const Icon = node.Icon;

                          return (
                            <div key={node.level} className="group cursor-pointer absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: node.left, top: node.top }}>
                              {isCompleted && (
                                <>
                                  <div className={`w-0.5 ${node.stemH} bg-[#C4B5FD] absolute bottom-1`}></div>
                                  <div className={`w-2.5 h-2.5 rounded-full bg-[#C4B5FD] relative z-10 ${node.mt}`}></div>
                                  <div className="absolute bottom-3 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-50/80 border border-emerald-100 flex items-center justify-center transition-transform group-hover:scale-110">
                                    <Icon size={16} className="text-emerald-500 sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                                  </div>
                                </>
                              )}
                              
                              {isActive && (
                                <>
                                  <div className={`w-0.5 ${node.activeStem} bg-[#8B5CF6] absolute bottom-1`}></div>
                                  <div className={`w-3 h-3 rounded-full bg-[#8B5CF6] border-2 border-white relative z-10 ${node.mt} shadow-[0_0_10px_rgba(139,92,246,0.5)]`}></div>
                                  
                                  <div className="absolute bottom-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-50/80 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-500/50 flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] backdrop-blur-sm">
                                    {/* Pulsing ring effect */}
                                    <div className="absolute inset-0 rounded-full bg-indigo-400/20 animate-ping opacity-75"></div>
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-lg shadow-indigo-500/50 flex items-center justify-center relative z-20">
                                      <Icon size={14} className="text-white drop-shadow-sm sm:w-[16px] sm:h-[16px]" strokeWidth={2.5} />
                                    </div>
                                  </div>
                                </>
                              )}

                              {isLocked && (
                                <>
                                  <div className={`w-0.5 ${node.stemH} bg-[#EDE9FE] absolute bottom-1`}></div>
                                  <div className={`w-2.5 h-2.5 rounded-full bg-[#EDE9FE] relative z-10 ${node.mt}`}></div>
                                  <div className="absolute bottom-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center transition-transform group-hover:scale-110">
                                    <Lock size={14} className="text-slate-700 sm:w-[16px] sm:h-[16px]" fill="currentColor" />
                                  </div>
                                </>
                              )}

                              <div className={`absolute ${isActive ? (node.level === 1 ? 'top-8' : node.level === 5 ? 'top-10' : 'top-10 sm:top-12') : (node.level === 1 ? 'top-8' : node.level === 5 ? 'top-9 sm:top-10' : 'top-9')} text-center w-[70px] sm:w-[90px] pointer-events-none`}>
                                <p className={`text-[10px] sm:text-[11.5px] font-bold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>{node.title}</p>
                                <p className="text-[8.5px] sm:text-[9px] font-medium text-slate-500 dark:text-slate-400 leading-tight mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" dangerouslySetInnerHTML={{ __html: node.subtitle }}></p>
                              </div>
                            </div>
                          );
                        })}
                        </>
                      );
                    })()}

                </div>
              </div>
            </div>

          </div>
        </div>

        {/* LEARNING TIME ANALYTICS (TAKES THE WHOLE PAGE / FULL WIDTH IF CONTENT COUNT > 3) */}
        {sortedItems.length > 3 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="w-full mt-6"
          >
            <motion.div
              variants={{
                hidden: {
                  x: -800,
                  rotate: -12,
                  opacity: 0,
                  boxShadow: "0px 0px 0px rgba(0,0,0,0)"
                },
                visible: {
                  x: [-800, 4, 0],
                  rotate: [-12, 0.2, 0],
                  opacity: [0, 1, 1],
                  boxShadow: [
                    "0px 0px 0px rgba(0,0,0,0)",
                    "0px 20px 25px -5px rgba(0,0,0,0.1)",
                    "0px 10px 15px -3px rgba(0,0,0,0.05)"
                  ],
                  transition: {
                    duration: 1.1,
                    times: [0, 0.85, 1],
                    ease: ["easeOut", "easeInOut"]
                  }
                }
              }}
              className="relative overflow-hidden rounded-tl-none rounded-br-none rounded-tr-[3rem] rounded-bl-[3rem] border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 sm:p-6 space-y-4"
            >


              {/* Header & Date Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <BarChart3 size={18} className="text-[#2C83F5]" />
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
                        className="p-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                        className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                      >
                        <Calendar size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>{selectedStartDate} to {selectedEndDate}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeekOffset(w => w + 1)}
                        className="p-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>

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
                                setSelectedStartDate('2026-07-22');
                                setSelectedEndDate('2026-07-28');
                                setActiveDatePreset('7d');
                                setWeekOffset(0);
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-center transition-colors ${activeDatePreset === '7d'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                            >
                              Last 7 Days
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStartDate('2026-06-29');
                                setSelectedEndDate('2026-07-28');
                                setActiveDatePreset('30d');
                                setWeekOffset(0);
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-center transition-colors ${activeDatePreset === '30d'
                                ? 'bg-indigo-600 text-white'
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
                                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Average : <span className="font-extrabold text-[#2C83F5] dark:text-[#27C5D8]">{calculatedAverageHrs} Hours/Day</span>
                  </span>
                </div>
              </div>

              {/* Bar Chart Container */}
              <div className="pt-2">
                <div className="relative h-48 w-full flex items-end">
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
                              whileInView={{ height: `${Math.max(heightPercent, 5)}%` }}
                              viewport={{ once: false, amount: 0.2 }}
                              transition={{ duration: 0.4, ease: 'easeOut', delay: Math.min(i * 0.02, 0.5) }}
                              className="w-full max-w-[24px] mx-auto rounded-t-sm bg-gradient-to-t from-blue-800 to-sky-300 dark:from-blue-900 dark:to-sky-400 opacity-80 group-hover/bar:opacity-100 transition-opacity"
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
            </motion.div>
          </motion.div>
        )}
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
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
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
