import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/shared/design-system/ui/progress";
import type { PublishValidationResponse } from "@/app/(authenticated)/studio/events/types";

export function ReadinessCard({
  readiness,
  continueHref,
}: {
  readiness: PublishValidationResponse;
  continueHref: string;
}) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white">
          <span className="grid size-7 place-items-center rounded-xl bg-blue-50 text-[#205ca8] border border-blue-100 dark:bg-slate-800 dark:text-blue-400 dark:border-slate-700">
            <CheckCircle2 size={15} />
          </span>
          <span>Content readiness</span>
        </h2>
        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
          {readiness.isReady ? "Ready to submit" : `${readiness.issues.length} item${readiness.issues.length === 1 ? "" : "s"} need attention`}
        </span>
      </div>
      <Progress value={readiness.completionPercentage} className="mb-4 h-2 rounded-full" />
      {readiness.issues.length > 0 && (
        <ul className="mb-4 flex flex-col gap-2">
          {readiness.issues.map((issue, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 p-3 rounded-xl">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                <strong className="font-bold text-amber-900 dark:text-amber-200">{issue.section}:</strong> {issue.issue}
              </span>
            </li>
          ))}
        </ul>
      )}
      {readiness.isReady && (
        <p className="mb-4 flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 p-3 rounded-xl">
          <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" /> All requirements are met. Ready for review!
        </p>
      )}
      <Link href={continueHref} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#205ca8] dark:text-blue-400 hover:underline transition-colors">
        Continue editing <ArrowRight size={13} />
      </Link>
    </div>
  );
}
