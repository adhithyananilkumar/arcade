'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { PostCard } from '@/features/forum/components/PostCard';
import { LoadingSkeleton } from '@/features/forum/components/LoadingSkeleton';
import { EmptyState } from '@/features/forum/components/EmptyState';
import { useSearchPosts } from '@/features/forum/api/forum.queries';
import { Search } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get('q') || '';
  const [q, setQ] = useState(initialQ);
  const [page, setPage] = useState(0);
  const { data, isLoading } = useSearchPosts(initialQ, page);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/forum/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 14 }}>
          Search Results
        </h1>
        <form onSubmit={handleSearch} style={{ position: 'relative', maxWidth: 500 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search posts..."
            style={{
              width: '100%',
              height: 40,
              paddingLeft: 36,
              paddingRight: 12,
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              fontSize: 14,
              color: 'var(--text-primary)',
              outline: 'none',
              backgroundColor: '#fff',
            }}
          />
        </form>
        {initialQ && data && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>
            {data.totalElements} results for &ldquo;{initialQ}&rdquo;
          </p>
        )}
      </div>

      {!initialQ ? (
        <EmptyState title="Start searching" description="Enter a query to find posts." />
      ) : isLoading ? (
        <LoadingSkeleton count={5} />
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          title="No results found"
          description={`No posts matching "${initialQ}". Try different keywords.`}
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
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div><LoadingSkeleton count={5} /></div>}>
      <SearchContent />
    </Suspense>
  );
}
