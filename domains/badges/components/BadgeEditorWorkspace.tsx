"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { BadgeToolbar } from "./BadgeToolbar";
import type { BadgeEditorState } from "../hooks/useBadgeEditor";

// Konva touches the canvas/DOM at import time — must never run during SSR.
const BadgeCanvas = dynamic(() => import("./BadgeCanvas").then((m) => m.BadgeCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-xs text-[#14142b]/40">Loading editor…</div>
  ),
});

const MIN_CANVAS_SIZE = 320;
const MAX_CANVAS_SIZE = 780;
/** The badge should read as the dominant element — target ~70% of the available height. */
const TARGET_FRACTION_OF_HEIGHT = 0.7;

/**
 * The main-workspace half of the Badge Editor: the floating toolbar (portalled,
 * anchored the same way as the Lesson editor's) plus the badge itself, sized to
 * dominate the available space and centered in it. No card, no border, no
 * background of its own — the badge geometry is the only thing that reads as a
 * canvas. Design/Properties/Layers render separately, inside the shared Studio
 * right sidebar (see EditorRightSidebar + BadgeDesignPanel/BadgePropertiesPanel/
 * BadgeLayersPanel) — this component only owns the toolbar + the badge itself.
 */
export function BadgeEditorWorkspace({ editor }: { editor: BadgeEditorState }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState(MIN_CANVAS_SIZE);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      const target = Math.min(width, height * TARGET_FRACTION_OF_HEIGHT);
      setCanvasSize(Math.max(MIN_CANVAS_SIZE, Math.min(MAX_CANVAS_SIZE, target)));
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

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

      <div ref={hostRef} className="flex min-h-0 w-full flex-1 items-center justify-center">
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

      <div className="h-4 text-[11px] text-[#14142b]/40">
        {!editor.readOnly && editor.saveState === "saving" && "Saving…"}
        {!editor.readOnly && editor.saveState === "saved" && "Saved"}
        {!editor.readOnly && editor.saveState === "error" && (
          <span className="text-red-500">Failed to save — retrying on next edit</span>
        )}
      </div>
    </div>
  );
}
