'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * Keeps <html> in step with the viewer's appearance inside the signed-in app
 * (see ThemeScope) and clears it on public pages; paints the glass
 * wallpaper layer, and syncs the appearance with the signed-in account so it
 * follows them across devices.
 *
 * Sync rule: whichever copy changed last wins. The server copy is fetched
 * once per sign-in; after that, local edits are pushed (debounced).
 *
 * Mount exactly once, in apps/core/Providers.tsx.
 * ------------------------------------------------------------------
 */

import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { AppearanceService } from '@/domains/identity';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import {
  pickAppearance,
  selectInThemeScope,
  useAppearanceStore,
  useThemeScopeStore,
} from '@/infrastructure/state/theme.store';
import { LiveWallpaperStatus, LiveWallpaperVideo } from '@/apps/core/components/appearance/LiveWallpaper';
import { applyAppearance, clearAppearance, fromServer, toServer } from '@/apps/core/lib/appearance';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribeSystemTheme(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

/** Whether the OS asks for dark. Server render assumes light; the boot script already handled first paint. */
export function useSystemPrefersDark(): boolean {
  return useSyncExternalStore(
    subscribeSystemTheme,
    () => window.matchMedia(DARK_QUERY).matches,
    () => false,
  );
}

export function AppearanceController() {
  const settings = useAppearanceStore(useShallow(pickAppearance));
  const systemDark = useSystemPrefersDark();
  const inScope = useThemeScopeStore(selectInThemeScope);
  const applied = useRef(false);

  // Layout effect: entering or leaving the app (client navigation between the landing page and
  // the dashboard) must switch before paint, not one frame later.
  useLayoutEffect(() => {
    if (!inScope) {
      clearAppearance();
      applied.current = false;
      return;
    }
    document.documentElement.setAttribute('data-theme-scope', 'app');
    const cleanup = applyAppearance(settings, systemDark, applied.current);
    applied.current = true;
    return cleanup;
  }, [settings, systemDark, inScope]);

  useAccountSync();

  return (
    <>
      <div className="arcade-wallpaper" aria-hidden="true">
        <LiveWallpaperVideo />
      </div>
      <LiveWallpaperStatus />
    </>
  );
}

function useAccountSync() {
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.user?.id ?? null);
  /** The local `updatedAt` the server is known to hold; anything newer is an unsaved local edit. */
  const synced = useRef<number | null>(null);

  // Once per sign-in: reconcile local and server copies.
  useEffect(() => {
    if (status !== 'authenticated' || !userId) {
      synced.current = null;
      return;
    }
    let cancelled = false;
    AppearanceService.mine()
      .then((server) => {
        if (cancelled) return;
        const local = useAppearanceStore.getState();
        const serverAt = server ? Date.parse(server.updatedAt) : 0;
        if (server && serverAt >= local.updatedAt) {
          local.hydrateFromServer(fromServer(server), serverAt);
          synced.current = serverAt;
        } else if (local.updatedAt > 0) {
          // The local copy is newer (or the account has none yet): it becomes the account's.
          synced.current = local.updatedAt;
          AppearanceService.save(toServer(pickAppearance(local))).catch(() => {
            synced.current = null;
          });
        } else {
          synced.current = 0;
        }
      })
      .catch(() => {
        // Offline or the endpoint is unavailable: the local appearance still applies.
      });
    return () => {
      cancelled = true;
    };
  }, [status, userId]);

  // Afterwards: push local edits, debounced so dragging the opacity slider is one request.
  useEffect(() => {
    let timer: number | undefined;
    const unsubscribe = useAppearanceStore.subscribe((state) => {
      if (synced.current == null || state.updatedAt === synced.current) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const current = useAppearanceStore.getState();
        if (synced.current == null || current.updatedAt === synced.current) return;
        const at = current.updatedAt;
        AppearanceService.save(toServer(pickAppearance(current)))
          .then(() => {
            synced.current = at;
          })
          .catch(() => {
            // Leave it unsynced; the next edit or sign-in retries.
          });
      }, 700);
    });
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, []);
}
