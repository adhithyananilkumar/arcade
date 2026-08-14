'use client';

import { useMemo, useState } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Search, TrendingUp, CalendarDays, ChevronRight, Award, Trophy, Medal, Sparkles, BookOpen, CheckCircle2, Zap, ArrowUp, ArrowDown } from 'lucide-react';

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
  const maxTopXp = top3[0]?.xp || 50000;

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
  const showUserAfter20 = !inTop20 && me.rank > 20;

  return (
    <div
      className="relative min-h-screen w-full text-slate-900 selection:bg-violet-100"
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF9FE 40%, #FFFFFF 100%)',
      }}
    >
      {/* Crisp Ambient Cool Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[400px]"
        style={{
          backgroundImage: [
            'radial-gradient(ellipse 50% 40% at 15% 15%, rgba(99,102,241,0.05) 0%, transparent 60%)',
            'radial-gradient(ellipse 50% 40% at 85% 15%, rgba(14,165,233,0.05) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl space-y-9 px-4 pb-32 pt-26 sm:pt-28 md:px-6">
        {/* Inject Cursive Font & Custom Keyframes */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&display=swap');
          .font-cursive-heading {
            font-family: 'Dancing Script', cursive;
          }
        `}</style>

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-1">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-cursive-heading text-slate-900 tracking-tight flex items-center gap-2.5 pb-2 overflow-visible">
              <span className="pb-2">Leader</span>
              <span className="inline-block pb-2 pr-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 bg-clip-text text-transparent">
                board
              </span>
            </h1>
            <p className="mt-0.5 max-w-lg text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
              Celebrate top achievements, track XP milestones, and rise through the community ranks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Period Switcher */}
            <div className="flex rounded-2xl border border-slate-200/90 bg-white/90 p-1 shadow-xs backdrop-blur-md">
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
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    period === p.id && viewMode === 'board'
                      ? 'bg-slate-950 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Monthly Tops Toggle */}
            <button
              type="button"
              onClick={() => setViewMode((m) => (m === 'monthly' ? 'board' : 'monthly'))}
              className={`inline-flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all shadow-xs ${
                viewMode === 'monthly'
                  ? 'border-violet-300 bg-violet-50 text-violet-700'
                  : 'border-slate-200/90 bg-white/90 text-slate-700 hover:border-slate-300'
              }`}
            >
              <CalendarDays size={14} className="text-violet-600" />
              <span>Monthly Hall of Fame</span>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'monthly' ? (
            <motion.div
              key="monthly"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">Monthly Hall of Fame</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Champions crowned in each previous season</p>
                </div>
                <span className="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1 rounded-full border border-violet-200/60">
                  {MONTHLY_ARCHIVE.length} Archive Seasons
                </span>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {MONTHLY_ARCHIVE.map((month, idx) => (
                  <MonthlyArchiveCard key={month.id} month={month} index={idx} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`board-${period}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-9"
            >
              {/* 1. FLOWING CARD-LESS CHAMPIONS SHOWCASE (REACTBITS INSPIRED) */}
              <section
                className="relative py-8 sm:py-12 select-none overflow-visible group/stage"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  e.currentTarget.style.setProperty('--stage-x', `${x}px`);
                  e.currentTarget.style.setProperty('--stage-y', `${y}px`);
                }}
              >
                {/* Dynamic Cursor Stage Spotlight */}
                <div
                  className="pointer-events-none absolute -inset-x-8 -inset-y-12 opacity-0 group-hover/stage:opacity-100 transition-opacity duration-700 ease-out z-0"
                  style={{
                    background: 'radial-gradient(550px circle at var(--stage-x, 50%) var(--stage-y, 50%), rgba(99, 102, 241, 0.07), transparent 70%)'
                  }}
                />

                {/* Flowing Section Header */}
                <div className="relative z-10 flex items-center justify-between mb-10 px-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-slate-400">
                      Hall of Champions
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-white/90 px-3.5 py-1 rounded-full border border-slate-200/80 shadow-2xs backdrop-blur-md">
                    {period === 'all' ? 'All-Time Records' : 'This Month Standing'}
                  </span>
                </div>

                {/* Continuous Flowing Curved Arch & Stage */}
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-8 lg:gap-16 pt-2 pb-6">
                  {/* Fluid Wave SVG Arch Connecting All 3 Podiums */}
                  <svg
                    className="hidden md:block pointer-events-none absolute top-1/2 left-4 right-4 w-[calc(100%-2rem)] h-32 -translate-y-6 z-0 overflow-visible opacity-40"
                    viewBox="0 0 800 120"
                    fill="none"
                  >
                    <path
                      d="M 120,90 Q 400,-10 680,90"
                      stroke="url(#waveGrad)"
                      strokeWidth="2.5"
                      strokeDasharray="6 6"
                    />
                    <defs>
                      <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="#6366F1" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.4" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* #2 Silver (Left) */}
                  {top3[1] && (
                    <FlowingPodiumChampion
                      user={top3[1]}
                      place={2}
                      maxTopXp={maxTopXp}
                    />
                  )}

                  {/* #1 Gold Champion (Center Elevated) */}
                  {top3[0] && (
                    <FlowingPodiumChampion
                      user={top3[0]}
                      place={1}
                      maxTopXp={maxTopXp}
                    />
                  )}

                  {/* #3 Bronze / Teal (Right) */}
                  {top3[2] && (
                    <FlowingPodiumChampion
                      user={top3[2]}
                      place={3}
                      maxTopXp={maxTopXp}
                    />
                  )}
                </div>
              </section>

              {/* 2. RANKS 4–20 SCROLLING REVEAL LIST & INDIVIDUAL CARDS */}
              <section className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                      Ranks 4 – 20
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Contenders climbing towards the top podium</p>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search
                      size={15}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search rank, name, or role…"
                      className="w-full rounded-2xl border border-slate-200/90 bg-white/90 py-2.5 pl-10 pr-3.5 text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Individual Animated Rank Micro-Cards with Staggered Scroll Animation */}
                <div className="space-y-2.5">
                  {list4to20.length === 0 && !showUserAfter20 ? (
                    <div className="py-12 text-center rounded-3xl border border-slate-200/80 bg-white/80 p-8 space-y-2">
                      <p className="text-sm font-bold text-slate-700">No matching learners found</p>
                      <p className="text-xs text-slate-400">Try searching for a different name or role title.</p>
                    </div>
                  ) : (
                    <>
                      {list4to20.map((item, idx) => (
                        <IndividualRankCard
                          key={item.rank}
                          user={item}
                          index={idx}
                          maxTopXp={maxTopXp}
                          highlight={
                            item.username === me.username ||
                            (!!user?.username && item.username === `@${user.username}`)
                          }
                        />
                      ))}

                      {showUserAfter20 && !query.trim() && (
                        <div className="pt-2">
                          <div className="mb-2 text-center">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-600 bg-violet-50 px-3 py-0.5 rounded-full border border-violet-200">
                              Your Standing
                            </span>
                          </div>
                          <IndividualRankCard
                            user={me}
                            index={20}
                            maxTopXp={maxTopXp}
                            highlight={true}
                            slotLabel="Your rank"
                          />
                        </div>
                      )}
                    </>
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

// -------------------------------------------------------------------------------------------------
// 1. Seamless Card-Less Stage Podium Component
// -------------------------------------------------------------------------------------------------
function FlowingPodiumChampion({
  user,
  place,
  maxTopXp
}: {
  user: LeaderboardUser;
  place: 1 | 2 | 3;
  maxTopXp: number;
}) {
  const isFirst = place === 1;
  const isSecond = place === 2;
  const isThird = place === 3;

  const styleConfig = {
    1: {
      avatarSize: 'w-30 h-30 sm:w-34 sm:h-34',
      avatarRing: 'ring-4 ring-indigo-600/90 ring-offset-4 ring-offset-white shadow-[0_20px_50px_rgba(79,70,229,0.25)]',
      haloGlow: 'from-indigo-500/20 via-violet-500/15 to-cyan-400/20',
      xpGrad: 'from-indigo-600 via-violet-600 to-indigo-800',
      pillStyle: 'bg-indigo-50/80 text-indigo-950 border-indigo-200/80 shadow-xs',
      yFloat: [-6, 6, -6],
      delay: 0,
      heightOffset: 'md:-translate-y-8',
    },
    2: {
      avatarSize: 'w-22 h-22 sm:w-26 sm:h-26',
      avatarRing: 'ring-4 ring-sky-500/80 ring-offset-4 ring-offset-white shadow-[0_12px_36px_rgba(14,165,233,0.18)]',
      haloGlow: 'from-sky-400/20 to-transparent',
      xpGrad: 'from-sky-600 to-blue-700',
      pillStyle: 'bg-sky-50/80 text-sky-950 border-sky-200/80 shadow-2xs',
      yFloat: [4, -4, 4],
      delay: 0.3,
      heightOffset: 'md:translate-y-2',
    },
    3: {
      avatarSize: 'w-20 h-20 sm:w-24 sm:h-24',
      avatarRing: 'ring-4 ring-teal-500/80 ring-offset-4 ring-offset-white shadow-[0_12px_36px_rgba(20,184,166,0.18)]',
      haloGlow: 'from-teal-400/20 to-transparent',
      xpGrad: 'from-teal-600 to-emerald-700',
      pillStyle: 'bg-teal-50/80 text-teal-950 border-teal-200/80 shadow-2xs',
      yFloat: [-4, 4, -4],
      delay: 0.6,
      heightOffset: 'md:translate-y-4',
    },
  }[place];

  return (
    <div className={`relative z-10 flex-1 flex flex-col items-center text-center transition-all duration-500 ${styleConfig.heightOffset} ${isFirst ? 'order-1 md:order-2' : isSecond ? 'order-2 md:order-1' : 'order-3'}`}>
      {/* Floating Avatar & Halo System */}
      <motion.div
        animate={{ y: styleConfig.yFloat }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: styleConfig.delay }}
        whileHover={{ scale: 1.07, y: -8 }}
        className="relative group/avatar cursor-pointer flex flex-col items-center"
      >
        {/* Ambient Halo Glow */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${styleConfig.haloGlow} blur-2xl scale-140 pointer-events-none group-hover/avatar:scale-160 transition-transform duration-500`} />

        {/* Orbiting Dashed Ring for #1 Champion */}
        {isFirst && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            className="pointer-events-none absolute -inset-3.5 rounded-full border border-dashed border-indigo-400/50"
          />
        )}

        {/* Floating Crown Badge for #1 Champion */}
        {isFirst && (
          <motion.div
            animate={{ y: [-2, 2, -2] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-7.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-900 text-white text-[10.5px] font-extrabold uppercase tracking-wider shadow-lg shadow-indigo-900/30 border border-slate-700/80"
          >
            <Crown size={12} className="text-amber-300 fill-amber-300" />
            <span>#1 Champion</span>
          </motion.div>
        )}

        {/* Avatar Image Frame */}
        <div className={`relative z-10 ${styleConfig.avatarSize} rounded-full overflow-hidden ${styleConfig.avatarRing} bg-slate-100 mx-auto transition-all`}>
          <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
        </div>

        {/* Sleek Place Pill (2nd & 3rd) */}
        {!isFirst && (
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-20 px-3 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider shadow-xs bg-slate-900 text-white border border-slate-700 whitespace-nowrap">
            {place === 2 ? '2nd Place' : '3rd Place'}
          </div>
        )}
      </motion.div>

      {/* User Information */}
      <div className="mt-5 space-y-0.5 max-w-[220px]">
        <h3 className={`truncate font-bold text-slate-900 ${isFirst ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'} tracking-tight`}>
          {user.name}
        </h3>
        <p className="truncate text-xs font-medium text-slate-400">
          {user.username} {user.roleBadge ? `· ${user.roleBadge}` : ''}
        </p>
      </div>

      {/* Large Hero Display XP */}
      <div className="mt-2.5 mb-3 flex items-baseline justify-center gap-1.5">
        <span className={`font-black tracking-tight ${isFirst ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'} bg-gradient-to-r ${styleConfig.xpGrad} bg-clip-text text-transparent`}>
          {user.xp.toLocaleString()}
        </span>
        <span className="text-xs font-black uppercase text-slate-400">XP</span>
      </div>

      {/* Flowing Floating Stats Pill */}
      <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-xs font-semibold backdrop-blur-md ${styleConfig.pillStyle}`}>
        <div className="flex items-center gap-1">
          <Zap size={11} className="opacity-70" />
          <span>Lvl {user.level}</span>
        </div>
        <span className="w-1 h-1 rounded-full bg-current opacity-30" />
        <div className="flex items-center gap-1">
          <BookOpen size={11} className="opacity-70" />
          <span>{user.coursesCount}</span>
        </div>
        <span className="w-1 h-1 rounded-full bg-current opacity-30" />
        <div className="flex items-center gap-1">
          <Award size={11} className="opacity-70" />
          <span>{user.certificatesCount}</span>
        </div>
      </div>
    </div>
  );
}

function IndividualRankCard({
  user,
  index,
  maxTopXp,
  highlight,
  slotLabel,
}: {
  user: LeaderboardUser;
  index: number;
  maxTopXp: number;
  highlight?: boolean;
  slotLabel?: string;
}) {
  const percentOfLeader = Math.min(100, Math.round((user.xp / maxTopXp) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
      whileHover={{ x: 4, scale: 1.008 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        e.currentTarget.style.setProperty('--spotlight-x', `${x}px`);
        e.currentTarget.style.setProperty('--spotlight-y', `${y}px`);
      }}
      className={`group/rank relative overflow-hidden rounded-2xl border transition-all duration-200 p-3.5 sm:p-4 shadow-2xs ${
        highlight
          ? 'border-violet-300 bg-gradient-to-r from-violet-50/90 via-fuchsia-50/30 to-amber-50/30 ring-1 ring-violet-500/25 shadow-sm'
          : 'border-slate-200/90 bg-white/95 hover:border-violet-300 hover:shadow-md'
      }`}
    >
      {/* Dynamic Cursor Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover/rank:opacity-100 transition-opacity duration-300 ease-out z-0"
        style={{
          background: 'radial-gradient(320px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(168, 85, 247, 0.10), transparent 70%)'
        }}
      />

      <div className="relative z-10 flex items-center gap-3.5 sm:gap-5">
        {/* Rank Number Badge */}
        <div className="w-8 shrink-0 text-center">
          <span className={`text-sm font-black ${highlight ? 'text-violet-600' : 'text-slate-400 group-hover/rank:text-slate-700'} transition-colors`}>
            #{user.rank}
          </span>
        </div>

        {/* User Avatar with Level Ring */}
        <div className="relative h-11 w-11 shrink-0">
          <div className="h-full w-full rounded-full overflow-hidden ring-2 ring-slate-100 group-hover/rank:ring-violet-200 transition-all">
            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
          </div>
          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-slate-900 text-white text-[9px] font-black">
            {user.level}
          </span>
        </div>

        {/* User Details & Progress Track */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-sm font-bold text-slate-900 group-hover/rank:text-violet-700 transition-colors">
              {user.name}
            </h4>
            {highlight && (
              <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
                You
              </span>
            )}
            {slotLabel && (
              <span className="text-[10px] font-bold text-violet-600 bg-violet-100/60 px-2 py-0.5 rounded-full">
                {slotLabel}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="truncate">{user.username} {user.roleBadge ? `· ${user.roleBadge}` : ''}</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hidden sm:inline text-slate-500 font-medium">{user.coursesCount} Courses</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hidden sm:inline text-slate-500 font-medium">{user.certificatesCount} Certs</span>
          </div>

          {/* Micro Progress Bar towards leader */}
          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mt-1.5">
            <div
              style={{ width: `${percentOfLeader}%` }}
              className="h-full bg-gradient-to-r from-violet-500 to-sky-400 rounded-full"
            />
          </div>
        </div>

        {/* XP Score & Trending Indicator */}
        <div className="flex items-center gap-3 shrink-0 text-right">
          <div>
            <p className="text-sm font-black text-slate-900 group-hover/rank:text-violet-600 transition-colors">
              {user.xp.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">XP</span>
            </p>
            <p className="text-[10px] font-semibold text-slate-400">
              {percentOfLeader}% of leader
            </p>
          </div>

          {/* Weekly Trending Pill */}
          {user.weeklyChange !== 0 && (
            <span
              className={`hidden sm:inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[10px] font-bold ${
                user.weeklyChange > 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-rose-50 text-rose-600 border border-rose-200/60'
              }`}
            >
              {user.weeklyChange > 0 ? (
                <ArrowUp size={10} className="stroke-[3]" />
              ) : (
                <ArrowDown size={10} className="stroke-[3]" />
              )}
              <span>{Math.abs(user.weeklyChange)}</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// -------------------------------------------------------------------------------------------------
// 3. Unique Interactive Monthly Archive Cards with ReactBits Spotlight
// -------------------------------------------------------------------------------------------------
function MonthlyArchiveCard({ month, index }: { month: MonthArchive; index: number }) {
  const totalXp = month.top.reduce((acc, u) => acc + u.xp, 0);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.015 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        e.currentTarget.style.setProperty('--spotlight-x', `${x}px`);
        e.currentTarget.style.setProperty('--spotlight-y', `${y}px`);
      }}
      className="group/month relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-sm hover:shadow-xl hover:border-violet-300 transition-all duration-300"
    >
      {/* ReactBits Dynamic Radial Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover/month:opacity-100 transition-opacity duration-500 ease-out z-0"
        style={{
          background: 'radial-gradient(350px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(168, 85, 247, 0.12), transparent 70%)'
        }}
      />

      <div className="relative z-10 space-y-4">
        {/* Month Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5">
              <Trophy size={15} className="text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">
                {month.label} {month.year}
              </h3>
            </div>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Total podium: {totalXp.toLocaleString()} XP</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-200/60">
            Season {month.id.split('-')[1]}
          </span>
        </div>

        {/* Top 3 Champions in that Month */}
        <div className="space-y-2.5">
          {month.top.map((u, i) => {
            const rankConfig = {
              0: { badge: 'bg-amber-400 text-amber-950 font-black', ring: 'ring-2 ring-amber-400', label: '1st' },
              1: { badge: 'bg-slate-700 text-white font-bold', ring: 'ring-2 ring-slate-300', label: '2nd' },
              2: { badge: 'bg-orange-600 text-white font-bold', ring: 'ring-2 ring-orange-300', label: '3rd' },
            }[i] || { badge: 'bg-slate-200 text-slate-700', ring: '', label: `#${i+1}` };

            return (
              <div
                key={`${month.id}-${u.rank}`}
                className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-slate-50/70 hover:bg-violet-50/50 border border-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 ${rankConfig.badge}`}>
                    {rankConfig.label}
                  </span>
                  <div className={`w-8 h-8 rounded-full overflow-hidden shrink-0 ${rankConfig.ring}`}>
                    <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" />
                  </div>
                  <p className="truncate text-xs font-bold text-slate-800">{u.name}</p>
                </div>
                <span className="text-xs font-black text-violet-600 shrink-0">
                  {u.xp.toLocaleString()} <span className="text-[9px] text-slate-400 font-bold">XP</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.article>
  );
}
