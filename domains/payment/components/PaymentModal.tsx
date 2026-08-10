'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/design-system/ui/dialog';
import {
  Loader2,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Landmark,
  Wallet,
  Calendar,
  Clock3,
  Repeat,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  X,
  ChevronRight,
} from 'lucide-react';
import { formatMoney } from '@/shared/utils/money';
import { PaymentService } from '../api/payment.service';
import { CheckoutResponse, PaymentMethodOption, QrCodeResponse } from '../types/payment.types';
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

const METHOD_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  UPI: Smartphone,
  CARD: CreditCard,
  NETBANKING: Landmark,
  WALLET: Wallet,
  EMI: Calendar,
  CARDLESS_EMI: Calendar,
  PAYLATER: Clock3,
  BANK_TRANSFER: Landmark,
  UPI_RECURRING: Repeat,
};

const METHOD_RAZORPAY_KEY: Record<string, string> = {
  UPI: 'upi',
  CARD: 'card',
  NETBANKING: 'netbanking',
  WALLET: 'wallet',
  EMI: 'emi',
  CARDLESS_EMI: 'cardless_emi',
  PAYLATER: 'paylater',
  BANK_TRANSFER: 'bank_transfer',
  UPI_RECURRING: 'upi',
};

const FALLBACK_METHODS: PaymentMethodOption[] = [
  { code: 'UPI', label: 'UPI' },
  { code: 'CARD', label: 'Cards' },
  { code: 'NETBANKING', label: 'Netbanking' },
  { code: 'WALLET', label: 'Wallets' },
];

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
      <Clock size={12} /> {mins}:{secs.toString().padStart(2, '0')}
    </span>
  );
}

