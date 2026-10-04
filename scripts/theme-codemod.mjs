/**
 * One-time migration of the UI's colour classes onto the theme system (app/themes.css).
 *
 *   node scripts/theme-codemod.mjs           # dry run: prints a report
 *   node scripts/theme-codemod.mjs --write   # rewrites files
 *
 * Light mode must render identically afterwards — every rewrite below resolves to the same
 * colour in light, and only changes what dark / high-contrast / glass resolve to.
 *
 * Rules, applied per class list (one string literal):
 *  1. Neutral `dark:` variants are removed. Neutral families now flip through the theme ramp,
 *     so a hand-written `dark:bg-slate-900` would flip a colour that is already flipped.
 *  2. `bg-white` (and gradient stops / solid borders and rings in white) become `surface`.
 *     Faint white washes (opacity < 40) stay white: they are highlights on colour, not surfaces.
 *  3. Arcade ink (#14142b, hover #232735) becomes the `ink` / `ink-hover` tokens.
 *  4. `text-white` sitting on a dark *neutral* fill becomes `text-on-ink`, because that fill
 *     inverts in dark mode. White on a coloured fill stays white.
 *  5. Other neutral hex colours map to the nearest neutral step when the step is visually the
 *     same; otherwise the hex stays for light and a `dark:` step is added.
 *  6. Coloured tints and deep coloured text get a `dark:` counterpart when they have none.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const DIRS = ['app', 'apps', 'domains', 'shared', 'components'];
const WRITE = process.argv.includes('--write');

const NEUTRAL = ['slate', 'gray', 'zinc', 'neutral', 'stone'];
const HUES = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
const COLOR_PROPS = ['bg', 'text', 'border', 'border-t', 'border-b', 'border-l', 'border-r', 'border-x', 'border-y', 'border-s', 'border-e', 'ring', 'ring-offset', 'divide', 'from', 'via', 'to', 'fill', 'stroke', 'outline', 'placeholder', 'caret', 'accent', 'decoration', 'shadow'];
// Longest first so `border-t` wins over `border`, `ring-offset` over `ring`.
const PROP_RE = COLOR_PROPS.slice().sort((a, b) => b.length - a.length).map((p) => p.replace(/-/g, '\\-')).join('|');
const UTIL_RE = new RegExp(`^(${PROP_RE})-(white|black|transparent|current|inherit|(?:${[...NEUTRAL, ...HUES].join('|')})-(?:50|[1-9]00|950)|\\[#[0-9a-fA-F]{3,8}\\]|ink|ink-hover|on-ink|surface)(?:/(\\[?[0-9.]+%?\\]?))?$`);

// Tailwind slate lightness by step — used to find the "role" of a neutral hex.
const SLATE_L = { 50: 0.984, 100: 0.968, 200: 0.929, 300: 0.869, 400: 0.704, 500: 0.554, 600: 0.446, 700: 0.372, 800: 0.279, 900: 0.208, 950: 0.129 };

// ── colour maths ──────────────────────────────────────────────────────────
function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const delin = (c) => { const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; return Math.round(Math.min(1, Math.max(0, v)) * 255); };
function rgbToOklch([r, g, b]) {
  const R = lin(r), G = lin(g), B = lin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(a, bb), H: Math.atan2(bb, a) };
}
function oklchToHex({ L, C, H }) {
  const a = C * Math.cos(H), b = C * Math.sin(H);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return '#' + [r, g, bl].map((v) => delin(v).toString(16).padStart(2, '0')).join('');
}
const hexInfo = (hex) => rgbToOklch(hexToRgb(hex));
// Near-white pastels have little OKLCH chroma just because they are light, so the threshold scales
// with lightness: #bae6fd (sky-100-ish, C≈0.055) is a colour, #e2e8f0 (slate-200, C≈0.013) is not.
// Dark navies used as text (#0b132b) count as ink.
const isNeutralHex = (hex) => {
  const { L, C } = hexInfo(hex);
  if (L < 0.3) return C < 0.065;
  return C < (L > 0.85 ? 0.02 : 0.045);
};
function nearestStep(L) {
  let best = 50, d = 9;
  for (const [step, sl] of Object.entries(SLATE_L)) if (Math.abs(sl - L) < d) { d = Math.abs(sl - L); best = +step; }
  return { step: best, delta: d };
}

// ── token parsing ─────────────────────────────────────────────────────────
function splitVariants(token) {
  // variants are colon-separated, but colons inside [...] belong to arbitrary values
  let depth = 0, last = -1;
  for (let i = 0; i < token.length; i++) {
    const c = token[i];
    if (c === '[') depth++;
    else if (c === ']') depth--;
    else if (c === ':' && depth === 0) last = i;
  }
  const variants = last >= 0 ? token.slice(0, last + 1) : '';
  let util = token.slice(last + 1);
  let important = '';
  if (util.startsWith('!')) { important = '!'; util = util.slice(1); }
  else if (util.endsWith('!')) { important = '!'; util = util.slice(0, -1); }
  return { variants, util, important };
}

function parse(token) {
  const { variants, util, important } = splitVariants(token);
  const m = UTIL_RE.exec(util);
  if (!m) return null;
  const [, prop, color, opacityRaw] = m;
  const vlist = variants ? variants.slice(0, -1).split(':') : [];
  const opacity = opacityRaw == null ? null : parseFloat(opacityRaw.replace(/[[\]%]/g, '')) * (opacityRaw.includes('.') && !opacityRaw.includes('%') ? 100 : 1);
  let family = null, step = null, hex = null;
  const fm = /^([a-z]+)-(\d+)$/.exec(color);
  if (fm) { family = fm[1]; step = +fm[2]; }
  const hm = /^\[(#[0-9a-fA-F]+)\]$/.exec(color);
  if (hm) hex = hm[1].toLowerCase();
  return { token, variants, vlist, isDark: vlist.includes('dark'), util, important, prop, color, opacityRaw, opacity, family, step, hex };
}

const isNeutralColor = (p) =>
  p.color === 'white' || p.color === 'black' || (p.family && NEUTRAL.includes(p.family)) || (p.hex && isNeutralHex(p.hex)) || ['ink', 'ink-hover', 'on-ink', 'surface'].includes(p.color);

/** A fill that is dark in light mode and neutral, i.e. one that inverts in dark mode. */
function isDarkNeutralFill(p) {
  if (p.prop !== 'bg') return false;
  if (p.opacity != null && p.opacity < 70) return false;
  if (p.family && NEUTRAL.includes(p.family)) return p.step >= 700;
  if (p.color === 'ink' || p.color === 'ink-hover') return true;
  if (p.hex) { const i = hexInfo(p.hex); return i.C < 0.065 && i.L < 0.42; }
  return false;
}

