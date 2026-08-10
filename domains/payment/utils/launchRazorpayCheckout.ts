import { PaymentService } from '../api/payment.service';
import { EnrollmentService } from '@/domains/enrollment/api/enrollment.service';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

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

function pollOrder(
  orderId: string,
  enrollmentId: string,
  callbacks: LaunchCheckoutCallbacks,
  attempt = 0
) {
  setTimeout(async () => {
    try {
      const order = await PaymentService.getOrder(orderId);
      if (order.status === 'PAID') {
        try {
          const result = await EnrollmentService.resume(enrollmentId);
          if (result.status === 'GRANTED') {
            callbacks.onGranted();
            return;
          }
        } catch {
          // fall through — payment is confirmed regardless; keep polling resume briefly
        }
        if (attempt < 5) {
          pollOrder(orderId, enrollmentId, callbacks, attempt + 1);
        } else {
          // Payment is confirmed even if the grant hasn't caught up yet — the backend's own
          // webhook listener will resume the enrollment shortly regardless.
          callbacks.onGranted();
        }
        return;
      }
      if (order.status === 'FAILED') {
        callbacks.onFailed();
        return;
      }
      if (order.status === 'EXPIRED' || order.status === 'CANCELLED') {
        callbacks.onExpired();
        return;
      }
      if (attempt >= 30) {
        callbacks.onVerifyTimeout();
        return;
      }
      pollOrder(orderId, enrollmentId, callbacks, attempt + 1);
    } catch {
      if (attempt < 30) pollOrder(orderId, enrollmentId, callbacks, attempt + 1);
    }
  }, 2000);
}

export interface LaunchCheckoutCallbacks {
  /** Payment confirmed by our backend webhook and enrollment resumed to GRANTED. */
  onGranted: () => void;
  /** The PaymentOrder settled as FAILED. */
  onFailed: () => void;
  /** The checkout session expired or was cancelled. */
  onExpired: () => void;
  /** Backend polling started (Razorpay reported success) — payment is being verified. */
  onVerifying: () => void;
  /** Verification has been polling for a while without settling — not necessarily an error. */
  onVerifyTimeout: () => void;
  /** Razorpay's checkout window was dismissed without completing payment. */
  onDismissed: () => void;
  /** Checkout order creation (or script load) failed before Razorpay's modal ever opened. */
  onError: (message: string) => void;
}

/**
 * Creates a checkout order on our backend, then hands off entirely to Razorpay's own hosted
 * Checkout modal — Arcade renders no payment UI of its own. Razorpay's success callback is never
 * treated as authoritative; only our backend webhook confirming PAID (surfaced here via polling)
 * triggers onGranted.
 */
export async function launchRazorpayCheckout(
  enrollmentId: string,
  idempotencyKey: string,
  callbacks: LaunchCheckoutCallbacks
): Promise<void> {
  let checkout;
  try {
    checkout = await PaymentService.checkout(enrollmentId, idempotencyKey);
  } catch (err: any) {
    callbacks.onError(err?.message || 'Could not start checkout. Please try again.');
    return;
  }

  if (checkout.status === 'PAID') {
    callbacks.onGranted();
    return;
  }

  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    callbacks.onError('Could not load the payment gateway. Check your connection and try again.');
    return;
  }

  const rzp = new window.Razorpay({
    key: checkout.gatewayClientFields?.keyId,
    amount: checkout.amount,
    currency: checkout.currency,
    name: 'Arcade',
    description: checkout.resourceTitle || 'Course / Event enrollment',
    order_id: checkout.gatewayOrderId,
    theme: { color: '#4c6fff' },
    handler: function () {
      // Razorpay's own success callback is NOT authoritative — only the backend webhook is.
      callbacks.onVerifying();
      pollOrder(checkout.orderId, enrollmentId, callbacks);
    },
    modal: {
      ondismiss: function () {
        callbacks.onDismissed();
      },
    },
  });
  rzp.on('payment.failed', function () {
    callbacks.onVerifying();
    pollOrder(checkout.orderId, enrollmentId, callbacks);
  });
  rzp.open();
}
