"use client";

import { ContentArt } from '@/shared/design-system/art';
import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileQuestion,
  History,
  MessageSquare,
  X,
  Award,
  Shield,
  Clock,
  Target,
  FileCheck,
} from "lucide-react";
import { TiptapContentView } from "./TiptapContentView";
import { QuizPlayer, type QuizStatsResponse } from "@/domains/assessments";
import { AssessmentReviewQuestions } from "./AssessmentReviewQuestions";
import { LessonReviewFeedback } from "./LessonReviewFeedback";
import { PublishCourseDialog } from "./PublishCourseDialog";
import type {
  CourseRenderResponse,
  LessonRenderResponse,
  AssessmentNodeResponse,
} from "@/shared/types/api.types";
import { formatMoney } from "@/shared/utils/money";
import { toast } from "sonner";

type TreeItem =
  | { kind: "lesson"; moduleId: string; item: LessonRenderResponse }
  | { kind: "quiz"; moduleId: string; id: string; title: string; position: number }
  | { kind: "assessment"; moduleId: string; item: AssessmentNodeResponse };

type SelectedItem = { kind: "lesson" | "quiz" | "assessment"; id: string } | null;

interface CourseRendererProps {
  course: CourseRenderResponse | null;
  loading: boolean;
  error: string | null;
  selectedItem: SelectedItem;
  setSelectedItem: (item: SelectedItem) => void;
  collapsedModules: Set<string>;
  toggleModule: (moduleId: string) => void;
  quizStats: Record<string, QuizStatsResponse>;
  canPublish: boolean;
  onPublish: (note: string) => Promise<void>;
  onReject?: (reason: string) => Promise<void>;
  onAttemptGraded: (attempt: any, quizId: string) => void;
  mode?: string;
  isFeedbackOpen: boolean;
  setIsFeedbackOpen: (open: boolean) => void;
  comments: any[];
  commentsLoading: boolean;
  commentsError?: string;
  onAddComment?: (lessonId: string, content: string) => Promise<void>;
  onViewHistory?: (lessonId: string) => void;
  currentUser?: { id: string; name: string; avatarUrl?: string };
  publishedCourse?: CourseRenderResponse | null;
  /** Pinned under the course tree — e.g. the badge this course awards, for its reviewer. */
  sidebarFooter?: ReactNode;
}

