'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { useWebSocket } from '@/infrastructure/websocket/useWebSocket';
import { NotificationService, NotificationDto } from '../api/notification.service';

/**
 * Generic notification feed: initial page + unread count via REST, then live updates pushed
 * over `/user/queue/notifications` for the rest of the session. Works for any notification
 * `type` a backend context fires — see Notification.java's class docs for how to add a new one.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { status } = useAuthStore();
  const { subscribe, clientRef } = useWebSocket();

  const refresh = useCallback(async () => {
    if (status !== 'authenticated') return;
    try {
      setLoading(true);
      const [list, count] = await Promise.all([
        NotificationService.list(),
        NotificationService.getUnreadCount(),
      ]);
      setNotifications(list);
      setUnreadCount(count);
    } catch {
      // silently fail for notifications — never block the rest of the UI on this
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const interval = setInterval(() => {
      if (clientRef.current?.connected) {
        clearInterval(interval);
        const unsub = subscribe('/user/queue/notifications', (body) => {
          const notif = body as NotificationDto;
          setNotifications((prev) => [notif, ...prev.slice(0, 49)]);
          setUnreadCount((prev) => prev + 1);
        });
        return () => unsub();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [status, subscribe, clientRef]);

  const markAllRead = useCallback(async () => {
    try {
      await NotificationService.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // no-op
    }
  }, []);

  const markRead = useCallback(async (id: string) => {
    try {
      await NotificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // no-op
    }
  }, []);

  return { notifications, unreadCount, loading, refresh, markAllRead, markRead };
}
