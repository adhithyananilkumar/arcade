'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Profiles
 *
 * Purpose:
 * The header of a person's profile — identity, recognition, and the counts
 * that summarise what the rest of the page contains.
 *
 * Rules:
 * - Pure. Actions arrive as `actions`; the component never routes or mutates.
 * - Badges come from `profile.badges`, which the backend granted. Nothing here
 *   infers standing from a role string or a bio.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import {
  BookOpen,
  Building2,
  CalendarDays,
  Globe,
  MapPin,
  Presentation,
  Trophy,
  User as UserIcon,
} from 'lucide-react';
import { BadgeRow } from '@/domains/recognition';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { ProfileStat } from './ProfileCards';
import type { UserProfile } from '../types/profile.types';

export interface ProfileHeroProps {
  profile: UserProfile;
  /** Buttons for the viewer — "Edit profile" for the owner, "Share" for everyone. */
  actions?: React.ReactNode;
}

/**
 * The host, as a readable label: "github.com/ada" reads as "github.com".
 *
 * Shown as text rather than as a brand glyph. lucide dropped its brand icons, and drawing
 * approximations of company marks on a public profile is both a trademark question and a
 * maintenance burden — the hostname is unambiguous and needs no upkeep.
 */
function socialLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    // Not a parseable URL. The settings form validates the scheme, but older rows predate that,
    // and a link that cannot be parsed should still render as something the reader can see.
    return url.replace(/^https?:\/\//i, '').split('/')[0] || url;
  }
}

function formatJoined(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function ProfileHero({ profile, actions }: ProfileHeroProps) {
  const joined = formatJoined(profile.createdAt);

  // Deduplicated because the dedicated linkedin/github fields and the free-form social list are
  // separate inputs on the settings form, and people fill in both.
  const socials = Array.from(
    new Set(
      [profile.linkedinUrl, profile.githubUrl, ...(profile.socialLinks ?? [])]
        .filter((url): url is string => !!url && url.trim().length > 0)
        .map((url) => url.trim()),
    ),
  );

  return (
    <header className="relative">
      {/* A wash rather than a banner image: people have no banner field, and a placeholder
          graphic would be decoration pretending to be content. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-8 h-48 bg-gradient-to-b from-indigo-50/60 via-white to-transparent dark:from-indigo-950/20 dark:via-black dark:to-transparent"
      />

      <div className="relative flex flex-col gap-7 pt-4 md:flex-row md:items-start md:gap-9">
        <div className="relative h-[112px] w-[112px] shrink-0 self-center md:self-start">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-white p-1 shadow-[0_8px_24px_-12px_rgb(15,23,42,0.25)] dark:border-neutral-800 dark:bg-black">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-slate-50 dark:bg-neutral-900">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getAvatarUrl(profile.avatarUrl)}
                  alt=""
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon size={44} className="text-slate-300 dark:text-neutral-700" />
              )}
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 md:justify-start">
            <h1 className="text-[27px] font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-[31px]">
              {profile.fullName || 'Arcade member'}
            </h1>
            <BadgeRow badges={profile.badges} size={24} />
          </div>

          {profile.handle && (
            <p className="mt-1 text-[14px] font-bold text-slate-400 dark:text-neutral-500">
              @{profile.handle}
            </p>
          )}

          {profile.headline && (
            <p className="mt-3 text-[15px] font-semibold leading-snug text-slate-700 dark:text-neutral-200">
              {profile.headline}
            </p>
          )}

          {profile.bio && (
            <p className="mt-3 max-w-2xl text-[13.5px] font-medium leading-relaxed text-slate-500 dark:text-neutral-400">
              {profile.bio}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] font-bold text-slate-400 dark:text-neutral-500 md:justify-start">
            {profile.workingAt && (
              <span className="inline-flex items-center gap-1.5">
                <Building2 size={13} /> {profile.workingAt}
              </span>
            )}
            {profile.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} /> {profile.location}
              </span>
            )}
            {joined && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={13} /> Joined {joined}
              </span>
            )}
          </div>

          {socials.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              {socials.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  // nofollow + noopener: these are user-supplied links on a public page.
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-100 bg-white px-2.5 py-1.5 text-[11.5px] font-bold text-slate-500 transition-colors hover:border-slate-200 hover:text-slate-900 dark:border-neutral-900 dark:bg-black dark:text-neutral-400 dark:hover:border-neutral-800 dark:hover:text-neutral-100"
                >
                  <Globe size={12} className="shrink-0 text-slate-300 dark:text-neutral-600" />
                  {socialLabel(url)}
                </a>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:justify-start">
            <ProfileStat
              label={profile.stats.publishedCourses === 1 ? 'course' : 'courses'}
              value={profile.stats.publishedCourses}
              icon={BookOpen}
            />
            <ProfileStat
              label={profile.stats.publishedWorkshops === 1 ? 'event' : 'events'}
              value={profile.stats.publishedWorkshops}
              icon={Presentation}
            />
            {/* Only when the learner side is shown: a zero here would otherwise be read as
                "earned none" when the truth is "chose not to show". */}
            {profile.learnerActivityVisible && (
              <ProfileStat
                label={profile.stats.certificates === 1 ? 'certificate' : 'certificates'}
                value={profile.stats.certificates}
                icon={Trophy}
              />
            )}
          </div>
        </div>

        {actions && (
          <div className="flex shrink-0 items-center justify-center gap-2 md:pt-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
