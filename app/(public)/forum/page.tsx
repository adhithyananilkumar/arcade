'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PostCard } from '@/features/forum/components/PostCard';
import { LoadingSkeleton } from '@/features/forum/components/LoadingSkeleton';
import { EmptyState } from '@/features/forum/components/EmptyState';
import { useForumFeed } from '@/features/forum/api/forum.queries';
import { useAuthStore } from '@/store/auth.store';
import { UserAvatar } from '@/features/forum/components/UserAvatar';
import { PostCreatorDialog } from '@/features/forum/components/PostCreatorDialog';

const FEED_TABS = [
  { key: 'latest', label: 'Latest' },
  { key: 'trending', label: 'Trending' },
  { key: 'top', label: 'Top' },
];

export default function ForumPage() {
  const [feedType, setFeedType] = useState('latest');
  const [page, setPage] = useState(0);
  const [showCreator, setShowCreator] = useState(false);
  const searchParams = useSearchParams();
  const { data, isLoading } = useForumFeed(feedType, page);
  const { user } = useAuthStore();

  useEffect(() => {
    if (searchParams.get('create') === 'true' && user) {
      setShowCreator(true);
    }
  }, [searchParams, user]);

  return (
    <div>
      {/* Post Creator Bar */}
      {user && (
        <div 
          onClick={() => setShowCreator(true)}
          style={{
            backgroundColor: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
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
          <UserAvatar username={user.username || user.email} avatarUrl={user.avatarUrl} size="md" />
          <div style={{ flex: 1, padding: '12px 16px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 14 }}>
            Start a discussion...
          </div>
          <button style={{ padding: '8px 24px', backgroundColor: 'var(--arcade-blue)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Post
          </button>
        </div>
      )}

      <PostCreatorDialog isOpen={showCreator} onClose={() => setShowCreator(false)} />

      {/* Forum Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <h1 style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--text-primary)',
        }}>
          Forum
        </h1>
        <button
          onClick={() => setShowCreator(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            height: 36,
            padding: '0 16px',
            backgroundColor: 'var(--arcade-blue)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Start a Discussion
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 20,
          borderBottom: '1px solid var(--border)',
          paddingBottom: 0,
        }}
      >
        {FEED_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setFeedType(tab.key); setPage(0); }}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: feedType === tab.key ? 700 : 500,
              color: feedType === tab.key ? 'var(--arcade-blue)' : 'var(--text-secondary)',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: feedType === tab.key ? '2px solid var(--arcade-blue)' : '2px solid transparent',
              marginBottom: -1,
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {isLoading ? (
        <LoadingSkeleton count={5} />
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Start the first discussion on Arcade Forum!"
          cta={{ label: 'Create a post', href: '/forum/new' }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.content.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              height: 34,
              padding: '0 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: '#fff',
              fontSize: 13,
              cursor: page === 0 ? 'not-allowed' : 'pointer',
              opacity: page === 0 ? 0.4 : 1,
            }}
          >
            Previous
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', padding: '0 8px', lineHeight: '34px' }}>
            {page + 1} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={data.last}
            style={{
              height: 34,
              padding: '0 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: '#fff',
              fontSize: 13,
              cursor: data.last ? 'not-allowed' : 'pointer',
              opacity: data.last ? 0.4 : 1,
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
