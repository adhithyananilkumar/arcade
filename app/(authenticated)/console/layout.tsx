'use client';

import { usePathname } from 'next/navigation';
import { Tv, ClipboardCheck, Shield, SlidersHorizontal, Inbox, Receipt, Library, AtSign, BadgeCheck, Bug, Palette } from 'lucide-react';
import { SideNav, SideNavTabs, type SideNavItem } from '@/shared/design-system/ui/side-nav';
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
  const showReviews = AuthorizationService.canAccessPlatformReviews(user);
  const showContentManage = AuthorizationService.canManageContent(user);
  const showExams = AuthorizationService.canManageExams(user);
  const showPayments = AuthorizationService.canViewPayments(user);
  const showIam = AuthorizationService.canAccessIamConsole(user);
  const showInbox = AuthorizationService.canManageInbox(user);
  const showRecognition = AuthorizationService.canManageRecognition(user);
  const showHandles = AuthorizationService.canManageHandles(user);
  const showBugs = AuthorizationService.canOpenBugConsole(user);
  const showAppearance = AuthorizationService.canManageAppearance(user);

  const navItems = [
    ...(showAdminChannels
      ? [{ name: 'Channels', href: '/console/channels', icon: Tv, iconBg: 'bg-[#bae6fd] text-[#0c4a6e] dark:text-[#85bfe9] dark:bg-[#bae6fd]/15' }]
      : []),
    ...(showReviews
      ? [{ name: 'Reviews', href: '/console/reviews', icon: ClipboardCheck, iconBg: 'bg-[#fef08a] text-[#854d0e] dark:bg-[#fef08a]/15 dark:text-[#e7a871]' }]
      : []),
    ...(showContentManage
      ? [{ name: 'Content manage', href: '/console/content-manage', icon: Library, iconBg: 'bg-[#fbcfe8] text-[#831843] dark:text-[#ff8eaf] dark:bg-[#fbcfe8]/15' }]
      : []),
    ...(showExams
      ? [{ name: 'Exam standards', href: '/console/exam-standards', icon: SlidersHorizontal, iconBg: 'bg-[#bbf7d0] text-[#14532d] dark:bg-[#bbf7d0]/15 dark:text-[#8bc89c]' }]
      : []),
    ...(showPayments
      ? [{ name: 'Payments', href: '/console/payments', icon: Receipt, iconBg: 'bg-[#e9d5ff] text-[#4c1d95] dark:text-[#bda1ff] dark:bg-[#e9d5ff]/15' }]
      : []),
    ...(showInbox
      ? [{ name: 'Inbox', href: '/console/inbox', icon: Inbox, iconBg: 'bg-slate-200 text-[#1e40af] dark:text-[#86b3ff]' }]
      : []),
    ...(showBugs
      ? [{ name: 'Bugs', href: '/console/bugs', icon: Bug, iconBg: 'bg-slate-300 text-[#7f1d1d] dark:text-[#ff948b]' }]
      : []),
    ...(showRecognition
      ? [{ name: 'Recognition', href: '/console/recognition', icon: BadgeCheck, iconBg: 'bg-[#ddd6fe] text-[#4c1d95] dark:text-[#bda1ff] dark:bg-[#ddd6fe]/15' }]
      : []),
    ...(showHandles
      ? [{ name: 'Handles', href: '/console/handles', icon: AtSign, iconBg: 'bg-[#c7d2fe] text-[#312e81] dark:text-[#a5adff] dark:bg-[#c7d2fe]/15' }]
      : []),
    ...(showAppearance
      ? [{ name: 'Appearance', href: '/console/appearance', icon: Palette, iconBg: 'bg-[#fbcfe8] text-[#831843] dark:bg-[#fbcfe8]/15 dark:text-[#ff8eaf]' }]
      : []),
    ...(showIam ? [{ name: 'IAM', href: '/console/iam', icon: Shield, iconBg: 'bg-[#fed7aa] text-[#7c2d12] dark:bg-[#fed7aa]/15 dark:text-[#f79d80]' }] : []),
  ].map((item): SideNavItem => ({
    key: item.href,
    label: item.name,
    href: item.href,
    icon: item.icon,
    iconClassName: item.iconBg,
  }));
  const activeKey = navItems.find((item) => pathname.startsWith(item.href))?.key ?? null;

  // Removed notFound() when navItems is empty. This allows Org staff to access 
  // specific console routes (like reviews/[id]) even if they don't have global
  // console sidebar links.
  return (
    <div
      className="relative h-screen w-full flex flex-col overflow-hidden"
      style={{
        background: 'var(--theme-wash, linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 32%, #FFFFFF 70%))',
      }}
    >
      <div className="relative z-10 flex w-full flex-1 min-h-0 flex-col gap-5 px-4 pt-24 sm:px-6 md:flex-row md:gap-5 md:px-8 md:pt-24 pb-0">
        {/* Mobile tabs */}
        <SideNavTabs items={navItems} activeKey={activeKey} ariaLabel="Console" className="md:hidden" />

        {/* Desktop sidebar — nav only, no Platform/Console heading */}
        <aside className="hidden w-[220px] shrink-0 md:flex flex-col overflow-y-auto lg:w-[240px] pb-12">
          <SideNav sections={[{ items: navItems }]} activeKey={activeKey} ariaLabel="Console" />
        </aside>

        {/* The frame above is fixed-height and clipped, so the content area is the scroll container:
            a console page taller than the viewport scrolls here instead of being cut off. Pages that
            manage their own inner scroll (h-full + overflow-y-auto) are unaffected. */}
        <main className="min-w-0 flex-1 flex flex-col min-h-0 relative overflow-y-auto overscroll-contain px-1 pb-6">{children}</main>
      </div>
    </div>
  );
}
