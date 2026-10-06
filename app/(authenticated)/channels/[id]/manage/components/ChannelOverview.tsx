'use client';

import Link from 'next/link';
import { ArrowRight, ClipboardCheck, Plus } from 'lucide-react';
import type { Channel, ChannelContentItem } from '@/domains/channels';
import { Panel } from '@/shared/design-system/ui/panel';
import { SectionHeader } from '@/shared/design-system/ui/page-header';
import { ChannelProfileCard } from './ChannelProfileCard';
import { ContentCard } from './ChannelContentSection';

interface Props {
  channel: Channel;
  content: ChannelContentItem[];
  openReviews: Record<string, string>;
  canEdit: boolean;
  canReview: boolean;
  /** Builds a link to another section of this dashboard, e.g. `tabHref('content', { status: 'DRAFT' })`. */
  tabHref: (tab: string, params?: Record<string, string>) => string;
  onChannelUpdate: (channel: Channel) => void;
  onEditProfile?: () => void;
  /** Opens the organisation logo modal — the one place the logo changes. */
  onEditLogo?: () => void;
}

export function ChannelOverview({
  channel,
  content,
  openReviews,
  canEdit,
  canReview,
  tabHref,
  onChannelUpdate,
  onEditProfile,
  onEditLogo,
}: Props) {
  const openReviewCount = Object.keys(openReviews).length;

  const recent = [...content]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <ChannelProfileCard
        channel={channel}
        canEdit={canEdit}
        onUpdate={onChannelUpdate}
        onEditProfile={onEditProfile}
        onEditLogo={onEditLogo}
      />

      {canReview && !channel.isPersonal && openReviewCount > 0 && (
        <Link
          href={tabHref('reviews')}
          className="flex items-center gap-3 rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-md rounded-bl-md border border-amber-200 bg-amber-50/70 px-5 py-4 transition-colors hover:bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/10 dark:hover:bg-amber-500/10"
        >
          <ClipboardCheck size={18} className="shrink-0 text-amber-700 dark:text-amber-300" />
          <p className="flex-1 text-[13px] font-semibold text-amber-900 dark:text-amber-200">
            {openReviewCount} submission{openReviewCount === 1 ? '' : 's'} waiting for your organization&apos;s review
          </p>
          <ArrowRight size={16} className="text-amber-700 dark:text-amber-300" />
        </Link>
      )}

      <Panel className="space-y-5">
        <SectionHeader
          title="Recently updated"
          description="The latest changes across this channel's content."
          actions={
            <>
              <Link
                href="/studio"
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-semibold text-on-ink hover:bg-ink-hover"
              >
                <Plus size={14} /> Create
              </Link>
              {content.length > 0 && (
                <Link
                  href={tabHref('content')}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-surface px-3.5 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  View all <ArrowRight size={13} />
                </Link>
              )}
            </>
          }
        />
        {recent.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 px-5 py-10 text-center text-[13px] font-medium text-slate-500">
            Nothing published to this channel yet. Content you create in Studio for this channel appears here.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((item) => (
              <ContentCard key={item.id} item={item} channelId={channel.id} openReviews={openReviews} />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
