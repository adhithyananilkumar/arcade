'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Bookmark, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { TagBadge } from './TagBadge';
import { PostTypeBadge } from './PostTypeBadge';
import { VoteButtons } from './VoteButtons';
import { ShareButton } from './ShareButton';
import { PollCard } from './PollCard';
import { useAuthStore } from '@/store/auth.store';
import { useDeletePost, useToggleBookmark } from '../api/forum.queries';
import { ForumService } from '../api/forum.service';
import { PostCreatorDialog } from './PostCreatorDialog';
import { toast } from 'sonner';
import type { PostSummaryResponse, PostDetailResponse } from '../types/forum.types';
import { stripHtml, extractFirstImage, timeAgo, displayName } from '../utils/display';

interface Props {
  post: PostSummaryResponse;
  index?: number;
}

export function PostCard({ post, index = 0 }: Props) {
  const router = useRouter();
  const { user } = useAuthStore();
  const deletePost = useDeletePost();
  const toggleBookmark = useToggleBookmark();
  
  const [showMenu, setShowMenu] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [fullPostForEdit, setFullPostForEdit] = useState<PostDetailResponse | undefined>(undefined);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    try {
      const fullPost = await ForumService.getPostBySlug(post.slug);
      setFullPostForEdit(fullPost);
      setShowEditDialog(true);
    } catch (err) {
      toast.error('Failed to load post details for editing');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      deletePost.mutate(post.id);
    }
  };

  const isOwner = user?.id === post.author.id;

  const bodyPreview = stripHtml(post.body || '').slice(0, 300);
  const firstImage = extractFirstImage(post.body || '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04 }}
    >
      <div
        onClick={() => router.push(`/forum/${post.slug}`)}
        className="forum-card"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-premium)',
          transition: 'all 0.3s var(--ease-premium)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.15)';
          e.currentTarget.style.boxShadow = 'var(--shadow-premium-hover)';
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.55)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--glass-border)';
          e.currentTarget.style.boxShadow = 'var(--shadow-premium)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.45)';
        }}
      >
        {/* Top Meta Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Link
            href={`/forum/user/${post.author.id}`}
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit' }}
          >
            <UserAvatar username={post.author.username} avatarUrl={post.author.avatarUrl} size="sm" />
            <span 
              className="hover:underline"
              style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}
            >
              {displayName(post.author.username)}
            </span>
          </Link>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>·</span>
          {post.category && (
            <>
              <span
                style={{ 
                  fontSize: 12, 
                  color: 'var(--arcade-blue)', 
                  fontWeight: 600,
                  backgroundColor: 'var(--arcade-blue-light)',
                  padding: '2px 8px',
                  borderRadius: 100,
                  transition: 'background-color 0.2s'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/forum/c/${post.category?.slug}`);
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(32, 92, 168, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--arcade-blue-light)')}
              >
                {post.category.name}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>·</span>
            </>
          )}
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(post.createdAt)}</span>
        </div>

        {/* Badges Row */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, alignItems: 'center' }}>
          <PostTypeBadge type={post.postType} />
          {post.hasAcceptedAnswer && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #86EFAC',
              borderRadius: 'var(--radius-full)',
              fontSize: 11,
              fontWeight: 600,
              color: '#16A34A',
            }}>
              ✓ Solved
            </span>
          )}
          {post.isPinned && (
            <span style={{ fontSize: 11, fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>
              Pinned
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: 17,
            fontWeight: 750,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            marginBottom: 8,
            letterSpacing: '-0.01em',
          }}
        >
          {post.title}
        </h3>

        {/* Body Preview */}
        {post.postType === 'POLL' ? (
          <div onClick={(e) => e.stopPropagation()} style={{ marginBottom: 12 }}>
            <PollCard
              postId={post.id}
              poll={post.poll || {
                id: post.id,
                allowMultipleAnswers: false,
                options: [],
                totalVotes: 0,
                userVoted: false,
                isExpired: false
              }}
            />
          </div>
        ) : (
          <>
            {bodyPreview.length > 10 && (
              <p style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                margin: '6px 0 12px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {bodyPreview}
              </p>
            )}

            {/* Image Preview */}
            {firstImage && (
              <div style={{
                marginBottom: 16,
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                maxHeight: 240,
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
              }}>
                <img 
                  src={firstImage} 
                  alt="Post preview" 
                  style={{
                    width: '100%',
                    height: 240,
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.3s var(--ease-premium)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.015)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
          </>
        )}

        {/* Tags Row */}
        {post.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {post.tags.slice(0, 4).map((tag) => (
              <span key={tag.id} onClick={(e) => e.stopPropagation()}>
                <TagBadge slug={tag.slug} name={tag.name} />
              </span>
            ))}
          </div>
        )}

        {/* Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
          <VoteButtons
            targetType="POST"
            targetId={post.id}
            upvotes={post.upvotes}
            downvotes={post.downvotes}
            userVote={post.userVote}
          />

          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/forum/${post.slug}`); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '0 14px',
              height: 32,
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(0,0,0,0.06)',
              backgroundColor: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 550,
              color: 'var(--text-secondary)',
              transition: 'all 0.2s var(--ease-premium)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)';
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <MessageCircle size={14} style={{ opacity: 0.8 }} /> {post.commentCount} {post.commentCount === 1 ? 'reply' : 'replies'}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (user) toggleBookmark.mutate(post.id);
              else toast.error('Sign in to bookmark');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              height: 32,
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(0,0,0,0.06)',
              backgroundColor: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              color: post.isBookmarked ? 'var(--arcade-blue)' : 'var(--text-muted)',
              transition: 'all 0.2s var(--ease-premium)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)';
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
            }}
          >
            <Bookmark size={14} fill={post.isBookmarked ? 'currentColor' : 'none'} style={{ opacity: 0.8 }} />
          </button>

          <div onClick={(e) => e.stopPropagation()}>
            <ShareButton
              url={`${typeof window !== 'undefined' ? window.location.origin : ''}/forum/${post.slug}`}
              title="Share Post"
              postId={post.id}
            />
          </div>

          {isOwner && (
            <div ref={menuRef} style={{ position: 'relative', marginLeft: 'auto' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 10px',
                  height: 32,
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  transition: 'all 0.2s var(--ease-premium)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <MoreHorizontal size={16} />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.1 }}
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      right: 0,
                      marginBottom: 8,
                      backgroundColor: '#fff',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: 'var(--shadow-md)',
                      zIndex: 10,
                      padding: 4,
                      minWidth: 120,
                    }}
                  >
                    <button
                      onClick={handleEditClick}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 12px',
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)',
                        textAlign: 'left', borderRadius: 'var(--radius-sm)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Edit2 size={14} /> Edit Post
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 12px',
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--destructive)',
                        textAlign: 'left', borderRadius: 'var(--radius-sm)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Trash2 size={14} /> Delete Post
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      
      <PostCreatorDialog 
        isOpen={showEditDialog} 
        onClose={() => {
          setShowEditDialog(false);
          setFullPostForEdit(undefined);
        }} 
        editPost={fullPostForEdit} 
      />
    </motion.div>
  );
}
