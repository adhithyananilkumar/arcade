'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: App (routing only)
 *
 * Purpose:
 * Public-profile settings — handle, introduction, learner-activity visibility,
 * and handle appeals.
 *
 * Rules:
 * - Routing only. Everything else lives in the orchestrator.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileSettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings/info');
  }, [router]);

  return null;
}
