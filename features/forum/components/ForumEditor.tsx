'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

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

  const handleImageUpload = async (file: File) => {
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
        const imageMarkdown = `\n![${file.name}](${base64})\n`;
        onChange(`${value}${imageMarkdown}`);
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
      }}
      data-color-mode="light"
    >
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        height={minHeight}
        minHeight={minHeight}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        preview="edit"
        style={{
          border: 'none',
          boxShadow: 'none',
          backgroundColor: '#fff',
        }}
        textareaProps={{
          placeholder: 'Write your post here... Markdown is supported. Drag and drop images to upload.',
        }}
      />
    </div>
  );
}
