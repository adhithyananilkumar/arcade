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
 * Reads like a professional certification mark (Oracle / AWS style), not a game trophy: a bevelled
 * metal rim, a double keyline, then a fixed type hierarchy — wordmark, LEVEL, content name, family ·
 * year — and the issuing organisation's logo in its own colours on a metal-ringed medallion.
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
const METAL: Record<BadgeLevel, { rim: [string, string, string]; tint: string; line: string; text: string }> = {
  1: { rim: ["#E6CFBB", "#BF9D83", "#8E6B53"], tint: "#F8F2EC", line: "#CDAF98", text: "#86604A" }, // Foundation: bronze
  2: { rim: ["#EEF0F3", "#A7AFBA", "#5F6875"], tint: "#F1F4F7", line: "#B1BAC5", text: "#566070" }, // Intermediate: silver
  3: { rim: ["#F2DDA0", "#C29C4C", "#7A5A18"], tint: "#FAF3E0", line: "#D1B166", text: "#76561A" }, // Advanced: gold
};
const LEVEL_LABEL: Record<BadgeLevel, string> = { 1: "FOUNDATION", 2: "INTERMEDIATE", 3: "ADVANCED" };
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

function title(text: string, family: BadgeFamilyKey): string {
  const width = family === "EVENT" ? 138 : 150;
  const { size, lines } = layoutTitle(text, width);
  const lineHeight = size * 1.18;
  const blockCenter = 122;
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
  /** Year earned, printed beside the family label. Omitted for unearned and generic artwork. */
  year?: number | null;
  /** "metal" (default) blends the logo into bronze/silver/gold; "original" keeps its own colours. */
  logoStyle?: "metal" | "original";
  /** Top tiers shimmer (Intermediate) and glint (Advanced). Off for files and images. */
  animate?: boolean;
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

const MEDALLION_Y = 193;

/**
 * The foot of the badge: a hairline rule either side of a medallion carrying the issuing
 * organisation's logo in its own colours (on white, as on Oracle/AWS partner marks). With no logo
 * the rule closes on a small diamond instead, so the badge never looks unfinished.
 */
function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function medallion(id: string, logo: string | null | undefined, metal: (typeof METAL)[BadgeLevel], logoStyle: "metal" | "original"): string {
  const cy = MEDALLION_Y;
  const rules = [-1, 1]
    .map((s) => {
      const from = CX + s * (logo ? 27 : 9);
      const to = CX + s * 47;
      return `<line x1="${from}" y1="${cy}" x2="${to}" y2="${cy}" stroke="${metal.rim[1]}" stroke-width="0.9" stroke-opacity="0.8"/>`;
    })
    .join("");
  if (!logo) {
    return `${rules}<path d="M${CX} ${cy - 4} L${CX + 4} ${cy} L${CX} ${cy + 4} L${CX - 4} ${cy} Z" fill="${metal.rim[1]}"/>`;
  }
  // "metal" blends the logo into the badge: its dark tones take the metal's shadow, its light tones
  // the metal's highlight, so any brand colour reads as bronze, silver or gold. "original" keeps it.
  const dark = channels(metal.text);
  const mid = channels(metal.rim[1]);
  const light = channels(metal.rim[0]);
  const table = (i: number) => `${dark[i].toFixed(3)} ${mid[i].toFixed(3)} ${light[i].toFixed(3)}`;
  const blend = logoStyle === "metal";
  return `
    ${rules}
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
    <clipPath id="${id}-logo"><circle cx="${CX}" cy="${cy}" r="16"/></clipPath>
    <circle cx="${CX}" cy="${cy + 1}" r="22" fill="#0F172A" fill-opacity="0.10"/>
    <circle cx="${CX}" cy="${cy}" r="22" fill="url(#${id}-rim)"/>
    <circle cx="${CX}" cy="${cy}" r="19.5" fill="url(#${id}-rimr)"/>
    <circle cx="${CX}" cy="${cy}" r="18" fill="url(#${id}-face)"/>
    <image href="${escapeXml(logo)}" x="${CX - 14}" y="${cy - 14}" width="28" height="28" preserveAspectRatio="xMidYMid meet" clip-path="url(#${id}-logo)"${blend ? ` filter="url(#${id}-duo)"` : ""}/>
    <path d="M${CX - 15} ${cy - 5} A16 16 0 0 1 ${CX + 15} ${cy - 5}" fill="none" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="1.2" stroke-linecap="round"/>`;
}

function star(cx: number, cy: number, r: number): string {
  return `M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z`;
}

const SPARKLE_RADIUS: Record<BadgeFamilyKey, number> = { COURSE: 108, EVENT: 102, EXAM: 100 };

/**
 * Motion for the top tiers only — Foundation stays still. Intermediate gets a slow light sweep
 * across the metal; Advanced adds a faster sweep, glints on the rim and a breathing glow. Plain
 * CSS keyframes (scoped by `id`), switched off under prefers-reduced-motion. At rest everything is
 * invisible or off-canvas, so a rasterised PNG is the clean static badge.
 */
function motion(id: string, family: BadgeFamilyKey, level: BadgeLevel, clipPathD: string): { before: string; after: string } {
  if (level === 1) return { before: "", after: "" };
  const top = level === 3;
  const spark = (deg: number, r: number, delay: number) => {
    const a = (deg * Math.PI) / 180;
    const x = CX + SPARKLE_RADIUS[family] * Math.cos(a);
    const y = CY + SPARKLE_RADIUS[family] * Math.sin(a);
    return `<path class="${id}-st" style="animation-delay:${delay}s" opacity="0" fill="#FFFFFF" d="${star(+x.toFixed(1), +y.toFixed(1), r)}"/>`;
  };
  const css = `
    @keyframes ${id}-sweep{0%,${top ? 45 : 60}%{transform:translateX(-300px)}100%{transform:translateX(300px)}}
    @keyframes ${id}-twinkle{0%,100%{opacity:0;transform:scale(.2) rotate(0deg)}50%{opacity:1;transform:scale(1) rotate(45deg)}}
    @keyframes ${id}-glow{0%,100%{opacity:.15}50%{opacity:.75}}
    .${id}-sw{animation:${id}-sweep ${top ? 4.5 : 6.5}s cubic-bezier(.45,.05,.35,1) infinite}
    .${id}-st{transform-box:fill-box;transform-origin:center;animation:${id}-twinkle 3.6s ease-in-out infinite}
    .${id}-gl{animation:${id}-glow 3.6s ease-in-out infinite}
    @media (prefers-reduced-motion:reduce){.${id}-sw,.${id}-st,.${id}-gl{animation:none}}`;
  const before = top
    ? `<filter id="${id}-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
       <path class="${id}-gl" d="${silhouette(family, 0)}" fill="none" stroke="#F2D27A" stroke-width="7" opacity="0" filter="url(#${id}-blur)"/>`
    : "";
  const after = `
    <style>${css}</style>
    <clipPath id="${id}-mclip"><path d="${clipPathD}"/></clipPath>
    <linearGradient id="${id}-shine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="0.5" stop-color="#FFFFFF" stop-opacity="${top ? 0.7 : 0.5}"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
    <g clip-path="url(#${id}-mclip)"><polygon class="${id}-sw" points="-56,-8 12,-8 -12,264 -80,264" fill="url(#${id}-shine)"/></g>
    ${top ? `${spark(210, 7, 0)}${spark(30, 6, 1.4)}${spark(262, 4.5, 2.4)}` : spark(30, 5, 0.8)}`;
  return { before, after };
}

/** The complete badge as an SVG document string. */
export function renderBadgeSvg({ family, level, title: name, issuerLogoUrl, year, logoStyle = "metal", animate = false, uid = "b", standalone }: BadgeArtOptions): string {
  const metal = METAL[level];
  const id = uid.replace(/[^a-zA-Z0-9_-]/g, "");
  const outer = silhouette(family, 0);
  const bevel = silhouette(family, 4.5);
  const face = silhouette(family, 8);
  const keyline = silhouette(family, 12);
  const keyline2 = silhouette(family, 15);

  const centre = name && name.trim()
    ? title(name, family)
    : `<text x="${CX}" y="126" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="18" fill="${INK}">${
        family === "COURSE" ? "Course" : family === "EVENT" ? "Event" : "Exam"
      }</text>`;

  const fx = animate ? motion(id, family, level, outer) : { before: "", after: "" };
  const beads = silhouette(family, 10.5);
  const caption = year ? `${FAMILY_LABEL[family]}  ·  ${year}` : FAMILY_LABEL[family];

  const svg = `
    <defs>
      <linearGradient id="${id}-rim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${metal.rim[0]}"/><stop offset="0.45" stop-color="${metal.rim[1]}"/><stop offset="1" stop-color="${metal.rim[2]}"/>
      </linearGradient>
      <linearGradient id="${id}-rimr" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${metal.rim[2]}"/><stop offset="0.55" stop-color="${metal.rim[1]}"/><stop offset="1" stop-color="${metal.rim[0]}"/>
      </linearGradient>
      <radialGradient id="${id}-face" cx="0.38" cy="0.28" r="0.95">
        <stop offset="0" stop-color="#FFFFFF"/><stop offset="0.6" stop-color="#FFFFFF"/><stop offset="1" stop-color="${metal.tint}"/>
      </radialGradient>
      <linearGradient id="${id}-gloss" x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.30"/><stop offset="0.38" stop-color="#FFFFFF" stop-opacity="0.07"/><stop offset="0.39" stop-color="#FFFFFF" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <ellipse cx="${CX}" cy="247" rx="68" ry="5.5" fill="#0F172A" fill-opacity="0.10"/>
    ${fx.before}
    <path d="${outer}" fill="url(#${id}-rim)"/>
    <path d="${outer}" fill="none" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="0.8"/>
    <path d="${bevel}" fill="url(#${id}-rimr)"/>
    <path d="${face}" fill="url(#${id}-face)"/>
    <path d="${face}" fill="none" stroke="${metal.rim[2]}" stroke-opacity="0.55" stroke-width="0.8"/>
    <path d="${beads}" fill="none" stroke="${metal.rim[1]}" stroke-width="1.3" stroke-dasharray="0.1 2.6" stroke-linecap="round" stroke-opacity="0.9"/>
    <path d="${keyline}" fill="none" stroke="${metal.line}" stroke-width="1" stroke-opacity="0.9"/>
    <path d="${keyline2}" fill="none" stroke="${metal.line}" stroke-width="0.5" stroke-opacity="0.7"/>
    ${wordmark()}
    <text x="${CX}" y="86" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="8" letter-spacing="2.4" fill="${metal.text}">${LEVEL_LABEL[level]}</text>
    ${centre}
    <text x="${CX}" y="160" text-anchor="middle" font-family="${FONT}" font-weight="600" font-size="6.6" letter-spacing="1.5" fill="${MUTED}" xml:space="preserve">${escapeXml(caption)}</text>
    ${medallion(id, issuerLogoUrl, metal, logoStyle)}
    <path d="${outer}" fill="url(#${id}-gloss)" pointer-events="none"/>
    ${fx.after}`;

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
