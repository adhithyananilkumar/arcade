/**
 * BadgeShapeDefinition — the single canonical source of the badge's
 * fixed outer geometry. The badge IS the canvas; the user never
 * resizes this boundary. Every consumer (editor clip mask, safe-area
 * guide overlay, export clip, learner-facing display) must read the
 * path data from here rather than re-deriving hex/shield coordinates
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
}

const HEX_R = 512;
const HEX_CX = 512;
const HEX_CY = 512;

function hexPath(radius: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 90);
    const x = HEX_CX + radius * Math.cos(angle);
    const y = HEX_CY + radius * Math.sin(angle);
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `${points.join(" ")} Z`;
}

export const ARCADE_HEX_SHAPE: BadgeShapeDefinition = {
  id: "ARCADE_HEX",
  name: "Arcade Hexagon",
  width: 1024,
  height: 1024,
  outerGeometry: hexPath(HEX_R),
  clipGeometry: hexPath(HEX_R - 8),
  safeArea: hexPath(HEX_R * 0.82),
  bleedArea: hexPath(HEX_R),
  borderGeometry: hexPath(HEX_R - 4),
};

const BADGE_SHAPES: Record<BadgeShapeId, BadgeShapeDefinition> = {
  ARCADE_HEX: ARCADE_HEX_SHAPE,
};

export function getBadgeShapeDefinition(id: BadgeShapeId): BadgeShapeDefinition {
  const shape = BADGE_SHAPES[id];
  if (!shape) throw new Error(`Unknown badge shape: ${id}`);
  return shape;
}
