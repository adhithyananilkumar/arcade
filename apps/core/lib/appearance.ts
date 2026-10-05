/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * Applies an appearance to the document and converts between the local
 * appearance store and the account's server copy.
 *
 * Rules:
 * - `applyAppearance` must stay in step with APPEARANCE_BOOT_SCRIPT in
 *   infrastructure/state/theme.store.ts, which does the same before React
 *   loads. If they disagree, the page flickers on hydration.
 * ------------------------------------------------------------------
 */

import type { AppearanceDto, AppearanceSaveRequest, GalleryWallpaper } from '@/domains/identity';
import {
  DEFAULT_WALLPAPER,
  clampGlassOpacity,
  clampWallpaperDim,
  resolveDark,
  type AppearanceSettings,
  type Wallpaper,
} from '@/infrastructure/state/theme.store';

/** Built-in wallpapers (drawn in app/themes.css). Their keys and tones mirror the backend's WallpaperPreset. */
export const WALLPAPER_PRESETS: { key: string; name: string; tone: 'light' | 'dark'; swatch: string }[] = [
  { key: 'aurora', name: 'Aurora', tone: 'dark', swatch: 'radial-gradient(60% 70% at 15% 20%, #3fd5c3 0%, transparent 60%), radial-gradient(55% 60% at 85% 15%, #7a5af8 0%, transparent 60%), radial-gradient(70% 70% at 70% 90%, #2962d6 0%, transparent 62%), linear-gradient(160deg, #10203f, #1d2f5c)' },
  { key: 'dawn', name: 'Dawn', tone: 'light', swatch: 'radial-gradient(60% 60% at 10% 10%, #ffd6a5 0%, transparent 60%), radial-gradient(60% 70% at 90% 20%, #fbb1c8 0%, transparent 62%), radial-gradient(70% 70% at 50% 100%, #a0c4ff 0%, transparent 65%), linear-gradient(180deg, #fff1e6, #e9eefb)' },
  { key: 'lagoon', name: 'Lagoon', tone: 'light', swatch: 'radial-gradient(55% 60% at 20% 80%, #8be0d0 0%, transparent 62%), radial-gradient(60% 60% at 85% 25%, #9ec5ff 0%, transparent 60%), radial-gradient(50% 50% at 50% 40%, #e0fbf6 0%, transparent 70%), linear-gradient(180deg, #eaf8f6, #dfeafc)' },
  { key: 'ember', name: 'Ember', tone: 'dark', swatch: 'radial-gradient(60% 60% at 80% 20%, #ff6b4a 0%, transparent 60%), radial-gradient(60% 70% at 15% 85%, #b0306a 0%, transparent 62%), radial-gradient(45% 45% at 45% 45%, #f2b23c55 0%, transparent 70%), linear-gradient(200deg, #2a1420, #170d1f)' },
  { key: 'graphite', name: 'Graphite', tone: 'dark', swatch: 'radial-gradient(70% 60% at 20% 0%, #3a4256 0%, transparent 60%), radial-gradient(60% 60% at 100% 100%, #2b3140 0%, transparent 60%), linear-gradient(180deg, #1a1d25, #0f1115)' },
  { key: 'meadow', name: 'Meadow', tone: 'light', swatch: 'radial-gradient(60% 60% at 15% 15%, #c7f2a4 0%, transparent 60%), radial-gradient(55% 60% at 90% 30%, #9be7c4 0%, transparent 60%), radial-gradient(70% 60% at 60% 100%, #fff3b0 0%, transparent 65%), linear-gradient(180deg, #f3fbef, #e3f5ee)' },
  { key: 'sakura', name: 'Sakura', tone: 'light', swatch: 'radial-gradient(55% 60% at 12% 18%, #ffc4d8 0%, transparent 62%), radial-gradient(50% 55% at 88% 20%, #d8c9ff 0%, transparent 60%), radial-gradient(65% 60% at 72% 100%, #bfe2ff 0%, transparent 65%), radial-gradient(40% 35% at 38% 48%, #fff6ec 0%, transparent 70%), linear-gradient(165deg, #fdf3f7, #eef0fb)' },
  { key: 'glacier', name: 'Glacier', tone: 'light', swatch: 'radial-gradient(60% 55% at 14% 86%, #b9e4f4 0%, transparent 62%), radial-gradient(50% 55% at 88% 72%, #d1f4ec 0%, transparent 60%), radial-gradient(55% 50% at 82% 8%, #c8d6ff 0%, transparent 62%), radial-gradient(45% 40% at 32% 22%, #ffffff 0%, transparent 70%), linear-gradient(180deg, #f1f7fc, #e1ebf6)' },
  { key: 'dune', name: 'Dune', tone: 'light', swatch: 'radial-gradient(55% 55% at 86% 14%, #ffd6a8 0%, transparent 60%), radial-gradient(60% 60% at 10% 82%, #f4c3b4 0%, transparent 62%), radial-gradient(45% 40% at 28% 20%, #fff2cf 0%, transparent 68%), radial-gradient(50% 45% at 92% 96%, #e5d3f0 0%, transparent 65%), linear-gradient(175deg, #fcf5ec, #f2e5d6)' },
  { key: 'midnight', name: 'Midnight', tone: 'dark', swatch: 'radial-gradient(circle 1.5px at 18% 22%, #ffffffcc 0%, transparent 100%), radial-gradient(circle 1px at 64% 12%, #ffffffaa 0%, transparent 100%), radial-gradient(circle 1.5px at 82% 38%, #ffffff99 0%, transparent 100%), radial-gradient(circle 1px at 36% 64%, #ffffff88 0%, transparent 100%), radial-gradient(55% 50% at 82% 8%, #2c3d94 0%, transparent 62%), radial-gradient(60% 60% at 8% 92%, #4a3596 0%, transparent 62%), radial-gradient(50% 45% at 100% 100%, #1c6a86 0%, transparent 60%), linear-gradient(170deg, #0c1124, #151b36)' },
  { key: 'nebula', name: 'Nebula', tone: 'dark', swatch: 'radial-gradient(circle 1.5px at 24% 16%, #ffffffcc 0%, transparent 100%), radial-gradient(circle 1px at 58% 30%, #ffffffaa 0%, transparent 100%), radial-gradient(circle 1.5px at 90% 58%, #ffffff99 0%, transparent 100%), radial-gradient(circle 1px at 12% 70%, #ffffff88 0%, transparent 100%), radial-gradient(50% 50% at 86% 18%, #b8327f 0%, transparent 60%), radial-gradient(55% 60% at 14% 30%, #5f2bc8 0%, transparent 62%), radial-gradient(45% 40% at 68% 96%, #18b4c8aa 0%, transparent 65%), linear-gradient(200deg, #150b29, #0b1026)' },
  { key: 'pine', name: 'Pine', tone: 'dark', swatch: 'radial-gradient(40% 35% at 76% 14%, #d9b03a55 0%, transparent 68%), radial-gradient(60% 60% at 16% 18%, #1f7a5a 0%, transparent 62%), radial-gradient(55% 55% at 92% 84%, #2d5c88 0%, transparent 62%), radial-gradient(50% 45% at 30% 100%, #14503f 0%, transparent 65%), linear-gradient(185deg, #0e1f19, #0a1512)' },
];

