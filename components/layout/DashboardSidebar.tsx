'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Settings, 
  Building2,
  UserCircle,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navigationGroups = [
  {
    title: 'GENERAL',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Organizations', href: '/dashboard/organizations', icon: Building2 },
      { name: 'Profile', href: '/dashboard/profile', icon: UserCircle },
      { name: 'Search', href: '/dashboard/search', icon: Search },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ]
  }
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/arcade.svg"
            alt="Arcade"
            width={100}
            height={28}
            className="h-6 w-auto"
          />
        </Link>
      </div>

      <nav className="flex-1 space-y-6 px-4 py-6 overflow-y-auto">
        {navigationGroups.map((group) => (
          <div key={group.title}>
            <h4 className="mb-2 px-3 text-xs font-semibold tracking-wider text-muted-foreground">
              {group.title}
            </h4>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="relative block"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-xl bg-blue-50/80"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 top-1/2 -mt-2 h-4 w-1 rounded-r-full bg-blue-600"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    <Button
                      variant="ghost"
                      className={`relative z-10 w-full justify-start gap-3 rounded-xl px-3 py-2 transition-all hover:bg-slate-100/50 ${
                        isActive ? 'text-blue-700 font-semibold hover:bg-transparent' : 'text-slate-600 hover:text-slate-900 font-medium'
                      }`}
                    >
                      <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      
      <div className="p-4 space-y-4">
        {user && (
          <div className="flex w-full items-center justify-start gap-3 rounded-xl px-2 py-2">
            <Avatar className="h-9 w-9 border border-slate-200">
              <AvatarImage src={user.avatarUrl || ''} alt={user.fullName || 'User'} />
              <AvatarFallback className="bg-blue-50 text-blue-700 font-semibold">
                {user.fullName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start overflow-hidden text-left">
              <span className="truncate text-sm font-semibold leading-none mb-1 text-slate-900">{user.fullName || 'User'}</span>
              <span className="truncate text-xs text-muted-foreground leading-none">{user.email || 'user@example.com'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
