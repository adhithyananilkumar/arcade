'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/infrastructure/http/api';
import type { CourseResponse, LessonResponse } from '@/shared/types/api.types';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  Flag,
  MoreVertical,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/design-system/ui/dialog';
import { TiptapContentView, courseProgressService, type CourseProgress } from '@/domains/learning';
import Link from 'next/link';
import { toast } from 'sonner';
import { ReportModal } from '@/shared/design-system/ui/ReportModal';

export default function CourseLearnPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonParam = searchParams?.get('lesson');
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<LessonResponse | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [marking, setMarking] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportNote, setReportNote] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [activeMenuLessonId, setActiveMenuLessonId] = useState<string | null>(null);
  const [reportingContext, setReportingContext] = useState<{
    moduleId: string;
    moduleTitle: string;
    lessonId: string;
    lessonTitle: string;
  } | null>(null);

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'ai' | 'user'; content: string }[]>([
    { role: 'ai', content: "Hi! I'm your AI tutor.\n\nAsk me anything about this lesson." }
  ]);

  const courseId = params?.courseId as string | undefined;

  const handleReportSubmit = async (combinedNote: string) => {
    if (!courseId || !reportingContext) return;
    await api.post('/api/v1/reports', {
      contentId: courseId,
      contentType: 'LESSON',
      moduleId: reportingContext.moduleId,
      moduleTitle: reportingContext.moduleTitle,
      lessonId: reportingContext.lessonId,
      lessonTitle: reportingContext.lessonTitle,
      note: combinedNote,
    });
    toast.success('Report submitted successfully. Thank you!');
    setReportingContext(null);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');

    setTimeout(() => {
      let aiResponse = "I'm a dummy assistant, so I can only answer a few specific questions right now!";
      const lower = userMessage.toLowerCase();
      
      if (lower.includes("what is java")) {
        aiResponse = "Java is a high-level, object-oriented programming language designed to be portable across different platforms.";
      } else if (lower.includes("why is java popular")) {
        aiResponse = "Java is popular because of its portability, object-oriented design, large ecosystem, strong community, and widespread use in enterprise applications.";
      } else if (lower.includes("explain this lesson") || lower.includes("explain the lesson") || lower.includes("what is this lesson about")) {
        aiResponse = "This lesson introduces Java and explains why it became one of the most widely used programming languages.";
      }

      setChatMessages((prev) => [...prev, { role: 'ai', content: aiResponse }]);
    }, 500);
  };

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    Promise.all([
      api.get<CourseResponse>(`/api/v1/public/courses/${courseId}`),
      courseProgressService.getCourseProgress(courseId).catch(() => null),
    ])
      .then(([courseData, progressData]) => {
        if (!isMounted) return;
        setCourse(courseData);
        setProgress(progressData);

        if (courseData.modules && courseData.modules.length > 0) {
          const allLessons = courseData.modules.flatMap((m) => m.lessons || []);
          
          if (lessonParam) {
            const targetLesson = allLessons.find((l) => l.id === lessonParam);
            if (targetLesson) {
              setSelectedLesson(targetLesson);
              return;
            }
          }
          
          if (progressData) {
            const completedIds = new Set(progressData.completedLessonIds || []);
            const firstIncomplete = allLessons.find((l) => !completedIds.has(l.id));
            if (firstIncomplete) {
              setSelectedLesson(firstIncomplete);
            } else {
              setSelectedLesson(null);
            }
          } else if (allLessons.length > 0) {
            setSelectedLesson(allLessons[0]);
          }
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const orderedLessons = useMemo(
    () => course?.modules.flatMap((mod) => mod.lessons) ?? [],
    [course],
  );

  const lessonNumberById = useMemo(() => {
    const map = new Map<string, number>();
    let n = 0;
    course?.modules.forEach((mod) => {
      mod.lessons.forEach((lesson) => {
        n += 1;
        map.set(lesson.id, n);
      });
    });
    return map;
  }, [course]);

  const currentLessonIndex = selectedLesson
    ? orderedLessons.findIndex((lesson) => lesson.id === selectedLesson.id)
    : -1;
  const previousLesson = currentLessonIndex > 0 ? orderedLessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < orderedLessons.length - 1
      ? orderedLessons[currentLessonIndex + 1]
      : null;
  const isLastLesson =
    currentLessonIndex >= 0 && currentLessonIndex === orderedLessons.length - 1;

  const isLessonComplete = (lessonId: string) =>
    progress?.completedLessonIds.includes(lessonId) ?? false;

  const markComplete = async (): Promise<CourseProgress | null> => {
    if (!courseId || !selectedLesson) return null;
    if (isLessonComplete(selectedLesson.id)) return progress;
    const previousStatus = progress?.enrollmentStatus;
    const updated = await courseProgressService.markLessonComplete(courseId, selectedLesson.id);
    setProgress(updated);
    if (previousStatus !== 'COMPLETED' && updated.enrollmentStatus === 'COMPLETED') {
      toast.success('Course completed!');
    }
    return updated;
  };

  const handleNext = async () => {
    if (!selectedLesson) return;
    setMarking(true);
    try {
      const updatedProgress = await markComplete();
      
      const completedIds = new Set(updatedProgress?.completedLessonIds || []);
      const nextIncomplete = orderedLessons.find((l) => !completedIds.has(l.id));
      
      if (nextIncomplete) {
        setSelectedLesson(nextIncomplete);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSelectedLesson(null);
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
      <main
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 40%, #FFFFFF 100%)' }}
      >
        <div className="size-8 animate-spin rounded-full border-2 border-[#14142b] border-t-transparent" />
      </main>
    );
  }

  if (!course) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center px-4 text-[#14142b]"
        style={{ background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 40%, #FFFFFF 100%)' }}
      >
        <h2 className="mb-2 text-xl font-bold">Course not found</h2>
        <p className="mb-6 text-sm font-medium text-slate-500">
          This course does not exist or you do not have access.
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full bg-[#14142b] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#232735]"
        >
          Go back
        </button>
      </main>
    );
  }

  const lessonDone = selectedLesson ? isLessonComplete(selectedLesson.id) : false;

  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 35%, #FFFFFF 70%)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[320px]"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 45% 40% at 8% 20%, rgba(255,107,74,0.1) 0%, transparent 55%), radial-gradient(ellipse 40% 35% at 92% 10%, rgba(20,20,43,0.06) 0%, transparent 50%)',
        }}
      />

      {/* Clear floating navbar */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1700px] px-4 xl:px-8 flex-col pt-28 md:flex-row md:pt-32">
        {/* Sidebar */}
        <aside className="flex w-full shrink-0 flex-col border-b border-slate-200/70 md:sticky md:top-32 md:h-[calc(100vh-8.5rem)] md:w-[260px] md:border-b-0 md:border-r md:border-slate-200/70 lg:w-[280px]">
          <div className="space-y-2.5 pl-3 pr-4 pb-2 md:pl-3 md:pr-5">
            <Link
              href="/my-learning"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-400 transition-colors hover:text-[#14142b]"
            >
              <ChevronLeft size={14} />
              My Learning
            </Link>

            <div>
              <h2 className="text-[17px] font-bold leading-snug tracking-tight text-[#14142b] line-clamp-2">
                {course.title}
              </h2>
              {progress?.enrollmentStatus === 'COMPLETED' && (
                <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 size={12} />
                  Course completed
                </p>
              )}
            </div>

            {progress && progress.totalLessons > 0 && (
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>
                    {progress.completedLessons} of {progress.totalLessons}
                  </span>
                  <span className="tabular-nums text-[#14142b]">{progress.percent}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                  <div
                    className="h-full rounded-full bg-[#FF6B4A] transition-all duration-500"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-3 overflow-y-auto pl-3 pr-4 pb-6 md:pl-3 md:pr-5">
            {course.modules.length === 0 ? (
              <p className="text-sm text-slate-400">No modules yet.</p>
            ) : (
              course.modules.map((mod, modIdx) => (
                <div key={mod.id}>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {mod.title?.trim() ? mod.title : `Module ${modIdx + 1}`}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {mod.lessons.map((lesson) => {
                      const num = lessonNumberById.get(lesson.id) ?? 0;
                      const isSelected = selectedLesson?.id === lesson.id;
                      const isComplete = isLessonComplete(lesson.id);
                      return (
                        <li key={lesson.id} className="relative group/item">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedLesson(lesson)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedLesson(lesson);
                              }
                            }}
                            className={`group/btn flex w-full cursor-pointer items-center gap-2.5 rounded-full px-2 py-2 min-h-[48px] text-left transition-all duration-300 border outline-none ${
                              isSelected
                                ? 'border-indigo-300/70 bg-[linear-gradient(120deg,#c7d2fe_0%,#a5b4fc_55%,#c4b5fd_100%)] text-[#14142b] shadow-[0_8px_16px_rgba(49,94,232,0.16)]'
                                : `border-transparent hover:-translate-y-[1px] hover:border-indigo-200 hover:bg-[linear-gradient(120deg,#e0e7ff_0%,#c7d2fe_55%,#ddd6fe_100%)] hover:text-[#14142b] hover:shadow-[0_6px_12px_rgba(49,94,232,0.08)] focus-visible:-translate-y-[1px] focus-visible:border-indigo-200 focus-visible:bg-[linear-gradient(120deg,#e0e7ff_0%,#c7d2fe_55%,#ddd6fe_100%)] focus-visible:text-[#14142b] focus-visible:shadow-[0_6px_12px_rgba(49,94,232,0.08)] ${
                                    isComplete
                                      ? 'bg-white/30 text-slate-500 backdrop-blur-[8px]'
                                      : 'bg-transparent text-slate-600'
                                  }`
                            }`}
                          >
                            <span
                              className={`grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-bold tabular-nums transition-all duration-300 ${
                                isSelected
                                  ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100/50'
                                  : `group-hover/btn:bg-white group-hover/btn:text-indigo-500 group-hover/btn:shadow-sm group-hover/btn:border group-hover/btn:border-indigo-50 group-focus-visible/btn:bg-white group-focus-visible/btn:text-indigo-500 group-focus-visible/btn:shadow-sm group-focus-visible/btn:border group-focus-visible/btn:border-indigo-50 ${
                                      isComplete ? 'bg-slate-200/50 text-slate-400 opacity-70 blur-[0.4px] group-hover/btn:opacity-100 group-hover/btn:blur-none group-focus-visible/btn:opacity-100 group-focus-visible/btn:blur-none' : 'bg-slate-100 text-slate-500'
                                    }`
                              }`}
                            >
                              {num}
                            </span>
                            <span
                              className={`min-w-0 flex-1 truncate text-[13px] font-semibold transition-all duration-300 ${
                                isComplete && !isSelected ? 'text-slate-500/90 opacity-70 blur-[0.4px] group-hover/btn:text-[#14142b] group-hover/btn:opacity-100 group-hover/btn:blur-none group-focus-visible/btn:text-[#14142b] group-focus-visible/btn:opacity-100 group-focus-visible/btn:blur-none' : ''
                              }`}
                            >
                              {lesson.title}
                            </span>

                            <div className="relative shrink-0 flex items-center">
                              {isComplete && (
                                <div
                                  className={`pr-1.5 flex items-center justify-center ${
                                    isSelected ? 'text-indigo-700/80' : 'text-[#111111]'
                                  }`}
                                >
                                  <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M8 12l2.5 2.5 5.5-5.5" />
                                  </svg>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuLessonId(activeMenuLessonId === lesson.id ? null : lesson.id);
                                }}
                                onKeyDown={(e) => {
                                  e.stopPropagation();
                                }}
                                className={`p-1 rounded-full transition-all duration-200 ${
                                  activeMenuLessonId === lesson.id
                                    ? 'opacity-100 bg-indigo-100 text-indigo-700'
                                    : isSelected
                                      ? 'opacity-0 group-hover/item:opacity-100 text-indigo-300 hover:text-indigo-700 hover:bg-indigo-100/70'
                                      : 'opacity-0 group-hover/item:opacity-100 text-slate-400 group-hover/btn:text-indigo-300 group-hover/btn:hover:text-indigo-700 group-hover/btn:hover:bg-indigo-50 hover:text-slate-800 hover:bg-slate-200/70'
                                }`}
                                title="Lesson options"
                              >
                                <MoreVertical size={14} />
                              </button>

                              {activeMenuLessonId === lesson.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-30"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuLessonId(null);
                                    }}
                                  />
                                  <div className="absolute right-0 top-full mt-1 z-40 w-32 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuLessonId(null);
                                        setReportingContext({
                                          moduleId: mod.id,
                                          moduleTitle: mod.title?.trim() ? mod.title : `Module ${modIdx + 1}`,
                                          lessonId: lesson.id,
                                          lessonTitle: lesson.title,
                                        });
                                        setReportModalOpen(true);
                                      }}
                                      onKeyDown={(e) => {
                                        e.stopPropagation();
                                      }}
                                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600"
                                    >
                                      <Flag size={13} />
                                      <span>Report</span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </nav>
        </aside>

        {/* Lesson canvas — centered & wide */}
        <main className="relative flex min-w-0 flex-1 justify-center px-4 py-6 sm:px-8 md:py-8 lg:px-12 transition-all duration-300">
          <article className="relative flex w-full max-w-[1100px] flex-col">
            {selectedLesson ? (
              <>
                <header className="mb-6 flex flex-wrap items-start justify-between gap-4 md:mb-8">
                  <div className="flex-1 min-w-[200px]">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Lesson {currentLessonIndex + 1}
                      {orderedLessons.length > 0 ? ` · ${orderedLessons.length}` : ''}
                    </p>
                    <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-[#14142b] md:text-[2.15rem]">
                      {selectedLesson.title}
                    </h1>
                    {lessonDone && (
                      <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600">
                        <CheckCircle2 size={14} />
                        Completed
                      </p>
                    )}
                  </div>
                  
                  {!isChatOpen && (
                    <div className="shrink-0 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsChatOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-[13px] font-bold text-indigo-700 transition-all hover:bg-indigo-100 hover:text-indigo-800 hover:shadow-sm"
                      >
                        <span className="text-lg leading-none text-indigo-600">✦</span> Ask AI
                      </button>
                    </div>
                  )}
                </header>

                <div className="min-h-[42vh] flex-1 w-full py-4">
                  <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-[#14142b] prose-a:text-[#FF6B4A] hover:prose-a:text-[#D94F32] prose-p:text-slate-700">
                    {selectedLesson.body ? (
                      <TiptapContentView body={selectedLesson.body} />
                    ) : (
                      <div className="rounded-lg border border-dashed border-slate-300/60 bg-transparent px-6 py-14 text-center">
                        <BookOpen size={36} className="mx-auto mb-3 text-slate-400" />
                        <p className="text-[15px] font-semibold text-[#14142b]">No content yet</p>
                        <p className="mt-1 text-sm text-slate-500">
                          This lesson does not have material published.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom actions only — hide absent prev/next */}
                <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-5 pb-10">
                  <div>
                    {previousLesson && (
                      <button
                        type="button"
                        onClick={handlePrevious}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2.5 text-[13px] font-semibold text-[#14142b] transition-colors hover:border-slate-300 hover:bg-white"
                      >
                        <ChevronLeft size={16} />
                        Previous
                      </button>
                    )}
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    {nextLesson ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={marking}
                        className="inline-flex items-center gap-2 rounded-full bg-[#14142b] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(20,20,43,0.18)] transition-colors hover:bg-[#232735] disabled:opacity-60"
                      >
                        {marking
                          ? 'Saving…'
                          : lessonDone
                            ? 'Next lesson'
                            : 'Complete & next'}
                        <ChevronRight size={16} />
                      </button>
                    ) : isLastLesson ? (
                      lessonDone ? (
                        <Link
                          href="/my-learning"
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(5,150,105,0.22)] transition-colors hover:bg-emerald-700"
                        >
                          <CheckCircle2 size={16} />
                          Back to My Learning
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={handleNext}
                          disabled={marking}
                          className="inline-flex items-center gap-2 rounded-full bg-[#FF6B4A] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(255,107,74,0.28)] transition-colors hover:bg-[#E85A3C] disabled:opacity-60"
                        >
                          <Check size={16} />
                          {marking ? 'Saving…' : 'Complete lesson'}
                        </button>
                      )
                    ) : null}
                  </div>
                </footer>
              </>
            ) : progress?.enrollmentStatus === 'COMPLETED' || (progress && progress.totalLessons > 0 && progress.completedLessons === progress.totalLessons) ? (
              <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-6 grid size-20 place-items-center rounded-full bg-emerald-100/50">
                  <CheckCircle2 size={40} className="text-emerald-600" />
                </div>
                <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-[#14142b] md:text-[2.15rem]">
                  Course Completed!
                </h1>
                <p className="mt-3 max-w-md text-[15px] text-slate-500">
                  Congratulations on finishing {course.title}. You can review any lesson by clicking on it in the sidebar.
                </p>
                <Link
                  href="/my-learning"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#14142b] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(20,20,43,0.18)] transition-colors hover:bg-[#232735]"
                >
                  <ChevronLeft size={16} />
                  Back to My Learning
                </Link>
              </div>
            ) : (
              <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
                <BookOpen size={40} className="mb-3 text-slate-400/50" />
                <p className="text-lg font-bold text-[#14142b]">Pick a lesson</p>
                <p className="mt-1 text-sm text-slate-500">Choose one from the sidebar to start.</p>
              </div>
            )}
          </article>
        </main>

        {/* AI Layout Column */}
        <aside
          className={`shrink-0 flex-col overflow-hidden transition-all duration-300 ease-in-out md:sticky md:top-32 md:h-[calc(100vh-8.5rem)] ${
            isChatOpen
              ? 'w-full md:w-[300px] lg:w-[320px] opacity-100'
              : 'w-0 opacity-0'
          } flex`}
        >
          <div className="flex h-full w-full md:w-[300px] lg:w-[320px] flex-col rounded-3xl border border-white/60 bg-[linear-gradient(145deg,rgba(224,231,255,0.65)_0%,rgba(199,210,254,0.6)_50%,rgba(221,214,254,0.6)_100%)] shadow-[0_8px_32px_rgba(31,38,135,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-2xl backdrop-saturate-150">
            <div className="flex items-center justify-between border-b border-white/30 bg-white/10 px-5 py-4 rounded-t-3xl">
              <div>
                <h3 className="flex items-center gap-1.5 text-[15px] font-bold text-[#14142b]">
                  <span className="text-indigo-600">✦</span> AI Learning Assistant
                </h3>
                <p className="text-[12px] font-semibold text-slate-500 truncate">
                  {course?.title || 'Loading course...'}
                </p>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="shrink-0 rounded-full p-2 text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-[14px]">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'rounded-tr-sm bg-[#14142b] text-white shadow-sm'
                        : 'rounded-tl-sm border border-white/50 bg-white/45 text-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.03)] backdrop-blur-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleChatSubmit} className="border-t border-white/20 p-4">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about this lesson..."
                className="w-full rounded-full border border-white/50 bg-white/40 px-5 py-3 text-[14px] placeholder-slate-500 shadow-[0_2px_8px_rgba(0,0,0,0.04)] outline-none backdrop-blur-md transition-colors focus:border-indigo-300/80 focus:bg-white/60"
              />
            </form>
          </div>
        </aside>
      </div>

      {/* Report Lesson Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setReportingContext(null);
        }}
        onSubmit={handleReportSubmit}
        title={
          reportingContext?.lessonTitle
            ? `Report: ${reportingContext.lessonTitle}`
            : 'Report Course'
        }
        description={
          reportingContext?.lessonTitle
            ? `Help us understand what is wrong with "${reportingContext.lessonTitle}".`
            : 'Help us understand what is wrong with this course.'
        }
        contentType={reportingContext?.lessonTitle ? 'LESSON' : 'COURSE'}
      />
    </div>
  );
}
