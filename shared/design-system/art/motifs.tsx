import React from 'react';
import type { ArtThemeKey } from './themes';

/**
 * The drawn subjects of generated artwork, five per theme. Each is a line illustration in Arcade's
 * style — ink outline (#14142b in light, theme-aware via ContentArt), flat fills from the palette — drawn centred on (0, 0) inside a
 * 100 × 100 box so any composition can place, scale and rotate it.
 */

export interface MotifPaint {
  ink: string;
  main: string;
  accent: string;
  spark: string;
  soft: string;
  paper: string;
  /** Exams draw outline-only; fills become the paper colour. */
  outline?: boolean;
  /** Screen colour for the terminal motif; paper when absent. */
  deepInk?: string;
  /** Multiplies every stroke width; below 1 gives the lighter, minimal line. */
  weight?: number;
  /**
   * When set, fills become pale tints of their colour (this share of the colour, the rest white)
   * instead of the flat colour — the quiet, blended look used on cards.
   */
  tint?: number;
}

export type Motif = (p: MotifPaint) => React.ReactElement;

const line = (p: MotifPaint, w = 3.5) => ({
  stroke: p.ink,
  strokeWidth: w * (p.weight ?? 1),
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});
const fill = (p: MotifPaint, c: string) => {
  if (p.outline) return p.paper;
  if (p.tint !== undefined && c !== p.paper) {
    // Ink fills (the vinyl disc) would be the one heavy shape left; keep them a whisper.
    const share = c === p.ink ? Math.min(p.tint, 0.14) : p.tint;
    return `color-mix(in srgb, ${c} ${Math.round(share * 100)}%, var(--a-white, white))`;
  }
  return c;
};

// ── AI ─────────────────────────────────────────────────────────────────────────

const chip: Motif = (p) => (
  <g>
    {[-24, -8, 8, 24].map((v) => (
      <g key={v} {...line(p, 3)}>
        <path d={`M${v} -46 V-34 M${v} 34 V46 M-46 ${v} H-34 M34 ${v} H46`} />
      </g>
    ))}
    <rect x={-34} y={-34} width={68} height={68} rx={10} fill={fill(p, p.paper)} {...line(p)} />
    <rect x={-20} y={-20} width={40} height={40} rx={6} fill={fill(p, p.soft)} {...line(p, 3)} />
    <path d="M0 -12 L12 0 L0 12 L-12 0 Z" fill={fill(p, p.main)} {...line(p, 3)} />
    <circle cx={0} cy={0} r={3} fill={p.spark} />
    <circle cx={-27} cy={-27} r={2.5} fill={p.spark} />
  </g>
);
const neuralNet: Motif = (p) => {
  const layers = [[-36, [-24, 0, 24]], [0, [-34, -11, 11, 34]], [36, [-14, 14]]] as const;
  const nodes = layers.flatMap(([x, ys]) => ys.map((y) => [x, y] as const));
  return (
    <g>
      {layers.slice(0, -1).map(([x, ys], i) =>
        ys.map((y) => layers[i + 1][1].map((y2) => (
          <line key={`${x}${y}${y2}`} x1={x} y1={y} x2={layers[i + 1][0]} y2={y2} stroke={p.ink} strokeWidth={1.6 * (p.weight ?? 1)} opacity={0.55} />
        )))
      )}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={8} fill={fill(p, i % 3 === 0 ? p.main : i % 3 === 1 ? p.soft : p.accent)} {...line(p, 3)} />
      ))}
    </g>
  );
};
const brain: Motif = (p) => (
  <g>
    <path d="M-4 -38 C-22 -42 -38 -30 -36 -14 C-46 -6 -44 12 -32 18 C-32 32 -16 40 -4 34 Z" fill={fill(p, p.soft)} {...line(p)} />
    <path d="M4 -38 C22 -42 38 -30 36 -14 C46 -6 44 12 32 18 C32 32 16 40 4 34 Z" fill={fill(p, p.main)} {...line(p)} />
    <path d="M-22 -18 C-14 -14 -14 -4 -22 2 M-20 18 C-12 14 -8 20 -10 26 M20 -20 C12 -14 14 -6 22 -2 M18 14 C24 18 22 26 16 28" fill="none" {...line(p, 2.6)} />
    <circle cx={0} cy={-44} r={4} fill={p.spark} />
  </g>
);
const sparkle: Motif = (p) => (
  <g>
    <path d="M0 -44 C4 -14 14 -4 44 0 C14 4 4 14 0 44 C-4 14 -14 4 -44 0 C-14 -4 -4 -14 0 -44 Z" fill={fill(p, p.main)} {...line(p)} />
    <path d="M30 -38 C31 -32 34 -29 40 -28 C34 -27 31 -24 30 -18 C29 -24 26 -27 20 -28 C26 -29 29 -32 30 -38 Z" fill={fill(p, p.spark)} {...line(p, 2.4)} />
    <path d="M-30 22 C-29 27 -27 29 -22 30 C-27 31 -29 33 -30 38 C-31 33 -33 31 -38 30 C-33 29 -31 27 -30 22 Z" fill={fill(p, p.accent)} {...line(p, 2.4)} />
  </g>
);
const chatBot: Motif = (p) => (
  <g>
    <path d="M-40 -30 H40 A8 8 0 0 1 48 -22 V14 A8 8 0 0 1 40 22 H-6 L-22 38 V22 H-40 A8 8 0 0 1 -48 14 V-22 A8 8 0 0 1 -40 -30 Z" fill={fill(p, p.paper)} {...line(p)} />
    {[-20, 0, 20].map((x, i) => (
      <circle key={x} cx={x} cy={-4} r={6} fill={fill(p, [p.main, p.accent, p.spark][i])} {...line(p, 2.6)} />
    ))}
  </g>
);

// ── Programming ───────────────────────────────────────────────────────────────

