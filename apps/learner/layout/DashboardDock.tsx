'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Compass, BookOpen, Trophy } from 'lucide-react';
import { Dock, DockIcon, DockItem, DockLabel } from '@/shared/design-system/ui/dock';
import { cn } from '@/shared/utils/utils';

const dockItems = [
  {
    id: 'home',
    label: 'Home',
    href: '/dashboard',
    icon: Home,
    activeColor: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/30',
    exact: true,
  },
  {
    id: 'explore',
    label: 'Explore',
    href: '/dashboard/search',
    icon: Compass,
    activeColor: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-900/30',
    exact: false,
  },
  {
    id: 'my-courses',
    label: 'My Courses',
    href: '/dashboard/my-courses',
    icon: BookOpen,
    activeColor: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
    exact: false,
  },
  {
    id: 'achievements',
    label: 'Achievements',
    href: '/dashboard/roadmaps',
    icon: Trophy,
    activeColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/30',
    exact: false,
  },
] as const;

export default function DashboardDock() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto">
        <Dock
          className="border border-slate-200/80 dark:border-neutral-800/80 shadow-2xl shadow-black/10 dark:shadow-black/40 backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80"
          magnification={68}
          distance={120}
          panelHeight={60}
        >
          {dockItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <DockItem
                key={item.id}
                className="cursor-pointer"
                onClick={() => router.push(item.href)}
              >
                <DockLabel>{item.label}</DockLabel>
                <DockIcon>
                  <div
                    className={cn(
                      'flex items-center justify-center w-full h-full rounded-xl transition-all duration-200',
                      active ? item.bgColor : 'bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700'
                    )}
                  >
                    <Icon
                      className={cn(
                        'transition-colors duration-200',
                        active
                          ? item.activeColor
                          : 'text-slate-500 dark:text-neutral-400'
                      )}
                      strokeWidth={active ? 2.5 : 1.8}
                    />
                    {active && (
                      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                    )}
                  </div>
                </DockIcon>
              </DockItem>
            );
          })}
        </Dock>
      </div>
    </div>
  );
}
