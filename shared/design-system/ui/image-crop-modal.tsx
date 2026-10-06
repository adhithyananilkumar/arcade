/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Eraser, Loader2, RotateCcw, RotateCw, Scan } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { contentBounds, knockOutLightBackground, rotateBy, rotateQuarter } from '@/shared/utils/image';

export interface AspectOption {
  label: string;
  /** width / height; undefined = free-form. */
  value?: number;
}

interface Props {
  open: boolean;
  file?: File | null;
  imageSrc?: string | null;
  /**
   * width / height, e.g. 1 for a square logo, 4 for a 4:1 banner. Omit for a free-form crop. The
   * starting shape when `aspectOptions` is given.
   */
  aspectRatio?: number;
  /** Lets the person pick the shape (e.g. Square / Wide / Free). */
  aspectOptions?: AspectOption[];
  circularCrop?: boolean;
  title?: string;
  /** A line under the title: what the image is for and what makes a good one. */
  hint?: string;
  /**
   * For images that must keep a transparent background (logos, signatures): shows the canvas on a
   * checkerboard, and offers "Remove white background" and "Trim empty edges".
   */
  transparency?: boolean;
  onCancel: () => void;
  /** Resolves with a cropped image file ("-cropped" suffix; PNG once the background is removed). */
  onCropped: (croppedFile: File) => void;
  /**
   * Optional: render something from the current crop as the user adjusts it (e.g. how the image
   * will look where it is used). Receives the crop as a small image URL, or null before there is one.
   */
  preview?: (croppedUrl: string | null) => ReactNode;
}

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ANGLE_MAX = 180;

type Ground = 'checker' | 'light' | 'dark';
const GROUND_STYLE: Record<Ground, React.CSSProperties> = {
  checker: {
    backgroundColor: '#ffffff',
    backgroundImage:
      'linear-gradient(45deg,#e2e8f0 25%,transparent 25%),linear-gradient(-45deg,#e2e8f0 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e2e8f0 75%),linear-gradient(-45deg,transparent 75%,#e2e8f0 75%)',
    backgroundSize: '16px 16px',
    backgroundPosition: '0 0,0 8px,8px -8px,-8px 0',
  },
  light: { backgroundColor: '#f8fafc' },
  dark: { backgroundColor: '#0f172a' },
};

/**
 * Crops an image before upload. The person drags and resizes the frame, zooms (in to fill it, out to
 * leave room around a logo), rotates it — by any angle, to straighten a tilted scan, or a quarter
 * turn at a time — and, for transparent artwork,
 * clears a white paper background and trims empty edges. What they see on the canvas and in the
 * `preview` slot is exactly what is exported.
 */
