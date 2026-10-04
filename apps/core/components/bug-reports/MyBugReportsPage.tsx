'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * "My bug reports": every report the signed-in account has sent, and the conversation on each.
 * Reporter notifications link here (?id=<report>). Works whether or not intake is open now —
 * people can always follow up on what they already sent.
 * ------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Bug, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  BugReportService,
  BugReportThread,
  MyBugReportsList,
  type BugReportDetail,
  type BugReportSummary,
} from '@/domains/bug-reports';
import { prepareImageForUpload } from '@/infrastructure/media/screenshot';

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function MyBugReportsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const selectedId = params.get('id');

  const [reports, setReports] = useState<BugReportSummary[] | null>(null);
  const [detail, setDetail] = useState<BugReportDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadList = useCallback(() => {
    BugReportService.mine()
      .then(setReports)
      .catch((err) => {
        setReports([]);
        toast.error(errorMessage(err, "Couldn't load your reports."));
      });
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (!selectedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing the pane when the URL drops the id
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetail(null);
    setDetailError(null);
    BugReportService.detail(selectedId)
      .then((d) => !cancelled && setDetail(d))
      .catch((err) => !cancelled && setDetailError(errorMessage(err, "Couldn't open that report.")));
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const select = (id: string | null) => router.replace(id ? `${pathname}?id=${id}` : pathname, { scroll: false });

  const apply = (next: BugReportDetail) => {
    setDetail(next);
    loadList();
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-28 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-on-ink">
          <Bug size={18} />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink">My bug reports</h1>
          <p className="text-[13px] text-slate-500">Everything you&apos;ve reported, and what the team has said about it.</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <div className={selectedId ? 'hidden lg:block' : ''}>
          {reports === null ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : (
            <MyBugReportsList
              reports={reports}
              onOpen={select}
              emptyHint="You haven't reported anything yet. Use the bug button at the bottom of the screen when something goes wrong."
            />
          )}
        </div>

        <div className={`rounded-3xl border border-slate-200/80 bg-surface p-5 shadow-[0_2px_8px_rgba(20,20,43,0.04)] ${selectedId ? '' : 'hidden lg:block'}`}>
          {!selectedId && <p className="py-16 text-center text-[13px] text-slate-400">Pick a report to see its updates.</p>}
          {selectedId && detailError && <p className="rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{detailError}</p>}
          {selectedId && !detail && !detailError && (
            <div className="flex justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          )}
          {detail && (
            <>
              <button type="button" onClick={() => select(null)} className="mb-3 cursor-pointer text-[12px] font-semibold text-slate-500 hover:text-slate-800 lg:hidden">
                ← All reports
              </button>
              <BugReportThread
                detail={detail}
                onComment={async (body) => {
                  try {
                    apply(await BugReportService.comment(detail.summary.id, body));
                  } catch (err) {
                    toast.error(errorMessage(err, "Couldn't send that."));
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
