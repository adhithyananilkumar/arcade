'use client';

import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LogOut, Search, Plus, ChevronDown, ChevronRight, CircleDot, GitPullRequest, Book, Inbox, Gamepad2, LayoutDashboard, User as UserIcon, Tv, Settings, BookOpen, ShieldAlert, Bell, Check, X, GraduationCap, Compass, Trophy, ArrowLeft, Info } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthService } from '@/infrastructure/auth/auth.service';
import { useNotifications, NotificationList } from "@/domains/notifications";
import { usePermissions, navPillName } from "@/domains/identity";
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';
import {
  useStudioAccess,
  useUserChannels,
  useHasAnyChannel,
  usePendingChannelRequestsQuery,
  usePendingDeletionRequestsQuery,
  PendingChannelInvitations,
  useMyChannelInvitations,
} from "@/domains/channels";
import { platformReviewApi } from "@/domains/publishing";
import { api } from '@/infrastructure/http/api';
import Link from 'next/link';
import Image from 'next/image';
import { MenuContainer, MenuItem } from '@/shared/design-system/ui/fluid-menu';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { getEventBySlugOrId } from '@/domains/events';

/** Shared so the accept/decline handlers can invalidate exactly this query. */

/**
 * How many pending items the console's task menu lists. It is a "needs attention" dropdown, not a
 * queue view — the queue itself lives at /console/reviews — so there is no reason to fetch beyond
 * what the menu shows.
 */
const ADMIN_TASK_LIMIT = 10;

