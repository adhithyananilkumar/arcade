'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });
import * as commands from '@uiw/react-md-editor/commands';

interface ForumEditorProps {
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
}

export function ForumEditor({ value, onChange, minHeight = 300 }: ForumEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      await handleImageUpload(file);
    }
  }, [value, onChange]);

  const handleImageUpload = async (
    file: File,
    api?: { replaceSelection: (text: string) => void }
  ) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        const imageMarkdown = `![${file.name}](${base64})`;
        if (api) {
          api.replaceSelection(imageMarkdown);
        } else {
          onChange(value + '\n' + imageMarkdown + '\n');
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
        setIsUploading(false);
      };
    } catch (error) {
      console.error('Image upload failed', error);
      toast.error('Failed to upload image');
      setIsUploading(false);
    }
  };

  const imageUploadCommand = {
    name: 'image-upload',
    keyCommand: 'image-upload',
    buttonProps: { 'aria-label': 'Upload image' },
    icon: <span style={{ fontSize: 13 }}>📷</span>,
    execute: (_state: unknown, api: unknown) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/webp,image/gif';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) await handleImageUpload(file, api as any);
      };
      input.click();
    },
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        borderColor: isFocused ? 'var(--arcade-blue)' : 'var(--border)',
        boxShadow: isFocused ? 'var(--shadow-focus)' : 'none',
        opacity: isUploading ? 0.7 : 1,
        position: 'relative',
      }}
      data-color-mode="light"
    >
      {!value && (
        <div style={{
          position: 'absolute',
          top: 44,
          left: 12,
          fontSize: 14,
          color: 'var(--text-muted)',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 1,
        }}>
          Write your post here... Markdown supported. Drag and drop images to upload.
        </div>
      )}
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        height={minHeight}
        minHeight={minHeight}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        preview="edit"
        extraCommands={[imageUploadCommand as any]}
        style={{
          border: 'none',
          boxShadow: 'none',
          backgroundColor: '#fff',
        }}
      />
    </div>
  );
}
