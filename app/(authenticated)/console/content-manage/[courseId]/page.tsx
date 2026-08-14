'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/infrastructure/http/api';
import { ArrowLeft, PlayCircle, FileText, ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/shared/utils/utils';
import { toast } from 'sonner';
import { TiptapContentView } from '@/domains/learning';

interface CourseAnalysis {
  enrolled: number;
  takenExam: number;
  completed: number;
  failed: number;
  reports: number;
}

// Reusing types roughly matching CourseRenderResponse
interface Lesson {
  id: string;
  title: string;
  body: string;
  position: number;
}

interface Module {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
}

interface CourseRenderResponse {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  status: string;
  modules: Module[];
}

export default function CourseDetailConsolePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;

  const [activeTab, setActiveTab] = useState<'analysis' | 'content'>('analysis');
  const [analysis, setAnalysis] = useState<CourseAnalysis | null>(null);
  const [courseRender, setCourseRender] = useState<CourseRenderResponse | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get<CourseAnalysis>(`/api/v1/console/content/courses/${courseId}/analysis`).catch(() => null),
      api.get<CourseRenderResponse>(`/api/courses/${courseId}/render`).catch(() => null)
    ]).then(([analysisData, renderData]) => {
      if (analysisData) setAnalysis(analysisData);
      if (renderData) {
        setCourseRender(renderData);
        if (renderData.modules.length > 0 && !selectedLesson) {
          setExpandedModules(new Set([renderData.modules[0].id]));
          if (renderData.modules[0].lessons.length > 0) {
            setSelectedLesson(renderData.modules[0].lessons[0]);
          }
        }
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    if (!courseId) return;
    loadData();
  }, [courseId]);

  const suspendCourse = () => {
    setIsSuspendModalOpen(true);
  };

  const submitSuspend = async () => {
    if (!suspendReason.trim()) {
      toast.error("Please enter a reason for suspension");
      return;
    }
    
    try {
      await api.post(`/api/v1/console/content/courses/${courseId}/suspend`, { reason: suspendReason.trim() });
      toast.success('Course suspended');
      setIsSuspendModalOpen(false);
      setSuspendReason('');
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Failed to suspend course');
    }
  };

  const unsuspendCourse = async () => {
    if (!confirm('Are you sure you want to unsuspend this course?')) return;
    try {
      await api.post(`/api/v1/console/content/courses/${courseId}/unsuspend`, {});
      toast.success('Course unsuspended');
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Failed to unsuspend course');
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const chartData = analysis ? [
    { name: 'Enrolled', count: analysis.enrolled },
    { name: 'Completed', count: analysis.completed },
    { name: 'Taken Exam', count: analysis.takenExam },
    { name: 'Failed', count: analysis.failed },
  ] : [];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="size-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  if (!analysis && !courseRender) {
    return (
      <div className="p-8">
        <button onClick={() => router.back()} className="mb-6 flex items-center text-slate-500 hover:text-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
        </button>
        <div className="rounded-xl bg-slate-50 p-12 text-center text-slate-500">
          Could not load course details.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col px-4 pt-2 pb-8 md:px-6 space-y-6">
      <header className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="flex shrink-0 items-center justify-center size-9 rounded-full bg-white border border-slate-200/80 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex items-center justify-between flex-1">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 truncate">
                {courseRender?.title || 'Course Details'}
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5 truncate flex items-center gap-2">
                ID: {courseId}
                {courseRender && (
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    courseRender.status === 'PUBLISHED' ? "bg-emerald-100 text-emerald-700" :
                    courseRender.status === 'SUSPENDED' ? "bg-rose-100 text-rose-700" :
                    "bg-slate-100 text-slate-700"
                  )}>
                    {courseRender.status}
                  </span>
                )}
              </p>
            </div>
            
            {courseRender && (
              <div className="shrink-0 ml-4">
                {courseRender.status === 'SUSPENDED' ? (
                  <button
                    onClick={unsuspendCourse}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Unsuspend
                  </button>
                ) : (
                  <button
                    onClick={suspendCourse}
                    className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                  >
                    <Activity className="h-4 w-4" />
                    Suspend
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('analysis')}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all",
              activeTab === 'analysis' 
                ? "bg-[#14142b] text-white shadow-sm" 
                : "bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 shadow-sm"
            )}
          >
            Analysis
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all",
              activeTab === 'content' 
                ? "bg-[#14142b] text-white shadow-sm" 
                : "bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 shadow-sm"
            )}
          >
            Course Content
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        {activeTab === 'analysis' && analysis && (
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Reports" value={analysis.reports} />
              <StatCard title="Completed" value={analysis.completed} />
              <StatCard title="Taken Exam" value={analysis.takenExam} />
              <StatCard title="Failed" value={analysis.failed} />
            </div>

            {analysis.reports > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
                <div className="flex items-center font-medium">
                  <Activity className="mr-2 h-5 w-5" /> Active Reports Detected
                </div>
                <p className="mt-1 text-sm text-red-600">This course has been reported by one or more users.</p>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-lg font-medium text-slate-900">Engagement Overview</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && courseRender && (
          <div className="mx-auto flex h-[calc(100vh-16rem)] max-w-6xl overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-md">
            {/* Sidebar */}
            <div className="flex w-80 flex-col border-r border-slate-100 bg-[#f8fafc]/50">
              <div className="border-b border-slate-200/60 bg-slate-50/80 p-5 backdrop-blur-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Curriculum</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {courseRender.modules.map(module => (
                  <div key={module.id} className="overflow-hidden rounded-xl border border-slate-200/50 bg-white shadow-sm transition-all">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="flex w-full items-center justify-between bg-white px-4 py-3.5 text-left hover:bg-slate-50"
                    >
                      <span className="font-semibold text-slate-800">{module.title}</span>
                      {expandedModules.has(module.id) ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                    
                    {expandedModules.has(module.id) && (
                      <div className="bg-slate-50/50 pb-2 pt-1 border-t border-slate-100">
                        {module.lessons.map(lesson => (
                          <button
                            key={lesson.id}
                            onClick={() => setSelectedLesson(lesson)}
                            className={cn(
                              "group flex w-full items-center px-5 py-2.5 text-left text-sm transition-colors",
                              selectedLesson?.id === lesson.id 
                                ? "bg-indigo-50/80 font-medium text-indigo-700 border-l-2 border-indigo-600" 
                                : "text-slate-600 hover:bg-white hover:text-slate-900 border-l-2 border-transparent"
                            )}
                          >
                            <FileText className={cn("mr-3 h-4 w-4 shrink-0 transition-colors", selectedLesson?.id === lesson.id ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-400")} />
                            <span className="truncate">{lesson.title}</span>
                          </button>
                        ))}
                        {module.lessons.length === 0 && (
                          <div className="px-5 py-3 text-xs text-slate-400 italic">No lessons in this module</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-white p-10 md:p-12 relative">
              {selectedLesson ? (
                <div className="mx-auto max-w-3xl">
                  <h2 className="mb-8 text-4xl font-extrabold tracking-tight text-slate-900">{selectedLesson.title}</h2>
                  {selectedLesson.body ? (
                    <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-indigo-600 prose-img:rounded-xl">
                      <TiptapContentView body={selectedLesson.body} />
                    </div>
                  ) : (
                    <div className="mt-12 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                      <FileText className="mx-auto mb-4 h-8 w-8 text-slate-300" />
                      <p className="text-slate-500 font-medium">This lesson has no content.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <PlayCircle className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">No Lesson Selected</h3>
                  <p className="mt-1 text-sm text-slate-500">Select a lesson from the sidebar to preview its content.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Suspend Modal Overlay */}
      {isSuspendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900">Suspend Course</h2>
              <p className="mt-2 text-sm text-slate-500">
                This course will be hidden from new learners. Existing learners may still be able to access it depending on platform policies.
              </p>
              
              <div className="mt-5">
                <label htmlFor="suspendReason" className="block text-sm font-medium text-slate-700">
                  Reason for Suspension
                </label>
                <textarea
                  id="suspendReason"
                  rows={4}
                  className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 resize-none outline-none"
                  placeholder="E.g. Inappropriate content, outdated material..."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 bg-slate-50 px-6 py-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsSuspendModalOpen(false);
                  setSuspendReason('');
                }}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitSuspend}
                className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 transition-colors"
              >
                Suspend Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
    </div>
  );
}
