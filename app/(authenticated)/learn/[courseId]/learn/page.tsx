'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/infrastructure/http/api';
import type { CourseResponse, LessonResponse } from '@/shared/types/api.types';
import { BookOpen, ChevronLeft, ChevronRight, PlayCircle, FileText, Check, CheckCircle2 } from 'lucide-react';
import { TiptapContentView, courseProgressService, type CourseProgress } from "@/domains/learning";
import Link from 'next/link';
import { toast } from 'sonner';

export default function CourseLearnPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<LessonResponse | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [marking, setMarking] = useState(false);

  const courseId = params?.courseId as string | undefined;

  useEffect(() => {
    if (courseId) {
      api.get<CourseResponse>(`/api/v1/public/courses/${courseId}`)
        .then((data) => {
          setCourse(data);
          // Auto-select first lesson if available
          if (data.modules && data.modules.length > 0 && data.modules[0].lessons && data.modules[0].lessons.length > 0) {
            setSelectedLesson(data.modules[0].lessons[0]);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));

      courseProgressService.getCourseProgress(courseId)
        .then(setProgress)
        .catch(() => setProgress(null));
    } else {
      setLoading(false);
    }
  }, [courseId]);

  const orderedLessons = useMemo(
    () => course?.modules.flatMap((mod) => mod.lessons) ?? [],
    [course]
  );

  const currentLessonIndex = selectedLesson
    ? orderedLessons.findIndex((lesson) => lesson.id === selectedLesson.id)
    : -1;
  const previousLesson = currentLessonIndex > 0 ? orderedLessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < orderedLessons.length - 1
      ? orderedLessons[currentLessonIndex + 1]
      : null;
  const isLastLesson = currentLessonIndex >= 0 && currentLessonIndex === orderedLessons.length - 1;

  const isLessonComplete = (lessonId: string) =>
    progress?.completedLessonIds.includes(lessonId) ?? false;

  const markComplete = async (): Promise<CourseProgress | null> => {
    if (!courseId || !selectedLesson) return null;
    if (isLessonComplete(selectedLesson.id)) return progress;
    const previousStatus = progress?.enrollmentStatus;
    const updated = await courseProgressService.markLessonComplete(courseId, selectedLesson.id);
    setProgress(updated);
    if (previousStatus !== 'COMPLETED' && updated.enrollmentStatus === 'COMPLETED') {
      toast.success('Course completed! 🎉');
    }
    return updated;
  };

  const handleMarkComplete = async () => {
    if (!courseId || !selectedLesson) return;
    setMarking(true);
    try {
      await markComplete();
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
      toast.error('Could not update progress.');
    } finally {
      setMarking(false);
    }
  };

  /** Coursera-style: mark current complete, then advance to the next lesson. */
  const handleNext = async () => {
    if (!selectedLesson) return;
    setMarking(true);
    try {
      await markComplete();
      if (nextLesson) {
        setSelectedLesson(nextLesson);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Failed to advance to next lesson:', err);
      toast.error('Could not update progress.');
    } finally {
      setMarking(false);
    }
  };

  const handlePrevious = () => {
    if (!previousLesson) return;
    setSelectedLesson(previousLesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            {progress?.enrollmentStatus === 'COMPLETED' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20">
                <CheckCircle2 size={12} /> Completed
              </span>
            )}
          </div>
          {progress && progress.totalLessons > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-neutral-500">
                <span>{progress.completedLessons}/{progress.totalLessons} lessons</span>
                <span>{progress.percent}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800">
                <div
                  className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}
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
                      const isComplete = isLessonComplete(lesson.id);
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
                            {isComplete ? (
                              <CheckCircle2 size={16} className="text-emerald-500" />
                            ) : lesson.body ? (
                              <FileText size={16} />
                            ) : (
                              <PlayCircle size={16} />
                            )}
                          </span>
                          <div>
                            <span className={`block text-sm font-medium ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-neutral-300'} ${isComplete ? 'line-through decoration-1 opacity-70' : ''}`}>
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
              <header className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-neutral-800 pb-6">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{selectedLesson.title}</h1>
                <button
                  onClick={handleMarkComplete}
                  disabled={marking || isLessonComplete(selectedLesson.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    isLessonComplete(selectedLesson.id)
                      ? 'cursor-default bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60'
                  }`}
                >
                  <Check size={16} />
                  {isLessonComplete(selectedLesson.id) ? 'Completed' : marking ? 'Marking...' : 'Mark complete'}
                </button>
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

              {/* Coursera-style lesson navigation footer */}
              <footer className="flex flex-col gap-3 border-t border-slate-100 dark:border-neutral-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={!previousLesson}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-neutral-200 transition-colors hover:bg-slate-50 dark:hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                  <span className="text-left">
                    <span className="block text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-neutral-500">
                      Previous
                    </span>
                    <span className="line-clamp-1 max-w-[12rem]">
                      {previousLesson?.title ?? '—'}
                    </span>
                  </span>
                </button>

                {nextLesson ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={marking}
                    className="inline-flex items-center justify-between gap-3 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-60 active:scale-[0.98] sm:min-w-[14rem]"
                  >
                    <span className="text-left">
                      <span className="block text-[11px] font-medium uppercase tracking-wide text-indigo-200">
                        {isLessonComplete(selectedLesson.id) ? 'Next' : 'Complete & next'}
                      </span>
                      <span className="line-clamp-1 max-w-[12rem]">{nextLesson.title}</span>
                    </span>
                    <ChevronRight size={20} />
                  </button>
                ) : isLastLesson ? (
                  isLessonComplete(selectedLesson.id) ? (
                    <Link
                      href="/my-learning"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] sm:min-w-[14rem]"
                    >
                      <CheckCircle2 size={18} />
                      Back to My Courses
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={marking}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-60 active:scale-[0.98] sm:min-w-[14rem]"
                    >
                      <Check size={18} />
                      {marking ? 'Completing...' : 'Complete lesson'}
                    </button>
                  )
                ) : null}
              </footer>
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
