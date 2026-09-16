"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "@/infrastructure/http/api";
import { VersionHistoryPanel, type ContentStatusHistoryResponse } from "@/domains/publishing";
import type { TiptapDocument } from "@/shared/types/editor.types";

interface VersionSummary {
  id: string;
  seq: number;
  kind: "AUTO" | "MANUAL" | "WORKFLOW";
  label: string | null;
  createdAt: string;
  createdById: string | null;
  createdByName: string | null;
}

interface VersionDetail extends VersionSummary {
  body: string | null; // JSON string of the Tiptap document
}

interface VersionHistoryOrchestratorProps {
  lessonId: string;
  open: boolean;
  onClose: () => void;
  refreshKey?: number;
  onRestore: (body: TiptapDocument, source: VersionSummary) => Promise<void>;
  renderEditor: (previewDoc: TiptapDocument, selectedId: string) => React.ReactNode;
  courseId?: string;
  isSuView?: boolean;
  embedded?: boolean;
  /**
   * Base URL for this lesson's document (no trailing slash) — versions live at
   * `${documentBaseUrl}/versions`. Course lessons and Event lessons are served by different
   * backend routes (`/api/documents/LESSON/{id}` vs `/api/v1/events/lessons/{id}/document`),
   * so the caller who knows which kind of lesson this is must supply it. Defaults to the Course
   * lesson route for backward compatibility.
   */
  documentBaseUrl?: string;
}

/**
 * VersionHistoryOrchestrator: Connects lesson document version history and course status
 * history to VersionHistoryPanel. Owned by the content workspace (Course/Event lessons).
 */
export function VersionHistoryOrchestrator({
  lessonId,
  open,
  onClose,
  refreshKey,
  onRestore,
  renderEditor,
  courseId,
  isSuView,
  embedded,
  documentBaseUrl,
}: VersionHistoryOrchestratorProps) {
  const base = documentBaseUrl ?? `/api/documents/LESSON/${lessonId}`;
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<VersionDetail | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [statusHistory, setStatusHistory] = useState<ContentStatusHistoryResponse[]>([]);
  const [statusHistoryLoading, setStatusHistoryLoading] = useState(false);

  const loadVersions = useCallback(async () => {
    if (!lessonId) {
      setVersions([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await api.get<VersionSummary[]>(`${base}/versions`);
      const filteredList = (list ?? []).filter((v) => v.kind !== "WORKFLOW");
      setVersions(filteredList);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [lessonId, base]);

  const loadStatusHistory = useCallback(async () => {
    if (!courseId) return;
    setStatusHistoryLoading(true);
    try {
      const data = await api.get<ContentStatusHistoryResponse[]>(
        `/api/courses/${courseId}/status-history`
      );
      setStatusHistory(data ?? []);
    } catch {
      setStatusHistory([]);
    } finally {
      setStatusHistoryLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadVersions();
      if (isSuView || courseId) {
        loadStatusHistory();
      }
    }
  }, [open, refreshKey, loadVersions, loadStatusHistory, isSuView, courseId]);

  const selectVersion = useCallback(
    async (v: VersionSummary) => {
      if (!lessonId) return;
      setPreviewLoading(true);
      try {
        const detail = await api.get<VersionDetail>(`${base}/versions/${v.id}`);
        setSelected(detail);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load version");
      } finally {
        setPreviewLoading(false);
      }
    },
    [lessonId, base]
  );

  return (
    <VersionHistoryPanel
      open={open}
      onClose={onClose}
      versions={versions}
      loading={loading}
      error={error}
      selected={selected}
      previewLoading={previewLoading}
      onSelectVersion={selectVersion}
      onRestore={async (doc, source) => {
        await onRestore(doc, source);
        setSelected(null);
      }}
      onRetryLoad={() => {
        loadVersions();
        if (isSuView || courseId) loadStatusHistory();
      }}
      renderEditor={renderEditor}
      isSuView={isSuView}
      statusHistory={statusHistory}
      statusHistoryLoading={statusHistoryLoading}
      embedded={embedded}
    />
  );
}
