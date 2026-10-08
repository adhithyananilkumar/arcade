'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import {
  cardNumberMaxDigits,
  cvvLength,
  digitsOnly,
  expiryInFuture,
  formatCardNumber,
  formatExpiry,
  luhnValid,
  maskForDisplay,
  resolveNetwork,
  type CardNetwork,
} from '../../utils/card';
import type { CardInput } from './checkout.types';

/** Card artwork is absolute colour (like badge art): the same in every theme. */
const FACES: Record<CardNetwork | 'default', { bg: string; glow: string }> = {
  visa: { bg: 'linear-gradient(135deg,#1a237e 0%,#283593 45%,#3949ab 100%)', glow: '#7986cb' },
  mastercard: { bg: 'linear-gradient(135deg,#1c1c1e 0%,#2c2c2e 50%,#3a2a1e 100%)', glow: '#ff9f43' },
  amex: { bg: 'linear-gradient(135deg,#0b4f6c 0%,#1679a8 55%,#3fa7d6 100%)', glow: '#9ad8f0' },
  rupay: { bg: 'linear-gradient(135deg,#0f3d3e 0%,#14625b 50%,#1d8a6f 100%)', glow: '#ffb347' },
  diners: { bg: 'linear-gradient(135deg,#2d3142 0%,#4f5d75 100%)', glow: '#bfc0c0' },
  discover: { bg: 'linear-gradient(135deg,#232526 0%,#414345 100%)', glow: '#ff6000' },
  maestro: { bg: 'linear-gradient(135deg,#1b1f3b 0%,#2e3a87 100%)', glow: '#e94e1b' },
  '': { bg: 'linear-gradient(135deg,#14142b 0%,#2a2d4a 55%,#4c5a8a 100%)', glow: '#8ea2ff' },
  default: { bg: 'linear-gradient(135deg,#14142b 0%,#2a2d4a 55%,#4c5a8a 100%)', glow: '#8ea2ff' },
};

function NetworkMark({ network }: { network: CardNetwork }) {
  if (network === 'mastercard' || network === 'maestro') {
    return (
      <svg width="46" height="28" viewBox="0 0 46 28" aria-label={network}>
        <circle cx="16" cy="14" r="12" fill={network === 'maestro' ? '#0099df' : '#eb001b'} />
        <circle cx="30" cy="14" r="12" fill="#f79e1b" fillOpacity="0.92" />
      </svg>
    );
  }
  const label: Record<string, string> = {
    visa: 'VISA',
    amex: 'AMEX',
    rupay: 'RuPay',
    diners: 'Diners',
    discover: 'DISCOVER',
  };
  return label[network] ? (
    <span className="text-[19px] font-black italic tracking-tight text-white/95">{label[network]}</span>
  ) : null;
}

/** Small network marks for the "accepted cards" row, drawn for a white tile. */
function NetworkBadge({ network }: { network: CardNetwork }) {
  switch (network) {
    case 'visa':
      return <span className="text-[11px] font-black italic tracking-tight text-[#1a1f71]">VISA</span>;
    case 'mastercard':
      return (
        <svg width="26" height="16" viewBox="0 0 26 16" aria-label="Mastercard">
          <circle cx="9" cy="8" r="7" fill="#eb001b" />
          <circle cx="17" cy="8" r="7" fill="#f79e1b" fillOpacity="0.9" />
        </svg>
      );
    case 'rupay':
      return (
        <span className="text-[10px] font-black italic tracking-tight">
          <span className="text-[#097a44]">Ru</span>
          <span className="text-[#f7931d]">Pay</span>
        </span>
      );
    case 'amex':
      return <span className="rounded-[3px] bg-[#016fd0] px-1 text-[8.5px] font-black tracking-tight text-white">AMEX</span>;
    case 'diners':
      return <span className="text-[9px] font-bold tracking-tight text-[#0079be]">Diners</span>;
    default:
      return null;
  }
}

function CardFace({ input, network, flipped }: { input: CardInput; network: CardNetwork; flipped: boolean }) {
  const face = FACES[network] ?? FACES.default;
  const expiry = input.expiry.replace(/\s/g, '') || 'MM/YY';
  return (
    <div className="theme-fixed mx-auto h-[178px] w-[290px] [perspective:1200px]" aria-hidden>
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 20 }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[18px] p-5 text-white shadow-[0_22px_40px_-18px_rgba(10,12,40,0.7)] [backface-visibility:hidden]"
          style={{ background: face.bg }}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-40 blur-2xl transition-colors duration-700"
            style={{ background: face.glow }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.14)_45%,transparent_60%)]" />
          <div className="relative flex items-start justify-between">
            <div className="h-8 w-11 rounded-md bg-[linear-gradient(135deg,#f6e27a,#cfa94a_45%,#f3dc8a)] shadow-inner" />
            <motion.div key={network} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
              <NetworkMark network={network} />
            </motion.div>
          </div>
          <div className="relative mt-6 whitespace-nowrap font-mono text-[17px] tracking-[0.08em] text-white/95 tabular-nums">
            {maskForDisplay(input.number, network)}
          </div>
          <div className="relative mt-4 flex items-end justify-between text-[10px] uppercase tracking-[0.14em] text-white/60">
            <div className="min-w-0">
              <div>Card holder</div>
              <div className="mt-0.5 truncate text-[13px] font-semibold normal-case tracking-normal text-white/95">
                {input.name.trim() || 'Your name'}
              </div>
            </div>
            <div className="text-right">
              <div>Expires</div>
              <div className="mt-0.5 font-mono text-[13px] font-semibold tracking-normal text-white/95">{expiry}</div>
            </div>
          </div>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[18px] text-white shadow-[0_22px_40px_-18px_rgba(10,12,40,0.7)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
          style={{ background: face.bg }}
        >
          <div className="mt-6 h-10 w-full bg-black/80" />
          <div className="mx-5 mt-5 flex items-center justify-end rounded-md bg-white/90 px-3 py-2">
            <span className="font-mono text-[14px] tracking-[0.3em] text-slate-900 theme-fixed">
              {input.cvv ? '•'.repeat(input.cvv.length) : 'CVV'}
            </span>
          </div>
          <p className="mx-5 mt-4 text-[10px] leading-snug text-white/60">
            The 3 or 4 digits on the back of your card. Arcade never sees or stores them.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</span>
      {children}
      <span className="mt-1 block h-4 text-[11px] text-rose-600 dark:text-rose-400">{error}</span>
    </label>
  );
}

