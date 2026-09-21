// features/learning/delivery/api/reviews.ts
// Learner course reviews and the aggregate ratings the discovery surfaces show.
// See arcade-backend com.arcade.backend.learning.interaction.*

import { api } from "@/infrastructure/http/api";
import type { CourseReviewStats } from "@/shared/types/api.types";

export interface CourseReview {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string | null;
  reviewText?: string | null;
  rating: number;
  createdAt: string;
}

export interface SubmitCourseReviewInput {
  /** Required, 1–5. The server rejects anything outside that range. */
  rating: number;
  reviewText?: string;
}

/**
 * Batched in chunks because the stats endpoint caps how many course ids it answers for in one
 * call — an Explore page showing more courses than that would otherwise silently lose the
 * ratings for everything past the cap.
 */
const MAX_IDS_PER_REQUEST = 200;

export const courseReviewService = {
  /**
   * Submitting again replaces this learner's earlier rating rather than adding a second one,
   * so this is safe to call whenever the feedback form is completed.
   */
  submit: (courseId: string, input: SubmitCourseReviewInput) =>
    api.post<CourseReview>(`/api/v1/learning/courses/${courseId}/reviews`, input),

  /** Every review on a course — author-facing, requires course-read authority. */
  listForCourse: (courseId: string) =>
    api.get<CourseReview[]>(`/api/courses/${courseId}/reviews`),

  /**
   * The same reviews, readable signed out — what the course landing page shows. Carries only
   * what a reviewer chose to publish; no contact details.
   */
  listPublicForCourse: (courseId: string) =>
    api.get<CourseReview[]>(`/api/v1/public/courses/${courseId}/reviews`),

  /**
   * Aggregate rating per course id. Public: Explore and the course landing page are browsable
   * signed out. Courses with no reviews are simply absent from the result.
   */
  async statsFor(courseIds: string[]): Promise<Record<string, CourseReviewStats>> {
    const ids = Array.from(new Set(courseIds.filter(Boolean)));
    if (ids.length === 0) return {};

    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += MAX_IDS_PER_REQUEST) {
      chunks.push(ids.slice(i, i + MAX_IDS_PER_REQUEST));
    }

    const results = await Promise.all(
      chunks.map((chunk) =>
        api.get<Record<string, CourseReviewStats>>(
          `/api/v1/public/reviews/stats?courseIds=${chunk.join(",")}`
        )
      )
    );
    return Object.assign({}, ...results);
  },
};
