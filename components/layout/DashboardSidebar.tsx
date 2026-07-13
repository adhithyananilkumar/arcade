'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ShieldAlert, Settings, Building2, Sparkles, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Organizations', href: '/dashboard/organizations', icon: Building2 },
  { name: 'Sessions', href: '/dashboard/sessions', icon: Users },
  { name: 'Audit Logs', href: '/dashboard/audit', icon: ShieldAlert },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

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
        {navItems.map((item) => {
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
      
      {/* Bottom Upgrade Card Container */}
      <div className="p-4 mt-auto border-t border-slate-50">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-5 text-white shadow-lg shadow-indigo-200/50 group">
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-20 h-20 rounded-full bg-pink-400/20 blur-lg pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-yellow-300 animate-pulse" />
              <h4 className="text-sm font-bold tracking-wide">Upgrade to Pro</h4>
            </div>
            <p className="text-xs text-indigo-100/90 mb-4 font-normal leading-relaxed">
              Unlock exclusive club tools, custom templates, and advanced team statistics.
            </p>
            <button className="w-full rounded-xl bg-white px-3 py-2 text-xs font-bold text-indigo-600 shadow-md hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 cursor-pointer">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
