'use client';

import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCw, ZoomIn } from 'lucide-react';

interface Props {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onComplete: (croppedImageUrl: string) => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export function ImageEditorDialog({ isOpen, imageUrl, onClose, onComplete }: Props) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 16 / 9));
  }

  async function handleComplete() {
    if (!imgRef.current) return;
    
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const cropArea = completedCrop?.width && completedCrop?.height 
      ? completedCrop 
      : { 
          x: 0, 
          y: 0, 
          width: image.naturalWidth, 
          height: image.naturalHeight 
        };

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    const pixelRatio = window.devicePixelRatio;

    canvas.width = Math.floor(cropArea.width * scaleX * pixelRatio);
    canvas.height = Math.floor(cropArea.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = cropArea.x * scaleX;
    const cropY = cropArea.y * scaleY;

    const rotateRads = rotation * Math.PI / 180;
    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();
    
    ctx.translate(-cropX, -cropY);
    ctx.translate(centerX, centerY);
    ctx.rotate(rotateRads);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight
    );

    ctx.restore();

    const base64Image = canvas.toDataURL('image/jpeg', 0.9);
    onComplete(base64Image);
  }

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 9998,
        }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
        animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
        exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          width: 600,
          maxWidth: '95vw',
          maxHeight: '90vh',
          backgroundColor: '#fff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Edit Image</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="var(--text-muted)" />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imageUrl}
                style={{ transform: `scale(${scale}) rotate(${rotation}deg)`, maxHeight: 400, objectFit: 'contain' }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500 }}>Rotation ({rotation}°)</label>
                <RotateCw size={16} color="var(--text-muted)" />
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500 }}>Zoom ({scale.toFixed(1)}x)</label>
                <ZoomIn size={16} color="var(--text-muted)" />
              </div>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Cancel</button>
          <button
            onClick={handleComplete}
            style={{
              padding: '8px 24px',
              backgroundColor: '#0a0a0a',
              color: '#fff',
              border: 'none',
              borderRadius: 100,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              marginLeft: 12,
            }}
          >
            Insert Photo
          </button>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
