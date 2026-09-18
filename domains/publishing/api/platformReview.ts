import { api } from "@/infrastructure/http/api";

export type ContentType =
  | "COURSE"
  | "EVENT"
  | "WORKSHOP"
  | "ARTICLE"
  | "WEBINAR"
  | "BOOTCAMP"
  | "LEARNING_PATH"
  | "RESOURCE"
  | "ASSESSMENT";

/**
 * A position in the review state machine.
 *
 * Replaces the old `tier: 'ORG' | 'GLOBAL'`. "GLOBAL" described who could look at a review;
 * a stage describes where it is, which is what the UI actually needs in order to say what
 * approving will do.
 */
export type ReviewStage = "ORG_REVIEW" | "PLATFORM_REVIEW";

export type ReviewStatus =
  | "OPEN"
  | "CHANGES_REQUESTED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

/** REASSIGN / ESCALATE / CLOSE were removed — escalation is derived, never submitted. */
export type ReviewDecisionType = "APPROVE" | "REQUEST_CHANGES" | "REJECT" | "CANCEL";

export type SubmissionKind = "FIRST_PUBLICATION" | "UPDATE";

export type ReviewBypassReason =
  | "ORG_STAGE_NOT_APPLICABLE"
  | "ORG_POLICY_DISABLED"
  | "ORG_AUTHOR_EXEMPT"
  | "ORG_UPDATE_EXEMPT"
  | "PLATFORM_CHANNEL_EXEMPT"
  | "PLATFORM_UPDATE_EXEMPT";

export type ContentVersionStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "APPROVED"
  | "PUBLISHED"
  | "REJECTED"
  | "CHANGES_REQUESTED"
  | "SUPERSEDED"
  | "UNPUBLISHED";

/**
 * The governance a review was opened under — the frozen snapshot, not today's settings.
 * Rendered verbatim so a reviewer never has to guess why content is in front of them.
 */
export type ReviewPolicyView = {
  organizationReviewRequired: boolean;
  platformReviewRequired: boolean;
  organizationReviewBypassed: boolean;
  platformReviewBypassed: boolean;
  bypassReason?: ReviewBypassReason | null;
  bypassExplanation?: string | null;
  submissionKind: SubmissionKind;
  resolvedAt?: string | null;
  summary: string;
};

/**
 * What the current user may do, decided by the backend.
 *
 * The console renders buttons from these flags and never re-derives authority from permission
 * codes. The old page ran its own `canReviewPlatformContent(user)` check, so the rule lived in
 * two places and drifted — channel reviewers saw an approve button on escalated reviews the API
 * would reject.
 */
export type ReviewActionsView = {
  canApprove: boolean;
  canRequestChanges: boolean;
  canReject: boolean;
  canComment: boolean;
  canAssign: boolean;
  canClaim: boolean;
  /** True when approving publishes; false when it passes the review to the next gate. */
  approvalPublishes: boolean;
  blockedReason?: string | null;
};

export type ReviewQueueItem = {
  id: string;
  contentType: ContentType;
  contentId: string;
  title: string;
  thumbnail?: string | null;
  ownerName: string;
  ownerUsername?: string | null;
  channelId: string;
  channelName: string;
  stage: ReviewStage;
  status: ReviewStatus;
  round: number;
  submissionKind: SubmissionKind;
  contentVersionId?: string | null;
  versionNumber?: number | null;
  submittedAt: string;
  submittedBy?: string | null;
  assignedReviewerId?: string | null;
  lastUpdated: string;
  orgReviewBypassed: boolean;
  platformReviewBypassed: boolean;
  supportsInlineReview: boolean;
  supportsAnchoredComments: boolean;
  supportsPreview: boolean;
  supportsVersionComparison: boolean;
};

export type ReviewRoundDetail = {
  id: string;
  round: number;
  stage: ReviewStage;
  contentVersionId?: string | null;
  submittedBy: string;
  submittedAt: string;
  submissionNote?: string | null;
  decision?: ReviewDecisionType | null;
  decisionReason?: string | null;
  reviewerId?: string | null;
  decidedAt?: string | null;
};

