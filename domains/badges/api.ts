// domains/badges/api.ts
// Typed calls to the badge-authoring endpoints (backend: com.arcade.backend.studio.badge).

import { api } from "@/infrastructure/http/api";
import type { BadgeDocument } from "./types/badgeDocument.types";

export interface BadgeResponse {
  id: string;
  title: string;
  status: string;
  shapeId: string;
  schemaVersion: number;
  document: string; // BadgeDocument JSON string — parse + migrateBadgeDocument() before use
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface BadgeVersionSummary {
  id: string;
  seq: number;
  kind: "AUTO" | "MANUAL" | "WORKFLOW" | "PUBLISHED";
  label: string | null;
  createdAt: string;
  createdById: string | null;
  createdByName: string | null;
}

export function addBadge(moduleId: string, title: string) {
  return api.post<BadgeResponse>(`/api/modules/${moduleId}/badges`, { title });
}

export function getBadge(badgeId: string) {
  return api.get<BadgeResponse>(`/api/badges/${badgeId}`);
}

export function renameBadge(badgeId: string, title: string) {
  return api.patch<BadgeResponse>(`/api/badges/${badgeId}`, { title });
}

export function deleteBadge(badgeId: string) {
  return api.delete(`/api/badges/${badgeId}`);
}

export function saveBadgeDocument(badgeId: string, document: BadgeDocument) {
  return api.put<BadgeResponse>(`/api/badges/${badgeId}/document`, {
    document: JSON.stringify(document),
  });
}

export function createBadgeVersion(
  badgeId: string,
  document: BadgeDocument,
  kind: "AUTO" | "MANUAL" | "WORKFLOW" | "PUBLISHED" = "AUTO",
  label?: string
) {
  return api.post<BadgeVersionSummary>(`/api/badges/${badgeId}/document/versions`, {
    document: JSON.stringify(document),
    kind,
    label,
  });
}

export function listBadgeVersions(badgeId: string) {
  return api.get<BadgeVersionSummary[]>(`/api/badges/${badgeId}/document/versions`);
}

export function getBadgeVersion(badgeId: string, versionId: string) {
  return api.get<BadgeVersionSummary & { document: string }>(
    `/api/badges/${badgeId}/document/versions/${versionId}`
  );
}
