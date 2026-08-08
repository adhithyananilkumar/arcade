'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronRight, PlayCircle, Star, BookOpen, Clock, Check, Lock, ChevronDown, ListVideo, FileText, MessageSquare, CheckCircle2 } from 'lucide-react';

type Course = {
  id: string;
  title: string;
  category: string;
  progress: number;
  icon: string;
  rating: number;
  modules: number;
  duration: string;
  learnings: string[];
};

const COURSES: Course[] = [
  {
    id: 'c1',
    title: 'React.js Basics',
    category: 'Web Development',
    progress: 66,
    icon: '⚛',
    rating: 4.8,
    modules: 12,
    duration: '10h 30m',
    learnings: [
      'Components, Props & State',
      'Hooks and React Lifecycle',
      'React Router & Navigation',
      'Build real-world projects',
    ],
  },
  {
    id: 'c2',
    title: 'Next.js Mastery',
    category: 'Web Development',
    progress: 25,
    icon: '▲',
    rating: 4.9,
    modules: 15,
    duration: '14h 0m',
    learnings: [
      'Server-Side Rendering (SSR)',
      'Static Site Generation (SSG)',
      'API Routes & Edge Functions',
      'Advanced Routing & Layouts',
    ],
  },
  {
    id: 'c3',
    title: 'Node.js Essentials',
    category: 'Backend',
    progress: 0,
    icon: '⬢',
    rating: 4.7,
    modules: 10,
    duration: '8h 45m',
    learnings: [
      'Event Loop & Async Programming',
      'Express.js Fundamentals',
      'REST API Development',
      'Database Integration (MongoDB)',
    ],
  },
  {
    id: 'c4',
    title: 'UI/UX Fundamentals',
    category: 'Design',
    progress: 0,
    icon: '🎨',
    rating: 4.9,
    modules: 8,
    duration: '6h 15m',
    learnings: [
      'Color Theory & Typography',
      'Wireframing & Prototyping',
      'User Research Basics',
      'Figma Masterclass',
    ],
  },
];

type Milestone = {
  id: string;
  label: string;
  hint: string;
  status: 'done' | 'current' | 'locked';
  desc: string;
};

const MILESTONES: Milestone[] = [
  {
    id: 'm1',
    label: 'Spark',
    hint: 'First course',
    status: 'done',
    desc: 'You completed your first course and took the first step on your journey.',
  },
  {
    id: 'm2',
    label: 'Build',
    hint: 'Ship a project',
    status: 'done',
    desc: 'You built and shipped your first real-world project to production.',
  },
  {
    id: 'm3',
    label: 'Arena',
    hint: 'First hackathon',
    status: 'current',
    desc: 'Complete your first project and participate in a hackathon.',
  },
  {
    id: 'm4',
    label: 'Crew',
    hint: 'Join a channel',
    status: 'locked',
    desc: 'Join a learning cohort or community channel to collaborate.',
  },
  {
    id: 'm5',
    label: 'Orbit',
    hint: 'Mentor others',
    status: 'locked',
    desc: 'Reach the pinnacle by mentoring newcomers and sharing your knowledge.',
  },
];

