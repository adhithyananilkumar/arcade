"use client";

import { Minus, Plus, Maximize2 } from "lucide-react";

export const ZOOM_STEPS = [25, 33, 50, 67, 75, 100, 125, 150, 200];
export const MIN_ZOOM = 25;
export const MAX_ZOOM = 200;

export type ZoomState = "fit" | number;

interface BadgeZoomControlsProps {
  zoom: ZoomState;
  /** The percentage "fit" is currently resolving to, just for display when zoom === "fit". */
  fitPercent: number;
  onZoomChange: (zoom: ZoomState) => void;
}

/**
 * Editor-only viewport control — never touches BadgeDocument.canvas (which stays
 * 1024x1024 regardless). Distinguishes AUTO/FIT (recalculates as the workspace
 * resizes) from MANUAL (a user-picked percentage that persists until they pick
 * another one or hit Fit again) — see BadgeEditorWorkspace, which owns the
 * actual size computation this just drives.
 */
export function BadgeZoomControls({ zoom, fitPercent, onZoomChange }: BadgeZoomControlsProps) {
  const displayPercent = zoom === "fit" ? fitPercent : zoom;

  const step = (dir: 1 | -1) => {
    const current = zoom === "fit" ? fitPercent : zoom;
    const next = ZOOM_STEPS.filter((s) => (dir === 1 ? s > current : s < current));
    const target = dir === 1 ? next[0] : next[next.length - 1];
    onZoomChange(target ?? Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, current + dir * 25)));
  };

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/40 bg-white/60 px-1.5 py-1.5 backdrop-blur-md shadow-sm">
      <button
        type="button"
        title="Zoom out"
        onClick={() => step(-1)}
        className="flex h-7 w-7 items-center justify-center rounded-full text-[#14142b]/60 hover:bg-[#14142b]/10 hover:text-[#14142b]"
      >
        <Minus size={14} />
      </button>
      <span className="w-11 text-center text-xs font-semibold text-[#14142b]/70 tabular-nums">{Math.round(displayPercent)}%</span>
      <button
        type="button"
        title="Zoom in"
        onClick={() => step(1)}
        className="flex h-7 w-7 items-center justify-center rounded-full text-[#14142b]/60 hover:bg-[#14142b]/10 hover:text-[#14142b]"
      >
        <Plus size={14} />
      </button>
      <div className="mx-0.5 h-5 w-px bg-[#14142b]/10" />
      <button
        type="button"
        title="Fit to workspace"
        onClick={() => onZoomChange("fit")}
        className={`flex h-7 items-center gap-1 rounded-full px-2.5 text-xs font-semibold transition-colors ${
          zoom === "fit" ? "bg-[#14142b] text-white" : "text-[#14142b]/60 hover:bg-[#14142b]/10 hover:text-[#14142b]"
        }`}
      >
        <Maximize2 size={12} />
        Fit
      </button>
    </div>
  );
}
