'use client';

import React, { useId, useMemo } from 'react';
import { cn } from '@/shared/utils/utils';
import { usePublicCategories } from '@/shared/hooks/usePublicCategories';
import { createRng, type Rng } from './rng';
import { INK, paletteFor, resolveArtTheme, type ArtPalette, type ArtTheme } from './themes';
import { MOTIFS, type Motif, type MotifPaint } from './motifs';

/**
 * Generated artwork for courses, events and exams — Arcade's replacement for uploaded banners.
 *
 * Uploaded covers made every catalogue look different in size, crop and quality. This draws a
 * picture instead, from three inputs:
 *
 * - the **category** (or title) picks a theme: palette and a library of subject motifs;
 * - the **kind** picks a composition family, so a course, an event and an exam are told apart at a
 *   glance — courses are an illustrated object on a soft stage ("atelier"), events a bold poster
 *   with a ticket stub, exams a measured blueprint sheet with a seal;
 * - the **seed** (the content id) picks motif, palette, background pattern, layout, rotation and
 *   accents, so every item gets its own picture and keeps it on every page.
 *
 * Five motifs × several palettes × six patterns × layouts × accent scatter gives each category
 * hundreds of distinct pictures per kind. Pure SVG: crisp at any size, no network, no layout shift.
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
  sideMotif: Motif;
  uid: string;
}

export function ContentArt({ seed, kind, category, categoryId, title, className, label }: ContentArtProps) {
  const categories = usePublicCategories();
  const categoryName =
    category ?? (categoryId ? categories.find((c) => c.id === categoryId)?.name ?? null : null);
  const reactId = useId();
  const uid = `art${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const family = artKindOf(kind);

  const scene = useMemo<Omit<Scene, 'uid'>>(() => {
    const theme = resolveArtTheme(categoryName, title);
    const rng = createRng(`${seed}|${family}|${theme.key}`);
    const motifs = MOTIFS[theme.key];
    const motif = rng.pick(motifs);
    const others = motifs.filter((m) => m !== motif);
    return { rng, theme, pal: paletteFor(theme, seed), motif, sideMotif: rng.pick(others) };
  }, [seed, family, categoryName, title]);

  const s: Scene = { ...scene, uid };
  const description = label ?? `${scene.theme.label} ${family.toLowerCase()} artwork`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={description}
      className={cn('block h-full w-full select-none', className)}
    >
      {family === 'EVENT' ? <Poster {...s} /> : family === 'EXAM' ? <Blueprint {...s} /> : <Atelier {...s} />}
    </svg>
  );
}

// ── Shared pieces ────────────────────────────────────────────────────────────

function paint(pal: ArtPalette, outline = false): MotifPaint {
  return { ink: INK, main: pal.main, accent: pal.accent, spark: pal.spark, soft: pal.soft, paper: '#FFFFFF', outline };
}

type Floater = 'diamond' | 'circle' | 'ring' | 'plus' | 'square' | 'triangle' | 'dots';

function FloaterShape({ kind, x, y, size, color, rotate }: { kind: Floater; x: number; y: number; size: number; color: string; rotate: number }) {
  const t = `translate(${x} ${y}) rotate(${rotate})`;
  const s = size;
  switch (kind) {
    case 'diamond':
      return <path transform={t} d={`M0 ${-s} L${s} 0 L0 ${s} L${-s} 0 Z`} fill={color} />;
    case 'circle':
      return <circle transform={t} r={s * 0.75} fill={color} />;
    case 'ring':
      return <circle transform={t} r={s * 0.8} fill="none" stroke={color} strokeWidth={2.4} />;
    case 'plus':
      return <path transform={t} d={`M${-s} 0 H${s} M0 ${-s} V${s}`} stroke={color} strokeWidth={2.6} strokeLinecap="round" />;
    case 'square':
      return <rect transform={t} x={-s * 0.7} y={-s * 0.7} width={s * 1.4} height={s * 1.4} rx={2} fill="none" stroke={color} strokeWidth={2.2} />;
    case 'triangle':
      return <path transform={t} d={`M0 ${-s} L${s * 0.9} ${s * 0.7} L${-s * 0.9} ${s * 0.7} Z`} fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" />;
    default:
      return (
        <g transform={t} fill={color}>
          {[-6, 0, 6].map((dx) => <circle key={dx} cx={dx} cy={0} r={1.8} />)}
        </g>
      );
  }
}

/** Small accents scattered away from the subject. */
function Floaters({ rng, colors, count, avoid }: { rng: Rng; colors: string[]; count: number; avoid: { x: number; y: number; r: number } }) {
  const kinds: Floater[] = ['diamond', 'circle', 'ring', 'plus', 'square', 'triangle', 'dots'];
  const items: React.ReactElement[] = [];
  let tries = 0;
  while (items.length < count && tries < 60) {
    tries++;
    const x = r2(rng.range(24, W - 24));
    const y = r2(rng.range(22, H - 22));
    if (Math.hypot(x - avoid.x, y - avoid.y) < avoid.r) continue;
    items.push(
      <FloaterShape key={items.length} kind={rng.pick(kinds)} x={x} y={y} size={r2(rng.range(4, 8))} color={rng.pick(colors)} rotate={rng.int(0, 45)} />
    );
  }
  return <g>{items}</g>;
}

