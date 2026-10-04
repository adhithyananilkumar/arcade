'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Loader2, Pencil, Plus, Shield, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  absoluteTime,
  BugTriageService,
  CATEGORY_ICONS,
  CategoryIcon,
  INTAKE_MODE_HINT,
  INTAKE_MODE_LABEL,
  PersonAvatar,
  type BugCategory,
  type BugCategoryBody,
  type BugIntakeMode,
  type BugIntakeSettings,
} from '@/domains/bug-reports';

const MODES: BugIntakeMode[] = ['OFF', 'TESTERS', 'EVERYONE'];

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

const inputClass =
  'h-9 w-full rounded-xl border border-slate-200 bg-surface px-3 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 dark:focus:ring-indigo-500/20 dark:focus:border-indigo-500/40';

function Card({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-[0_2px_8px_rgba(20,20,43,0.04)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-bold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[12.5px] text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function IconPicker({ value, onChange, disabled }: { value: string; onChange: (icon: string) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1">
      {Object.keys(CATEGORY_ICONS).map((key) => (
        <button
          key={key}
          type="button"
          disabled={disabled}
          onClick={() => onChange(key)}
          aria-label={key}
          title={key}
          className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg transition ${
            value === key ? 'bg-ink text-on-ink' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <CategoryIcon icon={key} size={13} />
        </button>
      ))}
    </div>
  );
}

function CategoryEditor({
  initial,
  onSave,
  onCancel,
  isNew,
}: {
  initial: BugCategoryBody;
  onSave: (body: BugCategoryBody) => Promise<void>;
  onCancel: () => void;
  isNew: boolean;
}) {
  const [body, setBody] = useState<BugCategoryBody>(initial);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<BugCategoryBody>) => setBody((b) => ({ ...b, ...patch }));

  return (
    <div className="space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/40 p-3.5 dark:border-indigo-500/30 dark:bg-indigo-500/5">
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_90px]">
        <input className={inputClass} value={body.label} maxLength={60} onChange={(e) => set({ label: e.target.value })} placeholder="Label, e.g. Looks wrong" />
        {isNew ? (
          <input
            className={`${inputClass} font-mono uppercase`}
            value={body.code ?? ''}
            maxLength={40}
            onChange={(e) => set({ code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_') })}
            placeholder="CODE (permanent)"
          />
        ) : (
          <input className={`${inputClass} font-mono`} value={body.code ?? ''} disabled title="Codes never change — exports and filters rely on them" />
        )}
        <input
          className={inputClass}
          type="number"
          value={body.sortOrder ?? ''}
          onChange={(e) => set({ sortOrder: e.target.value === '' ? undefined : Number(e.target.value) })}
          placeholder="Order"
          aria-label="Sort order"
        />
      </div>
      <input className={inputClass} value={body.description ?? ''} maxLength={160} onChange={(e) => set({ description: e.target.value })} placeholder="One-line hint shown to reporters" />
      <IconPicker value={body.icon} onChange={(icon) => set({ icon })} />
      <div className="flex items-center justify-end gap-1.5">
        <button type="button" onClick={onCancel} className="cursor-pointer rounded-full px-3 py-1.5 text-[12px] font-semibold text-slate-500 hover:bg-slate-100">
          Cancel
        </button>
        <button
          type="button"
          disabled={saving || !body.label.trim() || (isNew && !(body.code && body.code.length >= 2))}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave(body);
            } finally {
              setSaving(false);
            }
          }}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-bold text-on-ink hover:bg-ink-hover disabled:opacity-50"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
        </button>
      </div>
    </div>
  );
}

/**
 * Who may report bugs, what the form says, and the categories reporters pick from. Viewable by
 * anyone on the bugs console; editable only with platform.bugs.configure (the backend re-checks).
 */
export function BugSettingsTab({ canConfigure }: { canConfigure: boolean }) {
  const [settings, setSettings] = useState<BugIntakeSettings | null>(null);
  const [categories, setCategories] = useState<BugCategory[] | null>(null);
  const [mode, setMode] = useState<BugIntakeMode>('TESTERS');
  const [releaseLabel, setReleaseLabel] = useState('');
  const [intakeMessage, setIntakeMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    BugTriageService.settings()
      .then((s) => {
        setSettings(s);
        setMode(s.mode);
        setReleaseLabel(s.releaseLabel ?? '');
        setIntakeMessage(s.intakeMessage ?? '');
      })
      .catch((err) => setError(errorMessage(err, 'Could not load intake settings.')));
    BugTriageService.categories()
      .then(setCategories)
      .catch((err) => setError(errorMessage(err, 'Could not load categories.')));
  }, []);

  const dirty =
    !!settings && (mode !== settings.mode || releaseLabel !== (settings.releaseLabel ?? '') || intakeMessage !== (settings.intakeMessage ?? ''));

  const save = async () => {
    setSaving(true);
    try {
      const next = await BugTriageService.updateSettings({ mode, releaseLabel: releaseLabel || null, intakeMessage: intakeMessage || null });
      setSettings(next);
      toast.success('Intake settings saved. The bug button updates for everyone within a few minutes.');
    } catch (err) {
      toast.error(errorMessage(err, 'Settings were not saved.'));
    } finally {
      setSaving(false);
    }
  };

  const saveCategory = async (id: string | null, body: BugCategoryBody) => {
    try {
      const saved = id ? await BugTriageService.updateCategory(id, body) : await BugTriageService.createCategory(body);
      setCategories((list) => {
        const rest = (list ?? []).filter((c) => c.id !== saved.id);
        return [...rest, saved].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
      });
      setEditing(null);
      toast.success(id ? 'Category updated' : 'Category added');
    } catch (err) {
      toast.error(errorMessage(err, 'Category was not saved.'));
    }
  };

  const toggleActive = async (c: BugCategory) => {
    await saveCategory(c.id, { label: c.label, description: c.description, icon: c.icon, sortOrder: c.sortOrder, active: !c.active });
  };

  if (error) return <p className="rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>;
  if (!settings || !categories) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Card
          title="Who can report bugs"
          subtitle={settings.updatedBy ? `Last changed by ${settings.updatedBy.name}, ${absoluteTime(settings.updatedAt)}` : undefined}
        >
          <div className="grid gap-2">
            {MODES.map((m) => (
              <label
                key={m}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition ${
                  mode === m ? 'border-ink bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                } ${!canConfigure ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                <input type="radio" name="intake-mode" className="mt-0.5 accent-[var(--ink)]" checked={mode === m} disabled={!canConfigure} onChange={() => setMode(m)} />
                <span>
                  <span className="block text-[13px] font-semibold text-slate-800">{INTAKE_MODE_LABEL[m]}</span>
                  <span className="block text-[12px] text-slate-500">{INTAKE_MODE_HINT[m]}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="mt-4 grid gap-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">Release label</span>
              <input
                className={inputClass}
                value={releaseLabel}
                maxLength={60}
                disabled={!canConfigure}
                onChange={(e) => setReleaseLabel(e.target.value)}
                placeholder="e.g. Test release 0.9 — stamped on every new report"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">Message on the report form</span>
              <textarea
                className={`${inputClass} h-auto py-2`}
                rows={2}
                value={intakeMessage}
                maxLength={280}
                disabled={!canConfigure}
                onChange={(e) => setIntakeMessage(e.target.value)}
              />
            </label>
          </div>

          {canConfigure && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={save}
                disabled={!dirty || saving}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12.5px] font-bold text-on-ink hover:bg-ink-hover disabled:opacity-40"
              >
                {saving && <Loader2 size={13} className="animate-spin" />} Save changes
              </button>
            </div>
          )}
        </Card>

        <Card
          title={`Testers (${settings.testers.length})`}
          subtitle="Accounts holding the Tester policy. They see the bug button while intake is “Testers only”."
          action={
            <Link
              href="/console/iam"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Shield size={12} /> Manage in IAM
            </Link>
          }
        >
          {settings.testers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-[12.5px] text-slate-400">
              No testers yet. In IAM, grant the <span className="font-semibold text-slate-600">Tester</span> policy to the people testing this release.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {settings.testers.map((t) => (
                <li key={t.id} className="flex items-center gap-2.5 py-2">
                  <PersonAvatar name={t.name} avatarUrl={t.avatarUrl} size={26} />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold text-slate-800">{t.name}</span>
                    {t.email && <span className="block truncate text-[11.5px] text-slate-400">{t.email}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card
        title="Report categories"
        subtitle="The reasons reporters pick from. Retire a category to hide it from the form — reports already filed keep it."
        action={
          canConfigure && editing === null ? (
            <button
              type="button"
              onClick={() => setEditing('new')}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[12px] font-bold text-on-ink hover:bg-ink-hover"
            >
              <Plus size={12} /> Add
            </button>
          ) : null
        }
      >
        <div className="space-y-2">
          {editing === 'new' && (
            <CategoryEditor
              isNew
              initial={{ code: '', label: '', description: '', icon: 'bug' }}
              onCancel={() => setEditing(null)}
              onSave={(body) => saveCategory(null, body)}
            />
          )}
          {categories.map((c) =>
            editing === c.id ? (
              <CategoryEditor
                key={c.id}
                isNew={false}
                initial={{ code: c.code, label: c.label, description: c.description, icon: c.icon, sortOrder: c.sortOrder, active: c.active }}
                onCancel={() => setEditing(null)}
                onSave={(body) => saveCategory(c.id, body)}
              />
            ) : (
              <div
                key={c.id}
                className={`flex items-center gap-3 rounded-xl border border-slate-200/80 px-3 py-2.5 ${c.active ? '' : 'bg-slate-50 opacity-60'}`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <CategoryIcon icon={c.icon} size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-semibold text-slate-800">{c.label}</span>
                    <span className="font-mono text-[10.5px] text-slate-400">{c.code}</span>
                    {!c.active && <span className="rounded bg-slate-200 px-1.5 text-[10px] font-bold uppercase text-slate-500">Retired</span>}
                  </span>
                  {c.description && <span className="block truncate text-[11.5px] text-slate-400">{c.description}</span>}
                </span>
                {canConfigure && (
                  <span className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleActive(c)}
                      className="cursor-pointer rounded-full px-2.5 py-1 text-[11.5px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    >
                      {c.active ? 'Retire' : 'Restore'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(c.id)}
                      aria-label={`Edit ${c.label}`}
                      className="cursor-pointer rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <Pencil size={13} />
                    </button>
                  </span>
                )}
              </div>
            ),
          )}
          {categories.length === 0 && (
            <p className="flex items-center justify-center gap-1.5 py-6 text-[12.5px] text-slate-400">
              <X size={13} /> No categories.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
