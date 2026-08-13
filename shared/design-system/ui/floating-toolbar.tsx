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
  centerX,
}: {
  children: React.ReactNode;
  /**
   * Viewport-relative px to horizontally center the pill on, measured from the
   * actual element it should align with (e.g. the badge canvas's own
   * getBoundingClientRect center) rather than assumed from a fixed reservation
   * — a flat "subtract N px for the sidebar" heuristic only lines up by
   * coincidence, since the toolbar centers on the full viewport while content
   * elsewhere may be centering inside a narrower max-width box; the two "100%"
   * reference frames don't actually match at most viewport sizes. Omit to
   * center on the full viewport (RichTextToolbar's case — no narrower content
   * box to align with).
   */
  centerX?: number;
}) {
  return createPortal(
    centerX !== undefined ? (
      <div
        className="pointer-events-none fixed top-[70px] z-[70] transition-[left] duration-300"
        style={{ left: centerX, transform: "translateX(-50%)" }}
      >
        <div className="pointer-events-auto flex items-center max-w-[calc(100vw-2rem)] px-4 py-1.5 overflow-x-auto whitespace-nowrap rounded-full bg-white/60 backdrop-blur-md shadow-sm">
          {children}
        </div>
      </div>
    ) : (
      <div className="flex justify-center pointer-events-none fixed top-[70px] inset-x-0 z-[70]">
        <div className="pointer-events-auto flex items-center max-w-[calc(100vw-2rem)] px-4 py-1.5 overflow-x-auto whitespace-nowrap rounded-full bg-white/60 backdrop-blur-md shadow-sm">
          {children}
        </div>
      </div>
    ),
    document.body
  );
}
