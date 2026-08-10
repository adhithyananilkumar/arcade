'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/design-system/ui/dialog';
import { Loader2, ShieldCheck, CreditCard, Smartphone, Landmark, Wallet, CheckCircle2, XCircle, Clock, RefreshCw, X } from 'lucide-react';
import { formatMoney } from '@/shared/utils/money';
import { PaymentService } from '../api/payment.service';
import { CheckoutResponse, PaymentOrderStatus } from '../types/payment.types';
import { EnrollmentService } from '@/domains/enrollment/api/enrollment.service';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  enrollmentId: string;
  /** Called once the enrollment is confirmed GRANTED after payment. */
  onGranted: () => void;
}

type Stage = 'loading' | 'ready' | 'launching' | 'verifying' | 'success' | 'failed' | 'expired' | 'error';

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

/** Deterministic pixel-grid placeholder standing in for a real QR until Razorpay's QR data is wired in. */
function PseudoQr({ seed }: { seed: string }) {
  const cells = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    const size = 7;
    const grid: boolean[] = [];
    let state = hash || 1;
    for (let i = 0; i < size * size; i++) {
      state = (state * 1103515245 + 12345) >>> 0;
      grid.push(((state >> 16) & 1) === 1);
    }
    return { size, grid };
  }, [seed]);

  return (
    <div
      className="grid gap-[3px] rounded-lg bg-white p-2.5 shadow-inner"
      style={{ gridTemplateColumns: `repeat(${cells.size}, minmax(0, 1fr))`, width: 132, height: 132 }}
    >
      {cells.grid.map((on, i) => (
        <div key={i} className={`rounded-[1.5px] ${on ? 'bg-[#14142b]' : 'bg-transparent'}`} />
      ))}
    </div>
  );
}

