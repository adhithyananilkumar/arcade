/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Badges
 *
 * BadgeDocument is the canonical, renderer-independent domain model
 * for a badge design. It must never be coupled to a specific
 * rendering technology (Konva, SVG, DOM, PNG) or to the Yjs/CRDT
 * representation used for collaboration — those are transport/
 * presentation concerns layered on top of this schema.
 *
 * schemaVersion must be bumped whenever the shape of this document
 * changes in a way that is not backward-compatible; see
 * domains/badges/lib/migrations.ts for the migration chain.
 * ------------------------------------------------------------------
 */

export const BADGE_DOCUMENT_SCHEMA_VERSION = 3 as const;

/**
 * "ARCADE_HEX" is a historical id (kept for compatibility with already-persisted
 * badges.shape_id rows) — the geometry it resolves to is the elongated Arcade
 * shield, not a regular hexagon; see badgeShape.types.ts. Only one shape exists
 * today by deliberate product decision (the outer frame is system-controlled,
 * not user-selectable), but the id/definition split already supports adding
 * more (Classic Hex, Circle, Ribbon, ...) later without an editor rewrite.
 */
export type BadgeShapeId = "ARCADE_HEX";

export interface BadgeCanvas {
  width: number;
  height: number;
}

export interface BadgeGradientStop {
  offset: number; // 0-1
  color: string;
}

export type BadgeBackground =
  | { type: "solid"; value: string; opacity?: number }
  | { type: "gradient"; angle: number; stops: BadgeGradientStop[] }
  | { type: "radialGradient"; cx: number; cy: number; radius: number; stops: BadgeGradientStop[] }
  | { type: "pattern"; pattern: BadgePatternKind; color: string; opacity: number; scale: number; rotation: number }
  | { type: "image"; src: string; fit: "cover" | "contain" | "fill" };

/**
 * Registry of pattern kinds is intentionally small and additive — see
 * lib/badgePatterns.ts, which maps each kind to a Konva-drawing function. Adding
 * a new pattern means adding one entry there, not touching BadgeCanvas.
 */
export type BadgePatternKind = "dots" | "grid" | "diagonalLines" | "hexGrid";

export type BadgeBorderStyle = "none" | "solid" | "dashed" | "double";

/**
 * Styling for the badge's fixed outer frame. This is NOT a BadgeObject — the
 * frame itself is system-controlled (not draggable/resizable/deletable, see
 * badgeShape.types.ts); only its appearance is user-editable, through these
 * fields.
 */
export interface BadgeBorderConfig {
  type: "solid" | "gradient";
  color: string;
  width: number;
  opacity: number;
  angle: number;
  stops: BadgeGradientStop[];
}

export const DEFAULT_BADGE_BORDER: BadgeBorderConfig = {
  type: "solid",
  color: "#16C7A3",
  width: 6,
  opacity: 1,
  angle: 45,
  stops: [{ offset: 0, color: "#00C2A8" }, { offset: 1, color: "#7C3AED" }],
};

export interface BadgeVariableBinding {
  /** Dot-path into the resolved variable context, e.g. "student.name" */
  path: string;
  fallback: string;
}

interface BadgeObjectBase {
  id: string;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  shadow?: { color: string; blur: number; offsetX: number; offsetY: number };
}

export type BadgeTextTransform = "none" | "uppercase" | "lowercase" | "capitalize";

export interface BadgeTextObject extends BadgeObjectBase {
  type: "text";
  text: string;
  /** If set, `text` is the fallback/preview value and binding supplies the live value. */
  binding?: BadgeVariableBinding;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle?: "normal" | "italic";
  textTransform?: BadgeTextTransform;
  color: string;
  align: "left" | "center" | "right";
  lineHeight: number;
  letterSpacing: number;
  maxWidth?: number;
  wrap: boolean;
  stroke?: string;
  strokeWidth?: number;
}

/**
 * `src` is the asset's resolved public URL (from the existing /api/media
 * presign->upload->register flow — see infrastructure/media/upload.ts), not an
 * opaque asset id: MediaAsset's own model already embeds resolved URLs directly
 * rather than an id callers resolve later, and BadgeImageObject follows that
 * same established convention instead of inventing a second asset-reference
 * scheme.
 */
export interface BadgeImageObject extends BadgeObjectBase {
  type: "image";
  src: string;
  fit: "cover" | "contain" | "fill";
  crop?: { x: number; y: number; width: number; height: number };
  border?: { color: string; width: number };
}

export type BadgeShapeKind =
  | "rectangle"
  | "roundedRectangle"
  | "circle"
  | "ellipse"
  | "triangle"
  | "diamond"
  | "star"
  | "ring"
  | "line";

export interface BadgeShapeObject extends BadgeObjectBase {
  type: "shape";
  shape: BadgeShapeKind;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number; // roundedRectangle
  points?: number[]; // line
  innerRadiusRatio?: number; // ring / star
}

/** `iconId` is a semantic identifier resolved to a vector icon at render time — see lib/badgeIcons.ts. Icons are never rasterized into the document. */
export interface BadgeIconObject extends BadgeObjectBase {
  type: "icon";
  iconId: string;
  color: string;
  strokeWidth?: number;
}

export interface BadgeQrCodeObject extends BadgeObjectBase {
  type: "qrcode";
  /** Bound at render time to the issued badge's verification URL; this is the design-time preview value. */
  valuePreview: string;
  foreground: string;
  background: string;
}

export type BadgeObject =
  | BadgeTextObject
  | BadgeImageObject
  | BadgeShapeObject
  | BadgeIconObject
  | BadgeQrCodeObject;

export type BadgeObjectType = BadgeObject["type"];

export interface BadgeEffect {
  id: string;
  type: "shimmer" | "sparkles" | "glow" | "lightSweep" | "floatingParticles" | "aurora";
  intensity: number;
  speed: number;
  color?: string;
}

export interface BadgeVariableDeclaration {
  path: string;
  label: string;
  sampleValue: string;
}

export interface BadgeDocumentMetadata {
  title: string;
  description?: string;
}

/**
 * The canonical badge design document.
 * schemaVersion + a migration chain (see lib/migrations.ts) are what
 * make historical, published BadgeDesignVersions safely renderable
 * forever, independent of how the current editor evolves.
 */
export interface BadgeDocument {
  schemaVersion: typeof BADGE_DOCUMENT_SCHEMA_VERSION;
  canvas: BadgeCanvas;
  shape: { type: BadgeShapeId };
  background: BadgeBackground;
  border: BadgeBorderConfig;
  objects: BadgeObject[];
  effects: BadgeEffect[];
  variables: BadgeVariableDeclaration[];
  metadata: BadgeDocumentMetadata;
}

export function createEmptyBadgeDocument(title: string): BadgeDocument {
  return {
    schemaVersion: BADGE_DOCUMENT_SCHEMA_VERSION,
    canvas: { width: 1024, height: 1024 },
    shape: { type: "ARCADE_HEX" },
    background: { type: "solid", value: "#063D36" },
    border: DEFAULT_BADGE_BORDER,
    objects: [],
    effects: [],
    variables: [],
    metadata: { title },
  };
}
