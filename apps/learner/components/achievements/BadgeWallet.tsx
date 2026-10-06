'use client';

/**
 * Arcade Learner Architecture
 * Layer: Apps (learner)
 *
 * Badge Wallet component styled to match My Learning design system.
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
                  ? 'border-transparent bg-[#2962D6] text-white shadow-xs dark:bg-[#3B82F6]'
                  : 'border-slate-200/80 bg-surface/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              {s}
            </button>
          ))}
          <LevelInfo tiers={tiers} />
        </div>
        <div className="flex items-center gap-1 rounded-full border border-slate-200/80 bg-surface/70 p-1">
          {FAMILY_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFamily(f.key)}
              className={cn(
                'rounded-full px-3 py-1 text-[11px] font-bold transition-colors cursor-pointer',
                family === f.key
                  ? 'bg-slate-900 text-on-ink'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {cards.length === 0 ? (
        <EmptyBadgeState filtered={Boolean(q) || family !== 'ALL' || status !== 'All'} />
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

// ── The level standard popover ──────────────────────────────────────────────────────────

function LevelInfo({ tiers }: { tiers: BadgeTierInfo[] }) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="About badge levels"
        title="About badge levels"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 bg-surface/80 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
      >
        <Info size={15} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(92vw,420px)] gap-3 p-4">
        <div>
          <p className="text-sm font-bold text-slate-900">Arcade badge levels</p>
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
          <Link href="/credentials/standards" className="font-semibold text-[#2962D6] hover:underline dark:text-[#7eb5ff]">
            Read the standard
          </Link>
        </p>
      </PopoverContent>
    </Popover>
  );
}

// ── Cards matching My Learning design system ─────────────────────────────────────────────

const CARD =
  'group relative flex h-full flex-col items-center justify-between overflow-hidden rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 p-5 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(20,20,43,0.08)]';

const GLOW = (
  <div
    aria-hidden
    className="pointer-events-none absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-gradient-to-br from-[#2962D6]/10 via-[#27C5D8]/8 to-transparent blur-2xl"
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
          <CredentialBadge family={badge.badgeClass.family.key} level={level} title={badge.name} issuerLogoUrl={badge.issuerLogoUrl} year={new Date(badge.issuedAt).getFullYear()} revoked={badge.revoked} />
        </div>
        <span className="mt-4 line-clamp-1 text-center text-base font-bold tracking-tight text-ink transition-colors group-hover/badge:text-[#2962D6] sm:text-lg dark:group-hover/badge:text-[#7eb5ff]">
          {badge.name}
        </span>
        <span className="mt-1 h-[40px] px-1 text-center text-[13px] leading-5 text-slate-500 line-clamp-2">
          {badge.revoked ? (
            <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
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
          <CredentialBadge family={badge.badgeClass.family.key} level={level} title={badge.name} issuerLogoUrl={badge.issuerLogoUrl} locked />
          <span className="absolute inset-0 flex items-center justify-center">
            <Lock className="h-8 w-8 text-slate-700 drop-shadow-md" />
          </span>
        </div>
        <span className="mt-4 line-clamp-1 text-center text-base font-bold tracking-tight text-ink sm:text-lg">
          {badge.name}
        </span>
        <span className="mt-1 text-center text-[13px] leading-5 text-slate-500">
          {badge.badgeClass.tier.label} · {badge.progressPercent}% complete
        </span>
        <div className="mt-2 h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#2962D6] to-[#27C5D8]"
            style={{ width: `${Math.max(2, badge.progressPercent)}%` }}
          />
        </div>
        {badge.contentPath && (
          <Link href={badge.contentPath} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-on-ink hover:bg-slate-800 transition">
            Continue <ArrowRight size={12} />
          </Link>
        )}
      </div>
    </motion.div>
  );
}

function EmptyBadgeState({ filtered }: { filtered: boolean }) {
  return (
    <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
      <div className="relative mb-3 flex items-center justify-center select-none">
        <svg width="110" height="100" viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
          <ellipse cx="55" cy="50" rx="38" ry="32" className="fill-[#2962D6]/10 dark:fill-[#3B82F6]/15" />
          <path d="M55 20L65 30H78V43L88 53L78 63V76H65L55 86L45 76H32V63L22 53L32 43V30H45L55 20Z" className="fill-white stroke-slate-800" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="55" cy="53" r="14" className="fill-[#2962D6]/20 dark:fill-[#3B82F6]/30 stroke-[#2962D6] dark:stroke-[#3B82F6]" strokeWidth="2" />
          <path d="M50 53L53.5 56.5L60 50" stroke="#2962D6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900">
        {filtered ? 'No matching badges' : 'No badges yet'}
      </h3>
      <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
        {filtered
          ? 'Try another filter or search term.'
          : 'Complete a course, attend an event or pass an exam that awards a badge to earn your first milestone.'}
      </p>
      {!filtered && (
        <Link
          href="/explore"
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-on-ink hover:opacity-90 transition shadow-sm"
        >
          <Award className="h-4 w-4" />
          Explore courses
        </Link>
      )}
    </div>
  );
}
