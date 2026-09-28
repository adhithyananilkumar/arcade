"use client";

// A channel's own review queue — the organization stage of the review pipeline. Content its
// creators submit is reviewed here by the channel's reviewers first. Only what this organization
// approves AND whose review policy requires platform review moves on to the platform queue in the
// Console; a channel whose policy publishes on its own approval never reaches the platform.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Inbox, Loader2, RefreshCw } from "lucide-react";
import {
  platformReviewApi,
  type ReviewCounts,
  type ReviewQueueItem,
  type ReviewStatus,
} from "@/domains/publishing";

type Tab = { id: string; label: string; status?: ReviewStatus; count?: (c: ReviewCounts) => number };

const TABS: Tab[] = [
  { id: "open", label: "Open", status: "OPEN", count: (c) => c.open },
  { id: "changes", label: "Changes requested", status: "CHANGES_REQUESTED", count: (c) => c.changesRequested },
  { id: "completed", label: "Completed", status: "COMPLETED", count: (c) => c.completed },
  { id: "all", label: "All" },
];

const STATUS_STYLE: Record<string, string> = {
  OPEN: "border-amber-200 bg-amber-50 text-amber-800",
  CHANGES_REQUESTED: "border-rose-200 bg-rose-50 text-rose-700",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function ChannelReviewQueue({ channelId }: { channelId: string }) {
  const [tab, setTab] = useState<Tab>(TABS[0]);
  const [items, setItems] = useState<ReviewQueueItem[] | null>(null);
  const [counts, setCounts] = useState<ReviewCounts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => {
    setItems(null);
    setNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      platformReviewApi.list({ channelId, status: tab.status, size: 100 }),
      platformReviewApi.counts(channelId),
    ])
      .then(([list, c]) => {
        if (cancelled) return;
        setItems(list);
        setCounts(c);
        setError(null);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Could not load reviews."));
    return () => {
      cancelled = true;
    };
  }, [channelId, tab, nonce]);

  return (
    // The page title and description belong to the host page's header; this renders the queue only.
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setItems(null);
              setTab(t);
            }}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors ${
              tab.id === t.id ? "bg-[#14142b] text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.label}
            {counts && t.count && (
              <span
                className={`rounded-full px-1.5 text-[10px] font-bold tabular-nums ${
                  tab.id === t.id ? "bg-white/20" : "bg-slate-100 text-slate-600"
                }`}
              >
                {t.count(counts)}
              </span>
            )}
          </button>
        ))}
        <button
          type="button"
          onClick={refresh}
          className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-700">{error}</p>
      ) : items === null ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-slate-400" size={22} />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
          <Inbox size={26} className="text-slate-300" />
          <p className="text-[14px] font-semibold text-[#14142b]">Nothing here</p>
          <p className="text-[12px] font-medium text-slate-500">Submissions from this channel&apos;s creators appear here.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/channels/${channelId}/manage/reviews/${item.id}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-[#14142b]">{item.title}</p>
                  <p className="text-[12px] font-medium text-slate-500">
                    {item.contentType} · {item.submissionKind === "FIRST_PUBLICATION" ? "First publish" : "Update"} · round{" "}
                    {item.round} · @{item.ownerUsername ?? item.ownerName}
                  </p>
                </div>
                <span className="hidden text-[12px] font-medium text-slate-400 sm:block">
                  {new Date(item.submittedAt).toLocaleDateString()}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    STATUS_STYLE[item.status] ?? "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  {item.status.replace("_", " ")}
                </span>
                <ChevronRight size={16} className="text-slate-300" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
