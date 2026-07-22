"use client";

// TEMPORARY perf-diagnosis page — DELETE after the latency investigation.
// Mounts the editor in isolated variants so typing latency can be measured
// without auth/backend:
//   /dev-editor-perf                → full ArcadeEditor + ydoc   (mirrors production)
//   /dev-editor-perf?mode=noydoc    → full ArcadeEditor, no ydoc (History mode)
//   /dev-editor-perf?mode=bare      → EditorContent only + ydoc  (no toolbar/bubbles)
//   /dev-editor-perf?mode=barenoydoc→ EditorContent only, no ydoc

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { EditorContent } from "@tiptap/react";
import { RichTextProvider } from "reactjs-tiptap-editor";
import { ArcadeEditor, useArcadeEditor, createYDoc, encodeStateBase64 } from "@/apps/creator/editor";
import type { TiptapDocument } from "@/shared/types/editor.types";
import { RichTextToolbar } from "@/apps/creator/editor/components/RichTextToolbar";
import { RichTextBubbles } from "@/apps/creator/editor/components/RichTextBubbles";
import {
  RichTextBubbleText,
  RichTextBubbleLink,
  RichTextBubbleMenuDragHandle,
} from "reactjs-tiptap-editor/bubble";
import "reactjs-tiptap-editor/style.css";

// Only the bubbles that must listen all the time. Used to test how much of the
// bubble layer's per-transaction cost comes from the 13 node-specific menus.
function LeanBubbles({ drag = true }: { drag?: boolean }) {
  return (
    <>
      <RichTextBubbleText />
      <RichTextBubbleLink />
      {drag && <RichTextBubbleMenuDragHandle />}
    </>
  );
}

function BareEditor({
  ydoc,
  chrome,
  seed,
}: {
  ydoc?: ReturnType<typeof createYDoc>;
  chrome?: "toolbar" | "bubbles" | "provider" | "leanbubbles" | "nodrag";
  seed?: TiptapDocument;
}) {
  const { editor } = useArcadeEditor({
    ydoc,
    seedContent: seed,
    placeholder: "Bare variant — type here",
  });
  if (!editor) return <p>loading…</p>;
  // Dev-only affordance: lets the measurement scripts drive real ProseMirror
  // selections instead of synthetic DOM ones.
  (window as unknown as { __editor?: unknown }).__editor = editor;
  const content = (
    <div className="rounded-xl border border-gray-200 bg-white px-8 py-6">
      <EditorContent editor={editor} />
    </div>
  );
  if (!chrome) return content;
  return (
    <RichTextProvider editor={editor}>
      {chrome === "toolbar" && <RichTextToolbar />}
      {content}
      {chrome === "bubbles" && <RichTextBubbles editor={editor} />}
      {chrome === "leanbubbles" && <LeanBubbles />}
      {chrome === "nodrag" && <LeanBubbles drag={false} />}
    </RichTextProvider>
  );
}

/** Synthetic lesson body, so cost that scales with document size is visible. */
function buildSeedDoc(paragraphs: number): TiptapDocument {
  const sentence =
    "Arcade is a unified learning platform for institutions, educators and learners. ";
  return {
    type: "doc" as const,
    content: Array.from({ length: paragraphs }, (_, i) => ({
      type: "paragraph",
      content: [{ type: "text", text: `${i + 1}. ${sentence.repeat(4)}` }],
    })),
  };
}

function PerfHarness() {
  const params = useSearchParams();
  const mode = params.get("mode") ?? "full";
  // ?size=N seeds N paragraphs. The default of 0 keeps the historical variants
  // comparable with earlier measurements.
  const size = Number(params.get("size") ?? "0") || 0;
  // ?save=1 makes onSave do exactly what CourseEditorOrchestrator.handleSave does
  // on the main thread (minus the network): full JSON serialization plus a full
  // CRDT-state encode. Without this the harness measures an editor that never saves.
  const withSave = params.get("save") === "1";

  const ydoc = useMemo(
    () => (mode === "noydoc" || mode === "barenoydoc" ? undefined : createYDoc()),
    [mode]
  );

  const seed = useMemo(() => (size > 0 ? buildSeedDoc(size) : undefined), [size]);

  const onSave = useMemo(() => {
    if (!withSave) return undefined;
    return (doc: unknown) => {
      const t0 = performance.now();
      const json = JSON.stringify(doc);
      const tJson = performance.now();
      const state = ydoc ? encodeStateBase64(ydoc) : "";
      const tState = performance.now();
      const w = window as unknown as { __saveCost?: unknown[] };
      w.__saveCost = w.__saveCost ?? [];
      w.__saveCost.push({
        jsonMs: +(tJson - t0).toFixed(1),
        encodeMs: +(tState - tJson).toFixed(1),
        totalMs: +(tState - t0).toFixed(1),
        bodyKB: Math.round(json.length / 1024),
        stateKB: Math.round(state.length / 1024),
      });
    };
  }, [withSave, ydoc]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-1 text-lg font-bold">
        Editor perf harness — mode: {mode}
        {size ? ` · ${size} paragraphs` : ""}
        {withSave ? " · save on" : ""}
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        full | chromeless | noydoc | bare | barenoydoc | toolbar | bubbles &nbsp;·&nbsp; &amp;size=N
        &amp;save=1
      </p>
      {mode === "bare" || mode === "barenoydoc" ? (
        <BareEditor ydoc={ydoc} seed={seed} />
      ) : mode === "toolbar" || mode === "bubbles" || mode === "provider" || mode === "leanbubbles" || mode === "nodrag" ? (
        <BareEditor ydoc={ydoc} chrome={mode} seed={seed} />
      ) : (
        <ArcadeEditor
          ydoc={ydoc}
          seedContent={seed}
          onSave={onSave}
          chromeless={mode === "chromeless"}
          placeholder="Type here to measure latency…"
        />
      )}
    </div>
  );
}

export default function DevEditorPerfPage() {
  return (
    <Suspense fallback={null}>
      <PerfHarness />
    </Suspense>
  );
}
