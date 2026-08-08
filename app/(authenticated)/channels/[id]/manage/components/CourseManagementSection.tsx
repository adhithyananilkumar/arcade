'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Star,
  Users,
  Clock,
  BookOpen,
  MoreVertical,
  Edit3,
  BarChart3,
  Copy,
  Archive,
  Trash2,
  TrendingUp,
  Award,
  Flame,
  AlertCircle,
  Eye,
  DollarSign,
  Heart,
  CheckCircle2,
  Calendar,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export interface ExtendedCourse {
  id: string;
  title: string;
  thumbnail: string;
  instructor: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  price: string;
  enrollments: number;
  completionRate: number;
  rating: number;
  reviewsCount: number;
  wishlistCount: number;
  lastUpdated: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  addedByStaff?: {
    name: string;
    avatar: string;
    role: string;
    dateAdded: string;
  };
}

const mockCourses: ExtendedCourse[] = [
  {
    id: 'course-1',
    title: 'AI Agent Architecture & Tool Use Masterclass',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    instructor: 'Dr. Sarah Chen',
    category: 'AI Engineering',
    difficulty: 'Advanced',
    duration: '18h 45m',
    price: '$129.99',
    enrollments: 8420,
    completionRate: 98.4,
    rating: 4.98,
    reviewsCount: 640,
    wishlistCount: 1240,
    lastUpdated: '2 hours ago',
    status: 'PUBLISHED',
    addedByStaff: {
      name: 'Dr. Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      role: 'Lead AI Scientist',
      dateAdded: 'Aug 2, 2026',
    },
  },
  {
    id: 'course-2',
    title: 'Prompt Engineering & Context Window Optimization',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80',
    instructor: 'Alex Rivera',
    category: 'GenAI & LLMs',
    difficulty: 'Beginner',
    duration: '12h 10m',
    price: '$89.99',
    enrollments: 12400,
    completionRate: 91.2,
    rating: 4.92,
    reviewsCount: 1120,
    wishlistCount: 2300,
    lastUpdated: '1 day ago',
    status: 'PUBLISHED',
    addedByStaff: {
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      role: 'Senior Prompt Engineer',
      dateAdded: 'Jul 28, 2026',
    },
  },
  {
    id: 'course-3',
    title: 'Neural Networks from Scratch in Python',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    instructor: 'Prof. Michael Vance',
    category: 'Deep Learning',
    difficulty: 'Intermediate',
    duration: '24h 30m',
    price: '$149.99',
    enrollments: 6850,
    completionRate: 88.5,
    rating: 4.96,
    reviewsCount: 510,
    wishlistCount: 980,
    lastUpdated: '3 days ago',
    status: 'PUBLISHED',
    addedByStaff: {
      name: 'Prof. Michael Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      role: 'Head of Curriculum',
      dateAdded: 'Jun 15, 2026',
    },
  },
  {
    id: 'course-4',
    title: 'Fine-Tuning Llama 3 & Open Source Models',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
    instructor: 'Elena Rostova',
    category: 'AI Engineering',
    difficulty: 'Advanced',
    duration: '16h 00m',
    price: '$199.99',
    enrollments: 3400,
    completionRate: 82.0,
    rating: 4.88,
    reviewsCount: 290,
    wishlistCount: 1450,
    lastUpdated: '5 days ago',
    status: 'DRAFT',
    addedByStaff: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
      role: 'MLOps Lead Instructor',
      dateAdded: 'Aug 1, 2026',
    },
  },
  {
    id: 'course-5',
    title: 'Legacy Systems Maintenance & Refactoring',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    instructor: 'David Kim',
    category: 'Software Architecture',
    difficulty: 'Intermediate',
    duration: '8h 20m',
    price: '$49.99',
    enrollments: 1200,
    completionRate: 34.0,
    rating: 4.15,
    reviewsCount: 85,
    wishlistCount: 210,
    lastUpdated: '2 weeks ago',
    status: 'ARCHIVED',
    addedByStaff: {
      name: 'Dr. Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      role: 'Lead AI Scientist',
      dateAdded: 'May 10, 2026',
    },
  },
];

interface CourseManagementSectionProps {
  onAddCourse?: () => void;
}

