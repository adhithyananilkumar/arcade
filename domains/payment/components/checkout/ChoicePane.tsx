'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Search } from 'lucide-react';

export interface Choice {
  code: string;
  name: string;
}

/** A soft, stable colour per code so monograms differ without third-party logos. */
function hue(code: string): number {
  let h = 0;
  for (const ch of code) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

function Monogram({ choice }: { choice: Choice }) {
  const letters = choice.name
    .replace(/\b(bank|of|the|ltd|limited)\b/gi, '')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const h = hue(choice.code);
  return (
    <span
      className="theme-fixed flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold text-white shadow-sm"
      style={{ background: `linear-gradient(135deg, oklch(0.55 0.15 ${h}), oklch(0.42 0.13 ${(h + 40) % 360}))` }}
    >
      {letters || choice.code.slice(0, 2)}
    </span>
  );
}

export interface ChoicePaneProps {
  /** Shown as tiles up front, in this order, when available. */
  featured: Choice[];
  /** Everything searchable (a superset of featured). */
  all: Choice[];
  searchLabel?: string;
  emptyLabel: string;
  amountLabel: string;
  canPay: boolean;
  /** "Continue to HDFC Bank" style hint under the button. */
  redirectHint: string;
  onPay: (code: string) => void;
}

/** Pick-then-pay for netbanking banks and wallets. */
export function ChoicePane({
  featured,
  all,
  searchLabel,
  emptyLabel,
  amountLabel,
  canPay,
  redirectHint,
  onPay,
}: ChoicePaneProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return featured.length ? featured : all.slice(0, 12);
    return all.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)).slice(0, 24);
  }, [query, featured, all]);

  const selectedChoice = all.find((c) => c.code === selected) ?? null;

  if (!all.length) {
    return <div className="flex h-full items-center justify-center text-[13px] text-slate-500">{emptyLabel}</div>;
  }

  return (
    <div className="flex h-full flex-col">
      {searchLabel && all.length > featured.length && (
        <label className="arcade-checkout-sunken mb-4 flex items-center rounded-xl px-3 focus-within:ring-2 focus-within:ring-ink/20">
          <Search size={15} className="text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchLabel}
            aria-label={searchLabel}
            className="h-11 w-full bg-transparent px-2 text-[14px] text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>
      )}
      <div className="-mx-1 grid flex-1 auto-rows-min grid-cols-2 gap-2 overflow-y-auto px-1 pb-2">
        {results.map((choice, i) => {
          const active = choice.code === selected;
          return (
            <motion.button
              key={choice.code}
              type="button"
              onClick={() => setSelected(choice.code)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 10) * 0.025 }}
              aria-pressed={active}
              className={`arcade-checkout-panel relative flex items-center gap-3 rounded-2xl p-2.5 text-left transition ${
                active ? 'ring-2 ring-ink' : 'hover:-translate-y-px hover:shadow-md'
              }`}
            >
              <Monogram choice={choice} />
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-slate-800">{choice.name}</span>
              {active && (
                <motion.span
                  layoutId="choice-check"
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-on-ink"
                >
                  <Check size={12} strokeWidth={3} />
                </motion.span>
              )}
            </motion.button>
          );
        })}
        {!results.length && <p className="col-span-2 py-6 text-center text-[13px] text-slate-500">No match.</p>}
      </div>
      <button
        type="button"
        disabled={!selected || !canPay}
        onClick={() => selected && onPay(selected)}
        className="mt-3 h-12 rounded-2xl bg-ink text-[14px] font-semibold text-on-ink shadow-[0_10px_30px_-12px_rgba(20,22,43,0.55)] transition hover:bg-ink-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Pay {amountLabel}
        {selectedChoice ? ` with ${selectedChoice.name}` : ''}
      </button>
      <p className="mt-2 text-center text-[11px] text-slate-500">{redirectHint}</p>
    </div>
  );
}

export const POPULAR_BANKS = ['SBIN', 'HDFC', 'ICIC', 'UTIB', 'KKBK', 'YESB', 'PUNB', 'BARB', 'IDFB', 'INDB'];

export const WALLET_NAMES: Record<string, string> = {
  paytm: 'Paytm',
  phonepe: 'PhonePe',
  amazonpay: 'Amazon Pay',
  mobikwik: 'MobiKwik',
  freecharge: 'Freecharge',
  airtelmoney: 'Airtel Money',
  jiomoney: 'JioMoney',
  olamoney: 'Ola Money',
  payzapp: 'PayZapp',
};
