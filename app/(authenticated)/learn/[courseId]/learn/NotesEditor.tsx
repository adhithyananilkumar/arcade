'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Underline as UnderlineIcon, Highlighter, List, ListOrdered, ChevronDown } from 'lucide-react';
import { Button } from '@/shared/design-system/ui/button';
import { Separator } from '@/shared/design-system/ui/separator';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/design-system/ui/dropdown-menu';

interface NotesEditorProps {
  content: string;
  onChange: (json: string) => void;
  placeholder?: string;
}

type SizeLevel = 0 | 1 | 2;

const SIZES: { label: string; level: SizeLevel }[] = [
  { label: 'Normal', level: 0 },
  { label: 'Large', level: 2 },
  { label: 'Heading', level: 1 },
];

const toolbarButtonClass = (active: boolean, activeClassName = 'bg-[#14142b] text-white hover:bg-[#14142b]') =>
  `${active ? activeClassName : 'text-slate-500 hover:bg-white/60'}`;

/**
 * A deliberately small, page-local rich text editor for learner notes — its own `useEditor`
 * config rather than importing Content Studio's `ArcadeEditor`, which would pull `apps/creator`
 * into `app/learn` and drag in the ~3.5MB `reactjs-tiptap-editor` toolbar bundle for a handful of
 * basic marks. Mirrors the same domain-level pattern `domains/community/RichTextEditor.tsx` uses.
 */
export function NotesEditor({ content, onChange, placeholder }: NotesEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2] } }),
      Underline,
      Highlight,
      Placeholder.configure({ placeholder: placeholder ?? 'Jot notes for this lesson…' }),
    ],
    content: content ? JSON.parse(content) : '',
    onUpdate: ({ editor }) => onChange(JSON.stringify(editor.getJSON())),
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none text-[13px] text-slate-700 focus:outline-none prose-headings:font-bold prose-headings:text-[#14142b] min-h-[40vh]',
      },
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  const currentLevel: SizeLevel = editor.isActive('heading', { level: 1 })
    ? 1
    : editor.isActive('heading', { level: 2 })
      ? 2
      : 0;
  const currentSizeLabel = SIZES.find((s) => s.level === currentLevel)?.label ?? 'Normal';

  const setSize = (level: SizeLevel) => {
    if (level === 0) editor.chain().focus().setParagraph().run();
    else editor.chain().focus().toggleHeading({ level }).run();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex flex-shrink-0 flex-wrap items-center gap-0.5 rounded-full border border-white/40 bg-white/50 px-1.5 py-1 backdrop-blur-md">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-7 items-center gap-1 rounded-full px-2 text-[12px] font-semibold text-slate-600 hover:bg-white/60">
            {currentSizeLabel}
            <ChevronDown size={12} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {SIZES.map((s) => (
              <DropdownMenuItem key={s.label} onClick={() => setSize(s.level)}>
                {s.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 h-4" />

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolbarButtonClass(editor.isActive('bold'))}
          title="Bold"
        >
          <Bold size={13} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarButtonClass(editor.isActive('italic'))}
          title="Italic"
        >
          <Italic size={13} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={toolbarButtonClass(editor.isActive('underline'))}
          title="Underline"
        >
          <UnderlineIcon size={13} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={toolbarButtonClass(editor.isActive('highlight'), 'bg-amber-200 text-amber-900 hover:bg-amber-200')}
          title="Highlight"
        >
          <Highlighter size={13} />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-4" />

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolbarButtonClass(editor.isActive('bulletList'))}
          title="Bullet list"
        >
          <List size={13} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={toolbarButtonClass(editor.isActive('orderedList'))}
          title="Numbered list"
        >
          <ListOrdered size={13} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto arcade-scrollbar-mini" onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
