'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useForumLayout } from '@/features/forum/components/ForumLayoutContext';
import { CommentThread } from '@/features/forum/components/CommentThread';
import { VoteButtons } from '@/features/forum/components/VoteButtons';
import { TagBadge } from '@/features/forum/components/TagBadge';
import { PostTypeBadge } from '@/features/forum/components/PostTypeBadge';
import { UserAvatar } from '@/features/forum/components/UserAvatar';
import { ShareButton } from '@/features/forum/components/ShareButton';
import { usePost } from '@/features/forum/api/forum.queries';
import { useWebSocket } from '@/features/forum/hooks/useWebSocket';
import { useToggleBookmark } from '@/features/forum/api/forum.queries';
import { useAuthStore } from '@/store/auth.store';
import { Bookmark, Check, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { timeAgo, displayName } from '@/features/forum/utils/display';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function PostDetailPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: post, isLoading, isError } = usePost(slug);
  const toggleBookmark = useToggleBookmark();
  const { status } = useAuthStore();
  const { subscribe, clientRef } = useWebSocket();
  const [liveCommentCount, setLiveCommentCount] = useState<number | undefined>(undefined);
  const { setHideTrending } = useForumLayout();

  useEffect(() => {
    setHideTrending(true);
    return () => setHideTrending(false);
  }, [setHideTrending]);

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

  // Scroll to comment anchor from shared links (e.g. #comment-42)
  useEffect(() => {
    if (!post) return;
    const hash = window.location.hash;
    if (!hash.startsWith('#comment-')) return;
    // Wait for comments to render, then scroll
    const timer = setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Briefly highlight the targeted comment
        (el as HTMLElement).style.transition = 'box-shadow 0.3s, outline 0.3s';
        (el as HTMLElement).style.outline = '2px solid var(--arcade-blue)';
        (el as HTMLElement).style.borderRadius = '8px';
        setTimeout(() => {
          (el as HTMLElement).style.outline = 'none';
        }, 2200);
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [post]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--arcade-blue)' }} />
      </div>
    );
  }

  if (isError || !post) {
    notFound();
  }

  const isHtml = /<[a-z][\s\S]*>/i.test(post.body);

  return (
    <div>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          style={{ 
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, 
            color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', 
            marginBottom: 20, padding: 0 
          }}
        >
          <ArrowLeft size={16} /> Back to Forum
        </button>

        {/* Post card header */}
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '32px',
            marginBottom: 20,
          }}
        >
          {/* Badges */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <PostTypeBadge type={post.postType} />
            {post.category && (
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--arcade-blue)',
                  fontWeight: 600,
                  padding: '2px 10px',
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
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
              marginBottom: 16,
            }}
          >
            {post.title}
          </h1>

          {/* Author + meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <Link href={`/forum/user/${post.author.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <UserAvatar username={post.author.username} avatarUrl={post.author.avatarUrl} size="md" />
            </Link>
            <div>
              <Link href={`/forum/user/${post.author.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="hover:underline" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {displayName(post.author.username)}
                </span>
              </Link>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {timeAgo(post.createdAt)} · {post.viewCount} {post.viewCount === 1 ? 'view' : 'views'}
                {post.editedAt && ' · edited'}
              </div>
            </div>
          </div>
          
          <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '0 -32px 24px -32px' }} />

          {/* Body */}
          <div style={{ marginBottom: 32 }}>
            {isHtml ? (
              <div
                className="post-html-content"
                style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--text-primary)' }}
                dangerouslySetInnerHTML={{
                  __html: post.body.replace(/<script[\s\S]*?<\/script>/gi, '')
                }}
              />
            ) : (
              <div style={{
                fontSize: 16,
                lineHeight: 1.75,
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
              }}>
                {post.body}
              </div>
            )}
          </div>
          
          <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '0 -32px 24px -32px' }} />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24, alignItems: 'center' }}>
              {post.tags.map((tag) => (
                <TagBadge key={tag.id} slug={tag.slug} name={tag.name} />
              ))}
              {post.hasAcceptedAnswer && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #86EFAC',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#16A34A',
                  marginLeft: 8,
                }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="6" fill="#16A34A"/>
                    <path d="M3.5 6L5.5 8L8.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Solved
                </div>
              )}
            </div>
          )}

          {/* Actions row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <VoteButtons
              targetType="POST"
              targetId={post.id}
              upvotes={post.upvotes}
              downvotes={post.downvotes}
              userVote={post.userVote}
            />
            
            <button
              onClick={() => {
                if (status !== 'authenticated') { toast.error('Sign in to bookmark'); return; }
                toggleBookmark.mutate(post.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '0 12px',
                height: 32,
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                color: post.isBookmarked ? 'var(--arcade-blue)' : 'var(--text-muted)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
            >
              <Bookmark size={14} fill={post.isBookmarked ? 'currentColor' : 'none'} />
              {post.isBookmarked ? 'Saved' : 'Save'}
            </button>
            <ShareButton 
              url={`${typeof window !== 'undefined' ? window.location.origin : ''}/forum/${post.slug}`} 
              title="Share Post"
              postId={post.id}
            />
          </div>
        </div>

        {/* Comments */}
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '32px',
          }}
        >
          <CommentThread post={post} liveCommentCount={liveCommentCount} />
        </div>
      </div>
    </div>
  );
}
