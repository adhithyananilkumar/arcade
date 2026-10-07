import type { QrCodeResponse } from '../../types/payment.types';

export type CheckoutMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

/** Where one checkout session stands. Only the server's answer ever moves it to `granted`. */
export type CheckoutPhase =
  | { kind: 'loading' }
  | { kind: 'ready' }
  /** The gateway is taking a payment: a bank window is open, or a UPI request awaits approval. */
  | { kind: 'paying'; method: CheckoutMethod }
  /** The gateway reported success; the server is confirming it. */
  | { kind: 'verifying' }
  | { kind: 'granted' }
  | { kind: 'declined'; reason: string }
  | { kind: 'expired' }
  /** Checkout could not open at all. */
  | { kind: 'error'; message: string }
  /** Confirmation is slow — not a failure; the server keeps checking. */
  | { kind: 'slow' };

export type QrState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; qr: QrCodeResponse }
  | { status: 'lapsed'; qr: QrCodeResponse }
  | { status: 'error'; message: string };

export interface CheckoutSummary {
  orderId: string;
  /** Minor units. */
  amount: number;
  currency: string;
  title: string;
  /** When the checkout (and the seat hold) ends. */
  expiresAt?: string;
}

export interface CardInput {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

/** What the gateway account can take; null while unknown or when the SDK could not load. */
export interface AvailableMethods {
  card: boolean;
  upiId: boolean;
  /** Bank code → name. */
  banks: Record<string, string>;
  wallets: string[];
}
