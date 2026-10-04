'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * The dashboard's quick preferences: a small button in the bottom-left
 * corner that opens a floating panel with the everyday appearance controls
 * (theme, high contrast, Dynamic Glass and its wallpaper, text tone,
 * transparency, dimming). Everything else stays in Settings → Appearance,
 * which is also where the button can be hidden again.
 *
 * Sized and styled as a sibling of the bug-report panel: same width class,
 * header/footer bars, content in islands, and the page dims behind it.
 * ------------------------------------------------------------------
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';
import { Contrast, EyeOff, Monitor, Moon, Palette, Settings2, Sparkles, Sun, X } from 'lucide-react';
import { AppearanceService, type GalleryWallpaper } from '@/domains/identity';
import { WALLPAPER_PRESETS, galleryWallpaper } from '@/apps/core/lib/appearance';
import { formatMegabytes } from '@/apps/core/lib/liveWallpaper';
import { SelectedLiveWallpaperNotice, useLiveDownloadProgress } from '@/apps/core/components/appearance/LiveWallpaper';
import { useSystemPrefersDark } from '@/apps/core/components/AppearanceController';
import { Segmented, Switch, WallpaperTile } from '@/apps/core/components/appearance/AppearanceControls';
import {
  GLASS_OPACITY_MAX,
  GLASS_OPACITY_MIN,
  WALLPAPER_DIM_MAX,
  pickAppearance,
  resolveDark,
  useAppearanceStore,
  type GlassTone,
  type ThemeMode,
  type Wallpaper,
} from '@/infrastructure/state/theme.store';
import { cn } from '@/shared/utils/utils';

type Tile = { w: Wallpaper; name: string; background: string; image?: string };

