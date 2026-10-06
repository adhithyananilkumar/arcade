'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * Console -> Appearance: the wallpaper gallery people choose from for
 * Dynamic Glass. Upload, name, set tone, order, retire, delete.
 *
 * Rules:
 * - Gated on `platform.appearance.manage`; the backend enforces it
 *   independently. Size, type and dimension limits are checked here only to
 *   give fast feedback — the server measures and validates every upload.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Moon,
  Pencil,
  Sparkles,
  Sun,
  Trash2,
  UploadCloud,
  Users,
  Wand2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppearanceService, type AdminWallpaper, type WallpaperToneValue } from '@/domains/identity';
import { useAppearanceStore } from '@/infrastructure/state/theme.store';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/design-system/ui/dialog';
import { cn } from '@/shared/utils/utils';

const MAX_BYTES = 5 * 1024 * 1024;
const MIN_W = 1280;
const MIN_H = 720;
const IMAGE_TYPES = ['image/jpeg', 'image/png'];
/** Live wallpapers: looping videos, uploaded straight to storage (mirrors the server's limits). */
const VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
/** Above this, people on slower connections wait noticeably for the first play. */
const HEAVY_VIDEO_BYTES = 25 * 1024 * 1024;
const ACCEPT = [...IMAGE_TYPES, ...VIDEO_TYPES];

type ToneChoice = 'AUTO' | WallpaperToneValue;

interface Draft {
  file: File;
  /** The image itself, or the poster frame captured from a video. */
  previewUrl: string;
  width: number;
  height: number;
  name: string;
  tone: ToneChoice;
  /** Set when the file is a video (a live wallpaper). */
  video?: { url: string; poster: Blob; duration: number };
}

const formatBytes = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const errorMessage = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback);

function readDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('This file could not be read as an image.'));
    img.src = url;
  });
}

/**
 * Reads a video's size and length and captures a poster frame from a quarter of the way in (the
 * first frame is often black). The poster is what people see while the video loads, and what the
 * server measures for colour and tone.
 */
function readVideo(url: string): Promise<{ width: number; height: number; duration: number; poster: Blob }> {
  return new Promise((resolve, reject) => {
    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.crossOrigin = 'anonymous';
    let settled = false;
    const fail = (message = 'This video could not be read. Use an MP4 (H.264) or WebM file.') => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      reject(new Error(message));
    };
    // A file the browser cannot decode may never fire an event at all; don't hang the form.
    const timer = window.setTimeout(() => fail('Reading this video took too long. Try an MP4 (H.264) or WebM file.'), 15000);
    v.onerror = () => fail();
    v.onloadedmetadata = () => {
      // Recorder-made WebM files often report an unknown (Infinity) duration; seeking there never
      // completes. Use a quarter of the way in when the length is known, else half a second.
      const d = Number.isFinite(v.duration) ? v.duration : null;
      v.currentTime = d ? Math.min(Math.max(0.5, d * 0.25), Math.max(0, d - 0.1)) : 0.5;
    };
    v.onseeked = () => {
      if (settled) return;
      const width = v.videoWidth;
      const height = v.videoHeight;
      if (!width || !height) {
        fail();
        return;
      }
      // Posters are capped at 2560px wide; the server needs at least 1280×720.
      const scale = Math.min(1, 2560 / width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      canvas.getContext('2d')?.drawImage(v, 0, 0, canvas.width, canvas.height);
      settled = true;
      window.clearTimeout(timer);
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve({ width, height, duration: Number.isFinite(v.duration) ? v.duration : 0, poster: blob })
            : reject(new Error('Could not capture a frame from this video.')),
        'image/jpeg',
        0.9,
      );
    };
    v.src = url;
  });
}

