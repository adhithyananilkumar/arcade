'use client';

import { useState, useMemo, useEffect } from 'react';
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
  Video,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/design-system/ui/select';

export interface ExtendedContent {
  id: string;
  title: string;
  thumbnail: string;
  instructor: string;
  category: string;
  contentType: 'Course' | 'Article' | 'Event';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  price: string;
  enrollments: number;
  completionRate: number;
  rating: number;
  reviewsCount: number;
  wishlistCount: number;
  lastUpdated: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' | 'SUBMITTED';
  addedByStaff?: {
    name: string;
    avatar?: string;
    role: string;
    dateAdded: string;
  };
}

export const mockContent: ExtendedContent[] = [
  {
    id: 'course-1',
    title: 'Full-Stack Web Development Bootcamp',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    instructor: 'Dr. Sarah Chen',
    category: 'Web Development',
    contentType: 'Course',
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
      role: 'Senior Software Architect',
      dateAdded: 'Aug 2, 2026',
    },
  },
  {
    id: 'course-2',
    title: 'Cloud Infrastructure & System Design',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80',
    instructor: 'Alex Rivera',
    category: 'Cloud Computing',
    contentType: 'Course',
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
      role: 'Lead Cloud Engineer',
      dateAdded: 'Jul 28, 2026',
    },
  },
  {
    id: 'course-3',
    title: 'Neural Networks from Scratch in Python',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    instructor: 'Prof. Michael Vance',
    category: 'Deep Learning',
    contentType: 'Course',
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
    contentType: 'Course',
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
    contentType: 'Course',
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
  {
    id: 'article-1',
    title: 'Scalable Microservices Architecture Patterns',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    instructor: 'Alex Rivera',
    category: 'Software Architecture',
    contentType: 'Article',
    difficulty: 'Intermediate',
    duration: '10m read',
    price: 'Free',
    enrollments: 45000,
    completionRate: 95.0,
    rating: 4.99,
    reviewsCount: 300,
    wishlistCount: 500,
    lastUpdated: '1 day ago',
    status: 'PUBLISHED',
  },
  {
    id: 'event-1',
    title: 'Live Event: Building High-Performance Web Apps',
    thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
    instructor: 'Dr. Sarah Chen',
    category: 'Web Development',
    contentType: 'Event',
    difficulty: 'Beginner',
    duration: '2h',
    price: 'Free',
    enrollments: 1200,
    completionRate: 100,
    rating: 4.95,
    reviewsCount: 150,
    wishlistCount: 200,
    lastUpdated: 'Just now',
    status: 'PUBLISHED',
  },
];

interface CourseManagementSectionProps {
  channelId?: string;
  onAddCourse?: () => void;
  reviewMap?: Record<string, string>;
}

import { useRouter } from 'next/navigation';