export default function LearnerNavbar() {
  const { user, clearAuth } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  // The bell shows only what is still unread. It is a "what needs my attention right now"
  // surface, not a history: re-showing notifications the user has already read pushed the new
  // ones off the bottom of a 420px panel, which is exactly when they are least likely to be seen.
  // The full inbox at /notifications is where history lives.
  const { notifications, unreadCount, markAllRead, markRead, refresh } = useNotifications({
    status: 'unread',
  });

  // Everything the navbar reads is a cached query rather than a `useEffect`. This component
  // persists across every authenticated page, and each of these was previously an uncached fetch
  // re-issued on every full page load — two of them duplicating requests `useStudioAccess` was
  // making on the same render for the same question.
  const { channels: userChannels } = useUserChannels();
  const channelCount = userChannels.length;
  const singleChannel = channelCount === 1 ? userChannels[0] : null;

  const { data: invitations = [], refetch: refetchInvitations } = useMyChannelInvitations();

  const { data: collaborations = [] } = useQuery<any[]>({
    queryKey: ['my-event-collaborations'],
    queryFn: () => api.get<any[]>('/api/v1/events/my-collaborations'),
    staleTime: 5 * 60 * 1000,
  });
  const collaboratedEventId = collaborations.length > 0 ? collaborations[0].id : null;
  const hasMultipleCollabs = collaborations.length > 1;

  // The pending-task menu is derived from the *shared* admin queries rather than a composite
  // query of its own. A composite one still worked, but its fetches happened inside its own query
  // function, so they could not deduplicate against the identical requests `/console/channels`
  // makes — that page issued `delete-requests` three times and `requests` twice on one load.
  // Reading the same keys the page reads means the navbar adds nothing on top of it.
  const canManageChannels = AuthorizationService.canManageChannels(user);
  const canReviewContent = AuthorizationService.canAccessPlatformReviews(user);

  // Only as many as the menu shows. Unpaged this returned all 1,235 pending requests — 775 KB —
  // on every authenticated page load.
  const { requests: pendingChannelRequests } = usePendingChannelRequestsQuery(
    { page: 0, size: ADMIN_TASK_LIMIT },
    { enabled: canManageChannels },
  );
  const { data: pendingDeletions } = usePendingDeletionRequestsQuery({
    enabled: canManageChannels,
  });
  const { data: openReviews } = useQuery({
    queryKey: ['open-platform-reviews', ADMIN_TASK_LIMIT],
    enabled: canReviewContent,
    staleTime: 60 * 1000,
    // Filtered and bounded server-side. Asking for everything and keeping the OPEN ones in the
    // browser also got the filtering wrong: the endpoint defaults to the first 25 rows of the whole
    // queue, so a queue whose first 25 happened to be closed showed no pending tasks even when open
    // work existed.
    queryFn: () =>
      platformReviewApi.list({ status: 'OPEN', page: 0, size: ADMIN_TASK_LIMIT }).catch(() => []),
  });

  const pendingAdminTasks = useMemo(() => {
    const tasks: { id: string; title: string; subtitle: string; href: string; type: string; timestamp: string }[] = [];

    pendingChannelRequests.forEach((ch) => {
      tasks.push({
        id: `ch-${ch.id}`,
        title: `New Channel Request: ${ch.name}`,
        subtitle: `Requested by ${ch.ownerName}`,
        href: `/console/channels`,
        type: 'channel_approval',
        timestamp: ch.createdAt,
      });
    });

    (pendingDeletions ?? [])
      .filter((d) => d.status === 'PENDING')
      .forEach((d) => {
        tasks.push({
          id: `del-${d.id}`,
          title: `Channel Deletion: ${d.channelName}`,
          subtitle: `Requested by ${d.requestedByName}`,
          href: `/console/channels`,
          type: 'channel_deletion',
          timestamp: d.createdAt,
        });
      });

    (openReviews ?? []).forEach((r) => {
      tasks.push({
        id: `rev-${r.id}`,
        title: `Content Review: ${r.title}`,
        subtitle: `Submitted by ${r.ownerName} (${r.channelName})`,
        href: `/console/reviews/${r.id}`,
        type: 'content_review',
        timestamp: r.submittedAt || new Date().toISOString(),
      });
    });

    tasks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return tasks;
  }, [pendingChannelRequests, pendingDeletions, openReviews]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      clearAuth();
      window.location.href = '/sign';
    }
  };

  const showArcConsole = AuthorizationService.canAccessConsole(user);
  // "Content Studio" specifically needs real content-authoring capability in a channel the
  // user owns or staffs — no bypass for platform admins, who do their platform-level work in
  // the Console instead. Being a platform admin isn't a reason to see this button.
  const { hasAccess: hasStudioAccess } = useStudioAccess();
  const showStudio = hasStudioAccess;


  const searchParams = useSearchParams();
  const isConsole = pathname.startsWith('/console');
  const isChannelManage = pathname.includes('/channels/') && pathname.includes('/manage');
  const isChannelPage = pathname.startsWith('/channels/') && !pathname.includes('/manage');
  // The lesson player, which shows the course title as a breadcrumb. The lesson id is now a
  // path segment rather than `?lesson=`, so the match has a trailing segment to allow for.
  const courseLearnMatch = pathname.match(/^\/courses\/([^/]+)\/learn\/[^/]+\/?$/);
  const courseLearnId = courseLearnMatch?.[1];

  // Just the title, so this stays a light island fetch rather than the full course payload the
  // page itself loads for the lesson tree and progress.
  const { data: courseLearnData } = useQuery({
    queryKey: ['course-title', courseLearnId],
    queryFn: () => api.get<{ title: string }>(`/api/v1/public/courses/${courseLearnId}`),
    enabled: Boolean(courseLearnId),
    staleTime: 5 * 60 * 1000,
  });

  // The public course detail page breadcrumb
  const isCoursePublic = pathname.startsWith('/courses/') && !pathname.includes('/learn');
  const coursePublicId = isCoursePublic ? pathname.split('/')[2] : null;

  const { data: coursePublicData } = useQuery({
    queryKey: ['course-public-title', coursePublicId],
    queryFn: () => api.get<{ title: string }>(`/api/v1/public/courses/${coursePublicId}`),
    enabled: Boolean(coursePublicId),
    staleTime: 5 * 60 * 1000,
  });

  // The public event detail page breadcrumb
  const isEventPublic = pathname.startsWith('/events/') && pathname !== '/events';
  const eventPublicSlug = isEventPublic ? pathname.split('/')[2] : null;

  const { data: eventPublicData } = useQuery({
    queryKey: ['event-public-title', eventPublicSlug],
    queryFn: () => getEventBySlugOrId(eventPublicSlug!),
    enabled: Boolean(eventPublicSlug),
    staleTime: 5 * 60 * 1000,
  });

  const channelTabLabel = (() => {
    if (!isChannelManage) return 'Overview';
    const tab = (searchParams.get('tab') || 'OVERVIEW').toUpperCase();
    switch (tab) {
      case 'CONTENT': return 'Content';
      case 'STAFF': return 'Staff';
      case 'ANALYTICS': return 'Analytics & Reviews';
      case 'ACTIVITY': return 'Timeline';
      case 'NOTIFICATIONS': return 'Notifications';
      case 'DANGER': return 'Danger Zone';
      default: return 'Overview';
    }
  })();

  const consoleCrumb = (() => {
    if (!isConsole) return null;
    if (pathname.startsWith('/console/channels')) return 'Channels';
    if (pathname.startsWith('/console/reviews')) return 'Reviews';
    if (pathname.startsWith('/console/content-manage')) return 'Content manage';
    if (pathname.startsWith('/console/exam-standards')) return 'Exam standards';
    if (pathname.startsWith('/console/payments')) return 'Payments';
    if (pathname.startsWith('/console/inbox')) return 'Inbox';
    if (pathname.startsWith('/console/bugs')) return 'Bugs';
    if (pathname.startsWith('/console/recognition')) return 'Recognition';
    if (pathname.startsWith('/console/handles')) return 'Handles';
    if (pathname.startsWith('/console/appearance')) return 'Appearance';
    if (pathname.startsWith('/console/iam')) return 'IAM';
    return null;
  })();

  // Exam surfaces draw their own chrome; the app navbar would sit on top of it.
  if (/^\/exams\/[^/]+\/(attempt|terminated)\/?$/.test(pathname)) {
    return null;
  }

  return (
    <header className="fixed top-6 left-0 right-0 z-40 flex w-full items-center justify-between gap-3 px-4 md:px-8 pointer-events-none">
      {/* Left Island: Branding */}
      <div className="pointer-events-auto flex shrink-0 items-center gap-2">
        <div className="flex h-12 shrink-0 items-center rounded-full px-5 apple-glass-dock shadow-none [box-shadow:none]">
          <Link href="/" className="group flex cursor-pointer items-center">
            <Image
              src="/arcade.svg"
              alt="Arcade"
              width={85}
              height={24}
              className="h-6 w-auto transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </Link>
        </div>

        {!['/', '/search', '/learning', '/exams', '/achievements', '/manage-channels'].includes(pathname) && (
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full apple-glass-dock text-slate-600 shadow-none transition-colors [box-shadow:none] hover:text-indigo-600 dark:hover:text-indigo-400"
            title="Go back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
      </div>

      {/* Center: Course Public page breadcrumbs */}
      {isCoursePublic && (
        <div className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-2 text-[13.5px]">
          <Link
            href="/courses"
            className="font-bold text-slate-700 hover:text-ink transition-colors"
          >
            Courses
          </Link>
          <span className="text-slate-400">/</span>
          <span className="max-w-[180px] sm:max-w-[300px] truncate font-bold text-ink whitespace-nowrap">
            {coursePublicData?.title ?? 'Course'}
          </span>
        </div>
      )}

      {/* Center: Event Public page breadcrumbs */}
      {isEventPublic && (
        <div className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-2 text-[13.5px]">
          <Link
            href="/events"
            className="font-bold text-slate-700 hover:text-ink transition-colors"
          >
            Events
          </Link>
          <span className="text-slate-400">/</span>
          <span className="max-w-[180px] sm:max-w-[300px] truncate font-bold text-ink whitespace-nowrap">
            {eventPublicData?.title ?? 'Event'}
          </span>
        </div>
      )}

      {/* Center: Channel Manage breadcrumbs */}
      {isChannelManage && (
        <div className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-2 text-[13.5px]">
          <Link
            href="/manage-channels"
            className="flex items-center gap-1.5 font-bold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          >
            <Tv size={15} className="text-slate-500 shrink-0" />
            <span>Channels</span>
          </Link>
          <ChevronRight size={14} className="text-slate-400 shrink-0 stroke-[2.2]" />
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
              {channelTabLabel}
            </span>
            <div className="group relative inline-flex items-center justify-center">
              <button
                type="button"
                aria-label={`${channelTabLabel} info`}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
              >
                <Info size={14} className="stroke-[2.2]" />
              </button>
              <div className="pointer-events-none absolute left-full top-1/2 ml-2.5 -translate-y-1/2 z-50 whitespace-nowrap opacity-0 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-200 ease-out">
                <div className="rounded-2xl border border-slate-200/80 bg-surface/90 backdrop-blur-md px-4 py-2.5 shadow-[0_8px_30px_rgba(20,20,43,0.08)] text-[12px] font-medium leading-relaxed text-slate-800">
                  {(() => {
                    const tab = (searchParams.get('tab') || 'OVERVIEW').toUpperCase();
                    switch (tab) {
                      case 'CONTENT': return 'Everything created for this channel, in every state.';
                      case 'REVIEWS': return "Content submitted by creators reviewed here first.";
                      case 'ANALYTICS': return "Enrollments and learner feedback across courses.";
                      case 'PAYMENTS': return 'Learner payments, refunds, and payable balances.';
                      case 'IDENTITY': return 'Address and public organization profile.';
                      case 'STAFF': return "Staff members and authorized permissions.";
                      case 'ACTIVITY': return 'Timeline of channel modifications.';
                      case 'DANGER': return 'Ownership transfer and channel deletion.';
                      default: return 'Your channel at a glance.';
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Center: Channel Public page breadcrumbs */}
      {isChannelPage && (
        <div className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-12 items-center justify-center gap-3 rounded-full px-5 apple-glass-dock text-xs shadow-none [box-shadow:none]">
          <Link
            href="/manage-channels"
            className="font-bold text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Channels
          </Link>
        </div>
      )}

      {/* Center: Course learn page — course title */}
      {courseLearnId && (
        <div className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-12 items-center rounded-full px-5 apple-glass-dock text-xs shadow-none [box-shadow:none]">
          <span className="max-w-[220px] truncate font-extrabold text-ink whitespace-nowrap">
            {courseLearnData?.title ?? 'Course'}
          </span>
        </div>
      )}

      {/* Center: Console breadcrumbs */}
      {isConsole && (
        <div className="pointer-events-auto absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-2 text-[13.5px] sm:flex">
          <Link 
            href="/console" 
            className="flex items-center gap-1.5 font-bold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          >
            <LayoutDashboard size={15} className="text-slate-500 shrink-0" />
            <span>Console</span>
            {pendingAdminTasks.length > 0 && (
              <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500" title={`${pendingAdminTasks.length} pending admin task${pendingAdminTasks.length === 1 ? '' : 's'}`} />
            )}
          </Link>
          {consoleCrumb && (
            <>
              <ChevronRight size={14} className="text-slate-400 shrink-0 stroke-[2.2]" />
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                  {consoleCrumb}
                </span>
                <div className="group relative inline-flex items-center justify-center">
                  <button
                    type="button"
                    aria-label={`${consoleCrumb} info`}
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
                  >
                    <Info size={14} className="stroke-[2.2]" />
                  </button>
                  <div className="pointer-events-none absolute left-full top-1/2 ml-2.5 -translate-y-1/2 z-50 whitespace-nowrap opacity-0 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-200 ease-out">
                    <div className="rounded-2xl border border-slate-200/80 bg-surface/90 backdrop-blur-md px-4 py-2.5 shadow-[0_8px_30px_rgba(20,20,43,0.08)] text-[12px] font-medium leading-relaxed text-slate-800">
                      {(() => {
                        if (pathname.startsWith('/console/channels')) return 'Platform channel management and creation requests.';
                        if (pathname.startsWith('/console/reviews')) return 'Platform course and content review queue.';
                        if (pathname.startsWith('/console/content-manage')) return 'Global content catalog, categories, and suspended courses.';
                        if (pathname.startsWith('/console/exam-standards')) return 'Platform exam criteria, guidelines, and compliance rules.';
                        if (pathname.startsWith('/console/payments')) return 'Platform-wide payments, channel balances, and commission rates.';
                        if (pathname.startsWith('/console/inbox')) return 'Platform admin messages and system notifications.';
                        if (pathname.startsWith('/console/bugs')) return 'User-submitted bug reports and platform issue triage.';
                        if (pathname.startsWith('/console/recognition')) return 'Verification, credentials, and achievement standards.';
                        if (pathname.startsWith('/console/handles')) return 'Organization handles and vanity URL management.';
                        if (pathname.startsWith('/console/appearance')) return 'Platform branding, themes, and design settings.';
                        if (pathname.startsWith('/console/iam')) return 'Identity & access management and role policies.';
                        return 'Console administrative controls.';
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Right Utilities */}
      <div className="flex shrink-0 items-center gap-3">
        {/* Island 1: Separate Notification Bell */}
        <div className="pointer-events-auto flex items-center justify-center h-12 w-12 rounded-full apple-glass-dock relative z-50">
          <div className="relative flex items-center justify-center">
            <button 
              onClick={() => {
                // The invitation list is a cached query; re-read it on open so an invitation that
                // arrived since page load shows its Accept/Decline here, not just a bare notice.
                if (!isNotificationsOpen) refetchInvitations();
                setIsNotificationsOpen((open) => !open);
              }}
              className="relative p-2 text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-950/5 rounded-full transition-colors"
              title="Notifications"
            >
              <Bell size={20} strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-[3px] text-[9px] font-bold text-white border border-surface shadow-sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setIsNotificationsOpen(false)}
                />
                <div className="absolute right-0 top-full mt-3 w-80 rounded-2xl bg-surface/90 backdrop-blur-xl border border-slate-950/5 shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-950/5 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[420px] overflow-y-auto">
                    <PendingChannelInvitations onAction={() => setIsNotificationsOpen(false)} />
                    <NotificationList
                      notifications={notifications}
                      onItemClick={(notif) => {
                        if (notif && !notif.read) {
                          markRead(notif.id);
                        }
                        setIsNotificationsOpen(false);
                      }}
                      onNotificationAction={refresh}
                      emptyMessage={invitations.length > 0 ? undefined : 'No new notifications'}
                    />
                  </div>
                  <div className="border-t border-slate-950/5 p-3 text-center bg-slate-50/50">
                    <Link 
                      href="/notifications" 
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 transition-colors dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      See more
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Island 2: User Profile Dropdown */}
        <div className="pointer-events-auto relative z-50 flex items-center">
          <MenuContainer>
            {/* Trigger (Profile Picture and Name) */}
            <div className="flex h-full w-full items-center justify-between gap-1.5">
              <span className="max-w-[66px] truncate text-sm font-bold text-ink">
                {navPillName(user)}
              </span>
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-950/5 shadow-xs">
                {user?.avatarUrl ? (
                  <img src={getAvatarUrl(user.avatarUrl)} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-[11px] font-black text-ink">
                    {user?.firstName ? user.firstName.charAt(0).toUpperCase() : (user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U')}
                  </div>
                )}
              </div>
            </div>

            {/* Menu Items */}
            <MenuItem 
              icon={<UserIcon className="text-emerald-600 dark:text-emerald-400" strokeWidth={2} />} 
              onClick={() => router.push('/profile')} 
            >
              Profile
            </MenuItem>
            {channelCount > 0 && (
              <MenuItem 
                icon={<Tv className="text-[#FF6B4A]" strokeWidth={2} />} 
                onClick={() => {
                  if (singleChannel) {
                    router.push(`/channels/${singleChannel.id}/manage`);
                  } else {
                    router.push('/manage-channels');
                  }
                }} 
              >
                {channelCount === 1 ? 'Channel' : 'Channels'}
              </MenuItem>
            )}
            {showStudio && (
              <MenuItem 
                icon={<BookOpen className="text-ink" strokeWidth={2} />} 
                onClick={() => router.push('/studio')}
              >
                Studio
              </MenuItem>
            )}
            {collaboratedEventId && (
              <MenuItem 
                icon={<BookOpen className="text-ink" strokeWidth={2} />} 
                onClick={() => router.push('/studio/events')}
              >
                Events
              </MenuItem>
            )}
            {showArcConsole && (
              <MenuItem 
                icon={<ShieldAlert className="text-rose-500" strokeWidth={2} />} 
                onClick={() => router.push('/console')} 
              >
                Console
              </MenuItem>
            )}
            <MenuItem 
              icon={<Settings className="text-slate-500" strokeWidth={2} />} 
              onClick={() => router.push('/settings')} 
            >
              Settings
            </MenuItem>
            <MenuItem 
              icon={<Compass className="text-slate-600" strokeWidth={2} />} 
              // Document navigation, not router.push: "/" is landing vs dashboard by middleware on
              // the request, and a soft navigation that only changes the query string reuses the
              // dashboard already rendered at "/" — the URL changes but the page never does.
              onClick={() => window.location.assign('/?public=true')}
            >
              Website
            </MenuItem>
            <MenuItem 
              icon={<LogOut className="text-rose-500" strokeWidth={2} />} 
              onClick={handleLogout}
              danger
            >
              Sign out
            </MenuItem>
          </MenuContainer>
        </div>
      </div>
    </header>
  );
}
