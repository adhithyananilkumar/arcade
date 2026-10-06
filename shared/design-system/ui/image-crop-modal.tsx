/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface Props {
  open: boolean;
  file: File | null;
  /** width / height, e.g. 1 for a square logo, 4 for a 4:1 banner. */
  aspectRatio: number;
  title?: string;
  onCancel: () => void;
  /** Resolves with a cropped image file (same mime type, "-cropped" suffix on the name). */
  onCropped: (croppedFile: File) => void;
  /**
   * Optional: render something from the current crop as the user adjusts it (e.g. how the image
   * will look where it is used). Receives the crop as a small image URL, or null before there is one.
   */
  preview?: (croppedUrl: string | null) => ReactNode;
}

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;

export function ImageCropModal({ open, file, aspectRatio, title, onCancel, onCropped, preview }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  /** 1 = fit; above 1 zooms into the image, below 1 shrinks it to leave padding around a logo. */
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setPreviewUrl(null);
    setZoom(1);
    return () => URL.revokeObjectURL(url);
  }, [file]);

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
    canvas.height = Math.round(outWidth / aspectRatio);
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
    ctx.translate(cx, cy);
    ctx.scale(zoom, zoom);
    ctx.translate(-cx, -cy);
    ctx.drawImage(img, 0, 0);
    return true;
  };

  // A small rendering of the current crop, for the `preview` slot only.
  useEffect(() => {
    if (!preview || !completedCrop?.width) return;
    const canvas = document.createElement('canvas');
    const img = imgRef.current;
    const width = Math.min(400, Math.round(completedCrop.width * (img ? img.naturalWidth / img.width : 1)));
    if (paint(canvas, width, false)) setPreviewUrl(canvas.toDataURL('image/png'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedCrop, aspectRatio, preview, zoom]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Create a default crop that fits the image and aspect ratio
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspectRatio,
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
  };

  const handleConfirm = () => {
    if (!file || !completedCrop || !imgRef.current) return;
    const img = imgRef.current;
    const sourceWidth = completedCrop.width * (img.naturalWidth / img.width);
    if (sourceWidth === 0) return;

    // Use a reasonable max resolution for the output; JPEG has no alpha, so it gets a white ground.
    const canvas = document.createElement('canvas');
    if (!paint(canvas, Math.min(1600, Math.round(sourceWidth)), file.type === 'image/jpeg')) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const dotIndex = file.name.lastIndexOf('.');
        const ext = dotIndex >= 0 ? file.name.slice(dotIndex) : '';
        const base = dotIndex >= 0 ? file.name.slice(0, dotIndex) : file.name;
        onCropped(new File([blob], `${base}-cropped${ext}`, { type: file.type }));
      },
      file.type,
      0.92
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-xl p-6 z-[100]">
        <DialogHeader>
          <DialogTitle>{title || 'Crop image'}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex flex-col items-center">
          {imageUrl && (
            <div className="max-h-[60vh] overflow-hidden flex items-center justify-center bg-slate-900 rounded-lg p-2 w-full">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                className="max-h-full [&_.ReactCrop__child-wrapper]:overflow-hidden"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imageUrl}
                  onLoad={onImageLoad}
                  className="max-w-full max-h-[55vh] object-contain"
                  style={{ transform: `scale(${zoom})` }}
                />
              </ReactCrop>
            </div>
          )}

          <div className="mt-4 flex w-full items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - 0.1).toFixed(2)))}
              aria-label="Zoom out"
              className="h-8 w-8 shrink-0 rounded-full border border-gray-200 text-lg font-semibold leading-none text-gray-600 hover:bg-gray-100"
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
              className="h-8 w-8 shrink-0 rounded-full border border-gray-200 text-lg font-semibold leading-none text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold tabular-nums text-gray-600 hover:bg-gray-100"
              title="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Drag the box to move it and its edges to resize it. Zoom in to fill the frame, or out to leave space around a logo.
          </p>

          {preview && <div className="mt-4 w-full">{preview(previewUrl)}</div>}

          <div className="flex w-full justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!completedCrop?.width || !completedCrop?.height}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Crop
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
