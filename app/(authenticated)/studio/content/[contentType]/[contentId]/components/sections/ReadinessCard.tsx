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
    <div className="overflow-hidden rounded-none border border-slate-900 bg-white p-6 sm:p-7 shadow-[3.5px_3.5px_0px_0px_#D97706] transition-all duration-300 hover:shadow-[5px_5px_0px_0px_#D97706]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-[#14142b]">
          <span className="grid size-7 place-items-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <CheckCircle2 size={15} />
          </span>
          <span>Content readiness</span>
        </h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-600 border border-slate-200/60">
          {readiness.isReady ? "Ready to submit" : `${readiness.issues.length} item${readiness.issues.length === 1 ? "" : "s"} need attention`}
        </span>
      </div>
      <Progress value={readiness.completionPercentage} className="mb-4 h-2 rounded-full" />
      {readiness.issues.length > 0 && (
        <ul className="mb-4 flex flex-col gap-2">
          {readiness.issues.map((issue, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 bg-amber-50/60 border border-amber-200/60 p-3 rounded-2xl">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-amber-600" />
              <span>
                <span className="font-extrabold text-amber-900">{issue.section}:</span> {issue.issue}
              </span>
            </li>
          ))}
        </ul>
      )}
      {readiness.isReady && (
        <p className="mb-4 flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 p-3 rounded-2xl">
          <CheckCircle2 size={15} className="text-emerald-600" /> All requirements are met. Ready for review!
        </p>
      )}
      <Link href={continueHref} className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors">
        Continue editing <ArrowRight size={13} />
      </Link>
    </div>
  );
}

