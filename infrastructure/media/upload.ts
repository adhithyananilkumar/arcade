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

/** Upload a file to storage via presign -> PUT -> register-metadata. Throws on failure. */
export async function uploadFileToStorage(
  file: File,
  allowedTypes: string[] | null
): Promise<string> {
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
