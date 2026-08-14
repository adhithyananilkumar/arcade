'use client';

import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Search, Plus, ChevronDown, CircleDot, GitPullRequest, Book, Inbox, Gamepad2, LayoutDashboard, User as UserIcon, Tv, Settings, BookOpen, ShieldAlert, Bell, Check, X, GraduationCap, Compass, Trophy, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AuthService } from '@/infrastructure/auth/auth.service';
import { ChannelStaffService, ChannelInvitation } from "@/domains/channels";
import { useNotifications, NotificationList } from "@/domains/notifications";
import { usePermissions } from "@/domains/identity";
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';
import { channelService, useStudioAccess } from "@/domains/channels";
import { platformReviewApi } from "@/domains/publishing";
import { api } from '@/infrastructure/http/api';
import Link from 'next/link';
import Image from 'next/image';
import { MenuContainer, MenuItem } from '@/shared/design-system/ui/fluid-menu';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export default function LearnerNavbar() {
  const { user, clearAuth } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [invitations, setInvitations] = useState<ChannelInvitation[]>([]);
  const { notifications, unreadCount, markAllRead, markRead, refresh } = useNotifications();
  const [hasChannels, setHasChannels] = useState(false);
  const [collaboratedEventId, setCollaboratedEventId] = useState<string | null>(null);
  const [hasMultipleCollabs, setHasMultipleCollabs] = useState<boolean>(false);
  
  // Pending tasks for platform admins
  const [pendingAdminTasks, setPendingAdminTasks] = useState<{ id: string; title: string; subtitle: string; href: string; type: string; timestamp: string }[]>([]);
  
  // Intelligent header scroll behavior
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Never hide on console routes because they have their own internal scroll or need the nav visible
    if (pathname.startsWith('/console')) {
      setHidden(false);
      setLastY(latest);
      return;
    }
    
    // Only hide after 150px of downward scroll to avoid triggering at the very top
    if (latest > 150 && latest > lastY) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setLastY(latest);
  });

  useEffect(() => {
    fetchInvitations();
    fetchAdminTasks();
    
    Promise.all([
      channelService.getMyChannels(),
      channelService.getMyWorkspaces()
    ])
      .then(([channels, workspaces]) => {
        setHasChannels(channels.length > 0 || workspaces.length > 0);
      })
      .catch(() => setHasChannels(false));
  }, []);

  useEffect(() => {
    const handleInboxUpdate = () => {
      refresh();
      fetchAdminTasks();
    };
    window.addEventListener('inbox-updated', handleInboxUpdate);
    return () => window.removeEventListener('inbox-updated', handleInboxUpdate);
  }, [refresh]);

  const fetchInvitations = async () => {
    try {
      const data = await ChannelStaffService.getMyInvitations();
      setInvitations(data);
    } catch {
      // silently fail for notifications
    }
  };

  const fetchAdminTasks = async () => {
    if (!AuthorizationService.canAccessConsole(user)) return;
    
    try {
      const tasks: { id: string; title: string; subtitle: string; href: string; type: string; timestamp: string }[] = [];
      
      if (AuthorizationService.canManageChannels(user)) {
        const [channels, deletions] = await Promise.all([
          channelService.getPendingRequests().catch(() => []),
          channelService.getPendingDeletionRequests().catch(() => [])
        ]);
        
        channels.forEach(ch => {
          tasks.push({
            id: `ch-${ch.id}`,
            title: `New Channel Request: ${ch.name}`,
            subtitle: `Requested by ${ch.ownerName}`,
            href: `/console/channels`,
            type: 'channel_approval',
            timestamp: ch.createdAt
          });
        });
        
        deletions.filter(d => d.status === 'PENDING').forEach(d => {
          tasks.push({
            id: `del-${d.id}`,
            title: `Channel Deletion: ${d.channelName}`,
            subtitle: `Requested by ${d.requestedByName}`,
            href: `/console/channels`,
            type: 'channel_deletion',
            timestamp: d.createdAt
          });
        });
      }
      
      if (AuthorizationService.canReviewContent(user)) {
        const reviews = await platformReviewApi.list().catch(() => []);
        reviews.filter(r => r.status === 'OPEN').forEach(r => {
          tasks.push({
            id: `rev-${r.id}`,
            title: `Content Review: ${r.title}`,
            subtitle: `Submitted by ${r.ownerName} (${r.channelName})`,
            href: `/console/reviews/${r.id}`,
            type: 'content_review',
            timestamp: r.submittedAt || new Date().toISOString()
          });
        });
      }
      
      tasks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setPendingAdminTasks(tasks);
    } catch {
      // silently fail
    }
  };

  const handleAcceptInvite = async (id: string) => {
    try {
      await ChannelStaffService.acceptInvitation(id);
      toast.success('Invitation accepted! You are now staff.');
      fetchInvitations();
    } catch {
      toast.error('Failed to accept invitation');
    }
  };

  const handleRejectInvite = async (id: string) => {
    try {
      await ChannelStaffService.rejectInvitation(id);
      toast.success('Invitation rejected.');
      fetchInvitations();
    } catch {
      toast.error('Failed to reject invitation');
    }
  };

  const getAvatarUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    if (url.startsWith('/api/v1/')) {
      return baseUrl.replace('/api/v1', '') + url;
    }
    if (!url.includes('/')) {
      return baseUrl + '/users/avatars/' + url;
    }
    return baseUrl + (url.startsWith('/') ? '' : '/') + url;
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

  useEffect(() => {
    api.get<any[]>('/api/v1/events/my-collaborations')
      .then(res => {
        if (res && res.length > 0) {
          setCollaboratedEventId(res[0].id);
          setHasMultipleCollabs(res.length > 1);
        } else {
          setCollaboratedEventId(null);
          setHasMultipleCollabs(false);
        }
      })
      .catch(() => {
        setCollaboratedEventId(null);
        setHasMultipleCollabs(false);
      });
  }, []);

  const isConsole = pathname.startsWith('/console');
  const consoleCrumb = (() => {
    if (!isConsole) return null;
    if (pathname.startsWith('/console/channels')) return 'Channels';
    if (pathname.startsWith('/console/reviews')) return 'Reviews';
    if (pathname.startsWith('/console/exam-schedules')) return 'Exams';
    if (pathname.startsWith('/console/payments')) return 'Payments';
    if (pathname.startsWith('/console/inbox')) return 'Inbox';
    if (pathname.startsWith('/console/iam')) return 'IAM';
    return null;
  })();

  const [studioDetailCrumb, setStudioDetailCrumb] = useState<string | null>(null);

  useEffect(() => {
    const handleCrumbChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setStudioDetailCrumb(detail || null);
    };
    window.addEventListener("studio-crumb-changed", handleCrumbChange);
    return () => window.removeEventListener("studio-crumb-changed", handleCrumbChange);
  }, []);

  const isStudio = pathname.startsWith('/studio');
  const studioCrumb = (() => {
    if (!isStudio) return null;
    if (pathname.startsWith('/studio/content')) return studioDetailCrumb || 'Content Overview';
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
      <div className="pointer-events-auto flex h-12 shrink-0 items-center rounded-full px-5 apple-glass-dock shadow-none [box-shadow:none]">
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



      {/* Right Utilities */}
      <div className="flex shrink-0 items-center gap-3">
        {/* Island 1: Separate Notification Bell */}
        <div className="pointer-events-auto flex items-center justify-center h-12 w-12 rounded-full apple-glass-dock relative z-50">
          <div className="relative flex items-center justify-center">
            <button 
              onClick={() => {
                const next = !isNotificationsOpen;
                setIsNotificationsOpen(next);
                if (next) {
                  refresh();
                }
              }}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
              title="Notifications"
            >
              <Bell size={20} strokeWidth={2} />
              {(invitations.length + unreadCount + pendingAdminTasks.length) > 0 && (
                <span className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-[3px] text-[9px] font-bold text-white border border-white dark:border-neutral-900 shadow-sm">
                  {(invitations.length + unreadCount + pendingAdminTasks.length) > 99
                    ? '99+'
                    : invitations.length + unreadCount + pendingAdminTasks.length}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setIsNotificationsOpen(false)}
                />
                <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 md:w-[420px] max-w-[90vw] flex flex-col max-h-[85vh] sm:max-h-[520px] rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 bg-white/50 dark:bg-neutral-900/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-black/5 dark:divide-white/5">
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
                    {pendingAdminTasks.length > 0 && (
                      <div className="border-b border-black/5 dark:border-white/5">
                        <p className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Admin Tasks</p>
                        <div className="divide-y divide-black/5 dark:divide-white/5">
                          {pendingAdminTasks.map(task => (
                            <Link 
                              href={task.href} 
                              key={task.id} 
                              onClick={() => setIsNotificationsOpen(false)} 
                              className="block p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium mb-1">
                                {task.title}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                {task.subtitle}
                              </p>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                {new Date(task.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </Link>
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
                  <div className="border-t border-black/5 dark:border-white/5 p-3 text-center bg-slate-50/50 dark:bg-neutral-950/20 shrink-0">
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
                Content Studio
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
