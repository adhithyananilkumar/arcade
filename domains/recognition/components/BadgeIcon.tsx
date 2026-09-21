/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Recognition
 *
 * Purpose:
 * Renders a badge's icon from its stored name.
 *
 * Rules:
 * - A component declared once at module scope, rather than each caller doing
 *   `const Icon = resolveBadgeIcon(...)` inside its own render. The lookup
 *   returns a stable module constant either way, but assigning it to a
 *   capitalized local reads as "a component defined here", which is the thing
 *   that resets state when it is actually true.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

/* eslint-disable react-hooks/static-components -- see the note on the lookup below. */

import type { LucideProps } from 'lucide-react';
import { resolveBadgeIcon } from './badgeIconMap';

// `name` is omitted from the underlying props as well as `ref`: SVG elements have their own
// `name` attribute, and ours is the badge's icon key, which may be null for a badge that has none.
export interface BadgeIconProps extends Omit<LucideProps, 'ref' | 'name'> {
  /** The definition's kebab-case icon name. Unknown names fall back to a generic mark. */
  name?: string | null;
}

export function BadgeIcon({ name, ...props }: BadgeIconProps) {
  // Not a component created during render: `resolveBadgeIcon` is a lookup into a module-level
  // map of lucide components, so the identity is stable for a given name and nothing remounts.
  // Drawing an icon chosen by stored data needs a lookup somewhere; keeping it in this one
  // wrapper is what stops every caller from doing it in its own render.
  const Icon = resolveBadgeIcon(name);
  return <Icon {...props} />;
}
