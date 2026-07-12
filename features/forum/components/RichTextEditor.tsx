'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { toast } from 'sonner';

interface Props {
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
}

const MAX_CHARS = 2000;

export function RichTextEditor({ value, onChange, minHeight = 200 }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({
        inline: true,
      }),
      Placeholder.configure({
        placeholder: 'What do you want to share?',
      }),
      CharacterCount.configure({
        limit: MAX_CHARS,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: `min-height: ${minHeight}px; outline: none; padding: 12px;`,
      },
    },
  });

  if (!editor) return null;

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp,image/gif';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        editor.chain().focus().setImage({ src: base64 }).run();
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
      };
    };
    input.click();
  };

  const ToolbarBtn = ({ 
    active, 
    onClick, 
    children 
  }: { 
    active: boolean; 
    onClick: () => void; 
    children: React.ReactNode; 
  }) => (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      style={{
        width: 28,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        background: active ? 'var(--arcade-blue)' : 'transparent',
        color: active ? '#fff' : 'var(--text-secondary)',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600,
      }}
      onMouseEnter={(e) => !active && (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
      onMouseLeave={(e) => !active && (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {children}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        padding: '6px', 
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap',
      }}>
        <ToolbarBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>B</ToolbarBtn>
        <ToolbarBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>I</ToolbarBtn>
        <ToolbarBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>S</ToolbarBtn>
        <div style={{ width: 1, height: 16, backgroundColor: 'var(--border)', margin: '0 4px' }} />
        <ToolbarBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</ToolbarBtn>
        <ToolbarBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarBtn>
        <div style={{ width: 1, height: 16, backgroundColor: 'var(--border)', margin: '0 4px' }} />
        <ToolbarBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>"</ToolbarBtn>
        <ToolbarBtn active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{'</>'}</ToolbarBtn>
        <div style={{ width: 1, height: 16, backgroundColor: 'var(--border)', margin: '0 4px' }} />
        <ToolbarBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>•</ToolbarBtn>
        <ToolbarBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.</ToolbarBtn>
        <div style={{ width: 1, height: 16, backgroundColor: 'var(--border)', margin: '0 4px' }} />
        <ToolbarBtn active={false} onClick={handleImageUpload}>📷</ToolbarBtn>
      </div>

      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--text-muted);
          pointer-events: none;
          height: 0;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: var(--radius-sm);
          display: block;
          margin: 1rem 0;
        }
        .ProseMirror {
          font-family: inherit;
          font-size: 15px;
          line-height: 1.6;
          color: var(--text-primary);
        }
      `}</style>
      
      {/* Editor area */}
      <EditorContent editor={editor} />
      
      {/* Footer */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        padding: '8px 12px',
        fontSize: 12,
        color: 'var(--text-muted)' 
      }}>
        {editor.storage.characterCount.characters()} / {MAX_CHARS} characters
      </div>
    </div>
  );
}
