'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  AtSign,
  BarChart3,
  BookOpen,
  Building2,
  Check,
  ClipboardCheck,
  Edit3,
  ExternalLink,
  LayoutGrid,
  Link2,
  Loader2,
  Plus,
  ShieldAlert,
  Users,
} from 'lucide-react';
import {
  channelService,
  type Channel,
  type ChannelContentItem,
  type ChannelDeletionRequestDto,
} from '@/domains/channels';
import { platformReviewApi } from '@/domains/publishing';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { ChannelReviewQueue } from '@/apps/core/components/reviews/ChannelReviewQueue';
import { SideNav, SideNavTabs, type SideNavItem, type SideNavSection } from '@/shared/design-system/ui/side-nav';
import { PageHeader } from '@/shared/design-system/ui/page-header';

import { ChannelOverview } from './components/ChannelOverview';
import { ChannelContentSection } from './components/ChannelContentSection';
import { ChannelAnalyticsSection } from './components/ChannelAnalyticsSection';
import { ChannelActivityLog } from './components/ChannelActivityLog';
import { EditOrganizationModal } from './components/EditOrganizationModal';
import { ChannelIdentityManager } from './ChannelIdentityManager';
import { ChannelStaffManager } from './ChannelStaffManager';
import { ChannelDangerZone } from './ChannelDangerZone';

type Section = 'overview' | 'content' | 'reviews' | 'analytics' | 'identity' | 'staff' | 'activity' | 'danger';

const SECTION_COPY: Record<Section, { title: string; description: string }> = {
  overview: { title: 'Overview', description: 'Your channel at a glance.' },
  content: { title: 'Content', description: 'Everything created for this channel, in every state.' },
  reviews: {
    title: 'Organization review',
    description:
      "Content your creators submit is reviewed here first. Approved content is published, or — if this channel's review policy requires it — sent on to platform review.",
  },
  analytics: { title: 'Analytics', description: "Enrollments and learner feedback across this channel's courses." },
  identity: { title: 'Identity & handle', description: 'The address and public profile this organization is shown under.' },
  staff: { title: 'Staff & roles', description: "Who can work on this channel, and what they're allowed to do." },
  activity: { title: 'Activity log', description: 'Every change made to this channel, newest first.' },
  danger: { title: 'Danger zone', description: 'Ownership transfer and channel deletion.' },
};

// `?tab=` values from before the sidebar (uppercase ids, and the two tabs that were merged).
const LEGACY_TAB: Record<string, Section> = { LOGS: 'activity', NOTIFICATIONS: 'activity' };

function parseSection(raw: string | null): Section {
  if (!raw) return 'overview';
  if (LEGACY_TAB[raw.toUpperCase()]) return LEGACY_TAB[raw.toUpperCase()];
  const lower = raw.toLowerCase();
  return lower in SECTION_COPY ? (lower as Section) : 'overview';
}

