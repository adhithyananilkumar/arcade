'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/infrastructure/http/api';
import type {
  AssessmentNodeResponse,
  CourseResponse,
  LessonResponse,
  ModuleResponse,
} from '@/shared/types/api.types';
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  FileText,
  GraduationCap,
  MoreVertical,
  NotebookPen,
  Sparkles,
  Star,
  RotateCcw,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/design-system/ui/dialog';
import {
  TiptapContentView,
  courseProgressService,
  useLessonEngagementTracker,
  type CourseProgress,
  courseReviewService,
} from '@/domains/learning';
import { toast } from 'sonner';
import { ReportModal } from '@/shared/design-system/ui/ReportModal';
import { AssessmentLandingPane } from './AssessmentLandingPane';
import { NotesEditor } from './NotesEditor';

export type PlayerItem =
  | { kind: 'lesson'; id: string; moduleId: string; position: number; lesson: LessonResponse }
  | {
      kind: 'assessment';
      id: string;
      moduleId: string;
      position: number;
      assessment: AssessmentNodeResponse;
    };

export function itemsForModule(mod: ModuleResponse): PlayerItem[] {
  const lessons: PlayerItem[] = (mod.lessons ?? []).map((lesson) => ({
    kind: 'lesson',
    id: lesson.id,
    moduleId: mod.id,
    position: lesson.position,
    lesson,
  }));
  const assessments: PlayerItem[] = (mod.assessments ?? []).map((assessment) => ({
    kind: 'assessment',
    id: assessment.placementId,
    moduleId: mod.id,
    position: assessment.position,
    assessment,
  }));
  return [...lessons, ...assessments].sort(
    (a, b) => a.position - b.position || a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id)
  );
}

export function createEphemeralProgress(
  completedLessonIds: string[],
  totalLessons: number = 1,
): CourseProgress {
  const isComplete = totalLessons > 0 && completedLessonIds.length >= totalLessons;
  return {
    completedLessons: completedLessonIds.length,
    totalLessons: Math.max(1, totalLessons),
    percent: totalLessons > 0 ? Math.round((completedLessonIds.length / totalLessons) * 100) : 0,
    completedLessonIds,
    enrollmentStatus: isComplete ? 'COMPLETED' : 'ACTIVE',
  };
}

export interface CoursePlayerProps {
  courseId?: string;
  isPreview?: boolean;
  onExitPreview?: () => void;
}