const rebuild = (p, util) => `${p.variants}${p.important}${util}`;
const withOpacity = (base, p) => (p.opacityRaw != null ? `${base}/${p.opacityRaw}` : base);

// ── the transform ─────────────────────────────────────────────────────────
const stats = {};
const bump = (k) => (stats[k] = (stats[k] || 0) + 1);

function transformClassList(text) {
  const parts = text.split(/(\s+)/);
  // `theme-fixed` marks a class list whose colours are deliberately absolute (a black/white
  // contrast sample, a switch knob): leave it alone.
  if (parts.includes('theme-fixed')) return text;
  const tokens = parts.map((t) => (/\s/.test(t) || t === '' ? null : parse(t)));
  if (!tokens.some(Boolean)) return text;

  const hasDarkNeutralFill = tokens.some((p) => p && !p.isDark && isDarkNeutralFill(p));
  const out = parts.slice();
  const additions = [];
  // Existing dark: coverage for (variants-without-dark, prop) — so we never add a duplicate.
  const darkCovered = new Set(
    tokens.filter((p) => p && p.isDark && !isNeutralColor(p)).map((p) => p.vlist.filter((v) => v !== 'dark').join(':') + '|' + p.prop),
  );

  tokens.forEach((p, i) => {
    if (!p) return;

    // 1. neutral dark: variants go
    if (p.isDark) {
      if (isNeutralColor(p)) { out[i] = ''; bump('strip dark: neutral'); }
      return;
    }

    // 3. ink tokens
    if (p.hex === '#14142b') { out[i] = rebuild(p, withOpacity(`${p.prop}-ink`, p)); bump('ink'); return; }
    if (p.hex === '#232735') { out[i] = rebuild(p, withOpacity(`${p.prop}-ink-hover`, p)); bump('ink-hover'); return; }
    if (p.color === 'black' && p.prop === 'bg' && p.vlist.includes('hover') && tokens.some((q) => q && !q.isDark && q.prop === 'bg' && q.hex === '#14142b')) {
      out[i] = rebuild(p, withOpacity('bg-ink-hover', p)); bump('hover black → ink-hover'); return;
    }

    // 2. white surfaces
    if (p.color === 'white') {
      const faint = p.opacity != null && p.opacity < 40;
      if (['bg', 'from', 'via', 'to'].includes(p.prop) && !faint) { out[i] = rebuild(p, withOpacity(`${p.prop}-surface`, p)); bump(`${p.prop}-white → surface`); return; }
      if ((p.prop.startsWith('border') || p.prop === 'ring' || p.prop === 'ring-offset' || p.prop === 'divide') && (p.opacity == null || p.opacity >= 60)) {
        out[i] = rebuild(p, withOpacity(`${p.prop}-surface`, p)); bump(`${p.prop}-white → surface`); return;
      }
      // 4. white text on an inverting fill
      if ((p.prop === 'text' || p.prop === 'fill' || p.prop === 'stroke' || p.prop === 'placeholder') && hasDarkNeutralFill) {
        out[i] = rebuild(p, withOpacity(`${p.prop}-on-ink`, p)); bump('text-white → on-ink'); return;
      }
      return;
    }
    if (p.color === 'black' && p.opacity != null && p.opacity <= 20 && ['bg', 'border', 'ring', 'divide', 'border-t', 'border-b', 'border-l', 'border-r', 'border-x', 'border-y'].includes(p.prop)) {
      out[i] = rebuild(p, withOpacity(`${p.prop}-slate-950`, p)); bump('black wash → slate-950'); return;
    }
    if (p.color === 'black' && p.prop === 'text') { out[i] = rebuild(p, withOpacity('text-slate-950', p)); bump('text-black → slate-950'); return; }

    // 5. neutral hex
    if (p.hex && isNeutralHex(p.hex)) {
      const { L } = hexInfo(p.hex);
      if (L > 0.985 && ['bg', 'from', 'via', 'to'].includes(p.prop)) { out[i] = rebuild(p, withOpacity(`${p.prop}-surface`, p)); bump('light hex → surface'); return; }
      if (L < 0.3 && ['text', 'bg', 'border', 'fill', 'stroke', 'decoration'].includes(p.prop)) { out[i] = rebuild(p, withOpacity(`${p.prop}-ink`, p)); bump('dark hex → ink'); return; }
      const { step, delta } = nearestStep(L);
      if (delta < 0.03) { out[i] = rebuild(p, withOpacity(`${p.prop}-slate-${step}`, p)); bump('neutral hex → step'); return; }
      const key = p.vlist.join(':') + '|' + p.prop;
      if (!darkCovered.has(key)) {
        const dv = ['dark', ...p.vlist].join(':') + ':';
        additions.push(`${dv}${withOpacity(`${p.prop}-slate-${step}`, p)}`);
        darkCovered.add(key);
        bump('neutral hex + dark step');
      }
      return;
    }

    // 6. coloured tints / deep text
    const key = p.vlist.join(':') + '|' + p.prop;
    if (darkCovered.has(key)) return;
    const dv = ['dark', ...p.vlist].join(':') + ':';
    let add = null;
    if (p.family && HUES.includes(p.family)) {
      const h = p.family, s = p.step;
      if (['bg', 'from', 'via', 'to'].includes(p.prop) && s <= 300) add = `${p.prop}-${h}-500/${s <= 50 ? 10 : s <= 100 ? 15 : s <= 200 ? 20 : 30}`;
      else if (p.prop.startsWith('border') || p.prop === 'ring' || p.prop === 'divide') { if (s <= 300) add = `${p.prop}-${h}-500/${s <= 200 ? 25 : 40}`; }
      else if (['text', 'fill', 'stroke', 'decoration', 'placeholder'].includes(p.prop) && s >= 600) add = `${p.prop}-${h}-${s === 600 ? 400 : s === 700 ? 300 : 200}`;
    } else if (p.hex) {
      const info = hexInfo(p.hex);
      if (['bg', 'from', 'via', 'to'].includes(p.prop) && info.L > 0.85 && (p.opacity == null || p.opacity > 40)) add = `${p.prop}-[${p.hex}]/15`;
      else if ((p.prop.startsWith('border') || p.prop === 'ring') && info.L > 0.8) add = `${p.prop}-[${p.hex}]/30`;
      else if (['text', 'fill', 'stroke'].includes(p.prop) && info.L < 0.62) add = `${p.prop}-[${oklchToHex({ ...info, L: Math.max(0.78, info.L), C: Math.min(info.C, 0.16) })}]`;
    }
    if (add) {
      additions.push(dv + add);
      darkCovered.add(key);
      bump(`dark tint ${p.prop}`);
    }
  });

  // Drop removed tokens together with the whitespace before them; keep every other byte as-is.
  const kept = [];
  for (let i = 0; i < out.length; i++) {
    if (tokens[i] !== null && out[i] === '' && parts[i] !== '') {
      if (kept.length && /^\s+$/.test(kept[kept.length - 1]) && kept.length > 1) kept.pop();
      else if (i + 1 < out.length && /^\s+$/.test(out[i + 1] ?? '')) i++;
      continue;
    }
    kept.push(out[i]);
  }
  let result = kept.join('');
  if (additions.length) {
    const trail = /\s*$/.exec(result)[0];
    const body = result.slice(0, result.length - trail.length);
    result = (body ? body + ' ' : '') + additions.join(' ') + trail;
  }
  return result;
}