const brackets: Motif = (p) => (
  <g>
    <rect x={-46} y={-36} width={92} height={72} rx={12} fill={fill(p, p.soft)} {...line(p)} />
    <path d="M-16 -14 L-30 0 L-16 14 M16 -14 L30 0 L16 14" fill="none" {...line(p, 4.5)} />
    <path d="M6 -20 L-6 20" fill="none" stroke={p.outline ? p.ink : p.main} strokeWidth={4.5 * (p.weight ?? 1)} strokeLinecap="round" />
  </g>
);
const terminal: Motif = (p) => (
  <g>
    <rect x={-48} y={-36} width={96} height={72} rx={9} fill={fill(p, p.deepInk ?? p.paper)} {...line(p)} />
    <path d="M-48 -22 H48" {...line(p, 3)} />
    {[-40, -32, -24].map((x, i) => <circle key={x} cx={x} cy={-29} r={2.6} fill={[p.spark, p.accent, p.main][i]} />)}
    <path d="M-36 -6 L-26 2 L-36 10" fill="none" {...line(p, 3.5)} stroke={p.outline ? p.ink : p.main} />
    <path d="M-18 12 H4" {...line(p, 3.5)} stroke={p.outline ? p.ink : p.accent} />
    <path d="M-36 24 H24" {...line(p, 2.4)} opacity={0.5} />
  </g>
);
const browser: Motif = (p) => (
  <g>
    <rect x={-48} y={-38} width={96} height={76} rx={9} fill={fill(p, p.paper)} {...line(p)} />
    <path d="M-48 -24 H48" {...line(p, 3)} />
    <rect x={-20} y={-34} width={52} height={6} rx={3} fill={fill(p, p.soft)} />
    <rect x={-38} y={-14} width={34} height={24} rx={4} fill={fill(p, p.main)} {...line(p, 2.6)} />
    <path d="M6 -12 H38 M6 -2 H30 M6 8 H34" {...line(p, 2.8)} />
    <rect x={-38} y={18} width={76} height={10} rx={4} fill={fill(p, p.soft)} {...line(p, 2.4)} />
  </g>
);
const gitBranch: Motif = (p) => (
  <g>
    <path d="M-24 -36 V36 M-24 -4 C-24 -20 24 -18 24 -32" fill="none" {...line(p, 4)} />
    <path d="M-24 14 C-24 2 22 4 22 18" fill="none" {...line(p, 4)} />
    {[[-24, -36, p.main], [-24, 36, p.main], [24, -32, p.accent], [22, 18, p.spark]].map(([x, y, c], i) => (
      <circle key={i} cx={x as number} cy={y as number} r={9} fill={fill(p, c as string)} {...line(p, 3)} />
    ))}
  </g>
);
const cursorBraces: Motif = (p) => (
  <g>
    <path d="M-14 -38 C-28 -38 -24 -16 -26 -8 C-27 -2 -34 0 -38 0 C-34 0 -27 2 -26 8 C-24 16 -28 38 -14 38" fill="none" {...line(p, 4.5)} />
    <path d="M14 -38 C28 -38 24 -16 26 -8 C27 -2 34 0 38 0 C34 0 27 2 26 8 C24 16 28 38 14 38" fill="none" {...line(p, 4.5)} />
    <rect x={-8} y={-16} width={16} height={32} rx={3} fill={fill(p, p.main)} {...line(p, 2.6)} />
  </g>
);

// ── Data ─────────────────────────────────────────────────────────────────────

const barChart: Motif = (p) => (
  <g>
    <path d="M-44 40 H44 M-44 40 V-44" fill="none" {...line(p)} />
    {[[-32, 22, p.soft], [-14, 44, p.main], [4, 30, p.accent], [22, 62, p.main]].map(([x, h, c], i) => (
      <rect key={i} x={x as number} y={40 - (h as number)} width={14} height={h as number} rx={3} fill={fill(p, c as string)} {...line(p, 3)} />
    ))}
    <path d="M-26 6 L-6 -14 L12 -2 L32 -32" fill="none" stroke={p.spark} strokeWidth={3.5 * (p.weight ?? 1)} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={32} cy={-32} r={4} fill={p.spark} />
  </g>
);
const pieChart: Motif = (p) => (
  <g>
    <circle cx={-2} cy={2} r={38} fill={fill(p, p.soft)} {...line(p)} />
    <path d="M-2 2 L-2 -36 A38 38 0 0 1 34 14 Z" fill={fill(p, p.main)} {...line(p, 3)} />
    <path d="M6 -6 L6 -44 A38 38 0 0 1 42 -18 Z" fill={fill(p, p.spark)} {...line(p, 3)} transform="translate(4 -2)" />
    <path d="M-2 2 L34 14 A38 38 0 0 1 4 40 Z" fill={fill(p, p.accent)} {...line(p, 3)} />
  </g>
);
const database: Motif = (p) => (
  <g>
    {[16, -4, -24].map((y, i) => (
      <g key={y}>
        <path d={`M-34 ${y} V${y + 20} A34 10 0 0 0 34 ${y + 20} V${y}`} fill={fill(p, [p.main, p.soft, p.paper][i])} {...line(p)} />
        <ellipse cx={0} cy={y} rx={34} ry={10} fill={fill(p, [p.main, p.soft, p.paper][i])} {...line(p)} />
      </g>
    ))}
    <circle cx={24} cy={30} r={3} fill={p.spark} />
  </g>
);
const scatter: Motif = (p) => (
  <g>
    <rect x={-46} y={-40} width={92} height={80} rx={8} fill={fill(p, p.paper)} {...line(p)} />
    <path d="M-34 28 L34 -28" stroke={p.outline ? p.ink : p.accent} strokeWidth={3 * (p.weight ?? 1)} strokeDasharray="6 6" strokeLinecap="round" />
    {[[-26, 14], [-20, 24], [-10, 6], [-2, 12], [6, -4], [14, -2], [20, -18], [28, -12], [-14, -12], [24, 10]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={4.5} fill={fill(p, i % 4 === 0 ? p.spark : p.main)} stroke={p.ink} strokeWidth={1.8 * (p.weight ?? 1)} />
    ))}
  </g>
);
const tableGrid: Motif = (p) => (
  <g>
    <rect x={-46} y={-36} width={92} height={72} rx={8} fill={fill(p, p.paper)} {...line(p)} />
    <rect x={-46} y={-36} width={92} height={16} rx={8} fill={fill(p, p.main)} {...line(p, 3)} />
    <path d="M-46 -2 H46 M-46 16 H46 M-16 -20 V36 M14 -20 V36" {...line(p, 2.4)} />
    <rect x={18} y={2} width={24} height={10} rx={3} fill={fill(p, p.spark)} />
  </g>
);

// ── Security ──────────────────────────────────────────────────────────────────

