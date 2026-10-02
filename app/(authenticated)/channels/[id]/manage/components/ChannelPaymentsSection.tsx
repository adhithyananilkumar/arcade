/* eslint-disable react-hooks/set-state-in-effect -- loading/error flags reset when the query inputs change */
'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Receipt, ShieldCheck, UserRound, X } from 'lucide-react';
import {
  ChannelPaymentService,
  ChannelPaymentsReport,
  PaymentStatusBadge,
  type ChannelLedgerEntry,
  type ChannelPaymentsOverview,
} from '@/domains/payment';
import { formatMoney } from '@/shared/utils/money';

type Filter = 'SALES' | 'REFUNDED' | 'OPEN';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'SALES', label: 'Sales' },
  { id: 'REFUNDED', label: 'Refunded' },
  { id: 'OPEN', label: 'Checkouts open' },
];

const PAGE_SIZE = 20;

/**
 * The channel's Payments page. What the viewer sees is decided by the backend: owners and holders of
 * channel.payments.view get the whole channel and the payee split; other members only their own
 * sales. Read-only — payouts are made manually by the platform team.
 */
export function ChannelPaymentsSection({ channelId, isPersonal }: { channelId: string; isPersonal: boolean }) {
  const [overview, setOverview] = useState<ChannelPaymentsOverview | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const [filter, setFilter] = useState<Filter>('SALES');
  const [instructorId, setInstructorId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<ChannelLedgerEntry[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [rowsLoading, setRowsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    ChannelPaymentService.overview(channelId)
      .then((data) => !cancelled && setOverview(data))
      .catch((err) => !cancelled && setOverviewError(err?.message || 'Could not load payments.'));
    return () => {
      cancelled = true;
    };
  }, [channelId]);

  useEffect(() => {
    let cancelled = false;
    setRowsLoading(true);
    ChannelPaymentService.transactions(channelId, {
      status: filter === 'REFUNDED' ? 'REFUNDED' : filter === 'OPEN' ? 'PENDING' : undefined,
      instructorId: instructorId ?? undefined,
      page,
      size: PAGE_SIZE,
    })
      .then((res) => {
        if (cancelled) return;
        setRows(res.content);
        setTotalPages(res.totalPages);
      })
      .catch(() => !cancelled && setRows([]))
      .finally(() => !cancelled && setRowsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [channelId, filter, instructorId, page]);

  if (overviewError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
        {overviewError}
      </div>
    );
  }
  if (!overview) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const showInstructorColumn = overview.fullAccess && !isPersonal;
  const selectedName = overview.detail.byInstructor.find((i) => i.instructorId === instructorId)?.name;

  return (
    <div className="space-y-6">
      <div
        className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-[12.5px] font-medium ${
          overview.fullAccess
            ? 'border-slate-200/80 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            : 'border-indigo-200/80 bg-indigo-50/70 text-indigo-800 dark:border-indigo-900/60 dark:bg-indigo-950/30 dark:text-indigo-200'
        }`}
      >
        {overview.fullAccess ? <ShieldCheck size={15} className="mt-px shrink-0" /> : <UserRound size={15} className="mt-px shrink-0" />}
        <span>
          {overview.fullAccess
            ? isPersonal
              ? 'Everything learners have paid for your content on this channel.'
              : "The whole channel's payments. Members without payment access see only their own sales."
            : 'You are seeing only the sales of content you authored on this channel. If you have co-authors, how you share these earnings with them is your decision.'}
        </span>
      </div>

      <ChannelPaymentsReport
        detail={overview.detail}
        fullAccess={overview.fullAccess}
        personal={isPersonal}
        commission={overview.commission}
        selectedInstructorId={instructorId}
        onSelectInstructor={(id) => {
          setInstructorId(id);
          setPage(0);
        }}
      />

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#14142b] dark:text-white">Transactions</h3>
            {instructorId && (
              <button
                type="button"
                onClick={() => setInstructorId(null)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700"
              >
                {selectedName || 'One instructor'} <X size={11} />
              </button>
            )}
          </div>
          <div className="flex gap-1 rounded-full border border-slate-200/80 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFilter(f.id);
                  setPage(0);
                }}
                className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  filter === f.id ? 'bg-[#14142b] text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-800/40">
                <th className="px-5 py-2.5">Date</th>
                <th className="px-3 py-2.5">Learner</th>
                <th className="px-3 py-2.5">Content</th>
                {showInstructorColumn && <th className="px-3 py-2.5">Credited to</th>}
                <th className="px-3 py-2.5 text-right">Amount</th>
                <th className="px-3 py-2.5 text-right">Commission</th>
                <th className="px-3 py-2.5 text-right">Payable</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-5 py-2.5 text-right">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rowsLoading && (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                  </td>
                </tr>
              )}
              {!rowsLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Receipt size={20} className="mx-auto mb-2" />
                    Nothing here yet.
                  </td>
                </tr>
              )}
              {!rowsLoading &&
                rows.map((row) => (
                  <tr key={row.orderId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                      {new Date(row.paidAt || row.createdAt).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-800 dark:text-slate-100">{row.learnerName || 'Learner'}</td>
                    <td className="max-w-[220px] truncate px-3 py-3 text-slate-600 dark:text-slate-300" title={row.resourceTitle ?? undefined}>
                      {row.resourceTitle || 'Untitled'}
                    </td>
                    {showInstructorColumn && (
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{row.instructorName || '—'}</td>
                    )}
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                      <span className="font-bold text-[#14142b] dark:text-white">{formatMoney(row.amountMinor, row.currency)}</span>
                      {row.refundedMinor > 0 && (
                        <span className="block text-[11px] text-violet-600">−{formatMoney(row.refundedMinor, row.currency)}</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-slate-500">
                      {row.commissionMinor !== 0 ? `−${formatMoney(row.commissionMinor, row.currency)}` : '—'}
                    </td>
                    <td
                      className={`whitespace-nowrap px-3 py-3 text-right font-semibold tabular-nums ${
                        row.payableMinor < 0 ? 'text-rose-600' : 'text-[#14142b] dark:text-white'
                      }`}
                    >
                      {row.status === 'PENDING' || row.status === 'CREATED' ? '—' : formatMoney(row.payableMinor, row.currency)}
                    </td>
                    <td className="px-3 py-3">
                      <PaymentStatusBadge status={row.status} />
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-[11px] text-slate-400">{row.paymentReference || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs dark:border-slate-800">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={13} /> Previous
            </button>
            <span className="text-slate-500">
              Page {page + 1} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
