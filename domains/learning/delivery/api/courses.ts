// features/learning/delivery/api/courses.ts
// Read-only course delivery API — the renderer's only door into the backend.

import { api } from "@/lib/api";
import type { CourseRenderResponse } from "@/types/api";

export const courseDeliveryService = {
  /** Author-only live preview — the working copy, not what learners currently see. */
  renderCourse: (courseId: string) =>
    api.get<CourseRenderResponse>(`/api/courses/${courseId}/render`),
  /** Learner-facing: the immutable last-published snapshot. 404s until published once. */
  renderPublishedCourse: (courseId: string) =>
    api.get<CourseRenderResponse>(`/api/courses/${courseId}/published`),
};