export function PaymentModal({ open, onClose, enrollmentId, onGranted }: PaymentModalProps) {
  const [stage, setStage] = useState<Stage>('loading');
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [methods, setMethods] = useState<PaymentMethodOption[]>(FALLBACK_METHODS);
  const [selectedMethod, setSelectedMethod] = useState<string>('UPI');

  const [qrData, setQrData] = useState<QrCodeResponse | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const qrFetchedForOrderRef = useRef<string | null>(null);

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
    setQrData(null);
    qrFetchedForOrderRef.current = null;
    try {
      const [result, supportedMethods] = await Promise.all([
        PaymentService.checkout(enrollmentId, idempotencyKeyRef.current),
        PaymentService.getSupportedMethods().catch(() => FALLBACK_METHODS),
      ]);
      setCheckout(result);
      if (supportedMethods.length > 0) {
        setMethods(supportedMethods);
        setSelectedMethod(supportedMethods.some((m) => m.code === 'UPI') ? 'UPI' : supportedMethods[0].code);
      }
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

  // Fetch the real Razorpay QR only when the user is actually looking at the UPI panel,
  // and only once per order (cached thereafter).
  useEffect(() => {
    if (!checkout || selectedMethod !== 'UPI') return;
    if (qrFetchedForOrderRef.current === checkout.orderId) return;
    if (stage !== 'ready') return;

    qrFetchedForOrderRef.current = checkout.orderId;
    setQrLoading(true);
    setQrError(null);
    PaymentService.getOrCreateQrCode(checkout.orderId)
      .then((data) => setQrData(data))
      .catch((err: any) => setQrError(err?.message || 'Could not load the UPI QR. Try another payment method.'))
      .finally(() => setQrLoading(false));
  }, [checkout, selectedMethod, stage]);

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

  // Once a QR is shown, start watching for payment automatically — the user shouldn't have to
  // click anything after scanning.
  useEffect(() => {
    if (qrData && checkout && selectedMethod === 'UPI' && stage === 'ready') {
      pollOrder(checkout.orderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrData]);

  const handlePay = useCallback(async () => {
    if (!checkout) return;
    setStage('launching');
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      toast.error('Could not load the payment gateway. Check your connection and try again.');
      setStage('ready');
      return;
    }

    const razorpayMethodKey = METHOD_RAZORPAY_KEY[selectedMethod];
    const methodConfig = razorpayMethodKey ? { [razorpayMethodKey]: true } : undefined;

    const rzp = new window.Razorpay({
      key: checkout.gatewayClientFields?.keyId,
      amount: checkout.amount,
      currency: checkout.currency,
      name: 'Arcade',
      description: checkout.resourceTitle || 'Course / Event enrollment',
      order_id: checkout.gatewayOrderId,
      theme: { color: '#4c6fff' },
      method: methodConfig,
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
  }, [checkout, pollOrder, selectedMethod]);

  const handleRetry = useCallback(() => {
    idempotencyKeyRef.current = crypto.randomUUID();
    startCheckout();
  }, [startCheckout]);

  const isReady = stage === 'ready' || stage === 'launching';

  return (
    <Dialog open={open} onOpenChange={(val: boolean) => !val && onClose()}>
      <DialogContent
        className={`overflow-hidden p-0 ${isReady ? 'max-w-xl' : 'max-w-md'}`}
        showCloseButton={false}
      >
        <div className="relative bg-gradient-to-br from-[#14142b] via-[#1c1c3d] to-[#2a2a55] px-6 py-5 text-white">
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '18px 18px',
          }} />
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
          {isReady && checkout && (
            <div className="relative mt-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Amount due</p>
                <p className="font-serif text-2xl font-medium text-white">
                  {formatMoney(checkout.amount, checkout.currency)}
                </p>
              </div>
              <CountdownBadge expiresAt={checkout.expiresAt} />
            </div>
          )}
        </div>

        <div className={isReady ? 'p-0' : 'px-6 py-6'}>
          {stage === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-14 text-slate-500">
              <Loader2 className="animate-spin" size={26} />
              <p className="text-sm">Preparing your order…</p>
            </div>
          )}

          {stage === 'error' && (
            <div className="flex flex-col items-center gap-4 py-10 text-center animate-in fade-in zoom-in duration-300">
              <div className="rounded-full bg-red-50 p-4 ring-8 ring-red-50/50">
                <XCircle className="text-red-500" size={36} />
              </div>
              <div className="space-y-1.5 px-4">
                <h3 className="text-lg font-semibold text-[#14142b]">Checkout Unavailable</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">
                  {errorMessage?.toLowerCase().includes('credentials') || errorMessage?.toLowerCase().includes('java')
                    ? 'The payment gateway is currently misconfigured or unavailable. Please contact support or try again later.'
                    : errorMessage}
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-4 rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 active:scale-95"
              >
                Close Window
              </button>
            </div>
          )}

          {isReady && checkout && (
            <div className="grid grid-cols-[168px_1fr] divide-x divide-slate-100">
              {/* Left: payment methods */}
              <div className="space-y-1 bg-slate-50/60 p-3">
                <p className="mb-2 px-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Pay using
                </p>
                {methods.map((method) => {
                  const Icon = METHOD_ICONS[method.code] || CreditCard;
                  const active = selectedMethod === method.code;
                  return (
                    <button
                      key={method.code}
                      onClick={() => setSelectedMethod(method.code)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-[12.5px] font-medium transition-all ${
                        active
                          ? 'bg-white text-[#14142b] shadow-sm ring-1 ring-[#4c6fff]/30'
                          : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
                      }`}
                    >
                      <Icon size={15} className={active ? 'text-[#4c6fff]' : 'text-slate-400'} />
                      <span className="flex-1">{method.label}</span>
                      {active && <ChevronRight size={13} className="text-[#4c6fff]" />}
                    </button>
                  );
                })}
              </div>

              {/* Right: contextual panel */}
              <div className="flex flex-col justify-between p-5">
                {selectedMethod === 'UPI' ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                    {qrLoading && (
                      <div className="flex flex-col items-center gap-2 py-6 text-slate-400">
                        <Loader2 className="animate-spin" size={24} />
                        <p className="text-[12px]">Fetching your UPI QR…</p>
                      </div>
                    )}
                    {!qrLoading && qrError && (
                      <div className="flex flex-col items-center gap-2 py-6">
                        <XCircle className="text-red-400" size={24} />
                        <p className="text-[12px] text-slate-500">{qrError}</p>
                        <button
                          onClick={() => {
                            qrFetchedForOrderRef.current = null;
                            setQrError(null);
                            setSelectedMethod('UPI');
                          }}
                          className="text-[12px] font-medium text-[#4c6fff] hover:underline"
                        >
                          Try again
                        </button>
                      </div>
                    )}
                    {!qrLoading && !qrError && qrData && (
                      <>
                        <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={qrData.imageUrl} alt="Razorpay UPI QR code" width={168} height={168} className="rounded-lg" />
                        </div>
                        <p className="text-[13px] font-semibold text-[#14142b]">Scan with any UPI app</p>
                        <p className="max-w-[220px] text-[11.5px] leading-relaxed text-slate-500">
                          GPay, PhonePe, Paytm, BHIM — this page updates automatically the instant we
                          receive your payment.
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Loader2 size={11} className="animate-spin" /> Watching for payment…
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
                    {(() => {
                      const Icon = METHOD_ICONS[selectedMethod] || CreditCard;
                      return (
                        <div className="rounded-2xl bg-[#4c6fff]/10 p-4">
                          <Icon size={28} className="text-[#4c6fff]" />
                        </div>
                      );
                    })()}
                    <p className="text-[13px] font-semibold text-[#14142b]">
                      Pay via {methods.find((m) => m.code === selectedMethod)?.label || selectedMethod}
                    </p>
                    <p className="max-w-[220px] text-[11.5px] leading-relaxed text-slate-500">
                      You'll complete this securely on Razorpay's checkout window.
                    </p>
                  </div>
                )}

                {selectedMethod !== 'UPI' && (
                  <button
                    onClick={handlePay}
                    disabled={stage === 'launching'}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4c6fff] py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(76,111,255,0.35)] transition-all hover:bg-[#3d5ce0] active:scale-[0.98] disabled:opacity-70"
                  >
                    {stage === 'launching' ? (
                      <>
                        <Loader2 className="animate-spin" size={16} /> Opening secure checkout…
                      </>
                    ) : (
                      <>Pay {formatMoney(checkout.amount, checkout.currency)}</>
                    )}
                  </button>
                )}

                <p className="mt-3 flex items-center justify-center gap-1.5 text-[10.5px] text-slate-400">
                  <ShieldCheck size={12} /> Payments secured by Razorpay
                </p>
              </div>
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
