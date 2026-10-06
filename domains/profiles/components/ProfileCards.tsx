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
    <div className="py-16 px-6 text-center">
      <div className="flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto">
        <div className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Icon size={26} className="stroke-[1.8]" />
        </div>
        <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h3>
        {description && (
          <p className="text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
        {action && <div className="mt-3">{action}</div>}
      </div>
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
