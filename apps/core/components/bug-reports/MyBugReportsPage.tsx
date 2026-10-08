/* eslint-disable react-hooks/set-state-in-effect -- the open report resets when the selected id changes */
'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * "My bug reports": a chat-style inbox of the account's own reports. The list (polled, so ticks and
 * new replies arrive on their own) sits beside the open conversation. "New report" opens the bug
 * island's report modal.
 * ------------------------------------------------------------------
 */

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Loader2, MessagesSquare, Plus, RefreshCw, Search, X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  BugReportService,
  BugReportThread,
  MyBugReportsList,
  type BugReportDetail,
  type BugReportSummary,
} from '@/domains/bug-reports';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { prepareImageForUpload } from '@/infrastructure/media/screenshot';
import { openBugIsland } from '@/apps/core/components/bug-reports/BugIsland';

type FilterTab = 'ALL' | 'UNREAD' | 'ACTIVE' | 'CLOSED';

const FILTERS: { id: FilterTab; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'UNREAD', label: 'Unread' },
  { id: 'ACTIVE', label: 'Open' },
  { id: 'CLOSED', label: 'Closed' },
];

/** How often the list is refreshed while the page is visible — new replies and ticks. */
const POLL_MS = 20_000;

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

/** Waiting on the reporter: either the team asked something, or a fix wants checking. */
const needsReporter = (r: BugReportSummary) => r.status === 'NEEDS_INFO' || r.status === 'RESOLVED';

