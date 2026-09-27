'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: App (routing only)
 *
 * Purpose:
 * Console -> Exam standards. Per-type platform rules for exams.
 *
 * Rules:
 * - Routing and the surface gate only. The gate mirrors the backend's platform.exams.manage,
 *   which is the real enforcement.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { notFound } from 'next/navigation';
import { ExamStandardsConsole } from '@/apps/core/components/exam-standards/ExamStandardsConsole';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';

export default function ExamStandardsPage() {
  const { user } = useAuthStore();
  if (!AuthorizationService.canManageExams(user)) {
    notFound();
  }
  return <ExamStandardsConsole />;
}
