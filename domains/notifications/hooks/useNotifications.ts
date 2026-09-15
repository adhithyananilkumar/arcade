'use client';

import { useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { useWebSocket } from '@/infrastructure/websocket/useWebSocket';
import { NotificationDto } from '../api/notification.service';
import {
  notificationKeys,
  useNotificationsQuery,
  useUnreadCountQuery,
  useMarkAllReadMutation,
  useMarkReadMutation,
} from '../api/notification.queries';

/**
 * Generic notification feed: initial page + unread count via React Query
 * (canonical server-state layer, see DATA_LAYER_STANDARD.md), then live
 * updates pushed over `/user/queue/notifications` merged directly into the
 * query cache for the rest of the session. Works for any notification
 * `type` a backend context fires — see Notification.java's class docs for
 * how to add a new one.
 *
 * Subscription is tied to WebSocket {@code connected} so reconnects (token
 * refresh, network blip) re-attach without requiring a page reload.
 *
 * Preserves the exact external shape of the pre-React-Query implementation
 * ({ notifications, unreadCount, loading, refresh, markAllRead, markRead })
 * so existing consumers (LearnerNavbar) did not need to change.
 */
export function useNotifications() {
  const { status } = useAuthStore();
  const { subscribe, connected } = useWebSocket();
  const queryClient = useQueryClient();

  const enabled = status === 'authenticated';

  const listQuery = useNotificationsQuery(enabled);
  const unreadCountQuery = useUnreadCountQuery(enabled);
  const markAllReadMutation = useMarkAllReadMutation();
  const markReadMutation = useMarkReadMutation();

  useEffect(() => {
    if (!enabled || !connected) return;

    const unsub = subscribe('/user/queue/notifications', (body) => {
      const notif = body as NotificationDto;
      if (!notif?.id) return;
      queryClient.setQueryData<NotificationDto[]>(notificationKeys.list(), (prev) => {
        if (!prev) return prev;
        if (prev.some((n) => n.id === notif.id)) return prev;
        return [notif, ...prev.slice(0, 49)];
      });
      queryClient.setQueryData<number>(notificationKeys.unreadCount(), (prev) =>
        typeof prev === 'number' ? prev + 1 : prev
      );
    });

    return unsub;
  }, [enabled, connected, subscribe, queryClient]);

  const refresh = useCallback(async () => {
    if (status !== 'authenticated') return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() }),
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() }),
    ]);
  }, [status, queryClient]);

  const markAllRead = useCallback(async () => {
    try {
      await markAllReadMutation.mutateAsync();
    } catch {
      // preserved from the original hook: silently no-op on failure
    }
  }, [markAllReadMutation]);

  const markRead = useCallback(
    async (id: string) => {
      try {
        await markReadMutation.mutateAsync(id);
      } catch {
        // preserved from the original hook: silently no-op on failure
      }
    },
    [markReadMutation]
  );

  return {
    notifications: listQuery.data ?? [],
    unreadCount: unreadCountQuery.data ?? 0,
    loading: enabled && (listQuery.isLoading || unreadCountQuery.isLoading),
    refresh,
    markAllRead,
    markRead,
  };
}