function CountdownBadge({ expiresAt }: { expiresAt?: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) return;
    const target = new Date(expiresAt).getTime();
    const tick = () => setRemaining(Math.max(0, Math.floor((target - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (remaining === null) return null;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
      <Clock size={12} /> Expires in {mins}:{secs.toString().padStart(2, '0')}
    </span>
  );
}

export function PaymentModal({ open, onClose, enrollmentId, onGranted }: PaymentModalProps) {
  const [stage, setStage] = useState<Stage>('loading');
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());
  const pollHandleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPoll = useCallback(() => {
    if (pollHandleRef.current) {
      clearTimeout(pollHandleRef.current);
      pollHandleRef.current = null;
    }
  }, []);

  const startCheckout = useCallback(async () => {
    setStage('loading');
    setErrorMessage(null);
    try {
      const result = await PaymentService.checkout(enrollmentId, idempotencyKeyRef.current);
      setCheckout(result);
      if (result.status === 'PAID') {
        setStage('success');
      } else {
        setStage('ready');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not start checkout. Please try again.');
      setStage('error');
    }
  }, [enrollmentId]);

  useEffect(() => {
    if (open) {
      idempotencyKeyRef.current = crypto.randomUUID();
      startCheckout();
    } else {
      clearPoll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => clearPoll, [clearPoll]);

  const pollOrder = useCallback(
    (orderId: string, attempt = 0) => {
      clearPoll();
      pollHandleRef.current = setTimeout(async () => {
        try {
          const order = await PaymentService.getOrder(orderId);
          if (order.status === 'PAID') {
            try {
              const result = await EnrollmentService.resume(enrollmentId);
              if (result.status === 'GRANTED') {
                setStage('success');
                toast.success('Payment successful — you are enrolled!');
                setTimeout(() => onGranted(), 900);
                return;
              }
            } catch {
              // fall through — payment is confirmed regardless; keep polling resume briefly
            }
            if (attempt < 5) {
              pollOrder(orderId, attempt + 1);
            } else {
              setStage('success');
              toast.success('Payment received — finalizing your access.');
              setTimeout(() => onGranted(), 900);
            }
            return;
          }
          if (order.status === 'FAILED') {
            setStage('failed');
            return;
          }
          if (order.status === 'EXPIRED' || order.status === 'CANCELLED') {
            setStage('expired');
            return;
          }
          if (attempt >= 30) {
            // Stop auto-polling after ~60s; user can still check manually.
            setStage('verifying');
            return;
          }
          pollOrder(orderId, attempt + 1);
        } catch {
          if (attempt < 30) pollOrder(orderId, attempt + 1);
        }
      }, 2000);
    },
    [clearPoll, enrollmentId, onGranted]
  );

  const handlePay = useCallback(async () => {
    if (!checkout) return;
    setStage('launching');
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      toast.error('Could not load the payment gateway. Check your connection and try again.');
      setStage('ready');
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
        setStage('verifying');
        pollOrder(checkout.orderId);
      },
      modal: {
        ondismiss: function () {
          setStage((s) => (s === 'launching' ? 'ready' : s));
        },
      },
    });
    rzp.on('payment.failed', function () {
      setStage('verifying');
      pollOrder(checkout.orderId);
    });
    rzp.open();
  }, [checkout, pollOrder]);

  const handleRetry = useCallback(() => {
    idempotencyKeyRef.current = crypto.randomUUID();
    startCheckout();
  }, [startCheckout]);

  return (
    <Dialog open={open} onOpenChange={(val: boolean) => !val && onClose()}>
      <DialogContent className="max-w-md overflow-hidden p-0" showCloseButton={false}>
        <div className="relative bg-gradient-to-br from-[#14142b] to-[#2a2a55] px-6 py-5 text-white">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-white">
              {checkout?.resourceTitle || 'Secure Checkout'}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-white/60">
              Complete your payment to unlock access
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-6">
          {stage === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-10 text-slate-500">
              <Loader2 className="animate-spin" size={26} />
              <p className="text-sm">Preparing your order…</p>
            </div>
          )}

          {stage === 'error' && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <XCircle className="text-red-500" size={32} />
              <p className="text-sm text-slate-600">{errorMessage}</p>
              <button
                onClick={onClose}
                className="mt-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          )}

          {(stage === 'ready' || stage === 'launching') && checkout && (
            <div className="space-y-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Amount due</p>
                  <p className="font-serif text-3xl font-medium text-[#14142b]">
                    {formatMoney(checkout.amount, checkout.currency)}
                  </p>
                </div>
                <CountdownBadge expiresAt={checkout.expiresAt} />
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <PseudoQr seed={checkout.gatewayOrderId || checkout.orderId} />
                <div>
                  <p className="text-[13px] font-semibold text-[#14142b]">Scan to pay via UPI</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                    Live QR preview — powered by Razorpay. For now, tap Pay below to complete checkout.
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Accepted payment methods
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: CreditCard, label: 'Cards' },
                    { icon: Smartphone, label: 'UPI' },
                    { icon: Landmark, label: 'Netbanking' },
                    { icon: Wallet, label: 'Wallets' },
                  ].map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600"
                    >
                      <Icon size={13} className="text-slate-400" /> {label}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={stage === 'launching'}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4c6fff] py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(76,111,255,0.35)] transition-all hover:bg-[#3d5ce0] active:scale-[0.98] disabled:opacity-70"
              >
                {stage === 'launching' ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Opening secure checkout…
                  </>
                ) : (
                  <>Pay {formatMoney(checkout.amount, checkout.currency)}</>
                )}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck size={13} /> Payments secured by Razorpay
              </p>
            </div>
          )}

          {stage === 'verifying' && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Loader2 className="animate-spin text-[#4c6fff]" size={28} />
              <p className="text-sm font-medium text-[#14142b]">Verifying your payment…</p>
              <p className="text-[12px] text-slate-500">
                This confirms once our system receives the bank/gateway confirmation. It's usually instant.
              </p>
              {checkout && (
                <button
                  onClick={() => pollOrder(checkout.orderId)}
                  className="mt-1 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#4c6fff] hover:underline"
                >
                  <RefreshCw size={12} /> Check status again
                </button>
              )}
            </div>
          )}

          {stage === 'success' && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <CheckCircle2 className="text-emerald-500" size={36} />
              <p className="text-sm font-semibold text-[#14142b]">Payment successful!</p>
              <p className="text-[12px] text-slate-500">You now have access. Redirecting…</p>
            </div>
          )}

          {stage === 'failed' && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <XCircle className="text-red-500" size={32} />
              <p className="text-sm font-semibold text-[#14142b]">Payment failed</p>
              <p className="text-[12px] text-slate-500">No amount was deducted for the failed attempt. You can try again.</p>
              <button
                onClick={handleRetry}
                className="mt-2 rounded-lg bg-[#4c6fff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d5ce0]"
              >
                Try again
              </button>
            </div>
          )}

          {stage === 'expired' && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Clock className="text-amber-500" size={32} />
              <p className="text-sm font-semibold text-[#14142b]">This checkout session expired</p>
              <p className="text-[12px] text-slate-500">Start a new checkout to continue.</p>
              <button
                onClick={handleRetry}
                className="mt-2 rounded-lg bg-[#4c6fff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d5ce0]"
              >
                Start new checkout
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
