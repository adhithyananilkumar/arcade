/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Publishing
 *
 * Purpose:
 * Exposes the public API for the Publishing domain — content review, review governance,
 * and version history.
 *
 * Rules:
 * - Export only stable public APIs.
 * - Never export internal helpers.
 * - Never import from apps/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

// ── Editor-level version history (DocumentVersion) ────────────────────────────
export { VersionHistoryPanel } from "./components/VersionHistoryPanel";
export type { ContentStatusHistoryResponse } from "./components/VersionHistoryPanel";

// ── Review pipeline ───────────────────────────────────────────────────────────
export { platformReviewApi } from "./api/platformReview";
export type {
  ReviewQueueItem,
  ReviewResponse,
  ReviewRoundDetail,
  ReviewCommentResponse,
  ReviewEventResponse,
  ReviewPolicyView,
  ReviewActionsView,
  ReviewCounts,
  ReviewQueueFilters,
  LifecycleEvent,
  ContentVersionSummary,
  ReviewPathPreview,
  RollbackResult,
  ContentVersionStatus,
  ContentType,
  ReviewStage,
  ReviewStatus,
  ReviewDecisionType,
  ReviewBypassReason,
  SubmissionKind,
  CourseExamReviewDetail,
  CourseExamPlacementSummary,
  CourseExamPlanSummary,
} from "./api/platformReview";

// ── Review governance ─────────────────────────────────────────────────────────
export { reviewGovernanceApi } from "./api/reviewGovernance";
export type {
  ChannelReviewPolicyView,
  AuthorExemptionView,
  GovernanceAuditView,
} from "./api/reviewGovernance";

// ── Pure presentational components ────────────────────────────────────────────
export { ReviewPolicySummary } from "./components/ReviewPolicySummary";
export { ChannelGovernanceCard } from "./components/ChannelGovernanceCard";
export { AuthorExemptionManager } from "./components/AuthorExemptionManager";
export { ContentVersionHistory } from "./components/ContentVersionHistory";
export { ContentLifecycleTimeline } from "./components/ContentLifecycleTimeline";
export { ReviewPathPanel } from "./components/ReviewPathPanel";
export { RollbackDialog } from "./components/RollbackDialog";
