'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * The appearance controls shared by Settings → Appearance and the quick
 * preferences panel: theme previews, segmented control, switch, and the
 * wallpaper tile. Presentational only — callers own the store updates.
 * ------------------------------------------------------------------
 */

import { AlertTriangle, Check, Moon, Play, Sun, Zap, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/utils';

// ── mini previews ─────────────────────────────────────────────────────────
// Drawn with fixed colours on purpose: each card shows *its* theme, whatever theme is active.

export type PreviewPalette = { page: string; surface: string; line: string; text: string; muted: string; accent: string };

export const PALETTES: Record<'light' | 'dark' | 'highDark' | 'highLight', PreviewPalette> = {
  light: { page: '#eef3fb', surface: '#ffffff', line: '#e2e8f0', text: '#14142b', muted: '#94a3b8', accent: '#4c6fff' },
  dark: { page: '#15171d', surface: '#1c1f27', line: '#2c303b', text: '#e8ebf2', muted: '#7d8597', accent: '#7f9cff' },
  highDark: { page: '#000000', surface: '#0f0f0f', line: '#8a8a8a', text: '#ffffff', muted: '#d4d4d4', accent: '#ffd84d' },
  highLight: { page: '#ffffff', surface: '#ffffff', line: '#4b5563', text: '#000000', muted: '#1f2937', accent: '#0b3d82' },
};

export function MiniApp({ p, glass, wallpaper }: { p: PreviewPalette; glass?: boolean; wallpaper?: string }) {
  const surface = glass ? `color-mix(in oklab, ${p.surface} 62%, transparent)` : p.surface;
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: wallpaper ?? p.page, backgroundSize: 'cover', backgroundPosition: 'center' }}
      aria-hidden
    >
      <div className="absolute inset-x-2.5 top-2.5 flex h-4 items-center gap-1 rounded-full px-1.5" style={{ background: surface, backdropFilter: glass ? 'blur(6px)' : undefined, boxShadow: `inset 0 0 0 1px ${p.line}` }}>
        <span className="size-1.5 rounded-full" style={{ background: p.accent }} />
        <span className="h-1 w-6 rounded-full" style={{ background: p.muted }} />
        <span className="ml-auto h-1 w-3 rounded-full" style={{ background: p.line }} />
      </div>
      <div className="absolute inset-x-2.5 bottom-2.5 top-9 grid grid-cols-[1fr_1.4fr] gap-1.5">
        <div className="rounded-md p-1.5" style={{ background: surface, backdropFilter: glass ? 'blur(6px)' : undefined, boxShadow: `inset 0 0 0 1px ${p.line}` }}>
          <div className="h-1.5 w-8 rounded-full" style={{ background: p.text }} />
          <div className="mt-1.5 h-1 w-10 rounded-full" style={{ background: p.muted }} />
          <div className="mt-1 h-1 w-7 rounded-full" style={{ background: p.muted }} />
          <div className="mt-2.5 h-2.5 w-9 rounded-full" style={{ background: p.text }} />
        </div>
        <div className="grid grid-rows-2 gap-1.5">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-md p-1.5" style={{ background: surface, backdropFilter: glass ? 'blur(6px)' : undefined, boxShadow: `inset 0 0 0 1px ${p.line}` }}>
              <div className="h-1.5 w-12 rounded-full" style={{ background: p.text }} />
              <div className="mt-1 h-1 w-16 rounded-full" style={{ background: p.muted }} />
              <div className="mt-1.5 h-1 w-6 rounded-full" style={{ background: p.accent }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── building blocks ───────────────────────────────────────────────────────

export function ChoiceCard({ selected, onSelect, label, hint, icon: Icon, children, disabled }: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  hint?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md border text-left transition-all duration-200 outline-none',
        'focus-visible:ring-2 focus-visible:ring-[#4c6fff] focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        selected
          ? 'border-[#4c6fff] shadow-[0_0_0_3px_rgba(76,111,255,0.18)]'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <div className="aspect-[16/10] w-full">{children}</div>
      <div className="flex items-center gap-1.5 border-t border-slate-200/80 bg-surface px-2.5 py-2">
        <Icon size={14} className={selected ? 'text-[#4c6fff] dark:text-[#8db1ff]' : 'text-slate-500'} />
        <span className="text-[12.5px] font-semibold text-slate-900">{label}</span>
        {hint && <span className="hidden truncate text-[11px] text-slate-400 sm:inline">{hint}</span>}
        <span
          className={cn(
            'ml-auto grid size-[18px] place-items-center rounded-tl-sm rounded-br-sm rounded-tr-none rounded-bl-none border transition-colors',
            selected ? 'border-[#4c6fff] bg-[#4c6fff] text-white' : 'border-slate-300',
          )}
        >
          {selected && <Check size={11} strokeWidth={3} />}
        </span>
      </div>
    </button>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label }: {
  value: T;
  options: { value: T; label: string; icon?: LucideIcon }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-tl-xl rounded-br-xl rounded-tr-xs rounded-bl-xs border border-slate-200 bg-slate-100 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-tl-lg rounded-br-lg rounded-tr-xs rounded-bl-xs px-3.5 py-1.5 text-xs font-semibold transition-all',
              active ? 'bg-surface text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800',
            )}
          >
            {o.icon && <o.icon size={13} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4c6fff]',
        checked ? 'bg-[#4c6fff]' : 'bg-slate-300',
      )}
    >
      <span className={cn('theme-fixed absolute left-0 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform', checked ? 'translate-x-[22px]' : 'translate-x-0.5')} />
    </button>
  );
}

