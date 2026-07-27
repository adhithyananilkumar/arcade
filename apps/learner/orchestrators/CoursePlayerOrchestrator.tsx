"use client";

import { useEffect, useState } from "react";
import { CourseRenderer, courseDeliveryService } from "@/domains/learning";
import { getQuizStats, type QuizStatsResponse } from "@/domains/assessments";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import { AuthorizationService } from "@/infrastructure/auth/authorization.service";
import { platformReviewApi } from "@/domains/publishing";
import type { CourseRenderResponse } from "@/shared/types/api.types";
import { VersionHistoryOrchestrator } from "@/apps/creator/orchestrators/VersionHistoryOrchestrator";
import { ArcadeEditor } from "@/apps/creator/editor";
import { api } from "@/infrastructure/http/api";

type SelectedItem = { kind: "lesson" | "quiz"; id: string } | null;

export function CoursePlayerOrchestrator({ courseId, mode }: { courseId: string; mode?: string }) {
  const [course, setCourse] = useState<CourseRenderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());
  const [quizStats, setQuizStats] = useState<Record<string, QuizStatsResponse>>({});
  const { user } = useAuthStore();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLessonId, setHistoryLessonId] = useState<string | null>(null);
  const [publishedCourse, setPublishedCourse] = useState<CourseRenderResponse | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);

  const canPublish = AuthorizationService.canReviewContent(user);

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

  useEffect(() => {
    if (canPublish) {
      api
        .get<CourseRenderResponse>(`/api/courses/${courseId}/render?publishedOnly=true`)
        .then((pubData) => setPublishedCourse(pubData ?? null))
        .catch(() => setPublishedCourse(null));
      platformReviewApi
        .byContent("COURSE", courseId)
        .then((r) => setReviewId(r.id))
        .catch(() => setReviewId(null));
    } else {
      setPublishedCourse(null);
      setReviewId(null);
    }
  }, [courseId, canPublish]);

  function toggleModule(moduleId: string) {
    setCollapsedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  const handlePublish = async (note: string) => {
    try {
      if (reviewId) {
        await platformReviewApi.decide(reviewId, { decision: "APPROVE", note });
      } else {
        await api.post(`/api/courses/${courseId}/approve`, { note });
      }
      if (course) {
        setCourse({ ...course, status: "PUBLISHED" });
      }
    } catch {
      throw new Error("Failed to publish the course.");
    }
  };

  const handleReject = async (reason: string) => {
    try {
      if (reviewId) {
        await platformReviewApi.decide(reviewId, {
          decision: "REQUEST_CHANGES",
          reason,
        });
      } else {
        await api.post(`/api/courses/${courseId}/reject`, { reason });
      }
      if (course) {
        setCourse({ ...course, status: "REJECTED" });
      }
    } catch {
      throw new Error("Failed to reject the course.");
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
    if (selectedItem?.kind === 'lesson' && isFeedbackOpen && reviewId) {
      setCommentsLoading(true);
      setCommentsError(null);
      platformReviewApi
        .listComments(reviewId, "LESSON", selectedItem.id)
        .then((rows) =>
          setComments(
            rows.map((c) => ({
              id: c.id,
              lessonId: c.targetId,
              authorId: c.authorId,
              authorName: c.authorName,
              content: c.body,
              createdAt: c.createdAt,
            }))
          )
        )
        .catch(() => setCommentsError("You do not have access to view reviewer feedback."))
        .finally(() => setCommentsLoading(false));
    }
  }, [selectedItem?.id, isFeedbackOpen, reviewId]);

  const handleAddComment = async (content: string) => {
    if (selectedItem?.kind !== 'lesson' || !reviewId) return;
    try {
      const added = await platformReviewApi.addComment(reviewId, {
        targetType: "LESSON",
        targetId: selectedItem.id,
        body: content,
      });
      setComments((prev) => [
        ...prev,
        {
          id: added.id,
          lessonId: added.targetId,
          authorId: added.authorId,
          authorName: added.authorName,
          content: added.body,
          createdAt: added.createdAt,
        },
      ]);
    } catch (err) {
      alert("Failed to post feedback.");
    }
  };

  return (
    <>
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
        publishedCourse={publishedCourse}
        onPublish={handlePublish}
        onReject={handleReject}
        onAttemptGraded={handleAttemptGraded}
        mode={mode}
        isFeedbackOpen={isFeedbackOpen}
        setIsFeedbackOpen={setIsFeedbackOpen}
        comments={comments}
        commentsLoading={commentsLoading}
        commentsError={commentsError ?? undefined}
        onAddComment={handleAddComment}
        currentUser={user ? { id: user.id, name: `${user.firstName} ${user.lastName}`, avatarUrl: user.avatarUrl ?? undefined } : undefined}
        onViewHistory={(lessonId) => {
          setHistoryLessonId(lessonId || (selectedItem?.kind === "lesson" ? selectedItem.id : course?.modules[0]?.lessons[0]?.id) || "");
          setHistoryOpen(true);
        }}
      />
      {historyOpen && (
        <VersionHistoryOrchestrator
          lessonId={historyLessonId || (selectedItem?.kind === "lesson" ? selectedItem.id : course?.modules[0]?.lessons[0]?.id) || ""}
          courseId={courseId}
          isSuView={!!canPublish}
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          refreshKey={0}
          onRestore={async () => {
             setHistoryOpen(false);
          }}
          renderEditor={(previewDoc, selectedId) => (
            <ArcadeEditor
              key={selectedId}
              readOnly
              initialContent={previewDoc}
              className="bg-white"
            />
          )}
        />
      )}
    </>
  );
}
