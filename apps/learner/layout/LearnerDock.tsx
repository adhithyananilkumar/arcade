'use client';

import { usePathname, useRouter, useParams } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { Home, Compass, BookOpen, Crown, Trophy, ClipboardList, LayoutDashboard } from 'lucide-react';
import { Dock, DockIcon, DockItem, DockLabel } from '@/shared/design-system/ui/dock';
import { cn } from '@/shared/utils/utils';
import { useStudioAccess } from '@/domains/channels';
import { api } from '@/infrastructure/http/api';

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
    href: '/profile',
    icon: Trophy,
    activeColor: 'text-amber-600 dark:text-amber-400',
    exact: false,
  },
  {
    id: 'exam',
    label: 'Exam',
    href: '/exam',
    icon: ClipboardList,
    activeColor: 'text-rose-600 dark:text-rose-400',
    exact: false,
  }
] as const;

// ─── Component ─────────── //
export default function LearnerDock() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const { hasAccess: hasStudioAccess } = useStudioAccess();
  const [collaboratedWorkshopId, setCollaboratedWorkshopId] = useState<string | null>(null);
  const [hasMultipleCollabs, setHasMultipleCollabs] = useState<boolean>(false);

  useEffect(() => {
    if (!hasStudioAccess) {
      api.get<any[]>('/api/workshops/my-collaborations')
        .then(res => {
          if (res && res.length > 0) {
            setCollaboratedWorkshopId(res[0].id);
            setHasMultipleCollabs(res.length > 1);
          } else {
            setCollaboratedWorkshopId(null);
            setHasMultipleCollabs(false);
          }
        })
        .catch(() => {
          setCollaboratedWorkshopId(null);
          setHasMultipleCollabs(false);
        });
    } else {
      setCollaboratedWorkshopId(null);
      setHasMultipleCollabs(false);
    }
  }, [hasStudioAccess]);

  const items = useMemo(() => {
    if (hasStudioAccess) {
      return [
        ...dockItems,
        {
          id: 'studio',
          label: 'Studio',
          href: '/studio',
          icon: LayoutDashboard,
          activeColor: 'text-indigo-600 dark:text-indigo-400',
          exact: false,
        }
      ];
    } else if (collaboratedWorkshopId) {
      return [
        ...dockItems,
        {
          id: 'studio',
          label: 'Manage',
          href: hasMultipleCollabs ? '/studio/my-collaborations' : `/studio/workshop/${collaboratedWorkshopId}`,
          icon: LayoutDashboard,
          activeColor: 'text-indigo-600 dark:text-indigo-400',
          exact: false,
        }
      ];
    }
    return dockItems;
  }, [hasStudioAccess, collaboratedWorkshopId, hasMultipleCollabs]);
  
  // If we are viewing a specific course, point the exam button to that course's exam.
  // Otherwise, point to a default test course for demonstration.
  const currentCourseId = params?.courseId || 'default';

  // Hide the dock on content studio, roadmaps, settings, and active proctored exams
  if (
    pathname.startsWith('/content') ||
    pathname.startsWith('/roadmaps') ||
    pathname.startsWith('/settings') ||
    /\/exam\/(start|terminated)/.test(pathname)
  ) {
    return null;
  }

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
                onClick={() => {
                  if (item.id === 'exam') {
                    router.push('/exam');
                  } else {
                    router.push(item.href);
                  }
                }}
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
