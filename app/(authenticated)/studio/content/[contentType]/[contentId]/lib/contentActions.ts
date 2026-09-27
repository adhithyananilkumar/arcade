import { api } from "@/infrastructure/http/api";
import { submitEvent, duplicateEvent, archiveEvent } from "@/domains/events/api/publish";
import { deleteEvent } from "@/domains/events/api/dashboardApi";
import type { ContentTypeSegment } from "./contentTypeRouting";

// Every action here calls an existing, already-working endpoint — see the
// Content Workspace plan for the audited list. No new backend surface.

export function submitForReview(segment: ContentTypeSegment, contentId: string): Promise<unknown> {
  if (segment === "course") return api.post(`/api/courses/${contentId}/submit`);
  // A standalone exam is reviewed like any other content. The server refuses a tied one.
  if (segment === "exam") return api.post(`/api/exams/${contentId}/submit`, {});
  return submitEvent(contentId);
}

/**
 * Whether this content goes through the Platform Review round itself. Every type does, except an
 * exam tied to a course or event — that one is reviewed and published with its parent.
 */
export function supportsReviewSubmission(segment: ContentTypeSegment, tiedExam = false): boolean {
  return !(segment === "exam" && tiedExam);
}

export interface DuplicateAction {
  run: (contentId: string) => Promise<{ id: string }>;
}

// Only content types with a real duplicate endpoint get one — course has none.
export const DUPLICATE_ACTION: Partial<Record<ContentTypeSegment, DuplicateAction>> = {
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
  if (segment === "event") return deleteEvent(contentId);
  // Exam has no delete endpoint yet (DELETE /api/exams/{id} doesn't exist) — returning null keeps
  // the action out of the menu rather than wiring a button to a 404.
  return null;
}

export const SUPPORTS_TITLE_CONFIRM_DELETE: Partial<Record<ContentTypeSegment, boolean>> = {
  course: true,
};

const OWNER_TYPE: Record<ContentTypeSegment, "COURSE" | "EVENT" | "EXAM"> = {
  course: "COURSE",
  event: "EVENT",
  exam: "EXAM",
};

/** The one Team-tab endpoint every content type shares — see backend ContentCollaborationController. */
export function collaboratorsPath(segment: ContentTypeSegment, contentId: string): string {
  return `/api/v1/content/${OWNER_TYPE[segment]}/${contentId}/collaborators`;
}

// Every owner type shares the exact same {email, role} invite contract —
// see InviteCollaboratorRequest.
export function inviteCollaborator(
  segment: ContentTypeSegment,
  contentId: string,
  email: string,
  role: "OWNER" | "MANAGER" | "EDITOR" | "VIEWER"
) {
  return api.post(collaboratorsPath(segment, contentId), { email, role });
}
