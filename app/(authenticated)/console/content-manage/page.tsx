'use client';

import { useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';
import { api } from '@/infrastructure/http/api';
import { Play, Pause, Library, Search } from 'lucide-react';
import { cn } from '@/shared/utils/utils';

interface ConsoleCourse {
  id: string;
  title: string;
  authorName: string;
  status: string;
  enrollments: number;
}

export default function ContentManagePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'PUBLISHED' | 'SUSPENDED'>('PUBLISHED');
  const [courses, setCourses] = useState<ConsoleCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  if (!AuthorizationService.canReviewPlatformContent(user)) {
    notFound();
  }

  const loadCourses = () => {
    setLoading(true);
    api
      .get<ConsoleCourse[]>('/api/v1/console/content/courses')
      .then(setCourses)
      .catch((e) => setError(e.message || 'Failed to load courses'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const filteredCourses = courses.filter(c => {
    if (c.status !== activeTab) return false;
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return c.title.toLowerCase().includes(query) || 
           c.authorName.toLowerCase().includes(query);
  });

  return (
    <div className="flex w-full flex-col h-full space-y-5 pb-6">
      <div className="flex-none sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 rounded-full border border-slate-200/80 bg-white/80 p-1 pr-4 shadow-[0_4px_14px_rgba(20,20,43,0.04)] backdrop-blur-md">
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('PUBLISHED')}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all",
              activeTab === 'PUBLISHED' 
                ? "bg-[#14142b] text-white shadow-sm" 
                : "text-slate-500 hover:bg-slate-50 hover:text-[#14142b]"
            )}
          >
            <Library size={14} />
            Content Manage
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SUSPENDED')}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all",
              activeTab === 'SUSPENDED' 
                ? "bg-rose-600 text-white shadow-sm" 
                : "text-slate-500 hover:bg-rose-50 hover:text-rose-600"
            )}
          >
            <Pause size={14} />
            Suspended courses
          </button>
        </div>
        
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by course, author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-64 rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-2 relative">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {error && (
            <div className="p-4 text-sm font-medium text-red-600 bg-red-50 border-b border-red-100 rounded-t-2xl">
              {error}
            </div>
          )}
          
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="tracking-wider border-b border-slate-200 bg-slate-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-500">Course</th>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-500">Author</th>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-500">Enrollments</th>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-500">Status</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading courses...</td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No courses found.</td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr 
                    key={course.id} 
                    className="transition-colors hover:bg-slate-50/50 cursor-pointer"
                    onClick={() => router.push(`/console/content-manage/${course.id}`)}
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">{course.title}</td>
                    <td className="px-6 py-4 text-slate-600">{course.authorName}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{course.enrollments.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        course.status === 'PUBLISHED' ? "bg-emerald-100 text-emerald-700" :
                        course.status === 'SUSPENDED' ? "bg-rose-100 text-rose-700" :
                        "bg-slate-100 text-slate-700"
                      )}>
                        {course.status}
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
