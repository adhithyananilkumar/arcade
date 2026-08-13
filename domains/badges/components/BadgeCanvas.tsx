"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Rect, Text as KonvaText, Transformer, Line } from "react-konva";
import type Konva from "konva";
import { Plus, Trash2 } from "lucide-react";
import {
  type BadgeDocument,
  type BadgeTextObject,
  createEmptyBadgeDocument,
  getBadgeShapeDefinition,
} from "..";

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
  initialDocument: BadgeDocument;
  onChange: (doc: BadgeDocument) => void;
  readOnly?: boolean;
}

const STAGE_SIZE = 560;

export function BadgeCanvas({ initialDocument, onChange, readOnly }: BadgeCanvasProps) {
  const [doc, setDoc] = useState<BadgeDocument>(initialDocument);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef<Map<string, Konva.Text>>(new Map());

  const shape = useMemo(() => getBadgeShapeDefinition(doc.shape.type), [doc.shape.type]);
  const scale = STAGE_SIZE / doc.canvas.width;
  const clipPoints = useMemo(() => pathToPoints(shape.clipGeometry), [shape]);
  const outerPoints = useMemo(() => pathToPoints(shape.outerGeometry), [shape]);
  const safeAreaPoints = useMemo(() => pathToPoints(shape.safeArea), [shape]);

  useEffect(() => {
    setDoc(initialDocument);
  }, [initialDocument]);

  const update = useCallback(
    (next: BadgeDocument) => {
      setDoc(next);
      onChange(next);
    },
    [onChange]
  );

  useEffect(() => {
    if (!trRef.current) return;
    const node = selectedId ? nodeRefs.current.get(selectedId) : null;
    trRef.current.nodes(node ? [node] : []);
    trRef.current.getLayer()?.batchDraw();
  }, [selectedId, doc.objects]);

  const addTextObject = () => {
    const id = `obj-${crypto.randomUUID()}`;
    const next: BadgeTextObject = {
      id,
      type: "text",
      x: doc.canvas.width / 2 - 150,
      y: doc.canvas.height / 2 - 20,
      width: 300,
      height: 40,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: doc.objects.length,
      text: "New Text",
      fontFamily: "Geist",
      fontSize: 32,
      fontWeight: 700,
      color: "#FFFFFF",
      align: "center",
      lineHeight: 1.2,
      letterSpacing: 0,
      wrap: true,
    };
    update({ ...doc, objects: [...doc.objects, next] });
    setSelectedId(id);
  };

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    update({ ...doc, objects: doc.objects.filter((o) => o.id !== selectedId) });
    setSelectedId(null);
  }, [doc, selectedId, update]);

  useEffect(() => {
    if (readOnly) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        const active = document.activeElement;
        if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, deleteSelected, readOnly]);

  const updateObject = (id: string, patch: Partial<BadgeTextObject>) => {
    update({
      ...doc,
      objects: doc.objects.map((o) => (o.id === id ? ({ ...o, ...patch } as BadgeTextObject) : o)),
    });
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {!readOnly && (
        <div className="flex w-full max-w-[560px] items-center gap-2">
          <button
            type="button"
            onClick={addTextObject}
            className="flex items-center gap-1 rounded-full bg-[#14142b] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#14142b]/90"
          >
            <Plus size={13} /> Text
          </button>
          {selectedId && (
            <button
              type="button"
              onClick={deleteSelected}
              className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
            >
              <Trash2 size={13} /> Delete
            </button>
          )}
        </div>
      )}

      <div
        className="rounded-2xl bg-[#0b0b18] p-4 shadow-inner"
        style={{ width: STAGE_SIZE + 32, height: STAGE_SIZE + 32 }}
      >
        <Stage
          ref={stageRef}
          width={STAGE_SIZE}
          height={STAGE_SIZE}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={(e) => {
            if (e.target === e.target.getStage()) setSelectedId(null);
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
                    onClick={() => !readOnly && setSelectedId(obj.id)}
                    onTap={() => !readOnly && setSelectedId(obj.id)}
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

          {/* Guides layer — not clipped, editor-only, never exported */}
          {!readOnly && (
            <Layer listening={false}>
              <SafeAreaGuide points={safeAreaPoints} />
              <OuterOutline points={outerPoints} />
            </Layer>
          )}
        </Stage>
      </div>
    </div>
  );
}

function SafeAreaGuide({ points }: { points: number[] }) {
  return (
    <PolygonOutline points={points} stroke="rgba(255,255,255,0.25)" dash={[6, 6]} />
  );
}

function OuterOutline({ points }: { points: number[] }) {
  return <PolygonOutline points={points} stroke="rgba(255,255,255,0.5)" />;
}

function PolygonOutline({
  points,
  stroke,
  dash,
}: {
  points: number[];
  stroke: string;
  dash?: number[];
}) {
  return <Line points={points} closed stroke={stroke} strokeWidth={2} dash={dash} listening={false} />;
}

export { createEmptyBadgeDocument };
