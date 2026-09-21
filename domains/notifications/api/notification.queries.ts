import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';
import {
  NOTIFICATION_PAGE_SIZE,
  NotificationService,
  type NotificationDto,
  type NotificationFilters,
  type NotificationPage,
  type UnreadCounts,
} from './notification.service';

/**
 * Canonical React Query keys for the notifications domain. Centralized here (rather than inlined at
 * each call site) so invalidation targets stay precise — see DATA_LAYER_STANDARD.md.
 *
 * <p>`list` is parameterised by its filters, so the bell (unread-only) and the inbox page (whatever
 * tab is active) hold genuinely separate caches instead of fighting over one shared array.
 * `listRoot` is the prefix that matches every one of them at once.
 */
export const notificationKeys = {
  all: () => ['notifications'] as const,
  listRoot: () => ['notifications', 'list'] as const,
  list: (filters: NotificationFilters) =>
    [
      'notifications',
      'list',
      filters.status ?? 'all',
      filters.category ?? null,
      filters.search?.trim() || null,
    ] as const,
  unreadCount: () => ['notifications', 'unread-count'] as const,
};

type ListCache = InfiniteData<NotificationPage, number>;

export function useNotificationsQuery(filters: NotificationFilters, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: ({ pageParam }) => NotificationService.list(filters, pageParam, NOTIFICATION_PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.isLast ? undefined : lastPage.page + 1),
    enabled,
  });
}

export function useUnreadCountsQuery(enabled: boolean) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => NotificationService.getUnreadCounts(),
    enabled,
  });
}

/**
 * Applies a change to every cached list at once, whatever filters each was fetched with.
 *
 * <p>A read or a delete is true of the notification everywhere it appears, so patching only the
 * list the user happens to be looking at would leave the bell — a separate cache with separate
 * filters — showing a row the user has already dealt with.
 */
function patchEveryList(
  queryClient: QueryClient,
  patch: (items: NotificationDto[]) => NotificationDto[]
) {
  queryClient.setQueriesData<ListCache>({ queryKey: notificationKeys.listRoot() }, (prev) => {
    if (!prev) return prev;
    return {
      ...prev,
      pages: prev.pages.map((page) => ({ ...page, items: patch(page.items) })),
    };
  });
}

/** Marks one notification read across every cached list, leaving it in place. */
export function applyReadToCaches(queryClient: QueryClient, id: string, readAt = new Date().toISOString()) {
  patchEveryList(queryClient, (items) =>
    items.map((n) => (n.id === id && !n.read ? { ...n, read: true, readAt } : n))
  );
}

export function applyAllReadToCaches(queryClient: QueryClient, readAt = new Date().toISOString()) {
  patchEveryList(queryClient, (items) =>
    items.map((n) => (n.read ? n : { ...n, read: true, readAt }))
  );
}

export function applyDeleteToCaches(queryClient: QueryClient, id: string) {
  patchEveryList(queryClient, (items) => items.filter((n) => n.id !== id));
}

/** Replaces a notification in place — what a collapsed group does when it absorbs another event. */
export function applyUpsertToCaches(queryClient: QueryClient, notification: NotificationDto) {
  patchEveryList(queryClient, (items) =>
    items.map((n) => (n.id === notification.id ? notification : n))
  );
}

/**
 * Sets the unread total immediately from an authoritative server number, then refetches so the
 * per-category breakdown catches up. The event stream carries the total but not the breakdown, and
 * a badge that is instantly right matters more than tab counts that are right a moment later.
 */
export function applyUnreadTotal(queryClient: QueryClient, total: number) {
  queryClient.setQueryData<UnreadCounts>(notificationKeys.unreadCount(), (prev) =>
    prev ? { ...prev, total } : prev
  );
  queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
}

export function useMarkAllReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => NotificationService.markAllRead(),
    onSuccess: () => {
      applyAllReadToCaches(queryClient);
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

export function useMarkReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => NotificationService.markRead(id),
    onSuccess: (_data, id) => {
      applyReadToCaches(queryClient, id);
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => NotificationService.delete(id),
    onSuccess: (_data, id) => {
      applyDeleteToCaches(queryClient, id);
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}
