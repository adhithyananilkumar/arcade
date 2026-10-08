'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { PaymentService } from '../api/payment.service';
import type { PaymentOrderResponse } from '../types/payment.types';
import { humanizePaymentText } from '../utils/paymentText';

const REFRESH_MS = 30_000;

function remaining(expiresAt: string | undefined, now: number): string | null {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - now;
  if (ms <= 0) return null;
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * One quiet line under "Complete Payment": how long the open checkout (and its seat) is held, and
 * why the last attempt was declined. Renders nothing when there is no open checkout.
 *
 * `refreshKey` lets the caller force a re-read after the checkout window closes.
 */
export function CheckoutHoldStatus({ enrollmentId, refreshKey }: { enrollmentId: string; refreshKey?: number }) {
  const [order, setOrder] = useState<PaymentOrderResponse | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      PaymentService.liveOrder(enrollmentId)
        .then((live) => !cancelled && setOrder(live))
        .catch(() => !cancelled && setOrder(null));
    load();
    const refresh = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(refresh);
    };
  }, [enrollmentId, refreshKey]);

  useEffect(() => {
    if (!order?.expiresAt) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [order?.expiresAt]);

  const left = remaining(order?.expiresAt, now);
  if (!order || !left) return null;

  return (
    <div className="mt-2 space-y-1 text-[12px] font-medium" aria-live="polite">
      <p className="flex items-center gap-1.5 text-slate-500">
        <Clock size={13} className="shrink-0" />
        <span>
          Your place is held for <span className="tabular-nums font-semibold text-slate-700">{left}</span>
        </span>
      </p>
      {order.attemptCount > 0 && order.lastFailureReason && (
        <p className="flex items-start gap-1.5 text-rose-600 dark:text-rose-400">
          <AlertCircle size={13} className="mt-px shrink-0" />
          <span>
            Last attempt declined: {humanizePaymentText(order.lastFailureReason).replace(/\.$/, '')}. Nothing was charged — you
            can try again.
          </span>
        </p>
      )}
    </div>
  );
}
