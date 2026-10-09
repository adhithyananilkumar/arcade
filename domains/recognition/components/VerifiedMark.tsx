/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Recognition
 *
 * Purpose:
 * The verification tick: a flat scalloped rosette with a white check, in the
 * style people already read as "verified" (Instagram's). Used for every badge
 * in the VERIFICATION category — instructors, organizations, channels — so
 * the tick looks identical wherever it appears.
 *
 * Rules:
 * - Pure SVG, no effects. The tick's job is to be recognised instantly and to
 *   sit cleanly beside a name; glows and rings made it read as decoration.
 * - The colour comes from the badge (`accentColor`); the backend sets every
 *   verification badge to the same blue.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

const VIEW = 40;
const LOBES = 12;

/**
 * The rosette outline, computed once at module load: a circle whose radius ripples LOBES times
 * around it. Sampled densely enough that the straight segments are invisible at any size a badge
 * is drawn at.
 */
const ROSETTE_PATH = (() => {
  const c = VIEW / 2;
  const radius = 18.4;
  const ripple = 1.15;
  const steps = 240;
  const points: string[] = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = radius - ripple + ripple * Math.cos(LOBES * t);
    points.push(`${(c + r * Math.sin(t)).toFixed(2)} ${(c - r * Math.cos(t)).toFixed(2)}`);
  }
  return `M${points.join('L')}Z`;
})();

export interface VerifiedMarkProps {
  size?: number;
  color?: string;
  className?: string;
}

export function VerifiedMark({ size = 18, color = '#0095F6', className }: VerifiedMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d={ROSETTE_PATH} fill={color} />
      <path
        d="M12.6 20.8l5 5L27.6 15.4"
        fill="none"
        stroke="#ffffff"
        strokeWidth={3.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
