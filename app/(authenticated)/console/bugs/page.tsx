'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: App (routing only)
 *
 * Purpose:
 * Console -> Bugs. The test-release bug tracker and its intake settings.
 *
 * Rules:
 * - Routing and the surface gate only. The gate mirrors the backend's platform.bugs.manage /
 *   platform.bugs.configure, which are the real enforcement; this one just avoids rendering a
 *   surface whose every request would 403.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { BugConsole } from '@/apps/core/components/bug-reports/console/BugConsole';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';

export default function BugsConsolePage() {
  const { user } = useAuthStore();
  if (!AuthorizationService.canOpenBugConsole(user)) {
    notFound();
  }
  return (
    <Suspense fallback={null}>
      <BugConsole />
    </Suspense>
  );
}
