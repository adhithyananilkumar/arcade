'use client';

import { useEditor, useEditorState, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyleKit } from '@tiptap/extension-text-style';
import './rich-text.css';
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
  saveStatus?: 'idle' | 'saving' | 'saved';
}

const FONT_FAMILIES: { label: string; value: string | null }[] = [
  { label: 'Sans', value: null },
  { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Mono', value: 'ui-monospace, "SFMono-Regular", Menlo, monospace' },
];

const FONT_SIZES: { label: string; value: string | null }[] = [
  { label: 'Small', value: '12px' },
  { label: 'Normal', value: null },
  { label: 'Large', value: '18px' },
];

const toolbarButtonClass = (active: boolean, activeClassName = 'bg-[#14142b] text-white hover:bg-[#14142b]') =>
  active ? activeClassName : 'text-slate-500 hover:bg-white/60';

/**
 * A deliberately small rich text editor for learner notes — its own `useEditor` config rather than
 * importing Content Studio's `ArcadeEditor`, which would pull `apps/creator` into the learning
 * surface and drag in the ~3.5MB `reactjs-tiptap-editor` toolbar bundle for a handful of basic
 * marks. Mirrors the same domain-level pattern `domains/community/RichTextEditor.tsx` uses.
 *
 * Lives in the Learning domain rather than beside one route because two surfaces now mount it —
 * the lesson player's side rail and the standalone notes workspace — and a third (the overview
 * hub) renders the same notes read-only through `TiptapContentView`.
 *
 * Content styling lives in rich-text.css, not in `prose` utilities: this app does not install
 * @tailwindcss/typography, so `prose` is inert while preflight still flattens headings and strips
 * list markers — without that stylesheet a heading renders identically to a paragraph.
 */
export function NotesEditor({ content, onChange, placeholder, saveStatus }: NotesEditorProps) {
  const editor = useEditor({
    extensions: [
      // Underline is NOT registered here — StarterKit v3 already bundles it, and registering it
      // again logs "Duplicate extension names found: ['underline']".
      StarterKit,
      Highlight,
      TextStyleKit.configure({ color: false, backgroundColor: false, lineHeight: false }),
      Placeholder.configure({ placeholder: placeholder ?? 'Jot notes for this lesson…' }),
    ],
    content: content ? JSON.parse(content) : '',
    onUpdate: ({ editor }) => onChange(JSON.stringify(editor.getJSON())),
    editorProps: {
      attributes: {
        class: 'min-h-[40vh] focus:outline-none',
      },
    },
    immediatelyRender: false,
  });

  // isActive()/getAttributes() read a live editor instance, but React only re-renders this
  // component when its own props/state change — without subscribing through useEditorState the
  // toolbar's pressed/selected look goes stale the moment the cursor moves instead of when you type.
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null;
      return {
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic'),
        underline: editor.isActive('underline'),
        highlight: editor.isActive('highlight'),
        bulletList: editor.isActive('bulletList'),
        orderedList: editor.isActive('orderedList'),
        fontFamily: (editor.getAttributes('textStyle').fontFamily as string | undefined) ?? null,
        fontSize: (editor.getAttributes('textStyle').fontSize as string | undefined) ?? null,
      };
    },
  });

  if (!editor || !toolbarState) return null;

  const currentFontLabel =
    FONT_FAMILIES.find((f) => f.value === toolbarState.fontFamily)?.label ?? 'Sans';
  const currentSizeLabel = FONT_SIZES.find((s) => s.value === toolbarState.fontSize)?.label ?? 'Normal';

  const applyFontFamily = (value: string | null) => {
    if (value) editor.chain().focus().setFontFamily(value).run();
    else editor.chain().focus().unsetFontFamily().run();
  };

  const applyFontSize = (value: string | null) => {
    if (value) editor.chain().focus().setFontSize(value).run();
    else editor.chain().focus().unsetFontSize().run();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex flex-shrink-0 flex-wrap items-center gap-0.5 rounded-full border border-white/40 bg-white/50 px-1.5 py-1 backdrop-blur-md">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-7 items-center gap-1 rounded-full px-2 text-[12px] font-semibold text-slate-600 hover:bg-white/60">
            {currentFontLabel}
            <ChevronDown size={12} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {FONT_FAMILIES.map((f) => (
              <DropdownMenuItem key={f.label} onClick={() => applyFontFamily(f.value)}>
                <span style={f.value ? { fontFamily: f.value } : undefined}>{f.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-7 items-center gap-1 rounded-full px-2 text-[12px] font-semibold text-slate-600 hover:bg-white/60">
            {currentSizeLabel}
            <ChevronDown size={12} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {FONT_SIZES.map((s) => (
              <DropdownMenuItem key={s.label} onClick={() => applyFontSize(s.value)}>
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
          className={toolbarButtonClass(toolbarState.bold)}
          title="Bold"
        >
          <Bold size={13} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarButtonClass(toolbarState.italic)}
          title="Italic"
        >
          <Italic size={13} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={toolbarButtonClass(toolbarState.underline)}
          title="Underline"
        >
          <UnderlineIcon size={13} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={toolbarButtonClass(toolbarState.highlight, 'bg-amber-200 text-amber-900 hover:bg-amber-200')}
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
          className={toolbarButtonClass(toolbarState.bulletList)}
          title="Bullet list"
        >
          <List size={13} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={toolbarButtonClass(toolbarState.orderedList)}
          title="Numbered list"
        >
          <ListOrdered size={13} />
        </Button>

        {saveStatus && (
          <span className="ml-auto pr-1.5 text-[10px] font-medium text-slate-400">
            {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : ''}
          </span>
        )}
      </div>

      <div
        className="arcade-rich-text arcade-rich-text-compact flex-1 overflow-y-auto arcade-scrollbar-mini"
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
