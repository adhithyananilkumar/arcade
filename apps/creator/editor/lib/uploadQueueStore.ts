// apps/creator/editor/lib/uploadQueueStore.ts
// Backs the Google-Docs-style upload panel (UploadQueuePanel.tsx): a global queue that
// runs media uploads in the background instead of behind a blocking modal. Selecting a
// file in MediaUploadDialog enqueues it here and closes the dialog immediately — the
// upload keeps running (with progress, cancel and retry) while the author keeps editing.
//
// A plain Zustand store (no persist middleware, mirrors the shape of auth.store.ts) — an
// upload queue is transient in-memory UI state, not something that should survive a
// reload, and it needs to be reachable from multiple components (any number of
// Video/ImageUploadButton instances plus the one shared panel) without prop drilling.

import { create } from "zustand";
import type { Editor } from "@tiptap/react";

export type UploadKind = "image" | "video";
export type UploadItemStatus = "queued" | "uploading" | "done" | "error" | "cancelled";

export interface UploadItem {
  id: string;
  file: File;
  kind: UploadKind;
  status: UploadItemStatus;
  /** 0-100 */
  progress: number;
  /** Set when status flips to "uploading" — used to estimate time remaining. */
  startedAt?: number;
  error?: string;
}

interface EnqueueArgs {
  file: File;
  kind: UploadKind;
  editor: Editor;
  upload: (file: File, options: { onProgress: (percent: number) => void; signal: AbortSignal }) => Promise<string>;
  onInsert: (editor: Editor, src: string) => void;
}

/** Non-reactive per-item runtime state (abort handles, closures) — not stored in Zustand state itself. */
interface RuntimeEntry {
  editor: Editor;
  upload: EnqueueArgs["upload"];
  onInsert: EnqueueArgs["onInsert"];
  controller: AbortController;
}

const runtime = new Map<string, RuntimeEntry>();

// Completed/cancelled rows linger briefly so the success checkmark is actually visible,
// then clean themselves out of the list.
const AUTO_REMOVE_MS = 2500;

interface UploadQueueState {
  items: UploadItem[];
  collapsed: boolean;
  toggleCollapsed: () => void;
  enqueue: (args: EnqueueArgs) => void;
  cancel: (id: string) => void;
  cancelAll: () => void;
  retry: (id: string) => void;
  dismissItem: (id: string) => void;
}

function scheduleRemoval(
  id: string,
  get: () => UploadQueueState,
  set: (fn: (s: UploadQueueState) => Partial<UploadQueueState>) => void
) {
  setTimeout(() => {
    if (get().items.some((item) => item.id === id)) {
      set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
    }
    runtime.delete(id);
  }, AUTO_REMOVE_MS);
}

function runUpload(
  id: string,
  entry: RuntimeEntry,
  set: (fn: (s: UploadQueueState) => Partial<UploadQueueState>) => void,
  get: () => UploadQueueState
) {
  set((state) => ({
    items: state.items.map((item) =>
      item.id === id ? { ...item, status: "uploading" as const, progress: 0, startedAt: Date.now() } : item
    ),
  }));

  const file = get().items.find((item) => item.id === id)?.file;
  if (!file) return;

  entry
    .upload(file, {
      onProgress: (percent) => {
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, progress: percent } : item)),
        }));
      },
      signal: entry.controller.signal,
    })
    .then((src) => {
      if (entry.controller.signal.aborted) return;
      if (!entry.editor.isDestroyed) {
        // onInsert (setVideo/setImageBlock) is `insertContent`, which *replaces* the
        // current selection rather than inserting after it. Left alone, the previous
        // upload's just-inserted node stays selected (it's an atom), so the next
        // completion overwrites it instead of stacking below — only the last upload to
        // finish would survive. Moving the selection to the end of the doc first makes
        // every completion append below whatever's already there, in finish order.
        const endPos = entry.editor.state.doc.content.size;
        entry.editor.chain().focus().setTextSelection(endPos).run();
        entry.onInsert(entry.editor, src);
      }
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? { ...item, status: "done" as const, progress: 100 } : item)),
      }));
      scheduleRemoval(id, get, set);
    })
    .catch((error: unknown) => {
      if ((error as { name?: string }).name === "AbortError") return;
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id
            ? { ...item, status: "error" as const, error: error instanceof Error ? error.message : "Upload failed" }
            : item
        ),
      }));
    });
}

export const useUploadQueueStore = create<UploadQueueState>((set, get) => ({
  items: [],
  collapsed: false,

  toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),

  enqueue: ({ file, kind, editor, upload, onInsert }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const controller = new AbortController();
    runtime.set(id, { editor, upload, onInsert, controller });

    set((state) => ({
      items: [...state.items, { id, file, kind, status: "queued", progress: 0 }],
      collapsed: false,
    }));

    const entry = runtime.get(id);
    if (entry) runUpload(id, entry, set, get);
  },

  cancel: (id) => {
    runtime.get(id)?.controller.abort();
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, status: "cancelled" as const } : item)),
    }));
    scheduleRemoval(id, get, set);
  },

  cancelAll: () => {
    for (const item of get().items) {
      if (item.status === "queued" || item.status === "uploading") {
        runtime.get(item.id)?.controller.abort();
      }
    }
    for (const id of runtime.keys()) runtime.delete(id);
    set({ items: [] });
  },

  retry: (id) => {
    const entry = runtime.get(id);
    if (!entry) return;
    const newController = new AbortController();
    runtime.set(id, { ...entry, controller: newController });
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, status: "queued" as const, progress: 0, error: undefined } : item
      ),
    }));
    runUpload(id, { ...entry, controller: newController }, set, get);
  },

  dismissItem: (id) => {
    runtime.get(id)?.controller.abort();
    runtime.delete(id);
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
  },
}));
