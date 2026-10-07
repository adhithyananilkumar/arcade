'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { AtSign, Check, Loader2, RefreshCw, X } from 'lucide-react';
import { vpaLooksValid } from '../../utils/card';
import { MethodLogo, upiAppLogoUrl } from './MethodLogo';
import type { QrState } from './checkout.types';
import type { QrCodeResponse } from '../../types/payment.types';

const QR_TOTAL_SECONDS = 240;

const UPI_APPS: { id: string; name: string }[] = [
  { id: 'googlepay', name: 'Google Pay' },
  { id: 'phonepe', name: 'PhonePe' },
  { id: 'paytm', name: 'Paytm' },
  { id: 'bhim', name: 'BHIM' },
  { id: 'amazonpay', name: 'Amazon Pay' },
  { id: 'cred', name: 'CRED' },
];

function clock(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

/** Seconds left on a timestamp, ticking. */
function useSecondsLeft(until: string | undefined): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!until) return;
    const tick = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(tick);
  }, [until]);
  return until ? (new Date(until).getTime() - now) / 1000 : 0;
}

function timerTone(left: number): string {
  if (left <= 20) return '#f43f5e';
  if (left <= 60) return '#f59e0b';
  return '#10b981';
}

/**
 * The bare, scannable code. Drawn here from the UPI intent — Razorpay's own image is a branded
 * poster with the code shrunk inside it — and falls back to that image only when no intent came.
 */
