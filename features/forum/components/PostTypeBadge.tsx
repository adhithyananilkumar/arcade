'use client';

import type { PostType } from '../types/forum.types';

const config: Record<PostType, { label: string; color: string; bg: string }> = {
  DISCUSSION: { label: 'Discussion', color: '#4a5568', bg: '#f1f4fa' },
  QUESTION: { label: 'Question', color: '#205ca8', bg: '#ebf0fa' },
  BLOG: { label: 'Blog', color: '#7c3aed', bg: '#f5f3ff' },
  SHOWCASE: { label: 'Showcase', color: '#d97706', bg: '#fffbeb' },
  POLL: { label: 'Poll', color: '#059669', bg: '#ecfdf5' },
};

export function PostTypeBadge({ type }: { type: PostType }) {
  const c = config[type] || config.DISCUSSION;
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 11,
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        padding: '2px 8px',
        color: c.color,
        backgroundColor: c.bg,
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap',
      }}
    >
      {c.label}
    </span>
  );
}
