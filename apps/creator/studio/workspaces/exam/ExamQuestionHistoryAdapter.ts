import { api } from "@/infrastructure/http/api";
import type { StudioHistoryAdapter, StudioRevision } from "@/apps/creator/studio/core/StudioHistory";
import type { RestoredQuestionSnapshot } from "@/domains/assessments";

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
  body?: string | null; // JSON string of a BankQuestionResponse-shaped snapshot
}

/**
 * One question's version history — backed by the same generic `/api/documents/{ownerType}/{id}`
 * endpoint every other content type uses (see DocumentController on the backend), with
 * `ownerType = EXAM_QUESTION`. Unlike lesson/badge history, the snapshot body is a whole question
 * DTO (type/options/points/prompt/…), not a bare Tiptap document, so this can't reuse
 * `createContentHistoryAdapter` as-is — the shape genuinely differs, not just the URL.
 */
export function createExamQuestionHistoryAdapter(
  questionId: string,
  onRestore: (snapshot: RestoredQuestionSnapshot) => void
): StudioHistoryAdapter<VersionDetailApi> {
  const base = `/api/documents/EXAM_QUESTION/${questionId}`;
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
        onRestore(JSON.parse(full.body) as RestoredQuestionSnapshot);
      }
    },
  };
}
