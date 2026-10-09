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
  contentType?: string;
  contentId?: string;
  reviewId?: string;
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

function toContentTypeSegment(rawType?: unknown): string | null {
  if (typeof rawType !== 'string') return null;
  const type = rawType.toUpperCase();
  if (type === 'COURSE') return 'course';
  if (type === 'EXAM') return 'exam';
  if (['EVENT', 'WORKSHOP', 'WEBINAR', 'BOOTCAMP'].includes(type)) return 'event';
  return null;
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

  const isReviewType =
    n.type === 'CONTENT_SUBMITTED' ||
    n.type === 'CONTENT_APPROVED' ||
    n.type === 'CONTENT_CHANGES_REQUESTED';
  const isReviewerRoute =
    n.linkUrl?.startsWith('/console/reviews') || n.linkUrl?.startsWith('/channels/');

  // Review notifications directed to creators should point to the content's Publishing workspace
  if (isReviewType && !isReviewerRoute) {
    if (metadataObj?.contentType && metadataObj?.contentId) {
      const segment = toContentTypeSegment(metadataObj.contentType) || 'event';
      return `/studio/content/${segment}/${metadataObj.contentId}?tab=publishing`;
    }
    if (n.linkUrl) {
      const workshopMatch = n.linkUrl.match(/^\/studio\/workshop\/([^/?#]+)/);
      if (workshopMatch) return `/studio/content/event/${workshopMatch[1]}?tab=publishing`;

      const courseMatch = n.linkUrl.match(/^\/studio\/course\/([^/?#]+)/);
      if (courseMatch) return `/studio/content/course/${courseMatch[1]}?tab=publishing`;

      const eventMatch = n.linkUrl.match(/^\/studio\/events\/([^/?#]+)/);
      if (eventMatch) return `/studio/content/event/${eventMatch[1]}?tab=publishing`;

      const examMatch = n.linkUrl.match(/^\/studio\/(?:content\/)?exam\/([^/?#]+)/);
      if (examMatch) return `/studio/content/exam/${examMatch[1]}?tab=publishing`;
    }
  }

  // Normalize legacy workshop studio links if encountered in any notification
  if (n.linkUrl?.startsWith('/studio/workshop/')) {
    const match = n.linkUrl.match(/^\/studio\/workshop\/([^/?#]+)/);
    if (match) {
      return `/studio/content/event/${match[1]}?tab=publishing`;
    }
  }

  // A route the sender picked wins over the text heuristics below, which exist only for older
  // notifications sent without a link (or with the bare inbox link). Without this, any message
  // containing "report" — e.g. "X reported a major bug" — was sent to the inbox's Reports tab.
  if (n.linkUrl && !n.linkUrl.startsWith('/console/inbox')) {
    return n.linkUrl;
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