const shield: Motif = (p) => (
  <g>
    <path d="M0 -46 L38 -32 V-2 C38 22 20 38 0 46 C-20 38 -38 22 -38 -2 V-32 Z" fill={fill(p, p.main)} {...line(p)} />
    <path d="M0 -34 L28 -24 V-2 C28 16 15 28 0 34 Z" fill={fill(p, p.soft)} opacity={0.6} />
    <path d="M-16 0 L-4 12 L18 -12" fill="none" stroke={p.outline || p.tint !== undefined ? p.ink : p.paper} strokeWidth={6 * (p.weight ?? 1)} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
const padlock: Motif = (p) => (
  <g>
    <path d="M-22 -8 V-22 A22 22 0 0 1 22 -22 V-8" fill="none" {...line(p, 5)} />
    <rect x={-36} y={-8} width={72} height={54} rx={10} fill={fill(p, p.main)} {...line(p)} />
    <circle cx={0} cy={14} r={7} fill={fill(p, p.paper)} {...line(p, 3)} />
    <path d="M0 21 V32" {...line(p, 4)} />
  </g>
);
const key: Motif = (p) => (
  <g transform="rotate(-35)">
    <circle cx={-26} cy={0} r={18} fill={fill(p, p.spark)} {...line(p)} />
    <circle cx={-26} cy={0} r={6} fill={fill(p, p.paper)} {...line(p, 3)} />
    <path d="M-8 0 H44 M28 0 V12 M38 0 V10" fill="none" {...line(p, 4.5)} />
  </g>
);
const fingerprint: Motif = (p) => (
  <g fill="none">
    <circle cx={0} cy={0} r={46} fill={fill(p, p.soft)} stroke="none" />
    {[34, 26, 18, 10].map((r, i) => (
      <path key={r} d={`M${-r} ${8 + i * 2} A${r} ${r + 4} 0 0 1 ${r} ${4 + i * 2}`} {...line(p, 3)} stroke={i === 1 ? (p.outline ? p.ink : p.main) : p.ink} />
    ))}
    <path d="M0 -2 V22 M-24 22 C-22 30 -16 36 -10 38 M24 18 C22 28 18 34 12 38" {...line(p, 3)} />
  </g>
);
const scanEye: Motif = (p) => (
  <g>
    <path d="M-44 -26 V-40 H-30 M30 -40 H44 V-26 M44 26 V40 H30 M-30 40 H-44 V26" fill="none" {...line(p, 4)} />
    <path d="M-34 0 C-18 -22 18 -22 34 0 C18 22 -18 22 -34 0 Z" fill={fill(p, p.paper)} {...line(p)} />
    <circle cx={0} cy={0} r={11} fill={fill(p, p.main)} {...line(p, 3)} />
    <path d="M-44 0 H44" stroke={p.spark} strokeWidth={2.4 * (p.weight ?? 1)} strokeDasharray="4 4" />
  </g>
);

// ── Cloud & DevOps ────────────────────────────────────────────────────────────

const cloud: Motif = (p) => (
  <g>
    <path d="M-30 24 A20 20 0 0 1 -28 -14 A26 26 0 0 1 20 -22 A22 22 0 0 1 34 24 Z" fill={fill(p, p.soft)} {...line(p)} />
    <path d="M-10 10 V-8 M-16 -2 L-10 -8 L-4 -2 M10 -6 V12 M4 6 L10 12 L16 6" fill="none" stroke={p.outline ? p.ink : p.main} strokeWidth={3.6 * (p.weight ?? 1)} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
const serverRack: Motif = (p) => (
  <g>
    {[-38, -12, 14].map((y, i) => (
      <g key={y}>
        <rect x={-36} y={y} width={72} height={22} rx={5} fill={fill(p, i === 1 ? p.main : p.paper)} {...line(p)} />
        <circle cx={-24} cy={y + 11} r={3} fill={i === 1 && p.tint === undefined ? p.paper : p.spark} />
        <path d={`M4 ${y + 11} H26`} {...line(p, 3)} stroke={i === 1 && p.tint === undefined ? p.paper : p.ink} />
      </g>
    ))}
  </g>
);
const containers: Motif = (p) => (
  <g>
    {[[-40, 8, p.main], [-4, 8, p.accent], [-22, -24, p.soft], [14, -24, p.spark]].map(([x, y, c], i) => (
      <g key={i}>
        <rect x={x as number} y={y as number} width={34} height={28} rx={4} fill={fill(p, c as string)} {...line(p, 3)} />
        <path d={`M${(x as number) + 9} ${(y as number) + 5} V${(y as number) + 23} M${(x as number) + 17} ${(y as number) + 5} V${(y as number) + 23} M${(x as number) + 25} ${(y as number) + 5} V${(y as number) + 23}`} {...line(p, 2)} opacity={0.6} />
      </g>
    ))}
    <path d="M-46 38 Q0 50 46 38" fill="none" {...line(p, 3)} />
  </g>
);
const gear: Motif = (p) => {
  const teeth = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <g>
      {teeth.map((a) => (
        <rect key={a} x={-7} y={-44} width={14} height={16} rx={3} fill={fill(p, p.main)} {...line(p, 3)} transform={`rotate(${a})`} />
      ))}
      <circle cx={0} cy={0} r={32} fill={fill(p, p.main)} {...line(p)} />
      <circle cx={0} cy={0} r={12} fill={fill(p, p.paper)} {...line(p, 3)} />
    </g>
  );
};
const globeNet: Motif = (p) => (
  <g>
    <circle cx={0} cy={0} r={38} fill={fill(p, p.soft)} {...line(p)} />
    <ellipse cx={0} cy={0} rx={16} ry={38} fill="none" {...line(p, 2.6)} />
    <path d="M-38 0 H38 M-33 -18 H33 M-33 18 H33" fill="none" {...line(p, 2.6)} />
    {[[30, -30], [-34, 26], [36, 24]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={6} fill={fill(p, i === 0 ? p.spark : p.main)} {...line(p, 2.6)} />
    ))}
  </g>
);

// ── Design ────────────────────────────────────────────────────────────────────

const penNib: Motif = (p) => (
  <g>
    <path d="M0 -46 L26 -6 L12 38 H-12 L-26 -6 Z" fill={fill(p, p.main)} {...line(p)} />
    <path d="M0 -46 V8" {...line(p, 3)} />
    <circle cx={0} cy={12} r={6} fill={fill(p, p.paper)} {...line(p, 3)} />
    <rect x={-14} y={38} width={28} height={8} rx={2} fill={fill(p, p.spark)} {...line(p, 3)} />
  </g>
);
const palette: Motif = (p) => (
  <g>
    <path d="M2 -40 C30 -40 46 -20 44 0 C42 16 26 14 22 22 C18 32 30 40 10 42 C-22 44 -46 24 -44 -2 C-42 -24 -22 -40 2 -40 Z" fill={fill(p, p.paper)} {...line(p)} />
    {[[-22, -16, p.main], [0, -26, p.accent], [22, -16, p.spark], [-26, 10, p.soft]].map(([x, y, c], i) => (
      <circle key={i} cx={x as number} cy={y as number} r={8} fill={fill(p, c as string)} {...line(p, 2.6)} />
    ))}
    <circle cx={4} cy={22} r={7} fill={fill(p, p.paper)} {...line(p, 3)} />
  </g>
);
const layers: Motif = (p) => (
  <g>
    {[[20, p.soft], [4, p.accent], [-12, p.main]].map(([y, c], i) => (
      <path key={i} d={`M0 ${(y as number) - 22} L44 ${y} L0 ${(y as number) + 22} L-44 ${y} Z`} fill={fill(p, c as string)} {...line(p)} />
    ))}
  </g>
);
const bezier: Motif = (p) => (
  <g>
    <path d="M-40 26 C-30 -40 30 40 40 -26" fill="none" stroke={p.outline ? p.ink : p.main} strokeWidth={5 * (p.weight ?? 1)} strokeLinecap="round" />
    <path d="M-40 26 L-30 -40 M40 -26 L30 40" stroke={p.ink} strokeWidth={2 * (p.weight ?? 1)} strokeDasharray="4 4" />
    {[[-40, 26], [40, -26]].map(([x, y], i) => <rect key={i} x={x - 6} y={y - 6} width={12} height={12} fill={fill(p, p.paper)} {...line(p, 2.6)} />)}
    {[[-30, -40], [30, 40]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={6} fill={fill(p, p.spark)} {...line(p, 2.6)} />)}
  </g>
);
const setSquare: Motif = (p) => (
  <g>
    <path d="M-40 36 L-40 -40 L36 36 Z" fill={fill(p, p.soft)} {...line(p)} />
    <path d="M-28 24 L-28 -12 L8 24 Z" fill={fill(p, p.paper)} {...line(p, 3)} />
    <rect x={-6} y={-46} width={14} height={78} rx={3} fill={fill(p, p.main)} {...line(p, 3)} transform="rotate(38)" />
  </g>
);

