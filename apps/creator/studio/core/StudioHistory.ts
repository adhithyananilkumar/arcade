/**
 * Studio Core History Architecture
 *
 * Studio owns how history is displayed (StudioHistoryPanel).
 * Domains own where revisions come from (StudioHistoryAdapter).
 */

export interface StudioRevision {
  id: string;
  versionNumber: number;
  label?: string | null;
  createdAt: string;
  authorName?: string | null;
  summary?: string | null;
  kind?: "draft" | "published" | "autosave";
}

/**
 * Generic domain adapter connecting domain-specific revision stores
 * to Studio Core's history presentation.
 */
export interface StudioHistoryAdapter<TRevision = unknown> {
  list(): Promise<StudioRevision[]>;
  preview?(id: string): Promise<TRevision>;
  restore?(id: string): Promise<void>;
}
