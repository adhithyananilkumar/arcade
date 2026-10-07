'use client';

import { useCustomCheckout } from '../../hooks/useCustomCheckout';
import type { LaunchCheckoutCallbacks } from '../../utils/launchRazorpayCheckout';
import { CheckoutModal } from './CheckoutModal';

export interface CustomCheckoutProps {
  enrollmentId: string;
  idempotencyKey: string;
  payerEmail: string;
  payerPhone?: string;
  callbacks: LaunchCheckoutCallbacks;
  /** The session ended (paid, dismissed, expired…); unmount this. */
  onClosed: () => void;
  /** The learner asked for Razorpay's own checkout instead. */
  onUseHosted: () => void;
}

/** Arcade's own desktop checkout for one enrollment. Mount it to open; it calls `onClosed` when done. */
export function CustomCheckout(props: CustomCheckoutProps) {
  const checkout = useCustomCheckout(props);
  return (
    <CheckoutModal
      open={checkout.open}
      onExited={checkout.onExited}
      phase={checkout.phase}
      summary={checkout.summary}
      methods={checkout.methods}
      qr={checkout.qr}
      payerEmail={props.payerEmail}
      phone={checkout.phone}
      phoneValid={checkout.phoneValid}
      onPhoneChange={checkout.setPhone}
      onLoadQr={checkout.loadQr}
      onPayWithCard={checkout.payWithCard}
      onPayWithBank={checkout.payWithBank}
      onPayWithWallet={checkout.payWithWallet}
      cardNetwork={checkout.cardNetwork}
      onRetry={checkout.backToMethods}
      onClose={checkout.close}
      onUseHosted={checkout.switchToHosted}
    />
  );
}

/**
 * Whether this device gets Arcade's own checkout: a desktop-class screen with a precise pointer.
 * Phones and tablets keep Razorpay's hosted checkout, which handles UPI app hand-off natively.
 * `NEXT_PUBLIC_CUSTOM_CHECKOUT=off` turns it off everywhere (e.g. until Razorpay enables Custom
 * Checkout on the account).
 */
export function prefersCustomCheckout(): boolean {
  if (typeof window === 'undefined') return false;
  if (process.env.NEXT_PUBLIC_CUSTOM_CHECKOUT === 'off') return false;
  return window.matchMedia?.('(min-width: 1024px) and (pointer: fine)').matches ?? false;
}
