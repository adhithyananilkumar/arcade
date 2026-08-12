import Link from "next/link";
import { Send, Pencil } from "lucide-react";
import type { ReviewResponse } from "@/domains/publishing/api/platformReview";
import { ActivitySection, type TimelineEntry } from "./ActivitySection";

const DOT: Record<string, string> = {
  draft: "bg-amber-400",
  review: "bg-orange-400",
  changes: "bg-rose-400",
  published: "bg-emerald-400",
  archived: "bg-slate-400",
};

function StateDot({ tone }: { tone: keyof typeof DOT }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${DOT[tone]}`} />;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Publishing is a workflow view of the existing Platform Review state, not
// a bare status-history table. Everything here comes from data already
// fetched (ReviewResponse + status-history) — no parallel state machine, no
// new backend calls.
export function PublishingWorkflow({
  status,
  review,
  editHref,
  onSubmit,
  submitting,
  historyEntries,
}: {
  status: string;
  review: ReviewResponse | null;
  editHref: string;
  onSubmit: () => void;
  submitting: boolean;
  historyEntries?: TimelineEntry[];
}) {
  const statusKey = status?.toUpperCase();
  const publishedEntry = historyEntries?.find((e) => /publish/i.test(e.title));

  let body: React.ReactNode;

  if (review?.status === "OPEN") {
    body = (
      <>
        <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#14142b]">
          <StateDot tone="review" /> Platform Review
        </p>
        <p className="mb-3 text-xs text-slate-500">
          Submitted {formatDate(review.currentRoundDetail?.submittedAt)} · Review round #{review.currentRound}
        </p>
        <p className="text-xs text-slate-500">Awaiting a reviewer decision. You'll be notified here once it's reviewed.</p>
      </>
    );
  } else if (review?.status === "CHANGES_REQUESTED") {
    body = (
      <>
        <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#14142b]">
          <StateDot tone="changes" /> Changes Requested
        </p>
        {review.currentRoundDetail?.decisionReason && (
          <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {review.currentRoundDetail.decisionReason}
          </p>
        )}
        <Link
          href={editHref}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#14142b] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#232735]"
        >
          <Pencil size={13} /> Continue Editing
        </Link>
      </>
    );
  } else if (statusKey === "PUBLISHED") {
    body = (
      <>
        <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#14142b]">
          <StateDot tone="published" /> Published
        </p>
        <p className="text-xs text-slate-500">Published {formatDate(publishedEntry?.createdAt)}</p>
      </>
    );
  } else if (statusKey === "ARCHIVED") {
    body = (
      <p className="flex items-center gap-2 text-sm font-semibold text-[#14142b]">
        <StateDot tone="archived" /> Archived
      </p>
    );
  } else {
    body = (
      <>
        <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#14142b]">
          <StateDot tone="draft" /> Draft
        </p>
        <p className="mb-3 text-xs text-slate-500">This content has not been submitted for platform review.</p>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#14142b] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#232735] disabled:opacity-60"
        >
          <Send size={13} /> {submitting ? "Submitting…" : "Submit for Review"}
        </button>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_4px_16px_rgba(20,20,43,0.04)]">{body}</div>
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">History</h3>
        <ActivitySection
          entries={historyEntries}
          emptyTitle="No publishing history yet"
          emptyDescription="This content is still in draft and has not entered the platform review process."
        />
      </div>
    </div>
  );
}
