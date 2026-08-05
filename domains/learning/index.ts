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
export { courseProgressService } from './progress/api/courseProgress';
export type { CourseProgress, EnrollmentStatus } from './progress/api/courseProgress';
export { CouponService } from './coupons/api/coupon.service';
export type {
  UserCouponDto,
  CouponDto,
  RedeemSessionResponse,
  DiscountPayload,
} from './coupons/api/coupon.service';
export { CouponRedeemCard } from './coupons/components/CouponRedeemCard';
export { RedeemCodeForm } from './coupons/components/RedeemCodeForm';
export { UserCouponDetail } from './coupons/components/UserCouponDetail';
export { CouponTicket, formatOfferValue } from './coupons/components/CouponTicket';