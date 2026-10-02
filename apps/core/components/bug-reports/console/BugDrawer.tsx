/* eslint-disable react-hooks/set-state-in-effect -- loading/error flags reset when the open report changes */
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ClipboardCopy, ExternalLink, FileCode2, ImagePlus, Link2, Loader2, Lock, Send, UserCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  absoluteTime,
  BugAttachmentGallery,
  BugImpactBadge,
  BugStatusBadge,
  BugTimeline,
  BugTriageService,
  CategoryIcon,
  IMPACT_LABEL,
  PersonAvatar,
  PRIORITY_LABEL,
  RESOLUTION_LABEL,
  SEVERITY_LABEL,
  STATUS_LABEL,
  type BugCategory,
  type BugPerson,
  type BugPriority,
  type BugReportDetail,
  type BugResolution,
  type BugSeverity,
  type BugStatus,
  type TriageField,
} from '@/domains/bug-reports';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { prepareImageForUpload } from '@/infrastructure/media/screenshot';

const TRANSITION_VERB: Record<BugStatus, string> = {
  NEW: 'Mark new',
  TRIAGED: 'Confirm',
  IN_PROGRESS: 'Start work',
  NEEDS_INFO: 'Ask reporter',
  RESOLVED: 'Resolve',
  CLOSED: 'Close',
};

const RESOLUTIONS: BugResolution[] = ['FIXED', 'DUPLICATE', 'WONT_FIX', 'CANNOT_REPRODUCE', 'NOT_A_BUG'];

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

function flatten(value: unknown, prefix = ''): [string, string][] {
  if (value === null || value === undefined) return [];
  if (typeof value !== 'object') return [[prefix, String(value)]];
  return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k));
}

/** The report as an issue body — paste into GitHub, Linear or a PR. */
function toMarkdown(d: BugReportDetail, url: string): string {
  const s = d.summary;
  const lines = [
    `### ${s.key}: ${s.title}`,
    '',
    `**Status:** ${STATUS_LABEL[s.status]}${s.resolution ? ` (${RESOLUTION_LABEL[s.resolution]})` : ''} · **Impact:** ${IMPACT_LABEL[s.impact]}` +
      (s.severity ? ` · **Severity:** ${s.severity}` : '') +
      (s.priority ? ` · **Priority:** ${s.priority}` : ''),
    `**Category:** ${s.category.label} · **Reported:** ${absoluteTime(s.createdAt)} by ${s.reporter?.name ?? 'unknown'}`,
    `**Page:** ${d.pageUrl ?? s.route ?? '—'}`,
    `**Build:** ${d.appVersion ?? '—'}${s.releaseLabel ? ` · ${s.releaseLabel}` : ''}`,
    `**Browser:** ${d.userAgent ?? '—'}`,
    `**Tracker:** ${url}`,
    '',
    '#### What happened',
    d.description,
  ];
  if (d.expected) lines.push('', '#### Expected', d.expected);
  const env = flatten(d.environment);
  if (env.length) lines.push('', '#### Environment', ...env.map(([k, v]) => `- \`${k}\`: ${v}`));
  if (d.consoleLog?.length) {
    lines.push('', '#### Console', '```', ...d.consoleLog.map((e) => `[${e.level ?? 'log'}] ${e.message ?? ''}`), '```');
  }
  if (d.attachments.length) lines.push('', `_${d.attachments.length} screenshot(s) attached in the tracker._`);
  return lines.join('\n');
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10.5px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      {children}
    </label>
  );
}

const selectClass =
  'h-8 w-full cursor-pointer rounded-lg border border-slate-200 bg-surface px-2 text-[12px] font-semibold text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/25';

/**
 * One report, everything about it, and every triage action. The backend decides which status
 * moves are offered (`allowedTransitions`) and re-checks each one.
 */
