/* eslint-disable react-hooks/set-state-in-effect -- loading/error flags reset when the query inputs change */
"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { PaymentAdminService, type ReconciliationKind, type UnreconciledOrder } from "@/domains/payment";
import { formatMoney } from "@/shared/utils/money";

const KIND: Record<ReconciliationKind, { label: string; tone: string; advice: string }> = {
  PAID_NOT_GRANTED: {
    label: "Paid, no access",
    tone: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/25",
    advice: "Paid, but the learner has no access. Access is retried automatically for about half an hour; if it stays here, grant the place manually or refund.",
  },
  DUPLICATE_PAYMENT: {
    label: "Duplicate payment",
    tone: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/25",
    advice: "The learner already paid for this enrollment in an earlier order. Refund this one.",
  },
  AMOUNT_MISMATCH: {
    label: "Amount mismatch",
    tone: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/25",
    advice: "The gateway captured a different amount from the order. Check the gateway dashboard before acting.",
  },
};

/**
 * Orders that need a human. Nothing here is fixed automatically on purpose: each one is a money
 * decision about a specific learner.
 */
export function ReconciliationTab({ onOpenOrder, refreshKey }: { onOpenOrder: (orderId: string) => void; refreshKey?: number }) {
  const [rows, setRows] = useState<UnreconciledOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    PaymentAdminService.reconciliation(0, 100)
      .then((r) => !cancelled && setRows(r))
      .catch((err) => !cancelled && setError(err?.message || "Could not load the reconciliation queue."));
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (error) return <p className="rounded-2xl bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>;
  if (!rows) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200/80 bg-surface py-16 text-center">
        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        <p className="text-sm font-bold text-slate-800">Nothing to reconcile</p>
        <p className="max-w-sm text-xs text-slate-500">
          Every paid order has its access, no enrollment has been charged twice, and every capture matched its order.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const kind = KIND[r.kind] ?? KIND.PAID_NOT_GRANTED;
        return (
          <button
            key={r.orderId}
            type="button"
            onClick={() => onOpenOrder(r.orderId)}
            className="flex w-full cursor-pointer flex-col gap-2 rounded-2xl border border-slate-200/80 bg-surface p-4 text-left hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[10.5px] font-bold ${kind.tone}`}>{kind.label}</span>
                <span className="truncate text-sm font-bold text-slate-900">{r.resourceTitle || r.resourceType}</span>
              </div>
              <p className="text-xs text-slate-500">{kind.advice}</p>
              <p className="text-[11px] text-slate-400">
                Paid {r.paidAt ? new Date(r.paidAt).toLocaleString() : "—"} · enrollment {r.enrollmentStatus ?? "missing"}
                {r.grantAttempts > 0 ? ` · ${r.grantAttempts} automatic retr${r.grantAttempts === 1 ? "y" : "ies"}` : ""}
              </p>
            </div>
            <span className="shrink-0 text-base font-bold tabular-nums text-ink">{formatMoney(r.amount, r.currency)}</span>
          </button>
        );
      })}
    </div>
  );
}
