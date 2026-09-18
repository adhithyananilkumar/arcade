"use client";

import { ShieldCheck, ShieldOff, Building2, Globe2, Info } from "lucide-react";
import type { ReviewPolicyView, ReviewStage } from "../api/platformReview";

interface ReviewPolicySummaryProps {
  policy: ReviewPolicyView;
  currentStage: ReviewStage;
  /** True when approving at the current stage publishes rather than escalating. */
  approvalPublishes: boolean;
  compact?: boolean;
}

function GateRow({
  icon,
  label,
  required,
  bypassed,
  detail,
  isCurrent,
}: {
  icon: React.ReactNode;
  label: string;
  required: boolean;
  bypassed: boolean;
  detail?: string | null;
  isCurrent: boolean;
}) {
  const tone = bypassed
    ? "text-slate-500"
    : isCurrent
      ? "text-amber-700"
      : "text-emerald-700";

  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className={`mt-0.5 ${tone}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[#14142b]">{label}</span>
          {bypassed ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
              Bypassed
            </span>
          ) : isCurrent ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
              Current stage
            </span>
          ) : required ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
              Required
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Not applicable
            </span>
          )}
        </div>
        {detail ? (
          <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">{detail}</p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Explains, in the reviewer's own words, why this content is at this stage and what approving
 * will do.
 *
 * Reviewers previously had to infer both from a single "ORG"/"GLOBAL" badge — which said nothing
 * about whether their approval would publish the content or hand it to someone else. Since an
 * approval at the organization stage can legitimately do either (depending on whether a platform
 * exemption applies), that distinction cannot be left implicit.
 *
 * Pure presentational: every value shown comes from the review's frozen policy snapshot, so this
 * keeps matching the review even after an administrator changes the channel's settings.
 */
export function ReviewPolicySummary({
  policy,
  currentStage,
  approvalPublishes,
  compact = false,
}: ReviewPolicySummaryProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white ${compact ? "p-4" : "p-6"} shadow-[0_8px_24px_rgba(20,20,43,0.05)]`}
    >
      <div className="flex items-center gap-2 pb-2">
        <ShieldCheck size={16} className="text-[#14142b]" />
        <h2 className="text-[14px] font-bold text-[#14142b]">Review policy</h2>
      </div>

      <div className="divide-y divide-slate-100">
        <GateRow
          icon={<Building2 size={16} />}
          label="Organization review"
          required={policy.organizationReviewRequired}
          bypassed={policy.organizationReviewBypassed}
          isCurrent={currentStage === "ORG_REVIEW"}
          detail={
            policy.organizationReviewBypassed
              ? policy.bypassExplanation
              : "The content's own organization reviews it internally first."
          }
        />
        <GateRow
          icon={policy.platformReviewBypassed ? <ShieldOff size={16} /> : <Globe2 size={16} />}
          label="Platform review"
          required={policy.platformReviewRequired}
          bypassed={policy.platformReviewBypassed}
          isCurrent={currentStage === "PLATFORM_REVIEW"}
          detail={
            policy.platformReviewBypassed
              ? policy.bypassExplanation
              : "Platform reviewers apply platform-wide standards before publication."
          }
        />
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
        <Info size={14} className="mt-0.5 shrink-0 text-slate-400" />
        <p className="text-[12px] leading-relaxed text-slate-600">
          {approvalPublishes
            ? "Approving at this stage publishes the reviewed version immediately."
            : "Approving at this stage passes the same version to the next gate — it does not publish."}
          {policy.submissionKind === "FIRST_PUBLICATION"
            ? " This is the content's first publication."
            : " This is an update to already-published content."}
        </p>
      </div>
    </section>
  );
}
