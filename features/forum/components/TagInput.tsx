'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: Props) {
  const [tagInput, setTagInput] = useState('');

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (tag && !tags.includes(tag) && tags.length < 5) {
        onChange([...tags, tag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (t: string) => {
    onChange(tags.filter((x) => x !== t));
  };

  return (
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
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: 'inherit', 
              padding: 0, 
              display: 'flex' 
            }}
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
  );
}
