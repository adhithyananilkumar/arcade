'use client';

import { useMemo, useState } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Search, TrendingUp, CalendarDays, ChevronRight } from 'lucide-react';

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

      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-8 px-4 pb-32 pt-28 md:px-8 md:pt-32">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[1.75rem] font-bold tracking-tight text-[#14142b] md:text-[2.15rem]">
              Leaderboard
            </h1>
            <p className="mt-1 max-w-lg text-[14px] font-medium text-slate-500">
              Top learners by XP — podium up top, ranks 4–20 below. Your place always shows if
              you’re outside the top twenty.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-slate-200/90 bg-white/95 p-1 shadow-[0_4px_14px_rgba(20,20,43,0.04)]">
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
                  className={`rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                    period === p.id && viewMode === 'board'
                      ? 'bg-[#12141C] text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setViewMode((m) => (m === 'monthly' ? 'board' : 'monthly'))}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-[12px] font-semibold transition-colors ${
                viewMode === 'monthly'
                  ? 'border-[#4C6FFF] bg-[#4C6FFF]/10 text-[#3A56D4]'
                  : 'border-slate-200 bg-white/95 text-slate-700 hover:border-slate-300'
              }`}
            >
              <CalendarDays size={14} />
              Monthly tops
            </button>
          </div>
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

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-end">
                  {podiumOrder.map((u) => (
                    <PodiumCard key={u.rank} user={u} place={u.rank as 1 | 2 | 3} />
                  ))}
                </div>
              </section>

              {/* Ranks 4–20 */}
              <section className="space-y-3">
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

                <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white/95 shadow-[0_4px_18px_rgba(20,20,43,0.04)]">
                  <ul className="divide-y divide-slate-100">
                    {list4to20.length === 0 && !showUserAfter20 ? (
                      <li className="px-4 py-10 text-center text-sm font-medium text-slate-400">
                        No matches in ranks 4–20.
                      </li>
                    ) : (
                      <>
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
                      </>
                    )}
                  </ul>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PodiumCard({ user, place }: { user: LeaderboardUser; place: 1 | 2 | 3 }) {
  const tone = PLACE_TONE[place];
  const isFirst = place === 1;

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className={`relative flex flex-col overflow-hidden rounded-lg border border-slate-200/80 bg-white/95 p-4 shadow-[0_6px_20px_rgba(20,20,43,0.05)] ${
        isFirst ? 'md:pb-6 md:pt-5' : ''
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${tone.bar}`} />
      <div className="mb-3 flex items-center justify-between">
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${tone.chip}`}>
          {tone.label}
        </span>
        {isFirst && <Crown size={16} className="text-[#D4AF37]" />}
      </div>

      <div className="flex items-center gap-3">
        <div className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-offset-2 ${tone.ring}`}>
          <img src={user.avatar} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-bold text-[#14142b]">{user.name}</h3>
          <p className="truncate text-[12px] font-medium text-slate-400">{user.username}</p>
          <p className="mt-1 text-[12px] font-semibold text-[#4C6FFF]">
            {user.xp.toLocaleString()} XP
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
        <div>
          <p className="text-[13px] font-bold text-[#14142b]">{user.level}</p>
          <p className="text-[10px] font-medium text-slate-400">Level</p>
        </div>
        <div>
          <p className="text-[13px] font-bold text-[#14142b]">{user.coursesCount}</p>
          <p className="text-[10px] font-medium text-slate-400">Courses</p>
        </div>
        <div>
          <p className="text-[13px] font-bold text-[#14142b]">{user.certificatesCount}</p>
          <p className="text-[10px] font-medium text-slate-400">Certs</p>
        </div>
      </div>
    </motion.article>
  );
}

function RankRow({
  user,
  highlight,
  slotLabel,
}: {
  user: LeaderboardUser;
  highlight?: boolean;
  slotLabel?: string;
}) {
  return (
    <li
      className={`flex items-center gap-3 px-3.5 py-3 sm:px-4 ${
        highlight
          ? 'border-t border-[#4C6FFF]/15 bg-[#4C6FFF]/[0.06]'
          : 'hover:bg-slate-50/80'
      }`}
    >
      <span
        className={`w-9 shrink-0 text-center text-[13px] font-bold tabular-nums ${
          highlight ? 'text-[#4C6FFF]' : 'text-slate-400'
        }`}
      >
        #{user.rank}
      </span>
      <div
        className={`h-10 w-10 shrink-0 overflow-hidden rounded-full border ${
          highlight ? 'border-[#4C6FFF]/35 ring-2 ring-[#4C6FFF]/20' : 'border-slate-200'
        }`}
      >
        <img src={user.avatar} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-[14px] font-bold text-[#14142b]">{user.name}</p>
          {highlight && (
            <span className="rounded bg-[#4C6FFF] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
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
      <div className="hidden text-right sm:block">
        <p className="text-[13px] font-bold text-[#4C6FFF]">{user.xp.toLocaleString()} XP</p>
        <p className="text-[11px] font-medium text-slate-400">Lvl {user.level}</p>
      </div>
      {user.weeklyChange !== 0 && (
        <span
          className={`hidden items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold md:inline-flex ${
            user.weeklyChange > 0
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-rose-50 text-rose-600'
          }`}
        >
          <TrendingUp size={12} className={user.weeklyChange < 0 ? 'rotate-180' : ''} />
          {user.weeklyChange > 0 ? '+' : ''}
          {user.weeklyChange}
        </span>
      )}
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
