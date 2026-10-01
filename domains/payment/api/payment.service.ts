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

  /** The signed-in learner's billing history, newest first. */
  static async myBillingHistory(page = 0, size = 20): Promise<Page<BillingLine>> {
    return api.get<Page<BillingLine>>(`/api/v1/payments/orders/mine?page=${page}&size=${size}`);
  }

  static async myBillingSummary(): Promise<BillingSummary> {
    return api.get<BillingSummary>('/api/v1/payments/orders/mine/summary');
  }
}
