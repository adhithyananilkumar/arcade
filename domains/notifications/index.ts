/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Notifications
 *
 * Purpose:
 * Generic, platform-wide notification feed — any backend context can fire a notification
 * (see backend Notification.java's class docs) and it shows up here with no frontend changes
 * required beyond what a `title`/`message`/`linkUrl` can express.
 *
 * Rules:
 * - Export only stable public APIs.
 * - Never export internal helpers.
 * - Never import from apps/.
 * ------------------------------------------------------------------
 */

export { NotificationService, NOTIFICATION_PAGE_SIZE } from './api/notification.service';
export type {
  NotificationDto,
  NotificationCategory,
  NotificationPriority,
  NotificationStatus,
  NotificationFilters,
  NotificationPage,
  UnreadCounts,
} from './api/notification.service';
export { useNotifications } from './hooks/useNotifications';
export { NotificationList } from './components/NotificationList';
export { parseMetadata, getNotificationTargetUrl } from './lib/notificationMetadata';
export type { NotificationMetadata, TransferStatus } from './lib/notificationMetadata';
export { getVisualType } from './lib/visualType';
export type { VisualType } from './lib/visualType';
export { CATEGORY_LABELS, CATEGORY_ORDER } from './lib/categories';
