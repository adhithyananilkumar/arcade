"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Group,
  Rect,
  Ellipse,
  RegularPolygon,
  Star,
  Ring,
  Line,
  Text as KonvaText,
  Image as KonvaImage,
  Transformer,
} from "react-konva";
import type Konva from "konva";
import {
  type BadgeDocument,
  type BadgeObject,
  type BadgeShapeObject,
  type BadgeImageObject,
  type BadgeIconObject,
  type BadgeTextObject,
  getBadgeShapeDefinition,
} from "..";
import { useBadgeIconImage } from "../lib/badgeIcons";
import { useHtmlImage } from "../lib/useHtmlImage";
import { getPatternTile } from "../lib/badgePatterns";

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

function applyTextTransform(text: string, transform?: BadgeTextObject["textTransform"]): string {
  switch (transform) {
    case "uppercase":
      return text.toUpperCase();
    case "lowercase":
      return text.toLowerCase();
    case "capitalize":
      return text.replace(/\b\w/g, (c) => c.toUpperCase());
    default:
      return text;
  }
}

/** cover/fill crop math for image objects and image backgrounds. "contain" falls back to fill (a documented gap — true contain needs letterboxing). */
function computeCrop(img: HTMLImageElement, w: number, h: number, fit: "cover" | "contain" | "fill") {
  if (fit !== "cover" || !img.naturalWidth || !img.naturalHeight) return undefined;
  const imageRatio = img.naturalWidth / img.naturalHeight;
  const boxRatio = w / h;
  if (imageRatio > boxRatio) {
    const cropWidth = img.naturalHeight * boxRatio;
    return { x: (img.naturalWidth - cropWidth) / 2, y: 0, width: cropWidth, height: img.naturalHeight };
  }
  const cropHeight = img.naturalWidth / boxRatio;
  return { x: 0, y: (img.naturalHeight - cropHeight) / 2, width: img.naturalWidth, height: cropHeight };
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
 * Pure rendering surface — the badge geometry IS the canvas. No background card, no border card
 * of its own: this renders directly against whatever it's placed on (the Studio workspace),
 * matching the "hexagon is the product" rule. Layout, toolbar, and panels live in
 * BadgeEditorWorkspace/BadgePanels; this component only knows how to draw and edit a
 * BadgeDocument.
 *
 * All non-text object kinds (shape/image/icon) render inside a Konva Group sized to the
 * object's width/height, with the actual primitive drawn relative to that group's local (0,0)-
 * (width,height) box. This keeps drag/select/transform handling identical across every shape
 * kind — Konva's built-in primitives (Circle, Star, Ring, ...) don't uniformly expose width/
 * height the way Rect/Text do, so the wrapper group is what makes "resize this object" mean the
 * same thing regardless of what's inside it.
 */
export function BadgeCanvas({ document: doc, onChange, selectedId, onSelect, size, showGuides, readOnly }: BadgeCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef<Map<string, Konva.Node>>(new Map());

  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingTextId && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(editingValue.length, editingValue.length);
    }
  }, [editingTextId, editingValue.length]);

  const handleEditComplete = () => {
    if (editingTextId) {
      updateObject(editingTextId, { text: editingValue || " " });
      setEditingTextId(null);
      onSelect(null);
    }
  };

  const shape = useMemo(() => getBadgeShapeDefinition(doc.shape.type), [doc.shape.type]);
  const scale = size / doc.canvas.width;

  const getEditTextStyle = (): React.CSSProperties => {
    if (!editingTextId) return {};
    const node = nodeRefs.current.get(editingTextId);
    if (!node) return {};
    const obj = doc.objects.find((o) => o.id === editingTextId) as import("..").BadgeTextObject;
    if (!obj) return {};
    
    const absPos = node.absolutePosition();
    
    return {
      position: "absolute",
      top: absPos.y + "px",
      left: absPos.x + "px",
      width: obj.width * scale + "px",
      height: obj.height * scale + "px",
      fontSize: obj.fontSize * scale + "px",
      border: "none",
      padding: "0px",
      margin: "0px",
      overflow: "hidden",
      background: "transparent",
      outline: "none",
      resize: "none",
      lineHeight: obj.lineHeight,
      fontFamily: obj.fontFamily,
      fontWeight: obj.fontWeight,
      fontStyle: obj.fontStyle === "italic" ? "italic" : "normal",
      textAlign: obj.align,
      color: obj.color,
      transform: `rotate(${obj.rotation}deg)`,
      transformOrigin: "top left",
      wordWrap: "break-word",
      whiteSpace: "pre-wrap",
      letterSpacing: obj.letterSpacing * scale + "px",
      zIndex: 100,
    };
  };
  const clipPoints = useMemo(() => pathToPoints(shape.clipGeometry), [shape]);
  const outerPoints = useMemo(() => pathToPoints(shape.outerGeometry), [shape]);
  const safeAreaPoints = useMemo(() => pathToPoints(shape.safeArea), [shape]);
  const borderPoints = useMemo(() => pathToPoints(shape.borderGeometry), [shape]);
  const innerBorderPoints = useMemo(() => pathToPoints(shape.innerBorderGeometry), [shape]);

  useEffect(() => {
    if (!trRef.current) return;
    const node = selectedId && selectedId !== editingTextId ? nodeRefs.current.get(selectedId) : null;
    trRef.current.nodes(node ? [node] : []);
    trRef.current.getLayer()?.batchDraw();
  }, [selectedId, editingTextId, doc.objects]);

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

  const updateObject = (id: string, patch: Record<string, unknown>) => {
    onChange({
      ...doc,
      objects: doc.objects.map((o) => (o.id === id ? ({ ...o, ...patch } as BadgeObject) : o)),
    });
  };

  const registerNode = (id: string, node: Konva.Node | null) => {
    if (node) nodeRefs.current.set(id, node);
    else nodeRefs.current.delete(id);
  };

  const handleGroupTransformEnd = (obj: BadgeObject, node: Konva.Node) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    const patch: Record<string, unknown> = {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
    };

    if (obj.type === "text") {
      const textObj = obj as import("..").BadgeTextObject;
      // Use whichever scale factor changed (handles corners and side adjusters)
      const scaleToUse = scaleX !== 1 ? scaleX : scaleY;
      
      patch.fontSize = Math.max(1, textObj.fontSize * scaleToUse);
      patch.width = Math.max(10, textObj.width * scaleToUse);
      patch.height = Math.max(10, textObj.height * scaleToUse);
    } else {
      patch.width = Math.max(10, obj.width * scaleX);
      patch.height = Math.max(10, obj.height * scaleY);
    }

    updateObject(obj.id, patch);
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Stage
        ref={stageRef}
        width={size}
        height={size}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) {
            if (editingTextId) handleEditComplete();
            onSelect(null);
          }
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
        <BackgroundFill background={doc.background} width={doc.canvas.width} height={doc.canvas.height} />

        {doc.objects
          .filter((o) => o.visible)
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((obj) => {
            if (obj.type === "text") {
              return (
                <KonvaText
                  key={obj.id}
                  ref={(node) => registerNode(obj.id, node)}
                  x={obj.x}
                  y={obj.y}
                  width={obj.width}
                  height={obj.height}
                  rotation={obj.rotation}
                  opacity={editingTextId === obj.id ? 0 : obj.opacity}
                  text={applyTextTransform(obj.text, obj.textTransform)}
                  fontFamily={obj.fontFamily}
                  fontSize={obj.fontSize}
                  fontStyle={String(obj.fontWeight >= 700 ? "bold" : "normal") + (obj.fontStyle === "italic" ? " italic" : "")}
                  fill={obj.color}
                  align={obj.align}
                  lineHeight={obj.lineHeight}
                  letterSpacing={obj.letterSpacing}
                  stroke={obj.stroke}
                  strokeWidth={obj.stroke ? obj.strokeWidth ?? 1 : undefined}
                  shadowColor={obj.shadow?.color}
                  shadowBlur={obj.shadow?.blur}
                  shadowOffsetX={obj.shadow?.offsetX}
                  shadowOffsetY={obj.shadow?.offsetY}
                  draggable={!readOnly && !obj.locked}
                  onClick={() => {
                    if (readOnly) return;
                    onSelect(obj.id);
                  }}
                  onTap={() => {
                    if (readOnly) return;
                    onSelect(obj.id);
                  }}
                  onDblClick={() => {
                    if (readOnly) return;
                    onSelect(obj.id);
                    setEditingTextId(obj.id);
                    setEditingValue(obj.text === "New Text" ? "" : obj.text);
                  }}
                  onDblTap={() => {
                    if (readOnly) return;
                    onSelect(obj.id);
                    setEditingTextId(obj.id);
                    setEditingValue(obj.text === "New Text" ? "" : obj.text);
                  }}
                  onDragEnd={(e) => updateObject(obj.id, { x: e.target.x(), y: e.target.y() })}
                  onTransformEnd={(e) => handleGroupTransformEnd(obj, e.target)}
                />
              );
            }

            return (
              <Group
                key={obj.id}
                ref={(node) => registerNode(obj.id, node)}
                x={obj.x}
                y={obj.y}
                width={obj.width}
                height={obj.height}
                rotation={obj.rotation}
                opacity={obj.opacity}
                shadowColor={obj.shadow?.color}
                shadowBlur={obj.shadow?.blur}
                shadowOffsetX={obj.shadow?.offsetX}
                shadowOffsetY={obj.shadow?.offsetY}
                draggable={!readOnly && !obj.locked}
                onClick={() => !readOnly && onSelect(obj.id)}
                onTap={() => !readOnly && onSelect(obj.id)}
                onDragEnd={(e) => updateObject(obj.id, { x: e.target.x(), y: e.target.y() })}
                onTransformEnd={(e) => handleGroupTransformEnd(obj, e.target)}
              >
                {obj.type === "shape" && <ShapeInner obj={obj} />}
                {obj.type === "image" && <ImageInner obj={obj} />}
                {obj.type === "icon" && <IconInner obj={obj} />}
                {obj.type === "qrcode" && <QrPlaceholderInner width={obj.width} height={obj.height} />}
              </Group>
            );
          })}
        {!readOnly && <Transformer ref={trRef} rotateEnabled resizeEnabled />}
      </Layer>

      {/* Border layer — the fixed frame's styling; not selectable/draggable/deletable. */}
      <Layer listening={false}>
        <BadgeBorder
          border={doc.border}
          borderPoints={borderPoints}
          width={doc.canvas.width}
          height={doc.canvas.height}
        />
      </Layer>

      {/* Guides layer — not clipped, editor-only, hidden in Preview and never exported. */}
      {!readOnly && showGuides && (
        <Layer listening={false}>
          {/* Guide outline line removed */}
        </Layer>
      )}
    </Stage>
    {editingTextId && (
      <textarea
        ref={textareaRef}
        style={getEditTextStyle()}
        value={editingValue}
        onChange={(e) => setEditingValue(e.target.value)}
        onBlur={handleEditComplete}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setEditingTextId(null);
          } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleEditComplete();
          }
        }}
      />
    )}
  </div>
  );
}

