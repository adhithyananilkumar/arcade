'use client';

import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LogOut, Search, Plus, ChevronDown, CircleDot, GitPullRequest, Book, Inbox, Gamepad2, LayoutDashboard, User as UserIcon, Tv, Settings, BookOpen, ShieldAlert, Bell, Check, X, GraduationCap, Compass, Trophy, ArrowLeft } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AuthService } from '@/infrastructure/auth/auth.service';
import { ChannelStaffService, ChannelInvitation } from "@/domains/channels";
import { useNotifications, NotificationList } from "@/domains/notifications";
import { usePermissions } from "@/domains/identity";
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';
import {
  useStudioAccess,
  useHasAnyChannel,
  myChannelsKeys,
  usePendingChannelRequestsQuery,
  usePendingDeletionRequestsQuery,
} from "@/domains/channels";
import { platformReviewApi } from "@/domains/publishing";
import { api } from '@/infrastructure/http/api';
import Link from 'next/link';
import Image from 'next/image';
import { MenuContainer, MenuItem } from '@/shared/design-system/ui/fluid-menu';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { getAvatarUrl } from '@/shared/utils/avatar';

/** Shared so the accept/decline handlers can invalidate exactly this query. */
const NAVBAR_INVITATIONS_KEY = ['my-channel-invitations'] as const;

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
  const queryClient = useQueryClient();

  // Everything the navbar reads is a cached query rather than a `useEffect`. This component
  // persists across every authenticated page, and each of these was previously an uncached fetch
  // re-issued on every full page load — two of them duplicating requests `useStudioAccess` was
  // making on the same render for the same question.
  const hasChannels = useHasAnyChannel() ?? false;

  const { data: invitations = [] } = useQuery<ChannelInvitation[]>({
    queryKey: NAVBAR_INVITATIONS_KEY,
    queryFn: () => ChannelStaffService.getMyInvitations(),
    staleTime: 60 * 1000,
  });

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
  const canReviewContent = AuthorizationService.canReviewContent(user);

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
  
  // Intelligent header scroll behavior
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Only hide after 150px of downward scroll to avoid triggering at the very top
    if (latest > 150 && latest > lastY) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setLastY(latest);
  });

  /** Re-reads the invitation list after the user accepts or declines one. */
  const refreshInvitations = () =>
    queryClient.invalidateQueries({ queryKey: NAVBAR_INVITATIONS_KEY });

  const handleAcceptInvite = async (id: string) => {
    try {
      await ChannelStaffService.acceptInvitation(id);
      toast.success('Invitation accepted! You are now staff.');
      // Accepting makes the user staff somewhere, so the shared channel queries are now stale.
      queryClient.invalidateQueries({ queryKey: myChannelsKeys.workspaces });
    } catch (error) {
      // e.g. expired, channel suspended, already staff — the backend says which.
      toast.error(error instanceof Error ? error.message : 'Failed to accept invitation');
    } finally {
      refreshInvitations();
    }
  };

  const handleRejectInvite = async (id: string) => {
    try {
      await ChannelStaffService.rejectInvitation(id);
      toast.success('Invitation declined.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to decline invitation');
    } finally {
      refreshInvitations();
    }
  };


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
  const courseLearnMatch = pathname.match(/^\/learn\/([^/]+)\/learn\/?$/);
  const courseLearnId = courseLearnMatch?.[1];

  // Just the title, so this stays a light island fetch rather than the full course payload the
  // page itself loads for the lesson tree and progress.
  const { data: courseLearnData } = useQuery({
    queryKey: ['course-title', courseLearnId],
    queryFn: () => api.get<{ title: string }>(`/api/v1/public/courses/${courseLearnId}`),
    enabled: Boolean(courseLearnId),
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
    if (pathname.startsWith('/console/exam-schedules')) return 'Exams';
    if (pathname.startsWith('/console/iam')) return 'IAM';
    return null;
  })();

  if (/\/learn\/[^/]+\/exam\/(start|terminated)\/?$/.test(pathname)) {
    return null;
  }

  return (
    <motion.div 
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: -20, opacity: 0 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-6 left-0 right-0 z-40 flex w-full items-center justify-between gap-3 px-4 md:px-8 pointer-events-none"
    >
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

        {/* Course learn page — separate back-to-Learning pill beside the logo */}
        {courseLearnId && (
          <button
            type="button"
            onClick={() => router.push('/learning')}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full apple-glass-dock text-slate-600 shadow-none transition-colors [box-shadow:none] hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
            title="Back to Learning"
          >
            <ArrowLeft size={18} />
          </button>
        )}
      </div>

      {/* Center: Channel Manage breadcrumbs */}
      {isChannelManage && (
        <div className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-12 items-center justify-center gap-3 rounded-full px-5 apple-glass-dock text-xs shadow-none [box-shadow:none]">
          <Link
            href="/manage-channels"
            className="font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Channels
          </Link>
          <span className="h-3.5 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />
          <span className="font-extrabold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
            {channelTabLabel}
          </span>
        </div>
      )}

      {/* Center: Channel Public page breadcrumbs */}
      {isChannelPage && (
        <div className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-12 items-center justify-center gap-3 rounded-full px-5 apple-glass-dock text-xs shadow-none [box-shadow:none]">
          <Link
            href="/manage-channels"
            className="font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Channels
          </Link>
        </div>
      )}

      {/* Center: Course learn page — course title */}
      {courseLearnId && (
        <div className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-12 items-center rounded-full px-5 apple-glass-dock text-xs shadow-none [box-shadow:none]">
          <span className="max-w-[220px] truncate font-extrabold text-[#14142b] dark:text-white whitespace-nowrap">
            {courseLearnData?.title ?? 'Course'}
          </span>
        </div>
      )}

      {/* Center: small Console breadcrumbs */}
      {isConsole && (
        <div className="pointer-events-auto absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full px-3.5 py-2 apple-glass-dock sm:flex">
          <Link 
            href="/console" 
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
          >
            Console
            {pendingAdminTasks.length > 0 && (
              <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500" title={`${pendingAdminTasks.length} pending admin task${pendingAdminTasks.length === 1 ? '' : 's'}`} />
            )}
          </Link>
          {consoleCrumb && (
            <>
              <span className="text-[11px] text-slate-300">/</span>
              <span className="text-[11px] font-bold text-[#14142b]">{consoleCrumb}</span>
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
              onClick={() => setIsNotificationsOpen((open) => !open)}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
              title="Notifications"
            >
              <Bell size={20} strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-[3px] text-[9px] font-bold text-white border border-white dark:border-neutral-900 shadow-sm">
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
                <div className="absolute right-0 top-full mt-3 w-80 rounded-2xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[420px] overflow-y-auto">
                    {invitations.length > 0 && (
                      <div className="border-b border-black/5 dark:border-white/5">
                        <p className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Action Required</p>
                        <div className="divide-y divide-black/5 dark:divide-white/5">
                          {invitations.map(inv => (
                            <div key={inv.id} className="p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium mb-1">
                                Invitation to join <span className="font-bold">{inv.channelName}</span>
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                <span className="font-bold text-slate-700 dark:text-slate-300">{inv.invitedByName}</span> invited you as <span className="font-bold text-slate-700 dark:text-slate-300">{inv.roleNames.join(', ')}</span>.
                              </p>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-3">
                                {new Date(inv.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(inv.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                {inv.expiresAt && (
                                  <> · expires {new Date(inv.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</>
                                )}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => { handleAcceptInvite(inv.id); setIsNotificationsOpen(false); }}
                                  className="flex-1 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                                >
                                  <Check size={14} /> Accept
                                </button>
                                <button
                                  onClick={() => { handleRejectInvite(inv.id); setIsNotificationsOpen(false); }}
                                  className="flex-1 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                                >
                                  <X size={14} /> Decline
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                  <div className="border-t border-black/5 dark:border-white/5 p-3 text-center bg-slate-50/50 dark:bg-neutral-950/20">
                    <Link 
                      href="/notifications" 
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 transition-colors"
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
            <div className="flex h-full w-full items-center justify-between gap-2">
              <span className="max-w-[100px] truncate text-sm font-bold text-[#14142b]">
                {user?.username || user?.firstName || 'user'}
              </span>
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-black/5 shadow-xs">
                {user?.avatarUrl ? (
                  <img src={getAvatarUrl(user.avatarUrl)} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-[11px] font-black text-[#14142b]">
                    {user?.firstName ? user.firstName.charAt(0).toUpperCase() : (user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U')}
                  </div>
                )}
              </div>
            </div>

            {/* Menu Items */}
            <MenuItem 
              icon={<UserIcon className="text-emerald-600" strokeWidth={2} />} 
              onClick={() => router.push('/profile')} 
            >
              Profile
            </MenuItem>
            {hasChannels && (
              <MenuItem 
                icon={<Tv className="text-[#FF6B4A]" strokeWidth={2} />} 
                onClick={() => router.push('/manage-channels')} 
              >
                My Channel
              </MenuItem>
            )}
            {showStudio && (
              <MenuItem 
                icon={<BookOpen className="text-[#14142b]" strokeWidth={2} />} 
                onClick={() => router.push('/studio')}
              >
                Arcade Studio
              </MenuItem>
            )}
            {collaboratedEventId && (
              <MenuItem 
                icon={<BookOpen className="text-[#14142b]" strokeWidth={2} />} 
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
              onClick={() => router.push('/?public=true')} 
            >
              Go to website
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
    </motion.div>
  );
}
