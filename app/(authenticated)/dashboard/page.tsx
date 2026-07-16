'use client';

import { useAuthStore } from '@/store/auth.store';
import { motion, Variants } from 'framer-motion';
import { Search, Star, Clock, BookOpen, ChevronRight } from 'lucide-react';
import DashboardLoading from './loading';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const MOCK_COURSES = [
  {
    id: 1,
    title: 'Advanced React & Next.js Patterns',
    instructor: 'Sarah Drasner',
    rating: 4.9,
    reviews: 1240,
    price: '$49.99',
    duration: '12h 30m',
    lessons: 48,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    badge: 'Bestseller'
  },
  {
    id: 2,
    title: 'UI/UX Design for Developers',
    instructor: 'Gary Simon',
    rating: 4.8,
    reviews: 850,
    price: '$39.99',
    duration: '8h 15m',
    lessons: 32,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    badge: 'New'
  },
  {
    id: 3,
    title: 'Mastering Python Data Science',
    instructor: 'Jose Portilla',
    rating: 4.7,
    reviews: 3100,
    price: '$59.99',
    duration: '22h 45m',
    lessons: 104,
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
    badge: 'Highest Rated'
  }
];

export default function DashboardPage() {
  const { user, status } = useAuthStore();

  if (status === 'loading' || !user) return <DashboardLoading />;

  return (
    <motion.div 
      className="mx-auto max-w-6xl space-y-12 pb-12 transition-colors"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col items-center justify-center pt-24 pb-12 px-4 text-center border-b border-slate-100 dark:border-transparent transition-colors">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_COURSES.map((course) => (
            <div key={course.id} className="group bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden hover:shadow-xl dark:hover:shadow-indigo-900/20 transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-neutral-900">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 dark:text-neutral-200 shadow-sm border border-transparent dark:border-neutral-800">
                  {course.badge}
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-neutral-400 mb-3">{course.instructor}</p>
                
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-sm font-bold text-amber-500">{course.rating}</span>
                  <div className="flex items-center text-amber-500">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} size={14} className={star <= Math.floor(course.rating) ? "fill-current" : "text-slate-300 dark:text-neutral-700"} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 dark:text-neutral-500 ml-1">({course.reviews.toLocaleString()})</span>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-neutral-400 mb-4 mt-auto">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-indigo-400 dark:text-indigo-500" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={14} className="text-indigo-400 dark:text-indigo-500" />
                    <span>{course.lessons} lessons</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-neutral-800">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">{course.price}</span>
                  <button className="px-4 py-2 bg-slate-100 dark:bg-neutral-900 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:text-white text-slate-800 dark:text-neutral-200 text-sm font-bold rounded-lg transition-colors border border-transparent dark:border-neutral-800 dark:hover:border-transparent">
                    Enroll Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
