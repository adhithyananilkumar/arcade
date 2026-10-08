/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Credentials
 *
 * The platform badge artwork. One design for the whole platform; nobody draws their own.
 *
 *   family → silhouette            (course: hexagon · event: circle · exam: shield)
 *   level  → metal                  (1 Foundation bronze · 2 Intermediate silver · 3 Advanced gold)
 *
 * The two rare levels have shapes of their own, whatever they were awarded for:
 *   4 Expert        — a scalloped seal in platinum with a sapphire enamel band and a sapphire; comes
 *                     with a certification exam's certificate
 *   5 Distinguished — an eight-pointed star of platinum set with a pavé of diamonds, a night-sky
 *                     face with a golden aurora, and the honour's 1–5 stars in place of a logo
 *   title  → the content's name; the Arcade wordmark above it, the issuing organisation's logo below
 *
 * Built like a struck medal: a polished outer rim, a reeded (coin-edge) band, an inner bevel and a
 * groove, then a sunburst-finished face (like a watch dial) under a fixed type hierarchy — the
 * Arcade wordmark struck in the level's metal, LEVEL, content name, family · year — and the issuing
 * organisation's logo on a metal medallion held by a laurel.
 *
 * Motion grows with the level: Foundation gets a slow light sweep; Intermediate adds a light that
 * orbits the rim and glints; Advanced adds a second light and a warm halo.
 *
 * A pure string builder rather than a React component so the same bytes serve the in-app
 * <CredentialBadge>, the downloadable image, and the Open Badges `image` URL
 * (app/(public)/credentials/art/[classCode]).
 * ------------------------------------------------------------------
 */

import { ARCADE_WORDMARK_PATHS, ARCADE_WORDMARK_VIEWBOX } from "./arcadeWordmark";

export type BadgeFamilyKey = "COURSE" | "EVENT" | "EXAM" | "HONOUR";

/** The outline a badge is cut to: its family's, or the rare level's own. */
type Shape = "COURSE" | "EVENT" | "EXAM" | "SEAL" | "STAR";

function shapeOf(family: BadgeFamilyKey, level: number): Shape {
  if (level === 5 || family === "HONOUR") return "STAR";
  if (level === 4) return "SEAL";
  return family;
}
export type BadgeLevel = 1 | 2 | 3 | 4 | 5;

/** How the face is finished: light (the default) or, for the top level, dark with gold lettering. */
interface Face {
  centre: string;
  edge: string;
  ink: string;
  muted: string;
  /** Sunburst: the fine rays and the lit rays between them, [colour, opacity]. */
  rays: [string, number];
  lit: [string, number];
  /** Under the struck wordmark: a light edge on a light face, a shadow on a dark one. */
  strike: [string, number];
}

interface Metal {
  /** Polished metal, light → dark: highlight, light, body, shadow, deep. */
  hi: string;
  light: string;
  body: string;
  shadow: string;
  deep: string;
  /** Face tint at the edge, engraved lines, lettering. */
  tint: string;
  line: string;
  text: string;
  /** Halo and orbiting-light colour. */
  glow: string;
  face?: Face;
  /** Another level's metal used for the band, laurel, medallion and beads (an inlay). */
  accent?: BadgeLevel;
  /** A vitreous enamel band in place of the reeded one: light, body, deep. */
  enamel?: [string, string, string];
  /** A cut stone set at the crown: table, light facet, dark facet. */
  gem?: [string, string, string];
  /** A pavé of diamonds in place of the reeded band. */
  pave?: boolean;
}

const LIGHT_FACE: Face = {
  centre: "#FFFFFF",
  edge: "",
  ink: "#141B2E",
  muted: "#5F6779",
  rays: ["", 0.32],
  lit: ["#FFFFFF", 0.9],
  strike: ["#FFFFFF", 0.95],
};

const METAL: Record<BadgeLevel, Metal> = {
  1: {
    // Foundation: bronze
    hi: "#FBE8D6", light: "#E4BF9E", body: "#B98862", shadow: "#7C5335", deep: "#4A2E1A",
    tint: "#F6ECE2", line: "#C9A486", text: "#80573B",
    glow: "#F0B98A",
  },
  2: {
    // Intermediate: silver
    hi: "#FFFFFF", light: "#E6EBF1", body: "#A8B2BF", shadow: "#68717F", deep: "#3A414C",
    tint: "#EEF2F7", line: "#AFB9C6", text: "#525C6B",
    glow: "#BFD8FF",
  },
  3: {
    // Advanced: gold
    hi: "#FFF6CF", light: "#F3D57E", body: "#C9993A", shadow: "#8A6214", deep: "#523806",
    tint: "#FBF3DD", line: "#D3B060", text: "#72520F",
    glow: "#FFC94D",
  },
  4: {
    // Expert: platinum, a sapphire enamel band, a sapphire at the crown
    hi: "#FFFFFF", light: "#EEF2F7", body: "#BCC4CF", shadow: "#7D8796", deep: "#3C4555",
    tint: "#EEF3FA", line: "#AFC0D8", text: "#2B4F8C",
    glow: "#CFE4FF",
    enamel: ["#5B8FE8", "#1F4FB5", "#0E2A6B"],
    gem: ["#BFD6FF", "#3B74E0", "#0F2E78"],
  },
  5: {
    // Distinguished: platinum set with diamonds, gold inlay, a violet night sky with a golden aurora
    hi: "#FFFFFF", light: "#F3F0F8", body: "#C7C0D6", shadow: "#857C9C", deep: "#3A3350",
    tint: "#1A1530", line: "#C9A24A", text: "#F0D28A",
    glow: "#E6D3FF",
    accent: 3,
    pave: true,
    face: {
      centre: "#211A3D",
      edge: "#08060F",
      ink: "#FBF1D6",
      muted: "#CDB57A",
      rays: ["#C9993A", 0.3],
      lit: ["#F3D57E", 0.16],
      strike: ["#000000", 0.6],
    },
  },
};
const LEVEL_LABEL: Record<BadgeLevel, string> = {
  1: "FOUNDATION",
  2: "INTERMEDIATE",
  3: "ADVANCED",
  4: "EXPERT",
  5: "DISTINGUISHED",
};

/** The face a metal is finished with, filled in from the metal where the light default leaves it open. */
function faceOf(metal: Metal): Face {
  if (metal.face) return metal.face;
  return { ...LIGHT_FACE, edge: metal.tint, rays: [metal.line, LIGHT_FACE.rays[1]] };
}

