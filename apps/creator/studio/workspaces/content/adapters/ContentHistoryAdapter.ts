import { api } from "@/infrastructure/http/api";
import type { StudioHistoryAdapter, StudioRevision } from "@/apps/creator/studio/core/StudioHistory";
import type { TiptapDocument } from "@/shared/types/editor.types";

export interface DocumentVersionPayload {
  id: string;
  seq: number;
  kind: string;
  label?: string | null;
  createdAt: string;
  body?: TiptapDocument | null;
  snapshot?: string | null;
}

interface VersionSummaryApi {
  id: string;
  seq: number;
  kind: string;
  label?: string | null;
  createdAt: string;
  authorId?: string | null;
  authorName?: string | null;
  summary?: string | null;
}

/**
 * ownerType is the backend's Document.OwnerType enum name (e.g. "LESSON", "EVENT_LESSON",
 * "COURSE_METADATA", "BADGE", "EXAM_QUESTION") — this adapter is generic across all of them,
 * the one history implementation every Studio workspace should use (see StudioHistoryPanel).
 */
export function createContentHistoryAdapter(
  ownerType: string,
  ownerId: string,
  onRestoreContent?: (body: TiptapDocument) => void
): StudioHistoryAdapter<DocumentVersionPayload> {
  const base = `/api/documents/${ownerType}/${ownerId}`;
  return {
    async list(): Promise<StudioRevision[]> {
      const versions = await api.get<VersionSummaryApi[]>(`${base}/versions`);
      return versions.map((v: VersionSummaryApi) => ({
        id: v.id,
        versionNumber: v.seq,
        label: v.label,
        createdAt: v.createdAt,
        authorName: v.authorName ?? (v.authorId ? `Author (${v.authorId.slice(0, 6)})` : null),
        summary: v.summary,
        kind: v.kind === "AUTOSAVE" ? "autosave" : "draft",
      }));
    },
    async preview(versionId: string): Promise<DocumentVersionPayload> {
      return api.get<DocumentVersionPayload>(`${base}/versions/${versionId}`);
    },
    async restore(versionId: string): Promise<void> {
      const full = await api.get<DocumentVersionPayload>(`${base}/versions/${versionId}`);
      if (full.body && onRestoreContent) {
        onRestoreContent(full.body);
      }
    },
  };
}
