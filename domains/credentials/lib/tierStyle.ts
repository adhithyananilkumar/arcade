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
    chip: "bg-[#FBF8F5] text-[#7A5A45] border-[#E6D6C8] dark:bg-[#3A2A1E] dark:text-[#E7C4A3] dark:border-[#6B4B33]",
    swatch: "bg-gradient-to-br from-[#DCC3AE] to-[#9C7A62]",
  },
  2: {
    chip: "bg-[#F5F7F9] text-[#4B5563] border-[#CBD2DA] dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600",
    swatch: "bg-gradient-to-br from-[#DDE1E6] to-[#6C7582]",
  },
  3: {
    chip: "bg-[#FBF7EC] text-[#7A5C1C] border-[#E6D29C] dark:bg-[#3A3018] dark:text-[#EBD28E] dark:border-[#6E5A27]",
    swatch: "bg-gradient-to-br from-[#E8CF8C] to-[#86651F]",
  },
};

/** Every level, lowest first. */
export const BADGE_LEVELS: readonly BadgeLevel[] = [1, 2, 3];
