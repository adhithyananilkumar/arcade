/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Credentials
 *
 * The platform badge artwork. One design for the whole platform; nobody draws their own.
 *
 *   family → silhouette            (course: hexagon · event: circle · exam: shield)
 *   level  → colour and name        (1 Foundation teal · 2 Intermediate violet · 3 Advanced amber)
 *   title  → the content's name, printed in the middle of the badge
 *
 * Minimal but colourful — a white face, one gradient per level, clean type — so a badge reads like a
 * professional credential rather than a game trophy.
 *
 * A pure string builder rather than a React component so the same bytes serve the in-app
 * <CredentialBadge>, the downloadable image, and the Open Badges `image` URL
 * (app/(public)/credentials/art/[classCode]).
 * ------------------------------------------------------------------
 */

export type BadgeFamilyKey = "COURSE" | "EVENT" | "EXAM";
export type BadgeLevel = 1 | 2 | 3;

/**
 * Each level's colour: a two-stop gradient for the rim and level band. Distinct hues rather than
 * shades of one, so the level reads at a glance even at thumbnail size.
 */
const TONE: Record<BadgeLevel, { from: string; to: string; tint: string }> = {
  1: { from: "#14B8A6", to: "#0EA5E9", tint: "#E6FAF8" }, // Foundation: teal → sky
  2: { from: "#3B82F6", to: "#7C3AED", tint: "#EEF0FF" }, // Intermediate: blue → violet
  3: { from: "#F59E0B", to: "#E11D48", tint: "#FFF3E8" }, // Advanced: amber → rose
};
const LEVEL_NAME: Record<BadgeLevel, string> = { 1: "FOUNDATION", 2: "INTERMEDIATE", 3: "ADVANCED" };
const INK = "#14142B";
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
  const blockCenter = 104;
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
  /** Prefix for gradient ids — must be unique per badge on a page. */
  uid?: string;
  /** Adds the xmlns and a <title>, for a standalone .svg file. */
  standalone?: boolean;
}

export function isBadgeLevel(n: number): n is BadgeLevel {
  return Number.isInteger(n) && n >= 1 && n <= 3;
}

/** The complete badge as an SVG document string. */
export function renderBadgeSvg({ family, level, title: name, uid = "b", standalone }: BadgeArtOptions): string {
  const tone = TONE[level];
  const id = uid.replace(/[^a-zA-Z0-9_-]/g, "");
  const outer = silhouette(family, 0);
  const face = silhouette(family, 7);
  const inner = silhouette(family, 12);

  const centre = name && name.trim()
    ? title(name, family)
    : `<text x="${CX}" y="110" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="18" fill="${INK}">${
        family === "COURSE" ? "Course" : family === "EVENT" ? "Event" : "Exam"
      }</text>`;

  // A soft sweep across the lower face in the level's colours: the one decorative gesture.
  const sweep = `<path d="M0 176 C60 150 150 206 240 164 V256 H0 Z" fill="url(#${id}-rim)" fill-opacity="0.12"/>
    <path d="M0 196 C70 172 160 222 240 186 V256 H0 Z" fill="url(#${id}-rim)" fill-opacity="0.10"/>`;

  const svg = `
    <defs>
      <linearGradient id="${id}-rim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${tone.from}"/><stop offset="1" stop-color="${tone.to}"/>
      </linearGradient>
      <linearGradient id="${id}-face" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="${tone.tint}"/>
      </linearGradient>
      <clipPath id="${id}-clip"><path d="${face}"/></clipPath>
    </defs>
    <ellipse cx="${CX}" cy="246" rx="70" ry="6" fill="#0F172A" fill-opacity="0.07"/>
    <path d="${outer}" fill="url(#${id}-rim)"/>
    <path d="${face}" fill="url(#${id}-face)"/>
    <g clip-path="url(#${id}-clip)">${sweep}</g>
    <path d="${inner}" fill="none" stroke="url(#${id}-rim)" stroke-width="1" stroke-opacity="0.45"/>
    <text x="${CX}" y="58" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="8.5" letter-spacing="3.2" fill="url(#${id}-rim)">ARCADE</text>
    <rect x="${CX - 9}" y="65" width="18" height="2" rx="1" fill="url(#${id}-rim)"/>
    ${centre}
    <text x="${CX}" y="148" text-anchor="middle" font-family="${FONT}" font-weight="600" font-size="7.2" letter-spacing="1.6" fill="${MUTED}">${FAMILY_LABEL[family]}</text>
    <rect x="50" y="158" width="140" height="23" rx="11.5" fill="url(#${id}-rim)"/>
    <text x="${CX}" y="172.8" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="8" letter-spacing="1.1" fill="#FFFFFF">LEVEL ${level} · ${LEVEL_NAME[level]}</text>`;

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
