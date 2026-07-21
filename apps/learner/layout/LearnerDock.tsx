'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Compass, BookOpen, Trophy } from 'lucide-react';
import { Dock, DockIcon, DockItem, DockLabel } from '@/shared/design-system/ui/dock';
import { cn } from '@/shared/utils/utils';

// ─── Nav items ────────────────────────────────────────────────────────────────
const dockItems = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: Home,
    activeColor: 'text-indigo-600 dark:text-indigo-400',
    exact: true,
  },
  {
    id: 'explore',
    label: 'Explore',
    href: '/search',
    icon: Compass,
    activeColor: 'text-violet-600 dark:text-violet-400',
    exact: false,
  },
  {
    id: 'my-courses',
    label: 'My Courses',
    href: '/my-courses',
    icon: BookOpen,
    activeColor: 'text-emerald-600 dark:text-emerald-400',
    exact: false,
  },
  {
    id: 'achievements',
    label: 'Achievements',
    href: '/studio',
    icon: Trophy,
    activeColor: 'text-amber-600 dark:text-amber-400',
    exact: false,
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────
export default function LearnerDock() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href) && href !== '/';

  return (
    // Fixed bottom-center. pointer-events-none on the full-width row so
    // only the capsule is interactive.
    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto">
        <Dock
          // We use the custom CSS class from globals.css for a perfect glassy look
          className="apple-glass-dock"
          magnification={100}
          distance={90}
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
                  {/* Bare icon — magnification is the only hover effect */}
                  <Icon
                    className={cn(
                      'transition-colors duration-200',
                      active
                        ? item.activeColor
                        : 'text-slate-500/75 dark:text-neutral-400/80'
                    )}
                    strokeWidth={active ? 2.3 : 1.7}
                  />
                </DockIcon>
              </DockItem>
            );
          })}
        </Dock>
      </div>
    </div>
  );
}
