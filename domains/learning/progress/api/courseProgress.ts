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
  getCourseProgress: (courseId: string) =>
    api.get<CourseProgress>(`/api/v1/learning/progress/courses/${courseId}`),
  markLessonComplete: (courseId: string, lessonId: string) =>
    api.post<CourseProgress>(
      `/api/v1/learning/progress/courses/${courseId}/lessons/${lessonId}/complete`
    ),
};
