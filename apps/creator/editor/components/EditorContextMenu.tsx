"use client";

import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import { toast } from "sonner";
import {
  BetweenHorizontalEnd,
  BetweenHorizontalStart,
  BetweenVerticalEnd,
  BetweenVerticalStart,
  Bold,
  ClipboardPaste,
  ClipboardType,
  Code,
  Copy,
  CopyPlus,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  Scissors,
  SquareCode,
  Strikethrough,
  Table,
  TableCellsMerge,
  TableCellsSplit,
  TextSelect,
  Trash2,
  Underline,
  Undo2,
} from "lucide-react";
import { EditorIconButton } from "./EditorIconButton";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? "⌘" : "Ctrl";
const SHIFT = isMac ? "⇧" : "Shift";

interface MenuPosition {
  x: number;
  y: number;
}

/** Top-level block the position sits in: `[start, end)` in document positions. */
function topLevelBlockRange(editor: Editor, pos: number): { from: number; to: number } | null {
  const $pos = editor.state.doc.resolve(Math.min(pos, editor.state.doc.content.size));
  if ($pos.depth === 0) {
    const node = editor.state.doc.nodeAt(pos);
    return node ? { from: pos, to: pos + node.nodeSize } : null;
  }
  return { from: $pos.before(1), to: $pos.after(1) };
}

function MenuItem({
  icon,
  label,
  shortcut,
  onSelect,
  disabled,
  danger,
}: {
  icon: ReactNode;
  label: string;
  shortcut?: string;
  onSelect: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onSelect}
      className={`arcade-context-item${danger ? " is-danger" : ""}`}
    >
      <span className="arcade-context-item-icon">{icon}</span>
      <span className="arcade-context-item-label">{label}</span>
      {shortcut && <kbd className="arcade-context-item-kbd">{shortcut}</kbd>}
    </button>
  );
}

function MenuLabel({ children }: { children: ReactNode }) {
  return <div className="arcade-context-label">{children}</div>;
}

function MenuDivider() {
  return <div className="arcade-context-divider" role="separator" />;
}

/**
 * The editor's own right-click menu, in place of the browser's. Same look as the rest of the
 * editor chrome; offers what the browser's can't (formatting, block type, table and block
 * actions). Shift + right-click still opens the browser's menu — that's where spelling
 * suggestions live.
 */
