// features/content/blocks/types.ts
// Contract every custom block type (button, toggle, callout, roadmap, ...) implements.
// A block that satisfies BlockDefinition is wired into authoring, the command palette, and
// learner playback from a single object — see registry.ts.

import type { Extension, Node } from "@tiptap/core";
import type { ComponentType } from "react";
import type { TiptapNode, BlockCommand } from "@/shared/types/editor.types";

export interface BlockRenderProps {
  node: TiptapNode;
  /** Already-rendered children (for container blocks like Toggle/Callout). */
  children: React.ReactNode;
}

export interface BlockDefinition {
  /** Must match the Tiptap node `name` / TiptapNodeType string. */
  type: string;
  /** Tiptap extension registered in the shared editor extension array. */
  extension: Node | Extension;
  /**
   * Learner-facing read-only renderer. Omit for authoring-only nodes that have
   * no learner-facing representation yet (falls back to TiptapContentView's
   * default children-passthrough).
   */
  renderComponent?: ComponentType<BlockRenderProps>;
  /** Slash-menu / "+" gutter command. Omit for nodes inserted some other way. */
  command?: BlockCommand;
}
