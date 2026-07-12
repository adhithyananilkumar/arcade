'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ForumLayout } from '@/features/forum/components/ForumLayout';
import { useAuthStore } from '@/store/auth.store';
import { useCreatePost, useCategories } from '@/features/forum/api/forum.queries';
import type { PostType } from '@/features/forum/types/forum.types';
import { X, Loader2 } from 'lucide-react';
import { ForumEditor } from '@/features/forum/components/ForumEditor';

const POST_TYPES: { type: PostType; label: string; desc: string }[] = [
  { type: 'DISCUSSION', label: 'Discussion', desc: 'Open conversation' },
  { type: 'QUESTION', label: 'Question', desc: 'Looking for answers' },
  { type: 'BLOG', label: 'Blog', desc: 'Share knowledge' },
  { type: 'SHOWCASE', label: 'Showcase', desc: 'Show your work' },
];

export default function NewPostPage() {
  const router = useRouter();
  const { status } = useAuthStore();
  const { data: categories } = useCategories();
  const createPost = useCreatePost();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [postType, setPostType] = useState<PostType>('DISCUSSION');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router, mounted]);

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags([...tags, tag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !categoryId) return;
    createPost.mutate(
      { title: title.trim(), body: body.trim(), postType, categoryId: Number(categoryId), tags },
      { onSuccess: (post) => router.push(`/forum/${post.slug}`) }
    );
  };

  if (!mounted || status === 'loading') {
    return (
      <ForumLayout hideTrendingSidebar>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <Loader2 size={32} className="animate-spin" color="var(--arcade-blue)" />
        </div>
      </ForumLayout>
    );
  }
  
  if (status === 'unauthenticated') return null;

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    fontSize: 14,
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
    outline: 'none',
    backgroundColor: '#fff',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  return (
    <ForumLayout hideTrendingSidebar>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            New Post
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Share knowledge, ask questions, or start a discussion with the community.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Post type */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
              Post Type
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {POST_TYPES.map((pt) => (
                <button
                  key={pt.type}
                  type="button"
                  onClick={() => setPostType(pt.type)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: postType === pt.type ? '2px solid var(--arcade-blue)' : '1px solid var(--border)',
                    backgroundColor: postType === pt.type ? 'var(--arcade-blue-light)' : '#fff',
                    color: postType === pt.type ? 'var(--arcade-blue)' : 'var(--text-secondary)',
                    fontSize: 13,
                    fontWeight: postType === pt.type ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Title <span style={{ color: 'var(--destructive)' }}>*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={200}
              required
              style={{ ...inputStyle, height: 44, fontSize: 15 }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--arcade-blue)'; e.currentTarget.style.boxShadow = 'var(--shadow-focus)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Category */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Category <span style={{ color: 'var(--destructive)' }}>*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
              required
              style={{ ...inputStyle, height: 40, cursor: 'pointer' }}
            >
              <option value="">Select a category…</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Body */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Body <span style={{ color: 'var(--destructive)' }}>*</span>
            </label>
            <ForumEditor value={body} onChange={setBody} />
          </div>

          {/* Tags */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Tags <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(up to 5)</span>
            </label>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fff',
                alignItems: 'center',
                minHeight: 44,
              }}
            >
              {tags.map((t) => (
                <span
                  key={t}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: 'var(--arcade-blue-light)',
                    color: 'var(--arcade-blue)',
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 'var(--radius-full)',
                    padding: '3px 10px',
                  }}
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
              {tags.length < 5 && (
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder={tags.length === 0 ? 'Add tags (press Enter)' : ''}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: 13,
                    flex: 1,
                    minWidth: 120,
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    backgroundColor: 'transparent',
                  }}
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                height: 40,
                padding: '0 20px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: '#fff',
                color: 'var(--text-secondary)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPost.isPending || !title.trim() || !body.trim() || !categoryId}
              style={{
                height: 40,
                padding: '0 24px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: 'var(--arcade-blue)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                opacity: createPost.isPending || !title.trim() || !body.trim() || !categoryId ? 0.6 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {createPost.isPending ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </ForumLayout>
  );
}
