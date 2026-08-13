/**
 * BadgeDocument schema migration chain. A stored document's
 * schemaVersion may lag the current BADGE_DOCUMENT_SCHEMA_VERSION —
 * this is expected for historical, published BadgeDesignVersions,
 * which must remain renderable forever (see §33/§34 of the badge
 * editor spec: an IssuedBadge's provenance must not silently
 * reinterpret an old document structure).
 *
 * Each migration is a pure function from version N to N+1. Adding a
 * new schema version means adding one entry here, never mutating an
 * existing one.
 */
import { BADGE_DOCUMENT_SCHEMA_VERSION, DEFAULT_BADGE_BORDER, type BadgeDocument } from "../types/badgeDocument.types";
import { parseBadgeDocument, BadgeDocumentValidationError } from "./badgeDocumentSchema";

type Migration = (doc: Record<string, unknown>) => Record<string, unknown>;

/**
 * v1 -> v2: adds `border` (defaulted to DEFAULT_BADGE_BORDER — a visible but
 * unobtrusive border, matching what the badge looked like implicitly before
 * this field existed) and renames image-bearing fields from `assetId` to
 * `src`, since the actual resolved value has always been a public URL (see
 * MediaAsset's own convention) — `assetId` was a v1 naming mismatch, not a
 * different value.
 */
function migrateV1ToV2(doc: Record<string, unknown>): Record<string, unknown> {
  const migrateImageLike = (value: unknown): unknown => {
    if (typeof value !== "object" || value === null) return value;
    const v = value as Record<string, unknown>;
    if (v.type === "image" && typeof v.assetId === "string" && typeof v.src !== "string") {
      const { assetId, ...rest } = v;
      return { ...rest, src: assetId };
    }
    return v;
  };

  const objects = Array.isArray(doc.objects) ? doc.objects.map(migrateImageLike) : [];
  const background = migrateImageLike(doc.background) ?? doc.background;

  return {
    ...doc,
    schemaVersion: 2,
    objects,
    background,
    border: doc.border ?? DEFAULT_BADGE_BORDER,
  };
}

// Keyed by the version being migrated FROM.
const MIGRATIONS: Record<number, Migration> = {
  1: migrateV1ToV2,
};

export class BadgeDocumentMigrationError extends Error {}

export function migrateBadgeDocument(raw: unknown): BadgeDocument {
  if (typeof raw !== "object" || raw === null) {
    throw new BadgeDocumentMigrationError("BadgeDocument payload must be an object");
  }
  let doc = raw as Record<string, unknown>;
  let version = typeof doc.schemaVersion === "number" ? doc.schemaVersion : 0;

  if (version > BADGE_DOCUMENT_SCHEMA_VERSION) {
    throw new BadgeDocumentMigrationError(
      `Document schemaVersion ${version} is newer than this build supports (${BADGE_DOCUMENT_SCHEMA_VERSION}). Refusing to downgrade.`
    );
  }

  while (version < BADGE_DOCUMENT_SCHEMA_VERSION) {
    const step = MIGRATIONS[version];
    if (!step) {
      throw new BadgeDocumentMigrationError(`No migration registered from schemaVersion ${version}`);
    }
    doc = step(doc);
    version = (doc.schemaVersion as number) ?? version + 1;
  }

  try {
    return parseBadgeDocument(doc);
  } catch (err) {
    if (err instanceof BadgeDocumentValidationError) {
      throw new BadgeDocumentMigrationError(`Migrated document failed validation: ${err.message}`);
    }
    throw err;
  }
}
