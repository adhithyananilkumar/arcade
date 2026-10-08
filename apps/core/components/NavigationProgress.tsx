'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * When a page change is slow (a cold route, a slow network, a route compiling in development),
 * shows Arcade's loader dots, on their own, in the centre of the screen so the click visibly registered. Fast
 * navigations never show it, and it disappears the instant the new page renders — no minimum
 * display time, no fade-out to wait through.
 * ------------------------------------------------------------------
 */

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { finishNavigation, useNavigationPendingSince } from '@/infrastructure/state/navigationProgress';
import { Loader } from '@/shared/design-system/ui/loader';

/** Under this a navigation feels instant; a loader flashing on it would only be noise. */
const SHOW_AFTER_MS = 400;

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pendingSince = useNavigationPendingSince();

  // The page this app renders changed: the navigation has landed.
  const search = searchParams?.toString() ?? '';
  useEffect(() => {
    finishNavigation();
  }, [pathname, search]);

  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (pendingSince === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSlow(false);
      return;
    }
    const timer = setTimeout(() => setSlow(true), Math.max(0, SHOW_AFTER_MS - (Date.now() - pendingSince)));
    return () => clearTimeout(timer);
  }, [pendingSince]);

  if (pendingSince === null || !slow) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 flex items-center justify-center animate-in fade-in duration-200"
      style={{ zIndex: 2147483000 }}
    >
      <Loader />
    </div>
  );
}
