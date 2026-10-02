import { api } from '@/infrastructure/http/api';
import type {
  ChannelLedgerEntry,
  ChannelPaymentsOverview,
  DateWindow,
  PageResponse,
} from '../types/payment.types';

function qs(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

/**
 * A channel's own payments. The backend scopes every answer to the caller: owners and holders of
 * channel.payments.view get the whole channel, other members only their own sales.
 */
export class ChannelPaymentService {
  static async overview(channelId: string, window: DateWindow = {}): Promise<ChannelPaymentsOverview> {
    return api.get<ChannelPaymentsOverview>(`/api/v1/channels/${channelId}/payments/overview${qs({ ...window })}`);
  }

  static async transactions(
    channelId: string,
    params: DateWindow & {
      status?: string;
      includeOpen?: boolean;
      instructorId?: string;
      page?: number;
      size?: number;
    } = {},
  ): Promise<PageResponse<ChannelLedgerEntry>> {
    return api.get<PageResponse<ChannelLedgerEntry>>(
      `/api/v1/channels/${channelId}/payments/transactions${qs({ ...params })}`,
    );
  }
}
