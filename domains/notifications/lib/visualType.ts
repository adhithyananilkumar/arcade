/**
 * Maps a notification's free-form backend `type` string onto one of a small set of visual
 * buckets for the full notifications page — a color, an icon, and a badge label. `type` is
 * intentionally never a closed enum on the backend (see Notification.java's class docs), so this
 * mapping is two-layered: an explicit table for every type a real context fires today, then a
 * keyword fallback so a *future* context's new type still lands somewhere sensible without a
 * frontend change. Nothing here is fabricated data — it only decides how to skin a real
 * notification, never invents its content.
 */
export type VisualType = 'review' | 'grade' | 'comment' | 'invite' | 'system' | 'profile';

const KNOWN_TYPES: Record<string, VisualType> = {
  // platform.review — a verdict on a content submission
  CONTENT_SUBMITTED: 'review',
  CONTENT_APPROVED: 'review',
  CONTENT_CHANGES_REQUESTED: 'review',
  // platform.tenancy — a verdict on a channel/deletion request
  CHANNEL_APPROVED: 'review',
  CHANNEL_REJECTED: 'review',
  DELETION_APPROVED: 'review',
  DELETION_REJECTED: 'review',
  // platform.tenancy — staff/ownership/collaboration membership changes
  STAFF_INVITED: 'invite',
  STAFF_INVITE_ACCEPTED: 'invite',
  STAFF_INVITE_REJECTED: 'invite',
  STAFF_LEFT: 'invite',
  POLICY_ASSIGNED: 'invite',
  OWNER_TRANSFER_REQUESTED: 'invite',
  OWNER_TRANSFER_ACCEPTED: 'invite',
  OWNER_TRANSFER_DECLINED: 'invite',
  OWNER_TRANSFER_CANCELLED: 'invite',
  // studio.course — collaboration membership changes
  COURSE_COLLABORATION_INVITATION: 'invite',
  COURSE_COLLABORATION_ACCEPTED: 'invite',
  COURSE_COLLABORATION_DECLINED: 'invite',
  // platform.contact / platform.report — admin-facing inbound alerts
  REACH_US: 'system',
  CONTENT_REPORTED: 'system',
};

/** Ordered so the first matching keyword wins; keep specific/rare keywords above generic ones. */
const KEYWORD_FALLBACK: Array<{ pattern: RegExp; bucket: VisualType }> = [
  { pattern: /GRADE|SCORE|EXAM|ASSESSMENT|QUIZ/, bucket: 'grade' },
  { pattern: /COMMENT|REPLY|MENTION|DISCUSSION/, bucket: 'comment' },
  { pattern: /SECURITY|LOGIN|PASSWORD|ACCOUNT|SESSION/, bucket: 'profile' },
  { pattern: /INVITE|STAFF|COLLAB|TRANSFER|POLICY|MEMBER/, bucket: 'invite' },
  { pattern: /APPROVED|REJECTED|SUBMITTED|REVIEW|CHANGES|DECLINED/, bucket: 'review' },
];

export function getVisualType(type: string): VisualType {
  const known = KNOWN_TYPES[type];
  if (known) return known;
  const upper = type.toUpperCase();
  const match = KEYWORD_FALLBACK.find(({ pattern }) => pattern.test(upper));
  return match?.bucket ?? 'system';
}
