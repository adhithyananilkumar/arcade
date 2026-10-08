"use client";

import { memo } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  BetweenHorizontalEnd,
  BetweenHorizontalStart,
  BetweenVerticalEnd,
  BetweenVerticalStart,
  Columns2,
  PanelLeft,
  PanelTop,
  Rows2,
  TableCellsMerge,
  TableCellsSplit,
  Trash2,
} from "lucide-react";
import { EditorIconButton, EditorPillDivider } from "./EditorIconButton";

const IDLE = { inTable: false, canMerge: false, canSplit: false, canDeleteRow: false, canDeleteColumn: false };

/** The table the caret is in, for anchoring the menu to the table rather than to the caret. */
function currentTableElement(editor: Editor): HTMLElement | null {
  const { from } = editor.state.selection;
  const dom = editor.view.domAtPos(from).node;
  const el = dom instanceof HTMLElement ? dom : dom.parentElement;
  return (el?.closest(".tableWrapper") ?? el?.closest("table")) as HTMLElement | null;
}

/**
 * Table controls, replacing the library's single row of unlabeled icons. Grouped the way people
 * think about a table — rows, columns, cells, headers — every button labeled by tooltip, actions
 * that can't apply right now disabled rather than silently doing nothing, and the whole pill
 * anchored above the table so it never sits on top of the cells being edited.
 */
export const TableBubble = memo(function TableBubble({ editor }: { editor: Editor }) {
  // One subscription. Outside a table it returns the same constant, so the `can()` dry runs —
  // which copy the document — only happen while the caret is actually in a table.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e.isEditable || !e.isActive("table")) return IDLE;
      const can = e.can();
      return {
        inTable: true,
        canMerge: can.mergeCells(),
        canSplit: can.splitCell(),
        canDeleteRow: can.deleteRow(),
        canDeleteColumn: can.deleteColumn(),
      };
    },
    equalityFn: (a, b) =>
      !!a &&
      !!b &&
      a.inTable === b.inTable &&
      a.canMerge === b.canMerge &&
      a.canSplit === b.canSplit &&
      a.canDeleteRow === b.canDeleteRow &&
      a.canDeleteColumn === b.canDeleteColumn,
  });

  const run = (fn: (chain: ReturnType<Editor["chain"]>) => ReturnType<Editor["chain"]>) => () => fn(editor.chain().focus()).run();

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="arcadeTableBubble"
      shouldShow={({ editor: e }) => e.isEditable && e.isActive("table")}
      getReferencedVirtualElement={() => {
        const table = currentTableElement(editor);
        return table ? { getBoundingClientRect: () => table.getBoundingClientRect() } : null;
      }}
      options={{ placement: "top", offset: 10, flip: true, shift: { padding: 12 } }}
    >
      {state?.inTable && (
        <div className="arcade-editor-pill" role="toolbar" aria-label="Table">
          <EditorIconButton label="Insert row above" onClick={run((c) => c.addRowBefore())}>
            <BetweenHorizontalStart size={16} />
          </EditorIconButton>
          <EditorIconButton label="Insert row below" onClick={run((c) => c.addRowAfter())}>
            <BetweenHorizontalEnd size={16} />
          </EditorIconButton>
          <EditorIconButton label="Delete row" danger disabled={!state.canDeleteRow} onClick={run((c) => c.deleteRow())}>
            <Rows2 size={16} />
          </EditorIconButton>

          <EditorPillDivider />

          <EditorIconButton label="Insert column left" onClick={run((c) => c.addColumnBefore())}>
            <BetweenVerticalStart size={16} />
          </EditorIconButton>
          <EditorIconButton label="Insert column right" onClick={run((c) => c.addColumnAfter())}>
            <BetweenVerticalEnd size={16} />
          </EditorIconButton>
          <EditorIconButton label="Delete column" danger disabled={!state.canDeleteColumn} onClick={run((c) => c.deleteColumn())}>
            <Columns2 size={16} />
          </EditorIconButton>

          <EditorPillDivider />

          <EditorIconButton label="Merge cells" disabled={!state.canMerge} onClick={run((c) => c.mergeCells())}>
            <TableCellsMerge size={16} />
          </EditorIconButton>
          <EditorIconButton label="Split cell" disabled={!state.canSplit} onClick={run((c) => c.splitCell())}>
            <TableCellsSplit size={16} />
          </EditorIconButton>

          <EditorPillDivider />

          <EditorIconButton label="Header row on/off" onClick={run((c) => c.toggleHeaderRow())}>
            <PanelTop size={16} />
          </EditorIconButton>
          <EditorIconButton label="Header column on/off" onClick={run((c) => c.toggleHeaderColumn())}>
            <PanelLeft size={16} />
          </EditorIconButton>

          <EditorPillDivider />

          <EditorIconButton label="Delete table" danger onClick={run((c) => c.deleteTable())}>
            <Trash2 size={16} />
          </EditorIconButton>
        </div>
      )}
    </BubbleMenu>
  );
});
