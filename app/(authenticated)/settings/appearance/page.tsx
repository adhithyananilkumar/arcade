'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';
import {
  Check,
  Contrast,
  ImageIcon,
  Maximize2,
  Monitor,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppearanceService, type GalleryWallpaper } from '@/domains/identity';
import { WALLPAPER_PRESETS } from '@/apps/core/lib/appearance';
import { useSystemPrefersDark } from '@/apps/core/components/AppearanceController';
import {
  GLASS_OPACITY_MAX,
  GLASS_OPACITY_MIN,
  pickAppearance,
  resolveDark,
  useAppearanceStore,
  type GlassTone,
  type ThemeMode,
  type Wallpaper,
} from '@/infrastructure/state/theme.store';
import { cn } from '@/shared/utils/utils';

// ── mini previews ─────────────────────────────────────────────────────────
// Drawn with fixed colours on purpose: each card shows *its* theme, whatever theme is active.

type PreviewPalette = { page: string; surface: string; line: string; text: string; muted: string; accent: string };

const PALETTES: Record<'light' | 'dark' | 'highDark' | 'highLight', PreviewPalette> = {
  light: { page: '#eef3fb', surface: '#ffffff', line: '#e2e8f0', text: '#14142b', muted: '#94a3b8', accent: '#4c6fff' },
  dark: { page: '#15171d', surface: '#1c1f27', line: '#2c303b', text: '#e8ebf2', muted: '#7d8597', accent: '#7f9cff' },
  highDark: { page: '#000000', surface: '#0f0f0f', line: '#8a8a8a', text: '#ffffff', muted: '#d4d4d4', accent: '#ffd84d' },
  highLight: { page: '#ffffff', surface: '#ffffff', line: '#4b5563', text: '#000000', muted: '#1f2937', accent: '#0b3d82' },
};

