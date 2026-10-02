'use client';

import React, { useId, useMemo } from 'react';
import { cn } from '@/shared/utils/utils';
import { usePublicCategoriesStatus } from '@/shared/hooks/usePublicCategories';
import { createRng, type Rng } from './rng';
import { INK, paletteFor, resolveArtTheme, type ArtPalette, type ArtTheme } from './themes';
import { MOTIFS, type Motif, type MotifPaint } from './motifs';

/**
 * Generated artwork for courses, events and exams — Arcade's replacement for uploaded banners.
 *
 * Light and hand-drawn: doodled scenes on a flat, pale ground — never a solid colour block, never
 * an icon sitting on a plate. Three inputs decide the picture:
 *
 * - the **category** (or title) picks a theme: a soft palette and a library of subject motifs;
 * - the **kind** picks a scene, so the three read apart at a glance — a course is a *learning path*
 *   (a main subject and two companions linked by a dotted trail to a flag), an event a
 *   *celebration* (the subject with bursts, confetti and a calendar page), an exam a fading
 *   graph-paper sheet with a measured frame and a small seal;
 * - the **seed** (content id) picks motif, palette, layout and texture, so each item has its own
 *   picture and keeps it everywhere.
 *
 * **It never changes after it is drawn.** Content that names its category by id waits for the
 * category list to settle and draws once; drawing from the title first and the category a moment
 * later made every card swap its picture shortly after the page loaded.
 */

export type ContentArtKind = 'COURSE' | 'EVENT' | 'EXAM';

export interface ContentArtProps {
  /** Stable id of the content; the same seed always draws the same picture. */
  seed: string;
  kind?: ContentArtKind | string | null;
  category?: string | null;
  /**
   * Console category id, for content that carries the id rather than the name (courses, exams).
   * Resolved through the cached public category list; ignored when `category` is given.
   */
  categoryId?: string | null;
  title?: string | null;
  className?: string;
  /** Accessible label; defaults to a description of the art. */
  label?: string;
}

/** Two decimals: server and browser trig can differ in the last digits and break hydration. */
const r2 = (n: number) => Math.round(n * 100) / 100;

const W = 400;
const H = 240;
/** Line weight and fill tint for every motif: light strokes, pale fills. */
const LINE_WEIGHT = 0.6;
const FILL_TINT = 0.3;

/** Maps every content-type spelling used across the app onto the three families. */
export function artKindOf(type?: string | null): ContentArtKind {
  const t = (type ?? '').toUpperCase();
  if (t === 'EXAM' || t === 'ASSESSMENT' || t === 'QUIZ' || t === 'CERTIFICATION') return 'EXAM';
  if (t === 'EVENT' || t === 'WORKSHOP' || t === 'WEBINAR' || t === 'BOOTCAMP' || t === 'HACKATHON' || t === 'MEETUP') return 'EVENT';
  return 'COURSE';
}

interface Scene {
  rng: Rng;
  theme: ArtTheme;
  pal: ArtPalette;
  motif: Motif;
  /** Two more subjects from the same theme, for the doodle scenes. */
  companions: [Motif, Motif];
  uid: string;
}

