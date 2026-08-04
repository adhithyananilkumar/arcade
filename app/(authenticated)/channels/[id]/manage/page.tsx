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
  User,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ChannelSettingsManager } from './ChannelSettingsManager';
import { ChannelStaffManager } from './ChannelStaffManager';
import { ChannelDangerZone } from './ChannelDangerZone';
import { ChannelDoodleBanner } from './ChannelDoodleBanner';
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
  if (s === 'PUBLISHED') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60';
  if (s === 'DRAFT') return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60';
  if (s === 'SUBMITTED') return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/60';
  return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
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
      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-6 px-4 pb-20 pt-24 sm:px-8 sm:pt-28">
        {/* Top Header Row with Back Link & Page Title */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/manage-channels')}
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:border-slate-300 hover:bg-white hover:text-[#14142b] transition-all"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>All Channels</span>
          </button>

          {channel.status && channel.status !== 'ACTIVE' && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-rose-50/90 px-3 py-1 text-[11px] font-bold text-rose-700">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>{channel.status}</span>
              </span>
            </div>
          )}
        </div>

        {!isSuspended && pendingDeletionRequest && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3.5 rounded-2xl border border-amber-200 bg-amber-50/90 p-4.5 shadow-xs"
          >
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-amber-900 text-sm">Deletion Request Pending</h3>
              <p className="mt-0.5 text-xs font-medium text-amber-800/90">
                Submitted on {new Date(pendingDeletionRequest.createdAt).toLocaleDateString()}. Settings, staff, and content controls are locked while pending platform review.
              </p>
            </div>
          </motion.div>
        )}

        {isSuspended && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-4.5 shadow-xs"
          >
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-rose-900 text-sm">Channel Suspended</h3>
              <p className="mt-0.5 text-xs font-medium text-rose-800/90">
                {channel.suspensionReason || 'A platform administrator suspended this channel.'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Channel Hero Banner Card */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_10px_32px_rgba(20,20,43,0.05)]"
        >
          {/* Banner Container */}
          <ChannelDoodleBanner bannerUrl={channel.bannerUrl} className="h-44 w-full sm:h-56" />

          {/* Card Body Content */}
          <div className="px-6 pb-7 sm:px-8">
            {/* Header Row with Avatar Overlap */}
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

              {/* Left Column: Avatar + Channel Info */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                {/* Avatar floating over banner bottom */}
                <div className="-mt-14 sm:-mt-16 shrink-0 relative group/avatar z-10">
                  <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center overflow-hidden rounded-2xl border-[5px] border-white bg-[#F5F0E6] text-black shadow-lg shadow-black/5 ring-1 ring-black/5 transition-transform duration-300 hover:scale-[1.02]">
                    {channel.iconUrl ? (
                      <img
                        src={channel.iconUrl}
                        alt={channel.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#F5F0E6] flex items-center justify-center text-[#14142b]">
                        <Tv size={44} className="stroke-[1.75]" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Name & Metadata Details - Positioned cleanly below banner */}
                <div className="min-w-0 space-y-2 pt-2 sm:pt-4 pb-1">
                  <div>
                    <h1 className="truncate text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#14142b] via-indigo-950 to-purple-950 bg-clip-text text-transparent sm:text-3xl">
                      {channel.name}
                    </h1>
                  </div>

                  {/* Sleek Metadata Pills */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50/70 px-2.5 py-1 text-purple-700 border border-purple-200/60 shadow-2xs">
                      <User size={13} className="text-purple-600" />
                      <span>Owner: {channel.ownerName}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50/70 px-2.5 py-1 text-emerald-700 border border-emerald-200/60 shadow-2xs">
                      <Tv size={13} className="text-emerald-600" />
                      <span>{channel.isPersonal ? 'Personal Channel' : 'Organization Channel'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50/70 px-2.5 py-1 text-amber-700 border border-amber-200/60 shadow-2xs">
                      <Clock size={13} className="text-amber-600" />
                      <span>Created {new Date(channel.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0">
                <Link
                  href={`/channels/${channelId}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 hover:text-[#14142b] hover:border-slate-300 shadow-xs active:scale-[0.98]"
                >
                  <ExternalLink size={14} />
                  <span>View Channel</span>
                </Link>
                {canCreateContent && !isLocked && (
                  <button
                    type="button"
                    onClick={() => router.push('/studio')}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#14142b] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#232735] transition-all active:scale-[0.98]"
                  >
                    <Upload size={14} />
                    <span>Content Studio</span>
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            {channel.description && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="max-w-3xl text-xs sm:text-sm leading-relaxed font-medium text-slate-600">
                  {channel.description}
                </p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Top KPI Summary Grid */}
        <section className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
          {[
            {
              label: 'Total Content',
              value: stats.total,
              icon: FileText,
              cardBg: 'bg-gradient-to-br from-blue-50/65 via-sky-50/35 to-blue-50/65 border-blue-200/60 hover:border-blue-300/80 hover:from-blue-50/90 hover:to-sky-100/60',
              badgeBg: 'bg-blue-100/80 text-blue-700 border-blue-200/70',
              onClick: () => setActiveTab('CONTENT'),
            },
            {
              label: 'Published',
              value: stats.published,
              icon: CheckCircle2,
              cardBg: 'bg-gradient-to-br from-emerald-50/65 via-teal-50/35 to-emerald-50/65 border-emerald-200/60 hover:border-emerald-300/80 hover:from-emerald-50/90 hover:to-teal-100/60',
              badgeBg: 'bg-emerald-100/80 text-emerald-700 border-emerald-200/70',
              onClick: () => {
                setActiveTab('CONTENT');
                setContentFilter('PUBLISHED');
              },
            },
            {
              label: 'Drafts',
              value: stats.drafts,
              icon: Clock,
              cardBg: 'bg-gradient-to-br from-amber-50/65 via-orange-50/35 to-amber-50/65 border-amber-200/60 hover:border-amber-300/80 hover:from-amber-50/90 hover:to-orange-100/60',
              badgeBg: 'bg-amber-100/80 text-amber-700 border-amber-200/70',
              onClick: () => {
                setActiveTab('CONTENT');
                setContentFilter('DRAFT');
              },
            },
            {
              label: 'In Review',
              value: stats.inReview,
              icon: Send,
              cardBg: 'bg-gradient-to-br from-purple-50/65 via-fuchsia-50/35 to-purple-50/65 border-purple-200/60 hover:border-purple-300/80 hover:from-purple-50/90 hover:to-fuchsia-100/60',
              badgeBg: 'bg-purple-100/80 text-purple-700 border-purple-200/70',
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
              className={`group relative overflow-hidden rounded-2xl border ${kpi.cardBg} p-4.5 sm:p-5 text-left shadow-xs transition-all duration-500 ease-out`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className={`grid size-10 place-items-center rounded-xl border ${kpi.badgeBg}`}>
                  <kpi.icon size={18} />
                </span>
                <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-[#14142b]">
                {kpi.value}
              </p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                {kpi.label}
              </p>
            </button>
          ))}
        </section>

        {/* Innovative Floating Dock Pill Navigation (Sticky & Position Stabilized) */}
        <nav aria-label="Channel Navigation" className="sticky top-4 z-30 relative flex justify-center py-2">
          <div className="relative flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-slate-200/60 bg-white/90 p-1.5 shadow-[0_8px_32px_rgba(20,20,43,0.08)] backdrop-blur-xl scrollbar-none ring-1 ring-black/[0.03]">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  onMouseEnter={() => setActiveTab(tab.id)}
                  className={`group relative z-10 flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-extrabold transition-all duration-300 select-none cursor-pointer ${
                    active
                      ? 'text-white'
                      : tab.danger
                        ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50/70'
                        : 'text-slate-600 hover:text-[#14142b] hover:bg-slate-100/70'
                  }`}
                >
                  {/* Active Floating Capsule with Glow */}
                  {active && (
                    <motion.div
                      layoutId="activeManageDockTab"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                      }}
                      className={`absolute inset-0 z-[-1] rounded-full ${
                        tab.danger
                          ? 'bg-rose-600 shadow-[0_4px_16px_rgba(225,29,72,0.3)]'
                          : 'bg-gradient-to-r from-[#14142b] via-indigo-950 to-[#14142b] shadow-[0_4px_16px_rgba(20,20,43,0.25)]'
                      }`}
                    />
                  )}

                  <tab.icon
                    size={15}
                    className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}
                  />
                  <span>{tab.label}</span>

                  {/* Content Count Badge */}
                  {tab.id === 'CONTENT' && content.length > 0 && (
                    <span
                      className={`ml-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {content.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Stable Tab Panels Container with Min-Height to Prevent Page Scroll Jump */}
        <div className="min-h-[550px]">
          {/* Keep panels mounted — avoids flicker / form reset on tab switch */}
          <div className={activeTab === 'OVERVIEW' ? 'block' : 'hidden'}>
            <div className="space-y-6">
              {/* Management tools */}
              <div>
                <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Tools
                </h2>
                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                  {canCreateContent && (
                    <ToolCard
                      icon={Video}
                      title="Content studio"
                      desc="Create & edit courses, roadmaps, workshops"
                      onClick={() => router.push('/studio')}
                      colorScheme="blue"
                    />
                  )}
                  <ToolCard
                    icon={BarChart3}
                    title="Performance"
                    desc={`${stats.published} live · ${stats.drafts} drafts`}
                    onClick={() => setActiveTab('CONTENT')}
                    colorScheme="emerald"
                  />
                  {!channel.isPersonal && (
                    <ToolCard
                      icon={Users}
                      title="Staff & access"
                      desc="Invite collaborators and set roles"
                      onClick={() => setActiveTab('STAFF')}
                      colorScheme="purple"
                    />
                  )}
                  <ToolCard
                    icon={Settings}
                    title="Channel settings"
                    desc="Branding, name, and description"
                    onClick={() => setActiveTab('SETTINGS')}
                    disabled={isLocked}
                    colorScheme="amber"
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
                    className="text-[12px] font-bold text-[#14142b] hover:underline"
                  >
                    See all
                  </button>
                </div>

                {recentContent.length === 0 ? (
                  <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-300/80 bg-gradient-to-b from-white via-slate-50/50 to-white px-6 py-14 text-center shadow-2xs">
                    {/* Hand-Drawn Educational Doodle Background Accents (No AI icons) */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.16] select-none overflow-hidden">
                      {/* Left: Hand-drawn Video Clapper / Film Reel doodle */}
                      <svg className="absolute left-6 sm:left-12 top-1/2 -translate-y-1/2 size-22 text-slate-900" viewBox="0 0 70 70" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="10" y="22" width="50" height="36" rx="5" />
                        <path d="M10 28 L60 28" />
                        <polygon points="30,34 45,40 30,46" fill="currentColor" fillOpacity="0.3" />
                        <path d="M12 14 L24 22 M28 14 L40 22 M44 14 L56 22" strokeDasharray="3 2" />
                      </svg>

                      {/* Right: Hand-drawn Open Book & Bookmark doodle */}
                      <svg className="absolute right-6 sm:right-14 top-1/2 -translate-y-1/2 size-24 text-slate-900" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 22 C 25 17, 35 19, 40 22 C 45 19, 55 17, 65 22 L 65 58 C 55 53, 45 55, 40 58 C 35 55, 25 53, 15 58 Z" />
                        <path d="M40 22 L 40 58" />
                        <path d="M22 32 C 28 29, 34 30, 37 32" strokeDasharray="3 2" />
                        <path d="M22 41 C 28 38, 34 39, 37 41" strokeDasharray="3 2" />
                        <path d="M43 32 C 46 30, 52 29, 58 32" strokeDasharray="3 2" />
                      </svg>
                    </div>

                    <div className="relative z-10">
                      <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl bg-slate-100/90 text-slate-400 border border-slate-200/60 shadow-2xs">
                        <Video size={20} />
                      </div>
                      <p className="text-sm font-extrabold text-[#14142b]">No content yet</p>
                      <p className="mt-1 text-xs font-medium text-slate-500 max-w-sm mx-auto">
                        Publish your first course or roadmap from Content Studio.
                      </p>
                      {canCreateContent && !isLocked && (
                        <button
                          type="button"
                          onClick={() => router.push('/studio')}
                          className="mt-4.5 inline-flex items-center gap-1.5 rounded-full bg-[#14142b] px-4.5 py-2 text-[12px] font-bold text-white shadow-xs hover:bg-[#232735] transition-colors"
                        >
                          <Upload size={14} />
                          Create content
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <ul className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_4px_16px_rgba(20,20,43,0.04)]">
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
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                <div className="flex max-w-full items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                  {(
                    [
                      { id: 'ALL', label: 'All', icon: LayoutGrid, count: stats.total },
                      { id: 'PUBLISHED', label: 'Published', icon: CheckCircle2, count: stats.published },
                      { id: 'DRAFT', label: 'Drafts', icon: Clock, count: stats.drafts },
                      { id: 'SUBMITTED', label: 'In review', icon: Send, count: stats.inReview },
                    ] as const
                  ).map((f) => {
                    const active = contentFilter === f.id;
                    const Icon = f.icon;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setContentFilter(f.id)}
                        onMouseEnter={() => setContentFilter(f.id)}
                        className={`group relative z-10 flex shrink-0 items-center gap-2 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md px-3.5 py-1.5 text-xs font-extrabold transition-all duration-300 select-none cursor-pointer ${
                          active ? 'text-white' : 'text-slate-600 hover:text-[#14142b] hover:bg-slate-100/70'
                        }`}
                      >
                        {active && (
                          <motion.div
                            layoutId="subCategoryAmbientRibbon"
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 32,
                            }}
                            className="absolute inset-0 z-[-1] rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-[#14142b] shadow-xs"
                          />
                        )}

                        <Icon size={14} className={active ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'} />
                        <span>{f.label}</span>
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold transition-colors ${
                            active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/70'
                          }`}
                        >
                          {f.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {canCreateContent && !isLocked && (
                  <button
                    type="button"
                    onClick={() => router.push('/studio')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#14142b] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#232735]"
                  >
                    <Upload size={13} />
                    Open studio
                  </button>
                )}
              </div>

              {filteredContent.length === 0 ? (
                <div className="rounded-2xl border border-slate-200/80 bg-white/80 py-14 text-center text-sm font-medium text-slate-400">
                  Nothing in this segment.
                </div>
              ) : (
                <ul className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_4px_16px_rgba(20,20,43,0.04)]">
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
    </div>
  );
}

function ToolCard({
  icon: Icon,
  title,
  desc,
  onClick,
  disabled,
  colorScheme = 'blue',
}: {
  icon: typeof Video;
  title: string;
  desc: string;
  onClick: () => void;
  disabled?: boolean;
  colorScheme?: 'blue' | 'emerald' | 'purple' | 'amber';
}) {
  const schemeStyles = {
    blue: {
      cardShape: 'rounded-tl-[28px] rounded-br-[28px] rounded-tr-xl rounded-bl-xl',
      iconShape: 'rounded-[18px] bg-gradient-to-br from-blue-100 to-sky-100/80 text-blue-700 border-blue-200/80',
      hover: 'hover:bg-gradient-to-br hover:from-blue-50/80 hover:to-sky-50/50 hover:border-blue-300/90',
      arrow: 'group-hover:text-blue-600',
    },
    emerald: {
      cardShape: 'rounded-tr-[28px] rounded-bl-[28px] rounded-tl-xl rounded-br-xl',
      iconShape: 'rounded-[16px] bg-gradient-to-br from-emerald-100 to-teal-100/80 text-emerald-700 border-emerald-200/80',
      hover: 'hover:bg-gradient-to-br hover:from-emerald-50/80 hover:to-teal-50/50 hover:border-emerald-300/90',
      arrow: 'group-hover:text-emerald-600',
    },
    purple: {
      cardShape: 'rounded-full px-5',
      iconShape: 'rounded-[20px] bg-gradient-to-br from-purple-100 to-fuchsia-100/80 text-purple-700 border-purple-200/80',
      hover: 'hover:bg-gradient-to-br hover:from-purple-50/80 hover:to-fuchsia-50/50 hover:border-purple-300/90',
      arrow: 'group-hover:text-purple-600',
    },
    amber: {
      cardShape: 'rounded-t-[26px] rounded-b-2xl',
      iconShape: 'rounded-[16px] bg-gradient-to-br from-amber-100 to-orange-100/80 text-amber-700 border-amber-200/80',
      hover: 'hover:bg-gradient-to-br hover:from-amber-50/80 hover:to-orange-50/50 hover:border-amber-300/90',
      arrow: 'group-hover:text-amber-600',
    },
  }[colorScheme];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group relative flex items-center justify-between gap-3.5 ${schemeStyles.cardShape} border border-slate-200/60 bg-white/90 p-4 text-left shadow-[0_4px_16px_rgba(20,20,43,0.04)] transition-all duration-300 ${schemeStyles.hover} disabled:cursor-not-allowed disabled:opacity-50 select-none`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <span className={`grid size-11 shrink-0 place-items-center border shadow-2xs transition-transform duration-300 group-hover:scale-105 ${schemeStyles.iconShape}`}>
          <Icon size={19} />
        </span>
        <div className="min-w-0">
          <span className="block text-xs sm:text-sm font-extrabold text-[#14142b] truncate">{title}</span>
          <span className="mt-0.5 block text-[11px] font-medium leading-normal text-slate-500 truncate">
            {desc}
          </span>
        </div>
      </div>
      <ChevronRight
        size={16}
        className={`shrink-0 text-slate-300 opacity-60 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 ${schemeStyles.arrow}`}
      />
    </button>
  );
}

function ContentRow({ item, last }: { item: ChannelContentItem; last?: boolean }) {
  return (
    <li
      className={`flex items-center gap-3.5 px-4 sm:px-5 py-3.5 transition-colors hover:bg-slate-50/80 ${last ? '' : 'border-b border-slate-100'
        }`}
    >
      <div className="flex h-12 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-slate-500 border border-slate-200/60">
        {item.coverImageUrl ? (
          <img src={item.coverImageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <TypeIcon type={item.type} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs sm:text-sm font-bold text-[#14142b]">{item.title}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
          <span className="uppercase tracking-wider text-[10px] text-slate-600">{item.type}</span>
          <span className="text-slate-300">·</span>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusTone(
              item.status,
            )}`}
          >
            {item.status}
          </span>
          <span className="text-slate-300">·</span>
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
        className="shrink-0 rounded-full border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-[#14142b]"
      >
        Open
      </Link>
    </li>
  );
}

