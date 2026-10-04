'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * Arc Console → Bugs. Overview, the tracker, and intake settings. Tab, filters and the open report
 * live in the URL so a view can be shared with a teammate or reloaded. Every action is
 * re-authorized by the backend (platform.bugs.manage / platform.bugs.configure).
 * ------------------------------------------------------------------
 */

import { useCallback, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LayoutDashboard, ListTodo, Settings2 } from 'lucide-react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';
import { BugOverviewTab } from './BugOverviewTab';
import { BugTrackerTab } from './BugTrackerTab';
import { BugSettingsTab } from './BugSettingsTab';
import { BugDrawer } from './BugDrawer';

type Tab = 'overview' | 'tracker' | 'settings';

export function BugConsole() {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);

  const canManage = AuthorizationService.canManageBugs(user);
  const canConfigure = AuthorizationService.canConfigureBugs(user);

  const tabs: { id: Tab; label: string; icon: typeof ListTodo }[] = [
    ...(canManage
      ? [
          { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
          { id: 'tracker' as const, label: 'Tracker', icon: ListTodo },
        ]
      : []),
    { id: 'settings', label: 'Intake & categories', icon: Settings2 },
  ];
  const requested = params.get('tab') as Tab | null;
  const tab: Tab = tabs.some((t) => t.id === requested) ? requested! : tabs[0].id;
  const bugId = params.get('bug');

  const update = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      Object.entries(changes).forEach(([key, value]) => (value === null || value === '' ? next.delete(key) : next.set(key, value)));
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  return (
    <div className="flex h-full w-full flex-col space-y-5 overflow-y-auto pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-full border border-slate-200/80 bg-surface/80 p-1 shadow-[0_2px_8px_rgba(20,20,43,0.04)] backdrop-blur-md">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => update({ tab: id })}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                tab === id ? 'bg-ink text-on-ink shadow-xs' : 'text-slate-500 hover:bg-slate-50 hover:text-ink'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && canManage && (
        <BugOverviewTab
          refreshKey={refreshKey}
          onOpenTracker={(filters) => update({ tab: 'tracker', ...filters })}
          onOpenBug={(id) => update({ bug: id })}
        />
      )}
      {tab === 'tracker' && canManage && (
        <BugTrackerTab params={params} onChangeParams={update} onOpenBug={(id) => update({ bug: id })} refreshKey={refreshKey} />
      )}
      {tab === 'settings' && <BugSettingsTab canConfigure={canConfigure} />}

      {bugId && canManage && (
        <BugDrawer
          bugId={bugId}
          onClose={() => update({ bug: null })}
          onOpenBug={(id) => update({ bug: id })}
          onChanged={() => setRefreshKey((n) => n + 1)}
        />
      )}
    </div>
  );
}
