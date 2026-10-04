/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * Live (video) wallpapers: download the video once with visible progress,
 * keep it in the browser's Cache Storage so later visits start instantly,
 * and judge whether this device is likely to struggle with one.
 *
 * Rules:
 * - Only the few most recent videos are kept; switching wallpapers evicts
 *   the oldest, so the cache never grows without bound.
 * - Anything that prevents caching (no Cache Storage, CORS, quota) falls back
 *   to ordinary streaming — a live wallpaper never fails just because it
 *   could not be cached.
 * ------------------------------------------------------------------
 */

import { create } from 'zustand';

const CACHE_NAME = 'arcade-live-wallpapers-v1';
const KEEP = 3;

/**
 * idle → checking (looking in the cache; no UI) → loading (a real download, with progress) or
 * streaming (no cacheable copy; the <video> streams it) → ready.
 */
export type LiveStatus = 'idle' | 'checking' | 'loading' | 'ready' | 'streaming' | 'error';

/** Where the playing video came from — only a fresh download earns a "saved for next time". */
export type LiveSource = 'cache' | 'download' | 'stream' | null;

interface LiveWallpaperState {
  /** The video being prepared or shown. */
  videoUrl: string | null;
  status: LiveStatus;
  loaded: number;
  total: number | null;
  source: LiveSource;
}

export const useLiveWallpaperStore = create<LiveWallpaperState>()(() => ({
  videoUrl: null,
  status: 'idle',
  loaded: 0,
  total: null,
  source: null,
}));

const set = (patch: Partial<LiveWallpaperState>) => useLiveWallpaperStore.setState(patch);

export function resetLiveWallpaper() {
  set({ videoUrl: null, status: 'idle', loaded: 0, total: null, source: null });
}

/**
 * Returns a playable source for the video: an object URL of the cached copy (downloading and
 * caching it first if needed, with progress in useLiveWallpaperStore), or — when caching is not
 * possible — the remote URL itself, marked `streaming`. The caller revokes object URLs.
 */
export async function prepareLiveWallpaper(
  videoUrl: string,
  sizeHint: number | null,
  signal: AbortSignal,
): Promise<{ src: string; objectUrl: boolean }> {
  set({ videoUrl, status: 'checking', loaded: 0, total: sizeHint, source: null });

  const cache = typeof caches !== 'undefined' ? await caches.open(CACHE_NAME).catch(() => null) : null;
  if (cache) {
    const hit = await cache.match(videoUrl).catch(() => undefined);
    if (hit) {
      const blob = await hit.blob();
      if (signal.aborted) throw new DOMException('Superseded', 'AbortError');
      set({ status: 'ready', loaded: blob.size, total: blob.size, source: 'cache' });
      return { src: URL.createObjectURL(blob), objectUrl: true };
    }
  }

  // Once this session has learned the storage host refuses cross-origin reads (no CORS rule on the
  // bucket), stream directly instead of failing the same fetch — and logging it — on every visit.
  const noCorsKey = 'arcade-live-nocors:' + new URL(videoUrl, location.href).origin;
  const knownNoCors = (() => {
    try {
      return sessionStorage.getItem(noCorsKey) === '1';
    } catch {
      return false;
    }
  })();
  if (knownNoCors) {
    set({ status: 'streaming', source: 'stream' });
    return { src: videoUrl, objectUrl: false };
  }

  try {
    const res = await fetch(videoUrl, { signal, mode: 'cors' });
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
    const total = Number(res.headers.get('content-length')) || sizeHint;
    set({ status: 'loading', total, source: 'download' });
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;
    let lastReport = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.byteLength;
      // Throttle store updates to ~10/s; a 30MB video arrives in thousands of chunks.
      const now = performance.now();
      if (now - lastReport > 100) {
        lastReport = now;
        set({ loaded });
      }
    }
    const type = res.headers.get('content-type') || (videoUrl.endsWith('.webm') ? 'video/webm' : 'video/mp4');
    const blob = new Blob(chunks as BlobPart[], { type });
    if (cache) {
      await cache
        .put(videoUrl, new Response(blob, { headers: { 'Content-Type': type, 'Content-Length': String(blob.size) } }))
        .then(() => prune(cache, videoUrl))
        .catch(() => {
          // Quota exceeded or storage disabled: play it this time, download again next time.
        });
    }
    set({ status: 'ready', loaded: blob.size, total: blob.size });
    return { src: URL.createObjectURL(blob), objectUrl: true };
  } catch (error) {
    if (signal.aborted) throw error;
    // CORS, network or no Cache Storage: let the <video> element stream it directly.
    set({ status: 'streaming', source: 'stream' });
    if (error instanceof TypeError) {
      try {
        sessionStorage.setItem(noCorsKey, '1');
      } catch {
        // storage unavailable: just retry next time
      }
    }
    return { src: videoUrl, objectUrl: false };
  }
}

/** Keeps the current video plus the most recent others, oldest evicted first. */
async function prune(cache: Cache, current: string) {
  const keys = await cache.keys();
  const others = keys.filter((k) => k.url !== new URL(current, location.href).href);
  const excess = others.length - (KEEP - 1);
  for (let i = 0; i < excess; i++) await cache.delete(others[i]);
}

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

/**
 * Whether this device is likely to find a live wallpaper heavy: little memory, few cores, a
 * data-saver setting or a slow connection. A hint for the warning, never a block.
 */
export function liveWallpaperRisk(): { low: boolean; reasons: string[] } {
  if (typeof navigator === 'undefined') return { low: false, reasons: [] };
  const n = navigator as NavigatorHints;
  const reasons: string[] = [];
  if (n.deviceMemory !== undefined && n.deviceMemory <= 4) reasons.push(`${n.deviceMemory} GB memory`);
  if (n.hardwareConcurrency && n.hardwareConcurrency <= 4) reasons.push(`${n.hardwareConcurrency} CPU cores`);
  if (n.connection?.saveData) reasons.push('data saver is on');
  if (n.connection?.effectiveType && /(^|-)2g$|^3g$/.test(n.connection.effectiveType)) reasons.push('a slow connection');
  return { low: reasons.length > 0, reasons };
}

export const formatMegabytes = (bytes: number | null | undefined) =>
  bytes ? `${bytes >= 10 * 1024 * 1024 ? Math.round(bytes / 1024 / 1024) : (bytes / 1024 / 1024).toFixed(1)} MB` : '';
