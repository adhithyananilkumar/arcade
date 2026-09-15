'use client';

/**
 * Learning Activity — showing real learning time (D3).
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
    <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-[0_8px_30px_rgba(20,20,43,0.04)]">
      {/* Header with Title & Date Range Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="space-y-1.5">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Activity size={22} className="text-[#2C83F5]" />
            <span>Study Activity & Engagement</span>
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2 max-w-2xl leading-relaxed">
            <Info size={16} className="shrink-0 text-slate-400" />
            <span>
              Time you were actively engaged with lesson content. Idle time and background tabs are not counted.
            </span>
          </p>
        </div>

        <div
          className="inline-flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shrink-0 self-start md:self-auto"
          role="group"
          aria-label="Activity date range"
        >
          {(['7d', '30d'] as RangePreset[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPreset(p)}
              aria-pressed={preset === p}
              className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 select-none cursor-pointer ${
                preset === p
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/90 dark:border-slate-700/80'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {p === '7d' ? 'Last 7 days' : 'Last 30 days'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-56 flex items-center justify-center text-slate-400">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : isError ? (
        <div className="h-56 flex items-center justify-center text-center px-6">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Your activity could not be loaded right now. Nothing is lost — try again shortly.
          </p>
        </div>
      ) : !hasAnything ? (
        <div className="h-56 flex flex-col items-center justify-center text-center gap-2.5 px-6">
          <Activity className="text-slate-300 dark:text-slate-700" size={32} />
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">
            No activity recorded in this range
          </p>
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 max-w-sm">
            Open a lesson and your learning time will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Stat Line */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 pt-1">
            <div className="flex items-baseline gap-2.5 text-slate-900 dark:text-white">
              <Clock size={20} className="self-center text-[#2C83F5]" />
              <span className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums">
                {formatMinutes(totalMinutes)}
              </span>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {rangeLabel}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
              {totalActions} {totalActions === 1 ? 'learning action' : 'learning actions'} ·{' '}
              {daysWithTime} of {bars.length} days with recorded time
            </p>
          </div>

          {/* Activity Bar Chart */}
          <div className="relative h-60 w-full flex items-end pt-6">
            {/* Y-axis grid lines & labels */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pr-4 text-xs font-bold text-slate-400 dark:text-slate-500">
              {[maxMinutes, Math.round(maxMinutes / 2), 0].map((val, i) => (
                <div key={i} className="flex items-center gap-3 w-full">
                  <span className="w-10 text-right shrink-0">{val}m</span>
                  <div className="w-full h-px bg-slate-200/80 dark:border-slate-800 dark:bg-slate-800/80" />
                </div>
              ))}
            </div>

            {/* X-axis bars & dates */}
            <div className="w-full pl-14 h-full flex items-end justify-between gap-2 sm:gap-3 z-10 pt-4">
              {bars.map((b, i) => (
                <div
                  key={b.key}
                  className="relative flex-1 flex flex-col items-center h-full justify-end group/bar cursor-pointer"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Tooltip */}
                  <AnimatePresence>
                    {hovered === i && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full mb-3 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold shadow-xl z-30 pointer-events-none whitespace-nowrap border border-slate-700/50"
                      >
                        <div className="font-extrabold text-sky-400 mb-0.5">{b.label} ({b.weekday})</div>
                        <div className="text-slate-200">
                          {b.minutes === null ? 'No time recorded' : `${formatMinutes(b.minutes)} study time`}
                        </div>
                        {b.count > 0 && (
                          <div className="text-slate-400 text-[11px] mt-0.5">
                            {b.count} {b.count === 1 ? 'action' : 'actions'} completed
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Vertical Progress Bar */}
                  <div className="w-full max-w-[48px] h-[78%] flex items-end justify-center">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{
                        height:
                          (b.minutes ?? 0) > 0
                            ? `${Math.max(((b.minutes as number) / maxMinutes) * 100, 6)}%`
                            : '0%',
                      }}
                      transition={{ duration: 0.45, ease: 'easeOut', delay: Math.min(i * 0.02, 0.4) }}
                      className="w-full rounded-t-md bg-gradient-to-t from-[#2962D6] via-[#2C83F5] to-[#27C5D8] opacity-85 group-hover/bar:opacity-100 transition-all shadow-xs"
                    />
                  </div>

                  {/* Date labels below bar */}
                  <div className="mt-2 text-center">
                    <p
                      className={`font-bold text-slate-800 dark:text-slate-200 ${
                        isManyBars ? 'text-[10px] truncate max-w-[32px]' : 'text-xs sm:text-sm'
                      }`}
                    >
                      {b.label}
                    </p>
                    {!isManyBars && (
                      <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
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
