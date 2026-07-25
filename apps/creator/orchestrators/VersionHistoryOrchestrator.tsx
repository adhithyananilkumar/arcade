"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "@/infrastructure/http/api";
import { VersionHistoryPanel, type CourseStatusHistoryResponse } from "@/domains/publishing/components/VersionHistoryPanel";
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
}

export function VersionHistoryOrchestrator({
  lessonId,
  open,
  onClose,
  refreshKey,
  onRestore,
  renderEditor,
  courseId,
  isSuView,
}: VersionHistoryOrchestratorProps) {
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<VersionDetail | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [statusHistory, setStatusHistory] = useState<CourseStatusHistoryResponse[]>([]);
  const [statusHistoryLoading, setStatusHistoryLoading] = useState(false);

  const loadVersions = useCallback(async () => {
    if (!lessonId) {
      setVersions([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await api.get<VersionSummary[]>(
        `/api/lessons/${lessonId}/document/versions`
      );
      const filteredList = (list ?? []).filter((v) => v.kind !== "WORKFLOW");
      setVersions(filteredList);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  const loadStatusHistory = useCallback(async () => {
    if (!courseId) return;
    setStatusHistoryLoading(true);
    try {
      const data = await api.get<CourseStatusHistoryResponse[]>(
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
        const detail = await api.get<VersionDetail>(
          `/api/lessons/${lessonId}/document/versions/${v.id}`
        );
        setSelected(detail);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load version");
      } finally {
        setPreviewLoading(false);
      }
    },
    [lessonId]
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
    />
  );
}
