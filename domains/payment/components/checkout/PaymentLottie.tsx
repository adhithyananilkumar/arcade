'use client';

import { lazy, Suspense } from 'react';

export type PaymentLottieKind = 'processing' | 'success' | 'declined';

// lottie-web (~300 KB) and the animation data load only when a payment status is actually shown.
// The payment barrel is reachable from many pages (every enrol button), and before this split each
// of them downloaded the animation player whether or not anyone paid.
const PaymentLottieAnimation = lazy(() => import('./PaymentLottieAnimation'));

/**
 * Arcade's payment animations: a processing orbit (loops, in the theme's ink), and one-shot success
 * and declined marks. Honours reduced motion by holding the final frame.
 */
export function PaymentLottie({ kind, size = 132 }: { kind: PaymentLottieKind; size?: number }) {
  return (
    // Same box while loading, so the status text beside it doesn't jump when the animation lands.
    <Suspense fallback={<div style={{ width: size, height: size }} aria-hidden />}>
      <PaymentLottieAnimation kind={kind} size={size} />
    </Suspense>
  );
}
