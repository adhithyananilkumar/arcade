'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ShieldAlert, Settings, Building2, Tv, Sparkles, User, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { usePermissions } from '@/hooks/usePermissions';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { hasPermission } = usePermissions();
  const primaryRole = user?.roles?.[0]?.name;
  const isSuperUser = primaryRole === 'SUPER_USER';

  const showAdminChannels = isSuperUser || hasPermission('channels.approve') || hasPermission('channels.suspend');
  const showAdminSettings = isSuperUser || hasPermission('roles.create') || hasPermission('roles.assign') || hasPermission('users.suspend');

  const dynamicNavItems = [
    ...navItems,
    ...(showAdminChannels ? [{ name: 'Channel Management', href: '/dashboard/admin/channels', icon: Tv }] : []),
    ...(showAdminSettings ? [{ name: 'Admin Settings', href: '/dashboard/admin/settings', icon: Settings }] : [])
  ];

  if (pathname?.includes('/manage')) {
    return null;
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-slate-100 shadow-[1px_0_10px_rgba(0,0,0,0.01)] relative z-30">
      {/* Brand Logo Header */}
      <div className="flex h-16 items-center px-6 border-b border-slate-50/50">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <Image
            src="/arcade.svg"
            alt="Arcade"
            width={90}
            height={26}
            className="h-6 w-auto transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </Link>
      </div>

      {/* Navigation Area */}
      <nav className="flex-grow overflow-y-auto space-y-1.5 px-4 py-6 scrollbar-thin scrollbar-thumb-slate-100">
        {dynamicNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group"
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-50/70 to-purple-50/40 border-l-[3px] border-indigo-600 shadow-[inset_0_1px_2px_rgba(99,102,241,0.03)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                size={18}
                className={`relative z-10 transition-colors duration-200 ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-700'
                }`}
              />
              <span className={`relative z-10 transition-colors duration-200 ${
                isActive ? 'text-indigo-900 font-semibold' : 'text-slate-600 group-hover:text-slate-900'
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
