// features/learning/delivery/api/publish.ts
// Author-only publishing controls for the D4 publishing domain — cut/list immutable course
// snapshots. See arcade-backend com.arcade.backend.publishing.*

import { api } from "@/lib/api";

export interface PublishResponse {
  versionId: string;
  versionNumber: number;
  publishedAt: string;
}

export interface CourseVersionSummary {
  id: string;
  versionNumber: number;
  label?: string;
  publishedAt: string;
}

export const publishService = {
  publish: (courseId: string, label?: string) =>
    api.post<PublishResponse>(`/api/courses/${courseId}/publish`, label ? { label } : {}),
  listVersions: (courseId: string) =>
    api.get<CourseVersionSummary[]>(`/api/courses/${courseId}/versions`),
};
