"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { getEventDeleteImpact } from "@/domains/events";

/**
 * Shown inside an event's delete confirmation when the event has a linked exam. Deleting the event
 * used to leave that exam behind as an orphaned draft; now the author is told and chooses: delete
 * it with the event (the default), or unlink it and keep it as a standalone draft exam.
 */
export function LinkedExamDeleteChoice({
  eventId,
  keepExam,
  onChange,
}: {
  eventId: string;
  keepExam: boolean;
  onChange: (keepExam: boolean) => void;
}) {
  const [state, setState] = useState<
    { status: "loading" } | { status: "none" } | { status: "linked"; title: string; attemptCount: number }
  >({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    getEventDeleteImpact(eventId)
      .then((impact) => {
        if (cancelled) return;
        setState(
          impact.linkedExam
            ? { status: "linked", title: impact.linkedExam.title, attemptCount: impact.linkedExam.attemptCount }
            : { status: "none" }
        );
      })
      .catch(() => !cancelled && setState({ status: "none" }));
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (state.status === "loading") {
    return (
      <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
        <Loader2 size={13} className="animate-spin" /> Checking for a linked exam…
      </div>
    );
  }
  if (state.status === "none") return null;

  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 dark:border-amber-500/25 dark:bg-amber-500/10">
      <p className="mb-2.5 flex items-start gap-2 text-[13px] font-semibold text-amber-900 dark:text-amber-200">
        <AlertTriangle size={15} className="mt-0.5 shrink-0" />
        <span>
          This event has a linked exam, &ldquo;{state.title}&rdquo;
          {state.attemptCount > 0
            ? `, with ${state.attemptCount} attempt${state.attemptCount === 1 ? "" : "s"}. Learners keep their grade cards either way.`
            : "."}
        </span>
      </p>
      <div className="space-y-1.5">
        <Option
          checked={!keepExam}
          onSelect={() => onChange(false)}
          title="Delete the exam too"
          detail="Its questions and plans are removed with the event."
        />
        <Option
          checked={keepExam}
          onSelect={() => onChange(true)}
          title="Unlink and keep it"
          detail="It becomes a standalone draft exam in Studio. Its final assessment becomes a graded assessment, and it must be submitted for review before it's listed in Explore."
        />
      </div>
    </div>
  );
}

function Option({
  checked,
  onSelect,
  title,
  detail,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  detail: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/60 dark:hover:bg-white/5">
      <input type="radio" checked={checked} onChange={onSelect} className="mt-0.5 accent-amber-600" />
      <span>
        <span className="block text-[13px] font-semibold text-ink">{title}</span>
        <span className="block text-[12px] leading-relaxed text-slate-500">{detail}</span>
      </span>
    </label>
  );
}
