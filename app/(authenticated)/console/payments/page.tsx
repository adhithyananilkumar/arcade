"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import { AuthorizationService } from "@/infrastructure/auth/authorization.service";
import { PaymentAdminService, PaymentLedgerRow, PaymentOrderStatus } from "@/domains/payment";
import { formatMoney } from "@/shared/utils/money";
import { Receipt, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const STATUS_OPTIONS: PaymentOrderStatus[] = ["CREATED", "PENDING", "PAID", "FAILED", "EXPIRED", "CANCELLED"];

function StatusBadge({ status }: { status: PaymentOrderStatus }) {
  const map: Record<PaymentOrderStatus, string> = {
    CREATED: "bg-slate-100 text-slate-600 border-slate-200",
    PENDING: "bg-blue-50 text-blue-700 border-blue-200",
    PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
    FAILED: "bg-red-50 text-red-700 border-red-200",
    EXPIRED: "bg-amber-50 text-amber-700 border-amber-200",
    CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${map[status]}`}>
      {status}
    </span>
  );
}

export default function PaymentsConsolePage() {
  const { user } = useAuthStore();
  if (!AuthorizationService.canViewPayments(user)) {
    notFound();
  }

  const [rows, setRows] = useState<PaymentLedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [status, setStatus] = useState<PaymentOrderStatus | "">("");
  const [gateway, setGateway] = useState("");
  const [resourceType, setResourceType] = useState<"COURSE" | "EVENT" | "">("");
  const [orderIdSearch, setOrderIdSearch] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");

  const size = 20;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    const handle = setTimeout(() => {
      PaymentAdminService.list({
        status: status || undefined,
        gateway: gateway || undefined,
        resourceType: resourceType || undefined,
        orderId: orderIdSearch || undefined,
        createdFrom: createdFrom ? new Date(createdFrom).toISOString() : undefined,
        createdTo: createdTo ? new Date(createdTo).toISOString() : undefined,
        page,
        size,
      })
        .then((result) => {
          if (cancelled) return;
          setRows(result.content);
          setTotalPages(result.totalPages);
          setTotalElements(result.totalElements);
        })
        .catch((err: any) => {
          if (cancelled) return;
          setLoadError(err?.message || "Failed to load payments.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [status, gateway, resourceType, orderIdSearch, createdFrom, createdTo, page]);

  // Reset to first page whenever filters change (not pagination itself).
  useEffect(() => {
    setPage(0);
  }, [status, gateway, resourceType, orderIdSearch, createdFrom, createdTo]);

  const totalLabel = useMemo(() => {
    if (totalElements === 0) return "No payments";
    return `${totalElements} payment${totalElements === 1 ? "" : "s"}`;
  }, [totalElements]);

  return (
    <div className="flex flex-col h-full space-y-6 pb-6">


      <div className="flex-none sticky top-0 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-[0_4px_14px_rgba(20,20,43,0.04)] backdrop-blur-md">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={orderIdSearch}
            onChange={(e) => setOrderIdSearch(e.target.value)}
            placeholder="Search by order ID"
            className="w-56 rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-[12px] outline-none focus:border-[#4c6fff] focus:ring-1 focus:ring-[#4c6fff]/30"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as PaymentOrderStatus | "")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] outline-none focus:border-[#4c6fff]"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={resourceType}
          onChange={(e) => setResourceType(e.target.value as "COURSE" | "EVENT" | "")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] outline-none focus:border-[#4c6fff]"
        >
          <option value="">All resource types</option>
          <option value="COURSE">Course</option>
          <option value="EVENT">Event</option>
        </select>
        <select
          value={gateway}
          onChange={(e) => setGateway(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] outline-none focus:border-[#4c6fff]"
        >
          <option value="">All gateways</option>
          <option value="RAZORPAY">Razorpay</option>
        </select>
        <input
          type="date"
          value={createdFrom}
          onChange={(e) => setCreatedFrom(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] outline-none focus:border-[#4c6fff]"
        />
        <span className="text-[11px] text-slate-400">to</span>
        <input
          type="date"
          value={createdTo}
          onChange={(e) => setCreatedTo(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] outline-none focus:border-[#4c6fff]"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-auto rounded-2xl border border-slate-200 bg-white/90">
        <table className="w-full min-w-[900px] text-left text-[12.5px] relative">
          <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Order ID</th>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Resource</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Gateway</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 font-semibold">Paid At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                  <Loader2 className="mx-auto mb-2 animate-spin" size={18} />
                  Loading payments…
                </td>
              </tr>
            )}
            {!loading && loadError && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-red-500">
                  {loadError}
                </td>
              </tr>
            )}
            {!loading && !loadError && rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                  No payments match these filters.
                </td>
              </tr>
            )}
            {!loading &&
              !loadError &&
              rows.map((row) => (
                <tr key={row.paymentOrderId} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500" title={row.paymentOrderId}>
                    {row.paymentOrderId.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#14142b]">{row.userName || "—"}</div>
                    <div className="text-[11px] text-slate-400">{row.userEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.resourceTitle || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{row.resourceType}</td>
                  <td className="px-4 py-3 font-semibold text-[#14142b]">
                    {formatMoney(row.amount, row.currency)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{row.gateway}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(row.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {row.paidAt ? new Date(row.paidAt).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-slate-600 disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="text-[12px] text-slate-500">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-slate-600 disabled:opacity-40"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
