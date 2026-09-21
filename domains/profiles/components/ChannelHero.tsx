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
    <header className="relative">
      <div className="relative h-36 w-full overflow-hidden rounded-[22px] bg-gradient-to-br from-indigo-100 via-slate-50 to-purple-100 sm:h-48 dark:from-indigo-950/40 dark:via-neutral-950 dark:to-purple-950/30">
        {channel.bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getAvatarUrl(channel.bannerUrl)}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="relative -mt-12 flex flex-col gap-6 px-1 sm:-mt-14 md:flex-row md:items-end md:gap-8">
        <div className="h-24 w-24 shrink-0 self-center rounded-[22px] border-4 border-white bg-white shadow-[0_8px_24px_-12px_rgb(15,23,42,0.3)] sm:h-28 sm:w-28 md:self-auto dark:border-black dark:bg-black">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[16px] bg-slate-50 dark:bg-neutral-900">
            {channel.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getAvatarUrl(channel.iconUrl)}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 size={32} className="text-slate-300 dark:text-neutral-700" />
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 text-center md:pb-1 md:text-left">
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 md:justify-start">
            <h1 className="text-[25px] font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-[29px]">
              {channel.name}
            </h1>
            <BadgeRow badges={channel.badges} size={23} />
          </div>

          {channel.handle && (
            <p className="mt-1 text-[14px] font-bold text-slate-400 dark:text-neutral-500">
              @{channel.handle}
            </p>
          )}

          {channel.tagline && (
            <p className="mt-3 text-[15px] font-semibold leading-snug text-slate-700 dark:text-neutral-200">
              {channel.tagline}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 items-center justify-center gap-2 md:pb-2">
            {actions}
          </div>
        )}
      </div>

      {channel.description && (
        <p className="mt-6 max-w-3xl text-[13.5px] font-medium leading-relaxed text-slate-500 dark:text-neutral-400">
          {channel.description}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-bold text-slate-400 dark:text-neutral-500">
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
        {founded && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={13} /> On Arcade since {founded}
          </span>
        )}
      </div>

      {socials.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {socials.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 transition-colors hover:border-slate-200 hover:text-slate-700 dark:border-neutral-900 dark:bg-black dark:text-neutral-500 dark:hover:border-neutral-800 dark:hover:text-neutral-200"
              aria-label={url}
            >
              <Globe size={14} />
            </a>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
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

      {channel.owner?.handle && (
        <p className="mt-4 text-[12px] font-bold text-slate-400 dark:text-neutral-500">
          Run by{' '}
          <Link
            href={`/${channel.owner.handle}`}
            className="text-indigo-500 transition-colors hover:text-indigo-600 dark:text-indigo-400"
          >
            {channel.owner.name}
          </Link>
        </p>
      )}
    </header>
  );
}
