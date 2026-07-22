'use client';

import { usePathname, notFound } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Settings, Tv, BookOpen, Shield, Calendar } from 'lucide-react';
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
      name: 'Course Management',
      href: '/console/courses',
      icon: BookOpen,
    }, {
      name: 'Exam Schedules',
      href: '/console/exam-schedules',
      icon: Calendar,
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
    <div className="flex w-full gap-8 max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Left Navigation - Floating Pill */}
      <div className="hidden md:flex flex-col w-72 shrink-0">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="sticky top-24 flex flex-col gap-2 pt-4"
        >
          <nav className="flex flex-col gap-1.5 px-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 relative group",
                    isActive 
                      ? "text-indigo-700 dark:text-indigo-300" 
                      : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-neutral-800/50"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/20 rounded-full"
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
      <div className="flex-1 w-full min-w-0 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