export const EditorContextMenu = memo(function EditorContextMenu({ editor }: { editor: Editor }) {
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [clickPos, setClickPos] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<MenuPosition | null>(null);

  const close = useCallback(() => {
    setPosition(null);
    setPlaced(null);
  }, []);

  useEffect(() => {
    const dom = editor.view.dom;
    const onContextMenu = (event: MouseEvent) => {
      if (event.shiftKey || !editor.isEditable) return; // browser menu (spelling) on purpose
      event.preventDefault();
      const hit = editor.view.posAtCoords({ left: event.clientX, top: event.clientY });
      if (hit) {
        const { from, to } = editor.state.selection;
        // Right-clicking inside the current selection keeps it (to cut/copy/format it);
        // anywhere else moves the caret there first, like every desktop editor.
        if (hit.pos < from || hit.pos > to) {
          editor.chain().focus().setTextSelection(hit.pos).run();
        } else {
          editor.commands.focus();
        }
        setClickPos(hit.pos);
      }
      setPosition({ x: event.clientX, y: event.clientY });
    };
    dom.addEventListener("contextmenu", onContextMenu);
    return () => dom.removeEventListener("contextmenu", onContextMenu);
  }, [editor]);

  // Close on outside click, Escape, scroll, resize, or the editor going away.
  useEffect(() => {
    if (!position) return;
    const onPointer = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        editor.commands.focus();
      }
    };
    window.addEventListener("pointerdown", onPointer, true);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    editor.on("destroy", close);
    return () => {
      window.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
      editor.off("destroy", close);
    };
  }, [position, close, editor]);

  // Keep the menu fully on screen: flip left/up when it would overflow.
  useLayoutEffect(() => {
    if (!position || !menuRef.current) return;
    const { width, height } = menuRef.current.getBoundingClientRect();
    const margin = 8;
    const x = position.x + width + margin > window.innerWidth ? Math.max(margin, position.x - width) : position.x;
    const y = position.y + height + margin > window.innerHeight ? Math.max(margin, window.innerHeight - height - margin) : position.y;
    setPlaced({ x, y });
  }, [position]);

  if (!position) return null;

  const hasSelection = !editor.state.selection.empty;
  const inTable = editor.isActive("table");
  const can = editor.can();

  const act = (fn: () => void) => () => {
    close();
    fn();
  };

  const copyOrCut = (command: "copy" | "cut") => {
    editor.commands.focus();
    // Runs inside the click (a user gesture), so the browser lets the editor's own copy/cut
    // handlers fill the clipboard with rich content — same result as the keyboard shortcut.
    if (!document.execCommand(command)) toast.message(`Press ${MOD}+${command === "copy" ? "C" : "X"} to ${command}.`);
  };

  const paste = async (plain: boolean) => {
    editor.commands.focus();
    try {
      if (!plain && navigator.clipboard?.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          if (item.types.includes("text/html")) {
            const html = await (await item.getType("text/html")).text();
            editor.view.pasteHTML(html);
            return;
          }
        }
      }
      const text = await navigator.clipboard.readText();
      if (text) editor.view.pasteText(text);
    } catch {
      // Clipboard access denied or unsupported — the keyboard shortcut always works.
      toast.message(`Press ${MOD}+${plain ? `${SHIFT}+` : ""}V to paste.`);
    }
  };

  const blockAt = () => topLevelBlockRange(editor, clickPos ?? editor.state.selection.from);

  const duplicateBlock = () => {
    const range = blockAt();
    if (!range) return;
    const slice = editor.state.doc.slice(range.from, range.to);
    const tr = editor.state.tr.insert(range.to, slice.content);
    tr.setSelection(TextSelection.near(tr.doc.resolve(range.to + 1)));
    editor.view.dispatch(tr.scrollIntoView());
    editor.commands.focus();
  };

  const deleteBlock = () => {
    const range = blockAt();
    if (!range) return;
    editor.chain().focus().command(({ tr }) => {
      tr.setSelection(NodeSelection.create(tr.doc, range.from));
      tr.deleteSelection();
      return true;
    }).run();
  };

  /**
   * Inserts go *after* the block that was right-clicked. Inserting at the caret split the
   * paragraph in two around the new table or divider ("Br" / table / "avo").
   */
  const insertAfterBlock = (insert: (chain: ReturnType<Editor["chain"]>) => ReturnType<Editor["chain"]>) => {
    const range = blockAt();
    const chain = editor.chain().focus();
    if (range) {
      const block = editor.state.doc.nodeAt(range.from);
      // End of a text block: block-level inserts land after it, not inside. Other blocks
      // (images, tables) get the gap right after them.
      chain.setTextSelection(block?.isTextblock ? range.to - 1 : range.to);
    }
    insert(chain).run();
  };

  const turnInto = (fn: () => void) => act(fn);

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label="Editor actions"
      className="arcade-context-menu"
      style={{ left: (placed ?? position).x, top: (placed ?? position).y, visibility: placed ? "visible" : "hidden" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="arcade-context-row">
        <EditorIconButton label="Undo" shortcut={`${MOD}+Z`} disabled={!can.undo()} onClick={act(() => editor.chain().focus().undo().run())}>
          <Undo2 size={15} />
        </EditorIconButton>
        <EditorIconButton label="Redo" shortcut={`${MOD}+${SHIFT}+Z`} disabled={!can.redo()} onClick={act(() => editor.chain().focus().redo().run())}>
          <Redo2 size={15} />
        </EditorIconButton>
        <span className="arcade-context-row-spacer" />
        <EditorIconButton label="Bold" shortcut={`${MOD}+B`} active={editor.isActive("bold")} onClick={act(() => editor.chain().focus().toggleBold().run())}>
          <Bold size={15} />
        </EditorIconButton>
        <EditorIconButton label="Italic" shortcut={`${MOD}+I`} active={editor.isActive("italic")} onClick={act(() => editor.chain().focus().toggleItalic().run())}>
          <Italic size={15} />
        </EditorIconButton>
        <EditorIconButton label="Underline" shortcut={`${MOD}+U`} active={editor.isActive("underline")} onClick={act(() => editor.chain().focus().toggleUnderline().run())}>
          <Underline size={15} />
        </EditorIconButton>
        <EditorIconButton label="Strikethrough" active={editor.isActive("strike")} onClick={act(() => editor.chain().focus().toggleStrike().run())}>
          <Strikethrough size={15} />
        </EditorIconButton>
        <EditorIconButton label="Inline code" active={editor.isActive("code")} onClick={act(() => editor.chain().focus().toggleCode().run())}>
          <Code size={15} />
        </EditorIconButton>
      </div>

      <MenuDivider />
      <MenuItem icon={<Scissors size={15} />} label="Cut" shortcut={`${MOD}+X`} disabled={!hasSelection} onSelect={act(() => copyOrCut("cut"))} />
      <MenuItem icon={<Copy size={15} />} label="Copy" shortcut={`${MOD}+C`} disabled={!hasSelection} onSelect={act(() => copyOrCut("copy"))} />
      <MenuItem icon={<ClipboardPaste size={15} />} label="Paste" shortcut={`${MOD}+V`} onSelect={act(() => void paste(false))} />
      <MenuItem icon={<ClipboardType size={15} />} label="Paste as plain text" shortcut={`${MOD}+${SHIFT}+V`} onSelect={act(() => void paste(true))} />
      <MenuItem icon={<TextSelect size={15} />} label="Select all" shortcut={`${MOD}+A`} onSelect={act(() => editor.chain().focus().selectAll().run())} />
      {hasSelection && (
        <MenuItem icon={<RemoveFormatting size={15} />} label="Clear formatting" onSelect={act(() => editor.chain().focus().unsetAllMarks().run())} />
      )}

      <MenuDivider />
      <MenuLabel>Turn into</MenuLabel>
      <div className="arcade-context-row">
        <EditorIconButton label="Text" active={editor.isActive("paragraph")} onClick={turnInto(() => editor.chain().focus().setParagraph().run())}>
          <Pilcrow size={15} />
        </EditorIconButton>
        <EditorIconButton label="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={turnInto(() => editor.chain().focus().toggleHeading({ level: 1 }).run())}>
          <Heading1 size={15} />
        </EditorIconButton>
        <EditorIconButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={turnInto(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}>
          <Heading2 size={15} />
        </EditorIconButton>
        <EditorIconButton label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={turnInto(() => editor.chain().focus().toggleHeading({ level: 3 }).run())}>
          <Heading3 size={15} />
        </EditorIconButton>
        <EditorIconButton label="Bulleted list" active={editor.isActive("bulletList")} onClick={turnInto(() => editor.chain().focus().toggleBulletList().run())}>
          <List size={15} />
        </EditorIconButton>
        <EditorIconButton label="Numbered list" active={editor.isActive("orderedList")} onClick={turnInto(() => editor.chain().focus().toggleOrderedList().run())}>
          <ListOrdered size={15} />
        </EditorIconButton>
        <EditorIconButton label="To-do list" active={editor.isActive("taskList")} onClick={turnInto(() => editor.chain().focus().toggleTaskList().run())}>
          <ListTodo size={15} />
        </EditorIconButton>
        <EditorIconButton label="Quote" active={editor.isActive("blockquote")} onClick={turnInto(() => editor.chain().focus().toggleBlockquote().run())}>
          <Quote size={15} />
        </EditorIconButton>
        <EditorIconButton label="Code block" active={editor.isActive("codeBlock")} onClick={turnInto(() => editor.chain().focus().toggleCodeBlock().run())}>
          <SquareCode size={15} />
        </EditorIconButton>
      </div>

      {inTable ? (
        <>
          <MenuDivider />
          <MenuLabel>Table</MenuLabel>
          <MenuItem icon={<BetweenHorizontalStart size={15} />} label="Insert row above" onSelect={act(() => editor.chain().focus().addRowBefore().run())} />
          <MenuItem icon={<BetweenHorizontalEnd size={15} />} label="Insert row below" onSelect={act(() => editor.chain().focus().addRowAfter().run())} />
          <MenuItem icon={<BetweenVerticalStart size={15} />} label="Insert column left" onSelect={act(() => editor.chain().focus().addColumnBefore().run())} />
          <MenuItem icon={<BetweenVerticalEnd size={15} />} label="Insert column right" onSelect={act(() => editor.chain().focus().addColumnAfter().run())} />
          {can.mergeCells() && <MenuItem icon={<TableCellsMerge size={15} />} label="Merge cells" onSelect={act(() => editor.chain().focus().mergeCells().run())} />}
          {can.splitCell() && <MenuItem icon={<TableCellsSplit size={15} />} label="Split cell" onSelect={act(() => editor.chain().focus().splitCell().run())} />}
          <MenuItem icon={<Trash2 size={15} />} label="Delete row" danger disabled={!can.deleteRow()} onSelect={act(() => editor.chain().focus().deleteRow().run())} />
          <MenuItem icon={<Trash2 size={15} />} label="Delete column" danger disabled={!can.deleteColumn()} onSelect={act(() => editor.chain().focus().deleteColumn().run())} />
          <MenuItem icon={<Trash2 size={15} />} label="Delete table" danger onSelect={act(() => editor.chain().focus().deleteTable().run())} />
        </>
      ) : (
        <>
          <MenuDivider />
          <MenuItem
            icon={<Table size={15} />}
            label="Insert table"
            onSelect={act(() => insertAfterBlock((c) => c.insertTable({ rows: 3, cols: 3, withHeaderRow: true })))}
          />
          <MenuItem icon={<Minus size={15} />} label="Insert divider" onSelect={act(() => insertAfterBlock((c) => c.setHorizontalRule()))} />
          <MenuItem icon={<CopyPlus size={15} />} label="Duplicate block" onSelect={act(duplicateBlock)} />
          <MenuItem icon={<Trash2 size={15} />} label="Delete block" danger onSelect={act(deleteBlock)} />
        </>
      )}

      <div className="arcade-context-hint">{SHIFT} + right-click for spelling suggestions</div>
    </div>,
    document.body
  );
});
