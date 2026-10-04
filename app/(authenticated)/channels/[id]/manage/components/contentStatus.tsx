import type { ChannelContentItem } from '@/domains/channels';
import { contentOverviewHref } from '@/app/(authenticated)/studio/content/[contentType]/[contentId]/lib/contentTypeRouting';
import { cn } from '@/shared/utils/utils';

/**
 * The content statuses the dashboard filters on, in the order they are shown. The backend's
 * status string is the source of truth — anything outside this list still renders, it just has
 * no filter of its own.
 */
export const CONTENT_STATUSES = [
  { id: 'PUBLISHED', label: 'Published' },
  { id: 'SUBMITTED', label: 'In review' },
  { id: 'DRAFT', label: 'Draft' },
  { id: 'ARCHIVED', label: 'Archived' },
] as const;

export type ContentStatusId = (typeof CONTENT_STATUSES)[number]['id'];

const STATUS_STYLE: Record<string, string> = {
  PUBLISHED: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300',
  SUBMITTED: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200',
  DRAFT: 'border-slate-200 bg-slate-50 text-slate-600',
  ARCHIVED: 'border-slate-200 bg-slate-100 text-slate-500',
};

export const statusOf = (item: ChannelContentItem) => item.status?.toUpperCase() ?? '';

export function ContentStatusPill({ status }: { status: string }) {
  const key = status?.toUpperCase();
  const label = CONTENT_STATUSES.find((s) => s.id === key)?.label ?? status;
  return (
    <span
      className={cn(
        'inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
        STATUS_STYLE[key] ?? 'border-slate-200 bg-slate-50 text-slate-600',
      )}
    >
      {label}
    </span>
  );
}

export const typeLabel = (type: string) =>
  type ? type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, ' ') : 'Content';

/**
 * Where clicking a content row goes: its open review when it is waiting on this organization,
 * otherwise its studio overview. Null when the type has no studio page yet.
 */
export function contentHref(
  item: ChannelContentItem,
  channelId: string,
  openReviewByContentId: Record<string, string>,
): string | null {
  const reviewId = openReviewByContentId[item.id];
  if (statusOf(item) === 'SUBMITTED' && reviewId) {
    return `/channels/${channelId}/manage/reviews/${reviewId}`;
  }
  return contentOverviewHref(item.type, item.id);
}
