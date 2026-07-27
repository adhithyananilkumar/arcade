/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Publishing
 *
 * Purpose:
 * Exposes the public API for the Publishing domain.
 *
 * Rules:
 * - Export only stable public APIs.
 * - Never export internal helpers.
 * - Never import from apps/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

export { VersionHistoryPanel } from "./components/VersionHistoryPanel";
export { CreatorService } from './api/creator.service';
export { platformReviewApi } from './api/platformReview';
export type {
  ReviewQueueItem,
  ReviewResponse,
  ReviewCommentResponse,
  ReviewEventResponse,
  ContentType,
  ReviewStatus,
  ReviewDecisionType,
} from './api/platformReview';
