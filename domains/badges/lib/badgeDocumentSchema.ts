/**
 * Zod runtime validation for BadgeDocument. This is the boundary
 * check applied whenever a document crosses a trust boundary:
 * loading from the API, importing an AI-generated document, or
 * accepting a Yjs sync payload. It must stay structurally in sync
 * with badgeDocument.types.ts — the zod schema is the runtime
 * mirror of those TypeScript types, not a separate source of truth.
 */
import { z } from "zod";
import { BADGE_DOCUMENT_SCHEMA_VERSION } from "../types/badgeDocument.types";

const objectBase = {
  id: z.string().min(1),
  name: z.string().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number().nonnegative(),
  height: z.number().nonnegative(),
  rotation: z.number(),
  opacity: z.number().min(0).max(1),
  visible: z.boolean(),
  locked: z.boolean(),
  zIndex: z.number().int(),
};

const variableBindingSchema = z.object({
  path: z.string().min(1),
  fallback: z.string(),
});

const textObjectSchema = z.object({
  ...objectBase,
  type: z.literal("text"),
  text: z.string(),
  binding: variableBindingSchema.optional(),
  fontFamily: z.string(),
  fontSize: z.number().positive(),
  fontWeight: z.number(),
  fontStyle: z.enum(["normal", "italic"]).optional(),
  color: z.string(),
  align: z.enum(["left", "center", "right"]),
  lineHeight: z.number().positive(),
  letterSpacing: z.number(),
  maxWidth: z.number().positive().optional(),
  wrap: z.boolean(),
});

const imageObjectSchema = z.object({
  ...objectBase,
  type: z.literal("image"),
  assetId: z.string().min(1),
  fit: z.enum(["cover", "contain", "fill"]),
  crop: z.object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() }).optional(),
});

const shapeObjectSchema = z.object({
  ...objectBase,
  type: z.literal("shape"),
  shape: z.enum(["rectangle", "circle", "line"]),
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().nonnegative().optional(),
  points: z.array(z.number()).optional(),
});

const iconObjectSchema = z.object({
  ...objectBase,
  type: z.literal("icon"),
  iconId: z.string().min(1),
  color: z.string(),
});

const qrCodeObjectSchema = z.object({
  ...objectBase,
  type: z.literal("qrcode"),
  valuePreview: z.string(),
  foreground: z.string(),
  background: z.string(),
});

const badgeObjectSchema = z.discriminatedUnion("type", [
  textObjectSchema,
  imageObjectSchema,
  shapeObjectSchema,
  iconObjectSchema,
  qrCodeObjectSchema,
]);

const backgroundSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("solid"), value: z.string() }),
  z.object({
    type: z.literal("gradient"),
    angle: z.number(),
    stops: z.array(z.object({ offset: z.number().min(0).max(1), color: z.string() })).min(2),
  }),
  z.object({ type: z.literal("image"), assetId: z.string().min(1), fit: z.enum(["cover", "contain", "fill"]) }),
]);

const effectSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["shimmer", "sparkles", "glow", "lightSweep", "floatingParticles", "aurora"]),
  intensity: z.number().min(0).max(1),
  speed: z.number().min(0),
  color: z.string().optional(),
});

const variableDeclarationSchema = z.object({
  path: z.string().min(1),
  label: z.string(),
  sampleValue: z.string(),
});

export const badgeDocumentSchema = z.object({
  schemaVersion: z.literal(BADGE_DOCUMENT_SCHEMA_VERSION),
  canvas: z.object({ width: z.number().positive(), height: z.number().positive() }),
  shape: z.object({ type: z.literal("ARCADE_HEX") }),
  background: backgroundSchema,
  objects: z.array(badgeObjectSchema),
  effects: z.array(effectSchema),
  variables: z.array(variableDeclarationSchema),
  metadata: z.object({ title: z.string(), description: z.string().optional() }),
});

export class BadgeDocumentValidationError extends Error {
  constructor(public issues: z.ZodIssue[]) {
    super(`Invalid BadgeDocument: ${issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
    this.name = "BadgeDocumentValidationError";
  }
}

export function parseBadgeDocument(input: unknown) {
  const result = badgeDocumentSchema.safeParse(input);
  if (!result.success) throw new BadgeDocumentValidationError(result.error.issues);
  return result.data;
}
