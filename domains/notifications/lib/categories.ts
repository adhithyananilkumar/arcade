import type { NotificationCategory } from '../api/notification.service';

/**
 * Human labels for the backend's notification categories, and the order they appear in as filter
 * chips.
 *
 * <p>The order is by how often a category actually demands action rather than alphabetical:
 * review work and channel administration are what people come to the inbox for, and SYSTEM — the
 * bucket an unrecognised type falls into — sits last because it is the least likely to be what
 * someone is hunting for.
 */
export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  REVIEW: 'Review',
  CHANNEL: 'Channel',
  COLLABORATION: 'Collaboration',
  MODERATION: 'Moderation',
  ACCOUNT: 'Account',
  SYSTEM: 'System',
};

export const CATEGORY_ORDER: NotificationCategory[] = [
  'REVIEW',
  'CHANNEL',
  'COLLABORATION',
  'MODERATION',
  'ACCOUNT',
  'SYSTEM',
];
