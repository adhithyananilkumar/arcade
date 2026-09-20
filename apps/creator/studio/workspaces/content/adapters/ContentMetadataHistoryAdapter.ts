import { api } from "@/infrastructure/http/api";
import type { StudioHistoryAdapter, StudioRevision } from "@/apps/creator/studio/core/StudioHistory";

interface VersionSummaryApi {
  id: string;
  seq: number;
  kind: string;
  label?: string | null;
  createdAt: string;
  createdById?: string | null;
  createdByName?: string | null;
}

interface VersionDetailApi extends VersionSummaryApi {
  body?: string | null; // JSON string of the metadata snapshot (shape depends on ownerType)
}

/**
 * Course/Event top-level metadata (title, description, pricing, …) history — same generic
 * `/api/documents/{ownerType}/{id}` endpoint every owner type uses, but the snapshot body is a
 * plain metadata object rather than a Tiptap document, so (like exam questions) this can't reuse
 * `createContentHistoryAdapter`'s Tiptap-typed shape. The course/event row stays the source of
 * truth for these fields (see CourseMetadataDocumentAuthorizer's backend doc) — restoring re-runs
 * the normal save path with the old values, it doesn't hand editing over to this document.
 */
export function createContentMetadataHistoryAdapter<TSnapshot>(
  ownerType: "COURSE_METADATA" | "EVENT_METADATA",
  ownerId: string,
  onRestore: (snapshot: TSnapshot) => void
): StudioHistoryAdapter<VersionDetailApi> {
  const base = `/api/documents/${ownerType}/${ownerId}`;
  return {
    async list(): Promise<StudioRevision[]> {
      const versions = await api.get<VersionSummaryApi[]>(`${base}/versions`);
      return versions
        .filter((v) => v.kind !== "WORKFLOW")
        .map((v) => ({
          id: v.id,
          versionNumber: v.seq,
          label: v.label,
          createdAt: v.createdAt,
          authorName: v.createdByName ?? (v.createdById ? `Author (${v.createdById.slice(0, 6)})` : null),
          kind: "autosave" as const,
        }));
    },
    async preview(versionId: string): Promise<VersionDetailApi> {
      return api.get<VersionDetailApi>(`${base}/versions/${versionId}`);
    },
    async restore(versionId: string): Promise<void> {
      const full = await api.get<VersionDetailApi>(`${base}/versions/${versionId}`);
      if (full.body) {
        onRestore(JSON.parse(full.body) as TSnapshot);
      }
    },
  };
}