export function WallpaperTile({ selected, onSelect, name, tone, background, image, live, progress }: {
  selected: boolean;
  onSelect: () => void;
  name: string;
  tone: 'light' | 'dark';
  background: string;
  image?: string;
  /** A live (video) wallpaper: shows a LIVE badge with its download size. */
  live?: { size: string } | null;
  /** 0–100 while this tile's video downloads; null otherwise. */
  progress?: number | null;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${name} (${live ? `live ${live.size} ` : ''}${tone} wallpaper)`}
      onClick={onSelect}
      className={cn(
        'group relative aspect-[16/10] overflow-hidden rounded-tl-xl rounded-br-xl rounded-tr-xs rounded-bl-xs border-2 transition-all outline-none',
        'focus-visible:ring-2 focus-visible:ring-[#4c6fff] focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        selected ? 'border-[#4c6fff] shadow-[0_0_0_3px_rgba(76,111,255,0.2)]' : 'border-transparent hover:scale-[1.02]',
      )}
      style={{ background, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
      )}
      <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-5 text-left">
        <span className="truncate text-[11.5px] font-semibold text-white drop-shadow">{name}</span>
        {tone === 'dark' ? <Moon size={11} className="shrink-0 text-white/85" /> : <Sun size={11} className="shrink-0 text-white/85" />}
      </span>
      {live && (
        <span className="theme-fixed absolute left-1.5 top-1.5 flex items-center gap-1 rounded-tl-md rounded-br-md rounded-tr-xs rounded-bl-xs bg-black/55 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
          <Play size={8} fill="currentColor" />
          Live{live.size ? ` · ${live.size}` : ''}
        </span>
      )}
      {progress != null && (
        <span className="theme-fixed absolute inset-0 grid place-items-center bg-black/45 backdrop-blur-[1px]">
          <span className="text-[13px] font-bold tabular-nums text-white drop-shadow">{progress}%</span>
          <span className="absolute inset-x-2 bottom-2 h-1 overflow-hidden rounded-full bg-white/25">
            <span className="block h-full rounded-full bg-surface transition-[width] duration-200" style={{ width: `${progress}%` }} />
          </span>
        </span>
      )}
      {selected && progress == null && (
        <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-tl-md rounded-br-md rounded-tr-xs rounded-bl-xs bg-[#4c6fff] text-white shadow">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

/**
 * Shown while a live wallpaper is selected: what it costs, a stronger warning on devices that are
 * likely to struggle, and the per-device switch to fall back to the still poster.
 */
export function LiveWallpaperNotice({ size, lowEnd, reasons, playing, onPlayingChange, reducedMotion }: {
  size: string;
  lowEnd: boolean;
  reasons: string[];
  playing: boolean;
  onPlayingChange: (play: boolean) => void;
  reducedMotion: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md border p-3 text-[12px] leading-relaxed',
        lowEnd
          ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200'
          : 'border-indigo-200/70 bg-indigo-50/70 text-indigo-950 dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-200',
      )}
    >
      <div className="flex gap-2.5">
        {lowEnd ? <AlertTriangle size={15} className="mt-0.5 shrink-0" /> : <Zap size={15} className="mt-0.5 shrink-0" />}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-semibold">Live wallpaper{size ? ` · ${size}` : ''}</p>
          <p>
            It is a looping video: downloaded once with a progress indicator, then saved on this device so it starts
            instantly next time. It pauses when the tab is hidden.
          </p>
          {lowEnd ? (
            <p className="font-medium">
              This device may lag with it{reasons.length ? ` (${reasons.join(', ')})` : ''}. If scrolling feels slow, turn
              playback off — the still frame stays.
            </p>
          ) : (
            <p>On older or low-power computers it can make scrolling feel slower; you can turn playback off at any time.</p>
          )}
          {reducedMotion && <p className="font-medium">Your system asks for reduced motion, so the still frame is shown.</p>}
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-current/10 pt-2.5">
        <span className="font-semibold">Play live wallpapers on this device</span>
        <Switch checked={playing} onChange={onPlayingChange} label="Play live wallpapers on this device" />
      </div>
    </div>
  );
}

