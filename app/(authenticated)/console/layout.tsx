'use client';

import { usePathname, notFound } from 'next/navigation';
import Link from 'next/link';
import { Tv, ClipboardCheck, Shield, Calendar, Receipt } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
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
  const showReviews = AuthorizationService.canReviewContent(user);
  const showPlatformReviews = AuthorizationService.canReviewPlatformContent(user);
  const showPayments = AuthorizationService.canViewPayments(user);
  const showIam =
    AuthorizationService.canManageSettings(user) ||
    AuthorizationService.canManageUsers(user) ||
    AuthorizationService.canManageRoles(user) ||
    AuthorizationService.canManagePermissions(user);

  const navItems = [
    ...(showAdminChannels
      ? [{ name: 'Channels', href: '/console/channels', icon: Tv, iconBg: 'bg-[#bae6fd] text-[#0c4a6e]' }]
      : []),
    ...(showReviews
      ? [{ name: 'Reviews', href: '/console/reviews', icon: ClipboardCheck, iconBg: 'bg-[#fef08a] text-[#854d0e]' }]
      : []),
    ...(showPlatformReviews
      ? [{ name: 'Exams', href: '/console/exam-schedules', icon: Calendar, iconBg: 'bg-[#bbf7d0] text-[#14532d]' }]
      : []),
    ...(showPayments
      ? [{ name: 'Payments', href: '/console/payments', icon: Receipt, iconBg: 'bg-[#e9d5ff] text-[#4c1d95]' }]
      : []),
    ...(showIam ? [{ name: 'IAM', href: '/console/iam', icon: Shield, iconBg: 'bg-[#fed7aa] text-[#7c2d12]' }] : []),
  ];

  // Removed notFound() when navItems is empty. This allows Org staff to access 
  // specific console routes (like reviews/[id]) even if they don't have global
  // console sidebar links.
  return (
    <div
      className="relative h-screen w-full flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 32%, #FFFFFF 70%)',
      }}
    >
      <div className="relative z-10 flex w-full flex-1 min-h-0 flex-col gap-5 px-4 pt-24 sm:px-6 md:flex-row md:gap-5 md:px-8 md:pt-24 pb-0">
        {/* Mobile tabs */}
        <nav className="flex gap-1.5 overflow-x-auto shrink-0 pb-1 md:hidden">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex shrink-0 items-center gap-2 rounded-full pr-4 pl-2 py-1.5 text-[12px] font-semibold transition-colors',
                  active
                    ? "bg-sky-100/90 text-sky-950 border border-sky-200 dark:bg-sky-950/70 dark:text-sky-200 dark:border-sky-800/60" 
                    : "border border-slate-200 bg-white/90 text-slate-600 dark:bg-neutral-800 dark:border-neutral-700 dark:text-slate-300"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full shrink-0 shadow-2xs",
                  item.iconBg
                )}>
                  <Icon size={12} strokeWidth={2} />
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop sidebar — nav only, no Platform/Console heading */}
        <aside className="hidden w-[220px] shrink-0 md:flex flex-col overflow-y-auto lg:w-[240px] pb-12">
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3.5 px-4 py-3 rounded-full transition-all duration-200 text-sm font-semibold",
                    active 
                      ? "bg-sky-100/90 text-sky-950 border border-sky-200 dark:bg-sky-950/70 dark:text-sky-200 dark:border-sky-800/60 font-bold shadow-xs" 
                      : "hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-slate-300"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full shrink-0 shadow-2xs",
                    item.iconBg
                  )}>
                    <Icon size={16} strokeWidth={2} />
                  </div>
                  <span className="truncate text-xs font-semibold">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 flex flex-col min-h-0 relative px-1">{children}</main>
      </div>
    </div>
  );
}
