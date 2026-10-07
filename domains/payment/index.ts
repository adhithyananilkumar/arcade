/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Payment
 *
 * Purpose:
 * Exposes the public API for the Payment domain — checkout, order status,
 * and the read-only admin ledger. Amounts are always minor currency units.
 * Desktop pays through Arcade's own checkout (components/checkout, over
 * Razorpay's Custom Checkout SDK); phones and tablets use Razorpay's hosted
 * modal (utils/launchRazorpayCheckout). Both settle on the server's word.
 *
 * Rules:
 * - Export only stable public APIs.
 * - Never export internal helpers.
 * - Never import from apps/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

export { PaymentService } from './api/payment.service';
export { PaymentAdminService } from './api/payment-admin.service';
export { ChannelPaymentService } from './api/channel-payment.service';
export { CheckoutHoldStatus } from './components/CheckoutHoldStatus';
export { ChannelPaymentsReport } from './components/ChannelPaymentsReport';
export { PaymentStatusBadge } from './components/PaymentStatusBadge';
export { launchRazorpayCheckout } from './utils/launchRazorpayCheckout';
export { CustomCheckout, prefersCustomCheckout } from './components/checkout/CustomCheckout';
export type { LaunchCheckoutCallbacks } from './utils/launchRazorpayCheckout';
export {
  describeCommission,
  formatRate,
  REFUND_TREATMENT_HINT,
  REFUND_TREATMENT_LABEL,
} from './utils/commission';
export type {
  PaymentOrderStatus,
  CheckoutResponse,
  PaymentOrderResponse,
  PaymentLedgerRow,
  PageResponse,
  PaymentLedgerFilters,
  BillingLine,
  BillingRefundLine,
  BillingStatus,
  BillingSummary,
  PaymentResourceType,
  PaymentOrderDetail,
  PaymentTransactionView,
  PaymentRefundView,
  PaymentTimelineView,
  RefundRequestBody,
  RefundResult,
  RefundStatus,
  MoneySummary,
  PaymentFunnel,
  PaymentDayPoint,
  PaymentTypeBreakdown,
  ChannelBalance,
  PaymentIssues,
  PlatformPaymentsOverview,
  InstructorBreakdown,
  ResourceBreakdown,
  PaymentMonthPoint,
  ChannelPaymentDetail,
  ChannelPaymentsOverview,
  ChannelLedgerEntry,
  ReconciliationKind,
  UnreconciledOrder,
  DateWindow,
  OrderCommission,
  CommissionRefundTreatment,
  CommissionSource,
  CommissionState,
  EffectiveCommission,
  ChannelCommission,
  CommissionPolicyView,
  CommissionSettings,
  CommissionChangeBody,
  CommissionChannelOption,
} from './types/payment.types';
