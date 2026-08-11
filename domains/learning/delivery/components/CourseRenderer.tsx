// features/learning/delivery/components/CourseRenderer.tsx
// Review / published course view: module sidebar + read-only content pane.
"use client";

import { useMemo, useState } from "react";
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
} from "lucide-react";
import { TiptapContentView } from "./TiptapContentView";
import { QuizPlayer, type QuizStatsResponse } from "@/domains/assessments";
import { LessonReviewFeedback } from "./LessonReviewFeedback";
import { PublishCourseDialog } from "./PublishCourseDialog";
import type { CourseRenderResponse, LessonRenderResponse } from "@/shared/types/api.types";
import { formatMoney } from "@/shared/utils/money";
import { toast } from "sonner";

type TreeItem =
  | { kind: "lesson"; moduleId: string; item: LessonRenderResponse }
  | { kind: "quiz"; moduleId: string; id: string; title: string; position: number };

type SelectedItem = { kind: "lesson" | "quiz"; id: string } | null;

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
}

function statusTone(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "REJECTED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "SUBMITTED":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "APPROVED":
      return "bg-sky-50 text-sky-700 border-sky-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
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

  const selectedModule = useMemo(() => {
    if (!course || !selectedItem) return null;
    for (const mod of course.modules) {
      if (selectedItem.kind === "lesson" && mod.lessons.some((l) => l.id === selectedItem.id)) {
        return mod;
      }
      if (selectedItem.kind === "quiz" && mod.quizzes.some((q) => q.id === selectedItem.id)) {
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
    selectedLesson?.title ?? selectedQuizTitle ?? (canPublish ? "Review" : "Overview");

  if (loading) {
    return (
      <div
        className="flex h-screen items-center justify-center text-[13px] font-medium text-slate-400"
        style={{ background: "linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 40%, #FFFFFF 100%)" }}
      >
        Loading course…
      </div>
    );
  }

  if (error || !course) {
    return (
      <div
        className="flex h-screen flex-col items-center justify-center gap-3 text-center"
        style={{ background: "linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 40%, #FFFFFF 100%)" }}
      >
        <p className="text-sm text-rose-600">{error ?? "Course not found"}</p>
        <Link
          href="/console/reviews"
          className="text-[13px] font-semibold text-[#14142b] underline-offset-2 hover:underline"
        >
          Back to reviews
        </Link>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 28%, #FFFFFF 72%)" }}
    >
      {/* Sidebar — navigation only */}
      <aside className="flex w-[280px] shrink-0 flex-col border-r border-slate-200/80 bg-white/75 backdrop-blur-xl lg:w-[300px]">
        <div className="border-b border-slate-100 px-4 pb-4 pt-5">
          <Link
            href={canPublish ? "/console/reviews" : "/studio/published"}
            className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 transition-colors hover:text-[#14142b]"
          >
            <ArrowLeft size={14} />
            Back
          </Link>

          <p className="line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-[#14142b]">
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
              ].sort((a, b) => {
                const posA = a.kind === "lesson" ? a.item.position : a.position;
                const posB = b.kind === "lesson" ? b.item.position : b.position;
                return posA - posB;
              });

              return (
                <div key={mod.id} className="mb-1.5">
                  <button
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    className="flex w-full items-center gap-1.5 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-[#14142b] transition-colors hover:bg-slate-100/80"
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
                                ? "bg-[#14142b] font-semibold text-white shadow-[0_6px_14px_rgba(20,20,43,0.14)]"
                                : "font-medium text-slate-500 hover:bg-white hover:text-[#14142b]"
                            }`}
                          >
                            {selectedItem?.kind === "lesson" && selectedItem.id === item.item.id ? (
                              <CheckCircle2 size={13} className="shrink-0" />
                            ) : (
                              <BookOpen size={13} className="shrink-0 text-slate-400" />
                            )}
                            <span className="line-clamp-1">{item.item.title}</span>
                          </button>
                        ) : (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedItem({ kind: "quiz", id: item.id })}
                            className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[12px] transition-colors ${
                              selectedItem?.kind === "quiz" && selectedItem.id === item.id
                                ? "bg-[#14142b] font-semibold text-white shadow-[0_6px_14px_rgba(20,20,43,0.14)]"
                                : "font-medium text-slate-500 hover:bg-white hover:text-[#14142b]"
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
                              <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                                {quizStats[item.id].bestScore}/{quizStats[item.id].maxScore}
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
        </nav>
      </aside>

      {/* Content pane */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar: breadcrumb + tools */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200/70 bg-white/60 px-6 py-3.5 backdrop-blur-xl">
          <nav className="flex min-w-0 items-center gap-1.5 text-[12px]">
            <span className="truncate font-semibold text-slate-400">{course.title}</span>
            {selectedModule && (
              <>
                <span className="text-slate-300">/</span>
                <span className="truncate font-semibold text-slate-400">{selectedModule.title}</span>
              </>
            )}
            {(selectedLesson || selectedQuizTitle) && (
              <>
                <span className="text-slate-300">/</span>
                <span className="truncate font-bold text-[#14142b]">{crumbLabel}</span>
              </>
            )}
            {!selectedLesson && !selectedQuizTitle && (
              <>
                <span className="text-slate-300">/</span>
                <span className="font-bold text-[#14142b]">{crumbLabel}</span>
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
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {showUpdatedContent ? "Updated" : "Published"}
              </button>
            )}
            {canPublish && selectedLesson && onViewHistory && (
              <button
                type="button"
                onClick={() => onViewHistory(selectedLesson.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-[#14142b] transition-colors hover:border-slate-300 hover:bg-slate-50"
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
                    className="rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-[12px] font-semibold text-rose-600 transition-colors hover:bg-rose-100"
                  >
                    Reject
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsPublishDialogOpen(true)}
                  className="rounded-full bg-[#14142b] px-4 py-1.5 text-[12px] font-semibold text-white shadow-[0_6px_14px_rgba(20,20,43,0.16)] transition-colors hover:bg-[#232735]"
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
              <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-8 shadow-[0_8px_28px_rgba(20,20,43,0.05)]">
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
              <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_8px_28px_rgba(20,20,43,0.05)]">
                <QuizPlayer
                  key={selectedQuizId}
                  quizId={selectedQuizId}
                  onAttemptGraded={(attempt) => onAttemptGraded(attempt, selectedQuizId)}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                {course.coverImageUrl ? (
                  <div className="mb-8 aspect-video w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 shadow-[0_12px_32px_rgba(20,20,43,0.1)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.coverImageUrl}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="mb-8 flex aspect-video w-full max-w-lg items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                    <span className="text-[13px] font-medium text-slate-400">No cover image</span>
                  </div>
                )}
                <h2 className="mb-3 text-2xl font-bold tracking-tight text-[#14142b]">
                  {course.title}
                </h2>
                <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-[12px] font-semibold text-slate-500">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
                    {course.pricingModel === "PAID"
                      ? formatMoney(course.priceAmount ?? 0, course.currency ?? "USD")
                      : "Free"}
                  </span>
                  {course.examSchedule && (
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
                      Exam scheduled
                    </span>
                  )}
                  {canPublish && (
                    <span className="rounded-full border border-[#14142b]/15 bg-[#14142b] px-3 py-1.5 text-white">
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
            <div className="mb-3 flex h-[560px] w-[400px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_50px_rgba(20,20,43,0.18)] animate-in fade-in slide-in-from-bottom-4 duration-200">
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-xl bg-[#14142b] text-white">
                    <MessageSquare size={14} />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-[#14142b]">Reviewer feedback</p>
                    <p className="text-[10px] font-medium text-slate-400">Internal · this lesson</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
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
                ? "bg-slate-800 text-white"
                : "bg-[#14142b] text-white hover:bg-[#232735]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14142b]/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_60px_rgba(20,20,43,0.22)]">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-[16px] font-bold tracking-tight text-[#14142b]">Reject course</h2>
              <p className="mt-1 text-[12px] font-medium text-slate-500">
                The author will see this reason on their submission.
              </p>
            </div>
            <div className="px-6 py-5">
              <textarea
                className="h-32 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-[13px] text-[#14142b] outline-none transition-shadow placeholder:text-slate-400 focus:border-[#14142b]/25 focus:bg-white focus:ring-4 focus:ring-slate-200/70"
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
