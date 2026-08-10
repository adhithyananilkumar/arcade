/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Payment
 *
 * Purpose:
 * Exposes the public API for the Payment domain — checkout, order status,
 * and the read-only admin ledger. Amounts are always minor currency units.
 *
 * Rules:
 * - Export only stable public APIs.
 * - Never export internal helpers.
 * - Never import from apps/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

export { PaymentModal } from './components/PaymentModal';
export { PaymentService } from './api/payment.service';
export { PaymentAdminService } from './api/payment-admin.service';
export type {
  PaymentOrderStatus,
  CheckoutResponse,
  PaymentOrderResponse,
  PaymentLedgerRow,
  PageResponse,
  PaymentLedgerFilters,
} from './types/payment.types';
