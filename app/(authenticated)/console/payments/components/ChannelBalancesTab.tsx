/* eslint-disable react-hooks/set-state-in-effect -- loading/error flags reset when the query inputs change */
"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Loader2, Search } from "lucide-react";
import {
  ChannelPaymentsReport,
  PaymentAdminService,
  type ChannelBalance,
  type ChannelCommission,
  type ChannelPaymentDetail,
} from "@/domains/payment";
import { formatMoney, fromMinorUnits } from "@/shared/utils/money";
import { windowFor, type Period } from "./PaymentsOverviewTab";
import { PaymentLedgerTab } from "./PaymentLedgerTab";

const PAGE_SIZE = 25;

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  // Neutralise spreadsheet formula injection, then quote.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

function downloadCsv(rows: ChannelBalance[], period: Period) {
  const header = ["Channel", "Type", "Owner", "Currency", "Paid orders", "Collected", "Refunded", "Refunds in progress", "Net", "Platform commission", "Payable", "Last payment"];
  const lines = rows.map((r) =>
    [
      r.channelName,
      r.personal ? "Personal" : "Organization",
      r.ownerName ?? "",
      r.currency,
      r.paidOrders,
      fromMinorUnits(r.grossMinor).toFixed(2),
      fromMinorUnits(r.refundedMinor).toFixed(2),
      fromMinorUnits(r.refundInFlightMinor).toFixed(2),
      fromMinorUnits(r.netMinor).toFixed(2),
      fromMinorUnits(r.commissionMinor).toFixed(2),
      fromMinorUnits(r.payableMinor).toFixed(2),
      r.lastPaidAt ?? "",
    ]
      .map(csvCell)
      .join(","),
  );
  const blob = new Blob([[header.map(csvCell).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `channel-balances-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/** What each channel collected and is owed. Opens into one channel's full breakdown. */
export function ChannelBalancesTab({
  period,
  selectedChannelId,
  onSelectChannel,
  onOpenOrder,
}: {
  period: Period;
  selectedChannelId: string | null;
  onSelectChannel: (channelId: string | null) => void;
  onOpenOrder: (orderId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<ChannelBalance[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedChannelId) return;
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(() => {
      PaymentAdminService.channelBalances({ ...windowFor(period), search: search.trim() || undefined, page, size: PAGE_SIZE })
        .then((res) => {
          if (cancelled) return;
          setRows(res.content);
          setTotalPages(res.totalPages);
        })
        .catch(() => !cancelled && setRows([]))
        .finally(() => !cancelled && setLoading(false));
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [period, search, page, selectedChannelId]);

  if (selectedChannelId) {
    return (
      <ChannelDrillDown
        channelId={selectedChannelId}
        channelName={rows.find((r) => r.channelId === selectedChannelId)?.channelName}
        personal={rows.find((r) => r.channelId === selectedChannelId)?.personal}
        period={period}
        onBack={() => onSelectChannel(null)}
        onOpenOrder={onOpenOrder}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search channels…"
            className="w-full rounded-xl border border-slate-200/90 bg-white py-2 pl-9 pr-3 text-xs font-medium outline-none focus:border-slate-400"
          />
        </div>
        <button
          type="button"
          disabled={rows.length === 0}
          onClick={() => downloadCsv(rows, period)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          <Download size={13} /> Export this page
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3">Channel</th>
                <th className="px-3 py-3 text-right">Orders</th>
                <th className="px-3 py-3 text-right">Collected</th>
                <th className="px-3 py-3 text-right">Refunded</th>
                <th className="px-3 py-3 text-right">In progress</th>
                <th className="px-3 py-3 text-right">Commission</th>
                <th className="px-3 py-3 text-right">Payable</th>
                <th className="px-5 py-3 text-right">Last payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-400">No channel has collected anything in this period.</td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr key={`${r.channelId}-${r.currency}`} onClick={() => onSelectChannel(r.channelId)} className="cursor-pointer hover:bg-slate-50/80">
                    <td className="px-5 py-3">
                      <p className="font-bold text-slate-900">{r.channelName}</p>
                      <p className="text-[11px] text-slate-400">
                        {r.personal ? "Personal" : "Organization"}
                        {r.ownerName ? ` · ${r.ownerName}` : ""}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-slate-600">{r.paidOrders}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-slate-600">{formatMoney(r.grossMinor, r.currency)}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-slate-500">{r.refundedMinor ? formatMoney(r.refundedMinor, r.currency) : "—"}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-slate-500">
                      {r.refundInFlightMinor ? formatMoney(r.refundInFlightMinor, r.currency) : "—"}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-slate-500">{r.commissionMinor ? formatMoney(r.commissionMinor, r.currency) : "—"}</td>
                    <td className={`px-3 py-3 text-right text-sm font-bold tabular-nums ${r.payableMinor < 0 ? "text-rose-600" : "text-[#14142b]"}`}>
                      {formatMoney(r.payableMinor, r.currency)}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-500">{r.lastPaidAt ? new Date(r.lastPaidAt).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs">
            <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="inline-flex cursor-pointer items-center gap-1 font-semibold text-slate-600 disabled:opacity-40">
              <ChevronLeft size={13} /> Previous
            </button>
            <span className="text-slate-500">
              Page {page + 1} of {totalPages}
            </span>
            <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="inline-flex cursor-pointer items-center gap-1 font-semibold text-slate-600 disabled:opacity-40">
              Next <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>
      <p className="text-[11.5px] font-medium text-slate-400">
        Payable = collected − completed refunds − refunds in progress − platform commission (at the rate in force when each sale was paid).
        Negative means the channel owes commission on refunded sales. Settlement is manual; the system records no payouts.
      </p>
    </div>
  );
}

function ChannelDrillDown({
  channelId,
  channelName,
  personal,
  period,
  onBack,
  onOpenOrder,
}: {
  channelId: string;
  channelName?: string;
  personal?: boolean;
  period: Period;
  onBack: () => void;
  onOpenOrder: (orderId: string) => void;
}) {
  const [detail, setDetail] = useState<ChannelPaymentDetail | null>(null);
  const [commission, setCommission] = useState<ChannelCommission | null>(null);

  useEffect(() => {
    let cancelled = false;
    PaymentAdminService.channelCommission(channelId)
      .then((c) => !cancelled && setCommission(c))
      .catch(() => !cancelled && setCommission(null));
    return () => {
      cancelled = true;
    };
  }, [channelId]);

  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    PaymentAdminService.channelDetail(channelId, windowFor(period))
      .then((d) => !cancelled && setDetail(d))
      .catch(() => !cancelled && setDetail({ totals: [], byInstructor: [], byResource: [], monthly: [] }));
    return () => {
      cancelled = true;
    };
  }, [channelId, period]);

  return (
    <div className="space-y-5">
      <button type="button" onClick={onBack} className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft size={14} /> All channels
      </button>
      {channelName && <h2 className="text-lg font-bold text-[#14142b]">{channelName}</h2>}
      {!detail ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <ChannelPaymentsReport detail={detail} fullAccess personal={personal} commission={commission} />
      )}
      <div>
        <h3 className="mb-3 text-sm font-bold text-[#14142b]">Orders</h3>
        <PaymentLedgerTab channelId={channelId} onOpenOrder={onOpenOrder} />
      </div>
    </div>
  );
}
