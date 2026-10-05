'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Profiles
 *
 * Purpose:
 * The content card the profile library is built from, plus the empty state
 * every profile panel shares.
 *
 * Rules:
 * - Pure. Data and callbacks arrive via props; nothing here fetches or routes.
 *   `href` is supplied by the caller, because only the application layer knows
 *   what a link should point at.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { FileText, type LucideIcon } from 'lucide-react';
import { UnifiedContentCard } from '@/shared/design-system/ui/cards/UnifiedContentCard';
import type {
  ChannelContentItem,
  ProfileCourse,
  ProfileWorkshop,
} from '../types/profile.types';

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
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs dark:bg-slate-800">
        <Icon size={20} className="text-slate-300" />
      </div>
      <p className="text-[14px] font-bold tracking-tight text-slate-700">
        {title}
      </p>
      {description && (
        <p className="mt-1.5 max-w-sm text-[12.5px] font-medium leading-relaxed text-slate-400">
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
  const isCourse = type.toUpperCase() === 'COURSE';

  return (
    <UnifiedContentCard
      id={item.id}
      title={item.title}
      description={item.description}
      type={type}
      channelName={item.channelName}
      channelIconUrl={item.channelIconUrl}
      dateText={formatMonth(item.createdAt)}
      actionHref={href}
      actionLabel={isCourse ? 'View Course' : 'View Event'}
    />
  );
}