// ── file walking ──────────────────────────────────────────────────────────
function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(tsx?|jsx?)$/.test(e.name) && !e.name.endsWith('.d.ts')) acc.push(p);
  }
  return acc;
}

const changedFiles = [];
const samples = [];
for (const d of DIRS) {
  for (const file of walk(path.join(ROOT, d))) {
    const src = fs.readFileSync(file, 'utf8');
    const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const edits = [];
    const visit = (node) => {
      let text = null, start = 0, end = 0;
      if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        // skip import specifiers and object keys
        if (ts.isImportDeclaration(node.parent) || ts.isExportDeclaration(node.parent) || ts.isExternalModuleReference(node.parent)) return;
        start = node.getStart(sf) + 1; end = node.getEnd() - 1; text = src.slice(start, end);
      } else if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
        const raw = node.getText(sf);
        const open = 1; const close = ts.isTemplateTail(node) ? 1 : 2;
        start = node.getStart(sf) + open; end = node.getEnd() - close; text = src.slice(start, end);
      } else if (ts.isJsxText(node)) {
        return;
      }
      if (text != null && /[a-z]-/.test(text)) {
        const next = transformClassList(text);
        if (next !== text) { edits.push({ start, end, next }); if (samples.length < 60 && Math.random() < 0.08) samples.push([path.relative(ROOT, file), text.trim().slice(0, 140), next.trim().slice(0, 200)]); }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
    if (!edits.length) continue;
    edits.sort((a, b) => b.start - a.start);
    let next = src;
    for (const e of edits) next = next.slice(0, e.start) + e.next + next.slice(e.end);
    changedFiles.push(path.relative(ROOT, file));
    if (WRITE) fs.writeFileSync(file, next);
  }
}

console.log(`${WRITE ? 'Rewrote' : 'Would rewrite'} ${changedFiles.length} files`);
console.log(Object.entries(stats).sort((a, b) => b[1] - a[1]).map(([k, v]) => `  ${String(v).padStart(5)}  ${k}`).join('\n'));
if (!WRITE) for (const [f, a, b] of samples) console.log(`\n${f}\n  - ${a}\n  + ${b}`);