function Placeholder({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">{icon}</span>
      <h2 className="mt-4 text-[15px] font-semibold text-ink">{title}</h2>
      <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-slate-500">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function MyBugReportsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const selectedId = params.get('id');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();

  const [detail, setDetail] = useState<BugReportDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  // Same query the bug island uses, so a report sent from the modal shows up here at once.
  const listKey = ['bug-reports-mine', user?.id];
  const listQuery = useQuery({
    queryKey: listKey,
    queryFn: () => BugReportService.mine(),
    enabled: !!user,
    refetchInterval: POLL_MS,
  });
  const reports = listQuery.data ?? null;
  const refreshList = () => queryClient.invalidateQueries({ queryKey: listKey });

  useEffect(() => {
    if (listQuery.error) toast.error(errorMessage(listQuery.error, "Couldn't load your reports."));
  }, [listQuery.error]);

  const loadDetail = (id: string) =>
    BugReportService.detail(id).then((d) => {
      setDetail(d);
      // Opening it read the team's replies — the unread badge should go.
      refreshList();
      return d;
    });

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetail(null);
    setDetailError(null);
    BugReportService.detail(selectedId)
      .then((d) => {
        if (cancelled) return;
        setDetail(d);
        queryClient.invalidateQueries({ queryKey: ['bug-reports-mine', user?.id] });
      })
      .catch((err) => !cancelled && setDetailError(errorMessage(err, "Couldn't open that report.")));
    return () => {
      cancelled = true;
    };
  }, [selectedId, queryClient, user?.id]);

  // The polled list notices new activity on the open report; fetch the conversation again then.
  const selectedSummary = reports?.find((r) => r.id === selectedId) ?? null;
  useEffect(() => {
    if (!detail || !selectedSummary || selectedSummary.id !== detail.summary.id) return;
    if (selectedSummary.lastActivityAt !== detail.summary.lastActivityAt) {
      loadDetail(detail.summary.id).catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only a change in activity should refetch
  }, [selectedSummary?.lastActivityAt]);

  const select = (id: string | null) => router.replace(id ? `${pathname}?id=${id}` : pathname, { scroll: false });

  const apply = (next: BugReportDetail) => {
    setDetail(next);
    refreshList();
  };

  const filteredReports = useMemo(() => {
    if (!reports) return [];
    const query = searchQuery.toLowerCase().trim();
    return reports.filter((r) => {
      if (activeTab === 'UNREAD' && !(r.unreadCount > 0 || needsReporter(r))) return false;
      if (activeTab === 'ACTIVE' && r.status === 'CLOSED') return false;
      if (activeTab === 'CLOSED' && r.status !== 'CLOSED') return false;
      if (!query) return true;
      return [r.key, r.title, r.category.label].some((v) => v.toLowerCase().includes(query));
    });
  }, [reports, activeTab, searchQuery]);

  const unreadTotal = reports?.filter((r) => r.unreadCount > 0 || needsReporter(r)).length ?? 0;

  const newReportButton = (
    <button
      type="button"
      onClick={() => openBugIsland('report')}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12.5px] font-semibold text-on-ink transition hover:bg-ink-hover"
    >
      <Plus size={14} /> New report
    </button>
  );

  const fade = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.16, ease: 'easeOut' as const } };

  return (
    <div className="mx-auto flex h-[calc(100dvh-5.5rem)] w-full max-w-6xl flex-col overflow-hidden px-3 pb-3 pt-20 sm:px-6">
      <div className="mb-4 flex shrink-0 flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Bug reports</h1>
          <p className="mt-0.5 text-[13px] text-slate-500">Reports you&apos;ve sent and replies from the Arcade team.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Refresh"
            aria-label="Refresh"
            disabled={listQuery.isFetching}
            onClick={() => listQuery.refetch()}
            className="grid size-9 cursor-pointer place-items-center rounded-full border border-slate-200 bg-surface text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:opacity-60"
          >
            <RefreshCw size={14} className={listQuery.isFetching ? 'animate-spin' : ''} />
          </button>
          {newReportButton}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 overflow-hidden rounded-3xl border border-slate-200/80 bg-surface shadow-[0_2px_8px_rgba(20,20,43,0.04)] lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* Inbox */}
        <aside className={`min-h-0 flex-col border-slate-200/70 lg:flex lg:border-r ${selectedId ? 'hidden' : 'flex'}`}>
          <div className="shrink-0 space-y-2.5 border-b border-slate-200/70 p-3">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports"
                aria-label="Search reports"
                className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-8 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-0.5 text-slate-400 hover:text-slate-700"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <div className="flex gap-1.5 overflow-x-auto">
              {FILTERS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-pressed={activeTab === tab.id}
                  className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${
                    activeTab === tab.id ? 'bg-ink text-on-ink' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {tab.label}
                  {tab.id === 'UNREAD' && unreadTotal > 0 && (
                    <span className={`rounded-full px-1.5 text-[10.5px] font-bold ${activeTab === tab.id ? 'bg-on-ink/20 text-on-ink' : 'bg-emerald-500 text-white'}`}>
                      {unreadTotal}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {reports === null ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : (
              <MyBugReportsList
                reports={filteredReports}
                selectedId={selectedId}
                onOpen={select}
                emptyHint={
                  searchQuery ? 'No reports match your search.' : reports.length === 0 ? 'Reports you send will appear here.' : 'Nothing in this view.'
                }
              />
            )}
          </div>
        </aside>

        {/* Conversation */}
        <section className={`min-h-0 flex-col lg:flex ${selectedId ? 'flex' : 'hidden'}`}>
          <AnimatePresence mode="wait" initial={false}>
            {!selectedId ? (
              <motion.div key="empty" className="h-full" {...fade}>
                {reports && reports.length === 0 ? (
                  <Placeholder
                    icon={<MessagesSquare size={24} />}
                    title="No reports yet"
                    body="Spotted something broken or confusing? Send a report and follow the team's replies here."
                    action={newReportButton}
                  />
                ) : (
                  <Placeholder
                    icon={<MessagesSquare size={24} />}
                    title="Select a report"
                    body="Pick a report to read the team's replies and continue the conversation."
                  />
                )}
              </motion.div>
            ) : detailError ? (
              <motion.div key="error" className="h-full" {...fade}>
                <Placeholder
                  icon={<AlertCircle size={24} />}
                  title="Couldn't open this report"
                  body={detailError}
                  action={
                    <button
                      type="button"
                      onClick={() => select(null)}
                      className="cursor-pointer rounded-full border border-slate-200 px-4 py-2 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Back to reports
                    </button>
                  }
                />
              </motion.div>
            ) : !detail ? (
              <motion.div key="loading" className="flex h-full items-center justify-center" {...fade}>
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </motion.div>
            ) : (
              <motion.div key={detail.summary.id} className="h-full min-h-0" {...fade}>
                <BugReportThread
                  detail={detail}
                  receipts={selectedSummary?.receipts}
                  headerAction={
                    <button
                      type="button"
                      onClick={() => select(null)}
                      aria-label="Back to reports"
                      className="-ml-1 grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
                    >
                      <ArrowLeft size={17} />
                    </button>
                  }
                  onComment={async (body) => {
                    try {
                      apply(await BugReportService.comment(detail.summary.id, body));
                      return true;
                    } catch (err) {
                      toast.error(errorMessage(err, "Couldn't send that."));
                      return false;
                    }
                  }}
                  onVerdict={async (stillHappening, note) => {
                    try {
                      apply(await BugReportService.verdict(detail.summary.id, stillHappening, note));
                      toast.success(stillHappening ? 'Reopened — the team will take another look.' : 'Thanks for confirming!');
                    } catch (err) {
                      toast.error(errorMessage(err, "Couldn't send that."));
                    }
                  }}
                  onAttach={async (file) => {
                    try {
                      apply(await BugReportService.attach(detail.summary.id, await prepareImageForUpload(file), file.name));
                    } catch (err) {
                      toast.error(errorMessage(err, "Couldn't upload that image."));
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
