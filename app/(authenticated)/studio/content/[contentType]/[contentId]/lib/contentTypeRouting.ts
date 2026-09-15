// Single source of truth for mapping the unified ContentSummary.type (from
// GET /api/content) to the lowercase route segment used under
// /studio/content/{contentType}/{contentId}, and for building the editor URL
// each type's existing (unchanged) editor lives at.

export type ContentTypeSegment = "course" | "event" | "exam";

const EVENT_TYPES = new Set(["WORKSHOP", "EVENT", "WEBINAR", "BOOTCAMP"]);

/** ContentSummary.type (e.g. "COURSE" | "WORKSHOP" | "EVENT" | ...) -> route segment, or null if unsupported. */
export function toContentTypeSegment(rawType: string): ContentTypeSegment | null {
  const type = rawType?.toUpperCase();
  if (type === "COURSE") return "course";
  if (type === "EXAM") return "exam";
  if (type && EVENT_TYPES.has(type)) return "event";
  return null;
}

export function contentOverviewHref(rawType: string, id: string): string | null {
  const segment = toContentTypeSegment(rawType);
  return segment ? `/studio/content/${segment}/${id}` : null;
}

/** The real, unchanged editor route for a given content id + route segment. */
export function editorHref(segment: ContentTypeSegment, id: string): string {
  switch (segment) {
    case "event":
      return `/studio/events/${id}/edit`;
    case "exam":
      return `/studio/exam/${id}/edit`;
    case "course":
      return `/studio/course/${id}/edit`;
  }
}

export const CONTENT_TYPE_LABEL: Record<ContentTypeSegment, string> = {
  course: "Course",
  event: "Event",
  exam: "Exam",
};

/** Real learner-facing preview route, or null when the type has none — never link to a route that doesn't exist. */
export function previewHref(segment: ContentTypeSegment, id: string): string | null {
  if (segment === "course") return `/studio/course/${id}/preview`;
  // An exam's preview is a tab on its overview, where a plan can be picked — a preview is
  // per-plan, so there is nothing meaningful to show at an exam-level route.
  return null;
}
