import { api } from '@/infrastructure/http/api';
import { CheckoutResponse, PaymentOrderResponse } from '../types/payment.types';

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
}