export function CourseManagementSection({ onAddCourse }: CourseManagementSectionProps) {
  const [courses, setCourses] = useState<ExtendedCourse[]>(mockCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedInstructor, setSelectedInstructor] = useState('ALL');
  const [sortBy, setSortBy] = useState<'POPULAR' | 'RATING' | 'UPDATED' | 'COMPLETION'>('POPULAR');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // YouTube Studio style performance filter state
  const [topPerformanceFilter, setTopPerformanceFilter] = useState<
    'TOP_COMPLETION' | 'MOST_ENROLLED' | 'HIGHEST_RATED' | 'NEEDS_ATTENTION' | 'RECENTLY_UPDATED'
  >('TOP_COMPLETION');

  const categories = useMemo(
    () => ['ALL', ...Array.from(new Set(courses.map((c) => c.category)))],
    [courses],
  );

  const instructors = useMemo(
    () => ['ALL', ...Array.from(new Set(courses.map((c) => c.instructor)))],
    [courses],
  );

  const filteredCourses = useMemo(() => {
    return courses
      .filter((c) => {
        const matchesSearch =
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = selectedCategory === 'ALL' || c.category === selectedCategory;
        const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
        const matchesInst = selectedInstructor === 'ALL' || c.instructor === selectedInstructor;
        return matchesSearch && matchesCat && matchesStatus && matchesInst;
      })
      .sort((a, b) => {
        if (sortBy === 'POPULAR') return b.enrollments - a.enrollments;
        if (sortBy === 'RATING') return b.rating - a.rating;
        if (sortBy === 'COMPLETION') return b.completionRate - a.completionRate;
        return 0;
      });
  }, [courses, searchQuery, selectedCategory, selectedStatus, selectedInstructor, sortBy]);

  const rankedTopCourses = useMemo(() => {
    const sorted = [...courses];
    if (topPerformanceFilter === 'TOP_COMPLETION') {
      return sorted.sort((a, b) => b.completionRate - a.completionRate);
    }
    if (topPerformanceFilter === 'MOST_ENROLLED') {
      return sorted.sort((a, b) => b.enrollments - a.enrollments);
    }
    if (topPerformanceFilter === 'HIGHEST_RATED') {
      return sorted.sort((a, b) => b.rating - a.rating);
    }
    if (topPerformanceFilter === 'NEEDS_ATTENTION') {
      return sorted.sort((a, b) => a.completionRate - b.completionRate);
    }
    return sorted; // RECENTLY_UPDATED
  }, [courses, topPerformanceFilter]);

  const handleDuplicate = (id: string) => {
    const target = courses.find((c) => c.id === id);
    if (!target) return;
    const duplicated: ExtendedCourse = {
      ...target,
      id: `course-${Date.now()}`,
      title: `${target.title} (Copy)`,
      status: 'DRAFT',
      lastUpdated: 'Just now',
    };
    setCourses([duplicated, ...courses]);
    toast.success(`Duplicated "${target.title}" successfully!`);
    setActiveMenuId(null);
  };

  const handleTogglePublish = (id: string) => {
    setCourses(
      courses.map((c) =>
        c.id === id
          ? { ...c, status: c.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' }
          : c,
      ),
    );
    toast.success('Course status updated!');
    setActiveMenuId(null);
  };

  const handleDelete = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
    toast.success('Course archived/deleted');
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* YouTube Studio Style: Top Performing Courses Widget */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 shadow-2xs">
              <TrendingUp size={18} />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-[#14142b]">
                Top Performing Courses
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                YouTube Studio style ranking and performance analytics
              </p>
            </div>
          </div>

          {/* Performance Filter Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Order by:</span>
            <select
              value={topPerformanceFilter}
              onChange={(e) => setTopPerformanceFilter(e.target.value as any)}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-xs font-extrabold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="TOP_COMPLETION">Top Completion Rate</option>
              <option value="MOST_ENROLLED">Most Enrolled Students</option>
              <option value="HIGHEST_RATED">Highest Learner Rating</option>
              <option value="NEEDS_ATTENTION">Needs Attention (Lowest)</option>
              <option value="RECENTLY_UPDATED">Recently Updated</option>
            </select>
          </div>
        </div>

        {/* Youtube Studio Style Ranked List */}
        <div className="space-y-2.5">
          {rankedTopCourses.slice(0, 5).map((course, idx) => {
            const isTop = idx === 0;
            const rankBadgeColor =
              idx === 0
                ? 'bg-amber-400 text-slate-900 shadow-xs'
                : idx === 1
                ? 'bg-slate-200 text-slate-800'
                : idx === 2
                ? 'bg-amber-700/20 text-amber-800'
                : 'bg-slate-100 text-slate-500';

            return (
              <div
                key={course.id}
                className={`flex flex-col gap-3 rounded-2xl p-3.5 sm:flex-row sm:items-center sm:justify-between transition-colors ${
                  isTop ? 'bg-indigo-50/50 border border-indigo-100' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Rank Badge */}
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-black ${rankBadgeColor}`}
                  >
                    #{idx + 1}
                  </span>

                  {/* Thumbnail */}
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-12 w-20 shrink-0 rounded-xl object-cover border border-slate-200"
                  />

                  {/* Title & Metadata */}
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#14142b] truncate">
                      {course.title}
                    </h3>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
                      <span className="text-indigo-600 font-bold">{course.category}</span>
                      <span>·</span>
                      {course.addedByStaff && (
                        <span className="inline-flex items-center gap-1 text-slate-700 font-bold">
                          <img
                            src={course.addedByStaff.avatar}
                            alt=""
                            className="h-3.5 w-3.5 rounded-full object-cover"
                          />
                          Added by {course.addedByStaff.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Performance Metric Pill & Quick Analytics Button */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${
                        topPerformanceFilter === 'NEEDS_ATTENTION'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {topPerformanceFilter === 'MOST_ENROLLED'
                        ? `${course.enrollments.toLocaleString()} students`
                        : topPerformanceFilter === 'HIGHEST_RATED'
                        ? `${course.rating} ★ (${course.reviewsCount})`
                        : `${course.completionRate}% completion`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toast.info(`Opening analytics for "${course.title}"`)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                  >
                    <BarChart3 size={13} />
                    <span>Analytics</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Bar: Search, Filters, Sort, Layout Toggle & Add Button */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses by title, category, or instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Middle & Right Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.filter((c) => c !== 'ALL').map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="POPULAR">Most Enrolled</option>
            <option value="RATING">Highest Rated</option>
            <option value="COMPLETION">Completion Rate</option>
          </select>

          {/* Grid/List Toggle */}
          <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50/80 p-1">
            <button
              type="button"
              onClick={() => setViewMode('GRID')}
              className={`rounded-xl p-1.5 transition-all ${
                viewMode === 'GRID' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('LIST')}
              className={`rounded-xl p-1.5 transition-all ${
                viewMode === 'LIST' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <List size={15} />
            </button>
          </div>

          {/* Add Course Button */}
          <button
            type="button"
            onClick={onAddCourse || (() => toast.info('Navigating to Studio Course Creator...'))}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            <Plus size={15} />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Courses Display Grid / List */}
      {filteredCourses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <BookOpen size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-extrabold text-slate-800">No courses match your filter criteria</h3>
          <p className="mt-1 text-xs text-slate-500">Try adjusting your search keywords or active filters.</p>
        </div>
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(20,20,43,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
            >
              {/* Thumbnail Header */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Status Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold shadow-sm ${
                      course.status === 'PUBLISHED'
                        ? 'bg-emerald-500 text-white'
                        : course.status === 'DRAFT'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    {course.status}
                  </span>
                  <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white">
                    {course.difficulty}
                  </span>
                </div>

                {/* Category Pill & Quick Menu */}
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveMenuId(activeMenuId === course.id ? null : course.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-colors"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>

                {/* Wishlist Floating Tag */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[11px] font-bold text-white bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full">
                  <Heart size={12} className="fill-rose-500 text-rose-500" />
                  <span>{course.wishlistCount}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-indigo-600 mb-1">
                    <span>{course.category}</span>
                    <span className="text-slate-400 font-semibold">{course.duration}</span>
                  </div>

                  <h3 className="text-sm font-extrabold text-[#14142b] line-clamp-2 leading-snug">
                    {course.title}
                  </h3>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Instructor: <span className="text-slate-800 font-bold">{course.instructor}</span>
                  </p>

                  {/* Added By Staff Badge */}
                  {course.addedByStaff && (
                    <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-slate-50 p-2 text-[11px] font-semibold text-slate-600 border border-slate-100">
                      <img
                        src={course.addedByStaff.avatar}
                        alt={course.addedByStaff.name}
                        className="h-5 w-5 rounded-full object-cover border border-white shadow-2xs"
                      />
                      <div className="min-w-0 truncate">
                        <span className="text-slate-400">Added by </span>
                        <span className="font-extrabold text-slate-900">{course.addedByStaff.name}</span>
                        <span className="text-indigo-600"> ({course.addedByStaff.role})</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-100 py-3 text-center text-xs font-semibold">
                  <div>
                    <p className="text-[10px] uppercase text-slate-400">Students</p>
                    <p className="font-extrabold text-slate-800">{course.enrollments.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400">Rating</p>
                    <p className="font-extrabold text-amber-500 flex items-center justify-center gap-0.5">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      {course.rating}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400">Completion</p>
                    <p className="font-extrabold text-emerald-600">{course.completionRate}%</p>
                  </div>
                </div>

                {/* Price & Actions Row */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-base font-black text-[#14142b]">{course.price}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toast.info(`Viewing analytics for ${course.title}`)}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                      title="View Analytics"
                    >
                      <BarChart3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.info(`Editing course ${course.title}`)}
                      className="rounded-xl bg-[#14142b] px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-900 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions Dropdown Menu */}
              <AnimatePresence>
                {activeMenuId === course.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-12 right-4 z-30 w-44 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl backdrop-blur-xl"
                  >
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(course.id)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>{course.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(course.id)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Copy size={14} className="text-indigo-600" />
                      <span>Duplicate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(course.id)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 size={14} />
                      <span>Archive / Delete</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      ) : (
        /* List Mode View */
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
          <div className="divide-y divide-slate-100">
            {filteredCourses.map((course) => (
              <div key={course.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-16 w-24 shrink-0 rounded-2xl object-cover border border-slate-200"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-extrabold text-indigo-600">{course.category}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-semibold text-slate-500">{course.instructor}</span>
                      {course.addedByStaff && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="font-bold text-slate-700">Added by {course.addedByStaff.name}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-sm font-extrabold text-[#14142b] truncate">{course.title}</h3>
                    <div className="mt-1 flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                      <span>{course.enrollments.toLocaleString()} enrolled</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5 text-amber-500">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        {course.rating}
                      </span>
                      <span>·</span>
                      <span className="text-emerald-600">{course.completionRate}% completion</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <span className="text-sm font-black text-[#14142b]">{course.price}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(course.id)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      {course.status}
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.info(`Editing course ${course.title}`)}
                      className="rounded-xl bg-[#14142b] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-900"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
