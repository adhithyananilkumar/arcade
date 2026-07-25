// apps/creator/editor/lib/imageUpload.ts
// Real media upload: presign -> direct PUT to the bucket -> register metadata.
// Used as the `upload` callback for reactjs-tiptap-editor's Image/Video/Attachment/
// Mermaid/Drawer extensions, which all share the `(file: File) => Promise<string>` signature.

import { api } from "@/infrastructure/http/api";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"];

interface PresignResponse {
  key: string;
  uploadUrl: string;
  publicUrl: string;
}

import { toast } from "sonner";

async function uploadFile(file: File, allowedTypes: string[] | null): Promise<string> {
  try {
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
    }

    const presign = await api.post<PresignResponse>("/api/media/presign", {
      fileName: file.name,
      contentType: file.type,
    });

    const putRes = await fetch(presign.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!putRes.ok) throw new Error("Upload to storage failed");

    await api.post("/api/media/metadata", {
      key: presign.key,
      fileName: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    });

    return presign.publicUrl;
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
  return uploadFileWithProgress(file, null, options?.onProgress, options?.signal);
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
  return uploadFileWithProgress(file, IMAGE_TYPES, options?.onProgress, options?.signal);
}

async function uploadFileWithProgress(
  file: File,
  allowedTypes: string[] | null,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal
): Promise<string> {
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
  }
  if (signal?.aborted) {
    throw new DOMException("Upload cancelled", "AbortError");
  }

  const presign = await api.post<PresignResponse>("/api/media/presign", {
    fileName: file.name,
    contentType: file.type,
  });

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    const onAbort = () => xhr.abort();
    signal?.addEventListener("abort", onAbort);
    const cleanup = () => signal?.removeEventListener("abort", onAbort);

    xhr.open("PUT", presign.uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      cleanup();
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error("Upload to storage failed"));
    };
    xhr.onerror = () => {
      cleanup();
      reject(new Error("Upload to storage failed"));
    };
    xhr.onabort = () => {
      cleanup();
      reject(new DOMException("Upload cancelled", "AbortError"));
    };
    xhr.send(file);
  });

  await api.post("/api/media/metadata", {
    key: presign.key,
    fileName: file.name,
    contentType: file.type,
    sizeBytes: file.size,
  });

  return presign.publicUrl;
}