/** The metal used for inlays: the accent's when the level has one, its own otherwise. */
function inlayOf(metal: Metal): Metal {
  return metal.accent ? METAL[metal.accent] : metal;
}

const FAMILY_LABEL: Record<BadgeFamilyKey, string> = {
  COURSE: "COURSE COMPLETION",
  EVENT: "EVENT PARTICIPATION",
  EXAM: "ASSESSMENT",
  HONOUR: "ARCADE HONOUR",
};

const FONT = "'Inter','Google Sans','Segoe UI',Helvetica,Arial,sans-serif";

export const BADGE_ART_VIEWBOX = { width: 240, height: 256 } as const;

// ── Geometry ─────────────────────────────────────────────────────────────────────────────────

const CX = 120;
const CY = 124;

/** Ring insets, outside in: polished rim → reeded band → inner bevel → groove → face. */
const RING = { band: 5, bevel: 10, groove: 12.4, face: 13, beads: 16, keyline: 18.5 } as const;

function hexagon(r: number, corner = 10): string {
  // Pointy-top hexagon with softened corners.
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = ((-90 + i * 60) * Math.PI) / 180;
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
  });
  let d = "";
  for (let i = 0; i < 6; i++) {
    const p = pts[i];
    const prev = pts[(i + 5) % 6];
    const next = pts[(i + 1) % 6];
    const toward = (q: { x: number; y: number }) => {
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      const len = Math.hypot(dx, dy);
      return { x: p.x + (dx / len) * corner, y: p.y + (dy / len) * corner };
    };
    const a = toward(prev);
    const b = toward(next);
    d += `${i === 0 ? "M" : "L"}${a.x.toFixed(2)},${a.y.toFixed(2)} Q${p.x.toFixed(2)},${p.y.toFixed(2)} ${b.x.toFixed(2)},${b.y.toFixed(2)} `;
  }
  return d + "Z";
}

/** A closed outline through these points, each corner softened by `corner`. */
function roundedPolygon(pts: { x: number; y: number }[], corner: number): string {
  const n = pts.length;
  let d = "";
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const toward = (q: { x: number; y: number }) => {
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      const len = Math.hypot(dx, dy);
      return { x: p.x + (dx / len) * corner, y: p.y + (dy / len) * corner };
    };
    const a = toward(pts[(i + n - 1) % n]);
    const b = toward(pts[(i + 1) % n]);
    d += `${i === 0 ? "M" : "L"}${a.x.toFixed(2)},${a.y.toFixed(2)} Q${p.x.toFixed(2)},${p.y.toFixed(2)} ${b.x.toFixed(2)},${b.y.toFixed(2)} `;
  }
  return d + "Z";
}

/** Expert: a seal with sixteen scallops, one centred at the top. */
function seal(r: number): string {
  const n = 16;
  const step = (2 * Math.PI) / n;
  const at = (k: number) => {
    const a = -Math.PI / 2 + step / 2 + k * step;
    return `${(CX + r * Math.cos(a)).toFixed(2)},${(CY + r * Math.sin(a)).toFixed(2)}`;
  };
  const bulge = (2 * r * Math.sin(step / 2) * 0.75).toFixed(2);
  let d = `M${at(0)}`;
  for (let k = 1; k <= n; k++) d += ` A${bulge},${bulge} 0 0 1 ${at(k % n)}`;
  return d + " Z";
}

/**
 * The star's points cut into facets: each point split along its ridge into a lit half and a shaded
 * half, the way a struck order star catches the light.
 */
function starFacets(metal: Metal): string {
  let d = "";
  for (let k = 0; k < 16; k++) {
    const a1 = ((-90 + k * 22.5) * Math.PI) / 180;
    const a2 = ((-90 + (k + 1) * 22.5) * Math.PI) / 180;
    const r1_ = k % 2 === 0 ? 118 : 99;
    const r2_ = k % 2 === 0 ? 99 : 118;
    const tri = `M${CX} ${CY}L${r1(CX + r1_ * Math.cos(a1))} ${r1(CY + r1_ * Math.sin(a1))}L${r1(CX + r2_ * Math.cos(a2))} ${r1(CY + r2_ * Math.sin(a2))}Z`;
    d += `<path d="${tri}" fill="${k % 2 === 0 ? "#FFFFFF" : metal.deep}" fill-opacity="${k % 2 === 0 ? 0.35 : 0.16}"/>`;
  }
  return d;
}

/** Distinguished: an eight-pointed star, one point straight up. */
function star8(outer: number, inner: number, corner: number): string {
  const pts = Array.from({ length: 16 }, (_, k) => {
    const a = ((-90 + k * 22.5) * Math.PI) / 180;
    const r = k % 2 === 0 ? outer : inner;
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
  });
  return roundedPolygon(pts, corner);
}

function circle(r: number): string {
  return `M${CX - r},${CY} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`;
}

function shield(inset: number): string {
  const top = 16 + inset;
  const side = 22 + inset;
  const right = 240 - side;
  const shoulder = 40 + inset * 0.6;
  const bottom = 240 - inset * 1.2;
  return [
    `M${CX},${top}`,
    `C${CX + 34},${top + 16} ${right - 30},${shoulder} ${right},${shoulder}`,
    `L${right},122`,
    `C${right},${186 - inset * 0.4} ${176 - inset * 0.5},${218 - inset} ${CX},${bottom}`,
    `C${64 + inset * 0.5},${218 - inset} ${side},${186 - inset * 0.4} ${side},122`,
    `L${side},${shoulder}`,
    `C${side + 30},${shoulder} ${CX - 34},${top + 16} ${CX},${top}`,
    "Z",
  ].join(" ");
}

function silhouette(shape: Shape, inset: number): string {
  if (shape === "COURSE") return hexagon(110 - inset, 12 - inset * 0.3);
  if (shape === "EVENT") return circle(104 - inset);
  if (shape === "SEAL") return seal(106 - inset);
  // The star's points are the polished rim; from the band inward it holds a round medal, so the
  // diamonds run as a ring around the face.
  if (shape === "STAR") return inset < RING.band ? star8(118 - inset * 1.3, 99 - inset, 3) : circle(101 - inset);
  return shield(inset);
}

const r1 = (n: number) => +n.toFixed(1);

