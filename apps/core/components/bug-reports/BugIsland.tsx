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

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
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
  Loader2,
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

/** Where the island rests: snapped to a side, some distance up from the bottom. Per device. */
type Dock = { side: 'left' | 'right'; bottom: number };

const DOCK_KEY = 'arcade.bug-island.dock';
const BUTTON = 48;
/** Movement before a press counts as a drag rather than a click. */
const DRAG_THRESHOLD = 5;
/** Keep clear of the floating navbar. */
const TOP_CLEARANCE = 96;

function defaultDock(): Dock {
  // Phones keep the button above the bottom dock.
  return { side: 'right', bottom: typeof window !== 'undefined' && window.innerWidth < 640 ? 96 : 24 };
}

function readDock(): Dock {
  try {
    const raw = JSON.parse(localStorage.getItem(DOCK_KEY) ?? 'null') as Partial<Dock> | null;
    if (raw && (raw.side === 'left' || raw.side === 'right') && typeof raw.bottom === 'number') return { side: raw.side, bottom: raw.bottom };
  } catch {
    // Storage blocked — fall back to the default corner.
  }
  return defaultDock();
}

function clampBottom(bottom: number) {
  return Math.max(16, Math.min(bottom, window.innerHeight - BUTTON - TOP_CLEARANCE));
}

