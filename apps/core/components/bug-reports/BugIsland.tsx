'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * The floating "island" bug button shown to accounts the backend says may report bugs. Orchestrates
 * the bug-reports domain: asks for intake, captures diagnostics and screenshots, sends, and shows
 * the reporter's own reports.
 * ------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Bug, CircleCheck, ExternalLink, Inbox, LayoutList, Minus, X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  BugReportComposer,
  BugReportService,
  BugReportThread,
  MyBugReportsList,
  type BugDraft,
  type BugReportDetail,
} from '@/domains/bug-reports';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { APP_VERSION } from '@/infrastructure/config/env';
import { captureVisiblePage, prepareImageForUpload } from '@/infrastructure/media/screenshot';
import { captureEnvironment, installConsoleCapture, recentConsoleEntries } from '@/infrastructure/monitoring/diagnostics';

/** Never float over these: an exam sitting must not gain an extra control. */
const HIDDEN_ROUTES = [/^\/exams\/[^/]+\/(attempt|terminated)\/?$/];
const TUCK_KEY = 'arcade.bugIsland.tucked';

type View = { name: 'report' } | { name: 'mine' } | { name: 'detail'; id: string } | { name: 'sent'; report: BugReportDetail };

function readTucked(): boolean {
  try {
    return localStorage.getItem(TUCK_KEY) === '1';
  } catch {
    return false;
  }
}

