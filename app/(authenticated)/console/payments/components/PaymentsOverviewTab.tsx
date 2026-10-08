/* eslint-disable react-hooks/set-state-in-effect -- loading/error flags reset when the query inputs change */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { PaymentAdminService, type DateWindow, type PaymentFunnel, type PlatformPaymentsOverview } from "@/domains/payment";
import { formatMoney, fromMinorUnits } from "@/shared/utils/money";

export type Period = "7d" | "30d" | "90d" | "12m" | "all";

export const PERIODS: { id: Period; label: string }[] = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "12m", label: "12 months" },
  { id: "all", label: "All time" },
];

export function windowFor(period: Period): DateWindow {
  if (period === "all") return {};
  const from = new Date();
  if (period === "12m") from.setMonth(from.getMonth() - 12);
  else from.setDate(from.getDate() - Number(period.replace("d", "")));
  from.setHours(0, 0, 0, 0);
  return { from: from.toISOString() };
}

function Kpi({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-[0_2px_10px_rgba(20,20,43,0.03)] ${
        accent ? "border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-surface dark:border-indigo-500/25 dark:from-indigo-500/10" : "border-slate-200/80 bg-surface"
      }`}
    >
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1.5 text-xl font-bold tracking-tight text-ink tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-[11.5px] font-medium text-slate-500">{hint}</p>}
    </div>
  );
}

const TYPE_LABEL: Record<string, string> = { COURSE: "Courses", EVENT: "Events", EXAM: "Exams" };

/** The server's figure, or the same rounding done here if an older backend left it out. */
function conversionPercent(funnel: PaymentFunnel): number | null {
  if (typeof funnel.conversionPercent === "number") return funnel.conversionPercent;
  if (!funnel.ordersOpened) return null;
  return Math.round((1000 * funnel.ordersPaid) / funnel.ordersOpened) / 10;
}

export function PaymentsOverviewTab({
  period,
  onOpenChannel,
  onOpenIssues,
}: {
  period: Period;
  onOpenChannel: (channelId: string) => void;
  onOpenIssues: () => void;
}) {
  const [data, setData] = useState<PlatformPaymentsOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    PaymentAdminService.analytics(windowFor(period))
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setError(err?.message || "Could not load payment analytics."));
    return () => {
      cancelled = true;
    };
  }, [period]);

  const currency = data?.totals[0]?.currency ?? "INR";
  const totals = data?.totals.find((t) => t.currency === currency);
  const series = useMemo(
    () =>
      (data?.daily ?? [])
        .filter((d) => d.currency === currency)
        .map((d) => ({
          day: new Date(`${d.day}T00:00:00Z`).toLocaleDateString(undefined, { day: "numeric", month: "short", timeZone: "UTC" }),
          Collected: fromMinorUnits(d.grossMinor),
          Refunded: fromMinorUnits(d.refundedMinor),
          Commission: fromMinorUnits(d.commissionMinor),
        })),
    [data, currency],
  );

  if (error) return <p className="rounded-2xl bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>;
  if (!data) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const money = (minor: number) => formatMoney(minor, currency);
  const issues = data.issues;
  const issueCount = issues.paidNotGranted + issues.duplicatePayments + issues.amountMismatches + issues.refundsFailed;
  const funnel = data.funnel;

  return (
    <div className="space-y-5">
      {data.totals.length > 1 && (
        <p className="text-[11.5px] font-medium text-slate-500">
          Showing {currency}. Also collected:{" "}
          {data.totals
            .slice(1)
            .map((t) => formatMoney(t.grossMinor, t.currency))
            .join(", ")}
          .
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Collected" value={money(totals?.grossMinor ?? 0)} hint={`${totals?.paidOrders ?? 0} paid · ${totals?.learners ?? 0} learners`} />
        <Kpi
          label="Refunded"
          value={money(totals?.refundedMinor ?? 0)}
          hint={totals?.refundInFlightMinor ? `${money(totals.refundInFlightMinor)} in progress` : "None in progress"}
        />
        <Kpi label="Net" value={money(totals?.netMinor ?? 0)} hint="Collected less refunds" />
        <Kpi
          label="Platform commission"
          value={money(totals?.commissionMinor ?? 0)}
          hint="Arcade's share, at each sale's rate"
        />
        <Kpi
          accent
          label="Owed to channels"
          value={money(totals?.payableMinor ?? 0)}
          hint="Net less refunds in progress and commission"
        />
        <Kpi label="Checkouts open" value={money(totals?.pendingMinor ?? 0)} hint={`${issues.openCheckouts} right now — not income`} />
      </div>

      {issueCount > 0 && (
        <button
          type="button"
          onClick={onOpenIssues}
          className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left dark:border-amber-500/25 dark:bg-amber-500/10"
        >
          <span className="flex items-start gap-2 text-xs font-semibold text-amber-900 dark:text-amber-200">
            <AlertTriangle size={15} className="mt-px shrink-0" />
            <span>
              {[
                issues.paidNotGranted && `${issues.paidNotGranted} paid without access`,
                issues.duplicatePayments && `${issues.duplicatePayments} duplicate payment${issues.duplicatePayments === 1 ? "" : "s"}`,
                issues.amountMismatches && `${issues.amountMismatches} amount mismatch${issues.amountMismatches === 1 ? "" : "es"}`,
                issues.refundsFailed && `${issues.refundsFailed} failed refund${issues.refundsFailed === 1 ? "" : "s"}`,
              ]
                .filter(Boolean)
                .join(" · ")}{" "}
              need a decision.
            </span>
          </span>
          <ArrowRight size={15} className="shrink-0 text-amber-700 dark:text-amber-300" />
        </button>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl border border-slate-200/80 bg-surface p-5">
          <h3 className="mb-4 text-sm font-bold text-ink">Collected per day</h3>
          {series.length === 0 ? (
            <p className="py-16 text-center text-xs font-medium text-slate-400">No payments in this period.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="collected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4c6fff" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#4c6fff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} minTickGap={24} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value) => formatMoney(Math.round(Number(value) * 100), currency)}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="Collected" stroke="#4c6fff" strokeWidth={2} fill="url(#collected)" />
                  <Area type="monotone" dataKey="Refunded" stroke="#f472b6" strokeWidth={1.5} fill="transparent" />
                  <Area type="monotone" dataKey="Commission" stroke="#f59e0b" strokeWidth={1.5} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200/80 bg-surface p-5">
            <h3 className="text-sm font-bold text-ink">Checkout conversion</h3>
            <p className="mt-2 text-3xl font-bold tracking-tight text-ink tabular-nums">
              {conversionPercent(funnel) === null ? "—" : `${conversionPercent(funnel)}%`}
            </p>
            <p className="text-[11.5px] font-medium text-slate-500">of checkouts opened ended paid</p>
            <dl className="mt-4 grid grid-cols-2 gap-y-2 text-xs">
              <dt className="text-slate-500">Opened</dt>
              <dd className="text-right font-semibold tabular-nums">{funnel.ordersOpened}</dd>
              <dt className="text-slate-500">Paid</dt>
              <dd className="text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{funnel.ordersPaid}</dd>
              <dt className="text-slate-500">Expired or abandoned</dt>
              <dd className="text-right font-semibold tabular-nums">{funnel.ordersExpired}</dd>
              <dt className="text-slate-500">Declined attempts</dt>
              <dd className="text-right font-semibold tabular-nums text-rose-600 dark:text-rose-400">{funnel.failedAttempts}</dd>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-surface p-5">
            <h3 className="mb-3 text-sm font-bold text-ink">By content type</h3>
            {data.byType.filter((t) => t.currency === currency).length === 0 ? (
              <p className="text-xs text-slate-400">Nothing yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {data.byType
                  .filter((t) => t.currency === currency)
                  .map((t) => {
                    const share = totals?.grossMinor ? (t.grossMinor / totals.grossMinor) * 100 : 0;
                    return (
                      <li key={t.resourceType} className="text-xs">
                        <div className="flex justify-between font-semibold text-slate-700">
                          <span>
                            {TYPE_LABEL[t.resourceType] ?? t.resourceType} · {t.paidOrders}
                          </span>
                          <span className="tabular-nums">{money(t.grossMinor)}</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-[#4c6fff]" style={{ width: `${Math.max(2, share)}%` }} />
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </section>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-surface">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-bold text-ink">Largest balances owed</h3>
        </div>
        <ul className="divide-y divide-slate-100">
          {data.topChannels.length === 0 && <li className="px-5 py-8 text-center text-xs text-slate-400">No channel has collected anything yet.</li>}
          {data.topChannels.map((c) => (
            <li key={`${c.channelId}-${c.currency}`}>
              <button
                type="button"
                onClick={() => onOpenChannel(c.channelId)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-3 text-left hover:bg-slate-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold text-slate-900">{c.channelName}</span>
                  <span className="text-[11px] text-slate-400">
                    {c.personal ? "Personal" : "Organization"} · {c.paidOrders} paid
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-sm font-bold tabular-nums text-ink">{formatMoney(c.payableMinor, c.currency)}</span>
                  <span className="text-[11px] tabular-nums text-slate-400">of {formatMoney(c.grossMinor, c.currency)} collected</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
