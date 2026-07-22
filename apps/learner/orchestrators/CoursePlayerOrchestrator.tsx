"use client";

import { useEffect, useState } from "react";
import { CourseRenderer, courseDeliveryService } from "@/domains/learning";
import { getQuizStats, type QuizStatsResponse } from "@/domains/assessments";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import { api } from "@/infrastructure/http/api";
import type { CourseRenderResponse } from "@/shared/types/api.types";

type SelectedItem = { kind: "lesson" | "quiz"; id: string } | null;

export function CoursePlayerOrchestrator({ courseId, mode }: { courseId: string; mode?: string }) {
  const [course, setCourse] = useState<CourseRenderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());
  const [quizStats, setQuizStats] = useState<Record<string, QuizStatsResponse>>({});
  const { user } = useAuthStore();

  const canPublish =
    user?.permissions?.some((p) => p === "courses.review" || p === "channel.courses.review") ||
    user?.permissions?.includes("ROLE_SUPER_USER");

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
      await api.post(`/api/courses/${courseId}/approve`, {});
      if (course) {
        setCourse({ ...course, status: "PUBLISHED" });
      }
    } catch (err) {
      alert("Failed to publish the course.");
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await api.post(`/api/courses/${courseId}/reject`, { reason });
      if (course) {
        setCourse({ ...course, status: "REJECTED" });
      }
    } catch (err) {
      alert("Failed to reject the course.");
    }
  };

  const handleAttemptGraded = (attempt: any, quizId: string) => {
    setQuizStats((prev) => {
      const existing = prev[quizId];
      const bestScore = Math.max(existing?.bestScore ?? -Infinity, attempt.score);
      return {
        ...prev,
        [quizId]: {
          quizId: quizId,
          bestScore,
          maxScore: attempt.maxScore,
          attemptCount: (existing?.attemptCount ?? 0) + 1,
        },
      };
    });
  };

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedItem?.kind === 'lesson' && isFeedbackOpen) {
      setCommentsLoading(true);
      setCommentsError(null);
      api
        .get<any[]>(`/api/lessons/${selectedItem.id}/comments`)
        .then(setComments)
        .catch(() => setCommentsError("You do not have access to view reviewer feedback."))
        .finally(() => setCommentsLoading(false));
    }
  }, [selectedItem?.id, isFeedbackOpen]);

  const handleAddComment = async (content: string) => {
    if (selectedItem?.kind !== 'lesson') return;
    try {
      const added = await api.post<any>(
        `/api/lessons/${selectedItem.id}/comments`,
        { content }
      );
      setComments((prev) => [...prev, added]);
    } catch (err) {
      alert("Failed to post feedback.");
    }
  };

  return (
    <CourseRenderer
      course={course}
      loading={loading}
      error={error}
      selectedItem={selectedItem}
      setSelectedItem={setSelectedItem}
      collapsedModules={collapsedModules}
      toggleModule={toggleModule}
      quizStats={quizStats}
      canPublish={!!canPublish}
      onPublish={handlePublish}
      onReject={handleReject}
      onAttemptGraded={handleAttemptGraded}
      mode={mode}
      isFeedbackOpen={isFeedbackOpen}
      setIsFeedbackOpen={setIsFeedbackOpen}
      comments={comments}
      commentsLoading={commentsLoading}
      commentsError={commentsError}
      onAddComment={handleAddComment}
      currentUser={user}
    />
  );
}
