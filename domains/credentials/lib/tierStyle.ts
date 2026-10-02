/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Credentials
 *
 * Presentation-only styling per level, matching the bronze / silver / gold metals in badgeArt. What a level MEANS comes
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
    chip: "bg-slate-50 text-[#7A5A45] border-[#E6D6C8] dark:text-[#d3af98] dark:border-[#e6d6c8]/30",
    swatch: "bg-gradient-to-br from-[#DCC3AE] to-[#9C7A62] dark:from-slate-300",
  },
  2: {
    chip: "bg-slate-100 text-slate-600 border-slate-300",
    swatch: "bg-gradient-to-br from-slate-200 to-slate-500",
  },
  3: {
    chip: "bg-slate-50 text-[#7A5C1C] border-[#E6D29C] dark:text-[#EBD28E] dark:border-[#6E5A27]",
    swatch: "bg-gradient-to-br from-[#E8CF8C] to-[#86651F] dark:from-[#e8cf8c]/15",
  },
};

/** Every level, lowest first. */
export const BADGE_LEVELS: readonly BadgeLevel[] = [1, 2, 3];
