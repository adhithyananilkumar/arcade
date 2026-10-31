'use client';

import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useEditor, useEditorState, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyleKit } from '@tiptap/extension-text-style';
import './rich-text.css';
import { Bold, Italic, Underline as UnderlineIcon, Highlighter, List, ListOrdered, ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';
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
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
}

const FONT_FAMILIES: { label: string; value: string | null }[] = [
  { label: 'Sans', value: null },
  { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Mono', value: 'ui-monospace, "SFMono-Regular", Menlo, monospace' },
];

const FONT_SIZES: { label: string; value: string }[] = [
  { label: '10px', value: '10px' },
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
  { label: '32px', value: '32px' },
];

const toolbarButtonClass = (active: boolean, activeClassName?: string) => {
  if (active) {
    return (
      activeClassName ??
      '!bg-ink !text-white hover:!bg-ink hover:!text-white dark:!bg-white dark:!text-slate-900 dark:hover:!bg-white dark:hover:!text-slate-900 shadow-xs [&_svg]:!text-white [&_svg]:!stroke-white dark:[&_svg]:!text-slate-900 dark:[&_svg]:!stroke-slate-900'
    );
  }
  return 'text-slate-500 hover:text-ink hover:bg-surface/70';
};

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
  const parsedContent = useMemo(() => {
    if (!content) return '';
    if (typeof content === 'object') return content;
    try {
      return JSON.parse(content);
    } catch {
      return content;
    }
  }, [content]);

  const editor = useEditor({
    extensions: [
      // Underline is NOT registered here — StarterKit v3 already bundles it, and registering it
      // again logs "Duplicate extension names found: ['underline']".
      StarterKit,
      Highlight,
      TextStyleKit.configure({ color: false, backgroundColor: false, lineHeight: false }),
      Placeholder.configure({ placeholder: placeholder ?? 'Jot notes for this lesson…' }),
    ],
    content: parsedContent,
    onUpdate: ({ editor }) => onChange(JSON.stringify(editor.getJSON())),
    editorProps: {
      attributes: {
        class: 'min-h-[40vh] focus:outline-none caret-ink dark:caret-white selection:bg-blue-500/20',
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

  const toolbarRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = toolbarRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      ro.disconnect();
    };
  }, [checkScroll, editor]);

  if (!editor) {
    return (
      <div className="flex h-full min-h-[30vh] items-center justify-center text-xs text-slate-400">
        Loading editor…
      </div>
    );
  }

  const boldActive = toolbarState?.bold ?? editor.isActive('bold');
  const italicActive = toolbarState?.italic ?? editor.isActive('italic');
  const underlineActive = toolbarState?.underline ?? editor.isActive('underline');
  const highlightActive = toolbarState?.highlight ?? editor.isActive('highlight');
  const bulletListActive = toolbarState?.bulletList ?? editor.isActive('bulletList');
  const orderedListActive = toolbarState?.orderedList ?? editor.isActive('orderedList');
  const currentFontFamily =
    toolbarState?.fontFamily ?? (editor.getAttributes('textStyle').fontFamily as string | undefined) ?? null;
  const currentFontSize =
    toolbarState?.fontSize ?? (editor.getAttributes('textStyle').fontSize as string | undefined) ?? null;

  const currentFontLabel =
    FONT_FAMILIES.find((f) => f.value === currentFontFamily)?.label ?? 'Sans';
  const currentSizeLabel =
    FONT_SIZES.find((s) => s.value === currentFontSize)?.label ?? currentFontSize ?? '16px';

  const applyFontFamily = (value: string | null) => {
    if (value) editor.chain().focus().setFontFamily(value).run();
    else editor.chain().focus().unsetFontFamily().run();
  };

  const applyFontSize = (value: string) => {
    editor.chain().focus().setFontSize(value).run();
  };

  const scrollToolbar = (direction: 'left' | 'right') => {
    const el = toolbarRef.current;
    if (!el) return;
    const offset = direction === 'left' ? -140 : 140;
    el.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="relative mb-2 flex flex-shrink-0 items-center rounded-full border border-white/40 bg-surface/50 p-1 shadow-xs backdrop-blur-md">
        {canScrollLeft && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => scrollToolbar('left')}
            title="Scroll formatting options left"
            aria-label="Scroll formatting options left"
            className="flex h-7 w-6 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-surface/80 hover:text-ink active:scale-95 transition-all cursor-pointer mr-0.5"
          >
            <ChevronLeft size={13} className="stroke-[2.5]" />
          </button>
        )}

        <div
          ref={toolbarRef}
          className="flex flex-1 items-center overflow-x-auto overflow-y-hidden notes-toolbar-scroll scroll-smooth"
        >
          <div className="flex items-center gap-1 flex-nowrap whitespace-nowrap min-w-max px-1">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-7 shrink-0 items-center gap-1 rounded-full px-2 text-[12px] font-semibold text-slate-600 hover:bg-surface/60 transition-colors cursor-pointer">
                {currentFontLabel}
                <ChevronDown size={12} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {FONT_FAMILIES.map((f) => (
                  <DropdownMenuItem
                    key={f.label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyFontFamily(f.value)}
                  >
                    <span style={f.value ? { fontFamily: f.value } : undefined}>{f.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger
                type="button"
                title="Font size"
                aria-label="Font size"
                className="flex h-7 shrink-0 items-center gap-1 rounded-full px-2 text-[12px] font-semibold text-slate-600 hover:bg-surface/60 transition-colors cursor-pointer"
              >
                <span>{currentSizeLabel}</span>
                <ChevronDown size={12} className="opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[5.5rem] p-1">
                {FONT_SIZES.map((s) => {
                  const isSelected = currentSizeLabel === s.value;
                  return (
                    <DropdownMenuItem
                      key={s.value}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyFontSize(s.value)}
                      className={`flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs cursor-pointer ${
                        isSelected ? 'font-semibold text-ink bg-surface/70' : 'text-slate-600 hover:text-ink'
                      }`}
                    >
                      <span>{s.label}</span>
                      {isSelected && <Check size={12} className="text-ink stroke-[2.5]" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="mx-1 h-4 shrink-0 bg-ink/10" />

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`shrink-0 ${toolbarButtonClass(boldActive)}`}
              title="Bold"
              aria-label="Bold"
            >
              <Bold size={13} className={boldActive ? 'stroke-[2.5]' : ''} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`shrink-0 ${toolbarButtonClass(italicActive)}`}
              title="Italic"
              aria-label="Italic"
            >
              <Italic size={13} className={italicActive ? 'stroke-[2.5]' : ''} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`shrink-0 ${toolbarButtonClass(underlineActive)}`}
              title="Underline"
              aria-label="Underline"
            >
              <UnderlineIcon size={13} className={underlineActive ? 'stroke-[2.5]' : ''} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={`shrink-0 ${toolbarButtonClass(
                highlightActive,
                '!bg-amber-300 !text-amber-950 hover:!bg-amber-300 hover:!text-amber-950 dark:!bg-amber-400 dark:!text-amber-950 [&_svg]:!text-amber-950 [&_svg]:!stroke-amber-950 shadow-xs'
              )}`}
              title="Highlight"
              aria-label="Highlight"
            >
              <Highlighter size={13} className={highlightActive ? 'stroke-[2.5]' : ''} />
            </Button>

            <Separator orientation="vertical" className="mx-1 h-4 shrink-0 bg-ink/10" />

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`shrink-0 ${toolbarButtonClass(bulletListActive)}`}
              title="Bullet list"
              aria-label="Bullet list"
            >
              <List size={13} className={bulletListActive ? 'stroke-[2.5]' : ''} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`shrink-0 ${toolbarButtonClass(orderedListActive)}`}
              title="Numbered list"
              aria-label="Numbered list"
            >
              <ListOrdered size={13} className={orderedListActive ? 'stroke-[2.5]' : ''} />
            </Button>

            {saveStatus && (
              <span
                className={`shrink-0 pl-2 pr-1.5 text-[10px] font-medium ${
                  saveStatus === 'error' ? 'text-rose-500' : 'text-slate-400'
                }`}
              >
                {saveStatus === 'saving'
                  ? 'Saving…'
                  : saveStatus === 'saved'
                  ? 'Saved'
                  : saveStatus === 'error'
                  ? 'Failed to save'
                  : ''}
              </span>
            )}
          </div>
        </div>

        {canScrollRight && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => scrollToolbar('right')}
            title="Scroll formatting options right"
            aria-label="Scroll formatting options right"
            className="flex h-7 w-6 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-surface/80 hover:text-ink active:scale-95 transition-all cursor-pointer ml-0.5"
          >
            <ChevronRight size={13} className="stroke-[2.5]" />
          </button>
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