export function ContentArt({ seed, kind, category, categoryId, title, className, label }: ContentArtProps) {
  const { categories, settled } = usePublicCategoriesStatus();
  // Only content addressed by category id has to wait; a name or a title is known immediately.
  const waiting = !category && !!categoryId && !settled;
  const categoryName =
    category ?? (categoryId ? categories.find((c) => c.id === categoryId)?.name ?? null : null);
  const reactId = useId();
  const uid = `art${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const family = artKindOf(kind);

  const scene = useMemo<Omit<Scene, 'uid'>>(() => {
    const theme = resolveArtTheme(categoryName, title);
    const rng = createRng(`${seed}|${family}|${theme.key}`);
    const motif = rng.pick(MOTIFS[theme.key]);
    // Companions come from their own stream so the main sequence — and with it every exam picture
    // already drawn — stays exactly as it was.
    const pick = createRng(`${seed}|companions`);
    const pool = MOTIFS[theme.key].filter((m) => m !== motif);
    const first = pool.splice(pick.int(0, pool.length - 1), 1)[0];
    const second = pool[pick.int(0, pool.length - 1)];
    return { rng, theme, pal: paletteFor(theme, seed), motif, companions: [first, second] };
  }, [seed, family, categoryName, title]);

  const s: Scene = { ...scene, uid };
  const description = label ?? `${scene.theme.label} ${family.toLowerCase()} artwork`;

  // The whole scene always shows ("meet"), whatever shape the slot is — cropping ("slice") cut the
  // top and bottom off in wide slots (Resume learning) and the sides off in small square ones
  // (search, recommendations). The element's own background is the scene's ground colour, so the
  // spare space reads as more of the same flat ground rather than as letterbox bars.
  const ground = waiting
    ? '#FBFBFD'
    : family === 'EXAM'
      ? `color-mix(in srgb, ${scene.pal.paper} 60%, white)`
      : scene.pal.paper;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={description}
      overflow="visible"
      style={{ background: ground }}
      className={cn('block h-full w-full select-none', className)}
    >
      {waiting ? (
        <rect width={W} height={H} fill="#FBFBFD" />
      ) : family === 'EVENT' ? (
        <Celebration {...s} />
      ) : family === 'EXAM' ? (
        <Sheet {...s} />
      ) : (
        <LearningPath {...s} />
      )}
    </svg>
  );
}

// ── Shared pieces ────────────────────────────────────────────────────────────

function paint(pal: ArtPalette): MotifPaint {
  return {
    ink: INK,
    main: pal.main,
    accent: pal.accent,
    spark: pal.spark,
    soft: pal.soft,
    paper: '#FFFFFF',
    weight: LINE_WEIGHT,
    tint: FILL_TINT,
  };
}

/**
 * Near-white ground with one soft wash of the theme colour. It fades to the card's own white at the
 * edges, so the art reads as part of the card rather than a picture placed on it.
 */
function Ground({ pal, uid, x, y }: { pal: ArtPalette; uid: string; x: number; y: number }) {
  const id = `${uid}wash`;
  return (
    <>
      <defs>
        <radialGradient id={id} gradientUnits="userSpaceOnUse" cx={x} cy={y} r={230}>
          <stop offset="0" stopColor={pal.soft} stopOpacity={0.75} />
          <stop offset="0.55" stopColor={pal.soft} stopOpacity={0.22} />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="#FFFFFF" />
      <rect width={W} height={H} fill={pal.paper} opacity={0.6} />
      <rect width={W} height={H} fill={`url(#${id})`} />
    </>
  );
}

/** Faint texture that fades out towards the edges. */
function FadingTexture({ rng, pal, uid, x, y, kind }: { rng: Rng; pal: ArtPalette; uid: string; x: number; y: number; kind: 'dots' | 'rings' | 'grid' | 'rays' | 'none' }) {
  if (kind === 'none') return null;
  const mask = `${uid}m`;
  const fade = `${uid}f`;
  const pat = `${uid}p`;
  const color = pal.main;
  return (
    <>
      <defs>
        <radialGradient id={fade} gradientUnits="userSpaceOnUse" cx={x} cy={y} r={190}>
          <stop offset="0" stopColor="#fff" stopOpacity={1} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <mask id={mask}>
          <rect width={W} height={H} fill={`url(#${fade})`} />
        </mask>
        {kind === 'dots' && (
          <pattern id={pat} width={16} height={16} patternUnits="userSpaceOnUse">
            <circle cx={2} cy={2} r={1} fill={color} />
          </pattern>
        )}
        {kind === 'grid' && (
          <pattern id={pat} width={14} height={14} patternUnits="userSpaceOnUse">
            <path d="M14 0 H0 V14" fill="none" stroke={color} strokeWidth={0.5} />
          </pattern>
        )}
      </defs>
      <g mask={`url(#${mask})`} opacity={0.22}>
        {(kind === 'dots' || kind === 'grid') && <rect width={W} height={H} fill={`url(#${pat})`} />}
        {kind === 'rings' && (
          <g fill="none" stroke={color} strokeWidth={0.8}>
            {Array.from({ length: 7 }, (_, i) => (
              <circle key={i} cx={x} cy={y} r={44 + i * 22} />
            ))}
          </g>
        )}
        {kind === 'rays' && (
          <g stroke={color} strokeWidth={0.8}>
            {Array.from({ length: 24 }, (_, i) => {
              const a = (i / 24) * Math.PI * 2 + rng.range(0, 0.1);
              return <line key={i} x1={x} y1={y} x2={r2(x + Math.cos(a) * 260)} y2={r2(y + Math.sin(a) * 260)} />;
            })}
          </g>
        )}
      </g>
    </>
  );
}

