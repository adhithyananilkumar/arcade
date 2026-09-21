/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useRef } from "react";
import { notFound } from "next/navigation";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import { AuthorizationService } from "@/infrastructure/auth/authorization.service";
import { PaymentAdminService, PaymentLedgerRow, PaymentOrderStatus } from "@/domains/payment";
import { formatMoney } from "@/shared/utils/money";
import {
  Receipt,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  CreditCard,
  Layers,
  ChevronDown,
  Check,
  X,
  Copy,
  CheckCheck,
  BookOpen,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_FILTERS: { id: PaymentOrderStatus | "ALL"; label: string }[] = [
  { id: "ALL", label: "All Orders" },
  { id: "PAID", label: "Paid" },
  { id: "PENDING", label: "Pending" },
  { id: "CREATED", label: "Created" },
  { id: "FAILED", label: "Failed" },
  { id: "EXPIRED", label: "Expired" },
  { id: "CANCELLED", label: "Cancelled" },
];

const GATEWAYS = [
  { id: "", label: "All Gateways" },
  { id: "RAZORPAY", label: "Razorpay" },
  { id: "STRIPE", label: "Stripe" },
  { id: "MANUAL", label: "Manual" },
];

const RESOURCE_TYPES = [
  { id: "", label: "All Resources" },
  { id: "COURSE", label: "Courses" },
  { id: "EVENT", label: "Events" },
];

function StatusBadge({ status }: { status: PaymentOrderStatus }) {
  const map: Record<PaymentOrderStatus, { badge: string; dot: string }> = {
    CREATED: { badge: "bg-slate-100 text-slate-700 border-slate-200/80", dot: "bg-slate-400" },
    PENDING: { badge: "bg-amber-50 text-amber-700 border-amber-200/80", dot: "bg-amber-500 animate-pulse" },
    PAID: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80", dot: "bg-emerald-500" },
    FAILED: { badge: "bg-rose-50 text-rose-700 border-rose-200/80", dot: "bg-rose-500" },
    EXPIRED: { badge: "bg-slate-100 text-slate-600 border-slate-200/80", dot: "bg-slate-400" },
    CANCELLED: { badge: "bg-slate-100 text-slate-500 border-slate-200/80", dot: "bg-slate-400" },
  };
  const config = map[status] || { badge: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${config.badge}`}>
      <span className={`size-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}

function GatewayBadge({ gateway }: { gateway: string }) {
  const normalized = gateway?.toUpperCase() || "";
  if (normalized === "RAZORPAY") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
        <CreditCard size={11} className="text-sky-500" />
        Razorpay
      </span>
    );
  }
  if (normalized === "STRIPE") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
        <CreditCard size={11} className="text-purple-500" />
        Stripe
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
      <CreditCard size={11} className="text-slate-400" />
      {gateway || "Manual"}
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

  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Dropdown popover open states
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const [resourceOpen, setResourceOpen] = useState(false);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);

  const gatewayRef = useRef<HTMLDivElement>(null);
  const resourceRef = useRef<HTMLDivElement>(null);
  const dateRangeRef = useRef<HTMLDivElement>(null);

  const size = 20;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (gatewayRef.current && !gatewayRef.current.contains(event.target as Node)) {
        setGatewayOpen(false);
      }
      if (resourceRef.current && !resourceRef.current.contains(event.target as Node)) {
        setResourceOpen(false);
      }
      if (dateRangeRef.current && !dateRangeRef.current.contains(event.target as Node)) {
        setDateRangeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    const handle = setTimeout(() => {
      PaymentAdminService.list({
        status: status || undefined,
        gateway: gateway || undefined,
        resourceType: resourceType || undefined,
        orderId: orderIdSearch.trim() || undefined,
        createdFrom: createdFrom || undefined,
        createdTo: createdTo || undefined,
        page,
        size,
      })
        .then((res) => {
          if (!cancelled) {
            setRows(res.content);
            setTotalPages(res.totalPages);
            setTotalElements(res.totalElements);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setLoadError(err?.response?.data?.message || "Failed to load payment ledger");
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [status, gateway, resourceType, orderIdSearch, createdFrom, createdTo, page]);

  const handleCopyOrderId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    toast.success("Order ID copied to clipboard");
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const handleResetFilters = () => {
    setStatus("");
    setGateway("");
    setResourceType("");
    setOrderIdSearch("");
    setCreatedFrom("");
    setCreatedTo("");
    setPage(0);
  };

  const hasActiveFilters = Boolean(
    status || gateway || resourceType || orderIdSearch.trim() || createdFrom || createdTo
  );

  return (
    <div className="flex w-full flex-col h-full space-y-4 pb-6">
      {/* Top Segmented Status Pill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-full border border-slate-200/80 bg-white/80 p-1 shadow-[0_2px_8px_rgba(20,20,43,0.04)] backdrop-blur-md">
          {STATUS_FILTERS.map((tab) => {
            const isSelected = tab.id === "ALL" ? status === "" : status === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatus(tab.id === "ALL" ? "" : tab.id);
                  setPage(0);
                }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-[#14142b] text-white shadow-xs"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#14142b]"
                }`}
              >
                {tab.label}
                {tab.id === "ALL" && totalElements > 0 && (
                  <span className="ml-1.5 opacity-70 font-normal">({totalElements})</span>
                )}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <RotateCcw size={12} />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search Input */}
        <div className="relative min-w-[220px] flex-1 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search Order ID…"
            value={orderIdSearch}
            onChange={(e) => {
              setOrderIdSearch(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-xl border border-slate-200/90 bg-white py-2 pl-9 pr-8 text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
          />
          {orderIdSearch && (
            <button
              type="button"
              onClick={() => {
                setOrderIdSearch("");
                setPage(0);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Custom Gateway Dropdown Popover */}
        <div className="relative" ref={gatewayRef}>
          <button
            type="button"
            onClick={() => {
              setGatewayOpen((prev) => !prev);
              setResourceOpen(false);
              setDateRangeOpen(false);
            }}
            className={`inline-flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2 text-xs font-semibold shadow-2xs transition-all ${
              gatewayOpen || gateway
                ? "border-slate-400 ring-2 ring-slate-100 text-slate-900"
                : "border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <CreditCard size={13} className={gateway ? "text-indigo-600" : "text-slate-400"} />
            <span>{GATEWAYS.find((g) => g.id === gateway)?.label || "All Gateways"}</span>
            <ChevronDown
              size={13}
              className={`text-slate-400 transition-transform duration-200 ${
                gatewayOpen ? "rotate-180 text-slate-700" : ""
              }`}
            />
          </button>

          {gatewayOpen && (
            <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[180px] rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-[0_12px_30px_rgba(20,20,43,0.12)] backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-100">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Payment Gateway
              </div>
              <div className="space-y-0.5">
                {GATEWAYS.map((option) => {
                  const isSelected = gateway === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setGateway(option.id);
                        setGatewayOpen(false);
                        setPage(0);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        isSelected
                          ? "bg-slate-100 text-slate-900 font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check size={13} className="text-slate-900 stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Custom Resource Dropdown Popover */}
        <div className="relative" ref={resourceRef}>
          <button
            type="button"
            onClick={() => {
              setResourceOpen((prev) => !prev);
              setGatewayOpen(false);
              setDateRangeOpen(false);
            }}
            className={`inline-flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2 text-xs font-semibold shadow-2xs transition-all ${
              resourceOpen || resourceType
                ? "border-slate-400 ring-2 ring-slate-100 text-slate-900"
                : "border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <Layers size={13} className={resourceType ? "text-indigo-600" : "text-slate-400"} />
            <span>{RESOURCE_TYPES.find((r) => r.id === resourceType)?.label || "All Resources"}</span>
            <ChevronDown
              size={13}
              className={`text-slate-400 transition-transform duration-200 ${
                resourceOpen ? "rotate-180 text-slate-700" : ""
              }`}
            />
          </button>

          {resourceOpen && (
            <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[180px] rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-[0_12px_30px_rgba(20,20,43,0.12)] backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-100">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Resource Type
              </div>
              <div className="space-y-0.5">
                {RESOURCE_TYPES.map((option) => {
                  const isSelected = resourceType === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setResourceType(option.id as "COURSE" | "EVENT" | "");
                        setResourceOpen(false);
                        setPage(0);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        isSelected
                          ? "bg-slate-100 text-slate-900 font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check size={13} className="text-slate-900 stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Custom Date Range Popover */}
        <div className="relative" ref={dateRangeRef}>
          <button
            type="button"
            onClick={() => {
              setDateRangeOpen((prev) => !prev);
              setGatewayOpen(false);
              setResourceOpen(false);
            }}
            className={`inline-flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2 text-xs font-semibold shadow-2xs transition-all ${
              dateRangeOpen || createdFrom || createdTo
                ? "border-slate-400 ring-2 ring-slate-100 text-slate-900"
                : "border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <Calendar size={13} className={createdFrom || createdTo ? "text-indigo-600" : "text-slate-400"} />
            <span>
              {createdFrom || createdTo
                ? `${createdFrom || "Start"} → ${createdTo || "End"}`
                : "Date Range"}
            </span>
            <ChevronDown
              size={13}
              className={`text-slate-400 transition-transform duration-200 ${
                dateRangeOpen ? "rotate-180 text-slate-700" : ""
              }`}
            />
          </button>

          {dateRangeOpen && (
            <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[280px] rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-[0_12px_30px_rgba(20,20,43,0.12)] backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-100">
              <div className="text-[11px] font-bold text-slate-900 mb-2.5">Filter by Created Date</div>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10.5px] font-semibold text-slate-500 mb-1">From Date</label>
                  <input
                    type="date"
                    value={createdFrom}
                    onChange={(e) => {
                      setCreatedFrom(e.target.value);
                      setPage(0);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-semibold text-slate-500 mb-1">To Date</label>
                  <input
                    type="date"
                    value={createdTo}
                    onChange={(e) => {
                      setCreatedTo(e.target.value);
                      setPage(0);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setCreatedFrom("");
                    setCreatedTo("");
                    setPage(0);
                  }}
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-800"
                >
                  Clear dates
                </button>
                <button
                  type="button"
                  onClick={() => setDateRangeOpen(false)}
                  className="rounded-lg bg-[#14142b] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#232735]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enterprise Data Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-4px_rgba(20,20,43,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-6 font-semibold w-[18%]">Order ID</th>
                <th className="py-3.5 px-4 font-semibold w-[22%]">Learner</th>
                <th className="py-3.5 px-4 font-semibold w-[20%]">Resource</th>
                <th className="py-3.5 px-4 font-semibold w-[12%]">Amount</th>
                <th className="py-3.5 px-4 font-semibold w-[12%]">Gateway</th>
                <th className="py-3.5 px-4 font-semibold w-[10%]">Status</th>
                <th className="py-3.5 px-6 font-semibold text-right w-[6%]">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="size-6 animate-spin text-[#14142b]" />
                      <span className="text-xs font-semibold text-slate-500">Loading payment ledger…</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && loadError && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-rose-500">
                    <p className="text-xs font-semibold">{loadError}</p>
                  </td>
                </tr>
              )}
              {!loading && !loadError && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <Receipt size={22} />
                      </div>
                      <p className="text-sm font-bold text-slate-800">No payments found</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        {hasActiveFilters
                          ? "No transactions match your currently applied search or filter criteria."
                          : "Platform payment transactions and enrollments will appear here once processed."}
                      </p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="mt-1 rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                          Reset all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                !loadError &&
                rows.map((row) => (
                  <tr key={row.paymentOrderId} className="hover:bg-slate-50/80 transition-all duration-150">
                    {/* Order ID with Copy Chip */}
                    <td className="py-4 px-6">
                      <button
                        type="button"
                        onClick={(e) => handleCopyOrderId(row.paymentOrderId, e)}
                        className="group inline-flex items-center gap-1.5 rounded-lg bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/80 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-700 transition-colors shadow-2xs"
                        title="Click to copy full Order ID"
                      >
                        <span>{row.paymentOrderId.slice(0, 10)}…</span>
                        {copiedOrderId === row.paymentOrderId ? (
                          <CheckCheck size={12} className="text-emerald-600 shrink-0" />
                        ) : (
                          <Copy size={11} className="text-slate-400 group-hover:text-slate-700 shrink-0" />
                        )}
                      </button>
                    </td>

                    {/* Learner / User Profile */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5 min-w-0 max-w-[200px]">
                        <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-tr from-slate-100 to-slate-200/90 text-slate-800 font-bold text-xs border border-slate-200/80 shrink-0 shadow-2xs">
                          {(row.userName || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 truncate">
                          <p className="truncate font-bold text-xs text-slate-900">{row.userName || "—"}</p>
                          <p className="truncate text-[10.5px] text-slate-400 font-mono">{row.userEmail}</p>
                        </div>
                      </div>
                    </td>

                    {/* Resource & Type */}
                    <td className="py-4 px-4">
                      <div className="max-w-[190px]">
                        <p className="truncate text-xs font-bold text-slate-800" title={row.resourceTitle}>
                          {row.resourceTitle || "—"}
                        </p>
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100/90 border border-slate-200/80 px-1.5 py-0.2 text-[10px] font-bold uppercase text-slate-600 mt-0.5">
                          {row.resourceType === "COURSE" ? <BookOpen size={9} /> : <Calendar size={9} />}
                          {row.resourceType}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-xs text-[#14142b] tracking-tight">
                        {formatMoney(row.amount, row.currency)}
                      </span>
                    </td>

                    {/* Gateway Badge */}
                    <td className="py-4 px-4">
                      <GatewayBadge gateway={row.gateway} />
                    </td>

                    {/* Status Live Pill */}
                    <td className="py-4 px-4">
                      <StatusBadge status={row.status} />
                    </td>

                    {/* Created Date */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium justify-end">
                        <Calendar size={12} className="text-slate-400 shrink-0" />
                        <span>
                          {new Date(row.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-5 py-3 text-xs text-slate-500 shadow-2xs">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-2xs"
          >
            <ChevronLeft size={13} /> Previous
          </button>
          <span className="text-xs font-medium text-slate-600">
            Page <span className="font-bold text-slate-900">{page + 1}</span> of{" "}
            <span className="font-bold text-slate-900">{totalPages}</span>
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-2xs"
          >
            Next <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