export function CourseManagementSection({ channelId, onAddCourse, reviewMap = {} }: CourseManagementSectionProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<ExtendedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
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

  useEffect(() => {
    if (!channelId) {
      setCourses(mockContent);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    import('@/infrastructure/http/api').then(({ api }) => {
      api.get<any[]>(`/api/v1/channels/${channelId}/content`)
        .then((data) => {
          const transformed = data.map(item => ({
            id: item.id,
            title: item.title,
            thumbnail: item.coverImageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
            instructor: item.authorName || 'Unknown',
            category: item.type,
            contentType: (item.type === 'COURSE' ? 'Course' : item.type === 'ARTICLE' ? 'Article' : 'Event') as 'Course' | 'Article' | 'Event',
            difficulty: 'Beginner' as const,
            duration: 'Unknown',
            price: 'Free',
            enrollments: 0,
            completionRate: 0,
            rating: 0,
            reviewsCount: 0,
            wishlistCount: 0,
            lastUpdated: new Date(item.updatedAt).toLocaleDateString(),
            status: item.status,
            addedByStaff: {
              name: item.authorName || 'Unknown',
              avatar: undefined,
              role: 'Author',
              dateAdded: new Date(item.createdAt).toLocaleDateString(),
            }
          }));
          setCourses(transformed);
        })
        .catch((err) => {
          console.error("Failed to load channel content", err);
          toast.error("Failed to load channel content");
        })
        .finally(() => setIsLoading(false));
    });
  }, [channelId]);

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
    const duplicated: ExtendedContent = {
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

  const handleAction = (id: string, action: 'SUBMIT' | 'PUBLISH' | 'UNPUBLISH') => {
    setCourses(
      courses.map((c) => {
        if (c.id !== id) return c;
        if (action === 'SUBMIT') return { ...c, status: 'SUBMITTED' };
        if (action === 'PUBLISH') return { ...c, status: 'PUBLISHED' };
        if (action === 'UNPUBLISH') return { ...c, status: 'DRAFT' };
        return c;
      })
    );
    toast.success('Course status updated!');
    setActiveMenuId(null);
  };

  const handleCardClick = (course: ExtendedContent) => {
    if (course.status === 'SUBMITTED') {
      const reviewId = reviewMap[course.id];
      if (reviewId) {
        router.push(`/console/reviews/${reviewId}`);
      } else {
        toast.error('Review record not found');
      }
    } else {
      router.push(`/studio/course/${course.id}`);
    }
  };

  const handleTogglePublish = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
    toast.success('Course archived/deleted');
    setActiveMenuId(null);
  };

  const handleDelete = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
    toast.success('Course archived/deleted');
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Control Bar: Search, Filters, Sort, Layout Toggle */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search content by title, category, or instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Middle & Right Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Type Filter */}
          <Select value={selectedType} onValueChange={(val) => setSelectedType(val || 'ALL')}>
            <SelectTrigger className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 h-[34px] py-1.5 text-xs font-bold text-slate-700 hover:bg-indigo-50/80 hover:border-indigo-200 hover:text-indigo-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 shadow-[0_2px_10px_rgba(20,20,43,0.02)] hover:shadow-[0_4px_15px_rgba(79,70,229,0.08)] transition-all duration-300 cursor-pointer">
              <SelectValue placeholder="All Types">
                {selectedType === 'ALL' ? 'All Types' : selectedType === 'Course' ? 'Courses' : selectedType === 'Article' ? 'Articles' : 'Events'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-3xl p-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-200/60 bg-white/95 backdrop-blur-xl">
              <SelectItem value="ALL" className="rounded-xl cursor-pointer py-2 px-3 mb-1 last:mb-0 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 transition-colors duration-150">All Types</SelectItem>
              <SelectItem value="Course" className="rounded-xl cursor-pointer py-2 px-3 mb-1 last:mb-0 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 transition-colors duration-150">Courses</SelectItem>
              <SelectItem value="Article" className="rounded-xl cursor-pointer py-2 px-3 mb-1 last:mb-0 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 transition-colors duration-150">Articles</SelectItem>
              <SelectItem value="Event" className="rounded-xl cursor-pointer py-2 px-3 mb-1 last:mb-0 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 transition-colors duration-150">Events</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val || 'ALL')}>
            <SelectTrigger className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 h-[34px] py-1.5 text-xs font-bold text-slate-700 hover:bg-indigo-50/80 hover:border-indigo-200 hover:text-indigo-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 shadow-[0_2px_10px_rgba(20,20,43,0.02)] hover:shadow-[0_4px_15px_rgba(79,70,229,0.08)] transition-all duration-300 cursor-pointer">
              <SelectValue placeholder="All Categories">
                {selectedCategory === 'ALL' ? 'All Categories' : selectedCategory}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-3xl p-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-200/60 bg-white/95 backdrop-blur-xl">
              <SelectItem value="ALL" className="group rounded-xl cursor-pointer py-2 px-3 mb-1 last:mb-0 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 transition-colors duration-150">All Categories</SelectItem>
              {categories.filter((c) => c !== 'ALL').map((cat) => (
                <SelectItem key={cat} value={cat} className="group rounded-xl cursor-pointer py-2 px-3 mb-1 last:mb-0 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 transition-colors duration-150">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val || 'ALL')}>
            <SelectTrigger className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 h-[34px] py-1.5 text-xs font-bold text-slate-700 hover:bg-indigo-50/80 hover:border-indigo-200 hover:text-indigo-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 shadow-[0_2px_10px_rgba(20,20,43,0.02)] hover:shadow-[0_4px_15px_rgba(79,70,229,0.08)] transition-all duration-300 cursor-pointer">
              <SelectValue placeholder="All Statuses">
                {selectedStatus === 'ALL' ? 'All Statuses' : selectedStatus === 'PUBLISHED' ? 'Published' : selectedStatus === 'DRAFT' ? 'Draft' : selectedStatus === 'SUBMITTED' ? 'In Review' : 'Archived'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-3xl p-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-200/60 bg-white/95 backdrop-blur-xl">
              <SelectItem value="ALL" className="group rounded-xl cursor-pointer py-2 px-3 mb-1 last:mb-0 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 transition-colors duration-150">All Statuses</SelectItem>
              <SelectItem value="PUBLISHED" className="group rounded-xl cursor-pointer py-2 px-3 mb-1 last:mb-0 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 transition-colors duration-150">Published</SelectItem>
              <SelectItem value="DRAFT" className="group rounded-xl cursor-pointer py-2 px-3 mb-1 last:mb-0 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 transition-colors duration-150">Draft</SelectItem>
              <SelectItem value="SUBMITTED" className="group rounded-xl cursor-pointer py-2 px-3 mb-1 last:mb-0 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 transition-colors duration-150">In Review</SelectItem>
              <SelectItem value="ARCHIVED" className="group rounded-xl cursor-pointer py-2 px-3 mb-1 last:mb-0 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 transition-colors duration-150">Archived</SelectItem>
            </SelectContent>
          </Select>

          {/* Sorting */}
          <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
            <SelectTrigger className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 h-[34px] py-1.5 text-xs font-bold text-slate-700 hover:bg-indigo-50/80 hover:border-indigo-200 hover:text-indigo-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 shadow-[0_2px_10px_rgba(20,20,43,0.02)] hover:shadow-[0_4px_15px_rgba(79,70,229,0.08)] transition-all duration-300 cursor-pointer">
              <SelectValue placeholder="Sort By">
                {sortBy === 'POPULAR' ? 'Most Enrolled' : sortBy === 'RATING' ? 'Highest Rated' : 'Completion Rate'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-3xl p-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-200/60 bg-white/95 backdrop-blur-xl">
              <SelectItem value="POPULAR" className="group rounded-xl cursor-pointer py-2 px-3 mb-1 last:mb-0 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 transition-colors duration-150">Most Enrolled</SelectItem>
              <SelectItem value="RATING" className="group rounded-xl cursor-pointer py-2 px-3 mb-1 last:mb-0 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 transition-colors duration-150">Highest Rated</SelectItem>
              <SelectItem value="COMPLETION" className="group rounded-xl cursor-pointer py-2 px-3 mb-1 last:mb-0 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 transition-colors duration-150">Completion Rate</SelectItem>
            </SelectContent>
          </Select>

          {/* Grid/List Toggle */}
          <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50/80 p-1">
            <button
              type="button"
              onClick={() => setViewMode('GRID')}
              className={`rounded-xl p-1.5 transition-all ${viewMode === 'GRID' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                }`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('LIST')}
              className={`rounded-xl p-1.5 transition-all ${viewMode === 'LIST' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                }`}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Display Grid / List */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <BookOpen size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-extrabold text-slate-800">No content matches your filter criteria</h3>
          <p className="mt-1 text-xs text-slate-500">Try adjusting your search keywords or active filters.</p>
        </div>
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-14">
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => handleCardClick(course)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl rounded-tr-[3rem] rounded-bl-[3rem] border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(20,20,43,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Small Traveling Multicolor Border Beam Line Segment */}
              <div
                className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 overflow-hidden"
                style={{
                  padding: '2px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-[150%] origin-center"
                  style={{
                    background:
                      'conic-gradient(from 0deg, transparent 0%, transparent 80%, #6366f1 86%, #a855f7 91%, #ec4899 96%, #06b6d4 100%)',
                  }}
                />
              </div>

              {/* Thumbnail Header */}
              <div className="relative h-28 w-full overflow-hidden bg-slate-100">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Status Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold shadow-sm ${course.status === 'PUBLISHED'
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === course.id ? null : course.id);
                    }}
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
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
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
                      {course.addedByStaff.avatar ? (
                        <img
                          src={course.addedByStaff.avatar}
                          alt={course.addedByStaff.name}
                          className="h-5 w-5 rounded-full object-cover border border-white shadow-2xs"
                        />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-slate-200 border border-white shadow-2xs flex shrink-0 items-center justify-center font-bold text-[9px] text-slate-500">
                          {course.addedByStaff.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 truncate">
                        <span className="text-slate-400">Added by </span>
                        <span className="font-extrabold text-slate-900">{course.addedByStaff.name}</span>
                        <span className="text-indigo-600"> ({course.addedByStaff.role})</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-1.5 border-t border-b border-slate-100 py-2 text-center text-xs font-semibold">
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
                    {course.status === 'DRAFT' && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleAction(course.id, 'SUBMIT'); }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <CheckCircle2 size={14} className="text-sky-600" />
                        <span>Submit for Review</span>
                      </button>
                    )}
                    {course.status === 'SUBMITTED' && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleAction(course.id, 'PUBLISH'); }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span>Approve & Publish</span>
                      </button>
                    )}
                    {course.status === 'PUBLISHED' && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleAction(course.id, 'UNPUBLISH'); }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <CheckCircle2 size={14} className="text-slate-400" />
                        <span>Unpublish</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDuplicate(course.id); }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Copy size={14} className="text-indigo-600" />
                      <span>Duplicate</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDelete(course.id); }}
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
              <div 
                key={course.id} 
                onClick={() => handleCardClick(course)}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/80 transition-colors cursor-pointer"
              >
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
                    {course.status === 'DRAFT' && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleAction(course.id, 'SUBMIT'); }}
                        className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100"
                      >
                        Request Review
                      </button>
                    )}
                    {course.status === 'SUBMITTED' && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleAction(course.id, 'PUBLISH'); }}
                        className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                      >
                        Approve
                      </button>
                    )}
                    {course.status === 'PUBLISHED' && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleAction(course.id, 'UNPUBLISH'); }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        Unpublish
                      </button>
                    )}
                    {course.status === 'ARCHIVED' && (
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500"
                        disabled
                      >
                        Archived
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); router.push(`/studio/course/${course.id}`); }}
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
