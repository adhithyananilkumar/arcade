/**
 * Companion to theme-codemod.mjs for colours written in inline `style` objects, which class
 * rewriting cannot see.
 *
 *   node scripts/theme-codemod-styles.mjs           # dry run with samples
 *   node scripts/theme-codemod-styles.mjs --write
 *
 * Each neutral colour becomes a theme switch with the original value as its fallback —
 * `var(--theme-surface, #ffffff)` — so light mode renders exactly as before (the switch is
 * undefined there) and other appearances supply their own (app/themes.css). Coloured values
 * (brand blues, category hues) are left alone.
 *
 * Only objects that are styles are touched: a JSX `style={{…}}` value, or an object bound to a
 * name containing "style"/"bg"/"background". Data objects that merely have a `color` key are not
 * styles and may feed code that parses the hex.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const DIRS = ['app', 'apps', 'domains', 'shared', 'components'];
const WRITE = process.argv.includes('--write');

const BG_KEYS = new Set(['background', 'backgroundColor', 'backgroundImage']);
const FG_KEYS = new Set(['color', 'fill', 'stroke', 'caretColor']);
const LINE_KEYS = new Set(['borderColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'outlineColor', 'border', 'borderTop', 'borderBottom', 'borderLeft', 'borderRight', 'outline']);
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
/** Parses #rgb, #rrggbb, #rrggbbaa, rgb(), rgba(), white, black. Returns {rgb, alpha} or null. */
function parseColor(lit) {
  const s = lit.trim().toLowerCase();
  if (s === 'white') return { rgb: [255, 255, 255], alpha: 1 };
  if (s === 'black') return { rgb: [0, 0, 0], alpha: 1 };
  let m = /^#([0-9a-f]{3,8})$/.exec(s);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    const n = parseInt(h.slice(0, 6), 16);
    const alpha = h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1;
    return { rgb: [(n >> 16) & 255, (n >> 8) & 255, n & 255], alpha };
  }
  m = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+([\d.]+%?))?\s*\)$/.exec(s);
  if (m) {
    let alpha = m[4] == null ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { rgb: [+m[1], +m[2], +m[3]], alpha };
  }
  return null;
}
function nearestStep(L) {
  let best = 50, d = 9;
  for (const [step, sl] of Object.entries(SLATE_L)) if (Math.abs(sl - L) < d) { d = Math.abs(sl - L); best = +step; }
  return best;
}
const withAlpha = (v, alpha) => (alpha >= 0.999 ? v : `color-mix(in oklab, ${v} ${Math.round(alpha * 1000) / 10}%, transparent)`);

const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\bwhite\b|\bblack\b/g;
const stats = {};
const bump = (k) => (stats[k] = (stats[k] || 0) + 1);

/** role: 'bg' | 'fg' | 'line'; onInk: this object has a dark neutral background. */
function rewriteValue(value, role, onInk) {
  if (value.includes('var(--theme-') || value.includes('--fg-lift')) return value; // already done
  // A gradient whose stops are all light is a page/card wash.
  if (role === 'bg' && /gradient\(/.test(value)) {
    const stops = value.match(COLOR_RE) ?? [];
    const parsed = stops.map(parseColor).filter(Boolean);
    if (parsed.length && parsed.length === stops.length && parsed.some((p) => p.alpha > 0.5) && parsed.every((p) => (p.alpha > 0.5 ? oklch(p.rgb).L > 0.9 : p.alpha <= 0.3))) {
      bump('light gradient → wash');
      return `var(--theme-wash, ${value})`;
    }
    return value;
  }
  return value.replace(COLOR_RE, (lit) => {
    const p = parseColor(lit);
    if (!p) return lit;
    const { L, C } = oklch(p.rgb);
    if (L < 0.3 ? C >= 0.065 : C >= (L > 0.85 ? 0.02 : 0.045)) {
      // Deep coloured text/lines (navy titles) would vanish on dark surfaces. Relative colour keeps
      // the exact value in light (--fg-lift is unset → max(l, 0) = l) and lifts it in dark themes.
      if ((role === 'fg' || role === 'line') && L < 0.55 && p.alpha > 0.5) { bump(`${role} deep colour → lift`); return `oklch(from ${lit} max(l, var(--fg-lift, 0)) c h)`; }
      return lit; // coloured (pastels included): leave
    }
    if (role === 'fg' && L > 0.97) {
      if (onInk) { bump('white text on ink → on-ink'); return withAlpha(`var(--theme-on-ink, ${lit})`, 1); }
      return lit; // white text on colour
    }
    if (role === 'bg' && L > 0.985) {
      if (p.alpha < 0.4) return lit; // faint white highlight on colour
      bump('white bg → surface');
      return `var(--theme-surface, ${lit})`;
    }
    if (L < 0.3 && p.alpha > 0.5) {
      if (role === 'bg' && p.rgb.every((c) => c < 12)) return lit; // true black: video/media backdrops
      bump(`${role} dark neutral → ink`);
      return `var(--theme-ink, ${lit})`;
    }
    if (role === 'bg' && p.alpha < 0.5 && L < 0.3) return lit; // scrims and shadows
    bump(`${role} neutral → n-step`);
    return `var(--theme-n-${nearestStep(L)}, ${lit})`;
  });
}

function propName(p) {
  if (!p.name) return null;
  if (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) return p.name.text;
  return null;
}

function isStyleObject(obj) {
  const parent = obj.parent;
  if (ts.isJsxExpression(parent) && ts.isJsxAttribute(parent.parent) && /^style$/i.test(parent.parent.name.getText())) return true;
  if (ts.isVariableDeclaration(parent) && /style|bg|background|wash/i.test(parent.name.getText())) return true;
  if (ts.isPropertyAssignment(parent) && /style|bg|background|wash/i.test(parent.name.getText())) return true;
  // `as React.CSSProperties`
  if ((ts.isAsExpression(parent) || ts.isSatisfiesExpression?.(parent)) && /CSSProperties/.test(parent.type.getText())) return true;
  return false;
}

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    // badge artwork is self-contained (own ground, exported) and keeps absolute colours
    else if (/\.tsx?$/.test(e.name) && !e.name.endsWith('.d.ts') && !/\.test\./.test(e.name) && !/^Badge(Canvas|Graphic)\.tsx$/.test(e.name)) acc.push(p);
  }
  return acc;
}

