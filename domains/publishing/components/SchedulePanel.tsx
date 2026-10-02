"use client";

// The creator's schedule for one course, event or exam: when people can enrol/register, and when
// the content can be used. Shared by every content overview so scheduling looks and behaves the
// same everywhere. The server validates and enforces; this panel edits and reports.

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, Check, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  contentScheduleApi,
  type ContentScheduleResponse,
  type ScheduledContentType,
  type ScheduleState,
} from "../api/contentSchedule";

const STATE_LABEL: Record<ScheduleState, { text: string; cls: string }> = {
  OPEN: { text: "Open now", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" },
  NOT_YET_OPEN: { text: "Not open yet", cls: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300" },
  CLOSED: { text: "Closed", cls: "bg-slate-100 text-slate-600" },
  NEVER: { text: "Never opens", cls: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" },
};

/** `<input type="datetime-local">` speaks local wall time; the API speaks instants. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

interface Draft {
  enrollmentOpensAt: string;
  enrollmentClosesAt: string;
  accessStartsAt: string;
  accessEndsAt: string;
}

type Field = keyof Draft;

/** Bounds for the pickers. Without a max, Chrome accepts five- and six-digit years ("24224"). */
const MIN_INPUT = "2000-01-01T00:00";
const MAX_INPUT = "2099-12-31T23:59";

/**
 * Why a picker's contents can't be used, or null. A datetime-local input reports an empty value
 * while any part is unfinished (a missing hour, say), so a half-typed date used to read as
 * "no limit": the draft matched what was saved and the button sat disabled on "Saved" with no
 * hint why.
 */
function problemOf(input: HTMLInputElement): string | null {
  const v = input.validity;
  if (v.badInput) return "Finish the date and time — every part, including the hour.";
  if (v.rangeUnderflow || v.rangeOverflow) return "Pick a date between 2000 and 2099.";
  return null;
}

function draftOf(s: ContentScheduleResponse | null): Draft {
  return {
    enrollmentOpensAt: toLocalInput(s?.creatorEnrollment.opensAt ?? null),
    enrollmentClosesAt: toLocalInput(s?.creatorEnrollment.closesAt ?? null),
    accessStartsAt: toLocalInput(s?.creatorAccess.opensAt ?? null),
    accessEndsAt: toLocalInput(s?.creatorAccess.closesAt ?? null),
  };
}

export interface SchedulePanelProps {
  contentType: ScheduledContentType;
  contentId: string;
  readOnly?: boolean;
  /** Words for the enrolment step — "Enrollment" for courses, "Registration" for events and exams. */
  enrollmentNoun?: string;
}

export function SchedulePanel({ contentType, contentId, readOnly, enrollmentNoun }: SchedulePanelProps) {
  const noun = enrollmentNoun ?? (contentType === "COURSE" ? "Enrollment" : "Registration");
  const [schedule, setSchedule] = useState<ContentScheduleResponse | null>(null);
  const [draft, setDraft] = useState<Draft>(draftOf(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [problems, setProblems] = useState<Partial<Record<Field, string>>>({});

  const load = useCallback(
    () =>
      contentScheduleApi
        .get(contentType, contentId)
        .then((s) => {
          setSchedule(s);
          setDraft(draftOf(s));
        })
        .catch(() => setSchedule(null))
        .finally(() => setLoading(false)),
    [contentType, contentId]
  );

  useEffect(() => {
    let cancelled = false;
    contentScheduleApi
      .get(contentType, contentId)
      .then((s) => {
        if (cancelled) return;
        setSchedule(s);
        setDraft(draftOf(s));
      })
      .catch(() => !cancelled && setSchedule(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [contentType, contentId]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(draftOf(schedule));
  const hasProblems = Object.values(problems).some(Boolean);
  // Same rule the server applies; caught here so the reason shows next to the fields.
  const orderProblem =
    (draft.enrollmentOpensAt && draft.enrollmentClosesAt && draft.enrollmentOpensAt >= draft.enrollmentClosesAt) ||
    (draft.accessStartsAt && draft.accessEndsAt && draft.accessStartsAt >= draft.accessEndsAt)
      ? "Each window has to close after it opens."
      : null;

  const edit = (field: Field) => (value: string, problem: string | null) => {
    setDraft((d) => ({ ...d, [field]: value }));
    setProblems((p) => ({ ...p, [field]: problem ?? undefined }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const saved = await contentScheduleApi.put(contentType, contentId, {
        enrollmentOpensAt: fromLocalInput(draft.enrollmentOpensAt),
        enrollmentClosesAt: fromLocalInput(draft.enrollmentClosesAt),
        accessStartsAt: fromLocalInput(draft.accessStartsAt),
        accessEndsAt: fromLocalInput(draft.accessEndsAt),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
      });
      setSchedule(saved);
      setDraft(draftOf(saved));
      setProblems({});
      toast.success("Schedule saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the schedule");
    } finally {
      setSaving(false);
    }
  };

  const clear = async () => {
    setSaving(true);
    try {
      await contentScheduleApi.clear(contentType, contentId);
      setProblems({});
      await load();
      toast.success("Schedule cleared — always open");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't clear the schedule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/50 bg-surface/70 p-5 shadow-sm backdrop-blur-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-black tracking-tight text-ink">
            <CalendarClock size={15} className="text-slate-400" /> Schedule
          </h3>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500">
            Leave a date empty for no limit. Learners who already started keep their in-progress work
            when access closes.
          </p>
        </div>
        {schedule && (
          <div className="flex flex-wrap gap-1.5">
            <StateChip label={noun} state={schedule.enrollmentState} />
            <StateChip label="Access" state={schedule.accessState} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={16} className="animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <WindowFields
              title={`${noun} window`}
              hint={`When learners can ${noun === "Enrollment" ? "enrol" : "register"}.`}
              opens={draft.enrollmentOpensAt}
              closes={draft.enrollmentClosesAt}
              opensProblem={problems.enrollmentOpensAt}
              closesProblem={problems.enrollmentClosesAt}
              disabled={readOnly || saving}
              onOpens={edit("enrollmentOpensAt")}
              onCloses={edit("enrollmentClosesAt")}
            />
            <WindowFields
              title="Access window"
              hint={contentType === "EXAM" ? "When the exam can be sat." : "When enrolled learners can use it."}
              opens={draft.accessStartsAt}
              closes={draft.accessEndsAt}
              opensProblem={problems.accessStartsAt}
              closesProblem={problems.accessEndsAt}
              disabled={readOnly || saving}
              onOpens={edit("accessStartsAt")}
              onCloses={edit("accessEndsAt")}
            />
          </div>

          {schedule && schedule.origins.some((o) => o !== "CREATOR") && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
              A platform rule also applies, so the effective window may be narrower than what you set.
            </p>
          )}

          {!readOnly && orderProblem && !hasProblems && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{orderProblem}</p>
          )}

          {!readOnly && (
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={clear}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-surface px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <RotateCcw size={13} /> Always open
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!dirty || saving || hasProblems || !!orderProblem}
                className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-bold text-on-ink hover:bg-ink-hover disabled:opacity-40"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                {hasProblems ? "Fix the dates above" : dirty ? "Save schedule" : "Saved"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function StateChip({ label, state }: { label: string; state: ScheduleState }) {
  const s = STATE_LABEL[state] ?? STATE_LABEL.OPEN;
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${s.cls}`}>
      {label}: {s.text}
    </span>
  );
}

function WindowFields({
  title,
  hint,
  opens,
  closes,
  opensProblem,
  closesProblem,
  disabled,
  onOpens,
  onCloses,
}: {
  title: string;
  hint: string;
  opens: string;
  closes: string;
  opensProblem?: string;
  closesProblem?: string;
  disabled?: boolean;
  onOpens: (v: string, problem: string | null) => void;
  onCloses: (v: string, problem: string | null) => void;
}) {
  const inputCls = (problem?: string) =>
    `mt-1 w-full rounded-lg border px-2 py-1.5 text-xs font-semibold text-ink outline-none disabled:bg-slate-50 ${
      problem ? "border-rose-300 focus:border-rose-400 dark:border-rose-500/40" : "border-slate-200 focus:border-indigo-300 dark:focus:border-indigo-500/40"
    }`;
  return (
    <div className="rounded-xl border border-slate-200 bg-surface p-4">
      <p className="text-xs font-bold text-ink">{title}</p>
      <p className="mb-3 text-[11px] text-slate-500">{hint}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-[11px] font-semibold text-slate-500">
          Opens
          <input
            type="datetime-local"
            value={opens}
            min={MIN_INPUT}
            max={MAX_INPUT}
            disabled={disabled}
            aria-invalid={!!opensProblem}
            onChange={(e) => onOpens(e.target.value, problemOf(e.target))}
            onBlur={(e) => onOpens(e.target.value, problemOf(e.target))}
            className={inputCls(opensProblem)}
          />
          {opensProblem && <span className="mt-1 block text-[10px] font-medium text-rose-600 dark:text-rose-400">{opensProblem}</span>}
        </label>
        <label className="text-[11px] font-semibold text-slate-500">
          Closes
          <input
            type="datetime-local"
            value={closes}
            min={MIN_INPUT}
            max={MAX_INPUT}
            disabled={disabled}
            aria-invalid={!!closesProblem}
            onChange={(e) => onCloses(e.target.value, problemOf(e.target))}
            onBlur={(e) => onCloses(e.target.value, problemOf(e.target))}
            className={inputCls(closesProblem)}
          />
          {closesProblem && <span className="mt-1 block text-[10px] font-medium text-rose-600 dark:text-rose-400">{closesProblem}</span>}
        </label>
      </div>
    </div>
  );
}
