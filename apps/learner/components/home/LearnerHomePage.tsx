'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  BookOpen,
  Clock,
  Play,
  Award,
  Trophy,
  Calendar,
  ChevronRight,
  Flame,
  Star,
  Users,
  Target,
  Zap,
  ArrowUpRight,
  GraduationCap,
  Video,
  Layers,
  Check,
  Code,
  Terminal,
  BarChart3,
  Lock,
  Compass,
  ArrowRight,
  Settings,
  X,
  Plus,
  CheckCircle2,
  FileText,
  Sparkles
} from 'lucide-react';
import DashboardLoading from '@/app/(authenticated)/loading';

// Interface for Courses
interface CourseItem {
  id: string;
  title: string;
  category: string;
  modules: string;
  description: string;
  progress: number;
  level: string;
  duration: string;
  rating?: string;
  syllabus: string[];
}

export default function LearnerHomePage() {
  const { status, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeCourseTab, setActiveCourseTab] = useState<'active' | 'recommended' | 'completed'>('active');
  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null);

  // ─── Interactive State ───
  const [selectedRoadmapStep, setSelectedRoadmapStep] = useState<number>(3);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChallengeSubmitted, setIsChallengeSubmitted] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [loggedMinutes, setLoggedMinutes] = useState<string>('45');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (status === 'loading' || !mounted) return <DashboardLoading />;

  const displayName = (() => {
    const rawName = user?.fullName || user?.firstName || user?.name || user?.username;
    if (!rawName || rawName.trim().toLowerCase().startsWith('dev')) {
      return 'Adhithyan';
    }
    return rawName.trim().split(' ')[0];
  })();

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const skillsData = [
    { name: 'React & Next.js Architecture', percent: 88, level: 'Expert', color: 'from-indigo-600 to-indigo-400' },
    { name: 'System Architecture & Microservices', percent: 74, level: 'Advanced', color: 'from-purple-600 to-purple-400' },
    { name: 'PostgreSQL & Database Design', percent: 65, level: 'Intermediate', color: 'from-teal-600 to-teal-400' },
  ];

  const roadmapSteps = [
    { id: 1, title: 'HTML, CSS & UI Layouts', status: 'Completed', progress: '100%', skills: ['Flexbox', 'CSS Grid', 'Tailwind', 'Semantic HTML'] },
    { id: 2, title: 'JavaScript & Async Logic', status: 'Completed', progress: '100%', skills: ['ES6+', 'Promises', 'Event Loop', 'DOM Manipulation'] },
    { id: 3, title: 'Advanced React & Next.js', status: 'In Progress', progress: '68%', skills: ['App Router', 'Server Components', 'Zustand', 'Framer Motion'] },
    { id: 4, title: 'Node.js & Microservices', status: 'Locked', progress: '0%', skills: ['Express', 'REST APIs', 'gRPC', 'RabbitMQ'] },
    { id: 5, title: 'Cloud Architecture & CI/CD', status: 'Locked', progress: '0%', skills: ['Docker', 'AWS S3/EC2', 'GitHub Actions', 'Terraform'] },
  ];

  const activeCoursesData: CourseItem[] = [
    {
      id: '1',
      title: 'TypeScript System Patterns',
      category: 'Frontend',
      modules: '4/8 Modules',
      description: 'Master generics, conditional types, AST transformers, and design patterns for large codebase scalability.',
      progress: 50,
      level: 'Intermediate',
      duration: '4 Weeks',
      syllabus: [
        'Advanced Generics & Constraints',
        'Mapped Types & Utility Functions',
        'AST Transformers & Compiler API',
        'Design Patterns in TypeScript'
      ]
    },
    {
      id: '2',
      title: 'Docker & Kubernetes Pipelines',
      category: 'DevOps',
      modules: '8/10 Modules',
      description: 'Deploy production containers with automated CI/CD, ingress controllers, and helm charts.',
      progress: 80,
      level: 'Advanced',
      duration: '6 Weeks',
      syllabus: [
        'Containerization Best Practices',
        'Kubernetes Pods & Services',
        'Helm Charts & Ingress Setup',
        'Production Monitoring & Logging'
      ]
    }
  ];

  const recommendedCoursesData: CourseItem[] = [
    {
      id: '3',
      title: 'PostgreSQL Indexing & Optimization',
      category: 'Backend',
      modules: '0/6 Modules',
      description: 'Learn query plan analysis, B-Tree indexes, partitioning, and high-concurrency connection pooling.',
      progress: 0,
      level: 'Intermediate',
      duration: '6 Weeks',
      rating: '4.9 (120)',
      syllabus: [
        'Understanding EXPLAIN ANALYZE',
        'B-Tree & GIN/GiST Indexing',
        'Database Table Partitioning',
        'Connection Pooling with PgBouncer'
      ]
    },
    {
      id: '4',
      title: 'RAG Architectures & LLM Agents',
      category: 'AI & Data',
      modules: '0/8 Modules',
      description: 'Build vector search indexes, semantic caching, and autonomous tool-calling agents.',
      progress: 0,
      level: 'Advanced',
      duration: '8 Weeks',
      rating: '4.9 (84)',
      syllabus: [
        'Vector Embeddings & Search',
        'LangChain & LlamaIndex Pipelines',
        'Semantic Cache Layers',
        'Autonomous Agent Tool-Calling'
      ]
    }
  ];

  const completedCoursesData: CourseItem[] = [
    {
      id: '5',
      title: 'JavaScript Async Mastery',
      category: 'Core JS',
      modules: '6/6 Modules',
      description: 'Mastered Promises, Event Loop microtasks, Async Generators, and Web Workers.',
      progress: 100,
      level: 'Advanced',
      duration: '3 Weeks',
      rating: '5.0 (210)',
      syllabus: [
        'Event Loop & Call Stack Mechanics',
        'Promise Microtask Resolution',
        'Async Generators & Iterators',
        'Web Workers Multithreading'
      ]
    }
  ];

  const handleChallengeSubmit = () => {
    if (selectedOption === null) {
      toast.error('Please select an option before submitting!');
      return;
    }
    setIsChallengeSubmitted(true);
    if (selectedOption === 1) {
      toast.success('Correct! You optimized the async pipeline mutex cleanly 🎉');
    } else {
      toast.error('Incorrect option! Try reviewing mutex lock acquisition order.');
    }
  };

  const handleLogStudyTime = () => {
    const mins = parseInt(loggedMinutes);
    if (isNaN(mins) || mins <= 0) {
      toast.error('Please enter a valid number of minutes.');
      return;
    }
    toast.success(`Logged ${mins} minutes of learning for today!`);
    setIsGoalModalOpen(false);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/60 dark:bg-[#121316] font-sans text-slate-900 dark:text-slate-100 pt-20 md:pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">

      {/* ─── 1. Spacious Hero Header Banner ─── */}
      <div className="relative overflow-hidden bg-white dark:bg-neutral-900 rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-6">

        {/* Animated Background Vector Wave SVG */}
        <motion.div
          animate={{ x: [-15, 15, -15] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-4 -left-12 -right-12 h-32 pointer-events-none opacity-40 dark:opacity-20"
        >
          <img src="/svgs/learning-hero-wave.svg" alt="Wave" className="w-full h-full object-cover" />
        </motion.div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {getTimeGreeting()}, {displayName}
            </h1>
            <p className="text-sm text-slate-500 dark:text-neutral-400 font-medium">
              Track your progress, solve daily challenges, and achieve your career roadmap.
            </p>
          </div>

          {/* Stat Ribbon */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-2xs">
              <Flame size={18} />
              <span>7 Days Streak</span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold shadow-2xs">
              <Clock size={18} />
              <span>24.5h Learned</span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-2xs">
              <GraduationCap size={18} />
              <span>4 Done</span>
            </div>
          </div>
        </div>

      </div>

      {/* ─── 2. Primary Active Focus Hero Card (Full Width) ─── */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-6 relative overflow-hidden group">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/60 uppercase tracking-wider">
              Primary Active Course
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white pt-2 group-hover:text-indigo-600 transition-colors">
              TypeScript System Patterns
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
              Master generics, conditional types, AST transformers, and design patterns for large codebase scalability.
            </p>
          </div>

          <Link
            href="/my-learning"
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 self-start sm:self-center"
          >
            <Play size={16} fill="currentColor" />
            <span>Resume Lesson 5</span>
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500 dark:text-neutral-400">Course Progress (4 of 8 Modules Completed)</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">50% Completed</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '50%' }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full bg-indigo-600 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* ─── 3. Spacious 2-Column Balanced Architecture (70% Main | 30% Sidebar) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ─── MAIN COLUMN (8/12 = 70% Width): Career Track, Challenges, & Course Catalog ─── */}
        <div className="lg:col-span-8 space-y-8">

          {/* Horizontal Career Track Ribbon */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Career Pathway: <span className="text-indigo-600 dark:text-indigo-400">Full-Stack Engineer</span>
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                Step {selectedRoadmapStep} of 5 Selected
              </span>
            </div>

            {/* Horizontal Step Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {roadmapSteps.map((step) => {
                const isSelected = selectedRoadmapStep === step.id;
                const isDone = step.status === 'Completed';
                const isActive = step.status === 'In Progress';

                return (
                  <button
                    key={step.id}
                    onClick={() => setSelectedRoadmapStep(step.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 border-2 border-indigo-600 dark:border-indigo-400 shadow-xs scale-[1.02]'
                      : isDone
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-900/40 hover:bg-emerald-100/50'
                        : isActive
                          ? 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/40 hover:bg-indigo-100/50'
                          : 'bg-slate-50 dark:bg-neutral-800/40 border-slate-200/60 dark:border-neutral-800 opacity-60 hover:opacity-100'
                      }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-[10px] font-extrabold uppercase ${isDone ? 'text-emerald-700 dark:text-emerald-400' : 'text-indigo-700 dark:text-indigo-300'
                        }`}>
                        Step {step.id}
                      </span>
                      {isDone ? (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      ) : isActive ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
                      ) : (
                        <Lock size={12} className="text-slate-400" />
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{step.title}</h4>
                  </button>
                );
              })}
            </div>

            {/* Selected Step Skills Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200/60 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400">
                  Skills in Step {selectedRoadmapStep}: {roadmapSteps[selectedRoadmapStep - 1].title}
                </span>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {roadmapSteps[selectedRoadmapStep - 1].skills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-neutral-800 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700 shadow-2xs">
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-xl shrink-0 ${roadmapSteps[selectedRoadmapStep - 1].status === 'Completed'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : roadmapSteps[selectedRoadmapStep - 1].status === 'In Progress'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'bg-slate-200 text-slate-600 dark:bg-neutral-700 dark:text-slate-400'
                }`}>
                {roadmapSteps[selectedRoadmapStep - 1].status}
              </span>
            </div>
          </div>

          {/* Daily Technical Micro-Challenge Panel */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-4 flex flex-col justify-between hover:border-indigo-300 transition-colors group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/60 uppercase tracking-wider">
                  <Code size={14} /> Daily Technical Challenge
                </span>

                <motion.div
                  animate={{ rotate: 360, y: [0, -4, 0] }}
                  transition={{ rotate: { duration: 15, repeat: Infinity, ease: "linear" }, y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
                  className="w-9 h-9 shrink-0"
                >
                  <img src="/svgs/code-challenge-badge.svg" alt="Challenge Badge" className="w-full h-full" />
                </motion.div>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                Problem #42: Optimize Async Pipeline Mutex
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                Fix race conditions and deadlock hazards in concurrent promise handlers for enterprise APIs.
              </p>
            </div>

            <button
              onClick={() => setIsChallengeModalOpen(true)}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
            >
              <span>Solve Challenge</span>
              <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>

          {/* Tabbed Course Explorer Catalog */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div className="inline-flex p-1 rounded-2xl bg-slate-200/70 dark:bg-neutral-800 text-xs font-bold">
                <button
                  onClick={() => setActiveCourseTab('active')}
                  className={`px-4 py-2 rounded-xl transition-all ${activeCourseTab === 'active'
                    ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900'
                    }`}
                >
                  Active Courses ({activeCoursesData.length})
                </button>
                <button
                  onClick={() => setActiveCourseTab('recommended')}
                  className={`px-4 py-2 rounded-xl transition-all ${activeCourseTab === 'recommended'
                    ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900'
                    }`}
                >
                  Recommended ({recommendedCoursesData.length})
                </button>
                <button
                  onClick={() => setActiveCourseTab('completed')}
                  className={`px-4 py-2 rounded-xl transition-all ${activeCourseTab === 'completed'
                    ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900'
                    }`}
                >
                  Completed ({completedCoursesData.length})
                </button>
              </div>

              <Link
                href="/my-learning"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                View Full Catalog <ChevronRight size={14} />
              </Link>
            </div>

            {/* Course Cards Grid */}
            <AnimatePresence mode="wait">
              {activeCourseTab === 'active' && (
                <motion.div
                  key="active-tab"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {activeCoursesData.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-slate-200/80 dark:border-neutral-800 shadow-2xs hover:shadow-md hover:border-indigo-400 transition-all space-y-3 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                          {course.category}
                        </span>
                        <span className="text-slate-400 text-[11px] font-medium">{course.modules}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {course.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400">{course.duration}</span>
                        <span className="font-bold text-indigo-600">{course.progress}%</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeCourseTab === 'recommended' && (
                <motion.div
                  key="recommended-tab"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {recommendedCoursesData.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-slate-200/80 dark:border-neutral-800 shadow-2xs hover:shadow-md hover:border-teal-400 transition-all space-y-3 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
                          {course.category}
                        </span>
                        <span className="text-amber-500 font-bold text-xs flex items-center gap-1">
                          <Star size={12} fill="currentColor" /> {course.rating}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors line-clamp-1">
                        {course.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400">{course.level}</span>
                        <span className="font-bold text-indigo-600 flex items-center gap-0.5">
                          Details <ArrowUpRight size={12} />
                        </span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeCourseTab === 'completed' && (
                <motion.div
                  key="completed-tab"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {completedCoursesData.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-slate-200/80 dark:border-neutral-800 shadow-2xs hover:shadow-md hover:border-emerald-400 transition-all space-y-3 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                          {course.category}
                        </span>
                        <span className="text-emerald-500 font-bold text-xs flex items-center gap-1">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-1">
                        {course.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400">{course.duration}</span>
                        <span className="font-bold text-emerald-600">Certificate Ready</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

        {/* ─── SIDEBAR COLUMN (4/12 = 30% Width): Goals, Skills, Ecosystem ─── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Circular SVG Goal Tracker Widget (Clickable to Log Time) */}
          <div
            onClick={() => setIsGoalModalOpen(true)}
            className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all space-y-4 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Weekly Learning Goal</h4>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                80% Met <Plus size={14} />
              </span>
            </div>

            {/* Circular Ring SVG & Days Bar */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-neutral-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray="80, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-extrabold text-slate-900 dark:text-white">4/5d</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  4 of 5 target days completed
                </p>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">Click to log study hours!</p>
              </div>
            </div>
          </div>

          {/* Skill Competency Breakdown with Animated Radar Vector */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 90, 180, 270, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 shrink-0"
                >
                  <img src="/svgs/skills-radar-orbit.svg" alt="Radar" className="w-full h-full" />
                </motion.div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Skill Competency</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Top 5%</span>
            </div>

            <div className="space-y-3">
              {skillsData.map((skill, idx) => {
                const isDimmed = hoveredSkill !== null && hoveredSkill !== idx;
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredSkill(idx)}
                    onMouseLeave={() => setHoveredSkill(null)}
                    className={`space-y-1.5 transition-all duration-300 cursor-pointer p-2 rounded-xl ${isDimmed ? 'opacity-35 scale-[0.99]' : 'opacity-100 bg-slate-50/50 dark:bg-neutral-800/40'
                      }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white truncate">{skill.name}</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{skill.percent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.percent}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Peer Network Widget */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Active Peer Network</h4>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> 14 Online
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 hover:bg-indigo-50/60 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                    JD
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">John Doe</div>
                    <div className="text-[10px] text-slate-500 dark:text-neutral-400">Next.js App Router</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline" onClick={() => toast.success('Opened chat session with John Doe')}>
                  Chat
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 hover:bg-purple-50/60 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center">
                    AS
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Ananya Sharma</div>
                    <div className="text-[10px] text-slate-500 dark:text-neutral-400">System Design</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline" onClick={() => toast.success('Opened chat session with Ananya Sharma')}>
                  Chat
                </span>
              </div>
            </div>
          </div>

          {/* Upcoming Live Workshop */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video size={18} className="text-rose-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Live Masterclass</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200">
                LIVE
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-neutral-800/50 space-y-2">
              <div className="text-xs font-bold text-rose-600 flex items-center gap-1">
                <Calendar size={14} /> Tomorrow, 3:00 PM IST
              </div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                Microservices & Event Bus Architecture
              </h5>
            </div>

            <button
              onClick={() => toast.success('Registered for Live Workshop!')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              Register Now
            </button>
          </div>

        </div>

      </div>



      {/* ─── MODAL 1: Interactive Course Details Drawer ─── */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#1A1D21] border border-slate-200 dark:border-neutral-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    {selectedCourse.category}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{selectedCourse.title}</h3>
                </div>
                <button onClick={() => setSelectedCourse(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                  {selectedCourse.description}
                </p>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-neutral-400 pt-1">
                  <span>⏱️ Duration: {selectedCourse.duration}</span>
                  <span>📊 Level: {selectedCourse.level}</span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText size={14} className="text-indigo-500" /> Course Syllabus Modules
                  </h4>
                  <div className="space-y-1.5">
                    {selectedCourse.syllabus.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-neutral-300 p-2 rounded-xl bg-slate-50 dark:bg-neutral-800/60">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Close
                </button>
                <Link
                  href="/my-learning"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <Play size={14} fill="currentColor" />
                  <span>Launch Course</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL 2: Interactive Daily Challenge Problem Solver ─── */}
      <AnimatePresence>
        {isChallengeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#1A1D21] border border-slate-200 dark:border-neutral-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Code size={18} className="text-indigo-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Problem #42: Optimize Async Pipeline Mutex</h3>
                </div>
                <button onClick={() => { setIsChallengeModalOpen(false); setIsChallengeSubmitted(false); setSelectedOption(null); }} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                  <code>
                    {`async function acquireLock(mutexKey) {\n  // What is the safest way to prevent async deadlocks?\n}`}
                  </code>
                </div>

                <div className="space-y-2">
                  {[
                    'Use a atomic compare-and-swap (CAS) lock with a strict TTL timeout',
                    'Acquire locks in alphabetical key order with exponential backoff retry',
                    'Disable promise resolution queues during concurrent writes'
                  ].map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full text-left p-3 rounded-2xl border text-xs font-semibold transition-all flex items-center justify-between gap-2 ${selectedOption === idx
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                    >
                      <span>{option}</span>
                      {selectedOption === idx && <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => { setIsChallengeModalOpen(false); setIsChallengeSubmitted(false); setSelectedOption(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChallengeSubmit}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Submit Solution
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL 3: Interactive Log Study Time Dialog ─── */}
      <AnimatePresence>
        {isGoalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#1A1D21] border border-slate-200 dark:border-neutral-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Target size={16} className="text-indigo-500" /> Log Today's Study Time
                </h3>
                <button onClick={() => setIsGoalModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
                  Minutes Learned Today:
                </label>
                <input
                  type="number"
                  value={loggedMinutes}
                  onChange={(e) => setLoggedMinutes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 45"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setIsGoalModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogStudyTime}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Save Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
