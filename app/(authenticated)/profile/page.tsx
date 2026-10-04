'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: App (routing only)
 *
 * Purpose:
 * `/profile` is an alias for the signed-in person's own `domain/<handle>`.
 * There is one profile page, and the owner sees the same page everyone else
 * does (plus edit actions) — no separate private rendering to drift from it.
 *
 * Rules:
 * - Routing only. An account without a handle has no public page yet, so it
 *   is sent to the settings screen that asks for one.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';

export default function MyProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;
    router.replace(user.username ? `/${encodeURIComponent(user.username)}` : '/settings/info');
  }, [router, user]);

  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <Loader2 className="animate-spin text-slate-400" size={28} />
    </div>
  );
}
