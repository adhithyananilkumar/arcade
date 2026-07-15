'use client';

import { useAuthStore } from '@/store/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User as UserIcon, Bell, ChevronRight, Settings } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AuthService } from '@/services/auth.service';

export default function DashboardNavbar() {
  const { user, clearAuth } = useAuthStore();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
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
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-slate-100 transition-all cursor-pointer">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
        </button>

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
