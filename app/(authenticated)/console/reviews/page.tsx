"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import { AuthorizationService } from "@/infrastructure/auth/authorization.service";
import {
  platformReviewApi,
  type ReviewQueueItem,
  type ReviewStage,
  type ReviewStatus,
  type ReviewCounts,
} from "@/domains/publishing";
import { ClipboardCheck, Inbox, Search, ChevronRight, Building2, Globe2 } from "lucide-react";

function StatusBadge({ status }: { status: ReviewStatus }) {
  const map: Record<ReviewStatus, string> = {
    OPEN: "bg-amber-50 text-amber-700 border-amber-200",
    CHANGES_REQUESTED: "bg-orange-50 text-orange-700 border-orange-200",
    REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
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

/**
 * Which gate this submission is at.
 *
 * Replaces the old implicit tier badge. A reviewer scanning the queue needs to know at a glance
 * whether a row is waiting on its own organization or on the platform, because those are different
 * people with different authority — and a channel reviewer seeing a platform-stage row would
 * otherwise wonder why they cannot act on it.
 */
function StageBadge({ stage }: { stage: ReviewStage }) {
  const isOrg = stage === "ORG_REVIEW";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
        isOrg
          ? "border-sky-200 bg-sky-50 text-sky-700"
          : "border-violet-200 bg-violet-50 text-violet-700"
      }`}
    >
      {isOrg ? <Building2 size={10} /> : <Globe2 size={10} />}
      {isOrg ? "Org" : "Platform"}
    </span>
  );
}

function detailHref(item: ReviewQueueItem): string {
  return `/console/reviews/${item.id}`;
}

type QueueFilterId = "OPEN" | "ORG" | "PLATFORM" | "CHANGES" | "COMPLETED" | "ALL";

export default function PlatformReviewsPage() {
  const { user } = useAuthStore();
  if (!AuthorizationService.canReviewContent(user)) {
    notFound();
  }

  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [counts, setCounts] = useState<ReviewCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<QueueFilterId>("OPEN");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadError(null);
    // Counts come from the database rather than from counting the fetched page, so the tiles stay
    // correct once the queue is paginated beyond one page.
    Promise.all([platformReviewApi.list({ size: 100 }), platformReviewApi.counts()])
      .then(([queue, queueCounts]) => {
        setItems(queue);
        setCounts(queueCounts);
      })
      .catch((err) => {
        console.error(err);
        setItems([]);
        setLoadError(
          "Failed to load reviews. Check that the API is reachable and you still hold review authority."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (filter === "OPEN" && i.status !== "OPEN") return false;
      if (filter === "ORG" && (i.status !== "OPEN" || i.stage !== "ORG_REVIEW")) return false;
      if (filter === "PLATFORM" && (i.status !== "OPEN" || i.stage !== "PLATFORM_REVIEW"))
        return false;
      if (filter === "CHANGES" && i.status !== "CHANGES_REQUESTED" && i.status !== "REJECTED")
        return false;
      if (filter === "COMPLETED" && i.status !== "COMPLETED") return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const haystack = [i.title, i.ownerName, i.channelName, i.contentType]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [items, searchQuery, filter]);

  const kpis: { id: QueueFilterId; label: string; value: number }[] = [
    { id: "ORG", label: "Org stage", value: counts?.orgStage ?? 0 },
    { id: "PLATFORM", label: "Platform stage", value: counts?.platformStage ?? 0 },
    { id: "COMPLETED", label: "Completed", value: counts?.completed ?? 0 },
  ];

  return (
    <div className="flex h-full w-full flex-col space-y-5 pb-6">
      <div className="grid flex-none grid-cols-3 gap-2 sm:gap-3">
        {kpis.map((kpi) => {
          const active = filter === kpi.id;
          return (
            <button
              key={kpi.id}
              type="button"
              onClick={() => setFilter(kpi.id)}
              aria-pressed={active}
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

      <div className="flex flex-none flex-col gap-2 sm:flex-row sm:items-center">
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
              { id: "CHANGES", label: "Returned" },
              { id: "COMPLETED", label: "Done" },
              { id: "ALL", label: "All" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                filter === f.id
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
        <div className="min-h-0 flex-1 overflow-y-auto pb-12 pr-2">
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
                    {item.status === "OPEN" ? <StageBadge stage={item.stage} /> : null}
                    {item.submissionKind === "UPDATE" && item.status === "OPEN" ? (
                      <span className="text-[10px] font-bold text-[#FF6B4A]">Update</span>
                    ) : null}
                    {item.platformReviewBypassed ? (
                      <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                        Platform waived
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-1 truncate text-[14px] font-bold text-[#14142b]">{item.title}</p>

                  <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">
                    {item.channelId && item.channelName ? (
                      <Link
                        href={`/channels/${item.channelId}`}
                        className="font-semibold hover:text-blue-600 hover:underline"
                      >
                        {item.channelName}
                      </Link>
                    ) : (
                      "—"
                    )}{" "}
                    ·{" "}
                    {item.ownerUsername ? (
                      <Link
                        href={`/${item.ownerUsername}`}
                        className="font-semibold hover:text-blue-600 hover:underline"
                      >
                        @{item.ownerUsername}
                      </Link>
                    ) : (
                      item.ownerName || "—"
                    )}{" "}
                    {/* The version is what a reviewer actually decides on, so it belongs in the
                        queue row rather than only on the detail page. */}
                    {item.versionNumber != null ? `· v${item.versionNumber} ` : ""}· R{item.round} ·{" "}
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
        </div>
      )}
    </div>
  );
}
