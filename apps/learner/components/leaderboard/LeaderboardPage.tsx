'use client';

import { useMemo, useState } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, CalendarDays, ChevronRight } from 'lucide-react';
import LeaderboardHero from './LeaderboardHero';
import { FabricPodiumCard } from './FabricPodiumCard';

type ViewMode = 'board' | 'monthly';
type Period = 'all' | 'month';

interface LeaderboardUser {
  rank: number;
  name: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  roleBadge?: string;
  coursesCount: number;
  hackathonsCount: number;
  certificatesCount: number;
  weeklyChange: number;
}

interface MonthArchive {
  id: string;
  label: string;
  year: number;
  top: LeaderboardUser[];
}

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
  'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
];

const NAMES = [
  ['Alex Rivera', '@arivera', 'ML Engineer'],
  ['Elena Rostova', '@erostova', 'AI Mentor'],
  ['Marcus Vance', '@mvance', 'Full Stack'],
  ['Sarah Chen', '@schen', 'Frontend Lead'],
  ['Devon Knight', '@dknight', 'Rust Specialist'],
  ['Maya Patel', '@mpatel', 'AI Mentor'],
  ['Lucas Scott', '@lscott', 'Full Stack'],
  ['Amara Okafor', '@aokafor', 'ML Engineer'],
  ['Liam Zhang', '@lzhang', 'UI Designer'],
  ['Chloe Dubois', '@cdubois', 'Full Stack'],
  ['Javier Gomez', '@jgomez', 'Frontend Lead'],
  ['Sofia Rossi', '@srossi', 'AI Mentor'],
  ['David Kim', '@dkim', 'ML Engineer'],
  ['Zoe Andersen', '@zandersen', 'Full Stack'],
  ['Noah Park', '@npark', 'Backend'],
  ['Iris Nguyen', '@inguyen', 'Product'],
  ['Omar Hassan', '@ohassan', 'DevOps'],
  ['Priya Shah', '@pshah', 'Data'],
  ['Kenji Mori', '@kmori', 'Mobile'],
  ['Ava Brooks', '@abrooks', 'Design'],
];

function buildTop20(xpBase: number): LeaderboardUser[] {
  return NAMES.map(([name, username, role], i) => ({
    rank: i + 1,
    name,
    username,
    avatar: AVATARS[i % AVATARS.length],
    level: 54 - i,
    xp: Math.max(1200, xpBase - i * 1850 - (i % 3) * 220),
    roleBadge: role,
    coursesCount: Math.max(2, 24 - i),
    hackathonsCount: Math.max(0, 6 - Math.floor(i / 3)),
    certificatesCount: Math.max(1, 18 - i),
    weeklyChange: (i % 5) - 2,
  }));
}

const ALL_TIME = buildTop20(48920);
const THIS_MONTH = buildTop20(9200).map((u, i) => ({
  ...u,
  xp: Math.max(800, 9200 - i * 380),
  level: Math.max(12, 48 - i),
}));

/** Demo: current user outside top 20 so the #21 slot is visible */
const USER_OUTSIDE: LeaderboardUser = {
  rank: 47,
  name: 'You',
  username: '@you',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
  level: 32,
  xp: 6840,
  roleBadge: 'Frontend Lead',
  coursesCount: 12,
  hackathonsCount: 2,
  certificatesCount: 8,
  weeklyChange: 4,
};

