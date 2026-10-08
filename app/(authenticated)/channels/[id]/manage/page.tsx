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
  Info,
  LayoutGrid,
  Link2,
  Loader2,
  Plus,
  ShieldAlert,
  Users,
  Wallet,
} from 'lucide-react';
import {
  channelService,
  type Channel,
  type ChannelContentItem,
  type ChannelDeletionRequestDto,
} from '@/domains/channels';
import { platformReviewApi } from '@/domains/publishing';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';
import { ChannelReviewQueue } from '@/apps/core/components/reviews/ChannelReviewQueue';
import { SideNav, SideNavTabs, type SideNavItem, type SideNavSection } from '@/shared/design-system/ui/side-nav';

import { ChannelOverview } from './components/ChannelOverview';
import { ChannelContentSection } from './components/ChannelContentSection';
import { ChannelAnalyticsSection } from './components/ChannelAnalyticsSection';
import { ChannelPaymentsSection } from './components/ChannelPaymentsSection';
import { ChannelActivityLog } from './components/ChannelActivityLog';
import { EditOrganizationModal } from './components/EditOrganizationModal';
import { ChannelOnboardingModal } from './components/ChannelOnboardingModal';
import { ChannelIdentityManager } from './ChannelIdentityManager';
import { ChannelStaffManager } from './ChannelStaffManager';
import { ChannelDangerZone } from './ChannelDangerZone';

type Section = 'overview' | 'content' | 'reviews' | 'analytics' | 'payments' | 'identity' | 'staff' | 'activity' | 'danger';