function PolygonOutline({ points, stroke, dash }: { points: number[]; stroke: string; dash?: number[] }) {
  return <Line points={points} closed stroke={stroke} strokeWidth={2} dash={dash} listening={false} />;
}

function BackgroundFill({ background, width, height }: { background: BadgeDocument["background"]; width: number; height: number }) {
  const image = useHtmlImage(background.type === "image" ? background.src : undefined);

  if (background.type === "solid") {
    return <Rect x={0} y={0} width={width} height={height} fill={background.value} opacity={background.opacity ?? 1} />;
  }
  if (background.type === "gradient") {
    const angleRad = (background.angle * Math.PI) / 180;
    const dx = (Math.cos(angleRad) * width) / 2;
    const dy = (Math.sin(angleRad) * height) / 2;
    return (
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fillLinearGradientStartPoint={{ x: width / 2 - dx, y: height / 2 - dy }}
        fillLinearGradientEndPoint={{ x: width / 2 + dx, y: height / 2 + dy }}
        fillLinearGradientColorStops={background.stops.flatMap((s) => [s.offset, s.color])}
      />
    );
  }
  if (background.type === "radialGradient") {
    return (
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fillRadialGradientStartPoint={{ x: background.cx * width, y: background.cy * height }}
        fillRadialGradientEndPoint={{ x: background.cx * width, y: background.cy * height }}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndRadius={background.radius * width}
        fillRadialGradientColorStops={background.stops.flatMap((s) => [s.offset, s.color])}
      />
    );
  }
  if (background.type === "pattern") {
    const tile = getPatternTile(background.pattern, background.color, background.scale);
    return (
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="#0B0B18"
        {...(tile
          ? {
              // Konva accepts an HTMLCanvasElement as a pattern source at runtime; its TS types
              // only declare HTMLImageElement.
              fillPatternImage: tile as unknown as HTMLImageElement,
              fillPatternRepeat: "repeat",
              fillPatternRotation: background.rotation,
              fillPatternOpacity: background.opacity,
            }
          : {})}
      />
    );
  }
  // image
  if (image) {
    const crop = computeCrop(image, width, height, background.fit);
    return <KonvaImage image={image} x={0} y={0} width={width} height={height} crop={crop} listening={false} />;
  }
  return <Rect x={0} y={0} width={width} height={height} fill="#0B0B18" />;
}