function Row({ icon: Icon, label, children }: { icon: typeof Sun; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-[12.5px] font-semibold text-slate-800">
        <Icon size={14} className="text-slate-500" />
        {label}
      </span>
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">{children}</div>;
}

function Island({ children, className, disabled }: { children: React.ReactNode; className?: string; disabled?: boolean }) {
  return (
    <div
      role="group"
      aria-disabled={disabled || undefined}
      className={cn(
        'rounded-2xl border border-slate-200/70 bg-surface p-3.5 shadow-2xs transition-opacity',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
    >
      {children}
    </div>
  );
}

function Slider({ id, label, value, min, max, onChange, left, right, display, disabled }: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  left: string;
  right: string;
  display: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 flex items-center justify-between text-[12px] font-semibold text-slate-700">
        {label}
        <span className="text-[11px] font-medium tabular-nums text-slate-500">{display}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={0.01}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#4c6fff]"
      />
      <div className="flex justify-between text-[10.5px] font-medium text-slate-400">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}

export function QuickAppearance() {
  const visible = useAppearanceStore((s) => s.quickPanel);
  const setVisible = useAppearanceStore((s) => s.setQuickPanel);
  const settings = useAppearanceStore(useShallow(pickAppearance));
  const update = useAppearanceStore((s) => s.update);
  const systemDark = useSystemPrefersDark();
  const [open, setOpen] = useState(false);
  const download = useLiveDownloadProgress();
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  const gallery = useQuery({
    queryKey: ['appearance', 'gallery'],
    queryFn: AppearanceService.gallery,
    staleTime: 5 * 60_000,
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !button.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  if (!visible) return null;

  const glass = settings.material === 'glass';
  const high = settings.contrast === 'high';
  const dark = resolveDark(settings, systemDark);
  const isSelected = (w: Wallpaper) =>
    w.kind === 'preset'
      ? settings.wallpaper.kind === 'preset' && settings.wallpaper.key === w.key
      : settings.wallpaper.kind === 'image' && settings.wallpaper.id === w.id;
  const choose = (wallpaper: Wallpaper) => update({ wallpaper, material: 'glass' });

  const presetTiles: Tile[] = WALLPAPER_PRESETS.map((p) => ({
    w: { kind: 'preset', key: p.key, tone: p.tone },
    name: p.name,
    background: p.swatch,
  }));
  const photoTiles: Tile[] = (gallery.data ?? []).map((g: GalleryWallpaper) => ({
    w: galleryWallpaper(g),
    name: g.name,
    background: g.averageColor,
    image: g.thumbnailUrl,
  }));
  const renderTiles = (list: Tile[]) =>
    list.map((t) => (
      <WallpaperTile
        key={t.w.kind === 'preset' ? t.w.key : t.w.id}
        name={t.name}
        tone={t.w.tone}
        background={t.background}
        image={t.image}
        live={t.w.kind === 'image' && t.w.video ? { size: formatMegabytes(t.w.video.sizeBytes) } : null}
        progress={t.w.kind === 'image' && t.w.video && download?.url === t.w.video.url ? download.pct : null}
        selected={glass && isSelected(t.w)}
        onSelect={() => choose(t.w)}
      />
    ));

  return (
    <>
      <AnimatePresence>
        {open && (
          // Same treatment as the bug panel: the page dims and softens behind the panel.
          <motion.div
            key="quick-appearance-backdrop"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[59] bg-slate-950/20 backdrop-blur-[3px]"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-24 left-4 z-[60] sm:bottom-6 sm:left-6">
        <AnimatePresence>
          {open && (
            <motion.div
              ref={panel}
              id="quick-appearance"
              role="dialog"
              aria-label="Quick preferences"
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              style={{ transformOrigin: 'bottom left' }}
              className="absolute bottom-16 left-0 flex h-[min(720px,calc(100vh-7rem))] w-[min(430px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[26px] border border-slate-200/80 bg-surface/98 shadow-[0_25px_70px_-15px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5 backdrop-blur-2xl"
            >
              <header className="flex shrink-0 items-center gap-3 border-b border-slate-200/70 bg-slate-50/80 px-4 py-3.5">
                <span className="grid size-9 place-items-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <Palette size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[14px] font-bold leading-tight text-slate-900">Quick preferences</h2>
                  <p className="text-[11.5px] text-slate-500">Changes apply instantly and follow your account.</p>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="grid size-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  <X size={15} />
                </button>
              </header>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-3.5">
                {/* Theme and contrast */}
                <Island className="space-y-3">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Theme</span>
                      {glass && <span className="text-[11px] text-slate-400">Glass sets the tone</span>}
                    </div>
                    <div className={cn(glass && 'opacity-60')}>
                      <Segmented<ThemeMode>
                        label="Theme"
                        value={settings.mode}
                        onChange={(mode) => update({ mode, material: 'solid' })}
                        options={[
                          { value: 'light', label: 'Light', icon: Sun },
                          { value: 'dark', label: 'Dark', icon: Moon },
                          { value: 'system', label: 'Auto', icon: Monitor },
                        ]}
                      />
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-3">
                    <Row icon={Contrast} label="High contrast">
                      <Switch checked={high} onChange={(v) => update({ contrast: v ? 'high' : 'standard' })} label="High contrast" />
                    </Row>
                  </div>
                </Island>

                {/* Dynamic Glass and wallpaper */}
                <Island className="space-y-3">
                  <Row icon={Sparkles} label="Dynamic Glass">
                    <Switch checked={glass} onChange={(v) => update({ material: v ? 'glass' : 'solid' })} label="Dynamic Glass" />
                  </Row>
                  <p className="-mt-1 text-[11.5px] leading-relaxed text-slate-500">
                    Frosted, translucent panels over a wallpaper. Picking one turns glass on.
                  </p>
                  <div>
                    <Eyebrow>Arcade</Eyebrow>
                    <div role="radiogroup" aria-label="Arcade wallpapers" className="grid grid-cols-3 gap-2">
                      {renderTiles(presetTiles)}
                    </div>
                  </div>
                  {photoTiles.length > 0 && (
                    <div>
                      <Eyebrow>Photos</Eyebrow>
                      <div role="radiogroup" aria-label="Photo wallpapers" className="grid grid-cols-3 gap-2">
                        {renderTiles(photoTiles)}
                      </div>
                    </div>
                  )}
                  <SelectedLiveWallpaperNotice />
                </Island>

                {/* Glass tuning — stays in place (disabled) when glass is off, so the layout never jumps */}
                <Island className="space-y-3" disabled={!glass}>
                  <div>
                    <Eyebrow>Text tone</Eyebrow>
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
                  </div>
                  <div className="border-t border-slate-100 pt-3">
                    <Slider
                      id="quick-glass-opacity"
                      label="Transparency"
                      value={settings.glassOpacity}
                      min={GLASS_OPACITY_MIN}
                      max={GLASS_OPACITY_MAX}
                      onChange={(glassOpacity) => update({ glassOpacity })}
                      left="Frosted"
                      right="Clear"
                      disabled={high}
                      display={
                        high
                          ? 'Locked by high contrast'
                          : `${Math.round((1 - (settings.glassOpacity - GLASS_OPACITY_MIN) / (GLASS_OPACITY_MAX - GLASS_OPACITY_MIN)) * 100)}%`
                      }
                    />
                  </div>
                  <div className="border-t border-slate-100 pt-3">
                    <Slider
                      id="quick-wallpaper-dim"
                      label="Wallpaper dimming"
                      value={settings.wallpaperDim}
                      min={0}
                      max={WALLPAPER_DIM_MAX}
                      onChange={(wallpaperDim) => update({ wallpaperDim })}
                      left="Vivid"
                      right={dark ? 'Dimmed' : 'Softened'}
                      display={settings.wallpaperDim < 0.01 ? 'Off' : `${Math.round(settings.wallpaperDim * 100)}%`}
                    />
                  </div>
                </Island>
              </div>

              <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-200/70 bg-slate-50/80 px-4 py-3">
                <Link
                  href="/settings/appearance"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-surface px-3 py-1.5 text-[12px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900"
                >
                  <Settings2 size={13} /> All appearance settings
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setVisible(false);
                  }}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11.5px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  title="You can turn it back on in Settings → Appearance"
                >
                  <EyeOff size={12} /> Hide button
                </button>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          ref={button}
          type="button"
          aria-label="Quick preferences"
          aria-expanded={open}
          aria-controls="quick-appearance"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'apple-glass-dock grid size-12 place-items-center rounded-full text-slate-700 transition-transform hover:scale-105 active:scale-95',
            open && 'text-[#4c6fff] dark:text-[#8db1ff]',
          )}
        >
          {open ? <X size={19} /> : <Palette size={19} />}
        </button>
      </div>
    </>
  );
}
