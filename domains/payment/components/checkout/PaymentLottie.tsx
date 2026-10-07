'use client';

import { useMemo, useRef } from 'react';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import processingAnimation from '@/public/lottie/payment-processing.json';
import successAnimation from '@/public/lottie/payment-success.json';
import declinedAnimation from '@/public/lottie/payment-declined.json';

export type PaymentLottieKind = 'processing' | 'success' | 'declined';

const SOURCES: Record<PaymentLottieKind, unknown> = {
  processing: processingAnimation,
  success: successAnimation,
  declined: declinedAnimation,
};

/** The processing animation is drawn in this placeholder magenta and repainted in the theme's ink. */
const PLACEHOLDER = [1, 0, 1];

function inkRgb(): number[] {
  if (typeof window === 'undefined') return [0.08, 0.08, 0.17];
  const probe = document.createElement('span');
  probe.style.color = 'var(--theme-ink, #14142b)';
  probe.style.display = 'none';
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  const channels = resolved.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  if (!channels || channels.length < 3) return [0.08, 0.08, 0.17];
  // `color()`/oklch() serialisations come back in 0–1 already; rgb() in 0–255.
  return channels.some((c) => c > 1) ? channels.map((c) => c / 255) : channels;
}

function repaint(node: unknown, rgb: number[]): unknown {
  if (Array.isArray(node)) {
    const isPlaceholder =
      node.length === 4 && node.slice(0, 3).every((v, i) => typeof v === 'number' && Math.abs(v - PLACEHOLDER[i]) < 0.01);
    return isPlaceholder ? [...rgb, node[3]] : node.map((child) => repaint(child, rgb));
  }
  if (node && typeof node === 'object') {
    return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, repaint(value, rgb)]));
  }
  return node;
}

/**
 * Arcade's payment animations: a processing orbit (loops, in the theme's ink), and one-shot success
 * and declined marks. Honours reduced motion by holding the final frame.
 */
export function PaymentLottie({ kind, size = 132 }: { kind: PaymentLottieKind; size?: number }) {
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  const data = useMemo(() => (kind === 'processing' ? repaint(SOURCES[kind], inkRgb()) : SOURCES[kind]), [kind]);
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  return (
    <div style={{ width: size, height: size }} aria-hidden>
      <Lottie
        key={kind}
        lottieRef={lottieRef}
        animationData={data}
        loop={kind === 'processing' && !reduceMotion}
        autoplay={!reduceMotion}
        onDOMLoaded={() => {
          // Reduced motion: show the finished mark, not an empty first frame.
          if (reduceMotion && kind !== 'processing') {
            const total = lottieRef.current?.getDuration(true) ?? 0;
            lottieRef.current?.goToAndStop(Math.max(0, total - 1), true);
          }
        }}
      />
    </div>
  );
}
