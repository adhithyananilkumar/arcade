'use client';

import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Search, Plus, ChevronDown, CircleDot, GitPullRequest, Book, Inbox, Gamepad2, LayoutDashboard, User as UserIcon, Tv, Settings, BookOpen, Map, ShieldAlert, Bell, Check, X, GraduationCap, Compass } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { AuthService } from '@/infrastructure/auth/auth.service';
import { ChannelStaffService, ChannelInvitation } from "@/domains/channels";
import { usePermissions } from "@/domains/identity";
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';
import { channelService } from "@/domains/channels";
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [invitations, setInvitations] = useState<ChannelInvitation[]>([]);
  const [hasChannels, setHasChannels] = useState(false);
  
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  
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

  const showArcConsole = AuthorizationService.canAccessConsole(user);

  return (
    <motion.div 
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: -20, opacity: 0 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-6 left-0 right-0 z-40 flex w-full items-center justify-between px-6 md:px-8 pointer-events-none"
    >
      {/* Left Island: Branding */}
      <div className="pointer-events-auto flex items-center h-12 px-5 rounded-full apple-glass-dock">
        <Link href="/" className="flex items-center group cursor-pointer">
          <Image
            src="/arcade.svg"
            alt="Arcade"
            width={85}
            height={24}
            className="h-6 w-auto transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </Link>
      </div>

      {/* Right Island: Utilities */}
      <div className="pointer-events-auto flex items-center h-12 rounded-full apple-glass-dock pr-1 pl-2">
        <div className="relative z-50 flex items-center gap-2">
          
          {/* Notifications Dropdown */}
          <div className="relative flex items-center">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <Bell size={20} strokeWidth={2} />
              {invitations.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-neutral-900 shadow-sm"></span>
              )}
            </button>
            
            {isNotificationsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={() => setIsNotificationsOpen(false)}
                />
                <div className="absolute right-0 top-full mt-3 w-80 rounded-2xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-black/5 dark:border-white/5">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Notifications</h3>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {invitations.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">No new notifications</div>
                    ) : (
                      <div className="divide-y divide-black/5 dark:divide-white/5">
                        {invitations.map(inv => (
                          <div key={inv.id} className="p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium mb-1">
                              Channel Invitation
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                              You've been invited to join as <span className="font-bold text-slate-700 dark:text-slate-300">{inv.roleName}</span>.
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
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-1"></div>

          {/* Profile Dropdown */}
          <MenuContainer>
            {/* Trigger (Profile Picture and Name) */}
            <div className="flex h-full w-full items-center justify-between pl-2 pr-1 gap-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[100px]">
                {user?.username || user?.firstName || 'user'}
              </span>
              <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden border border-black/5 dark:border-white/10 shadow-sm">
                {user?.avatarUrl ? (
                  <img src={getAvatarUrl(user.avatarUrl)} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                    {user?.firstName ? user.firstName.charAt(0).toUpperCase() : (user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U')}
                  </div>
                )}
              </div>
            </div>

            {/* Menu Items */}
            <MenuItem 
              icon={<UserIcon size={18} strokeWidth={2} className="text-emerald-500" />} 
              onClick={() => router.push('/profile')} 
            >
              Profile
            </MenuItem>
            <MenuItem 
              icon={<Map size={18} strokeWidth={2} className="text-orange-500" />} 
              onClick={() => router.push('/roadmaps')} 
            >
              Roadmaps
            </MenuItem>
            {hasChannels && (
              <MenuItem 
                icon={<Tv size={18} strokeWidth={2} className="text-purple-500" />} 
                onClick={() => router.push('/manage-channels')} 
              >
                My Channel
              </MenuItem>
            )}
            {(hasChannels || showArcConsole) && (
              <MenuItem 
                icon={<BookOpen size={18} strokeWidth={2} className="text-indigo-500" />} 
                onClick={() => router.push('/content')} 
              >
                Content Studio
              </MenuItem>
            )}
            {showArcConsole && (
              <MenuItem 
                icon={<ShieldAlert size={18} strokeWidth={2} className="text-pink-500" />} 
                onClick={() => router.push('/console')} 
              >
                Console
              </MenuItem>
            )}
            <MenuItem 
              icon={<Settings size={18} strokeWidth={2} className="text-slate-500" />} 
              onClick={() => router.push('/settings')} 
            >
              Settings
            </MenuItem>
            <MenuItem 
              icon={<Compass size={18} strokeWidth={2} className="text-blue-500" />} 
              onClick={() => router.push('/?public=true')} 
            >
              Go to website
            </MenuItem>
            <MenuItem 
              icon={<LogOut size={18} strokeWidth={2} className="text-red-500" />} 
              onClick={handleLogout} 
            >
              Sign out
            </MenuItem>
          </MenuContainer>
        </div>
      </div>
    </motion.div>
  );
}
