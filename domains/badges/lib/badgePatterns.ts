/**
 * Draws each BadgePatternKind onto a small tileable canvas, used as a Konva
 * `fillPatternImage`. Adding a new pattern means adding one case here — the
 * renderer (BadgeCanvas) never needs to change since it just asks for
 * `getPatternTile(kind, color, scale)` and hands the resulting canvas to Konva.
 */
import type { BadgePatternKind } from "../types/badgeDocument.types";

const BASE_TILE_SIZE = 32;

function drawDots(ctx: CanvasRenderingContext2D, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
}

function drawGrid(ctx: CanvasRenderingContext2D, size: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, size * 0.03);
  ctx.strokeRect(0, 0, size, size);
}

function drawDiagonalLines(ctx: CanvasRenderingContext2D, size: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, size * 0.06);
  ctx.beginPath();
  ctx.moveTo(0, size);
  ctx.lineTo(size, 0);
  ctx.stroke();
}

function drawHexGrid(ctx: CanvasRenderingContext2D, size: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, size * 0.04);
  const r = size * 0.42;
  const cx = size / 2;
  const cy = size / 2;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 90);
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

const DRAWERS: Record<BadgePatternKind, (ctx: CanvasRenderingContext2D, size: number, color: string) => void> = {
  dots: drawDots,
  grid: drawGrid,
  diagonalLines: drawDiagonalLines,
  hexGrid: drawHexGrid,
};

const tileCache = new Map<string, HTMLCanvasElement>();

export function getPatternTile(kind: BadgePatternKind, color: string, scale: number): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const key = `${kind}:${color}:${scale}`;
  const cached = tileCache.get(key);
  if (cached) return cached;

  const size = Math.max(8, BASE_TILE_SIZE * scale);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  DRAWERS[kind](ctx, size, color);

  tileCache.set(key, canvas);
  return canvas;
}