type View = { name: 'report' } | { name: 'mine' } | { name: 'detail'; id: string } | { name: 'sent'; report: BugReportDetail };

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function BugIsland() {
  const { user } = useAuthStore();
  const pathname = usePathname() ?? '';
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>({ name: 'report' });
  const [composerKey, setComposerKey] = useState(0);
  const [detail, setDetail] = useState<BugReportDetail | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [dock, setDock] = useState<Dock>(readDock);
  /** Live top-left of the button while it is being dragged. */
  const [dragAt, setDragAt] = useState<{ left: number; top: number } | null>(null);
  const press = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [, setViewport] = useState(0);

  useEffect(() => {
    const onResize = () => setViewport((n) => n + 1);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ tab?: 'report' | 'mine' }>;
      setOpen(true);
      if (custom.detail?.tab === 'mine') {
        setView({ name: 'mine' });
      } else {
        setView({ name: 'report' });
      }
    };
    window.addEventListener('arcade:open-bug-island', handler);
    return () => window.removeEventListener('arcade:open-bug-island', handler);
  }, []);

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    press.current = { x: e.clientX, y: e.clientY, left: rect.left, top: rect.top, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const p = press.current;
    if (!p) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (!p.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    p.moved = true;
    setDragAt({
      left: Math.max(8, Math.min(p.left + dx, window.innerWidth - BUTTON - 8)),
      top: Math.max(TOP_CLEARANCE - 32, Math.min(p.top + dy, window.innerHeight - BUTTON - 8)),
    });
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const p = press.current;
    press.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (!p?.moved || !dragAt) {
      setDragAt(null);
      return;
    }
    suppressClick.current = true;
    const next: Dock = {
      side: dragAt.left + BUTTON / 2 < window.innerWidth / 2 ? 'left' : 'right',
      bottom: clampBottom(window.innerHeight - dragAt.top - BUTTON),
    };
    setDock(next);
    setDragAt(null);
    try {
      localStorage.setItem(DOCK_KEY, JSON.stringify(next));
    } catch {
      // Not persisted — it still moves for this visit.
    }
  };

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
  /** Reports with unread team replies, or waiting on the reporter to answer / check a fix. */
  const unreadOnMine = mine.filter((r) => r.unreadCount > 0 || r.status === 'NEEDS_INFO' || r.status === 'RESOLVED').length;

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

  if (!enabled) return null;

  const activeTab = view.name === 'mine' ? 'mine' : 'report';

  const gutter = window.innerWidth < 640 ? 16 : 24;
  const anchorStyle = dragAt
    ? { left: dragAt.left, top: dragAt.top }
    : { [dock.side]: gutter, bottom: clampBottom(dock.bottom) };

  const ease = reduceMotion ? { duration: 0 } : { duration: 0.18, ease: [0.2, 0, 0, 1] as const };
  const viewFade = reduceMotion
    ? {}
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.14 } };

  const tabClass = (active: boolean) =>
    `inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 py-1.5 transition-colors ${
      active ? 'bg-surface text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
    }`;

  const dialog = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="bug-modal"
          data-capture-ignore
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={ease}
        >
          <button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default arcade-modal-backdrop"
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={view.name === 'detail' ? 'Bug report' : 'Report a bug'}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98, y: 4 }}
            transition={ease}
            className={`relative flex w-full max-w-[640px] flex-col overflow-hidden arcade-modal-box rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface shadow-2xl ${
              view.name === 'detail' ? 'h-[min(760px,calc(100dvh-2rem))]' : 'max-h-[min(760px,calc(100dvh-2rem))]'
            }`}
          >
            <header className="shrink-0 border-b border-slate-200/70 px-5 pb-3 pt-4">
              <div className="flex items-center gap-2">
                {view.name === 'detail' && (
                  <button
                    type="button"
                    onClick={() => setView({ name: 'mine' })}
                    aria-label="Back to my reports"
                    className="-ml-1.5 grid size-8 cursor-pointer place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <ArrowLeft size={17} />
                  </button>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-[16px] font-semibold tracking-tight text-ink">
                    {view.name === 'detail' ? 'My report' : 'Report a bug'}
                  </h2>
                  {view.name !== 'detail' && (
                    <p className="text-[12.5px] text-slate-500">Tell us what went wrong — we&apos;ll reply here.</p>
                  )}
                </div>
                {intake?.canTriage && (
                  <Link
                    href="/console/bugs"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-[11.5px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    Tracker <ExternalLink size={11} className="opacity-70" />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  title="Close (Esc)"
                  className="grid size-8 cursor-pointer place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  <X size={16} />
                </button>
              </div>

              {view.name !== 'detail' && (
                <div className="mt-3 flex gap-1 rounded-full bg-slate-100 p-1 text-[12.5px] font-semibold">
                  <button type="button" onClick={() => setView({ name: 'report' })} className={tabClass(activeTab === 'report')}>
                    New report
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setView({ name: 'mine' });
                      refreshMine();
                    }}
                    className={tabClass(activeTab === 'mine')}
                  >
                    My reports
                    {unreadOnMine > 0 && (
                      <span className="grid h-4 min-w-4 place-items-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
                        {unreadOnMine}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </header>

            <div className={`min-h-0 flex-1 ${view.name === 'detail' ? 'flex flex-col' : 'overflow-y-auto px-5 py-4'}`}>
              <AnimatePresence mode="wait" initial={false}>
                {view.name === 'report' && intake && (
                  <motion.div key="view-report" {...viewFade}>
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
                  <motion.div key="view-sent" {...viewFade} className="flex flex-col items-center px-2 py-8 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CircleCheck size={28} />
                    </span>
                    <h3 className="mt-4 text-[16px] font-semibold text-ink">Report sent</h3>
                    <p className="mt-1 max-w-xs text-[13px] text-slate-500">
                      Thanks! The team will look into it — you&apos;ll get a notification when they reply.
                    </p>
                    <button
                      type="button"
                      onClick={() => copyKey(view.report.summary.key)}
                      className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-[12px] text-slate-500 transition hover:bg-slate-50"
                      title="Copy the report number"
                    >
                      <span className="font-mono font-semibold text-slate-800">{view.report.summary.key}</span>
                      {copiedKey ? <Check size={13} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={13} />}
                    </button>
                    <div className="mt-7 flex w-full max-w-sm gap-2">
                      <button
                        type="button"
                        onClick={() => openDetail(view.report.summary.id)}
                        className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-slate-200 px-4 py-2.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <LayoutList size={14} /> View report
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setComposerKey((k) => k + 1);
                          setView({ name: 'report' });
                        }}
                        className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-on-ink transition hover:bg-ink-hover"
                      >
                        <Bug size={14} /> Report another
                      </button>
                    </div>
                  </motion.div>
                )}

                {view.name === 'mine' && (
                  <motion.div key="view-mine" {...viewFade} className="-mx-5 -my-4">
                    {mineQuery.isLoading ? (
                      <div className="space-y-2 p-4">
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
                      className="flex items-center justify-center gap-1.5 border-t border-slate-100 py-3 text-[12.5px] font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                    >
                      <Inbox size={13} /> Open all my reports
                    </Link>
                  </motion.div>
                )}

                {view.name === 'detail' && (
                  <motion.div key="view-detail" {...viewFade} className="flex min-h-0 flex-1 flex-col">
                    {detail ? (
                      <BugReportThread
                        detail={detail}
                        receipts={mine.find((r) => r.id === detail.summary.id)?.receipts}
                        onComment={async (body) => {
                          try {
                            setDetail(await BugReportService.comment(detail.summary.id, body));
                            refreshMine();
                            return true;
                          } catch (err) {
                            toast.error(errorMessage(err, "Couldn't send that."));
                            return false;
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
                      <div className="flex flex-1 items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.button
        type="button"
        data-capture-ignore
        layout={dragAt ? false : 'position'}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
        style={anchorStyle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => {
          if (suppressClick.current) {
            suppressClick.current = false;
            return;
          }
          setView({ name: 'report' });
          setOpen(true);
        }}
        aria-label="Report a bug"
        aria-haspopup="dialog"
        title="Report a bug · drag to move"
        className={`apple-glass-dock fixed z-[99999] grid size-12 touch-none select-none place-items-center rounded-full text-slate-700 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
          dragAt ? 'cursor-grabbing shadow-2xl' : 'cursor-pointer'
        }`}
      >
        <Bug size={19} />
        {unreadOnMine > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-emerald-500 px-1 text-[9.5px] font-bold text-white ring-2 ring-surface">
            {unreadOnMine}
          </span>
        )}
      </motion.button>
      {createPortal(dialog, document.body)}
    </>
  );
}

/** Open BugIsland programmatically from anywhere in the application. */
export function openBugIsland(tab: 'report' | 'mine' = 'report') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('arcade:open-bug-island', { detail: { tab } }));
  }
}

