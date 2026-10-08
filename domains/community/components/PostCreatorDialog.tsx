'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
            className="fixed inset-0 z-[100] arcade-modal-backdrop"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 w-[600px] max-w-[95vw] max-h-[90vh] bg-surface arcade-modal-box rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 shadow-2xl z-[101] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/70 bg-slate-50/50 dark:bg-slate-900/40">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <UserAvatar username={user.username || user.email} avatarUrl={user.avatarUrl} size="md" />
                <div>
                  <h3 className="text-base font-bold text-ink leading-tight">
                    {editPost ? 'Edit Post' : 'Create Post'}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {user.username || user.firstName || user.email.split('@')[0]}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-tl-lg rounded-br-lg rounded-tr-xs rounded-bl-xs p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink transition-colors cursor-pointer dark:hover:bg-slate-800"
              >
                <X size={18} />
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
            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200/70 bg-slate-50/50 dark:bg-slate-900/40">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending || !title.trim() || !body.trim() || !categoryId}
                className="rounded-xl bg-ink px-6 py-2.5 text-sm font-semibold text-on-ink shadow-sm transition-all hover:bg-ink-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
