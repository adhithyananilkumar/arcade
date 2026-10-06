"use client";

// The creator's schedule for one course, event or exam: when people can enrol/register, and when
// the content can be used. Shared by every content overview so scheduling looks and behaves the
// same everywhere. The server validates and enforces; this panel edits and reports.

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, Check, Loader2, RotateCcw, UserPlus, Lock, Calendar, Clock } from "lucide-react";
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
  /** Drop the built-in heading — the host (a numbered Content Overview row) supplies it. */
  bare?: boolean;
}

export function SchedulePanel({ contentType, contentId, readOnly, enrollmentNoun, bare = false }: SchedulePanelProps) {
  const noun = enrollmentNoun ?? (contentType === "COURSE" ? "Enrollment" : "Registration");
  const thing = contentType === "COURSE" ? "course" : contentType === "EVENT" ? "event" : "exam";
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
    <section className="flex flex-col gap-5 py-2">
      {bare ? (
        schedule && (
          <div className="flex flex-wrap gap-1.5">
            <StateChip label={noun} state={schedule.enrollmentState} />
            <StateChip label="Access" state={schedule.accessState} />
          </div>
        )
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-extrabold tracking-tight text-slate-900">Schedule</h3>
            <p className="text-xs font-medium text-slate-500">
              Define when learners can {noun === "Enrollment" ? "enroll in" : "register for"} and access this {thing}.
            </p>
          </div>
          {schedule && (
            <div className="flex flex-wrap gap-1.5">
              <StateChip label={noun} state={schedule.enrollmentState} />
              <StateChip label="Access" state={schedule.accessState} />
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={16} className="animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 pt-1">
            <WindowFields
              title={`${noun} window`}
              hint={`When learners can ${noun === "Enrollment" ? "enroll in" : "register for"} this ${thing}.`}
              opens={draft.enrollmentOpensAt}
              closes={draft.enrollmentClosesAt}
              opensProblem={problems.enrollmentOpensAt}
              closesProblem={problems.enrollmentClosesAt}
              disabled={readOnly || saving}
              onOpens={edit("enrollmentOpensAt")}
              onCloses={edit("enrollmentClosesAt")}
              icon={UserPlus}
              iconBgClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
            />
            <WindowFields
              title="Access window"
              hint={contentType === "EXAM" ? "When the exam can be sat." : `When ${noun === "Enrollment" ? "enrolled" : "registered"} learners can access the ${thing}.`}
              opens={draft.accessStartsAt}
              closes={draft.accessEndsAt}
              opensProblem={problems.accessStartsAt}
              closesProblem={problems.accessEndsAt}
              disabled={readOnly || saving}
              onOpens={edit("accessStartsAt")}
              onCloses={edit("accessEndsAt")}
              icon={Lock}
              iconBgClass="bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
            />
          </div>

          {schedule && schedule.origins.some((o) => o !== "CREATOR") && (
            <p className="mt-1 rounded-xl bg-amber-50 px-3.5 py-2 text-[11px] font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
              A platform rule also applies, so the effective window may be narrower than what you set.
            </p>
          )}

          {!readOnly && orderProblem && !hasProblems && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{orderProblem}</p>
          )}

          {!readOnly && (
            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={clear}
                disabled={saving}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200/90 bg-surface px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 disabled:opacity-50"
              >
                <Clock size={14} className="text-slate-500" /> Always open
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!dirty || saving || hasProblems || !!orderProblem}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-ink px-7 py-2.5 text-xs font-extrabold text-on-ink shadow-md transition-all hover:bg-[#205ca8] disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
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
  icon: Icon,
  iconBgClass,
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
  icon: typeof UserPlus;
  iconBgClass: string;
}) {
  return (
    <div className="flex flex-col gap-3 flex-1">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl shrink-0 ${iconBgClass}`}>
          <Icon size={18} />
        </div>
        <div className="flex flex-col">
          <h4 className="text-sm font-extrabold text-slate-900">{title}</h4>
          <p className="text-xs font-medium text-slate-500">{hint}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-1">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-700">Opens</label>
          <div className="relative">
            <input
              type="datetime-local"
              value={opens}
              min={MIN_INPUT}
              max={MAX_INPUT}
              disabled={disabled}
              aria-invalid={!!opensProblem}
              onChange={(e) => onOpens(e.target.value, problemOf(e.target))}
              onBlur={(e) => onOpens(e.target.value, problemOf(e.target))}
              className={`w-full rounded-2xl border bg-surface p-3 pr-10 text-xs font-medium text-slate-900 outline-none focus:ring-4 ${
                opensProblem
                  ? "border-rose-300 focus:border-rose-400 dark:border-rose-500/40 focus:ring-rose-500/10"
                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
              }`}
            />
            <Calendar size={16} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
          </div>
          {opensProblem && <span className="mt-1 block text-[10px] font-medium text-rose-600 dark:text-rose-400">{opensProblem}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-700">Closes</label>
          <div className="relative">
            <input
              type="datetime-local"
              value={closes}
              min={MIN_INPUT}
              max={MAX_INPUT}
              disabled={disabled}
              aria-invalid={!!closesProblem}
              onChange={(e) => onCloses(e.target.value, problemOf(e.target))}
              onBlur={(e) => onCloses(e.target.value, problemOf(e.target))}
              className={`w-full rounded-2xl border bg-surface p-3 pr-10 text-xs font-medium text-slate-900 outline-none focus:ring-4 ${
                closesProblem
                  ? "border-rose-300 focus:border-rose-400 dark:border-rose-500/40 focus:ring-rose-500/10"
                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
              }`}
            />
            <Calendar size={16} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
          </div>
          {closesProblem && <span className="mt-1 block text-[10px] font-medium text-rose-600 dark:text-rose-400">{closesProblem}</span>}
        </div>
      </div>
    </div>
  );
}
