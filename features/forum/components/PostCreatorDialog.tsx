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
  const [mounted, setMounted] = useState(false);
  
  const categoriesQuery = useCategories();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  useEffect(() => {
    if (isOpen && editPost) {
      setTitle(editPost.title);
      setBody(editPost.body);
      setPostType(editPost.postType);
      setCategoryId(editPost.category?.id || '');
      setTags(editPost.tags.map(t => t.slug));
    } else if (isOpen && !editPost) {
      setTitle('');
      setBody('');
      setPostType('DISCUSSION');
      setCategoryId('');
      setTags([]);
    }
  }, [isOpen, editPost]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = () => {
    if (!title.trim() || !body.trim() || !categoryId) return;
    
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
                placeholder="Add a title..."
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
                </select>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 16 }}>
                <RichTextEditor value={body} onChange={setBody} minHeight={280} />
              </div>

              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Tags</div>
              <TagInput tags={tags} onChange={setTags} />
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '12px 20px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
              <button
                onClick={handleSubmit}
                disabled={isPending || !title.trim() || !body.trim() || !categoryId}
                style={{
                  padding: '8px 24px',
                  backgroundColor: 'var(--arcade-blue)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: (isPending || !title.trim() || !body.trim() || !categoryId) ? 'not-allowed' : 'pointer',
                  opacity: (isPending || !title.trim() || !body.trim() || !categoryId) ? 0.6 : 1,
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