function ShapeInner({ obj }: { obj: BadgeShapeObject }) {
  const { width: w, height: h } = obj;
  const fill = obj.fill;
  const stroke = obj.stroke;
  const strokeWidth = obj.strokeWidth ?? 0;
  const minDim = Math.min(w, h);

  switch (obj.shape) {
    case "rectangle":
      return <Rect x={0} y={0} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
    case "roundedRectangle":
      return (
        <Rect x={0} y={0} width={w} height={h} cornerRadius={obj.cornerRadius ?? Math.min(w, h) * 0.15} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      );
    case "circle":
    case "ellipse":
      return <Ellipse x={w / 2} y={h / 2} radiusX={w / 2} radiusY={h / 2} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
    case "triangle":
      return <RegularPolygon x={w / 2} y={h / 2} sides={3} radius={minDim / 2} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
    case "diamond":
      return <RegularPolygon x={w / 2} y={h / 2} sides={4} radius={minDim / 2} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
    case "star":
      return (
        <Star
          x={w / 2}
          y={h / 2}
          numPoints={5}
          innerRadius={(minDim / 2) * (obj.innerRadiusRatio ?? 0.5)}
          outerRadius={minDim / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    case "ring":
      return (
        <Ring
          x={w / 2}
          y={h / 2}
          innerRadius={(minDim / 2) * (obj.innerRadiusRatio ?? 0.6)}
          outerRadius={minDim / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    case "line":
      return <Line points={obj.points ?? [0, h / 2, w, h / 2]} stroke={stroke ?? fill ?? "#FFFFFF"} strokeWidth={strokeWidth || 3} lineCap="round" />;
    default:
      return null;
  }
}

function ImageInner({ obj }: { obj: BadgeImageObject }) {
  const image = useHtmlImage(obj.src);
  if (!image) {
    return <Rect x={0} y={0} width={obj.width} height={obj.height} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" dash={[4, 4]} />;
  }
  const crop = computeCrop(image, obj.width, obj.height, obj.fit);
  return (
    <>
      <KonvaImage image={image} x={0} y={0} width={obj.width} height={obj.height} crop={crop} />
      {obj.border && <Rect x={0} y={0} width={obj.width} height={obj.height} stroke={obj.border.color} strokeWidth={obj.border.width} />}
    </>
  );
}

function IconInner({ obj }: { obj: BadgeIconObject }) {
  const image = useBadgeIconImage(obj.iconId, obj.color, obj.strokeWidth ?? 2);
  if (!image) return null;
  return <KonvaImage image={image} x={0} y={0} width={obj.width} height={obj.height} />;
}

function QrPlaceholderInner({ width, height }: { width: number; height: number }) {
  return (
    <>
      <Rect x={0} y={0} width={width} height={height} fill="#FFFFFF" />
      <Rect x={width * 0.1} y={height * 0.1} width={width * 0.8} height={height * 0.8} stroke="#0B0B18" strokeWidth={2} dash={[4, 4]} />
    </>
  );
}

function BadgeBorder({
  border,
  borderPoints,
  width,
  height,
}: {
  border: BadgeDocument["border"];
  borderPoints: number[];
  width: number;
  height: number;
}) {
  if (border.type === "gradient") {
    const angleRad = (border.angle * Math.PI) / 180;
    const dx = (Math.cos(angleRad) * width) / 2;
    const dy = (Math.sin(angleRad) * height) / 2;
    return (
      <Line
        points={borderPoints}
        closed
        strokeWidth={border.width}
        opacity={border.opacity}
        strokeLinearGradientStartPoint={{ x: width / 2 - dx, y: height / 2 - dy }}
        strokeLinearGradientEndPoint={{ x: width / 2 + dx, y: height / 2 + dy }}
        strokeLinearGradientColorStops={border.stops.flatMap((s) => [s.offset, s.color])}
      />
    );
  }

  return (
    <Line
      points={borderPoints}
      closed
      stroke={border.color}
      strokeWidth={border.width}
      opacity={border.opacity}
    />
  );
}
