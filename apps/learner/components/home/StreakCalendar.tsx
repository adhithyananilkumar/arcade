'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';

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

/** Sunday-first weekday index 0-6 (matches Image 1: sun, mon, tues, wed, thurs, fri, sat) */
function sundayIndex(d: Date) {
  return d.getDay();
}

function isActiveDay(iso: string, map: Record<string, number>) {
  return (map[iso] ?? 0) >= 60;
}

/**
 * Handcrafted Embroidery Hoop Wooden Token Calendar Card
 * Inspired by Image 1: Circular wooden hoop frame, top clamp hardware, red embroidered day labels, and 3D wooden token date disks.
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
    const offset = sundayIndex(startOfMonth(cursor));
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

  const monthLabel = cursor
    .toLocaleString(undefined, { month: 'long', year: 'numeric' })
    .toLowerCase();

  const todayIso = toISO(today);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[420px] select-none pt-4 pb-2 px-1"
    >
      {/* Wooden Hoop Tension Clamp Hardware at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
        {/* Metal wingnut / bolt */}
        <div className="h-2 w-5 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-sm shadow-xs border border-slate-500/50 -mb-0.5" />
        {/* Wooden clamp blocks */}
        <div className="flex items-center gap-1">
          <div className="h-3.5 w-4 rounded-t-xs bg-gradient-to-b from-[#E2C799] to-[#C5A880] border border-[#A88B60] shadow-sm" />
          <div className="h-3.5 w-4 rounded-t-xs bg-gradient-to-b from-[#E2C799] to-[#C5A880] border border-[#A88B60] shadow-sm" />
        </div>
      </div>

      {/* Main Outer Circular Wooden Hoop Container */}
      <div
        className="relative overflow-hidden rounded-[38px] sm:rounded-[46px] border-[7px] border-[#D8C09D] dark:border-[#8B7355] bg-[#F7F4ED] dark:bg-[#1E1C1A] shadow-[0_16px_44px_rgba(40,30,20,0.12),0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(160,130,90,0.25)] p-3.5 sm:p-4.5"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(255,255,255,0.6) 0%, transparent 70%),
            repeating-linear-gradient(45deg, rgba(180,160,130,0.03) 0px, rgba(180,160,130,0.03) 2px, transparent 2px, transparent 6px)
          `,
        }}
      >
        {/* Inner Stitched Hoop Ring Accent */}
        <div className="absolute inset-2 pointer-events-none rounded-[30px] sm:rounded-[38px] border border-dashed border-[#C2A67F]/40 dark:border-[#5C4A36]" />

        {/* Top Header: Script Month Title + Streak Badge + Month Controls */}
        <div className="relative z-10 flex items-center justify-between px-1.5 pt-1 pb-1.5">
          {/* Previous Month Button */}
          <button
            type="button"
            aria-label="Previous month"
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
            }
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#D5C2A5] bg-[#FAF7F0] text-[#6B5744] shadow-xs transition-transform hover:scale-105 active:scale-95 dark:bg-[#2A2622] dark:text-[#D5C2A5] dark:border-[#5C4D3C]"
          >
            <ChevronLeft size={15} />
          </button>

          {/* Month Label & Streak Pill */}
          <div className="flex flex-col items-center">
            <span className="font-script text-2xl sm:text-3xl font-bold text-[#3B2F2F] dark:text-[#EAE3D9] tracking-wide leading-none">
              {monthLabel}
            </span>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-[#FF6B4A]/30 bg-[#FF6B4A]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#D94F32] dark:text-[#FF8C6B]">
              <Flame size={11} className="fill-current" />
              {streak > 0 ? `${streak}-day streak` : 'Start a streak'}
            </div>
          </div>

          {/* Next Month Button */}
          <button
            type="button"
            aria-label="Next month"
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
            }
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#D5C2A5] bg-[#FAF7F0] text-[#6B5744] shadow-xs transition-transform hover:scale-105 active:scale-95 dark:bg-[#2A2622] dark:text-[#D5C2A5] dark:border-[#5C4D3C]"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Day of Week Headers (Red embroidered thread style as in Image 1: sun, mon, tues...) */}
        <div className="relative z-10 grid grid-cols-7 border-b-2 border-slate-800/70 pb-1 pt-1 text-center font-script text-xs sm:text-sm font-bold text-[#C84B31]">
          {['sun', 'mon', 'tues', 'wed', 'thurs', 'fri', 'sat'].map((d) => (
            <span key={d} className="capitalize tracking-tighter">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar Grid Body with Stitched Lines & Wooden Token Disks */}
        <div className="relative z-10 flex flex-col pt-1">
          {cells.map((row, ri) => {
            const activeFlags = row.map(
              (c) => !!c.iso && isActiveDay(c.iso, activityByDate),
            );

            return (
              <div
                key={ri}
                className="relative grid grid-cols-7 border-b border-slate-800/40 last:border-b-0 py-0.5 sm:py-1"
              >
                {/* Streak Connecting Pill Line */}
                {row.map((cell, ci) => {
                  if (!cell.iso || !activeFlags[ci]) return null;
                  const starts = ci === 0 || !activeFlags[ci - 1];
                  if (!starts) return null;
                  let end = ci;
                  while (end + 1 < 7 && activeFlags[end + 1]) end++;
                  const span = end - ci + 1;
                  const isStart = true;
                  const isEnd = end === 6 || !activeFlags[end + 1];

                  return (
                    <div
                      key={`bar-${ci}`}
                      className="pointer-events-none absolute inset-y-[5px] bg-[#FF6B4A]/25 border-y border-[#FF6B4A]/40"
                      style={{
                        left: `calc(${(ci / 7) * 100}% + ${isStart ? 6 : 0}px)`,
                        width: `calc(${(span / 7) * 100}% - ${(isStart ? 6 : 0) + (isEnd ? 6 : 0)}px)`,
                        borderRadius: `${isStart ? '999px' : '0'} ${isEnd ? '999px' : '0'} ${isEnd ? '999px' : '0'} ${isStart ? '999px' : '0'}`,
                      }}
                    />
                  );
                })}

                {/* Day Wooden Token Buttons */}
                {row.map((cell, ci) => {
                  if (cell.day === null || !cell.iso) {
                    return <div key={ci} className="h-7 sm:h-8" />;
                  }
                  const active = isActiveDay(cell.iso, activityByDate);
                  const isToday = cell.iso === todayIso;

                  return (
                    <div
                      key={cell.iso}
                      className="relative z-[1] flex h-7 sm:h-8 items-center justify-center"
                    >
                      {/* 3D Wooden Token Button Disk */}
                      <span
                        className={`group relative flex h-6.5 w-6.5 sm:h-7.5 sm:w-7.5 items-center justify-center rounded-full text-[11px] sm:text-xs font-bold transition-all ${
                          isToday
                            ? 'bg-gradient-to-b from-[#4C6FFF] to-[#3A56D4] text-white shadow-[0_4px_10px_rgba(76,111,255,0.45)] ring-2 ring-[#4C6FFF]/40 scale-105'
                            : active
                            ? 'bg-gradient-to-b from-[#FF8C6B] to-[#E85A3C] text-white shadow-[0_3px_8px_rgba(232,90,60,0.35)] border border-[#D94F32]'
                            : 'bg-gradient-to-b from-[#FAF6EE] to-[#EADBC8] text-[#4A3E3D] border border-[#D5C2A5] shadow-[0_2px_4px_rgba(60,40,20,0.12),0_1px_0_rgba(255,255,255,0.8)_inset] hover:scale-105 hover:bg-[#FFFDF9] dark:from-[#3A342E] dark:to-[#2A241F] dark:text-[#E2D5C3] dark:border-[#5C4D3C]'
                        }`}
                      >
                        <span className="relative z-10 leading-none">
                          {cell.day}
                        </span>

                        {/* Today Indicator Pin */}
                        {isToday && (
                          <span className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-[#4C6FFF] shadow-xs" />
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

