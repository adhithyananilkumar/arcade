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
 *   title  → the content's name; the Arcade wordmark above it, the issuing organisation's logo below
 *
 * Minimal — a white face, a muted metal rim, clean type — so a badge reads like a professional
 * credential rather than a game trophy.
 *
 * A pure string builder rather than a React component so the same bytes serve the in-app
 * <CredentialBadge>, the downloadable image, and the Open Badges `image` URL
 * (app/(public)/credentials/art/[classCode]).
 * ------------------------------------------------------------------
 */

import { ARCADE_WORDMARK_PATHS, ARCADE_WORDMARK_VIEWBOX } from "./arcadeWordmark";

export type BadgeFamilyKey = "COURSE" | "EVENT" | "EXAM";
export type BadgeLevel = 1 | 2 | 3;

/**
 * Each level's metal — bronze, silver, gold — in muted, printed-medal tones rather than bright
 * primaries: a three-stop rim (highlight → body → shadow) and a faint tint for the face.
 */
const METAL: Record<BadgeLevel, { rim: [string, string, string]; tint: string; line: string }> = {
  1: { rim: ["#DCC3AE", "#BF9D83", "#9C7A62"], tint: "#FBF8F5", line: "#D2B9A4" }, // Foundation: bronze
  2: { rim: ["#DDE1E6", "#A7AFBA", "#6C7582"], tint: "#F5F7F9", line: "#B8C0CA" }, // Intermediate: silver
  3: { rim: ["#E8CF8C", "#C29C4C", "#86651F"], tint: "#FBF7EC", line: "#D6B96E" }, // Advanced: gold
};
const INK = "#1A2238";
const MUTED = "#6B7385";

const FAMILY_LABEL: Record<BadgeFamilyKey, string> = {
  COURSE: "COURSE COMPLETION",
  EVENT: "EVENT PARTICIPATION",
  EXAM: "ASSESSMENT",
};

const FONT = "'Inter','Google Sans','Segoe UI',Helvetica,Arial,sans-serif";

export const BADGE_ART_VIEWBOX = { width: 240, height: 256 } as const;

// ── Geometry ─────────────────────────────────────────────────────────────────────────────────

const CX = 120;
const CY = 124;

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

function silhouette(family: BadgeFamilyKey, inset: number): string {
  if (family === "COURSE") return hexagon(110 - inset, 12 - inset * 0.3);
  if (family === "EVENT") return circle(104 - inset);
  return shield(inset);
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
  for (const size of [19, 17, 15, 13.5, 12]) {
    const lines = wrap(text, Math.floor(width / (size * 0.56)));
    if (lines.length <= 3) return { size, lines };
  }
  const size = 12;
  const lines = wrap(text, Math.floor(width / (size * 0.56)));
  const kept = lines.slice(0, 3);
  kept[2] = kept[2].replace(/\s*\S*$/, "").trimEnd() + "…";
  return { size, lines: kept };
}

