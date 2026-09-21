/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Recognition
 *
 * Purpose:
 * HTTP wrapper for the platform recognition (badge) administration API.
 *
 * Rules:
 * - Every endpoint here is gated on `platform.recognition.manage` by the
 *   backend. This service does NOT check that — permission checks live on the
 *   backend, and any gate the UI applies is a presentation hint only.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { api } from '@/infrastructure/http/api';
import type {
  BadgeDefinition,
  BadgeGrant,
  CreateBadgeDefinitionInput,
  GrantBadgeInput,
  PagedBadgeGrants,
  RecognitionSubjectType,
  UpdateBadgeDefinitionInput,
} from '../types/badge.types';

const BASE = '/api/v1/platform/recognition';

export const RecognitionService = {
  /** The badge catalog. Pass `false` to hide retired definitions. */
  listDefinitions(includeInactive = true): Promise<BadgeDefinition[]> {
    return api.get<BadgeDefinition[]>(
      `${BASE}/definitions?includeInactive=${includeInactive}`,
    );
  },

  createDefinition(input: CreateBadgeDefinitionInput): Promise<BadgeDefinition> {
    return api.post<BadgeDefinition>(`${BASE}/definitions`, input);
  },

  /**
   * Edits a custom definition. The backend refuses this for system badges — their shape is
   * declared in code and would be rewritten on the next restart — so callers should not offer
   * the form for a definition whose `systemDefined` is true.
   */
  updateDefinition(
    id: string,
    input: UpdateBadgeDefinitionInput,
  ): Promise<BadgeDefinition> {
    return api.patch<BadgeDefinition>(`${BASE}/definitions/${id}`, input);
  },

  /** Live grants, newest first, optionally narrowed to one definition. */
  listGrants(params: {
    definitionId?: string;
    page?: number;
    size?: number;
  } = {}): Promise<PagedBadgeGrants> {
    const query = new URLSearchParams();
    if (params.definitionId) query.set('definitionId', params.definitionId);
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 25));
    return api.get<PagedBadgeGrants>(`${BASE}/grants?${query.toString()}`);
  },

  /** Everything ever granted to one subject, revoked and expired included. */
  history(
    subjectType: RecognitionSubjectType,
    subjectId: string,
  ): Promise<BadgeGrant[]> {
    return api.get<BadgeGrant[]>(`${BASE}/grants/${subjectType}/${subjectId}`);
  },

  grant(input: GrantBadgeInput): Promise<BadgeGrant> {
    return api.post<BadgeGrant>(`${BASE}/grants`, input);
  },

  /**
   * Revokes a grant. Soft by design — the record stays so "was this account verified last March?"
   * remains answerable — so the returned grant is the revoked row, not an absence.
   */
  revoke(grantId: string, reason?: string): Promise<BadgeGrant> {
    return api.post<BadgeGrant>(`${BASE}/grants/${grantId}/revoke`, { reason });
  },
};
