'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Clock, CreditCard, Lock, QrCode, ShieldCheck, Sparkles, Wallet, X } from 'lucide-react';
import { formatMoney } from '@/shared/utils/money';
import { UpiPane } from './UpiPane';
import { CardPane } from './CardPane';
import { ChoicePane, POPULAR_BANKS, WALLET_NAMES, type Choice } from './ChoicePane';
import { CheckoutStatusView } from './CheckoutStatusView';
import type { AvailableMethods, CardInput, CheckoutMethod, CheckoutPhase, CheckoutSummary, QrState } from './checkout.types';

export interface CheckoutModalProps {
  phase: CheckoutPhase;
  summary: CheckoutSummary | null;
  methods: AvailableMethods | null;
  qr: QrState;
  payerEmail: string;
  phone: string;
  phoneValid: boolean;
  onPhoneChange: (value: string) => void;
  onLoadQr: () => void;
  onVerifyVpa: (vpa: string) => Promise<boolean>;
  onPayWithVpa: (vpa: string) => void;
  onPayWithCard: (card: CardInput) => void;
  onPayWithBank: (code: string) => void;
  onPayWithWallet: (code: string) => void;
  cardNetwork: (number: string) => string;
  onRetry: () => void;
  onClose: () => void;
  onUseHosted: () => void;
}

