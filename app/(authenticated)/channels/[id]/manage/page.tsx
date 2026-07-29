'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Channel,
  ChannelContentItem,
  ChannelDeletionRequestDto,
  channelService,
} from '@/domains/channels';
import { toast } from 'sonner';
import {
  Tv,
  Upload,
  Settings,
  Users,
  BarChart3,
  Video,
  Loader2,
  ArrowLeft,
  LayoutGrid,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Map,
  Wrench,
  FileText,
  CheckCircle2,
  Clock,
  Send,
  ChevronRight,
  Link as LinkIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ChannelSettingsManager } from './ChannelSettingsManager';
import { ChannelStaffManager } from './ChannelStaffManager';
import { ChannelSocialLinksCard } from './ChannelSocialLinksCard';
import { ChannelDangerZone } from './ChannelDangerZone';
import { useAuthStore } from '@/infrastructure/auth/auth.store';

type ManageTab = 'OVERVIEW' | 'CONTENT' | 'STAFF' | 'SETTINGS' | 'DANGER';
type ContentFilter = 'ALL' | 'DRAFT' | 'SUBMITTED' | 'PUBLISHED';

function TypeIcon({ type }: { type: string }) {
  if (type === 'ROADMAP') return <Map size={14} />;
  if (type === 'WORKSHOP' || type === 'WEBINAR') return <Wrench size={14} />;
  return <BookOpen size={14} />;
}

function statusTone(status: string) {
  const s = status?.toUpperCase();
  if (s === 'PUBLISHED') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (s === 'DRAFT') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (s === 'SUBMITTED') return 'bg-orange-50 text-orange-700 border-orange-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
}

function editHref(item: ChannelContentItem) {
  const t = item.type?.toUpperCase();
  if (t === 'ROADMAP') return `/studio/roadmap/${item.id}/edit`;
  if (t === 'WORKSHOP' || t === 'WEBINAR') return `/studio/workshop/${item.id}`;
  return `/studio/course/${item.id}/edit`;
}