/** Two or three tiny accents; restraint is the point. */
function Accents({ rng, pal, avoid }: { rng: Rng; pal: ArtPalette; avoid: { x: number; y: number; r: number } }) {
  const items: React.ReactElement[] = [];
  const count = rng.int(2, 3);
  let tries = 0;
  while (items.length < count && tries < 40) {
    tries++;
    const x = r2(rng.range(30, W - 30));
    const y = r2(rng.range(28, H - 28));
    if (Math.hypot(x - avoid.x, y - avoid.y) < avoid.r) continue;
    const color = rng.pick([pal.main, pal.accent, pal.spark]);
    const k = rng.int(0, 2);
    items.push(
      k === 0 ? (
        <circle key={items.length} cx={x} cy={y} r={2.2} fill={color} opacity={0.55} />
      ) : k === 1 ? (
        <circle key={items.length} cx={x} cy={y} r={4} fill="none" stroke={color} strokeWidth={1.2} opacity={0.5} />
      ) : (
        <path key={items.length} d={`M${x - 3.5} ${y} H${x + 3.5} M${x} ${y - 3.5} V${y + 3.5}`} stroke={color} strokeWidth={1.2} strokeLinecap="round" opacity={0.5} />
      )
    );
  }
  return <g>{items}</g>;
}

// ── Doodle vocabulary (courses and events) ──────────────────────────────────

