'use client';

import { usePathname, notFound } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Settings, Tv, BookOpen, Shield } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import { usePermissions } from "@/domains/identity";
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';

export default function ArcConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const showAdminChannels = AuthorizationService.canManageChannels(user);
  const showReviewCourses = AuthorizationService.canReviewCourses(user);
  const showAdminSettings = AuthorizationService.canManageSettings(user) || AuthorizationService.canManageUsers(user) || AuthorizationService.canManageRoles(user) || AuthorizationService.canManagePermissions(user);

  const navItems = [
    ...(showAdminChannels ? [{
      name: 'Channel Management',
      href: '/console/channels',
      icon: Tv,
    }] : []),
    ...(showReviewCourses ? [{
      name: 'Platform Reviews',
      href: '/console/reviews',
      icon: BookOpen,
    }] : []),
    ...(showAdminSettings ? [{
      name: 'Admin Settings',
      href: '/console/settings',
      icon: Settings,
    }] : []),
  ];

  if (navItems.length === 0) {
    notFound();
  }

  return (
    <div className="flex w-full min-h-[calc(100vh-4rem)]">
      {/* Left Navigation - Full height sidebar */}
      <div className="hidden md:flex flex-col w-64 shrink-0 border-r border-gray-200 bg-white/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="sticky top-16 flex flex-col gap-6 pt-8 h-[calc(100vh-4rem)] overflow-y-auto"
        >
          <div className="px-6">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Platform Console
            </h2>
          </div>
          <nav className="flex flex-col gap-1 px-3 pb-8">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 relative group",
                    isActive 
                      ? "text-indigo-700 dark:text-indigo-300" 
                      : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-neutral-800/50"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-3">
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={cn(
                      "transition-transform duration-300",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )} />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>
        </motion.div>
      </div>

      {/* Content Area */}
      <div className="flex-1 w-full min-w-0 bg-slate-50/50">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full h-full p-8"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
