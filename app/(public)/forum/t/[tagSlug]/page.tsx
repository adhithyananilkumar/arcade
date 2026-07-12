'use client';

import { use, useState } from 'react';
import { ForumLayout } from '@/features/forum/components/ForumLayout';
import { PostCard } from '@/features/forum/components/PostCard';
import { LoadingSkeleton } from '@/features/forum/components/LoadingSkeleton';
import { EmptyState } from '@/features/forum/components/EmptyState';
import { usePostsByTag, useToggleFollowTag } from '@/features/forum/api/forum.queries';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

interface Props {
  params: Promise<{ tagSlug: string }>;
}

export default function TagPage({ params }: Props) {
  const { tagSlug } = use(params);
  const [page, setPage] = useState(0);
  const { data, isLoading } = usePostsByTag(tagSlug, page);
  const { status } = useAuthStore();
  const followTag = useToggleFollowTag();

  const handleFollow = () => {
    if (status !== 'authenticated') { toast.error('Sign in to follow tags'); return; }
    followTag.mutate(tagSlug);
  };

  return (
    <ForumLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            #{tagSlug}
          </h1>
          {data && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{data.totalElements} posts</p>
          )}
        </div>
        <button
          onClick={handleFollow}
          style={{
            height: 34,
            padding: '0 16px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--arcade-blue)',
            backgroundColor: 'var(--arcade-blue-light)',
            color: 'var(--arcade-blue)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Follow
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={5} />
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          title={`No posts tagged #${tagSlug}`}
          description="Be the first to use this tag!"
          cta={{ label: 'Create a post', href: '/forum/new' }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.content.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} style={{ height: 34, padding: '0 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: '#fff', fontSize: 13, cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1 }}>Previous</button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', padding: '0 8px', lineHeight: '34px' }}>{page + 1} / {data.totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={data.last} style={{ height: 34, padding: '0 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: '#fff', fontSize: 13, cursor: data.last ? 'not-allowed' : 'pointer', opacity: data.last ? 0.4 : 1 }}>Next</button>
        </div>
      )}
    </ForumLayout>
  );
}
