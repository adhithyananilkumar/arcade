'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { UserAvatar } from './UserAvatar';
import { RichTextEditor } from './RichTextEditor';
import { TagInput } from './TagInput';
import { 
  useCreatePost, 
  useUpdatePost, 
  useCategories 
} from '../api/forum.queries';
import type { PostType, PostDetailResponse } from '../types/forum.types';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editPost?: PostDetailResponse;
}

export function PostCreatorDialog({ isOpen, onClose, editPost }: Props) {
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [postType, setPostType] = useState<PostType>('DISCUSSION');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [tags, setTags] = useState<string[]>([]);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);
  const [pollExpiryDays, setPollExpiryDays] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  
  const categoriesQuery = useCategories();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  useEffect(() => {
    if (isOpen && editPost) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(editPost.title);
      setBody(editPost.body);
      setPostType(editPost.postType);
      setCategoryId(editPost.category?.id || '');
      setTags(editPost.tags.map(t => t.slug));
      if (editPost.poll) {
        setPollOptions(editPost.poll.options.map(o => o.optionText));
        setAllowMultipleAnswers(editPost.poll.allowMultipleAnswers);
      } else {
        setPollOptions(['', '']);
        setAllowMultipleAnswers(false);
      }
      setPollExpiryDays(0);
    } else if (isOpen && !editPost) {
      setTitle('');
      setBody('');
      setPostType('DISCUSSION');
      setCategoryId('');
      setTags([]);
      setPollOptions(['', '']);
      setAllowMultipleAnswers(false);
      setPollExpiryDays(0);
    }
  }, [isOpen, editPost]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleSubmit = () => {
    const isPoll = postType === 'POLL';
    const bodyPayload = isPoll ? `Poll: ${title}` : body;

    if (!title.trim() || !bodyPayload.trim() || !categoryId) return;

    if (isPoll) {
      const trimmedOptions = pollOptions.map(o => o.trim()).filter(Boolean);
      if (trimmedOptions.length < 2) {
        toast.error('Poll must have at most 12 and at least 2 options');
        return;
      }
      if (trimmedOptions.length > 12) {
        toast.error('Poll can have at most 12 options');
        return;
      }
      const uniqueOptions = new Set(trimmedOptions);
      if (uniqueOptions.size !== trimmedOptions.length) {
        toast.error('Duplicate poll options are not allowed');
        return;
      }
      if (pollOptions.some(o => !o.trim())) {
        toast.error('Poll option text cannot be empty');
        return;
      }

      createPost.mutate(
        {
          title: title.trim(),
          body: bodyPayload.trim(),
          postType,
          categoryId: Number(categoryId),
          tags,
          pollOptions: trimmedOptions,
          allowMultipleAnswers,
          pollExpiryDays: pollExpiryDays > 0 ? pollExpiryDays : undefined
        },
        { onSuccess: () => onClose() }
      );
      return;
    }

    if (editPost) {
      updatePost.mutate(
        { 
          postId: editPost.id, 
          payload: { title: title.trim(), body: body.trim(), categoryId: Number(categoryId), tags } 
        },
        { onSuccess: () => onClose() }
      );
    } else {
      createPost.mutate(
        { title: title.trim(), body: body.trim(), postType, categoryId: Number(categoryId), tags },
        { onSuccess: () => onClose() }
      );
    }
  };

  const isPending = editPost ? updatePost.isPending : createPost.isPending;

  if (!user || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 100,
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              width: 600,
              maxWidth: '95vw',
              maxHeight: '90vh',
              backgroundColor: '#fff',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <UserAvatar username={user.username || user.email} avatarUrl={user.avatarUrl} size="md" />
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                    {editPost ? 'Edit Post' : 'Create Post'}
                  </h3>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {user.username || user.firstName || user.email.split('@')[0]}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={postType === 'POLL' ? 'Ask a question...' : 'Add a title...'}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 16,
                }}
              />

              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border)',
                    outline: 'none',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--surface)',
                    cursor: 'pointer',
                  }}
                >
                  <option value="" disabled>Select Category</option>
                  {categoriesQuery.data?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value as PostType)}
                  disabled={!!editPost}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border)',
                    outline: 'none',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--surface)',
                    cursor: 'pointer',
                  }}
                >
                  <option value="DISCUSSION">Discussion</option>
                  <option value="QUESTION">Question</option>
                  <option value="BLOG">Blog</option>
                  <option value="SHOWCASE">Showcase</option>
                  <option value="POLL">Poll</option>
                </select>
              </div>

              {postType === 'POLL' ? (
                <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Poll Options</div>
                  {pollOptions.map((option, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="text"
                        value={option}
                        placeholder={`Option ${index + 1}`}
                        onChange={(e) => {
                          const newOptions = [...pollOptions];
                          newOptions[index] = e.target.value;
                          setPollOptions(newOptions);
                        }}
                        style={{
                          flex: 1,
                          height: 38,
                          padding: '0 12px',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 14,
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = pollOptions.filter((_, i) => i !== index);
                            setPollOptions(newOptions);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            fontSize: 14,
                            fontWeight: 600,
                            padding: 4,
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 12 && (
                    <button
                      type="button"
                      onClick={() => setPollOptions([...pollOptions, ''])}
                      style={{
                        alignSelf: 'flex-start',
                        padding: '6px 12px',
                        border: '1px dashed var(--border)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--surface)',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                      }}
                    >
                      + Add Option
                    </button>
                  )}

                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--text-primary)' }}>
                      <input
                        type="checkbox"
                        checked={allowMultipleAnswers}
                        onChange={(e) => setAllowMultipleAnswers(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      Allow multiple answers
                    </label>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Expiry:</span>
                      <select
                        value={pollExpiryDays}
                        onChange={(e) => setPollExpiryDays(Number(e.target.value))}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--surface)',
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <option value={0}>No expiry</option>
                        <option value={1}>1 day</option>
                        <option value={3}>3 days</option>
                        <option value={7}>7 days</option>
                        <option value={30}>30 days</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 16 }}>
                  <RichTextEditor value={body} onChange={setBody} minHeight={280} />
                </div>
              )}

              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Tags</div>
              <TagInput tags={tags} onChange={setTags} />
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '12px 20px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
              <button
                onClick={handleSubmit}
                disabled={
                  isPending || 
                  !title.trim() || 
                  (!editPost && postType === 'POLL' && pollOptions.some(o => !o.trim())) ||
                  (!editPost && postType === 'POLL' && pollOptions.length < 2) ||
                  (postType !== 'POLL' && !body.trim()) ||
                  !categoryId
                }
                style={{
                  padding: '8px 24px',
                  backgroundColor: 'var(--arcade-blue)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: (
                    isPending || 
                    !title.trim() || 
                    (!editPost && postType === 'POLL' && pollOptions.some(o => !o.trim())) ||
                    (!editPost && postType === 'POLL' && pollOptions.length < 2) ||
                    (postType !== 'POLL' && !body.trim()) ||
                    !categoryId
                  ) ? 'not-allowed' : 'pointer',
                  opacity: (
                    isPending || 
                    !title.trim() || 
                    (!editPost && postType === 'POLL' && pollOptions.some(o => !o.trim())) ||
                    (!editPost && postType === 'POLL' && pollOptions.length < 2) ||
                    (postType !== 'POLL' && !body.trim()) ||
                    !categoryId
                  ) ? 0.6 : 1,
                }}
              >
                {isPending ? 'Saving...' : editPost ? 'Save Changes' : 'Post'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
