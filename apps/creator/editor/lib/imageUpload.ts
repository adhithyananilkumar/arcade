// apps/creator/editor/lib/imageUpload.ts
// Tiptap-shaped wrappers around the shared infrastructure upload flow (presign -> direct PUT ->
// register metadata). Used as the `upload` callback for reactjs-tiptap-editor's Image/Video/
// Attachment/Mermaid/Drawer extensions, which all share the `(file: File) => Promise<string>`
// signature.

import { uploadFileToStorage, uploadFileToStorageWithProgress } from "@/infrastructure/media/upload";
import { toast } from "sonner";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"];

async function uploadFile(file: File, allowedTypes: string[] | null): Promise<string> {
  try {
    return await uploadFileToStorage(file, allowedTypes);
  } catch (error: any) {
    console.error("Upload error:", error);
    toast.error(error.message || "Failed to upload file");
    return ""; // Return empty string to avoid unhandled rejection in tiptap
  }
}

/** Image-only upload — backs the Image extension's `upload` option. */
export function uploadImageFile(file: File): Promise<string> {
  return uploadFile(file, IMAGE_TYPES);
}

/**
 * Generic upload for Video/Attachment/Mermaid/Drawer — the backend's allow-list decides
 * what's actually accepted; this just skips the image-only client-side pre-check.
 */
export function uploadMediaFile(file: File): Promise<string> {
  return uploadFile(file, null);
}

/**
 * Video upload with progress reporting, used by the custom VideoUploadButton dialog
 * (apps/creator/editor/components/VideoUploadButton.tsx). Unlike `uploadFile` above —
 * which swallows errors into a toast so it never rejects the promise the vendor Video
 * modal is built to ignore — this rejects on failure so the dialog can show an inline
 * error state and let the user retry, and supports cancellation via AbortSignal.
 */
export function uploadVideoFile(
  file: File,
  options?: { onProgress?: (percent: number) => void; signal?: AbortSignal }
): Promise<string> {
  return uploadFileToStorageWithProgress(file, null, options?.onProgress, options?.signal);
}

/**
 * Image upload with progress reporting, used by the custom ImageUploadButton dialog
 * (apps/creator/editor/components/ImageUploadButton.tsx). Same rejects-on-failure /
 * cancellable contract as `uploadVideoFile`, restricted to IMAGE_TYPES.
 */
export function uploadImageFileWithProgress(
  file: File,
  options?: { onProgress?: (percent: number) => void; signal?: AbortSignal }
): Promise<string> {
  return uploadFileToStorageWithProgress(file, IMAGE_TYPES, options?.onProgress, options?.signal);
}
