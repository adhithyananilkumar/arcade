'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: App (routing only)
 *
 * Purpose:
 * Console -> Honours. Conferring Level 5 · Distinguished honours, and revoking them.
 *
 * Rules:
 * - Routing and the surface gate only. The gate mirrors the backend's
 *   platform.credentials.manage, which is the real enforcement; this one just
 *   avoids rendering a surface whose every request would 403.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { notFound } from 'next/navigation';
import { HonoursConsole } from '@/apps/core/components/credentials/HonoursConsole';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';

export default function HonoursConsolePage() {
  const { user } = useAuthStore();
  if (!AuthorizationService.canManageCredentials(user)) {
    notFound();
  }
  return <HonoursConsole />;
}
