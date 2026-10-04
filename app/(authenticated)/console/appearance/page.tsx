'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: App (routing only)
 *
 * Purpose:
 * Console -> Appearance. The wallpaper gallery for Dynamic Glass.
 *
 * Rules:
 * - Routing and the surface gate only. The gate mirrors the backend's
 *   platform.appearance.manage, which is the real enforcement.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { notFound } from 'next/navigation';
import { WallpaperConsole } from '@/apps/core/components/appearance/WallpaperConsole';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';

export default function AppearanceConsolePage() {
  const { user } = useAuthStore();
  if (!AuthorizationService.canManageAppearance(user)) {
    notFound();
  }
  return <WallpaperConsole />;
}
