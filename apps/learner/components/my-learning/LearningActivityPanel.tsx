'use client';

/**
 * Learning Activity — now showing REAL learning time (D3).
 *
 * HISTORY, BECAUSE IT MATTERS
 * Originally this chart read `GET /api/v1/users/me/time-activity` (TimeLog / WebSocket session
 * presence) and rendered it as "Learning Time … Hours/Day". That measured how long a tab was open:
 * a tab left open overnight produced an eight-hour "learning" day. D2.5 removed that and fell back
 * to honest activity COUNTS, with a standing caption saying time was not tracked.
 *
 * D3 made time real. `GET /api/v1/me/activity` now carries `learningMinutes` per day, aggregated
 * server-side from interaction-gated, server-clamped, de-overlapped lesson-engagement segments.
 * This panel renders that.
 *
 * WHAT THIS COMPONENT IS STILL NOT ALLOWED TO DO
 * - It never computes duration. It sums per-day values the backend already decided, purely to
 *   render a range total — no inference, no estimation, no filling gaps.
 * - It never coalesces `learningMinutes: null` to 0. `null` means "no duration recorded for this
 *   day", which is a different statement from "zero minutes", and the UI says so.
 * - It keeps activity COUNTS as a genuine secondary signal rather than deleting the concept: time
 *   and completed actions answer different questions, and the backend deliberately models them as
 *   two separate fields.
 */

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Clock, Info, Loader2 } from 'lucide-react';
import { useDailyActivityQuery } from '@/domains/learning';

type RangePreset = '7d' | '30d';

const RANGE_DAYS: Record<RangePreset, number> = { '7d': 7, '30d': 30 };