/** Quiet texture behind course art; six families, chosen per seed. */
function Texture({ rng, color, uid }: { rng: Rng; color: string; uid: string }) {
  const variant = rng.int(0, 5);
  const id = `${uid}tex`;
  if (variant === 0) {
    return (
      <>
        <defs>
          <pattern id={id} width={18} height={18} patternUnits="userSpaceOnUse">
            <circle cx={2} cy={2} r={1.3} fill={color} />
          </pattern>
        </defs>
        <rect width={W} height={H} fill={`url(#${id})`} opacity={0.5} />
      </>
    );
  }
  if (variant === 1) {
    const cx = rng.range(60, 340);
    const cy = rng.range(40, 200);
    return (
      <g fill="none" stroke={color} strokeWidth={1.2} opacity={0.55}>
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={30 + i * 26} ry={18 + i * 17} transform={`rotate(${rng.int(-20, 20)} ${cx} ${cy})`} />
        ))}
      </g>
    );
  }
  if (variant === 2) {
    return (
      <>
        <defs>
          <pattern id={id} width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1={0} y1={0} x2={0} y2={14} stroke={color} strokeWidth={1.2} />
          </pattern>
        </defs>
        <rect x={rng.pick([0, W * 0.55])} y={0} width={W * 0.45} height={H} fill={`url(#${id})`} opacity={0.45} />
      </>
    );
  }
  if (variant === 3) {
    return (
      <>
        <defs>
          <pattern id={id} width={36} height={20.8} patternUnits="userSpaceOnUse">
            <path d="M0 0 L18 10.4 L36 0 M0 20.8 L18 10.4 L36 20.8 M18 10.4 V0" fill="none" stroke={color} strokeWidth={0.9} />
          </pattern>
        </defs>
        <rect width={W} height={H} fill={`url(#${id})`} opacity={0.45} />
      </>
    );
  }
  if (variant === 4) {
    return (
      <g fill="none" stroke={color} strokeWidth={1.4} opacity={0.55}>
        {Array.from({ length: 6 }, (_, i) => {
          const y = 30 + i * 36;
          return <path key={i} d={`M0 ${y} Q100 ${y - 14} 200 ${y} T400 ${y}`} />;
        })}
      </g>
    );
  }
  return (
    <g stroke={color} strokeWidth={1.6} strokeLinecap="round" opacity={0.6}>
      {Array.from({ length: 22 }, (_, i) => {
        const x = rng.range(10, W - 10);
        const y = rng.range(10, H - 10);
        return <path key={i} d={`M${x - 3} ${y} H${x + 3} M${x} ${y - 3} V${y + 3}`} />;
      })}
    </g>
  );
}

// ── Course: "atelier" — an illustrated object on a soft stage ───────────────

