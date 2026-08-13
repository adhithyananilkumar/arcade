/**
 * BadgeShapeDefinition — the single canonical source of the badge's
 * fixed outer geometry. The badge IS the canvas; the user never
 * resizes this boundary. Every consumer (editor clip mask, safe-area
 * guide overlay, export clip, learner-facing display) must read the
 * path data from here rather than re-deriving shield coordinates
 * locally.
 *
 * Paths are expressed as SVG path `d` strings in the badge's logical
 * canvas space (see BadgeCanvas, currently 1024x1024) so they can be
 * consumed directly as an SVG <clipPath>, parsed into a Konva
 * clipFunc via Path2D, or rendered as a static SVG for the learner-
 * facing verification page — all from one definition.
 */

import type { BadgeShapeId } from "./badgeDocument.types";

export interface BadgeShapeDefinition {
  id: BadgeShapeId;
  name: string;
  width: number;
  height: number;
  /** Outer visible silhouette of the badge. */
  outerGeometry: string;
  /** Clip path applied to background/content layers; equals outerGeometry unless a border inset is needed. */
  clipGeometry: string;
  /** Editor-only guide. Important content should stay inside this region. */
  safeArea: string;
  /** Optional area backgrounds/effects may extend into beyond the safe area, up to the badge boundary. */
  bleedArea: string;
  /** Decorative border stroke path, rendered above content. */
  borderGeometry: string;
  /** A second, slightly-inset border path — used when BadgeBorderConfig.inner is on. */
  innerBorderGeometry: string;
  /** width / height of the shape itself (not the 1024x1024 canvas it sits on). */
  aspectRatio: number;
}

const CX = 512;
const CY = 512;

/**
 * Six-point elongated shield: a pointed top and bottom apex with long, straight
 * vertical sides in between — a credential/shield silhouette, not a regular
 * hexagon (whose six sides are all equal). `cornerFraction` controls how much
 * of the half-height the angled top/bottom sections occupy before the straight
 * vertical edge begins; the reference badge reads as tall and shield-like at
 * roughly 0.28 (the vertical sides are clearly the dominant edge, not the
 * points).
 */
function shieldPath(halfWidth: number, halfHeight: number, cornerFraction: number): string {
  const cornerHeight = halfHeight * cornerFraction;
  const points: Array<[number, number]> = [
    [CX, CY - halfHeight], // top apex
    [CX + halfWidth, CY - halfHeight + cornerHeight], // upper right
    [CX + halfWidth, CY + halfHeight - cornerHeight], // lower right
    [CX, CY + halfHeight], // bottom apex
    [CX - halfWidth, CY + halfHeight - cornerHeight], // lower left
    [CX - halfWidth, CY - halfHeight + cornerHeight], // upper left
  ];
  return points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ") + " Z";
}

const SHIELD_ASPECT_RATIO = 0.82; // width / height — tall, credential-like proportion
const SHIELD_CORNER_FRACTION = 0.28;
const HALF_HEIGHT = 500;
const HALF_WIDTH = HALF_HEIGHT * SHIELD_ASPECT_RATIO;

export const ARCADE_HEX_SHAPE: BadgeShapeDefinition = {
  id: "ARCADE_HEX",
  name: "Arcade Shield",
  width: 1024,
  height: 1024,
  aspectRatio: SHIELD_ASPECT_RATIO,
  outerGeometry: shieldPath(HALF_WIDTH, HALF_HEIGHT, SHIELD_CORNER_FRACTION),
  clipGeometry: shieldPath(HALF_WIDTH - 8, HALF_HEIGHT - 8, SHIELD_CORNER_FRACTION),
  safeArea: shieldPath(HALF_WIDTH * 0.8, HALF_HEIGHT * 0.8, SHIELD_CORNER_FRACTION),
  bleedArea: shieldPath(HALF_WIDTH, HALF_HEIGHT, SHIELD_CORNER_FRACTION),
  borderGeometry: shieldPath(HALF_WIDTH - 4, HALF_HEIGHT - 4, SHIELD_CORNER_FRACTION),
  innerBorderGeometry: shieldPath(HALF_WIDTH - 20, HALF_HEIGHT - 20, SHIELD_CORNER_FRACTION),
};

const BADGE_SHAPES: Record<BadgeShapeId, BadgeShapeDefinition> = {
  ARCADE_HEX: ARCADE_HEX_SHAPE,
};

export function getBadgeShapeDefinition(id: BadgeShapeId): BadgeShapeDefinition {
  const shape = BADGE_SHAPES[id];
  if (!shape) throw new Error(`Unknown badge shape: ${id}`);
  return shape;
}
