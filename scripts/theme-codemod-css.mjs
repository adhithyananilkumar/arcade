/**
 * Companion to theme-codemod.mjs for standalone .css files (landing, editor, reader…).
 *
 *   node scripts/theme-codemod-css.mjs           # dry run with samples
 *   node scripts/theme-codemod-css.mjs --write
 *
 * Neutral colours in colour declarations become theme switches with the original value as the
 * fallback — `var(--theme-ink, #12141c)` — so light renders exactly as before and the other
 * appearances (app/themes.css) supply their own. Coloured values are left alone. Within one rule,
 * white text on a dark neutral background becomes `--theme-on-ink`, since that background inverts.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const DIRS = ['app', 'apps', 'domains', 'shared', 'components'];
const SKIP = new Set(['app/globals.css', 'app/themes.css']);
const WRITE = process.argv.includes('--write');

const BG = /^(background|background-color|background-image)$/;
const FG = /^(color|fill|stroke|caret-color|-webkit-text-fill-color|text-decoration-color)$/;
const LINE = /^(border|border-(top|bottom|left|right)|border(-(top|bottom|left|right))?-color|outline|outline-color|column-rule|--[\w-]*(border|line|stroke)[\w-]*)$/;
const VAR_BG = /^--[\w-]*(bg|background|surface|paper|card|panel|wash)[\w-]*$/;
const VAR_FG = /^--[\w-]*(ink|text|fg|foreground|color|muted|title|heading)[\w-]*$/;
const SLATE_L = { 50: 0.984, 100: 0.968, 200: 0.929, 300: 0.869, 400: 0.704, 500: 0.554, 600: 0.446, 700: 0.372, 800: 0.279, 900: 0.208, 950: 0.129 };

const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
function oklch([r, g, b]) {
  const R = lin(r), G = lin(g), B = lin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(a, bb) };
}
function parseColor(lit) {
  const s = lit.trim().toLowerCase();
  if (s === 'white' || s === '#fff' || s === '#ffffff') return { rgb: [255, 255, 255], alpha: 1 };
  if (s === 'black') return { rgb: [0, 0, 0], alpha: 1 };
  let m = /^#([0-9a-f]{3,8})$/.exec(s);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    const n = parseInt(h.slice(0, 6), 16);
    return { rgb: [(n >> 16) & 255, (n >> 8) & 255, n & 255], alpha: h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1 };
  }
  m = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+([\d.]+%?))?\s*\)$/.exec(s);
  if (m) return { rgb: [+m[1], +m[2], +m[3]], alpha: m[4] == null ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]) };
  return null;
}
const neutral = ({ L, C }) => (L < 0.3 ? C < 0.065 : C < (L > 0.85 ? 0.02 : 0.045));
function nearestStep(L) {
  let best = 50, d = 9;
  for (const [step, sl] of Object.entries(SLATE_L)) if (Math.abs(sl - L) < d) { d = Math.abs(sl - L); best = +step; }
  return best;
}
const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|(?<![\w-])white(?![\w-])|(?<![\w-])black(?![\w-])/g;
const stats = {};
const bump = (k) => (stats[k] = (stats[k] || 0) + 1);

function rewrite(prop, value, onInk) {
  if (value.includes('--theme-on-ink') || (value.includes('--theme-') && !(onInk && /^(color|-webkit-text-fill-color)$/.test(prop)))) return value;
  const role = BG.test(prop) || VAR_BG.test(prop) ? 'bg' : FG.test(prop) || VAR_FG.test(prop) ? 'fg' : LINE.test(prop) ? 'line' : null;
  if (!role) return value;
  const important = /!important\s*$/.test(value);
  const core = value.replace(/\s*!important\s*$/, '');
  if (role === 'bg' && /gradient\(/.test(core)) {
    const stops = core.match(COLOR_RE) ?? [];
    const parsed = stops.map(parseColor);
    if (parsed.length && parsed.every(Boolean) && parsed.some((p) => p.alpha > 0.5) && parsed.every((p) => (p.alpha > 0.5 ? oklch(p.rgb).L > 0.9 : p.alpha <= 0.3))) {
      bump('light gradient → wash');
      return `var(--theme-wash, ${core})${important ? ' !important' : ''}`;
    }
    return value;
  }
  const next = core.replace(COLOR_RE, (lit) => {
    const p = parseColor(lit);
    if (!p) return lit;
    const o = oklch(p.rgb);
    if (!neutral(o)) return lit;
    if (o.L > 0.97 && p.alpha < 0.4) return lit; // faint white highlight on a dark or coloured section
    if (role === 'fg' && o.L > 0.97) {
      if (onInk) { bump('white on ink → on-ink'); return `var(--theme-on-ink, ${lit})`; }
      return lit;
    }
    if (role === 'bg' && o.L > 0.985) {
      if (p.alpha < 0.4) return lit;
      bump('white bg → surface');
      return p.alpha >= 0.999 ? `var(--theme-surface, ${lit})` : `color-mix(in oklab, var(--theme-surface, #ffffff) ${Math.round(p.alpha * 100)}%, transparent)`;
    }
    if (o.L < 0.3) {
      if (p.alpha < 0.5) {
        // dark translucent lines (rgba(20,20,43,.1) borders) follow the ink so they stay visible on dark
        if (role === 'line' || role === 'fg') { bump(`${role} faint ink`); return `color-mix(in oklab, var(--theme-ink, ${hexOf(p.rgb)}) ${Math.round(p.alpha * 100)}%, transparent)`; }
        return lit; // scrims and shadows
      }
      if (role === 'bg' && p.rgb.every((c) => c < 12)) return lit;
      bump(`${role} dark → ink`);
      return `var(--theme-ink, ${lit})`;
    }
    bump(`${role} neutral → n-step`);
    const step = nearestStep(o.L);
    return p.alpha >= 0.999 ? `var(--theme-n-${step}, ${lit})` : `color-mix(in oklab, var(--theme-n-${step}, ${hexOf(p.rgb)}) ${Math.round(p.alpha * 100)}%, transparent)`;
  });
  return next + (important ? ' !important' : '');
}
const hexOf = (rgb) => '#' + rgb.map((c) => c.toString(16).padStart(2, '0')).join('');

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.css')) acc.push(p);
  }
  return acc;
}

const samples = [];
let files = 0;
for (const d of DIRS) {
  for (const file of walk(path.join(ROOT, d))) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    if (SKIP.has(rel)) continue;
    const src = fs.readFileSync(file, 'utf8');
    // innermost blocks only; comments are blanked out of the scan but kept in the output
    const next = src.replace(/\{([^{}]*)\}/g, (whole, body) => {
      const decls = body.replace(/\/\*[\s\S]*?\*\//g, (c) => ' '.repeat(c.length));
      const bgDecl = /(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/.exec(decls);
      let onInk = false;
      if (bgDecl) {
        const v = bgDecl[1].replace(/\s*!important\s*$/, '').trim();
        const c = parseColor(v);
        // a dark neutral literal, or a variable that is the ink (var(--l-ink), var(--theme-ink, …))
        onInk = (!!c && c.alpha > 0.7 && oklch(c.rgb).L < 0.42 && oklch(c.rgb).C < 0.045) || /^var\(--[\w-]*ink\b/.test(v);
      }
      let out = '';
      let last = 0;
      const re = /(^|;|\n)(\s*)([-\w]+)(\s*:\s*)([^;{}]+)/g;
      let m;
      while ((m = re.exec(decls))) {
        const [, lead, ws, prop, colon, value] = m;
        const start = m.index + lead.length + ws.length + prop.length + colon.length;
        const original = body.slice(start, start + value.length);
        if (original.includes('/*')) continue;
        const replaced = rewrite(prop.toLowerCase(), original.trimEnd(), onInk);
        if (replaced !== original.trimEnd()) {
          out += body.slice(last, start) + replaced;
          last = start + original.trimEnd().length;
          if (samples.length < 40) samples.push(`${rel}  ${prop}: ${original.trim().slice(0, 60)}  →  ${replaced.slice(0, 90)}`);
        }
      }
      if (!last) return whole;
      return `{${out}${body.slice(last)}}`;
    });
    if (next !== src) {
      files++;
      if (WRITE) fs.writeFileSync(file, next);
    }
  }
}
console.log(`${WRITE ? 'Rewrote' : 'Would rewrite'} ${files} files`);
console.log(Object.entries(stats).sort((a, b) => b[1] - a[1]).map(([k, v]) => `  ${String(v).padStart(5)}  ${k}`).join('\n'));
if (!WRITE) console.log('\n' + samples.join('\n'));
