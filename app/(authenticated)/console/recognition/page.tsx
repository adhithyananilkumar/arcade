'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: App (routing only)
 *
 * Purpose:
 * Console -> Recognition. Badge catalog, grants, and revocations.
 *
 * Rules:
 * - Routing and the surface gate only. The gate mirrors the backend's
 *   platform.recognition.manage, which is the real enforcement; this one just
 *   avoids rendering a surface whose every request would 403.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { notFound } from 'next/navigation';
import { RecognitionConsole } from '@/apps/core/components/recognition/RecognitionConsole';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';

export default function RecognitionConsolePage() {
  const { user } = useAuthStore();
  if (!AuthorizationService.canManageRecognition(user)) {
    notFound();
  }
  return <RecognitionConsole />;
}
