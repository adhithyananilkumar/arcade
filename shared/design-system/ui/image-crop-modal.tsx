'use client';

import { useEffect, useRef, useState } from 'react';
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
}

export function ImageCropModal({ open, file, aspectRatio, title, onCancel, onCropped }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setCrop(undefined);
    setCompletedCrop(undefined);
    return () => URL.revokeObjectURL(url);
  }, [file]);

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
