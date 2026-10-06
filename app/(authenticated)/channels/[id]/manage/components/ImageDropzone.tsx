'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ImagePlus } from 'lucide-react';

interface ImageDropzoneProps {
  /** MIME types accepted, e.g. ['image/png', 'image/svg+xml']. */
  accept: string[];
  onFile: (file: File) => void;
  /** The current image, shown inside the zone; null shows the empty prompt. */
  children?: ReactNode;
  label: string;
  help: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Where an image is picked: click to browse, drop a file on it, or paste one (while the zone has
 * focus or the pointer is over it). Rejects other types before they reach the cropper.
 */
export function ImageDropzone({ accept, onFile, children, label, help, disabled, className }: ImageDropzoneProps) {
  const input = useRef<HTMLInputElement>(null);
  const zone = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const take = (file: File | undefined | null) => {
    if (!file || disabled) return;
    onFile(file);
  };

  // Paste works when this zone is the one being pointed at or focused, so two zones on one page
  // never both take the same clipboard image.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const active = hovered || (zone.current && zone.current.contains(document.activeElement));
      if (!active || disabled) return;
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.kind === 'file' && i.type.startsWith('image/'));
      const file = item?.getAsFile();
      if (file) {
        e.preventDefault();
        take(file);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered, disabled]);

  return (
    <div
      ref={zone}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-disabled={disabled}
      onClick={() => !disabled && input.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          input.current?.click();
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        take(e.dataTransfer.files?.[0]);
      }}
      className={`group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
        dragging
          ? 'border-indigo-400 bg-indigo-50/70 dark:bg-indigo-500/10'
          : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-50'
      } ${disabled ? 'pointer-events-none opacity-60' : ''} ${className ?? ''}`}
    >
      {children ?? (
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-slate-500 shadow-xs">
          <ImagePlus size={20} />
        </span>
      )}
      <span className="text-[12.5px] font-extrabold text-slate-800">{label}</span>
      <span className="text-[11px] font-medium leading-snug text-slate-500">{help}</span>
      <input
        ref={input}
        type="file"
        accept={accept.join(', ')}
        className="hidden"
        onChange={(e) => {
          take(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
