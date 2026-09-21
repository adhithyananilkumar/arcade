'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: App (routing only)
 *
 * Purpose:
 * Console -> Handles. The handle-appeal review queue.
 *
 * Rules:
 * - Routing and the surface gate only. The gate mirrors the backend's
 *   platform.handles.manage, which is the real enforcement.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { notFound } from 'next/navigation';
import { HandleAppealConsole } from '@/apps/core/components/handles/HandleAppealConsole';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';

export default function HandleAppealConsolePage() {
  const { user } = useAuthStore();
  if (!AuthorizationService.canManageHandles(user)) {
    notFound();
  }
  return <HandleAppealConsole />;
}
