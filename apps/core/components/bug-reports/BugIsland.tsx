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
import {
  ArrowLeft,
  Bug,
  Check,
  CircleCheck,
  Copy,
  ExternalLink,
  Inbox,
  LayoutList,
  Minus,
  Sparkles,
  X,
} from 'lucide-react';
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
  const [copiedKey, setCopiedKey] = useState(false);

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

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    toast.success(`Copied ${key} to clipboard`);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const tuck = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const spring = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 420, damping: 32, mass: 0.8 };

  const activeTab = view.name === 'mine' ? 'mine' : 'report';

  return (
    <>
      {/* Subtle Backdrop when Modal is Open */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
            data-capture-ignore
            className="fixed inset-0 z-[69] bg-slate-950/20 backdrop-blur-[2px] transition-colors"
          />
        )}
      </AnimatePresence>

      <div data-capture-ignore className="fixed bottom-24 right-4 z-[70] sm:bottom-6 sm:right-6">
        <AnimatePresence initial={false} mode="wait">
          {tucked && !open ? (
            <motion.button
              key="tucked-tab"
              type="button"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={spring}
              onClick={untuck}
              aria-label="Report a bug"
              title="Report a bug (click to open)"
              className="fixed right-0 top-1/2 z-[70] -translate-y-1/2 cursor-pointer rounded-l-2xl border-y border-l border-slate-200/80 bg-surface/90 py-3.5 pl-2.5 pr-2 text-slate-800 shadow-[0_8px_24px_rgba(15,23,42,0.15)] backdrop-blur-xl transition-colors hover:border-indigo-300 hover:bg-surface hover:text-indigo-600 dark:hover:border-indigo-500/30 dark:hover:text-indigo-400"
            >
              <div className="relative flex items-center justify-center">
                <Bug size={16} className="transition-transform duration-200 group-hover:scale-110" />
                {waitingOnMe > 0 && (
                  <span className="absolute -left-1.5 -top-1.5 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-surface bg-fuchsia-500" />
                  </span>
                )}
              </div>
            </motion.button>
          ) : !open ? (
            <motion.div
              key="floating-pill"
              initial={{ scale: 0.9, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 8 }}
              whileHover={{ scale: 1.025, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={spring}
              className="group relative flex items-center rounded-full border border-slate-200/80 bg-surface/90 p-1.5 text-slate-800 shadow-[0_12px_36px_-6px_rgba(20,20,43,0.22)] backdrop-blur-xl transition-all duration-200 hover:border-indigo-300/80 hover:shadow-[0_16px_40px_-6px_rgba(79,70,229,0.25)] dark:hover:border-indigo-500/30"
            >
              <button
                type="button"
                onClick={() => {
                  setView({ name: 'report' });
                  setOpen(true);
                }}
                className="relative flex cursor-pointer items-center gap-2.5 rounded-full py-1 pl-1 pr-3 text-[13px] font-semibold text-slate-800 transition hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {/* Icon Container with subtle gradient & ping animation */}
                <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/20 transition-transform duration-200 group-hover:scale-105 dark:text-indigo-400">
                  <Bug size={14} />
                  {waitingOnMe > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-surface bg-fuchsia-500" />
                    </span>
                  )}
                </span>
                <span className="font-medium tracking-tight">Report a bug</span>
                {intake?.releaseLabel && (
                  <span className="hidden rounded-full border border-slate-200/80 bg-slate-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 md:inline">
                    {intake.releaseLabel}
                  </span>
                )}
              </button>

              {/* Tuck away button */}
              <button
                type="button"
                onClick={tuck}
                aria-label="Tuck the bug button to the side"
                title="Tuck to side"
                className="ml-0.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-slate-400 opacity-70 transition-all duration-200 hover:bg-slate-950/5 hover:text-slate-800 hover:opacity-100 group-hover:opacity-100"
              >
                <Minus size={13} />
              </button>
            </motion.div>
          ) : (
            <motion.section
              key="modal-dialog"
              role="dialog"
              aria-label="Report a bug"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={spring}
              className="flex max-h-[min(720px,calc(100vh-6rem))] w-[min(430px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[26px] border border-slate-200/80 bg-surface/98 shadow-[0_25px_70px_-15px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5 backdrop-blur-2xl"
            >
              {/* Header */}
              <header className="shrink-0 border-b border-slate-200/70 bg-slate-50/80 px-4 pb-3 pt-3.5 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  {view.name === 'detail' ? (
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      type="button"
                      onClick={() => setView({ name: 'mine' })}
                      aria-label="Back"
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-950/5 hover:text-slate-900"
                    >
                      <ArrowLeft size={16} />
                    </motion.button>
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/20 dark:text-indigo-400">
                      <Bug size={14} />
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[14px] font-bold tracking-tight text-slate-900">
                        {view.name === 'detail' ? 'Bug details' : 'Report a bug'}
                      </p>
                      {intake?.releaseLabel && (
                        <span className="rounded-full bg-indigo-500/10 px-1.5 py-0.2 text-[9.5px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          {intake.releaseLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {intake?.canTriage && (
                    <Link
                      href="/console/bugs"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-surface px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                    >
                      Tracker <ExternalLink size={10} className="opacity-70" />
                    </Link>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-950/5 hover:text-slate-800"
                  >
                    <X size={16} />
                  </motion.button>
                </div>

                {/* Animated Segmented Tabs */}
                {view.name !== 'detail' && (
                  <div className="relative mt-3 grid grid-cols-2 gap-1 rounded-full bg-slate-950/5 p-1 text-[12px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setView({ name: 'report' })}
                      className={`relative z-10 flex cursor-pointer items-center justify-center py-1.5 transition-colors duration-150 ${
                        activeTab === 'report' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {activeTab === 'report' && (
                        <motion.div
                          layoutId="bug-island-tab-pill"
                          transition={spring}
                          className="absolute inset-0 rounded-full bg-surface shadow-xs"
                        />
                      )}
                      <span className="relative z-10">New report</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setView({ name: 'mine' });
                        refreshMine();
                      }}
                      className={`relative z-10 flex cursor-pointer items-center justify-center gap-1.5 py-1.5 transition-colors duration-150 ${
                        activeTab === 'mine' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {activeTab === 'mine' && (
                        <motion.div
                          layoutId="bug-island-tab-pill"
                          transition={spring}
                          className="absolute inset-0 rounded-full bg-surface shadow-xs"
                        />
                      )}
                      <span className="relative z-10">My reports{mine.length ? ` (${mine.length})` : ''}</span>
                      {waitingOnMe > 0 && (
                        <span className="relative z-10 flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-500" />
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </header>

              {/* Body Content with Smooth Fade/Slide */}
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                <AnimatePresence mode="wait">
                  {view.name === 'report' && intake && (
                    <motion.div
                      key="view-report"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                    >
                      <BugReportComposer
                        key={composerKey}
                        categories={intake.categories}
                        intakeMessage={intake.intakeMessage}
                        onCapture={captureVisiblePage}
                        onSubmit={submit}
                        onPickError={(m) => toast.error(m)}
                      />
                    </motion.div>
                  )}

                  {view.name === 'sent' && (
                    <motion.div
                      key="view-sent"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={spring}
                      className="flex flex-col items-center px-2 py-6 text-center"
                    >
                      {/* Celebration Check Badge */}
                      <div className="relative">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.1 }}
                          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                        >
                          <CircleCheck size={28} />
                        </motion.div>
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.25 }}
                          className="absolute -right-1 -top-1 text-amber-500"
                        >
                          <Sparkles size={16} />
                        </motion.span>
                      </div>

                      <h3 className="mt-3.5 text-[16px] font-bold text-slate-900">
                        Thanks — we&apos;ve got it!
                      </h3>
                      <p className="mt-1 text-[12.5px] text-slate-500">
                        Your bug report has been filed. We&apos;ll notify you when our team takes a look.
                      </p>

                      {/* Ticket Key Card with 1-Click Copy */}
                      <button
                        type="button"
                        onClick={() => copyKey(view.report.summary.key)}
                        className="group mt-4 flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-[12px] transition hover:border-indigo-300 hover:bg-slate-100/80 dark:hover:border-indigo-500/40"
                        title="Click to copy ID"
                      >
                        <span className="text-slate-400">Ticket ID:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {view.report.summary.key}
                        </span>
                        {copiedKey ? (
                          <Check size={13} className="text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy size={13} className="text-slate-400 transition group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                        )}
                      </button>

                      {/* Action Buttons */}
                      <div className="mt-6 flex w-full gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => openDetail(view.report.summary.id)}
                          className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-slate-200/80 bg-surface px-3.5 py-2.5 text-[12.5px] font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
                        >
                          <LayoutList size={14} /> View report
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => {
                            setComposerKey((k) => k + 1);
                            setView({ name: 'report' });
                          }}
                          className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-ink px-3.5 py-2.5 text-[12.5px] font-bold text-on-ink shadow-sm transition hover:bg-ink-hover"
                        >
                          <Bug size={14} /> Report another
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {view.name === 'mine' && (
                    <motion.div
                      key="view-mine"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-3.5"
                    >
                      {mineQuery.isLoading ? (
                        <div className="space-y-2">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
                          ))}
                        </div>
                      ) : (
                        <MyBugReportsList reports={mine} onOpen={openDetail} />
                      )}
                      <Link
                        href="/bug-reports"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-transparent py-2 text-[12px] font-semibold text-slate-500 transition hover:border-slate-200/80 hover:bg-slate-50 hover:text-slate-800"
                      >
                        <Inbox size={13} /> Open all my reports
                      </Link>
                    </motion.div>
                  )}

                  {view.name === 'detail' && (
                    <motion.div
                      key="view-detail"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18 }}
                    >
                      {detail ? (
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
                              toast.success(
                                stillHappening ? 'Reopened — the team will take another look.' : 'Thanks for confirming!'
                              );
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
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

