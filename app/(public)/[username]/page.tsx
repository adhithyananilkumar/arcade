'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: App (routing only)
 *
 * Purpose:
 * The catch-all profile route. A handle may belong to a person or to an
 * organization channel; resolving which is the orchestrator's job.
 *
 * Rules:
 * - Routing only: reads the route parameter and delegates. No fetching, no
 *   presentation.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useParams } from 'next/navigation';
import { ProfileOrchestrator } from '@/apps/public/orchestrators/ProfileOrchestrator';

export default function ProfilePage() {
  const params = useParams();
  const handle = Array.isArray(params?.username)
    ? params.username[0]
    : (params?.username as string | undefined);

  if (!handle) return null;

  return <ProfileOrchestrator handle={handle} />;
}
