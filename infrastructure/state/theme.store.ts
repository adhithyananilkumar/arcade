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
  /** Surface opacity in glass, GLASS_OPACITY_MIN (clearest allowed) … GLASS_OPACITY_MAX (frosted). */
  glassOpacity: number;
  wallpaper: Wallpaper;
  /** How strongly the wallpaper is dimmed behind glass, 0 (off) … WALLPAPER_DIM_MAX. */
  wallpaperDim: number;
}

/**
 * Glass never goes clearer than this: below it, text over a busy photo stops being reliably
 * readable. (The server accepts down to 0.35 for older saved values; the client clamps.)
 */
export const GLASS_OPACITY_MIN = 0.5;
export const GLASS_OPACITY_MAX = 0.9;
export const WALLPAPER_DIM_MAX = 0.6;

export const clampGlassOpacity = (v: number) =>
  Math.min(GLASS_OPACITY_MAX, Math.max(GLASS_OPACITY_MIN, Number.isFinite(v) ? v : 0.68));
export const clampWallpaperDim = (v: number) =>
  Math.min(WALLPAPER_DIM_MAX, Math.max(0, Number.isFinite(v) ? v : 0.2));

export const DEFAULT_WALLPAPER: Wallpaper = { kind: 'preset', key: 'aurora', tone: 'dark' };

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  mode: 'light',
  contrast: 'standard',
  material: 'solid',
  glassTone: 'auto',
  glassOpacity: 0.68,
  wallpaper: DEFAULT_WALLPAPER,
  wallpaperDim: 0.2,
};

interface AppearanceState extends AppearanceSettings {
  /** When the local value last changed, so a newer server copy can be told apart from a stale one. */
  updatedAt: number;
  /**
   * Whether the quick preferences button shows on the dashboard. A per-device launcher choice,
   * not part of the appearance itself, so it is not synced to the account.
   */
  quickPanel: boolean;
  setQuickPanel: (visible: boolean) => void;
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
      quickPanel: true,
      setQuickPanel: (quickPanel) => set({ quickPanel }),
      update: (patch) => set({ ...patch, updatedAt: Date.now() }),
      hydrateFromServer: (settings, updatedAt) => set({ ...settings, updatedAt }),
      reset: () => set({ ...DEFAULT_APPEARANCE, updatedAt: Date.now() }),
    }),
    {
      name: APPEARANCE_STORAGE_KEY,
      version: 2,
      // v1 had no dimming and allowed glass down to 0.35.
      migrate: (persisted) => {
        const s = (persisted ?? {}) as Partial<AppearanceState>;
        return {
          ...s,
          glassOpacity: clampGlassOpacity(s.glassOpacity ?? DEFAULT_APPEARANCE.glassOpacity),
          wallpaperDim: clampWallpaperDim(s.wallpaperDim ?? DEFAULT_APPEARANCE.wallpaperDim),
        } as AppearanceState;
      },
      partialize: ({ mode, contrast, material, glassTone, glassOpacity, wallpaper, wallpaperDim, updatedAt, quickPanel }) => ({
        quickPanel,
        mode,
        contrast,
        material,
        glassTone,
        glassOpacity,
        wallpaper,
        wallpaperDim,
        updatedAt,
      }),
    },
  ),
);

/** The settings alone, without the store's actions. */
export function pickAppearance(state: AppearanceSettings): AppearanceSettings {
  const { mode, contrast, material, glassTone, glassOpacity, wallpaper, wallpaperDim } = state;
  return { mode, contrast, material, glassTone, glassOpacity, wallpaper, wallpaperDim };
}

/**
 * The signed-in app's routes — the only pages the theme applies to. Landing, explore, public
 * course/event pages and sign-in always render Arcade's standard light design.
 *
 * This is only the first-paint hint for the boot script; at runtime the (authenticated) layout's
 * ThemeScope is the source of truth. theme.scope.test.ts walks app/ and fails if this stops
 * matching every (authenticated) page or starts matching a (public) one.
 */
export const APP_THEME_ROUTE_SOURCE =
  '^/(?:home|learning|achievements|bug-reports|channels|console|manage-channels|my-events|notifications|organizations|profile|search|settings|studio|trash|join)(?:/|$)' +
  '|^/(?:courses|events)/[^/]+/(?:learn|notes)(?:/|$)' +
  '|^/exams/.+';
export const APP_THEME_ROUTE = new RegExp(APP_THEME_ROUTE_SOURCE);

interface ThemeScopeState {
  /** Mounted ThemeScope boundaries. */
  scopes: number;
  /** The boot script's first-paint decision; consumed when the first boundary mounts. */
  booted: boolean;
  enter: () => void;
  leave: () => void;
}

/** Whether the current page is inside the themed app: `scopes > 0 || booted`. */
export const useThemeScopeStore = create<ThemeScopeState>()((set) => ({
  scopes: 0,
  booted: typeof document !== 'undefined' && document.documentElement.hasAttribute('data-theme-scope'),
  enter: () => set((s) => ({ scopes: s.scopes + 1, booted: false })),
  leave: () => set((s) => ({ scopes: Math.max(0, s.scopes - 1) })),
}));

export const selectInThemeScope = (s: ThemeScopeState) => s.scopes > 0 || s.booted;

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
 * Inline script for the signed-in app's layout: applies the stored appearance
 * before its first paint, so a dark or glass user never sees a flash of the
 * light theme. Public pages (landing, explore…) never run it and always render
 * Arcade's standard light design — see ThemeScope. Mirrors
 * `resolveDark` and AppearanceController.applyToDocument — keep them in step.
 * Self-contained by necessity: it runs before any module is loaded.
 */
export const APPEARANCE_BOOT_SCRIPT = `(function(){try{
var d=document.documentElement,s=null;
if(!new RegExp(${JSON.stringify(APP_THEME_ROUTE_SOURCE)}).test(location.pathname))return;
d.setAttribute('data-theme-scope','app');
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
if(typeof s.glassOpacity==='number')d.style.setProperty('--glass-a',String(Math.min(${GLASS_OPACITY_MAX},Math.max(${GLASS_OPACITY_MIN},s.glassOpacity))));
if(typeof s.wallpaperDim==='number')d.style.setProperty('--wallpaper-dim',String(Math.min(${WALLPAPER_DIM_MAX},Math.max(0,s.wallpaperDim))));
if(w.kind==='image'&&w.url){d.style.setProperty('--wallpaper-image','url("'+String(w.url).replace(/"/g,'%22')+'")');if(w.color)d.style.setProperty('--wallpaper-color',w.color);}
else d.setAttribute('data-wallpaper',w.key||'aurora');
}
}catch(e){}})();`;
