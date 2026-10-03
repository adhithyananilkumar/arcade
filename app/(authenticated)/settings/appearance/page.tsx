'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';
import {
  Contrast,
  ImageIcon,
  Maximize2,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  Sparkles,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppearanceService, type GalleryWallpaper } from '@/domains/identity';
import { WALLPAPER_PRESETS, galleryWallpaper } from '@/apps/core/lib/appearance';
import { formatMegabytes } from '@/apps/core/lib/liveWallpaper';
import { SelectedLiveWallpaperNotice, useLiveDownloadProgress } from '@/apps/core/components/appearance/LiveWallpaper';
import { useSystemPrefersDark } from '@/apps/core/components/AppearanceController';
import {
  GLASS_OPACITY_MAX,
  WALLPAPER_DIM_MAX,
  GLASS_OPACITY_MIN,
  pickAppearance,
  resolveDark,
  useAppearanceStore,
  type GlassTone,
  type ThemeMode,
  type Wallpaper,
} from '@/infrastructure/state/theme.store';
import { cn } from '@/shared/utils/utils';
import {
  ChoiceCard,
  MiniApp,
  PALETTES,
  Segmented,
  Switch,
  WallpaperTile,
} from '@/apps/core/components/appearance/AppearanceControls';

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

// ── page ──────────────────────────────────────────────────────────────────

export default function AppearancePage() {
  const settings = useAppearanceStore(useShallow(pickAppearance));
  const update = useAppearanceStore((s) => s.update);
  const reset = useAppearanceStore((s) => s.reset);
  const quickPanel = useAppearanceStore((s) => s.quickPanel);
  const setQuickPanel = useAppearanceStore((s) => s.setQuickPanel);
  const systemDark = useSystemPrefersDark();
  const download = useLiveDownloadProgress();
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
        <div role="radiogroup" aria-label="Theme" className="grid max-w-xl grid-cols-3 gap-2.5">
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
                  const w = galleryWallpaper(g);
                  const video = w.kind === 'image' ? w.video : null;
                  return (
                    <WallpaperTile
                      key={g.id}
                      name={g.name}
                      tone={w.tone}
                      background={g.averageColor}
                      image={g.thumbnailUrl}
                      live={video ? { size: formatMegabytes(video.sizeBytes) } : null}
                      progress={video && download?.url === video.url ? download.pct : null}
                      selected={glass && isSelected(w)}
                      onSelect={() => chooseWallpaper(w)}
                    />
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

          <SelectedLiveWallpaperNotice />

          <div className={cn('grid gap-5 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-3', !glass && 'pointer-events-none opacity-50')} aria-disabled={!glass}>
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
            <div>
              <label htmlFor="wallpaper-dim" className="mb-2 flex items-center justify-between text-[13px] font-semibold text-slate-800">
                Wallpaper dimming
                <span className="text-[12px] font-medium tabular-nums text-slate-500">
                  {settings.wallpaperDim < 0.01 ? 'Off' : `${Math.round(settings.wallpaperDim * 100)}%`}
                </span>
              </label>
              <input
                id="wallpaper-dim"
                type="range"
                min={0}
                max={WALLPAPER_DIM_MAX}
                step={0.01}
                value={settings.wallpaperDim}
                onChange={(e) => update({ wallpaperDim: Number(e.target.value) })}
                className="w-full accent-[#4c6fff]"
              />
              <div className="mt-1 flex justify-between text-[11px] font-medium text-slate-400">
                <span>Vivid</span>
                <span>{dark ? 'Dimmed' : 'Softened'}</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section
        icon={Palette}
        title="Quick preferences button"
        description="A button in the bottom-left corner of your dashboard that opens theme, glass and wallpaper controls without leaving the page. Saved on this device."
        action={<Switch checked={quickPanel} onChange={setQuickPanel} label="Show quick preferences button" />}
      />

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
