'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle, Eye, Bookmark, Clock } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { TagBadge } from './TagBadge';
import { PostTypeBadge } from './PostTypeBadge';
import { VoteButtons } from './VoteButtons';
import type { PostSummaryResponse } from '../types/forum.types';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props {
  post: PostSummaryResponse;
  index?: number;
}

export function PostCard({ post, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04 }}
    >
      <Link href={`/forum/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          className="forum-card"
          style={{
            backgroundColor: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            gap: 14,
            cursor: 'pointer',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-strong)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-xs)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
          }}
        >
          {/* Vote column */}
          <div style={{ flexShrink: 0, paddingTop: 2 }}>
            <VoteButtons
              targetType="POST"
              targetId={post.id}
              upvotes={post.upvotes}
              downvotes={post.downvotes}
              userVote={post.userVote}
            />
          </div>

          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Meta row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
                flexWrap: 'wrap',
              }}
            >
              <UserAvatar
                username={post.author.username}
                avatarUrl={post.author.avatarUrl}
                size="sm"
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                {post.author.username}
              </span>
              {post.category && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  in{' '}
                  <Link
                    href={`/forum/c/${post.category.slug}`}
                    style={{ color: 'var(--arcade-blue)', textDecoration: 'none', fontWeight: 500 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {post.category.name}
                  </Link>
                </span>
              )}
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} />
                {timeAgo(post.createdAt)}
              </span>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <PostTypeBadge type={post.postType} />
              {post.isPinned && (
                <span style={{ fontSize: 11, fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>
                  Pinned
                </span>
              )}
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--text-primary)',
                lineHeight: 1.4,
                marginBottom: 6,
                letterSpacing: '-0.01em',
              }}
            >
              {post.title}
            </h3>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {post.tags.slice(0, 4).map((tag) => (
                  <span key={tag.id} onClick={(e) => e.stopPropagation()}>
                    <TagBadge slug={tag.slug} name={tag.name} />
                  </span>
                ))}
              </div>
            )}

            {/* Footer stats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  color: 'var(--text-muted)',
                }}
              >
                <MessageCircle size={13} />
                {post.commentCount} {post.commentCount === 1 ? 'reply' : 'replies'}
              </span>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  color: 'var(--text-muted)',
                }}
              >
                <Eye size={13} />
                {post.viewCount}
              </span>
              {post.isBookmarked && (
                <span style={{ marginLeft: 'auto', color: 'var(--arcade-blue)' }}>
                  <Bookmark size={13} fill="currentColor" />
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
