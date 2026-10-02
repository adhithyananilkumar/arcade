import { PaymentService } from '../api/payment.service';
import { EnrollmentService } from '@/domains/enrollment';
import type { PaymentOrderResponse, PaymentOrderStatus } from '../types/payment.types';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

/** Backoff between verification checks, in ms. ~3 minutes in total before giving up politely. */
const VERIFY_SCHEDULE_MS = [1000, 1500, 2000, 3000, 4000, 5000, 8000, 10000, 15000, 20000, 30000, 30000, 30000, 30000];

/** How long the widget may stay open. Clamped so it never outlives the server's order. */
const MIN_WIDGET_SECONDS = 60;

const PAID_STATUSES: PaymentOrderStatus[] = ['PAID', 'PARTIALLY_REFUNDED', 'REFUNDED'];

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Once the order is paid, access is granted by the backend reacting to the payment. Nudge it a few
 * times; if it still hasn't caught up, the payment is safe regardless — the backend retries the
 * grant on its own — so the learner is told they're enrolled.
 */
async function awaitGrant(enrollmentId: string): Promise<void> {
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

type Settled = 'PAID' | 'EXPIRED' | 'FAILED' | 'TIMEOUT';

/**
 * Asks the backend — which asks the gateway, server to server — until the order settles. The
 * widget's own success callback is never trusted; only the server's answer is.
 */
async function verifyUntilSettled(orderId: string, isCancelled: () => boolean): Promise<Settled> {
  for (const wait of VERIFY_SCHEDULE_MS) {
    if (isCancelled()) return 'TIMEOUT';
    let order: PaymentOrderResponse | null = null;
    try {
      order = await PaymentService.verifyOrder(orderId);
    } catch {
      // Network blip or server hiccup: keep going on the schedule.
    }
    if (order) {
      if (PAID_STATUSES.includes(order.status)) return 'PAID';
      if (order.status === 'EXPIRED' || order.status === 'CANCELLED') return 'EXPIRED';
      if (order.status === 'FAILED') return 'FAILED';
    }
    await sleep(wait);
  }
  return 'TIMEOUT';
}

export interface LaunchCheckoutCallbacks {
  /** Payment confirmed by the backend (webhook or gateway lookup); access is granted or on its way. */
  onGranted: () => void;
  /** The order could not be opened or was closed as FAILED by the server. */
  onFailed: () => void;
  /** The checkout window closed before any payment was captured. */
  onExpired: () => void;
  /** The widget reported success; the backend is now confirming it. */
  onVerifying: () => void;
  /** Confirmation is taking unusually long — not an error, the backend keeps checking. */
  onVerifyTimeout: () => void;
  /** The widget was closed without a payment. */
  onDismissed: () => void;
  /** Checkout order creation (or script load) failed before the widget ever opened. */
  onError: (message: string) => void;
  /** One attempt was declined inside the widget; the learner can retry there. */
  onAttemptFailed?: (reason: string) => void;
}

/**
 * Opens checkout for an enrollment awaiting payment.
 *
 * Recovery behaviour, deliberately:
 * - The backend hands back the enrollment's existing checkout if one is open, so clicking twice or
 *   from two tabs can never open two payable orders.
 * - A declined attempt does not end checkout. The gateway's window offers a retry and the order
 *   stays open on the server.
 * - After the widget reports success, the backend checks with the gateway directly rather than
 *   waiting for a webhook that may be late or lost.
 * - If the learner closes the window while a payment is still being approved (common with UPI),
 *   one quiet check runs afterwards so a payment that landed is not missed.
 * - The widget closes itself when the server-side checkout expires.
 */
export async function launchRazorpayCheckout(
  enrollmentId: string,
  idempotencyKey: string,
  callbacks: LaunchCheckoutCallbacks,
): Promise<void> {
  let checkout;
  try {
    checkout = await PaymentService.checkout(enrollmentId, idempotencyKey);
  } catch (err: unknown) {
    callbacks.onError(err instanceof Error && err.message ? err.message : 'Could not start checkout. Please try again.');
    return;
  }

  if (PAID_STATUSES.includes(checkout.status)) {
    await awaitGrant(enrollmentId);
    callbacks.onGranted();
    return;
  }
  if (!checkout.gatewayOrderId || !checkout.gatewayClientFields?.keyId) {
    callbacks.onError('Checkout could not be opened. Nothing was charged — please try again.');
    return;
  }

  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    callbacks.onError('Could not load the payment gateway. Check your connection and try again.');
    return;
  }

  let settledByHandler = false;
  let closed = false;

  const settle = async () => {
    const outcome = await verifyUntilSettled(checkout.orderId, () => closed && !settledByHandler);
    if (outcome === 'PAID') {
      await awaitGrant(enrollmentId);
      callbacks.onGranted();
    } else if (outcome === 'EXPIRED') {
      callbacks.onExpired();
    } else if (outcome === 'FAILED') {
      callbacks.onFailed();
    } else {
      callbacks.onVerifyTimeout();
    }
  };

  const secondsLeft = checkout.expiresAt
    ? Math.floor((new Date(checkout.expiresAt).getTime() - Date.now()) / 1000)
    : 15 * 60;
  if (secondsLeft <= 5) {
    callbacks.onExpired();
    return;
  }

  const rzp = new window.Razorpay({
    key: checkout.gatewayClientFields.keyId,
    amount: checkout.amount,
    currency: checkout.currency,
    name: 'Arcade',
    description: checkout.resourceTitle || 'Enrollment',
    order_id: checkout.gatewayOrderId,
    notes: { internal_order_id: checkout.orderId },
    // The widget may not outlive the server's order: a payment made after the order expired would
    // still be honoured, but closing it here keeps the learner from paying into a lapsed checkout.
    timeout: Math.max(MIN_WIDGET_SECONDS, secondsLeft - 5),
    retry: { enabled: true, max_count: 4 },
    theme: { color: '#4c6fff' },
    handler: function () {
      // The widget's success callback is not authoritative — the server's answer is.
      settledByHandler = true;
      callbacks.onVerifying();
      void settle();
    },
    modal: {
      confirm_close: true,
      ondismiss: async function () {
        closed = true;
        if (settledByHandler) return;
        // A UPI approval can complete moments after the window closes. Check once, quietly.
        try {
          const order = await PaymentService.verifyOrder(checkout.orderId);
          if (PAID_STATUSES.includes(order.status)) {
            await awaitGrant(enrollmentId);
            callbacks.onGranted();
            return;
          }
          if (order.status === 'EXPIRED' || order.status === 'CANCELLED') {
            callbacks.onExpired();
            return;
          }
        } catch {
          // Fall through to an ordinary dismissal; the sweeper still reconciles server-side.
        }
        callbacks.onDismissed();
      },
    },
  });

  rzp.on('payment.failed', function (response: { error?: { description?: string; reason?: string } }) {
    // One declined attempt. The widget stays open and offers a retry; the order stays open too.
    const reason: string =
      response?.error?.description || response?.error?.reason || 'That payment attempt was declined.';
    callbacks.onAttemptFailed?.(reason);
  });

  rzp.open();
}
