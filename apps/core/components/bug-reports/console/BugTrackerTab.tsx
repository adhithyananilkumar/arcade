'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, ImageIcon, Loader2, MessageSquare, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  BugImpactBadge,
  BugPriorityBadge,
  BugStatusBadge,
  BugTriageService,
  CategoryIcon,
  IMPACT_SHORT,
  PersonAvatar,
  PRIORITY_LABEL,
  relativeTime,
  SEVERITY_LABEL,
  STATUS_LABEL,
  STATUS_ORDER,
  type BugCategory,
  type BugImpact,
  type BugPage,
  type BugPerson,
  type BugPriority,
  type BugReportSummary,
  type BugSeverity,
  type BugTrackerFilters,
} from '@/domains/bug-reports';

/** Saved views: the questions a triager actually asks, one click each. */
const VIEWS: { id: string; label: string; filters: Partial<BugTrackerFilters> }[] = [
  { id: 'open', label: 'All open', filters: { status: ['OPEN'] } },
  { id: 'new', label: 'Needs triage', filters: { status: ['NEW'], sort: 'oldest' } },
  { id: 'blockers', label: 'Blockers', filters: { status: ['OPEN'], impact: 'BLOCKER' } },
  { id: 'mine', label: 'Assigned to me', filters: { status: ['OPEN'], assignee: 'me', sort: 'priority' } },
  { id: 'unassigned', label: 'Unassigned', filters: { status: ['OPEN'], assignee: 'none' } },
  { id: 'waiting', label: 'Waiting on reporter', filters: { status: ['NEEDS_INFO'] } },
  { id: 'done', label: 'Resolved & closed', filters: { status: ['DONE'] } },
  { id: 'all', label: 'Everything', filters: {} },
];

const SORTS = [
  { id: 'activity', label: 'Recent activity' },
  { id: 'priority', label: 'Priority' },
  { id: 'impact', label: 'Impact' },
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
] as const;

const PAGE_SIZE = 25;

