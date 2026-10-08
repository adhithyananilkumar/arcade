'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Receipt, Loader2, ChevronDown, ExternalLink, RotateCcw, Wallet } from 'lucide-react';
import { PaymentService, type BillingLine, type BillingSummary } from '@/domains/payment';
import { formatMoney } from '@/shared/utils/money';
import { courseRoutes, eventRoutes, examRoutes } from '@/shared/routes/content.routes';

/**
 * What you have paid Arcade for. Arcade has no subscriptions or saved cards — every purchase is one
 * order, and card details stay with the payment gateway — so this page is the order history and
 * nothing else. It used to show an invented "Pro Learner Membership", a Visa ending 4242 and a $120
 * invoice.
 */

const STATUS: Record<BillingLine['status'], { label: string; cls: string }> = {
  PAID: { label: 'Paid', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  PARTIALLY_REFUNDED: { label: 'Part refunded', cls: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' },
  REFUNDED: { label: 'Refunded', cls: 'bg-slate-100 text-slate-600' },
  // An open checkout: nothing has been charged yet. It turns Paid, or closes and drops off this list.
  PENDING: { label: 'Awaiting payment', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  FAILED: { label: 'Failed', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
};

const KIND: Record<string, string> = { COURSE: 'Course', EVENT: 'Event', EXAM: 'Exam', EXAM_RETAKE: 'Exam retake' };

function hrefFor(line: BillingLine): string | null {
  if (line.resourceType === 'COURSE') return courseRoutes.landing(line.resourceId);
  if (line.resourceType === 'EVENT') return eventRoutes.landing(line.resourceId);
  if (line.resourceType === 'EXAM') return examRoutes.landing(line.resourceId);
  return null;
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function BillingRow({ line }: { line: BillingLine }) {
  const [open, setOpen] = useState(false);
  const status = STATUS[line.status] ?? STATUS.PENDING;
  const href = hrefFor(line);
  const title = line.resourceTitle || `${KIND[line.resourceType] ?? 'Item'} (no longer available)`;

  return (
    <li className="py-3.5">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between gap-4 text-left">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-900 truncate">{title}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {KIND[line.resourceType] ?? line.resourceType} · {formatDate(line.paidAt ?? line.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-xs font-bold text-gray-900">{formatMoney(line.amount, line.currency)}</p>
            {line.refundedAmount > 0 && (
              <p className="text-[10px] text-sky-600 dark:text-sky-400">−{formatMoney(line.refundedAmount, line.currency)} refunded</p>
            )}
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${status.cls}`}>{status.label}</span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="mt-3 rounded-xl bg-slate-50 p-4 text-[11px] text-gray-600 space-y-2">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
            <div className="flex justify-between gap-3"><dt>Order</dt><dd className="font-mono text-gray-900">{line.orderId.slice(0, 8).toUpperCase()}</dd></div>
            {line.paymentReference && (
              <div className="flex justify-between gap-3"><dt>Payment reference</dt><dd className="font-mono text-gray-900">{line.paymentReference}</dd></div>
            )}
            <div className="flex justify-between gap-3"><dt>Started</dt><dd className="text-gray-900">{new Date(line.createdAt).toLocaleString()}</dd></div>
            {line.paidAt && (
              <div className="flex justify-between gap-3"><dt>Paid</dt><dd className="text-gray-900">{new Date(line.paidAt).toLocaleString()}</dd></div>
            )}
          </dl>
          {line.status === 'FAILED' && <p className="text-rose-600 dark:text-rose-400">This payment didn&apos;t go through. No money was taken; you can try again from the {KIND[line.resourceType]?.toLowerCase() ?? 'content'} page.</p>}
          {line.status === 'PENDING' && (
            <p className="text-amber-700 dark:text-amber-300">
              Checkout started — no money has been taken.
              {line.expiresAt && new Date(line.expiresAt).getTime() > Date.now()
                ? ` It stays open until ${new Date(line.expiresAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}, then closes on its own.`
                : ' It has closed and will disappear from this list shortly.'}{' '}
              If you already paid, it is confirmed automatically — you won&apos;t be charged twice.
            </p>
          )}
          {line.refunds.length > 0 && (
            <div className="pt-1">
              <p className="font-semibold text-gray-900 flex items-center gap-1"><RotateCcw size={11} /> Refunds</p>
              <ul className="mt-1 space-y-2">
                {line.refunds.map((r) => (
                  <li key={r.refundId}>
                    <div className="flex justify-between gap-3">
                      <span>
                        {formatDate(r.completedAt ?? r.requestedAt)} ·{' '}
                        {r.status === 'COMPLETED'
                          ? 'Sent to your bank'
                          : r.status === 'FAILED'
                            ? 'Could not be completed — nothing was sent'
                            : 'Refund in progress'}
                      </span>
                      <span className="font-semibold text-gray-900">{formatMoney(r.amount, r.currency)}</span>
                    </div>
                    {r.status !== 'FAILED' && (r.bankReference || r.gatewayRefundId) && (
                      <p className="mt-0.5 text-slate-400">
                        {r.bankReference ? (
                          <>Bank reference <span className="font-mono text-slate-600 select-all">{r.bankReference}</span></>
                        ) : (
                          <>Refund ID <span className="font-mono text-slate-600 select-all">{r.gatewayRefundId}</span>
                            {r.status === 'COMPLETED' && ' · bank reference appears here once your bank assigns it'}</>
                        )}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-slate-400">
                Once sent, banks usually credit a refund within 5–7 working days (UPI is often quicker). If it hasn&apos;t
                arrived after that, give your bank the reference above.
              </p>
            </div>
          )}
          {href && line.resourceTitle && (
            <Link href={href} className="inline-flex items-center gap-1 font-semibold text-sky-600 hover:underline dark:text-sky-400">
              Open {KIND[line.resourceType]?.toLowerCase() ?? 'item'} <ExternalLink size={11} />
            </Link>
          )}
        </div>
      )}
    </li>
  );
}

export default function PaymentsPage() {
  const [lines, setLines] = useState<BillingLine[]>([]);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = async (p: number) => {
    setLoading(true);
    setFailed(false);
    try {
      const [history, totals] = await Promise.all([
        PaymentService.myBillingHistory(p),
        p === 0 || !summary ? PaymentService.myBillingSummary() : Promise.resolve(summary),
      ]);
      setLines(history.content);
      setTotalPages(Math.max(history.totalPages, 1));
      setPage(p);
      setSummary(totals);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {summary && summary.count > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-surface p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Total paid</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{formatMoney(summary.paidTotal, summary.currency)}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-surface p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Refunded</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{formatMoney(summary.refundedTotal, summary.currency)}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-surface p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Payments</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{summary.count}</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-surface p-6 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Receipt size={18} className="text-purple-500" /> Billing history
          </h3>
          {totalPages > 1 && <span className="text-xs text-gray-500">Page {page + 1} of {totalPages}</span>}
        </div>
        <p className="text-xs text-gray-500">
          Courses, events and exams you&apos;ve paid for. Card and UPI details are handled by Razorpay and never stored by Arcade.
        </p>

        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-purple-500" size={24} /></div>
        ) : failed ? (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-xs font-medium text-amber-800 dark:text-amber-300">
            Couldn&apos;t load your billing history.
            <button onClick={() => load(page)} className="font-bold underline">Try again</button>
          </div>
        ) : lines.length === 0 ? (
          <div className="py-10 text-center">
            <Wallet className="mx-auto text-gray-300 mb-3" size={36} />
            <p className="text-sm font-medium text-gray-900">No payments yet</p>
            <p className="text-xs text-gray-500 mt-1">When you buy a course, event or exam, the receipt will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {lines.map((line) => <BillingRow key={line.orderId} line={line} />)}
          </ul>
        )}

        {totalPages > 1 && !loading && (
          <div className="pt-3 flex justify-between">
            <button onClick={() => load(page - 1)} disabled={page === 0} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-50">Previous</button>
            <button onClick={() => load(page + 1)} disabled={page >= totalPages - 1} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
