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

export interface QrCodeResponse {
  qrCodeId: string;
  imageUrl: string;
  expiresAt?: string;
}

export interface PaymentMethodOption {
  code: string;
  label: string;
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
