'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ShieldAlert, Settings, Building2, Tv } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { usePermissions } from '@/hooks/usePermissions';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Organizations', href: '/dashboard/organizations', icon: Building2 },
  { name: 'Sessions', href: '/dashboard/sessions', icon: Users },
  { name: 'Audit Logs', href: '/dashboard/audit', icon: ShieldAlert },
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
    ...(showAdminChannels ? [{ name: 'Admin Channels', href: '/dashboard/admin/channels', icon: Tv }] : []),
    ...(showAdminSettings ? [{ name: 'Admin Settings', href: '/dashboard/admin/settings', icon: Settings }] : [])
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-6 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/arcade.svg"
            alt="Arcade"
            width={90}
            height={26}
            className="h-6 w-auto"
          />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {dynamicNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-indigo-600 bg-indigo-50/50'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-indigo-600"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon
                size={18}
                className={`transition-colors duration-200 ${
                  isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-100">
        <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white shadow-md">
          <h4 className="text-sm font-bold mb-1">Upgrade to Pro</h4>
          <p className="text-xs text-indigo-100 mb-3 opacity-90">Get access to premium features.</p>
          <button className="w-full rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm py-1.5 text-xs font-semibold transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
