'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { useWebSocket } from '@/infrastructure/websocket/useWebSocket';
import type {
  NotificationCategory,
  NotificationDto,
  NotificationFilters,
} from '../api/notification.service';
import {
  applyAllReadToCaches,
  applyDeleteToCaches,
  applyReadToCaches,
  applyUnreadTotal,
  applyUpsertToCaches,
  notificationKeys,
  useDeleteNotificationMutation,
  useMarkAllReadMutation,
  useMarkReadMutation,
  useNotificationsQuery,
  useUnreadCountsQuery,
} from '../api/notification.queries';

/** The envelope pushed over `/user/queue/notifications`. Mirrors the backend NotificationEvent. */
interface NotificationEventDto {
  event: 'CREATED' | 'UPDATED' | 'READ' | 'ALL_READ' | 'DELETED';
  notification: NotificationDto | null;
  notificationId: string | null;
  unreadCount: number;
}

const EMPTY_COUNTS: Record<NotificationCategory, number> = {
  REVIEW: 0,
  CHANNEL: 0,
  COLLABORATION: 0,
  MODERATION: 0,
  ACCOUNT: 0,
  SYSTEM: 0,
};

/**
 * The notification inbox: a filtered, paginated feed plus the unread counts, kept current by the
 * server's event stream rather than by polling or by a Refresh button.
 *
 * <p>Every event the server can emit is handled, not just "a notification arrived":
 *
 * <ul>
 *   <li><b>CREATED / UPDATED</b> invalidate the lists rather than splicing the row in. Only the
 *       server knows whether a new notification belongs in the tab the user is currently looking
 *       at, and an UPDATED row may have changed its sort position (a collapsed group that just
 *       absorbed another event moves back to the top).
 *   <li><b>READ / ALL_READ</b> patch the caches in place and deliberately do <em>not</em> refetch.
 *       In the Unread tab a refetch would make the row vanish from under the user's cursor the
 *       instant they clicked it; leaving it visible-but-read until they navigate is calmer and
 *       loses nothing.
 *   <li><b>DELETED</b> removes the row, since the user asked for it to be gone.
 * </ul>
 *
 * <p>The handler is safe to run more than once per event. This hook is mounted by both the navbar
 * and the inbox page at the same time, and {@code useWebSocket} opens a client per consumer, so a
 * single server frame really is delivered twice. Every branch is idempotent and the unread total
 * comes from the server rather than from a local increment, so duplicates converge instead of
 * double-counting — which is what the old `prev + 1` did.
 */
export function useNotifications(filters: NotificationFilters = {}) {
  const { status } = useAuthStore();
  const { subscribe, connected } = useWebSocket();
  const queryClient = useQueryClient();

  const enabled = status === 'authenticated';

  // Stabilised so a caller passing an object literal does not re-key the query every render.
  const stableFilters = useMemo<NotificationFilters>(
    () => ({
      status: filters.status ?? 'all',
      category: filters.category ?? null,
      search: filters.search?.trim() || undefined,
    }),
    [filters.status, filters.category, filters.search]
  );

  const listQuery = useNotificationsQuery(stableFilters, enabled);
  const countsQuery = useUnreadCountsQuery(enabled);
  const markAllReadMutation = useMarkAllReadMutation();
  const markReadMutation = useMarkReadMutation();
  const deleteMutation = useDeleteNotificationMutation();

  useEffect(() => {
    if (!enabled || !connected) return;

    const unsub = subscribe('/user/queue/notifications', (body) => {
      const payload = body as NotificationEventDto;
      if (!payload?.event) return;

      switch (payload.event) {
        case 'CREATED':
          queryClient.invalidateQueries({ queryKey: notificationKeys.listRoot() });
          break;
        case 'UPDATED':
          if (payload.notification) {
            applyUpsertToCaches(queryClient, payload.notification);
          }
          queryClient.invalidateQueries({ queryKey: notificationKeys.listRoot() });
          break;
        case 'READ':
          if (payload.notificationId) applyReadToCaches(queryClient, payload.notificationId);
          break;
        case 'ALL_READ':
          applyAllReadToCaches(queryClient);
          break;
        case 'DELETED':
          if (payload.notificationId) applyDeleteToCaches(queryClient, payload.notificationId);
          break;
      }

      applyUnreadTotal(queryClient, payload.unreadCount ?? 0);
    });

    return unsub;
  }, [enabled, connected, subscribe, queryClient]);

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

  // Delete is destructive and irreversible, so — unlike markRead/markAllRead above — failures are
  // rethrown rather than swallowed: the caller needs to know so it can tell the user rather than
  // have a "deleted" notification silently reappear on next refresh.
  const deleteNotification = useCallback(
    (id: string) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  );

  const notifications = useMemo(
    () => listQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [listQuery.data]
  );

  /**
   * Refetches lists and counts.
   *
   * <p>This is not a Refresh button — the event stream keeps the inbox current on its own, and a
   * button asking the user to do the client's job was removed along with the gaps that made it
   * necessary. It exists for out-of-band mutations that this domain does not own: accepting a
   * channel ownership transfer from inside a notification row changes server state through a
   * different domain's API, which emits no notification event of its own.
   */
  const refresh = useCallback(async () => {
    if (!enabled) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: notificationKeys.listRoot() }),
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() }),
    ]);
  }, [enabled, queryClient]);

  return {
    notifications,
    /** Total matching the active filters server-side — not the number of rows loaded so far. */
    totalCount: listQuery.data?.pages[0]?.totalElements ?? 0,
    unreadCount: countsQuery.data?.total ?? 0,
    unreadByCategory: countsQuery.data?.byCategory ?? EMPTY_COUNTS,
    loading: enabled && (listQuery.isLoading || countsQuery.isLoading),
    /** True while a filter/tab change is being fetched but stale rows are still on screen. */
    isRefetching: listQuery.isFetching && !listQuery.isFetchingNextPage,
    hasMore: Boolean(listQuery.hasNextPage),
    loadMore: listQuery.fetchNextPage,
    isLoadingMore: listQuery.isFetchingNextPage,
    /** Whether the live event stream is attached. Surfaced so the UI can be honest when it is not. */
    connected,
    refresh,
    markAllRead,
    markRead,
    deleteNotification,
  };
}
