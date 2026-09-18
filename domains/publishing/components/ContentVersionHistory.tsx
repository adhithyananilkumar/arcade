"use client";

import {
  CheckCircle2,
  Clock,
  XCircle,
  Archive,
  Radio,
  Eye,
  FileText,
  RotateCcw,
} from "lucide-react";
import type { ContentVersionStatus, ContentVersionSummary } from "../api/platformReview";

interface ContentVersionHistoryProps {
  versions: ContentVersionSummary[];
  loading?: boolean;
  selectedVersionId?: string | null;
  onSelect?: (version: ContentVersionSummary) => void;
  emptyHint?: string;
  /**
   * Offered only for versions that were previously live. Rolling back to something that never
   * published would be publishing unreviewed content under another name, so the affordance is
   * simply absent for those rows rather than shown-and-rejected.
   */
  onRollback?: (version: ContentVersionSummary) => void;
  rollbackDisabledReason?: string | null;
}

const STATUS_STYLE: Record<
  ContentVersionStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-slate-100 text-slate-600",
    icon: <FileText size={12} />,
  },
  SUBMITTED: {
    label: "Submitted",
    className: "bg-blue-50 text-blue-700",
    icon: <Clock size={12} />,
  },
  IN_REVIEW: {
    label: "In review",
    className: "bg-amber-50 text-amber-800",
    icon: <Eye size={12} />,
  },
  APPROVED: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700",
    icon: <CheckCircle2 size={12} />,
  },
  PUBLISHED: {
    label: "Live",
    className: "bg-emerald-100 text-emerald-800",
    icon: <Radio size={12} />,
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-rose-50 text-rose-700",
    icon: <XCircle size={12} />,
  },
  CHANGES_REQUESTED: {
    label: "Changes requested",
    className: "bg-orange-50 text-orange-700",
    icon: <XCircle size={12} />,
  },
  SUPERSEDED: {
    label: "Superseded",
    className: "bg-slate-100 text-slate-500",
    icon: <Archive size={12} />,
  },
  UNPUBLISHED: {
    label: "Unpublished",
    className: "bg-slate-100 text-slate-500",
    icon: <Archive size={12} />,
  },
};

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : null;
}

/**
 * The content's immutable publication artifacts, newest first.
 *
 * Distinct from the editor's version history: this lists the frozen snapshots the review pipeline
 * governs, not the fine-grained document checkpoints an author uses to undo. Both are useful and
 * the product shows both, but conflating them is how "restore version 12" ends up meaning two
 * different things.
 *
 * Every row carries its own lifecycle dates, so a rejected or still-in-review version is as legible
 * as a published one.
 */
export function ContentVersionHistory({
  versions,
  loading = false,
  selectedVersionId,
  onSelect,
  emptyHint = "No versions yet. A version is frozen the moment content is submitted.",
  onRollback,
  rollbackDisabledReason,
}: ContentVersionHistoryProps) {
  if (loading) {
    return (
      <div className="space-y-2" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (versions.length === 0) {
    return <p className="py-8 text-center text-[13px] text-slate-400">{emptyHint}</p>;
  }

  return (
    <ol className="space-y-2">
      {versions.map((v) => {
        const style = STATUS_STYLE[v.status];
        const selected = selectedVersionId === v.id;
        const interactive = Boolean(onSelect);

        return (
          <li key={v.id}>
            <div
              role={interactive ? "button" : undefined}
              tabIndex={interactive ? 0 : undefined}
              onClick={interactive ? () => onSelect?.(v) : undefined}
              onKeyDown={
                interactive
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect?.(v);
                      }
                    }
                  : undefined
              }
              className={`rounded-xl border px-4 py-3 transition-colors ${
                selected
                  ? "border-[#14142b] bg-[#14142b]/[0.03]"
                  : "border-slate-200 bg-white hover:border-slate-300"
              } ${interactive ? "cursor-pointer" : ""}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-[13px] font-bold text-[#14142b]">
                    Version {v.versionNumber}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.className}`}
                  >
                    {style.icon}
                    {style.label}
                  </span>
                  {v.isCurrentlyReviewed ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                      Under review
                    </span>
                  ) : null}
                </div>
              </div>

              {v.label ? (
                <p className="mt-1 truncate text-[12px] text-slate-600">{v.label}</p>
              ) : null}

              {onRollback && (v.status === "SUPERSEDED" || v.status === "UNPUBLISHED") ? (
                <button
                  type="button"
                  disabled={Boolean(rollbackDisabledReason)}
                  title={rollbackDisabledReason ?? undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRollback(v);
                  }}
                  className="mt-2 inline-flex items-center gap-1 rounded-full border border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-[#14142b] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RotateCcw size={11} /> Roll back to this
                </button>
              ) : null}

              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-slate-500">
                {formatDate(v.submittedAt) ? <span>Submitted {formatDate(v.submittedAt)}</span> : null}
                {formatDate(v.approvedAt) ? <span>Approved {formatDate(v.approvedAt)}</span> : null}
                {formatDate(v.publishedAt) ? <span>Published {formatDate(v.publishedAt)}</span> : null}
                {!v.submittedAt && !v.approvedAt && !v.publishedAt && formatDate(v.createdAt) ? (
                  <span>Created {formatDate(v.createdAt)}</span>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
