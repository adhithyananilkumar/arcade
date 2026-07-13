'use client';

import { useAuthStore } from '@/store/auth.store';
import { Search, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AuthService } from '@/services/auth.service';

export default function DashboardNavbar() {
  const { user, clearAuth } = useAuthStore();

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

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      clearAuth();
      window.location.href = '/login';
    }
  };

  return (
    <nav className="flex h-16 w-full items-center justify-between px-6 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
      
      {/* Search */}
      <div className="flex w-full max-w-md items-center gap-2 relative">
        <Search size={16} className="absolute left-3 text-muted-foreground" />
        <Input 
          type="text" 
          placeholder="Search..." 
          className="w-full pl-9 bg-slate-50/50 border-slate-200 h-9 rounded-lg focus-visible:ring-blue-500 shadow-sm" 
        />
        <div className="absolute right-3 flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 border border-slate-200">
          ⌘K
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        
        {/* User Profile */}
        <div className="flex items-center gap-3 pr-4 border-r border-slate-200 hidden sm:flex">
          <Avatar className="h-8 w-8 border border-slate-200">
            <AvatarImage src={getAvatarUrl(user?.avatarUrl) || ''} alt={user?.fullName || 'User'} />
            <AvatarFallback className="bg-blue-50 text-blue-700 text-xs font-semibold">
              {user?.fullName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold text-slate-900 leading-none">
            {user?.fullName || 'User'}
          </span>
        </div>

        {/* Logout Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-lg font-semibold"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>

      </div>
    </nav>
  );
}