/** Doodle line: thin, round, softened ink. */
const DOODLE = { stroke: INK, strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none', strokeOpacity: 0.7 };

/** Flat, light ground — nothing else, so nothing reads as cut off at the edges. */
function LightGround({ rng, pal }: { rng: Rng; pal: ArtPalette }) {
  // Two draws that once placed corner shapes. Still taken so every doodle after them lands exactly
  // where it did — the pictures already shown must not change.
  rng.chance(0.5);
  rng.chance(0.6);
  return (
    <g>
      <rect width={W} height={H} fill="#FFFFFF" />
      <rect width={W} height={H} fill={pal.paper} />
    </g>
  );
}

function Place({ motif, pal, x, y, scale, rotate = 0 }: { motif: Motif; pal: ArtPalette; x: number; y: number; scale: number; rotate?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>{motif(paint(pal))}</g>;
}

function Sparkle({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  const k = r2(s * 0.28);
  return (
    <path
      d={`M${x} ${y - s} Q${x + k} ${y - k} ${x + s} ${y} Q${x + k} ${y + k} ${x} ${y + s} Q${x - k} ${y + k} ${x - s} ${y} Q${x - k} ${y - k} ${x} ${y - s} Z`}
      {...DOODLE}
      fill={color}
      fillOpacity={0.55}
      strokeWidth={1.2}
    />
  );
}

function Squiggle({ x, y, len, color, rng }: { x: number; y: number; len: number; color: string; rng: Rng }) {
  const waves = Math.max(2, Math.round(len / 12));
  const step = r2(len / waves);
  let d = `M${x} ${y}`;
  for (let i = 0; i < waves; i++) {
    const amp = r2(rng.range(3, 5) * (i % 2 ? -1 : 1));
    d += ` q${r2(step / 2)} ${amp} ${step} 0`;
  }
  return <path d={d} {...DOODLE} stroke={color} strokeOpacity={0.75} strokeWidth={1.8} />;
}

function Dot({ x, y, color, r = 2.4 }: { x: number; y: number; color: string; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={color} opacity={0.7} />;
}

/** Short strokes radiating above a subject — "this is the thing". */
function Burst({ x, y, r, rng }: { x: number; y: number; r: number; rng: Rng }) {
  const start = rng.range(-0.3, 0.3);
  return (
    <g {...DOODLE}>
      {Array.from({ length: 5 }, (_, i) => {
        const a = start - Math.PI / 2 + (i - 2) * 0.42;
        return <line key={i} x1={r2(x + Math.cos(a) * r)} y1={r2(y + Math.sin(a) * r)} x2={r2(x + Math.cos(a) * (r + 9))} y2={r2(y + Math.sin(a) * (r + 9))} />;
      })}
    </g>
  );
}

/** A dotted, gently curving trail ending in an arrowhead. */
function Trail({ from, to, bend, rng }: { from: [number, number]; to: [number, number]; bend: number; rng: Rng }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = r2((x1 + x2) / 2 + rng.range(-8, 8));
  const my = r2((y1 + y2) / 2 + bend);
  const a = Math.atan2(y2 - my, x2 - mx);
  const head = (d: number) => `${r2(x2 - Math.cos(a + d) * 7)} ${r2(y2 - Math.sin(a + d) * 7)}`;
  return (
    <g {...DOODLE}>
      <path d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`} strokeDasharray="1 5" strokeWidth={2} />
      <path d={`M${head(0.5)} L${x2} ${y2} L${head(-0.5)}`} />
    </g>
  );
}

function Flag({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <path d={`M${x - 14} ${y} H${x + 16}`} {...DOODLE} />
      <path d={`M${x} ${y} V${y - 28}`} {...DOODLE} />
      <path d={`M${x} ${y - 28} L${x + 17} ${y - 22} L${x} ${y - 16} Z`} {...DOODLE} fill={color} fillOpacity={0.45} strokeWidth={1.3} />
    </g>
  );
}

function Confetti({ rng, pal, count, avoid }: { rng: Rng; pal: ArtPalette; count: number; avoid: Array<{ x: number; y: number; r: number }> }) {
  const items: React.ReactElement[] = [];
  let tries = 0;
  while (items.length < count && tries < 90) {
    tries++;
    const x = r2(rng.range(20, W - 20));
    const y = r2(rng.range(18, H - 18));
    if (avoid.some((o) => Math.hypot(x - o.x, y - o.y) < o.r)) continue;
    const color = rng.pick([pal.main, pal.accent, pal.spark]);
    const k = rng.int(0, 2);
    items.push(
      <g key={items.length} transform={`translate(${x} ${y}) rotate(${rng.int(0, 180)})`}>
        {k === 0 && <rect x={-4} y={-1.6} width={8} height={3.2} rx={1.2} fill={color} opacity={0.6} />}
        {k === 1 && <path d="M-5 2 L-2 -2 L1 2 L4 -2" {...DOODLE} stroke={color} strokeOpacity={0.8} strokeWidth={1.5} />}
        {k === 2 && <path d="M0 -4 L3.6 2.6 L-3.6 2.6 Z" fill={color} opacity={0.55} />}
      </g>
    );
  }
  return <g>{items}</g>;
}

function CalendarPage({ x, y, pal }: { x: number; y: number; pal: ArtPalette }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(-6)`}>
      <rect x={-22} y={-20} width={44} height={42} rx={6} {...DOODLE} fill="#FFFFFF" />
      <rect x={-22} y={-20} width={44} height={12} rx={6} fill={pal.main} opacity={0.3} />
      <path d="M-22 -8 H22" {...DOODLE} />
      <path d="M-12 -25 V-15 M12 -25 V-15" {...DOODLE} strokeWidth={2} />
      {[-12, 0, 12].flatMap((cx) => [2, 13].map((cy) => <circle key={`${cx}:${cy}`} cx={cx} cy={cy} r={1.8} fill={INK} opacity={0.35} />))}
      <circle cx={12} cy={13} r={5.5} fill="none" stroke={pal.spark} strokeWidth={1.6} />
    </g>
  );
}

// ── Course: a learning path ─────────────────────────────────────────────────

function LearningPath({ rng, pal, motif, companions }: Scene) {
  const flip = rng.chance(0.5);
  const X = (x: number) => (flip ? W - x : x);

  return (
    <g>
      <LightGround rng={rng} pal={pal} />
      <Trail from={[X(186), 98]} to={[X(240), 76]} bend={-16} rng={rng} />
      <Trail from={[X(286), 100]} to={[X(296), 144]} bend={0} rng={rng} />
      <Trail from={[X(324), 176]} to={[X(340), 196]} bend={4} rng={rng} />
      <Flag x={X(352)} y={214} color={pal.spark} />
      <Place motif={motif} pal={pal} x={X(132)} y={128} scale={1.05} rotate={r2(rng.range(-4, 4))} />
      <Place motif={companions[0]} pal={pal} x={X(270)} y={68} scale={0.44} rotate={r2(rng.range(-8, 8))} />
      <Place motif={companions[1]} pal={pal} x={X(298)} y={172} scale={0.44} rotate={r2(rng.range(-8, 8))} />
      <Sparkle x={X(66)} y={50} s={8} color={pal.spark} />
      <Sparkle x={X(214)} y={202} s={5} color={pal.accent} />
      <Squiggle x={X(44)} y={212} len={44} color={pal.main} rng={rng} />
      <Dot x={X(360)} y={42} color={pal.accent} />
      <Dot x={X(210)} y={38} color={pal.main} r={1.8} />
    </g>
  );
}

// ── Event: a celebration ────────────────────────────────────────────────────

function Celebration({ rng, pal, motif, companions }: Scene) {
  const flip = rng.chance(0.5);
  const X = (x: number) => (flip ? W - x : x);
  const mx = X(170);
  const my = 128;

  return (
    <g>
      <LightGround rng={rng} pal={pal} />
      <Confetti
        rng={rng}
        pal={pal}
        count={rng.int(9, 13)}
        avoid={[{ x: mx, y: my, r: 76 }, { x: X(316), y: 78, r: 40 }, { x: X(304), y: 176, r: 34 }]}
      />
      <Burst x={mx} y={my - 4} r={60} rng={rng} />
      <Place motif={motif} pal={pal} x={mx} y={my} scale={1.02} rotate={r2(rng.range(-4, 4))} />
      <CalendarPage x={X(316)} y={78} pal={pal} />
      <Place motif={companions[0]} pal={pal} x={X(304)} y={176} scale={0.42} rotate={r2(rng.range(-10, 10))} />
      <Sparkle x={X(62)} y={66} s={9} color={pal.spark} />
      <Sparkle x={X(250)} y={38} s={5} color={pal.accent} />
      <Squiggle x={X(46)} y={200} len={40} color={pal.accent} rng={rng} />
    </g>
  );
}

// ── Exam: the subject on a fading graph-paper sheet with a small seal ───────

function Sheet({ rng, pal, motif, uid }: Scene) {
  const cx = rng.pick([182, 200, 218]);
  const cy = 122;
  const sealRight = cx <= 200;
  const sealX = sealRight ? cx + 112 : cx - 112;
  const sealY = rng.pick([76, 164]);
  const bubbleX = sealRight ? cx + 96 : cx - 120;
  const bubbleY = sealY === 76 ? 146 : 64;
  const chosen = rng.int(0, 2);
  const hair = { stroke: INK, strokeOpacity: 0.28, strokeWidth: 1.1 };

  return (
    <g>
      <Ground pal={pal} uid={uid} x={cx} y={cy} />
      <FadingTexture rng={rng} pal={pal} uid={uid} x={cx} y={cy} kind="grid" />

      {/* Hairline frame with corner ticks */}
      <rect x={cx - 62} y={cy - 62} width={124} height={124} rx={10} fill="#FFFFFF" fillOpacity={0.7} {...hair} strokeDasharray="4 4" />
      {[[-62, -62], [62, -62], [-62, 62], [62, 62]].map(([dx, dy], i) => (
        <path key={i} d={`M${cx + dx - 5} ${cy + dy} H${cx + dx + 5} M${cx + dx} ${cy + dy - 5} V${cy + dy + 5}`} stroke={pal.main} strokeOpacity={0.6} strokeWidth={1.2} />
      ))}
      <g transform={`translate(${cx} ${cy}) scale(0.95)`}>{motif(paint(pal))}</g>

      {/* Three answer bubbles */}
      <g transform={`translate(${bubbleX} ${bubbleY})`}>
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(0 ${i * 13})`}>
            <circle r={3.6} fill={i === chosen ? pal.main : '#FFFFFF'} fillOpacity={i === chosen ? 0.7 : 1} {...(i === chosen ? {} : hair)} />
            <rect x={9} y={-2} width={rng.int(16, 26)} height={4} rx={2} fill={INK} opacity={0.1} />
          </g>
        ))}
      </g>

      {/* Small outline seal */}
      <g transform={`translate(${sealX} ${sealY}) rotate(${rng.int(-12, 12)})`} opacity={0.85}>
        <path
          d={
            Array.from({ length: 20 }, (_, i) => {
              const a = (i / 20) * Math.PI * 2;
              const r = i % 2 ? 15 : 17.5;
              return `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
            }).join(' ') + ' Z'
          }
          fill={pal.soft}
          fillOpacity={0.6}
          stroke={pal.main}
          strokeOpacity={0.6}
          strokeWidth={1.1}
          strokeLinejoin="round"
        />
        <path d="M-5 0 L-1.5 3.5 L5.5 -4" fill="none" stroke={pal.main} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <Accents rng={rng} pal={pal} avoid={{ x: cx, y: cy, r: 96 }} />
    </g>
  );
}