export function BugDrawer({
  bugId,
  onClose,
  onOpenBug,
  onChanged,
}: {
  bugId: string;
  onClose: () => void;
  onOpenBug: (id: string) => void;
  onChanged: () => void;
}) {
  const { user } = useAuthStore();
  const [detail, setDetail] = useState<BugReportDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assignees, setAssignees] = useState<BugPerson[]>([]);
  const [categories, setCategories] = useState<BugCategory[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  const [target, setTarget] = useState<BugStatus | null>(null);
  const [resolution, setResolution] = useState<BugResolution>('FIXED');
  const [duplicateOf, setDuplicateOf] = useState('');
  const [note, setNote] = useState('');
  const [notifyReporter, setNotifyReporter] = useState(true);

  const [comment, setComment] = useState('');
  const [internal, setInternal] = useState(false);
  const [techOpen, setTechOpen] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    setError(null);
    setTarget(null);
    BugTriageService.detail(bugId)
      .then((d) => !cancelled && setDetail(d))
      .catch((err) => !cancelled && setError(errorMessage(err, 'Could not load this report.')));
    return () => {
      cancelled = true;
    };
  }, [bugId]);

  useEffect(() => {
    BugTriageService.assignees().then(setAssignees).catch(() => undefined);
    BugTriageService.categories().then(setCategories).catch(() => undefined);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !document.querySelector('[aria-modal="true"][data-capture-ignore]') && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const names = useMemo(() => {
    const map: Record<string, string> = {};
    assignees.forEach((p) => (map[p.id] = p.name));
    categories.forEach((c) => (map[c.id] = c.label));
    return map;
  }, [assignees, categories]);

  const apply = (next: BugReportDetail) => {
    setDetail(next);
    onChanged();
  };

  const act = async (key: string, fn: () => Promise<BugReportDetail>, success?: string) => {
    setSaving(key);
    try {
      apply(await fn());
      if (success) toast.success(success);
      return true;
    } catch (err) {
      toast.error(errorMessage(err, 'That change was not saved.'));
      return false;
    } finally {
      setSaving(null);
    }
  };

  const updateField = (field: TriageField, value: string | null) =>
    act(field, () => BugTriageService.update(bugId, { fields: [field], [field]: value || null }));

  const startTransition = (to: BugStatus) => {
    setTarget(to);
    setNote('');
    setDuplicateOf('');
    setResolution(detail?.summary.resolution ?? 'FIXED');
    setNotifyReporter(to === 'NEEDS_INFO' || to === 'RESOLVED');
  };

  const confirmTransition = async () => {
    if (!target || !detail) return;
    if (target === 'NEEDS_INFO' && !note.trim()) {
      toast.error('Write the question for the reporter.');
      return;
    }
    const needsResolution = target === 'RESOLVED' || target === 'CLOSED';
    const dupNumber = Number(duplicateOf.replace(/^BUG-?/i, ''));
    if (needsResolution && resolution === 'DUPLICATE' && !(dupNumber > 0)) {
      toast.error('Give the BUG number this duplicates.');
      return;
    }
    const ok = await act(
      'transition',
      () =>
        BugTriageService.transition(bugId, {
          status: target,
          ...(needsResolution ? { resolution } : {}),
          ...(needsResolution && resolution === 'DUPLICATE' ? { duplicateOfNumber: dupNumber } : {}),
          note: note.trim() || undefined,
          notifyReporter,
        }),
      `Moved to ${STATUS_LABEL[target]}`,
    );
    if (ok) setTarget(null);
  };

  const sendComment = async () => {
    if (!comment.trim()) return;
    const ok = await act('comment', () => BugTriageService.comment(bugId, comment.trim(), internal));
    if (ok) setComment('');
  };

  const permalink = typeof window !== 'undefined' ? `${window.location.origin}/console/bugs?bug=${bugId}` : '';
  const copy = (text: string, what: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${what} copied`),
      () => toast.error('Clipboard is not available'),
    );
  };

  const s = detail?.summary;
  const env = flatten(detail?.environment);

  return (
    <div className="fixed inset-0 z-[80] flex justify-end" role="dialog" aria-modal="true" aria-label="Bug report">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-slate-900/30 backdrop-blur-[2px]" />
      <aside className="relative flex h-full w-full max-w-[720px] flex-col overflow-y-auto bg-surface shadow-2xl">
        <header className="sticky top-0 z-10 border-b border-slate-100 bg-surface/95 px-5 py-3.5 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="font-mono text-[12px] font-bold text-slate-500">{s?.key ?? '…'}</span>
              {s && <BugStatusBadge status={s.status} />}
              {s && <BugImpactBadge impact={s.impact} />}
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => copy(permalink, 'Link')} title="Copy link" className="cursor-pointer rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <Link2 size={16} />
              </button>
              <button
                type="button"
                disabled={!detail}
                onClick={() => detail && copy(toMarkdown(detail, permalink), 'Markdown')}
                title="Copy as Markdown (for GitHub / Linear)"
                className="cursor-pointer rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <ClipboardCopy size={16} />
              </button>
              <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
          </div>
          {s && <h2 className="mt-1.5 text-[17px] font-bold leading-snug tracking-tight text-ink">{s.title}</h2>}
        </header>

        {error && <p className="m-5 rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}
        {!detail && !error && (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        )}

        {detail && s && (
          <div className="space-y-6 px-5 py-5">
            {/* Workflow */}
            <section className="rounded-2xl border border-slate-200/80 p-3.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Move to</span>
                {detail.allowedTransitions.map((to) => (
                  <button
                    key={to}
                    type="button"
                    onClick={() => startTransition(to)}
                    className={`cursor-pointer rounded-full px-3 py-1 text-[12px] font-semibold ring-1 transition ${
                      target === to ? 'bg-ink text-on-ink ring-ink' : 'bg-surface text-slate-600 ring-slate-200 hover:ring-slate-300'
                    }`}
                  >
                    {TRANSITION_VERB[to]}
                  </button>
                ))}
                {s.resolution && (
                  <span className="ml-auto text-[12px] text-slate-500">
                    {RESOLUTION_LABEL[s.resolution]}
                    {detail.duplicateOfId && (
                      <>
                        {' of '}
                        <button type="button" onClick={() => onOpenBug(detail.duplicateOfId!)} className="cursor-pointer font-mono font-bold text-indigo-600 hover:underline dark:text-indigo-400">
                          {detail.duplicateOfKey}
                        </button>
                      </>
                    )}
                  </span>
                )}
              </div>
              {target && (
                <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-3">
                  {(target === 'RESOLVED' || target === 'CLOSED') && (
                    <div className="flex flex-wrap gap-2">
                      <select value={resolution} onChange={(e) => setResolution(e.target.value as BugResolution)} className={`${selectClass} w-auto`} aria-label="Resolution">
                        {RESOLUTIONS.map((r) => (
                          <option key={r} value={r}>
                            {RESOLUTION_LABEL[r]}
                          </option>
                        ))}
                      </select>
                      {resolution === 'DUPLICATE' && (
                        <input
                          value={duplicateOf}
                          onChange={(e) => setDuplicateOf(e.target.value)}
                          placeholder="Duplicate of BUG-…"
                          className="h-8 w-40 rounded-lg border border-slate-200 px-2 font-mono text-[12px] focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/25"
                        />
                      )}
                    </div>
                  )}
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    maxLength={4000}
                    placeholder={target === 'NEEDS_INFO' ? 'What do you need from the reporter?' : 'Note (optional)'}
                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-[12.5px] focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/25"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] text-slate-600">
                      <input type="checkbox" checked={notifyReporter} onChange={(e) => setNotifyReporter(e.target.checked)} className="accent-[var(--ink)]" />
                      Show the note to the reporter
                    </label>
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => setTarget(null)} className="cursor-pointer rounded-full px-3 py-1.5 text-[12px] font-semibold text-slate-500 hover:bg-slate-100">
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={confirmTransition}
                        disabled={saving === 'transition'}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-bold text-on-ink hover:bg-ink-hover disabled:opacity-60"
                      >
                        {saving === 'transition' && <Loader2 size={12} className="animate-spin" />}
                        {TRANSITION_VERB[target]}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Triage fields */}
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label="Severity">
                <select className={selectClass} value={s.severity ?? ''} disabled={saving === 'severity'} onChange={(e) => updateField('severity', e.target.value)}>
                  <option value="">Not set</option>
                  {(Object.keys(SEVERITY_LABEL) as BugSeverity[]).map((v) => (
                    <option key={v} value={v}>
                      {SEVERITY_LABEL[v]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Priority">
                <select className={selectClass} value={s.priority ?? ''} disabled={saving === 'priority'} onChange={(e) => updateField('priority', e.target.value)}>
                  <option value="">Not set</option>
                  {(Object.keys(PRIORITY_LABEL) as BugPriority[]).map((v) => (
                    <option key={v} value={v}>
                      {PRIORITY_LABEL[v]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Assignee">
                <div className="flex gap-1">
                  <select className={selectClass} value={s.assignee?.id ?? ''} disabled={saving === 'assigneeId'} onChange={(e) => updateField('assigneeId', e.target.value)}>
                    <option value="">Unassigned</option>
                    {assignees.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {user && s.assignee?.id !== user.id && assignees.some((p) => p.id === user.id) && (
                    <button
                      type="button"
                      onClick={() => updateField('assigneeId', user.id)}
                      title="Assign to me"
                      className="cursor-pointer rounded-lg border border-slate-200 px-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    >
                      <UserCheck size={13} />
                    </button>
                  )}
                </div>
              </Field>
              <Field label="Category">
                <select className={selectClass} value={s.category.id} disabled={saving === 'categoryId'} onChange={(e) => updateField('categoryId', e.target.value)}>
                  {categories
                    .filter((c) => c.active || c.id === s.category.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                </select>
              </Field>
            </section>

            {/* Report */}
            <section>
              <div className="mb-2 flex items-center gap-2 text-[12px] text-slate-500">
                {s.reporter && <PersonAvatar name={s.reporter.name} avatarUrl={s.reporter.avatarUrl} size={22} />}
                <span>
                  <span className="font-semibold text-slate-700">{s.reporter?.name ?? 'Unknown'}</span>
                  {s.reporter?.email && <span className="text-slate-400"> · {s.reporter.email}</span>} reported {absoluteTime(s.createdAt)}
                </span>
                <span className="ml-auto inline-flex items-center gap-1 text-slate-400">
                  <CategoryIcon icon={s.category.icon} size={12} /> {s.category.label}
                </span>
              </div>
              <div className="whitespace-pre-wrap rounded-2xl bg-slate-50 px-4 py-3 text-[13px] leading-relaxed text-slate-800">{detail.description}</div>
              {detail.expected && (
                <div className="mt-2 rounded-2xl border border-slate-200/80 px-4 py-3 text-[13px] leading-relaxed text-slate-700">
                  <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Expected</p>
                  <p className="whitespace-pre-wrap">{detail.expected}</p>
                </div>
              )}
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Screenshots ({detail.attachments.length})</h3>
                {detail.allowedActions.includes('ATTACH') && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={saving === 'attach'}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    >
                      {saving === 'attach' ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />} Add
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      hidden
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        if (file) await act('attach', async () => BugTriageService.attach(bugId, await prepareImageForUpload(file), file.name));
                      }}
                    />
                  </>
                )}
              </div>
              {detail.attachments.length ? <BugAttachmentGallery attachments={detail.attachments} /> : <p className="text-[12px] text-slate-400">None attached.</p>}
            </section>

            {/* Technical context */}
            <section className="rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setTechOpen((v) => !v)}
                aria-expanded={techOpen}
                className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-[12px] font-bold text-slate-600"
              >
                <FileCode2 size={14} className="text-slate-400" /> Technical details
                <ChevronDown size={14} className={`ml-auto transition ${techOpen ? 'rotate-180' : ''}`} />
              </button>
              {techOpen && (
                <div className="space-y-3 border-t border-slate-100 px-4 py-3 text-[12px]">
                  <dl className="grid grid-cols-[110px_minmax(0,1fr)] gap-x-3 gap-y-1.5">
                    <dt className="text-slate-400">Page</dt>
                    <dd className="min-w-0 break-all font-mono text-slate-700">
                      {detail.pageUrl ? (
                        <a href={detail.pageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400">
                          {detail.pageUrl} <ExternalLink size={11} />
                        </a>
                      ) : (
                        s.route ?? '—'
                      )}
                    </dd>
                    <dt className="text-slate-400">Build</dt>
                    <dd className="font-mono text-slate-700">
                      {detail.appVersion ?? '—'}
                      {s.releaseLabel ? <span className="text-slate-400"> · {s.releaseLabel}</span> : null}
                    </dd>
                    <dt className="text-slate-400">Browser</dt>
                    <dd className="break-words font-mono text-[11px] text-slate-700">{detail.userAgent ?? '—'}</dd>
                    {env.map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="truncate text-slate-400" title={k}>
                          {k}
                        </dt>
                        <dd className="break-words font-mono text-slate-700">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div>
                    <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Console ({detail.consoleLog?.length ?? 0})</p>
                    {detail.consoleLog?.length ? (
                      <pre className="max-h-64 overflow-auto rounded-xl bg-black/90 p-3 font-mono text-[11px] leading-relaxed text-slate-200">
                        {detail.consoleLog.map((e, i) => (
                          <div key={i} className={e.level === 'warn' ? 'text-amber-300' : e.level === 'error' || e.level === 'uncaught' || e.level === 'rejection' ? 'text-rose-300' : ''}>
                            <span className="select-none text-slate-500">{e.at ? new Date(e.at).toLocaleTimeString() : ''} </span>[{e.level}] {e.message}
                          </div>
                        ))}
                      </pre>
                    ) : (
                      <p className="text-slate-400">Nothing captured (or the reporter turned technical details off).</p>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Activity */}
            <section>
              <h3 className="mb-3 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Activity</h3>
              <BugTimeline activity={detail.activity} audience="staff" names={names} />
            </section>

            <section className="sticky bottom-0 -mx-5 border-t border-slate-100 bg-surface px-5 pb-5 pt-3">
              <div className="mb-2 flex gap-1 rounded-full bg-slate-100 p-0.5 text-[11.5px] font-semibold">
                <button
                  type="button"
                  onClick={() => setInternal(false)}
                  className={`flex-1 cursor-pointer rounded-full py-1 ${!internal ? 'bg-surface text-slate-900 shadow-xs' : 'text-slate-500'}`}
                >
                  Reply to reporter
                </button>
                <button
                  type="button"
                  onClick={() => setInternal(true)}
                  className={`inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-full py-1 ${internal ? 'bg-amber-100 text-amber-900 shadow-xs dark:bg-amber-500/15 dark:text-amber-200' : 'text-slate-500'} dark:bg-amber-500/15 dark:text-amber-200`}
                >
                  <Lock size={11} /> Internal note
                </button>
              </div>
              <div className="flex items-end gap-2">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendComment();
                  }}
                  rows={2}
                  maxLength={4000}
                  placeholder={internal ? 'Only staff will see this… (Ctrl+Enter to send)' : 'The reporter will be notified… (Ctrl+Enter to send)'}
                  className={`min-w-0 flex-1 resize-none rounded-xl border px-3 py-2 text-[12.5px] focus:outline-none focus:ring-2 ${
                    internal ? 'border-amber-300 bg-amber-50/50 focus:ring-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:focus:ring-amber-500/25' : 'border-slate-200 focus:border-indigo-300 focus:ring-indigo-100 dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/25'
                  }`}
                />
                <button
                  type="button"
                  onClick={sendComment}
                  disabled={!comment.trim() || saving === 'comment'}
                  aria-label="Send"
                  className="cursor-pointer rounded-full bg-ink p-2.5 text-on-ink hover:bg-ink-hover disabled:opacity-40"
                >
                  {saving === 'comment' ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </button>
              </div>
            </section>
          </div>
        )}
      </aside>
    </div>
  );
}
