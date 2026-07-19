'use client';

import { useComments } from '../api/forum.queries';
import { CommentCard } from './CommentCard';
import { CommentForm } from './CommentForm';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';
import { UserAvatar } from './UserAvatar';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PostDetailResponse } from '../types/forum.types';

interface Props {
  post: PostDetailResponse;
  liveCommentCount?: number;
}

export function CommentThread({ post, liveCommentCount }: Props) {
  const { data, isLoading } = useComments(post.id);

  const displayCount = liveCommentCount ?? post.commentCount;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
          {displayCount} {displayCount === 1 ? 'Comment' : 'Comments'}
        </h2>
      </div>

      {/* Comment form trigger */}
      <CommentTrigger postId={post.id} />

      {/* Comments list */}
      {isLoading ? (
        <LoadingSkeleton count={3} />
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          title="No comments yet"
          description="Be the first to reply to this post."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {data.content.map((comment) => (
            <CommentCard key={comment.id} comment={comment} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentTrigger({ postId }: { postId: number }) {
  const [open, setOpen] = useState(false);
  const { user, status } = useAuthStore();

  if (status !== 'authenticated') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 16px',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--surface)',
          marginBottom: 20,
          cursor: 'pointer',
        }}
        onClick={() => {/* optionally redirect to login */}}
      >
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          backgroundColor: 'var(--border)',
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: 14,
          color: 'var(--text-muted)',
        }}>
          Sign in to add a comment...
        </span>
      </div>
    );
  }

  if (!open) {
    return (
      <div
        onClick={() => setOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 16px',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#fff',
          marginBottom: 20,
          cursor: 'text',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--arcade-blue)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        <UserAvatar
          username={user?.username || ''}
          avatarUrl={user?.avatarUrl}
          size="sm"
        />
        <span style={{
          fontSize: 14,
          color: 'var(--text-muted)',
        }}>
          Add a comment...
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginBottom: 20 }}
    >
      <CommentForm
        postId={postId}
        placeholder="Share your thoughts..."
        onSuccess={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        autoFocus
      />
    </motion.div>
  );
}
