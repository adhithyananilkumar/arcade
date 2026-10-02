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

import type { AppearanceDto, AppearanceSaveRequest } from '@/domains/identity';
import {
  DEFAULT_WALLPAPER,
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
    root.style.setProperty('--glass-a', String(settings.glassOpacity));
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

function toggleAttr(el: HTMLElement, name: string, value: string | null) {
  if (value == null) el.removeAttribute(name);
  else if (el.getAttribute(name) !== value) el.setAttribute(name, value);
}

// ── server copy ⇄ local settings ─────────────────────────────────────────

export function fromServer(dto: AppearanceDto): AppearanceSettings {
  const w = dto.wallpaper;
  const wallpaper: Wallpaper =
    w.kind === 'image' && w.id && w.url
      ? { kind: 'image', id: w.id, url: w.url, tone: w.tone === 'LIGHT' ? 'light' : 'dark', color: w.color }
      : w.key
        ? { kind: 'preset', key: w.key, tone: w.tone === 'LIGHT' ? 'light' : 'dark' }
        : DEFAULT_WALLPAPER;
  return {
    mode: dto.mode.toLowerCase() as AppearanceSettings['mode'],
    contrast: dto.contrast === 'HIGH' ? 'high' : 'standard',
    material: dto.material === 'GLASS' ? 'glass' : 'solid',
    glassTone: dto.glassTone.toLowerCase() as AppearanceSettings['glassTone'],
    glassOpacity: dto.glassOpacity,
    wallpaper,
  };
}

export function toServer(s: AppearanceSettings): AppearanceSaveRequest {
  return {
    mode: s.mode.toUpperCase() as AppearanceSaveRequest['mode'],
    contrast: s.contrast === 'high' ? 'HIGH' : 'STANDARD',
    material: s.material === 'glass' ? 'GLASS' : 'SOLID',
    glassTone: s.glassTone.toUpperCase() as AppearanceSaveRequest['glassTone'],
    glassOpacity: Math.round(s.glassOpacity * 100) / 100,
    wallpaperPreset: s.wallpaper.kind === 'preset' ? s.wallpaper.key : null,
    wallpaperId: s.wallpaper.kind === 'image' ? s.wallpaper.id : null,
  };
}
