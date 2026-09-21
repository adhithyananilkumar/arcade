/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: App (routing only)
 *
 * Purpose:
 * Route-level loading state for `domain/<handle>`.
 *
 * Rules:
 * - Mirrors the profile layout's geometry so the page does not jump when the
 *   real content lands.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { ProfileSkeleton } from '@/domains/profiles';

export default function ProfileLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-10 sm:px-6">
      <ProfileSkeleton />
    </div>
  );
}
