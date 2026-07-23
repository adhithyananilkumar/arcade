// features/learning/delivery/components/CourseRenderer.tsx
// Coursera-style course view: module/lesson sidebar + a read-only content pane.
// Enroll/preview gating is deliberately skipped for now (see AGENTS.md D4 publishing gap) —
// this reads the live authoring tree directly, creator-only, as a stopgap.
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle2, ChevronDown, ChevronRight, FileQuestion, History } from "lucide-react";
import { TiptapContentView } from "./TiptapContentView";
import { QuizPlayer, type QuizStatsResponse } from "@/domains/assessments";
import { LessonReviewFeedback } from "./LessonReviewFeedback";
import { PublishCourseDialog } from "./PublishCourseDialog";
import type { CourseRenderResponse, LessonRenderResponse } from "@/shared/types/api.types";

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
  onPublish: () => Promise<void>;
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
  mode,
  isFeedbackOpen,
  setIsFeedbackOpen,
  comments,
  commentsLoading,
  commentsError,
  onAddComment,
  onViewHistory,
  currentUser
}: CourseRendererProps) {
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const selectedLesson = useMemo(() => {
    if (!course || selectedItem?.kind !== "lesson") return null;
    for (const mod of course.modules) {
      const found = mod.lessons.find((l) => l.id === selectedItem.id);
      if (found) return found;
    }
    return null;
  }, [course, selectedItem]);

  const selectedQuizId = selectedItem?.kind === "quiz" ? selectedItem.id : null;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-gray-400">
        Loading course…
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-red-500">{error ?? "Course not found"}</p>
        <Link href="/content/published" className="text-sm text-indigo-600 hover:underline">
          Back to Published Courses
        </Link>
      </div>
    );
  }
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="flex w-80 flex-shrink-0 flex-col border-r border-gray-200 bg-gray-50">
        <div className="border-b border-gray-200 px-5 py-4">
          <Link
            href={canPublish ? "/content/review" : "/content/published"}
            className="mb-3 flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
          <h1 className="text-base font-bold leading-snug text-gray-900">{course.title}</h1>
          {course.description && (
            <p className="mt-1 text-xs leading-relaxed text-gray-500 line-clamp-3">
              {course.description}
            </p>
          )}
          {canPublish && (course.status === "SUBMITTED" || course.status === "APPROVED") && (
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => setIsPublishDialogOpen(true)}
                className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Approve & Publish
              </button>
              {onReject && (
                <button
                  onClick={() => setIsRejectDialogOpen(true)}
                  className="w-full rounded-lg bg-red-50 text-red-600 px-3 py-2 text-sm font-semibold hover:bg-red-100 transition-colors border border-red-200"
                >
                  Reject Course
                </button>
              )}
            </div>
          )}
          {course.status === "PUBLISHED" && (
            <div className="mt-4 w-full rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 text-center border border-green-200">
              Published
            </div>
          )}
          {course.status === "REJECTED" && (
            <div className="mt-4 w-full rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 text-center border border-red-200">
              Rejected
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {course.modules.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-gray-400">
              This course has no modules yet.
            </p>
          ) : (
            course.modules.map((mod) => {
              const collapsed = collapsedModules.has(mod.id);
              const items: TreeItem[] = [
                ...mod.lessons.map((l): TreeItem => ({ kind: "lesson", moduleId: mod.id, item: l })),
                ...mod.quizzes.map(
                  (q): TreeItem => ({
                    kind: "quiz",
                    moduleId: mod.id,
                    id: q.id,
                    title: q.title,
                    position: q.position,
                  })
                ),
              ].sort((a, b) => {
                const posA = a.kind === "lesson" ? a.item.position : a.position;
                const posB = b.kind === "lesson" ? b.item.position : b.position;
                return posA - posB;
              });

              return (
                <div key={mod.id} className="mb-2">
                  <button
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    className="flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-left text-sm font-semibold text-gray-800 hover:bg-gray-100"
                  >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    {mod.title}
                  </button>
                  {!collapsed && (
                    <div className="ml-3 border-l border-gray-200 pl-2">
                      {items.map((item) =>
                        item.kind === "lesson" ? (
                          <button
                            key={item.item.id}
                            type="button"
                            onClick={() => setSelectedItem({ kind: "lesson", id: item.item.id })}
                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                              selectedItem?.kind === "lesson" && selectedItem.id === item.item.id
                                ? "bg-indigo-50 font-semibold text-indigo-700"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {selectedItem?.kind === "lesson" && selectedItem.id === item.item.id ? (
                              <CheckCircle2 size={13} className="flex-shrink-0 text-indigo-500" />
                            ) : (
                              <BookOpen size={13} className="flex-shrink-0 text-gray-400" />
                            )}
                            <span className="line-clamp-1">{item.item.title}</span>
                          </button>
                        ) : (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedItem({ kind: "quiz", id: item.id })}
                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                              selectedItem?.kind === "quiz" && selectedItem.id === item.id
                                ? "bg-indigo-50 font-semibold text-indigo-700"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            <FileQuestion
                              size={13}
                              className={`flex-shrink-0 ${
                                selectedItem?.kind === "quiz" && selectedItem.id === item.id
                                  ? "text-indigo-500"
                                  : "text-gray-400"
                              }`}
                            />
                            <span className="line-clamp-1 flex-1">{item.title}</span>
                            {quizStats[item.id]?.bestScore != null && (
                              <span className="flex-shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">
                                {quizStats[item.id].bestScore}/{quizStats[item.id].maxScore}
                              </span>
                            )}
                          </button>
                        )
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
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-10 py-10">
          {selectedLesson ? (
            <>
              <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedLesson.title}</h2>
                {canPublish && onViewHistory && (
                  <button
                    onClick={() => onViewHistory(selectedLesson.id)}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  >
                    <History size={14} />
                    View Edit History
                  </button>
                )}
              </div>
              <TiptapContentView body={selectedLesson.body} emptyMessage="This lesson has no content yet." />
            </>
          ) : selectedQuizId ? (
            <QuizPlayer
              key={selectedQuizId}
              quizId={selectedQuizId}
              onAttemptGraded={(attempt) => onAttemptGraded(attempt, selectedQuizId)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center pt-10">
              {course.coverImageUrl ? (
                <div className="w-full max-w-lg aspect-video rounded-xl overflow-hidden shadow-lg mb-8 border border-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={course.coverImageUrl} alt={course.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full max-w-lg aspect-video rounded-xl bg-gray-100 flex items-center justify-center mb-8 border border-gray-200">
                  <span className="text-gray-400 font-medium">No cover image</span>
                </div>
              )}
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h2>
              <div className="flex items-center gap-4 text-sm font-medium text-gray-500 mb-8 bg-gray-50 px-6 py-3 rounded-full border border-gray-100">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  {course.pricingModel === 'PAID' ? `$${course.priceAmount?.toFixed(2)}` : 'Free Course'}
                </span>
                {course.examSchedule && (
                   <>
                    <span className="text-gray-300">•</span>
                    <span>Exam scheduled</span>
                  </>
                )}
                {canPublish && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-indigo-600">Review Mode</span>
                  </>
                )}
              </div>
              <p className="text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">{course.description || "No description provided."}</p>
              
              <p className="text-sm text-gray-400 font-medium">Select a lesson from the sidebar to begin.</p>
            </div>
          )}
        </div>
      </main>

      {selectedLesson && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {isFeedbackOpen && (
            <div className="mb-4 w-[400px] h-[550px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-200">
              <div className="bg-gray-900 px-4 py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 text-white">
                  <span className="font-semibold text-sm">Reviewer Feedback</span>
                </div>
                <button
                  onClick={() => setIsFeedbackOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="text-xl leading-none">&times;</span>
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
                className="flex-1 min-h-0"
              />
            </div>
          )}
          <button
            onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
            className={`flex items-center justify-center rounded-full p-4 shadow-lg transition-transform hover:scale-105 active:scale-95 font-semibold text-sm ${
              isFeedbackOpen ? "bg-gray-900 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {isFeedbackOpen ? "Close Feedback" : "Reviewer Feedback"}
          </button>
        </div>
      )}

      <PublishCourseDialog
        open={isPublishDialogOpen}
        onClose={() => setIsPublishDialogOpen(false)}
        onConfirm={onPublish}
      />

      {isRejectDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Reject Course</h2>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for rejecting this course. The author will see this comment.
            </p>
            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none mb-4"
              placeholder="E.g., The audio quality in module 2 is poor..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                onClick={() => setIsRejectDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
                disabled={!rejectReason.trim()}
                onClick={() => {
                  if (onReject) {
                    onReject(rejectReason).then(() => {
                      setIsRejectDialogOpen(false);
                      setRejectReason("");
                    });
                  }
                }}
              >
                Reject Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
