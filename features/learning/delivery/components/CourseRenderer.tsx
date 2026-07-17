// features/learning/delivery/components/CourseRenderer.tsx
// Coursera-style course view: module/lesson sidebar + a read-only content pane.
// Enroll/preview gating is deliberately skipped for now (see AGENTS.md D4 publishing gap) —
// this reads the live authoring tree directly, creator-only, as a stopgap.
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle2, ChevronDown, ChevronRight, FileQuestion } from "lucide-react";
import { courseDeliveryService } from "../api/courses";
import { TiptapContentView } from "./TiptapContentView";
import { QuizPlayer, getQuizStats, type QuizStatsResponse } from "@/features/assessment";
import { LessonReviewFeedback } from "./LessonReviewFeedback";
import { PublishCourseDialog } from "./PublishCourseDialog";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import type { CourseRenderResponse, LessonRenderResponse } from "@/types/api";

type TreeItem =
  | { kind: "lesson"; moduleId: string; item: LessonRenderResponse }
  | { kind: "quiz"; moduleId: string; id: string; title: string; position: number };

type SelectedItem = { kind: "lesson" | "quiz"; id: string } | null;

export function CourseRenderer({ courseId }: { courseId: string }) {
  const [course, setCourse] = useState<CourseRenderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());
  const [quizStats, setQuizStats] = useState<Record<string, QuizStatsResponse>>({});
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { user } = useAuthStore();

  const canPublish =
    user?.permissions.some((p) => p === "courses.review" || p === "channel.courses.review") ||
    user?.permissions.includes("ROLE_SUPER_USER");

  useEffect(() => {
    courseDeliveryService
      .renderCourse(courseId)
      .then((data) => {
        setCourse(data);
        const firstLesson = data.modules.find((m) => m.lessons.length > 0)?.lessons[0];
        setSelectedItem(firstLesson ? { kind: "lesson", id: firstLesson.id } : null);

        const quizIds = data.modules.flatMap((m) => m.quizzes.map((q) => q.id));
        if (quizIds.length > 0) {
          getQuizStats(quizIds)
            .then((stats) => {
              setQuizStats(Object.fromEntries(stats.map((s) => [s.quizId, s])));
            })
            .catch(() => {
              // Sidebar badges are a nice-to-have — a failed stats fetch shouldn't block the course.
            });
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load course"))
      .finally(() => setLoading(false));
  }, [courseId]);

  const selectedLesson = useMemo(() => {
    if (!course || selectedItem?.kind !== "lesson") return null;
    for (const mod of course.modules) {
      const found = mod.lessons.find((l) => l.id === selectedItem.id);
      if (found) return found;
    }
    return null;
  }, [course, selectedItem]);

  const selectedQuizId = selectedItem?.kind === "quiz" ? selectedItem.id : null;

  function toggleModule(moduleId: string) {
    setCollapsedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  const handlePublish = async () => {
    try {
      await api.post(`/api/courses/${courseId}/publish`, {});
      if (course) {
        setCourse({ ...course, status: "PUBLISHED" });
      }
    } catch (err) {
      alert("Failed to publish the course.");
    }
  };

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
        <Link href="/dashboard/content/published" className="text-sm text-indigo-600 hover:underline">
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
            href={canPublish ? "/dashboard/content/review" : "/dashboard/content/published"}
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
          {canPublish && course.status !== "PUBLISHED" && (
            <button
              onClick={() => setIsPublishDialogOpen(true)}
              className="mt-4 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              Publish Course
            </button>
          )}
          {course.status === "PUBLISHED" && (
            <div className="mt-4 w-full rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 text-center border border-green-200">
              Published
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
              <h2 className="mb-6 text-2xl font-bold text-gray-900">{selectedLesson.title}</h2>
              <TiptapContentView body={selectedLesson.body} emptyMessage="This lesson has no content yet." />
            </>
          ) : selectedQuizId ? (
            <QuizPlayer
              key={selectedQuizId}
              quizId={selectedQuizId}
              onAttemptGraded={(attempt) =>
                setQuizStats((prev) => {
                  const existing = prev[selectedQuizId];
                  const bestScore = Math.max(existing?.bestScore ?? -Infinity, attempt.score);
                  return {
                    ...prev,
                    [selectedQuizId]: {
                      quizId: selectedQuizId,
                      bestScore,
                      maxScore: attempt.maxScore,
                      attemptCount: (existing?.attemptCount ?? 0) + 1,
                    },
                  };
                })
              }
            />
          ) : (
            <p className="text-sm text-gray-400">Select a lesson from the sidebar to begin.</p>
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
                lessonId={selectedLesson.id}
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
        onConfirm={handlePublish}
      />
    </div>
  );
}