const PAGE_COLOR = { light: '#eef3fb', dark: '#15171d', highDark: '#000000', highLight: '#ffffff' };

/**
 * Writes the appearance onto <html>. `animate` cross-fades colours for an
 * explicit switch; it is off for the first application so a page never
 * animates in from the wrong theme.
 */
export function applyAppearance(settings: AppearanceSettings, systemPrefersDark: boolean, animate: boolean) {
  const root = document.documentElement;
  const dark = resolveDark(settings, systemPrefersDark);
  const glass = settings.material === 'glass';
  const high = settings.contrast === 'high';

  let clearTransition: number | undefined;
  if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('theme-transition');
    clearTransition = window.setTimeout(() => root.classList.remove('theme-transition'), 380);
  }

  root.classList.toggle('dark', dark);
  root.style.colorScheme = dark ? 'dark' : 'light';
  toggleAttr(root, 'data-contrast', high ? 'high' : null);
  toggleAttr(root, 'data-material', glass ? 'glass' : null);

  if (glass) {
    root.style.setProperty('--glass-a', String(clampGlassOpacity(settings.glassOpacity)));
    root.style.setProperty('--wallpaper-dim', String(clampWallpaperDim(settings.wallpaperDim)));
    const w = settings.wallpaper;
    if (w.kind === 'image') {
      toggleAttr(root, 'data-wallpaper', null);
      root.style.setProperty('--wallpaper-image', `url("${w.url.replace(/"/g, '%22')}")`);
      if (w.color) root.style.setProperty('--wallpaper-color', w.color);
      else root.style.removeProperty('--wallpaper-color');
    } else {
      root.style.removeProperty('--wallpaper-image');
      root.style.removeProperty('--wallpaper-color');
      toggleAttr(root, 'data-wallpaper', w.key);
    }
  } else {
    root.style.removeProperty('--glass-a');
    root.style.removeProperty('--wallpaper-dim');
    root.style.removeProperty('--wallpaper-image');
    root.style.removeProperty('--wallpaper-color');
    toggleAttr(root, 'data-wallpaper', null);
  }

  // Mobile browser chrome follows the page.
  const color = glass && settings.wallpaper.kind === 'image' && settings.wallpaper.color
    ? settings.wallpaper.color
    : high ? (dark ? PAGE_COLOR.highDark : PAGE_COLOR.highLight) : dark ? PAGE_COLOR.dark : PAGE_COLOR.light;
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = color;

  return () => {
    if (clearTransition) window.clearTimeout(clearTransition);
  };
}

