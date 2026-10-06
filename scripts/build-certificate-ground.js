/**
 * Generates the certificate "ground": the artwork every Arcade certificate is printed on — a
 * layered paper-cut border (wavy cut-paper layers in navy, steel blue, sand and gold, each casting
 * a soft shadow) around a paper card covered in a faint hand-hatched security pattern. All the text,
 * the host lockup and the QR seal are laid over it by the two renderers:
 *   - backend  CertificateDocument (PDF)  → backend/src/main/resources/pdf/brand/certificate-ground.svg
 *   - frontend CertificateFace (screen)   → ui/public/credentials/certificate-ground.svg
 *
 * Deterministic (seeded), so re-running produces the identical file. Units are millimetres on an
 * A4 landscape page (297 × 210). Run:  node ui/scripts/build-certificate-ground.js
 */
const fs = require("fs");
const path = require("path");

const W = 297;
const H = 210;

// Outer border shape and the paper card inside it.
const OUTER = { x: 4, y: 4, w: W - 8, h: H - 8, r: 8 };
const CARD = { x: 13, y: 12, w: W - 26, h: H - 24, r: 6 };

const PAPER = "#FCFBF8";
const PAPER_INK = "#EAE6DC";
// The paper-cut layers, outermost first.
const LAYERS = ["#1F2C4F", "#3E5679", "#7C93B2", "#D9C59A", "#B8964F", "#EFE6D2"];

// ── seeded RNG ────────────────────────────────────────────────────────────
let seed = 20251030;
function rnd() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}
const between = (a, b) => a + rnd() * (b - a);
const f = (n) => Number(n.toFixed(1));
const TAU = Math.PI * 2;

// ── geometry ──────────────────────────────────────────────────────────────
/** Clips segment p→q to a convex polygon (Cyrus–Beck). Returns [p', q'] or null. */
function clipToConvex(p, q, poly) {
  let t0 = 0, t1 = 1;
  const d = { x: q.x - p.x, y: q.y - p.y };
  // Orientation, so normals point inward whichever way the polygon winds.
  let area = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    area += a.x * b.y - b.x * a.y;
  }
  const s = area > 0 ? 1 : -1;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const n = { x: -(b.y - a.y) * s, y: (b.x - a.x) * s };
    const num = n.x * (p.x - a.x) + n.y * (p.y - a.y);
    const den = n.x * d.x + n.y * d.y;
    if (den === 0) {
      if (num < 0) return null;
      continue;
    }
    const t = -num / den;
    if (den > 0) t0 = Math.max(t0, t);
    else t1 = Math.min(t1, t);
    if (t0 > t1) return null;
  }
  return [{ x: p.x + d.x * t0, y: p.y + d.y * t0 }, { x: p.x + d.x * t1, y: p.y + d.y * t1 }];
}

