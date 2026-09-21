'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Profiles
 *
 * Purpose:
 * The card vocabulary every profile tab is built from — content, channels,
 * people, certificates — plus the empty state they share.
 *
 * Rules:
 * - Pure. Data and callbacks arrive via props; nothing here fetches or routes.
 *   `href` is supplied by the caller, because only the application layer knows
 *   what a link should point at.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import Link from 'next/link';
import {
  Award,
  Building2,
  CalendarDays,
  FileText,
  GraduationCap,
  type LucideIcon,
  User as UserIcon,
  Users,
} from 'lucide-react';
import { BadgeRow } from '@/domains/recognition';
import { getAvatarUrl } from '@/shared/utils/avatar';
import type {
  ChannelContentItem,
  ChannelMember,
  ProfileCertificate,
  ProfileChannel,
  ProfileCourse,
  ProfileWorkshop,
} from '../types/profile.types';

/** Shared surface: one border radius, one border, one hover lift, everywhere. */
const CARD =
  'group relative flex flex-col overflow-hidden rounded-[20px] border border-slate-100 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-[0_12px_32px_-12px_rgb(15,23,42,0.12)] dark:border-neutral-900 dark:bg-black dark:hover:border-neutral-800 dark:hover:shadow-[0_12px_32px_-12px_rgb(0,0,0,0.8)]';

