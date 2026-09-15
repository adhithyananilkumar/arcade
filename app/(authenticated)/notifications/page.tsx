'use client';

import React, { useState, useMemo } from 'react';
import { Bell, CheckCheck, RefreshCw } from 'lucide-react';
import { useNotifications, NotificationList } from '@/domains/notifications';

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, refresh, markAllRead, markRead } = useNotifications();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, activeTab]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-neutral-950 pt-8 pb-16 px-4 sm:px-6 lg:px-8 text-slate-800 dark:text-slate-200">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 shadow-2xs">
                  <Bell size={22} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Notifications
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Stay up to date with course collaboration, channel events, and platform activity.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-700 transition-colors shadow-2xs disabled:opacity-50"
                title="Refresh notifications"
              >
                <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-2xs"
                >
                  <CheckCheck size={14} />
                  <span>Mark all as read</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-neutral-800/80 border border-slate-200/60 dark:border-neutral-700/60">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('unread')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'unread'
                    ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              {unreadCount === 0 ? 'All caught up' : `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>

        {/* Notifications Feed Container */}
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden">
          {loading && notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-medium text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw size={20} className="animate-spin text-indigo-600" />
              <span>Loading notifications...</span>
            </div>
          ) : (
            <NotificationList
              notifications={filteredNotifications}
              onItemClick={(n) => {
                if (!n.read) {
                  markRead(n.id);
                }
              }}
              onNotificationAction={refresh}
              emptyMessage={
                activeTab === 'unread'
                  ? 'No unread notifications.'
                  : "We'll notify you when something new arrives."
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
