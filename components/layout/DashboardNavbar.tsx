'use client';

import { useAuthStore } from '@/store/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User as UserIcon, Bell, ChevronRight, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AuthService } from '@/services/auth.service';
import { ChannelStaffService, ChannelInvitation } from '@/services/channel-staff.service';

export default function DashboardNavbar() {
  const { user, clearAuth } = useAuthStore();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [invitations, setInvitations] = useState<ChannelInvitation[]>([]);

  useEffect(() => {
    fetchInvitations();
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
  
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

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
    setIsLoggingOut(true);
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      clearAuth();
      setIsLoggingOut(false);
      window.location.href = '/login';
    }
  };

  // Dynamically compute breadcrumbs based on pathname
  const pathParts = pathname.split('/').filter(Boolean);
  const pageTitle = pathParts[pathParts.length - 1] || 'Overview';
  const formattedPageTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);

  return (
    <nav className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white/70 px-6 md:px-8 backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Modern Breadcrumb */}
        <div className="flex items-center text-xs font-semibold tracking-wider text-slate-400 uppercase gap-1">
          <span className="hover:text-indigo-600 transition-colors cursor-pointer">Arcade</span>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="text-slate-800 font-bold">{formattedPageTitle}</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-slate-100 transition-all cursor-pointer"
          >
            <Bell size={16} />
            {invitations.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
            )}
          </button>
          
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h4 className="text-sm font-bold text-gray-900">Notifications</h4>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{invitations.length} New</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {invitations.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500">No new notifications</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {invitations.map(inv => (
                      <div key={inv.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                        <p className="text-sm text-gray-800 mb-1">
                          <span className="font-bold">{inv.invitedByName}</span> invited you to join <span className="font-bold">{inv.channelName}</span> as <span className="font-bold text-indigo-600">{inv.roleName}</span>.
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => handleAcceptInvite(inv.id)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1.5 rounded-lg transition-colors">Accept</button>
                          <button onClick={() => handleRejectInvite(inv.id)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-1.5 rounded-lg transition-colors">Decline</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-100"></div>

        {/* User profile dropdown and metadata */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleDropdown} 
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-100/80 hover:shadow-sm focus:outline-none transition-all cursor-pointer overflow-hidden relative"
          >
            {user?.avatarUrl ? (
              <img src={getAvatarUrl(user.avatarUrl)} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-indigo-50 text-indigo-700 font-extrabold tracking-tight">
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : (user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U')}
                {user?.lastName ? user.lastName.charAt(0).toUpperCase() : (user?.fullName && user.fullName.split(' ').length > 1 ? user.fullName.split(' ')[1].charAt(0).toUpperCase() : '')}
              </div>
            )}
          </button>
          
          <div className="hidden md:flex flex-col text-left">
            <span className="text-sm font-bold text-slate-800 leading-none mb-0.5">
              {user?.fullName || 'User'}
            </span>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase leading-none">
              Member
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-100"></div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 px-3.5 py-1.5 text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </nav>
  );
}
