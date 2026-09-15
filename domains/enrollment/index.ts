/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Enrollment
 *
 * Purpose:
 * Exposes the public API for the Enrollment domain — the write path
 * (enroll / revoke / resume) and the learner self-service read model
 * (/api/v1/me/enrollments, /api/v1/me/events).
 *
 * Rules:
 * - Export only stable public APIs.
 * - Never export internal helpers.
 * - Never import from apps/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

export { EnrollmentButton } from './components/EnrollmentButton';

export { EnrollmentService } from './api/enrollment.service';
export { MyEnrollmentsService } from './api/myEnrollments.service';
export {
  myEnrollmentKeys,
  useMyEnrollmentsQuery,
  useMyEnrollmentForResourceQuery,
  useMyEventsQuery,
} from './api/myEnrollments.queries';

export type {
  ResourceType,
  EnrollmentResult,
  EnrollmentResultStatus,
  EnrollmentRequestDto,
  UIEnrollmentState,
  EnrollmentRecordStatus,
  LearnerAccessState,
  LearnerProgressState,
  LearnerEnrollmentSummary,
  LearnerEnrollmentDetail,
  LearnerEventRegistration,
  EventTimeframe,
  PagedResponse,
  MyEnrollmentsQueryParams,
} from './types/enrollment.types';
