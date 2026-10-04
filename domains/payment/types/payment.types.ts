export type PaymentOrderStatus =
  | 'CREATED'
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED';

export type PaymentResourceType = 'COURSE' | 'EVENT' | 'EXAM';

export interface CheckoutResponse {
  orderId: string;
  gatewayOrderId: string;
  /** Minor currency units (e.g. paise). */
  amount: number;
  currency: string;
  gateway: string;
  status: PaymentOrderStatus;
  resourceTitle?: string;
  expiresAt?: string;
  gatewayClientFields: Record<string, unknown>;
}

export interface PaymentOrderResponse {
  id: string;
  enrollmentId: string;
  resourceType: PaymentResourceType;
  resourceId: string;
  amount: number;
  currency: string;
  status: PaymentOrderStatus;
  gateway: string;
  createdAt: string;
  expiresAt?: string;
  paidAt?: string;
  /** Declined attempts inside this checkout. The order stays open through them. */
  attemptCount: number;
  /** The gateway's reason for the latest declined attempt — safe to show the learner. */
  lastFailureReason?: string | null;
  resourceTitle?: string | null;
}

export interface PaymentLedgerRow {
  paymentOrderId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  resourceId: string;
  resourceTitle?: string;
  resourceType: PaymentResourceType;
  enrollmentId: string;
  amount: number;
  currency: string;
  gateway: string;
  status: PaymentOrderStatus;
  createdAt: string;
  paidAt?: string;
  channelId?: string | null;
  channelName?: string | null;
  instructorId?: string | null;
  instructorName?: string | null;
  attemptCount: number;
  lastFailureReason?: string | null;
  expiresAt?: string | null;
  /** Platform commission charged on the full amount when the order was paid (0 before V334). */
  commissionMinor: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface PaymentLedgerFilters {
  status?: PaymentOrderStatus;
  gateway?: string;
  resourceType?: PaymentResourceType;
  channelId?: string;
  sort?: string;
  createdFrom?: string;
  createdTo?: string;
  userId?: string;
  orderId?: string;
  page?: number;
  size?: number;
}

// ── Billing history (Settings → Payments) ─────────────────────────────────────

export type BillingStatus =
  | 'PAID'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'PENDING'
  | 'FAILED';

export interface BillingRefundLine {
  refundId: string;
  /** Minor units. */
  amount: number;
  currency: string;
  status: 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  requestedAt: string;
  completedAt?: string | null;
}

export interface BillingLine {
  orderId: string;
  resourceType: 'COURSE' | 'EVENT' | 'EXAM' | string;
  resourceId: string;
  resourceTitle?: string | null;
  /** Minor units. */
  amount: number;
  currency: string;
  status: BillingStatus;
  /** The gateway's payment id (Razorpay "pay_…"). */
  paymentReference?: string | null;
  createdAt: string;
  paidAt?: string | null;
  /** Minor units, completed refunds only. */
  refundedAmount: number;
  refunds: BillingRefundLine[];
}

export interface BillingSummary {
  /** Minor units. */
  paidTotal: number;
  refundedTotal: number;
  currency: string;
  count: number;
}

// ── Console: order detail, refunds, analytics, settlement ─────────────────────

export type RefundStatus = 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface PaymentTransactionView {
  id: string;
  gateway: string;
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  status: string;
  failureReason?: string | null;
  createdAt: string;
}

export interface PaymentRefundView {
  id: string;
  amount: number;
  currency: string;
  status: RefundStatus;
  reason: string;
  revokeAccess: boolean;
  requestedBy: string;
  requestedByName?: string | null;
  gatewayRefundId?: string | null;
  requestedAt: string;
  completedAt?: string | null;
  lastError?: string | null;
}

export interface PaymentTimelineView {
  type: string;
  detail?: string | null;
  actorId?: string | null;
  actorName?: string | null;
  at: string;
}

export interface PaymentOrderDetail {
  order: PaymentLedgerRow;
  enrollmentStatus?: string | null;
  refundedMinor: number;
  refundInFlightMinor: number;
  /** What can still be refunded: amount minus completed and in-flight refunds. */
  refundableMinor: number;
  commission: OrderCommission;
  transactions: PaymentTransactionView[];
  refunds: PaymentRefundView[];
  timeline: PaymentTimelineView[];
}

/** The platform's commission on one order, as snapshotted when it was paid. */
export interface OrderCommission {
  rateBps: number;
  fixedMinor: number;
  refundTreatment: CommissionRefundTreatment;
  /** Commission on the full amount. */
  chargedMinor: number;
  /** What the platform keeps after refunds (completed and in flight). */
  retainedMinor: number;
  /** What the channel is owed for this sale after refunds and commission. */
  channelPayableMinor: number;
}

export interface RefundRequestBody {
  /** Minor units; omit to refund whatever remains. */
  amount?: number;
  reason: string;
  revokeAccess: boolean;
  idempotencyKey: string;
}

export interface RefundResult {
  refundId: string;
  paymentOrderId: string;
  amount: number;
  currency: string;
  status: RefundStatus;
  lastError?: string | null;
}

/**
 * Money for one currency. All minor units.
 * payable = net − refunds in flight − commission: what the platform holds for the channel right now.
 * Can be negative when a sale under RETAINED commission was refunded (the channel owes it).
 */
export interface MoneySummary {
  currency: string;
  grossMinor: number;
  refundedMinor: number;
  refundInFlightMinor: number;
  netMinor: number;
  /** The platform's commission after refunds. */
  commissionMinor: number;
  payableMinor: number;
  paidOrders: number;
  learners: number;
  pendingMinor: number;
  pendingOrders: number;
  lastPaidAt?: string | null;
}

export interface PaymentFunnel {
  ordersOpened: number;
  ordersPaid: number;
  ordersExpired: number;
  failedAttempts: number;
  conversionPercent: number | null;
}

export interface PaymentDayPoint {
  day: string;
  currency: string;
  grossMinor: number;
  refundedMinor: number;
  commissionMinor: number;
  paidOrders: number;
}

export interface PaymentTypeBreakdown {
  resourceType: string;
  currency: string;
  grossMinor: number;
  netMinor: number;
  commissionMinor: number;
  payableMinor: number;
  paidOrders: number;
}

export interface ChannelBalance {
  channelId: string;
  channelName: string;
  personal: boolean;
  ownerName?: string | null;
  currency: string;
  grossMinor: number;
  refundedMinor: number;
  refundInFlightMinor: number;
  netMinor: number;
  /** The platform's commission after refunds. */
  commissionMinor: number;
  payableMinor: number;
  paidOrders: number;
  lastPaidAt?: string | null;
}

export interface PaymentIssues {
  paidNotGranted: number;
  duplicatePayments: number;
  amountMismatches: number;
  lateCaptures: number;
  refundsInFlight: number;
  refundsFailed: number;
  openCheckouts: number;
}

export interface PlatformPaymentsOverview {
  totals: MoneySummary[];
  funnel: PaymentFunnel;
  daily: PaymentDayPoint[];
  byType: PaymentTypeBreakdown[];
  topChannels: ChannelBalance[];
  issues: PaymentIssues;
}

export interface InstructorBreakdown {
  instructorId?: string | null;
  name?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  currency: string;
  grossMinor: number;
  refundedMinor: number;
  refundInFlightMinor: number;
  netMinor: number;
  /** The platform's commission after refunds. */
  commissionMinor: number;
  payableMinor: number;
  paidOrders: number;
}

export interface ResourceBreakdown {
  resourceType: string;
  resourceId: string;
  title?: string | null;
  currency: string;
  grossMinor: number;
  refundedMinor: number;
  netMinor: number;
  commissionMinor: number;
  payableMinor: number;
  paidOrders: number;
}

export interface PaymentMonthPoint {
  month: string;
  currency: string;
  grossMinor: number;
  refundedMinor: number;
  commissionMinor: number;
}

export interface ChannelPaymentDetail {
  totals: MoneySummary[];
  byInstructor: InstructorBreakdown[];
  byResource: ResourceBreakdown[];
  monthly: PaymentMonthPoint[];
}

export interface ChannelPaymentsOverview {
  /** False when the viewer sees only their own sales (an instructor without channel.payments.view). */
  fullAccess: boolean;
  detail: ChannelPaymentDetail;
  /** What this channel's sales are charged now, and the next scheduled change. */
  commission: ChannelCommission;
}

export interface ChannelLedgerEntry {
  orderId: string;
  status: PaymentOrderStatus;
  resourceType: string;
  resourceId: string;
  resourceTitle?: string | null;
  learnerName?: string | null;
  instructorId?: string | null;
  instructorName?: string | null;
  currency: string;
  amountMinor: number;
  refundedMinor: number;
  /** Platform commission kept on this sale after refunds; 0 for open checkouts. */
  commissionMinor: number;
  /** What the channel is owed for this sale; 0 for open checkouts. */
  payableMinor: number;
  createdAt: string;
  paidAt?: string | null;
  /** Masked gateway payment reference (last characters only). */
  paymentReference?: string | null;
}

export type ReconciliationKind = 'PAID_NOT_GRANTED' | 'DUPLICATE_PAYMENT' | 'AMOUNT_MISMATCH';

export interface UnreconciledOrder {
  orderId: string;
  userId: string;
  enrollmentId: string;
  resourceType: string;
  resourceId: string;
  amount: number;
  currency: string;
  paidAt?: string | null;
  enrollmentStatus?: string | null;
  kind: ReconciliationKind;
  resourceTitle?: string | null;
  grantAttempts: number;
}

export interface DateWindow {
  from?: string;
  to?: string;
}

// ── Platform commission ───────────────────────────────────────────────────────

/**
 * PROPORTIONAL: the platform returns its share of whatever is refunded.
 * RETAINED: the platform keeps its full commission; the channel absorbs the refund.
 */
export type CommissionRefundTreatment = 'PROPORTIONAL' | 'RETAINED';

export type CommissionSource = 'GLOBAL' | 'CHANNEL' | 'NONE';

export type CommissionState = 'SCHEDULED' | 'ACTIVE' | 'SUPERSEDED' | 'CANCELLED';

export interface EffectiveCommission {
  source: CommissionSource;
  policyId?: string | null;
  /** Basis points: 1000 = 10%. */
  rateBps: number;
  fixedFeeMinor: number;
  fixedFeeCurrency?: string | null;
  refundTreatment: CommissionRefundTreatment;
  since?: string | null;
}

export interface ChannelCommission {
  current: EffectiveCommission;
  next?: EffectiveCommission | null;
  nextFrom?: string | null;
}

export interface CommissionPolicyView {
  id: string;
  channelId?: string | null;
  channelName?: string | null;
  /** A channel version that ends its override and returns it to the platform-wide rate. */
  inherit: boolean;
  rateBps: number;
  fixedFeeMinor: number;
  fixedFeeCurrency?: string | null;
  refundTreatment: CommissionRefundTreatment;
  effectiveFrom: string;
  note: string;
  createdBy?: string | null;
  createdByName?: string | null;
  createdAt: string;
  cancelledAt?: string | null;
  cancelledByName?: string | null;
  state: CommissionState;
}

export interface CommissionSettings {
  current: EffectiveCommission;
  global: CommissionPolicyView[];
  /** Every channel version, grouped by channel, newest first within each. */
  channels: CommissionPolicyView[];
}

export interface CommissionChangeBody {
  /** Omit for the platform-wide rate. */
  channelId?: string | null;
  inherit?: boolean;
  rateBps: number;
  fixedFeeMinor: number;
  fixedFeeCurrency?: string | null;
  refundTreatment: CommissionRefundTreatment;
  /** ISO time; omit for now. Never in the past. */
  effectiveFrom?: string | null;
  note: string;
}

export interface CommissionChannelOption {
  id: string;
  name: string;
  personal: boolean;
  ownerName?: string | null;
}
