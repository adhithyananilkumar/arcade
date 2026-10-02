'use client';

import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BookOpen, CalendarDays, ClipboardCheck, Info, Percent, Users } from 'lucide-react';
import { formatMoney, fromMinorUnits } from '@/shared/utils/money';
import { ChannelAvatar } from '@/shared/design-system/ui/cards';
import type {
  ChannelCommission,
  ChannelPaymentDetail,
  InstructorBreakdown,
  MoneySummary,
} from '../types/payment.types';
import { describeCommission, REFUND_TREATMENT_HINT } from '../utils/commission';

export interface ChannelPaymentsReportProps {
  detail: ChannelPaymentDetail;
  /** False when the viewer sees only their own sales. */
  fullAccess: boolean;
  /** Personal channels have one instructor — the owner — so the payee split is omitted. */
  personal?: boolean;
  /** Called with an instructor id to filter the transactions list, or null to clear. */
  onSelectInstructor?: (instructorId: string | null) => void;
  selectedInstructorId?: string | null;
  /** The platform commission this channel is charged now, and its next change. */
  commission?: ChannelCommission | null;
}

const TYPE_ICON: Record<string, typeof BookOpen> = { COURSE: BookOpen, EVENT: CalendarDays, EXAM: ClipboardCheck };

function Stat({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'primary' | 'muted';
}) {
  const box =
    tone === 'primary'
      ? 'border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-white dark:border-indigo-900/60 dark:from-indigo-950/40 dark:to-slate-900'
      : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900';
  return (
    <div className={`rounded-2xl border p-4 shadow-[0_2px_10px_rgba(20,20,43,0.03)] ${box}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p
        className={`mt-1.5 text-xl font-bold tracking-tight tabular-nums ${
          tone === 'muted' ? 'text-slate-500' : 'text-[#14142b] dark:text-white'
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-[11.5px] font-medium leading-snug text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

function shareOf(part: number, whole: number): string {
  if (whole <= 0) return '—';
  return `${Math.round((part / whole) * 1000) / 10}%`;
}

function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(undefined, { month: 'short', year: '2-digit', timeZone: 'UTC' });
}

/**
 * A channel's money at a glance: totals, the 12-month trend, who it is owed to, and which content
 * earned it. Pure — the caller fetches; this only renders.
 */
export function ChannelPaymentsReport({
  detail,
  fullAccess,
  personal,
  onSelectInstructor,
  selectedInstructorId,
  commission,
}: ChannelPaymentsReportProps) {
  const currencies = useMemo(() => {
    const set = new Set<string>();
    detail.totals.forEach((t) => set.add(t.currency));
    detail.monthly.forEach((m) => set.add(m.currency));
    return Array.from(set);
  }, [detail]);
  const [currency, setCurrency] = useState<string>(currencies[0] ?? 'INR');
  const active = currencies.includes(currency) ? currency : currencies[0] ?? 'INR';

  const totals: MoneySummary =
    detail.totals.find((t) => t.currency === active) ?? {
      currency: active,
      grossMinor: 0,
      refundedMinor: 0,
      refundInFlightMinor: 0,
      netMinor: 0,
      commissionMinor: 0,
      payableMinor: 0,
      paidOrders: 0,
      learners: 0,
      pendingMinor: 0,
      pendingOrders: 0,
      lastPaidAt: null,
    };
  const money = (minor: number) => formatMoney(minor, active);

  const monthly = useMemo(
    () =>
      detail.monthly
        .filter((m) => m.currency === active)
        .map((m) => ({
          month: monthLabel(m.month),
          Collected: fromMinorUnits(m.grossMinor),
          Refunded: fromMinorUnits(m.refundedMinor),
          Commission: fromMinorUnits(m.commissionMinor),
        })),
    [detail.monthly, active],
  );

  const instructors: InstructorBreakdown[] = detail.byInstructor.filter((i) => i.currency === active);
  const resources = detail.byResource.filter((r) => r.currency === active);
  const showPayees = fullAccess && !personal;

  return (
    <div className="space-y-6">
      {currencies.length > 1 && (
        <div className="flex items-center gap-1 rounded-full border border-slate-200/80 bg-white p-1 w-fit">
          {currencies.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold ${
                c === active ? 'bg-[#14142b] text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {commission && (
        <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/20">
          <Percent size={15} className="mt-0.5 shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1 text-[12.5px] leading-relaxed text-slate-700 dark:text-slate-300">
            <p>
              <span className="font-bold text-[#14142b] dark:text-white">
                Platform commission: {describeCommission(commission.current)}
              </span>
              {commission.current.source === 'CHANNEL' && <span className="text-slate-500"> · rate agreed for this channel</span>}
              {commission.current.source !== 'NONE' && (
                <span className="text-slate-500"> · {REFUND_TREATMENT_HINT[commission.current.refundTreatment]}</span>
              )}
            </p>
            {commission.next && commission.nextFrom && (
              <p className="mt-0.5 text-slate-500">
                Changes to <span className="font-semibold text-slate-700 dark:text-slate-200">{describeCommission(commission.next)}</span>{' '}
                on {new Date(commission.nextFrom).toLocaleString()}. Sales already made keep the rate they were charged.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat
          tone="primary"
          label={fullAccess ? 'Payable to channel' : 'Your earnings'}
          value={money(totals.payableMinor)}
          hint={
            fullAccess
              ? 'Collected, less refunds and platform commission. Paid out by Arcade manually.'
              : 'From content you authored, less refunds and platform commission. Paid out via your channel.'
          }
        />
        <Stat label="Collected" value={money(totals.grossMinor)} hint={`${totals.paidOrders} paid order${totals.paidOrders === 1 ? '' : 's'} · ${totals.learners} learner${totals.learners === 1 ? '' : 's'}`} />
        <Stat
          label="Refunded"
          value={money(totals.refundedMinor)}
          hint={totals.refundInFlightMinor > 0 ? `${money(totals.refundInFlightMinor)} more in progress` : 'No refunds in progress'}
        />
        <Stat
          label="Platform commission"
          value={money(totals.commissionMinor)}
          hint={
            totals.grossMinor > 0
              ? `${shareOf(totals.commissionMinor, totals.grossMinor)} of collected, at each sale's rate`
              : 'Charged at the rate in force when each sale was paid'
          }
        />
        <Stat
          tone="muted"
          label="Checkouts open"
          value={money(totals.pendingMinor)}
          hint={`${totals.pendingOrders} learner${totals.pendingOrders === 1 ? '' : 's'} paying now — not income yet`}
        />
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#14142b] dark:text-white">Last 12 months</h3>
          {totals.lastPaidAt && (
            <span className="text-[11.5px] font-medium text-slate-400">
              Last payment {new Date(totals.lastPaidAt).toLocaleDateString()}
            </span>
          )}
        </div>
        {monthly.length === 0 ? (
          <p className="py-10 text-center text-xs font-medium text-slate-400">No payments in the last 12 months.</p>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => formatMoney(Math.round(Number(value) * 100), active)}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Collected" fill="#4c6fff" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Refunded" fill="#f472b6" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Commission" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {showPayees && (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#14142b] dark:text-white">
                <Users size={15} className="text-slate-400" /> Who is owed
              </h3>
              <p className="mt-0.5 text-[11.5px] font-medium text-slate-500">
                Each sale is credited to the author of the content sold. Where content has co-authors, the author
                decides how to share it with them.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-800/40">
                  <th className="px-5 py-2.5">Instructor</th>
                  <th className="px-3 py-2.5 text-right">Orders</th>
                  <th className="px-3 py-2.5 text-right">Collected</th>
                  <th className="px-3 py-2.5 text-right">Refunded</th>
                  <th className="px-3 py-2.5 text-right">Commission</th>
                  <th className="px-3 py-2.5 text-right">Payable</th>
                  <th className="px-5 py-2.5 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {instructors.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400">No sales yet.</td>
                  </tr>
                )}
                {instructors.map((row) => {
                  const name = row.name || 'Former member';
                  const selected = !!row.instructorId && row.instructorId === selectedInstructorId;
                  return (
                    <tr
                      key={`${row.instructorId ?? 'none'}-${row.currency}`}
                      onClick={() => onSelectInstructor?.(selected ? null : row.instructorId ?? null)}
                      className={`${onSelectInstructor ? 'cursor-pointer' : ''} ${
                        selected ? 'bg-indigo-50/70 dark:bg-indigo-950/30' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <ChannelAvatar name={name} iconUrl={row.avatarUrl} size={28} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900 dark:text-white">{name}</p>
                            {row.username && <p className="truncate text-[11px] text-slate-400">@{row.username}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-600">{row.paidOrders}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-600">{money(row.grossMinor)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-500">
                        {row.refundedMinor + row.refundInFlightMinor > 0 ? money(row.refundedMinor + row.refundInFlightMinor) : '—'}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-500">
                        {row.commissionMinor !== 0 ? money(row.commissionMinor) : '—'}
                      </td>
                      <td className="px-3 py-3 text-right font-bold tabular-nums text-[#14142b] dark:text-white">
                        {money(row.payableMinor)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-slate-500">
                        {shareOf(row.payableMinor, totals.payableMinor)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h3 className="text-sm font-bold text-[#14142b] dark:text-white">By content</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-800/40">
                <th className="px-5 py-2.5">Content</th>
                <th className="px-3 py-2.5 text-right">Orders</th>
                <th className="px-3 py-2.5 text-right">Collected</th>
                <th className="px-3 py-2.5 text-right">Refunded</th>
                <th className="px-3 py-2.5 text-right">Commission</th>
                <th className="px-5 py-2.5 text-right">Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {resources.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">No paid content yet.</td>
                </tr>
              )}
              {resources.map((row) => {
                const Icon = TYPE_ICON[row.resourceType] ?? BookOpen;
                return (
                  <tr key={`${row.resourceId}-${row.currency}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Icon size={13} className="shrink-0 text-slate-400" />
                        <span className="truncate font-semibold text-slate-900 dark:text-white">{row.title || 'Untitled'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-slate-600">{row.paidOrders}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-slate-600">{money(row.grossMinor)}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-slate-500">{row.refundedMinor > 0 ? money(row.refundedMinor) : '—'}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-slate-500">{row.commissionMinor !== 0 ? money(row.commissionMinor) : '—'}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-[#14142b] dark:text-white">{money(row.payableMinor)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="flex items-start gap-1.5 text-[11.5px] font-medium leading-relaxed text-slate-400">
        <Info size={13} className="mt-px shrink-0" />
        Amounts are what learners paid. Payable is after refunds and platform commission; each sale keeps the
        commission rate in force when it was paid, so a rate change never alters past sales. Payouts are made manually
        by the Arcade team against the payable figure; there is no automatic transfer.
      </p>
    </div>
  );
}