const samples = [];
let files = 0;
for (const d of DIRS) {
  for (const file of walk(path.join(ROOT, d))) {
    const src = fs.readFileSync(file, 'utf8');
    const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const edits = [];
    const visit = (node) => {
      // SVG presentation attributes: stroke="#1A1A1A", fill={active ? '#8B5CF6' : '#1A1A1A'}
      if (ts.isJsxAttribute(node) && /^(stroke|fill|stopColor|color)$/.test(node.name.getText(sf)) && node.initializer) {
        const init = ts.isJsxExpression(node.initializer) ? node.initializer.expression : node.initializer;
        const lits = [];
        const collect = (e) => {
          if (!e) return;
          if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) lits.push(e);
          else if (ts.isParenthesizedExpression(e)) collect(e.expression);
          else if (ts.isConditionalExpression(e)) { collect(e.whenTrue); collect(e.whenFalse); }
        };
        collect(init);
        for (const lit of lits) {
          const c = parseColor(lit.text);
          if (!c) continue;
          const { L, C } = oklch(c.rgb);
          // only the ink line work: dark neutral strokes/fills. White fills on SVG art stay white.
          if (L < 0.3 && C < 0.065 && c.alpha > 0.5) {
            bump('svg attr ink');
            edits.push({ start: lit.getStart(sf) + 1, end: lit.getEnd() - 1, next: `var(--theme-ink, ${lit.text})` });
          }
        }
      }
      if (ts.isObjectLiteralExpression(node) && isStyleObject(node)) {
        const props = node.properties.filter(ts.isPropertyAssignment);
        const literalOf = (p) => (ts.isStringLiteral(p.initializer) || ts.isNoSubstitutionTemplateLiteral(p.initializer) ? p.initializer : null);
        // every string a property can take, including both branches of `cond ? 'a' : 'b'`
        const literalsOf = (e) => {
          if (!e) return [];
          if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return [e];
          if (ts.isParenthesizedExpression(e)) return literalsOf(e.expression);
          if (ts.isConditionalExpression(e)) return [...literalsOf(e.whenTrue), ...literalsOf(e.whenFalse)];
          return [];
        };
        const onInk = props.some((p) => {
          const k = propName(p), lit = literalOf(p);
          if (!lit || !BG_KEYS.has(k)) return false;
          const c = parseColor(lit.text);
          return c && c.alpha > 0.7 && oklch(c.rgb).L < 0.42 && oklch(c.rgb).C < 0.045;
        });
        for (const p of props) {
          const k = propName(p);
          if (!k) continue;
          const role = BG_KEYS.has(k) ? 'bg' : FG_KEYS.has(k) ? 'fg' : LINE_KEYS.has(k) ? 'line' : null;
          if (!role) continue;
          for (const lit of literalsOf(p.initializer)) {
          const next = rewriteValue(lit.text, role, onInk);
          if (next !== lit.text) {
            edits.push({ start: lit.getStart(sf) + 1, end: lit.getEnd() - 1, next });
            if (samples.length < 50) samples.push(`${path.relative(ROOT, file)}  ${k}: ${lit.text.slice(0, 70)}  →  ${next.slice(0, 110)}`);
          }
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
    if (!edits.length) continue;
    files++;
    edits.sort((a, b) => b.start - a.start);
    let next = src;
    // escape for the quote style of the literal is unnecessary: replacements add no quotes
    for (const e of edits) next = next.slice(0, e.start) + e.next + next.slice(e.end);
    if (WRITE) fs.writeFileSync(file, next);
  }
}
console.log(`${WRITE ? 'Rewrote' : 'Would rewrite'} ${files} files`);
console.log(Object.entries(stats).sort((a, b) => b[1] - a[1]).map(([k, v]) => `  ${String(v).padStart(5)}  ${k}`).join('\n'));
if (!WRITE) console.log('\n' + samples.join('\n'));
