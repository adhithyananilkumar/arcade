/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Credentials
 *
 * Presentation-only styling per level, matching the tones in badgeArt. What a level MEANS comes
 * from the backend catalogue; this only says what colour it is.
 * ------------------------------------------------------------------
 */

import type { BadgeLevel } from "./badgeArt";

export interface TierStyle {
  /** Chip: background + text + border, light and dark. */
  chip: string;
  /** Solid swatch for bars and dots. */
  swatch: string;
}

export const TIER_STYLE: Record<BadgeLevel, TierStyle> = {
  1: {
    chip: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    swatch: "bg-[#64748B]",
  },
  2: {
    chip: "bg-blue-50 text-[#2962D6] border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
    swatch: "bg-[#2962D6]",
  },
  3: {
    chip: "bg-[#0E1A3D] text-white border-[#C8A24A]/70 dark:bg-[#0E1A3D] dark:text-white",
    swatch: "bg-[#0E1A3D]",
  },
};

/** Every level, lowest first. */
export const BADGE_LEVELS: readonly BadgeLevel[] = [1, 2, 3];
