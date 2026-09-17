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
import { 
  ClipboardCheck, 
  Inbox, 
  Search, 
  ChevronRight, 
  ChevronLeft,
  Calendar, 
  BookOpen, 
  User, 
  Sparkles,
  RefreshCw,
  X
} from "lucide-react";

function StatusBadge({ status }: { status: ReviewStatus }) {
  const map: Record<ReviewStatus, { badge: string; dot: string }> = {
    OPEN: { badge: "bg-amber-50 text-amber-700 border-amber-200/80", dot: "bg-amber-500 animate-pulse" },
    CHANGES_REQUESTED: { badge: "bg-orange-50 text-orange-700 border-orange-200/80", dot: "bg-orange-500" },
    COMPLETED: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80", dot: "bg-emerald-500" },
    CANCELLED: { badge: "bg-slate-100 text-slate-500 border-slate-200/80", dot: "bg-slate-400" },
  };
  const config = map[status] || { badge: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${config.badge}`}
    >
      <span className={`size-1.5 rounded-full ${config.dot}`} />
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
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const counts = useMemo(() => {
    let open = 0;
    let toBeReviewed = 0;
    let updations = 0;
    let changes = 0;
    let completed = 0;

    items.forEach((i) => {
      if (i.status === "OPEN") {
        open++;
        if (i.hasPreviousPublication) updations++;
        else toBeReviewed++;
      } else if (i.status === "CHANGES_REQUESTED") {
        changes++;
      } else if (i.status === "COMPLETED") {
        completed++;
      }
    });
    return { open, toBeReviewed, updations, changes, completed, total: items.length };
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

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const fetchReviews = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const TABS = [
    { id: "OPEN", label: "Open", count: counts.open },
    { id: "TO_BE_REVIEWED", label: "First Publish", count: counts.toBeReviewed },
    { id: "UPDATIONS", label: "Updates", count: counts.updations },
    { id: "CHANGES", label: "Changes Requested", count: counts.changes },
    { id: "COMPLETED", label: "Completed", count: counts.completed },
    { id: "ALL", label: "All Reviews", count: counts.total },
  ];

  return (
    <div className="flex w-full flex-col h-full space-y-4 pb-6">
      {/* Top Standard Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Segmented Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white p-1 shadow-2xs">
          {TABS.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#14142b] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Refresh Actions */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search title, author, channel..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200/90 bg-white py-1.5 pl-8 pr-7 text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={fetchReviews}
            title="Refresh reviews"
            className="flex size-8 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 shadow-2xs transition-colors"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-slate-800" : ""} />
          </button>
        </div>
      </div>

      {loadError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
          {loadError}
        </div>
      )}

      {/* Main Table View */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white py-20 text-center shadow-2xs">
          <div className="flex flex-col items-center justify-center gap-2.5">
            <div className="size-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
            <span className="text-xs font-medium text-slate-500">Loading reviews queue...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white py-16 text-center shadow-2xs">
          <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Inbox size={22} />
            </div>
            <p className="text-sm font-bold text-slate-800">No reviews found</p>
            <p className="text-xs text-slate-500">
              {searchQuery
                ? "No reviews match your current search query."
                : "No content submissions awaiting review in this view."}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-4px_rgba(20,20,43,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-6 font-semibold w-[34%]">Content Title</th>
                  <th className="py-3.5 px-4 font-semibold w-[14%]">Type</th>
                  <th className="py-3.5 px-4 font-semibold w-[22%]">Author / Channel</th>
                  <th className="py-3.5 px-4 font-semibold w-[14%]">Submitted</th>
                  <th className="py-3.5 px-4 font-semibold w-[10%]">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right w-[6%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginated.map((item) => {
                  const authorInitial = (item.ownerName || item.ownerUsername || 'A').charAt(0).toUpperCase();

                  return (
                    <tr
                      key={item.id}
                      className="group hover:bg-slate-50/80 transition-all duration-150"
                    >
                      {/* Title Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-100/70 text-indigo-600 overflow-hidden shrink-0 border border-indigo-200/50 shadow-2xs font-bold text-sm group-hover:scale-105 group-hover:border-indigo-300 transition-all">
                            <BookOpen size={17} className="text-indigo-600" />
                          </div>
                          <div className="min-w-0 max-w-[280px]">
                            <p className="truncate text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                              {item.title}
                            </p>
                            <p className="truncate text-[11px] text-slate-400 font-normal mt-0.5">
                              Round {item.reviewRound}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                            {item.contentType}
                          </span>
                          {item.hasPreviousPublication && item.status === "OPEN" && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 border border-orange-200 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">
                              <Sparkles size={10} /> Update
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Author / Channel */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5 min-w-0 max-w-[210px]">
                          <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-tr from-slate-100 to-slate-200/90 text-slate-700 font-bold text-[11px] border border-slate-200/80 shrink-0">
                            {authorInitial}
                          </div>
                          <div className="min-w-0 truncate">
                            <p className="truncate font-semibold text-xs text-slate-800">
                              {item.ownerUsername ? `@${item.ownerUsername}` : item.ownerName || 'Unknown'}
                            </p>
                            <p className="truncate text-[10.5px] text-slate-400 font-normal">
                              {item.channelName || 'Direct'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <Calendar size={12} className="text-slate-400 shrink-0" />
                          <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <Link
                          href={detailHref(item)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#14142b] hover:bg-[#232735] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          <ClipboardCheck size={13} className="text-emerald-400" />
                          <span>Review</span>
                          <ChevronRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clean Footer Pagination */}
      {filtered.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 shadow-2xs">
          <div>
            Showing <span className="font-semibold text-slate-800">{(page - 1) * pageSize + 1}</span>–
            <span className="font-semibold text-slate-800">
              {Math.min(page * pageSize, filtered.length)}
            </span>{" "}
            of <span className="font-semibold text-slate-800">{filtered.length}</span> reviews
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={13} />
                <span>Prev</span>
              </button>

              <span className="px-2 font-medium text-slate-700">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