function title(text: string, family: BadgeFamilyKey): string {
  const width = family === "EVENT" ? 138 : 150;
  const { size, lines } = layoutTitle(text, width);
  const lineHeight = size * 1.18;
  const blockCenter = 112;
  const first = blockCenter - ((lines.length - 1) * lineHeight) / 2 + size * 0.35;
  return lines
    .map(
      (l, i) =>
        `<text x="${CX}" y="${(first + i * lineHeight).toFixed(1)}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="${size}" fill="${INK}">${escapeXml(l)}</text>`
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
  /** Prefix for gradient ids — must be unique per badge on a page. */
  uid?: string;
  /** Adds the xmlns and a <title>, for a standalone .svg file. */
  standalone?: boolean;
}

export function isBadgeLevel(n: number): n is BadgeLevel {
  return Number.isInteger(n) && n >= 1 && n <= 3;
}

function wordmark(): string {
  const width = 66;
  const scale = width / ARCADE_WORDMARK_VIEWBOX.width;
  const x = CX - width / 2;
  return `<g transform="translate(${x.toFixed(2)} 54) scale(${scale.toFixed(4)})" fill="${INK}">${ARCADE_WORDMARK_PATHS.map(
    (d) => `<path d="${d}"/>`
  ).join("")}</g>`;
}

function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * The organisation's logo, recoloured into the badge's metal: a duotone that maps the logo's dark
 * tones to the metal's shadow and its light tones to the face, so any brand colour reads as bronze,
 * silver or gold. Nothing is drawn when there is no logo.
 */
function medallion(id: string, logo: string | null | undefined, metal: (typeof METAL)[BadgeLevel]): string {
  if (!logo) return "";
  const cy = 186;
  const dark = channels(metal.rim[2]);
  const light = channels(metal.tint);
  const table = (i: number) => `${dark[i].toFixed(3)} ${light[i].toFixed(3)}`;
  return `
    <filter id="${id}-duo" color-interpolation-filters="sRGB">
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncR type="table" tableValues="${table(0)}"/>
        <feFuncG type="table" tableValues="${table(1)}"/>
        <feFuncB type="table" tableValues="${table(2)}"/>
      </feComponentTransfer>
    </filter>
    <clipPath id="${id}-logo"><circle cx="${CX}" cy="${cy}" r="14"/></clipPath>
    <circle cx="${CX}" cy="${cy}" r="16.5" fill="${metal.tint}" stroke="url(#${id}-rim)" stroke-width="2"/>
    <image href="${escapeXml(logo)}" x="${CX - 14}" y="${cy - 14}" width="28" height="28" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id}-logo)" filter="url(#${id}-duo)"/>`;
}

/** The complete badge as an SVG document string. */
export function renderBadgeSvg({ family, level, title: name, issuerLogoUrl, uid = "b", standalone }: BadgeArtOptions): string {
  const metal = METAL[level];
  const id = uid.replace(/[^a-zA-Z0-9_-]/g, "");
  const outer = silhouette(family, 0);
  const face = silhouette(family, 7);
  const inner = silhouette(family, 12);

  const centre = name && name.trim()
    ? title(name, family)
    : `<text x="${CX}" y="118" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="18" fill="${INK}">${
        family === "COURSE" ? "Course" : family === "EVENT" ? "Event" : "Exam"
      }</text>`;

  const svg = `
    <defs>
      <linearGradient id="${id}-rim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${metal.rim[0]}"/><stop offset="0.5" stop-color="${metal.rim[1]}"/><stop offset="1" stop-color="${metal.rim[2]}"/>
      </linearGradient>
      <linearGradient id="${id}-face" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="${metal.tint}"/>
      </linearGradient>
      <clipPath id="${id}-clip"><path d="${face}"/></clipPath>
    </defs>
    <ellipse cx="${CX}" cy="246" rx="70" ry="6" fill="#0F172A" fill-opacity="0.07"/>
    <path d="${outer}" fill="url(#${id}-rim)"/>
    <path d="${face}" fill="url(#${id}-face)"/>
    <g clip-path="url(#${id}-clip)">
      <path d="M0 196 C60 176 150 222 240 190 V256 H0 Z" fill="url(#${id}-rim)" fill-opacity="0.10"/>
    </g>
    <path d="${inner}" fill="none" stroke="${metal.line}" stroke-width="1" stroke-opacity="0.7"/>
    ${wordmark()}
    ${centre}
    <text x="${CX}" y="156" text-anchor="middle" font-family="${FONT}" font-weight="600" font-size="7.2" letter-spacing="1.6" fill="${MUTED}">${FAMILY_LABEL[family]}</text>
    ${medallion(id, issuerLogoUrl, metal)}`;

  const attrs = `viewBox="0 0 ${BADGE_ART_VIEWBOX.width} ${BADGE_ART_VIEWBOX.height}"${
    standalone ? ` xmlns="http://www.w3.org/2000/svg" width="${BADGE_ART_VIEWBOX.width * 2}" height="${BADGE_ART_VIEWBOX.height * 2}"` : ""
  } role="img"`;
  const heading = standalone ? `<title>${escapeXml(`Arcade ${FAMILY_LABEL[family].toLowerCase()} badge, level ${level}${name ? ` — ${name}` : ""}`)}</title>` : "";
  return `<svg ${attrs}>${heading}${svg}</svg>`;
}

/** `ARC-COURSE-L3` → its parts, or null for anything else. */
export function parseBadgeClassCode(code: string): { family: BadgeFamilyKey; level: BadgeLevel } | null {
  const m = /^ARC-(COURSE|EVENT|EXAM)-L([1-3])$/.exec(code.trim().toUpperCase());
  if (!m) return null;
  return { family: m[1] as BadgeFamilyKey, level: Number(m[2]) as BadgeLevel };
}

export function badgeClassCode(family: BadgeFamilyKey, level: BadgeLevel): string {
  return `ARC-${family}-L${level}`;
}
