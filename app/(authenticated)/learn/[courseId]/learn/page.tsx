'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  Flag,
  GraduationCap,
  MoreVertical,
  NotebookPen,
  Sparkles,
  Star,
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
} from '@/domains/learning';
import { toast } from 'sonner';
import { ReportModal } from '@/shared/design-system/ui/ReportModal';
import { courseReviewService } from '@/domains/learning';
import { AssessmentLandingPane } from './AssessmentLandingPane';
import { NotesEditor } from './NotesEditor';

/**
 * A node in the course's running order. Until assessments existed every node was a lesson and this
 * page assumed so throughout — there was no type switch anywhere in it.
 */
type PlayerItem =
  | { kind: 'lesson'; id: string; moduleId: string; position: number; lesson: LessonResponse }
  | {
      kind: 'assessment';
      id: string;
      moduleId: string;
      position: number;
      assessment: AssessmentNodeResponse;
    };

/**
 * Lessons and assessments share one position space, so a module's real order is the two merged and
 * sorted. Ties break on kind then id, keeping the order total and stable rather than dependent on
 * however the two arrays happened to arrive.
 */
function itemsForModule(mod: ModuleResponse): PlayerItem[] {
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

export default function CourseLearnPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonParam = searchParams?.get('lesson');
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PlayerItem | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [marking, setMarking] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportNote, setReportNote] = useState('');
  const [isReporting, setIsReporting] = useState(false);
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

  // The right rail's width is only meaningful once it sits beside the content instead of
  // stacking full-width on mobile, so the drag-resize only takes effect at the md breakpoint.
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

  const courseId = params?.courseId as string | undefined;

  /**
   * The rating is the point of this form, so a learner who picks stars and writes nothing still
   * submits. Nothing is sent without a rating, and no rating is assumed on their behalf — a
   * silent default would quietly move the course's public average.
   */
  const handleFeedbackSubmit = async () => {
    if (!courseId || feedbackRating < 1) {
      setFeedbackModalOpen(false);
      router.push('/learning');
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
      // Keep the modal open so the learner does not lose what they wrote.
      toast.error('Could not submit your feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleFeedbackSkip = () => {
    setFeedbackModalOpen(false);
    router.push('/learning');
  };

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

  useEffect(() => {
    if (courseId) {
      api
        .get<CourseResponse>(`/api/v1/public/courses/${courseId}`)
        .then((data) => {
          setCourse(data);
          if (data.modules && data.modules.length > 0) {
            const items = data.modules.flatMap(itemsForModule);
            // ?lesson= still addresses a lesson specifically — it predates assessments and is
            // linked to from elsewhere, so it keeps meaning exactly what it always did.
            const target = lessonParam
              ? items.find((i) => i.kind === 'lesson' && i.id === lessonParam)
              : null;
            setSelectedItem(target ?? items[0] ?? null);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));

      courseProgressService
        .getCourseProgress(courseId)
        .then(setProgress)
        .catch(() => setProgress(null));
    } else {
      setLoading(false);
    }
  }, [courseId]);

  // Null while an assessment is on screen: engagement time is measured against lesson content, and
  // time spent reading an assessment's instructions is not lesson study time.
  const selectedLesson = selectedItem?.kind === 'lesson' ? selectedItem.lesson : null;

  /**
   * Records real engaged time against the lesson currently on screen — the only source of
   * `learner_daily_activity.learning_minutes`. Instrumentation only: it renders nothing, and it
   * measures interaction-gated engagement, never "the tab was open". Gated on lesson content
   * actually being displayed, so the loading and not-found states accrue nothing.
   */
  useLessonEngagementTracker({
    courseId,
    lessonId: selectedLesson?.id,
    enabled: Boolean(courseId && selectedLesson?.id && !loading),
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
    // Completion for an assessment is passing it, not visiting its page. markLessonComplete would
    // reject a placement id outright, since the published snapshot knows it isn't a lesson.
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

  const handlePrevious = () => goTo(previousItem);

  /** Refreshes the progress bar after an assessment is passed, without a full reload. */
  const refreshProgress = () => {
    if (!courseId) return;
    courseProgressService.getCourseProgress(courseId).then(setProgress).catch(() => {});
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
      <div className="relative z-10 flex min-h-screen w-full flex-col gap-4 px-4 pt-28 md:flex-row md:px-8 md:pt-32 lg:px-12 xl:px-16">
        {/* Sidebar */}
        <aside className="flex w-full shrink-0 flex-col md:sticky md:top-32 md:h-[calc(100vh-8.5rem)] md:w-[280px] lg:w-[300px]">
          <div className="flex h-full flex-col">
          <nav className="flex-1 space-y-3 overflow-y-auto px-3 pb-5 pt-5 md:px-4 arcade-scrollbar-mini">
            {course.modules.length === 0 ? (
              <p className="px-2 text-sm text-slate-400">No modules yet.</p>
            ) : (
              course.modules.map((mod, modIdx) => {
                const isCollapsed = Boolean(collapsedModules[mod.id]);
                return (
                <div key={mod.id} className="mb-2 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    className="group flex w-full items-center gap-2 rounded-2xl border border-white/40 bg-white/60 px-3.5 py-2.5 text-left shadow-sm backdrop-blur-md transition-all hover:border-white/60 hover:bg-white/80"
                  >
                    {isCollapsed ? (
                      <ChevronRight size={15} className="flex-shrink-0 text-[#14142b]/50" />
                    ) : (
                      <ChevronDown size={15} className="flex-shrink-0 text-[#14142b]/50" />
                    )}
                    <span className="flex-1 truncate text-[13px] font-bold text-[#14142b]">
                      {mod.title?.trim() ? mod.title : `Module ${modIdx + 1}`}
                    </span>
                  </button>

                  {!isCollapsed && (
                  <div className="ml-5 flex flex-col gap-1 pl-3 pt-1">
                    {itemsForModule(mod).map((item) => {
                      const isSelected = selectedItem?.id === item.id;

                      // Assessments get a distinct row: no completion tick (passing is what counts,
                      // and this page doesn't know the result), no report menu, and an icon instead
                      // of a step number so they read as a different kind of thing in the tree.
                      if (item.kind === 'assessment') {
                        return (
                          <div
                            key={item.id}
                            className={`group flex items-center gap-2 rounded-full px-3.5 backdrop-blur-md transition-all ${
                              isSelected ? 'bg-[#14142b] shadow-md' : 'bg-white/50 hover:bg-white/80'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => goTo(item)}
                              className={`flex min-w-0 flex-1 items-center gap-1.5 py-2 text-left text-[13px] ${
                                isSelected ? 'font-semibold text-white' : 'text-slate-500'
                              }`}
                            >
                              <GraduationCap size={13} className="flex-shrink-0" />
                              <span className="truncate">{item.assessment.title}</span>
                              {item.assessment.requiredForCompletion && (
                                <span className="flex-shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700">
                                  Required
                                </span>
                              )}
                            </button>
                          </div>
                        );
                      }

                      const lesson = item.lesson;
                      const isComplete = isLessonComplete(lesson.id);
                      return (
                        <div
                          key={lesson.id}
                          className={`group/item flex items-center gap-2 rounded-full px-3.5 backdrop-blur-md transition-all ${
                            isSelected ? 'bg-[#14142b] shadow-md' : 'bg-white/50 hover:bg-white/80'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => goTo(item)}
                            className={`flex min-w-0 flex-1 items-center gap-1.5 py-2 text-left text-[13px] ${
                              isSelected
                                ? 'font-semibold text-white'
                                : isComplete
                                  ? 'text-slate-400'
                                  : 'text-slate-500'
                            }`}
                          >
                            {isComplete && !isSelected ? (
                              <Check size={13} strokeWidth={2.5} className="flex-shrink-0 text-emerald-500" />
                            ) : (
                              <FileText size={13} className="flex-shrink-0" />
                            )}
                            <span className="truncate" title={lesson.title}>
                              {lesson.title}
                            </span>
                          </button>

                          <div className="relative flex flex-shrink-0 items-center opacity-0 transition-opacity group-hover/item:opacity-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuLessonId(activeMenuLessonId === lesson.id ? null : lesson.id);
                              }}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                              }}
                              className={`rounded-full p-1 transition-all ${
                                activeMenuLessonId === lesson.id ? 'opacity-100' : ''
                              } ${
                                isSelected
                                  ? 'text-white/70 hover:bg-white/15 hover:text-white'
                                  : 'text-[#14142b]/50 hover:bg-[#14142b]/10 hover:text-[#14142b]'
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
                      );
                    })}
                  </div>
                  )}
                </div>
                );
              })
            )}
          </nav>

          {progress && progress.totalLessons > 0 && (
            <div className="space-y-2 px-5 pt-3 pb-5 md:px-6">
              {progress.enrollmentStatus === 'COMPLETED' && (
                <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 size={12} />
                  Course completed
                </p>
              )}
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
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
        </aside>

        {/* Lesson canvas — centered & wide */}
        <main className="relative flex min-w-0 flex-1 justify-center px-4 py-6 sm:px-8 md:py-8 lg:px-12">
          <article className="relative flex w-full max-w-4xl flex-col">
            {selectedItem?.kind === 'assessment' ? (
              // An assessment is a page in the structure, not a button: it describes itself here,
              // inside the course shell, and only hands off to the exam player once the candidate
              // actually starts — which needs fullscreen and possibly proctoring.
              <AssessmentLandingPane
                key={selectedItem.id}
                assessment={selectedItem.assessment}
                courseId={courseId}
                onPassed={refreshProgress}
              />
            ) : selectedLesson ? (
              <>
                <div className="min-h-[42vh] flex-1 rounded-3xl border border-white/40 bg-white/30 px-5 py-7 shadow-lg backdrop-blur-xl sm:px-8 sm:py-9 md:px-12 md:py-11">
                  <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-[#14142b] prose-a:text-[#FF6B4A] hover:prose-a:text-[#D94F32] prose-p:text-slate-700">
                    {selectedLesson.body ? (
                      <TiptapContentView body={selectedLesson.body} />
                    ) : (
                      <div className="rounded-2xl border border-white/40 bg-white/20 px-6 py-14 text-center backdrop-blur-md">
                        <BookOpen size={36} className="mx-auto mb-3 text-slate-300" />
                        <p className="text-[15px] font-semibold text-[#14142b]">No content yet</p>
                        <p className="mt-1 text-sm text-slate-400">
                          This lesson does not have material published.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom actions only — hide absent prev/next */}
                <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-5 pb-10">
                  <div>
                    {previousItem && (
                      <button
                        type="button"
                        onClick={handlePrevious}
                        className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-md px-4 py-2.5 text-[13px] font-semibold text-[#14142b] transition-colors hover:bg-white"
                      >
                        <ChevronLeft size={16} />
                        Previous
                      </button>
                    )}
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    {nextItem ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={marking}
                        className="inline-flex items-center gap-2 rounded-full bg-[#14142b] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(20,20,43,0.18)] transition-colors hover:bg-[#232735] disabled:opacity-60"
                      >
                        {marking ? 'Saving…' : lessonDone ? 'Next' : 'Complete & next'}
                        <ChevronRight size={16} />
                      </button>
                    ) : isLastItem ? (
                      lessonDone ? (
                        <button
                          type="button"
                          onClick={() => setFeedbackModalOpen(true)}
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(5,150,105,0.22)] transition-colors hover:bg-emerald-700"
                        >
                          <CheckCircle2 size={16} />
                          Back to Learning
                        </button>
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
            ) : (
              <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-white/40 bg-white/30 px-6 py-16 text-center shadow-lg backdrop-blur-xl">
                <BookOpen size={40} className="mb-3 text-slate-300" />
                <p className="text-lg font-bold text-[#14142b]">Pick a lesson</p>
                <p className="mt-1 text-sm text-slate-400">Choose one from the sidebar to start.</p>
              </div>
            )}
          </article>
        </main>

        {/* Drag handle — resizes the right rail against the lesson canvas. Invisible at rest; the
            full-height gap itself becomes the grabbable affordance on hover, rather than a small
            icon or a hard line sitting in the middle of it. */}
        <div
          onPointerDown={handleRightPanelResizeStart}
          className="group hidden w-4 shrink-0 cursor-col-resize md:sticky md:top-32 md:flex md:h-[calc(100vh-8.5rem)] md:items-stretch md:justify-center"
        >
          <div className="w-1.5 rounded-full bg-transparent transition-colors group-hover:bg-slate-300/60 group-active:bg-slate-400/70" />
        </div>

        {/* Right rail — notes / AI chat, glass-pill styled to match the left nav */}
        <aside
          className="flex w-full shrink-0 flex-col md:sticky md:top-32 md:h-[calc(100vh-8.5rem)]"
          style={isDesktopViewport ? { width: rightPanelWidth } : undefined}
        >
          <div className="flex flex-col gap-3 h-full px-5 pb-8 md:px-4">
            <div className="flex items-center gap-1.5 rounded-full border border-white/40 bg-white/30 p-1 shadow-lg backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setRightPanelTab('notes')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold transition-all ${
                  rightPanelTab === 'notes'
                    ? 'bg-[#14142b] text-white shadow-[0_6px_16px_rgba(20,20,43,0.18)]'
                    : 'text-slate-500 hover:text-[#14142b]'
                }`}
              >
                <NotebookPen size={13} />
                Notes
              </button>
              <button
                type="button"
                onClick={() => setRightPanelTab('ai')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold transition-all ${
                  rightPanelTab === 'ai'
                    ? 'bg-[#14142b] text-white shadow-[0_6px_16px_rgba(20,20,43,0.18)]'
                    : 'text-slate-500 hover:text-[#14142b]'
                }`}
              >
                <Sparkles size={13} />
                AI Chat
              </button>
            </div>

            <div className="flex h-full flex-1 flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/30 p-4 shadow-lg backdrop-blur-xl">
              {rightPanelTab === 'notes' ? (
                <NotesEditor content={notesDraft} onChange={setNotesDraft} />
              ) : (
                <div className="flex h-full min-h-[50vh] flex-col items-center justify-center text-center">
                  <Sparkles size={28} className="mb-3 text-slate-300" />
                  <p className="text-[13px] font-semibold text-[#14142b]">AI chat coming soon</p>
                  <p className="mt-1 text-[12px] text-slate-400">Ask questions about this lesson.</p>
                </div>
              )}
            </div>
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

      {/* Post-completion feedback. Opens when the course flips to COMPLETED, and again from
          "Back to Learning" so a learner who dismissed it can still rate the course. */}
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
                  className="rounded transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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
              className="min-h-[120px] w-full resize-y rounded-lg border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              className="inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleFeedbackSubmit}
              disabled={submittingFeedback || feedbackRating < 1}
              title={feedbackRating < 1 ? 'Pick a star rating to submit' : undefined}
              className="inline-flex h-10 items-center justify-center rounded-full bg-indigo-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {submittingFeedback ? 'Saving…' : 'Submit'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