export type ReviewResponse = {
  id: string;
  contentType: ContentType;
  contentId: string;
  channelId: string;
  stage: ReviewStage;
  status: ReviewStatus;
  currentRound: number;
  contentVersionId?: string | null;
  versionNumber?: number | null;
  submittedBy?: string | null;
  assignedReviewerId?: string | null;
  claimedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  policy: ReviewPolicyView;
  actions: ReviewActionsView;
  currentRoundDetail?: ReviewRoundDetail | null;
  /** @deprecated derived from `stage`; remove once no client reads it. */
  tier?: "ORG" | "GLOBAL";
};

export type ReviewCommentResponse = {
  id: string;
  reviewId: string;
  roundId?: string | null;
  contentVersionId?: string | null;
  versionNumber?: number | null;
  stage?: ReviewStage | null;
  kind: "GENERAL" | "ANCHORED" | "DECISION_NOTE";
  authorId: string;
  authorName: string;
  targetType?: string | null;
  targetId?: string | null;
  body: string;
  createdAt: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  /** True when this comment belongs to an earlier version than the one under review. */
  fromEarlierVersion: boolean;
};

export type ReviewEventResponse = {
  id: string;
  reviewId: string;
  roundId?: string | null;
  sequenceNumber: number;
  eventType: string;
  actorId?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  note?: string | null;
  metadata?: string | null;
  createdAt: string;
};

export type LifecycleEvent = {
  id: string;
  eventType: string;
  actorId?: string | null;
  actorType: string;
  versionNumber?: number | null;
  contentVersionId?: string | null;
  note?: string | null;
  metadata?: string | null;
  createdAt: string;
};

export type ContentVersionSummary = {
  id: string;
  versionNumber: number;
  status: ContentVersionStatus;
  label?: string | null;
  createdBy: string;
  createdAt: string;
  submittedAt?: string | null;
  approvedAt?: string | null;
  publishedAt?: string | null;
  isCurrentlyReviewed: boolean;
};

export type ReviewQueueFilters = {
  contentType?: ContentType;
  status?: ReviewStatus;
  stage?: ReviewStage;
  channelId?: string;
  reviewerId?: string;
  submittedAfter?: string;
  page?: number;
  size?: number;
};

/**
 * The path a submission would take, computed by the server.
 *
 * Never derived on the client: it comes from the same resolver and the same adapter validation that
 * submission itself runs, so the preview cannot disagree with the outcome.
 */
export type ReviewPathPreview = {
  organizationReviewRequired: boolean;
  platformReviewRequired: boolean;
  entryStage?: ReviewStage | null;
  bypassReasons: ReviewBypassReason[];
  submissionKind: SubmissionKind;
  directPublication: boolean;
  summary: string;
  /** Non-empty means submission is refused; each entry is shown to the author verbatim. */
  blockingProblems: string[];
};

export type RollbackResult = {
  newVersionId: string;
  newVersionNumber: number;
  publishedDirectly: boolean;
  reviewId?: string | null;
  reviewStage?: ReviewStage | null;
  organizationReviewRequired: boolean;
  platformReviewRequired: boolean;
  summary: string;
};

export type ReviewCounts = {
  open: number;
  orgStage: number;
  platformStage: number;
  changesRequested: number;
  completed: number;
};

function toQuery(filters?: Record<string, unknown>): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v != null && v !== "") params.set(k, String(v));
  });
  const q = params.toString();
  return q ? `?${q}` : "";
}

