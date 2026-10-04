"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, PenLine } from "lucide-react";
import { toast } from "sonner";
import { TiptapContentView } from "@/domains/learning";
import { getMarkingQueue, markAnswer, type MarkingItem, type MarkingQuestion } from "@/domains/assessments";

/**
 * Written answers awaiting a mark. Each attempt with unmarked SENTENCE answers is listed; once every
 * one of its written answers has a mark the server finalises the result and applies its outcome
 * (grade card, certificate, completion) exactly as an automatic submission would.
 */
export function ExamMarkingWorkspace({ examId }: { examId: string }) {
  const [queue, setQueue] = useState<MarkingItem[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    getMarkingQueue(examId)
      .then((q) => {
        setQueue(q);
        setError(false);
      })
      .catch(() => setError(true));
  }, [examId]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="text-sm text-rose-600 dark:text-rose-400">Failed to load the marking queue.</p>;
  if (queue === null) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-slate-400" size={20} />
      </div>
    );
  }
  if (queue.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-surface px-6 py-14 text-center">
        <PenLine className="mx-auto mb-2 text-slate-300" size={24} />
        <p className="text-sm font-semibold text-ink">Nothing to mark</p>
        <p className="mt-1 text-xs text-slate-500">Written answers appear here after a learner submits.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {queue.map((item) => (
        <section key={item.attemptId} className="rounded-2xl border border-slate-200 bg-surface">
          <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <div>
              <p className="text-sm font-bold text-ink">{item.learnerName}</p>
              <p className="text-[11px] text-slate-400">
                Attempt {item.attemptNumber}
                {item.submittedAt && ` · submitted ${new Date(item.submittedAt).toLocaleString()}`}
              </p>
            </div>
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              {item.questions.filter((q) => q.awardedMarks === null).length} to mark
            </span>
          </header>
          <div className="divide-y divide-slate-100">
            {item.questions.map((q) => (
              <MarkRow key={q.attemptQuestionId} attemptId={item.attemptId} question={q} onMarked={load} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function MarkRow({
  attemptId,
  question,
  onMarked,
}: {
  attemptId: string;
  question: MarkingQuestion;
  onMarked: () => void;
}) {
  const [marks, setMarks] = useState(question.awardedMarks === null ? "" : String(question.awardedMarks));
  const [note, setNote] = useState(question.note ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const value = Number(marks);
    if (marks.trim() === "" || !Number.isFinite(value) || value < 0 || value > question.points) {
      toast.error(`Enter a mark between 0 and ${question.points}.`);
      return;
    }
    setSaving(true);
    try {
      const { resultStatus } = await markAnswer(attemptId, question.attemptQuestionId, value, note || undefined);
      toast.success(resultStatus === "FINAL" ? "Marked — the result is now final." : "Marked");
      onMarked();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the mark");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_1fr_220px]">
      <div className="min-w-0 text-[13px] text-ink">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Question {question.position + 1}</p>
        <TiptapContentView body={typeof question.prompt === "string" ? question.prompt : JSON.stringify(question.prompt)} emptyMessage="" />
        {question.sampleAnswer && (
          <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-[12px] text-slate-600">
            <b>Model answer:</b> {question.sampleAnswer}
          </p>
        )}
      </div>
      <div className="min-w-0">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Learner&apos;s answer</p>
        <p className="whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-[13px] text-slate-700">
          {question.textAnswer?.trim() || <span className="italic text-slate-400">No answer</span>}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <input
            type="number"
            min={0}
            max={question.points}
            step="0.5"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-center text-xs font-bold outline-none focus:border-indigo-300 dark:focus:border-indigo-500/40"
          />
          / {question.points}
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Feedback (optional)"
          className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-indigo-300 dark:focus:border-indigo-500/40"
        />
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-bold text-on-ink hover:bg-ink-hover disabled:opacity-50"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          {question.awardedMarks === null ? "Save mark" : "Update mark"}
        </button>
      </div>
    </div>
  );
}
