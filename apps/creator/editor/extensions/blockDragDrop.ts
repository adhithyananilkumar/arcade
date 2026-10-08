// apps/creator/editor/extensions/blockDragDrop.ts
// Makes moving a block with the gutter grip land where the author points.
//
// The drag handle (reactjs-tiptap-editor's port of Tiptap's DragHandle) starts a native drag and
// leaves the drop to ProseMirror. ProseMirror picks "before" or "after" the target block from the
// *horizontal* position inside its text — and people drop near the left edge, where the grip is,
// which always means "before". Dragging a block down one place therefore put it straight back
// where it started: block moving looked broken. This plugin owns drops that come from the grip:
// the target is the top-level block under the pointer, before/after is its vertical midpoint, a
// line shows exactly where it will land, and the drag image is a clean pill instead of a
// see-through clone of the block laid over the text.

import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, NodeSelection, TextSelection } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";

interface DropTarget {
  /** Document position between two top-level blocks. */
  pos: number;
  /** Viewport Y of the gap, for the indicator. */
  y: number;
}

/** The gap between top-level blocks nearest the pointer, by vertical midpoint. */
function dropTargetAt(view: EditorView, clientY: number): DropTarget | null {
  const { doc } = view.state;
  let pos = 0;
  let last: DropTarget | null = null;
  let previousBottom: number | null = null;
  for (let i = 0; i < doc.childCount; i++) {
    const child = doc.child(i);
    const dom = view.nodeDOM(pos);
    if (dom instanceof HTMLElement) {
      const rect = dom.getBoundingClientRect();
      // The line sits in the middle of the gap between the two blocks.
      if (clientY < rect.top + rect.height / 2) return { pos, y: previousBottom === null ? rect.top : (previousBottom + rect.top) / 2 };
      last = { pos: pos + child.nodeSize, y: rect.bottom };
      previousBottom = rect.bottom;
    }
    pos += child.nodeSize;
  }
  return last;
}

/** Short text for the drag image: what the author is carrying. */
function describeRange(view: EditorView, from: number, to: number): string {
  const text = view.state.doc.textBetween(from, to, " ", " ").replace(/\s+/g, " ").trim();
  if (text) return text.length > 60 ? `${text.slice(0, 57)}…` : text;
  const node = view.state.doc.nodeAt(from);
  return node ? node.type.name.replace(/([a-z])([A-Z])/g, "$1 $2") : "Block";
}

export const BlockDragDrop = Extension.create({
  name: "arcadeBlockDragDrop",

  addProseMirrorPlugins() {
    let dragging = false;
    let indicator: HTMLDivElement | null = null;

    const removeIndicator = () => {
      indicator?.remove();
      indicator = null;
    };

    const end = () => {
      dragging = false;
      removeIndicator();
      document.body.classList.remove("arcade-block-dragging");
    };

    return [
      new Plugin({
        key: new PluginKey("arcadeBlockDragDrop"),
        view: (view) => {
          // A drag from the grip, which lives beside the editor DOM — not text dragged from inside it.
          const isGripDrag = (target: EventTarget | null) => {
            if (!(target instanceof HTMLElement)) return false;
            const handle = target.closest<HTMLElement>('[draggable="true"]');
            const host = view.dom.parentElement;
            return !!handle && !!host && host.contains(handle) && !view.dom.contains(handle);
          };

          // Bubble phase on window: runs after the handle's own dragstart has set up the move.
          const onDragStart = (event: DragEvent) => {
            if (!isGripDrag(event.target) || !event.dataTransfer) return;
            dragging = true;
            document.body.classList.add("arcade-block-dragging");
            // Some browsers (Firefox) cancel a drag that carries no data at all.
            event.dataTransfer.setData("application/x-arcade-block", "1");
            event.dataTransfer.effectAllowed = "move";

            const { from, to } = view.state.selection;
            const ghost = document.createElement("div");
            ghost.className = "arcade-block-drag-image";
            ghost.textContent = describeRange(view, from, to);
            document.body.appendChild(ghost);
            event.dataTransfer.setDragImage(ghost, 16, 16);
            // The browser snapshots the image synchronously; the element can go next frame.
            requestAnimationFrame(() => ghost.remove());
          };

          const onDragOver = (event: DragEvent) => {
            if (!dragging) return;
            const rect = view.dom.getBoundingClientRect();
            const inside = event.clientX >= rect.left - 80 && event.clientX <= rect.right + 40 && event.clientY >= rect.top - 40 && event.clientY <= rect.bottom + 40;
            const target = inside ? dropTargetAt(view, event.clientY) : null;
            if (!target) {
              removeIndicator();
              return;
            }
            if (!indicator) {
              indicator = document.createElement("div");
              indicator.className = "arcade-block-drop-indicator";
              document.body.appendChild(indicator);
            }
            indicator.style.left = `${rect.left}px`;
            indicator.style.width = `${rect.width}px`;
            indicator.style.top = `${target.y - 1}px`;
          };

          window.addEventListener("dragstart", onDragStart);
          window.addEventListener("dragover", onDragOver);
          window.addEventListener("dragend", end);
          window.addEventListener("drop", end);

          return {
            destroy() {
              window.removeEventListener("dragstart", onDragStart);
              window.removeEventListener("dragover", onDragOver);
              window.removeEventListener("dragend", end);
              window.removeEventListener("drop", end);
              end();
            },
          };
        },
        props: {
          handleDrop(view, event, _slice, moved) {
            if (!dragging || !moved) return false;
            const target = dropTargetAt(view, event.clientY);
            end();
            if (!target) return false;

            // The handle selected exactly the block(s) being carried, at top-level boundaries.
            const { from, to } = view.state.selection;
            event.preventDefault();
            // Dropped onto itself (or its own edges): nothing to move.
            if (target.pos >= from && target.pos <= to) return true;

            const content = view.state.doc.slice(from, to).content;
            const tr = view.state.tr.delete(from, to);
            const insertAt = tr.mapping.map(target.pos);
            tr.insert(insertAt, content);
            const moved1 = tr.doc.nodeAt(insertAt);
            tr.setSelection(
              moved1 && content.childCount === 1 && NodeSelection.isSelectable(moved1)
                ? NodeSelection.create(tr.doc, insertAt)
                : TextSelection.near(tr.doc.resolve(insertAt + 1))
            );
            view.dispatch(tr.scrollIntoView());
            view.dragging = null;
            return true;
          },
        },
      }),
    ];
  },
});
