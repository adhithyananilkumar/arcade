'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Channel,
  ChannelContentItem,
  ChannelDeletionRequestDto,
  channelService,
} from '@/domains/channels';
import { platformReviewApi } from '@/domains/publishing';
import { toast } from 'sonner';
import {
  Home,
  ArrowLeft,
  LayoutGrid,
  AlertTriangle,
  BookOpen,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  Send,
  ChevronRight,
  Link as LinkIcon,
  Bell,
  Calendar,
  Star,
  BarChart3,
  Activity,
  ShieldAlert,
  Loader2,
  Video,
  Upload,
} from 'lucide-react';

import { OrganizationHeader } from './components/OrganizationHeader';
import { SmallCourseOverview } from './components/SmallCourseOverview';
import { CourseManagementSection } from './components/CourseManagementSection';
import { ArticlesManagementSection } from './components/ArticlesManagementSection';
import { EventsManagementSection } from './components/EventsManagementSection';
import { ReviewsFeedbackSection } from './components/ReviewsFeedbackSection';
import { OrganizationAnalyticsSection } from './components/OrganizationAnalyticsSection';
import { RecentActivityTimeline } from './components/RecentActivityTimeline';
import { EditOrganizationModal } from './components/EditOrganizationModal';

import { ChannelStaffManager } from './ChannelStaffManager';
import { ChannelNotificationsManager } from './ChannelNotificationsManager';
import { ChannelSocialLinksCard } from './ChannelSocialLinksCard';
import { ChannelDangerZone } from './ChannelDangerZone';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/design-system/ui/tooltip';

type ManageTab =
  | 'OVERVIEW'
  | 'COURSES'
  | 'CONTENT'
  | 'STAFF'
  | 'ARTICLES'
  | 'EVENTS'
  | 'REVIEWS'
  | 'ANALYTICS'
  | 'ACTIVITY'
  | 'NOTIFICATIONS'
  | 'DANGER';

