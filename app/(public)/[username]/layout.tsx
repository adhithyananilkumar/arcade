/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: App (routing only)
 *
 * Purpose:
 * Chrome for `domain/<handle>`.
 *
 * Rules:
 * - Routing only. `ProfileShell` decides which navigation the viewer gets;
 *   this file does nothing but delegate.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import ProfileShell from '@/apps/public/layout/ProfileShell';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProfileShell>{children}</ProfileShell>;
}
