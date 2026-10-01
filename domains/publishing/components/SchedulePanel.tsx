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
  OPEN: { text: "Open now", cls: "bg-emerald-50 text-emerald-700" },
  NOT_YET_OPEN: { text: "Not open yet", cls: "bg-sky-50 text-sky-700" },
  CLOSED: { text: "Closed", cls: "bg-slate-100 text-slate-600" },
  NEVER: { text: "Never opens", cls: "bg-rose-50 text-rose-700" },
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
      {/* 01 Numbered Step Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-extrabold text-sm shrink-0 mt-0.5">
            01
          </div>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Schedule
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Define when learners can enroll and access your course.
            </p>
          </div>
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
          <div className="grid gap-6 md:grid-cols-2 pt-1">
            <WindowFields
              title={`${noun} window`}
              hint={`When learners can ${noun === "Enrollment" ? "enroll" : "register"} in this course.`}
              opens={draft.enrollmentOpensAt}
              closes={draft.enrollmentClosesAt}
              disabled={readOnly || saving}
              onOpens={(v) => setDraft({ ...draft, enrollmentOpensAt: v })}
              onCloses={(v) => setDraft({ ...draft, enrollmentClosesAt: v })}
              icon={UserPlus}
              iconBgClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
            />
            <WindowFields
              title="Access window"
              hint={contentType === "EXAM" ? "When the exam can be sat." : "When enrolled learners can access the course."}
              opens={draft.accessStartsAt}
              closes={draft.accessEndsAt}
              disabled={readOnly || saving}
              onOpens={(v) => setDraft({ ...draft, accessStartsAt: v })}
              onCloses={(v) => setDraft({ ...draft, accessEndsAt: v })}
              icon={Lock}
              iconBgClass="bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
            />
          </div>

          {schedule && schedule.origins.some((o) => o !== "CREATOR") && (
            <p className="mt-1 rounded-xl bg-amber-50 px-3.5 py-2 text-[11px] font-medium text-amber-800">
              A platform rule also applies, so the effective window may be narrower than what you set.
            </p>
          )}

          {!readOnly && (
            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={clear}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <Clock size={14} className="text-slate-500" /> Always open
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!dirty || saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0B132B] hover:bg-blue-600 dark:bg-white dark:text-slate-900 px-6 py-2.5 text-xs font-extrabold text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {dirty ? "Save schedule" : "Save schedule"}
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
  disabled?: boolean;
  onOpens: (v: string) => void;
  onCloses: (v: string) => void;
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
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{title}</h4>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{hint}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-1">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Opens</label>
          <div className="relative">
            <input
              type="datetime-local"
              value={opens}
              disabled={disabled}
              onChange={(e) => onOpens(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 pr-10 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
            <Calendar size={16} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Closes</label>
          <div className="relative">
            <input
              type="datetime-local"
              value={closes}
              disabled={disabled}
              onChange={(e) => onCloses(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 pr-10 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
            <Calendar size={16} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
