'use client';

import { useAuthStore } from '@/store/auth.store';
import { AuthService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function DashboardNavbar() {
  const { user, clearAuth } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const getAvatarUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    if (url.startsWith('/api/v1/')) {
      return baseUrl.replace('/api/v1', '') + url;
    }
    if (!url.includes('/')) {
      return baseUrl + '/users/avatars/' + url;
    }
    return baseUrl + (url.startsWith('/') ? '' : '/') + url;
  };
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await AuthService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout encountered an error, but your local session is cleared.');
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return (
    <nav className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Breadcrumb replacement for Logo */}
        <div className="flex items-center text-sm text-gray-500 font-medium">
          <span className="text-gray-400">Dashboard</span>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-gray-900">Overview</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <button onClick={toggleDropdown} className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 border-2 border-transparent focus:border-indigo-500 focus:outline-none transition-all">
            {user?.avatarUrl ? (
              <img src={getAvatarUrl(user.avatarUrl)} alt="Avatar" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <UserIcon size={18} />
            )}
          </button>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-semibold text-gray-900 leading-none mb-1">
              {user?.fullName || 'User'}
            </span>
            <span className="text-xs text-gray-500 leading-none">
              {user?.roles?.[0]?.name?.replace('ROLE_', '') || 'Member'}
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-gray-200"></div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </nav>
  );
}
