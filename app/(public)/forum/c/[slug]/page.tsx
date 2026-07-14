'use client';

import { use, useState } from 'react';
import { PostCard } from '@/features/forum/components/PostCard';
import { LoadingSkeleton } from '@/features/forum/components/LoadingSkeleton';
import { EmptyState } from '@/features/forum/components/EmptyState';
import { usePostsByCategory, useCategoryBySlug } from '@/features/forum/api/forum.queries';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: Props) {
  const { slug } = use(params);
  const [page, setPage] = useState(0);
  const { data: category } = useCategoryBySlug(slug);
  const { data, isLoading } = usePostsByCategory(slug, page);

  return (
    <div>
      {/* Category header */}
      <div style={{ marginBottom: 40, marginTop: 16 }}>
        <h1 style={{ 
          fontSize: 'clamp(32px, 5vw, 44px)', 
          fontWeight: 650, 
          color: '#0a0a0a', 
          letterSpacing: '-0.03em', 
          marginBottom: 12,
          fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
          lineHeight: 1.1
        }}>
          {category?.name || slug}
        </h1>
        {category?.description && (
          <p style={{ fontSize: 16, color: '#777', lineHeight: 1.6, maxWidth: 600 }}>{category.description}</p>
        )}
      </div>

      {isLoading ? (
        <LoadingSkeleton count={5} />
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          title="No posts in this category"
          description="Be the first to post here!"
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
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{ height: 34, padding: '0 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: '#fff', fontSize: 13, cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1 }}
          >
            Previous
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', padding: '0 8px', lineHeight: '34px' }}>
            {page + 1} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={data.last}
            style={{ height: 34, padding: '0 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: '#fff', fontSize: 13, cursor: data.last ? 'not-allowed' : 'pointer', opacity: data.last ? 0.4 : 1 }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