function Atelier({ rng, pal, motif, sideMotif, uid }: Scene) {
  const layout = rng.int(0, 2); // 0 centred, 1 left-weighted, 2 right-weighted
  const cx = layout === 0 ? 200 : layout === 1 ? 150 : 250;
  const cy = 118;
  const tilt = rng.range(-7, 7);
  const scale = rng.range(1.05, 1.25);
  const blob = rng.int(0, 2);
  const sideX = layout === 1 ? 318 : layout === 2 ? 82 : rng.pick([70, 330]);
  const showSide = layout !== 0 || rng.chance(0.45);

  return (
    <g>
      <rect width={W} height={H} fill={pal.paper} />
      <Texture rng={rng} color={pal.soft} uid={uid} />
      {/* Soft ground behind the subject */}
      {blob === 0 && <circle cx={cx} cy={cy} r={86} fill={pal.soft} opacity={0.85} />}
      {blob === 1 && <rect x={cx - 96} y={cy - 78} width={192} height={156} rx={48} fill={pal.soft} opacity={0.85} transform={`rotate(${rng.int(-8, 8)} ${cx} ${cy})`} />}
      {blob === 2 && (
        <path
          d={`M${cx - 92} ${cy + 10} C${cx - 96} ${cy - 70} ${cx + 30} ${cy - 96} ${cx + 88} ${cy - 40} C${cx + 120} ${cy} ${cx + 70} ${cy + 86} ${cx} ${cy + 84} C${cx - 60} ${cy + 82} ${cx - 90} ${cy + 50} ${cx - 92} ${cy + 10} Z`}
          fill={pal.soft}
          opacity={0.85}
        />
      )}
      {/* Stage shadow */}
      <ellipse cx={cx} cy={cy + 70} rx={62} ry={9} fill={INK} opacity={0.08} />
      <Floaters rng={rng} colors={[pal.main, pal.accent, pal.spark]} count={rng.int(5, 8)} avoid={{ x: cx, y: cy, r: 100 }} />
      {showSide && (
        <g transform={`translate(${sideX} ${rng.pick([62, 176])})`}>
          <rect x={-30} y={-30} width={60} height={60} rx={16} fill="#FFFFFF" stroke={INK} strokeWidth={2} opacity={0.95} />
          <g transform="scale(0.42)">{sideMotif(paint(pal))}</g>
        </g>
      )}
      <g transform={`translate(${cx} ${cy}) rotate(${tilt}) scale(${scale})`}>{motif(paint(pal))}</g>
    </g>
  );
}

// ── Event: "poster" — bold field, rhythmic shapes, a ticket stub ────────────