function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** `195` ⇒ `"3h 15m"`, `45` ⇒ `"45m"`, `0` ⇒ `"0m"`. Presentation only. */
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function LearningActivityPanel({ enabled }: { enabled: boolean }) {
  const [preset, setPreset] = useState<RangePreset>('7d');
  const [hovered, setHovered] = useState<number | null>(null);

  // Bounded window, always. The learner cannot ask for an unbounded range from this UI.
  const { fromISO, toISO, days } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    const count = RANGE_DAYS[preset];
    start.setDate(end.getDate() - (count - 1));

    const list: Date[] = [];
    for (let i = 0; i < count; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      list.push(d);
    }
    return { fromISO: toISODate(start), toISO: toISODate(end), days: list };
  }, [preset]);

  const { data, isLoading, isError } = useDailyActivityQuery(fromISO, toISO, enabled);

  const byDate = useMemo(() => {
    const map = new Map<string, { minutes: number | null; count: number }>();
    (data ?? []).forEach((d) =>
      map.set(d.date, { minutes: d.learningMinutes ?? null, count: d.activityCount })
    );
    return map;
  }, [data]);

  const bars = useMemo(
    () =>
      days.map((d) => {
        const key = toISODate(d);
        const row = byDate.get(key);
        return {
          key,
          label: d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' }),
          weekday: d.toLocaleDateString(undefined, { weekday: 'short' }),
          // `null` is preserved through to render: a day the backend has no duration for shows no
          // bar and no "0m", rather than a confident zero.
          minutes: row?.minutes ?? null,
          count: row?.count ?? 0,
        };
      }),
    [days, byDate]
  );

  const totalMinutes = bars.reduce((sum, b) => sum + (b.minutes ?? 0), 0);
  const totalActions = bars.reduce((sum, b) => sum + b.count, 0);
  const maxMinutes = Math.max(1, ...bars.map((b) => b.minutes ?? 0));
  const daysWithTime = bars.filter((b) => (b.minutes ?? 0) > 0).length;
  const activeDays = bars.filter((b) => b.count > 0 || (b.minutes ?? 0) > 0).length;
  const isManyBars = bars.length > 14;
  const rangeLabel = preset === '7d' ? 'this week' : 'this month';

  const hasAnything = activeDays > 0;

  return (
    <section className="relative overflow-hidden rounded-tl-none rounded-br-none rounded-tr-[3rem] rounded-bl-[3rem] border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Activity size={18} className="text-[#2C83F5]" />
            <span>Learning Activity</span>
          </h3>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-start gap-1.5 max-w-lg">
            <Info size={12} className="mt-0.5 shrink-0 text-slate-400" />
            <span>
              Time you were actively engaged with lesson content. Idle time and background tabs are
              not counted.
            </span>
          </p>
        </div>

        <div
          className="inline-flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-xl border border-slate-200/90 dark:border-slate-700/80 shrink-0"
          role="group"
          aria-label="Activity date range"
        >
          {(['7d', '30d'] as RangePreset[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPreset(p)}
              aria-pressed={preset === p}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 select-none cursor-pointer ${
                preset === p
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/90 dark:border-slate-700/80 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {p === '7d' ? 'Last 7 days' : 'Last 30 days'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-slate-400">
          <Loader2 className="animate-spin" size={22} />
        </div>
      ) : isError ? (
        <div className="h-48 flex items-center justify-center text-center px-6">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Your activity could not be loaded right now. Nothing is lost — try again shortly.
          </p>
        </div>
      ) : !hasAnything ? (
        <div className="h-48 flex flex-col items-center justify-center text-center gap-2 px-6">
          <Activity className="text-slate-300 dark:text-slate-700" size={28} />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No activity recorded in this range
          </p>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-sm">
            Open a lesson and your learning time will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="flex items-baseline gap-1.5 text-slate-900 dark:text-white">
              <Clock size={16} className="self-center text-[#2C83F5]" />
              <span className="text-2xl font-black tracking-tight tabular-nums">
                {formatMinutes(totalMinutes)}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {rangeLabel}
              </span>
            </p>
            {/* Activity counts kept as a secondary, genuinely different signal — actions completed,
                not time spent. */}
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {totalActions} {totalActions === 1 ? 'learning action' : 'learning actions'} ·{' '}
              {daysWithTime} of {bars.length} days with recorded time
            </p>
          </div>

          <div className="relative h-48 w-full flex items-end">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pr-4 text-[10px] font-medium text-slate-400 dark:text-slate-500">
              {[maxMinutes, Math.round(maxMinutes / 2), 0].map((val, i) => (
                <div key={i} className="flex items-center gap-3 w-full">
                  <span className="w-9 text-right shrink-0">{val}m</span>
                  <div className="w-full h-px bg-slate-200/80 dark:bg-slate-800" />
                </div>
              ))}
            </div>

            <div className="w-full pl-12 h-full flex items-end justify-between gap-1.5 z-10 pt-4">
              {bars.map((b, i) => (
                <div
                  key={b.key}
                  className="relative flex-1 flex flex-col items-center h-full justify-end group/bar"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <AnimatePresence>
                    {hovered === i && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute bottom-full mb-2 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-semibold shadow-md z-30 pointer-events-none whitespace-nowrap"
                      >
                        {b.label}:{' '}
                        {b.minutes === null ? 'no time recorded' : formatMinutes(b.minutes)}
                        {b.count > 0
                          ? ` · ${b.count} ${b.count === 1 ? 'action' : 'actions'}`
                          : ''}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="w-full max-w-[36px] h-[82%] flex items-end justify-center">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{
                        height:
                          (b.minutes ?? 0) > 0
                            ? `${Math.max(((b.minutes as number) / maxMinutes) * 100, 4)}%`
                            : '0%',
                      }}
                      transition={{ duration: 0.4, ease: 'easeOut', delay: Math.min(i * 0.02, 0.4) }}
                      className="w-full rounded-t-sm bg-gradient-to-t from-blue-800 to-sky-300 dark:from-blue-900 dark:to-sky-400 opacity-80 group-hover/bar:opacity-100 transition-opacity"
                    />
                  </div>

                  <div className="mt-1.5 text-center">
                    <p
                      className={`font-semibold text-slate-700 dark:text-slate-300 ${isManyBars ? 'text-[8px] truncate max-w-[26px]' : 'text-[10px]'}`}
                    >
                      {b.label}
                    </p>
                    {!isManyBars && (
                      <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
                        {b.weekday}
                        {b.minutes !== null && b.minutes > 0 ? ` · ${formatMinutes(b.minutes)}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
