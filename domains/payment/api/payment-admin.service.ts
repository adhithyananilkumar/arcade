import { api } from '@/infrastructure/http/api';
import type {
  ChannelBalance,
  ChannelCommission,
  ChannelPaymentDetail,
  CommissionChangeBody,
  CommissionChannelOption,
  CommissionSettings,
  DateWindow,
  PageResponse,
  PaymentLedgerFilters,
  PaymentLedgerRow,
  PaymentOrderDetail,
  PlatformPaymentsOverview,
  RefundRequestBody,
  RefundResult,
  UnreconciledOrder,
} from '../types/payment.types';

function qs(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

/** Arc Console → Payments. Every call is re-authorized server-side (platform.payments.*). */
export class PaymentAdminService {
  /** Server-side paginated + filtered payment ledger. */
  static async list(filters: PaymentLedgerFilters): Promise<PageResponse<PaymentLedgerRow>> {
    return api.get<PageResponse<PaymentLedgerRow>>(`/api/v1/platform/payments${qs({ ...filters })}`);
  }

  /** One order in full: attempts, refunds, enrollment state and audit timeline. */
  static async detail(orderId: string): Promise<PaymentOrderDetail> {
    return api.get<PaymentOrderDetail>(`/api/v1/platform/payments/${orderId}`);
  }

  /** Requires platform.payments.refund. Reports the real status — PROCESSING until the gateway settles. */
  static async refund(orderId: string, body: RefundRequestBody): Promise<RefundResult> {
    return api.post<RefundResult>(`/api/v1/platform/payments/${orderId}/refund`, body);
  }

  static async analytics(window: DateWindow): Promise<PlatformPaymentsOverview> {
    return api.get<PlatformPaymentsOverview>(`/api/v1/platform/payments/analytics${qs({ ...window })}`);
  }

  /** What each channel collected and is owed, largest payable first. */
  static async channelBalances(
    params: DateWindow & { search?: string; page?: number; size?: number },
  ): Promise<PageResponse<ChannelBalance>> {
    return api.get<PageResponse<ChannelBalance>>(`/api/v1/platform/payments/channels${qs({ ...params })}`);
  }

  static async channelDetail(channelId: string, window: DateWindow): Promise<ChannelPaymentDetail> {
    return api.get<ChannelPaymentDetail>(`/api/v1/platform/payments/channels/${channelId}${qs({ ...window })}`);
  }

  /** Platform commission: the rate in force, every version, and channel overrides. */
  static async commission(): Promise<CommissionSettings> {
    return api.get<CommissionSettings>('/api/v1/platform/payments/commission');
  }

  /** What one channel's sales are charged now, and its next scheduled change. */
  static async channelCommission(channelId: string): Promise<ChannelCommission> {
    return api.get<ChannelCommission>(`/api/v1/platform/payments/commission/channels/${channelId}`);
  }

  /** Requires platform.payments.commission. Takes effect now or at a scheduled time — never backdated. */
  static async changeCommission(body: CommissionChangeBody): Promise<CommissionSettings> {
    return api.post<CommissionSettings>('/api/v1/platform/payments/commission', body);
  }

  /** Withdraws a scheduled change before it takes effect. */
  static async cancelCommission(policyId: string): Promise<CommissionSettings> {
    return api.post<CommissionSettings>(`/api/v1/platform/payments/commission/${policyId}/cancel`, {});
  }

  static async searchCommissionChannels(q: string): Promise<CommissionChannelOption[]> {
    return api.get<CommissionChannelOption[]>(`/api/v1/platform/payments/commission/channel-search${qs({ q })}`);
  }

  /** Paid-but-not-granted, duplicate payments and amount mismatches — for a person to resolve. */
  static async reconciliation(page = 0, size = 50): Promise<UnreconciledOrder[]> {
    return api.get<UnreconciledOrder[]>(`/api/v1/platform/payments/reconciliation${qs({ page, size })}`);
  }
}
