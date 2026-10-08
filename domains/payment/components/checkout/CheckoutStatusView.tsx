'use client';

import { motion } from 'framer-motion';
import { PaymentLottie, type PaymentLottieKind } from './PaymentLottie';
import type { CheckoutPhase } from './checkout.types';
import { SHAPE_SMALL } from './shape';

interface Copy {
  lottie: PaymentLottieKind;
  title: string;
  body: string;
}

function copyFor(phase: CheckoutPhase, amountLabel: string): Copy | null {
  switch (phase.kind) {
    case 'paying':
      return phase.method === 'upi'
        ? {
            lottie: 'processing',
            title: 'Approve in your UPI app',
            body: `We sent a ${amountLabel} request to your UPI ID. Open the app, check the amount and approve with your PIN.`,
          }
        : {
            lottie: 'processing',
            title: 'Finish in the bank window',
            body: 'Complete the step your bank shows — OTP, PIN or login. Keep this page open; it updates by itself.',
          };
    case 'verifying':
      return { lottie: 'processing', title: 'Confirming with your bank', body: 'Just a moment — making sure the payment has settled.' };
    case 'granted':
      return { lottie: 'success', title: 'Payment successful', body: `${amountLabel} received. You're in — opening your access now.` };
    case 'declined':
      return { lottie: 'declined', title: 'Payment didn’t go through', body: `${phase.reason}. Nothing was charged — try again or pick another way to pay.` };
    case 'expired':
      return { lottie: 'declined', title: 'This checkout timed out', body: 'No payment was made. Close this and start again whenever you’re ready.' };
    case 'error':
      return { lottie: 'declined', title: 'Checkout couldn’t open', body: phase.message };
    case 'slow':
      return {
        lottie: 'processing',
        title: 'Your bank is taking a while',
        body: 'If you were charged, access is granted automatically — there’s no need to pay again. You can close this.',
      };
    default:
      return null;
  }
}

export interface CheckoutStatusViewProps {
  phase: CheckoutPhase;
  amountLabel: string;
  onRetry: () => void;
  onClose: () => void;
  onUseHosted: () => void;
}

export function CheckoutStatusView({ phase, amountLabel, onRetry, onClose, onUseHosted }: CheckoutStatusViewProps) {
  const copy = copyFor(phase, amountLabel);
  if (!copy) return null;

  return (
    <motion.div
      key={phase.kind}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full flex-col items-center justify-center px-10 text-center"
      role="status"
      aria-live="assertive"
    >
      <PaymentLottie kind={copy.lottie} size={phase.kind === 'granted' ? 168 : 136} />
      <h3 className="mt-3 text-[20px] font-semibold tracking-tight text-slate-900">{copy.title}</h3>
      <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-slate-500">{copy.body}</p>
      <div className="mt-6 flex gap-2">
        {phase.kind === 'declined' && (
          <button
            type="button"
            onClick={onRetry}
            className={`h-11 bg-ink px-6 text-[13px] font-semibold text-on-ink transition hover:bg-ink-hover ${SHAPE_SMALL}`}
          >
            Try again
          </button>
        )}
        {phase.kind === 'error' && (
          <button
            type="button"
            onClick={onUseHosted}
            className={`h-11 bg-ink px-6 text-[13px] font-semibold text-on-ink transition hover:bg-ink-hover ${SHAPE_SMALL}`}
          >
            Use standard checkout
          </button>
        )}
        {(phase.kind === 'expired' || phase.kind === 'error' || phase.kind === 'slow') && (
          <button
            type="button"
            onClick={onClose}
            className={`arcade-checkout-sunken h-11 px-6 text-[13px] font-semibold text-slate-700 transition hover:text-slate-900 ${SHAPE_SMALL}`}
          >
            Close
          </button>
        )}
      </div>
    </motion.div>
  );
}