/** Parallel strokes across a convex polygon at angle `a`, `gap` apart, as path data. */
function hatch(poly, a, gap, jitter = 0) {
  const xs = poly.map((p) => p.x), ys = poly.map((p) => p.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const R = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2 + 1;
  const dir = { x: Math.cos(a), y: Math.sin(a) };
  const nrm = { x: -dir.y, y: dir.x };
  let d = "";
  for (let o = -R; o <= R; o += gap) {
    const off = o + (jitter ? between(-jitter, jitter) : 0);
    const c = { x: cx + nrm.x * off, y: cy + nrm.y * off };
    const seg = clipToConvex(
      { x: c.x - dir.x * R, y: c.y - dir.y * R },
      { x: c.x + dir.x * R, y: c.y + dir.y * R },
      poly,
    );
    if (!seg) continue;
    // Hand-drawn feel: strokes stop a little short at random.
    const [p, q] = seg;
    const len = Math.hypot(q.x - p.x, q.y - p.y);
    if (len < 0.6) continue;
    const a0 = jitter ? between(0, 0.18) : 0, a1 = jitter ? between(0.82, 1) : 1;
    d += `M${f(p.x + (q.x - p.x) * a0)} ${f(p.y + (q.y - p.y) * a0)}L${f(p.x + (q.x - p.x) * a1)} ${f(p.y + (q.y - p.y) * a1)}`;
  }
  return d;
}

const rrect = (r, extra = "") =>
  `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${r.r}" ry="${r.r}" ${extra}/>`;

/** Hand-engraved tufts — short hatch patches in random directions on a grid — over a region. */
function tufts(region) {
  const cell = 6.2;
  let d = "";
  for (let y = region.y - cell; y < region.y + region.h + cell; y += cell) {
    for (let x = region.x - cell; x < region.x + region.w + cell; x += cell) {
      // Tufts overlap neighbouring cells slightly so the grid never reads as a grid.
      const ox = x + between(-1.2, 1.2), oy = y + between(-1.2, 1.2);
      const s = cell * between(0.95, 1.35);
      const tilt = between(-0.35, 0.35);
      const angle = rnd() * Math.PI, gap = between(0.75, 1.05);
      const cs = Math.cos(tilt), sn = Math.sin(tilt);
      const corner = (u, v) => ({ x: ox + u * cs - v * sn, y: oy + u * sn + v * cs });
      d += hatch([corner(0, 0), corner(s, 0), corner(s, s), corner(0, s)], angle, gap, 0.12);
    }
  }
  return d;
}

// ── border: layered paper-cut frame ───────────────────────────────────────
/** A rounded rectangle inset by `i`, sampled along its perimeter, its edge rippled inward by a wave. */
function wavyFrame(i, r, amp, wavelength, phase) {
  const x0 = i, y0 = i, x1 = W - i, y1 = H - i;
  const raw = [];
  const seg = (ax, ay, bx, by) => {
    const n = Math.ceil(Math.hypot(bx - ax, by - ay) / 0.8);
    for (let k = 0; k < n; k++) raw.push([ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n]);
  };
  const arc = (cx, cy, a0) => {
    for (let k = 0; k < 8; k++) {
      const a = a0 + (k / 8) * (Math.PI / 2);
      raw.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  };
  seg(x0 + r, y0, x1 - r, y0); arc(x1 - r, y0 + r, -Math.PI / 2);
  seg(x1, y0 + r, x1, y1 - r); arc(x1 - r, y1 - r, 0);
  seg(x1 - r, y1, x0 + r, y1); arc(x0 + r, y1 - r, Math.PI / 2);
  seg(x0, y1 - r, x0, y0 + r); arc(x0 + r, y0 + r, Math.PI);
  // Offset each point along its inward normal by two blended waves of arc length.
  let s = 0;
  const out = raw.map((p, k) => {
    const prev = raw[(k - 1 + raw.length) % raw.length], next = raw[(k + 1) % raw.length];
    if (k) s += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    const tx = next[0] - prev[0], ty = next[1] - prev[1], tl = Math.hypot(tx, ty) || 1;
    const nx = -ty / tl, ny = tx / tl; // inward for this clockwise path
    const off = amp * (0.6 * Math.sin((s / wavelength) * TAU + phase) + 0.4 * Math.sin((s / (wavelength * 2.7)) * TAU + phase * 1.7));
    return [p[0] + nx * off, p[1] + ny * off];
  });
  return "M" + out.map((p) => `${f(p[0])} ${f(p[1])}`).join("L") + "Z";
}

function band() {
  let s = rrect(OUTER, `fill="${LAYERS[0]}"`);
  s += `<clipPath id="outer">${rrect(OUTER)}</clipPath><g clip-path="url(#outer)">`;
  LAYERS.slice(1).forEach((colour, k) => {
    const d = wavyFrame(OUTER.x + 1.6 + k * 1.7, 7, 1.1 + 0.15 * k, 16 + 5 * (k % 3), k * 1.9);
    // Each layer casts a soft shadow down and to the right, then the paper itself.
    s += `<path d="${d}" fill="#000" opacity="0.18" transform="translate(0.35 0.55)"/>`;
    s += `<path d="${d}" fill="${colour}"/>`;
  });
  return s + `</g>`;
}

// ── paper card ────────────────────────────────────────────────────────────
function card() {
  let s = "";
  // Soft drop shadow under the card.
  s += rrect({ ...CARD, x: CARD.x + 0.4, y: CARD.y + 0.8 }, `fill="#000" opacity="0.16"`);
  s += rrect(CARD, `fill="${PAPER}"`);
  s += `<clipPath id="card">${rrect(CARD)}</clipPath>`;
  s += `<g clip-path="url(#card)">`;
  s += `<path d="${tufts(CARD)}" stroke="${PAPER_INK}" stroke-width="0.24" stroke-linecap="round" fill="none"/>`;
  s += `</g>`;
  return s;
}

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm" preserveAspectRatio="none">` +
  `<rect width="${W}" height="${H}" fill="#FFFFFF"/>` +
  band() +
  card() +
  `</svg>\n`;

const root = path.resolve(__dirname, "..", "..");
const targets = [
  path.join(root, "ui", "public", "credentials", "certificate-ground.svg"),
  path.join(root, "backend", "src", "main", "resources", "pdf", "brand", "certificate-ground.svg"),
];
for (const t of targets) {
  fs.mkdirSync(path.dirname(t), { recursive: true });
  fs.writeFileSync(t, svg);
  console.log(`${path.relative(root, t)}  ${(svg.length / 1024).toFixed(0)} KB`);
}
