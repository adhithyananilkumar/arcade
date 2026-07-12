'use client';

import { useComments } from '../api/forum.queries';
import { CommentCard } from './CommentCard';
import { CommentForm } from './CommentForm';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';
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

      {/* Comment form */}
      <div style={{ marginBottom: 28 }}>
        <CommentForm postId={post.id} placeholder="Share your thoughts..." />
      </div>

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
