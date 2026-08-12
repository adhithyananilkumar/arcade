import { api } from "@/infrastructure/http/api";
import { roadmapService } from "@/domains/roadmaps";
import { submitEvent, duplicateEvent, archiveEvent } from "@/app/(authenticated)/studio/events/api/publish";
import { deleteEvent } from "@/app/(authenticated)/studio/events/api/dashboardApi";
import type { ContentTypeSegment } from "./contentTypeRouting";

// Every action here calls an existing, already-working endpoint — see the
// Content Workspace plan for the audited list. No new backend surface.

export function submitForReview(segment: ContentTypeSegment, contentId: string): Promise<unknown> {
  if (segment === "course") return api.post(`/api/courses/${contentId}/submit`);
  if (segment === "roadmap") return roadmapService.submitRoadmap(contentId);
  return submitEvent(contentId);
}

export interface DuplicateAction {
  run: (contentId: string) => Promise<{ id: string }>;
}

// Only content types with a real duplicate endpoint get one — course has none.
export const DUPLICATE_ACTION: Partial<Record<ContentTypeSegment, DuplicateAction>> = {
  roadmap: { run: (id) => roadmapService.duplicateRoadmap(id) as Promise<{ id: string }> },
  event: { run: (id) => duplicateEvent(id) as Promise<{ id: string }> },
};

// Only event has a real archive endpoint today.
export const ARCHIVE_ACTION: Partial<Record<ContentTypeSegment, () => Promise<void>>> = {};
export function archiveContent(segment: ContentTypeSegment, contentId: string): Promise<void> | null {
  if (segment === "event") return archiveEvent(contentId);
  return null;
}

export function deleteContent(
  segment: ContentTypeSegment,
  contentId: string,
  confirmTitle: string
): Promise<void> | null {
  if (segment === "course") return api.delete<void>(`/api/courses/${contentId}`, { confirmTitle });
  if (segment === "roadmap") return roadmapService.deleteRoadmap(contentId);
  if (segment === "event") return deleteEvent(contentId);
  return null;
}

export const SUPPORTS_TITLE_CONFIRM_DELETE: Partial<Record<ContentTypeSegment, boolean>> = {
  course: true,
};

const COLLABORATORS_BASE: Record<ContentTypeSegment, (id: string) => string> = {
  course: (id) => `/api/v1/courses/${id}/collaborators`,
  roadmap: (id) => `/api/roadmaps/${id}/collaborators`,
  event: (id) => `/api/v1/events/${id}/collaborators`,
};

// All three domains share the exact same {email, role} invite contract —
// see InviteCollaboratorRequest, reused verbatim across course/roadmap/event.
export function inviteCollaborator(
  segment: ContentTypeSegment,
  contentId: string,
  email: string,
  role: "OWNER" | "MANAGER" | "EDITOR" | "VIEWER"
) {
  return api.post(COLLABORATORS_BASE[segment](contentId), { email, role });
}
