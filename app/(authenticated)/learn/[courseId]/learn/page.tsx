'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/infrastructure/http/api';
import type { CourseResponse, LessonResponse } from '@/shared/types/api.types';
import { BookOpen, ChevronLeft, PlayCircle, FileText } from 'lucide-react';
import { TiptapContentView } from "@/domains/learning";
import Link from 'next/link';

export default function CourseLearnPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<LessonResponse | null>(null);

  useEffect(() => {
    if (params?.courseId) {
      api.get<CourseResponse>(`/api/v1/public/courses/${params.courseId}`)
        .then((data) => {
          setCourse(data);
          // Auto-select first lesson if available
          if (data.modules && data.modules.length > 0 && data.modules[0].lessons && data.modules[0].lessons.length > 0) {
            setSelectedLesson(data.modules[0].lessons[0]);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [params?.courseId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-black">
        <div className="size-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-400" />
      </main>
    );
  }

  if (!course) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-black text-slate-800 dark:text-white">
        <h2 className="mb-2 text-xl font-bold">Course not found</h2>
        <p className="mb-6 text-slate-500 dark:text-slate-400">The course you are looking for does not exist or you do not have access.</p>
        <button onClick={() => router.back()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
          Go Back
        </button>
      </main>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-slate-50 dark:bg-neutral-950 md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full shrink-0 border-r border-slate-200 dark:border-neutral-800 bg-white dark:bg-black md:w-80 md:flex-col md:h-[calc(100vh-4rem)] md:sticky md:top-16 overflow-y-auto">
        <div className="p-4 border-b border-slate-200 dark:border-neutral-800">
          <Link href="/my-learning" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white transition-colors">
            <ChevronLeft size={16} /> Back to My Learning
          </Link>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight line-clamp-2">{course.title}</h2>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20">
              <BookOpen size={12} /> Notes Mode
            </span>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {course.modules.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-neutral-500 italic">No modules available yet.</p>
          ) : (
            course.modules.map((mod, modIdx) => (
              <div key={mod.id} className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-500">
                  Module {modIdx + 1}: {mod.title}
                </h3>
                <div className="flex flex-col gap-1">
                  {mod.lessons.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-neutral-600 pl-2">No lessons</p>
                  ) : (
                    mod.lessons.map((lesson, lessonIdx) => {
                      const isSelected = selectedLesson?.id === lesson.id;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson)}
                          className={`flex items-start gap-3 rounded-xl p-3 text-left transition-all ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20'
                              : 'hover:bg-slate-100 dark:hover:bg-neutral-900 border border-transparent'
                          }`}
                        >
                          <span className={`mt-0.5 shrink-0 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-neutral-500'}`}>
                            {lesson.body ? <FileText size={16} /> : <PlayCircle size={16} />}
                          </span>
                          <div>
                            <span className={`block text-sm font-medium ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-neutral-300'}`}>
                              {lessonIdx + 1}. {lesson.title}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-50 dark:bg-neutral-950 p-6 md:p-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-sm md:p-12">
          {selectedLesson ? (
            <div className="space-y-8">
              <header className="border-b border-slate-100 dark:border-neutral-800 pb-6">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{selectedLesson.title}</h1>
              </header>
              <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-indigo-600 hover:prose-a:text-indigo-500 dark:prose-a:text-indigo-400">
                {selectedLesson.body ? (
                  <TiptapContentView body={selectedLesson.body} />
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 p-8 text-center text-slate-500 dark:text-neutral-400">
                    <p className="mb-2 text-lg font-medium">Empty Lesson</p>
                    <p className="text-sm">This lesson does not have any content yet.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center text-slate-500 dark:text-neutral-400">
              <BookOpen size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a lesson to begin</p>
              <p className="text-sm">Choose a lesson from the sidebar to view its content.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
