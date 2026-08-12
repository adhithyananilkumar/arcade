'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Home, Compass, BookOpen, Crown, Trophy, Waypoints, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { Dock, DockIcon, DockItem, DockLabel } from '@/shared/design-system/ui/dock';
import { cn } from '@/shared/utils/utils';
import { useStudioAccess } from '@/domains/channels';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';

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
    id: 'my-learning',
    label: 'My Learning',
    href: '/my-learning',
    icon: BookOpen,
    activeColor: 'text-emerald-600 dark:text-emerald-400',
    exact: false,
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    href: '/leaderboard',
    icon: Crown,
    activeColor: 'text-amber-500 dark:text-amber-400',
    exact: false,
  },
  {
    id: 'achievements',
    label: 'Achievements',
    href: '/achievements',
    icon: Trophy,
    activeColor: 'text-amber-600 dark:text-amber-400',
    exact: false,
  },
  {
    id: 'roadmap',
    label: 'Roadmap',
    href: '/roadmaps',
    icon: Waypoints,
    activeColor: 'text-cyan-600 dark:text-cyan-400',
    exact: false,
  },
] as const;

interface DockNavItem {
  id: string;
  label: string;
  href: string;
  icon: any;
  activeColor: string;
  exact: boolean;
}

// ─── Component ─────────── //
export default function LearnerDock() {
  const pathname = usePathname();
  const router = useRouter();
  const { hasAccess: hasStudioAccess } = useStudioAccess();
  const user = useAuthStore((s) => s.user);
  const canAccessConsole = AuthorizationService.canAccessConsole(user);

  const items = useMemo(() => {
    const list: DockNavItem[] = [...dockItems];
    if (hasStudioAccess) {
      // "Studio" is the single entry point into Content Studio/Overview/Editor —
      // no separate Courses/Events/Roadmaps/Reviews dock destinations, those live inside it.
      list.push({
        id: 'studio',
        label: 'Studio',
        href: '/studio',
        icon: LayoutDashboard,
        activeColor: 'text-indigo-600 dark:text-indigo-400',
        exact: false,
      });
    }
    if (canAccessConsole) {
      list.push({
        id: 'console',
        label: 'Console',
        href: '/console',
        icon: ShieldAlert,
        activeColor: 'text-rose-600 dark:text-rose-400',
        exact: false,
      });
    }
    return list;
  }, [hasStudioAccess, canAccessConsole]);

  // Hide the dock on content studio, settings, and active proctored exams.
  // /studio itself and the Content Workspace are handled by LearnerShell's
  // HIDE_DOCK_ROUTES exception instead — this guard is for legacy `/content`
  // paths only.
  if (
    pathname.startsWith('/content') ||
    pathname.startsWith('/settings') ||
    /\/exam\/(start|terminated)/.test(pathname)
  ) {
    return null;
  }

  // Prefix match (not exact-pathname) so "Studio" stays active across the whole
  // family of routes: /studio, /studio/content/course/123,
  // /studio/content/course/123/edit, etc. — route-hierarchy aware, not exact-match.
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
          {items.map((item) => {
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
                    aria-label={item.label}
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
