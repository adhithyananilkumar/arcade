'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, History, Tv } from 'lucide-react';
import { PendingChannels } from '@/apps/learner/components/channels/PendingChannels';
import { DeletionRequests } from '@/apps/learner/components/admin/DeletionRequests';
import { ChannelAuditLog } from '@/apps/learner/components/admin/ChannelAuditLog';
import { channelService } from '@/domains/channels';
import { notFound } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';

type AdminTab = 'CHANNELS' | 'DELETION_REQUESTS' | 'AUDIT_LOG';

export default function AdminChannelsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('CHANNELS');
  const [deletionRequestCount, setDeletionRequestCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    channelService
      .getPendingDeletionRequests()
      .then((requests) => {
        if (!cancelled) setDeletionRequestCount(requests.length);
      })
      .catch(() => {
        if (!cancelled) setDeletionRequestCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

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
            className="flex w-full items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-left transition-colors hover:bg-rose-100/80"
          >
            <span className="grid size-10 place-items-center rounded-lg bg-rose-100 text-rose-600">
              <AlertTriangle size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold tabular-nums text-rose-700">
                {deletionRequestCount}
              </span>
              <span className="text-[12px] font-medium text-rose-700/80">
                deletion {deletionRequestCount === 1 ? 'request' : 'requests'} awaiting review
              </span>
            </span>
          </button>
        </div>
      )}

      <div className="flex-none sticky top-0 z-20 flex flex-wrap gap-1 rounded-full border border-slate-200/80 bg-white/80 p-1 shadow-[0_4px_14px_rgba(20,20,43,0.04)] backdrop-blur-md">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all ${
                active
                  ? tab.danger
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-[#14142b] text-white shadow-sm'
                  : tab.danger
                    ? 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-[#14142b]'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
              {!!tab.badge && (
                <span
                  className={`ml-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                    active ? 'bg-white/20 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
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
    </div>
  );
}
