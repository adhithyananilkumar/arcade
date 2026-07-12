'use client';

import { use, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ForumLayout } from '@/features/forum/components/ForumLayout';
import { CommentThread } from '@/features/forum/components/CommentThread';
import { VoteButtons } from '@/features/forum/components/VoteButtons';
import { TagBadge } from '@/features/forum/components/TagBadge';
import { PostTypeBadge } from '@/features/forum/components/PostTypeBadge';
import { UserAvatar } from '@/features/forum/components/UserAvatar';
import { usePost } from '@/features/forum/api/forum.queries';
import { useWebSocket } from '@/features/forum/hooks/useWebSocket';
import { useToggleBookmark } from '@/features/forum/api/forum.queries';
import { useAuthStore } from '@/store/auth.store';
import { Bookmark, Share2, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  params: Promise<{ slug: string }>;
}

export default function PostDetailPage({ params }: Props) {
  const { slug } = use(params);
  const { data: post, isLoading, isError } = usePost(slug);
  const toggleBookmark = useToggleBookmark();
  const { status } = useAuthStore();
  const { subscribe, clientRef } = useWebSocket();
  const [liveCommentCount, setLiveCommentCount] = useState<number | undefined>(undefined);

  // Subscribe to live comment count updates
  useEffect(() => {
    if (!post) return;
    const interval = setInterval(() => {
      if (clientRef.current?.connected) {
        clearInterval(interval);
        const unsub = subscribe(`/topic/posts/${post.id}/comment-count`, (body: unknown) => {
          const data = body as { postId: number; commentCount: number };
          if (data.postId === post.id) setLiveCommentCount(data.commentCount);
        });
        return () => unsub();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [post, subscribe, clientRef]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  if (isLoading) {
    return (
      <ForumLayout hideTrendingSidebar>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--arcade-blue)' }} />
        </div>
      </ForumLayout>
    );
  }

  if (isError || !post) {
    notFound();
  }

  return (
    <ForumLayout hideTrendingSidebar>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Post card header */}
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px 28px',
            marginBottom: 20,
          }}
        >
          {/* Badges */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <PostTypeBadge type={post.postType} />
            {post.category && (
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--arcade-blue)',
                  fontWeight: 500,
                  padding: '2px 8px',
                  backgroundColor: 'var(--arcade-blue-light)',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {post.category.name}
              </span>
            )}
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
              marginBottom: 14,
            }}
          >
            {post.title}
          </h1>

          {/* Author + meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <UserAvatar username={post.author.username} avatarUrl={post.author.avatarUrl} size="md" />
            <div>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                {post.author.username}
              </span>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                {timeAgo(post.createdAt)}
                {post.editedAt && ' · edited'}
              </div>
            </div>
          </div>

          {/* Body */}
          <div data-color-mode="light" style={{ marginBottom: 20 }}>
            <MarkdownPreview
              source={post.body}
              style={{
                backgroundColor: 'transparent',
                fontSize: 15,
                lineHeight: 1.75,
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
              {post.tags.map((tag) => (
                <TagBadge key={tag.id} slug={tag.slug} name={tag.name} />
              ))}
            </div>
          )}

          {/* Actions row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              paddingTop: 16,
              borderTop: '1px solid var(--border)',
            }}
          >
            <VoteButtons
              targetType="POST"
              targetId={post.id}
              upvotes={post.upvotes}
              downvotes={post.downvotes}
              userVote={post.userVote}
              orientation="horizontal"
            />
            <button
              onClick={() => {
                if (status !== 'authenticated') { toast.error('Sign in to bookmark'); return; }
                toggleBookmark.mutate(post.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 500,
                color: post.isBookmarked ? 'var(--arcade-blue)' : 'var(--text-muted)',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
              }}
            >
              <Bookmark size={15} fill={post.isBookmarked ? 'currentColor' : 'none'} />
              {post.isBookmarked ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={handleShare}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-muted)',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
              }}
            >
              <Share2 size={15} />
              Share
            </button>
          </div>
        </div>

        {/* Accepted answer banner */}
        {post.hasAcceptedAnswer && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20,
              fontSize: 13,
              color: 'var(--success)',
              fontWeight: 600,
            }}
          >
            <Check size={15} />
            This question has an accepted answer
          </div>
        )}

        {/* Comments */}
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px 28px',
          }}
        >
          <CommentThread post={post} liveCommentCount={liveCommentCount} />
        </div>
      </div>
    </ForumLayout>
  );
}
