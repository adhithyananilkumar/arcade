'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useCreateComment } from '../api/forum.queries';
import { toast } from 'sonner';

interface Props {
  postId: number;
  parentId?: number;
  placeholder?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

export function CommentForm({ postId, parentId, placeholder = 'Write a comment...', onSuccess, onCancel, compact }: Props) {
  const [body, setBody] = useState('');
  const { status } = useAuthStore();
  const createComment = useCreateComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'authenticated') {
      toast.error('Sign in to comment');
      return;
    }
    if (!body.trim()) return;
    createComment.mutate(
      { postId, payload: { body: body.trim(), parentId } },
      {
        onSuccess: () => {
          setBody('');
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={status !== 'authenticated' ? 'Sign in to comment' : placeholder}
        disabled={status !== 'authenticated'}
        rows={compact ? 3 : 4}
        style={{
          width: '100%',
          padding: '10px 14px',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          fontSize: 14,
          color: 'var(--text-primary)',
          resize: 'vertical',
          fontFamily: 'inherit',
          outline: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          backgroundColor: status !== 'authenticated' ? 'var(--surface)' : '#fff',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--arcade-blue)';
          e.currentTarget.style.boxShadow = 'var(--shadow-focus)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              height: 34,
              padding: '0 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!body.trim() || createComment.isPending}
          style={{
            height: 34,
            padding: '0 16px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: 'var(--arcade-blue)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: body.trim() ? 'pointer' : 'not-allowed',
            opacity: !body.trim() || createComment.isPending ? 0.6 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {createComment.isPending ? 'Posting...' : parentId ? 'Reply' : 'Comment'}
        </button>
      </div>
    </form>
  );
}
