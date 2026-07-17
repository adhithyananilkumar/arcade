'use client';

import { useAuthStore } from '@/store/auth.store';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Search, Plus, ChevronDown, CircleDot, GitPullRequest, Book, Inbox, Gamepad2, LayoutDashboard, User as UserIcon, Tv, Settings, BookOpen, Map, ShieldAlert, GraduationCap } from 'lucide-react';
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
    
    let mounted = true;
    channelService.getMyChannels()
      .then(channels => {
        if (mounted) setHasChannels(channels.length > 0);
      })
      .catch(() => {
        if (mounted) setHasChannels(false);
      });
      
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => { 
      mounted = false; 
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
                Channels
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
