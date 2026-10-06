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

export function ImageCropModal({ open, file, aspectRatio, title, onCancel, onCropped, preview }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setPreviewUrl(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // A small rendering of the current crop, for the `preview` slot only.
  useEffect(() => {
    const img = imgRef.current;
    if (!preview || !img || !completedCrop?.width || !completedCrop?.height) return;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    const width = Math.min(400, Math.round(completedCrop.width * scaleX));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = Math.round(width / aspectRatio);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(
      img,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
    setPreviewUrl(canvas.toDataURL('image/png'));
  }, [completedCrop, aspectRatio, preview]);

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
    
    // Calculate actual pixel dimensions based on the natural image size and rendered size
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    const sourceX = completedCrop.x * scaleX;
    const sourceY = completedCrop.y * scaleY;
    const sourceWidth = completedCrop.width * scaleX;
    const sourceHeight = completedCrop.height * scaleY;

    if (sourceWidth === 0 || sourceHeight === 0) return;

    // Use a reasonable max resolution for the output
    const outputWidth = Math.min(1600, Math.round(sourceWidth));
    const outputHeight = Math.round(outputWidth / aspectRatio);

    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-xl p-6 z-[100]">
        <DialogHeader>
          <DialogTitle>{title || 'Crop image'}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex flex-col items-center">
          {imageUrl && (
            <div className="max-h-[60vh] overflow-auto flex items-center justify-center bg-slate-900 rounded-lg p-2 w-full">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                className="max-h-full"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imageUrl}
                  onLoad={onImageLoad}
                  className="max-w-full max-h-[55vh] object-contain"
                />
              </ReactCrop>
            </div>
          )}

          <p className="mt-4 text-xs text-gray-500">Drag the edges of the box to resize the crop area.</p>

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