const SECTION_COPY: Record<Section, { title: string; description: string }> = {
  overview: { title: 'Overview', description: 'Your channel at a glance.' },
  content: { title: 'Content', description: 'Everything created for this channel, in every state.' },
  reviews: {
    title: 'Organization review',
    description:
      "Content your creators submit is reviewed here first. Approved content is published, or — if this channel's review policy requires it — sent on to platform review.",
  },
  analytics: { title: 'Analytics', description: "Enrollments and learner feedback across this channel's courses." },
  payments: {
    title: 'Payments',
    description:
      'What learners have paid, refunds, and what is payable. Payouts are made manually by Arcade. Members without payment access see only their own sales.',
  },
  identity: {
    title: 'Identity & branding',
    description:
      'How this channel presents itself: its handle, logo and public profile, and who signs the certificates it issues.',
  },
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
  // First-time setup (logo + signatory) for an organisation channel, until it is done or skipped.
  const [onboardingDismissed, setOnboardingDismissed] = useState(true);
  const onboardingKey = `channel-onboarding:${channelId}`;
  useEffect(() => {
    try {
      setOnboardingDismissed(window.localStorage.getItem(onboardingKey) === 'done');
    } catch {
      setOnboardingDismissed(false);
    }
  }, [onboardingKey]);
  const dismissOnboarding = () => {
    setOnboardingDismissed(true);
    try {
      window.localStorage.setItem(onboardingKey, 'done');
    } catch {
      /* private mode: it simply shows again next visit */
    }
  };

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

  // The logo and the signature are edited in Identity & branding; every shortcut leads there.
  const openBranding = useCallback(
    (focus: 'logo' | 'signatory') => router.push(tabHref('identity', { focus })),
    [router, tabHref],
  );

  const isOwner = !!channel && user?.id === channel.ownerId;
  const isOrg = !!channel && !channel.isPersonal;
  const isPlatformAdmin = AuthorizationService.canManageChannels(user);
  const isMember = isOwner || permissions.length > 0 || isPlatformAdmin;
  const canEdit = isOwner || permissions.includes('ALL') || permissions.includes('channel.settings.manage');
  const canViewAnalytics = isOwner;
  const canViewPayments = isOwner;
  const canViewStaff = isOrg && (isOwner || permissions.includes('ALL') || permissions.includes('channel.staff.manage') || permissions.includes('channel.staff.view') || permissions.length > 0 || isPlatformAdmin);
  const canViewActivity = isOwner;

  // Which sections this viewer gets. Only channel owners and verified staff/members of this channel
  // can view and manage this channel. Sensitive sections like Payments are strictly restricted.
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

    const primaryItems = [
      item('overview', 'Overview', LayoutGrid, 'bg-[#bae6fd] text-[#0c4a6e] dark:text-[#85bfe9] dark:bg-[#bae6fd]/15'),
      item('content', 'Content', BookOpen, 'bg-[#fbcfe8] text-[#831843] dark:text-[#ff8eaf] dark:bg-[#fbcfe8]/15'),
      ...(isOrg && (isOwner || canReview)
        ? [item('reviews', 'Reviews', ClipboardCheck, 'bg-[#fef08a] text-[#854d0e] dark:bg-[#fef08a]/15 dark:text-[#e7a871]', { count: openCount })]
        : []),
      ...(canViewAnalytics ? [item('analytics', 'Analytics', BarChart3, 'bg-[#bbf7d0] text-[#14532d] dark:bg-[#bbf7d0]/15 dark:text-[#8bc89c]')] : []),
      ...(canViewPayments
        ? [item('payments', 'Payments', Wallet, 'bg-[#fed7aa] text-[#7c2d12] dark:bg-[#fed7aa]/15 dark:text-[#f79d80]')]
        : []),
    ];

    const channelItems = [
      ...(canEdit
        ? [item('identity', 'Identity & branding', AtSign, 'bg-[#c7d2fe] text-[#312e81] dark:text-[#a5adff] dark:bg-[#c7d2fe]/15')]
        : []),
      ...(canViewStaff
        ? [item('staff', 'Staff & roles', Users, 'bg-[#e9d5ff] text-[#4c1d95] dark:text-[#bda1ff] dark:bg-[#e9d5ff]/15')]
        : []),
    ];

    const recordItems = [
      ...(canViewActivity
        ? [item('activity', 'Activity log', Activity, 'bg-[#dbeafe] text-[#1e40af] dark:text-[#86b3ff] dark:bg-[#dbeafe]/15')]
        : []),
    ];

    const result: SideNavSection[] = [
      { items: primaryItems },
    ];

    if (channelItems.length > 0) {
      result.push({ title: 'Channel', items: channelItems });
    }

    if (recordItems.length > 0) {
      result.push({ title: 'Records', items: recordItems });
    }

    if (isOwner) {
      result.push({
        items: [item('danger', 'Danger zone', ShieldAlert, 'bg-[#fecdd3] text-[#881337] dark:text-[#ff8ca1] dark:bg-[#fecdd3]/15', { danger: true })],
      });
    }

    return result;
  }, [tabHref, isOrg, isOwner, canReview, canEdit, canViewAnalytics, canViewPayments, canViewStaff, canViewActivity, openReviews]);

  const allowed = sections.flatMap((s) => s.items.map((i) => i.key));
  const requested = parseSection(searchParams.get('tab'));
  const active: Section = allowed.includes(requested) ? requested : 'overview';

  if (loading) {
    return (
      <div className="theme-page-bg flex min-h-screen items-center justify-center bg-surface">
        <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!channel) return null;

  if (!isMember) {
    return (
      <div className="theme-page-bg flex min-h-screen flex-col items-center justify-center bg-surface px-4 text-center">
        <div className="max-w-md space-y-4">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/25 dark:text-rose-400">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            This management dashboard is only accessible to members and staff of this organization.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href={`/channels/${channelId}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <ArrowLeft size={13} /> View Public Channel
            </Link>
            <Link
              href="/manage-channels"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-surface px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              My Channels
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isSuspended = channel.status === 'SUSPENDED';
  const primaryBtn =
    'inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-semibold text-on-ink transition-colors hover:bg-ink-hover';

  const headerActions =
    active === 'content' ? (
      <Link href="/studio" className={primaryBtn}>
        <Plus size={13} /> Create in Studio
      </Link>
    ) : null;

  return (
    <div className="theme-page-bg min-h-screen bg-surface px-4 pb-16 pt-24 sm:px-6 md:px-8 lg:px-10 md:pt-28">
      <div className="flex w-full flex-col gap-6 md:flex-row md:items-start md:gap-8 lg:gap-10">
        <aside className="w-full shrink-0 md:sticky md:top-28 md:w-[220px] lg:w-[240px]">
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



          {active === 'overview' && (
            <ChannelOverview
              channel={channel}
              content={content}
              openReviews={openReviews}
              canEdit={canEdit}
              canReview={canReview}
              tabHref={tabHref}
              onChannelUpdate={setChannel}
              onEditProfile={() => setIsEditOpen(true)}
              onEditLogo={() => openBranding('logo')}
            />
          )}
          {active === 'content' && (
            <ChannelContentSection
              key={searchParams.get('status') ?? 'ALL'}
              channelId={channelId}
              content={content}
              openReviews={openReviews}
              initialStatus={searchParams.get('status') ?? undefined}
              canEdit={canEdit}
            />
          )}
          {active === 'reviews' && <ChannelReviewQueue channelId={channelId} />}
          {active === 'analytics' && <ChannelAnalyticsSection channelId={channelId} />}
          {active === 'payments' && <ChannelPaymentsSection channelId={channelId} isPersonal={channel.isPersonal} />}
          {active === 'identity' && (
            <ChannelIdentityManager
              channel={channel}
              canEdit={canEdit}
              onUpdate={setChannel}
              focus={searchParams.get('focus')}
            />
          )}
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
        onEditLogo={() => {
          setIsEditOpen(false);
          openBranding('logo');
        }}
        onEditSignatory={() => {
          setIsEditOpen(false);
          openBranding('signatory');
        }}
      />

      {isOrg && canEdit && !channel.iconUrl && !onboardingDismissed && active !== 'identity' && (
        <ChannelOnboardingModal
          channel={channel}
          onDismiss={dismissOnboarding}
          onAddLogo={() => {
            dismissOnboarding();
            openBranding('logo');
          }}
          onAddSignatory={() => {
            dismissOnboarding();
            openBranding('signatory');
          }}
        />
      )}
    </div>
  );
}

function Notice({ tone, title, children }: { tone: 'amber' | 'rose'; title: string; children: React.ReactNode }) {
  const styles =
    tone === 'amber'
      ? 'border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200'
      : 'border-rose-200 bg-rose-50/80 text-rose-900 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-200';
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