export function ImageCropModal({
  open,
  file,
  imageSrc,
  aspectRatio,
  aspectOptions,
  circularCrop,
  title,
  hint,
  transparency = false,
  onCancel,
  onCropped,
  preview,
}: Props) {
  // The image being cropped: the picked file, after any turns or background removal.
  const [working, setWorking] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [aspect, setAspect] = useState<number | undefined>(aspectRatio);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  /** 1 = fit; above 1 zooms into the image, below 1 shrinks it to leave padding around a logo. */
  const [zoom, setZoom] = useState(1);
  /** Clockwise, in degrees, about the image's centre — applied with the zoom. */
  const [angle, setAngle] = useState(0);
  // Set when a trim must wait for the rotation to be baked into a new image (see `trim`).
  const trimPending = useRef(false);
  const [ground, setGround] = useState<Ground>(transparency ? 'checker' : 'dark');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (file) {
      setWorking(file);
      setAspect(aspectRatio);
      setZoom(1);
      setAngle(0);
    } else if (imageSrc) {
      fetch(imageSrc)
        .then((r) => r.blob())
        .then((blob) => {
          const ext = blob.type === 'image/jpeg' ? '.jpg' : blob.type === 'image/webp' ? '.webp' : '.png';
          setWorking(new File([blob], `image${ext}`, { type: blob.type }));
        })
        .catch(() => {
          setWorking(null);
        });
      setAspect(aspectRatio);
      setZoom(1);
      setAngle(0);
    } else {
      setWorking(null);
    }
  }, [file, imageSrc, aspectRatio]);

  useEffect(() => {
    if (!working) return;
    const url = URL.createObjectURL(working);
    setImageUrl(url);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setPreviewUrl(null);
    return () => URL.revokeObjectURL(url);
  }, [working]);

  /** The exported shape: the fixed aspect, or the frame's own when free-form. */
  const outRatio = () => aspect ?? (completedCrop?.height ? completedCrop.width / completedCrop.height : 1);

  /**
   * Paints the crop frame onto `canvas` at `outWidth`: the image as zoomed about its centre, seen
   * through the crop box. Shared by the live preview and the final export so they always agree.
   */
  const paint = (canvas: HTMLCanvasElement, outWidth: number, opaque: boolean): boolean => {
    const img = imgRef.current;
    if (!img || !completedCrop?.width || !completedCrop?.height) return false;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    canvas.width = outWidth;
    canvas.height = Math.max(1, Math.round(outWidth / outRatio()));
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    if (opaque) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.imageSmoothingQuality = 'high';
    const k = outWidth / (completedCrop.width * scaleX);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.translate(-completedCrop.x * scaleX, -completedCrop.y * scaleY);
    const cx = img.naturalWidth / 2;
    const cy = img.naturalHeight / 2;
    // The same transform as the on-screen image's CSS `scale() rotate()`, about its centre.
    ctx.translate(cx, cy);
    ctx.scale(zoom, zoom);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-cx, -cy);
    ctx.drawImage(img, 0, 0);
    return true;
  };

  // Generate live preview URL when preview prop is provided
  useEffect(() => {
    if (!preview || !completedCrop?.width) return;
    const canvas = document.createElement('canvas');
    const img = imgRef.current;
    const width = Math.min(400, Math.round(completedCrop.width * (img ? img.naturalWidth / img.width : 1)));
    if (paint(canvas, width, false)) setPreviewUrl(canvas.toDataURL('image/png'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedCrop, aspect, preview, zoom, angle]);

  const frame = (a: number | undefined, width: number, height: number): Crop =>
    a
      ? centerCrop(makeAspectCrop({ unit: '%', width: 90 }, a, width, height), width, height)
      : { unit: '%', x: 5, y: 5, width: 90, height: 90 };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initial = frame(aspect, width, height);
    setCrop(initial);
    // Report the starting frame at once, so the preview and Apply work without touching it.
    const px = (v: number, of: number) => (v / 100) * of;
    setCompletedCrop({
      unit: 'px',
      x: px(initial.x, width),
      y: px(initial.y, height),
      width: px(initial.width, width),
      height: px(initial.height, height),
    });
    if (trimPending.current) {
      trimPending.current = false;
      // The rotated image has just loaded; trim it now.
      window.setTimeout(() => void trim(), 0);
    }
  };

  const changeAspect = (a: number | undefined) => {
    setAspect(a);
    const img = imgRef.current;
    if (img) {
      const next = frame(a, img.width, img.height);
      setCrop(next);
      setCompletedCrop({
        unit: 'px',
        x: (next.x / 100) * img.width,
        y: (next.y / 100) * img.height,
        width: (next.width / 100) * img.width,
        height: (next.height / 100) * img.height,
      });
    }
  };

  const transform = async (fn: (f: File) => Promise<File>, failure: string) => {
    if (!working) return;
    setBusy(true);
    try {
      setWorking(await fn(working));
      setZoom(1);
      setAngle(0);
    } catch {
      toast.error(failure);
    } finally {
      setBusy(false);
    }
  };

  /** Fits the frame snugly around the visible artwork, with a little breathing room. */
  const trim = async () => {
    const img = imgRef.current;
    if (!imageUrl || !img) return;
    if (angle !== 0 && working) {
      // Bounds are measured on the image itself, so bake the rotation in first; the trim runs once
      // the rotated image has loaded.
      trimPending.current = true;
      await transform((f) => rotateBy(f, angle), 'Could not rotate the image.');
      return;
    }
    const box = await contentBounds(imageUrl).catch(() => null);
    if (!box) {
      toast.error('There is nothing visible to trim to.');
      return;
    }
    setZoom(1);
    const pad = 0.04;
    let x = box.x - pad * box.width;
    let y = box.y - pad * box.height;
    let w = box.width * (1 + 2 * pad);
    let h = box.height * (1 + 2 * pad);
    if (aspect) {
      // Grow the short side, about the centre, to the fixed shape (in displayed pixels).
      const wPx = w * img.width;
      const hPx = h * img.height;
      if (wPx / hPx < aspect) {
        const grow = (hPx * aspect) / img.width;
        x -= (grow - w) / 2;
        w = grow;
      } else {
        const grow = wPx / aspect / img.height;
        y -= (grow - h) / 2;
        h = grow;
      }
    }
    // Keep it on the image; a frame that cannot fit is scaled down about its centre.
    const fit = Math.min(1, 1 / w, 1 / h);
    const cx = x + w / 2;
    const cy = y + h / 2;
    w *= fit;
    h *= fit;
    x = Math.min(Math.max(0, cx - w / 2), 1 - w);
    y = Math.min(Math.max(0, cy - h / 2), 1 - h);
    setCrop({ unit: '%', x: x * 100, y: y * 100, width: w * 100, height: h * 100 });
    setCompletedCrop({ unit: 'px', x: x * img.width, y: y * img.height, width: w * img.width, height: h * img.height });
  };

  const handleConfirm = () => {
    if (!working || !completedCrop || !imgRef.current) return;
    const img = imgRef.current;
    const sourceWidth = completedCrop.width * (img.naturalWidth / img.width);
    if (sourceWidth === 0) return;

    // Use a reasonable max resolution for the output; JPEG has no alpha, so it gets a white ground.
    const canvas = document.createElement('canvas');
    if (!paint(canvas, Math.min(1600, Math.round(sourceWidth)), working.type === 'image/jpeg')) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const dotIndex = working.name.lastIndexOf('.');
        const ext = dotIndex >= 0 ? working.name.slice(dotIndex) : '';
        const base = dotIndex >= 0 ? working.name.slice(0, dotIndex) : working.name;
        onCropped(new File([blob], `${base}-cropped${ext}`, { type: working.type }));
      },
      working.type,
      0.92
    );
  };

  const toolButton =
    'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-surface px-2.5 py-1.5 text-[11.5px] font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50';
  const chip = (active: boolean) =>
    `rounded-full px-3 py-1 text-[11.5px] font-bold transition-colors ${
      active ? 'bg-ink text-on-ink' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }`;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="z-[100] max-h-[92vh] w-[calc(100vw-2rem)] max-w-4xl overflow-y-auto p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-slate-100 px-6 pb-4 pt-5">
          <DialogTitle>{title || 'Crop image'}</DialogTitle>
          {hint && <p className="text-xs font-medium text-slate-500">{hint}</p>}
        </DialogHeader>

        <div className={`grid gap-6 px-6 py-5 ${preview ? 'md:grid-cols-[minmax(0,1fr)_300px]' : ''}`}>
          <div className="min-w-0 space-y-3">
            <div
              className="relative flex max-h-[56vh] min-h-[220px] w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 p-3"
              style={GROUND_STYLE[ground]}
            >
              {imageUrl && (
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  circularCrop={circularCrop}
                  keepSelection
                  className="max-h-full [&_.ReactCrop__child-wrapper]:overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    alt="Image to crop"
                    src={imageUrl}
                    onLoad={onImageLoad}
                    className="max-h-[50vh] max-w-full object-contain"
                    style={{ transform: `scale(${zoom}) rotate(${angle}deg)` }}
                  />
                </ReactCrop>
              )}
              {busy && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-900/60">
                  <Loader2 className="animate-spin text-slate-500" size={22} />
                </div>
              )}
            </div>

            <div className="flex w-full items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - 0.1).toFixed(2)))}
                aria-label="Zoom out"
                className="h-8 w-8 shrink-0 rounded-full border border-slate-200 text-lg font-semibold leading-none text-slate-600 hover:bg-slate-100"
              >
                −
              </button>
              <input
                type="range"
                min={ZOOM_MIN}
                max={ZOOM_MAX}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                aria-label="Zoom"
                className="h-1.5 w-full cursor-pointer accent-indigo-600"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(ZOOM_MAX, +(z + 0.1).toFixed(2)))}
                aria-label="Zoom in"
                className="h-8 w-8 shrink-0 rounded-full border border-slate-200 text-lg font-semibold leading-none text-slate-600 hover:bg-slate-100"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold tabular-nums text-slate-600 hover:bg-slate-100"
                title="Reset zoom"
              >
                {Math.round(zoom * 100)}%
              </button>
            </div>

            <div className="flex w-full items-center gap-3">
              <span className="flex w-8 shrink-0 justify-center text-slate-400" aria-hidden>
                <RotateCw size={15} />
              </span>
              <input
                type="range"
                min={-ANGLE_MAX}
                max={ANGLE_MAX}
                step={0.5}
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                onDoubleClick={() => setAngle(0)}
                aria-label="Rotate"
                className="h-1.5 w-full cursor-pointer accent-indigo-600"
              />
              <span className="w-8 shrink-0" aria-hidden />
              <button
                type="button"
                onClick={() => setAngle(0)}
                className="w-[52px] shrink-0 rounded-lg px-2 py-1 text-xs font-semibold tabular-nums text-slate-600 hover:bg-slate-100"
                title="Reset rotation"
              >
                {angle > 0 ? '+' : ''}
                {angle}°
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={toolButton} disabled={busy} onClick={() => transform((f) => rotateQuarter(f, -90), 'Could not turn the image.')}>
                <RotateCcw size={13} /> Turn left
              </button>
              <button type="button" className={toolButton} disabled={busy} onClick={() => transform((f) => rotateQuarter(f, 90), 'Could not turn the image.')}>
                <RotateCw size={13} /> Turn right
              </button>
              {transparency && (
                <>
                  <button
                    type="button"
                    className={toolButton}
                    disabled={busy}
                    onClick={() => transform((f) => knockOutLightBackground(f), 'Could not remove the background.')}
                    title="Makes a white or light paper background transparent"
                  >
                    <Eraser size={13} /> Remove white background
                  </button>
                  <button type="button" className={toolButton} disabled={busy} onClick={trim} title="Fits the frame around the artwork">
                    <Scan size={13} /> Trim empty edges
                  </button>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {aspectOptions && aspectOptions.length > 1 ? (
                <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Shape">
                  {aspectOptions.map((o) => (
                    <button key={o.label} type="button" className={chip(o.value === aspect)} onClick={() => changeAspect(o.value)}>
                      {o.label}
                    </button>
                  ))}
                </div>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-1.5" role="group" aria-label="Background">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Background</span>
                {(['checker', 'light', 'dark'] as Ground[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGround(g)}
                    aria-label={g === 'checker' ? 'Transparent' : g === 'light' ? 'Light' : 'Dark'}
                    aria-pressed={ground === g}
                    className={`h-6 w-6 rounded-md border ${ground === g ? 'ring-2 ring-indigo-500 ring-offset-1' : 'border-slate-300'}`}
                    style={GROUND_STYLE[g]}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Drag the frame to move it and its edges to resize it. Zoom in to fill the frame, or out to leave space around a logo.
              Use the rotation slider to straighten a tilted scan (double-click it to reset).
            </p>
          </div>

          {preview && <div className="min-w-0">{preview(previewUrl)}</div>}
        </div>

        <div className="flex w-full justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy || !completedCrop?.width || !completedCrop?.height}
            className="rounded-xl bg-ink px-5 py-2 text-sm font-bold text-on-ink transition-colors hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply crop
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
