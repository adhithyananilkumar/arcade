'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Clock, CreditCard, Lock, QrCode, ShieldCheck, Smartphone, Wallet, X } from 'lucide-react';
import { formatMoney } from '@/shared/utils/money';
import { UpiPane } from './UpiPane';
import { CardPane } from './CardPane';
import { ChoicePane, POPULAR_BANKS, WALLET_NAMES, type Choice } from './ChoicePane';
import { bankLogoUrl, walletLogoUrl } from './MethodLogo';
import { CheckoutStatusView } from './CheckoutStatusView';
import { SHAPE, SHAPE_INNER, SHAPE_SMALL } from './shape';
import type { AvailableMethods, CardInput, CheckoutMethod, CheckoutPhase, CheckoutSummary, QrState } from './checkout.types';

export interface CheckoutModalProps {
  /** False starts the closing animation; `onExited` follows once it has finished. */
  open: boolean;
  onExited: () => void;
  phase: CheckoutPhase;
  summary: CheckoutSummary | null;
  methods: AvailableMethods | null;
  qr: QrState;
  payerEmail: string;
  phone: string;
  phoneValid: boolean;
  onPhoneChange: (value: string) => void;
  onLoadQr: () => void;
  onPayWithCard: (card: CardInput) => void;
  onPayWithBank: (code: string) => void;
  onPayWithWallet: (code: string) => void;
  cardNetwork: (number: string) => string;
  onRetry: () => void;
  onClose: () => void;
  /** Offered only when Arcade's checkout cannot open at all. */
  onUseHosted: () => void;
}


const TABS: { id: CheckoutMethod; label: string; icon: typeof QrCode; hint: string }[] = [
  { id: 'upi', label: 'UPI', icon: QrCode, hint: 'QR or UPI ID' },
  { id: 'card', label: 'Card', icon: CreditCard, hint: 'Debit & credit' },
  { id: 'netbanking', label: 'Netbanking', icon: Building2, hint: 'All major banks' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, hint: 'Mobile wallets' },
];

function useClock(until: string | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!until) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [until]);
  if (!until) return null;
  const s = Math.max(0, Math.floor((new Date(until).getTime() - now) / 1000));
  return {
    label: `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`,
    // Out of the server's standard 30-minute hold.
    fraction: Math.min(1, s / SEAT_HOLD_SECONDS),
  };
}

const SEAT_HOLD_SECONDS = 30 * 60;

/**
 * Shown only when the learner's profile has no mobile number: the gateway needs one for card,
 * netbanking, wallet and UPI ID payments (scanning the QR works without it).
 */
function PhoneStrip({ phone, onPhoneChange }: Pick<CheckoutModalProps, 'phone' | 'onPhoneChange'>) {
  return (
    <label className={`arcade-checkout-sunken mt-3 flex shrink-0 items-center gap-2 px-3 focus-within:ring-2 focus-within:ring-ink/20 ${SHAPE_SMALL}`}>
      <Smartphone size={14} className="shrink-0 text-slate-400" />
      <span className="text-[13px] font-semibold text-slate-500">+91</span>
      <input
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="Mobile number — your bank needs it to confirm"
        aria-label="Mobile number"
        className="h-10 w-full bg-transparent text-[13px] font-medium tabular-nums text-slate-900 outline-none placeholder:text-slate-400"
      />
    </label>
  );
}

