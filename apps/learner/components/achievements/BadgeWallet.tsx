'use client';

/**
 * The learner's badges: every earned badge and every badge they are working towards, as cards.
 * The level standard sits behind an ⓘ button rather than taking up the page. All data is issued by
 * the server; nothing here decides what was earned.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Info, Lock, ShieldAlert } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/design-system/ui/popover';
import {
  CredentialBadge,
  TierLadder,
  type BadgeFamilyKey,
  type BadgeLevel,
  type BadgeTierInfo,
  type InProgressBadge,
  type IssuedBadge,
  type MyBadges,
} from '@/domains/credentials';
import { cn } from '@/shared/utils/utils';

type StatusFilter = 'All' | 'Earned' | 'In progress';
type FamilyFilter = 'ALL' | BadgeFamilyKey;

const FAMILY_FILTERS: { key: FamilyFilter; label: string }[] = [
  { key: 'ALL', label: 'All types' },
  { key: 'COURSE', label: 'Courses' },
  { key: 'EVENT', label: 'Events' },
  { key: 'EXAM', label: 'Exams' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export interface BadgeWalletProps {
  data: MyBadges;
  tiers: BadgeTierInfo[];
  search: string;
  onOpen: (badge: IssuedBadge) => void;
}

export function BadgeWallet({ data, tiers, search, onOpen }: BadgeWalletProps) {
  const [status, setStatus] = useState<StatusFilter>('All');
  const [family, setFamily] = useState<FamilyFilter>('ALL');
  const q = search.trim().toLowerCase();

  const earned = useMemo(
    () =>
      data.earned.filter(
        (b) =>
          (family === 'ALL' || b.badgeClass.family.key === family) &&
          (!q || b.name.toLowerCase().includes(q) || b.issuerName.toLowerCase().includes(q))
      ),
    [data.earned, family, q]
  );
  const inProgress = useMemo(
    () =>
      data.inProgress.filter(
        (b) => (family === 'ALL' || b.badgeClass.family.key === family) && (!q || b.name.toLowerCase().includes(q))
      ),
    [data.inProgress, family, q]
  );

  const showEarned = status !== 'In progress';
  const showProgress = status !== 'Earned';
  const cards = [
    ...(showEarned ? earned.map((b) => ({ kind: 'earned' as const, b })) : []),
    ...(showProgress ? inProgress.map((b) => ({ kind: 'progress' as const, b })) : []),
  ];

  return (
    <section aria-label="Badges" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {(['All', 'Earned', 'In progress'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                'cursor-pointer select-none rounded-full border px-4 py-1.5 text-xs font-bold transition-all',
                status === s
                  ? 'border-transparent bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] text-white shadow-sm'
                  : 'border-slate-200/80 bg-white/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              )}
            >
              {s}
            </button>
          ))}
          <LevelInfo tiers={tiers} />
        </div>
        <div className="flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/70 p-1 dark:border-slate-800 dark:bg-slate-900/70">
          {FAMILY_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFamily(f.key)}
              className={cn(
                'rounded-full px-3 py-1 text-[11px] font-bold transition-colors',
                family === f.key
                  ? 'bg-[#14142b] text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {cards.length === 0 ? (
        <EmptyState filtered={Boolean(q) || family !== 'ALL' || status !== 'All'} />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((c, idx) =>
            c.kind === 'earned' ? (
              <EarnedCard key={c.b.credentialCode} badge={c.b} index={idx} onOpen={() => onOpen(c.b)} />
            ) : (
              <ProgressCard key={`${c.b.contentType}-${c.b.contentId}`} badge={c.b} index={idx} />
            )
          )}
        </div>
      )}
    </section>
  );
}

// ── The level standard, on demand ──────────────────────────────────────────────────────────

function LevelInfo({ tiers }: { tiers: BadgeTierInfo[] }) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="About badge levels"
        title="About badge levels"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <Info size={15} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(92vw,420px)] gap-3 p-4">
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">Arcade badge levels</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Every badge is issued by Arcade at one of three levels, the same for every channel. Effort is counted in
            credits (1 credit = 30 learning hours), as in NCrF and SWAYAM.
          </p>
        </div>
        {tiers.length > 0 ? (
          <TierLadder tiers={tiers} family="COURSE" />
        ) : (
          <p className="text-xs text-slate-400">Loading…</p>
        )}
        <p className="text-[11px] leading-relaxed text-slate-500">
          Badges are awarded automatically at 100% completion and can be verified by anyone from their credential page.{' '}
          <Link href="/credentials/standards" className="font-semibold text-[#2962D6] hover:underline">
            Read the standard
          </Link>
        </p>
      </PopoverContent>
    </Popover>
  );
}

// ── Cards (the Achievements card design) ───────────────────────────────────────────────────

const CARD =
  'group relative flex h-full flex-col items-center justify-between overflow-hidden rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(20,20,43,0.08)] dark:border-slate-800 dark:bg-slate-900/95';

const GLOW = (
  <div
    aria-hidden
    className="pointer-events-none absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-gradient-to-br from-[#4C6FFF]/10 via-[#1DB876]/8 to-transparent blur-2xl"
  />
);

function EarnedCard({ badge, index, onOpen }: { badge: IssuedBadge; index: number; onOpen: () => void }) {
  const level = badge.badgeClass.tier.level as BadgeLevel;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.04, 0.2) }}
      className={CARD}
    >
      {GLOW}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`View ${badge.name} badge details`}
        className="group/badge relative flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl pb-2 pt-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2962D6]"
      >
        <div className="w-28 drop-shadow-md transition-transform duration-300 group-hover/badge:scale-105 group-active/badge:scale-95 sm:w-32">
          <CredentialBadge family={badge.badgeClass.family.key} level={level} title={badge.name} revoked={badge.revoked} />
        </div>
        <span className="mt-4 line-clamp-1 text-center text-base font-bold tracking-tight text-[#14142b] transition-colors group-hover/badge:text-[#2962D6] dark:text-white sm:text-lg">
          {badge.name}
        </span>
        <span className="mt-1 h-[40px] px-1 text-center text-[13px] leading-5 text-slate-500 line-clamp-2 dark:text-slate-400">
          {badge.revoked ? (
            <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
              <ShieldAlert size={12} /> Revoked
            </span>
          ) : (
            <>
              {badge.badgeClass.tier.label} · {badge.issuerName} · {formatDate(badge.issuedAt)}
            </>
          )}
        </span>
      </button>
    </motion.div>
  );
}

function ProgressCard({ badge, index }: { badge: InProgressBadge; index: number }) {
  const level = badge.badgeClass.tier.level as BadgeLevel;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.04, 0.2) }}
      className={CARD}
    >
      {GLOW}
      <div className="relative flex w-full flex-col items-center pb-2 pt-2">
        <div className="relative w-28 sm:w-32">
          <CredentialBadge family={badge.badgeClass.family.key} level={level} title={badge.name} locked />
          <span className="absolute inset-0 flex items-center justify-center">
            <Lock className="h-8 w-8 text-slate-700 drop-shadow-md dark:text-white" />
          </span>
        </div>
        <span className="mt-4 line-clamp-1 text-center text-base font-bold tracking-tight text-[#14142b] dark:text-white sm:text-lg">
          {badge.name}
        </span>
        <span className="mt-1 text-center text-[13px] leading-5 text-slate-500 dark:text-slate-400">
          {badge.badgeClass.tier.label} · {badge.progressPercent}% complete
        </span>
        <div className="mt-2 h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#2962D6] to-[#27C5D8]"
            style={{ width: `${Math.max(2, badge.progressPercent)}%` }}
          />
        </div>
        {badge.contentPath && (
          <Link href={badge.contentPath} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#2962D6] hover:underline">
            Continue <ArrowRight size={12} />
          </Link>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-14 text-center dark:border-slate-800 dark:bg-slate-900/40">
      <Award size={30} className="text-slate-300" />
      <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
        {filtered ? 'No badges match' : 'No badges yet'}
      </p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
        {filtered
          ? 'Try another filter or search.'
          : 'Complete a course, attend an event or pass an exam that awards a badge, and it will appear here — verifiable and ready to share.'}
      </p>
      {!filtered && (
        <Link href="/explore" className="mt-4 rounded-xl bg-[#14142b] px-4 py-2 text-xs font-bold text-white hover:bg-[#23234a]">
          Explore courses
        </Link>
      )}
    </div>
  );
}