function QrImage({ qr, lapsed }: { qr: QrCodeResponse; lapsed: boolean }) {
  const [drawn, setDrawn] = useState<{ id: string; src: string } | null>(null);

  useEffect(() => {
    if (!qr.upiPayload) return;
    let live = true;
    QRCode.toDataURL(qr.upiPayload, {
      errorCorrectionLevel: 'M',
      margin: 0,
      width: 560,
      color: { dark: '#0b0d1a', light: '#ffffff' },
    })
      .then((src) => live && setDrawn({ id: qr.qrCodeId, src }))
      .catch(() => live && setDrawn(null));
    return () => {
      live = false;
    };
  }, [qr.qrCodeId, qr.upiPayload]);

  const src = drawn?.id === qr.qrCodeId ? drawn.src : qr.upiPayload ? null : qr.imageUrl;
  if (!src) return <div className="h-full w-full animate-pulse rounded-lg bg-slate-100" />;

  return (
    <motion.img
      key={qr.qrCodeId}
      src={src}
      alt="UPI QR code for this payment"
      className="h-full w-full object-contain [image-rendering:pixelated]"
      initial={{ opacity: 0, scale: 0.94, filter: 'blur(6px)' }}
      animate={{ opacity: lapsed ? 0.3 : 1, scale: 1, filter: lapsed ? 'blur(6px)' : 'blur(0px)' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

/**
 * The QR sits on a white plate whose border drains as its four minutes run out — the timer is the
 * frame itself, so nobody has to look away from the code to see how long it has left.
 */
function QrPlate({ state, onRefresh }: { state: QrState; onRefresh: () => void }) {
  const qr = state.status === 'ready' || state.status === 'lapsed' ? state.qr : null;
  const left = useSecondsLeft(state.status === 'ready' ? state.qr.expiresAt : undefined);
  // Out of the full four minutes: a QR cut short by the checkout ending starts part-drained.
  const fraction = state.status === 'ready' ? Math.max(0, Math.min(1, left / QR_TOTAL_SECONDS)) : 0;
  const tone = timerTone(left);
  const lapsed = state.status === 'lapsed';

  return (
    <div className="flex shrink-0 flex-col items-center gap-3">
      <div className="relative h-[248px] w-[248px]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 248 248" aria-hidden>
          <rect x="3" y="3" width="242" height="242" rx="28" fill="none" strokeWidth="4" className="stroke-slate-200" />
          {state.status === 'ready' && (
            <rect
              x="3"
              y="3"
              width="242"
              height="242"
              rx="28"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - fraction}
              style={{ stroke: tone, transition: 'stroke-dashoffset 0.25s linear, stroke 0.6s ease' }}
            />
          )}
        </svg>
        <div className="theme-fixed absolute inset-[12px] overflow-hidden rounded-[20px] bg-white p-4 shadow-[0_8px_28px_-12px_rgba(20,22,43,0.4)]">
          <AnimatePresence mode="wait">
            {qr ? (
              <QrImage key={qr.qrCodeId} qr={qr} lapsed={lapsed} />
            ) : state.status === 'error' ? (
              <div key="error" className="flex h-full items-center justify-center px-3 text-center text-[12px] font-medium text-slate-500">
                {state.message}
              </div>
            ) : (
              <motion.div
                key="loading"
                className="h-full w-full animate-pulse rounded-lg bg-[repeating-linear-gradient(45deg,#eef1f6_0_8px,#f6f8fb_8px_16px)]"
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
          {(lapsed || state.status === 'error') && (
            <motion.button
              type="button"
              onClick={onRefresh}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-x-6 top-1/2 flex -translate-y-1/2 items-center justify-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-[#14142b] px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg hover:bg-[#232735]"
            >
              <RefreshCw size={14} />
              {lapsed ? 'Generate new QR' : 'Try again'}
            </motion.button>
          )}
        </div>
      </div>
      <div className="flex h-6 items-center gap-2 text-[12px] font-medium text-slate-500" aria-live="polite">
        {state.status === 'ready' ? (
          <span>
            Valid for <span className="font-semibold tabular-nums" style={{ color: left <= 60 ? tone : undefined }}>{clock(left)}</span>
          </span>
        ) : lapsed ? (
          <span>QR expired — a payment made just now still counts.</span>
        ) : state.status === 'loading' || state.status === 'idle' ? (
          <span>Preparing your QR…</span>
        ) : null}
      </div>
    </div>
  );
}

type VpaCheck = 'idle' | 'checking' | 'valid' | 'invalid';

export interface UpiPaneProps {
  qr: QrState;
  onLoadQr: () => void;
  /** Whether UPI ID (collect) is available on this account. */
  upiIdEnabled: boolean;
  onVerifyVpa: (vpa: string) => Promise<boolean>;
  onPayWithVpa: (vpa: string) => void;
  canPay: boolean;
  amountLabel: string;
}

export function UpiPane({ qr, onLoadQr, upiIdEnabled, onVerifyVpa, onPayWithVpa, canPay, amountLabel }: UpiPaneProps) {
  const [vpa, setVpa] = useState('');
  // The gateway's answer for one specific ID; any other ID is still being checked.
  const [verdict, setVerdict] = useState<{ vpa: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (qr.status === 'idle') onLoadQr();
  }, [qr.status, onLoadQr]);

  // Debounced existence check once the ID looks complete.
  useEffect(() => {
    if (!vpaLooksValid(vpa)) return;
    let live = true;
    const timer = setTimeout(async () => {
      const ok = await onVerifyVpa(vpa);
      if (live) setVerdict({ vpa, ok });
    }, 500);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [vpa, onVerifyVpa]);

  const check: VpaCheck = !vpaLooksValid(vpa)
    ? 'idle'
    : verdict?.vpa === vpa
      ? verdict.ok
        ? 'valid'
        : 'invalid'
      : 'checking';

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center gap-6 @xl:flex-row @xl:items-start">
        <QrPlate state={qr} onRefresh={onLoadQr} />
        <div className="w-full flex-1 @xl:pt-2">
          <h3 className="text-[16px] font-semibold tracking-tight text-slate-900">Scan to pay {amountLabel}</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
            Scan with any UPI app and approve with your PIN. This page confirms on its own the moment the payment
            lands.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Works with any UPI app">
            {UPI_APPS.map((app) => (
              <span key={app.id} title={app.name}>
                <MethodLogo src={upiAppLogoUrl(app.id)} name={app.name} code={app.id} size={36} />
              </span>
            ))}
            <span className="text-[11.5px] font-medium text-slate-400">&amp; every UPI app</span>
          </div>
          <ol className="mt-5 space-y-2.5 text-[12.5px] text-slate-600">
            {['Open your UPI app and tap Scan', 'Point your camera at the code', 'Check the amount and enter your UPI PIN'].map(
              (step, i) => (
                <li key={step} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-on-ink">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ),
            )}
          </ol>
        </div>
      </div>

      {upiIdEnabled && (
        <div className="pt-6">
          <div className="mb-3 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or pay with your UPI ID
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <form
            className="flex flex-col gap-2 @md:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (check === 'valid' && canPay) onPayWithVpa(vpa);
            }}
          >
            <label className="arcade-checkout-sunken relative flex flex-1 items-center rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md px-3 focus-within:ring-2 focus-within:ring-ink/20">
              <AtSign size={15} className="shrink-0 text-slate-400" />
              <input
                value={vpa}
                onChange={(e) => setVpa(e.target.value.replace(/\s+/g, ''))}
                placeholder="yourname@okbank"
                autoComplete="off"
                spellCheck={false}
                aria-label="UPI ID"
                className="h-11 w-full bg-transparent px-2 text-[14px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
              />
              <span className="w-5 shrink-0" aria-live="polite">
                {check === 'checking' && <Loader2 size={15} className="animate-spin text-slate-400" />}
                {check === 'valid' && <Check size={16} className="text-emerald-500" aria-label="UPI ID found" />}
                {check === 'invalid' && <X size={16} className="text-rose-500" aria-label="UPI ID not found" />}
              </span>
            </label>
            <button
              type="submit"
              disabled={check !== 'valid' || !canPay}
              className="h-11 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-ink px-5 text-[13px] font-semibold text-on-ink transition hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send request
            </button>
          </form>
          {check === 'invalid' && (
            <p className="mt-1.5 text-[12px] text-rose-600 dark:text-rose-400">That UPI ID could not be found. Check it and try again.</p>
          )}
        </div>
      )}
    </div>
  );
}
