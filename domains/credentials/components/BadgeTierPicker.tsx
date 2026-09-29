/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Credentials
 *
 * Choosing which platform level a piece of content awards — the whole of a creator's say over its
 * badge. Pure: the levels come from the backend catalogue, the choice goes back through onChange.
 * ------------------------------------------------------------------
 */

import { cn } from "@/shared/utils/utils";
import { CredentialBadge } from "./CredentialBadge";
import type { BadgeFamilyKey, BadgeLevel } from "../lib/badgeArt";
import type { BadgeTierInfo } from "../types/credential.types";

export interface BadgeTierPickerProps {
  family: BadgeFamilyKey;
  tiers: BadgeTierInfo[];
  value: number | null;
  onChange: (level: BadgeLevel) => void;
  /** Printed on each option's badge, so the creator sees exactly what learners receive. */
  contentTitle?: string;
  disabled?: boolean;
}

export function BadgeTierPicker({ family, tiers, value, onChange, contentTitle, disabled }: BadgeTierPickerProps) {
  const ordered = [...tiers].sort((a, b) => a.level - b.level);
  return (
    <div role="radiogroup" aria-label="Badge level" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {ordered.map((tier) => {
        const level = tier.level as BadgeLevel;
        const selected = value === level;
        return (
          <button
            key={tier.level}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(level)}
            className={cn(
              "flex flex-col items-center rounded-2xl border bg-white px-3 pb-4 pt-3 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2962D6] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900",
              selected
                ? "border-[#2962D6] shadow-sm ring-1 ring-[#2962D6]"
                : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
            )}
          >
            <div className="w-24">
              <CredentialBadge family={family} level={level} title={contentTitle} />
            </div>
            <span className="mt-2 flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
              <span
                aria-hidden
                className={cn(
                  "flex h-3.5 w-3.5 items-center justify-center rounded-full border-2",
                  selected ? "border-[#2962D6]" : "border-slate-300 dark:border-slate-600"
                )}
              >
                {selected && <span className="h-1.5 w-1.5 rounded-full bg-[#2962D6]" />}
              </span>
              {tier.label}
            </span>
            <p className="mt-1 text-xs leading-snug text-slate-600 dark:text-slate-400">{tier.meaning}</p>
            <p className="mt-1 text-[11px] leading-snug text-slate-400">{tier.guidance}</p>
          </button>
        );
      })}
    </div>
  );
}