const formatDuration = (s: number | null | undefined) =>
  s ? (s >= 60 ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')} min` : `${Math.round(s)} s`) : '';

/** A miniature of glass over the wallpaper — what people will actually see. */
function GlassPreview({ image, color, tone, video }: { image: string; color: string; tone: 'light' | 'dark'; video?: string | null }) {
  const dark = tone === 'dark';
  const panel = dark ? 'rgba(23,26,33,0.55)' : 'rgba(255,255,255,0.6)';
  const text = dark ? '#eef1f7' : '#14142b';
  const muted = dark ? 'rgba(238,241,247,0.6)' : 'rgba(20,20,43,0.55)';
  const line = dark ? 'rgba(255,255,255,0.12)' : 'rgba(20,20,43,0.1)';
  return (
    <div className="theme-fixed relative aspect-[16/9] w-full overflow-hidden rounded-2xl" style={{ backgroundColor: color, backgroundImage: `url("${image}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {video && <video src={video} autoPlay muted loop playsInline className="absolute inset-0 size-full object-cover" aria-hidden="true" />}
      <div className="absolute inset-x-[4%] top-[5%] flex h-[9%] items-center gap-2 rounded-full px-[2%]" style={{ background: panel, backdropFilter: 'blur(14px) saturate(160%)', border: `1px solid ${line}` }}>
        <span className="size-2 rounded-full bg-[#4c6fff]" />
        <span className="h-1.5 w-[14%] rounded-full" style={{ background: text }} />
        <span className="ml-auto h-1.5 w-[8%] rounded-full" style={{ background: muted }} />
      </div>
      <div className="absolute inset-x-[4%] bottom-[6%] top-[19%] grid grid-cols-[1fr_1.6fr] gap-[2.5%]">
        <div className="rounded-xl p-[6%]" style={{ background: panel, backdropFilter: 'blur(14px) saturate(160%)', border: `1px solid ${line}` }}>
          <div className="text-[clamp(9px,1.4vw,14px)] font-bold" style={{ color: text }}>Continue learning</div>
          <div className="mt-1 text-[clamp(7px,1vw,11px)]" style={{ color: muted }}>Data Structures · Lesson 4</div>
          <div className="mt-[10%] h-1.5 w-full overflow-hidden rounded-full" style={{ background: line }}>
            <div className="h-full w-3/5 rounded-full bg-[#4c6fff]" />
          </div>
        </div>
        <div className="grid grid-rows-2 gap-[5%]">
          {['Upcoming events', 'Your exams'].map((t) => (
            <div key={t} className="rounded-xl p-[4%]" style={{ background: panel, backdropFilter: 'blur(14px) saturate(160%)', border: `1px solid ${line}` }}>
              <div className="text-[clamp(8px,1.2vw,13px)] font-bold" style={{ color: text }}>{t}</div>
              <div className="mt-1 h-1.5 w-2/3 rounded-full" style={{ background: muted }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToneControl({ value, onChange, measured }: { value: ToneChoice; onChange: (v: ToneChoice) => void; measured?: WallpaperToneValue }) {
  const options: { value: ToneChoice; label: string; icon?: typeof Sun }[] = [
    { value: 'AUTO', label: measured ? `Auto · ${measured === 'DARK' ? 'dark' : 'light'}` : 'Auto', icon: Wand2 },
    { value: 'LIGHT', label: 'Light', icon: Sun },
    { value: 'DARK', label: 'Dark', icon: Moon },
  ];
  return (
    <div role="radiogroup" aria-label="Text tone" className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-all',
            value === o.value ? 'bg-surface text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800',
          )}
        >
          {o.icon && <o.icon size={11} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function WallpaperConsole() {
  const [wallpapers, setWallpapers] = useState<AdminWallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [previewing, setPreviewing] = useState<AdminWallpaper | null>(null);
  const [deleting, setDeleting] = useState<AdminWallpaper | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const updateAppearance = useAppearanceStore((s) => s.update);

  const load = useCallback(async () => {
    try {
      setWallpapers(await AppearanceService.admin.list());
    } catch (e) {
      toast.error(errorMessage(e, 'Could not load the wallpaper gallery.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch-on-mount: the request is the effect's whole purpose. Same pattern as HandleAppealConsole.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => () => {
    if (draft) URL.revokeObjectURL(draft.previewUrl);
    if (draft?.video) URL.revokeObjectURL(draft.video.url);
  }, [draft]);

  const stats = useMemo(() => {
    const live = wallpapers.filter((w) => w.active).length;
    const users = wallpapers.reduce((n, w) => n + w.users, 0);
    return { total: wallpapers.length, live, users };
  }, [wallpapers]);

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPT.includes(file.type)) {
      toast.error('Use a JPEG or PNG image, or an MP4 / WebM video for a live wallpaper.');
      return;
    }
    if (VIDEO_TYPES.includes(file.type)) {
      if (file.size > MAX_VIDEO_BYTES) {
        toast.error(`That video is ${formatBytes(file.size)} — the limit is ${MAX_VIDEO_BYTES / 1024 / 1024} MB.`);
        return;
      }
      const videoUrl = URL.createObjectURL(file);
      try {
        const { width, height, duration, poster } = await readVideo(videoUrl);
        if (width < MIN_W || height < MIN_H) {
          URL.revokeObjectURL(videoUrl);
          toast.error(`Live wallpapers need at least ${MIN_W}×${MIN_H}px — this one is ${width}×${height}.`);
          return;
        }
        const base = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim().slice(0, 60);
        setDraft({
          file,
          previewUrl: URL.createObjectURL(poster),
          width,
          height,
          name: base,
          tone: 'AUTO',
          video: { url: videoUrl, poster, duration },
        });
      } catch (e) {
        URL.revokeObjectURL(videoUrl);
        toast.error(errorMessage(e, 'This video could not be read.'));
      }
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(`That image is ${formatBytes(file.size)} — the limit is 5 MB.`);
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      const { width, height } = await readDimensions(url);
      if (width < MIN_W || height < MIN_H) {
        URL.revokeObjectURL(url);
        toast.error(`Wallpapers need at least ${MIN_W}×${MIN_H}px — this one is ${width}×${height}.`);
        return;
      }
      const base = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim().slice(0, 60);
      setDraft({ file, previewUrl: url, width, height, name: base, tone: 'AUTO' });
    } catch (e) {
      URL.revokeObjectURL(url);
      toast.error(errorMessage(e, 'This file could not be read as an image.'));
    }
  };

  const upload = async () => {
    if (!draft) return;
    setUploading(true);
    setUploadPct(draft.video ? 0 : null);
    try {
      const tone = draft.tone === 'AUTO' ? null : draft.tone;
      const created = draft.video
        ? await AppearanceService.admin.uploadVideo({
            video: draft.file,
            poster: draft.video.poster,
            name: draft.name,
            tone,
            durationSeconds: draft.video.duration,
            onProgress: setUploadPct,
          })
        : await AppearanceService.admin.upload(draft.file, draft.name, tone);
      setWallpapers((list) => [...list, created]);
      setDraft(null);
      toast.success(`“${created.name}” is live in the gallery`);
    } catch (e) {
      toast.error(errorMessage(e, 'Upload failed. Please try again.'));
    } finally {
      setUploading(false);
      setUploadPct(null);
    }
  };

  const patch = async (w: AdminWallpaper, change: Parameters<typeof AppearanceService.admin.update>[1], success?: string) => {
    setBusy(w.id);
    try {
      const updated = await AppearanceService.admin.update(w.id, change);
      setWallpapers((list) => list.map((x) => (x.id === w.id ? updated : x)));
      if (success) toast.success(success);
    } catch (e) {
      toast.error(errorMessage(e, 'Could not save that change.'));
    } finally {
      setBusy(null);
    }
  };

  const move = async (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= wallpapers.length) return;
    const next = wallpapers.slice();
    [next[index], next[target]] = [next[target], next[index]];
    setWallpapers(next);
    try {
      setWallpapers(await AppearanceService.admin.reorder(next.map((w) => w.id)));
    } catch (e) {
      toast.error(errorMessage(e, 'Could not reorder. Reloading the gallery.'));
      load();
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const w = deleting;
    setBusy(w.id);
    try {
      await AppearanceService.admin.remove(w.id);
      setWallpapers((list) => list.filter((x) => x.id !== w.id));
      toast.success(`“${w.name}” deleted`);
      setDeleting(null);
    } catch (e) {
      toast.error(errorMessage(e, 'Could not delete that wallpaper.'));
    } finally {
      setBusy(null);
    }
  };

  const tryOn = (w: AdminWallpaper) => {
    updateAppearance({
      material: 'glass',
      wallpaper: { kind: 'image', id: w.id, url: w.imageUrl, tone: w.tone === 'LIGHT' ? 'light' : 'dark', color: w.averageColor },
    });
    toast.success(`Applied “${w.name}” to your own appearance`);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pb-16 pr-1">
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-on-ink shadow-xs transition-colors hover:bg-ink-hover"
        >
          <ImagePlus size={15} />
          Add wallpaper
        </button>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept={ACCEPT.join(',')}
        className="hidden"
        onChange={(e) => {
          void pickFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Wallpapers', value: stats.total, icon: Sparkles },
          { label: 'In the picker', value: stats.live, icon: Eye },
          { label: 'People using one', value: stats.users, icon: Users },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-surface px-4 py-3 shadow-2xs">
            <span className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-600"><s.icon size={16} /></span>
            <div>
              <div className="text-lg font-bold tabular-nums leading-none text-ink">{loading ? '—' : s.value}</div>
              <div className="mt-1 text-[11.5px] font-medium text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {draft ? (
        <section className="grid gap-5 rounded-3xl border border-slate-200/80 bg-surface p-5 shadow-xs lg:grid-cols-[1.4fr_1fr]">
          <GlassPreview image={draft.previewUrl} video={draft.video?.url} color="#6b7fa8" tone={draft.tone === 'LIGHT' ? 'light' : 'dark'} />
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">{draft.video ? 'New live wallpaper' : 'New wallpaper'}</h2>
              <p className="mt-0.5 text-[12.5px] text-slate-500">
                {draft.width}×{draft.height} · {formatBytes(draft.file.size)} ·{' '}
                {draft.video ? `${draft.file.type === 'video/webm' ? 'WebM' : 'MP4'} · ${formatDuration(draft.video.duration)}` : draft.file.type === 'image/png' ? 'PNG' : 'JPEG'}
              </p>
            </div>
            {draft.video && (
              <div
                className={cn(
                  'rounded-2xl border p-3 text-[12px] leading-relaxed',
                  draft.file.size > HEAVY_VIDEO_BYTES
                    ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200'
                    : 'border-slate-200 bg-slate-50 text-slate-600',
                )}
              >
                {draft.file.size > HEAVY_VIDEO_BYTES ? (
                  <p>
                    <span className="font-semibold">This video is {formatBytes(draft.file.size)}.</span> Each person downloads it once (with a
                    progress indicator) before it plays, then it is saved on their device. Live wallpapers can make older or low-power
                    devices lag; for a smoother experience keep them short (5–20 s loops) and under 25 MB.
                  </p>
                ) : (
                  <p>
                    People download it once, then it is saved on their device. They see the poster frame while it loads, and can turn
                    playback off. Short, seamless loops look best.
                  </p>
                )}
              </div>
            )}
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-semibold text-slate-700">Name</span>
              <input
                value={draft.name}
                maxLength={60}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Misty fjord"
                className="w-full rounded-xl border border-slate-200 bg-surface px-3 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#4c6fff]"
              />
            </label>
            <div>
              <span className="mb-1.5 block text-[12px] font-semibold text-slate-700">Text tone</span>
              <ToneControl value={draft.tone} onChange={(tone) => setDraft({ ...draft, tone })} />
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-500">
                Auto measures the image after upload. Override it if text is hard to read on this picture.
              </p>
            </div>
            {uploading && uploadPct !== null && (
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={uploadPct} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-[#4c6fff] transition-[width] duration-200" style={{ width: `${uploadPct}%` }} />
              </div>
            )}
            <div className="mt-auto flex gap-2">
              <button
                type="button"
                onClick={upload}
                disabled={uploading || !draft.name.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-on-ink transition-colors hover:bg-ink-hover disabled:opacity-50"
              >
                {uploading ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />}
                {uploading ? (uploadPct !== null && uploadPct < 100 ? `Uploading video… ${uploadPct}%` : 'Processing…') : 'Publish to gallery'}
              </button>
              <button
                type="button"
                onClick={() => setDraft(null)}
                disabled={uploading}
                className="rounded-full border border-slate-200 px-4 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void pickFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-colors',
            dragging ? 'border-[#4c6fff] bg-[#4c6fff]/5' : 'border-slate-200 bg-surface/60 hover:border-slate-300',
          )}
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-600"><UploadCloud size={22} /></span>
          <span className="text-sm font-semibold text-slate-800">Drop a photo or a video here, or click to choose</span>
          <span className="text-[12px] text-slate-500">
            Photos: JPEG or PNG, up to 5 MB. Live wallpapers: MP4 or WebM loops, up to 100 MB (under 25 MB recommended).
            At least {MIN_W}×{MIN_H}. Landscape images with calm areas work best.
          </span>
        </button>
      )}

      <section>
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Gallery order — as people see it</h2>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-72 animate-pulse rounded-3xl bg-slate-100" />)}
          </div>
        ) : wallpapers.length === 0 ? (
          <div className="py-20 px-6 text-center">
            <div className="flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto">
              <div className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Sparkles size={26} className="stroke-[1.8]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight dark:text-white">
                No photo wallpapers yet
              </h3>
              <p className="text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                People can still use the six built-in Arcade wallpapers. Add a photo to give them more choice.
              </p>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-xs transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                <UploadCloud size={14} />
                <span>Upload wallpaper</span>
              </button>
            </div>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {wallpapers.map((w, i) => {
              const overridden = w.tone !== w.measuredTone;
              return (
                <li key={w.id} className={cn('group overflow-hidden rounded-3xl border border-slate-200/80 bg-surface shadow-2xs transition-shadow hover:shadow-md', !w.active && 'opacity-70')}>
                  <div className="relative aspect-[16/10] overflow-hidden" style={{ backgroundColor: w.averageColor }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.thumbnailUrl} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    <div className="absolute left-3 top-3 flex gap-1.5">
                      <span className={cn('theme-fixed rounded-full px-2 py-0.5 text-[10.5px] font-bold backdrop-blur-md', w.active ? 'bg-emerald-500/90 text-white' : 'bg-black/55 text-white')}>
                        {w.active ? 'In picker' : 'Retired'}
                      </span>
                      <span className="theme-fixed flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[10.5px] font-semibold text-white backdrop-blur-md">
                        {w.tone === 'DARK' ? <Moon size={10} /> : <Sun size={10} />}
                        {w.tone === 'DARK' ? 'Dark' : 'Light'}{overridden ? ' · set' : ''}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewing(w)}
                      className="theme-fixed absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11.5px] font-semibold text-[#14142b] opacity-0 shadow-sm backdrop-blur transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <Eye size={12} /> Preview glass
                    </button>
                  </div>

                  <div className="space-y-3 p-4">
                    {renaming?.id === w.id ? (
                      <form
                        className="flex items-center gap-1.5"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const name = renaming.name.trim();
                          setRenaming(null);
                          if (name && name !== w.name) void patch(w, { name }, 'Renamed');
                        }}
                      >
                        <input
                          autoFocus
                          maxLength={60}
                          value={renaming.name}
                          onChange={(e) => setRenaming({ id: w.id, name: e.target.value })}
                          onKeyDown={(e) => e.key === 'Escape' && setRenaming(null)}
                          className="min-w-0 flex-1 rounded-lg border border-[#4c6fff] bg-surface px-2 py-1 text-sm font-semibold text-slate-900 outline-none"
                        />
                        <button type="submit" aria-label="Save name" className="grid size-7 place-items-center rounded-lg bg-ink text-on-ink"><Check size={13} /></button>
                        <button type="button" aria-label="Cancel rename" onClick={() => setRenaming(null)} className="grid size-7 place-items-center rounded-lg border border-slate-200 text-slate-500"><X size={13} /></button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="min-w-0 flex-1 truncate text-[14px] font-bold text-slate-900" title={w.name}>{w.name}</h3>
                        <button type="button" aria-label={`Rename ${w.name}`} onClick={() => setRenaming({ id: w.id, name: w.name })} className="grid size-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil size={13} /></button>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] font-medium text-slate-500">
                      {w.mediaKind === 'VIDEO' && (
                        <span className="rounded-full bg-indigo-50 px-1.5 py-px text-[10.5px] font-bold uppercase tracking-wide text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                          Live · {formatDuration(w.durationSeconds)}
                        </span>
                      )}
                      <span>{w.width}×{w.height}</span>
                      <span>{formatBytes(w.videoSizeBytes ?? w.sizeBytes)}</span>
                      <span className="flex items-center gap-1"><Users size={11} />{w.users} {w.users === 1 ? 'person' : 'people'}</span>
                      <span className="ml-auto flex items-center gap-1"><span className="size-2.5 rounded-full ring-1 ring-slate-200" style={{ background: w.averageColor }} />{w.averageColor}</span>
                    </div>

                    <ToneControl
                      measured={w.measuredTone}
                      value={overridden ? w.tone : 'AUTO'}
                      onChange={(v) => void patch(w, { tone: v === 'AUTO' ? w.measuredTone : v })}
                    />

                    <div className="flex items-center gap-1.5 border-t border-slate-100 pt-3">
                      <button type="button" aria-label="Move earlier" disabled={i === 0} onClick={() => void move(i, -1)} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"><ArrowLeft size={14} /></button>
                      <button type="button" aria-label="Move later" disabled={i === wallpapers.length - 1} onClick={() => void move(i, 1)} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"><ArrowRight size={14} /></button>
                      <button
                        type="button"
                        disabled={busy === w.id}
                        onClick={() => void patch(w, { active: !w.active }, w.active ? 'Retired — hidden from the picker' : 'Back in the picker')}
                        className="ml-auto flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        {w.active ? <EyeOff size={13} /> : <Eye size={13} />}
                        {w.active ? 'Retire' : 'Restore'}
                      </button>
                      <button type="button" onClick={() => tryOn(w)} className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-50">
                        <Sparkles size={13} /> Try
                      </button>
                      <button type="button" aria-label={`Delete ${w.name}`} onClick={() => setDeleting(w)} className="grid size-8 place-items-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/25 dark:text-rose-400 dark:hover:bg-rose-500/10"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Dialog open={!!previewing} onOpenChange={(open) => !open && setPreviewing(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewing?.name}</DialogTitle>
            <DialogDescription>How Dynamic Glass looks on this wallpaper, with {previewing?.tone === 'DARK' ? 'light' : 'dark'} text.</DialogDescription>
          </DialogHeader>
          {previewing && <GlassPreview image={previewing.imageUrl} video={previewing.videoUrl} color={previewing.averageColor} tone={previewing.tone === 'DARK' ? 'dark' : 'light'} />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete “{deleting?.name}”?</DialogTitle>
            <DialogDescription>
              {deleting && deleting.users > 0
                ? `${deleting.users} ${deleting.users === 1 ? 'person has' : 'people have'} this wallpaper selected. They will switch to the default Arcade wallpaper. To keep it for them but hide it from new choices, retire it instead.`
                : 'The image is removed from storage. This cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button type="button" onClick={() => setDeleting(null)} className="rounded-full border border-slate-200 px-4 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            {deleting && deleting.active && deleting.users > 0 && (
              <button
                type="button"
                onClick={() => {
                  const w = deleting;
                  setDeleting(null);
                  void patch(w, { active: false }, 'Retired — hidden from the picker');
                }}
                className="rounded-full border border-slate-200 px-4 py-2 text-[13px] font-semibold text-slate-800 hover:bg-slate-50"
              >
                Retire instead
              </button>
            )}
            <button
              type="button"
              disabled={busy === deleting?.id}
              onClick={() => void confirmDelete()}
              className="flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {busy === deleting?.id && <Loader2 size={13} className="animate-spin" />}
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
