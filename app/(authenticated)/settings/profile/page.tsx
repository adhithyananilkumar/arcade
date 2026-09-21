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

import { ProfileSettingsOrchestrator } from '@/apps/learner/orchestrators/ProfileSettingsOrchestrator';

export default function ProfileSettingsPage() {
  return <ProfileSettingsOrchestrator />;
}
