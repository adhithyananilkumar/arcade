import { PaymentService } from '../api/payment.service';
import { EnrollmentService } from '@/domains/enrollment';
import type { PaymentOrderResponse, PaymentOrderStatus } from '../types/payment.types';

/**
 * The settlement steps every checkout shares — Razorpay's hosted modal and Arcade's own. Whatever
 * a widget says, an order counts as paid only when the server says so.
 */

/** Backoff between verification checks, in ms. ~3 minutes in total before giving up politely. */
const VERIFY_SCHEDULE_MS = [1000, 1500, 2000, 3000, 4000, 5000, 8000, 10000, 15000, 20000, 30000, 30000, 30000, 30000];

export const PAID_STATUSES: PaymentOrderStatus[] = ['PAID', 'PARTIALLY_REFUNDED', 'REFUNDED'];

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Once the order is paid, access is granted by the backend reacting to the payment. Nudge it a few
 * times; if it still hasn't caught up, the payment is safe regardless — the backend retries the
 * grant on its own — so the learner is told they're enrolled.
 */
export async function awaitGrant(enrollmentId: string): Promise<void> {
  for (const wait of [0, 1500, 3000, 5000]) {
    if (wait) await sleep(wait);
    try {
      const result = await EnrollmentService.resume(enrollmentId);
      if (result.status === 'GRANTED') return;
    } catch {
      // Payment is confirmed either way; keep nudging briefly.
    }
  }
}

export type Settled = 'PAID' | 'EXPIRED' | 'FAILED' | 'TIMEOUT';

/** What one server answer means for the checkout, or null while it is still open. */
export function settledOutcome(order: PaymentOrderResponse | null): Exclude<Settled, 'TIMEOUT'> | null {
  if (!order) return null;
  if (PAID_STATUSES.includes(order.status)) return 'PAID';
  if (order.status === 'EXPIRED' || order.status === 'CANCELLED') return 'EXPIRED';
  if (order.status === 'FAILED') return 'FAILED';
  return null;
}

/**
 * Asks the backend — which asks the gateway, server to server — until the order settles. The
 * widget's own success callback is never trusted; only the server's answer is.
 */
export async function verifyUntilSettled(orderId: string, isCancelled: () => boolean): Promise<Settled> {
  for (const wait of VERIFY_SCHEDULE_MS) {
    if (isCancelled()) return 'TIMEOUT';
    let order: PaymentOrderResponse | null = null;
    try {
      order = await PaymentService.verifyOrder(orderId);
    } catch {
      // Network blip or server hiccup: keep going on the schedule.
    }
    const outcome = settledOutcome(order);
    if (outcome) return outcome;
    await sleep(wait);
  }
  return 'TIMEOUT';
}
