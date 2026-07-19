'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useForumStore } from '../store/forum.store';
import { useWebSocket } from './useWebSocket';
import { ForumService } from '../api/forum.service';
import type { NotificationResponse } from '../types/forum.types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const { status } = useAuthStore();
  const { setUnreadCount, incrementUnreadCount } = useForumStore();
  const { subscribe, clientRef } = useWebSocket();

  // Fetch initial unread count
  useEffect(() => {
    if (status !== 'authenticated') return;
    ForumService.getUnreadCount()
      .then(setUnreadCount)
      .catch(() => {});
  }, [status, setUnreadCount]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (status !== 'authenticated') return;

    // Wait for connection then subscribe
    const interval = setInterval(() => {
      if (clientRef.current?.connected) {
        clearInterval(interval);
        const unsub = subscribe('/user/queue/notifications', (body) => {
          const notif = body as NotificationResponse;
          setNotifications((prev) => [notif, ...prev.slice(0, 49)]);
          incrementUnreadCount();
        });
        return () => unsub();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [status, subscribe, incrementUnreadCount, clientRef]);

  const markAllRead = useCallback(async () => {
    try {
      await ForumService.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  }, [setUnreadCount]);

  return { notifications, markAllRead };
}
