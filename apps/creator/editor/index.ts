// features/content/editor/index.ts
// Public surface of the editor-engine submodule (authoring only).
// Consumers must import from here, not from internal files.
export { ArcadeEditor } from "./components/ArcadeEditor";
export type { ArcadeEditorHandle } from "./components/ArcadeEditor";
export { EditorSkeleton } from "./components/EditorSkeleton";
export { useArcadeEditor } from "./hooks/useArcadeEditor";
export {
  createYDoc,
  applyBase64Update,
  encodeStateBase64,
  encodeSnapshotBase64,
  bytesToBase64,
  base64ToBytes,
} from "./lib/yjs";
