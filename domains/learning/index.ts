/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Learning
 *
 * Purpose:
 * Exposes the public API for the Learning domain.
 *
 * Rules:
 * - Export only stable public APIs.
 * - Never export internal helpers.
 * - Never import from apps/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

export { default as TimeTracker } from './components/TimeTracker';
export { CourseRenderer } from './delivery/components/CourseRenderer';
export { TiptapContentView } from './delivery/components/TiptapContentView';
export { LessonReviewFeedback } from './delivery/components/LessonReviewFeedback';
export { AssessmentReviewQuestions } from './delivery/components/AssessmentReviewQuestions';
export { courseDeliveryService } from './delivery/api/courses';
export { courseReviewService } from './delivery/api/reviews';
export type { CourseReview, SubmitCourseReviewInput } from './delivery/api/reviews';
export { courseProgressService } from './progress/api/courseProgress';
export type { CourseProgress, EnrollmentStatus } from './progress/api/courseProgress';
export { ActivityService } from './activity/api/activity.service';
export type {
  ActivitySummary,
  DailyActivity,
  LearningSegment,
  LearningSegmentIngestResult,
} from './activity/api/activity.service';
export {
  activityKeys,
  useActivitySummaryQuery,
  useDailyActivityQuery,
} from './activity/api/activity.queries';
export { useLessonEngagementTracker } from './activity/api/useLessonEngagementTracker';

// Learner-side rich text styling, exported as part of the domain rather than deep-imported by
// each page that renders note or lesson bodies. `prose` is inert in this app (no
// @tailwindcss/typography) while preflight still flattens headings and strips list markers, so
// without this stylesheet a note's heading renders identically to a paragraph.
import './notes/components/rich-text.css';

export { NotesEditor } from './notes/components/NotesEditor';
export { notesService } from './notes/api/notes.service';
export {
  noteKeys,
  useContentNotesQuery,
  useUpsertNoteMutation,
  useDeleteNoteMutation,
} from './notes/api/notes.queries';
export { useNoteAutosave } from './notes/api/useNoteAutosave';
export type { NoteSaveStatus, NoteAutosaveAnchor } from './notes/api/useNoteAutosave';
export type {
  LearnerNote,
  LearnerNoteCollection,
  NoteContentType,
  UpsertNoteInput,
} from './notes/api/notes.service';