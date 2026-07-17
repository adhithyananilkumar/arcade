// features/learning/delivery/api/courses.ts
// Read-only course delivery API — the renderer's only door into the backend.

import { api } from "@/lib/api";
import type { CourseRenderResponse } from "@/types/api";

export const courseDeliveryService = {
  renderCourse: (courseId: string) =>
    api.get<CourseRenderResponse>(`/api/courses/${courseId}/render`),
};
