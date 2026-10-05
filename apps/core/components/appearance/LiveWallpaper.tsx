'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * Plays a live (video) wallpaper behind Dynamic Glass, and shows its
 * download progress. The poster frame is already painted by the wallpaper
 * layer's CSS, so the page is never blank while the video loads; the video
 * fades in over it once it can play.
 *
 * The video only runs when all of these hold: inside the signed-in app,
 * glass is on, the chosen wallpaper is live, "Play live wallpapers" is on
 * for this device, and the system does not ask for reduced motion. It pauses
 * whenever the tab is hidden.
 * ------------------------------------------------------------------
 */

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { LiveWallpaperNotice } from '@/apps/core/components/appearance/AppearanceControls';
import { selectInThemeScope, useAppearanceStore, useThemeScopeStore } from '@/infrastructure/state/theme.store';
import {
  formatMegabytes,
  liveWallpaperRisk,
  prepareLiveWallpaper,
  resetLiveWallpaper,
  useLiveWallpaperStore,
} from '@/apps/core/lib/liveWallpaper';
import { cn } from '@/shared/utils/utils';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(REDUCED_MOTION);
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

/** The live wallpaper the page should be playing right now, or null. */
export function useActiveLiveVideo() {
  const inScope = useThemeScopeStore(selectInThemeScope);
  const glass = useAppearanceStore((s) => s.material === 'glass');
  const wallpaper = useAppearanceStore((s) => s.wallpaper);
  const liveMotion = useAppearanceStore((s) => s.liveMotion);
  const reduced = usePrefersReducedMotion();
  const video = wallpaper.kind === 'image' ? wallpaper.video ?? null : null;
  return inScope && glass && liveMotion && !reduced ? video : null;
}

export function LiveWallpaperVideo() {
  const video = useActiveLiveVideo();
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const el = useRef<HTMLVideoElement>(null);
  const url = video?.url ?? null;
  const sizeBytes = video?.sizeBytes ?? null;

  useEffect(() => {
    // The wallpaper changed (or stopped being live): drop the previous video at once.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlaying(false);
    setSrc(null);
    if (!url) {
      resetLiveWallpaper();
      return;
    }
    const controller = new AbortController();
    let objectUrl: string | null = null;
    prepareLiveWallpaper(url, sizeBytes, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) {
          if (result.objectUrl) URL.revokeObjectURL(result.src);
          return;
        }
        if (result.objectUrl) objectUrl = result.src;
        setSrc(result.src);
      })
      .catch(() => {
        // Superseded by another wallpaper; nothing to do.
      });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, sizeBytes]);

  // A hidden tab plays nothing: no GPU or battery spent on a wallpaper nobody sees.
  useEffect(() => {
    const sync = () => {
      const v = el.current;
      if (!v) return;
      if (document.hidden) v.pause();
      else void v.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  if (!src) return null;
  return (
    <video
      ref={el}
      key={src}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
      onEnded={(e) => {
        // The loop attribute stalls on files the browser cannot seek (e.g. recorder-made WebM);
        // restart by hand so every file loops.
        const v = e.currentTarget;
        v.currentTime = 0;
        void v.play().catch(() => {
          v.load();
          void v.play().catch(() => {});
        });
      }}
      onPlaying={() => {
        setPlaying(true);
        if (useLiveWallpaperStore.getState().status === 'streaming') useLiveWallpaperStore.setState({ status: 'ready' });
      }}
      className={cn('arcade-wallpaper-video', playing && 'is-playing')}
    />
  );
}

/** How long a stream may take to start before the loader is worth showing. */
const STREAM_LOADER_DELAY_MS = 1200;

/**
 * "Preparing live wallpaper · 42% · 12 / 28 MB" during a real first download, then a short
 * "saved for next time". Silent on every later visit: nothing for a cached copy, and for a streamed
 * one (no cacheable copy) only a plain "Loading…" if starting takes noticeably long.
 */
export function LiveWallpaperStatus() {
  const { status, loaded, total, source } = useLiveWallpaperStore();
  const [justSaved, setJustSaved] = useState(false);
  const [slowStream, setSlowStream] = useState(false);
  const downloading = useRef(false);

  useEffect(() => {
    if (status === 'loading') {
      downloading.current = true;
      return;
    }
    if (status === 'ready' && downloading.current && source === 'download') {
      downloading.current = false;
       
      setJustSaved(true);
      const t = window.setTimeout(() => setJustSaved(false), 1800);
      return () => window.clearTimeout(t);
    }
    downloading.current = false;
  }, [status, source]);

  useEffect(() => {
    if (status !== 'streaming') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSlowStream(false);
      return;
    }
    const t = window.setTimeout(() => setSlowStream(true), STREAM_LOADER_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [status]);

  const downloadingNow = status === 'loading';
  const visible = downloadingNow || justSaved || (status === 'streaming' && slowStream);
  const pct = total ? Math.min(100, Math.round((loaded / total) * 100)) : null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="live-status"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="apple-glass-dock pointer-events-none fixed left-1/2 top-[88px] z-[65] flex -translate-x-1/2 items-center gap-2.5 rounded-full py-2 pl-2.5 pr-4 text-[12px] font-semibold text-slate-800"
        >
          {justSaved ? (
            <>
              <span className="grid size-6 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Check size={13} strokeWidth={3} />
              </span>
              Live wallpaper ready — saved for next time
            </>
          ) : (
            <>
              <span className="relative grid size-6 place-items-center">
                <Loader2 size={15} className="animate-spin text-[#4c6fff] dark:text-[#8db1ff]" />
              </span>
              <span>
                {downloadingNow ? 'Preparing live wallpaper' : 'Loading live wallpaper'}
                {downloadingNow && pct !== null && <span className="ml-1.5 tabular-nums text-slate-500">{pct}%</span>}
              </span>
              {downloadingNow && total ? (
                <span className="tabular-nums text-[11px] font-medium text-slate-400">
                  {formatMegabytes(loaded)} / {formatMegabytes(total)}
                </span>
              ) : null}
              {downloadingNow && pct !== null && (
                <span className="h-1 w-16 overflow-hidden rounded-full bg-slate-200">
                  <span className="block h-full rounded-full bg-[#4c6fff] transition-[width] duration-200" style={{ width: `${pct}%` }} />
                </span>
              )}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** 0–100 for the video currently downloading, keyed by its URL; null when nothing is downloading. */
export function useLiveDownloadProgress(): { url: string; pct: number } | null {
  const { videoUrl, status, loaded, total } = useLiveWallpaperStore();
  if (status !== 'loading' || !videoUrl) return null;
  return { url: videoUrl, pct: total ? Math.min(99, Math.round((loaded / total) * 100)) : 0 };
}

/** The notice for whichever live wallpaper is selected; renders nothing for photos and presets. */
export function SelectedLiveWallpaperNotice() {
  const glass = useAppearanceStore((s) => s.material === 'glass');
  const wallpaper = useAppearanceStore((s) => s.wallpaper);
  const liveMotion = useAppearanceStore((s) => s.liveMotion);
  const setLiveMotion = useAppearanceStore((s) => s.setLiveMotion);
  const reduced = usePrefersReducedMotion();
  const [risk] = useState(liveWallpaperRisk);
  const video = wallpaper.kind === 'image' ? wallpaper.video : null;
  if (!glass || !video) return null;
  return (
    <LiveWallpaperNotice
      size={formatMegabytes(video.sizeBytes)}
      lowEnd={risk.low}
      reasons={risk.reasons}
      playing={liveMotion}
      onPlayingChange={setLiveMotion}
      reducedMotion={reduced}
    />
  );
}
