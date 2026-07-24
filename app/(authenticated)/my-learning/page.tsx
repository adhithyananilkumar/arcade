'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { UserService } from "@/domains/identity";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Loader2,
  BookOpen,
  Clock,
  ArrowRight,
  Play,
  CheckCircle2,
  Flame,
  Search,
  Sparkles,
  Award,
  Filter,
  Bookmark,
  Calendar,
  Layers,
  Map,
  TrendingUp,
  RotateCcw,
  Star
} from 'lucide-react';
import Link from 'next/link';

export default function MyLearningPage() {
  const { user, updateUser } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<'all' | 'in-progress' | 'completed' | 'roadmaps'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await UserService.getMe();
        updateUser(data);
        setProfileData(data);
      } catch (err) {
        console.error('Failed to load profile details from DB:', err);
        toast.error('Could not load profile information.');
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const currentUser = profileData || user;

  const toggleBookmark = (id: string, title: string) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(prev => prev.filter(i => i !== id));
      toast.success(`Removed "${title}" from saved items`);
    } else {
      setBookmarkedIds(prev => [...prev, id]);
      toast.success(`Saved "${title}" to your library`);
    }
  };

  if (isLoading || !currentUser) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  // Fallback demo courses if user has no enrollments yet
  const enrolledList = (currentUser.enrolledCourses && currentUser.enrolledCourses.length > 0)
    ? currentUser.enrolledCourses
    : [
        {
          courseId: 'demo-1',
          title: 'Full-Stack Next.js 15 & Spring Boot Enterprise Architecture',
          type: 'Course',
          date: 'Jul 20, 2026',
          status: 'In Progress',
          progress: 68,
          completedModules: 14,
          totalModules: 20,
          instructor: 'Arcade Engineering Team',
          lastAccessed: '2 hours ago',
        },
        {
          courseId: 'demo-2',
          title: 'Cloud-Native Microservices with Docker & Kubernetes',
          type: 'Workshop',
          date: 'Jul 15, 2026',
          status: 'In Progress',
          progress: 35,
          completedModules: 7,
          totalModules: 18,
          instructor: 'Amal Jyothi Cloud Lab',
          lastAccessed: 'Yesterday',
        },
        {
          courseId: 'demo-3',
          title: 'Modern UI/UX Design System & Tailwind Masterclass',
          type: 'Course',
          date: 'Jun 10, 2026',
          status: 'Completed',
          progress: 100,
          completedModules: 15,
          totalModules: 15,
          instructor: 'Design Guild',
          lastAccessed: 'Jul 02, 2026',
        },
      ];

  // Saved Roadmaps mockup
  const mockRoadmaps = [
    {
      id: 'rm-1',
      title: 'Full-Stack Web Developer Career Path',
      stepsCount: 12,
      completedSteps: 8,
      estimatedHours: '45 hours',
      category: 'Software Engineering',
    },
    {
      id: 'rm-2',
      title: 'DevOps & Infrastructure Automation Specialist',
      stepsCount: 10,
      completedSteps: 3,
      estimatedHours: '32 hours',
      category: 'Cloud Architecture',
    },
  ];

  // Filtering logic
  const filteredCourses = enrolledList.filter((item: any) => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || item.type?.toLowerCase() === selectedType.toLowerCase();
    
    let matchesTab = true;
    if (activeTab === 'in-progress') {
      matchesTab = (item.progress || 0) < 100 && item.status !== 'Completed';
    } else if (activeTab === 'completed') {
      matchesTab = (item.progress || 0) === 100 || item.status === 'Completed';
    }

    return matchesSearch && matchesType && matchesTab;
  });

  const lastActiveCourse = enrolledList.find((c: any) => (c.progress || 0) < 100) || enrolledList[0];

  return (
    <div className="w-full px-4 py-12 md:px-6 lg:px-8 font-sans max-w-7xl mx-auto pt-24 pb-32 space-y-10">
      
      {/* Header & Goal Progress Banner */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
              <BookOpen size={14} />
              <span>Learner Workspace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Learning
            </h1>
            <p className="text-slate-500 dark:text-zinc-400 text-sm sm:text-base mt-1">
              Welcome back, <span className="font-semibold text-slate-800 dark:text-zinc-200">{currentUser.fullName || currentUser.username || 'Learner'}</span>! Pick up right where you left off.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500">
                <Flame size={20} />
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">Streak</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">7 Days 🔥</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">This Week</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">4.8 / 6 hrs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Banner: Resume Active Course */}
        {lastActiveCourse && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white p-6 sm:p-8 border border-indigo-700/30 shadow-xl">
            <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10">
                  <RotateCcw size={13} className="text-amber-400" />
                  <span>Resume Current Course</span>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold leading-tight">
                  {lastActiveCourse.title}
                </h2>
                
                <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
                  Instructor: <span className="text-white font-medium">{lastActiveCourse.instructor || 'Arcade Guild'}</span> • Last active {lastActiveCourse.lastAccessed || 'recently'}
                </p>

                {/* Progress bar inside banner */}
                <div className="space-y-1.5 max-w-md pt-2">
                  <div className="flex items-center justify-between text-xs text-indigo-200">
                    <span>Course Progress</span>
                    <span className="font-bold text-white">{lastActiveCourse.progress || 50}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
                      style={{ width: `${lastActiveCourse.progress || 50}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {lastActiveCourse.courseId && (
                <Link
                  href={`/learn/${lastActiveCourse.courseId}/learn`}
                  className="px-6 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2.5 shrink-0 hover:scale-105 active:scale-95"
                >
                  <Play size={18} className="fill-white" />
                  <span>Continue Lesson</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Controls: Tabs, Filters, Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Courses ({enrolledList.length})
          </button>
          <button
            onClick={() => setActiveTab('in-progress')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'in-progress'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'completed'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('roadmaps')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'roadmaps'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Roadmaps ({mockRoadmaps.length})
          </button>
        </div>

        {/* Search & Type Filter */}
        <div className="flex items-center gap-3">
          {/* Type Filter Pill */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-700 dark:text-zinc-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Content</option>
            <option value="course">Courses Only</option>
            <option value="workshop">Workshops Only</option>
          </select>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search my learning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <AnimatePresence mode="wait">
        {activeTab === 'roadmaps' ? (
          /* Roadmaps Grid View */
          <motion.div
            key="roadmaps-grid"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {mockRoadmaps.map((rm) => (
              <div
                key={rm.id}
                className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50">
                    <Map size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                    {rm.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{rm.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    Est. Duration: {rm.estimatedHours} • {rm.completedSteps} of {rm.stepsCount} milestones completed
                  </p>
                </div>

                {/* Progress */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-zinc-400">
                    <span>Path Completion</span>
                    <span className="text-purple-600 dark:text-purple-400">{Math.round((rm.completedSteps / rm.stepsCount) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all"
                      style={{ width: `${(rm.completedSteps / rm.stepsCount) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                  <Link
                    href="/roadmaps"
                    className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    Open Roadmap <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          /* Enrolled Courses Grid */
          <motion.div
            key="courses-grid"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCourses.length > 0 ? (
              filteredCourses.map((item: any, idx: number) => {
                const isBookmarked = bookmarkedIds.includes(item.courseId || `item-${idx}`);
                const isComplete = (item.progress || 0) === 100 || item.status === 'Completed';

                return (
                  <motion.div
                    key={item.courseId || idx}
                    whileHover={{ y: -4 }}
                    className="group flex flex-col justify-between p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-all relative overflow-hidden"
                  >
                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className={`p-3 rounded-2xl border transition-colors ${
                          isComplete
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50'
                            : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50'
                        }`}>
                          {isComplete ? <CheckCircle2 size={24} /> : <GraduationCap size={24} />}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleBookmark(item.courseId || `item-${idx}`, item.title)}
                            className={`p-2 rounded-xl transition-colors ${
                              isBookmarked
                                ? 'bg-amber-50 dark:bg-amber-950 text-amber-500'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200'
                            }`}
                          >
                            <Bookmark size={16} className={isBookmarked ? 'fill-amber-500' : ''} />
                          </button>

                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                            isComplete
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                              : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50'
                          }`}>
                            {isComplete ? 'Completed' : 'In Progress'}
                          </span>
                        </div>
                      </div>

                      {/* Course Title & Details */}
                      <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.title}
                      </h4>

                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-2 flex items-center gap-1.5">
                        <Clock size={13} /> {item.type || 'Course'} • {item.instructor || 'Arcade Academy'}
                      </p>

                      {/* Progress Bar */}
                      <div className="mt-5 space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-500 dark:text-zinc-400">
                            {item.completedModules || 0}/{item.totalModules || 10} Modules
                          </span>
                          <span className={isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}>
                            {item.progress || (isComplete ? 100 : 45)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isComplete ? 'bg-emerald-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${item.progress || (isComplete ? 100 : 45)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                        Enrolled {item.date || 'Jul 2026'}
                      </span>

                      {item.courseId ? (
                        <Link
                          href={isComplete ? `/achievements` : `/learn/${item.courseId}/learn`}
                          className={`py-2 px-3.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 ${
                            isComplete
                              ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                          }`}
                        >
                          {isComplete ? (
                            <>Certificate <Award size={14} /></>
                          ) : (
                            <>Continue <ArrowRight size={14} /></>
                          )}
                        </Link>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">Enrolled</span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-16 px-6 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl text-center bg-white/50 dark:bg-zinc-900/50 space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <BookOpen size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">No courses match your filter</h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                    Try adjusting your search query or switching to another status tab.
                  </p>
                </div>
                <button
                  onClick={() => { setActiveTab('all'); setSearchQuery(''); setSelectedType('all'); }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-semibold text-xs transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
