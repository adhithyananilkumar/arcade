'use client';

import { use, useState, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PostCard } from '@/features/forum/components/PostCard';
import { LoadingSkeleton } from '@/features/forum/components/LoadingSkeleton';
import { EmptyState } from '@/features/forum/components/EmptyState';
import { useReputation, usePostsByAuthor } from '@/features/forum/api/forum.queries';
import { UserService } from '@/services/user.service';
import { UserAvatar } from '@/features/forum/components/UserAvatar';
import { displayName } from '@/features/forum/utils/display';
import { Calendar, Shield, Award, Mail, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  params: Promise<{ id: string }>;
}

function UserProfileContent({ params }: Props) {
  const { id } = use(params);
  const [page, setPage] = useState(0);

  // Fetch public user profile
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useQuery({
    queryKey: ['user', id],
    queryFn: () => UserService.getProfile(id),
    enabled: !!id,
  });

  // Fetch reputation
  const { data: reputationData } = useReputation(id);

  // Fetch posts by this author
  const { data: postsData, isLoading: isPostsLoading } = usePostsByAuthor(id, page);

  if (isProfileLoading) {
    return <LoadingSkeleton count={3} />;
  }

  if (profileError || !profile) {
    return (
      <EmptyState
        title="User not found"
        description="The requested user profile does not exist or has been deleted."
      />
    );
  }

  const userJoinedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently';

  const userRole = profile.roles?.[0]?.name?.replace('ROLE_', '') || 'MEMBER';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 16 }}>
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          backgroundColor: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 24px',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <UserAvatar username={profile.email} avatarUrl={profile.avatarUrl} size="xl" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              {profile.fullName || displayName(profile.email)}
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--arcade-blue)',
                backgroundColor: 'rgba(0, 86, 179, 0.08)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {userRole}
              </span>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={14} /> {profile.email}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                <Calendar size={15} />
                <span>Joined {userJoinedDate}</span>
              </div>
              {reputationData !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                  <Award size={15} style={{ color: '#EAB308' }} />
                  <span><strong>{reputationData.totalPoints || 0}</strong> Reputation ({reputationData.badge})</span>
                </div>
              )}
              {postsData && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                  <BookOpen size={15} />
                  <span><strong>{postsData.totalElements || 0}</strong> Posts published</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* User's Posts Feed */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
          Posts by {profile.fullName || displayName(profile.email)}
        </h2>

        {isPostsLoading ? (
          <LoadingSkeleton count={3} />
        ) : !postsData || postsData.content.length === 0 ? (
          <EmptyState
            title="No posts yet"
            description="This user has not published any posts in the community."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {postsData.content.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}

            {postsData.totalPages > 1 && (
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
                  {page + 1} / {postsData.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={postsData.last}
                  style={{
                    height: 34,
                    padding: '0 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    backgroundColor: '#fff',
                    fontSize: 13,
                    cursor: postsData.last ? 'not-allowed' : 'pointer',
                    opacity: postsData.last ? 0.4 : 1,
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserProfilePage({ params }: Props) {
  return (
    <Suspense fallback={<LoadingSkeleton count={3} />}>
      <UserProfileContent params={params} />
    </Suspense>
  );
}
