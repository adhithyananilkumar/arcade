'use client';

import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { ArrowRight, FileText, Award, FlaskConical, Calendar, Code, Cloud, Briefcase, GraduationCap, TrendingUp, Trophy, ChevronRight, Users, PlayCircle, BookOpen, Clock } from 'lucide-react';
import DashboardLoading from '@/app/(authenticated)/loading';
import Image from 'next/image';

export default function LearnerHomePage() {
  const { user, status } = useAuthStore();

  if (status === 'loading') return <DashboardLoading />;

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-neutral-950 pt-28 pb-32 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 space-y-8">
        
        {/* Hero Section */}
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row">
          <div className="p-8 md:p-10 flex-1 flex flex-col justify-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Good Morning, {user?.firstName || 'Athira'} 👋
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              Continue Your Academic Journey
            </h2>
            <p className="text-gray-500 dark:text-neutral-400 mb-8 max-w-lg">
              Access courses, events, certifications, and everything you need to grow and achieve.
            </p>
            <div className="flex items-center gap-4">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors text-sm flex items-center gap-2">
                Resume Learning
                <ArrowRight size={16} />
              </button>
              <button className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700 px-5 py-2.5 rounded-lg font-medium transition-colors text-sm">
                Go to Dashboard
              </button>
            </div>
          </div>
          <div className="hidden md:block w-[40%] relative min-h-[250px]">
            <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-neutral-900 to-transparent z-10 w-1/3" />
            <img 
              src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000&auto=format&fit=crop" 
              alt="Campus" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Quick Access */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Access</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'Assignments', desc: 'View your tasks', icon: FileText, color: 'text-blue-600' },
              { title: 'Certificates', desc: 'Your achievements', icon: Award, color: 'text-amber-600' },
              { title: 'Labs', desc: 'Virtual & Physical', icon: FlaskConical, color: 'text-emerald-600' },
              { title: 'Events', desc: 'Explore & Join', icon: Calendar, color: 'text-red-600' }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-4 rounded-xl flex items-center gap-4 hover:shadow-sm transition-shadow cursor-pointer">
                <div className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                  <item.icon size={24} className={item.color} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Continue Learning */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Continue Learning</h3>
              <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">View all</button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Advanced React', dept: 'CSE', progress: 75, icon: Code },
                { title: 'Python for Data Science', dept: 'MCA', progress: 45, icon: PlayCircle },
                { title: 'Cloud Computing', dept: 'IT', progress: 20, icon: Cloud }
              ].map((course, i) => (
                <div key={i} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden flex flex-col hover:shadow-sm transition-shadow">
                  <div className="h-24 bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                    <course.icon size={36} className="text-gray-400 dark:text-neutral-500" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{course.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-neutral-400 mb-4">By Dept. of {course.dept}</p>
                    
                    <div className="mt-auto mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <div className="h-1.5 flex-1 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden mr-3">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${course.progress}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 dark:text-neutral-300">{course.progress}%</span>
                      </div>
                    </div>
                    
                    <button className="w-full py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 rounded-lg transition-colors">
                      Continue Learning
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Upcoming Events */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Events</h3>
              <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">View all</button>
            </div>
            
            <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-2">
              <div className="divide-y divide-gray-100 dark:divide-neutral-800">
                {[
                  { title: 'Hackathon 2026', time: 'Tomorrow • 9:00 AM', location: 'Innovation Lab', icon: Code },
                  { title: 'Cloud Workshop', time: 'Friday • 2:00 PM', location: 'Virtual', icon: Cloud },
                  { title: 'Placement Drive', time: 'Monday • 10:00 AM', location: 'Auditorium', icon: Briefcase }
                ].map((event, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-neutral-800/50 rounded-lg transition-colors cursor-pointer">
                    <div className="p-2.5 bg-gray-100 dark:bg-neutral-800 rounded-lg shrink-0">
                      <event.icon size={18} className="text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{event.title}</h5>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
                        <span>{event.time}</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>

        {/* Your Progress */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Progress</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { val: '12', label: 'Courses Completed', icon: GraduationCap },
              { val: '85%', label: 'Attendance', icon: TrendingUp },
              { val: '6', label: 'Certificates Earned', icon: Award },
              { val: '3', label: 'Hackathons Participated', icon: Trophy }
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.val}</div>
                  <div className="text-xs font-medium text-gray-500 dark:text-neutral-400 mt-1">{stat.label}</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-full text-gray-400 dark:text-gray-500">
                  <stat.icon size={24} />
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
