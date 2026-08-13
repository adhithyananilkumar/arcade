/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Badges
 *
 * Public surface of the Badges domain.
 * ------------------------------------------------------------------
 */

export type {
  BadgeDocument,
  BadgeCanvas,
  BadgeBackground,
  BadgeObject,
  BadgeObjectType,
  BadgeTextObject,
  BadgeImageObject,
  BadgeShapeObject,
  BadgeShapeKind,
  BadgeIconObject,
  BadgeQrCodeObject,
  BadgeEffect,
  BadgeVariableBinding,
  BadgeVariableDeclaration,
  BadgeDocumentMetadata,
  BadgeShapeId,
} from "./types/badgeDocument.types";
export { BADGE_DOCUMENT_SCHEMA_VERSION, createEmptyBadgeDocument } from "./types/badgeDocument.types";

export type { BadgeShapeDefinition } from "./types/badgeShape.types";
export { ARCADE_HEX_SHAPE, getBadgeShapeDefinition } from "./types/badgeShape.types";

export { badgeDocumentSchema, parseBadgeDocument, BadgeDocumentValidationError } from "./lib/badgeDocumentSchema";
export { migrateBadgeDocument, BadgeDocumentMigrationError } from "./lib/migrations";

export { useBadgeEditor } from "./hooks/useBadgeEditor";
export type { BadgeEditorState, BadgeSaveState } from "./hooks/useBadgeEditor";
export { BadgeEditorWorkspace } from "./components/BadgeEditorWorkspace";
export { BadgeEditorContextPanel } from "./components/BadgePanels";
export * from "./api";
