import { api } from '@/infrastructure/http/api';
import { BillingLine, BillingSummary, CheckoutResponse, PaymentOrderResponse } from '../types/payment.types';

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export class PaymentService {
  /**
   * Creates (or replays, if idempotencyKey matches an in-flight order) a checkout order for a
   * PENDING enrollment. The backend derives amount/currency/resource server-side — never trust a
   * locally-computed price.
   */
  static async checkout(enrollmentId: string, idempotencyKey: string): Promise<CheckoutResponse> {
    return api.post<CheckoutResponse>('/api/v1/payments/orders/checkout', {
      enrollmentId,
      idempotencyKey,
    });
  }

  static async getOrder(orderId: string): Promise<PaymentOrderResponse> {
    return api.get<PaymentOrderResponse>(`/api/v1/payments/orders/${orderId}`);
  }

  /**
   * Asks the backend to check the order with the gateway directly (not just wait for the webhook).
   * Safe to call repeatedly; the server throttles its own gateway lookups.
   */
  static async verifyOrder(orderId: string): Promise<PaymentOrderResponse> {
    return api.post<PaymentOrderResponse>(`/api/v1/payments/orders/${orderId}/verify`, {});
  }

  /** The enrollment's open checkout, or null when there is none (204). */
  static async liveOrder(enrollmentId: string): Promise<PaymentOrderResponse | null> {
    const order = await api.get<PaymentOrderResponse | null | ''>(
      `/api/v1/payments/enrollments/${enrollmentId}/live-order`,
    );
    return order ? (order as PaymentOrderResponse) : null;
  }

  /** The signed-in learner's billing history, newest first. */
  static async myBillingHistory(page = 0, size = 20): Promise<Page<BillingLine>> {
    return api.get<Page<BillingLine>>(`/api/v1/payments/orders/mine?page=${page}&size=${size}`);
  }

  static async myBillingSummary(): Promise<BillingSummary> {
    return api.get<BillingSummary>('/api/v1/payments/orders/mine/summary');
  }
}
