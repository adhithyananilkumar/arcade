'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { UserService } from '@/services/identity/user.service';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function MyCoursesPage() {
  const { user, updateUser } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading || !currentUser) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-12 md:px-6 lg:px-8 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Enrolled Courses</h1>
        <p className="mt-2 text-slate-500">Pick up right where you left off</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="enrolled"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {currentUser.enrolledCourses && currentUser.enrolledCourses.length > 0 ? (
            currentUser.enrolledCourses.map((item: any, idx: number) => {
              const className = `group flex flex-col justify-between p-6 rounded-3xl border border-slate-100 dark:border-neutral-900 bg-white dark:bg-black shadow-[0_4px_20px_rgb(0,0,0,0.01)] transition-all min-h-[200px] ${item.courseId ? 'hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100 dark:hover:border-indigo-900/50 cursor-pointer hover:-translate-y-1' : ''}`;
              
              const innerContent = (
                <>
                  <div className="flex flex-col gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100/50 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 transition-colors group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 group-hover:scale-105">
                      <GraduationCap size={22} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight leading-snug transition-colors line-clamp-2">{item.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-neutral-500 font-semibold mt-2 transition-colors">{item.type} • {item.date}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-neutral-900 pt-4">
                    <span className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 transition-colors">
                      {item.status}
                    </span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">
                      Learn →
                    </span>
                  </div>
                </>
              );

              return item.courseId ? (
                <Link key={idx} href={`/dashboard/${item.courseId}/learn`} className={className}>
                  {innerContent}
                </Link>
              ) : (
                <div key={idx} className={className}>
                  {innerContent}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-neutral-800 rounded-2xl text-slate-400 text-sm font-semibold bg-slate-50/20 dark:bg-neutral-900/30 transition-colors">
              You haven't enrolled in any courses yet.
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
