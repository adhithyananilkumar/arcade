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
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  FileText,
  Flag,
  MoreVertical,
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
import Link from 'next/link';
import { toast } from 'sonner';
import { ReportModal } from '@/shared/design-system/ui/ReportModal';
import { AssessmentLandingPane } from './AssessmentLandingPane';

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
  const [reportingContext, setReportingContext] = useState<{
    moduleId: string;
    moduleTitle: string;
    lessonId: string;
    lessonTitle: string;
  } | null>(null);
  
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const courseId = params?.courseId as string | undefined;

  const handleFeedbackSubmit = async () => {
    if (!courseId) return;
    
    if (feedbackText.trim().length > 0) {
      setSubmittingFeedback(true);
      try {
        await api.post(`/api/v1/learning/courses/${courseId}/reviews`, {
          reviewText: feedbackText.trim()
        });
        toast.success('Thank you for your feedback!');
      } catch (err) {
        console.error('Failed to submit feedback:', err);
        toast.error('Could not submit feedback.');
      } finally {
        setSubmittingFeedback(false);
      }
    }
    
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

  /** One running number across the whole course, counting assessments as steps too. */
  const itemNumberById = useMemo(() => {
    const map = new Map<string, number>();
    orderedItems.forEach((item, index) => map.set(item.id, index + 1));
    return map;
  }, [orderedItems]);

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
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1400px] flex-col pt-28 md:flex-row md:pt-32">
        {/* Sidebar */}
        <aside className="flex w-full shrink-0 flex-col border-b border-slate-200/70 md:sticky md:top-32 md:h-[calc(100vh-8.5rem)] md:w-[280px] md:border-b-0 md:border-r md:border-slate-200/70 lg:w-[300px]">
          <div className="space-y-4 px-5 pb-4 md:px-6">
            <Link
              href="/learning"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-400 transition-colors hover:text-[#14142b]"
            >
              <ChevronLeft size={14} />
              Learning
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

          <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-8 md:px-4">
            {course.modules.length === 0 ? (
              <p className="px-2 text-sm text-slate-400">No modules yet.</p>
            ) : (
              course.modules.map((mod, modIdx) => (
                <div key={mod.id}>
                  <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {mod.title?.trim() ? mod.title : `Module ${modIdx + 1}`}
                  </p>
                  <ul className="space-y-0.5">
                    {itemsForModule(mod).map((item) => {
                      const num = itemNumberById.get(item.id) ?? 0;
                      const isSelected = selectedItem?.id === item.id;

                      // Assessments get a distinct row: no completion tick (passing is what counts,
                      // and this page doesn't know the result), no report menu, and an icon instead
                      // of a step number so they read as a different kind of thing in the tree.
                      if (item.kind === 'assessment') {
                        return (
                          <li key={item.id} className="relative">
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => goTo(item)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  goTo(item);
                                }
                              }}
                              className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors ${
                                isSelected
                                  ? 'bg-[#14142b] text-white shadow-[0_6px_16px_rgba(20,20,43,0.18)]'
                                  : 'text-slate-600 hover:bg-white/80 hover:text-[#14142b]'
                              }`}
                            >
                              <span
                                className={`grid size-6 shrink-0 place-items-center rounded-md ${
                                  isSelected ? 'bg-white/15 text-white' : 'bg-amber-50 text-amber-600'
                                }`}
                              >
                                <FileText size={12} />
                              </span>
                              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">
                                {item.assessment.title}
                              </span>
                              {item.assessment.requiredForCompletion && (
                                <span
                                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                                    isSelected
                                      ? 'bg-white/15 text-white'
                                      : 'bg-amber-50 text-amber-700'
                                  }`}
                                >
                                  Required
                                </span>
                              )}
                            </div>
                          </li>
                        );
                      }

                      const lesson = item.lesson;
                      const isComplete = isLessonComplete(lesson.id);
                      return (
                        <li key={lesson.id} className="relative group/item">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => goTo(item)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                goTo(item);
                              }
                            }}
                            className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors ${
                              isSelected
                                ? 'bg-[#14142b] text-white shadow-[0_6px_16px_rgba(20,20,43,0.18)]'
                                : 'text-slate-600 hover:bg-white/80 hover:text-[#14142b]'
                            }`}
                          >
                            <span
                              className={`grid size-6 shrink-0 place-items-center rounded-md text-[11px] font-bold tabular-nums ${
                                isSelected
                                  ? 'bg-white/15 text-white'
                                  : isComplete
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {isComplete && !isSelected ? (
                                <Check size={12} strokeWidth={2.5} />
                              ) : (
                                num
                              )}
                            </span>
                            <span
                              className={`min-w-0 flex-1 truncate text-[13px] font-semibold ${
                                isComplete && !isSelected ? 'text-slate-400' : ''
                              }`}
                            >
                              {lesson.title}
                            </span>

                            <div className="relative shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuLessonId(activeMenuLessonId === lesson.id ? null : lesson.id);
                                }}
                                onKeyDown={(e) => {
                                  e.stopPropagation();
                                }}
                                className={`p-1 rounded-md transition-all ${
                                  activeMenuLessonId === lesson.id
                                    ? 'opacity-100 bg-white/20 text-white'
                                    : isSelected
                                      ? 'opacity-0 group-hover/item:opacity-100 text-white/70 hover:text-white hover:bg-white/15'
                                      : 'opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
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
                <header className="mb-6 flex items-start justify-between gap-4 md:mb-8">
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Lesson {currentIndex + 1}
                      {orderedItems.length > 0 ? ` · ${orderedItems.length}` : ''}
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
                </header>

                <div className="min-h-[42vh] flex-1 rounded-lg border border-slate-200/80 bg-white/95 px-5 py-7 shadow-[0_8px_28px_rgba(20,20,43,0.05)] sm:px-8 sm:py-9 md:px-12 md:py-11">
                  <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-[#14142b] prose-a:text-[#FF6B4A] hover:prose-a:text-[#D94F32] prose-p:text-slate-700">
                    {selectedLesson.body ? (
                      <TiptapContentView body={selectedLesson.body} />
                    ) : (
                      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-6 py-14 text-center">
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
                <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-5 pb-10">
                  <div>
                    {previousItem && (
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
              <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-lg border border-slate-200/80 bg-white/90 px-6 py-16 text-center shadow-[0_8px_28px_rgba(20,20,43,0.05)]">
                <BookOpen size={40} className="mb-3 text-slate-300" />
                <p className="text-lg font-bold text-[#14142b]">Pick a lesson</p>
                <p className="mt-1 text-sm text-slate-400">Choose one from the sidebar to start.</p>
              </div>
            )}
          </article>
        </main>
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

      {/* Course Feedback Modal */}
      <Dialog open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share your experience</DialogTitle>
            <DialogDescription>
              We'd love to hear your thoughts on this course. What did you like? What could be improved?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <textarea
              className="min-h-[120px] w-full resize-y rounded-lg border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Write your feedback here..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={handleFeedbackSubmit}
              disabled={submittingFeedback}
              className={`inline-flex h-10 items-center justify-center rounded-full px-6 text-sm font-semibold transition-colors disabled:opacity-50 ${
                feedbackText.trim().length > 0
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {submittingFeedback ? 'Saving...' : (feedbackText.trim().length > 0 ? 'Submit' : 'Skip')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