export function CoursePlayer({
  courseId,
  isPreview = false,
  onExitPreview,
}: CoursePlayerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonParam = searchParams?.get('lesson');
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PlayerItem | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [marking, setMarking] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [activeMenuLessonId, setActiveMenuLessonId] = useState<string | null>(null);
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});
  const toggleModule = (moduleId: string) =>
    setCollapsedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  const [rightPanelTab, setRightPanelTab] = useState<'notes' | 'ai'>('notes');
  const [notesDraft, setNotesDraft] = useState('');
  const [rightPanelWidth, setRightPanelWidth] = useState(380);
  const [isDesktopViewport, setIsDesktopViewport] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches,
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const previewStorageKey = courseId ? `preview_course_progress_${courseId}` : null;

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktopViewport(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const handleRightPanelResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightPanelWidth;
    const onMove = (moveEvent: PointerEvent) => {
      const next = Math.min(640, Math.max(280, startWidth + (startX - moveEvent.clientX)));
      setRightPanelWidth(next);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const [reportingContext, setReportingContext] = useState<{
    moduleId: string;
    moduleTitle: string;
    lessonId: string;
    lessonTitle: string;
  } | null>(null);

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const handleFeedbackSubmit = async () => {
    if (!courseId || feedbackRating < 1) {
      setFeedbackModalOpen(false);
      if (!isPreview) router.push('/learning');
      return;
    }

    if (isPreview) {
      toast.success('Thank you for rating! (Preview mode - not saved)');
      setFeedbackModalOpen(false);
      return;
    }

    setSubmittingFeedback(true);
    try {
      const text = feedbackText.trim();
      await courseReviewService.submit(courseId, {
        rating: feedbackRating,
        reviewText: text.length > 0 ? text : undefined,
      });
      toast.success('Thank you for your feedback!');
      setFeedbackModalOpen(false);
      router.push('/learning');
    } catch {
      toast.error('Could not submit your feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleFeedbackSkip = () => {
    setFeedbackModalOpen(false);
    if (!isPreview) {
      router.push('/learning');
    }
  };

  const handleReportSubmit = async (combinedNote: string) => {
    if (!courseId || !reportingContext) return;
    if (isPreview) {
      toast.success('Report simulated successfully (preview mode).');
      setReportingContext(null);
      return;
    }
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

  useEffect(() => {
    if (courseId) {
      const endpoint = isPreview
        ? `/api/courses/${courseId}`
        : `/api/v1/public/courses/${courseId}`;
      api
        .get<CourseResponse>(endpoint)
        .then((data) => {
          setCourse(data);
          if (data.modules && data.modules.length > 0) {
            const items = data.modules.flatMap(itemsForModule);
            const target = lessonParam
              ? items.find((i) => i.kind === 'lesson' && i.id === lessonParam)
              : null;
            setSelectedItem(target ?? items[0] ?? null);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));

      if (isPreview) {
        if (typeof window !== 'undefined' && previewStorageKey) {
          const stored = sessionStorage.getItem(previewStorageKey);
          if (stored) {
            try {
              setProgress(JSON.parse(stored));
            } catch {
              setProgress(createEphemeralProgress([]));
            }
          } else {
            setProgress(createEphemeralProgress([]));
          }
        }
      } else {
        courseProgressService
          .getCourseProgress(courseId)
          .then(setProgress)
          .catch(() => setProgress(null));
      }
    } else {
      setLoading(false);
    }
  }, [courseId, lessonParam, isPreview, previewStorageKey]);

  const selectedLesson = selectedItem?.kind === 'lesson' ? selectedItem.lesson : null;

  useLessonEngagementTracker({
    courseId,
    lessonId: selectedLesson?.id,
    enabled: Boolean(courseId && selectedLesson?.id && !loading && !isPreview),
  });

  const orderedItems = useMemo(
    () => course?.modules.flatMap(itemsForModule) ?? [],
    [course],
  );

  const currentIndex = selectedItem
    ? orderedItems.findIndex((item) => item.id === selectedItem.id)
    : -1;
  const previousItem = currentIndex > 0 ? orderedItems[currentIndex - 1] : null;
  const nextItem =
    currentIndex >= 0 && currentIndex < orderedItems.length - 1
      ? orderedItems[currentIndex + 1]
      : null;
  const isLastItem = currentIndex >= 0 && currentIndex === orderedItems.length - 1;

  const isLessonComplete = (lessonId: string) =>
    progress?.completedLessonIds.includes(lessonId) ?? false;

  const markComplete = async (): Promise<CourseProgress | null> => {
    if (!courseId || !selectedLesson) return null;
    if (isLessonComplete(selectedLesson.id)) return progress;

    if (isPreview) {
      const nextCompleted = Array.from(new Set([...(progress?.completedLessonIds ?? []), selectedLesson.id]));
      const totalLessons = course?.modules.flatMap((m) => m.lessons || []).length || 1;
      const updated = createEphemeralProgress(nextCompleted, totalLessons);
      setProgress(updated);
      if (previewStorageKey) {
        sessionStorage.setItem(previewStorageKey, JSON.stringify(updated));
      }
      if (updated.enrollmentStatus === 'COMPLETED') {
        toast.success('Course completed (preview mode)!');
        setFeedbackModalOpen(true);
      }
      return updated;
    }

    const previousStatus = progress?.enrollmentStatus;
    const updated = await courseProgressService.markLessonComplete(courseId, selectedLesson.id);
    setProgress(updated);
    if (previousStatus !== 'COMPLETED' && updated.enrollmentStatus === 'COMPLETED') {
      toast.success('Course completed!');
      setFeedbackModalOpen(true);
    }
    return updated;
  };

  const goTo = (item: PlayerItem | null) => {
    if (!item) return;
    setSelectedItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = async () => {
    if (!selectedItem) return;
    if (selectedItem.kind !== 'lesson') {
      goTo(nextItem);
      return;
    }
    setMarking(true);
    try {
      await markComplete();
      goTo(nextItem);
    } catch (err) {
      console.error('Failed to advance to next lesson:', err);
      toast.error('Could not update progress.');
    } finally {
      setMarking(false);
    }
  };

  const handlePrevious = () => {
    goTo(previousItem);
  };

  const refreshProgress = useCallback(() => {
    if (!courseId) return;
    if (isPreview) {
      if (typeof window !== 'undefined' && previewStorageKey) {
        const stored = sessionStorage.getItem(previewStorageKey);
        if (stored) {
          try {
            setProgress(JSON.parse(stored));
          } catch {}
        }
      }
    } else {
      courseProgressService.getCourseProgress(courseId).then(setProgress).catch(console.error);
    }
  }, [courseId, isPreview, previewStorageKey]);

  const handleResetPreview = () => {
    if (previewStorageKey) {
      sessionStorage.removeItem(previewStorageKey);
    }
    if (course) {
      for (const mod of course.modules) {
        for (const ass of mod.assessments || []) {
          sessionStorage.removeItem(`preview_attempts_${ass.examId}`);
        }
      }
    }
    const totalLessons = course?.modules.flatMap((m) => m.lessons || []).length || 1;
    setProgress(createEphemeralProgress([], totalLessons));
    setRefreshKey((k) => k + 1);
    toast.success('Preview progress and assessment marks have been reset.');
  };

  const handleExitPreview = () => {
    if (onExitPreview) {
      onExitPreview();
    } else if (courseId) {
      router.push(`/studio/content/course/${courseId}`);
    } else {
      router.push('/studio');
    }
  };

  const completedCount = progress?.completedLessonIds.length ?? 0;
  const totalCount = orderedItems.length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const lessonDone = selectedLesson ? isLessonComplete(selectedLesson.id) : false;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="size-8 animate-spin rounded-full border-2 border-[#14142b] border-t-transparent" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <p className="text-base font-semibold text-[#14142b]">Course not found</p>
        <button
          type="button"
          onClick={() => router.push(isPreview ? `/studio/content/course/${courseId}` : '/learning')}
          className="mt-3 text-sm text-[#FF6B4A] underline"
        >
          {isPreview ? 'Back to Studio' : 'Back to My Learning'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F5] text-slate-800">
      {/* Author Preview Banner */}
      {isPreview && (
        <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-amber-300/60 bg-amber-50/95 px-4 py-2.5 backdrop-blur-md sm:px-8 shadow-xs">
          <div className="flex items-center gap-2 text-[13px] font-medium text-amber-950">
            <span className="rounded-full bg-amber-200/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
              Creator Preview Mode
            </span>
            <span>
              Viewing as an enrolled student. Progress and assessment scores are temporary and will not be saved.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetPreview}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-white px-3 py-1 text-[12px] font-semibold text-amber-900 transition-colors hover:bg-amber-100/50 cursor-pointer shadow-xs"
            >
              <RotateCcw size={12} />
              <span>Reset Progress</span>
            </button>
            <button
              type="button"
              onClick={handleExitPreview}
              className="rounded-full bg-[#14142b] px-3.5 py-1 text-[12px] font-semibold text-white transition-colors hover:bg-[#232735] cursor-pointer shadow-xs"
            >
              Exit Preview
            </button>
          </div>
        </div>
      )}

      {/* Sticky top chrome */}
      <header className={`sticky ${isPreview ? 'top-10' : 'top-0'} z-40 border-b border-black/[0.06] bg-[#FAF9F5]/90 backdrop-blur-md transition-all`}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(isPreview ? `/studio/content/course/${courseId}` : '/learning')}
              aria-label={isPreview ? 'Back to Studio' : 'Back to My Learning'}
              className="grid size-9 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-[#14142b] transition-colors hover:bg-slate-100 cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-[#14142b]">{course.title}</p>
              {course.channel && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  {course.channel.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <div className="hidden sm:flex sm:items-center sm:gap-2 text-[12px] font-medium text-slate-500">
              <span>{completedCount} of {totalCount} completed</span>
              <span className="font-bold text-[#14142b]">({percentComplete}%)</span>
            </div>
            <div className="h-2 w-24 sm:w-32 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main player body */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col md:flex-row">
        {/* Left curriculum sidebar */}
        <aside className="w-full shrink-0 border-r border-black/[0.06] bg-[#FAF9F5] md:sticky md:top-24 md:h-[calc(100vh-6rem)] md:w-80 md:overflow-y-auto">
          <div className="p-4 sm:p-5">
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Course content
            </h2>
            <div className="space-y-3">
              {course.modules?.map((mod, modIdx) => {
                const items = itemsForModule(mod);
                const isCollapsed = collapsedModules[mod.id] ?? false;
                const completedInMod = items.filter(
                  (i) => i.kind === 'lesson' && isLessonComplete(i.id)
                ).length;

                return (
                  <div key={mod.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-xs">
                    <button
                      type="button"
                      onClick={() => toggleModule(mod.id)}
                      className="flex w-full items-center justify-between p-3.5 text-left transition-colors hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Module {modIdx + 1}
                        </p>
                        <p className="truncate text-[13px] font-bold text-[#14142b]">{mod.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {completedInMod}/{items.length} items
                        </p>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 shrink-0 transition-transform ${
                          isCollapsed ? '-rotate-90' : ''
                        }`}
                      />
                    </button>

                    {!isCollapsed && (
                      <ul className="divide-y divide-slate-100 border-t border-slate-100">
                        {items.map((item) => {
                          const isSelected = selectedItem?.id === item.id;
                          const isCompleted =
                            item.kind === 'lesson' ? isLessonComplete(item.id) : false;

                          return (
                            <li key={item.id}>
                              <button
                                type="button"
                                onClick={() => goTo(item)}
                                className={`flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left text-[13px] transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-slate-100 font-semibold text-[#14142b]'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <span className="mt-0.5 shrink-0">
                                  {item.kind === 'assessment' ? (
                                    <GraduationCap size={15} className="text-amber-700" />
                                  ) : isCompleted ? (
                                    <CheckCircle2 size={15} className="text-emerald-600" />
                                  ) : (
                                    <div className="size-3.5 rounded-full border border-slate-300" />
                                  )}
                                </span>
                                <span className="min-w-0 flex-1 leading-snug">
                                  {item.kind === 'assessment'
                                    ? item.assessment.title
                                    : item.lesson.title}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Center content canvas */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="mx-auto max-w-3xl">
            {selectedItem?.kind === 'assessment' ? (
              <AssessmentLandingPane
                key={`${selectedItem.id}-${refreshKey}`}
                assessment={selectedItem.assessment}
                courseId={courseId}
                onPassed={refreshProgress}
                onNextItem={nextItem ? handleNext : undefined}
                onReportIssue={() => setReportModalOpen(true)}
                isPreview={isPreview}
              />
            ) : selectedLesson ? (
              <article className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                  <header className="mb-6 border-b border-slate-100 pb-5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <FileText size={12} />
                      Lesson
                    </span>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#14142b]">
                      {selectedLesson.title}
                    </h1>
                  </header>

                  <div className="prose prose-slate max-w-none text-[15px] leading-relaxed text-slate-700">
                    {selectedLesson.body ? (
                      <TiptapContentView body={selectedLesson.body} />
                    ) : (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-400">
                        <BookOpen size={32} className="mx-auto mb-2 text-slate-300" />
                        <p>No content published for this lesson yet.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Navigation */}
                <footer className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div>
                    {previousItem && (
                      <button
                        type="button"
                        onClick={handlePrevious}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer shadow-xs"
                      >
                        <ChevronLeft size={15} />
                        <span>Previous</span>
                      </button>
                    )}
                  </div>

                  <div className="ml-auto">
                    {nextItem ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={marking}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#14142b] px-6 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#232735] cursor-pointer shadow-xs disabled:opacity-60"
                      >
                        <span>{marking ? 'Saving…' : lessonDone ? 'Next' : 'Complete & next'}</span>
                        <ChevronRight size={15} />
                      </button>
                    ) : isLastItem ? (
                      lessonDone ? (
                        <button
                          type="button"
                          onClick={() => setFeedbackModalOpen(true)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-emerald-700 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 size={15} />
                          <span>Complete course</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleNext}
                          disabled={marking}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6B4A] px-6 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#e85a3c] cursor-pointer shadow-xs disabled:opacity-60"
                        >
                          <Check size={15} />
                          <span>{marking ? 'Saving…' : 'Complete lesson'}</span>
                        </button>
                      )
                    ) : null}
                  </div>
                </footer>
              </article>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                <BookOpen size={36} className="mx-auto mb-2 text-slate-300" />
                <p>Select a lesson from the curriculum sidebar to begin.</p>
              </div>
            )}
          </div>
        </main>

        {/* Drag handle */}
        <div
          onPointerDown={handleRightPanelResizeStart}
          className="group hidden w-3 shrink-0 cursor-col-resize md:flex md:items-stretch md:justify-center"
        >
          <div className="w-1 rounded-full bg-transparent transition-colors group-hover:bg-slate-300/60" />
        </div>

        {/* Right Rail: Notes / AI */}
        <aside
          className="w-full shrink-0 border-l border-black/[0.06] bg-[#FAF9F5] md:sticky md:top-24 md:h-[calc(100vh-6rem)] md:overflow-y-auto"
          style={isDesktopViewport ? { width: rightPanelWidth } : undefined}
        >
          <div className="flex h-full flex-col p-4">
            <div className="mb-3 flex items-center rounded-xl bg-slate-200/60 p-1 text-[12px] font-semibold">
              <button
                type="button"
                onClick={() => setRightPanelTab('notes')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-colors cursor-pointer ${
                  rightPanelTab === 'notes' ? 'bg-white text-[#14142b] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <NotebookPen size={13} />
                <span>Notes</span>
              </button>
              <button
                type="button"
                onClick={() => setRightPanelTab('ai')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-colors cursor-pointer ${
                  rightPanelTab === 'ai' ? 'bg-white text-[#14142b] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles size={13} />
                <span>AI</span>
              </button>
            </div>

            <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
              {rightPanelTab === 'notes' ? (
                <NotesEditor content={notesDraft} onChange={setNotesDraft} />
              ) : (
                <div className="flex h-full min-h-[40vh] flex-col items-center justify-center text-center text-slate-400">
                  <Sparkles size={26} className="mb-2 text-slate-300" />
                  <p className="text-[13px] font-semibold text-slate-600">AI Tutor</p>
                  <p className="text-[11px]">Ask questions about the current material.</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Report Modal */}
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

      {/* Feedback Dialog */}
      <Dialog
        open={feedbackModalOpen}
        onOpenChange={(open) => {
          if (!open) handleFeedbackSkip();
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share your experience</DialogTitle>
            <DialogDescription>
              How was this course? Your rating helps other learners decide.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div
              className="mb-2 flex justify-center gap-2"
              role="radiogroup"
              aria-label="Course rating, 1 to 5 stars"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={feedbackRating === star}
                  aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
                  onClick={() => setFeedbackRating(star)}
                  className="rounded transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                >
                  <Star
                    size={28}
                    className={
                      star <= feedbackRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-transparent text-slate-300'
                    }
                  />
                </button>
              ))}
            </div>

            <textarea
              className="min-h-[120px] w-full resize-y rounded-lg border border-slate-200 p-3 text-sm focus:border-[#14142b] focus:outline-none"
              placeholder="Anything you'd like to add? (optional)"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
          </div>

          <DialogFooter className="sm:justify-between">
            <button
              type="button"
              onClick={handleFeedbackSkip}
              disabled={submittingFeedback}
              className="inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleFeedbackSubmit}
              disabled={submittingFeedback || feedbackRating < 1}
              className="inline-flex h-10 items-center justify-center rounded-full bg-[#14142b] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#232735] disabled:opacity-50 cursor-pointer"
            >
              {submittingFeedback ? 'Saving…' : 'Submit'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
