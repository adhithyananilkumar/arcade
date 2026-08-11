// domains/assessments/lib/uploadPromptImage.ts
// Image upload for the question prompt editor. Thin wrapper around the shared infra upload
// flow — kept separate from apps/creator/editor/lib/imageUpload.ts so this domain never imports
// from apps/ (ADR-001).

import { uploadFileToStorage, uploadFileToStorageWithProgress } from "@/infrastructure/media/upload";

export const PROMPT_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export function uploadPromptImage(file: File): Promise<string> {
  return uploadFileToStorage(file, PROMPT_IMAGE_TYPES);
}

export function uploadPromptImageWithProgress(
  file: File,
  options?: { onProgress?: (percent: number) => void; signal?: AbortSignal }
): Promise<string> {
  return uploadFileToStorageWithProgress(
    file,
    PROMPT_IMAGE_TYPES,
    options?.onProgress,
    options?.signal
  );
}