// ── Business ──────────────────────────────────────────────────────────────────

const briefcase: Motif = (p) => (
  <g>
    <path d="M-14 -24 V-34 H14 V-24" fill="none" {...line(p)} />
    <rect x={-44} y={-24} width={88} height={60} rx={9} fill={fill(p, p.main)} {...line(p)} />
    <path d="M-44 -2 H44" {...line(p, 3)} />
    <rect x={-8} y={-8} width={16} height={12} rx={2} fill={fill(p, p.spark)} {...line(p, 3)} />
  </g>
);
const growth: Motif = (p) => (
  <g>
    {[[-38, 18], [-16, 4], [6, -12], [28, -30]].map(([x, h], i) => (
      <rect key={i} x={x} y={38 - (40 - h)} width={16} height={40 - h} rx={3} fill={fill(p, i === 3 ? p.main : p.soft)} {...line(p, 3)} />
    ))}
    <path d="M-40 6 L-12 -14 L6 -6 L38 -38" fill="none" stroke={p.outline ? p.ink : p.spark} strokeWidth={4.5 * (p.weight ?? 1)} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24 -40 H40 V-24" fill="none" stroke={p.outline ? p.ink : p.spark} strokeWidth={4.5 * (p.weight ?? 1)} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
const target: Motif = (p) => (
  <g>
    {[40, 28, 16].map((r, i) => <circle key={r} cx={-4} cy={4} r={r} fill={fill(p, [p.paper, p.main, p.paper][i])} {...line(p)} />)}
    <circle cx={-4} cy={4} r={6} fill={fill(p, p.spark)} />
    <path d="M-4 4 L36 -36 M28 -42 L36 -36 L42 -28" fill="none" {...line(p, 4)} />
  </g>
);
const orgChart: Motif = (p) => (
  <g>
    <path d="M0 -20 V-6 M-30 -6 H30 M-30 -6 V8 M0 -6 V8 M30 -6 V8" fill="none" {...line(p, 3)} />
    <rect x={-16} y={-44} width={32} height={24} rx={6} fill={fill(p, p.main)} {...line(p)} />
    {[-30, 0, 30].map((x, i) => <rect key={x} x={x - 12} y={8} width={24} height={20} rx={5} fill={fill(p, i === 1 ? p.spark : p.soft)} {...line(p, 3)} />)}
    <circle cx={0} cy={40} r={3} fill={p.ink} />
  </g>
);
const megaphone: Motif = (p) => (
  <g>
    <path d="M-30 -10 L20 -36 V28 L-30 6 Z" fill={fill(p, p.main)} {...line(p)} />
    <rect x={-42} y={-12} width={14} height={20} rx={4} fill={fill(p, p.paper)} {...line(p, 3)} />
    <path d="M-22 6 L-14 32 H-4 L-10 8" fill={fill(p, p.soft)} {...line(p, 3)} />
    <path d="M30 -18 C38 -12 38 6 30 12 M36 -28 C50 -16 50 10 36 22" fill="none" stroke={p.outline ? p.ink : p.spark} strokeWidth={3.5 * (p.weight ?? 1)} strokeLinecap="round" />
  </g>
);

// ── Finance ───────────────────────────────────────────────────────────────────

const coinStack: Motif = (p) => (
  <g>
    {[24, 12, 0, -12].map((y, i) => (
      <g key={y}>
        <path d={`M-28 ${y} V${y + 8} A28 8 0 0 0 28 ${y + 8} V${y}`} fill={fill(p, p.spark)} {...line(p, 3)} />
        <ellipse cx={0} cy={y} rx={28} ry={8} fill={fill(p, i === 3 ? p.spark : p.soft)} {...line(p, 3)} />
      </g>
    ))}
    <circle cx={26} cy={-30} r={14} fill={fill(p, p.main)} {...line(p, 3)} />
    <path d="M20 -34 H32 M20 -28 H32" {...line(p, 2.4)} stroke={p.outline || p.tint !== undefined ? p.ink : p.paper} />
  </g>
);
const banknote: Motif = (p) => (
  <g>
    <rect x={-46} y={-28} width={92} height={56} rx={8} fill={fill(p, p.main)} {...line(p)} transform="rotate(-8)" />
    <rect x={-40} y={-22} width={92} height={56} rx={8} fill={fill(p, p.soft)} {...line(p)} transform="rotate(6) translate(-4 0)" />
    <circle cx={0} cy={4} r={14} fill={fill(p, p.paper)} {...line(p, 3)} />
    <path d="M-5 -3 H6 M-5 3 H6 M-2 -3 C6 -3 6 7 -2 7 L6 13" fill="none" {...line(p, 2.4)} />
  </g>
);
const candles: Motif = (p) => (
  <g>
    {[[-32, -10, 22, 1], [-14, -26, 30, 0], [4, -4, 18, 1], [22, -34, 34, 0]].map(([x, y, h, up], i) => (
      <g key={i}>
        <path d={`M${(x as number) + 6} ${(y as number) - 10} V${(y as number) + (h as number) + 10}`} {...line(p, 2.6)} />
        <rect x={x as number} y={y as number} width={12} height={h as number} rx={2} fill={fill(p, up ? p.main : p.spark)} {...line(p, 2.8)} />
      </g>
    ))}
    <path d="M-44 40 H44" {...line(p, 3)} />
  </g>
);
const piggy: Motif = (p) => (
  <g>
    <ellipse cx={0} cy={4} rx={40} ry={30} fill={fill(p, p.soft)} {...line(p)} />
    <path d="M-20 -22 L-14 -36 L-4 -26" fill={fill(p, p.soft)} {...line(p, 3)} />
    <rect x={-10} y={-30} width={20} height={6} rx={3} fill={fill(p, p.ink)} />
    <ellipse cx={38} cy={4} rx={8} ry={10} fill={fill(p, p.main)} {...line(p, 3)} />
    <path d="M-22 30 V40 M14 30 V40" {...line(p, 5)} />
    <circle cx={18} cy={-6} r={3} fill={p.ink} />
    <circle cx={0} cy={-46} r={8} fill={fill(p, p.spark)} {...line(p, 2.6)} />
  </g>
);
const calculator: Motif = (p) => (
  <g>
    <rect x={-32} y={-44} width={64} height={88} rx={10} fill={fill(p, p.paper)} {...line(p)} />
    <rect x={-22} y={-34} width={44} height={18} rx={4} fill={fill(p, p.main)} {...line(p, 3)} />
    {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => (
      <rect key={`${r}${c}`} x={-22 + c * 16} y={-8 + r * 16} width={12} height={12} rx={3} fill={fill(p, r === 2 && c === 2 ? p.spark : p.soft)} {...line(p, 2.2)} />
    )))}
  </g>
);

