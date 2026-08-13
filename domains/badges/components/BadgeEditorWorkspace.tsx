"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { BadgeToolbar } from "./BadgeToolbar";
import { BadgeZoomControls, MIN_ZOOM, MAX_ZOOM, type ZoomState } from "./BadgeZoomControls";
import type { BadgeEditorState } from "../hooks/useBadgeEditor";

// Konva touches the canvas/DOM at import time — must never run during SSR.
const BadgeCanvas = dynamic(() => import("./BadgeCanvas").then((m) => m.BadgeCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-xs text-[#14142b]/40">Loading editor…</div>
  ),
});

const MIN_CANVAS_SIZE = 360;
const MAX_CANVAS_SIZE = 860;
/** Fit mode targets ~65% of the viewport height — the badge should read as the dominant element. */
const TARGET_FRACTION_OF_VIEWPORT_HEIGHT = 0.65;

/**
 * The main-workspace half of the Badge Editor: the floating toolbar (portalled,
 * anchored the same way as the Lesson editor's), the badge itself sized to
 * dominate the available space and centered in it, and a bottom zoom control
 * bar. No card, no border, no background of its own — the badge geometry is
 * the only thing that reads as a canvas. Design/Properties/Layers render
 * separately, inside the shared Studio right sidebar (see EditorRightSidebar +
 * BadgeEditorContextPanel) — this component only owns the toolbar, the badge,
 * and the zoom control.
 */
export function BadgeEditorWorkspace({ editor }: { editor: BadgeEditorState }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [fitSize, setFitSize] = useState(MIN_CANVAS_SIZE);
  const [zoom, setZoom] = useState<ZoomState>("fit");

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Width comes from the host's own measured box (reliably constrained by the
    // surrounding flex/max-w layout). Height is derived from the viewport rather
    // than the host's measured height: this host sits inside several nested flex
    // containers whose ancestor chain doesn't always resolve to a definite pixel
    // height, so trusting a possibly-collapsed contentRect.height was the reason
    // the badge kept landing on MIN_CANVAS_SIZE instead of dominating the
    // workspace the way it should.
    const recompute = (width: number) => {
      const target = Math.min(width, window.innerHeight * TARGET_FRACTION_OF_VIEWPORT_HEIGHT);
      setFitSize(Math.max(MIN_CANVAS_SIZE, Math.min(MAX_CANVAS_SIZE, target)));
    };

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      recompute(entry.contentRect.width);
    });
    observer.observe(host);

    const onWindowResize = () => recompute(host.getBoundingClientRect().width);
    window.addEventListener("resize", onWindowResize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  const documentWidth = editor.doc?.canvas.width || 1024;
  const fitPercent = (fitSize / documentWidth) * 100;
  const canvasSize = zoom === "fit" ? fitSize : (documentWidth * Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom))) / 100;

  if (editor.loadError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm text-gray-500">{editor.loadError}</p>
      </div>
    );
  }

  if (!editor.doc) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#14142b]/15 border-t-[#14142b]" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center">
      {!editor.readOnly && <BadgeToolbar editor={editor} />}

      <div ref={hostRef} className="flex min-h-0 w-full flex-1 items-center justify-center overflow-auto">
        <BadgeCanvas
          document={editor.doc}
          onChange={editor.handleChange}
          selectedId={editor.selectedId}
          onSelect={editor.handleSelect}
          size={canvasSize}
          showGuides={!editor.previewMode}
          readOnly={editor.readOnly || editor.previewMode}
        />
      </div>

      <div className="flex w-full flex-shrink-0 flex-col items-center gap-2 pb-2 pt-1">
        <div className="h-4 text-[11px] text-[#14142b]/40">
          {!editor.readOnly && editor.saveState === "saving" && "Saving…"}
          {!editor.readOnly && editor.saveState === "saved" && "Saved"}
          {!editor.readOnly && editor.saveState === "error" && (
            <span className="text-red-500">Failed to save — retrying on next edit</span>
          )}
        </div>
        <BadgeZoomControls zoom={zoom} fitPercent={fitPercent} onZoomChange={setZoom} />
      </div>
    </div>
  );
}
