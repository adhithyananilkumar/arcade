'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Tv, ClipboardCheck, Shield, Calendar, Ticket } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';

export default function ArcConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, status } = useAuthStore();
  const showAdminChannels = AuthorizationService.canManageChannels(user);
  const showReviews = AuthorizationService.canReviewContent(user);
  const showIam =
    AuthorizationService.canManageSettings(user) ||
    AuthorizationService.canManageUsers(user) ||
    AuthorizationService.canManageRoles(user) ||
    AuthorizationService.canManagePermissions(user);
  // Same audience as the rest of console — avoid a separate gate that hides the item.
  const showCoupons = showAdminChannels || showIam || showReviews;

  const navItems = [
    ...(showAdminChannels
      ? [{ name: 'Channels', href: '/console/channels', icon: Tv }]
      : []),
    ...(showReviews
      ? [
          { name: 'Reviews', href: '/console/reviews', icon: ClipboardCheck },
          { name: 'Exams', href: '/console/exam-schedules', icon: Calendar },
        ]
      : []),
    ...(showCoupons
      ? [{ name: 'Coupon', href: '/console/coupons', icon: Ticket }]
      : []),
    ...(showIam ? [{ name: 'IAM', href: '/console/iam', icon: Shield }] : []),
  ];

  // Don't 404 while auth is still hydrating — that breaks client navigations.
  if (status === 'loading' || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Loading console…
      </div>
    );
  }

  if (navItems.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        You do not have access to the console.
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 32%, #FFFFFF 70%)',
      }}
    >
      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 pb-12 pt-28 sm:px-6 md:flex-row md:gap-5 md:px-8 md:pt-32">
        {/* Mobile tabs — keep above page overlays */}
        <nav className="relative z-[60] flex gap-1.5 overflow-x-auto pb-1 md:hidden">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => router.push(item.href)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-colors',
                  active
                    ? 'bg-[#14142b] text-white'
                    : 'border border-slate-200 bg-white/90 text-slate-500 hover:text-[#14142b]',
                )}
              >
                <Icon size={14} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Desktop sidebar — z above coupon modals so nav always works */}
        <aside className="relative z-[60] hidden w-[180px] shrink-0 md:block lg:w-[200px]">
          <nav className="sticky top-28 flex flex-col gap-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => router.push(item.href)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition-colors',
                    active
                      ? 'bg-[#14142b] text-white shadow-[0_8px_18px_rgba(20,20,43,0.16)]'
                      : 'text-slate-500 hover:bg-white/80 hover:text-[#14142b]',
                  )}
                >
                  <Icon size={16} strokeWidth={active ? 2.4 : 2} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="relative z-0 min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