const MONTHLY_ARCHIVE: MonthArchive[] = [
  {
    id: '2026-06',
    label: 'June',
    year: 2026,
    top: THIS_MONTH.slice(0, 3).map((u, i) => ({ ...u, rank: i + 1 })),
  },
  {
    id: '2026-05',
    label: 'May',
    year: 2026,
    top: [ALL_TIME[2], ALL_TIME[0], ALL_TIME[4]].map((u, i) => ({
      ...u,
      rank: i + 1,
      xp: 7100 - i * 420,
    })),
  },
  {
    id: '2026-04',
    label: 'April',
    year: 2026,
    top: [ALL_TIME[1], ALL_TIME[5], ALL_TIME[3]].map((u, i) => ({
      ...u,
      rank: i + 1,
      xp: 6800 - i * 390,
    })),
  },
  {
    id: '2026-03',
    label: 'March',
    year: 2026,
    top: [ALL_TIME[4], ALL_TIME[1], ALL_TIME[7]].map((u, i) => ({
      ...u,
      rank: i + 1,
      xp: 6400 - i * 360,
    })),
  },
  {
    id: '2026-02',
    label: 'February',
    year: 2026,
    top: [ALL_TIME[0], ALL_TIME[3], ALL_TIME[2]].map((u, i) => ({
      ...u,
      rank: i + 1,
      xp: 5900 - i * 310,
    })),
  },
  {
    id: '2026-01',
    label: 'January',
    year: 2026,
    top: [ALL_TIME[5], ALL_TIME[0], ALL_TIME[8]].map((u, i) => ({
      ...u,
      rank: i + 1,
      xp: 5400 - i * 280,
    })),
  },
];

