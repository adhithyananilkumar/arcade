export type PaymentOrderStatus = 'CREATED' | 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'CANCELLED';

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
  resourceType: 'COURSE' | 'EVENT';
  resourceId: string;
  amount: number;
  currency: string;
  status: PaymentOrderStatus;
  gateway: string;
  createdAt: string;
  expiresAt?: string;
  paidAt?: string;
}

export interface PaymentLedgerRow {
  paymentOrderId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  resourceId: string;
  resourceTitle?: string;
  resourceType: 'COURSE' | 'EVENT';
  enrollmentId: string;
  amount: number;
  currency: string;
  gateway: string;
  status: PaymentOrderStatus;
  createdAt: string;
  paidAt?: string;
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
  resourceType?: 'COURSE' | 'EVENT';
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
