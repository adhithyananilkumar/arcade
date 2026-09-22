// domains/learning/progress/api/courseProgress.ts
// Enrollment-anchored lesson/course progress — mark a lesson complete, read rollup progress.

import { api } from "@/infrastructure/http/api";

export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "DROPPED";

export type CourseProgress = {
  completedLessons: number;
  totalLessons: number;
  percent: number;
  enrollmentStatus: EnrollmentStatus;
  completedLessonIds: string[];
};

export const courseProgressService = {
  /**
   * @param expectForbidden when the caller is using this as an entitlement probe and a 403 is one
   *   of the answers it is asking for, not a fault. Suppresses the console error only; the call
   *   still rejects.
   */
  getCourseProgress: (courseId: string, expectForbidden = false) =>
    api.get<CourseProgress>(
      `/api/v1/learning/progress/courses/${courseId}`,
      expectForbidden ? { expectedStatuses: [403] } : undefined,
    ),
  markLessonComplete: (courseId: string, lessonId: string) =>
    api.post<CourseProgress>(
      `/api/v1/learning/progress/courses/${courseId}/lessons/${lessonId}/complete`
    ),
};