function formatMonth(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

export function ProfileEmptyState({
  icon: Icon = FileText,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center dark:border-neutral-900 dark:bg-neutral-950/50">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-neutral-900">
        <Icon size={20} className="text-slate-300 dark:text-neutral-600" />
      </div>
      <p className="text-[14px] font-bold tracking-tight text-slate-700 dark:text-neutral-200">
        {title}
      </p>
      {description && (
        <p className="mt-1.5 max-w-sm text-[12.5px] font-medium leading-relaxed text-slate-400 dark:text-neutral-500">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const CONTENT_ICON: Record<string, LucideIcon> = {
  COURSE: GraduationCap,
  EVENT: CalendarDays,
  WORKSHOP: CalendarDays,
  ARTICLE: FileText,
};

export interface ContentCardProps {
  item: ProfileCourse | ProfileWorkshop | ChannelContentItem;
  /** Rendered as an eyebrow. Falls back to the item's own `type` when present. */
  kind?: string;
  href?: string;
}

/**
 * One piece of published work.
 *
 * No status pill: this only ever renders published content, so a badge saying "PUBLISHED" on
 * every card would be pure noise. (The previous profile page did show one — because it was
 * listing drafts too.)
 */
export function ContentCard({ item, kind, href }: ContentCardProps) {
  const type = kind ?? (item as ChannelContentItem).type ?? 'COURSE';
  const Icon = CONTENT_ICON[type.toUpperCase()] ?? GraduationCap;
  const cover = item.coverImageUrl;

  const body = (
    <>
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-50 dark:bg-neutral-950">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Icon size={26} className="text-slate-200 dark:text-neutral-800" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-400 dark:text-neutral-600">
          {type.replace(/_/g, ' ')}
        </span>
        <h4 className="mt-2 line-clamp-2 text-[15px] font-extrabold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
          {item.title}
        </h4>
        {item.description && (
          <p className="mt-2 line-clamp-2 text-[12.5px] font-medium leading-relaxed text-slate-500 dark:text-neutral-400">
            {item.description}
          </p>
        )}
        <div className="mt-auto pt-4 text-[11px] font-bold text-slate-400 dark:text-neutral-600">
          {formatMonth(item.createdAt)}
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={CARD}>
        {body}
      </Link>
    );
  }
  return <div className={CARD}>{body}</div>;
}

// ---------------------------------------------------------------------------
// Channels
// ---------------------------------------------------------------------------

export interface ChannelCardProps {
  channel: ProfileChannel;
}

/**
 * A channel on someone's profile.
 *
 * Only links when the channel has a page to link to. A personal channel never does — its owner's
 * profile is its page — and an organization channel that has not claimed a handle has no address
 * yet, so both render as a plain card rather than a dead link.
 */
export function ChannelCard({ channel }: ChannelCardProps) {
  const linkable = !channel.personal && !!channel.handle;

  const body = (
    <div className="flex items-start gap-4 p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 dark:border-neutral-900 dark:bg-neutral-950">
        {channel.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={getAvatarUrl(channel.iconUrl)} alt="" className="h-full w-full object-cover" />
        ) : (
          <Building2 size={18} className="text-slate-300 dark:text-neutral-700" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[14px] font-extrabold tracking-tight text-slate-900 dark:text-white">
            {channel.name}
          </span>
          <BadgeRow badges={channel.badges} size={15} max={2} />
        </div>

        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] font-bold">
          <span className="text-slate-400 dark:text-neutral-500">{channel.role}</span>
          {channel.handle && (
            <>
              <span className="text-slate-200 dark:text-neutral-800">·</span>
              <span className="text-indigo-500 dark:text-indigo-400">@{channel.handle}</span>
            </>
          )}
          {channel.personal && (
            <>
              <span className="text-slate-200 dark:text-neutral-800">·</span>
              <span className="text-slate-400 dark:text-neutral-500">Personal</span>
            </>
          )}
        </div>

        {channel.tagline && (
          <p className="mt-2 line-clamp-2 text-[12.5px] font-medium leading-relaxed text-slate-500 dark:text-neutral-400">
            {channel.tagline}
          </p>
        )}
      </div>
    </div>
  );

  if (linkable) {
    return (
      <Link href={`/${channel.handle}`} className={CARD}>
        {body}
      </Link>
    );
  }
  return <div className={CARD}>{body}</div>;
}

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

export function MemberCard({ member }: { member: ChannelMember }) {
  const body = (
    <div className="flex items-center gap-4 p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-slate-50 dark:border-neutral-900 dark:bg-neutral-950">
        {member.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getAvatarUrl(member.avatarUrl)}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <UserIcon size={17} className="text-slate-300 dark:text-neutral-700" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[14px] font-extrabold tracking-tight text-slate-900 dark:text-white">
            {member.name}
          </span>
          <BadgeRow badges={member.badges} size={15} max={2} />
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[11.5px] font-bold">
          <span
            className={
              member.owner
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-slate-400 dark:text-neutral-500'
            }
          >
            {member.role}
          </span>
          {member.handle && (
            <>
              <span className="text-slate-200 dark:text-neutral-800">·</span>
              <span className="text-slate-400 dark:text-neutral-500">@{member.handle}</span>
            </>
          )}
        </div>
        {member.headline && (
          <p className="mt-1.5 line-clamp-1 text-[12px] font-medium text-slate-500 dark:text-neutral-400">
            {member.headline}
          </p>
        )}
      </div>
    </div>
  );

  if (member.handle) {
    return (
      <Link href={`/${member.handle}`} className={CARD}>
        {body}
      </Link>
    );
  }
  return <div className={CARD}>{body}</div>;
}

// ---------------------------------------------------------------------------
// Certificates
// ---------------------------------------------------------------------------

export function CertificateCard({ certificate }: { certificate: ProfileCertificate }) {
  const title =
    certificate.courseTitle ??
    (certificate.title as string | undefined) ??
    'Certificate';

  return (
    <div className={CARD}>
      <div className="flex items-start gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20">
          <Award size={18} className="text-amber-500" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="line-clamp-2 text-[14px] font-extrabold leading-snug tracking-tight text-slate-900 dark:text-white">
            {title}
          </h4>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[11.5px] font-bold text-slate-400 dark:text-neutral-500">
            {certificate.issuedAt && <span>{formatMonth(certificate.issuedAt)}</span>}
            {certificate.certificateNumber && (
              <>
                <span className="text-slate-200 dark:text-neutral-800">·</span>
                <span className="font-mono text-[10.5px]">
                  {certificate.certificateNumber}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export function ProfileStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {Icon && (
        <Icon size={15} className="shrink-0 text-slate-300 dark:text-neutral-700" />
      )}
      <span className="text-[15px] font-extrabold tabular-nums tracking-tight text-slate-900 dark:text-white">
        {value}
      </span>
      <span className="text-[12px] font-bold text-slate-400 dark:text-neutral-500">
        {label}
      </span>
    </div>
  );
}

export { Users as MembersIcon };
