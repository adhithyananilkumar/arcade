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
export { courseDeliveryService } from './delivery/api/courses';