const PLACE_TONE = {
  1: { ring: 'ring-[#D4AF37]/50', bar: 'bg-[#D4AF37]', label: '1st', chip: 'bg-[#FFF8E7] text-[#9A7B1A]' },
  2: { ring: 'ring-slate-300', bar: 'bg-slate-400', label: '2nd', chip: 'bg-slate-100 text-slate-600' },
  3: { ring: 'ring-[#C47B4A]/40', bar: 'bg-[#C47B4A]', label: '3rd', chip: 'bg-[#FFF1E8] text-[#9A5528]' },
} as const;

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [period, setPeriod] = useState<Period>('all');
  const [query, setQuery] = useState('');

  const board = period === 'all' ? ALL_TIME : THIS_MONTH;

  const me: LeaderboardUser = useMemo(
    () => ({
      ...USER_OUTSIDE,
      name: user?.fullName || user?.firstName || user?.username || 'You',
      username: user?.username ? `@${user.username}` : USER_OUTSIDE.username,
      avatar: user?.avatarUrl || USER_OUTSIDE.avatar,
    }),
    [user],
  );

  const top3 = board.slice(0, 3);
  // Display order: 2nd | 1st | 3rd for classic podium feel, still side-by-side
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  const list4to20 = useMemo(() => {
    const rows = board.slice(3, 20);
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.username.toLowerCase().includes(q) ||
        r.roleBadge?.toLowerCase().includes(q),
    );
  }, [board, query]);

  const inTop20 = board.some(
    (r) =>
      r.username === me.username ||
      r.name === me.name ||
      (user?.username && r.username === `@${user.username}`),
  );
  // For demo data the user is outside top 20; also treat explicit rank > 20
  const showUserAfter20 = !inTop20 && me.rank > 20;

  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 35%, #FFFFFF 70%)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[380px]"
        style={{
          backgroundImage: [
            'radial-gradient(ellipse 50% 40% at 12% 18%, rgba(76,111,255,0.14) 0%, transparent 60%)',
            'radial-gradient(ellipse 40% 35% at 88% 12%, rgba(255,107,74,0.08) 0%, transparent 55%)',
          ].join(', '),
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-6 px-4 pb-20 pt-20 md:px-8 md:pt-24">
        {/* Hero Section with Celebration Confetti & Cursive Font */}
        <LeaderboardHero
          topXp={board[0]?.xp ?? 48920}
          totalLearners={1240}
          userRank={me.rank}
        />

        {/* View Mode & Period Toggle Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="inline-flex items-center p-1 bg-slate-200/50 dark:bg-slate-800/60 backdrop-blur-md rounded-xl border border-slate-200/60 dark:border-white/[0.06] shadow-inner">
            {(
              [
                { id: 'all' as Period, label: 'All time' },
                { id: 'month' as Period, label: 'This month' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPeriod(p.id);
                  setViewMode('board');
                }}
                className={`px-3.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all duration-200 select-none ${
                  period === p.id && viewMode === 'board'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setViewMode((m) => (m === 'monthly' ? 'board' : 'monthly'))}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 shadow-xs ${
              viewMode === 'monthly'
                ? 'border-[#2962D6] bg-[#2962D6] text-white font-bold'
                : 'border-slate-200/80 bg-white/95 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <CalendarDays size={14} />
            <span>Monthly tops</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'monthly' ? (
            <motion.div
              key="monthly"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="flex items-end justify-between gap-3">
                <h2 className="text-xl font-bold tracking-tight text-[#14142b]">
                  Monthly tops
                </h2>
                <p className="text-[12px] font-medium text-slate-400">
                  Top 3 for each month
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {MONTHLY_ARCHIVE.map((month) => (
                  <MonthCard key={month.id} month={month} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`board-${period}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Top 3 side by side */}
              <section className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <h2 className="text-xl font-bold tracking-tight text-[#14142b]">Top three</h2>
                  <span className="text-[12px] font-semibold text-slate-400">
                    {period === 'all' ? 'All time' : 'This month'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 md:gap-8 lg:gap-10 items-center max-w-5xl mx-auto pt-8 sm:pt-16 md:pt-20 pb-4 md:pb-6">
                  {podiumOrder.map((u) => (
                    <FabricPodiumCard key={u.rank} user={u} place={u.rank as 1 | 2 | 3} />
                  ))}
                </div>
              </section>

              {/* Ranks 4–20 (Option B: Centered Constrained Width) */}
              <section className="space-y-4 max-w-3xl mx-auto w-full pt-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <h2 className="text-xl font-bold tracking-tight text-[#14142b]">
                    Ranks 4–20
                  </h2>
                  <div className="relative w-full sm:w-64">
                    <Search
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search learners…"
                      className="w-full rounded-full border border-slate-200 bg-white/95 py-2 pl-9 pr-3 text-[13px] font-medium text-[#14142b] outline-none placeholder:text-slate-400 focus:border-[#4C6FFF]/45 focus:ring-4 focus:ring-[#4C6FFF]/10"
                    />
                  </div>
                </div>

                {/* Ranks 4–20 Floating Pill Cards List */}
                <div className="w-full">
                  {list4to20.length === 0 && !showUserAfter20 ? (
                    <div className="rounded-2xl border border-slate-200/80 bg-white/95 py-12 text-center text-sm font-medium text-slate-400 shadow-sm">
                      No matches in ranks 4–20.
                    </div>
                  ) : (
                    <ul className="space-y-3.5 pt-1">
                      {list4to20.map((row) => (
                        <RankRow
                          key={row.rank}
                          user={row}
                          highlight={
                            row.username === me.username ||
                            (!!user?.username && row.username === `@${user.username}`)
                          }
                        />
                      ))}
                      {/* 21st slot: your rank when outside top 20 */}
                      {showUserAfter20 && !query.trim() && (
                        <RankRow user={me} highlight slotLabel="Your rank" />
                      )}
                    </ul>
                  )}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const DIAMOND_BORDER_TONES = [
  'border-indigo-400/90 shadow-indigo-400/25 bg-indigo-50/70',
  'border-sky-400/90 shadow-sky-400/25 bg-sky-50/70',
  'border-violet-400/90 shadow-violet-400/25 bg-violet-50/70',
  'border-teal-400/90 shadow-teal-400/25 bg-teal-50/70',
  'border-emerald-400/90 shadow-emerald-400/25 bg-emerald-50/70',
  'border-rose-400/90 shadow-rose-400/25 bg-rose-50/70',
  'border-slate-400/90 shadow-slate-400/25 bg-slate-50/70',
];

function RankRow({
  user,
  highlight,
  slotLabel,
}: {
  user: LeaderboardUser;
  highlight?: boolean;
  slotLabel?: string;
}) {
  const diamondTone = DIAMOND_BORDER_TONES[(user.rank - 1) % DIAMOND_BORDER_TONES.length];
  const formattedRank = String(user.rank).padStart(2, '0');

  return (
    <li
      className={`group relative flex items-center gap-3 sm:gap-5 pl-4 sm:pl-6 pr-5 sm:pr-7 py-2.5 sm:py-3 rounded-2xl sm:rounded-full bg-white/95 dark:bg-slate-900/95 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(20,20,43,0.08)] overflow-visible ${
        highlight
          ? 'border-[#4C6FFF]/60 ring-2 ring-[#4C6FFF]/25 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-[0_6px_22px_rgba(76,111,255,0.12)]'
          : 'border-slate-200/80 dark:border-slate-800 shadow-[0_4px_16px_rgba(20,20,43,0.04)]'
      }`}
    >
      {/* 1. Two-digit Rank Number (Indigo/Sapphire accent) */}
      <span className="w-6 sm:w-7 shrink-0 text-center text-sm sm:text-base font-black tabular-nums text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">
        {formattedRank}
      </span>

      {/* 2. Diamond Profile Avatar Frame — Clean frame with full image visible */}
      <div className="relative shrink-0 flex items-center justify-center w-12 sm:w-14 h-10 my-[-10px] sm:my-[-14px]">
        <div
          className={`relative z-10 w-11 h-11 sm:w-13 sm:h-13 rotate-45 rounded-[11px] sm:rounded-[13px] overflow-hidden border-[2px] sm:border-[2.5px] ${diamondTone} shadow-sm transition-transform duration-200 group-hover:scale-105`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar}
            alt={user.name}
            className="-rotate-45 scale-[1.42] w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 3. Name & Subtitle */}
      <div className="min-w-0 flex-1 pl-1 sm:pl-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm sm:text-[15px] font-black uppercase tracking-wider text-slate-900 dark:text-white">
            {user.name}
          </p>
          {highlight && (
            <span className="rounded-full bg-[#4C6FFF] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-xs">
              You
            </span>
          )}
          {slotLabel && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#4C6FFF]/80">
              {slotLabel}
            </span>
          )}
        </div>
        <p className="truncate text-[12px] font-medium text-slate-400">
          {user.username}
          {user.roleBadge ? ` · ${user.roleBadge}` : ''}
        </p>
      </div>

      {/* 4. Score / XP and Trend */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-right">
        <div>
          <p className="text-sm sm:text-base font-black text-[#2962D6] dark:text-indigo-400 tracking-tight font-mono">
            {user.xp.toLocaleString()} <span className="text-[10px] font-bold text-slate-400 uppercase font-sans">XP</span>
          </p>
          <p className="text-[11px] font-semibold text-slate-400">Lvl {user.level}</p>
        </div>
        {user.weeklyChange !== 0 && (
          <span
            className={`hidden items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold md:inline-flex ${
              user.weeklyChange > 0
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60'
            }`}
          >
            <TrendingUp size={11} className={user.weeklyChange < 0 ? 'rotate-180' : ''} />
            {user.weeklyChange > 0 ? '+' : ''}
            {user.weeklyChange}
          </span>
        )}
      </div>
    </li>
  );
}

function MonthCard({ month }: { month: MonthArchive }) {
  return (
    <article className="rounded-lg border border-slate-200/80 bg-white/95 p-4 shadow-[0_4px_18px_rgba(20,20,43,0.04)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-[#14142b]">
            {month.label} {month.year}
          </h3>
          <p className="text-[11px] font-medium text-slate-400">Top 3 that month</p>
        </div>
        <ChevronRight size={16} className="text-slate-300" />
      </div>
      <ul className="space-y-2.5">
        {month.top.map((u) => {
          const tone = PLACE_TONE[u.rank as 1 | 2 | 3];
          return (
            <li key={`${month.id}-${u.rank}`} className="flex items-center gap-2.5">
              <span className={`w-8 rounded-md px-1.5 py-0.5 text-center text-[10px] font-bold ${tone.chip}`}>
                #{u.rank}
              </span>
              <div className="h-8 w-8 overflow-hidden rounded-full border border-slate-200">
                <img src={u.avatar} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-[#14142b]">{u.name}</p>
              </div>
              <span className="text-[11px] font-bold text-[#4C6FFF]">
                {u.xp.toLocaleString()}
              </span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
