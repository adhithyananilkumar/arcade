'use client';

import { useAuthStore } from '@/store/auth.store';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Search, Plus, ChevronDown, CircleDot, GitPullRequest, Book, Inbox, Gamepad2, LayoutDashboard, User as UserIcon, Tv, Settings, BookOpen, Map, ShieldAlert, Bell, Check, X, GraduationCap } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { AuthService } from '@/services/auth.service';
import { ChannelStaffService, ChannelInvitation } from '@/services/channel-staff.service';
import { usePermissions } from '@/hooks/usePermissions';
import { channelService } from '@/services/channel.service';
import Link from 'next/link';
import Image from 'next/image';
import { MenuContainer, MenuItem } from '@/components/ui/fluid-menu';

export default function DashboardNavbar() {
  const { user, clearAuth } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [invitations, setInvitations] = useState<ChannelInvitation[]>([]);
  const [hasChannels, setHasChannels] = useState(false);
  
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInvitations();
    
    Promise.all([
      channelService.getMyChannels(),
      channelService.getMyWorkspaces()
    ])
      .then(([channels, workspaces]) => {
        setHasChannels(channels.length > 0 || workspaces.length > 0);
      })
      .catch(() => setHasChannels(false));
      
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => { 
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchInvitations = async () => {
    try {
      const data = await ChannelStaffService.getMyInvitations();
      setInvitations(data);
    } catch {
      // silently fail for notifications
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

  const primaryRole = user?.roles?.[0]?.name;
  const isSuperUser = primaryRole === 'SUPER_USER';
  const showAdminChannels = isSuperUser || hasPermission('channels.approve') || hasPermission('channels.suspend');
  const showAdminSettings = isSuperUser || hasPermission('roles.create') || hasPermission('roles.assign') || hasPermission('users.suspend');
  const showReviewCourses = isSuperUser || hasPermission('courses.review') || hasPermission('channel.courses.review');

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', href: '/dashboard/profile', icon: UserIcon },
    ...(hasChannels ? [{ name: 'Manage Channels', href: '/dashboard/manage-channels', icon: Tv }] : []),
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ...(showAdminChannels ? [{ name: 'Channel Management', href: '/dashboard/admin/channels', icon: Tv }] : []),
    ...(showAdminSettings ? [{ name: 'Admin Settings', href: '/dashboard/admin/settings', icon: Settings }] : [])
  ];

  return (
    <nav className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-transparent bg-white dark:bg-black px-6 md:px-8 transition-colors">
      {/* Left side: Logo & Title */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2 group cursor-pointer">
          <Image
            src="/arcade.svg"
            alt="Arcade"
            width={100}
            height={28}
            className="h-7 w-auto transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </Link>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-3 pr-2">
        <div className="relative z-50 flex items-center gap-4">
          
          {/* Notifications Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            >
              <Bell size={20} />
              {invitations.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-black"></span>
              )}
            </button>
            
            {isNotificationsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsNotificationsOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-neutral-800">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Notifications</h3>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {invitations.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">No new notifications</div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                        {invitations.map(inv => (
                          <div key={inv.id} className="p-4 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors">
                            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium mb-1">
                              Channel Invitation
                            </p>
                            <p className="text-xs text-slate-500 mb-3">
                              You've been invited to join as <span className="font-bold">{inv.roleName}</span>.
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
                                className="flex-1 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                              >
                                <X size={14} /> Decline
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <MenuContainer>
            {/* 1. Trigger (Profile Picture and Name) */}
            <div className="flex h-full w-full items-center justify-between pl-3 pr-1 gap-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                {user?.username || user?.firstName || 'user'}
              </span>
              <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden border border-slate-100 dark:border-neutral-800">
                {user?.avatarUrl ? (
                  <img src={getAvatarUrl(user.avatarUrl)} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                    {user?.firstName ? user.firstName.charAt(0).toUpperCase() : (user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U')}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Menu Items */}
            <MenuItem 
              icon={<Book size={20} strokeWidth={2} className="text-blue-500" />} 
              onClick={() => router.push('/dashboard')} 
            >
              Courses
            </MenuItem>
            <MenuItem 
              icon={<GraduationCap size={20} strokeWidth={2} className="text-cyan-500" />} 
              onClick={() => router.push('/dashboard/my-courses')} 
            >
              My courses
            </MenuItem>
            {hasChannels && (
              <MenuItem 
                icon={<BookOpen size={20} strokeWidth={2} className="text-indigo-500" />} 
                onClick={() => router.push('/dashboard/content')} 
              >
                Content Studio
              </MenuItem>
            )}
            <MenuItem 
              icon={<Map size={20} strokeWidth={2} className="text-amber-500" />} 
              onClick={() => router.push('/dashboard/roadmaps')} 
            >
              Roadmaps
            </MenuItem>
            <MenuItem 
              icon={<UserIcon size={20} strokeWidth={2} className="text-emerald-500" />} 
              onClick={() => router.push('/dashboard/profile')} 
            >
              Profile
            </MenuItem>
            {hasChannels && (
              <MenuItem 
                icon={<Tv size={20} strokeWidth={2} className="text-purple-500" />} 
                onClick={() => router.push('/dashboard/manage-channels')} 
              >
                My Channel
              </MenuItem>
            )}
            {showAdminChannels && (
              <MenuItem 
                icon={<Tv size={20} strokeWidth={2} className="text-pink-500" />} 
                onClick={() => router.push('/dashboard/admin/channels')} 
              >
                Channel Management
              </MenuItem>
            )}
            {showReviewCourses && (
              <MenuItem 
                icon={<BookOpen size={20} strokeWidth={2} className="text-cyan-500" />} 
                onClick={() => router.push('/dashboard/content/review')} 
              >
                Course Management
              </MenuItem>
            )}
            {showAdminSettings && (
              <MenuItem 
                icon={<ShieldAlert size={20} strokeWidth={2} className="text-red-500" />} 
                onClick={() => router.push('/dashboard/admin/settings')} 
              >
                Admin Settings
              </MenuItem>
            )}
            <MenuItem 
              icon={<Settings size={20} strokeWidth={2} className="text-slate-500" />} 
              onClick={() => router.push('/dashboard/settings')} 
            >
              Settings
            </MenuItem>
            <MenuItem 
              icon={<LogOut size={20} strokeWidth={2} className="text-red-500" />} 
              onClick={handleLogout} 
            >
              Sign out
            </MenuItem>
          </MenuContainer>
        </div>
      </div>
    </nav>
  );
}
