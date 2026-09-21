import { api } from '@/infrastructure/http/api';

/**
 * The backend's closed set of rendering buckets, mirrored here as a union so tab code is
 * type-checked. Note this is NOT the same axis as `type`, which stays a free-form string owned by
 * whichever backend context fires the notification — see `visualType.ts` for the icon/colour
 * mapping, which remains keyed off `type`.
 */
export type NotificationCategory =
  | 'REVIEW'
  | 'CHANNEL'
  | 'COLLABORATION'
  | 'MODERATION'
  | 'ACCOUNT'
  | 'SYSTEM';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH';

export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  message: string;
  actorId?: string;
  actorName?: string;
  linkUrl?: string;
  metadata?: string;
  read: boolean;
  createdAt: string;
  /** When the recipient read it; null while unread. */
  readAt?: string | null;
  category: NotificationCategory;
  priority: NotificationPriority;
  /** Non-null when this row stands for a collapsed stream of repetitive events. */
  groupKey?: string | null;
  /** How many events this row represents. Always >= 1; > 1 means it is a collapsed group. */
  groupCount: number;
  /** When this row last received an event. Sort key — a growing group returns to the top. */
  lastEventAt: string;
}

/** Which read-state the list is asking for. Applied by the database, not by the client. */
export type NotificationStatus = 'all' | 'unread';

export interface NotificationFilters {
  status?: NotificationStatus;
  category?: NotificationCategory | null;
  search?: string;
}

/** One page of the inbox, with the cursor information an infinite list needs. */
export interface NotificationPage {
  items: NotificationDto[];
  page: number;
  totalPages: number;
  totalElements: number;
  isLast: boolean;
}

export interface UnreadCounts {
  total: number;
  byCategory: Record<NotificationCategory, number>;
}

/** The Spring `Page` envelope, as returned on the wire. */
interface SpringPage<T> {
  content: T[];
  number: number;
  totalPages: number;
  totalElements: number;
  last: boolean;
}

export const NOTIFICATION_PAGE_SIZE = 20;

export class NotificationService {
  /**
   * Fetches one page of the inbox.
   *
   * <p>Every filter is a query parameter rather than something applied after the fact, because the
   * client only ever holds one page: filtering locally meant the "unread" view showed whatever
   * happened to be unread among the most recent 30, while the badge counted the whole history.
   */
  static async list(
    filters: NotificationFilters = {},
    page = 0,
    size = NOTIFICATION_PAGE_SIZE
  ): Promise<NotificationPage> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('size', String(size));
    if (filters.status === 'unread') params.set('status', 'unread');
    if (filters.category) params.set('category', filters.category);
    const search = filters.search?.trim();
    if (search) params.set('q', search);

    const data = await api.get<SpringPage<NotificationDto>>(
      `/api/v1/notifications?${params.toString()}`
    );

    return {
      items: data.content ?? [],
      page: data.number ?? page,
      totalPages: data.totalPages ?? 0,
      totalElements: data.totalElements ?? 0,
      isLast: data.last ?? true,
    };
  }

  /** The total and the per-category breakdown together — the tabs need both to agree. */
  static async getUnreadCounts(): Promise<UnreadCounts> {
    const data = await api.get<{
      count: number;
      byCategory?: Record<NotificationCategory, number>;
    }>('/api/v1/notifications/unread-count');
    return {
      total: data.count ?? 0,
      byCategory: (data.byCategory ?? {}) as Record<NotificationCategory, number>,
    };
  }

  static async markAllRead(): Promise<void> {
    await api.post('/api/v1/notifications/mark-all-read');
  }

  static async markRead(id: string): Promise<void> {
    await api.post(`/api/v1/notifications/${id}/read`);
  }

  static async delete(id: string): Promise<void> {
    await api.delete(`/api/v1/notifications/${id}`);
  }

  // There is deliberately no deleteAll. The backend no longer exposes one — see
  // NotificationController for why bulk destruction was the wrong answer to an overwhelming list.
}
