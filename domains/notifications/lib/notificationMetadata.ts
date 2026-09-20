/**
 * `Notification.metadata` (backend) is a free-form JSONB bag — any context can put whatever
 * structured extras its notification type needs there (see Notification.java's class docs).
 * This union covers every field a notification type currently rendered anywhere in this domain
 * actually reads; unknown notification types simply have none of these fields set, which is
 * fine — every access is already optional-chained.
 *
 * Shared between every notification UI (bell dropdown, full page, forum panel) so a link or a
 * metadata field resolves identically no matter where a notification is rendered.
 */
export type TransferStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED';

export interface NotificationMetadata {
  contactMessageId?: string;
  messageId?: string;
  reportId?: string;
  id?: string;
  requestId?: string;
  channelId?: string;
  channelName?: string;
  currentOwnerId?: string;
  currentOwnerName?: string;
  proposedOwnerId?: string;
  proposedOwnerName?: string;
  status?: TransferStatus;
  [key: string]: unknown;
}

export function parseMetadata(raw: string | undefined | null): NotificationMetadata | null {
  if (!raw) return null;
  try {
    return (typeof raw === 'string' ? JSON.parse(raw) : raw) as NotificationMetadata;
  } catch {
    return null;
  }
}

interface LinkableNotification {
  type: string;
  title: string;
  message: string;
  linkUrl?: string;
  metadata?: string;
}

/**
 * Resolves where clicking a notification should take the user. A handful of types need a query
 * param stitched onto a generic `linkUrl` (e.g. the console inbox needs to know which message to
 * open); everything else just uses `linkUrl` as-is — the sender already picked a real route (see
 * `NotificationService#send` callers), never a fabricated deep link.
 */
export function getNotificationTargetUrl(n: LinkableNotification): string | null {
  const metadataObj = parseMetadata(n.metadata);

  const messageId =
    metadataObj?.contactMessageId || metadataObj?.messageId || metadataObj?.reportId || metadataObj?.id;

  if (n.type === 'REACH_US') {
    return messageId ? `/console/inbox?tab=reach-us&messageId=${messageId}` : '/console/inbox?tab=reach-us';
  }

  if (n.type === 'CONTENT_REPORTED') {
    return messageId ? `/console/inbox?tab=reports&reportId=${messageId}` : '/console/inbox?tab=reports';
  }

  const lowerTitle = (n.title || '').toLowerCase();
  const lowerMessage = (n.message || '').toLowerCase();

  if (lowerTitle.includes('reach us') || lowerMessage.includes('reach us')) {
    return messageId ? `/console/inbox?tab=reach-us&messageId=${messageId}` : '/console/inbox?tab=reach-us';
  }

  if (lowerTitle.includes('report') || lowerMessage.includes('report')) {
    return messageId ? `/console/inbox?tab=reports&reportId=${messageId}` : '/console/inbox?tab=reports';
  }

  if (n.linkUrl) {
    if (n.linkUrl === '/console/inbox' && messageId) {
      return `/console/inbox?messageId=${messageId}`;
    }
    return n.linkUrl;
  }

  return null;
}
