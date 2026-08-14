"use client";

import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/react";
import { ImageIcon, LayoutTemplate, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { uploadFileToStorage } from "@/infrastructure/media/upload";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"];
const FOCAL_POINTS = ["top", "center", "bottom"] as const;

export function SectionEditView({ node, updateAttributes, selected }: NodeViewProps) {
  const { backgroundImage, overlayOpacity, focalPoint, minHeight } = node.attrs as {
    backgroundImage: string | null;
    overlayOpacity: number;
    focalPoint: (typeof FOCAL_POINTS)[number];
    minHeight: number;
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFilePicked(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFileToStorage(file, IMAGE_TYPES);
      updateAttributes({ backgroundImage: url });
    } catch {
      // Upload failure just leaves the previous background in place — the picker
      // stays available so the author can retry.
    } finally {
      setUploading(false);
    }
  }

  return (
    <NodeViewWrapper
      className={`group relative my-2 overflow-hidden rounded-lg border ${
        selected ? "border-indigo-400 ring-1 ring-indigo-200" : "border-gray-200"
      }`}
      data-drag-handle
    >
      <div
        className="relative flex flex-col justify-center bg-cover bg-gray-100 p-6 transition-[min-height]"
        style={{
          minHeight,
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundPosition: `center ${focalPoint}`,
        }}
      >
        {backgroundImage && (
          <div
            className="pointer-events-none absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
          />
        )}

        <div
          contentEditable={false}
          className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-md border border-gray-200 bg-white/95 p-1 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Set background image"
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
          >
            <ImageIcon size={14} />
          </button>
          {backgroundImage && (
            <>
              <div className="flex overflow-hidden rounded border border-gray-200">
                {FOCAL_POINTS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => updateAttributes({ focalPoint: f })}
                    title={`Focus ${f}`}
                    className={`px-1.5 py-1 text-[10px] capitalize ${
                      focalPoint === f ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={0}
                max={0.85}
                step={0.05}
                value={overlayOpacity}
                onChange={(e) => updateAttributes({ overlayOpacity: Number(e.target.value) })}
                title="Overlay darkness"
                className="w-16 accent-indigo-600"
              />
              <button
                type="button"
                onClick={() => updateAttributes({ backgroundImage: null })}
                title="Remove background"
                className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>

        {!backgroundImage && (
          <div
            contentEditable={false}
            className="pointer-events-none mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-400"
          >
            <LayoutTemplate size={13} /> Section
          </div>
        )}

        <div className={`relative z-[1] ${backgroundImage ? "text-white" : ""}`}>
          <NodeViewContent />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(e) => handleFilePicked(e.target.files?.[0])}
      />
    </NodeViewWrapper>
  );
}
