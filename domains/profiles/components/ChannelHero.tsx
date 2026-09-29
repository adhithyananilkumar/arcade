'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Profiles
 *
 * Purpose:
 * The header of an organization channel's standalone profile.
 *
 * Rules:
 * - Pure. Actions arrive as `actions`.
 * - Only organization channels reach this component. A personal channel has no
 *   page of its own — its owner's profile is its page — so there is no
 *   "personal" variant to branch on here.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import Link from 'next/link';
import {
  Building2,
  CalendarDays,
  Globe,
  Library,
  MapPin,
  Users,
} from 'lucide-react';
import { BadgeRow } from '@/domains/recognition';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { ProfileStat } from './ProfileCards';
import type { ChannelProfile } from '../types/profile.types';

export interface ChannelHeroProps {
  channel: ChannelProfile;
  actions?: React.ReactNode;
}

function formatFounded(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

/** Strips the scheme so a website reads as a domain rather than a URL. */
function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

export function ChannelHero({ channel, actions }: ChannelHeroProps) {
  const founded = formatFounded(channel.createdAt);
  const socials = (channel.socialLinks ?? []).filter((url) => url?.trim());

  return (
    <header className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      {/* Full Hero Banner with all floating elements */}
      <div className="relative group/banner w-full overflow-hidden bg-slate-900">
        <div className="relative w-full h-56 sm:h-64 md:h-72 overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950">
          {channel.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getAvatarUrl(channel.bannerUrl)}
              alt=""
              className="h-full w-full object-cover object-center"
            />
          ) : null}
        </div>

        {/* Dark gradient overlay for ultra-crisp text contrast */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Floating Profile Info & Actions Bar across the bottom of the banner */}
        <div className="absolute bottom-0 inset-x-0 z-20 flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          {/* Left: Avatar + Identity Info */}
          <div className="flex flex-col gap-3.5 sm:flex-row sm:items-end min-w-0">
            <div className="relative group/avatar flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/90 bg-slate-900 text-white shadow-2xl backdrop-blur-md">
              {channel.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getAvatarUrl(channel.iconUrl)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 size={36} className="text-slate-300" />
              )}
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl">
                  {channel.name}
                </h1>
                <BadgeRow badges={channel.badges} size={23} />
              </div>

              {channel.tagline && (
                <p className="truncate text-[13px] font-medium text-white/80 drop-shadow">
                  {channel.tagline}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] font-semibold text-white/90">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 backdrop-blur-md px-2.5 py-0.5 text-white shadow-xs">
                  <Building2 size={12} />
                  Organization
                </span>
                {channel.handle && (
                  <span className="text-sky-300 font-bold drop-shadow">@{channel.handle}</span>
                )}
                {channel.owner?.name && (
                  <span className="inline-flex items-center gap-1 drop-shadow">
                    Owner
                    {channel.owner.handle ? (
                      <Link
                        href={`/${channel.owner.handle}`}
                        className="text-white font-bold hover:underline"
                      >
                        @{channel.owner.handle}
                      </Link>
                    ) : (
                      <span className="text-white font-bold">{channel.owner.name}</span>
                    )}
                  </span>
                )}
                {founded && (
                  <span className="inline-flex items-center gap-1 text-white/70 drop-shadow">
                    <CalendarDays size={12} />
                    On Arcade since {founded}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Floating Action Buttons & Socials */}
          <div className="flex flex-wrap items-center gap-2">
            {actions}
            {socials.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all shadow-lg active:scale-95"
                aria-label={url}
              >
                <Globe size={14} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom details / description / stats */}
      <div className="p-6 space-y-4">
        {channel.description && (
          <p className="text-[13.5px] font-medium leading-relaxed text-slate-600 dark:text-neutral-300">
            {channel.description}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-neutral-800/80 text-[12px] font-semibold text-slate-500 dark:text-neutral-400">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <ProfileStat
              label={channel.stats.publishedContent === 1 ? 'published item' : 'published items'}
              value={channel.stats.publishedContent}
              icon={Library}
            />
            <ProfileStat
              label={channel.stats.members === 1 ? 'member' : 'members'}
              value={channel.stats.members}
              icon={Users}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-bold text-slate-400 dark:text-neutral-500">
            {channel.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} /> {channel.location}
              </span>
            )}
            {channel.websiteUrl && (
              <a
                href={channel.websiteUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1.5 text-indigo-500 transition-colors hover:text-indigo-600 dark:text-indigo-400"
              >
                <Globe size={13} /> {displayUrl(channel.websiteUrl)}
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