// ── Mathematics ───────────────────────────────────────────────────────────────

const compassArc: Motif = (p) => (
  <g>
    <circle cx={0} cy={6} r={34} fill="none" stroke={p.outline ? p.ink : p.main} strokeWidth={3 * (p.weight ?? 1)} strokeDasharray="6 6" />
    <path d="M0 -40 L-22 36 M0 -40 L22 36" fill="none" {...line(p, 4.5)} />
    <circle cx={0} cy={-40} r={7} fill={fill(p, p.spark)} {...line(p, 3)} />
    <path d="M-14 6 H14" {...line(p, 3)} />
  </g>
);
const sigma: Motif = (p) => (
  <g>
    <rect x={-44} y={-44} width={88} height={88} rx={14} fill={fill(p, p.soft)} {...line(p)} />
    <path d="M24 -26 H-20 L6 0 L-20 26 H24" fill="none" stroke={p.outline ? p.ink : p.main} strokeWidth={6 * (p.weight ?? 1)} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
const triangleAngle: Motif = (p) => (
  <g>
    <path d="M-42 34 L38 34 L-6 -42 Z" fill={fill(p, p.soft)} {...line(p)} />
    <path d="M-28 34 A14 14 0 0 0 -35 22" fill="none" stroke={p.outline ? p.ink : p.main} strokeWidth={3.5 * (p.weight ?? 1)} />
    <path d="M38 34 V20 H24" fill="none" {...line(p, 2.6)} opacity={0} />
    <path d="M-6 -42 V34" stroke={p.ink} strokeWidth={2 * (p.weight ?? 1)} strokeDasharray="4 4" />
    <rect x={-6} y={24} width={10} height={10} fill="none" {...line(p, 2.2)} />
    <circle cx={-6} cy={-42} r={5} fill={fill(p, p.spark)} {...line(p, 2.4)} />
  </g>
);
const parabola: Motif = (p) => (
  <g>
    <path d="M-44 30 H44 M0 44 V-44" fill="none" {...line(p, 3)} />
    <path d="M-34 -40 Q0 70 34 -40" fill="none" stroke={p.outline ? p.ink : p.main} strokeWidth={4.5 * (p.weight ?? 1)} strokeLinecap="round" />
    <circle cx={0} cy={15} r={5} fill={fill(p, p.spark)} {...line(p, 2.4)} />
    <path d="M40 -44 L44 -40 L40 -36 M-4 -40 L0 -44 L4 -40" fill="none" {...line(p, 2.4)} />
  </g>
);
const infinity: Motif = (p) => (
  <g>
    <path d="M0 0 C-12 -24 -46 -24 -46 0 C-46 24 -12 24 0 0 C12 -24 46 -24 46 0 C46 24 12 24 0 0 Z" fill={fill(p, p.soft)} stroke={p.outline ? p.ink : p.main} strokeWidth={6 * (p.weight ?? 1)} strokeLinejoin="round" />
    <circle cx={-26} cy={0} r={4} fill={p.spark} />
    <circle cx={26} cy={0} r={4} fill={p.accent} />
  </g>
);

// ── Science ───────────────────────────────────────────────────────────────────

const atom: Motif = (p) => (
  <g fill="none">
    {[0, 60, 120].map((a, i) => (
      <ellipse key={a} cx={0} cy={0} rx={44} ry={16} transform={`rotate(${a})`} stroke={i === 0 && !p.outline ? p.main : p.ink} strokeWidth={3 * (p.weight ?? 1)} />
    ))}
    <circle cx={0} cy={0} r={9} fill={fill(p, p.spark)} {...line(p, 3)} />
    <circle cx={44} cy={0} r={4.5} fill={fill(p, p.main)} {...line(p, 2)} />
    <circle cx={-22} cy={-38} r={4.5} fill={fill(p, p.accent)} {...line(p, 2)} />
  </g>
);
const flask: Motif = (p) => (
  <g>
    <path d="M-10 -44 V-12 L-36 34 A8 8 0 0 0 -29 46 H29 A8 8 0 0 0 36 34 L10 -12 V-44" fill={fill(p, p.paper)} {...line(p)} />
    <path d="M-24 14 H24 L33 32 A6 6 0 0 1 28 40 H-28 A6 6 0 0 1 -33 32 Z" fill={fill(p, p.main)} />
    <path d="M-16 -44 H16" {...line(p, 4)} />
    <circle cx={-6} cy={26} r={4} fill={p.tint !== undefined ? p.ink : p.paper} opacity={p.tint !== undefined ? 0.35 : 1} />
    <circle cx={8} cy={20} r={3} fill={p.tint !== undefined ? p.ink : p.paper} opacity={p.tint !== undefined ? 0.35 : 1} />
    <circle cx={22} cy={-30} r={5} fill={fill(p, p.spark)} {...line(p, 2.4)} />
  </g>
);
const dna: Motif = (p) => (
  <g fill="none">
    <path d="M-20 -46 C20 -30 20 -14 -20 0 C-60 14 20 30 -20 46" stroke="none" />
    <path d="M-22 -46 C24 -28 24 -16 0 -4 C-24 8 -24 20 22 46" {...line(p, 4)} stroke={p.outline ? p.ink : p.main} />
    <path d="M22 -46 C-24 -28 -24 -16 0 -4 C24 8 24 20 -22 46" {...line(p, 4)} stroke={p.outline ? p.ink : p.accent} />
    {[-34, -22, 10, 22, 34].map((y, i) => (
      <path key={y} d={`M${-12 + (i % 2) * 2} ${y} H${12 - (i % 2) * 2}`} {...line(p, 2.6)} />
    ))}
  </g>
);
const microscope: Motif = (p) => (
  <g>
    <rect x={-36} y={36} width={72} height={10} rx={4} fill={fill(p, p.main)} {...line(p, 3)} />
    <path d="M10 36 C34 30 34 2 14 -6" fill="none" {...line(p, 4)} />
    <rect x={-14} y={-44} width={16} height={40} rx={4} fill={fill(p, p.soft)} {...line(p, 3)} transform="rotate(-24)" />
    <rect x={-26} y={10} width={40} height={6} rx={2} fill={fill(p, p.spark)} {...line(p, 2.6)} />
    <path d="M-2 16 V36" {...line(p, 4)} />
  </g>
);
const planet: Motif = (p) => (
  <g>
    <circle cx={0} cy={0} r={28} fill={fill(p, p.main)} {...line(p)} />
    <path d="M-20 -8 C-8 -14 6 -10 18 -16 M-22 10 C-10 6 4 12 22 6" fill="none" stroke={p.outline || p.tint !== undefined ? p.ink : p.paper} strokeWidth={2.4 * (p.weight ?? 1)} strokeLinecap="round" opacity={0.7} />
    <ellipse cx={0} cy={0} rx={48} ry={12} fill="none" {...line(p, 3.5)} transform="rotate(-18)" />
    <circle cx={36} cy={-34} r={4} fill={p.spark} />
    <circle cx={-38} cy={30} r={3} fill={p.accent} />
  </g>
);

// ── Electronics ──────────────────────────────────────────────────────────────

const circuit: Motif = (p) => (
  <g>
    <rect x={-46} y={-40} width={92} height={80} rx={10} fill={fill(p, p.main)} {...line(p)} />
    <path d="M-34 -24 H-10 V-6 H14 M-34 22 H0 V8 H34 M20 -28 V-10 H34" fill="none" stroke={p.outline || p.tint !== undefined ? p.ink : p.paper} strokeWidth={2.8 * (p.weight ?? 1)} strokeLinecap="round" />
    {[[-34, -24], [14, -6], [-34, 22], [34, 8], [20, -28]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={4} fill={fill(p, p.spark)} stroke={p.ink} strokeWidth={1.6 * (p.weight ?? 1)} />
    ))}
  </g>
);
const resistor: Motif = (p) => (
  <g>
    <path d="M-46 0 H-26 L-20 -14 L-10 14 L0 -14 L10 14 L20 -14 L26 0 H46" fill="none" {...line(p, 4)} />
    <circle cx={-46} cy={0} r={5} fill={fill(p, p.main)} {...line(p, 2.6)} />
    <circle cx={46} cy={0} r={5} fill={fill(p, p.main)} {...line(p, 2.6)} />
    <path d="M-14 -34 L-24 -18 H-12 L-22 -2" fill="none" stroke={p.outline ? p.ink : p.spark} strokeWidth={3.5 * (p.weight ?? 1)} strokeLinecap="round" strokeLinejoin="round" transform="translate(30 4)" />
  </g>
);
const robot: Motif = (p) => (
  <g>
    <path d="M0 -38 V-28" {...line(p, 3.5)} />
    <circle cx={0} cy={-42} r={5} fill={fill(p, p.spark)} {...line(p, 2.6)} />
    <rect x={-36} y={-28} width={72} height={58} rx={14} fill={fill(p, p.main)} {...line(p)} />
    <rect x={-26} y={-16} width={52} height={28} rx={8} fill={fill(p, p.paper)} {...line(p, 3)} />
    <circle cx={-11} cy={-2} r={5} fill={p.ink} />
    <circle cx={11} cy={-2} r={5} fill={p.ink} />
    <path d="M-14 20 H14" {...line(p, 3)} stroke={p.outline || p.tint !== undefined ? p.ink : p.paper} />
    <path d="M-36 0 H-44 M36 0 H44" {...line(p, 4)} />
  </g>
);
const antenna: Motif = (p) => (
  <g fill="none">
    <path d="M0 -6 L-16 44 M0 -6 L16 44 M-10 24 H10" {...line(p, 3.5)} />
    <circle cx={0} cy={-10} r={7} fill={fill(p, p.main)} {...line(p, 3)} />
    {[18, 30, 42].map((r, i) => (
      <path key={r} d={`M${-r * 0.7} ${-10 - r * 0.7} A${r} ${r} 0 0 1 ${r * 0.7} ${-10 - r * 0.7}`} stroke={i === 1 && !p.outline ? p.spark : p.ink} strokeWidth={3.2 * (p.weight ?? 1)} strokeLinecap="round" />
    ))}
  </g>
);
const battery: Motif = (p) => (
  <g>
    <rect x={-44} y={-24} width={80} height={48} rx={9} fill={fill(p, p.paper)} {...line(p)} />
    <rect x={36} y={-10} width={8} height={20} rx={2} fill={fill(p, p.ink)} />
    <rect x={-36} y={-16} width={44} height={32} rx={5} fill={fill(p, p.main)} />
    <path d="M-6 -12 L-16 2 H-4 L-12 14" fill="none" stroke={p.outline ? p.ink : p.spark} strokeWidth={3.5 * (p.weight ?? 1)} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

// ── Engineering ──────────────────────────────────────────────────────────────

const gearPair: Motif = (p) => (
  <g>
    <g transform="translate(-14 -8) scale(0.72)">{gear({ ...p })}</g>
    <g transform="translate(26 22) scale(0.48) rotate(22)">{gear({ ...p, main: p.spark })}</g>
  </g>
);
const crane: Motif = (p) => (
  <g fill="none">
    <path d="M-24 44 V-40 M-36 -40 H44 M-24 -26 L-10 -40" {...line(p, 4)} />
    <path d="M-30 44 H-18 M-24 -40 L-36 -28" {...line(p, 3)} />
    <path d="M30 -40 V2" {...line(p, 2.6)} />
    <rect x={20} y={2} width={20} height={16} rx={2} fill={fill(p, p.spark)} {...line(p, 3)} />
    <rect x={-46} y={-44} width={12} height={10} rx={2} fill={fill(p, p.main)} {...line(p, 2.6)} />
  </g>
);
const bridge: Motif = (p) => (
  <g fill="none">
    <path d="M-48 10 H48" {...line(p, 4.5)} />
    <path d="M-40 10 Q0 -60 40 10" stroke={p.outline ? p.ink : p.main} strokeWidth={4.5 * (p.weight ?? 1)} strokeLinecap="round" />
    {[-24, -12, 0, 12, 24].map((x) => (
      <path key={x} d={`M${x} 10 V${-14 + Math.abs(x) * 0.9}`} {...line(p, 2.4)} />
    ))}
    <path d="M-48 10 V40 M48 10 V40" {...line(p, 4)} />
    <path d="M-46 28 Q-24 20 0 28 Q24 36 46 28" stroke={p.outline ? p.ink : p.accent} strokeWidth={2.6 * (p.weight ?? 1)} strokeLinecap="round" />
  </g>
);
const building: Motif = (p) => (
  <g>
    <rect x={-34} y={-36} width={40} height={80} rx={4} fill={fill(p, p.main)} {...line(p)} />
    <rect x={6} y={-6} width={32} height={50} rx={4} fill={fill(p, p.soft)} {...line(p)} />
    {[-26, -10].flatMap((x) => [-26, -12, 2, 16].map((y) => (
      <rect key={`${x}${y}`} x={x} y={y} width={8} height={8} rx={1.5} fill={p.outline ? p.paper : p.paper} stroke={p.ink} strokeWidth={1.4 * (p.weight ?? 1)} />
    )))}
    <path d="M-46 44 H46" {...line(p, 3.5)} />
  </g>
);
const wrench: Motif = (p) => (
  <g transform="rotate(-40)">
    <path d="M-8 -18 V40 A8 8 0 0 0 8 40 V-18" fill={fill(p, p.main)} {...line(p)} />
    <path d="M-8 -18 C-26 -22 -26 -46 -10 -50 L-10 -36 H10 V-50 C26 -46 26 -22 8 -18" fill={fill(p, p.soft)} {...line(p)} />
    <circle cx={0} cy={30} r={3.5} fill={p.paper} />
  </g>
);

// ── Language ─────────────────────────────────────────────────────────────────

const speechBubbles: Motif = (p) => (
  <g>
    <path d="M-46 -38 H10 A8 8 0 0 1 18 -30 V-4 A8 8 0 0 1 10 4 H-24 L-36 16 V4 H-46 A8 8 0 0 1 -54 -4 V-30 A8 8 0 0 1 -46 -38 Z" fill={fill(p, p.main)} {...line(p)} transform="translate(6 0)" />
    <path d="M-14 -4 H46 A8 8 0 0 1 54 4 V28 A8 8 0 0 1 46 36 H36 V46 L24 36 H-14 A8 8 0 0 1 -22 28 V4 A8 8 0 0 1 -14 -4 Z" fill={fill(p, p.paper)} {...line(p)} transform="translate(-6 0)" />
    <path d="M-6 14 H30 M-6 24 H18" {...line(p, 3)} />
  </g>
);
const openBook: Motif = (p) => (
  <g>
    <path d="M0 -26 C-14 -36 -34 -36 -46 -30 V34 C-34 28 -14 28 0 38 Z" fill={fill(p, p.paper)} {...line(p)} />
    <path d="M0 -26 C14 -36 34 -36 46 -30 V34 C34 28 14 28 0 38 Z" fill={fill(p, p.soft)} {...line(p)} />
    <path d="M-36 -16 C-26 -20 -14 -18 -8 -14 M-36 -4 C-26 -8 -14 -6 -8 -2 M-36 8 C-26 4 -14 6 -8 10" fill="none" {...line(p, 2.4)} />
    <path d="M24 -42 V-14 L30 -20 L36 -14 V-42" fill={fill(p, p.spark)} {...line(p, 2.6)} />
  </g>
);
const quill: Motif = (p) => (
  <g>
    <path d="M38 -44 C8 -40 -14 -14 -24 26 L-18 28 C-4 -6 14 -26 38 -44 Z" fill={fill(p, p.main)} {...line(p)} />
    <path d="M38 -44 C30 -16 10 6 -18 28" fill="none" {...line(p, 2.4)} />
    <path d="M-24 26 L-32 44" {...line(p, 3.5)} />
    <path d="M-44 44 C-30 36 -16 46 0 38" fill="none" stroke={p.outline ? p.ink : p.accent} strokeWidth={3 * (p.weight ?? 1)} strokeLinecap="round" />
  </g>
);
const letterBlocks: Motif = (p) => (
  <g>
    <rect x={-46} y={-30} width={44} height={44} rx={8} fill={fill(p, p.main)} {...line(p)} transform="rotate(-8 -24 -8)" />
    <rect x={2} y={-14} width={44} height={44} rx={8} fill={fill(p, p.soft)} {...line(p)} transform="rotate(7 24 8)" />
    <path d="M-36 4 L-24 -22 L-12 4 M-32 -4 H-16" fill="none" stroke={p.outline || p.tint !== undefined ? p.ink : p.paper} strokeWidth={4 * (p.weight ?? 1)} strokeLinecap="round" strokeLinejoin="round" transform="rotate(-8 -24 -8)" />
    <path d="M30 18 C20 22 14 14 18 6 C22 -2 32 2 32 8 V20" fill="none" {...line(p, 4)} transform="rotate(7 24 8)" />
  </g>
);
const globeTalk: Motif = (p) => (
  <g>
    <circle cx={-6} cy={6} r={34} fill={fill(p, p.soft)} {...line(p)} />
    <path d="M-40 6 H28 M-6 -28 C-22 -10 -22 22 -6 40 M-6 -28 C10 -10 10 22 -6 40" fill="none" {...line(p, 2.6)} />
    <path d="M14 -46 H44 A6 6 0 0 1 50 -40 V-24 A6 6 0 0 1 44 -18 H30 L22 -10 V-18 H14 A6 6 0 0 1 8 -24 V-40 A6 6 0 0 1 14 -46 Z" fill={fill(p, p.main)} {...line(p, 3)} />
  </g>
);

// ── Health ───────────────────────────────────────────────────────────────────

const heartPulse: Motif = (p) => (
  <g>
    <path d="M0 40 C-60 0 -40 -48 0 -20 C40 -48 60 0 0 40 Z" fill={fill(p, p.main)} {...line(p)} />
    <path d="M-46 0 H-18 L-10 -16 L0 16 L8 -6 L14 0 H46" fill="none" stroke={p.outline || p.tint !== undefined ? p.ink : p.paper} strokeWidth={4 * (p.weight ?? 1)} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
const medicalCross: Motif = (p) => (
  <g>
    <circle cx={0} cy={0} r={44} fill={fill(p, p.soft)} {...line(p)} />
    <path d="M-10 -32 H10 V-10 H32 V10 H10 V32 H-10 V10 H-32 V-10 H-10 Z" fill={fill(p, p.main)} {...line(p)} />
  </g>
);
const stethoscope: Motif = (p) => (
  <g fill="none">
    <path d="M-26 -44 V-14 C-26 10 14 10 14 -14 V-44" {...line(p, 4)} />
    <path d="M-6 6 V22 C-6 42 30 42 30 22 V12" {...line(p, 4)} />
    <circle cx={30} cy={4} r={10} fill={fill(p, p.main)} {...line(p, 3.5)} />
    <circle cx={-26} cy={-44} r={4} fill={p.ink} />
    <circle cx={14} cy={-44} r={4} fill={p.ink} />
  </g>
);
const leaf: Motif = (p) => (
  <g>
    <path d="M-36 40 C-40 -20 0 -44 44 -44 C44 0 20 40 -36 40 Z" fill={fill(p, p.main)} {...line(p)} />
    <path d="M-36 40 C-10 14 10 -8 36 -36 M-8 14 H14 M4 2 V-16" fill="none" stroke={p.outline || p.tint !== undefined ? p.ink : p.paper} strokeWidth={3 * (p.weight ?? 1)} strokeLinecap="round" />
  </g>
);
const pill: Motif = (p) => (
  <g>
    <g transform="rotate(-40)">
      <rect x={-46} y={-18} width={92} height={36} rx={18} fill={fill(p, p.paper)} {...line(p)} />
      <path d="M0 -18 H28 A18 18 0 0 1 28 18 H0 Z" fill={fill(p, p.main)} />
      <rect x={-46} y={-18} width={92} height={36} rx={18} fill="none" {...line(p)} />
      <path d="M0 -18 V18" {...line(p, 3)} />
    </g>
    <circle cx={30} cy={30} r={7} fill={fill(p, p.spark)} {...line(p, 2.6)} />
  </g>
);

// ── Music ────────────────────────────────────────────────────────────────────

const note: Motif = (p) => (
  <g>
    <path d="M-14 26 V-36 L36 -46 V16" fill="none" {...line(p, 4.5)} />
    <path d="M-14 -22 L36 -32" {...line(p, 4.5)} />
    <ellipse cx={-26} cy={28} rx={13} ry={10} fill={fill(p, p.main)} {...line(p)} />
    <ellipse cx={24} cy={18} rx={13} ry={10} fill={fill(p, p.spark)} {...line(p)} />
  </g>
);
const headphones: Motif = (p) => (
  <g>
    <path d="M-36 10 V0 A36 36 0 0 1 36 0 V10" fill="none" {...line(p, 5)} />
    <rect x={-46} y={4} width={20} height={36} rx={8} fill={fill(p, p.main)} {...line(p)} />
    <rect x={26} y={4} width={20} height={36} rx={8} fill={fill(p, p.main)} {...line(p)} />
  </g>
);
const waveform: Motif = (p) => (
  <g>
    {[-40, -30, -20, -10, 0, 10, 20, 30, 40].map((x, i) => {
      const h = [10, 24, 40, 18, 52, 30, 44, 20, 12][i];
      return <rect key={x} x={x - 3.5} y={-h / 2} width={7} height={h} rx={3.5} fill={fill(p, i % 3 === 1 ? p.spark : p.main)} stroke={p.ink} strokeWidth={2 * (p.weight ?? 1)} />;
    })}
  </g>
);
const vinyl: Motif = (p) => (
  <g>
    <circle cx={0} cy={0} r={44} fill={fill(p, p.ink)} {...line(p)} />
    {[34, 26].map((r) => <circle key={r} cx={0} cy={0} r={r} fill="none" stroke={p.outline ? p.ink : p.soft} strokeWidth={1.4 * (p.weight ?? 1)} opacity={0.6} />)}
    <circle cx={0} cy={0} r={15} fill={fill(p, p.main)} {...line(p, 2.6)} />
    <circle cx={0} cy={0} r={3} fill={p.paper} />
  </g>
);
const pianoKeys: Motif = (p) => (
  <g>
    <rect x={-46} y={-30} width={92} height={60} rx={6} fill={fill(p, p.paper)} {...line(p)} />
    {[-30, -14, 2, 18, 34].map((x) => <path key={x} d={`M${x - 2} -30 V30`} {...line(p, 2.2)} />)}
    {[-36, -20, 12, 28].map((x, i) => <rect key={x} x={x} y={-30} width={10} height={34} rx={2} fill={fill(p, i === 2 ? p.main : p.ink)} />)}
  </g>
);

// ── General ──────────────────────────────────────────────────────────────────

const bulb: Motif = (p) => (
  <g>
    <path d="M-14 22 C-14 10 -30 2 -30 -14 A30 30 0 0 1 30 -14 C30 2 14 10 14 22 Z" fill={fill(p, p.spark)} {...line(p)} />
    <path d="M-12 30 H12 M-8 38 H8" {...line(p, 4)} />
    <path d="M-6 6 L0 -10 L6 6" fill="none" {...line(p, 2.6)} />
    {[-46, 46].map((x) => <path key={x} d={`M${x * 0.9} -14 H${x}`} {...line(p, 3)} />)}
    <path d="M0 -50 V-44 M-32 -42 L-28 -38 M32 -42 L28 -38" {...line(p, 3)} />
  </g>
);
const rocket: Motif = (p) => (
  <g transform="rotate(35)">
    <path d="M0 -48 C18 -30 18 4 12 22 H-12 C-18 4 -18 -30 0 -48 Z" fill={fill(p, p.paper)} {...line(p)} />
    <circle cx={0} cy={-16} r={8} fill={fill(p, p.main)} {...line(p, 3)} />
    <path d="M-12 6 L-26 26 L-12 22 M12 6 L26 26 L12 22" fill={fill(p, p.main)} {...line(p, 3)} />
    <path d="M-7 26 C-6 38 0 44 0 48 C0 44 6 38 7 26" fill={fill(p, p.spark)} {...line(p, 2.6)} />
  </g>
);
const bookStack: Motif = (p) => (
  <g>
    {[[18, p.main, -4], [-2, p.soft, 3], [-22, p.accent, -2]].map(([y, c, r], i) => (
      <g key={i} transform={`rotate(${r})`}>
        <rect x={-40} y={y as number} width={80} height={18} rx={4} fill={fill(p, c as string)} {...line(p)} />
        <path d={`M28 ${(y as number) + 4} V${(y as number) + 14}`} {...line(p, 2.4)} />
      </g>
    ))}
    <path d="M-8 -42 V-24 L-2 -30 L4 -24 V-42" fill={fill(p, p.spark)} {...line(p, 2.6)} />
  </g>
);
const compassRose: Motif = (p) => (
  <g>
    <circle cx={0} cy={0} r={42} fill={fill(p, p.paper)} {...line(p)} />
    <circle cx={0} cy={0} r={34} fill="none" stroke={p.ink} strokeWidth={1.6 * (p.weight ?? 1)} strokeDasharray="3 5" />
    <path d="M0 -30 L9 0 L0 30 L-9 0 Z" fill={fill(p, p.soft)} {...line(p, 3)} />
    <path d="M0 -30 L9 0 L-9 0 Z" fill={fill(p, p.main)} {...line(p, 3)} />
    <circle cx={0} cy={0} r={3.5} fill={p.ink} />
  </g>
);
const summit: Motif = (p) => (
  <g>
    <path d="M-48 38 L-14 -16 L4 10 L20 -12 L48 38 Z" fill={fill(p, p.soft)} {...line(p)} />
    <path d="M-14 -16 L-22 -4 L-14 -8 L-6 -2 Z" fill={fill(p, p.paper)} {...line(p, 2.4)} />
    <path d="M20 -12 V-44" {...line(p, 3.5)} />
    <path d="M20 -44 H40 L34 -36 L40 -28 H20" fill={fill(p, p.main)} {...line(p, 3)} />
  </g>
);

export const MOTIFS: Record<ArtThemeKey, Motif[]> = {
  ai: [chip, neuralNet, brain, sparkle, chatBot],
  code: [brackets, terminal, browser, gitBranch, cursorBraces],
  data: [barChart, pieChart, database, scatter, tableGrid],
  security: [shield, padlock, key, fingerprint, scanEye],
  cloud: [cloud, serverRack, containers, gear, globeNet],
  design: [penNib, palette, layers, bezier, setSquare],
  business: [briefcase, growth, target, orgChart, megaphone],
  finance: [coinStack, banknote, candles, piggy, calculator],
  math: [compassArc, sigma, triangleAngle, parabola, infinity],
  science: [atom, flask, dna, microscope, planet],
  electronics: [circuit, resistor, robot, antenna, battery],
  engineering: [gearPair, crane, bridge, building, wrench],
  language: [speechBubbles, openBook, quill, letterBlocks, globeTalk],
  health: [heartPulse, medicalCross, stethoscope, leaf, pill],
  music: [note, headphones, waveform, vinyl, pianoKeys],
  general: [bulb, rocket, bookStack, compassRose, summit],
};
