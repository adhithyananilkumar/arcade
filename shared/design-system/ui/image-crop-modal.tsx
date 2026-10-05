/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  FlipHorizontal,
  Crop as CropIcon,
  Sliders,
  Check,
  X,
  RefreshCw,
  Circle,
  Square,
  Sun,
  Contrast,
  Palette,
  Eye,
  Sparkles,
} from 'lucide-react';

interface Props {
  open: boolean;
  file?: File | null;
  imageSrc?: string | null;
  /** width / height, e.g. 1 for a square logo, 4 for a 4:1 banner. */
  aspectRatio?: number;
  title?: string;
  onCancel: () => void;
  /** Resolves with a cropped image file (same mime type, "-cropped" suffix on the name). */
  onCropped: (croppedFile: File) => void;
}

export function ImageCropModal({
  open,
  file,
  imageSrc,
  aspectRatio = 1,
  title,
  onCancel,
  onCropped,
}: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [activeTab, setActiveTab] = useState<'crop' | 'adjust'>('crop');

  // Crop & Transform State
  const [activeAspect, setActiveAspect] = useState<number | undefined>(aspectRatio);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [isCircularGuide, setIsCircularGuide] = useState<boolean>(aspectRatio === 1);

  // Image Adjustment Filter State
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturate, setSaturate] = useState<number>(100);

  const [isApplying, setIsApplying] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Load Image Source
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setCrop(undefined);
      setCompletedCrop(undefined);
      setZoom(1);
      setRotation(0);
      setFlipH(false);
      setBrightness(100);
      setContrast(100);
      setSaturate(100);
      setActiveAspect(aspectRatio);
      setIsCircularGuide(aspectRatio === 1);
      setActiveTab('crop');
      return () => URL.revokeObjectURL(url);
    }
    if (imageSrc) {
      setImageUrl(imageSrc);
      setCrop(undefined);
      setCompletedCrop(undefined);
      setZoom(1);
      setRotation(0);
      setFlipH(false);
      setBrightness(100);
      setContrast(100);
      setSaturate(100);
      setActiveAspect(aspectRatio);
      setIsCircularGuide(aspectRatio === 1);
      setActiveTab('crop');
    }
  }, [file, imageSrc, aspectRatio]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;

    const targetAspect = activeAspect ?? 1;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        targetAspect,
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
  };

  // Generate live small preview on crop changes
  useEffect(() => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) return;
    const img = imgRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    canvas.width = 160;
    canvas.height = 160;

    ctx.clearRect(0, 0, 160, 160);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`;

    ctx.save();
    if (rotation !== 0 || zoom !== 1 || flipH) {
      ctx.translate(80, 80);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom * (flipH ? -1 : 1), zoom);
      ctx.translate(-80, -80);
    }

    ctx.drawImage(
      img,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      160,
      160
    );
    ctx.restore();
  }, [completedCrop, brightness, contrast, saturate, rotation, zoom, flipH]);

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const targetAspect = activeAspect ?? 1;
      const initialCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          targetAspect,
          width,
          height
        ),
        width,
        height
      );
      setCrop(initialCrop);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFlip = () => {
    setFlipH((prev) => !prev);
  };

  const handleAspectChange = (newAspect: number | undefined) => {
    setActiveAspect(newAspect);
    setIsCircularGuide(newAspect === 1);
    if (imgRef.current && newAspect) {
      const { width, height } = imgRef.current;
      const nextCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          newAspect,
          width,
          height
        ),
        width,
        height
      );
      setCrop(nextCrop);
    }
  };

  const handleConfirm = async () => {
    if (!completedCrop || !imgRef.current) return;
    setIsApplying(true);

    try {
      const img = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;

      const outputWidth = Math.min(1600, Math.round(completedCrop.width * scaleX));
      const outputHeight = Math.min(1600, Math.round(completedCrop.height * scaleY));

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Apply Filter Adjustments
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`;

      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;

      ctx.save();
      
      if (rotation !== 0 || zoom !== 1 || flipH) {
        ctx.translate(outputWidth / 2, outputHeight / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom * (flipH ? -1 : 1), zoom);
        ctx.translate(-outputWidth / 2, -outputHeight / 2);
      }

      ctx.drawImage(
        img,
        cropX,
        cropY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        outputWidth,
        outputHeight
      );

      ctx.restore();

      const mimeType = file?.type || 'image/png';
      const ext = mimeType === 'image/jpeg' ? '.jpg' : mimeType === 'image/webp' ? '.webp' : '.png';
      const baseName = file?.name ? file.name.replace(/\.[^/.]+$/, '') : 'avatar';

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const croppedFile = new File([blob], `${baseName}-cropped${ext}`, { type: mimeType });
          onCropped(croppedFile);
        },
        mimeType,
        0.95
      );
    } catch (err) {
      console.error('Failed to crop image', err);
    } finally {
      setIsApplying(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-y-auto">
        {/* Deep frosted backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Expansive Studio Modal (max-w-5xl / ~1080px wide) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col w-full max-w-5xl h-[88vh] max-h-[820px] min-h-[580px] rounded-[32px] border border-slate-200/90 bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Studio Top Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-sky-500/20">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-xl">
                  {title || 'Profile Picture Studio'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Crop, reframe, rotate, and fine-tune tone before publishing to your profile
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Main Studio Body: 2-Column Responsive Layout */}
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden bg-slate-50/50 dark:bg-slate-950/40">
            {/* Left: Large High-Resolution Cropping Canvas (Takes majority width) */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-6 sm:p-8 bg-[#070B14] min-h-[320px] overflow-hidden">
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl">
                {imageUrl && (
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={activeAspect}
                    circularCrop={isCircularGuide}
                    className="max-h-full max-w-full select-none"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={imgRef}
                      alt="Target Photo"
                      src={imageUrl}
                      crossOrigin="anonymous"
                      onLoad={onImageLoad}
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                        filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.15s ease-out',
                      }}
                      className="max-h-[58vh] max-w-full object-contain block select-none rounded-lg"
                    />
                  </ReactCrop>
                )}
              </div>

              {/* Bottom Canvas Quick Floating Helpers */}
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between pointer-events-none">
                <span className="rounded-full bg-slate-950/70 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-slate-300 border border-slate-800 pointer-events-auto">
                  Drag corners or frame to crop
                </span>
                <span className="rounded-full bg-slate-950/70 backdrop-blur-md px-3 py-1 text-[11px] font-mono font-bold text-sky-400 border border-slate-800 pointer-events-auto">
                  Zoom: {zoom}x · Rot: {rotation}°
                </span>
              </div>
            </div>

            {/* Right: Studio Controls & Real-time Live Previews (Takes ~380px) */}
            <div className="w-full md:w-[380px] lg:w-[400px] border-t md:border-t-0 md:border-l border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 overflow-y-auto flex flex-col justify-between shrink-0">
              <div className="space-y-5">
                {/* Mode Tabs */}
                <div className="flex rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setActiveTab('crop')}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'crop'
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <CropIcon size={14} />
                    <span>Crop & Framing</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('adjust')}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'adjust'
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <Sliders size={14} />
                    <span>Filters & Tone</span>
                    {(brightness !== 100 || contrast !== 100 || saturate !== 100) && (
                      <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                    )}
                  </button>
                </div>

                {/* TAB 1: CROP & FRAMING */}
                {activeTab === 'crop' && (
                  <div className="space-y-4">
                    {/* Zoom Slider */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800/70 dark:bg-slate-950/40 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                          <ZoomIn size={15} className="text-sky-500" />
                          <span>Zoom</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setZoom(1.0)}
                            className="rounded-md px-1.5 py-0.5 text-[11px] font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            1x
                          </button>
                          <button
                            type="button"
                            onClick={() => setZoom(1.5)}
                            className="rounded-md px-1.5 py-0.5 text-[11px] font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            1.5x
                          </button>
                          <button
                            type="button"
                            onClick={() => setZoom(2.0)}
                            className="rounded-md px-1.5 py-0.5 text-[11px] font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            2x
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))))}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <ZoomOut size={16} />
                        </button>
                        <input
                          type="range"
                          min="0.5"
                          max="3"
                          step="0.05"
                          value={zoom}
                          onChange={(e) => setZoom(parseFloat(e.target.value))}
                          className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-slate-700 accent-sky-600"
                        />
                        <button
                          type="button"
                          onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(1))))}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <ZoomIn size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Frame Aspect Presets */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        Aspect Ratio
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleAspectChange(1)}
                          className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer ${
                            activeAspect === 1
                              ? 'bg-sky-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          <Square size={13} />
                          <span>1:1 Square</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAspectChange(4 / 3)}
                          className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer ${
                            activeAspect === 4 / 3
                              ? 'bg-sky-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          <span>4:3 Standard</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAspectChange(16 / 9)}
                          className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer ${
                            activeAspect === 16 / 9
                              ? 'bg-sky-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          <span>16:9 Banner</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAspectChange(undefined)}
                          className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer ${
                            activeAspect === undefined
                              ? 'bg-sky-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          <CropIcon size={13} />
                          <span>Free Crop</span>
                        </button>
                      </div>
                    </div>

                    {/* Transform Buttons */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        Transform & Tools
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setIsCircularGuide((c) => !c)}
                          className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer ${
                            isCircularGuide
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          <Circle size={13} />
                          <span>Circle Mask</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRotate}
                          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-all cursor-pointer"
                        >
                          <RotateCw size={13} />
                          <span>Rotate 90°</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleFlip}
                          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-all cursor-pointer"
                        >
                          <FlipHorizontal size={13} />
                          <span>Flip H</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleReset}
                          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 transition-all cursor-pointer"
                        >
                          <RefreshCw size={13} />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: FILTERS & TONE */}
                {activeTab === 'adjust' && (
                  <div className="space-y-4">
                    {/* Brightness */}
                    <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800/70 dark:bg-slate-950/40">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                          <Sun size={15} className="text-amber-500" />
                          <span>Brightness</span>
                        </span>
                        <span className="font-mono text-slate-500">{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        step="1"
                        value={brightness}
                        onChange={(e) => setBrightness(parseInt(e.target.value))}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-slate-700 accent-amber-500"
                      />
                    </div>

                    {/* Contrast */}
                    <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800/70 dark:bg-slate-950/40">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                          <Contrast size={15} className="text-indigo-500" />
                          <span>Contrast</span>
                        </span>
                        <span className="font-mono text-slate-500">{contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        step="1"
                        value={contrast}
                        onChange={(e) => setContrast(parseInt(e.target.value))}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-slate-700 accent-indigo-500"
                      />
                    </div>

                    {/* Saturation */}
                    <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800/70 dark:bg-slate-950/40">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                          <Palette size={15} className="text-emerald-500" />
                          <span>Saturation</span>
                        </span>
                        <span className="font-mono text-slate-500">{saturate}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="1"
                        value={saturate}
                        onChange={(e) => setSaturate(parseInt(e.target.value))}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-slate-700 accent-emerald-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setBrightness(100);
                        setContrast(100);
                        setSaturate(100);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}

                {/* Real-time Live Result Badge */}
                <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                  <div className="mb-3 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Eye size={12} className="text-sky-500" />
                      <span>Live Result Preview</span>
                    </span>
                    <span className="text-[10px] text-slate-400">160x160</span>
                  </div>

                  <div className="flex items-center justify-center gap-6">
                    {/* Circle Avatar Preview */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="relative h-20 w-20 rounded-full border-2 border-white shadow-xl overflow-hidden bg-slate-950 dark:border-slate-700">
                        <canvas ref={previewCanvasRef} className="h-full w-full object-cover" />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500">Circle</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Confirm / Cancel Actions */}
              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isApplying}
                  className="flex-1 cursor-pointer rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isApplying || !completedCrop?.width || !completedCrop?.height}
                  className="flex-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-sky-600 py-3 text-xs font-bold text-white shadow-lg shadow-sky-600/30 transition-all hover:bg-sky-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={15} />
                  <span>{isApplying ? 'Applying...' : 'Save Photo'}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
