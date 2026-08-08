'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flame, Calendar as CalendarIcon } from 'lucide-react';

type Props = {
  /** ISO date keys (YYYY-MM-DD) with activity seconds */
  activityByDate: Record<string, number>;
  streak: number;
};

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/** Monday-first weekday index 0–6 */
function mondayIndex(d: Date) {
  return (d.getDay() + 6) % 7;
}

function isActiveDay(iso: string, map: Record<string, number>) {
  return (map[iso] ?? 0) >= 60; // ≥ 1 minute counts
}

/**
 * Compact month calendar with streak capsules + today pin —
 * inspired by activity calendars, themed to Arcade coral/blue.
 */
export function StreakCalendar({ activityByDate, streak }: Props) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const [cursor, setCursor] = useState(() => startOfMonth(today));

  const cells = useMemo(() => {
    const total = daysInMonth(cursor);
    const offset = mondayIndex(startOfMonth(cursor));
    const rows: { day: number | null; iso: string | null }[][] = [];
    let row: { day: number | null; iso: string | null }[] = [];

    for (let i = 0; i < offset; i++) row.push({ day: null, iso: null });
    for (let day = 1; day <= total; day++) {
      const date = new Date(cursor.getFullYear(), cursor.getMonth(), day);
      row.push({ day, iso: toISO(date) });
      if (row.length === 7) {
        rows.push(row);
        row = [];
      }
    }
    if (row.length) {
      while (row.length < 7) row.push({ day: null, iso: null });
      rows.push(row);
    }
    return rows;
  }, [cursor]);

  const monthLabel = cursor.toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  }).toUpperCase();

  const todayIso = toISO(today);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
      className="w-full rounded-[24px] border border-slate-200/80 bg-white/80 p-4 shadow-[0_10px_32px_rgba(20,20,43,0.05)] backdrop-blur-sm"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
          }
          className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-[12px] font-bold tracking-[0.14em] text-slate-500">
            {monthLabel}
          </p>
          <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#FF6B4A]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#E85A3C]">
            <Flame size={12} className="fill-current" />
            {streak > 0 ? `${streak}-day streak` : 'Start a streak'}
          </div>
        </div>
        <button
          type="button"
          aria-label="Next month"
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
          }
          className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-y-1 text-center text-[11px] font-semibold text-slate-400">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        {cells.map((row, ri) => {
          // Build continuous streak segments within the row for the soft bar
          const activeFlags = row.map(
            (c) => !!c.iso && isActiveDay(c.iso, activityByDate),
          );

          return (
            <div key={ri} className="relative grid grid-cols-7 gap-0">
              {/* Soft streak capsules behind consecutive active days */}
              {row.map((cell, ci) => {
                if (!cell.iso || !activeFlags[ci]) return null;
                const starts = ci === 0 || !activeFlags[ci - 1];
                if (!starts) return null;
                let end = ci;
                while (end + 1 < 7 && activeFlags[end + 1]) end++;
                const span = end - ci + 1;
                return (
                  <div
                    key={`bar-${ci}`}
                    className="pointer-events-none absolute inset-y-0 rounded-full bg-[#FF6B4A]/15"
                    style={{
                      left: `calc(${(ci / 7) * 100}% + 2px)`,
                      width: `calc(${(span / 7) * 100}% - 4px)`,
                    }}
                  />
                );
              })}

              {row.map((cell, ci) => {
                if (cell.day === null || !cell.iso) {
                  return <div key={ci} className="h-8" />;
                }
                const active = isActiveDay(cell.iso, activityByDate);
                const isToday = cell.iso === todayIso;

                return (
                  <div
                    key={cell.iso}
                    className="relative z-[1] flex h-8 items-center justify-center"
                  >
                    {isToday ? (
                      <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[#4C6FFF] text-[12px] font-bold text-white shadow-[0_6px_14px_rgba(76,111,255,0.35)]">
                        {cell.day}
                        <span className="absolute -bottom-1 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[4px] border-t-[5px] border-x-transparent border-t-[#4C6FFF]" />
                      </span>
                    ) : (
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold ${
                          active ? 'text-[#E85A3C]' : 'text-slate-400'
                        }`}
                      >
                        {cell.day}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer / Schedule Block */}
      <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100/80">
        <div className="flex flex-col">
          <p className="text-[12px] font-bold text-[#14142b]">
            8 Aug <span className="text-slate-400 font-medium px-1">·</span> <span className="text-slate-500 font-medium">2 events</span>
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
            Next: Frontend Performance Clinic
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[11.5px] font-bold text-[#14142b] shadow-sm transition-all hover:bg-slate-50 hover:shadow-md">
          <CalendarIcon size={14} strokeWidth={2.5} className="text-slate-500" />
          View schedule
        </button>
      </div>
    </motion.div>
  );
}
