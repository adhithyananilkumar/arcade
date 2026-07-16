// features/content/editor/components/BlockHandle.tsx
"use client";

import { DragHandle } from "@tiptap/extension-drag-handle-react";
import type { Editor } from "@tiptap/react";
import type { Node as PMNode } from "@tiptap/pm/model";
import { Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getTurnIntoCommands } from "../lib/blockCommands";

interface BlockHandleProps {
  editor: Editor;
}

/**
 * Notion-style gutter control that follows the hovered block:
 *   • "+"  inserts an empty block below and opens the slash menu
 *   • grip drags to reorder (native, via DragHandle) and clicks to open block actions
 *
 * Single vertical stack only — reordering is top-level, no nested drop zones.
 */
export function BlockHandle({ editor }: BlockHandleProps) {
  // Position + node of the block the handle is currently attached to.
  const target = useRef<{ node: PMNode | null; pos: number }>({ node: null, pos: -1 });
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the actions menu whenever the hovered block changes or the editor scrolls.
  const handleNodeChange = useCallback(
    (data: { node: PMNode | null; pos: number }) => {
      target.current = { node: data.node, pos: data.pos };
      setMenuOpen(false);
    },
    []
  );

  // Dismiss the menu on any outside interaction.
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, [menuOpen]);

  const addBlockBelow = useCallback(() => {
    const { node, pos } = target.current;
    if (!node || pos < 0) return;
    const insertAt = pos + node.nodeSize;
    // Insert an empty paragraph, drop the caret into it, then type "/" to open
    // the slash menu — same flow as clicking "+" in Notion.
    editor
      .chain()
      .focus()
      .insertContentAt(insertAt, { type: "paragraph" })
      .setTextSelection(insertAt + 1)
      .insertContent("/")
      .run();
  }, [editor]);

  const turnInto = useCallback(
    (run: (editor: Editor) => void) => {
      const { node, pos } = target.current;
      if (!node || pos < 0) return;
      // Put the selection inside the target block so the conversion applies to it.
      editor.chain().focus().setTextSelection(pos + 1).run();
      run(editor);
      setMenuOpen(false);
    },
    [editor]
  );

  const duplicateBlock = useCallback(() => {
    const { node, pos } = target.current;
    if (!node || pos < 0) return;
    editor
      .chain()
      .focus()
      .insertContentAt(pos + node.nodeSize, node.toJSON())
      .run();
    setMenuOpen(false);
  }, [editor]);

  const deleteBlock = useCallback(() => {
    const { node, pos } = target.current;
    if (!node || pos < 0) return;
    editor
      .chain()
      .focus()
      .deleteRange({ from: pos, to: pos + node.nodeSize })
      .run();
    setMenuOpen(false);
  }, [editor]);

  return (
    <DragHandle
      editor={editor}
      onNodeChange={handleNodeChange}
      className="arcade-block-handle"
    >
      <div className="arcade-handle-row">
        <button
          type="button"
          className="arcade-handle-btn"
          title="Add block below"
          aria-label="Add block below"
          onClick={addBlockBelow}
        >
          <Plus size={16} />
        </button>

        <button
          type="button"
          className="arcade-handle-btn arcade-handle-grip"
          title="Drag to move · click for actions"
          aria-label="Block actions"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <GripVertical size={16} />
        </button>

        {menuOpen && (
          <>
            {/* Backdrop closes the menu on outside click. */}
            <div
              className="arcade-menu-backdrop"
              onClick={() => setMenuOpen(false)}
              onContextMenu={(e) => {
                e.preventDefault();
                setMenuOpen(false);
              }}
            />
            <div className="arcade-block-menu" role="menu">
              <div className="arcade-menu-section-label">Turn into</div>
              {getTurnIntoCommands().map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    role="menuitem"
                    className="arcade-menu-item"
                    onClick={() => turnInto(cmd.run)}
                  >
                    <Icon size={15} />
                    <span>{cmd.title}</span>
                  </button>
                );
              })}
              <div className="arcade-menu-divider" />
              <button
                type="button"
                role="menuitem"
                className="arcade-menu-item"
                onClick={duplicateBlock}
              >
                <Copy size={15} />
                <span>Duplicate</span>
              </button>
              <button
                type="button"
                role="menuitem"
                className="arcade-menu-item arcade-menu-item-danger"
                onClick={deleteBlock}
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>
            </div>
          </>
        )}
      </div>
    </DragHandle>
  );
}