function OrderSummary({ summary }: Pick<CheckoutModalProps, 'summary'>) {
  const held = useClock(summary?.expiresAt);

  return (
    <aside className="relative flex shrink-0 flex-col gap-4 overflow-hidden border-b border-[var(--checkout-hairline)] p-6 md:w-[330px] md:border-b-0 md:border-r md:p-7">
      {/* Ambient colour, kept faint so the frost stays calm. */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,#6c7dff_0%,transparent_70%)] opacity-[0.14] blur-2xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,#2dd4bf_0%,transparent_70%)] opacity-[0.1] blur-2xl" />

      <div className="relative pl-1.5">
        <Image src="/arcade.svg" alt="Arcade" width={96} height={22} className="h-[22px] w-auto" priority />
      </div>

      {/* A bill, tinted into the frost: itemised lines, a total, and a torn receipt edge. */}
      <div className="arcade-checkout-receipt relative">
        <div className="p-5 pb-6">
          {summary ? (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Bill</span>
                <span className="font-mono text-[10.5px] tracking-wider text-slate-400">
                  #{summary.orderId.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="mt-0.5 text-[10.5px] text-slate-400">
                {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>

              <div className="mt-4 flex items-end gap-2 text-[13px]">
                <span className="min-w-0">
                  <span className="line-clamp-2 font-semibold leading-snug text-slate-900">{summary.title}</span>
                  <span className="text-[11px] text-slate-500">1 × one-time access</span>
                </span>
                <span className="mb-[5px] h-0 min-w-6 flex-1 border-b-2 border-dotted border-slate-300" aria-hidden />
                <span className="shrink-0 font-semibold tabular-nums text-slate-800">
                  {formatMoney(summary.amount, summary.currency)}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-[12px] text-slate-500">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatMoney(summary.amount, summary.currency)}</span>
              </div>

              <div className="mt-3 border-t border-dashed border-slate-300 pt-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-slate-700">Total payable</span>
                  <motion.span
                    key={summary.amount}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[26px] font-bold leading-none tracking-tight text-slate-900 tabular-nums"
                  >
                    {formatMoney(summary.amount, summary.currency)}
                  </motion.span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">One-time payment · no subscription</div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
              <div className="h-9 w-1/2 animate-pulse rounded bg-slate-100" />
            </div>
          )}

          {held && (
            <div className="mt-4">
              <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
                <Clock size={12} className="shrink-0 text-slate-400" />
                Your seat is held
                <span className="ml-auto font-semibold tabular-nums text-slate-800">{held.label}</span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-200/70">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#10b981,#34d399)] transition-[width] duration-1000 ease-linear"
                  style={{ width: `${held.fraction * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-auto space-y-3 pt-2">
        {/* The institution's seal and wordmark, as on Arcade certificates. */}
        <div className="flex items-center justify-center gap-2">
          <Image
            src="/amaljyothi-logo.svg"
            alt=""
            width={52}
            height={52}
            // Sits against the wordmark's top line ("AMAL JYOTHI") rather than its geometric middle.
            className="h-[52px] w-[52px] shrink-0 -translate-y-1 object-contain"
          />
          <Image
            src="/amaljyothi-typo.svg"
            alt="Amal Jyothi College of Engineering"
            width={176}
            height={84}
            // The artwork carries ~9% empty margin on each side; pull it in so the seal sits beside
            // the lettering and the pair centres on its ink, not its padding. Navy-and-grey, so it is lifted on dark grounds to stay legible.
            className="-mx-[14px] h-[76px] w-auto min-w-0 object-contain object-left dark:[filter:brightness(1.9)_saturate(1.15)]"
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-500" /> PCI DSS compliant
          </span>
          <span className="flex items-center gap-1.5">
            <Lock size={12} /> 256-bit encryption
          </span>
        </div>
      </div>
    </aside>
  );
}

function MethodTabs({
  active,
  onChange,
  enabled,
}: {
  active: CheckoutMethod;
  onChange: (method: CheckoutMethod) => void;
  enabled: Record<CheckoutMethod, boolean>;
}) {
  return (
    <div
      role="tablist"
      aria-label="Payment method"
      className={`arcade-checkout-sunken grid shrink-0 grid-cols-2 gap-1.5 p-1.5 sm:grid-cols-4 ${SHAPE_INNER}`}
    >
      {TABS.map(({ id, label, icon: Icon, hint }) => {
        const selected = id === active;
        return (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={selected}
            disabled={!enabled[id]}
            onClick={() => onChange(id)}
            title={enabled[id] ? hint : 'Not available for this payment'}
            className={`group relative flex h-12 items-center justify-center gap-2.5 px-3 text-[13px] font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-ink/30 disabled:cursor-not-allowed disabled:opacity-35 ${SHAPE_SMALL} ${
              selected ? '' : 'hover:bg-slate-950/[0.04]'
            }`}
          >
            {selected && (
              <motion.span
                layoutId="checkout-tab"
                className={`absolute inset-0 bg-ink shadow-[0_8px_20px_-10px_rgba(20,22,43,0.7)] ${SHAPE_SMALL}`}
                transition={{ type: 'spring', stiffness: 460, damping: 36 }}
              />
            )}
            <span
              className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                selected ? 'bg-on-ink/15 text-on-ink' : 'arcade-checkout-panel text-slate-500 group-hover:text-slate-800'
              }`}
            >
              <Icon size={15} strokeWidth={2.2} />
            </span>
            <span className={`relative transition-colors ${selected ? 'text-on-ink' : 'text-slate-600 group-hover:text-slate-900'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Arcade's own payment modal (desktop). Pure: everything it shows and does comes in through props
 * from `useCustomCheckout`. Follows the viewer's theme and Dynamic Glass, with an opacity floor so a
 * payment form is never see-through (see `.arcade-checkout` in themes.css).
 */
export function CheckoutModal(props: CheckoutModalProps) {
  const { phase, summary, methods, qr, phoneValid } = props;
  const [method, setMethod] = useState<CheckoutMethod>('upi');

  const amountLabel = summary ? formatMoney(summary.amount, summary.currency) : '';
  const gatewayReady = methods !== null;
  const canPayDirect = phase.kind === 'ready' && gatewayReady && phoneValid;

  const banks = useMemo<Choice[]>(
    () =>
      Object.entries(methods?.banks ?? {})
        .map(([code, name]) => ({ code, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [methods],
  );
  const featuredBanks = useMemo(
    () => POPULAR_BANKS.map((code) => banks.find((b) => b.code === code)).filter((b): b is Choice => Boolean(b)),
    [banks],
  );
  const wallets = useMemo<Choice[]>(
    () => (methods?.wallets ?? []).map((code) => ({ code, name: WALLET_NAMES[code] ?? code })),
    [methods],
  );

  const enabled: Record<CheckoutMethod, boolean> = {
    upi: true,
    card: Boolean(methods?.card),
    netbanking: banks.length > 0,
    wallet: wallets.length > 0,
  };
  const overlay = phase.kind !== 'ready' && phase.kind !== 'loading';

  return (
    <DialogPrimitive.Root
      open={props.open}
      disablePointerDismissal
      onOpenChangeComplete={(open) => {
        if (!open) props.onExited();
      }}
      onOpenChange={(open) => {
        if (!open) props.onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="arcade-checkout arcade-checkout-veil fixed inset-0 z-[120] duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          data-capture-ignore
          className="arcade-checkout fixed inset-0 z-[121] flex items-center justify-center p-3 outline-none duration-200 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className={`arcade-checkout-shell flex max-h-full w-full max-w-[980px] flex-col overflow-y-auto md:h-[min(640px,100%)] md:flex-row md:overflow-hidden ${SHAPE}`}
          >
            <OrderSummary summary={summary} />

            {/* Top padding clears the corner close button, so the tabs keep the full width. */}
            <section className="relative flex min-w-0 flex-1 flex-col px-6 pb-6 pt-14 md:min-h-0 md:px-8 md:pb-8 md:pt-16">
              {/* No visible heading — the bill says what this is — but screen readers still get one. */}
              <DialogPrimitive.Title className="sr-only">Pay for {summary?.title ?? 'your enrollment'}</DialogPrimitive.Title>
              <DialogPrimitive.Description className="sr-only">
                {summary ? `${amountLabel}, one-time payment` : 'Opening checkout'}
              </DialogPrimitive.Description>
              {phase.kind !== 'granted' && (
                <button
                  type="button"
                  onClick={props.onClose}
                  aria-label="Close checkout"
                  className="arcade-checkout-sunken absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:rotate-90 hover:text-slate-900"
                >
                  <X size={15} />
                </button>
              )}

              <AnimatePresence mode="wait" initial={false}>
                {overlay ? (
                  <motion.div key="status" className="flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <CheckoutStatusView
                      phase={phase}
                      amountLabel={amountLabel}
                      onRetry={props.onRetry}
                      onClose={props.onClose}
                      onUseHosted={props.onUseHosted}
                    />
                  </motion.div>
                ) : phase.kind === 'loading' ? (
                  <motion.div key="loading" className="flex flex-1 flex-col gap-4" exit={{ opacity: 0 }}>
                    <div className={`h-14 animate-pulse bg-slate-100 ${SHAPE_INNER}`} />
                    <div className={`min-h-64 flex-1 animate-pulse bg-slate-100/70 ${SHAPE_INNER}`} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="methods"
                    className="flex min-h-0 flex-1 flex-col"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <MethodTabs active={method} onChange={setMethod} enabled={enabled} />
                    {!phoneValid && (
                      <PhoneStrip phone={props.phone} onPhoneChange={props.onPhoneChange} />
                    )}
                    {/*
                      A container: panes lay themselves out by the space they actually get, not the
                      window, so nothing stacks into an overflow. Horizontal overflow is clipped so
                      the slide between tabs never flashes a scrollbar; the gutter is wide enough
                      that button shadows aren't cut off.
                    */}
                    <div className="@container relative -mx-3 mt-6 overflow-x-hidden px-3 pb-3 md:min-h-0 md:flex-1 md:overflow-y-auto">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={method}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full"
                        >
                          {method === 'upi' && (
                            <UpiPane
                              qr={qr}
                              onLoadQr={props.onLoadQr}
                              amountLabel={amountLabel}
                            />
                          )}
                          {method === 'card' && (
                            <CardPane
                              amountLabel={amountLabel}
                              canPay={canPayDirect}
                              gatewayNetwork={props.cardNetwork}
                              onPay={props.onPayWithCard}
                            />
                          )}
                          {method === 'netbanking' && (
                            <ChoicePane
                              featured={featuredBanks}
                              all={banks}
                              logoUrl={bankLogoUrl}
                              searchLabel="Search all banks"
                              emptyLabel="Netbanking isn’t available for this payment."
                              amountLabel={amountLabel}
                              canPay={canPayDirect}
                              redirectHint="Your bank’s secure page opens in a new window."
                              onPay={props.onPayWithBank}
                            />
                          )}
                          {method === 'wallet' && (
                            <ChoicePane
                              featured={wallets}
                              all={wallets}
                              logoUrl={walletLogoUrl}
                              emptyLabel="Wallets aren’t available for this payment."
                              amountLabel={amountLabel}
                              canPay={canPayDirect}
                              redirectHint="The wallet’s page opens in a new window to confirm."
                              onPay={props.onPayWithWallet}
                            />
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </motion.div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
