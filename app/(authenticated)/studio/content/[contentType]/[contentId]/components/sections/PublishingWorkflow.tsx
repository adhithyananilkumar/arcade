"use client";

import Link from "next/link";
import { Send, Pencil, Eye, Flag, Clock } from "lucide-react";
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
    <div className="flex items-center justify-center py-4 sm:py-6 w-full">
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

function DocumentDraftIllustration() {
  return (
    <div className="relative flex items-center justify-center size-32 shrink-0">
      {/* Background soft circular aura */}
      <div className="absolute inset-0 bg-blue-50/70 dark:bg-blue-950/40 rounded-full blur-2xs scale-95" />

      {/* Document page with lines */}
      <div className="relative w-20 h-24 bg-surface rounded-2xl border border-blue-100/90 dark:border-blue-900/50 shadow-[0_8px_24px_rgba(32,92,168,0.08)] flex flex-col p-3 gap-2">
        <div className="w-10 h-2 bg-blue-100 dark:bg-blue-950 rounded-full" />
        <div className="w-14 h-1.5 bg-slate-100 rounded-full" />
        <div className="w-12 h-1.5 bg-slate-100 rounded-full" />
        <div className="w-8 h-1.5 bg-slate-100 rounded-full" />

        {/* Diagonal Blue Pencil Writing on Paper */}
        <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-xl shadow-md rotate-12 flex items-center justify-center">
          <Pencil size={15} />
        </div>
      </div>
    </div>
  );
}

function EmptyPublishingHistory() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center w-full">
      {/* Graphic center container with blue circular aura */}
      <div className="relative flex items-center justify-center size-32 mb-2">
        {/* Soft circular aura background */}
        <div className="absolute size-24 bg-blue-50/80 rounded-full dark:bg-blue-500/10" />

        {/* Curving dashed line SVG sweeping behind */}
        <svg className="absolute inset-0 size-full overflow-visible pointer-events-none" viewBox="0 0 100 100">
          <path
            d="M 12 58 C 22 28, 78 28, 88 64"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </svg>

        {/* Paper Document scroll with Clock icon badge */}
        <div className="relative w-14 h-16 bg-surface rounded-xl border border-blue-100 flex flex-col p-2.5 gap-1.5 shadow-2xs dark:border-blue-500/25">
          <div className="w-8 h-1.5 bg-blue-100 dark:bg-blue-950 rounded-full" />
          <div className="w-9 h-1 bg-slate-100 rounded-full" />
          <div className="w-6 h-1 bg-slate-100 rounded-full" />

          {/* Blue Clock Badge */}
          <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full border-2 border-surface shadow-xs">
            <Clock size={13} />
          </div>
        </div>
      </div>

      <h4 className="text-base font-extrabold text-slate-900">No publishing history yet</h4>
      <p className="text-xs font-medium text-slate-500 max-w-sm mt-1 leading-relaxed">
        This content is still in draft and has not entered the platform review process.
      </p>
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

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto py-2">
      {/* 1. Top Workflow Stepper (Draft -> Review -> Published) */}
      <WorkflowStepper statusKey={statusKey} reviewStatus={review?.status} />

      {/* 2. Main Workflow Action Card (Illustration + Vertical Divider + Details + Submit Button) */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 rounded-3xl border border-slate-200/80 bg-surface/95 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-md">
        <DocumentDraftIllustration />

        {/* Subtle vertical separator line matching mockup */}
        <div className="w-px bg-slate-200/80 self-stretch my-2 hidden sm:block" />

        <div className="flex flex-col gap-3 flex-1 text-center sm:text-left items-center sm:items-start">
          {review?.status === "OPEN" ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 text-xs font-extrabold dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800">
                In Review
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Submitted on {formatDate(review.currentRoundDetail?.submittedAt)} &bull; Review round #{review.currentRound}
              </p>
              <p className="text-xs font-medium text-slate-600">
                Awaiting a reviewer decision. You will be notified here once it is reviewed.
              </p>
            </>
          ) : review?.status === "CHANGES_REQUESTED" ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 text-xs font-extrabold dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800">
                Changes Requested
              </span>
              {review.currentRoundDetail?.decisionReason && (
                <p className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 font-medium dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
                  {review.currentRoundDetail.decisionReason}
                </p>
              )}
              <Link
                href={editHref}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-bold text-on-ink hover:bg-blue-600 transition-colors shadow-sm"
              >
                <Pencil size={14} /> Continue Editing
              </Link>
            </>
          ) : statusKey === "PUBLISHED" ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-extrabold dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800">
                Published
              </span>
              <p className="text-xs font-medium text-slate-600">
                This course is live and accessible to enrolled learners on the platform.
              </p>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#FFF3E0] text-[#E65100] dark:bg-amber-950/60 dark:text-amber-400 font-extrabold px-3 py-1 text-xs">
                Draft
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-600">
                This content has not been submitted for platform review.
              </p>

              {reviewPath && (
                <div className="w-full text-left">
                  <ReviewPathPanel
                    preview={reviewPath}
                    loading={reviewPathLoading}
                    error={reviewPathError}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting || blocked || reviewPathLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-xs font-extrabold text-white transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50 mt-1"
              >
                <Send size={14} /> {submitting ? "Submitting…" : submitLabel}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3. Publishing History Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 shrink-0">
            PUBLISHING HISTORY
          </h3>
          <div className="h-px bg-slate-200/80 flex-1" />
        </div>

        {historyEntries && historyEntries.length > 0 ? (
          <ActivitySection entries={historyEntries} hideBadges />
        ) : (
          <EmptyPublishingHistory />
        )}
      </div>
    </div>
  );
}
