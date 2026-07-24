/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Mock (dev-only, see mock/README.md)
 *
 * Purpose:
 * Shared contract for mock fixtures. These re-export the SAME types the
 * real backend/domains already satisfy, so mock data can never drift
 * from what production code expects.
 *
 * Only infrastructure/http/api.ts, apps/core/components/AuthInitializer.tsx
 * and app/api/mock/** may import from mock/. Enforced by eslint.config.mjs.
 * ------------------------------------------------------------------
 */

export type { User } from '@/infrastructure/auth/auth.store';
export type { Channel } from '@/domains/channels';
export type { RoadmapData } from '@/domains/roadmaps';

export interface MockErrorResponse {
  message: string;
  status: number;
}
