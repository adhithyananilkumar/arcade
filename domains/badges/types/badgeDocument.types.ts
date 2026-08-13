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

export const BADGE_DOCUMENT_SCHEMA_VERSION = 1 as const;

export type BadgeShapeId = "ARCADE_HEX";

export interface BadgeCanvas {
  width: number;
  height: number;
}

export type BadgeBackground =
  | { type: "solid"; value: string }
  | { type: "gradient"; angle: number; stops: Array<{ offset: number; color: string }> }
  | { type: "image"; assetId: string; fit: "cover" | "contain" | "fill" };

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
}

export interface BadgeTextObject extends BadgeObjectBase {
  type: "text";
  text: string;
  /** If set, `text` is the fallback/preview value and binding supplies the live value. */
  binding?: BadgeVariableBinding;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle?: "normal" | "italic";
  color: string;
  align: "left" | "center" | "right";
  lineHeight: number;
  letterSpacing: number;
  maxWidth?: number;
  wrap: boolean;
}

export interface BadgeImageObject extends BadgeObjectBase {
  type: "image";
  assetId: string;
  fit: "cover" | "contain" | "fill";
  crop?: { x: number; y: number; width: number; height: number };
}

export type BadgeShapeKind = "rectangle" | "circle" | "line";

export interface BadgeShapeObject extends BadgeObjectBase {
  type: "shape";
  shape: BadgeShapeKind;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  points?: number[]; // for "line"
}

export interface BadgeIconObject extends BadgeObjectBase {
  type: "icon";
  iconId: string;
  color: string;
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
    background: { type: "solid", value: "#0B3D36" },
    objects: [],
    effects: [],
    variables: [],
    metadata: { title },
  };
}
