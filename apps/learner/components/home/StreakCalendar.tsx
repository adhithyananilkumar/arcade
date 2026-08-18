'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';

type Props = {
  /** ISO date keys (YYYY-MM-DD) mapped to backend-computed qualifying-activity count for that day */
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

/** Sunday-first weekday index 0-6 */
function sundayIndex(d: Date) {
  return d.getDay();
}

function isActiveDay(iso: string, map: Record<string, number>) {
  return (map[iso] ?? 0) > 0;
}

/**
 * Scalloped Receipt Paper Ticket Calendar Card —
 * Featuring 3D Month Flip animation, electric blue typography,
 * top header streak badge, perforated dashed line, and scalloped ticket bottom edge.
 */
export function StreakCalendar({ activityByDate, streak }: Props) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const [cursor, setCursor] = useState(() => startOfMonth(today));
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev

  const handlePrevMonth = () => {
    setDirection(-1);
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDirection(1);
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  };

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
    // Always pad to 6 rows so every month occupies the exact same fixed height
    while (rows.length < 6) {
      rows.push(Array.from({ length: 7 }, () => ({ day: null, iso: null })));
    }
    return rows;
  }, [cursor]);

  const monthLabel = cursor.toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const todayIso = toISO(today);

  return (
    <div className="relative w-full max-w-[380px] h-[395px] select-none pt-4 shrink-0" style={{ perspective: '1000px' }}>
      {/* Official Arcade Brand Blue Backing Stand Bar at Top */}
      <div className="absolute top-1.5 inset-x-2 h-5 rounded-t-lg bg-[#4C6FFF] shadow-inner border border-[#3B5BDB] z-0" />

      {/* 6 3D Metallic Gold Spiral Ring Loops Spanning the Top */}
      <div className="absolute top-0 inset-x-0 z-20 flex justify-between px-6 sm:px-8 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="relative flex flex-col items-center">
            {/* 3D Metallic Gold Ring */}
            <div className="h-7 w-3 sm:w-3.5 rounded-full bg-gradient-to-r from-[#D9A736] via-[#FFE27A] to-[#A8791E] border border-[#8C6112] shadow-[0_3px_6px_rgba(0,0,0,0.32),0_1px_1px_rgba(255,255,255,0.85)_inset]">
              <div className="h-5 w-1 mx-auto mt-0.5 rounded-full bg-gradient-to-r from-[#FFF4CF] to-[#FFE27A] opacity-90" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Calendar Card Body - Fixed Dimensions */}
      <div className="relative w-full h-[375px] rounded-t-3xl bg-[#FAF8F3] p-6 pb-6 pt-7 shadow-[0_16px_40px_rgba(20,20,40,0.08)] border border-stone-200/90 dark:bg-[#1A1C23] dark:border-slate-800 z-10 flex flex-col justify-between">
        <div>
          {/* 6 Square Punched Holes showing Arcade Blue Background */}
          <div className="absolute top-2 inset-x-0 z-10 flex justify-between px-6 sm:px-8 pointer-events-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-3 w-3 rounded-xs bg-[#3B5BDB] border border-[#2B46B3] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
              />
            ))}
          </div>
          
          {/* Top Header: Arcade Blue Month Title + Compact Flame Counter Badge + Navigation */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#4C6FFF]">
              {monthLabel}
            </h2>

            <div className="flex items-center gap-2 shrink-0">
              {/* Compact Flame + Streak Number Badge */}
              <div className="inline-flex items-center gap-1 rounded-full bg-[#4C6FFF]/10 px-2.5 py-1 text-xs font-extrabold text-[#4C6FFF] dark:bg-[#4C6FFF]/20 dark:text-[#7C98FF]">
                <Flame size={13} className="fill-current text-[#4C6FFF] dark:text-[#7C98FF]" />
                <span data-testid="streak-count">{streak}</span>
              </div>

              <div className="flex items-center gap-0.5 ml-0.5">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={handlePrevMonth}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={handleNextMonth}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </div>

          {/* Weekday Headers: Bold Black S M T W T F S */}
          <div className="mb-3 grid grid-cols-7 text-center text-sm font-black text-black dark:text-white">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <span key={`${d}-${i}`}>{d}</span>
            ))}
          </div>

          {/* 3D Card Flip Motion Container for Month Grid */}
          <div className="relative h-[235px] overflow-hidden" style={{ perspective: '1000px' }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={cursor.toISOString()}
                initial={{ rotateY: direction > 0 ? 90 : -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: direction > 0 ? -90 : 90, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                className="w-full flex flex-col gap-1.5"
              >
                {cells.map((row, ri) => {
                  const activeFlags = row.map(
                    (c) => !!c.iso && isActiveDay(c.iso, activityByDate),
                  );

                  return (
                    <div key={ri} className="relative grid grid-cols-7 gap-0 py-0.5">
                      {/* Soft arcade blue streak capsule behind consecutive active days */}
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
                            className="pointer-events-none absolute inset-y-1 bg-[#4C6FFF]/12 border-y border-[#4C6FFF]/25"
                            style={{
                              left: `calc(${(ci / 7) * 100}% + ${isStart ? 4 : 0}px)`,
                              width: `calc(${(span / 7) * 100}% - ${(isStart ? 4 : 0) + (isEnd ? 4 : 0)}px)`,
                              borderRadius: `${isStart ? '999px' : '0'} ${isEnd ? '999px' : '0'} ${isEnd ? '999px' : '0'} ${isStart ? '999px' : '0'}`,
                            }}
                          />
                        );
                      })}

                      {/* Day numbers */}
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
                              <span className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-[#4C6FFF] text-sm font-bold text-white shadow-md shadow-[#4C6FFF]/30">
                                {cell.day}
                              </span>
                            ) : active ? (
                              <span className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-[#4C6FFF]/20 text-sm font-extrabold text-[#4C6FFF] dark:bg-[#4C6FFF]/30 dark:text-[#7C98FF]">
                                {cell.day}
                              </span>
                            ) : (
                              <span className="flex h-7.5 w-7.5 items-center justify-center rounded-full text-sm font-semibold text-stone-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors">
                                {cell.day}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Scalloped Ticket Bottom Cutout Edge */}
        <div className="absolute -bottom-2.5 inset-x-0 h-3 overflow-hidden pointer-events-none">
          <svg
            className="w-full h-full text-[#FAF8F3] dark:text-[#1A1C23]"
            viewBox="0 0 240 12"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,0 Q5,12 10,0 Q15,12 20,0 Q25,12 30,0 Q35,12 40,0 Q45,12 50,0 Q55,12 60,0 Q65,12 70,0 Q75,12 80,0 Q85,12 90,0 Q95,12 100,0 Q105,12 110,0 Q115,12 120,0 Q125,12 130,0 Q135,12 140,0 Q145,12 150,0 Q155,12 160,0 Q165,12 170,0 Q175,12 180,0 Q185,12 190,0 Q195,12 200,0 Q205,12 210,0 Q215,12 220,0 Q225,12 230,0 Q235,12 240,0 L240,0 L0,0 Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}




