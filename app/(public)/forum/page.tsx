'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
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

function ForumPageContent() {
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
      {/* Forum Hero Section */}
      <div style={{
        marginBottom: 40,
        textAlign: 'left',
        position: 'relative',
        padding: '12px 4px',
      }}>
        <h1 style={{
          fontSize: 'clamp(28px, 4vw, 38px)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          marginBottom: 8,
        }}>
          Welcome to the{' '}
          <span style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Arcade Community
          </span>
        </h1>
        <p style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          fontWeight: 450,
          lineHeight: 1.5,
          maxWidth: 480,
          marginBottom: 20,
        }}>
          Discover ideas, ask questions, and share knowledge with other developers.
        </p>
        
        {/* Start discussion CTA */}
        <button
          onClick={() => setShowCreator(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 40,
            padding: '0 24px',
            background: '#111111',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.25s var(--ease-premium)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#222';
            e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#111111';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
        >
          <span>+ Start a Discussion</span>
        </button>
      </div>

      {/* Post Creator Bar */}
      {user && (
        <div 
          onClick={() => setShowCreator(true)}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.45)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-premium)',
            padding: '20px 24px',
            marginBottom: 36,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            cursor: 'pointer',
            transition: 'all 0.3s var(--ease-premium)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
            e.currentTarget.style.boxShadow = 'var(--shadow-premium-hover)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--glass-border)';
            e.currentTarget.style.boxShadow = 'var(--shadow-premium)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <UserAvatar username={user.username || user.email} avatarUrl={user.avatarUrl} size="md" />
          <div style={{ 
            flex: 1, 
            padding: '12px 20px', 
            backgroundColor: 'rgba(255, 255, 255, 0.5)', 
            borderRadius: 'var(--radius-full)', 
            border: '1px solid rgba(0,0,0,0.06)', 
            color: 'var(--text-muted)', 
            fontSize: 13,
            fontWeight: 500,
            transition: 'all 0.2s var(--ease-premium)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
          }}
          >
            Start a discussion...
          </div>
          <button 
            style={{ 
              padding: '10px 26px', 
              background: 'var(--btn-gradient-indigo)', 
              boxShadow: '0 4px 12px rgba(99,102,241,0.2)',
              color: '#fff', 
              border: 'none', 
              borderRadius: 'var(--radius-full)', 
              fontSize: 13, 
              fontWeight: 600, 
              cursor: 'pointer',
              transition: 'all 0.25s var(--ease-premium)'
            }}
            onMouseEnter={(e) => {
              e.stopPropagation();
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.2)';
            }}
          >
            Post
          </button>
        </div>
      )}

      <PostCreatorDialog isOpen={showCreator} onClose={() => setShowCreator(false)} />

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          marginBottom: 32,
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          paddingBottom: 0,
          position: 'relative',
        }}
      >
        {FEED_TABS.map((tab) => {
          const isSelected = feedType === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => { setFeedType(tab.key); setPage(0); }}
              style={{
                padding: '12px 20px',
                fontSize: 13,
                fontWeight: isSelected ? 650 : 500,
                color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                marginBottom: -1,
                transition: 'color 0.25s var(--ease-premium)',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {tab.label}
              {isSelected && (
                <motion.div
                  layoutId="activeTabUnderline"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 12,
                    right: 12,
                    height: 2,
                    backgroundColor: '#6366f1',
                    borderRadius: 100,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Posts */}
      {isLoading ? (
        <LoadingSkeleton count={3} />
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Start the first discussion on Arcade Forum!"
          cta={{ label: 'Create a post', href: '/forum/new' }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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

export default function ForumPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ForumPageContent />
    </Suspense>
  );
}
