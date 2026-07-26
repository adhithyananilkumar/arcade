'use client';

import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowRight, 
  FileText, 
  Award, 
  FlaskConical, 
  Calendar, 
  BookOpen, 
  Search,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Bell
} from 'lucide-react';
import DashboardLoading from '@/app/(authenticated)/loading';

export default function LearnerHomePage() {
  const { user, status } = useAuthStore();
  const router = useRouter();

  if (status === 'loading') return <DashboardLoading />;

  return (
    <div className="w-full min-h-screen bg-slate-50/70 dark:bg-neutral-950 pt-28 pb-32 font-sans text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Hero Welcome Banner */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 sm:p-12 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 text-xs font-semibold">
              <Sparkles size={14} />
              <span>Amal Jyothi Student Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Welcome to Your Learning Portal, {user?.firstName || 'Athira'}
            </h1>

            <p className="text-base text-slate-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
              Access your enrolled courses, view academic progress, explore campus workshops, and manage your verified certificates all in one place.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link 
                href="/my-learning"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-sm flex items-center gap-2"
              >
                <span>Go to My Courses</span>
                <ArrowRight size={16} />
              </Link>
              <Link 
                href="/search"
                className="px-6 py-3 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-700/60 font-semibold text-sm transition-colors"
              >
                Browse Catalog
              </Link>
            </div>
          </div>

          <div className="hidden md:block w-72 h-48 relative rounded-2xl overflow-hidden border border-slate-200 dark:border-neutral-800 shrink-0 shadow-xs">
            <img 
              src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=600&auto=format&fit=crop" 
              alt="Campus" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent flex items-end p-4">
              <span className="text-xs font-semibold text-white">Amal Jyothi College of Engineering</span>
            </div>
          </div>
        </div>

        {/* Main Portal Destinations */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Portal Destinations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'My Courses',
                desc: 'Access your active enrolled courses, lessons, and assignments.',
                href: '/my-learning',
                icon: BookOpen,
                color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400'
              },
              {
                title: 'Course Catalog',
                desc: 'Discover new electives, skill tracks, and virtual labs.',
                href: '/search',
                icon: Search,
                color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400'
              },
              {
                title: 'Certificates & Badges',
                desc: 'View and download your verified course credentials.',
                href: '/achievements',
                icon: Award,
                color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400'
              },
              {
                title: 'Campus Events',
                desc: 'Stay informed about upcoming hackathons and workshops.',
                href: '/search?category=events',
                icon: Calendar,
                color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-400'
              }
            ].map((card, i) => (
              <Link 
                key={i} 
                href={card.href}
                className="group p-6 rounded-2xl border border-slate-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-300 dark:hover:border-blue-800 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`p-3 rounded-xl w-fit ${card.color}`}>
                    <card.icon size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                  <span>Enter</span>
                  <ChevronRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Institutional Announcements & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Announcements */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Campus Announcements
              </h2>
              <span className="text-xs font-medium text-slate-400">Department News</span>
            </div>

            <div className="rounded-2xl border border-slate-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 divide-y divide-slate-100 dark:divide-neutral-800 shadow-2xs">
              {[
                {
                  title: 'Semester Registration Open for Academic Year 2026-27',
                  date: 'Today • Academic Office',
                  summary: 'Course registration for the upcoming semester is now open. Please complete your registration before the deadline.'
                },
                {
                  title: 'Annual Campus Hackathon Registration',
                  date: 'Yesterday • Department of CSE',
                  summary: 'Teams can now register for the 48-hour Annual Campus Hackathon. Great prizes and industry mentorship await.'
                },
                {
                  title: 'Library Extended Hours During Examination Week',
                  date: '2 Days Ago • Central Library',
                  summary: 'The central campus library will remain open 24/7 during the mid-semester examination week.'
                }
              ].map((item, i) => (
                <div key={i} className="p-5 space-y-1.5 hover:bg-slate-50 dark:hover:bg-neutral-800/40 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <Bell size={13} />
                    <span>{item.date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Academic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Academic Summary
            </h2>

            <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs space-y-4">
              <div className="space-y-1 pb-3 border-b border-slate-100 dark:border-neutral-800">
                <span className="text-xs text-slate-400 font-medium">Student Name</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.firstName || 'Athira'} {user?.lastName || ''}</p>
              </div>

              <div className="space-y-1 pb-3 border-b border-slate-100 dark:border-neutral-800">
                <span className="text-xs text-slate-400 font-medium">Department</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Computer Science & Engineering</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">Institution</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Amal Jyothi College of Engineering</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
