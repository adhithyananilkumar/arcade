import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService, type NotificationDto } from './notification.service';

/**
 * Canonical React Query keys for the notifications domain. Centralized here
 * (rather than inlined at each call site) so invalidation targets stay
 * precise — see DATA_LAYER_STANDARD.md for the pattern this follows.
 */
export const notificationKeys = {
  list: () => ['notifications', 'list'] as const,
  unreadCount: () => ['notifications', 'unread-count'] as const,
};

export function useNotificationsQuery(enabled: boolean) {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => NotificationService.list(),
    enabled,
  });
}

export function useUnreadCountQuery(enabled: boolean) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => NotificationService.getUnreadCount(),
    enabled,
  });
}

export function useMarkAllReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => NotificationService.markAllRead(),
    onSuccess: () => {
      queryClient.setQueryData<NotificationDto[]>(notificationKeys.list(), (prev) =>
        prev ? prev.map((n) => ({ ...n, read: true })) : prev
      );
      queryClient.setQueryData(notificationKeys.unreadCount(), 0);
    },
  });
}

export function useMarkReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => NotificationService.markRead(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<NotificationDto[]>(notificationKeys.list(), (prev) =>
        prev ? prev.map((n) => (n.id === id ? { ...n, read: true } : n)) : prev
      );
      queryClient.setQueryData<number>(notificationKeys.unreadCount(), (prev) =>
        typeof prev === 'number' ? Math.max(0, prev - 1) : prev
      );
    },
  });
}
