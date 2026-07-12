'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Check, Reply } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { VoteButtons } from './VoteButtons';
import { CommentForm } from './CommentForm';
import { useAuthStore } from '@/store/auth.store';
import { useAcceptAnswer } from '../api/forum.queries';
import type { CommentResponse, PostDetailResponse } from '../types/forum.types';

const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview'), { ssr: false });

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  comment: CommentResponse;
  post: PostDetailResponse;
  depth?: number;
}

export function CommentCard({ comment, post, depth = 0 }: Props) {
  const [showReply, setShowReply] = useState(false);
  const { user } = useAuthStore();
  const acceptAnswer = useAcceptAnswer();

  const isAuthor = user?.id === post.author.id;
  const isAccepted = comment.isAcceptedAnswer;
  const isQuestion = post.postType === 'QUESTION';

  return (
    <div
      style={{
        borderLeft: isAccepted
          ? '3px solid var(--success)'
          : depth > 0
          ? '2px solid var(--border)'
          : 'none',
        paddingLeft: depth > 0 ? 16 : 0,
        marginLeft: depth > 0 ? 8 : 0,
      }}
    >
      {isAccepted && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--success)',
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <Check size={12} />
          Accepted Answer
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        {/* Votes */}
        <div style={{ flexShrink: 0 }}>
          <VoteButtons
            targetType="COMMENT"
            targetId={comment.id}
            upvotes={comment.upvotes}
            downvotes={comment.downvotes}
            userVote={comment.userVote}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Author row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <UserAvatar username={comment.author.username} avatarUrl={comment.author.avatarUrl} size="sm" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {comment.author.username}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(comment.createdAt)}</span>
            {comment.editedAt && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>edited</span>
            )}
          </div>

          {/* Body */}
          <div data-color-mode="light" style={{ marginBottom: 10 }}>
            <MarkdownPreview
              source={comment.body}
              style={{
                backgroundColor: 'transparent',
                fontSize: 14,
                lineHeight: 1.65,
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {depth < 2 && (
              <button
                onClick={() => setShowReply(!showReply)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '2px 0',
                }}
              >
                <Reply size={13} />
                Reply
              </button>
            )}
            {isAuthor && isQuestion && !post.hasAcceptedAnswer && !isAccepted && (
              <button
                onClick={() =>
                  acceptAnswer.mutate({ postId: post.id, commentId: comment.id })
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--success)',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                <Check size={13} />
                Accept Answer
              </button>
            )}
          </div>

          {/* Reply form */}
          <AnimatePresence>
            {showReply && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden', marginTop: 12 }}
              >
                <CommentForm
                  postId={comment.postId}
                  parentId={comment.id}
                  placeholder={`Reply to ${comment.author.username}...`}
                  onSuccess={() => setShowReply(false)}
                  onCancel={() => setShowReply(false)}
                  compact
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {comment.replies.map((reply) => (
            <CommentCard key={reply.id} comment={reply} post={post} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