function Poster({ rng, pal, motif, uid }: Scene) {
  const variant = rng.int(0, 4);
  const angle = rng.int(-30, 30);
  const gid = `${uid}g`;
  const stubLeft = rng.chance(0.35);
  const stubX = stubLeft ? 92 : 300;
  const badgeX = stubLeft ? 250 : 140;
  const badgeY = 120;
  const light = 'rgba(255,255,255,0.14)';

  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1" gradientTransform={`rotate(${angle} 0.5 0.5)`}>
          <stop offset="0" stopColor={pal.deep} />
          <stop offset="1" stopColor={pal.vivid} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${gid})`} />

      {/* Rhythm: five poster families */}
      {variant === 0 && (
        <g fill={light}>
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2;
            const x2 = r2(badgeX + Math.cos(a) * 420);
            const y2 = r2(badgeY + Math.sin(a) * 420);
            const x3 = r2(badgeX + Math.cos(a + 0.12) * 420);
            const y3 = r2(badgeY + Math.sin(a + 0.12) * 420);
            return <path key={i} d={`M${badgeX} ${badgeY} L${x2} ${y2} L${x3} ${y3} Z`} />;
          })}
        </g>
      )}
      {variant === 1 && (
        <g fill="none" stroke={light} strokeWidth={14}>
          {[70, 110, 150, 190, 230].map((r) => <circle key={r} cx={badgeX} cy={H + 30} r={r} />)}
        </g>
      )}
      {variant === 2 && (
        <g fill={light} transform={`rotate(${rng.int(-28, -12)} 200 120)`}>
          {[-120, -40, 40, 120, 200].map((x, i) => <rect key={x} x={x + 60} y={-100} width={i % 2 ? 26 : 46} height={440} />)}
        </g>
      )}
      {variant === 3 && (
        <g fill={light}>
          {Array.from({ length: 10 }, (_, r) =>
            Array.from({ length: 16 }, (_, c) => {
              const x = 14 + c * 26;
              const y = 14 + r * 26;
              const d = Math.hypot(x - badgeX, y - badgeY);
              const rad = r2(Math.max(0.6, 8 - d / 32));
              return <circle key={`${r}-${c}`} cx={x} cy={y} r={rad} />;
            })
          )}
        </g>
      )}
      {variant === 4 && (
        <g fill={light}>
          {[-1, 0, 1].map((i) => (
            <path key={i} d={`M${badgeX + i * 70} -10 L${badgeX + i * 70 - 46} ${H + 10} L${badgeX + i * 70 + 46} ${H + 10} Z`} opacity={0.8} />
          ))}
        </g>
      )}

      <Floaters rng={rng} colors={[pal.spark, '#FFFFFF', pal.soft]} count={rng.int(4, 7)} avoid={{ x: badgeX, y: badgeY, r: 92 }} />

      {/* Ticket stub */}
      <g>
        <path
          d={`M${stubX - 52} 34 H${stubX + 52} V${H / 2 - 12} A12 12 0 0 0 ${stubX + 52} ${H / 2 + 12} V${H - 34} H${stubX - 52} V${H / 2 + 12} A12 12 0 0 0 ${stubX - 52} ${H / 2 - 12} Z`}
          fill="#FFFFFF"
          opacity={0.96}
        />
        <line x1={stubX - 36} y1={H / 2} x2={stubX + 36} y2={H / 2} stroke={INK} strokeWidth={1.6} strokeDasharray="4 5" opacity={0.35} />
        <rect x={stubX - 34} y={56} width={rng.int(36, 60)} height={9} rx={4.5} fill={pal.main} />
        <rect x={stubX - 34} y={74} width={rng.int(46, 66)} height={6} rx={3} fill={INK} opacity={0.18} />
        <rect x={stubX - 34} y={86} width={rng.int(26, 44)} height={6} rx={3} fill={INK} opacity={0.12} />
        {/* Barcode */}
        <g fill={INK} opacity={0.75}>
          {Array.from({ length: 16 }, (_, i) => (
            <rect key={i} x={stubX - 34 + i * 4.4} y={H / 2 + 22} width={rng.pick([1.4, 2.2, 3])} height={40} />
          ))}
        </g>
        <circle cx={stubX + 28} cy={H - 52} r={7} fill={pal.spark} />
      </g>

      {/* Subject on a white badge */}
      <circle cx={badgeX} cy={badgeY} r={70} fill="#FFFFFF" opacity={0.12} />
      <circle cx={badgeX} cy={badgeY} r={56} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
      <g transform={`translate(${badgeX} ${badgeY}) rotate(${rng.range(-8, 8)}) scale(0.78)`}>{motif(paint(pal))}</g>
    </g>
  );
}

// ── Exam: "blueprint" — graph paper, rulers, a measured subject and a seal ──

function Blueprint({ rng, pal, motif, uid }: Scene) {
  const minor = `${uid}mi`;
  const major = `${uid}ma`;
  const cx = rng.pick([150, 170, 200]);
  const cy = 124;
  const sealRight = cx < 200 || rng.chance(0.5);
  const sealX = sealRight ? 318 : 82;
  const sealY = rng.pick([70, 168]);
  const answers = rng.int(0, 3);
  const showBubbles = sealRight ? rng.chance(0.5) : false;

  return (
    <g>
      <defs>
        <pattern id={minor} width={12} height={12} patternUnits="userSpaceOnUse">
          <path d="M12 0 H0 V12" fill="none" stroke={pal.main} strokeWidth={0.5} opacity={0.35} />
        </pattern>
        <pattern id={major} width={48} height={48} patternUnits="userSpaceOnUse">
          <path d="M48 0 H0 V48" fill="none" stroke={pal.main} strokeWidth={1} opacity={0.35} />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={pal.paper} />
      <rect width={W} height={H} fill={`url(#${minor})`} />
      <rect width={W} height={H} fill={`url(#${major})`} />

      {/* Rulers */}
      <g stroke={INK} strokeWidth={1.2} opacity={0.5}>
        <line x1={0} y1={14} x2={W} y2={14} />
        {Array.from({ length: 41 }, (_, i) => <line key={`t${i}`} x1={i * 10} y1={14} x2={i * 10} y2={i % 5 === 0 ? 4 : 9} />)}
        <line x1={14} y1={0} x2={14} y2={H} />
        {Array.from({ length: 25 }, (_, i) => <line key={`l${i}`} x1={14} y1={i * 10} x2={i % 5 === 0 ? 4 : 9} y2={i * 10} />)}
      </g>

      {/* Measured frame around the subject */}
      <rect x={cx - 66} y={cy - 66} width={132} height={132} rx={6} fill="#FFFFFF" fillOpacity={0.8} stroke={INK} strokeWidth={1.6} strokeDasharray="6 5" />
      <g stroke={pal.main} strokeWidth={1.4} fill={pal.main}>
        <line x1={cx - 66} y1={cy + 82} x2={cx + 66} y2={cy + 82} />
        <path d={`M${cx - 66} ${cy + 82} l6 -3 v6 Z M${cx + 66} ${cy + 82} l-6 -3 v6 Z`} stroke="none" />
        <line x1={cx - 82} y1={cy - 66} x2={cx - 82} y2={cy + 66} />
        <path d={`M${cx - 82} ${cy - 66} l-3 6 h6 Z M${cx - 82} ${cy + 66} l-3 -6 h6 Z`} stroke="none" />
      </g>
      {/* Corner crosshairs */}
      {[[-66, -66], [66, -66], [-66, 66], [66, 66]].map(([dx, dy], i) => (
        <circle key={i} cx={cx + dx} cy={cy + dy} r={3.5} fill="#FFFFFF" stroke={INK} strokeWidth={1.6} />
      ))}
      <g transform={`translate(${cx} ${cy}) scale(1.02)`}>{motif(paint(pal, rng.chance(0.4)))}</g>

      {/* Answer bubbles, or a short checklist */}
      {showBubbles ? (
        <g transform={`translate(${sealX - 22} ${sealY === 70 ? 150 : 46})`}>
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(0 ${i * 15})`}>
              <circle cx={0} cy={0} r={5} fill={i === answers ? INK : '#FFFFFF'} stroke={INK} strokeWidth={1.6} />
              <rect x={10} y={-2.5} width={rng.int(22, 34)} height={5} rx={2.5} fill={INK} opacity={0.18} />
            </g>
          ))}
        </g>
      ) : (
        <g transform={`translate(${sealRight ? 286 : 40} ${sealY === 70 ? 150 : 40})`}>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(0 ${i * 16})`}>
              <rect x={0} y={-5} width={10} height={10} rx={2} fill="#FFFFFF" stroke={INK} strokeWidth={1.6} />
              {i <= answers && <path d="M2 0 L4.5 3 L9 -3.5" fill="none" stroke={pal.main} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />}
              <rect x={16} y={-2.5} width={rng.int(30, 54)} height={5} rx={2.5} fill={INK} opacity={0.2} />
            </g>
          ))}
        </g>
      )}

      {/* Seal */}
      <g transform={`translate(${sealX} ${sealY}) rotate(${rng.int(-15, 15)})`}>
        <path
          d={Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const r = i % 2 ? 26 : 30;
            return `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
          }).join(' ') + ' Z'}
          fill={pal.spark}
          stroke={INK}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <circle r={18} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
        <path d="M-8 0 L-2 6 L9 -6" fill="none" stroke={pal.main} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
}
