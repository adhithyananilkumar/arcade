/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Payment
 *
 * Purpose:
 * Exposes the public API for the Payment domain — checkout, order status,
 * and the read-only admin ledger. Amounts are always minor currency units.
 * There is no Arcade-owned checkout UI: payment collection is Razorpay's
 * own hosted Checkout modal (see utils/launchRazorpayCheckout).
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
export { launchRazorpayCheckout } from './utils/launchRazorpayCheckout';
export type { LaunchCheckoutCallbacks } from './utils/launchRazorpayCheckout';
export type {
  PaymentOrderStatus,
  CheckoutResponse,
  PaymentOrderResponse,
  PaymentLedgerRow,
  PageResponse,
  PaymentLedgerFilters,
} from './types/payment.types';