function statusTone(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25";
    case "REJECTED":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/25";
    case "SUBMITTED":
      return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/25";
    case "APPROVED":
      return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/25";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

/** What a placed assessment is, in words — derived only from the server's plan type and grading. */
function assessmentKindLabel(a: AssessmentNodeResponse): string {
  if (a.planType === "COMPLETION") return "Completion";
  if (a.planType === "ASSESSMENT") return a.graded ? "Graded" : "Practice";
  return "Assessment";
}

export function CourseRenderer({
  course,
  loading,
  error,
  selectedItem,
  setSelectedItem,
  collapsedModules,
  toggleModule,
  quizStats,
  canPublish,
  onPublish,
  onReject,
  onAttemptGraded,
  isFeedbackOpen,
  setIsFeedbackOpen,
  comments,
  commentsLoading,
  commentsError,
  onAddComment,
  onViewHistory,
  currentUser,
  publishedCourse,
  sidebarFooter,
}: CourseRendererProps) {
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showUpdatedContent, setShowUpdatedContent] = useState(true);

  const selectedLesson = useMemo(() => {
    if (!course || selectedItem?.kind !== "lesson") return null;
    for (const mod of course.modules) {
      const found = mod.lessons.find((l) => l.id === selectedItem.id);
      if (found) return found;
    }
    return null;
  }, [course, selectedItem]);

  const selectedAssessment = useMemo(() => {
    if (!course || selectedItem?.kind !== "assessment") return null;
    for (const mod of course.modules) {
      const found = (mod.assessments || []).find(
        (a) => a.placementId === selectedItem.id || a.examId === selectedItem.id
      );
      if (found) return found;
    }
    if (course.assessments) {
      const found = course.assessments.find(
        (a) => a.placementId === selectedItem.id || a.examId === selectedItem.id
      );
      if (found) return found;
    }
    return null;
  }, [course, selectedItem]);

  const selectedModule = useMemo(() => {
    if (!course || !selectedItem) return null;
    for (const mod of course.modules) {
      if (selectedItem.kind === "lesson" && mod.lessons.some((l) => l.id === selectedItem.id)) {
        return mod;
      }
      if (selectedItem.kind === "quiz" && mod.quizzes.some((q) => q.id === selectedItem.id)) {
        return mod;
      }
      if (
        selectedItem.kind === "assessment" &&
        (mod.assessments || []).some(
          (a) => a.placementId === selectedItem.id || a.examId === selectedItem.id
        )
      ) {
        return mod;
      }
    }
    return null;
  }, [course, selectedItem]);

  const selectedQuizTitle = useMemo(() => {
    if (!course || selectedItem?.kind !== "quiz") return null;
    for (const mod of course.modules) {
      const q = mod.quizzes.find((x) => x.id === selectedItem.id);
      if (q) return q.title;
    }
    return null;
  }, [course, selectedItem]);

  const publishedLesson = useMemo(() => {
    if (!publishedCourse || !selectedLesson) return null;
    for (const mod of publishedCourse.modules) {
      for (const les of mod.lessons) {
        if (les.id === selectedLesson.id || les.title === selectedLesson.title) return les;
      }
    }
    return null;
  }, [publishedCourse, selectedLesson]);

  const selectedQuizId = selectedItem?.kind === "quiz" ? selectedItem.id : null;
  const crumbLabel =
    selectedLesson?.title ??
    selectedQuizTitle ??
    selectedAssessment?.title ??
    (canPublish ? "Review" : "Overview");

  if (loading) {
    return (
      <div
        className="flex h-screen items-center justify-center text-[13px] font-medium text-slate-400"
        style={{ background: "var(--theme-wash, linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 40%, #FFFFFF 100%))" }}
      >
        Loading course…
      </div>
    );
  }

  if (error || !course) {
    return (
      <div
        className="flex h-screen flex-col items-center justify-center gap-3 text-center"
        style={{ background: "var(--theme-wash, linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 40%, #FFFFFF 100%))" }}
      >
        <p className="text-sm text-rose-600 dark:text-rose-400">{error ?? "Course not found"}</p>
        <Link
          href="/console/reviews"
          className="text-[13px] font-semibold text-ink underline-offset-2 hover:underline"
        >
          Back to reviews
        </Link>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--theme-wash, linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 28%, #FFFFFF 72%))" }}
    >
      {/* Sidebar — navigation only */}
      <aside className="flex w-[280px] shrink-0 flex-col border-r border-slate-200/80 bg-surface/75 backdrop-blur-xl lg:w-[300px]">
        <div className="border-b border-slate-100 px-4 pb-4 pt-5">
          <Link
            href={canPublish ? "/console/reviews" : "/studio/published"}
            className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 transition-colors hover:text-ink"
          >
            <ArrowLeft size={14} />
            Back
          </Link>

          <p className="line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-ink">
            {course.title}
          </p>
          <span
            className={`mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusTone(course.status)}`}
          >
            {course.status.replace(/_/g, " ")}
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-3">
          {course.modules.length === 0 ? (
            <p className="px-3 py-8 text-center text-[12px] text-slate-400">
              This course has no modules yet.
            </p>
          ) : (
            course.modules.map((mod) => {
              const collapsed = collapsedModules.has(mod.id);
              const items: TreeItem[] = [
                ...(mod.lessons || []).map((l): TreeItem => ({ kind: "lesson", moduleId: mod.id, item: l })),
                ...(mod.quizzes || []).map(
                  (q): TreeItem => ({
                    kind: "quiz",
                    moduleId: mod.id,
                    id: q.id,
                    title: q.title,
                    position: q.position,
                  }),
                ),
                ...(mod.assessments || []).map(
                  (a): TreeItem => ({
                    kind: "assessment",
                    moduleId: mod.id,
                    item: a,
                  }),
                ),
              ].sort((a, b) => {
                const posA =
                  a.kind === "lesson" ? a.item.position : a.kind === "quiz" ? a.position : a.item.position;
                const posB =
                  b.kind === "lesson" ? b.item.position : b.kind === "quiz" ? b.position : b.item.position;
                return posA - posB;
              });

              return (
                <div key={mod.id} className="mb-1.5">
                  <button
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    className="flex w-full items-center gap-1.5 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-ink transition-colors hover:bg-slate-100/80"
                  >
                    {collapsed ? (
                      <ChevronRight size={14} className="shrink-0 text-slate-400" />
                    ) : (
                      <ChevronDown size={14} className="shrink-0 text-slate-400" />
                    )}
                    <span className="line-clamp-1">{mod.title}</span>
                  </button>
                  {!collapsed && (
                    <div className="ml-2 space-y-0.5 border-l border-slate-200/80 pl-2">
                      {items.map((item) =>
                        item.kind === "lesson" ? (
                          <button
                            key={item.item.id}
                            type="button"
                            onClick={() => setSelectedItem({ kind: "lesson", id: item.item.id })}
                            className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[12px] transition-colors ${
                              selectedItem?.kind === "lesson" && selectedItem.id === item.item.id
                                ? "bg-ink font-semibold text-on-ink shadow-[0_6px_14px_rgba(20,20,43,0.14)]"
                                : "font-medium text-slate-500 hover:bg-surface hover:text-ink"
                            }`}
                          >
                            {selectedItem?.kind === "lesson" && selectedItem.id === item.item.id ? (
                              <CheckCircle2 size={13} className="shrink-0" />
                            ) : (
                              <BookOpen size={13} className="shrink-0 text-slate-400" />
                            )}
                            <span className="line-clamp-1">{item.item.title}</span>
                          </button>
                        ) : item.kind === "quiz" ? (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedItem({ kind: "quiz", id: item.id })}
                            className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[12px] transition-colors ${
                              selectedItem?.kind === "quiz" && selectedItem.id === item.id
                                ? "bg-ink font-semibold text-on-ink shadow-[0_6px_14px_rgba(20,20,43,0.14)]"
                                : "font-medium text-slate-500 hover:bg-surface hover:text-ink"
                            }`}
                          >
                            <FileQuestion
                              size={13}
                              className={`shrink-0 ${
                                selectedItem?.kind === "quiz" && selectedItem.id === item.id
                                  ? "text-white"
                                  : "text-slate-400"
                              }`}
                            />
                            <span className="line-clamp-1 flex-1">{item.title}</span>
                            {quizStats[item.id]?.bestScore != null && (
                              <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                {quizStats[item.id].bestScore}/{quizStats[item.id].maxScore}
                              </span>
                            )}
                          </button>
                        ) : (
                          <button
                            key={item.item.placementId}
                            type="button"
                            onClick={() => setSelectedItem({ kind: "assessment", id: item.item.placementId })}
                            className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[12px] transition-colors ${
                              selectedItem?.kind === "assessment" &&
                              (selectedItem.id === item.item.placementId || selectedItem.id === item.item.examId)
                                ? "bg-ink font-semibold text-on-ink shadow-[0_6px_14px_rgba(20,20,43,0.14)]"
                                : "font-medium text-slate-500 hover:bg-surface hover:text-ink"
                            }`}
                          >
                            <Award
                              size={13}
                              className={`shrink-0 ${
                                selectedItem?.kind === "assessment" &&
                                (selectedItem.id === item.item.placementId || selectedItem.id === item.item.examId)
                                  ? "text-amber-300 dark:text-amber-600"
                                  : "text-amber-500"
                              }`}
                            />
                            <span className="line-clamp-1 flex-1">{item.item.title}</span>
                            {item.item.planType && (
                              <span
                                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                                  selectedItem?.kind === "assessment" &&
                                  (selectedItem.id === item.item.placementId || selectedItem.id === item.item.examId)
                                    ? "bg-on-ink/20 text-on-ink"
                                    : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25"
                                }`}
                              >
                                {assessmentKindLabel(item.item)}
                              </span>
                            )}
                          </button>
                        ),
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {course.assessments && course.assessments.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Course Assessments
              </div>
              <div className="space-y-0.5">
                {course.assessments.map((a) => (
                  <button
                    key={a.placementId}
                    type="button"
                    onClick={() => setSelectedItem({ kind: "assessment", id: a.placementId })}
                    className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[12px] transition-colors ${
                      selectedItem?.kind === "assessment" &&
                      (selectedItem.id === a.placementId || selectedItem.id === a.examId)
                        ? "bg-ink font-semibold text-on-ink shadow-[0_6px_14px_rgba(20,20,43,0.14)]"
                        : "font-medium text-slate-500 hover:bg-surface hover:text-ink"
                    }`}
                  >
                    <Award
                      size={13}
                      className={`shrink-0 ${
                        selectedItem?.kind === "assessment" &&
                        (selectedItem.id === a.placementId || selectedItem.id === a.examId)
                          ? "text-amber-300 dark:text-amber-600"
                          : "text-amber-500"
                      }`}
                    />
                    <span className="line-clamp-1 flex-1">{a.title}</span>
                    {a.planType && (
                      <span
                        className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                          selectedItem?.kind === "assessment" &&
                          (selectedItem.id === a.placementId || selectedItem.id === a.examId)
                            ? "bg-on-ink/20 text-on-ink"
                            : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25"
                        }`}
                      >
                        {assessmentKindLabel(a)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>
        {sidebarFooter && <div className="shrink-0 border-t border-slate-200/80 p-3">{sidebarFooter}</div>}
      </aside>

      {/* Content pane */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar: breadcrumb + tools */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200/70 bg-surface/60 px-6 py-3.5 backdrop-blur-xl">
          <nav className="flex min-w-0 items-center gap-1.5 text-[12px]">
            <span className="truncate font-semibold text-slate-400">{course.title}</span>
            {selectedModule && (
              <>
                <span className="text-slate-300">/</span>
                <span className="truncate font-semibold text-slate-400">{selectedModule.title}</span>
              </>
            )}
            {(selectedLesson || selectedQuizTitle || selectedAssessment) && (
              <>
                <span className="text-slate-300">/</span>
                <span className="truncate font-bold text-ink">{crumbLabel}</span>
              </>
            )}
            {!selectedLesson && !selectedQuizTitle && !selectedAssessment && (
              <>
                <span className="text-slate-300">/</span>
                <span className="font-bold text-ink">{crumbLabel}</span>
              </>
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {canPublish && publishedCourse && selectedLesson && (
              <button
                type="button"
                onClick={() => setShowUpdatedContent(!showUpdatedContent)}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  showUpdatedContent
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : "border-slate-200 bg-surface text-slate-600 hover:border-slate-300"
                }`}
              >
                {showUpdatedContent ? "Updated" : "Published"}
              </button>
            )}
            {canPublish && selectedLesson && onViewHistory && (
              <button
                type="button"
                onClick={() => onViewHistory(selectedLesson.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-surface px-3 py-1.5 text-[11px] font-semibold text-ink transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <History size={13} />
                History
              </button>
            )}
            {canPublish && (course.status === "SUBMITTED" || course.status === "APPROVED") && (
              <>
                {onReject && (
                  <button
                    type="button"
                    onClick={() => setIsRejectDialogOpen(true)}
                    className="rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-[12px] font-semibold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/15"
                  >
                    Reject
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsPublishDialogOpen(true)}
                  className="rounded-full bg-ink px-4 py-1.5 text-[12px] font-semibold text-on-ink shadow-[0_6px_14px_rgba(20,20,43,0.16)] transition-colors hover:bg-ink-hover"
                >
                  Approve & Publish
                </button>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-8 py-8 lg:px-12">
            {selectedLesson ? (
              <div className="rounded-2xl border border-slate-200/80 bg-surface/95 p-8 shadow-[0_8px_28px_rgba(20,20,43,0.05)]">
                <TiptapContentView
                  body={
                    showUpdatedContent
                      ? selectedLesson.body
                      : publishedLesson?.body || selectedLesson.body
                  }
                  publishedBody={
                    showUpdatedContent && publishedCourse
                      ? publishedLesson?.body || null
                      : undefined
                  }
                  emptyMessage="This lesson has no content yet."
                />
              </div>
            ) : selectedQuizId ? (
              <div className="rounded-2xl border border-slate-200/80 bg-surface/95 p-6 shadow-[0_8px_28px_rgba(20,20,43,0.05)]">
                <QuizPlayer
                  key={selectedQuizId}
                  quizId={selectedQuizId}
                  onAttemptGraded={(attempt) => onAttemptGraded(attempt, selectedQuizId)}
                />
              </div>
            ) : selectedAssessment ? (
              <div className="rounded-2xl border border-slate-200/80 bg-surface/95 p-8 shadow-[0_8px_28px_rgba(20,20,43,0.05)] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold tracking-tight text-ink">
                        {selectedAssessment.title}
                      </h2>
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
                        {assessmentKindLabel(selectedAssessment)}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-slate-400">
                      Placement: {selectedAssessment.placementId} · Exam: {selectedAssessment.examId}
                    </p>
                  </div>

                  {selectedAssessment.requiredForCompletion ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
                      <Target size={12} /> Required for course pass
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-500">
                      Optional assessment
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                      <Award size={13} className="text-slate-400" /> Type
                    </div>
                    <div className="text-[15px] font-bold text-ink mt-1">
                      {assessmentKindLabel(selectedAssessment)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                      <Target size={13} className="text-slate-400" /> Completion Gate
                    </div>
                    <div className="text-[15px] font-bold text-ink mt-1">
                      {selectedAssessment.requiredForCompletion ? "Mandatory" : "Optional"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                      <CheckCircle2 size={13} className="text-slate-400" /> Plan Reference
                    </div>
                    <div className="text-[15px] font-bold text-ink mt-1 font-mono text-[12px] truncate">
                      {selectedAssessment.planId || "Default Blueprint"}
                    </div>
                  </div>
                </div>


                {canPublish && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-[13px] text-blue-900 space-y-1 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-200">
                    <div className="font-semibold flex items-center gap-1.5">
                      <Shield size={15} className="text-blue-700 dark:text-blue-300" />
                      Assessment Review & Approval Seam
                    </div>
                    <p className="text-blue-800 text-[12px] dark:text-blue-200">
                      This assessment is coupled with the current course lifecycle. Approving or rejecting the course automatically publishes or returns this exam in tandem.
                    </p>
                  </div>
                )}

                {/* Question paper, options, and scoring key for superadmin and creator review */}
                <AssessmentReviewQuestions
                  examId={selectedAssessment.examId}
                  examTitle={selectedAssessment.title}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="mb-8 aspect-video w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 shadow-[0_12px_32px_rgba(20,20,43,0.1)]">
                  <ContentArt seed={course.id} kind="COURSE" title={course.title} />
                </div>
                <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink">
                  {course.title}
                </h2>
                <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-[12px] font-semibold text-slate-500">
                  <span className="rounded-full border border-slate-200 bg-surface px-3 py-1.5">
                    {course.pricingModel === "PAID"
                      ? formatMoney(course.priceAmount ?? 0, course.currency ?? "USD")
                      : "Free"}
                  </span>
                  {canPublish && (
                    <span className="rounded-full border border-ink/15 bg-ink px-3 py-1.5 text-on-ink">
                      Review mode
                    </span>
                  )}
                </div>
                <p className="mb-8 max-w-xl text-[14px] leading-relaxed text-slate-500">
                  {course.description || "No description provided."}
                </p>
                <p className="text-[12px] font-medium text-slate-400">
                  Select a lesson from the sidebar to begin review.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedLesson && canPublish && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {isFeedbackOpen && (
            <div className="mb-3 flex h-[560px] w-[400px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-surface shadow-[0_20px_50px_rgba(20,20,43,0.18)] animate-in fade-in slide-in-from-bottom-4 duration-200">
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-xl bg-ink text-on-ink">
                    <MessageSquare size={14} />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-ink">Reviewer feedback</p>
                    <p className="text-[10px] font-medium text-slate-400">Internal · this lesson</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink"
                >
                  <X size={16} />
                </button>
              </div>
              <LessonReviewFeedback
                comments={comments}
                loading={commentsLoading}
                error={commentsError ?? null}
                onAddComment={async (content) => {
                  if (onAddComment) await onAddComment(selectedLesson.id, content);
                }}
                currentUser={currentUser}
                hideHeader
                className="min-h-0 flex-1"
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-[13px] font-semibold shadow-[0_10px_24px_rgba(20,20,43,0.2)] transition-transform hover:scale-[1.02] active:scale-[0.98] ${
              isFeedbackOpen
                ? "bg-slate-800 text-on-ink"
                : "bg-ink text-on-ink hover:bg-ink-hover"
            }`}
          >
            <MessageSquare size={15} />
            {isFeedbackOpen ? "Close feedback" : "Reviewer feedback"}
            {!isFeedbackOpen && comments.length > 0 && (
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] tabular-nums">
                {comments.length}
              </span>
            )}
          </button>
        </div>
      )}

      <PublishCourseDialog
        open={isPublishDialogOpen}
        onClose={() => setIsPublishDialogOpen(false)}
        onConfirm={onPublish}
      />

      {isRejectDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-surface shadow-[0_24px_60px_rgba(20,20,43,0.22)]">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-[16px] font-bold tracking-tight text-ink">Reject course</h2>
              <p className="mt-1 text-[12px] font-medium text-slate-500">
                The author will see this reason on their submission.
              </p>
            </div>
            <div className="px-6 py-5">
              <textarea
                className="h-32 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-[13px] text-ink outline-none transition-shadow placeholder:text-slate-400 focus:border-ink/25 focus:bg-surface focus:ring-4 focus:ring-slate-200/70"
                placeholder="E.g. Audio quality in module 2 needs improvement…"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-full px-4 py-2 text-[12px] font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                  onClick={() => setIsRejectDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-full bg-rose-600 px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-40"
                  disabled={!rejectReason.trim()}
                  onClick={() => {
                    if (onReject) {
                      onReject(rejectReason)
                        .then(() => {
                          setIsRejectDialogOpen(false);
                          setRejectReason("");
                          toast.success("Changes requested");
                        })
                        .catch((err) => {
                          toast.error(
                            err instanceof Error ? err.message : "Failed to reject the course.",
                          );
                        });
                    }
                  }}
                >
                  Reject course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
