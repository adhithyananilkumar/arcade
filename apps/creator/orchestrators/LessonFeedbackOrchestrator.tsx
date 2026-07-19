"use client";

import { useEffect, useState } from "react";
import { LessonReviewFeedback } from "@/domains/learning";
import { api } from "@/infrastructure/http/api";
import { useAuthStore } from "@/infrastructure/auth/auth.store";

export function LessonFeedbackOrchestrator({ 
  lessonId, 
  className 
}: { 
  lessonId: string; 
  className?: string;
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (lessonId) {
      setCommentsLoading(true);
      setCommentsError(null);
      api
        .get<any[]>(`/api/v1/lessons/${lessonId}/comments`) // Wait, is it /api/v1/lessons or /api/lessons?
        // CoursePlayerOrchestrator used `/api/lessons/${selectedItem.id}/comments`
        // so I'll use `/api/lessons` which points to `ContentDraftController` or `RoadmapCommentController`
        // Actually, let's use `/api/lessons/${lessonId}/comments`
        .then(setComments)
        .catch(() => setCommentsError("You do not have access to view reviewer feedback."))
        .finally(() => setCommentsLoading(false));
    }
  }, [lessonId]);

  const handleAddComment = async (content: string) => {
    try {
      const added = await api.post<any>(
        `/api/lessons/${lessonId}/comments`,
        { content }
      );
      setComments((prev) => [...prev, added]);
    } catch (err) {
      alert("Failed to post feedback.");
    }
  };

  return (
    <LessonReviewFeedback
      className={className}
      comments={comments}
      loading={commentsLoading}
      error={commentsError}
      onAddComment={handleAddComment}
      currentUser={user}
    />
  );
}