export default function ManageChannelPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const channelId = params.id as string;
  const { user } = useAuthStore();

  const [channel, setChannel] = useState<Channel | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [pendingDeletion, setPendingDeletion] = useState<ChannelDeletionRequestDto | null>(null);
  const [content, setContent] = useState<ChannelContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openReviews, setOpenReviews] = useState<Record<string, string>>({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!channelId) return;
    let cancelled = false;
    Promise.all([
      channelService.getChannel(channelId),
      channelService.getMyChannelPermissions(channelId),
      channelService.getMyDeletionRequests().catch(() => [] as ChannelDeletionRequestDto[]),
      channelService.getChannelContent(channelId).catch(() => [] as ChannelContentItem[]),
    ])
      .then(([channelData, perms, deletionRequests, channelContent]) => {
        if (cancelled) return;
        setChannel(channelData);
        setPermissions(perms);
        setPendingDeletion(
          deletionRequests.find((r) => r.channelId === channelId && r.status === 'PENDING') ?? null,
        );
        setContent(channelContent);
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(error instanceof Error ? error.message : 'Failed to load channel details');
        router.push('/manage-channels');
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [channelId, router]);

  const canReview = permissions.includes('ALL') || permissions.includes('channel.content.review');

  useEffect(() => {
    if (!canReview) return;
    platformReviewApi
      .list({ channelId, status: 'OPEN' })
      .then((items) => {
        const byContent: Record<string, string> = {};
        items.forEach((i) => (byContent[i.contentId] = i.id));
        setOpenReviews(byContent);
      })
      .catch(() => setOpenReviews({}));
  }, [channelId, canReview]);

  const tabHref = useCallback(
    (tab: string, extra?: Record<string, string>) => {
      const qs = new URLSearchParams({ tab, ...extra });
      return `/channels/${channelId}/manage?${qs.toString()}`;
    },
    [channelId],
  );

  const isOwner = !!channel && user?.id === channel.ownerId;
  const isOrg = !!channel && !channel.isPersonal;
  const canEdit = isOwner || permissions.includes('ALL') || permissions.includes('channel.settings.manage');

  // Which sections this viewer gets. Personal channels have no handle, staff or organization
  // review — their owner is the sole authority and their profile is their page — so those are
  // omitted rather than shown disabled. The backend enforces every one of these independently.
  const sections: SideNavSection[] = useMemo(() => {
    const item = (key: Section, label: string, icon: SideNavItem['icon'], iconClassName: string, more?: Partial<SideNavItem>): SideNavItem => ({
      key,
      label,
      icon,
      iconClassName,
      href: tabHref(key),
      ...more,
    });
    const openCount = Object.keys(openReviews).length;
    return [
      {
        items: [
          item('overview', 'Overview', LayoutGrid, 'bg-[#bae6fd] text-[#0c4a6e]'),
          item('content', 'Content', BookOpen, 'bg-[#fbcfe8] text-[#831843]'),
          ...(isOrg && (isOwner || canReview)
            ? [item('reviews', 'Reviews', ClipboardCheck, 'bg-[#fef08a] text-[#854d0e]', { count: openCount })]
            : []),
          ...(canEdit ? [item('analytics', 'Analytics', BarChart3, 'bg-[#bbf7d0] text-[#14532d]')] : []),
        ],
      },
      {
        title: 'Organization',
        items: isOrg
          ? [
              item('identity', 'Identity & handle', AtSign, 'bg-[#c7d2fe] text-[#312e81]'),
              item('staff', 'Staff & roles', Users, 'bg-[#e9d5ff] text-[#4c1d95]'),
            ]
          : [],
      },
      {
        title: 'Records',
        items: [item('activity', 'Activity log', Activity, 'bg-[#dbeafe] text-[#1e40af]')],
      },
      {
        items: isOwner
          ? [item('danger', 'Danger zone', ShieldAlert, 'bg-[#fecdd3] text-[#881337]', { danger: true })]
          : [],
      },
    ];
  }, [tabHref, isOrg, isOwner, canReview, canEdit, openReviews]);

  const allowed = sections.flatMap((s) => s.items.map((i) => i.key));
  const requested = parseSection(searchParams.get('tab'));
  const active: Section = allowed.includes(requested) ? requested : 'overview';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#202124]">
        <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!channel) return null;

  const isSuspended = channel.status === 'SUSPENDED';
  const publicPath = channel.handle ? `/${channel.handle}` : `/channels/${channel.id}`;

  const copyPublicLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${publicPath}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy the link');
    }
  };

  const outlineBtn =
    'inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50';
  const primaryBtn =
    'inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#14142b] px-3.5 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#232735]';

  const headerActions =
    active === 'overview' ? (
      <>
        {canEdit && (
          <button type="button" onClick={() => setIsEditOpen(true)} className={primaryBtn}>
            <Edit3 size={13} /> Edit profile
          </button>
        )}
        <Link href={publicPath} className={outlineBtn}>
          <ExternalLink size={13} /> View public page
        </Link>
        <button type="button" onClick={copyPublicLink} className={outlineBtn}>
          {copied ? <Check size={13} /> : <Link2 size={13} />} {copied ? 'Copied' : 'Copy link'}
        </button>
      </>
    ) : active === 'content' ? (
      <Link href="/studio" className={primaryBtn}>
        <Plus size={13} /> Create in Studio
      </Link>
    ) : null;

  return (
    <div className="min-h-screen bg-white px-4 pb-16 pt-24 sm:px-6 md:px-10 md:pt-28 dark:bg-[#202124]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 md:flex-row md:items-start md:gap-12">
        <aside className="w-full shrink-0 md:sticky md:top-28 md:w-[240px]">
          <Link
            href="/manage-channels"
            className="mb-3 inline-flex items-center gap-1.5 px-1 text-[12px] font-semibold text-slate-500 transition-colors hover:text-slate-800"
          >
            <ArrowLeft size={13} /> All channels
          </Link>

          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200/80 p-2.5 dark:border-neutral-800">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-slate-900 text-white">
              {channel.iconUrl ? (
                <img src={channel.iconUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <Building2 size={18} />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold text-[#14142b] dark:text-white">{channel.name}</p>
              <p className="truncate text-[11.5px] font-medium text-slate-500">
                {channel.isPersonal ? 'Personal channel' : channel.handle ? `@${channel.handle}` : 'Organization'}
              </p>
            </div>
          </div>

          <SideNav sections={sections} activeKey={active} ariaLabel="Channel dashboard" className="hidden md:flex" />
          <SideNavTabs
            items={sections.flatMap((s) => s.items)}
            activeKey={active}
            ariaLabel="Channel dashboard"
            className="md:hidden"
          />
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          {isSuspended && (
            <Notice tone="rose" title="This channel is suspended">
              {channel.suspensionReason || 'Settings, staff and content controls are restricted while suspended.'}
            </Notice>
          )}
          {!isSuspended && pendingDeletion && (
            <Notice tone="amber" title="Deletion request pending">
              Submitted {new Date(pendingDeletion.createdAt).toLocaleDateString()}. Settings, staff and content
              controls are locked while platform review is pending.
            </Notice>
          )}

          <PageHeader
            title={SECTION_COPY[active].title}
            description={SECTION_COPY[active].description}
            actions={headerActions}
          />

          {active === 'overview' && (
            <ChannelOverview
              channel={channel}
              content={content}
              openReviews={openReviews}
              canEdit={canEdit}
              canReview={canReview}
              tabHref={tabHref}
              onChannelUpdate={setChannel}
            />
          )}
          {active === 'content' && (
            <ChannelContentSection
              key={searchParams.get('status') ?? 'ALL'}
              channelId={channelId}
              content={content}
              openReviews={openReviews}
              initialStatus={searchParams.get('status') ?? undefined}
            />
          )}
          {active === 'reviews' && <ChannelReviewQueue channelId={channelId} />}
          {active === 'analytics' && <ChannelAnalyticsSection channelId={channelId} />}
          {active === 'identity' && <ChannelIdentityManager channel={channel} canEdit={canEdit} onUpdate={setChannel} />}
          {active === 'staff' && (
            <ChannelStaffManager
              channelId={channelId}
              permissions={permissions}
              isSuspended={isSuspended}
              isPersonalChannel={channel.isPersonal}
            />
          )}
          {active === 'activity' && <ChannelActivityLog channelId={channelId} />}
          {active === 'danger' && <ChannelDangerZone channel={channel} />}
        </main>
      </div>

      <EditOrganizationModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        channel={channel}
        onUpdate={setChannel}
      />
    </div>
  );
}

function Notice({ tone, title, children }: { tone: 'amber' | 'rose'; title: string; children: React.ReactNode }) {
  const styles =
    tone === 'amber'
      ? 'border-amber-200 bg-amber-50/80 text-amber-900'
      : 'border-rose-200 bg-rose-50/80 text-rose-900';
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 ${styles}`}>
      <AlertTriangle size={17} className="mt-0.5 shrink-0" />
      <div>
        <p className="text-[13px] font-bold">{title}</p>
        <p className="mt-0.5 text-[12.5px] font-medium opacity-90">{children}</p>
      </div>
    </div>
  );
}