function writeTucked(value: boolean) {
  try {
    if (value) localStorage.setItem(TUCK_KEY, '1');
    else localStorage.removeItem(TUCK_KEY);
  } catch {
    // storage unavailable — tucking just won't persist
  }
}

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function BugIsland() {
  const { user } = useAuthStore();
  const pathname = usePathname() ?? '';
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [tucked, setTucked] = useState(false);
  const [view, setView] = useState<View>({ name: 'report' });
  const [composerKey, setComposerKey] = useState(0);
  const [detail, setDetail] = useState<BugReportDetail | null>(null);

  const intakeQuery = useQuery({
    queryKey: ['bug-intake', user?.id],
    queryFn: () => BugReportService.intake(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const intake = intakeQuery.data;
  const enabled = !!intake?.enabled;

  const mineQuery = useQuery({
    queryKey: ['bug-reports-mine', user?.id],
    queryFn: () => BugReportService.mine(),
    enabled: enabled,
    staleTime: 2 * 60 * 1000,
  });
  const mine = mineQuery.data ?? [];
  const waitingOnMe = mine.filter((r) => r.status === 'NEEDS_INFO' || r.status === 'RESOLVED').length;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
    setTucked(readTucked());
  }, []);

  useEffect(() => {
    if (enabled) installConsoleCapture();
  }, [enabled]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const openDetail = useCallback(async (id: string) => {
    setView({ name: 'detail', id });
    setDetail(null);
    try {
      setDetail(await BugReportService.detail(id));
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't open that report."));
      setView({ name: 'mine' });
    }
  }, []);

  const refreshMine = () => queryClient.invalidateQueries({ queryKey: ['bug-reports-mine', user?.id] });

  const submit = async (draft: BugDraft) => {
    let report: BugReportDetail;
    try {
      report = await BugReportService.file({
        categoryId: draft.categoryId,
        title: draft.title || undefined,
        description: draft.description,
        expected: draft.expected || undefined,
        impact: draft.impact,
        pageUrl: window.location.href,
        route: pathname,
        appVersion: APP_VERSION,
        ...(draft.includeDiagnostics
          ? { environment: captureEnvironment(), consoleLog: recentConsoleEntries() }
          : {}),
      });
    } catch (err) {
      toast.error(errorMessage(err, "Your report couldn't be sent. Please try again."));
      throw err;
    }

    let failed = 0;
    for (const [i, shot] of draft.screenshots.entries()) {
      try {
        const prepared = await prepareImageForUpload(shot);
        const ext = prepared.type === 'image/png' ? 'png' : 'jpg';
        report = await BugReportService.attach(report.summary.id, prepared, `screenshot-${i + 1}.${ext}`);
      } catch {
        failed += 1;
      }
    }
    if (failed > 0) {
      toast.warning(`Report sent, but ${failed} screenshot${failed > 1 ? 's' : ''} didn't upload. You can add them from the report.`);
    }
    refreshMine();
    setView({ name: 'sent', report });
  };

  const tuck = () => {
    setOpen(false);
    setTucked(true);
    writeTucked(true);
  };

  const untuck = () => {
    setTucked(false);
    writeTucked(false);
    setOpen(true);
  };

  if (!enabled || HIDDEN_ROUTES.some((r) => r.test(pathname))) return null;

  const spring = reduceMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 420, damping: 34 };

  if (tucked && !open) {
    return (
      <button
        type="button"
        data-capture-ignore
        onClick={untuck}
        aria-label="Report a bug"
        title="Report a bug"
        className="fixed right-0 top-1/2 z-[70] -translate-y-1/2 cursor-pointer rounded-l-xl apple-glass-dock py-3 pl-2 pr-1.5 text-slate-800 shadow-lg transition hover:pl-3"
      >
        <Bug size={15} />
        {waitingOnMe > 0 && <span className="absolute -left-1 -top-1 h-3 w-3 rounded-full border-2 border-surface bg-fuchsia-500" />}
      </button>
    );
  }

  return (
    <div data-capture-ignore className="fixed bottom-24 right-4 z-[70] sm:bottom-6 sm:right-6">
      <AnimatePresence initial={false} mode="popLayout">
        {!open ? (
          <motion.div
            key="pill"
            layoutId="bug-island"
            transition={spring}
            className="group flex items-center rounded-full apple-glass-dock p-1 text-slate-800 shadow-[0_10px_30px_-8px_rgba(20,20,43,0.35)]"
            style={{ borderRadius: 999 }}
          >
            <button
              type="button"
              onClick={() => {
                setView({ name: 'report' });
                setOpen(true);
              }}
              className="relative flex cursor-pointer items-center gap-2 rounded-full py-1.5 pl-2.5 pr-3.5 text-[12.5px] font-semibold transition hover:bg-slate-950/5"
            >
              <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-slate-950/5">
                <Bug size={14} />
                {waitingOnMe > 0 && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-fuchsia-400" />}
              </span>
              <span className="hidden sm:inline">Report a bug</span>
              {intake?.releaseLabel && (
                <span className="hidden rounded-full bg-slate-950/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 md:inline">
                  {intake.releaseLabel}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={tuck}
              aria-label="Tuck the bug button to the side"
              title="Tuck away"
              className="mr-0.5 hidden cursor-pointer rounded-full p-1.5 text-slate-500 transition hover:bg-slate-950/5 hover:text-slate-900 group-hover:inline-flex"
            >
              <Minus size={13} />
            </button>
          </motion.div>
        ) : (
          <motion.section
            key="panel"
            layoutId="bug-island"
            transition={spring}
            role="dialog"
            aria-label="Report a bug"
            className="flex max-h-[min(680px,calc(100vh-8rem))] w-[min(410px,calc(100vw-2rem))] flex-col overflow-hidden bg-surface shadow-[0_24px_60px_-12px_rgba(20,20,43,0.45)] ring-1 ring-slate-900/10"
            style={{ borderRadius: 28 }}
          >
            <header className="shrink-0 border-b border-slate-200/70 bg-slate-50 px-4 pb-3 pt-3.5 text-slate-900">
              <div className="flex items-center gap-2">
                {view.name === 'detail' ? (
                  <button type="button" onClick={() => setView({ name: 'mine' })} aria-label="Back" className="cursor-pointer rounded-full p-1 text-slate-500 hover:bg-slate-950/5 hover:text-slate-900">
                    <ArrowLeft size={16} />
                  </button>
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/5">
                    <Bug size={14} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-bold leading-tight">Report a bug</p>
                  {intake?.releaseLabel && <p className="text-[11px] text-slate-500">{intake.releaseLabel}</p>}
                </div>
                {intake?.canTriage && (
                  <Link
                    href="/console/bugs"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-950/5 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-950/10 hover:text-slate-900"
                  >
                    Tracker <ExternalLink size={11} />
                  </Link>
                )}
                <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="cursor-pointer rounded-full p-1.5 text-slate-500 hover:bg-slate-950/5 hover:text-slate-900">
                  <X size={16} />
                </button>
              </div>
              {view.name !== 'detail' && (
                <div className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-slate-950/5 p-1 text-[12px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setView({ name: 'report' })}
                    className={`cursor-pointer rounded-full py-1.5 transition ${view.name === 'report' || view.name === 'sent' ? 'bg-surface text-ink' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    New report
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setView({ name: 'mine' });
                      refreshMine();
                    }}
                    className={`relative cursor-pointer rounded-full py-1.5 transition ${view.name === 'mine' ? 'bg-surface text-ink' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    My reports{mine.length ? ` (${mine.length})` : ''}
                    {waitingOnMe > 0 && <span className="absolute right-3 top-1.5 h-2 w-2 rounded-full bg-fuchsia-400" />}
                  </button>
                </div>
              )}
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {view.name === 'report' && intake && (
                <BugReportComposer
                  key={composerKey}
                  categories={intake.categories}
                  intakeMessage={intake.intakeMessage}
                  onCapture={captureVisiblePage}
                  onSubmit={submit}
                  onPickError={(m) => toast.error(m)}
                />
              )}

              {view.name === 'sent' && (
                <div className="flex flex-col items-center px-2 py-6 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <CircleCheck size={24} />
                  </span>
                  <p className="mt-3 text-[15px] font-bold text-ink">Thanks — we&apos;ve got it</p>
                  <p className="mt-1 text-[12.5px] text-slate-500">
                    Your report is <span className="font-mono font-bold text-slate-700">{view.report.summary.key}</span>. We&apos;ll let you
                    know when there&apos;s news.
                  </p>
                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openDetail(view.report.summary.id)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <LayoutList size={13} /> View report
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setComposerKey((k) => k + 1);
                        setView({ name: 'report' });
                      }}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[12px] font-bold text-on-ink hover:bg-ink-hover"
                    >
                      <Bug size={13} /> Report another
                    </button>
                  </div>
                </div>
              )}

              {view.name === 'mine' && (
                <div className="space-y-3">
                  {mineQuery.isLoading ? (
                    <div className="space-y-2">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
                      ))}
                    </div>
                  ) : (
                    <MyBugReportsList reports={mine} onOpen={openDetail} />
                  )}
                  <Link
                    href="/bug-reports"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-800"
                  >
                    <Inbox size={13} /> Open all my reports
                  </Link>
                </div>
              )}

              {view.name === 'detail' &&
                (detail ? (
                  <BugReportThread
                    compact
                    detail={detail}
                    onComment={async (body) => {
                      try {
                        setDetail(await BugReportService.comment(detail.summary.id, body));
                        refreshMine();
                      } catch (err) {
                        toast.error(errorMessage(err, "Couldn't send that."));
                      }
                    }}
                    onVerdict={async (stillHappening, note) => {
                      try {
                        setDetail(await BugReportService.verdict(detail.summary.id, stillHappening, note));
                        toast.success(stillHappening ? 'Reopened — the team will take another look.' : 'Thanks for confirming!');
                        refreshMine();
                      } catch (err) {
                        toast.error(errorMessage(err, "Couldn't send that."));
                      }
                    }}
                    onAttach={async (file) => {
                      try {
                        const prepared = await prepareImageForUpload(file);
                        setDetail(await BugReportService.attach(detail.summary.id, prepared, file.name));
                      } catch (err) {
                        toast.error(errorMessage(err, "Couldn't upload that image."));
                      }
                    }}
                  />
                ) : (
                  <div className="space-y-3">
                    <div className="h-5 w-24 animate-pulse rounded bg-slate-100" />
                    <div className="h-6 w-3/4 animate-pulse rounded bg-slate-100" />
                    <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                  </div>
                ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
