'use client';

import Link from 'next/link';
import type { NotificationResponse, NotificationType } from '../types/forum.types';

function icon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    COMMENT_ON_POST: '💬',
    REPLY_TO_COMMENT: '↩',
    UPVOTE_ON_POST: '▲',
    ANSWER_ACCEPTED: '✓',
    NEW_FOLLOWER: '👤',
    MENTION: '@',
    SHARE_COMMENT: '🔗',
  };
  return icons[type] || '🔔';
}

function label(notification: NotificationResponse): string {
  const name = notification.actor?.username || 'Someone';
  const labels: Record<NotificationType, string> = {
    COMMENT_ON_POST: `${name} commented on your post`,
    REPLY_TO_COMMENT: `${name} replied to your comment`,
    UPVOTE_ON_POST: `${name} upvoted your post`,
    ANSWER_ACCEPTED: 'Your answer was accepted!',
    NEW_FOLLOWER: `${name} started following you`,
    MENTION: `${name} mentioned you`,
    SHARE_COMMENT: notification.commentId
      ? `${name} shared a comment with you`
      : `${name} shared a post with you`,
  };
  return labels[notification.type] || 'New notification';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

interface Props {
  notification: NotificationResponse;
}

export function NotificationItem({ notification }: Props) {
  const href = notification.commentId
    ? `/forum/${notification.postId}#comment-${notification.commentId}`
    : notification.postId
      ? `/forum/${notification.postId}`
      : '/forum';

  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        gap: 10,
        padding: '10px 14px',
        textDecoration: 'none',
        backgroundColor: notification.isRead ? 'transparent' : '#fafbff',
        borderLeft: notification.isRead ? '3px solid transparent' : '3px solid var(--arcade-blue)',
        transition: 'background 0.15s',
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1.4 }}>
        {icon(notification.type)}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            marginBottom: 2,
          }}
        >
          {label(notification)}
        </p>
        {notification.postTitle && (
          <p
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {notification.postTitle}
          </p>
        )}
      </div>
      <span
        style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          flexShrink: 0,
          paddingTop: 1,
        }}
      >
        {timeAgo(notification.createdAt)}
      </span>
    </Link>
  );
}
