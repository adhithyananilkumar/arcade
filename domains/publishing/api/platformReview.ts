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

export type ReviewStatus = "OPEN" | "CHANGES_REQUESTED" | "COMPLETED" | "CANCELLED";

export type ReviewDecisionType =
  | "APPROVE"
  | "REQUEST_CHANGES"
  | "REJECT"
  | "REASSIGN"
  | "ESCALATE"
  | "CLOSE"
  | "CANCEL";

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
  submittedAt: string;
  version: string;
  status: ReviewStatus;
  reviewRound: number;
  hasPreviousPublication: boolean;
  assignedReviewerId?: string | null;
  lastUpdated: string;
  supportsInlineReview: boolean;
  supportsAnchoredComments: boolean;
  supportsPreview: boolean;
};

export type ReviewResponse = {
  id: string;
  contentType: ContentType;
  contentId: string;
  channelId: string;
  tier: 'ORG' | 'GLOBAL';
  status: ReviewStatus;
  currentRound: number;
  assignedReviewerId?: string | null;
  claimedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  currentRoundDetail?: {
    id: string;
    round: number;
    submittedBy: string;
    submittedVersionRef: string;
    submittedAt: string;
    submissionNote?: string | null;
    decision?: ReviewDecisionType | null;
    decisionReason?: string | null;
    reviewerId?: string | null;
    decidedAt?: string | null;
  } | null;
};

export type ReviewCommentResponse = {
  id: string;
  reviewId: string;
  roundId?: string | null;
  authorId: string;
  authorName: string;
  targetType?: string | null;
  targetId?: string | null;
  body: string;
  createdAt: string;
  resolvedAt?: string | null;
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

export type ReviewQueueFilters = {
  contentType?: ContentType;
  status?: ReviewStatus;
  channelId?: string;
  reviewerId?: string;
  submittedAfter?: string;
};

function toQuery(filters?: ReviewQueueFilters): string {
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

  get: (id: string) => api.get<ReviewResponse>(`/api/platform/reviews/${id}`),

  byContent: (contentType: ContentType, contentId: string) =>
    api.get<ReviewResponse>(
      `/api/platform/reviews/by-content?contentType=${contentType}&contentId=${contentId}`
    ),

  decide: (id: string, body: { decision: ReviewDecisionType; note?: string; reason?: string }) =>
    api.post<ReviewResponse>(`/api/platform/reviews/${id}/decision`, body),

  timeline: (id: string) =>
    api.get<ReviewEventResponse[]>(`/api/platform/reviews/${id}/timeline`),

  listComments: (id: string, targetType?: string, targetId?: string) => {
    const params = new URLSearchParams();
    if (targetType) params.set("targetType", targetType);
    if (targetId) params.set("targetId", targetId);
    const q = params.toString();
    return api.get<ReviewCommentResponse[]>(
      `/api/platform/reviews/${id}/comments${q ? `?${q}` : ""}`
    );
  },

  addComment: (
    id: string,
    body: { targetType?: string; targetId?: string; body: string }
  ) => api.post<ReviewCommentResponse>(`/api/platform/reviews/${id}/comments`, body),

  getExams: (id: string) =>
    api.get<CourseExamReviewDetail[]>(`/api/platform/reviews/${id}/exams`),
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
