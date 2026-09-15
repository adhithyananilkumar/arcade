import { api } from "@/infrastructure/http/api";
import { submitEvent, duplicateEvent, archiveEvent } from "@/app/(authenticated)/studio/events/api/publish";
import { deleteEvent } from "@/app/(authenticated)/studio/events/api/dashboardApi";
import type { ContentTypeSegment } from "./contentTypeRouting";

// Every action here calls an existing, already-working endpoint — see the
// Content Workspace plan for the audited list. No new backend surface.

export function submitForReview(segment: ContentTypeSegment, contentId: string): Promise<unknown> {
  if (segment === "course") return api.post(`/api/courses/${contentId}/submit`);
  if (segment === "exam") {
    // Exams are not review-gated — they self-publish an immutable ExamVersion. Nothing should
    // offer "submit for review" for one; see supportsReviewSubmission.
    return Promise.reject(new Error("Exams are published directly, not submitted for review."));
  }
  return submitEvent(contentId);
}

/** Whether this content type goes through the Platform Review round before publishing. */
export function supportsReviewSubmission(segment: ContentTypeSegment): boolean {
  return segment !== "exam";
}

export function publishExam(contentId: string): Promise<unknown> {
  return api.post(`/api/exams/${contentId}/publish`, {});
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

// Exam is deliberately absent: authority over an exam comes from the channel
// (channel.exams.manage[.own]), not a per-exam collaborator list, so there is no endpoint here.
const COLLABORATORS_BASE: Partial<Record<ContentTypeSegment, (id: string) => string>> = {
  course: (id) => `/api/v1/courses/${id}/collaborators`,
  event: (id) => `/api/v1/events/${id}/collaborators`,
};

// Both domains share the exact same {email, role} invite contract —
// see InviteCollaboratorRequest, reused verbatim across course/event.
export function inviteCollaborator(
  segment: ContentTypeSegment,
  contentId: string,
  email: string,
  role: "OWNER" | "MANAGER" | "EDITOR" | "VIEWER"
) {
  const base = COLLABORATORS_BASE[segment];
  if (!base) {
    return Promise.reject(new Error(`${segment} content has no collaborator list.`));
  }
  return api.post(base(contentId), { email, role });
}
