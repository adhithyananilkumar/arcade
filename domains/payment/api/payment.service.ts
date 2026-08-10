import { api } from '@/infrastructure/http/api';
import { CheckoutResponse, PaymentMethodOption, PaymentOrderResponse, QrCodeResponse } from '../types/payment.types';

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

  /** Fetches (creating gateway-side, once) a real scannable UPI QR for this order. */
  static async getOrCreateQrCode(orderId: string): Promise<QrCodeResponse> {
    return api.post<QrCodeResponse>(`/api/v1/payments/orders/${orderId}/qr-code`);
  }

  /** The payment instruments currently enabled on the active gateway account. */
  static async getSupportedMethods(): Promise<PaymentMethodOption[]> {
    return api.get<PaymentMethodOption[]>('/api/v1/payments/methods');
  }
}
