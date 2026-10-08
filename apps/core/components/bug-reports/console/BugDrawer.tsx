/* eslint-disable react-hooks/set-state-in-effect -- loading/error flags reset when the open report changes */
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ClipboardCopy, Download, ExternalLink, FileCode2, ImagePlus, Link2, Loader2, UserCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  absoluteTime,
  BugAttachmentGallery,
  BugChatComposer,
  BugImpactBadge,
  BugPriorityBadge,
  BugStatusBadge,
  BugTimeline,
  BugTriageService,
  buildBugReportExport,
  CategoryIcon,
  downloadJson,
  IMPACT_LABEL,
  PersonAvatar,
  PRIORITY_LABEL,
  relativeTime,
  RESOLUTION_LABEL,
  SEVERITY_LABEL,
  STATUS_LABEL,
  type BugCategory,
  type BugPerson,
  type BugPriority,
  type BugReportDetail,
  type BugResolution,
  type BugTimelineFilter,
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

  const [techOpen, setTechOpen] = useState(false);
  const [feed, setFeed] = useState<BugTimelineFilter>('all');
  const [exporting, setExporting] = useState(false);
  const [mounted, setMounted] = useState(false);
  /** Phones show one pane at a time; wide screens show both. */
  const [pane, setPane] = useState<'chat' | 'details'>('chat');
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Portalled to <body>: inside the app shell's stacking context the floating navbar and the bug
  // island would paint over the drawer.
  useEffect(() => setMounted(true), []);

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

  // Coming back to the tab picks up replies (and read ticks) that arrived meanwhile.
  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState !== 'visible') return;
      BugTriageService.detail(bugId).then(setDetail).catch(() => undefined);
    };
    document.addEventListener('visibilitychange', onFocus);
    return () => document.removeEventListener('visibilitychange', onFocus);
  }, [bugId]);

  // Open at the newest message and follow the conversation.
  const activityCount = detail?.activity.length ?? 0;
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [bugId, activityCount, pane]);

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

  const sendComment = async (body: string, internal: boolean) => {
    const ok = await act('comment', () => BugTriageService.comment(bugId, body, internal));
    if (ok) {
      if (feed === 'events') setFeed('all');
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }));
    }
    return ok;
  };

  const exportJson = async () => {
    if (!detail) return;
    setExporting(true);
    try {
      const data = await buildBugReportExport(detail, {
        trackerUrl: permalink,
        exportedBy: user ? { id: user.id, name: user.fullName, email: user.email, avatarUrl: null } : null,
        names,
      });
      downloadJson(`${detail.summary.key}.json`, data);
      const linked = data.screenshots.filter((x) => 'url' in x).length;
      toast.success(
        linked ? `${detail.summary.key}.json downloaded — ${linked} screenshot link${linked > 1 ? 's' : ''} expire in ~30 min` : `${detail.summary.key}.json downloaded`,
      );
    } catch (err) {
      toast.error(errorMessage(err, 'Could not build the export.'));
    } finally {
      setExporting(false);
    }
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

  const commentCount = detail?.activity.filter((e) => e.kind === 'COMMENT' || e.kind === 'CREATED').length ?? 0;
  const iconButton =
    'cursor-pointer rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40';
  const sectionTitle = 'mb-2 text-[10.5px] font-bold uppercase tracking-wider text-slate-400';

  if (!mounted) return null;

  const chat = detail && s && (
    <div className={`min-h-0 flex-col lg:flex ${pane === 'chat' ? 'flex' : 'hidden'}`}>
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-200/70 px-4 py-2.5">
        {s.reporter && <PersonAvatar name={s.reporter.name} avatarUrl={s.reporter.avatarUrl} size={34} />}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-slate-800">{s.reporter?.name ?? 'Unknown reporter'}</p>
          <p className="truncate text-[11.5px] text-slate-400">
            {s.receipts.reporterReadAt ? `Last opened ${relativeTime(s.receipts.reporterReadAt)}` : 'Has not opened the report since filing'}
          </p>
        </div>
        <div role="tablist" aria-label="Show" className="inline-flex shrink-0 gap-0.5 rounded-full bg-slate-100 p-0.5 text-[11px] font-semibold">
          {(
            [
              ['all', 'All'],
              ['comments', `Messages ${commentCount}`],
              ['events', `Changes ${detail.activity.length - commentCount}`],
            ] as [BugTimelineFilter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={feed === key}
              onClick={() => setFeed(key)}
              className={`cursor-pointer rounded-full px-2.5 py-0.5 transition ${feed === key ? 'bg-surface text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50/60 px-4 py-3">
        <BugTimeline
          activity={detail.activity}
          audience="staff"
          names={names}
          viewerId={user?.id}
          filter={feed}
          receipts={s.receipts}
          report={{ title: s.title, description: detail.description, expected: detail.expected, attachments: [] }}
        />
      </div>

      {detail.allowedActions.includes('COMMENT') || detail.allowedActions.includes('NOTE') ? (
        <footer className="shrink-0 border-t border-slate-200/70 px-4 pb-3 pt-2.5">
          <BugChatComposer
            allowInternal={detail.allowedActions.includes('NOTE')}
            onSend={sendComment}
            onAttach={
              detail.allowedActions.includes('ATTACH')
                ? async (file) => {
                    await act('attach', async () => BugTriageService.attach(bugId, await prepareImageForUpload(file), file.name), 'Screenshot added');
                  }
                : undefined
            }
            placeholder={{
              reply: `Reply to ${s.reporter?.name?.split(' ')[0] ?? 'the reporter'}…`,
              internal: 'Only staff will see this note…',
            }}
          />
        </footer>
      ) : null}
    </div>
  );

  const details = detail && s && (
    <div className={`min-h-0 flex-col overflow-y-auto overscroll-contain border-slate-200/70 lg:flex lg:border-l ${pane === 'details' ? 'flex' : 'hidden'}`}>
      <div className="space-y-6 px-5 py-5">
        {/* Workflow */}
        <section>
          <h3 className={sectionTitle}>Move to</h3>
          <div className="flex flex-wrap gap-1.5">
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
          </div>
          {s.resolution && (
            <p className="mt-2 text-[12px] text-slate-500">
              {RESOLUTION_LABEL[s.resolution]}
              {detail.duplicateOfId && (
                <>
                  {' of '}
                  <button type="button" onClick={() => onOpenBug(detail.duplicateOfId!)} className="cursor-pointer font-mono font-bold text-indigo-600 hover:underline dark:text-indigo-400">
                    {detail.duplicateOfKey}
                  </button>
                </>
              )}
            </p>
          )}
          {target && (
            <div className="mt-3 space-y-2.5 rounded-2xl border border-slate-200/80 p-3">
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
                      className="h-8 w-40 rounded-lg border border-slate-200 bg-surface px-2 font-mono text-[12px] focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/25"
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
                className="w-full resize-none rounded-xl border border-slate-200 bg-surface px-3 py-2 text-[12.5px] focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/25"
              />
              <label className="flex cursor-pointer items-center gap-2 text-[12px] text-slate-600">
                <input type="checkbox" checked={notifyReporter} onChange={(e) => setNotifyReporter(e.target.checked)} className="accent-[var(--ink)]" />
                Show the note to the reporter
              </label>
              <div className="flex justify-end gap-1.5">
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
          )}
        </section>

        {/* Triage fields */}
        <section className="grid grid-cols-2 gap-3">
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

        {/* Reporter */}
        <section>
          <h3 className={sectionTitle}>Reported</h3>
          <dl className="grid grid-cols-[84px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[12px]">
            <dt className="text-slate-400">By</dt>
            <dd className="min-w-0 truncate text-slate-700" title={s.reporter?.email ?? undefined}>
              {s.reporter?.name ?? 'Unknown'}
              {s.reporter?.email && <span className="text-slate-400"> · {s.reporter.email}</span>}
            </dd>
            <dt className="text-slate-400">When</dt>
            <dd className="text-slate-700">{absoluteTime(s.createdAt)}</dd>
            <dt className="text-slate-400">Impact</dt>
            <dd>
              <BugImpactBadge impact={s.impact} />
            </dd>
            <dt className="text-slate-400">Category</dt>
            <dd className="inline-flex items-center gap-1 text-slate-700">
              <CategoryIcon icon={s.category.icon} size={12} /> {s.category.label}
            </dd>
          </dl>
        </section>

        {/* Screenshots */}
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
          {detail.attachments.length ? <BugAttachmentGallery attachments={detail.attachments} size="sm" /> : <p className="text-[12px] text-slate-400">None attached.</p>}
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
              <dl className="grid grid-cols-[96px_minmax(0,1fr)] gap-x-3 gap-y-1.5">
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
                  <pre className="theme-fixed max-h-64 overflow-auto rounded-xl bg-black/90 p-3 font-mono text-[11px] leading-relaxed text-slate-200">
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
      </div>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[110] flex justify-end" role="dialog" aria-modal="true" aria-label={s ? `${s.key}: ${s.title}` : 'Bug report'}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-slate-950/40 backdrop-blur-[2px]" />
      <aside className="relative flex h-full w-full max-w-[1180px] flex-col overflow-hidden border-l border-slate-200/80 bg-surface shadow-2xl">
        <header className="shrink-0 border-b border-slate-200/70 px-5 pb-3 pt-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
              <button
                type="button"
                onClick={() => s && copy(s.key, s.key)}
                title="Copy ID"
                className="cursor-pointer rounded-md font-mono text-[12px] font-bold text-slate-500 hover:text-slate-800"
              >
                {s?.key ?? '…'}
              </button>
              {s && <BugStatusBadge status={s.status} />}
              {s && <BugImpactBadge impact={s.impact} />}
              {s?.priority && <BugPriorityBadge priority={s.priority} />}
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <button type="button" onClick={() => copy(permalink, 'Link')} title="Copy link" aria-label="Copy link" className={iconButton}>
                <Link2 size={16} />
              </button>
              <button
                type="button"
                disabled={!detail}
                onClick={() => detail && copy(toMarkdown(detail, permalink), 'Markdown')}
                title="Copy as Markdown (for GitHub / Linear)"
                aria-label="Copy as Markdown"
                className={iconButton}
              >
                <ClipboardCopy size={16} />
              </button>
              <button
                type="button"
                disabled={!detail || exporting}
                onClick={exportJson}
                title="Download the full report as JSON — description, context, console, screenshots and every activity entry"
                className="ml-1 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-surface px-3 py-1.5 text-[12px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} JSON
              </button>
              <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
              <button type="button" onClick={onClose} aria-label="Close" title="Close (Esc)" className={iconButton}>
                <X size={18} />
              </button>
            </div>
          </div>
          {s ? (
            <h2 className="mt-1.5 line-clamp-2 text-[17px] font-bold leading-snug tracking-tight text-ink" title={s.title}>
              {s.title}
            </h2>
          ) : (
            <div className="mt-2 h-6 w-2/3 animate-pulse rounded bg-slate-100" />
          )}
          {detail && (
            <div className="mt-2.5 flex gap-1 rounded-full bg-slate-100 p-0.5 text-[12px] font-semibold lg:hidden">
              {(['chat', 'details'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPane(p)}
                  className={`flex-1 cursor-pointer rounded-full py-1 capitalize transition ${pane === p ? 'bg-surface text-slate-900 shadow-xs' : 'text-slate-500'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </header>

        {error && <p className="m-5 rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}
        {!detail && !error && (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        )}
        {detail && (
          <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_380px]">
            {chat}
            {details}
          </div>
        )}
      </aside>
    </div>,
    document.body,
  );
}
