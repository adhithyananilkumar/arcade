'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CreditCard, User, Shield, ToggleLeft, Palette, ChevronRight, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/shared/utils/utils';

const sidebarItems = [
  { 
    name: 'Personal info', 
    href: '/settings/info', 
    icon: User, 
    iconBg: 'bg-[#bbf7d0] text-[#14532d]',
  },
  { 
    name: 'Appearance', 
    href: '/settings/appearance', 
    icon: Palette, 
    iconBg: 'bg-[#fef08a] text-[#854d0e]',
  },
  { 
    name: 'Security & sign-in', 
    href: '/settings/security', 
    icon: Shield, 
    iconBg: 'bg-[#bae6fd] text-[#0c4a6e]',
  },
  { 
    name: 'Payments & subscriptions', 
    href: '/settings/payments', 
    icon: CreditCard, 
    iconBg: 'bg-[#e9d5ff] text-[#4c1d95]',
  },
  { 
    name: 'Data & privacy', 
    href: '/settings/privacy', 
    icon: ToggleLeft, 
    iconBg: 'bg-[#fed7aa] text-[#7c2d12]',
  },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // If hitting root /settings directly, redirect to /settings/info
  useEffect(() => {
    if (pathname === '/settings') {
      router.replace('/settings/info');
    }
  }, [pathname, router]);

  const activeItem = sidebarItems.find(
    item => pathname === item.href || (pathname === '/settings' && item.href === '/settings/info')
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen pt-20 md:pt-24 pb-16 bg-white dark:bg-[#202124] gap-10 md:gap-14 px-6 md:px-12 items-start">
      {/* Sticky Sidebar Navigation */}
      <aside className="w-full md:w-[240px] shrink-0 bg-transparent py-1 md:sticky md:top-24 self-start z-10">
        <nav className="space-y-1.5">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (pathname === '/settings' && item.href === '/settings/info');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-full transition-all duration-200 text-sm font-semibold",
                  isActive 
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

      {/* Main Content Area */}
      <main className="flex-1 bg-transparent py-1 w-full min-w-0">
        <div className="w-full">
          {/* Sticky Breadcrumb Header with Top-Extended Background Shield */}
          <div className="sticky top-0 z-30 bg-white dark:bg-[#202124] pt-20 md:pt-24 pb-3.5 mb-6 border-b border-slate-200/80 dark:border-neutral-800 flex items-center gap-2 text-sm text-slate-500 dark:text-neutral-400 font-semibold -mt-20 md:-mt-24">
            <Link href="/settings/info" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5">
              <SettingsIcon size={15} />
              <span>Settings</span>
            </Link>
            <ChevronRight size={15} className="text-slate-400 dark:text-neutral-600" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Account & Preferences</span>
            {activeItem && (
              <>
                <ChevronRight size={15} className="text-slate-400 dark:text-neutral-600" />
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