export const platformReviewApi = {
  list: (filters?: ReviewQueueFilters) =>
    api.get<ReviewQueueItem[]>(`/api/platform/reviews${toQuery(filters)}`),

  counts: () => api.get<ReviewCounts>(`/api/platform/reviews/counts`),

  get: (id: string) => api.get<ReviewResponse>(`/api/platform/reviews/${id}`),

  byContent: (contentType: ContentType, contentId: string) =>
    api.get<ReviewResponse>(
      `/api/platform/reviews/by-content?contentType=${contentType}&contentId=${contentId}`
    ),

  /**
   * Records a decision.
   *
   * `expectedContentVersionId` is not optional in practice — the console always sends the version
   * it rendered, so a reviewer who left the page open while the author resubmitted is refused
   * rather than silently approving bytes they never read.
   */
  decide: (
    id: string,
    body: {
      decision: ReviewDecisionType;
      note?: string;
      reason?: string;
      expectedContentVersionId?: string | null;
    }
  ) => api.post<ReviewResponse>(`/api/platform/reviews/${id}/decision`, body),

  claim: (id: string) => api.post<ReviewResponse>(`/api/platform/reviews/${id}/claim`, {}),

  assign: (id: string, reviewerId: string) =>
    api.post<ReviewResponse>(`/api/platform/reviews/${id}/assign`, { reviewerId }),

  unassign: (id: string) => api.delete<ReviewResponse>(`/api/platform/reviews/${id}/assign`),

  timeline: (id: string) =>
    api.get<ReviewEventResponse[]>(`/api/platform/reviews/${id}/timeline`),

  lifecycle: (id: string, page = 0, size = 50) =>
    api.get<LifecycleEvent[]>(
      `/api/platform/reviews/${id}/lifecycle${toQuery({ page, size })}`
    ),

  versions: (id: string, page = 0, size = 20) =>
    api.get<ContentVersionSummary[]>(
      `/api/platform/reviews/${id}/versions${toQuery({ page, size })}`
    ),

  /** The frozen snapshot. Fetched deliberately — it is a whole content tree. */
  reviewedVersion: (id: string) =>
    api.get<{
      id: string;
      versionNumber: number;
      status: ContentVersionStatus;
      submittedAt: string;
      snapshot: string;
    }>(`/api/platform/reviews/${id}/version`),

  listComments: (
    id: string,
    opts?: {
      targetType?: string;
      targetId?: string;
      contentVersionId?: string;
      includeEarlierVersions?: boolean;
      page?: number;
      size?: number;
    }
  ) =>
    api.get<ReviewCommentResponse[]>(
      `/api/platform/reviews/${id}/comments${toQuery(opts as Record<string, unknown>)}`
    ),

  addComment: (
    id: string,
    body: {
      targetType?: string;
      targetId?: string;
      contentVersionId?: string | null;
      body: string;
    }
  ) => api.post<ReviewCommentResponse>(`/api/platform/reviews/${id}/comments`, body),

  resolveComment: (id: string, commentId: string) =>
    api.post<ReviewCommentResponse>(
      `/api/platform/reviews/${id}/comments/${commentId}/resolve`,
      {}
    ),

  getExams: (id: string) =>
    api.get<CourseExamReviewDetail[]>(`/api/platform/reviews/${id}/exams`),

  /**
   * What will happen if this content is submitted now, by the current user.
   *
   * Author-specific: an author exemption changes the answer, so this must be fetched per viewer
   * rather than cached per content item.
   */
  reviewPath: (contentType: ContentType, contentId: string) =>
    api.get<ReviewPathPreview>(
      `/api/platform/content/${contentType}/${contentId}/review-path`
    ),

  /**
   * Rolls content back to an earlier published version by creating a new version from it.
   *
   * The target is never modified and never re-activated; the new version goes through whatever
   * review its channel's governance requires.
   */
  rollback: (
    contentType: ContentType,
    contentId: string,
    body: { targetVersionId: string; reason?: string; idempotencyKey?: string }
  ) =>
    api.post<RollbackResult>(
      `/api/platform/content/${contentType}/${contentId}/rollback`,
      body
    ),
};

export type CourseExamPlacementSummary = {
  placementId: string;
  hostType: string;
  hostId: string;
  hostTitle: string;
  title: string;
  position: number;
  requiredForCompletion: boolean;
  planId?: string | null;
};

export type CourseExamPlanSummary = {
  planId: string;
  name: string;
  type: string;
  durationMinutes: number;
  passPercentage: number;
  maxAttempts: number;
  active: boolean;
  proctoringRequired: boolean;
  sectionsCount: number;
  totalQuestionsAsked: number;
  valid: boolean;
  validationErrors: string[];
};

export type CourseExamReviewDetail = {
  examId: string;
  title: string;
  description?: string | null;
  purpose?: string | null;
  examType: string;
  status: string;
  durationMinutes: number;
  passPercentage: number;
  maxAttempts: number;
  questionCount: number;
  easyPercent: number;
  mediumPercent: number;
  hardPercent: number;
  proctoringRequired: boolean;
  identityVerificationRequired: boolean;
  fullscreenRequired: boolean;
  sameQuestionsForAllStudents: boolean;
  rejectionReason?: string | null;
  publishedVersionId?: string | null;
  channelId?: string | null;
  authorId?: string | null;
  authorName?: string | null;
  updatedAt?: string | null;
  placements: CourseExamPlacementSummary[];
  plans: CourseExamPlanSummary[];
  bankQuestionCount: number;
};
