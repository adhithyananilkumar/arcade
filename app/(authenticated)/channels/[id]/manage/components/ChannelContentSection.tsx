'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  ChevronRight,
  FileText,
  GraduationCap,
  LayoutGrid,
  List,
  Map,
  Search,
  User,
} from 'lucide-react';
import type { ChannelContentItem } from '@/domains/channels';
import { Panel } from '@/shared/design-system/ui/panel';
import { cn } from '@/shared/utils/utils';
import { CONTENT_STATUSES, ContentStatusPill, contentHref, statusOf, typeLabel } from './contentStatus';
import { UnifiedContentCard } from '@/shared/design-system/ui/cards';
import { ContentArt } from '@/shared/design-system/art';


interface CardProps {
  item: ChannelContentItem;
  channelId: string;
  openReviews: Record<string, string>;
  index?: number;
}

/** One content item styled with the LibraryCard aesthetic. */
export function ContentCard({ item, channelId, openReviews }: CardProps) {
  const href = contentHref(item, channelId, openReviews);

  return (
    <UnifiedContentCard
      id={item.id}
      title={item.title || 'Untitled'}
      type={item.type}
      typeLabel={typeLabel(item.type)}
      statusNode={<ContentStatusPill status={item.status} />}
      description={item.description}
      channelName={item.channelName}
      channelIconUrl={item.channelIconUrl}
      dateText={`Updated ${new Date(item.updatedAt).toLocaleDateString()}`}
      actionHref={href || undefined}
      actionLabel="Manage"
      disabledAction={!href}
      disabledActionLabel="Unavailable"
    />
  );
}

interface RowProps {
  item: ChannelContentItem;
  channelId: string;
  openReviews: Record<string, string>;
  compact?: boolean;
}

/** One content item as a list row. */
export function ContentRow({ item, channelId, openReviews, compact }: RowProps) {
  const href = contentHref(item, channelId, openReviews);
  const body = (
    <>
      <div
        className={cn(
          'shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100',
          compact ? 'h-10 w-14' : 'h-12 w-[4.5rem]',
        )}
      >
        <ContentArt seed={item.id} kind={item.type} title={item.title} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold text-[#14142b] dark:text-white">{item.title || 'Untitled'}</p>
        <p className="truncate text-[12px] font-medium text-slate-500">
          {typeLabel(item.type)}
          {item.authorName && <> · {item.authorUsername ? `@${item.authorUsername}` : item.authorName}</>}
          {' · '}updated {new Date(item.updatedAt).toLocaleDateString()}
        </p>
      </div>
      <ContentStatusPill status={item.status} />
      <ChevronRight size={16} className={cn('shrink-0', href ? 'text-slate-300' : 'invisible')} />
    </>
  );

  const rowClass = 'flex items-center gap-3.5 rounded-xl px-2 py-2.5';
  return (
    <li>
      {href ? (
        <Link href={href} className={cn(rowClass, 'transition-colors hover:bg-slate-50 dark:hover:bg-neutral-900')}>
          {body}
        </Link>
      ) : (
        <div className={rowClass} title="This content type has no studio page yet">
          {body}
        </div>
      )}
    </li>
  );
}

interface Props {
  channelId: string;
  content: ChannelContentItem[];
  openReviews: Record<string, string>;
  initialStatus?: string;
}

/**
 * Everything this channel holds, filterable by status and type.
 */
export function ChannelContentSection({ channelId, content, openReviews, initialStatus }: Props) {
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [status, setStatus] = useState<string>(
    CONTENT_STATUSES.some((s) => s.id === initialStatus) ? initialStatus! : 'ALL',
  );
  const [type, setType] = useState('ALL');

  const types = useMemo(
    () => Array.from(new Set(content.map((c) => c.type?.toUpperCase()).filter(Boolean))).sort(),
    [content],
  );

  const counts = useMemo(() => {
    const byStatus: Record<string, number> = {};
    content.forEach((c) => (byStatus[statusOf(c)] = (byStatus[statusOf(c)] ?? 0) + 1));
    return byStatus;
  }, [content]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return content
      .filter((c) => status === 'ALL' || statusOf(c) === status)
      .filter((c) => type === 'ALL' || c.type?.toUpperCase() === type)
      .filter(
        (c) =>
          !q ||
          c.title?.toLowerCase().includes(q) ||
          c.authorName?.toLowerCase().includes(q) ||
          c.authorUsername?.toLowerCase().includes(q),
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [content, status, type, query]);

  const filters = [{ id: 'ALL', label: 'All', count: content.length }, ...CONTENT_STATUSES.map((s) => ({ ...s, count: counts[s.id] ?? 0 }))];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatus(f.id)}
              className={cn(
                'inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors',
                status === f.id
                  ? 'bg-[#14142b] text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
              )}
            >
              {f.label}
              <span
                className={cn(
                  'rounded-full px-1.5 text-[10px] font-bold tabular-nums',
                  status === f.id ? 'bg-white/20' : 'bg-slate-100 text-slate-600',
                )}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {types.length > 1 && (
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              aria-label="Content type"
              className="h-9 cursor-pointer rounded-full border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="ALL">All types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {typeLabel(t)}
                </option>
              ))}
            </select>
          )}

          <div className="relative w-full sm:w-56">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or author"
              className="h-9 w-full rounded-full border border-slate-200 bg-white pl-9 pr-3 text-[12.5px] font-medium text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div className="hidden sm:flex items-center rounded-full border border-slate-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex h-7.5 w-7.5 items-center justify-center rounded-full transition-colors',
                viewMode === 'grid' ? 'bg-[#14142b] text-white' : 'text-slate-500 hover:text-slate-800',
              )}
              title="Grid view"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'flex h-7.5 w-7.5 items-center justify-center rounded-full transition-colors',
                viewMode === 'list' ? 'bg-[#14142b] text-white' : 'text-slate-500 hover:text-slate-800',
              )}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-14 text-center dark:border-neutral-800 dark:bg-neutral-900/60">
          <p className="text-[14px] font-semibold text-[#14142b] dark:text-white">
            {content.length === 0 ? 'No content yet' : 'Nothing matches these filters'}
          </p>
          <p className="mt-1 text-[12.5px] font-medium text-slate-500">
            {content.length === 0
              ? 'Content created in Studio for this channel shows up here.'
              : 'Try another status, type or search term.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <ContentCard key={item.id} item={item} channelId={channelId} openReviews={openReviews} />
          ))}
        </div>
      ) : (
        <Panel padded={false} className="p-2">
          <ul className="divide-y divide-slate-100 dark:divide-neutral-800">
            {filtered.map((item) => (
              <ContentRow key={item.id} item={item} channelId={channelId} openReviews={openReviews} />
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}

