import { api } from '@/infrastructure/http/api';
import { PageResponse, PaymentLedgerFilters, PaymentLedgerRow } from '../types/payment.types';

export class PaymentAdminService {
  /** Server-side paginated + filtered payment ledger for Arc Console → Payments. Read-only. */
  static async list(filters: PaymentLedgerFilters): Promise<PageResponse<PaymentLedgerRow>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
    const query = params.toString();
    return api.get<PageResponse<PaymentLedgerRow>>(`/api/v1/platform/payments${query ? `?${query}` : ''}`);
  }
}
