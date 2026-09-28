'use client';

import Link from 'next/link';
import { ArrowRight, ClipboardCheck, FileText, PenLine, Plus, Send } from 'lucide-react';
import type { Channel, ChannelContentItem } from '@/domains/channels';
import { Panel } from '@/shared/design-system/ui/panel';
import { SectionHeader } from '@/shared/design-system/ui/page-header';
import { ChannelProfileCard } from './ChannelProfileCard';
import { ContentCard } from './ChannelContentSection';
import { statusOf } from './contentStatus';

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
}: Props) {
  const count = (status: string) => content.filter((c) => statusOf(c) === status).length;
  const openReviewCount = Object.keys(openReviews).length;

  const stats = [
    { label: 'All content', value: content.length, icon: FileText, href: tabHref('content') },
    { label: 'Published', value: count('PUBLISHED'), icon: Send, href: tabHref('content', { status: 'PUBLISHED' }) },
    { label: 'In review', value: count('SUBMITTED'), icon: ClipboardCheck, href: tabHref('content', { status: 'SUBMITTED' }) },
    { label: 'Drafts', value: count('DRAFT'), icon: PenLine, href: tabHref('content', { status: 'DRAFT' }) },
  ];

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
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="group rounded-[20px] border border-slate-200/80 bg-white p-4 transition-colors hover:border-slate-300 hover:bg-slate-50/60 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[12px] font-semibold text-slate-500">{s.label}</span>
                <Icon size={15} />
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-[#14142b] dark:text-white">{s.value}</p>
            </Link>
          );
        })}
      </div>

      {canReview && !channel.isPersonal && openReviewCount > 0 && (
        <Link
          href={tabHref('reviews')}
          className="flex items-center gap-3 rounded-[20px] border border-amber-200 bg-amber-50/70 px-5 py-4 transition-colors hover:bg-amber-50"
        >
          <ClipboardCheck size={18} className="shrink-0 text-amber-700" />
          <p className="flex-1 text-[13px] font-semibold text-amber-900">
            {openReviewCount} submission{openReviewCount === 1 ? '' : 's'} waiting for your organization&apos;s review
          </p>
          <ArrowRight size={16} className="text-amber-700" />
        </Link>
      )}

      <Panel className="space-y-4">
        <SectionHeader
          title="Recently updated"
          description="The latest changes across this channel's content."
          actions={
            <>
              <Link
                href="/studio"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#14142b] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-[#232735]"
              >
                <Plus size={14} /> Create
              </Link>
              {content.length > 0 && (
                <Link
                  href={tabHref('content')}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recent.map((item) => (
              <ContentCard key={item.id} item={item} channelId={channel.id} openReviews={openReviews} />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
