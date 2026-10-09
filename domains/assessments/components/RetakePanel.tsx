"use client";

import type { ReactNode } from "react";
import { Clock, Lock, RotateCcw, Sparkles } from "lucide-react";
import { formatMoney } from "@/shared/utils/money";
import type { RetakeQuote } from "../types";

/**
 * What a certification candidate can do once their attempts are used up — the certification
 * standard's answer, never worked out here: buy a retake, take a discounted second chance, wait out
 * the cooldown, or ask the publisher.
 *
 * Pure UI. The host supplies the action: `onGetRetake` opens the server's offer, and `checkoutSlot`
 * (the shared enrolment checkout on the offer) is shown once there is one to pay for.
 */
export function RetakePanel({
  quote,
  onGetRetake,
  busy = false,
  checkoutSlot,
}: {
  quote: RetakeQuote;
  onGetRetake?: () => void;
  busy?: boolean;
  checkoutSlot?: ReactNode;
}) {
  const secondChance = quote.kind === "SECOND_CHANCE";
  const free = quote.amountMinor === 0;
  const price = formatMoney(quote.amountMinor, quote.currency);
  const base = formatMoney(quote.baseAmountMinor, quote.currency);

  if (quote.state !== "AVAILABLE" && quote.state !== "COOLDOWN") {
    return (
      <div className="flex max-w-md items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
        <Lock size={16} className="mt-0.5 shrink-0 text-slate-400" />
        <p className="text-[13px] font-medium text-slate-600">{quote.message}</p>
      </div>
    );
  }

  return (
    <div
      className={`max-w-md rounded-2xl border p-4 ${
        secondChance
          ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/25 dark:bg-emerald-500/10"
          : "border-slate-200 bg-surface"
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        {secondChance ? (
          <Sparkles size={15} className="text-emerald-600 dark:text-emerald-400" />
        ) : (
          <RotateCcw size={15} className="text-slate-500" />
        )}
        <span className="text-[13px] font-bold text-ink">{secondChance ? "Second chance" : "Retake this exam"}</span>
      </div>
      <p className="mb-3 text-[13px] text-slate-600">{quote.message}</p>

      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-xl font-black tabular-nums text-ink">{free ? "Free" : price}</span>
        {quote.discountPercent > 0 && quote.baseAmountMinor > 0 && (
          <>
            <span className="text-[13px] tabular-nums text-slate-400 line-through">{base}</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200">
              {quote.discountPercent}% off
            </span>
          </>
        )}
      </div>

      <ul className="mb-3 space-y-1 text-[12px] text-slate-500">
        <li>One more attempt, under the same rules as before.</li>
        {quote.offerExpiresAt && <li>Second-chance price ends {when(quote.offerExpiresAt)}.</li>}
        {quote.purchasesAllowed > 0 && (
          <li>
            Retakes used: {quote.purchasesUsed} of {quote.purchasesAllowed}.
          </li>
        )}
      </ul>

      {quote.state === "COOLDOWN" ? (
        <p className="flex items-center gap-2 text-[13px] font-semibold text-slate-600">
          <Clock size={14} /> Available {quote.availableAt ? when(quote.availableAt) : "soon"}
        </p>
      ) : checkoutSlot ? (
        checkoutSlot
      ) : (
        <button
          type="button"
          onClick={onGetRetake}
          disabled={busy || !onGetRetake}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-[13px] font-bold text-on-ink transition-colors hover:bg-ink-hover disabled:opacity-60 cursor-pointer"
        >
          {busy ? "Preparing…" : free ? "Claim your retake" : `Get a retake · ${price}`}
        </button>
      )}
    </div>
  );
}

function when(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}
