'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AtSign, Check, Loader2, RefreshCw, ScanLine, X } from 'lucide-react';
import { vpaLooksValid } from '../../utils/card';
import type { QrState } from './checkout.types';

const QR_TOTAL_SECONDS = 240;

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
 * The QR sits on a white plate whose border drains as the QR's four minutes run out — the timer is
 * the frame itself, so nobody has to look away from the code to see how long it has left.
 */
function QrPlate({ state, onRefresh }: { state: QrState; onRefresh: () => void }) {
  const qr = state.status === 'ready' || state.status === 'lapsed' ? state.qr : null;
  const left = useSecondsLeft(state.status === 'ready' ? state.qr.expiresAt : undefined);
  // Out of the full four minutes: a QR cut short by the checkout ending starts part-drained.
  const fraction = state.status === 'ready' ? Math.max(0, Math.min(1, left / QR_TOTAL_SECONDS)) : 0;
  const tone = timerTone(left);
  const lapsed = state.status === 'lapsed';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-[232px] w-[232px]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 232 232" aria-hidden>
          <rect x="3" y="3" width="226" height="226" rx="26" fill="none" strokeWidth="4" className="stroke-slate-200" />
          {state.status === 'ready' && (
            <rect
              x="3"
              y="3"
              width="226"
              height="226"
              rx="26"
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
        <div className="theme-fixed absolute inset-[12px] overflow-hidden rounded-[18px] bg-white p-3 shadow-[0_6px_24px_-10px_rgba(20,22,43,0.35)]">
          <AnimatePresence mode="wait">
            {state.status === 'loading' || state.status === 'idle' ? (
              <motion.div
                key="loading"
                className="h-full w-full animate-pulse rounded-xl bg-[repeating-linear-gradient(45deg,#eef1f6_0_8px,#f6f8fb_8px_16px)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            ) : qr ? (
              <motion.img
                key={qr.qrCodeId}
                src={qr.imageUrl}
                alt="UPI QR code for this payment"
                className="h-full w-full object-contain"
                initial={{ opacity: 0, scale: 0.94, filter: 'blur(6px)' }}
                animate={{ opacity: lapsed ? 0.35 : 1, scale: 1, filter: lapsed ? 'blur(5px)' : 'blur(0px)' }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-[12px] font-medium text-slate-500">
                {state.status === 'error' ? state.message : null}
              </div>
            )}
          </AnimatePresence>
          {(lapsed || state.status === 'error') && (
            <motion.button
              type="button"
              onClick={onRefresh}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-x-6 top-1/2 flex -translate-y-1/2 items-center justify-center gap-2 rounded-full bg-[#14142b] px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg hover:bg-[#232735]"
            >
              <RefreshCw size={14} />
              {lapsed ? 'Generate new QR' : 'Try again'}
            </motion.button>
          )}
        </div>
      </div>
      <div className="flex h-6 items-center gap-2 text-[12px] font-medium text-slate-500" aria-live="polite">
        {state.status === 'ready' ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: tone }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: tone }} />
            </span>
            <span>
              Valid for <span className="font-semibold tabular-nums text-slate-800">{clock(left)}</span>
            </span>
          </>
        ) : lapsed ? (
          <span>This QR has expired — a payment made just now will still be found.</span>
        ) : state.status === 'loading' ? (
          <span>Preparing your QR…</span>
        ) : null}
      </div>
    </div>
  );
}

const UPI_APPS = ['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'Amazon Pay', 'CRED'];

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
    <div className="flex h-full flex-col">
      <div className="flex items-start gap-6">
        <QrPlate state={qr} onRefresh={onLoadQr} />
        <div className="flex-1 pt-2">
          <div className="mb-1 flex items-center gap-2 text-[15px] font-semibold text-slate-900">
            <ScanLine size={17} className="text-slate-500" />
            Scan &amp; pay {amountLabel}
          </div>
          <p className="text-[13px] leading-relaxed text-slate-500">
            Open any UPI app on your phone, scan the code and approve. This page updates on its own the moment the
            payment lands.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {UPI_APPS.map((app) => (
              <span
                key={app}
                className="arcade-checkout-sunken rounded-full px-2.5 py-1 text-[11px] font-semibold text-slate-600"
              >
                {app}
              </span>
            ))}
          </div>
          <ol className="mt-5 space-y-2 text-[12px] text-slate-500">
            {['Open your UPI app', 'Tap scan and point at the code', 'Approve with your UPI PIN'].map((step, i) => (
              <li key={step} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-on-ink">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {upiIdEnabled && (
        <div className="mt-auto pt-5">
          <div className="mb-3 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or pay with your UPI ID
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (check === 'valid' && canPay) onPayWithVpa(vpa);
            }}
          >
            <label className="arcade-checkout-sunken relative flex flex-1 items-center rounded-xl px-3 focus-within:ring-2 focus-within:ring-ink/20">
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
              className="h-11 rounded-xl bg-ink px-5 text-[13px] font-semibold text-on-ink transition hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-40"
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
