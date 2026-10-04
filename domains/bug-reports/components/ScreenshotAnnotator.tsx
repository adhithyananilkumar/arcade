'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, EyeOff, Loader2, Pencil, Square, Undo2, X } from 'lucide-react';
import { canvasToBlob, imageToCanvas } from '@/infrastructure/media/screenshot';

type Tool = 'pen' | 'box' | 'redact';
type Point = { x: number; y: number };
type Mark =
  | { tool: 'pen'; color: string; points: Point[] }
  | { tool: 'box' | 'redact'; color: string; from: Point; to: Point };

const COLORS = ['#ef4444', '#f59e0b', '#2563eb', '#14142b'];

const TOOLS: { id: Tool; label: string; icon: typeof Pencil; hint: string }[] = [
  { id: 'pen', label: 'Draw', icon: Pencil, hint: 'Circle or point at the problem' },
  { id: 'box', label: 'Box', icon: Square, hint: 'Frame the area that looks wrong' },
  { id: 'redact', label: 'Hide', icon: EyeOff, hint: 'Black out anything private before sending' },
];

function drawMark(ctx: CanvasRenderingContext2D, mark: Mark, scale: number) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (mark.tool === 'pen') {
    ctx.strokeStyle = mark.color;
    ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    mark.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();
    return;
  }
  const x = Math.min(mark.from.x, mark.to.x);
  const y = Math.min(mark.from.y, mark.to.y);
  const w = Math.abs(mark.to.x - mark.from.x);
  const h = Math.abs(mark.to.y - mark.from.y);
  if (mark.tool === 'redact') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y, w, h);
  } else {
    ctx.strokeStyle = mark.color;
    ctx.lineWidth = 4 * scale;
    ctx.strokeRect(x, y, w, h);
  }
}

/**
 * Full-screen markup for one screenshot: draw, frame, or black out. Marks are kept as vectors and
 * burned into the image only on "Done", at full resolution.
 */
export function ScreenshotAnnotator({
  image,
  onDone,
  onCancel,
}: {
  image: Blob;
  onDone: (annotated: Blob) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tool, setTool] = useState<Tool>('box');
  const [color, setColor] = useState(COLORS[0]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const drawing = useRef<Mark | null>(null);

  /** Line width scales with the image so marks look the same on a 4K and a phone screenshot. */
  const strokeScale = useCallback(() => {
    const base = baseRef.current;
    return base ? Math.max(1, Math.max(base.width, base.height) / 1400) : 1;
  }, []);

  const redraw = useCallback(
    (extra?: Mark | null) => {
      const canvas = canvasRef.current;
      const base = baseRef.current;
      if (!canvas || !base) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(base, 0, 0);
      const scale = strokeScale();
      marks.forEach((m) => drawMark(ctx, m, scale));
      if (extra) drawMark(ctx, extra, scale);
    },
    [marks, strokeScale],
  );

  useEffect(() => {
    let cancelled = false;
    imageToCanvas(image).then((base) => {
      if (cancelled || !canvasRef.current) return;
      baseRef.current = base;
      canvasRef.current.width = base.width;
      canvasRef.current.height = base.height;
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [image]);

  useEffect(() => {
    if (ready) redraw();
  }, [ready, redraw]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') setMarks((m) => m.slice(0, -1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const toImagePoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * e.currentTarget.width,
      y: ((e.clientY - rect.top) / rect.height) * e.currentTarget.height,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = toImagePoint(e);
    drawing.current = tool === 'pen' ? { tool, color, points: [p] } : { tool, color, from: p, to: p };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const current = drawing.current;
    if (!current) return;
    const p = toImagePoint(e);
    if (current.tool === 'pen') current.points.push(p);
    else current.to = p;
    redraw(current);
  };

  const onPointerUp = () => {
    const current = drawing.current;
    drawing.current = null;
    if (!current) return;
    const trivial =
      current.tool === 'pen'
        ? current.points.length < 2
        : Math.abs(current.to.x - current.from.x) < 4 || Math.abs(current.to.y - current.from.y) < 4;
    if (!trivial) setMarks((m) => [...m, current]);
    else redraw();
  };

  const finish = async () => {
    if (!canvasRef.current) return;
    if (marks.length === 0) {
      onDone(image);
      return;
    }
    setSaving(true);
    try {
      redraw();
      onDone(await canvasToBlob(canvasRef.current, 'image/png'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-black/90 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Mark up screenshot" data-capture-ignore>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-white">
        <div className="flex flex-wrap items-center gap-1 rounded-full bg-white/10 p-1">
          {TOOLS.map(({ id, label, icon: Icon, hint }) => (
            <button
              key={id}
              type="button"
              title={hint}
              onClick={() => setTool(id)}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                tool === id ? 'bg-surface text-slate-900' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-white/20" />
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Colour ${c}`}
              disabled={tool === 'redact'}
              onClick={() => setColor(c)}
              className={`h-6 w-6 cursor-pointer rounded-full border-2 transition disabled:cursor-not-allowed disabled:opacity-30 ${
                color === c ? 'border-surface scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <span className="mx-1 h-5 w-px bg-white/20" />
          <button
            type="button"
            onClick={() => setMarks((m) => m.slice(0, -1))}
            disabled={marks.length === 0}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Undo2 size={13} /> Undo
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10">
            <X size={14} /> Cancel
          </button>
          <button
            type="button"
            onClick={finish}
            disabled={!ready || saving}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-surface px-4 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100 disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Done
          </button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        {!ready && <Loader2 className="h-6 w-6 animate-spin text-white/60" />}
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`max-h-full max-w-full touch-none rounded-lg shadow-2xl ${ready ? 'cursor-crosshair' : 'hidden'}`}
        />
      </div>
    </div>
  );
}