function Select({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-8 cursor-pointer rounded-full border bg-surface pl-3 pr-7 text-[12px] font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/25 ${
        value ? 'border-ink text-ink' : 'border-slate-200 text-slate-500'
      }`}
    >
      {children}
    </select>
  );
}

/** The tracker list. Filters live in the URL (via `params`/`onChangeParams`), so views are shareable. */
export function BugTrackerTab({
  params,
  onChangeParams,
  onOpenBug,
  refreshKey,
}: {
  params: URLSearchParams;
  onChangeParams: (changes: Record<string, string | null>) => void;
  onOpenBug: (id: string) => void;
  refreshKey: number;
}) {
  const viewId = VIEWS.some((v) => v.id === params.get('view')) ? params.get('view')! : 'open';
  const view = VIEWS.find((v) => v.id === viewId)!;
  const page = Math.max(0, Number(params.get('page') ?? 0) || 0);

  const filters: BugTrackerFilters = useMemo(() => {
    const explicitStatus = params.get('status');
    return {
      ...view.filters,
      ...(explicitStatus ? { status: [explicitStatus] } : {}),
      ...(params.get('categoryId') ? { categoryId: params.get('categoryId')! } : {}),
      ...(params.get('impact') ? { impact: params.get('impact') as BugImpact } : {}),
      ...(params.get('priority') ? { priority: params.get('priority') as BugPriority } : {}),
      ...(params.get('severity') ? { severity: params.get('severity') as BugSeverity } : {}),
      ...(params.get('assignee') ? { assignee: params.get('assignee')! } : {}),
      ...(params.get('q') ? { q: params.get('q')! } : {}),
      ...(params.get('sort') ? { sort: params.get('sort') as BugTrackerFilters['sort'] } : {}),
      page,
      size: PAGE_SIZE,
    };
  }, [params, view, page]);

  const [data, setData] = useState<BugPage<BugReportSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<BugCategory[]>([]);
  const [assignees, setAssignees] = useState<BugPerson[]>([]);
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    BugTriageService.categories().then(setCategories).catch(() => undefined);
    BugTriageService.assignees().then(setAssignees).catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag follows the query inputs
    setLoading(true);
    setError(null);
    BugTriageService.search(filters)
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setError(err?.message || 'Could not load bug reports.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filters, refreshKey]);

  // Debounced search into the URL.
  useEffect(() => {
    const current = params.get('q') ?? '';
    if (search === current) return;
    const t = setTimeout(() => onChangeParams({ q: search.trim() || null, page: null }), 300);
    return () => clearTimeout(t);
  }, [search, params, onChangeParams]);

  const set = (key: string, value: string) => onChangeParams({ [key]: value || null, page: null });
  const activeExtra = ['status', 'categoryId', 'impact', 'priority', 'severity', 'assignee', 'q'].filter((k) => params.get(k));

  const exportCsv = async () => {
    setExporting(true);
    try {
      await BugTriageService.exportCsv(filters);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() =>
              onChangeParams({ view: v.id, status: null, impact: null, assignee: null, page: null, sort: null, categoryId: null, priority: null, severity: null })
            }
            className={`cursor-pointer rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${
              viewId === v.id ? 'bg-ink text-on-ink' : 'bg-surface text-slate-500 ring-1 ring-slate-200 hover:text-slate-900'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-surface p-2 shadow-[0_2px_8px_rgba(20,20,43,0.04)]">
        <div className="relative min-w-[220px] flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, description, page, reporter — or BUG-1042"
            className="h-8 w-full rounded-full border border-slate-200 bg-slate-50 pl-8 pr-3 text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/25"
          />
        </div>
        <Select label="Status" value={params.get('status') ?? ''} onChange={(v) => set('status', v)}>
          <option value="">Status: view default</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
        <Select label="Category" value={params.get('categoryId') ?? ''} onChange={(v) => set('categoryId', v)}>
          <option value="">Any category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
              {c.active ? '' : ' (retired)'}
            </option>
          ))}
        </Select>
        <Select label="Impact" value={params.get('impact') ?? ''} onChange={(v) => set('impact', v)}>
          <option value="">Any impact</option>
          {(['BLOCKER', 'MAJOR', 'MINOR'] as BugImpact[]).map((i) => (
            <option key={i} value={i}>
              {IMPACT_SHORT[i]}
            </option>
          ))}
        </Select>
        <Select label="Priority" value={params.get('priority') ?? ''} onChange={(v) => set('priority', v)}>
          <option value="">Any priority</option>
          {(Object.keys(PRIORITY_LABEL) as BugPriority[]).map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </Select>
        <Select label="Severity" value={params.get('severity') ?? ''} onChange={(v) => set('severity', v)}>
          <option value="">Any severity</option>
          {(Object.keys(SEVERITY_LABEL) as BugSeverity[]).map((s) => (
            <option key={s} value={s}>
              {SEVERITY_LABEL[s]}
            </option>
          ))}
        </Select>
        <Select label="Assignee" value={params.get('assignee') ?? ''} onChange={(v) => set('assignee', v)}>
          <option value="">Anyone</option>
          <option value="me">Me</option>
          <option value="none">Unassigned</option>
          {assignees.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Select label="Sort" value={params.get('sort') ?? ''} onChange={(v) => set('sort', v)}>
          <option value="">Sort: view default</option>
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
        {activeExtra.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              onChangeParams(Object.fromEntries([...activeExtra, 'sort', 'page'].map((k) => [k, null])));
            }}
            className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full px-3 text-[12px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={12} /> Clear
          </button>
        )}
        <button
          type="button"
          onClick={exportCsv}
          disabled={exporting}
          className="ml-auto inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 px-3 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} CSV
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-surface shadow-[0_2px_8px_rgba(20,20,43,0.04)]">
        {error && <p className="m-4 rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-2.5">Report</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Impact</th>
                <th className="px-3 py-2.5">Pri</th>
                <th className="px-3 py-2.5">Assignee</th>
                <th className="px-3 py-2.5">Reporter</th>
                <th className="px-4 py-2.5 text-right">Activity</th>
              </tr>
            </thead>
            <tbody className={loading ? 'opacity-50' : ''}>
              {data?.content.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => onOpenBug(r.id)}
                  onKeyDown={(e) => e.key === 'Enter' && onOpenBug(r.id)}
                  tabIndex={0}
                  className="cursor-pointer border-b border-slate-50 transition last:border-0 hover:bg-slate-50/80 focus:bg-indigo-50/40 focus:outline-none dark:focus:bg-indigo-500/10"
                >
                  <td className="max-w-[420px] px-4 py-3">
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500" title={r.category.label}>
                        <CategoryIcon icon={r.category.icon} size={13} />
                      </span>
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-[13px] text-slate-800">
                          <span className={`min-w-0 truncate ${r.unreadCount > 0 ? 'font-bold' : 'font-semibold'}`}>
                            <span className="mr-1.5 font-mono text-[11px] font-bold text-slate-400">{r.key}</span>
                            {r.title}
                          </span>
                          {r.unreadCount > 0 && (
                            <span
                              className="grid h-[18px] min-w-[18px] shrink-0 place-items-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-white"
                              title={`${r.unreadCount} unread from the reporter`}
                            >
                              {r.unreadCount}
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 flex items-center gap-2 truncate text-[11px] text-slate-400">
                          <span className="truncate font-mono">{r.route ?? '—'}</span>
                          {r.commentCount > 0 && (
                            <span className="inline-flex shrink-0 items-center gap-0.5">
                              <MessageSquare size={10} /> {r.commentCount}
                            </span>
                          )}
                          {r.attachmentCount > 0 && (
                            <span className="inline-flex shrink-0 items-center gap-0.5">
                              <ImageIcon size={10} /> {r.attachmentCount}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <BugStatusBadge status={r.status} />
                  </td>
                  <td className="px-3 py-3">
                    <BugImpactBadge impact={r.impact} />
                  </td>
                  <td className="px-3 py-3">
                    <BugPriorityBadge priority={r.priority} />
                  </td>
                  <td className="px-3 py-3">
                    {r.assignee ? (
                      <span className="inline-flex max-w-[140px] items-center gap-1.5 text-[12px] font-medium text-slate-700">
                        <PersonAvatar name={r.assignee.name} avatarUrl={r.assignee.avatarUrl} size={20} />
                        <span className="truncate">{r.assignee.name}</span>
                      </span>
                    ) : (
                      <span className="text-[12px] text-slate-300">Unassigned</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span className="block max-w-[140px] truncate text-[12px] text-slate-600" title={r.reporter?.email ?? undefined}>
                      {r.reporter?.name ?? '—'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-[11.5px] text-slate-400">{relativeTime(r.lastActivityAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && !data && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        )}
        {data && data.content.length === 0 && !loading && (
          <p className="py-12 text-center text-[13px] text-slate-400">No reports match this view.</p>
        )}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-[12px] text-slate-500">
            <span>
              {data.number * data.size + 1}–{Math.min((data.number + 1) * data.size, data.totalElements)} of {data.totalElements}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => onChangeParams({ page: String(page - 1) })}
                aria-label="Previous page"
                className="cursor-pointer rounded-full p-1.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                disabled={page + 1 >= data.totalPages}
                onClick={() => onChangeParams({ page: String(page + 1) })}
                aria-label="Next page"
                className="cursor-pointer rounded-full p-1.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
