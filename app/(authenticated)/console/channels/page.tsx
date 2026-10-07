'use client';

import { useState } from 'react';
import { AlertTriangle, History, Tv, UserPlus } from 'lucide-react';
import { PendingChannels } from '@/apps/learner/components/channels/PendingChannels';
import { DeletionRequests } from '@/apps/learner/components/admin/DeletionRequests';
import { ChannelAuditLog } from '@/apps/learner/components/admin/ChannelAuditLog';
import { InviteUserModal, usePendingDeletionRequestsQuery } from '@/domains/channels';
import { notFound } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';

type AdminTab = 'CHANNELS' | 'DELETION_REQUESTS' | 'AUDIT_LOG';

export default function AdminChannelsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('CHANNELS');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Shares the query the Deletions panel and the navbar's task menu already run, so the tab badge
  // costs nothing extra. It also used to re-fetch on every tab switch — `activeTab` was in the
  // effect's dependencies — which meant clicking between tabs re-requested the whole list to
  // recompute a number that had not changed.
  const { data: deletionRequests } = usePendingDeletionRequestsQuery();
  const deletionRequestCount = deletionRequests?.length ?? null;

  if (!AuthorizationService.canManageChannels(user)) {
    notFound();
  }

  const tabs: { id: AdminTab; label: string; icon: typeof Tv; danger?: boolean; badge?: number | null }[] = [
    { id: 'CHANNELS', label: 'Channels', icon: Tv },
    {
      id: 'DELETION_REQUESTS',
      label: 'Deletions',
      icon: AlertTriangle,
      danger: true,
      badge: deletionRequestCount,
    },
    { id: 'AUDIT_LOG', label: 'Audit', icon: History },
  ];

  return (
    <div className="flex w-full flex-col h-full space-y-5 pb-6">
      {!!deletionRequestCount && activeTab !== 'DELETION_REQUESTS' && (
        <div className="flex-none">
          <button
            type="button"
            onClick={() => setActiveTab('DELETION_REQUESTS')}
            className="flex w-full items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-left transition-colors hover:bg-rose-100/80 dark:border-rose-500/25 dark:bg-rose-500/10 dark:hover:bg-rose-500/15"
          >
            <span className="grid size-10 place-items-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
              <AlertTriangle size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold tabular-nums text-rose-700 dark:text-rose-300">
                {deletionRequestCount}
              </span>
              <span className="text-[12px] font-medium text-rose-700/80 dark:text-rose-300">
                deletion {deletionRequestCount === 1 ? 'request' : 'requests'} awaiting review
              </span>
            </span>
          </button>
        </div>
      )}

      <div className="flex-none flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-0">
        <div className="flex items-center gap-6">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`-mb-px flex items-center gap-2 border-b-2 pb-3 pt-1 text-xs sm:text-sm font-bold tracking-tight transition-colors ${
                  active
                    ? tab.danger
                      ? 'border-rose-600 text-rose-600 dark:border-rose-500 dark:text-rose-400'
                      : 'border-slate-900 text-slate-900'
                    : tab.danger
                      ? 'border-transparent text-slate-500 hover:text-rose-600 dark:hover:text-rose-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <tab.icon size={15} />
                <span>{tab.label}</span>
                {!!tab.badge && (
                  <span
                    className={`ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                      active
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3.5 py-1.5 text-xs font-bold text-on-ink shadow-xs transition-colors hover:bg-slate-800"
        >
          <UserPlus size={14} />
          Invite User
        </button>
      </div>

      <div className={activeTab === 'CHANNELS' ? 'flex-1 min-h-0 overflow-y-auto pr-2 relative' : 'hidden'}>
        <PendingChannels />
      </div>
      <div className={activeTab === 'DELETION_REQUESTS' ? 'flex-1 min-h-0 overflow-y-auto pr-2 relative' : 'hidden'}>
        <DeletionRequests />
      </div>
      <div className={activeTab === 'AUDIT_LOG' ? 'flex-1 min-h-0 overflow-y-auto pr-2 relative' : 'hidden'}>
        <ChannelAuditLog />
      </div>

      <InviteUserModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </div>
  );
}
