'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ExternalLink, Search } from 'lucide-react';
import { MethodLogo } from './MethodLogo';

export interface Choice {
  code: string;
  name: string;
}

export interface ChoicePaneProps {
  /** Shown as tiles up front, in this order, when available. */
  featured: Choice[];
  /** Everything searchable (a superset of featured). */
  all: Choice[];
  logoUrl: (code: string) => string;
  searchLabel?: string;
  emptyLabel: string;
  amountLabel: string;
  canPay: boolean;
  /** Where the confirmation happens, shown under the button. */
  redirectHint: string;
  onPay: (code: string) => void;
}

/** Pick-then-pay for netbanking banks and wallets. */
export function ChoicePane({
  featured,
  all,
  logoUrl,
  searchLabel,
  emptyLabel,
  amountLabel,
  canPay,
  redirectHint,
  onPay,
}: ChoicePaneProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const searching = query.trim().length > 0;
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return featured.length ? featured : all.slice(0, 12);
    return all.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)).slice(0, 30);
  }, [query, featured, all]);

  const selectedChoice = all.find((c) => c.code === selected) ?? null;

  if (!all.length) {
    return <div className="flex h-full min-h-40 items-center justify-center text-[13px] text-slate-500">{emptyLabel}</div>;
  }

  return (
    <div className="flex h-full flex-col">
      {searchLabel && all.length > featured.length && (
        <label className="arcade-checkout-sunken mb-4 flex shrink-0 items-center rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md px-3 focus-within:ring-2 focus-within:ring-ink/20">
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
      {!searching && featured.length > 0 && all.length > featured.length && (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Popular</p>
      )}
      {/* No scroller of its own: the pane area scrolls, never a box inside a box. */}
      <div className="grid flex-1 auto-rows-min grid-cols-1 gap-2 pb-2 @md:grid-cols-2">
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
              className={`arcade-checkout-panel relative flex items-center gap-3 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md p-2.5 text-left transition ${
                active ? 'ring-2 ring-ink' : 'hover:-translate-y-px hover:shadow-md'
              }`}
            >
              <MethodLogo src={logoUrl(choice.code)} name={choice.name} code={choice.code} />
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-slate-800">{choice.name}</span>
              {active && (
                <motion.span
                  layoutId="choice-check"
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-on-ink"
                >
                  <Check size={12} strokeWidth={3} />
                </motion.span>
              )}
            </motion.button>
          );
        })}
        {!results.length && <p className="col-span-full py-6 text-center text-[13px] text-slate-500">No match.</p>}
      </div>
      <div className="shrink-0 pt-3">
        <button
          type="button"
          disabled={!selected || !canPay}
          onClick={() => selected && onPay(selected)}
          className="h-12 w-full rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-ink text-[14px] font-semibold text-on-ink shadow-[0_6px_16px_-10px_rgba(20,22,43,0.5)] transition hover:bg-ink-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {selectedChoice ? `Pay ${amountLabel} with ${selectedChoice.name}` : `Select to pay ${amountLabel}`}
        </button>
        <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-slate-500">
          <ExternalLink size={11} /> {redirectHint}
        </p>
      </div>
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