export default function ManageChannelPage() {
  const params = useParams();
  const router = useRouter();
  const channelId = params.id as string;
  const { user } = useAuthStore();

  const [channel, setChannel] = useState<Channel | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [pendingDeletionRequest, setPendingDeletionRequest] =
    useState<ChannelDeletionRequestDto | null>(null);
  const [content, setContent] = useState<ChannelContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ManageTab>('OVERVIEW');
  const [contentFilter, setContentFilter] = useState<ContentFilter>('ALL');

  useEffect(() => {
    if (channelId) fetchChannel();
  }, [channelId]);

  const fetchChannel = async () => {
    try {
      setLoading(true);
      const [channelData, perms, myDeletionRequests, channelContent] = await Promise.all([
        channelService.getChannel(channelId),
        channelService.getMyChannelPermissions(channelId),
        channelService.getMyDeletionRequests().catch(() => []),
        channelService.getChannelContent(channelId).catch(() => [] as ChannelContentItem[]),
      ]);
      setChannel(channelData);
      setPermissions(perms);
      setPendingDeletionRequest(
        myDeletionRequests.find((r) => r.channelId === channelId && r.status === 'PENDING') ||
          null,
      );
      setContent(channelContent);
    } catch {
      toast.error('Failed to load channel details');
      router.push('/manage-channels');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const published = content.filter((c) => c.status?.toUpperCase() === 'PUBLISHED').length;
    const drafts = content.filter((c) => c.status?.toUpperCase() === 'DRAFT').length;
    const inReview = content.filter((c) => c.status?.toUpperCase() === 'SUBMITTED').length;
    return {
      total: content.length,
      published,
      drafts,
      inReview,
    };
  }, [content]);

  const filteredContent = useMemo(() => {
    if (contentFilter === 'ALL') return content;
    return content.filter((c) => c.status?.toUpperCase() === contentFilter);
  }, [content, contentFilter]);

  const recentContent = useMemo(
    () =>
      [...content]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 6),
    [content],
  );

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 40%, #FFFFFF 100%)' }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-[#14142b]" />
      </div>
    );
  }

  if (!channel) return null;

  const isSuspended = channel.status === 'SUSPENDED';
  const isLocked = isSuspended || !!pendingDeletionRequest;
  const canCreateContent =
    permissions.includes('ALL') ||
    permissions.includes('channel.videos.upload') ||
    permissions.includes('channel.videos.upload.own');
  const isOwner = user?.id === channel.ownerId;

  const tabs: { id: ManageTab; label: string; icon: typeof LayoutGrid; danger?: boolean }[] = [
    { id: 'OVERVIEW', label: 'Overview', icon: LayoutGrid },
    { id: 'CONTENT', label: 'Content', icon: Video },
    ...(!channel.isPersonal
      ? [{ id: 'STAFF' as const, label: 'Staff', icon: Users }]
      : []),
    { id: 'SETTINGS', label: 'Settings', icon: Settings },
    ...(isOwner ? [{ id: 'DANGER' as const, label: 'Danger', icon: AlertTriangle, danger: true }] : []),
  ];

  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 35%, #FFFFFF 70%)',
      }}
    >
      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-6 px-5 pb-16 pt-28 sm:px-8 sm:pt-32">
        <button
          type="button"
          onClick={() => router.push('/manage-channels')}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 transition-colors hover:text-[#14142b]"
        >
          <ArrowLeft size={15} />
          All channels
        </button>

        {!isSuspended && pendingDeletionRequest && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={18} />
            <div>
              <h3 className="font-bold text-amber-800">Deletion request pending</h3>
              <p className="mt-0.5 text-sm text-amber-700">
                Submitted {new Date(pendingDeletionRequest.createdAt).toLocaleDateString()}. Settings,
                staff, and content are locked until review.
              </p>
            </div>
          </div>
        )}

        {isSuspended && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
            <AlertTriangle className="mt-0.5 shrink-0 text-rose-600" size={18} />
            <div>
              <h3 className="font-bold text-rose-800">Channel suspended</h3>
              <p className="mt-0.5 text-sm text-rose-700">
                {channel.suspensionReason || 'A platform administrator suspended this channel.'}
              </p>
            </div>
          </div>
        )}

        {/* Channel hero */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_8px_28px_rgba(20,20,43,0.06)]"
        >
          {channel.bannerUrl ? (
            <div className="h-36 w-full sm:h-44">
              <img
                src={channel.bannerUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div
              className="h-36 w-full sm:h-44"
              style={{
                background:
                  'linear-gradient(135deg, #14142b 0%, #2A2F45 55%, #FF6B4A 140%)',
              }}
            />
          )}

          <div className="px-5 pb-6 sm:px-7">
            <div className="-mt-10 mb-5 flex flex-col gap-5 sm:-mt-12 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow-md sm:h-24 sm:w-24">
                  {channel.iconUrl ? (
                    <img
                      src={channel.iconUrl}
                      alt={channel.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Tv size={36} className="text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 space-y-1 pb-0.5">
                  <h1 className="truncate text-2xl font-bold tracking-tight text-[#14142b] sm:text-[1.75rem]">
                    {channel.name}
                  </h1>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium text-slate-500">
                    <span>{channel.ownerName}</span>
                    <span className="text-slate-300">·</span>
                    <span>{channel.isPersonal ? 'Personal' : 'Organization'}</span>
                    <span className="text-slate-300">·</span>
                    <span>Since {new Date(channel.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/channels/${channelId}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-[#14142b] transition-colors hover:border-slate-300"
                >
                  <ExternalLink size={14} />
                  View public
                </Link>
                {canCreateContent && !isLocked && (
                  <button
                    type="button"
                    onClick={() => router.push('/studio')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#14142b] px-4 py-2 text-[12px] font-semibold text-white shadow-[0_8px_18px_rgba(20,20,43,0.18)] transition-colors hover:bg-[#232735]"
                  >
                    <Upload size={14} />
                    Create
                  </button>
                )}
              </div>
            </div>

            {channel.description && (
              <p className="max-w-3xl text-[13px] leading-relaxed text-slate-600">
                {channel.description}
              </p>
            )}

          </div>
        </motion.section>

        {/* Social Links Editor Card */}
        <ChannelSocialLinksCard 
          channel={channel} 
          canManageSettings={permissions.includes('ALL') || permissions.includes('channel.settings.manage') || isOwner} 
          onUpdate={setChannel} 
        />

        {/* Top KPI calls — YouTube Studio style */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: 'Total content',
              value: stats.total,
              icon: FileText,
              tone: 'bg-slate-100 text-[#14142b]',
              onClick: () => setActiveTab('CONTENT'),
            },
            {
              label: 'Published',
              value: stats.published,
              icon: CheckCircle2,
              tone: 'bg-emerald-50 text-emerald-700',
              onClick: () => {
                setActiveTab('CONTENT');
                setContentFilter('PUBLISHED');
              },
            },
            {
              label: 'Drafts',
              value: stats.drafts,
              icon: Clock,
              tone: 'bg-amber-50 text-amber-700',
              onClick: () => {
                setActiveTab('CONTENT');
                setContentFilter('DRAFT');
              },
            },
            {
              label: 'In review',
              value: stats.inReview,
              icon: Send,
              tone: 'bg-orange-50 text-orange-700',
              onClick: () => {
                setActiveTab('CONTENT');
                setContentFilter('SUBMITTED');
              },
            },
          ].map((kpi) => (
            <button
              key={kpi.label}
              type="button"
              onClick={kpi.onClick}
              className="rounded-xl border border-slate-200/80 bg-white/95 p-4 text-left shadow-[0_4px_16px_rgba(20,20,43,0.04)] transition-all hover:border-slate-300 hover:shadow-[0_8px_22px_rgba(20,20,43,0.08)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className={`grid size-9 place-items-center rounded-lg ${kpi.tone}`}>
                  <kpi.icon size={16} />
                </span>
                <ChevronRight size={14} className="text-slate-300" />
              </div>
              <p className="text-[1.65rem] font-bold tabular-nums tracking-tight text-[#14142b]">
                {kpi.value}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                {kpi.label}
              </p>
            </button>
          ))}
        </section>

        {/* Segmented tabs */}
        <div className="flex flex-wrap gap-1 rounded-full border border-slate-200/80 bg-white/90 p-1 shadow-[0_4px_14px_rgba(20,20,43,0.04)]">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all ${
                  active
                    ? tab.danger
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-[#14142b] text-white shadow-sm'
                    : tab.danger
                      ? 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-[#14142b]'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Keep panels mounted — avoids flicker / form reset on tab switch */}
        <div className={activeTab === 'OVERVIEW' ? 'block' : 'hidden'}>
          <div className="space-y-6">
              {/* Management tools — placed like YT Studio rail */}
              <div>
                <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Tools
                </h2>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {canCreateContent && (
                    <ToolCard
                      icon={Video}
                      title="Content studio"
                      desc="Create & edit courses, roadmaps, workshops"
                      onClick={() => router.push('/studio')}
                    />
                  )}
                  <ToolCard
                    icon={BarChart3}
                    title="Performance"
                    desc={`${stats.published} live · ${stats.drafts} drafts`}
                    onClick={() => setActiveTab('CONTENT')}
                  />
                  {!channel.isPersonal && (
                    <ToolCard
                      icon={Users}
                      title="Staff & access"
                      desc="Invite collaborators and set roles"
                      onClick={() => setActiveTab('STAFF')}
                    />
                  )}
                  <ToolCard
                    icon={Settings}
                    title="Channel settings"
                    desc="Branding, name, and description"
                    onClick={() => setActiveTab('SETTINGS')}
                    disabled={isLocked}
                  />
                </div>
              </div>

              {/* Recent content */}
              <div>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Recent content
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('CONTENT')}
                    className="text-[12px] font-semibold text-[#FF6B4A] hover:underline"
                  >
                    See all
                  </button>
                </div>

                {recentContent.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-6 py-14 text-center">
                    <Video className="mx-auto mb-3 text-slate-300" size={28} />
                    <p className="text-sm font-semibold text-[#14142b]">No content yet</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Publish your first course or roadmap from Content Studio.
                    </p>
                    {canCreateContent && !isLocked && (
                      <button
                        type="button"
                        onClick={() => router.push('/studio')}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#14142b] px-4 py-2 text-[12px] font-semibold text-white"
                      >
                        <Upload size={14} />
                        Create content
                      </button>
                    )}
                  </div>
                ) : (
                  <ul className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 shadow-[0_4px_16px_rgba(20,20,43,0.04)]">
                    {recentContent.map((item, i) => (
                      <ContentRow key={item.id} item={item} last={i === recentContent.length - 1} />
                    ))}
                  </ul>
                )}
              </div>
          </div>
        </div>

        <div className={activeTab === 'CONTENT' ? 'block' : 'hidden'}>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: 'ALL', label: 'All' },
                      { id: 'PUBLISHED', label: 'Published' },
                      { id: 'DRAFT', label: 'Drafts' },
                      { id: 'SUBMITTED', label: 'In review' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setContentFilter(f.id)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                        contentFilter === f.id
                          ? 'border-[#14142b] bg-[#14142b] text-white'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                {canCreateContent && !isLocked && (
                  <button
                    type="button"
                    onClick={() => router.push('/studio')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#14142b] px-3.5 py-2 text-[12px] font-semibold text-white"
                  >
                    <Upload size={13} />
                    Open studio
                  </button>
                )}
              </div>

              {filteredContent.length === 0 ? (
                <div className="rounded-xl border border-slate-200/80 bg-white/80 py-14 text-center text-sm text-slate-400">
                  Nothing in this segment.
                </div>
              ) : (
                <ul className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/95">
                  {filteredContent.map((item, i) => (
                    <ContentRow
                      key={item.id}
                      item={item}
                      last={i === filteredContent.length - 1}
                    />
                  ))}
                </ul>
              )}
            </div>
        </div>

        {!channel.isPersonal && (
          <div className={activeTab === 'STAFF' ? 'block' : 'hidden'}>
            <ChannelStaffManager
              channelId={channelId}
              permissions={permissions}
              isSuspended={isLocked}
            />
          </div>
        )}

        <div className={activeTab === 'SETTINGS' ? 'block' : 'hidden'}>
          <ChannelSettingsManager
            channel={channel}
            onUpdate={setChannel}
            permissions={permissions}
            locked={isLocked}
          />
        </div>

        {isOwner && (
          <div className={activeTab === 'DANGER' ? 'block' : 'hidden'}>
            <ChannelDangerZone channel={channel} />
          </div>
        )}
      </div>
    </div>
  );
}

function ToolCard({
  icon: Icon,
  title,
  desc,
  onClick,
  disabled,
}: {
  icon: typeof Video;
  title: string;
  desc: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/95 p-4 text-left shadow-[0_4px_14px_rgba(20,20,43,0.04)] transition-all hover:border-slate-300 hover:shadow-[0_8px_20px_rgba(20,20,43,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-[#14142b]">
        <Icon size={18} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-bold text-[#14142b]">{title}</span>
        <span className="mt-0.5 block text-[11px] font-medium leading-snug text-slate-400">
          {desc}
        </span>
      </span>
    </button>
  );
}

function ContentRow({ item, last }: { item: ChannelContentItem; last?: boolean }) {
  return (
    <li
      className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/80 ${
        last ? '' : 'border-b border-slate-100'
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-500">
        {item.coverImageUrl ? (
          <img src={item.coverImageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <TypeIcon type={item.type} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-[#14142b]">{item.title}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-400">
          <span className="uppercase tracking-wide">{item.type}</span>
          <span
            className={`rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${statusTone(
              item.status,
            )}`}
          >
            {item.status}
          </span>
          <span>
            Edited{' '}
            {new Date(item.updatedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </p>
      </div>
      <Link
        href={editHref(item)}
        className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-[#14142b] transition-colors hover:border-slate-300 hover:bg-white"
      >
        Open
      </Link>
    </li>
  );
}
