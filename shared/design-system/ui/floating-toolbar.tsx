"use client";

import { createPortal } from "react-dom";

/**
 * Fixed, centered, pill-shaped floating toolbar shell — portalled to <body> so
 * `position: fixed` resolves against the viewport regardless of blur/transform
 * containing blocks further up the tree (the editor card's own backdrop-blur
 * would otherwise re-anchor it and make it scroll with the card instead of
 * staying pinned under the title pill).
 *
 * Every Studio editor toolbar (Lesson's RichTextToolbar, Badge's BadgeToolbar,
 * ...) renders its own button groups inside this shell so they all anchor at
 * the same position with the same visual language, instead of each editor
 * reimplementing the pill/blur/portal chrome itself.
 */
export function FloatingToolbar({
  children,
  rightInset = 0,
}: {
  children: React.ReactNode;
  /**
   * Px reserved on the right (e.g. an open right sidebar) so the pill centers
   * itself in the actually-visible workspace instead of the full viewport —
   * the same compensation the editor's own content area applies to itself.
   * Defaults to 0 (full-viewport centering), matching existing callers.
   */
  rightInset?: number;
}) {
  return createPortal(
    <div
      className="flex justify-center pointer-events-none fixed top-[70px] inset-x-0 z-[70] transition-[padding] duration-300"
      style={{ paddingRight: rightInset }}
    >
      <div className="pointer-events-auto flex items-center max-w-[calc(100vw-2rem)] px-4 py-1.5 overflow-x-auto whitespace-nowrap rounded-full bg-white/60 backdrop-blur-md shadow-sm">
        {children}
      </div>
    </div>,
    document.body
  );
}
