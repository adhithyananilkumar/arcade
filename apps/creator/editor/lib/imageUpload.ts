// apps/creator/editor/lib/imageUpload.ts
// Real media upload: presign -> direct PUT to the bucket -> register metadata.
// Used as the `upload` callback for reactjs-tiptap-editor's Image/Video/Attachment/
// Mermaid/Drawer extensions, which all share the `(file: File) => Promise<string>` signature.

import { api } from "@/infrastructure/http/api";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"];
const MAX_BYTES = 25 * 1024 * 1024; // 25MB — mirrors MediaService's server-side ceiling

interface PresignResponse {
  key: string;
  uploadUrl: string;
  publicUrl: string;
}

async function uploadFile(file: File, allowedTypes: string[] | null): Promise<string> {
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`File exceeds the ${MAX_BYTES / 1024 / 1024}MB limit`);
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
