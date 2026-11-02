/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Infrastructure
 * Module: Media
 *
 * Purpose:
 * Generic presign -> direct PUT to bucket -> register-metadata upload flow, shared by every
 * feature that needs to upload a file to R2 (the content editor's image/video buttons, the
 * question bank's rich-text prompt editor, etc). No Tiptap-specific typing lives here — that
 * stays in each caller's own thin wrapper.
 * - Do not import anything from domains/ or apps/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { api } from "@/infrastructure/http/api";

interface PresignResponse {
  key: string;
  uploadUrl: string;
  publicUrl: string;
}

/**
 * PUT a file straight to a presigned storage URL, reporting progress (0–100). The building block
 * for flows whose presign/register steps are not the generic media ones (e.g. live wallpapers).
 */
export function putToPresignedUrl(
  url: string,
  file: Blob,
  contentType: string,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Upload cancelled", "AbortError"));
      return;
    }
    const xhr = new XMLHttpRequest();
    const onAbort = () => xhr.abort();
    signal?.addEventListener("abort", onAbort);
    const cleanup = () => signal?.removeEventListener("abort", onAbort);
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
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
}

/** Upload a file to storage via presign -> PUT -> register-metadata with fallback to relayed multipart upload. */
export async function uploadFileToStorage(
  file: File,
  allowedTypes: string[] | null
): Promise<string> {
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
  }

  // 1. Try direct-to-bucket presigned upload
  try {
    const presign = await api.post<PresignResponse>("/api/media/presign", {
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
    });

    const putRes = await fetch(presign.uploadUrl, {
      method: "PUT",
      headers: file.type ? { "Content-Type": file.type } : undefined,
      body: file,
    });

    if (putRes.ok) {
      await api.post("/api/media/metadata", {
        key: presign.key,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      });

      return presign.publicUrl;
    }
  } catch (err) {
    console.warn("Direct bucket upload failed (CORS or network), falling back to backend upload:", err);
  }

  // 2. Fallback to relayed backend multipart upload
  const formData = new FormData();
  formData.append("file", file);
  const relayed = await api.post<{ publicUrl: string }>("/api/media/upload", formData);
  return relayed.publicUrl;
}

/**
 * Upload with progress reporting and cancellation, for UI that wants a progress bar / retry
 * affordance instead of a fire-and-forget promise.
 */
export async function uploadFileToStorageWithProgress(
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

  try {
    const presign = await api.post<PresignResponse>("/api/media/presign", {
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
    });

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      const onAbort = () => xhr.abort();
      signal?.addEventListener("abort", onAbort);
      const cleanup = () => signal?.removeEventListener("abort", onAbort);

      xhr.open("PUT", presign.uploadUrl);
      if (file.type) xhr.setRequestHeader("Content-Type", file.type);
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
      contentType: file.type || "application/octet-stream",
      sizeBytes: file.size,
    });

    return presign.publicUrl;
  } catch (err) {
    if (signal?.aborted) throw err;
    console.warn("Direct upload with progress failed, attempting relayed backend upload:", err);
    const formData = new FormData();
    formData.append("file", file);
    const relayed = await api.post<{ publicUrl: string }>("/api/media/upload", formData);
    onProgress?.(100);
    return relayed.publicUrl;
  }
}