/** Radial ticks across the reeded band (clipped to it), like the milled edge of a coin. */
function reeding(count: number, offsetDeg = 0): string {
  let d = "";
  for (let i = 0; i < count; i++) {
    const a = ((i * 360) / count + offsetDeg) * (Math.PI / 180);
    const c = Math.cos(a);
    const s = Math.sin(a);
    d += `M${r1(CX + 78 * c)} ${r1(CY + 78 * s)}L${r1(CX + 128 * c)} ${r1(CY + 128 * s)}`;
  }
  return d;
}

// ── Title: the content's name, wrapped to the badge ──────────────────────────────────────────

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c] as string);
}

function wrap(text: string, maxChars: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maxChars) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word.length > maxChars ? word.slice(0, maxChars - 1) + "…" : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Largest size at which the name fits in three lines; below that, the third line is truncated. */
function layoutTitle(text: string, width: number): { size: number; lines: string[] } {
  for (const size of [18, 16.5, 15, 13.5, 12]) {
    const lines = wrap(text, Math.floor(width / (size * 0.56)));
    if (lines.length <= 3) return { size, lines };
  }
  const size = 12;
  const lines = wrap(text, Math.floor(width / (size * 0.56)));
  const kept = lines.slice(0, 3);
  kept[2] = kept[2].replace(/\s*\S*$/, "").trimEnd() + "…";
  return { size, lines: kept };
}

function title(text: string, shape: Shape, ink: string): string {
  const width = shape === "COURSE" || shape === "EXAM" ? 144 : 132;
  const { size, lines } = layoutTitle(text, width);
  const lineHeight = size * 1.18;
  const blockCenter = 122;
  const first = blockCenter - ((lines.length - 1) * lineHeight) / 2 + size * 0.35;
  return lines
    .map(
      (l, i) =>
        `<text x="${CX}" y="${(first + i * lineHeight).toFixed(1)}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="${size}" fill="${ink}">${escapeXml(l)}</text>`
    )
    .join("");
}

// ── Assembly ─────────────────────────────────────────────────────────────────────────────────

export interface BadgeArtOptions {
  family: BadgeFamilyKey;
  level: BadgeLevel;
  /** The content's name, printed on the badge. Omitted for the generic class artwork. */
  title?: string;
  /**
   * The issuing organisation's logo, shown in the lower medallion. An https URL works when the
   * SVG is inlined in the page; for a standalone file pass a data: URL (see downloadBadgeImage),
   * because an SVG drawn as an image loads nothing external.
   */
  issuerLogoUrl?: string | null;
  /** Year earned, printed beside the family label. Omitted for unearned and generic artwork. */
  year?: number | null;
  /** A Distinguished honour's rating, 1–5, shown as stars. Five on the generic artwork. */
  stars?: number | null;
  /** "metal" (default) blends the logo into bronze/silver/gold; "original" keeps its own colours. */
  logoStyle?: "metal" | "original";
  /** Sweep, orbiting light, halo and glints by level. Off for files and images. */
  animate?: boolean;
  /** Prefix for gradient ids — must be unique per badge on a page. */
  uid?: string;
  /** Adds the xmlns and a <title>, for a standalone .svg file. */
  standalone?: boolean;
}

export function isBadgeLevel(n: number): n is BadgeLevel {
  return Number.isInteger(n) && n >= 1 && n <= 5;
}

/**
 * The Arcade wordmark struck into the face: lettered in the level's metal, with a light edge just
 * below each stroke, as an engraving catches the light.
 */
function wordmark(id: string, strike: [string, number]): string {
  const width = 66;
  const scale = (width / ARCADE_WORDMARK_VIEWBOX.width).toFixed(4);
  const x = (CX - width / 2).toFixed(2);
  const paths = ARCADE_WORDMARK_PATHS.map((d) => `<path d="${d}"/>`).join("");
  return `<g transform="translate(${x} 54.7) scale(${scale})" fill="${strike[0]}" fill-opacity="${strike[1]}">${paths}</g>
    <g transform="translate(${x} 54) scale(${scale})" fill="url(#${id}-mono)">${paths}</g>`;
}

/**
 * The face finish: a watch-dial sunburst — hairline rays from the centre, alternately catching and
 * losing the light — fading out under the lettering.
 */
function sunburst(id: string, face: Face): string {
  let fine = "";
  let lit = "";
  for (let i = 0; i < 180; i++) {
    const a = (i * 2 * Math.PI) / 180;
    const seg = `M${r1(CX + 20 * Math.cos(a))} ${r1(CY + 20 * Math.sin(a))}L${r1(CX + 130 * Math.cos(a))} ${r1(CY + 130 * Math.sin(a))}`;
    if (i % 2 === 0) fine += seg;
    else lit += seg;
  }
  return `<path d="${fine}" stroke="${face.rays[0]}" stroke-width="0.45" stroke-opacity="${face.rays[1]}"/>
      <path d="${lit}" stroke="${face.lit[0]}" stroke-width="0.6" stroke-opacity="${face.lit[1]}"/>
      <rect x="0" y="0" width="240" height="256" fill="url(#${id}-sheen)"/>`;
}

/**
 * The Distinguished face: a violet night sky — a deep field of fine stars, a few bright ones with
 * flares, and an aurora: a golden ribbon over a violet-rose one, with fine vertical curtains running
 * through them. With motion on, the aurora drifts and its curtains shimmer.
 */
