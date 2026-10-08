/**
 * Runs before hydration (Next.js client instrumentation). Kept tiny: Next warns when this file
 * takes more than 16ms to initialise.
 */

import { startNavigation } from '@/infrastructure/state/navigationProgress';

/** Next calls this for every Link click, router.push/replace and back/forward. */
export function onRouterTransitionStart(url: string) {
  startNavigation(url);
}
