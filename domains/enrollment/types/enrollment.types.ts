/**
 * Mirrors the backend enum `com.arcade.backend.enrollment.shared.enums.ResourceType`.
 *
 * `WORKSHOP` was removed here to match it: the backend enum has only `{COURSE, EVENT}` and its own
 * Javadoc records that `EVENT` replaces `WORKSHOP` for all event-like content (workshop, webinar,
 * bootcamp). Sending `WORKSHOP` produced a 400, so the extra member was never a working option —
 * only a way for the type system to bless a request the server rejects.
 */
export type ResourceType = 'COURSE' | 'EVENT';

export type EnrollmentResultStatus = 'GRANTED' | 'PENDING_ACTION' | 'DENIED';

export interface EnrollmentResult {
  status: EnrollmentResultStatus;
  message?: string;
  reasonCode?: string;
  failedRequirement?: string;
  nextAction?: string;
  redirectUrl?: string;
  requestId?: string;
  recordId?: string;
}

export interface EnrollmentRequestDto {
  resourceType: ResourceType;
  resourceId: string;
  idempotencyKey: string;
}

// UI specific types mapping from projection status to EnrollmentButton initialState
export type UIEnrollmentState = 'ENROLLED' | 'WAITLISTED' | 'NOT_ENROLLED' | 'PENDING';

// ─────────────────────────────────────────────────────────────────────────────
// Learner read model — GET /api/v1/me/enrollments, /me/enrollments/{type}/{id},
// /me/events. These mirror the backend DTOs one-for-one; do not add fields here
// that the server does not send.
// ─────────────────────────────────────────────────────────────────────────────

/** Transactional enrollment status — `enrollment.shared.enums.EnrollmentStatus`. */
export type EnrollmentRecordStatus =
  | 'REQUESTED'
  | 'PENDING'
  | 'GRANTED'
  | 'DENIED'
  | 'REVOKED';

/** What the learner can do with the resource right now — `LearnerAccessState`. */
export type LearnerAccessState =
  | 'ACCESSIBLE'
  | 'PENDING_REQUIREMENTS'
  | 'REVOKED'
  | 'DENIED'
  | 'RESOURCE_UNAVAILABLE';

/** Progress bucket — `LearnerProgressState`. */
export type LearnerProgressState =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'NOT_APPLICABLE';

export interface LearnerEnrollmentSummary {
  enrollmentId: string;
  resourceType: ResourceType;
  resourceId: string;
  /** Null when the underlying resource no longer resolves. */
  title: string | null;
  /** Events only — courses are addressed by id. */
  slug: string | null;
  imageUrl: string | null;
  resourceStatus: string | null;
  enrollmentStatus: EnrollmentRecordStatus;
  accessState: LearnerAccessState;
  requiresPayment: boolean;
  denialReasonCode: string | null;
  progressState: LearnerProgressState;
  /**
   * 0-100, or null when there is no percent to show (unpublished course, no lessons, or an event).
   * A null is NOT 0 — do not coerce it with `?? 0`, render an absent state instead.
   */
  progressPercent: number | null;
  enrolledAt: string;
  grantedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface LearnerEnrollmentDetail {
  resourceType: ResourceType;
  resourceId: string;
  enrolled: boolean;
  /** Present only when `enrolled` is true. */
  enrollment: LearnerEnrollmentSummary | null;
}

export type EventTimeframe = 'UPCOMING' | 'PAST' | 'ALL';

export interface LearnerEventRegistration {
  enrollmentId: string;
  eventId: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  eventType: string;
  eventStatus: string;
  deliveryMode: string;
  enrollmentStatus: EnrollmentRecordStatus;
  registrationStatus: string | null;
  attendanceStatus: string | null;
  registeredAt: string;
  firstSessionStartsAt: string | null;
  lastSessionEndsAt: string | null;
  upcoming: boolean;
}

/** Spring Data `Page<T>` envelope, as returned by the paginated `/me` read endpoints. */
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface MyEnrollmentsQueryParams {
  resourceType?: ResourceType;
  /** Omit for the learner's active library; pass `['ALL']` for the full history. */
  status?: (EnrollmentRecordStatus | 'ALL')[];
  page?: number;
  /** Server clamps to 1..100. */
  size?: number;
  sort?: 'enrolledAt' | 'updatedAt' | 'grantedAt' | 'completedAt' | 'title' | 'dueDate' | string;
  direction?: 'asc' | 'desc';
}
