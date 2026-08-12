import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/shared/design-system/ui/progress";
import type { PublishValidationResponse } from "@/app/(authenticated)/studio/events/types";

// Only ever rendered when a real, computed readiness signal exists (today:
// event's GET /{id}/review). No fabricated percentage — if a type has no
// readiness-capable endpoint, the caller simply doesn't render this card.
export function ReadinessCard({
  readiness,
  continueHref,
}: {
  readiness: PublishValidationResponse;
  continueHref: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_4px_16px_rgba(20,20,43,0.04)]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#14142b]">Content readiness</h2>
        <span className="text-xs font-semibold text-slate-500">
          {readiness.isReady ? "Ready to submit" : `${readiness.issues.length} item${readiness.issues.length === 1 ? "" : "s"} need attention`}
        </span>
      </div>
      <Progress value={readiness.completionPercentage} className="mb-4" />
      {readiness.issues.length > 0 && (
        <ul className="mb-3 flex flex-col gap-1.5">
          {readiness.issues.map((issue, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <AlertCircle size={13} className="mt-0.5 shrink-0 text-amber-500" />
              <span>
                <span className="font-semibold text-[#14142b]">{issue.section}:</span> {issue.issue}
              </span>
            </li>
          ))}
        </ul>
      )}
      {readiness.isReady && (
        <p className="mb-3 flex items-center gap-2 text-xs text-emerald-700">
          <CheckCircle2 size={13} /> All requirements are met.
        </p>
      )}
      <Link href={continueHref} className="inline-flex items-center gap-1 text-xs font-semibold text-[#14142b] hover:underline">
        Continue editing <ArrowRight size={12} />
      </Link>
    </div>
  );
}
