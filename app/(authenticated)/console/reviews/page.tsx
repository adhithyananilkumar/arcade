"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import { AuthorizationService } from "@/infrastructure/auth/authorization.service";
import {
  platformReviewApi,
  type ReviewQueueItem,
  type ReviewStatus,
} from "@/domains/publishing";
import { ClipboardCheck, Inbox, Search, ChevronRight } from "lucide-react";

function StatusBadge({ status }: { status: ReviewStatus }) {
  const map: Record<ReviewStatus, string> = {
    OPEN: "bg-amber-50 text-amber-700 border-amber-200",
    CHANGES_REQUESTED: "bg-orange-50 text-orange-700 border-orange-200",
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${map[status]}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

function detailHref(item: ReviewQueueItem): string {
  if (item.contentType === "COURSE" && item.supportsPreview) {
    return `/studio/published/${item.contentId}`;
  }
  return `/console/reviews/${item.id}`;
}

export default function PlatformReviewsPage() {
  const { user } = useAuthStore();
  if (!AuthorizationService.canReviewContent(user)) {
    notFound();
  }

  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("OPEN");

  const counts = useMemo(() => {
    let toBeReviewed = 0;
    let updations = 0;
    let completed = 0;
    items.forEach((i) => {
      if (i.status === "OPEN") {
        if (i.hasPreviousPublication) updations++;
        else toBeReviewed++;
      }
      if (i.status === "COMPLETED") completed++;
    });
    return { toBeReviewed, updations, completed };
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (statusFilter === "OPEN" && i.status !== "OPEN") return false;
      if (statusFilter === "TO_BE_REVIEWED" && (i.status !== "OPEN" || i.hasPreviousPublication))
        return false;
      if (statusFilter === "UPDATIONS" && (i.status !== "OPEN" || !i.hasPreviousPublication))
        return false;
      if (statusFilter === "CHANGES" && i.status !== "CHANGES_REQUESTED") return false;
      if (statusFilter === "COMPLETED" && i.status !== "COMPLETED") return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !(i.title || "").toLowerCase().includes(q) &&
          !(i.ownerName || "").toLowerCase().includes(q) &&
          !(i.channelName || "").toLowerCase().includes(q) &&
          !(i.contentType || "").toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [items, searchQuery, statusFilter]);

  useEffect(() => {
    setLoadError(null);
    platformReviewApi
      .list()
      .then(setItems)
      .catch((err) => {
        console.error(err);
        setItems([]);
        setLoadError(
          "Failed to load platform reviews. Check that the API is reachable and you have review permission.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { id: "TO_BE_REVIEWED", label: "First publish", value: counts.toBeReviewed },
    { id: "UPDATIONS", label: "Updates", value: counts.updations },
    { id: "COMPLETED", label: "Completed", value: counts.completed },
  ];

  return (
    <div className="flex w-full flex-col space-y-5">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {kpis.map((kpi) => {
          const active = statusFilter === kpi.id;
          return (
            <button
              key={kpi.id}
              type="button"
              onClick={() => setStatusFilter(kpi.id)}
              className={`rounded-xl border p-3.5 text-left transition-all sm:p-4 ${
                active
                  ? "border-[#14142b] bg-[#14142b] text-white shadow-[0_8px_18px_rgba(20,20,43,0.16)]"
                  : "border-slate-200/80 bg-white/95 hover:border-slate-300"
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-[0.1em] ${
                  active ? "text-white/60" : "text-slate-400"
                }`}
              >
                {kpi.label}
              </span>
              <span
                className={`mt-1 block text-2xl font-bold tabular-nums tracking-tight ${
                  active ? "text-white" : "text-[#14142b]"
                }`}
              >
                {kpi.value}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, owner, channel, type…"
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-[13px] font-medium text-[#14142b] outline-none placeholder:text-slate-400 focus:border-[#14142b]/30 focus:ring-4 focus:ring-slate-200/60"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: "OPEN", label: "Open" },
              { id: "CHANGES", label: "Changes" },
              { id: "COMPLETED", label: "Done" },
              { id: "ALL", label: "All" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                statusFilter === f.id
                  ? "border-[#14142b] bg-[#14142b] text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loadError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-2 border-[#14142b] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 py-16 text-center">
          <Inbox className="mx-auto mb-3 text-slate-300" size={36} />
          <p className="font-semibold text-[#14142b]">No reviews in this filter</p>
          <p className="mt-1 text-sm text-slate-400">Submitted content will appear here.</p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 shadow-[0_4px_16px_rgba(20,20,43,0.04)]">
          {filtered.map((item, i) => (
            <li
              key={item.id}
              className={`flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 ${
                i < filtered.length - 1 ? "border-b border-slate-100" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                    {item.contentType}
                  </span>
                  <StatusBadge status={item.status} />
                  {item.hasPreviousPublication && item.status === "OPEN" && (
                    <span className="text-[10px] font-bold text-[#FF6B4A]">Update</span>
                  )}
                </div>
                <p className="mt-1 truncate text-[14px] font-bold text-[#14142b]">{item.title}</p>
                <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">
                  {item.channelName || "—"} · {item.ownerName || "—"} · R{item.reviewRound} ·{" "}
                  {new Date(item.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <Link
                href={detailHref(item)}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#14142b] px-3.5 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#232735]"
              >
                <ClipboardCheck size={14} />
                Review
                <ChevronRight size={14} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
