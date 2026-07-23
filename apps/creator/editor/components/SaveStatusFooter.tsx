// apps/creator/editor/components/SaveStatusFooter.tsx
// Autosave indicator, isolated from the editor's render tree.
//
// Why this exists: the status used to be `useState` on ArcadeEditor. Every save cycle
// pushed three state updates (saving -> saved -> idle), and each one re-rendered the
// whole editor chrome — 43 toolbar buttons plus 16 bubble menus. Measured on a
// production build, a *single* keystroke cost ~1.4s of blocked main thread that way,
// and in `chromeless` mode the footer isn't even rendered.
//
// The status now lives in an external store. Only this component subscribes, so a
// status change re-renders a single <div> and nothing else.
"use client";

import { useSyncExternalStore } from "react";
import { useEditorState, type Editor } from "@tiptap/react";

export type SaveStatus = "idle" | "saving" | "saved";

export interface SaveStatusStore {
  get: () => SaveStatus;
  set: (next: SaveStatus) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createSaveStatusStore(): SaveStatusStore {
  let status: SaveStatus = "idle";
  const listeners = new Set<() => void>();
  return {
    get: () => status,
    set(next) {
      if (next === status) return;
      status = next;
      listeners.forEach((l) => l());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** Server snapshot — the status is always "idle" before hydration. */
const getServerSnapshot = (): SaveStatus => "idle";

export function SaveStatusFooter({
  store,
  editor,
}: {
  store: SaveStatusStore;
  editor: Editor;
}) {
  const status = useSyncExternalStore(store.subscribe, store.get, getServerSnapshot);
  // Subscribing here (rather than reading during ArcadeEditor's render) keeps the
  // per-keystroke character-count update scoped to this footer.
  const characters = useEditorState({
    editor,
    selector: ({ editor }) => editor.storage.characterCount?.characters?.() ?? 0,
  });

  return (
    <div className="flex items-center justify-between px-8 py-2 border-t border-gray-100 text-xs text-gray-400">
      <span>{characters} characters</span>
      {status === "saving" && <span>Saving…</span>}
      {status === "saved" && <span className="text-green-600">Saved</span>}
    </div>
  );
}