function cosmos(id: string): string {
  const gold = METAL[3];
  // A fixed sequence (Park–Miller), so every badge has the same sky.
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let field = "";
  for (let i = 0; i < 190; i++) {
    const x = r1(14 + rnd() * 212);
    const y = r1(16 + rnd() * 218);
    const r = (0.18 + rnd() ** 4 * 0.75).toFixed(2);
    const o = (0.25 + rnd() * 0.6).toFixed(2);
    field += `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 4 === 0 ? "#FFFFFF" : gold.hi}" fill-opacity="${o}"/>`;
  }
  // Bright stars: a core and a thin cross flare.
  const flare = ([x, y, r]: [number, number, number]) =>
    `<path d="M${x - r * 3} ${y}H${x + r * 3}M${x} ${y - r * 3}V${y + r * 3}" stroke="${gold.hi}" stroke-width="0.35" stroke-opacity="0.8"/><circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF"/>`;
  const bright = ([
    [48, 96, 0.9], [196, 92, 0.8], [76, 186, 0.7], [168, 192, 0.8], [104, 40, 0.6], [140, 150, 0.6],
  ] as [number, number, number][]).map(flare).join("");

  // Aurora ribbons across the upper and middle sky.
  const upper = "M0 82C46 52 92 104 138 70S206 46 240 70";
  const lower = "M0 150C52 124 100 168 150 138S212 116 240 140";
  return `<linearGradient id="${id}-aur" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${gold.light}" stop-opacity="0"/><stop offset="0.25" stop-color="${gold.light}" stop-opacity="0.55"/><stop offset="0.55" stop-color="${gold.hi}" stop-opacity="0.75"/><stop offset="0.8" stop-color="${gold.body}" stop-opacity="0.45"/><stop offset="1" stop-color="${gold.body}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="${id}-aur2" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#9B7BFF" stop-opacity="0"/><stop offset="0.3" stop-color="#B79CFF" stop-opacity="0.32"/><stop offset="0.55" stop-color="#F2B8E6" stop-opacity="0.3"/><stop offset="0.8" stop-color="${gold.light}" stop-opacity="0.35"/><stop offset="1" stop-color="${gold.light}" stop-opacity="0"/>
    </linearGradient>
    <filter id="${id}-haze" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>
    <filter id="${id}-veil" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="1.2"/></filter>
    ${field}
    <g class="${id}-au">
      <path d="${upper}" fill="none" stroke="url(#${id}-aur)" stroke-width="26" filter="url(#${id}-haze)"/>
      <path d="${lower}" fill="none" stroke="url(#${id}-aur2)" stroke-width="20" filter="url(#${id}-haze)"/>
      <path class="${id}-cu" d="${upper}" fill="none" stroke="url(#${id}-aur)" stroke-width="30" stroke-dasharray="0.7 2.3" stroke-opacity="0.45" filter="url(#${id}-veil)"/>
      <path class="${id}-cu" d="${lower}" fill="none" stroke="url(#${id}-aur2)" stroke-width="22" stroke-dasharray="0.7 2.6" stroke-opacity="0.4" filter="url(#${id}-veil)"/>
      <path d="${upper}" fill="none" stroke="${gold.hi}" stroke-width="0.8" stroke-opacity="0.55" transform="translate(0 6)" filter="url(#${id}-veil)"/>
    </g>
    ${bright}`;
}

/** The level word, letter-spaced, between two small engraved diamonds. */
function levelLabel(level: BadgeLevel, metal: Metal): string {
  const inlay = inlayOf(metal);
  const label = LEVEL_LABEL[level];
  const half = (label.length * (8 * 0.64 + 2.4)) / 2 + 6;
  const diamond = (x: number) => `<path d="M${r1(x)} 80.6 l2.6 2.6 -2.6 2.6 -2.6 -2.6Z" fill="${inlay.body}"/>`;
  return `${diamond(CX - half)}${diamond(CX + half)}
    <text x="${CX + 1.2}" y="86" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="8" letter-spacing="2.4" fill="${metal.text}">${label}</text>`;
}

const MEDALLION_Y = 193;

function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** One leaf, its base at the origin pointing along +x. */
const LEAF = "M0 0C2.8 -4.2 8 -4.6 12 0C8 4.6 2.8 4.2 0 0Z";

/** A laurel sprig curving up the left of the medallion; mirrored for the right. */
function laurel(id: string): string {
  const cy = MEDALLION_Y;
  const R = 26;
  let leaves = "";
  // From just under the medallion, up its side; leaves alternate outside / inside the stem.
  [112, 128, 144, 160, 176, 192].forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const x = CX + R * Math.cos(a);
    const y = cy + R * Math.sin(a);
    const tangent = deg + 90; // direction of travel (anticlockwise on screen = upward on the left)
    const splay = i % 2 === 0 ? 34 : -30; // outward, then inward
    const scale = 0.92 - i * 0.06;
    leaves += `<path d="${LEAF}" transform="translate(${r1(x)} ${r1(y)}) rotate(${tangent + splay}) scale(${scale.toFixed(2)})"/>`;
  });
  const stem = `<path d="M${r1(CX + R * Math.cos(1.92))} ${r1(cy + R * Math.sin(1.92))}A${R} ${R} 0 0 1 ${r1(CX + R * Math.cos(3.5))} ${r1(cy + R * Math.sin(3.5))}" fill="none" stroke="url(#${id}-acc)" stroke-width="1.1" stroke-linecap="round"/>`;
  const sprig = `${stem}<g fill="url(#${id}-acc)" stroke="#000000" stroke-opacity="0.14" stroke-width="0.3">${leaves}</g>`;
  return `<g>${sprig}</g><g transform="translate(${2 * CX} 0) scale(-1 1)">${sprig}</g>`;
}

/**
 * The foot of the badge: a polished medallion held by a laurel, carrying the issuing
 * organisation's logo. With no logo the medallion carries a four-point star, so the badge never
 * looks unfinished.
 */
function medallion(id: string, logo: string | null | undefined, own: Metal, logoStyle: "metal" | "original"): string {
  const cy = MEDALLION_Y;
  const metal = inlayOf(own);
  const ring = `
    <circle cx="${CX}" cy="${cy + 1.2}" r="20" fill="#0F172A" fill-opacity="0.16"/>
    <circle cx="${CX}" cy="${cy}" r="20" fill="url(#${id}-acc)"/>
    <circle cx="${CX}" cy="${cy}" r="17.6" fill="url(#${id}-accr)"/>
    <circle cx="${CX}" cy="${cy}" r="16" fill="url(#${id}-face)"/>
    <circle cx="${CX}" cy="${cy}" r="16" fill="none" stroke="${metal.shadow}" stroke-opacity="0.5" stroke-width="0.6"/>`;
  const shine = `<path d="M${CX - 13.5} ${cy - 5} A14.5 14.5 0 0 1 ${CX + 13.5} ${cy - 5}" fill="none" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="1" stroke-linecap="round"/>`;
  if (!logo) {
    return `${laurel(id)}${ring}<path d="${star(CX, cy, 9)}" fill="url(#${id}-acc)" stroke="${metal.shadow}" stroke-opacity="0.5" stroke-width="0.4"/>${shine}`;
  }
  // "metal" blends the logo into the badge: its dark tones take the metal's shadow, its light tones
  // the metal's highlight, so any brand colour reads as bronze, silver or gold. "original" keeps it.
  const dark = channels(metal.text);
  const mid = channels(metal.body);
  const light = channels(metal.light);
  const table = (i: number) => `${dark[i].toFixed(3)} ${mid[i].toFixed(3)} ${light[i].toFixed(3)}`;
  const blend = logoStyle === "metal";
  return `
    ${laurel(id)}
    ${
      blend
        ? `<filter id="${id}-duo" color-interpolation-filters="sRGB">
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncR type="table" tableValues="${table(0)}"/>
        <feFuncG type="table" tableValues="${table(1)}"/>
        <feFuncB type="table" tableValues="${table(2)}"/>
      </feComponentTransfer>
    </filter>`
        : ""
    }
    <clipPath id="${id}-logo"><circle cx="${CX}" cy="${cy}" r="14.5"/></clipPath>
    ${ring}
    <image href="${escapeXml(logo)}" x="${CX - 12.5}" y="${cy - 12.5}" width="25" height="25" preserveAspectRatio="xMidYMid meet" clip-path="url(#${id}-logo)"${blend ? ` filter="url(#${id}-duo)"` : ""}/>
    ${shine}`;
}

