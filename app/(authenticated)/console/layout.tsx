'use client';

import { usePathname, notFound } from 'next/navigation';
import Link from 'next/link';
import { Tv, ClipboardCheck, Shield, Calendar, Inbox, Receipt } from 'lucide-react';
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
  const showInbox = AuthorizationService.canAccessConsole(user);

  const navItems = [
    ...(showAdminChannels
      ? [{ name: 'Channels', href: '/console/channels', icon: Tv }]
      : []),
    ...(showReviews
      ? [{ name: 'Reviews', href: '/console/reviews', icon: ClipboardCheck }]
      : []),
    ...(showPlatformReviews
      ? [{ name: 'Exams', href: '/console/exam-schedules', icon: Calendar }]
      : []),
    ...(showPayments
      ? [{ name: 'Payments', href: '/console/payments', icon: Receipt }]
      : []),
    ...(showInbox
      ? [{ name: 'Inbox', href: '/console/inbox', icon: Inbox }]
      : []),
    ...(showIam ? [{ name: 'IAM', href: '/console/iam', icon: Shield }] : []),
  ];

  // Removed notFound() when navItems is empty. This allows Org staff to access 
  // specific console routes (like reviews/[id]) even if they don't have global
  // console sidebar links.
  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 32%, #FFFFFF 70%)',
      }}
    >
      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 pb-12 pt-28 sm:px-6 md:flex-row md:gap-5 md:px-8 md:pt-32">
        {/* Mobile tabs */}
        <nav className="flex gap-1.5 overflow-x-auto pb-1 md:hidden">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-colors',
                  active
                    ? 'bg-[#14142b] text-white'
                    : 'border border-slate-200 bg-white/90 text-slate-500 hover:text-[#14142b]',
                )}
              >
                <Icon size={14} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop sidebar — nav only, no Platform/Console heading */}
        <aside className="hidden w-[180px] shrink-0 md:block lg:w-[200px]">
          <nav className="sticky top-28 flex flex-col gap-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors',
                    active
                      ? 'bg-[#14142b] text-white shadow-[0_8px_18px_rgba(20,20,43,0.16)]'
                      : 'text-slate-500 hover:bg-white/80 hover:text-[#14142b]',
                  )}
                >
                  <Icon size={16} strokeWidth={active ? 2.4 : 2} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
