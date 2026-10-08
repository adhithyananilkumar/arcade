/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Credentials
 *
 * Presentation-only styling per level, matching the metals in badgeArt: bronze, silver, gold,
 * platinum-and-sapphire (Expert) and platinum-and-violet (Distinguished). What a level MEANS comes
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
  4: {
    chip: "bg-slate-50 text-[#1F4FB5] border-[#AFC0D8] dark:text-[#9CC2FF] dark:border-[#3B74E0]/50",
    swatch: "bg-gradient-to-br from-[#EEF2F7] via-[#5B8FE8] to-[#0E2A6B]",
  },
  5: {
    chip: "bg-[#211A3D] text-[#F0D28A] border-[#C7C0D6] dark:bg-[#211A3D]",
    swatch: "bg-gradient-to-br from-[#F3F0F8] via-[#211A3D] to-[#C9993A]",
  },
};

/** Every level, lowest first. */
export const BADGE_LEVELS: readonly BadgeLevel[] = [1, 2, 3, 4, 5];
