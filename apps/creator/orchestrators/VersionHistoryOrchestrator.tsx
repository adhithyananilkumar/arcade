"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "@/infrastructure/http/api";
import { VersionHistoryPanel } from "@/domains/publishing/components/VersionHistoryPanel";
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
}

export function VersionHistoryOrchestrator({
  lessonId,
  open,
  onClose,
  refreshKey,
  onRestore,
  renderEditor,
}: VersionHistoryOrchestratorProps) {
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<VersionDetail | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadVersions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.get<VersionSummary[]>(
        `/api/lessons/${lessonId}/document/versions`
      );
      setVersions(list ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    if (open) loadVersions();
  }, [open, refreshKey, loadVersions]);

  const selectVersion = useCallback(
    async (v: VersionSummary) => {
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
      onRetryLoad={loadVersions}
      renderEditor={renderEditor}
    />
  );
}
