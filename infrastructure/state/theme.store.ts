/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Infrastructure
 * Type: Client state
 *
 * Purpose:
 * The viewer's appearance: tone (light/dark/system), contrast, material
 * (solid or glass) and the glass wallpaper. Persisted in localStorage so the
 * pre-paint script in app/layout.tsx can apply it before React loads, and
 * mirrored to the account by AppearanceController so it follows the user
 * across devices.
 *
 * The shape of the persisted value is read by APPEARANCE_BOOT_SCRIPT below —
 * change both together.
 * ------------------------------------------------------------------
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeContrast = 'standard' | 'high';
export type ThemeMaterial = 'solid' | 'glass';
export type GlassTone = 'auto' | 'light' | 'dark';
export type WallpaperTone = 'light' | 'dark';

/** A wallpaper as the client needs it to paint — a built-in preset or an admin-uploaded image. */
export type Wallpaper =
  | { kind: 'preset'; key: string; tone: WallpaperTone }
  | { kind: 'image'; id: string; url: string; tone: WallpaperTone; color: string | null };

export interface AppearanceSettings {
  mode: ThemeMode;
  contrast: ThemeContrast;
  material: ThemeMaterial;
  glassTone: GlassTone;
  /** Surface opacity in glass, 0.35 (clear) … 0.9 (frosted). */
  glassOpacity: number;
  wallpaper: Wallpaper;
}

export const GLASS_OPACITY_MIN = 0.35;
export const GLASS_OPACITY_MAX = 0.9;

export const DEFAULT_WALLPAPER: Wallpaper = { kind: 'preset', key: 'aurora', tone: 'dark' };

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  mode: 'light',
  contrast: 'standard',
  material: 'solid',
  glassTone: 'auto',
  glassOpacity: 0.5,
  wallpaper: DEFAULT_WALLPAPER,
};

interface AppearanceState extends AppearanceSettings {
  /** When the local value last changed, so a newer server copy can be told apart from a stale one. */
  updatedAt: number;
  update: (patch: Partial<AppearanceSettings>) => void;
  /** Replace with the account's stored copy without marking it as a local edit. */
  hydrateFromServer: (settings: AppearanceSettings, updatedAt: number) => void;
  reset: () => void;
}

export const APPEARANCE_STORAGE_KEY = 'arcade-appearance';
const LEGACY_STORAGE_KEY = 'arcade-theme-storage';

function legacyMode(): ThemeMode | null {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LEGACY_STORAGE_KEY) : null;
    const theme = raw ? JSON.parse(raw)?.state?.theme : null;
    return theme === 'dark' || theme === 'light' ? theme : null;
  } catch {
    return null;
  }
}

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      ...DEFAULT_APPEARANCE,
      mode: legacyMode() ?? DEFAULT_APPEARANCE.mode,
      updatedAt: 0,
      update: (patch) => set({ ...patch, updatedAt: Date.now() }),
      hydrateFromServer: (settings, updatedAt) => set({ ...settings, updatedAt }),
      reset: () => set({ ...DEFAULT_APPEARANCE, updatedAt: Date.now() }),
    }),
    {
      name: APPEARANCE_STORAGE_KEY,
      version: 1,
      partialize: ({ mode, contrast, material, glassTone, glassOpacity, wallpaper, updatedAt }) => ({
        mode,
        contrast,
        material,
        glassTone,
        glassOpacity,
        wallpaper,
        updatedAt,
      }),
    },
  ),
);

/** The settings alone, without the store's actions. */
export function pickAppearance(state: AppearanceSettings): AppearanceSettings {
  const { mode, contrast, material, glassTone, glassOpacity, wallpaper } = state;
  return { mode, contrast, material, glassTone, glassOpacity, wallpaper };
}

/**
 * Whether the UI renders dark. Glass follows the wallpaper's tone unless the
 * viewer pinned one; solid follows the mode, with "system" asking the OS.
 */
export function resolveDark(settings: AppearanceSettings, systemPrefersDark: boolean): boolean {
  if (settings.material === 'glass') {
    if (settings.glassTone === 'auto') return settings.wallpaper.tone === 'dark';
    return settings.glassTone === 'dark';
  }
  if (settings.mode === 'system') return systemPrefersDark;
  return settings.mode === 'dark';
}

/**
 * Inline script for <head>: applies the stored appearance before first paint,
 * so a dark or glass user never sees a flash of the light theme. Mirrors
 * `resolveDark` and AppearanceController.applyToDocument — keep them in step.
 * Self-contained by necessity: it runs before any module is loaded.
 */
export const APPEARANCE_BOOT_SCRIPT = `(function(){try{
var d=document.documentElement,s=null;
try{var raw=localStorage.getItem(${JSON.stringify(APPEARANCE_STORAGE_KEY)});s=raw?JSON.parse(raw).state:null;}catch(e){}
if(!s){try{var l=JSON.parse(localStorage.getItem(${JSON.stringify(LEGACY_STORAGE_KEY)})||'null');if(l&&l.state&&l.state.theme)s={mode:l.state.theme};}catch(e){}}
s=s||{};
var m=s.mode||'light',mat=s.material==='glass'?'glass':'solid',w=s.wallpaper||{kind:'preset',key:'aurora',tone:'dark'};
var sys=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
var dark=mat==='glass'?((s.glassTone||'auto')==='auto'?w.tone==='dark':s.glassTone==='dark'):(m==='system'?sys:m==='dark');
d.classList.toggle('dark',dark);
d.style.colorScheme=dark?'dark':'light';
if(s.contrast==='high')d.setAttribute('data-contrast','high');
if(mat==='glass'){
d.setAttribute('data-material','glass');
if(typeof s.glassOpacity==='number')d.style.setProperty('--glass-a',String(s.glassOpacity));
if(w.kind==='image'&&w.url){d.style.setProperty('--wallpaper-image','url("'+String(w.url).replace(/"/g,'%22')+'")');if(w.color)d.style.setProperty('--wallpaper-color',w.color);}
else d.setAttribute('data-wallpaper',w.key||'aurora');
}
}catch(e){}})();`;