const inputClass =
  'arcade-checkout-sunken h-11 w-full rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md px-3 text-[14px] font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-ink/20';

export interface CardPaneProps {
  amountLabel: string;
  canPay: boolean;
  /** The gateway's network name for a number ('' when unknown). */
  gatewayNetwork: (number: string) => string;
  onPay: (card: CardInput) => void;
}

export function CardPane({ amountLabel, canPay, gatewayNetwork, onPay }: CardPaneProps) {
  const [input, setInput] = useState<CardInput>({ number: '', expiry: '', cvv: '', name: '' });
  const [touched, setTouched] = useState<Record<keyof CardInput, boolean>>({ number: false, expiry: false, cvv: false, name: false });
  const [cvvFocused, setCvvFocused] = useState(false);

  const network = useMemo(() => resolveNetwork(gatewayNetwork(input.number), input.number), [gatewayNetwork, input.number]);

  const errors = {
    number: luhnValid(input.number) ? null : 'Check the card number',
    expiry: expiryInFuture(input.expiry) ? null : 'Use a valid, future expiry',
    cvv: input.cvv.length === cvvLength(network) ? null : `${cvvLength(network)} digits`,
    name: input.name.trim().length >= 2 ? null : 'Name as printed on the card',
  };
  const valid = !errors.number && !errors.expiry && !errors.cvv && !errors.name;
  const shown = (key: keyof CardInput) => (touched[key] ? errors[key] : null);
  const blur = (key: keyof CardInput) => () => setTouched((t) => ({ ...t, [key]: true }));

  return (
    // data-capture-ignore keeps card fields out of bug-report screenshots.
    <form
      data-capture-ignore
      className="flex flex-col gap-6 @xl:h-full @xl:flex-row @xl:gap-7"
      autoComplete="on"
      onSubmit={(e) => {
        e.preventDefault();
        setTouched({ number: true, expiry: true, cvv: true, name: true });
        if (valid && canPay) onPay(input);
      }}
    >
      <div className="flex w-full shrink-0 flex-col items-center justify-center gap-4 @xl:w-[290px]">
        <CardFace input={input} network={network} flipped={cvvFocused} />
        <div className="flex items-center gap-1.5" aria-label="Accepted cards">
          {(['visa', 'mastercard', 'rupay', 'amex', 'diners'] as CardNetwork[]).map((n) => (
            <span
              key={n}
              className={`theme-fixed flex h-7 w-11 items-center justify-center rounded-md bg-white shadow-[0_0_0_1px_rgba(20,22,43,0.08)] transition ${
                network && network !== n ? 'opacity-35 grayscale' : ''
              }`}
            >
              <NetworkBadge network={n} />
            </span>
          ))}
        </div>
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <Lock size={11} />
          Encrypted end to end. Arcade never sees or stores your card.
        </p>
      </div>
      <div className="flex flex-1 flex-col">
        <Field label="Card number" error={shown('number')}>
          <input
            value={input.number}
            onChange={(e) => setInput((v) => ({ ...v, number: formatCardNumber(e.target.value) }))}
            onBlur={blur('number')}
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 5678 9012 3456"
            maxLength={cardNumberMaxDigits(network) + 4}
            className={`${inputClass} font-mono tracking-wider`}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Expiry" error={shown('expiry')}>
            <input
              value={input.expiry}
              onChange={(e) => {
                const next = formatExpiry(e.target.value, input.expiry);
                setInput((v) => ({ ...v, expiry: next }));
              }}
              onBlur={blur('expiry')}
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM / YY"
              className={`${inputClass} font-mono`}
            />
          </Field>
          <Field label="CVV" error={shown('cvv')}>
            <input
              value={input.cvv}
              onChange={(e) => setInput((v) => ({ ...v, cvv: digitsOnly(e.target.value).slice(0, cvvLength(network)) }))}
              onFocus={() => setCvvFocused(true)}
              onBlur={() => {
                setCvvFocused(false);
                blur('cvv')();
              }}
              inputMode="numeric"
              autoComplete="cc-csc"
              type="password"
              placeholder={network === 'amex' ? '••••' : '•••'}
              className={`${inputClass} font-mono tracking-[0.3em]`}
            />
          </Field>
        </div>
        <Field label="Name on card" error={shown('name')}>
          <input
            value={input.name}
            onChange={(e) => setInput((v) => ({ ...v, name: e.target.value.slice(0, 60) }))}
            onBlur={blur('name')}
            autoComplete="cc-name"
            placeholder="As printed on the card"
            className={inputClass}
          />
        </Field>
        <button
          type="submit"
          disabled={!canPay}
          className="mt-2 h-12 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-ink @xl:mt-auto text-[14px] font-semibold text-on-ink shadow-[0_6px_16px_-10px_rgba(20,22,43,0.5)] transition hover:bg-ink-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Pay {amountLabel}
        </button>
      </div>
    </form>
  );
}
