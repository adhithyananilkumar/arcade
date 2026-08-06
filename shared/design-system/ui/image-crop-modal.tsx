'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface Props {
  open: boolean;
  file: File | null;
  /** width / height, e.g. 1 for a square logo, 4 for a 4:1 banner. */
  aspectRatio: number;
  title?: string;
  onCancel: () => void;
  /** Resolves with a cropped image file (same mime type, "-cropped" suffix on the name). */
  onCropped: (croppedFile: File) => void;
}

// A dependency-free crop UI: drag to pan, slider to zoom, confirm renders the visible region
// onto an offscreen canvas at the image's native resolution. Kept in shared/ since it's pure UI
// (no HTTP, no business logic) — callers own what happens to the resulting File.
export function ImageCropModal({ open, file, aspectRatio, title, onCancel, onCropped }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  const VIEWPORT_WIDTH = 480;
  const viewportHeight = Math.round(VIEWPORT_WIDTH / aspectRatio);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    const img = new Image();
    img.onload = () => setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Base scale so the image covers the viewport (like CSS object-fit: cover), then zoom on top.
  const baseScale =
    naturalSize.width > 0
      ? Math.max(VIEWPORT_WIDTH / naturalSize.width, viewportHeight / naturalSize.height)
      : 1;
  const scale = baseScale * zoom;
  const displayWidth = naturalSize.width * scale;
  const displayHeight = naturalSize.height * scale;

  const clampOffset = useCallback(
    (x: number, y: number) => {
      const maxX = Math.max(0, (displayWidth - VIEWPORT_WIDTH) / 2);
      const maxY = Math.max(0, (displayHeight - viewportHeight) / 2);
      return { x: Math.min(maxX, Math.max(-maxX, x)), y: Math.min(maxY, Math.max(-maxY, y)) };
    },
    [displayWidth, displayHeight, viewportHeight]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, offsetX: offset.x, offsetY: offset.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset(clampOffset(dragStart.current.offsetX + dx, dragStart.current.offsetY + dy));
  };

  const handlePointerUp = () => setDragging(false);

  const handleZoomChange = (value: number) => {
    setZoom(value);
    setOffset((prev) => clampOffset(prev.x, prev.y));
  };

  const handleConfirm = () => {
    if (!file || naturalSize.width === 0) return;

    // Map the visible viewport window back onto the source image's natural pixel space.
    const sourceX = (displayWidth / 2 - VIEWPORT_WIDTH / 2 - offset.x) / scale;
    const sourceY = (displayHeight / 2 - viewportHeight / 2 - offset.y) / scale;
    const sourceWidth = VIEWPORT_WIDTH / scale;
    const sourceHeight = viewportHeight / scale;

    const outputWidth = Math.min(1600, Math.round(naturalSize.width));
    const outputHeight = Math.round(outputWidth / aspectRatio);

    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        outputWidth,
        outputHeight
      );
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const dotIndex = file.name.lastIndexOf('.');
          const ext = dotIndex >= 0 ? file.name.slice(dotIndex) : '';
          const base = dotIndex >= 0 ? file.name.slice(0, dotIndex) : file.name;
          const croppedFile = new File([blob], `${base}-cropped${ext}`, { type: file.type });
          onCropped(croppedFile);
        },
        file.type,
        0.92
      );
    };
    img.src = imageUrl!;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-lg p-6 z-[100]">
        <DialogHeader>
          <DialogTitle>{title || 'Crop image'}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div
            ref={viewportRef}
            className="relative mx-auto overflow-hidden rounded-xl bg-gray-900 select-none touch-none"
            style={{ width: VIEWPORT_WIDTH, height: viewportHeight, cursor: dragging ? 'grabbing' : 'grab' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Crop preview"
                draggable={false}
                className="absolute top-1/2 left-1/2 pointer-events-none"
                style={{
                  width: displayWidth,
                  height: displayHeight,
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
                }}
              />
            )}
          </div>

          <div className="flex items-center gap-3 px-1">
            <ZoomOut size={16} className="text-gray-400 shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <ZoomIn size={16} className="text-gray-400 shrink-0" />
          </div>

          <p className="text-xs text-gray-400 text-center">Drag to reposition, use the slider to zoom.</p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Apply Crop
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