const TABS: { id: CheckoutMethod; label: string; icon: typeof QrCode; hint: string }[] = [
  { id: 'upi', label: 'UPI', icon: QrCode, hint: 'Scan or use UPI ID' },
  { id: 'card', label: 'Card', icon: CreditCard, hint: 'Debit & credit' },
  { id: 'netbanking', label: 'Netbanking', icon: Building2, hint: 'All major banks' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, hint: 'Paytm, PhonePe…' },
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
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

function OrderSummary({
  summary,
  payerEmail,
  phone,
  phoneValid,
  onPhoneChange,
  onUseHosted,
}: Pick<CheckoutModalProps, 'summary' | 'payerEmail' | 'phone' | 'phoneValid' | 'onPhoneChange' | 'onUseHosted'>) {
  const held = useClock(summary?.expiresAt);
  const [phoneTouched, setPhoneTouched] = useState(false);

  return (
    <aside className="relative flex w-[340px] shrink-0 flex-col overflow-hidden border-r border-[var(--checkout-hairline)] p-7">
      {/* Ambient colour, kept faint so the frost stays calm. */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,#6c7dff_0%,transparent_70%)] opacity-[0.16] blur-2xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,#2dd4bf_0%,transparent_70%)] opacity-[0.12] blur-2xl" />

      <div className="relative flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-on-ink shadow-md">
          <Sparkles size={17} />
        </span>
        <div>
          <div className="text-[15px] font-bold tracking-tight text-slate-900">Arcade</div>
          <div className="text-[11px] font-medium text-slate-500">Secure checkout</div>
        </div>
      </div>

      <div className="arcade-checkout-panel relative mt-7 rounded-3xl p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">You’re paying for</div>
        {summary ? (
          <>
            <div className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-snug text-slate-800">{summary.title}</div>
            <motion.div
              key={summary.amount}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-[38px] font-bold leading-none tracking-tight text-slate-900 tabular-nums"
            >
              {formatMoney(summary.amount, summary.currency)}
            </motion.div>
            <div className="mt-1.5 text-[12px] text-slate-500">One-time payment</div>
          </>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
            <div className="h-9 w-1/2 animate-pulse rounded bg-slate-100" />
          </div>
        )}
        {held && (
          <div className="arcade-checkout-sunken mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] text-slate-600">
            <Clock size={13} className="shrink-0 text-slate-400" />
            Your seat is held for <span className="ml-auto font-semibold tabular-nums text-slate-800">{held}</span>
          </div>
        )}
      </div>

      <div className="relative mt-4 space-y-2.5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Paying as</div>
        <div className="truncate text-[13px] font-medium text-slate-700">{payerEmail}</div>
        <label className="arcade-checkout-sunken flex items-center rounded-xl px-3 focus-within:ring-2 focus-within:ring-ink/20">
          <span className="text-[13px] font-semibold text-slate-500">+91</span>
          <input
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            onBlur={() => setPhoneTouched(true)}
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="Mobile number"
            aria-label="Mobile number"
            className="h-10 w-full bg-transparent px-2 text-[13px] font-medium tabular-nums text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>
        <p className="h-4 text-[11px] text-slate-500">
          {phoneTouched && !phoneValid ? (
            <span className="text-rose-600 dark:text-rose-400">Enter your 10-digit mobile number.</span>
          ) : (
            'Banks need a mobile number for card, netbanking and UPI ID payments.'
          )}
        </p>
      </div>

      <div className="relative mt-auto space-y-3 pt-4">
        <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-500" /> Secured by Razorpay
          </span>
          <span className="flex items-center gap-1.5">
            <Lock size={12} /> 256-bit encryption
          </span>
        </div>
        <button
          type="button"
          onClick={onUseHosted}
          className="text-[12px] font-medium text-slate-500 underline-offset-4 transition hover:text-slate-800 hover:underline"
        >
          Prefer Razorpay’s checkout? Open it instead
        </button>
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
    <div role="tablist" aria-label="Payment method" className="arcade-checkout-sunken grid grid-cols-4 gap-1 rounded-2xl p-1">
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
            className="relative flex h-14 flex-col items-center justify-center rounded-xl text-[12.5px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-35"
          >
            {selected && (
              <motion.span
                layoutId="checkout-tab"
                className="arcade-checkout-panel absolute inset-0 rounded-xl shadow-[0_4px_14px_-6px_rgba(20,22,43,0.3)]"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className={`relative flex items-center gap-1.5 ${selected ? 'text-slate-900' : 'text-slate-500'}`}>
              <Icon size={15} />
              {label}
            </span>
            <span className={`relative mt-0.5 text-[10px] font-medium ${selected ? 'text-slate-500' : 'text-slate-400'}`}>
              {hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Arcade's own payment modal (desktop). Pure: everything it shows and does comes in through props
 * from `useCustomCheckout`.
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
      open
      disablePointerDismissal
      onOpenChange={(open) => {
        if (!open) props.onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="arcade-checkout arcade-checkout-veil fixed inset-0 z-[120] duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          data-capture-ignore
          className="arcade-checkout fixed left-1/2 top-1/2 z-[121] -translate-x-1/2 -translate-y-1/2 outline-none"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="arcade-checkout-shell flex h-[600px] w-[min(980px,calc(100vw-48px))] overflow-hidden rounded-[30px]"
          >
            <OrderSummary
              summary={summary}
              payerEmail={props.payerEmail}
              phone={props.phone}
              phoneValid={phoneValid}
              onPhoneChange={props.onPhoneChange}
              onUseHosted={props.onUseHosted}
            />

            <section className="relative flex min-w-0 flex-1 flex-col p-7">
              <header className="mb-5 flex items-center justify-between">
                <div>
                  <DialogPrimitive.Title className="text-[19px] font-semibold tracking-tight text-slate-900">
                    {overlay ? 'Payment' : 'Choose how to pay'}
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description className="text-[12.5px] text-slate-500">
                    {summary ? `${amountLabel} · ${summary.title}` : 'Opening checkout…'}
                  </DialogPrimitive.Description>
                </div>
                {phase.kind !== 'granted' && (
                  <button
                    type="button"
                    onClick={props.onClose}
                    aria-label="Close checkout"
                    className="arcade-checkout-sunken flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:rotate-90 hover:text-slate-900"
                  >
                    <X size={16} />
                  </button>
                )}
              </header>

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
                    <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
                    <div className="flex-1 animate-pulse rounded-3xl bg-slate-100/70" />
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
                    <div className="relative mt-5 min-h-0 flex-1">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={method}
                          initial={{ opacity: 0, x: 14 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -14 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full"
                        >
                          {method === 'upi' && (
                            <UpiPane
                              qr={qr}
                              onLoadQr={props.onLoadQr}
                              upiIdEnabled={Boolean(methods?.upiId)}
                              onVerifyVpa={props.onVerifyVpa}
                              onPayWithVpa={props.onPayWithVpa}
                              canPay={canPayDirect}
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