/** A five-pointed star, point up. */
function star5(cx: number, cy: number, r: number): string {
  const pts = Array.from({ length: 10 }, (_, k) => {
    const a = ((-90 + k * 36) * Math.PI) / 180;
    const rr = k % 2 === 0 ? r : r * 0.42;
    return `${r1(cx + rr * Math.cos(a))} ${r1(cy + rr * Math.sin(a))}`;
  });
  return `M${pts.join("L")}Z`;
}

const RATING_Y = 186;

/**
 * The foot of a Distinguished badge: the honour's rating — five stars, as many lit in gold as were
 * conferred, the rest engraved — over a fine gold rule. An honour is Arcade's, so it carries no
 * organisation's logo.
 */
function rating(id: string, stars: number, metal: Metal): string {
  const gold = inlayOf(metal);
  let row = "";
  for (let i = 0; i < 5; i++) {
    const x = CX + (i - 2) * 17;
    const lit = i < stars;
    row += lit
      ? `<path class="${id}-rs" style="animation-delay:${(i * 0.22).toFixed(2)}s" d="${star5(x, RATING_Y, 7.4)}" fill="url(#${id}-acc)" stroke="${gold.shadow}" stroke-width="0.4"/>
         <path d="${star5(x - 1.2, RATING_Y - 1.6, 2.2)}" fill="#FFFFFF" fill-opacity="0.7"/>`
      : `<path d="${star5(x, RATING_Y, 7.4)}" fill="none" stroke="${gold.light}" stroke-width="0.7" stroke-opacity="0.45"/>`;
  }
  const rule = `<path d="M${CX - 46} ${RATING_Y + 13}H${CX + 46}" stroke="${gold.light}" stroke-width="0.5" stroke-opacity="0.7"/>
    <path d="M${CX - 49} ${RATING_Y + 13} l2.4 -2.4 2.4 2.4 -2.4 2.4Z M${CX + 49} ${RATING_Y + 13} l-2.4 -2.4 -2.4 2.4 2.4 2.4Z" fill="${gold.body}"/>`;
  return `<g>${row}</g>${rule}`;
}

function star(cx: number, cy: number, r: number): string {
  return `M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z`;
}

/** Where on the rim glints sit, per silhouette: radius from the centre. */
const RIM_RADIUS: Record<Shape, number> = { COURSE: 104, EVENT: 102, EXAM: 98, SEAL: 104, STAR: 112 };

function rimPoint(shape: Shape, deg: number, extra = 0): { x: number; y: number } {
  const a = (deg * Math.PI) / 180;
  const r = RIM_RADIUS[shape] + extra;
  return { x: r1(CX + r * Math.cos(a)), y: r1(CY + r * Math.sin(a)) };
}

/** Top of each silhouette, where the crown stone sits. */
const CROWN_Y: Record<Shape, number> = { COURSE: 23, EVENT: 27, EXAM: 25, SEAL: 22, STAR: 20 };

/**
 * A round brilliant seen from above, in a polished collet: an octagonal table, eight crown facets
 * alternating light and dark, and a catch-light.
 */
function gem(id: string, shape: Shape, stone: [string, string, string]): string {
  const cy = CROWN_Y[shape];
  const pt = (r: number, k: number) => {
    const a = ((22.5 + k * 45) * Math.PI) / 180;
    return `${r1(CX + r * Math.cos(a))} ${r1(cy + r * Math.sin(a))}`;
  };
  let facets = "";
  for (let k = 0; k < 8; k++) {
    const fill = k % 2 === 0 ? stone[1] : stone[2];
    facets += `<path d="M${pt(9.4, k)}L${pt(9.4, k + 1)}L${pt(4.8, k + 1)}L${pt(4.8, k)}Z" fill="${fill}"/>`;
  }
  const table = Array.from({ length: 8 }, (_, k) => pt(4.8, k)).join("L");
  return `<g>
    <circle cx="${CX}" cy="${cy + 1}" r="12.6" fill="#000000" fill-opacity="0.28"/>
    <circle cx="${CX}" cy="${cy}" r="12.6" fill="url(#${id}-acc)"/>
    <circle cx="${CX}" cy="${cy}" r="10.4" fill="url(#${id}-accr)"/>
    ${facets}
    <path d="M${table}Z" fill="${stone[0]}"/>
    <path d="M${table}Z" fill="none" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="0.3"/>
    <circle cx="${CX - 2.8}" cy="${cy - 3}" r="1.6" fill="#FFFFFF" fill-opacity="0.9"/>
  </g>`;
}

/**
 * Motion by level, kept restrained. At rest every effect is invisible or off-canvas, so a
 * rasterised PNG is the clean static badge. CSS keyframes are scoped by `id` and switched off
 * under prefers-reduced-motion.
 *
 *   1 Foundation   — a slow light sweep across the metal
 *   2 Intermediate — + a light orbiting the rim, a soft halo, a glint
 *   3 Advanced     — + a second orbiting light, a warm halo, glints
 *   4 Expert       — no rim lights: a prismatic light runs across the sapphire band, often
 *   5 Distinguished — no rim lights: the golden aurora drifts and shimmers, stars twinkle, the
 *                     rating's stars catch the light one after another
 */
interface MotionSpec {
  sweep: number;
  orbits: 0 | 1 | 2;
  halo: boolean;
  /** Rim glints: [angle, radius, delay]. */
  glints: [number, number, number][];
  /** Expert: a prismatic light crossing the enamel band. */
  prism?: boolean;
  /** Distinguished: points of light twinkling in the dark face. */
  stars?: boolean;
}

