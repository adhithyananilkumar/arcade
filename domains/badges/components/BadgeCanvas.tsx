"use client";

import { useEffect, useMemo, useRef } from "react";
import { Stage, Layer, Rect, Text as KonvaText, Transformer, Line } from "react-konva";
import type Konva from "konva";
import { type BadgeDocument, type BadgeTextObject, getBadgeShapeDefinition } from "..";

function pathToPoints(d: string): number[] {
  // Our BadgeShapeDefinition paths are always "M x,y L x,y ... Z" polygons (see
  // domains/badges/types/badgeShape.types.ts) — parsed directly rather than pulling in a full
  // SVG path parser for a shape this simple.
  const points: number[] = [];
  const matches = d.matchAll(/[ML]\s*(-?[\d.]+),(-?[\d.]+)/g);
  for (const m of matches) {
    points.push(parseFloat(m[1]), parseFloat(m[2]));
  }
  return points;
}

interface BadgeCanvasProps {
  document: BadgeDocument;
  onChange: (doc: BadgeDocument) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  size: number;
  showGuides: boolean;
  readOnly?: boolean;
}

/**
 * Pure rendering surface — the badge geometry IS the canvas. No background card, no border, no
 * chrome of its own: this renders directly against whatever it's placed on (the Studio
 * workspace), matching the "hexagon is the product" rule. Layout, toolbar, and panels live in
 * StandaloneBadgeEditor; this component only knows how to draw and edit a BadgeDocument.
 */
export function BadgeCanvas({ document: doc, onChange, selectedId, onSelect, size, showGuides, readOnly }: BadgeCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef<Map<string, Konva.Text>>(new Map());

  const shape = useMemo(() => getBadgeShapeDefinition(doc.shape.type), [doc.shape.type]);
  const scale = size / doc.canvas.width;
  const clipPoints = useMemo(() => pathToPoints(shape.clipGeometry), [shape]);
  const outerPoints = useMemo(() => pathToPoints(shape.outerGeometry), [shape]);
  const safeAreaPoints = useMemo(() => pathToPoints(shape.safeArea), [shape]);

  useEffect(() => {
    if (!trRef.current) return;
    const node = selectedId ? nodeRefs.current.get(selectedId) : null;
    trRef.current.nodes(node ? [node] : []);
    trRef.current.getLayer()?.batchDraw();
  }, [selectedId, doc.objects]);

  useEffect(() => {
    if (readOnly) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        const active = window.document.activeElement;
        if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;
        e.preventDefault();
        onChange({ ...doc, objects: doc.objects.filter((o) => o.id !== selectedId) });
        onSelect(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, doc, onChange, onSelect, readOnly]);

  const updateObject = (id: string, patch: Partial<BadgeTextObject>) => {
    onChange({
      ...doc,
      objects: doc.objects.map((o) => (o.id === id ? ({ ...o, ...patch } as BadgeTextObject) : o)),
    });
  };

  return (
    <Stage
      ref={stageRef}
      width={size}
      height={size}
      scaleX={scale}
      scaleY={scale}
      onMouseDown={(e) => {
        if (e.target === e.target.getStage()) onSelect(null);
      }}
    >
      <Layer
        clipFunc={(ctx) => {
          ctx.beginPath();
          for (let i = 0; i < clipPoints.length; i += 2) {
            if (i === 0) ctx.moveTo(clipPoints[i], clipPoints[i + 1]);
            else ctx.lineTo(clipPoints[i], clipPoints[i + 1]);
          }
          ctx.closePath();
        }}
      >
        {doc.background.type === "solid" && (
          <Rect x={0} y={0} width={doc.canvas.width} height={doc.canvas.height} fill={doc.background.value} />
        )}
        {doc.objects
          .filter((o) => o.visible)
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((obj) => {
            if (obj.type !== "text") return null; // image/shape/icon/qrcode: follow-up work
            return (
              <KonvaText
                key={obj.id}
                ref={(node) => {
                  if (node) nodeRefs.current.set(obj.id, node);
                  else nodeRefs.current.delete(obj.id);
                }}
                x={obj.x}
                y={obj.y}
                width={obj.width}
                height={obj.height}
                rotation={obj.rotation}
                opacity={obj.opacity}
                text={obj.text}
                fontFamily={obj.fontFamily}
                fontSize={obj.fontSize}
                fontStyle={String(obj.fontWeight >= 700 ? "bold" : "normal")}
                fill={obj.color}
                align={obj.align}
                lineHeight={obj.lineHeight}
                letterSpacing={obj.letterSpacing}
                draggable={!readOnly && !obj.locked}
                onClick={() => !readOnly && onSelect(obj.id)}
                onTap={() => !readOnly && onSelect(obj.id)}
                onDragEnd={(e) => updateObject(obj.id, { x: e.target.x(), y: e.target.y() })}
                onTransformEnd={(e) => {
                  const node = e.target;
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();
                  node.scaleX(1);
                  node.scaleY(1);
                  updateObject(obj.id, {
                    x: node.x(),
                    y: node.y(),
                    width: Math.max(20, node.width() * scaleX),
                    height: Math.max(20, node.height() * scaleY),
                    rotation: node.rotation(),
                  });
                }}
              />
            );
          })}
        {!readOnly && <Transformer ref={trRef} rotateEnabled resizeEnabled />}
      </Layer>

      {/* Guides layer — not clipped, editor-only, hidden in Preview and never exported. */}
      {!readOnly && showGuides && (
        <Layer listening={false}>
          <PolygonOutline points={safeAreaPoints} stroke="rgba(255,255,255,0.35)" dash={[6, 6]} />
          <PolygonOutline points={outerPoints} stroke="rgba(255,255,255,0.6)" />
        </Layer>
      )}
    </Stage>
  );
}

function PolygonOutline({ points, stroke, dash }: { points: number[]; stroke: string; dash?: number[] }) {
  return <Line points={points} closed stroke={stroke} strokeWidth={2} dash={dash} listening={false} />;
}
