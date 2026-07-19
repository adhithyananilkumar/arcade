'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Reply, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { VoteButtons } from './VoteButtons';
import { ShareButton } from './ShareButton';
import { CommentForm } from './CommentForm';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { useAcceptAnswer } from '../api/forum.queries';
import { displayName, timeAgo } from '../utils/display';
import type { CommentResponse, PostDetailResponse } from '../types/forum.types';

interface Props {
  comment: CommentResponse;
  post: PostDetailResponse;
  depth?: number;
}

export function CommentCard({ comment, post, depth = 0 }: Props) {
  const [showReply, setShowReply] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const { user } = useAuthStore();
  const acceptAnswer = useAcceptAnswer();

  const isAuthor = user?.id === post.author.id;
  const isCommentOwner = user?.id === comment.author.id;
  const isAccepted = comment.isAcceptedAnswer;
  const isQuestion = post.postType === 'QUESTION';
  
  const isHtml = /<[a-z][\s\S]*>/i.test(comment.body);

  return (
    <div
      style={{
        display: 'flex',
        marginLeft: depth > 0 ? 28 : 0,
        marginTop: 16,
        ...(isAccepted ? {
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
        } : {})
      }}
    >
      {/* Vertical Thread Line */}
      <div 
        onClick={() => setCollapsed(!collapsed)}
        style={{
          width: 24,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <UserAvatar username={comment.author.username} avatarUrl={comment.author.avatarUrl} size="sm" />
        {!collapsed && (
          <div 
            style={{
              width: 2,
              flex: 1,
              backgroundColor: 'var(--border)',
              marginTop: 8,
              borderRadius: 1,
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--arcade-blue)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--border)')}
          />
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0, paddingLeft: 8 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {displayName(comment.author.username)}
          </span>
          {isAccepted && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 10,
              fontWeight: 700,
              color: '#16A34A',
              backgroundColor: '#DCFCE7',
              borderRadius: 'var(--radius-full)',
              padding: '1px 6px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              ✓ Best Answer
            </span>
          )}
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>·</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(comment.createdAt)}</span>
          {comment.editedAt && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>· edited</span>
          )}
          
          {collapsed && (
            <button 
              onClick={() => setCollapsed(false)}
              style={{ background: 'none', border: 'none', color: 'var(--arcade-blue)', fontSize: 12, cursor: 'pointer', padding: '0 4px', fontWeight: 600 }}
            >
              [+]
            </button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              {/* Body */}
              {isHtml ? (
                <div
                  className="post-html-content"
                  style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: 12 }}
                  dangerouslySetInnerHTML={{
                    __html: comment.body.replace(/<script[\s\S]*?<\/script>/gi, '')
                  }}
                />
              ) : (
                <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', marginBottom: 12 }}>
                  {comment.body}
                </div>
              )}

              {/* Action Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <VoteButtons
                  targetType="COMMENT"
                  targetId={comment.id}
                  upvotes={comment.upvotes}
                  downvotes={comment.downvotes}
                  userVote={comment.userVote}
                />

                {depth < 2 && (
                  <button
                    onClick={() => setShowReply(!showReply)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px', height: 32,
                      borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', backgroundColor: 'var(--surface)',
                      cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--text-muted)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
                  >
                    <Reply size={14} /> Reply
                  </button>
                )}

                <ShareButton url={`${typeof window !== 'undefined' ? window.location.origin : ''}/forum/${post.slug}#comment-${comment.id}`} />

                {isAuthor && isQuestion && !post.hasAcceptedAnswer && !isAccepted && (
                  <button
                    onClick={() => acceptAnswer.mutate({ postId: post.id, commentId: comment.id })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '0 12px', height: 32,
                      borderRadius: 'var(--radius-full)', border: '1px solid var(--success)', backgroundColor: '#ecfdf5',
                      cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--success)', marginLeft: 8
                    }}
                  >
                    <Check size={14} /> Accept Answer
                  </button>
                )}

                {isCommentOwner && (
                  <div style={{ position: 'relative', marginLeft: 'auto' }}>
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', height: 32,
                        borderRadius: 'var(--radius-full)', border: '1px solid transparent', background: 'transparent',
                        cursor: 'pointer', color: 'var(--text-muted)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
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
                            position: 'absolute', bottom: '100%', right: 0, marginBottom: 8, backgroundColor: '#fff',
                            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)',
                            zIndex: 10, padding: 4, minWidth: 120,
                          }}
                        >
                          <button
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 12px',
                              background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)', textAlign: 'left', borderRadius: 'var(--radius-sm)',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 12px',
                              background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--destructive)', textAlign: 'left', borderRadius: 'var(--radius-sm)',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Reply form */}
              <AnimatePresence>
                {showReply && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden', marginTop: 12 }}
                  >
                    <CommentForm
                      postId={comment.postId}
                      parentId={comment.id}
                      placeholder={`Reply to ${displayName(comment.author.username)}...`}
                      onSuccess={() => setShowReply(false)}
                      onCancel={() => setShowReply(false)}
                      compact
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Nested replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {comment.replies.map((reply) => (
                    <CommentCard key={reply.id} comment={reply} post={post} depth={depth + 1} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