const MOTION: Record<BadgeLevel, MotionSpec> = {
  1: { sweep: 8, orbits: 0, halo: false, glints: [] },
  2: { sweep: 6.5, orbits: 1, halo: true, glints: [[30, 4.5, 0.8]] },
  3: { sweep: 5, orbits: 2, halo: true, glints: [[210, 6, 0], [30, 5, 2.1]] },
  4: { sweep: 5, orbits: 0, halo: true, glints: [[210, 5.5, 0.4], [30, 5, 2.4]], prism: true },
  5: { sweep: 6, orbits: 0, halo: true, glints: [], stars: true },
};

/** Where the Distinguished face's points of light sit — around the lettering, never on it: x, y, size, delay. */
const FACE_STARS: [number, number, number, number][] = [
  [62, 70, 1.6, 0], [178, 74, 1.3, 1.1], [50, 122, 1.2, 2.3], [190, 128, 1.5, 0.6],
  [72, 170, 1.1, 1.8], [170, 170, 1.3, 2.9], [92, 44, 1, 3.4], [150, 44, 1.2, 1.5],
];

function motion(id: string, shape: Shape, level: BadgeLevel, metal: Metal): { before: string; after: string } {
  const outer = silhouette(shape, 0);
  const track = silhouette(shape, 2.5);
  const spec = MOTION[level];

  const spark = ([deg, r, delay]: [number, number, number]) => {
    const p = rimPoint(shape, deg, 4);
    return `<path class="${id}-st" style="animation-delay:${delay}s" opacity="0" fill="#FFFFFF" d="${star(p.x, p.y, r)}"/>`;
  };

  const lap = spec.orbits === 2 ? 5.5 : 7;
  const css = `
    @keyframes ${id}-sweep{0%,${spec.orbits === 2 ? 50 : spec.orbits === 1 ? 60 : 70}%{transform:translateX(-300px)}100%{transform:translateX(300px)}}
    @keyframes ${id}-orbit{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
    @keyframes ${id}-twinkle{0%,100%{opacity:0;transform:scale(.2) rotate(0deg)}50%{opacity:1;transform:scale(1) rotate(45deg)}}
    @keyframes ${id}-glow{0%,100%{opacity:.12}50%{opacity:.42}}
    .${id}-sw{animation:${id}-sweep ${spec.sweep}s cubic-bezier(.45,.05,.35,1) infinite}
    @keyframes ${id}-band{from{transform:translateX(-300px)}to{transform:translateX(300px)}}
    @keyframes ${id}-drift{0%,100%{transform:translateX(-5px);opacity:.85}50%{transform:translateX(5px);opacity:1}}
    @keyframes ${id}-curtain{from{stroke-dashoffset:0}to{stroke-dashoffset:-30}}
    .${id}-pr{animation:${id}-band 2.6s cubic-bezier(.45,.05,.35,1) infinite}
    .${id}-au{animation:${id}-drift 9s ease-in-out infinite}
    .${id}-cu{animation:${id}-curtain 6s linear infinite}
    @keyframes ${id}-rate{0%,70%,100%{transform:scale(1)}80%{transform:scale(1.18)}}
    .${id}-rs{transform-box:fill-box;transform-origin:center;animation:${id}-rate 4s ease-in-out infinite}
    .${id}-ob{animation:${id}-orbit ${lap}s linear infinite}
    .${id}-st{transform-box:fill-box;transform-origin:center;animation:${id}-twinkle 4.2s ease-in-out infinite}
    .${id}-gl{animation:${id}-glow 4.5s ease-in-out infinite}
    @media (prefers-reduced-motion:reduce){.${id}-sw,.${id}-pr,.${id}-ob,.${id}-st,.${id}-gl,.${id}-au,.${id}-cu,.${id}-rs{animation:none}.${id}-ob{display:none}}`;

  // Behind the rim: a soft halo for the upper levels.
  const halo = spec.halo
    ? `<filter id="${id}-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
         <path class="${id}-gl" d="${outer}" fill="none" stroke="${metal.glow}" stroke-width="5" opacity="0.12" filter="url(#${id}-blur)"/>`
    : "";
  const before = `<style>${css}</style>${halo}`;

  // A bright head riding the front of a soft tail: same clock, the head started 9% further on.
  const orbit = (start: number) => `
      <path class="${id}-ob" style="animation-delay:-${start.toFixed(2)}s" d="${track}" pathLength="100" fill="none" stroke="${metal.glow}" stroke-width="4" stroke-linecap="round" stroke-dasharray="14 86" stroke-dashoffset="200" opacity="0.45" filter="url(#${id}-soft)"/>
      <path class="${id}-ob" style="animation-delay:-${(start + lap * 0.09).toFixed(2)}s" d="${track}" pathLength="100" fill="none" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="6 94" stroke-dashoffset="200" opacity="0.9"/>`;

  const prism = spec.prism
    ? `<linearGradient id="${id}-prism" x1="0" y1="0" x2="1" y2="0">
         <stop offset="0" stop-color="#FF9CE6" stop-opacity="0"/><stop offset="0.3" stop-color="#FF9CE6" stop-opacity="0.55"/><stop offset="0.5" stop-color="#9DF3FF" stop-opacity="0.7"/><stop offset="0.7" stop-color="#FFF3A6" stop-opacity="0.55"/><stop offset="1" stop-color="#FFF3A6" stop-opacity="0"/>
       </linearGradient>
       <g clip-path="url(#${id}-bandclip)"><polygon class="${id}-pr" points="-70,-8 10,-8 -14,264 -94,264" fill="url(#${id}-prism)"/></g>`
    : "";

  const stars = spec.stars
    ? FACE_STARS.map(([x, y, r, delay]) => `<path class="${id}-st" style="animation-delay:${delay}s" opacity="0" fill="${METAL[3].hi}" d="${star(x, y, r * 2.2)}"/>`).join("")
    : "";

  const crownGlint = metal.gem
    ? `<path class="${id}-st" style="animation-delay:1.7s" opacity="0" fill="#FFFFFF" d="${star(CX + 5, CROWN_Y[shape] - 5, 6)}"/>`
    : "";

  const after = `
    <clipPath id="${id}-mclip"><path d="${outer}"/></clipPath>
    <linearGradient id="${id}-shine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="0.5" stop-color="${metal.face ? METAL[3].hi : "#FFFFFF"}" stop-opacity="${metal.face ? 0.3 : spec.orbits === 2 ? 0.6 : 0.5}"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
    <g clip-path="url(#${id}-mclip)"><polygon class="${id}-sw" points="-56,-8 12,-8 -12,264 -80,264" fill="url(#${id}-shine)"/></g>
    ${prism}
    ${stars}
    ${
      spec.orbits === 0
        ? ""
        : `<filter id="${id}-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2"/></filter>
           ${orbit(0)}${spec.orbits === 2 ? orbit(lap / 2) : ""}`
    }
    ${spec.glints.map(spark).join("")}
    ${crownGlint}`;
  return { before, after };
}

