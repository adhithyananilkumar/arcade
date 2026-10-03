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

import { Check, Moon, Sun, type LucideIcon } from 'lucide-react';
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
        'group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-200 outline-none',
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
            'ml-auto grid size-[18px] place-items-center rounded-full border transition-colors',
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
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
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
              'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all',
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

export function WallpaperTile({ selected, onSelect, name, tone, background, image }: {
  selected: boolean;
  onSelect: () => void;
  name: string;
  tone: 'light' | 'dark';
  background: string;
  image?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${name} (${tone} wallpaper)`}
      onClick={onSelect}
      className={cn(
        'group relative aspect-[16/10] overflow-hidden rounded-xl border-2 transition-all outline-none',
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
      {selected && (
        <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-[#4c6fff] text-white shadow">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

