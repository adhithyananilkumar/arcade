// features/content/blocks/registry.ts
// Single source of truth for every custom (non-StarterKit) block type: button, toggle,
// callout, roadmap, and future additions. Each block is defined once in its own folder
// (extension + optional editor NodeView + optional learner renderer + command) and
// registered here — buildExtensions(), blockCommands.ts, and TiptapContentView all derive
// from this list instead of being hand-edited independently. See docs on Phase 0 of the
// block-editing architecture for why this exists.

// NOTE (editor UI replacement): callout/columns/math/mermaid/embed used to be registered
// here too, but are now superseded 1:1 by reactjs-tiptap-editor's own Callout/Column/
// Katex/Mermaid/Iframe extensions (wired directly in apps/creator/editor/extensions/index.ts).
// Only the truly custom, backend-tied blocks stay in this registry.

import type { BlockDefinition } from "./types";
import { buttonBlock } from "./button";
import { toggleBlock } from "./toggle";
import { roadmapBlock } from "./roadmap";
import { quizBlock } from "./quiz";

const BLOCKS: BlockDefinition[] = [buttonBlock, toggleBlock, quizBlock, roadmapBlock];

export function getBlockDefinitions(): BlockDefinition[] {
  return BLOCKS;
}

export function getBlockExtensions() {
  return BLOCKS.map((b) => b.extension);
}

export function getBlockCommands() {
  return BLOCKS.map((b) => b.command).filter((c): c is NonNullable<typeof c> => Boolean(c));
}

const RENDER_COMPONENTS = new Map(
  BLOCKS.filter((b) => b.renderComponent).map((b) => [b.type, b.renderComponent!])
);

/** Learner-facing renderer for a custom block type, if one is registered. */
export function getBlockRenderer(type: string) {
  return RENDER_COMPONENTS.get(type);
}
