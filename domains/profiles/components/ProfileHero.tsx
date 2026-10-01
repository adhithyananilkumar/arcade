'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Profiles
 *
 * Purpose:
 * The identity banner at the top of every page in the `domain/<handle>`
 * namespace — a person (learner or instructor) or an organization channel.
 * One component for both, so the two kinds of profile read as one system.
 *
 * Rules:
 * - Pure. Everything arrives via props; actions are a slot the orchestrator
 *   fills (edit, share), because only it knows who is looking.
 * - Shows public fields only. Email, phone and address are private account
 *   data and are never passed in.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { Building2, Calendar, Globe, MapPin, Star, User as UserIcon } from 'lucide-react';
import { BadgeRow, type ProfileBadge } from '@/domains/recognition';
import { getAvatarUrl } from '@/shared/utils/avatar';

export type ProfileKind = 'learner' | 'instructor' | 'organization';

const KIND_LABEL: Record<ProfileKind, string> = {
  learner: 'Learner',
  instructor: 'Instructor',
  organization: 'Organization',
};

const KIND_TONE: Record<ProfileKind, string> = {
  learner:
    'bg-teal-50 border-teal-200/60 text-teal-700 dark:bg-teal-950/60 dark:border-teal-800/60 dark:text-teal-300',
  instructor:
    'bg-indigo-50 border-indigo-200/60 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800/60 dark:text-indigo-300',
  organization:
    'bg-amber-50 border-amber-200/60 text-amber-700 dark:bg-amber-950/60 dark:border-amber-800/60 dark:text-amber-300',
};

export interface ProfileHeroProps {
  kind: ProfileKind;
  name: string;
  handle?: string | null;
  avatarUrl?: string | null;
  /** An organization may have a banner image; otherwise the dotted stripe is shown. */
  bannerUrl?: string | null;
  badges: ProfileBadge[];
  /** One line under the name — a person's headline or a channel's tagline. */
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  websiteUrl?: string | null;
  joinedAt?: string | null;
  actions?: React.ReactNode;
}

function formatJoined(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

export function ProfileHero({
  kind,
  name,
  handle,
  avatarUrl,
  bannerUrl,
  badges,
  headline,
  bio,
  location,
  websiteUrl,
  joinedAt,
  actions,
}: ProfileHeroProps) {
  const joined = formatJoined(joinedAt);
  const FallbackIcon = kind === 'organization' ? Building2 : UserIcon;

  const meta: React.ReactNode[] = [];
  if (handle) {
    meta.push(
      <span key="handle" className="font-semibold text-slate-700 dark:text-slate-300">
        @{handle}
      </span>,
    );
  }
  if (location) {
    meta.push(
      <span key="location" className="flex items-center gap-1">
        <MapPin size={13} className="text-slate-400" />
        {location}
      </span>,
    );
  }
  if (joined) {
    meta.push(
      <span key="joined" className="flex items-center gap-1">
        <Calendar size={13} className="text-slate-400" />
        {kind === 'organization' ? 'Since' : 'Joined'} {joined}
      </span>,
    );
  }
  if (websiteUrl) {
    meta.push(
      <a
        key="website"
        href={websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex max-w-[220px] items-center gap-1 truncate hover:text-slate-900 hover:underline dark:hover:text-white"
      >
        <Globe size={13} className="shrink-0 text-slate-400" />
        {websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
      </a>,
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="relative h-24 w-full border-b border-slate-100 bg-slate-100/70 sm:h-28 dark:border-slate-800/80 dark:bg-slate-800/40">
        {bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={getAvatarUrl(bannerUrl)} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
        )}
      </div>

      <div className="px-6 pb-6 pt-0 sm:px-8">
        <div className="-mt-12 mb-4 flex flex-col items-center justify-between gap-5 sm:-mt-14 sm:flex-row sm:items-end">
          <div className="relative z-10 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow-md sm:h-28 sm:w-28 dark:border-slate-900 dark:bg-slate-800">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getAvatarUrl(avatarUrl)}
                alt=""
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <FallbackIcon size={48} className="text-teal-600 dark:text-teal-400" />
            )}
          </div>

          {actions && (
            <div className="flex w-full flex-wrap items-center justify-center gap-2.5 sm:w-auto sm:justify-end">
              {actions}
            </div>
          )}
        </div>

        <div className="space-y-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {name}
            </h1>
            <BadgeRow badges={badges} size={22} />
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${KIND_TONE[kind]}`}
            >
              <Star size={11} className="fill-current" />
              {KIND_LABEL[kind]}
            </span>
          </div>

          {headline && (
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{headline}</p>
          )}

          {meta.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs font-medium text-slate-500 sm:justify-start dark:text-slate-400">
              {meta.flatMap((node, index) =>
                index === 0 ? [node] : [<span key={`dot-${index}`}>•</span>, node],
              )}
            </div>
          )}

          {bio && (
            <p className="max-w-3xl whitespace-pre-line pt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
