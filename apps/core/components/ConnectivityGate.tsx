'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * Shows the offline screen while the device has no internet, and holds back the error toasts
 * every failing request would otherwise raise underneath it. Detection lives in
 * `infrastructure/state/connectivity.store.ts`; this only decides what the user sees.
 * ------------------------------------------------------------------
 */

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useConnectivityStore } from '@/infrastructure/state/connectivity.store';
import { OfflineScreen } from '@/shared/design-system/ui/offline-screen';
import { setErrorToastSuppression } from '@/shared/design-system/ui/sonner';

/** A connection that drops for a moment and comes straight back shouldn't flash a full-screen notice. */
const SHOW_AFTER_MS = 1200;

setErrorToastSuppression(() => useConnectivityStore.getState().status === 'offline');

export function ConnectivityGate() {
  const status = useConnectivityStore((s) => s.status);
  const check = useConnectivityStore((s) => s.check);
  const [shown, setShown] = useState(false);
  const shownRef = useRef(false);
  useEffect(() => {
    shownRef.current = shown;
  }, [shown]);

  useEffect(() => {
    if (status === 'offline') {
      // Errors raised before the offline state was confirmed are about the same outage.
      toast.dismiss();
      const timer = setTimeout(() => setShown(true), SHOW_AFTER_MS);
      return () => clearTimeout(timer);
    }
    if (shownRef.current) toast.success("You're back online", { id: 'connectivity-restored' });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShown(false);
  }, [status]);

  if (!shown) return null;
  // Background re-checks stay silent (no flicker); the screen shows its own state for a manual retry.
  return <OfflineScreen onRetry={check} />;
}
