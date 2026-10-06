/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Loader2, RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface Props {
  open: boolean;
  file: File | null;
  /** width / height, e.g. 1 for a square logo, 4 for a 4:1 banner. */
  aspectRatio: number;
  circularCrop?: boolean;
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

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  mimeType = 'image/jpeg'
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) return null;

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    croppedCanvas.toBlob((blob) => resolve(blob), mimeType, 0.95);
  });
}

export function ImageCropModal({
  open,
  file,
  aspectRatio,
  circularCrop,
  title,
  onCancel,
  onCropped,
  preview,
}: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setPreviewUrl(null);
    setIsProcessing(false);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback((_croppedArea: Area, currentCroppedAreaPixels: Area) => {
    setCroppedAreaPixels(currentCroppedAreaPixels);
  }, []);

  // Generate live preview URL when preview prop is provided
  useEffect(() => {
    if (!preview || !imageUrl || !croppedAreaPixels) {
      setPreviewUrl(null);
      return;
    }

    let isSubscribed = true;
    (async () => {
      try {
        const blob = await getCroppedImg(
          imageUrl,
          croppedAreaPixels,
          rotation,
          file?.type || 'image/png'
        );
        if (blob && isSubscribed) {
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        }
      } catch {
        // silent preview failure
      }
    })();

    return () => {
      isSubscribed = false;
    };
  }, [imageUrl, croppedAreaPixels, rotation, file?.type, preview]);

  const handleConfirm = async () => {
    if (!file || !imageUrl || !croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(
        imageUrl,
        croppedAreaPixels,
        rotation,
        file.type || 'image/jpeg'
      );

      if (!croppedBlob) {
        setIsProcessing(false);
        return;
      }

      const dotIndex = file.name.lastIndexOf('.');
      const ext = dotIndex >= 0 ? file.name.slice(dotIndex) : '';
      const base = dotIndex >= 0 ? file.name.slice(0, dotIndex) : file.name;
      const croppedFile = new File([croppedBlob], `${base}-cropped${ext}`, {
        type: file.type || 'image/jpeg',
      });

      onCropped(croppedFile);
    } catch (err) {
      console.error('Error cropping image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAdjustments = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-xl p-6 z-[100] sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            {title || 'Crop & adjust photo'}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex flex-col items-center gap-4">
          {/* Cropper Viewport */}
          <div className="relative h-72 sm:h-80 w-full overflow-hidden rounded-2xl bg-slate-950 shadow-inner">
            {imageUrl && (
              <Cropper
                image={imageUrl}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspectRatio}
                cropShape={circularCrop ? 'round' : 'rect'}
                showGrid={!circularCrop}
                zoomWithScroll={true}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          {/* Controls Bar */}
          <div className="w-full space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, Number((z - 0.2).toFixed(2))))}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-100 hover:text-slate-900"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>

              <div className="flex flex-1 items-center gap-2">
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.02}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-teal-600 focus:outline-none"
                />
                <span className="w-10 text-right text-xs font-semibold tabular-nums text-slate-500">
                  {zoom.toFixed(1)}x
                </span>
              </div>

              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, Number((z + 0.2).toFixed(2))))}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-100 hover:text-slate-900"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            {/* Rotate & Reset Controls */}
            <div className="flex items-center justify-between border-t border-slate-200/60 pt-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-100"
                  title="Rotate 90° Left"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Rotate Left</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-100"
                  title="Rotate 90° Right"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>Rotate Right</span>
                </button>
              </div>

              {(zoom !== 1 || rotation !== 0 || crop.x !== 0 || crop.y !== 0) && (
                <button
                  type="button"
                  onClick={resetAdjustments}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-slate-500">
            Drag photo to reposition • Scroll or use the slider to zoom
          </p>

          {preview && <div className="mt-2 w-full">{preview(previewUrl)}</div>}

          {/* Action Buttons */}
          <div className="flex w-full items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!croppedAreaPixels || isProcessing}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-2xs transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
              Apply & Save
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
