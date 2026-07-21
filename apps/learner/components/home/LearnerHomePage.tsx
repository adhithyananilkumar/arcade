'use client';

import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { motion, Variants } from 'framer-motion';
import { Search, Star, Clock, BookOpen, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/infrastructure/http/api';
import type { CourseResponse } from '@/shared/types/api.types';
import Link from 'next/link';
import DashboardLoading from '@/app/(authenticated)/loading';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

export default function LearnerHomePage() {
  const { user, status } = useAuthStore();
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<CourseResponse[]>("/api/v1/public/courses")
      .then((data) => {
        // Only show published courses on the dashboard
        setCourses(data.filter(c => c.status === 'PUBLISHED' || c.status === 'APPROVED' || c.status === 'SUBMITTED' || c.status === 'DRAFT'));
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  if (status === 'loading' || !user) return <DashboardLoading />;

  return (
    <motion.div 
      className="mx-auto max-w-7xl w-full px-4 md:px-8 py-8 space-y-12 transition-colors"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col items-center justify-center pt-8 pb-12 text-center transition-colors">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight transition-colors">
            What do you want to learn today?
          </h1>
          <p className="text-slate-500 dark:text-neutral-400 mb-8 text-lg transition-colors">
            Discover thousands of courses created by top instructors around the world.
          </p>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400 dark:text-neutral-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search for courses, skills, or mentors..." 
              className="block w-full rounded-2xl border-2 border-slate-200 dark:border-neutral-800 bg-white dark:bg-black py-4 pl-14 pr-32 text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-0 outline-none transition-all shadow-sm hover:border-slate-300 dark:hover:border-neutral-700 focus:shadow-md"
            />
            <div className="absolute inset-y-2 right-2">
              <button className="flex items-center justify-center h-full px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-sm active:scale-[0.98]">
                Search
              </button>
            </div>
          </div>
          
          <div className="mt-10 flex flex-col items-center gap-3">
            <span className="text-sm font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-2 transition-colors">Popular Categories</span>
            
            {/* Row 1: 4 items */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              {['Web Development', 'UI/UX Design', 'Data Science', 'Digital Marketing'].map((tag) => (
                <button key={tag} className="px-4 py-2 rounded-full border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-600 dark:text-neutral-300 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all shadow-sm">
                  {tag}
                </button>
              ))}
            </div>
            
            {/* Row 2: 3 items */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              {['Mobile Apps', 'Cybersecurity', 'Cloud Computing'].map((tag) => (
                <button key={tag} className="px-4 py-2 rounded-full border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-600 dark:text-neutral-300 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all shadow-sm">
                  {tag}
                </button>
              ))}
            </div>

            {/* Row 3: 2 items */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              {['Machine Learning', 'Blockchain'].map((tag) => (
                <button key={tag} className="px-4 py-2 rounded-full border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-600 dark:text-neutral-300 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all shadow-sm">
                  {tag}
                </button>
              ))}
            </div>

            {/* Row 4: 1 item */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              {['Game Development'].map((tag) => (
                <button key={tag} className="px-4 py-2 rounded-full border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-600 dark:text-neutral-300 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all shadow-sm">
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recommended Courses Section */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">Recommended for you</h2>
          <button className="flex items-center gap-1 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group">
            View all 
            <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden h-[340px] animate-pulse">
                <div className="h-48 bg-slate-200 dark:bg-neutral-800 w-full" />
                <div className="p-5">
                  <div className="h-4 bg-slate-200 dark:bg-neutral-800 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-slate-200 dark:bg-neutral-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-neutral-900 mb-4">
              <BookOpen size={32} className="text-slate-400 dark:text-neutral-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No courses available</h3>
            <p className="text-slate-500 dark:text-neutral-400">There are no courses published yet. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link href={`/learn/${course.id}`} key={course.id} className="group bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden hover:shadow-xl dark:hover:shadow-indigo-900/20 transition-all duration-300 hover:-translate-y-1 flex flex-col">
                <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-neutral-900">
                  <img 
                    src={course.coverImageUrl || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80"} 
                    alt={course.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {course.status === 'PUBLISHED' && (
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 dark:text-neutral-200 shadow-sm border border-transparent dark:border-neutral-800">
                      Published
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-neutral-400 mb-3">{course.authorName || 'Unknown Instructor'}</p>
                  
                  <div className="flex items-center gap-1 mb-4">
                    <span className="text-sm font-bold text-amber-500">4.8</span>
                    <div className="flex items-center text-amber-500">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} size={14} className={star <= 4 ? "fill-current" : "text-slate-300 dark:text-neutral-700"} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 dark:text-neutral-500 ml-1">(1,240)</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-neutral-400 mb-4 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-indigo-400 dark:text-indigo-500" />
                      <span>{course.description ? "Detailed" : "Self-paced"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={14} className="text-indigo-400 dark:text-indigo-500" />
                      <span>{course.modules ? course.modules.length : 0} modules</span>
                    </div>
                  </div>
                  
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