type ContentFilter = 'ALL' | 'PUBLISHED' | 'DRAFT' | 'SUBMITTED';

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
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [contentFilter, setContentFilter] = useState<ContentFilter>('ALL');
  const [channelReviews, setChannelReviews] = useState<Record<string, string>>({});

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

      const savedBanner = typeof window !== 'undefined' ? localStorage.getItem(`arcade_org_banner_${channelId}`) : null;
      const savedLogo = typeof window !== 'undefined' ? localStorage.getItem(`arcade_org_logo_${channelId}`) : null;

      const channelWithSavedBranding: Channel = {
        ...channelData,
        bannerUrl: savedBanner !== null ? savedBanner : channelData.bannerUrl,
        iconUrl: savedLogo !== null ? savedLogo : channelData.iconUrl,
      };

      setChannel(channelWithSavedBranding);
      setPermissions(perms);
      setPendingDeletionRequest(
        myDeletionRequests.find((r) => r.channelId === channelId && r.status === 'PENDING') || null,
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
        .filter((c) => c.status?.toUpperCase() === 'PUBLISHED')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 6),
    [content],
  );

  const canReviewChannelContent =
    permissions.includes('ALL') ||
    permissions.includes('channel.content.review');

  useEffect(() => {
    if (canReviewChannelContent) {
      platformReviewApi.list({ channelId }).then(items => {
        const reviewMap: Record<string, string> = {};
        items.forEach(i => {
           if (i.status === 'OPEN') {
             reviewMap[i.contentId] = i.id;
           }
        });
        setChannelReviews(reviewMap);
      }).catch(console.error);
    }
  }, [channelId, canReviewChannelContent]);

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 40%, #FFFFFF 100%)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-xs font-black uppercase tracking-widest text-indigo-900">
            Loading Arcade Organization Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!channel) return null;

  const isSuspended = channel.status === 'SUSPENDED';
  const isOwner = user?.id === channel.ownerId;
  const isPersonalChannel = channel.isPersonal;

  const mainTabs: { id: ManageTab; label: string; icon: any; badge?: string; danger?: boolean }[] = [
    { id: 'OVERVIEW', label: 'Overview', icon: LayoutGrid },
    { id: 'COURSES', label: 'Courses', icon: BookOpen, badge: `${content.length || 48}` },
    ...(!channel.isPersonal
      ? [{ id: 'STAFF' as const, label: 'Staff', icon: Users, badge: '34' }]
      : []),
    { id: 'ARTICLES', label: 'Articles', icon: FileText, badge: '124' },
    { id: 'EVENTS', label: 'Events', icon: Calendar, badge: '18' },
    { id: 'REVIEWS', label: 'Reviews', icon: Star, badge: '4.92 ★' },
    { id: 'ANALYTICS', label: 'Analytics', icon: BarChart3 },
    { id: 'ACTIVITY', label: 'Timeline', icon: Activity },
    { id: 'NOTIFICATIONS', label: 'Notifications', icon: Bell as any },
    ...(isOwner ? [{ id: 'DANGER' as const, label: 'Danger', icon: ShieldAlert, danger: true }] : []),
  ];

  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 35%, #FFFFFF 70%)',
      }}
    >
      {/* Floating Horizontal Bottom Dock Navigation Bar */}
      <TooltipProvider delay={100}>
        <motion.nav
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
          aria-label="Floating Organization Navigation Dock"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 p-2 shadow-[0_16px_40px_rgba(20,20,43,0.15)] backdrop-blur-xl ring-1 ring-black/[0.04] max-w-[95vw] overflow-x-auto scrollbar-none"
        >
        <motion.div 
          layout 
          className={`relative group shrink-0 ${hoveredTab === 'HOME' ? 'mx-2 sm:mx-3' : 'mx-0'}`}
          onHoverStart={() => setHoveredTab('HOME')}
          onHoverEnd={() => setHoveredTab(null)}
        >
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="relative flex h-11 w-11 items-center justify-center rounded-2xl text-slate-500 hover:bg-slate-100/90 hover:text-[#14142b] transition-all duration-300 cursor-pointer"
                  title="Go to Home"
                >
                  <Home size={19} className="group-hover:scale-110 transition-transform" />
                </button>
              }
            />
            <TooltipContent side="top" sideOffset={8} className="bg-white text-slate-800 border border-slate-200 shadow-xl font-extrabold text-xs px-3.5 py-2 rounded-2xl [&_.fill-foreground]:hidden">
              Home
            </TooltipContent>
          </Tooltip>
        </motion.div>

        {/* Divider line */}
        <motion.div layout className="h-6 w-px bg-slate-200 shrink-0 mx-1" />

        {/* 2. Management Tab Icons */}
        {mainTabs.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <motion.div 
              layout 
              key={tab.id} 
              className={`relative group shrink-0 ${hoveredTab === tab.id ? 'mx-2 sm:mx-3' : 'mx-0'}`}
              onHoverStart={() => setHoveredTab(tab.id)}
              onHoverEnd={() => setHoveredTab(null)}
            >
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-2xl transition-colors duration-300 cursor-pointer ${
                        active
                          ? tab.id === 'DANGER'
                            ? 'text-rose-600'
                            : 'text-indigo-600'
                          : tab.id === 'DANGER'
                          ? 'text-rose-600 hover:bg-rose-50'
                          : 'text-slate-500 hover:bg-slate-100/90 hover:text-[#14142b]'
                      }`}
                    >
                      <Icon size={19} className={active ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                    </button>
                  }
                />
                <TooltipContent side="top" sideOffset={8} className="bg-white text-slate-800 border border-slate-200 shadow-xl font-extrabold text-xs px-3.5 py-2 rounded-2xl [&_.fill-foreground]:hidden">
                  {tab.label}
                </TooltipContent>
              </Tooltip>
            </motion.div>
          );
        })}
        </motion.nav>
      </TooltipProvider>

      {/* Main Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-8 px-4 pb-36 pt-20 sm:px-8 sm:pt-24">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/manage-channels')}
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4.5 py-2 text-xs font-black text-slate-700 shadow-xs hover:border-slate-300 hover:bg-white hover:text-[#14142b] transition-all"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>All Channels & Organizations</span>
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

        {/* Lock Warning Banners */}
        {!isSuspended && pendingDeletionRequest && (
          <div className="flex items-start gap-3.5 rounded-2xl border border-amber-200 bg-amber-50/90 p-4.5 shadow-xs">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-amber-900 text-sm">Deletion Request Pending</h3>
              <p className="mt-0.5 text-xs font-medium text-amber-800/90">
                Submitted on {new Date(pendingDeletionRequest.createdAt).toLocaleDateString()}.
                Settings, staff, and content controls are locked while pending platform review.
              </p>
            </div>
          </div>
        )}

        {/* Organization Header Banner & Profile Section */}
        {activeTab === 'OVERVIEW' && (
          <OrganizationHeader
            channel={channel}
            onEditClick={() => setIsEditModalOpen(true)}
            onViewPublicClick={() => router.push(`/channels/${channelId}`)}
          />
        )}

        {/* Dynamic Lower Section Content Display */}
        <div className="space-y-10">
          {/* TAB 1: SMALL COURSE OVERVIEW DASHBOARD */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <SmallCourseOverview
                onNavigateToCatalog={() => setActiveTab('COURSES')}
                onNavigateToAnalytics={() => setActiveTab('ANALYTICS')}
                onAddCourse={() => router.push('/studio')}
              />
              <ChannelSocialLinksCard 
                channel={channel} 
                canManageSettings={permissions.includes('ALL') || permissions.includes('channel.settings.manage') || isOwner} 
                onUpdate={setChannel} 
              />
            </div>
          )}

          {/* TAB 2: COURSES */}
          {activeTab === 'COURSES' && (
            <CourseManagementSection onAddCourse={() => router.push('/studio')} />
          )}

          {/* TAB 3: STAFF */}
          {activeTab === 'STAFF' && (
            <ChannelStaffManager
              channelId={channelId}
              permissions={permissions}
              isSuspended={isSuspended}
              isPersonalChannel={isPersonalChannel}
            />
          )}

          {/* TAB 4: ARTICLES */}
          {activeTab === 'ARTICLES' && <ArticlesManagementSection />}

          {/* TAB 5: EVENTS */}
          {activeTab === 'EVENTS' && <EventsManagementSection />}

          {/* TAB 6: REVIEWS */}
          {activeTab === 'REVIEWS' && <ReviewsFeedbackSection />}

          {/* TAB 7: ANALYTICS */}
          {activeTab === 'ANALYTICS' && <OrganizationAnalyticsSection />}

          {/* TAB 8: ACTIVITY */}
          {activeTab === 'ACTIVITY' && <RecentActivityTimeline />}

          {/* TAB 9: NOTIFICATIONS */}
          {activeTab === 'NOTIFICATIONS' && <ChannelNotificationsManager channel={channel} />}

          {/* TAB 10: DANGER ZONE */}
          {activeTab === 'DANGER' && isOwner && (
            <ChannelDangerZone channel={channel} />
          )}
        </div>
      </div>

      {/* Edit Organization Modal Overlay */}
      <EditOrganizationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        channel={channel}
        onUpdate={(updated) => setChannel(updated)}
      />
    </div>
  );
}

function editHref(item: ChannelContentItem) {
  if (item.type === 'COURSE') return `/studio/courses/${item.id}`;
  if (item.type === 'ROADMAP') return `/studio/roadmaps/${item.id}`;
  return `/studio`;
}

function statusTone(status: string) {
  switch (status?.toUpperCase()) {
    case 'PUBLISHED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'DRAFT':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'SUBMITTED':
      return 'border-sky-200 bg-sky-50 text-sky-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700';
  }
}

function TypeIcon({ type }: { type: string }) {
  if (type === 'COURSE') return <BookOpen size={18} />;
  if (type === 'ROADMAP') return <FileText size={18} />;
  return <Video size={18} />;
}

function ContentRow({
  item,
  last,
  reviewHref,
  canReview,
}: {
  item: ChannelContentItem;
  last?: boolean;
  reviewHref?: string;
  canReview?: boolean;
}) {
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
            {new Date(item.updatedAt).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
            {item.authorUsername ? (
              <>
                {' by '}
                <Link
                  href={`/${item.authorUsername}`}
                  className="hover:underline font-semibold hover:text-blue-600"
                >
                  @{item.authorUsername}
                </Link>
              </>
            ) : item.authorName ? (
              ` by ${item.authorName}`
            ) : (
              ''
            )}
          </span>
        </p>
      </div>
      {(() => {
        if (item.status === 'SUBMITTED') {
          if (canReview) {
            return (
              <Link
                href={reviewHref || editHref(item)}
                className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-[#14142b] transition-colors hover:border-slate-300 hover:bg-white"
              >
                {reviewHref ? 'Review' : 'Open'}
              </Link>
            );
          } else {
            return null;
          }
        }
        return (
          <Link
            href={editHref(item)}
            className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-[#14142b] transition-colors hover:border-slate-300 hover:bg-white"
          >
            Open
          </Link>
        );
      })()}
    </li>
  );
}