/**
 * Back to Arcade's standard light design — used on public pages (landing, explore, sign-in),
 * which never take the viewer's appearance.
 */
export function clearAppearance() {
  const root = document.documentElement;
  root.classList.remove('dark', 'theme-transition');
  root.style.colorScheme = 'light';
  for (const attr of ['data-contrast', 'data-material', 'data-wallpaper', 'data-theme-scope']) root.removeAttribute(attr);
  for (const prop of ['--glass-a', '--wallpaper-dim', '--wallpaper-image', '--wallpaper-color']) root.style.removeProperty(prop);
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.remove();
}

function toggleAttr(el: HTMLElement, name: string, value: string | null) {
  if (value == null) el.removeAttribute(name);
  else if (el.getAttribute(name) !== value) el.setAttribute(name, value);
}

/** A gallery entry as a choosable wallpaper — a live one carries its video. */
export function galleryWallpaper(g: GalleryWallpaper): Wallpaper {
  return {
    kind: 'image',
    id: g.id,
    url: g.imageUrl,
    tone: g.tone === 'LIGHT' ? 'light' : 'dark',
    color: g.averageColor,
    video: g.mediaKind === 'VIDEO' && g.videoUrl ? { url: g.videoUrl, sizeBytes: g.videoSizeBytes } : null,
  };
}

// ── server copy ⇄ local settings ─────────────────────────────────────────

export function fromServer(dto: AppearanceDto): AppearanceSettings {
  const w = dto.wallpaper;
  const wallpaper: Wallpaper =
    w.kind === 'image' && w.id && w.url
      ? {
          kind: 'image',
          id: w.id,
          url: w.url,
          tone: w.tone === 'LIGHT' ? 'light' : 'dark',
          color: w.color,
          video: w.videoUrl ? { url: w.videoUrl, sizeBytes: w.videoSizeBytes ?? null } : null,
        }
      : w.key
        ? { kind: 'preset', key: w.key, tone: w.tone === 'LIGHT' ? 'light' : 'dark' }
        : DEFAULT_WALLPAPER;
  return {
    mode: dto.mode.toLowerCase() as AppearanceSettings['mode'],
    contrast: dto.contrast === 'HIGH' ? 'high' : 'standard',
    material: dto.material === 'GLASS' ? 'glass' : 'solid',
    glassTone: dto.glassTone.toLowerCase() as AppearanceSettings['glassTone'],
    glassOpacity: clampGlassOpacity(dto.glassOpacity),
    wallpaper,
    wallpaperDim: clampWallpaperDim(dto.wallpaperDim ?? 0.2),
  };
}

export function toServer(s: AppearanceSettings): AppearanceSaveRequest {
  return {
    mode: s.mode.toUpperCase() as AppearanceSaveRequest['mode'],
    contrast: s.contrast === 'high' ? 'HIGH' : 'STANDARD',
    material: s.material === 'glass' ? 'GLASS' : 'SOLID',
    glassTone: s.glassTone.toUpperCase() as AppearanceSaveRequest['glassTone'],
    glassOpacity: Math.round(clampGlassOpacity(s.glassOpacity) * 100) / 100,
    wallpaperDim: Math.round(clampWallpaperDim(s.wallpaperDim) * 100) / 100,
    wallpaperPreset: s.wallpaper.kind === 'preset' ? s.wallpaper.key : null,
    wallpaperId: s.wallpaper.kind === 'image' ? s.wallpaper.id : null,
  };
}
