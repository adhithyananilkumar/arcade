"use client";

import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  FileCheck,
  Globe2,
  Loader2,
  Rocket,
} from "lucide-react";
import type { ReviewPathPreview } from "../api/platformReview";

interface ReviewPathPanelProps {
  preview: ReviewPathPreview | null;
  loading?: boolean;
  error?: string | null;
  versionNumber?: number | null;
  /** Rendered under the path; the host supplies the actual submit control. */
  children?: React.ReactNode;
}

function Step({
  index,
  icon,
  label,
  state,
  detail,
}: {
  index: number;
  icon: React.ReactNode;
  label: string;
  state: "done" | "required" | "bypassed" | "after";
  detail?: string;
}) {
  const badge = {
    done: { text: "Passed", className: "bg-emerald-100 text-emerald-800" },
    required: { text: "Required", className: "bg-amber-100 text-amber-800" },
    bypassed: { text: "Not required", className: "bg-slate-100 text-slate-600" },
    after: { text: "After approval", className: "bg-slate-100 text-slate-600" },
  }[state];

  return (
    <li className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
        {index}
      </span>
      <span className="mt-0.5 shrink-0 text-slate-500">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-semibold text-[#14142b]">{label}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.className}`}
          >
            {badge.text}
          </span>
        </span>
        {detail ? (
          <span className="mt-0.5 block text-[12px] leading-relaxed text-slate-500">{detail}</span>
        ) : null}
      </span>
    </li>
  );
}

/**
 * Shows an author exactly what will happen when they submit.
 *
 * Every value here is computed by the server from the same resolver and the same validation that
 * submission runs — the component does no reasoning of its own about permissions or policy. That is
 * deliberate: a client that derived "will this need platform review?" from permission codes would be
 * a second implementation of the governance rules, and it would drift.
 */
export function ReviewPathPanel({
  preview,
  loading = false,
  error = null,
  versionNumber,
  children,
}: ReviewPathPanelProps) {
  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6" aria-busy="true">
        <div className="flex items-center gap-2 text-[13px] text-slate-500">
          <Loader2 size={15} className="animate-spin" />
          Working out your review path…
        </div>
      </section>
    );
  }

  if (error || !preview) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-[13px] text-rose-800">
        {error ?? "Could not determine the review path for this content."}
      </section>
    );
  }

  const blocked = preview.blockingProblems.length > 0;

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_24px_rgba(20,20,43,0.05)]">
      <header className="flex flex-wrap items-baseline justify-between gap-2 pb-1">
        <h2 className="text-[15px] font-bold text-[#14142b]">Review &amp; publish</h2>
        {versionNumber != null ? (
          <span className="text-[12px] font-medium text-slate-500">Version {versionNumber}</span>
        ) : null}
      </header>

      <p className="text-[12px] leading-relaxed text-slate-500">{preview.summary}</p>

      <ol className="mt-3 divide-y divide-slate-100">
        <Step
          index={1}
          icon={<FileCheck size={15} />}
          label="Content validation"
          state={blocked ? "required" : "done"}
          detail={
            blocked
              ? "Some items need attention before this can be submitted."
              : "This content is ready to submit."
          }
        />
        <Step
          index={2}
          icon={<Building2 size={15} />}
          label="Organization review"
          state={preview.organizationReviewRequired ? "required" : "bypassed"}
          detail={
            preview.organizationReviewRequired
              ? "Your organization's reviewers will check this first."
              : preview.bypassReasons.includes("ORG_STAGE_NOT_APPLICABLE")
                ? "Personal channels have no organization review stage."
                : preview.bypassReasons.includes("ORG_AUTHOR_EXEMPT")
                  ? "You are exempt from organization review in this channel."
                  : "Your channel does not require organization review."
          }
        />
        <Step
          index={3}
          icon={<Globe2 size={15} />}
          label="Platform review"
          state={preview.platformReviewRequired ? "required" : "bypassed"}
          detail={
            preview.platformReviewRequired
              ? preview.submissionKind === "FIRST_PUBLICATION"
                ? "Platform reviewers check first publications before they go live."
                : "Platform reviewers will check this update before it goes live."
              : "Platform administration has waived platform review for this channel."
          }
        />
        <Step
          index={4}
          icon={<Rocket size={15} />}
          label="Publication"
          state={preview.directPublication ? "required" : "after"}
          detail={
            preview.directPublication
              ? "This will be published as soon as it passes validation."
              : "Your content goes live once the reviews above are approved."
          }
        />
      </ol>

      {blocked ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-amber-900">
            <AlertTriangle size={14} /> Fix these before submitting
          </p>
          <ul className="mt-2 space-y-1">
            {preview.blockingProblems.map((problem) => (
              <li key={problem} className="text-[12px] leading-relaxed text-amber-900">
                • {problem}
              </li>
            ))}
          </ul>
        </div>
      ) : preview.directPublication ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-700" />
          <p className="text-[12px] leading-relaxed text-emerald-900">
            No review is required for this content. It will be versioned and published immediately —
            a permanent record of exactly what went live is still kept.
          </p>
        </div>
      ) : null}

      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
