'use client';

import { useEffect, useState } from 'react';
import { Loader2, MessageSquareReply, Star } from 'lucide-react';
import { channelService, type ChannelAnalytics, type ChannelAnalyticsTimeframe } from '@/domains/channels';
import { Panel } from '@/shared/design-system/ui/panel';
import { SectionHeader } from '@/shared/design-system/ui/page-header';
import { cn } from '@/shared/utils/utils';

const TIMEFRAMES: { id: ChannelAnalyticsTimeframe; label: string }[] = [
  { id: '7D', label: '7 days' },
  { id: '30D', label: '30 days' },
  { id: '90D', label: '90 days' },
  { id: '1Y', label: '1 year' },
];

/**
 * Enrollments and learner reviews for this channel's courses. Shows only what the backend
 * actually computes — growth, completion, revenue and the trend chart are still placeholders in
 * `ChannelAnalyticsService` and are left out rather than rendered as if they were real.
 */
export function ChannelAnalyticsSection({ channelId }: { channelId: string }) {
  const [timeframe, setTimeframe] = useState<ChannelAnalyticsTimeframe>('30D');
  const [data, setData] = useState<ChannelAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    channelService
      .getChannelAnalytics(channelId, timeframe)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setError(null);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : 'Could not load analytics.'));
    return () => {
      cancelled = true;
    };
  }, [channelId, timeframe]);

  const rating = data?.ratingOverview;

  return (
    <div className="space-y-6">
      <div className="inline-flex flex-wrap items-center gap-1.5 rounded-full border border-slate-200/80 bg-surface/80 p-1.5 shadow-xs backdrop-blur-md">
        {TIMEFRAMES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              if (t.id === timeframe) return;
              setData(null);
              setTimeframe(t.id);
            }}
            className={cn(
              'cursor-pointer rounded-full px-4 py-2 text-[12px] font-semibold transition-all duration-200',
              timeframe === t.id
                ? 'bg-slate-950 text-on-ink shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>
      ) : !data ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-slate-400" size={22} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat label={`Enrollments · ${data.timeframeData.timeframeLabel}`} value={data.timeframeData.enrollments} />
            <Stat label="Average rating" value={rating ? rating.averageRating.toFixed(2) : '—'} suffix="/ 5" />
            <Stat label="Reviews (all time)" value={String(rating?.totalRatings ?? 0)} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
            <Panel className="space-y-4">
              <SectionHeader title="Rating breakdown" />
              <div className="space-y-2.5">
                {(rating?.distribution ?? []).map((d) => (
                  <div key={d.stars} className="flex items-center gap-3 text-[12px] font-semibold text-slate-600">
                    <span className="flex w-8 items-center gap-0.5">
                      {d.stars}
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${d.percentage}%` }} />
                    </div>
                    <span className="w-8 text-right tabular-nums text-slate-500">{d.count}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="space-y-4">
              <SectionHeader title="Recent reviews" description="The latest learner reviews across this channel's courses." />
              {data.recentReviews.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 px-5 py-10 text-center text-[13px] font-medium text-slate-500">
                  No learner reviews yet.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {data.recentReviews.map((r) => (
                    <li key={r.id} className="py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">
                          {r.learnerAvatar ? (
                            <img src={r.learnerAvatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            r.learnerName?.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold text-ink">{r.learnerName}</p>
                          <p className="truncate text-[11.5px] font-medium text-slate-500">
                            {r.courseName} · {r.date}
                          </p>
                        </div>
                        <span className="flex shrink-0 items-center gap-0.5 text-[12px] font-bold text-amber-600 dark:text-amber-400">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          {r.rating}
                        </span>
                      </div>
                      {r.reviewText && (
                        <p className="mt-2 text-[13px] font-medium leading-relaxed text-slate-600">{r.reviewText}</p>
                      )}
                      {r.instructorResponse && (
                        <p className="mt-2 flex gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[12.5px] font-medium text-slate-600">
                          <MessageSquareReply size={14} className="mt-0.5 shrink-0 text-slate-400" />
                          {r.instructorResponse}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200/80 bg-surface p-4">
      <p className="text-[12px] font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-ink">
        {value}
        {suffix && <span className="ml-1 text-sm font-semibold text-slate-400">{suffix}</span>}
      </p>
    </div>
  );
}