function MiniApp({ p, glass, wallpaper }: { p: PreviewPalette; glass?: boolean; wallpaper?: string }) {
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

function Section({ icon: Icon, title, description, children, action }: {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-surface p-5 shadow-xs sm:p-6">
      <header className={cn('flex items-start justify-between gap-4', children != null && 'mb-5')}>
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-700">
            <Icon size={18} />
          </span>
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-slate-900">{title}</h2>
            <p className="mt-0.5 text-[13px] leading-relaxed text-slate-500">{description}</p>
          </div>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function ChoiceCard({ selected, onSelect, label, hint, icon: Icon, children, disabled }: {
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
      <div className="flex items-center gap-2 border-t border-slate-200/80 bg-surface px-3 py-2.5">
        <Icon size={14} className={selected ? 'text-[#4c6fff] dark:text-[#8db1ff]' : 'text-slate-500'} />
        <span className="text-[13px] font-semibold text-slate-900">{label}</span>
        {hint && <span className="text-[11.5px] text-slate-400">{hint}</span>}
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

function Segmented<T extends string>({ value, options, onChange, label }: {
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

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
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

function WallpaperTile({ selected, onSelect, name, tone, background, image }: {
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

// ── page ──────────────────────────────────────────────────────────────────

export default function AppearancePage() {
  const settings = useAppearanceStore(useShallow(pickAppearance));
  const update = useAppearanceStore((s) => s.update);
  const reset = useAppearanceStore((s) => s.reset);
  const systemDark = useSystemPrefersDark();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const gallery = useQuery({
    queryKey: ['appearance', 'gallery'],
    queryFn: AppearanceService.gallery,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    const sync = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const glass = settings.material === 'glass';
  const high = settings.contrast === 'high';
  const dark = resolveDark(settings, systemDark);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => toast.info('Press F11 on your keyboard to enter fullscreen mode'));
    } else {
      void document.exitFullscreen?.();
    }
  };

  const chooseWallpaper = (wallpaper: Wallpaper) => update({ wallpaper, material: 'glass' });
  const isSelected = (w: Wallpaper) =>
    settings.wallpaper.kind === w.kind &&
    (w.kind === 'preset'
      ? settings.wallpaper.kind === 'preset' && settings.wallpaper.key === w.key
      : settings.wallpaper.kind === 'image' && settings.wallpaper.id === w.id);

  const modes: { value: ThemeMode; label: string; icon: LucideIcon; preview: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: Sun, preview: <MiniApp p={high ? PALETTES.highLight : PALETTES.light} /> },
    { value: 'dark', label: 'Dark', icon: Moon, preview: <MiniApp p={high ? PALETTES.highDark : PALETTES.dark} /> },
    {
      value: 'system',
      label: 'System',
      icon: Monitor,
      preview: (
        <div className="relative h-full w-full">
          <MiniApp p={high ? PALETTES.highLight : PALETTES.light} />
          <div className="absolute inset-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}>
            <MiniApp p={high ? PALETTES.highDark : PALETTES.dark} />
          </div>
        </div>
      ),
    },
  ];

  const opacityPct = Math.round(((settings.glassOpacity - GLASS_OPACITY_MIN) / (GLASS_OPACITY_MAX - GLASS_OPACITY_MIN)) * 100);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Section
        icon={dark ? Moon : Sun}
        title="Theme"
        description={glass ? 'Glass is on — its text follows your wallpaper. Theme applies when glass is off.' : 'Choose how Arcade looks. System follows your device and switches with it.'}
        action={
          <button
            type="button"
            onClick={() => {
              reset();
              toast.success('Appearance reset to default');
            }}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        }
      >
        <div role="radiogroup" aria-label="Theme" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {modes.map((m) => (
            <ChoiceCard
              key={m.value}
              icon={m.icon}
              label={m.label}
              hint={m.value === 'system' ? (systemDark ? 'now dark' : 'now light') : undefined}
              selected={!glass && settings.mode === m.value}
              onSelect={() => update({ mode: m.value, material: 'solid' })}
            >
              {m.preview}
            </ChoiceCard>
          ))}
        </div>
      </Section>

      <Section icon={Contrast} title="High contrast" description="Stronger text, borders and focus rings, and near-opaque glass. Helps in bright light and for low vision.">
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex overflow-hidden rounded-lg border border-slate-200 text-[11px] font-bold">
              <span className="theme-fixed bg-white px-2 py-1 text-black">Aa</span>
              <span className="theme-fixed bg-black px-2 py-1 text-white">Aa</span>
            </div>
            <span className="text-[13px] font-medium text-slate-700">{high ? 'High contrast is on' : 'Standard contrast'}</span>
          </div>
          <Switch checked={high} onChange={(v) => update({ contrast: v ? 'high' : 'standard' })} label="High contrast" />
        </div>
      </Section>

      <Section
        icon={Sparkles}
        title="Dynamic Glass"
        description="Translucent, frosted surfaces over a wallpaper of your choice."
        action={<Switch checked={glass} onChange={(v) => update({ material: v ? 'glass' : 'solid' })} label="Dynamic Glass" />}
      >
        <div className="space-y-6">
          <div>
            <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Arcade wallpapers</h3>
            <div role="radiogroup" aria-label="Arcade wallpapers" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
              {WALLPAPER_PRESETS.map((p) => {
                const w: Wallpaper = { kind: 'preset', key: p.key, tone: p.tone };
                return (
                  <WallpaperTile key={p.key} name={p.name} tone={p.tone} background={p.swatch} selected={glass && isSelected(w)} onSelect={() => chooseWallpaper(w)} />
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Gallery
              {gallery.data && gallery.data.length > 0 && <span className="rounded-full bg-slate-100 px-1.5 py-px text-[10px] tracking-normal text-slate-500">{gallery.data.length}</span>}
            </h3>
            {gallery.isLoading ? (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[16/10] animate-pulse rounded-xl bg-slate-100" />)}
              </div>
            ) : gallery.data && gallery.data.length > 0 ? (
              <div role="radiogroup" aria-label="Wallpaper gallery" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
                {gallery.data.map((g: GalleryWallpaper) => {
                  const w: Wallpaper = { kind: 'image', id: g.id, url: g.imageUrl, tone: g.tone === 'LIGHT' ? 'light' : 'dark', color: g.averageColor };
                  return (
                    <WallpaperTile key={g.id} name={g.name} tone={w.tone} background={g.averageColor} image={g.thumbnailUrl} selected={glass && isSelected(w)} onSelect={() => chooseWallpaper(w)} />
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-[13px] text-slate-500">
                <ImageIcon size={16} className="shrink-0 text-slate-400" />
                {gallery.isError ? 'The wallpaper gallery could not be loaded. The Arcade wallpapers above still work.' : 'No photo wallpapers yet — your platform team can add them in Console.'}
              </div>
            )}
          </div>

          <div className={cn('grid gap-5 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2', !glass && 'pointer-events-none opacity-50')} aria-disabled={!glass}>
            <div>
              <div className="mb-2 text-[13px] font-semibold text-slate-800">Text tone</div>
              <Segmented<GlassTone>
                label="Glass text tone"
                value={settings.glassTone}
                onChange={(glassTone) => update({ glassTone })}
                options={[
                  { value: 'auto', label: 'Auto' },
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'dark', label: 'Dark', icon: Moon },
                ]}
              />
              <p className="mt-2 text-[12px] text-slate-500">
                {settings.glassTone === 'auto' ? `Following the wallpaper — ${settings.wallpaper.tone} right now.` : 'Pinned regardless of wallpaper.'}
              </p>
            </div>
            <div>
              <label htmlFor="glass-opacity" className="mb-2 flex items-center justify-between text-[13px] font-semibold text-slate-800">
                Transparency
                <span className="text-[12px] font-medium tabular-nums text-slate-500">{high ? 'Locked by high contrast' : `${100 - opacityPct}%`}</span>
              </label>
              <input
                id="glass-opacity"
                type="range"
                min={GLASS_OPACITY_MIN}
                max={GLASS_OPACITY_MAX}
                step={0.01}
                disabled={high}
                value={settings.glassOpacity}
                onChange={(e) => update({ glassOpacity: Number(e.target.value) })}
                className="w-full accent-[#4c6fff]"
              />
              <div className="mt-1 flex justify-between text-[11px] font-medium text-slate-400">
                <span>Frosted</span>
                <span>Clear</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section
        icon={Maximize2}
        title="Immersive fullscreen"
        description="Hide the browser chrome for focused learning. You can also press F11."
        action={
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex shrink-0 items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-on-ink shadow-xs transition-colors hover:bg-ink-hover"
          >
            <Maximize2 size={13} />
            {isFullscreen ? 'Exit fullscreen' : 'Go fullscreen'}
          </button>
        }
      />
    </motion.div>
  );
}
