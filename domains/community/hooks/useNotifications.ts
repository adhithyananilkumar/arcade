'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { useForumStore } from '../store/forum.store';
import { useWebSocket } from './useWebSocket';
import { ForumService } from '../api/forum.service';
import type { NotificationResponse } from '../types/forum.types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const { status } = useAuthStore();
  const { setUnreadCount, incrementUnreadCount } = useForumStore();
  const { subscribe, connected } = useWebSocket();

  useEffect(() => {
    if (status !== 'authenticated') return;
    ForumService.getUnreadCount()
      .then(setUnreadCount)
      .catch(() => {});
  }, [status, setUnreadCount]);

  useEffect(() => {
    if (status !== 'authenticated' || !connected) return;

    const unsub = subscribe('/user/queue/notifications', (body) => {
      const notif = body as NotificationResponse;
      setNotifications((prev) => [notif, ...prev.slice(0, 49)]);
      incrementUnreadCount();
    });

    return unsub;
  }, [status, connected, subscribe, incrementUnreadCount]);

  const markAllRead = useCallback(async () => {
    try {
      await ForumService.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  }, [setUnreadCount]);

  return { notifications, markAllRead };
}
