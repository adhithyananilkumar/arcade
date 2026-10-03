'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AtSign, CreditCard, User, Shield, ToggleLeft, Palette, ChevronRight, Settings as SettingsIcon } from 'lucide-react';
import { SideNav, type SideNavItem } from '@/shared/design-system/ui/side-nav';

const sidebarItems = [
  { 
    name: 'Personal info', 
    href: '/settings/info', 
    icon: User, 
    iconBg: 'bg-[#bbf7d0] text-[#14532d] dark:bg-[#bbf7d0]/15 dark:text-[#8bc89c]',
  },
  { 
    name: 'Appearance', 
    href: '/settings/appearance', 
    icon: Palette, 
    iconBg: 'bg-[#fef08a] text-[#854d0e] dark:bg-[#fef08a]/15 dark:text-[#e7a871]',
  },
  { 
    name: 'Security & sign-in', 
    href: '/settings/security', 
    icon: Shield, 
    iconBg: 'bg-[#bae6fd] text-[#0c4a6e] dark:text-[#85bfe9] dark:bg-[#bae6fd]/15',
  },
  { 
    name: 'Payments & billing', 
    href: '/settings/payments', 
    icon: CreditCard, 
    iconBg: 'bg-[#e9d5ff] text-[#4c1d95] dark:text-[#bda1ff] dark:bg-[#e9d5ff]/15',
  },
  { 
    name: 'Data & privacy', 
    href: '/settings/privacy', 
    icon: ToggleLeft, 
    iconBg: 'bg-[#fed7aa] text-[#7c2d12] dark:bg-[#fed7aa]/15 dark:text-[#f79d80]',
  },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // The bare /settings route has no page of its own; Personal info is its landing tab.
  useEffect(() => {
    if (pathname === '/settings') {
      router.replace('/settings/info');
    }
  }, [pathname, router]);

  const navItems: SideNavItem[] = sidebarItems.map((item) => ({
    key: item.href,
    label: item.name,
    href: item.href,
    icon: item.icon,
    iconClassName: item.iconBg,
  }));

  const activeItem = sidebarItems.find(
    item => pathname === item.href || (pathname === '/settings' && item.href === '/settings/info')
  );

  return (
    <div className="theme-page-bg flex flex-col md:flex-row min-h-screen pt-28 md:pt-32 pb-16 bg-surface gap-10 md:gap-14 px-6 md:px-12 items-start">
      {/* Sticky Sidebar Navigation */}
      <aside className="w-full md:w-[240px] shrink-0 bg-transparent py-1 md:sticky md:top-28 self-start z-10">
        <SideNav
          sections={[{ items: navItems }]}
          activeKey={activeItem?.href ?? null}
          ariaLabel="Settings"
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-transparent w-full min-w-0">
        <div className="w-full">
          {/* Breadcrumb Header */}
          <div className="theme-glass-chip pb-3.5 mb-6 border-b border-slate-200/80 flex items-center gap-2 text-sm text-slate-500 font-semibold">
            <Link href="/settings/info" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5">
              <SettingsIcon size={15} />
              <span>Settings</span>
            </Link>
            {activeItem && (
              <>
                <ChevronRight size={15} className="text-slate-400" />
                <span className="text-sky-700 dark:text-sky-400 font-bold">{activeItem.name}</span>
              </>
            )}
          </div>

          <div className="space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