export function InteractiveRoadmap() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(COURSES[0].id);
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string>('m3'); // Default to current

  const selectedCourse = COURSES.find((c) => c.id === selectedCourseId)!;

  const completedCount = MILESTONES.filter(m => m.status === 'done').length;
  const progressPercent = Math.round((completedCount / MILESTONES.length) * 100);
  const nextMilestone = MILESTONES.find(m => m.status === 'locked');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto w-full max-w-[1600px] mt-12 mb-28 px-4 md:px-8 xl:px-12"
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.8fr_1fr] lg:gap-16 xl:gap-24">
        
        {/* ========================================================= */}
          {/* LEFT COLUMN: COURSE EXPLORER                              */}
          {/* ========================================================= */}
          <div className="flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-tight text-[#14142b]">Course Explorer</h2>
              <p className="mt-1 text-[14px] font-medium text-slate-500">
                Select a course to see details, modules, and progress.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr] lg:gap-12 xl:gap-16">
              {/* Course List */}
              <div className="flex flex-col gap-4">
                {COURSES.map((course) => {
                  const isSelected = course.id === selectedCourseId;
                  return (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourseId(course.id)}
                      className={`group relative flex w-full flex-col gap-2 rounded-2xl border p-3.5 text-left transition-all ${
                        isSelected
                          ? 'border-[#5C4FFF]/30 bg-gradient-to-br from-[#5C4FFF]/5 to-[#8B5CF6]/5 shadow-[0_4px_15px_rgba(92,79,255,0.08)]'
                          : 'border-white/60 bg-white/60 hover:border-slate-300 hover:bg-white shadow-[0_2px_10px_rgba(20,20,43,0.02)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-[15px] shadow-sm ${isSelected ? 'bg-white text-[#5C4FFF]' : 'bg-slate-50 text-slate-500 group-hover:text-[#14142b]'}`}>
                            {course.icon}
                          </div>
                          <div>
                            <h4 className={`text-[13.5px] font-bold leading-tight ${isSelected ? 'text-[#5C4FFF]' : 'text-[#14142b]'}`}>{course.title}</h4>
                            <p className="text-[11px] font-semibold text-slate-400">{course.category}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} strokeWidth={2.5} className={isSelected ? 'text-[#5C4FFF]' : 'text-slate-300 group-hover:text-slate-400'} />
                      </div>
                      <div className="mt-1 flex items-center gap-3 px-1">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/60">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isSelected ? 'bg-gradient-to-r from-[#5C4FFF] to-[#8B5CF6]' : 'bg-slate-300'}`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">{course.progress}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Course Details */}
              <div className="flex flex-col rounded-3xl border border-white bg-white/80 p-6 shadow-[0_8px_30px_rgba(20,20,43,0.04)] relative overflow-hidden">
                {/* Decorative BG element */}
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-[#5C4FFF]/10 to-[#FF6B4A]/10 blur-3xl pointer-events-none" />
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedCourse.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex h-full flex-col relative z-10"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 border border-emerald-100">
                            Beginner
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-[#14142b]">{selectedCourse.title}</h3>
                        <p className="mt-1 text-[14px] font-medium text-slate-500">Build modern UIs from scratch.</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5C4FFF]/10 to-[#8B5CF6]/10 text-2xl shadow-sm border border-[#5C4FFF]/20">
                        {selectedCourse.icon}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-4 border-b border-slate-100 pb-5">
                      <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-600">
                        <ListVideo size={16} className="text-[#5C4FFF]" /> {selectedCourse.modules} Modules
                      </div>
                      <div className="h-4 w-[1px] bg-slate-200" />
                      <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-600">
                        <Star size={16} className="text-amber-500 fill-amber-500" /> {selectedCourse.rating}
                      </div>
                      <div className="h-4 w-[1px] bg-slate-200" />
                      <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-600">
                        <Clock size={16} className="text-emerald-500" /> {selectedCourse.duration}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[13px] font-bold text-[#14142b]">
                        <span>Course Progress</span>
                        <span className="text-[#5C4FFF]">{selectedCourse.progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedCourse.progress}%` }}
                          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-[#5C4FFF] to-[#8B5CF6]"
                        />
                      </div>
                    </div>

                    <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#14142b] py-3 text-[14px] font-bold text-white transition-all hover:bg-[#5C4FFF] hover:shadow-[0_8px_20px_rgba(92,79,255,0.25)]">
                      Continue Learning <ChevronRight size={18} />
                    </button>

                    <div className="mt-6 flex items-center gap-4 border-b border-slate-100 pb-2">
                      <button className="border-b-2 border-[#5C4FFF] pb-2 text-[13px] font-bold text-[#14142b]">Overview</button>
                      <button className="pb-2 text-[13px] font-bold text-slate-400 hover:text-slate-600">Modules</button>
                      <button className="pb-2 text-[13px] font-bold text-slate-400 hover:text-slate-600">Resources</button>
                      <button className="pb-2 text-[13px] font-bold text-slate-400 hover:text-slate-600">Reviews</button>
                    </div>

                    <div className="mt-5 flex-1">
                      <h4 className="text-[13px] font-black uppercase tracking-wider text-slate-400 mb-3">What you'll learn</h4>
                      <ul className="flex flex-col gap-3">
                        {selectedCourse.learnings.map((learning, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <CheckCircle2 size={16} strokeWidth={2.5} className="mt-0.5 text-emerald-500 shrink-0" />
                            <span className="text-[13.5px] font-medium text-slate-600">{learning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: VERTICAL ROAD MAP                           */}
          {/* ========================================================= */}
          <div className="flex flex-col lg:pl-10 lg:border-l lg:border-slate-200/50">
            <div className="mb-8">
              <h2 className="text-2xl font-black tracking-tight text-[#14142b]">Your Road Map</h2>
              <p className="mt-1 text-[14px] font-medium text-slate-500">
                Stay curious. The path rewards the restless.
              </p>
            </div>

            {/* Timeline Container */}
            <div className="relative flex flex-col flex-1 pl-6">
              
              {/* Vertical Connecting Line Background */}
              <div className="absolute left-[39px] top-4 bottom-8 w-1 border-l-2 border-dashed border-slate-200/80" />
              
              {/* Vertical Connecting Line Active Gradient */}
              <div 
                className="absolute left-[38px] top-4 w-1 rounded-full bg-gradient-to-b from-[#1DB876] via-[#4C6FFF] to-[#FF6B4A]"
                style={{ height: '48%' }} // Hardcoded visually to stop at "Arena"
              />

              {/* Milestones */}
              <div className="flex flex-col gap-2 relative z-10">
                {MILESTONES.map((milestone, index) => {
                  const isCompleted = milestone.status === 'done';
                  const isCurrent = milestone.status === 'current';
                  const isLocked = milestone.status === 'locked';
                  const isExpanded = expandedMilestoneId === milestone.id;
                  
                  return (
                    <div key={milestone.id} className="relative flex items-start gap-5">
                      
                      {/* Node Icon */}
                      <button 
                        onClick={() => setExpandedMilestoneId(milestone.id)}
                        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-1 cursor-pointer transition-all ${
                          isCompleted ? 'bg-[#1DB876] text-white shadow-[0_0_15px_rgba(29,184,118,0.4)]' :
                          isCurrent ? 'bg-white border-[3px] border-[#FF6B4A] shadow-[0_0_20px_rgba(255,107,74,0.3)] scale-110' :
                          'bg-slate-100 border-2 border-slate-200 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {isCompleted && <Check size={16} strokeWidth={3} />}
                        {isCurrent && (
                          <>
                            <div className="absolute inset-[-6px] rounded-full border border-[#FF6B4A]/30 animate-ping opacity-50" />
                            <div className="h-2 w-2 rounded-full bg-[#FF6B4A]" />
                          </>
                        )}
                        {isLocked && <Lock size={12} strokeWidth={2.5} />}
                      </button>

                      {/* Node Content */}
                      <div className="flex flex-col pb-8 pt-1 flex-1">
                        <button 
                          onClick={() => setExpandedMilestoneId(milestone.id)}
                          className="flex flex-col items-start text-left group"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase tracking-wider ${isCompleted ? 'text-[#1DB876]' : isCurrent ? 'text-[#FF6B4A]' : 'text-slate-400'}`}>
                              0{index + 1} — {milestone.label}
                            </span>
                          </div>
                          <h4 className={`text-[15px] font-bold mt-0.5 transition-colors ${isLocked ? 'text-slate-400' : 'text-[#14142b] group-hover:text-[#5C4FFF]'}`}>
                            {milestone.hint}
                          </h4>
                        </button>
                        
                        {/* Expanded Detail Card */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, marginTop: 0 }}
                              animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_4px_15px_rgba(20,20,43,0.03)] relative">
                                {isCurrent && (
                                  <div className="absolute -top-[1px] -left-[1px] -right-[1px] h-1 bg-gradient-to-r from-[#FF6B4A] to-[#9B5DE5] rounded-t-2xl" />
                                )}
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                    isCompleted ? 'bg-emerald-50 text-emerald-600' :
                                    isCurrent ? 'bg-orange-50 text-[#FF6B4A]' : 'text-slate-500'
                                  }`}>
                                    {isCompleted ? 'Completed' : isCurrent ? 'Current Milestone' : 'Locked'}
                                  </span>
                                </div>
                                <p className="text-[13px] font-medium leading-snug text-slate-600 mb-4">
                                  {milestone.desc}
                                </p>
                                <button className={`flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors ${
                                  isLocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 text-[#5C4FFF] hover:bg-indigo-50'
                                }`}>
                                  {isCompleted ? 'Review Journey' : isCurrent ? 'View Challenge' : 'Unlock First'}
                                  <ChevronRight size={14} strokeWidth={2.5} />
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress Summary Footer */}
            <div className="mt-4 rounded-2xl border border-slate-100 bg-white/60 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#14142b]">Your Progress</span>
                <span className="text-[12px] font-bold text-[#5C4FFF]">{completedCount} of {MILESTONES.length}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/60 mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="h-full rounded-full bg-gradient-to-r from-[#1DB876] to-[#4C6FFF]"
                />
              </div>
              <p className="text-[12px] font-medium text-slate-500">
                <strong className="text-slate-700">Next:</strong> {nextMilestone?.hint || 'All milestones complete!'}
              </p>
            </div>

          </div>
        </div>
    </motion.div>
  );
}
