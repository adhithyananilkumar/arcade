"use client";

import Link from "next/link";
import { Send, Pencil, Eye, Flag } from "lucide-react";
import { WorkspaceRow, WorkspaceRows } from "@/apps/creator/studio/core/StudioWorkspaceKit";
import { ReviewPathPanel, type ReviewResponse, type ReviewPathPreview } from "@/domains/publishing";
import { ActivitySection, type TimelineEntry } from "./ActivitySection";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function WorkflowStepper({ statusKey, reviewStatus }: { statusKey?: string; reviewStatus?: string | null }) {
  const isPublished = statusKey === "PUBLISHED";
  const isReview = reviewStatus === "OPEN" || reviewStatus === "CHANGES_REQUESTED";
  const isDraft = !isPublished && !isReview;

  return (
    <div className="flex w-full items-center py-2">
      <div className="flex items-center gap-16 sm:gap-28 relative max-w-md w-full justify-between">
        {/* Connecting dashed line behind circles */}
        <div className="absolute top-5 left-8 right-8 h-0 border-b-2 border-dashed border-slate-200 z-0" />

        {/* Step 1: Draft */}
        <div className="flex flex-col items-center gap-2 z-10">
          <div
            className={`flex size-11 items-center justify-center rounded-full transition-all ${
              isDraft
                ? "bg-blue-50 text-blue-600 border-2 border-blue-600 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-500 shadow-2xs"
                : "bg-surface text-slate-400 border border-slate-200"
            }`}
          >
            <Pencil size={18} className={isDraft ? "text-blue-600 dark:text-blue-400" : "text-slate-400"} />
          </div>
          <span className={`text-xs font-extrabold ${isDraft ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>
            Draft
          </span>
        </div>

        {/* Step 2: Review */}
        <div className="flex flex-col items-center gap-2 z-10">
          <div
            className={`flex size-11 items-center justify-center rounded-full transition-all ${
              isReview
                ? "bg-blue-600 text-white border-2 border-blue-600 shadow-2xs"
                : "bg-surface text-slate-400 border border-slate-200"
            }`}
          >
            <Eye size={18} className={isReview ? "text-white" : "text-slate-400"} />
          </div>
          <span className={`text-xs font-extrabold ${isReview ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>
            Review
          </span>
        </div>

        {/* Step 3: Published */}
        <div className="flex flex-col items-center gap-2 z-10">
          <div
            className={`flex size-11 items-center justify-center rounded-full transition-all ${
              isPublished
                ? "bg-emerald-600 text-white border-2 border-emerald-600 shadow-2xs"
                : "bg-surface text-slate-400 border border-slate-200"
            }`}
          >
            <Flag size={18} className={isPublished ? "text-white" : "text-slate-400"} />
          </div>
          <span className={`text-xs font-extrabold ${isPublished ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
            Published
          </span>
        </div>
      </div>
    </div>
  );
}

export function PublishingWorkflow({
  status,
  review,
  editHref,
  onSubmit,
  submitting,
  historyEntries,
  reviewPath,
  reviewPathLoading,
  reviewPathError,
}: {
  status: string;
  review?: ReviewResponse | null;
  editHref: string;
  onSubmit?: () => void;
  submitting?: boolean;
  historyEntries?: TimelineEntry[];
  reviewPath?: ReviewPathPreview | null;
  reviewPathLoading?: boolean;
  reviewPathError?: string | null;
}) {
  const statusKey = status?.toUpperCase();
  const blocked = (reviewPath?.blockingProblems?.length ?? 0) > 0;
  const submitLabel = reviewPath?.directPublication ? "Publish" : "Submit for Review";

  const chip = "inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold";

  return (
    <WorkspaceRows>
      <WorkspaceRow step={1} title="Where it stands" description="Content goes from draft, through platform review, to published." wide>
        <WorkflowStepper statusKey={statusKey} reviewStatus={review?.status} />
      </WorkspaceRow>

      <WorkspaceRow step={2} title="Next step" description="What happens now, and what you can do about it.">
        <div className="flex flex-col items-start gap-3">
          {review?.status === "OPEN" ? (
            <>
              <span className={`${chip} border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-400`}>In review</span>
              <p className="text-xs leading-relaxed text-slate-500">
                Submitted on {formatDate(review.currentRoundDetail?.submittedAt)} &bull; Review round #{review.currentRound}
              </p>
              <p className="text-sm font-medium text-slate-600">Awaiting a reviewer decision. You will be notified here once it is reviewed.</p>
            </>
          ) : review?.status === "CHANGES_REQUESTED" ? (
            <>
              <span className={`${chip} border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-400`}>Changes requested</span>
              {review.currentRoundDetail?.decisionReason && (
                <p className="w-full rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                  {review.currentRoundDetail.decisionReason}
                </p>
              )}
              <Link
                href={editHref}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-xs font-extrabold text-on-ink shadow-md transition-colors hover:bg-[#205ca8]"
              >
                <Pencil size={14} /> Continue editing
              </Link>
            </>
          ) : statusKey === "PUBLISHED" ? (
            <>
              <span className={`${chip} border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400`}>Published</span>
              <p className="text-sm font-medium text-slate-600">This is live and available to learners. Later edits reach them after the next approval.</p>
            </>
          ) : (
            <>
              <span className={`${chip} border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-400`}>Draft</span>
              <p className="text-sm font-medium text-slate-600">This has not been submitted for platform review yet.</p>

              {reviewPath && (
                <div className="w-full text-left">
                  <ReviewPathPanel preview={reviewPath} loading={reviewPathLoading} error={reviewPathError} />
                </div>
              )}
              {!reviewPath && reviewPathError && <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{reviewPathError}</p>}

              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting || blocked || reviewPathLoading}
                className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-full bg-blue-600 px-7 py-3 text-xs font-extrabold text-white shadow-md transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={14} /> {submitting ? "Submitting…" : submitLabel}
              </button>
            </>
          )}
        </div>
      </WorkspaceRow>

      <WorkspaceRow step={3} title="Publishing history" description="Every submission, decision and release." wide>
        {historyEntries && historyEntries.length > 0 ? (
          <ActivitySection entries={historyEntries} hideBadges />
        ) : (
          <p className="text-xs font-medium text-slate-500">No publishing history yet — this is still a draft that has not entered review.</p>
        )}
      </WorkspaceRow>
    </WorkspaceRows>
  );
}
