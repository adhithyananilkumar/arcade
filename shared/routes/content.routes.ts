/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Shared
 * Module: Routes
 *
 * Purpose:
 * The single source of truth for learner-facing content URLs.
 *
 * Rules:
 * - Framework-agnostic: plain string builders, no Next.js imports.
 * - Every link to a content surface is built here, never hand-assembled.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

/**
 * Content-type-first URLs.
 *
 * <p>These replace the old `/learn/**` space, which had grown three different shapes for the same
 * idea: `/learn/{courseId}` (a second course landing page duplicating `/courses/{id}`),
 * `/learn/{courseId}/learn` (the player, at a path that says "learn" twice and names no lesson),
 * and `/learn/exam/{examId}` (already content-type-first, and the one that read correctly). Events
 * meanwhile lived at `/events/{slug}/learn` and matched none of it.
 *
 * <p>The rule now is one space per content type, with the learner surfaces nested under the thing
 * they belong to:
 *
 * <pre>
 *   /courses/{id}                    the public landing page
 *   /courses/{id}/learn              the overview hub  (enrolled)
 *   /courses/{id}/learn/{lessonId}   the player        (enrolled)
 *   /courses/{id}/notes              the notes workspace
 *
 *   /events/{slug}                   the public landing page
 *   /events/{slug}/learn             the overview hub  (enrolled)
 *   /events/{slug}/notes             the notes workspace
 *
 *   /exams/{id}                      exam landing, and its attempt/result surfaces
 * </pre>
 *
 * <p>A lesson now appears in the path rather than in `?lesson=`, so a lesson link is a real
 * address: shareable, bookmarkable, and meaningful in history. Exams get their own top-level
 * space rather than nesting under courses, because a standalone or certification exam has no
 * parent course to nest under — the enrollment model has an `EXAM` resource type for exactly that.
 */

export const courseRoutes = {
  landing: (courseId: string) => `/courses/${courseId}`,
  /** The overview hub — where "Go to course" lands after enrolling. */
  overview: (courseId: string) => `/courses/${courseId}/learn`,
  lesson: (courseId: string, lessonId: string) => `/courses/${courseId}/learn/${lessonId}`,
  notes: (courseId: string) => `/courses/${courseId}/notes`,
  exam: (examId: string) => examRoutes.landing(examId),
} as const;

export const eventRoutes = {
  landing: (slug: string) => `/events/${slug}`,
  overview: (slug: string) => `/events/${slug}/learn`,
  session: (slug: string, sessionId: string) => `/events/${slug}/learn/${sessionId}`,
  notes: (slug: string) => `/events/${slug}/notes`,
} as const;

export const examRoutes = {
  landing: (examId: string) => `/exams/${examId}`,
  attempt: (examId: string) => `/exams/${examId}/attempt`,
  results: (examId: string, attemptId: string) => `/exams/${examId}/results?attemptId=${attemptId}`,
  terminated: (examId: string) => `/exams/${examId}/terminated`,
  /**
   * A grade card issued by an attempt.
   *
   * <p>Note: no page serves this path yet. The link predates this route module — the old code
   * pointed at `/learn/grade-card/{id}`, which had no page either — so this preserves the existing
   * (broken) behaviour in the new URL space rather than silently dropping the link. Building the
   * page is tracked separately.
   */
  gradeCard: (gradeCardId: string) => `/exams/grade-cards/${gradeCardId}`,
} as const;

/**
 * The overview hub for an enrolled resource, whichever type it is — what a listing row or a
 * "continue" button should link to when it only knows the enrollment.
 *
 * <p>Events are addressed by slug where they have one and by id otherwise, which is why this takes
 * the identifier rather than deriving it.
 */
export function contentOverviewRoute(
  resourceType: 'COURSE' | 'EVENT' | 'EXAM',
  identifier: string,
): string {
  switch (resourceType) {
    case 'COURSE':
      return courseRoutes.overview(identifier);
    case 'EVENT':
      return eventRoutes.overview(identifier);
    case 'EXAM':
      return examRoutes.landing(identifier);
  }
}
