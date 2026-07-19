// features/content/editor/lib/yjs.ts
// Yjs plumbing for the version-history substrate.
//
// The editor binds to a Y.Doc (the CRDT source of truth). We persist its encoded
// state and periodic snapshots to the backend as base64 over JSON. The backend
// stores these as opaque blobs — single-writer today, real-time collaboration
// (a sync provider) is a later add-on that needs no schema change.

import * as Y from "yjs";

/**
 * Create the document's Y.Doc.
 *
 * `gc: false` disables garbage collection so deleted content is retained in the
 * CRDT history — that is what makes snapshots restorable and (later) diffable.
 * The tradeoff is that the doc grows with edit history; acceptable for authored
 * documents and periodically flattenable.
 */
export function createYDoc(): Y.Doc {
  return new Y.Doc({ gc: false });
}

/** Hydrate a Y.Doc from persisted base64 state. No-op if state is null/empty. */
export function applyBase64Update(ydoc: Y.Doc, base64State: string | null | undefined): void {
  if (!base64State) return;
  Y.applyUpdate(ydoc, base64ToBytes(base64State));
}

/** Encode the full CRDT state (the source of truth) for persistence. */
export function encodeStateBase64(ydoc: Y.Doc): string {
  return bytesToBase64(Y.encodeStateAsUpdate(ydoc));
}

/** Encode a lightweight snapshot marker into the doc's history for a version row. */
export function encodeSnapshotBase64(ydoc: Y.Doc): string {
  return bytesToBase64(Y.encodeSnapshot(Y.snapshot(ydoc)));
}

// ── base64 ⇄ Uint8Array (browser-safe, no Buffer) ─────────────────────────────

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000; // avoid stack overflow on large blobs
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
