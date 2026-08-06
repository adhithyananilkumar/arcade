'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Channel,
  ChannelContentItem,
  ChannelDeletionRequestDto,
  channelService,
} from '@/domains/channels';
import { toast } from 'sonner';
import {
  Home,
  ArrowLeft,
  LayoutGrid,
  AlertTriangle,
  BookOpen,
  Users,
  FileText,
  Calendar,
  Star,
  BarChart3,
  Activity,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

import { OrganizationHeader } from './components/OrganizationHeader';
import { SmallCourseOverview } from './components/SmallCourseOverview';
import { CourseManagementSection } from './components/CourseManagementSection';
import { StaffManagementSection } from './components/StaffManagementSection';
import { ArticlesManagementSection } from './components/ArticlesManagementSection';
import { EventsManagementSection } from './components/EventsManagementSection';
import { ReviewsFeedbackSection } from './components/ReviewsFeedbackSection';
import { OrganizationAnalyticsSection } from './components/OrganizationAnalyticsSection';
import { RecentActivityTimeline } from './components/RecentActivityTimeline';
import { EditOrganizationModal } from './components/EditOrganizationModal';

import { ChannelDangerZone } from './ChannelDangerZone';
import { useAuthStore } from '@/infrastructure/auth/auth.store';

type ManageTab =
  | 'OVERVIEW'
  | 'COURSES'
  | 'STAFF'
  | 'ARTICLES'
  | 'EVENTS'
  | 'REVIEWS'
  | 'ANALYTICS'
  | 'ACTIVITY'
  | 'DANGER';

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const mainTabs: { id: ManageTab; label: string; icon: any; badge?: string }[] = [
    { id: 'OVERVIEW', label: 'Overview', icon: LayoutGrid },
    { id: 'COURSES', label: 'Courses', icon: BookOpen, badge: `${content.length || 48}` },
    { id: 'STAFF', label: 'Staff', icon: Users, badge: '34' },
    { id: 'ARTICLES', label: 'Articles', icon: FileText, badge: '124' },
    { id: 'EVENTS', label: 'Events', icon: Calendar, badge: '18' },
    { id: 'REVIEWS', label: 'Reviews', icon: Star, badge: '4.92 ★' },
    { id: 'ANALYTICS', label: 'Analytics', icon: BarChart3 },
    { id: 'ACTIVITY', label: 'Timeline', icon: Activity },
    ...(isOwner ? [{ id: 'DANGER' as const, label: 'Danger', icon: ShieldAlert }] : []),
  ];

  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 35%, #FFFFFF 70%)',
      }}
    >
      {/* Floating Horizontal Bottom Dock Navigation Bar (Matching Screenshot 2) */}
      <nav
        aria-label="Floating Organization Navigation Dock"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 p-2 shadow-[0_16px_40px_rgba(20,20,43,0.15)] backdrop-blur-xl ring-1 ring-black/[0.04] max-w-[95vw] overflow-x-auto scrollbar-none"
      >
        {/* 1. Home Icon Button (Redirects to Home) */}
        <div className="relative group shrink-0">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl text-indigo-600 hover:bg-indigo-50 transition-all duration-300 cursor-pointer"
            title="Go to Home"
          >
            <Home size={19} className="group-hover:scale-110 transition-transform" />
          </button>

          {/* Hover Tooltip Popup Above */}
          <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 z-50 hidden group-hover:flex items-center gap-2 whitespace-nowrap rounded-2xl bg-[#14142b] px-3.5 py-2 text-xs font-extrabold text-white shadow-xl border border-slate-800 animate-in fade-in-0 slide-in-from-bottom-2 duration-150">
            <span>Home</span>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-6 border-t-[#14142b]" />
          </div>
        </div>

        {/* Divider line */}
        <div className="h-6 w-px bg-slate-200 shrink-0 mx-1" />

        {/* 2. Management Tab Icons */}
        {mainTabs.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <div key={tab.id} className="relative group shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 cursor-pointer ${
                  active
                    ? tab.id === 'DANGER'
                      ? 'bg-rose-600 text-white shadow-[0_4px_16px_rgba(225,29,72,0.35)] scale-105'
                      : 'bg-gradient-to-br from-[#14142b] via-indigo-950 to-slate-900 text-white shadow-[0_4px_16px_rgba(20,20,43,0.3)] scale-105'
                    : tab.id === 'DANGER'
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-slate-600 hover:bg-slate-100/90 hover:text-[#14142b]'
                }`}
              >
                <Icon size={18} className={active ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                
                {/* Dot badge indicator */}
                {tab.badge && !active && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white" />
                )}
              </button>

              {/* Hover Label Tooltip Above */}
              <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 z-50 hidden group-hover:flex items-center gap-2 whitespace-nowrap rounded-2xl bg-[#14142b] px-3.5 py-2 text-xs font-extrabold text-white shadow-xl border border-slate-800 animate-in fade-in-0 slide-in-from-bottom-2 duration-150">
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black text-indigo-200">
                    {tab.badge}
                  </span>
                )}
                {/* Downward Pointer Triangle */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-6 border-t-[#14142b]" />
              </div>
            </div>
          );
        })}
      </nav>

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
        <OrganizationHeader
          channel={channel}
          onEditClick={() => setIsEditModalOpen(true)}
          onViewPublicClick={() => router.push(`/channels/${channelId}`)}
        />

        {/* Dynamic Lower Section Content Display */}
        <div className="space-y-10">
          {/* TAB 1: SMALL COURSE OVERVIEW DASHBOARD */}
          {activeTab === 'OVERVIEW' && (
            <SmallCourseOverview
              onNavigateToCatalog={() => setActiveTab('COURSES')}
              onAddCourse={() => router.push('/studio')}
            />
          )}

          {/* INDIVIDUAL MODULE TABS */}
          {activeTab === 'COURSES' && (
            <CourseManagementSection onAddCourse={() => router.push('/studio')} />
          )}

          {activeTab === 'STAFF' && <StaffManagementSection />}

          {activeTab === 'ARTICLES' && <ArticlesManagementSection />}

          {activeTab === 'EVENTS' && <EventsManagementSection />}

          {activeTab === 'REVIEWS' && <ReviewsFeedbackSection />}

          {activeTab === 'ANALYTICS' && <OrganizationAnalyticsSection />}

          {activeTab === 'ACTIVITY' && <RecentActivityTimeline />}

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