/** The complete badge as an SVG document string. */
export function renderBadgeSvg({ family, level, title: name, issuerLogoUrl, year, stars, logoStyle = "metal", animate = false, uid = "b", standalone }: BadgeArtOptions): string {
  const metal = METAL[level];
  const inlay = inlayOf(metal);
  const finish = faceOf(metal);
  const id = uid.replace(/[^a-zA-Z0-9_-]/g, "");
  const shape = shapeOf(family, level);
  const outer = silhouette(shape, 0);
  const band = silhouette(shape, RING.band);
  const bevel = silhouette(shape, RING.bevel);
  const groove = silhouette(shape, RING.groove);
  const face = silhouette(shape, RING.face);
  const beads = silhouette(shape, RING.beads);
  const keyline = silhouette(shape, RING.keyline);

  const centre = name && name.trim()
    ? title(name, shape, finish.ink)
    : `<text x="${CX}" y="126" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="18" fill="${finish.ink}">${
        family === "COURSE" ? "Course" : family === "EVENT" ? "Event" : family === "HONOUR" ? "Honour" : "Exam"
      }</text>`;

  const fx = animate ? motion(id, shape, level, metal) : { before: "", after: "" };
  const kind = level === 4 ? "CERTIFICATION" : FAMILY_LABEL[family];
  const caption = year ? `${kind}  ·  ${year}` : kind;

  // Polished metal: alternating light and dark bands read as a curved, reflective surface.
  const polishOf = (m: Metal) =>
    `<stop offset="0" stop-color="${m.light}"/><stop offset="0.16" stop-color="${m.hi}"/><stop offset="0.3" stop-color="${m.body}"/><stop offset="0.46" stop-color="${m.shadow}"/><stop offset="0.57" stop-color="${m.light}"/><stop offset="0.68" stop-color="${m.hi}"/><stop offset="0.84" stop-color="${m.body}"/><stop offset="1" stop-color="${m.deep}"/>`;
  const polish = polishOf(metal);
  const inlayPolish = polishOf(inlay);

  // The band between rim and bevel: vitreous enamel set with metal studs (Expert), or a reeded
  // coin edge in the inlay metal (every other level).
  const studs = silhouette(shape, 7.5);
  const bandFill = metal.pave
    ? `<path d="${band}" fill="#120E22"/>
    <g clip-path="url(#${id}-bandclip)"><path d="${band}" fill="url(#${id}-gloss)" opacity="0.5"/></g>
    <path d="${studs}" fill="none" stroke="#000000" stroke-opacity="0.55" stroke-width="3" stroke-linecap="round" pathLength="100" stroke-dasharray="0.01 1.6"/>
    <path d="${studs}" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" pathLength="100" stroke-dasharray="0.01 1.6"/>
    <path d="${studs}" fill="none" stroke="#D9D2EC" stroke-width="1.2" stroke-linecap="round" pathLength="100" stroke-dasharray="0.01 1.6" stroke-dashoffset="-0.3"/>
    <path d="${studs}" fill="none" stroke="#FFFFFF" stroke-width="0.6" stroke-linecap="round" pathLength="100" stroke-dasharray="0.01 1.6" stroke-dashoffset="0.25"/>`
    : metal.enamel
    ? `<path d="${band}" fill="url(#${id}-enamel)"/>
    <g clip-path="url(#${id}-bandclip)"><path d="${band}" fill="url(#${id}-gloss)"/></g>
    <path d="${studs}" fill="none" stroke="${metal.shadow}" stroke-width="2.4" stroke-linecap="round" pathLength="100" stroke-dasharray="0.01 4.1666" stroke-opacity="0.7"/>
    <path d="${studs}" fill="none" stroke="${metal.hi}" stroke-width="1.8" stroke-linecap="round" pathLength="100" stroke-dasharray="0.01 4.1666"/>`
    : `<path d="${band}" fill="url(#${id}-band)"/>
    <g clip-path="url(#${id}-bandclip)">
      <path d="${band}" fill="url(#${id}-acc)" opacity="0.55"/>
      <path d="${reeding(150)}" stroke="${inlay.deep}" stroke-opacity="0.45" stroke-width="0.9"/>
      <path d="${reeding(150, 0.9)}" stroke="${inlay.hi}" stroke-opacity="0.55" stroke-width="0.6"/>
    </g>`;

  const svg = `
    <defs>
      <linearGradient id="${id}-rim" x1="0" y1="0" x2="1" y2="1">${polish}</linearGradient>
      <linearGradient id="${id}-rimr" x1="1" y1="1" x2="0" y2="0">${polish}</linearGradient>
      <linearGradient id="${id}-acc" x1="0" y1="0" x2="1" y2="1">${inlayPolish}</linearGradient>
      <linearGradient id="${id}-accr" x1="1" y1="1" x2="0" y2="0">${inlayPolish}</linearGradient>
      <linearGradient id="${id}-band" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${inlay.body}"/><stop offset="0.5" stop-color="${inlay.shadow}"/><stop offset="1" stop-color="${inlay.body}"/>
      </linearGradient>
      ${
        metal.enamel
          ? `<linearGradient id="${id}-enamel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${metal.enamel[0]}"/><stop offset="0.45" stop-color="${metal.enamel[1]}"/><stop offset="1" stop-color="${metal.enamel[2]}"/>
      </linearGradient>`
          : ""
      }
      <radialGradient id="${id}-face" cx="0.4" cy="0.3" r="0.9">
        <stop offset="0" stop-color="${finish.centre}"/><stop offset="0.55" stop-color="${finish.centre}"/><stop offset="1" stop-color="${finish.edge}"/>
      </radialGradient>
      <radialGradient id="${id}-clear" cx="0.5" cy="0.47" r="0.5">
        <stop offset="0" stop-color="${finish.centre}" stop-opacity="0.92"/><stop offset="0.55" stop-color="${finish.centre}" stop-opacity="0.75"/><stop offset="1" stop-color="${finish.centre}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${id}-gloss" x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.32"/><stop offset="0.38" stop-color="#FFFFFF" stop-opacity="0.07"/><stop offset="0.39" stop-color="#FFFFFF" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="${id}-edge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.95"/><stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0.15"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0.45"/>
      </linearGradient>
      <clipPath id="${id}-bandclip"><path d="${band} ${bevel}" clip-rule="evenodd"/></clipPath>
      <clipPath id="${id}-faceclip"><path d="${face}"/></clipPath>
      <clipPath id="${id}-mclip0"><path d="${outer}"/></clipPath>
      <linearGradient id="${id}-mono" gradientUnits="userSpaceOnUse" x1="0" y1="56" x2="0" y2="70">
        ${
          metal.enamel
            ? `<stop offset="0" stop-color="${metal.enamel[1]}"/><stop offset="0.5" stop-color="${metal.enamel[2]}"/><stop offset="1" stop-color="${metal.enamel[1]}"/>`
            : metal.face
            ? `<stop offset="0" stop-color="${inlay.hi}"/><stop offset="0.5" stop-color="${inlay.light}"/><stop offset="1" stop-color="${inlay.body}"/>`
            : `<stop offset="0" stop-color="${metal.shadow}"/><stop offset="0.5" stop-color="${metal.deep}"/><stop offset="1" stop-color="${metal.shadow}"/>`
        }
      </linearGradient>
      <linearGradient id="${id}-sheen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${metal.face ? inlay.light : metal.tint}" stop-opacity="0"/><stop offset="0.5" stop-color="${metal.face ? inlay.light : metal.tint}" stop-opacity="${metal.face ? 0.08 : 0.55}"/><stop offset="1" stop-color="${metal.face ? inlay.light : metal.tint}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <ellipse cx="${CX}" cy="247" rx="70" ry="5.5" fill="#0F172A" fill-opacity="0.13"/>
    ${fx.before}
    <path d="${outer}" fill="url(#${id}-rim)"/>
    ${shape === "STAR" ? `<g clip-path="url(#${id}-mclip0)">${starFacets(metal)}</g>` : ""}
    <path d="${outer}" fill="none" stroke="${metal.deep}" stroke-opacity="0.55" stroke-width="0.8"/>
    <path d="${silhouette(shape, 0.9)}" fill="none" stroke="url(#${id}-edge)" stroke-width="0.9"/>
    ${bandFill}
    <path d="${band}" fill="none" stroke="${metal.deep}" stroke-opacity="0.45" stroke-width="0.6"/>
    <path d="${bevel}" fill="url(#${id}-rimr)"/>
    <path d="${groove}" fill="none" stroke="${metal.face ? inlay.body : metal.deep}" stroke-opacity="${metal.face ? 0.9 : 0.55}" stroke-width="0.9"/>
    <path d="${face}" fill="url(#${id}-face)"/>
    <g clip-path="url(#${id}-faceclip)">
      ${metal.face ? cosmos(id) : sunburst(id, finish)}
      <ellipse cx="${CX}" cy="${CY - 2}" rx="84" ry="66" fill="url(#${id}-clear)" opacity="${metal.face ? 0.35 : 1}"/>
    </g>
    <path d="${face}" fill="none" stroke="${metal.face ? inlay.shadow : metal.shadow}" stroke-opacity="0.6" stroke-width="0.8"/>
    <path d="${beads}" fill="none" stroke="${inlay.body}" stroke-width="1.4" stroke-dasharray="0.1 2.7" stroke-linecap="round" stroke-opacity="0.95"/>
    <path d="${keyline}" fill="none" stroke="${metal.line}" stroke-width="0.8" stroke-opacity="0.9"/>
    ${wordmark(id, finish.strike)}
    ${levelLabel(level, metal)}
    ${centre}
    <text x="${CX}" y="160" text-anchor="middle" font-family="${FONT}" font-weight="600" font-size="6.4" letter-spacing="1.5" fill="${finish.muted}" xml:space="preserve">${escapeXml(caption)}</text>
    ${level === 5 ? rating(id, Math.max(1, Math.min(5, Math.round(stars ?? 5))), metal) : medallion(id, issuerLogoUrl, metal, logoStyle)}
    ${metal.gem ? gem(id, shape, metal.gem) : ""}
    <path d="${outer}" fill="url(#${id}-gloss)" pointer-events="none"/>
    ${fx.after}`;

  const attrs = `viewBox="0 0 ${BADGE_ART_VIEWBOX.width} ${BADGE_ART_VIEWBOX.height}"${
    standalone ? ` xmlns="http://www.w3.org/2000/svg" width="${BADGE_ART_VIEWBOX.width * 2}" height="${BADGE_ART_VIEWBOX.height * 2}"` : ""
  }${animate ? ` overflow="visible"` : ""} role="img"`;
  const heading = standalone ? `<title>${escapeXml(`Arcade ${FAMILY_LABEL[family].toLowerCase()} badge, level ${level}${name ? ` — ${name}` : ""}`)}</title>` : "";
  return `<svg ${attrs}>${heading}${svg}</svg>`;
}

/**
 * Whether a family carries a level — mirrors the backend's `BadgeFamily.offers`: levels 1–3 on
 * content, Expert on exams (with a certification), Distinguished only as an honour.
 */
function offers(family: BadgeFamilyKey, level: number): boolean {
  if (family === "HONOUR") return level === 5;
  return family === "EXAM" ? level <= 4 : level <= 3;
}

/** `ARC-COURSE-L3` → its parts, or null for anything else. */
export function parseBadgeClassCode(code: string): { family: BadgeFamilyKey; level: BadgeLevel } | null {
  const m = /^ARC-(COURSE|EVENT|EXAM|HONOUR)-L([1-5])$/.exec(code.trim().toUpperCase());
  if (!m || !offers(m[1] as BadgeFamilyKey, Number(m[2]))) return null;
  return { family: m[1] as BadgeFamilyKey, level: Number(m[2]) as BadgeLevel };
}

export function badgeClassCode(family: BadgeFamilyKey, level: BadgeLevel): string {
  return `ARC-${family}-L${level}`;
}
