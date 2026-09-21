/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Recognition
 *
 * Purpose:
 * Resolves the backend's kebab-case icon name to a lucide component.
 *
 * Rules:
 * - An explicit map, not a dynamic import. The set of icons a badge may use is
 *   small and curated; pulling lucide's dynamic loader in would ship a runtime
 *   resolver and a network round trip to draw a 16px tick that is on screen
 *   the moment a profile renders.
 * - Unknown names fall back rather than throwing: a badge created by an
 *   administrator with an icon this build has never heard of must still
 *   render, just generically.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import {
  Award,
  BadgeCheck,
  Building2,
  Code,
  CodeXml,
  Crown,
  Flame,
  GitPullRequest,
  GraduationCap,
  Heart,
  type LucideIcon,
  Medal,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  'award': Award,
  'badge-check': BadgeCheck,
  'building-2': Building2,
  'code': Code,
  'code-xml': CodeXml,
  'crown': Crown,
  'flame': Flame,
  'git-pull-request': GitPullRequest,
  'graduation-cap': GraduationCap,
  'heart': Heart,
  'medal': Medal,
  'rocket': Rocket,
  'shield-check': ShieldCheck,
  'sparkles': Sparkles,
  'star': Star,
  'trophy': Trophy,
  'users': Users,
  'zap': Zap,
};

/** Every icon an administrator may pick when creating a custom badge. */
export const BADGE_ICON_NAMES = Object.keys(ICONS);

/**
 * The component for a stored icon name.
 *
 * <p>Every return value is a module-level constant from the map above, so the identity is stable
 * across renders — but prefer `BadgeIcon` at render time, which makes that obvious to the reader
 * and to the lint rule about components created during render.
 */
export function resolveBadgeIcon(name?: string | null): LucideIcon {
  if (!name) return BadgeCheck;
  return ICONS[name] ?? BadgeCheck;
}
