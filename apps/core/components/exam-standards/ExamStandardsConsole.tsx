'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * Console -> Exam standards. The platform's rules for each exam type — Certification, Completion,
 * Assessment. Each setting is LOCKED (forced on every tied exam) or a DEFAULT (pre-filled; the
 * creator may change it within the min/max set here). Standalone exams only get the defaults
 * unless "Apply locks to standalone exams" is on. Above them sits the sitting baseline — the
 * integrity floor every sitting gets, which no standard or plan can switch off.
 *
 * Rules:
 * - Gated on `platform.exams.manage`. The backend validates every value and re-conforms existing
 *   plans on save; nothing here is enforcement.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useEffect, useMemo, useState } from 'react';
import { Award, ClipboardCheck, Flag, Loader2, Lock, Save, ShieldCheck, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import {
  listExamStandards,
  planTypeMeta,
  updateExamStandard,
  SITTING_BASELINE_RULES,
  SITTING_MAX_VIOLATIONS,
  type ExamPlanType,
  type ExamSettingMode,
  type ExamStandard,
  type ExamStandardSetting,
} from '@/domains/assessments';

const TYPE_ICON: Record<ExamPlanType, typeof Award> = {
  CERTIFICATION: Award,
  COMPLETION: Flag,
  ASSESSMENT: ClipboardCheck,
};

/** Fee is stored in minor units; the console edits it in major units. */
const MINOR_KEYS = new Set(['FEE_AMOUNT_MINOR']);

/**
 * Settings grouped the way a creator meets them in Studio. Full screen is not here: the sitting
 * baseline makes it always on, so a standard has nothing to decide about it.
 */
const GROUPS: Array<{ title: string; keys: string[] }> = [
  { title: 'Sitting', keys: ['DURATION_MINUTES', 'MAX_ATTEMPTS', 'PASS_PERCENTAGE', 'GRADED', 'MIN_QUESTIONS'] },
  { title: 'Paper', keys: ['SHUFFLE_QUESTIONS', 'SHUFFLE_OPTIONS', 'FIXED_PAPER'] },
  {
    title: 'Security',
    keys: ['PROCTORING_REQUIRED', 'IDENTITY_VERIFICATION_REQUIRED', 'MAX_VIOLATIONS'],
  },
  { title: 'Registration', keys: ['FEE_AMOUNT_MINOR'] },
];

export function ExamStandardsConsole() {
  const [standards, setStandards] = useState<ExamStandard[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ExamPlanType>('CERTIFICATION');
  const [draft, setDraft] = useState<ExamStandard | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listExamStandards()
      .then(setStandards)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Could not load exam standards.'))
      .finally(() => setLoading(false));
  }, []);

  const current = useMemo(() => standards.find((s) => s.planType === active) ?? null, [standards, active]);
  // The draft follows the selected standard; resetting it while rendering (not in an effect) keeps
  // one render pass per switch.
  const [draftFor, setDraftFor] = useState<ExamStandard | null>(null);
  if (current !== draftFor) {
    setDraftFor(current);
    setDraft(current ? structuredClone(current) : null);
  }

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(current), [draft, current]);

  const patchSetting = (key: string, patch: Partial<ExamStandardSetting>) =>
    setDraft((d) =>
      d ? { ...d, settings: d.settings.map((s) => (s.key === key ? { ...s, ...patch } : s)) } : d
    );

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const saved = await updateExamStandard(draft.planType, {
        displayName: draft.displayName,
        description: draft.description ?? undefined,
        enforceOnUntied: draft.enforceOnUntied,
        settings: draft.settings
          .filter((s) => s.value !== null)
          .map((s) => ({ key: s.key, value: s.value, mode: s.mode, min: s.min, max: s.max })),
      });
      setStandards((all) => all.map((s) => (s.planType === saved.planType ? saved : s)));
      toast.success(`${saved.displayName} standard saved. Existing plans were brought into line.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save this standard.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={24} />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-16">
      <div className="mb-5 inline-flex flex-wrap items-center gap-1.5 rounded-full border border-slate-200/80 bg-surface/80 p-1.5 shadow-xs backdrop-blur-md">
        {standards.map((s) => {
          const Icon = TYPE_ICON[s.planType];
          return (
            <button
              key={s.planType}
              type="button"
              onClick={() => setActive(s.planType)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
                active === s.planType
                  ? 'bg-slate-950 text-on-ink shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={14} />
              {s.displayName}
            </button>
          );
        })}
      </div>

      {draft && (
        <div className="space-y-5">
          <SittingBaselineCard />

          <section className="rounded-2xl border border-slate-200/80 bg-surface p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Name</span>
                <input
                  value={draft.displayName}
                  onChange={(e) => setDraft({ ...draft, displayName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-[14px] outline-none focus:border-ink"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Description shown to creators
                </span>
                <input
                  value={draft.description ?? ''}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder={planTypeMeta(draft.planType).effect}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-[14px] outline-none focus:border-ink"
                />
              </label>
            </div>
            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={draft.enforceOnUntied}
                onChange={(e) => setDraft({ ...draft, enforceOnUntied: e.target.checked })}
                className="mt-0.5 size-4 rounded border-slate-300"
              />
              <span>
                <span className="block text-[13px] font-semibold text-ink">Apply locks to standalone exams</span>
                <span className="block text-[12px] font-medium text-slate-500">
                  Off: exams not tied to a course or event get these values as defaults and may change them freely.
                </span>
              </span>
            </label>
          </section>

          {GROUPS.map((group) => {
            const rows = group.keys
              .map((k) => draft.settings.find((s) => s.key === k))
              .filter((s): s is ExamStandardSetting => !!s);
            if (rows.length === 0) return null;
            return (
              <section key={group.title} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-surface">
                <h2 className="border-b border-slate-100 bg-slate-50/60 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {group.title}
                </h2>
                <div className="divide-y divide-slate-100">
                  {rows.map((setting) => (
                    <SettingRow key={setting.key} setting={setting} onChange={(p) => patchSetting(setting.key, p)} />
                  ))}
                </div>
              </section>
            );
          })}

          <div className="sticky bottom-0 flex justify-end gap-2 bg-gradient-to-t from-surface via-surface/90 to-transparent pt-4">
            <button
              type="button"
              disabled={!dirty || saving}
              onClick={() => setDraft(current ? structuredClone(current) : null)}
              className="cursor-pointer rounded-full border border-slate-200 bg-surface px-5 py-2.5 text-[13px] font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Discard
            </button>
            <button
              type="button"
              disabled={!dirty || saving}
              onClick={save}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-on-ink hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save standard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** The integrity floor every sitting gets — shown, never edited. Enforced by the server. */
function SittingBaselineCard() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-2.5">
        <h2 className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <ShieldCheck size={13} /> Sitting baseline
        </h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-ink">
          <Lock size={10} /> Always on
        </span>
      </div>
      <p className="px-5 pt-3.5 text-[12px] font-medium text-slate-500">
        Every exam sitting on the platform runs under these rules, for every exam type. They are not
        settings: no standard or plan can switch them off.
      </p>
      <ul className="grid gap-x-6 gap-y-3 px-5 py-4 md:grid-cols-2">
        {SITTING_BASELINE_RULES.map((rule) => (
          <li key={rule.title} className="flex gap-2.5">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              <span className="block text-[13px] font-semibold text-ink">{rule.title}</span>
              <span className="block text-[12px] font-medium leading-relaxed text-slate-500">{rule.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SettingRow({
  setting,
  onChange,
}: {
  setting: ExamStandardSetting;
  onChange: (patch: Partial<ExamStandardSetting>) => void;
}) {
  const minor = MINOR_KEYS.has(setting.key);
  const toInput = (v: number | null) => (v === null ? '' : String(minor ? v / 100 : v));
  const fromInput = (raw: string): number | null => {
    if (raw.trim() === '') return null;
    const n = Number(raw);
    if (Number.isNaN(n)) return null;
    return minor ? Math.round(n * 100) : n;
  };
  const locked = setting.mode === 'LOCKED';
  const setMode = (mode: ExamSettingMode) => onChange({ mode });

  return (
    <div className="grid grid-cols-1 items-center gap-3 px-5 py-3.5 md:grid-cols-[1.4fr_auto_1fr_1.4fr]">
      <div>
        <p className="text-[13px] font-semibold text-ink">{minor ? 'Registration fee' : setting.label}</p>
        {setting.key === 'MIN_QUESTIONS' && (
          <p className="text-[11px] font-medium text-slate-400">Publishing is refused below this.</p>
        )}
        {setting.key === 'MAX_VIOLATIONS' && (
          <p className="text-[11px] font-medium text-slate-400">
            Can only be stricter than the baseline: 0, or anything above {SITTING_MAX_VIOLATIONS}, runs as {SITTING_MAX_VIOLATIONS}.
          </p>
        )}
      </div>

      <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5">
        {(['LOCKED', 'DEFAULT'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
              setting.mode === m ? 'bg-surface text-ink shadow-xs' : 'text-slate-500'
            }`}
          >
            {m === 'LOCKED' ? <Lock size={11} /> : <Unlock size={11} />}
            {m === 'LOCKED' ? 'Locked' : 'Default'}
          </button>
        ))}
      </div>

      <div>
        {setting.kind === 'BOOLEAN' ? (
          <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] font-medium text-slate-700">
            <input
              type="checkbox"
              checked={(setting.value ?? 0) > 0}
              onChange={(e) => onChange({ value: e.target.checked ? 1 : 0 })}
              className="size-4 rounded border-slate-300"
            />
            {(setting.value ?? 0) > 0 ? 'On' : 'Off'}
          </label>
        ) : (
          <input
            type="number"
            step={setting.kind === 'DECIMAL' || minor ? '0.01' : '1'}
            value={toInput(setting.value)}
            onChange={(e) => onChange({ value: fromInput(e.target.value) })}
            className="w-28 rounded-xl border border-slate-200 px-3 py-1.5 text-[13px] tabular-nums outline-none focus:border-ink"
            aria-label={`${setting.label} value`}
          />
        )}
      </div>

      <div className="flex items-center gap-2 text-[12px] text-slate-500">
        {setting.kind !== 'BOOLEAN' && !locked ? (
          <>
            <span>Creators may set</span>
            <input
              type="number"
              value={toInput(setting.min)}
              placeholder="min"
              onChange={(e) => onChange({ min: fromInput(e.target.value) })}
              className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-[12px] tabular-nums outline-none focus:border-ink"
              aria-label={`${setting.label} minimum`}
            />
            <span>to</span>
            <input
              type="number"
              value={toInput(setting.max)}
              placeholder="max"
              onChange={(e) => onChange({ max: fromInput(e.target.value) })}
              className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-[12px] tabular-nums outline-none focus:border-ink"
              aria-label={`${setting.label} maximum`}
            />
          </>
        ) : (
          <span className="text-slate-400">{locked ? 'Creators cannot change this.' : 'Creators may switch this.'}</span>
        )}
      </div>
    </div>
  );
}
