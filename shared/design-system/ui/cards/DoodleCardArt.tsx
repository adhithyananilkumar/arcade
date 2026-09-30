'use client';

import React, { useMemo } from 'react';

export interface DoodleCardArtProps {
  id: string;
  title?: string | null;
  type?: string | null;
  description?: string | null;
  className?: string;
}

// ---------------------------------------------------------------------------
// 1. High-Precision Deterministic PRNG
// ---------------------------------------------------------------------------
function createRng(seedStr: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  let s = h >>> 0;

  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// 2. Editorial Architectural & Tech Palettes (Muted, Sophisticated, High-End)
// ---------------------------------------------------------------------------
interface EditorialPalette {
  bg: string;
  ink: string; // Crisp slate charcoal ink stroke
  primary: string; // Sophisticated hero wash
  secondary: string; // Subtle tonal fill
  accent: string; // Controlled warm accent
  tint: string; // Ultra-light backdrop ground wash
}

const EDITORIAL_PALETTES: EditorialPalette[] = [
  // 1. Scandinavian Sage & Nordic Slate
  {
    bg: '#FBFBF9',
    ink: '#1E293B', // Slate 800
    primary: '#0F766E', // Deep Teal 700
    secondary: '#94A3B8', // Slate 400
    accent: '#D97706', // Amber 600
    tint: '#F0FDF4',
  },
  // 2. Technical Indigo & Cobalt Steel
  {
    bg: '#FAFAFC',
    ink: '#0F172A',
    primary: '#2563EB', // Royal Blue
    secondary: '#64748B', // Cool Slate
    accent: '#EA580C', // Rust Orange
    tint: '#EFF6FF',
  },
  // 3. Modern Forest Emerald & Warm Ochre
  {
    bg: '#FAFBF9',
    ink: '#1A2E26',
    primary: '#059669', // Emerald
    secondary: '#86968F', // Muted sage
    accent: '#CA8A04', // Rich Gold
    tint: '#ECFDF5',
  },
  // 4. Graphite Charcoal & Electric Cyan
  {
    bg: '#F8FAFC',
    ink: '#090D16',
    primary: '#0284C7', // Sky Blue
    secondary: '#64748B',
    accent: '#E11D48', // Rose Red
    tint: '#F0F9FF',
  },
  // 5. Deep Plum & Warm Apricot
  {
    bg: '#FCFAFB',
    ink: '#271B2D',
    primary: '#7C3AED', // Violet
    secondary: '#9CA3AF',
    accent: '#F97316', // Apricot
    tint: '#F5F3FF',
  },
];

// ---------------------------------------------------------------------------
// 3. Meaningful Professional Topic Mapping
// ---------------------------------------------------------------------------
function detectEditorialTopic(title: string, type: string, description: string): string {
  const t = `${title} ${type} ${description}`.toLowerCase();

  if (t.includes('code') || t.includes('program') || t.includes('java') || t.includes('python') || t.includes('react') || t.includes('script') || t.includes('dev') || t.includes('web') || t.includes('front')) {
    return 'syntax';
  }
  if (t.includes('terminal') || t.includes('linux') || t.includes('cli') || t.includes('bash') || t.includes('devops') || t.includes('docker') || t.includes('cloud') || t.includes('infra')) {
    return 'network';
  }
  if (t.includes('ai') || t.includes('ml') || t.includes('neural') || t.includes('machine') || t.includes('model') || t.includes('chip') || t.includes('hardware')) {
    return 'silicon';
  }
  if (t.includes('exam') || t.includes('certif') || t.includes('assess') || t.includes('test') || t.includes('grade') || t.includes('standard') || t.includes('study')) {
    return 'folio';
  }
  if (t.includes('security') || t.includes('auth') || t.includes('shield') || t.includes('crypto') || t.includes('cyber') || t.includes('lock')) {
    return 'bastion';
  }
  if (t.includes('data') || t.includes('sql') || t.includes('database') || t.includes('analytics') || t.includes('metric') || t.includes('growth')) {
    return 'analytics';
  }
  if (t.includes('design') || t.includes('ui') || t.includes('ux') || t.includes('creative') || t.includes('art')) {
    return 'isometric-cube';
  }

  return 'monolith';
}

// ---------------------------------------------------------------------------
// 4. Professional Editorial Vector Illustrations (Linear Minimalist Art)
// ---------------------------------------------------------------------------
function renderEditorialSubject(topic: string, cx: number, cy: number, p: EditorialPalette) {
  const ink = p.ink;
  const sw = 1.6; // Refined hairline precision stroke

  switch (topic) {
    case 'syntax':
      // Architectural IDE Window with Precision Isometric Angles & Clean Lines
      return (
        <g transform={`translate(${cx}, ${cy})`}>
          {/* Subtle Ground Horizon Shadow */}
          <ellipse cx="0" cy="40" rx="46" ry="4" fill="#E2E8F0" opacity="0.6" />

          {/* Underlay Tonal Color Wash Slab */}
          <polygon points="-38,18 12,32 38,22 -12,8" fill={p.tint} />

          {/* Main Clean Code Frame */}
          <rect
            x="-34"
            y="-30"
            width="68"
            height="56"
            rx="6"
            fill="#FFFFFF"
            stroke={ink}
            strokeWidth={sw}
          />

          {/* Title Bar Separator */}
          <line x1="-34" y1="-18" x2="34" y2="-18" stroke={ink} strokeWidth="1" opacity="0.5" />
          <circle cx="-26" cy="-24" r="2" fill={p.accent} />
          <circle cx="-19" cy="-24" r="2" fill={p.secondary} />
          <circle cx="-12" cy="-24" r="2" fill={p.primary} />

          {/* Precision Wireframe Syntax Lines */}
          <line x1="-24" y1="-8" x2="-8" y2="-8" stroke={p.primary} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="-4" y1="-8" x2="16" y2="-8" stroke={p.secondary} strokeWidth="1.6" strokeLinecap="round" />

          <line x1="-24" y1="0" x2="-14" y2="0" stroke={p.secondary} strokeWidth="1.6" strokeLinecap="round" />
          <line x1="-10" y1="0" x2="8" y2="0" stroke={p.accent} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="12" y1="0" x2="22" y2="0" stroke={p.secondary} strokeWidth="1.6" strokeLinecap="round" />

          <line x1="-24" y1="8" x2="2" y2="8" stroke={p.primary} strokeWidth="2.2" strokeLinecap="round" />

          <line x1="-24" y1="16" x2="-6" y2="16" stroke={p.secondary} strokeWidth="1.6" strokeLinecap="round" />

          {/* Precision Diamond Float Icon on Corner */}
          <g transform="translate(24, 16)">
            <polygon points="0,-10 10,0 0,10 -10,0" fill="#FFFFFF" stroke={ink} strokeWidth={sw} />
            <polygon points="0,-5 5,0 0,5 -5,0" fill={p.primary} />
          </g>
        </g>
      );

    case 'network':
      // Minimalist Cloud & Distributed Network Node Geometry
      return (
        <g transform={`translate(${cx}, ${cy})`}>
          <ellipse cx="0" cy="40" rx="44" ry="4" fill="#E2E8F0" opacity="0.6" />

          {/* Connecting Topology Lines */}
          <line x1="-28" y1="18" x2="0" y2="-18" stroke={p.secondary} strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1="28" y1="18" x2="0" y2="-18" stroke={p.secondary} strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1="-28" y1="18" x2="28" y2="18" stroke={p.secondary} strokeWidth="1.2" strokeDasharray="3 3" />

          {/* Top Apex Node Cube */}
          <g transform="translate(0, -18)">
            <polygon points="0,-16 14,-8 0,0 -14,-8" fill="#FFFFFF" stroke={ink} strokeWidth={sw} />
            <polygon points="-14,-8 0,0 0,16 -14,8" fill={p.tint} stroke={ink} strokeWidth={sw} />
            <polygon points="0,0 14,-8 14,8 0,16" fill={p.primary} stroke={ink} strokeWidth={sw} />
          </g>

          {/* Bottom Left Node Cube */}
          <g transform="translate(-28, 18)">
            <polygon points="0,-12 10,-6 0,0 -10,-6" fill="#FFFFFF" stroke={ink} strokeWidth={sw} />
            <polygon points="-10,-6 0,0 0,12 -10,6" fill={p.secondary} stroke={ink} strokeWidth={sw} />
            <polygon points="0,0 10,-6 10,6 0,12" fill={p.tint} stroke={ink} strokeWidth={sw} />
          </g>

          {/* Bottom Right Node Cube */}
          <g transform="translate(28, 18)">
            <polygon points="0,-12 10,-6 0,0 -10,-6" fill={p.accent} stroke={ink} strokeWidth={sw} />
            <polygon points="-10,-6 0,0 0,12 -10,6" fill="#FFFFFF" stroke={ink} strokeWidth={sw} />
            <polygon points="0,0 10,-6 10,6 0,12" fill={p.primary} stroke={ink} strokeWidth={sw} />
          </g>

          {/* Center Connection Ring */}
          <circle cx="0" cy="4" r="6" fill="#FFFFFF" stroke={ink} strokeWidth={sw} />
          <circle cx="0" cy="4" r="2.5" fill={p.primary} />
        </g>
      );

    case 'silicon':
      // High-Precision Architectural Microchip & Circuit Orthogonals
      return (
        <g transform={`translate(${cx}, ${cy})`}>
          <ellipse cx="0" cy="40" rx="42" ry="4" fill="#E2E8F0" opacity="0.6" />

          {/* Radiating Circuit Traces */}
          <g stroke={ink} strokeWidth="1.2" strokeLinecap="round">
            <line x1="-14" y1="-26" x2="-14" y2="-36" />
            <line x1="0" y1="-26" x2="0" y2="-38" />
            <line x1="14" y1="-26" x2="14" y2="-36" />

            <line x1="-14" y1="26" x2="-14" y2="36" />
            <line x1="0" y1="26" x2="0" y2="38" />
            <line x1="14" y1="26" x2="14" y2="36" />

            <line x1="-26" y1="-12" x2="-36" y2="-12" />
            <line x1="-26" y1="0" x2="-38" y2="0" />
            <line x1="-26" y1="12" x2="-36" y2="12" />

            <line x1="26" y1="-12" x2="36" y2="-12" />
            <line x1="26" y1="0" x2="38" y2="0" />
            <line x1="26" y1="12" x2="36" y2="12" />
          </g>

          {/* Outer Ceramic Substrate */}
          <rect
            x="-26"
            y="-26"
            width="52"
            height="52"
            rx="6"
            fill="#FFFFFF"
            stroke={ink}
            strokeWidth={sw}
          />

          {/* Metallic Heatspreader Die */}
          <rect
            x="-16"
            y="-16"
            width="32"
            height="32"
            rx="3"
            fill={p.tint}
            stroke={ink}
            strokeWidth="1.2"
          />

          {/* Golden Core Silicon Emblem */}
          <polygon points="0,-9 9,0 0,9 -9,0" fill={p.primary} stroke={ink} strokeWidth="1" />
          <circle cx="0" cy="0" r="2.5" fill={p.accent} />

          {/* Orientation Pin 1 Marker */}
          <circle cx="-20" cy="-20" r="2" fill={p.accent} />
        </g>
      );

    case 'folio':
      // Architectural Scholar Folio & Golden Geometry
      return (
        <g transform={`translate(${cx}, ${cy})`}>
          <ellipse cx="0" cy="40" rx="46" ry="4" fill="#E2E8F0" opacity="0.6" />

          {/* Stepped Isometric Paper Sheets */}
          <polygon points="-26,-26 22,-36 38,-10 -10,0" fill={p.tint} stroke={ink} strokeWidth="1" />
          <polygon points="-32,-16 16,-26 32,0 -16,10" fill="#FFFFFF" stroke={ink} strokeWidth={sw} />
          <polygon points="-38,-6 10,-16 26,10 -22,20" fill="#FFFFFF" stroke={ink} strokeWidth={sw} />

          {/* Grid Layout Lines on Top Sheet */}
          <line x1="-28" y1="-2" x2="0" y2="-10" stroke={p.secondary} strokeWidth="1.2" />
          <line x1="-26" y1="4" x2="6" y2="-4" stroke={p.secondary} strokeWidth="1.2" />
          <line x1="-24" y1="10" x2="-6" y2="5" stroke={p.secondary} strokeWidth="1.2" />

          {/* Floating Minimalist Graduation Laurel Diamond */}
          <g transform="translate(18, 8)">
            <polygon points="0,-14 14,0 0,14 -14,0" fill={p.primary} stroke={ink} strokeWidth={sw} />
            <polygon points="0,-8 8,0 0,8 -8,0" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="2.5" fill={p.accent} />
          </g>
        </g>
      );

    case 'bastion':
      // Clean Linear Bastion Shield & Cryptographic Lock
      return (
        <g transform={`translate(${cx}, ${cy})`}>
          <ellipse cx="0" cy="40" rx="42" ry="4" fill="#E2E8F0" opacity="0.6" />

          {/* Outer Linear Shield Outline */}
          <path
            d="M -26 -28 H 26 V 4 C 26 22, 0 34, 0 34 C 0 34, -26 22, -26 4 Z"
            fill="#FFFFFF"
            stroke={ink}
            strokeWidth={sw}
            strokeLinejoin="round"
          />

          {/* Inset Half-Color Wash */}
          <path
            d="M 0 -28 H 26 V 4 C 26 22, 0 34, 0 34 Z"
            fill={p.tint}
          />

          {/* Precision Vault Core */}
          <rect x="-10" y="-8" width="20" height="18" rx="4" fill={p.primary} stroke={ink} strokeWidth="1.4" />
          <path d="M -6 -8 V -14 C -6 -17, 6 -17, 6 -14 V -8" fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
          <line x1="0" y1="2" x2="0" y2="6" stroke="#FFFFFF" strokeWidth="1.6" />
        </g>
      );

    case 'analytics':
      // Isometric Analytical Bar Matrix & Vector Rays
      return (
        <g transform={`translate(${cx}, ${cy})`}>
          <ellipse cx="0" cy="40" rx="46" ry="4" fill="#E2E8F0" opacity="0.6" />

          {/* Isometric Base Grid Plate */}
          <polygon points="-38,20 0,34 38,20 0,6" fill={p.tint} stroke={ink} strokeWidth="1" />

          {/* Bar 1 (Left, Short) */}
          <g transform="translate(-20, 10)">
            <polygon points="0,-12 8,-8 0,-4 -8,-8" fill="#FFFFFF" stroke={ink} strokeWidth={sw} />
            <polygon points="-8,-8 0,-4 0,14 -8,10" fill={p.secondary} stroke={ink} strokeWidth={sw} />
            <polygon points="0,-4 8,-8 8,10 0,14" fill="#E2E8F0" stroke={ink} strokeWidth={sw} />
          </g>

          {/* Bar 2 (Center, Tall) */}
          <g transform="translate(0, -4)">
            <polygon points="0,-24 8,-20 0,-16 -8,-20" fill={p.primary} stroke={ink} strokeWidth={sw} />
            <polygon points="-8,-20 0,-16 0,22 -8,18" fill={p.primary} stroke={ink} strokeWidth={sw} />
            <polygon points="0,-16 8,-20 8,18 0,22" fill={p.tint} stroke={ink} strokeWidth={sw} />
          </g>

          {/* Bar 3 (Right, Mid) */}
          <g transform="translate(20, 4)">
            <polygon points="0,-18 8,-14 0,-10 -8,-14" fill={p.accent} stroke={ink} strokeWidth={sw} />
            <polygon points="-8,-14 0,-10 0,18 -8,14" fill={p.accent} stroke={ink} strokeWidth={sw} />
            <polygon points="0,-10 8,-14 8,14 0,18" fill="#FFFFFF" stroke={ink} strokeWidth={sw} />
          </g>

          {/* Trend Growth Ray */}
          <polyline points="-20,2 0,-18 20,-10" fill="none" stroke={ink} strokeWidth="1.6" strokeDasharray="3 3" />
          <circle cx="20" cy="-10" r="3" fill={p.accent} stroke={ink} strokeWidth="1" />
        </g>
      );

    case 'isometric-cube':
    default:
      // Bauhaus / Architectural Precision Isometric Polyhedron Stack
      return (
        <g transform={`translate(${cx}, ${cy})`}>
          <ellipse cx="0" cy="40" rx="44" ry="4" fill="#E2E8F0" opacity="0.6" />

          {/* Base Foundation Block */}
          <g transform="translate(0, 10)">
            <polygon points="0,-18 28,-4 0,10 -28,-4" fill="#FFFFFF" stroke={ink} strokeWidth={sw} />
            <polygon points="-28,-4 0,10 0,26 -28,12" fill={p.secondary} stroke={ink} strokeWidth={sw} />
            <polygon points="0,10 28,-4 28,12 0,26" fill={p.tint} stroke={ink} strokeWidth={sw} />
          </g>

          {/* Floating Mid Isometric Prism */}
          <g transform="translate(-10, -14)">
            <polygon points="0,-20 20,-10 0,0 -20,-10" fill={p.primary} stroke={ink} strokeWidth={sw} />
            <polygon points="-20,-10 0,0 0,18 -20,8" fill={p.primary} stroke={ink} strokeWidth={sw} />
            <polygon points="0,0 20,-10 20,8 0,18" fill="#FFFFFF" stroke={ink} strokeWidth={sw} />
          </g>

          {/* Top Crown Accent Diamond */}
          <g transform="translate(18, -26)">
            <polygon points="0,-10 10,0 0,10 -10,0" fill={p.accent} stroke={ink} strokeWidth={sw} />
            <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
          </g>
        </g>
      );
  }
}

// ---------------------------------------------------------------------------
// 5. Professional Editorial Accents (Architectural Crosses, Micro Ticks, Axis)
// ---------------------------------------------------------------------------
function renderEditorialAccents(type: number, x: number, y: number, p: EditorialPalette) {
  const ink = p.ink;

  switch (type % 4) {
    case 0:
      // Precision Alignment Crosshairs +
      return (
        <g stroke={ink} strokeWidth="1" opacity="0.4">
          <line x1={x - 4} y1={y} x2={x + 4} y2={y} />
          <line x1={x} y1={y - 4} x2={x} y2={y + 4} />
        </g>
      );

    case 1:
      // Minimalist Geometric Diamond ◆
      return (
        <polygon
          points={`${x},${y - 4} ${x + 4},${y} ${x},${y + 4} ${x - 4},${y}`}
          fill={p.primary}
          opacity="0.65"
        />
      );

    case 2:
      // Linear Calibration Tick Marks ╵╵
      return (
        <g stroke={p.secondary} strokeWidth="1.2" strokeLinecap="round" opacity="0.5">
          <line x1={x - 3} y1={y - 3} x2={x - 3} y2={y + 3} />
          <line x1={x + 3} y1={y - 3} x2={x + 3} y2={y + 3} />
        </g>
      );

    case 3:
    default:
      // Subtle Concentric Node Dot
      return (
        <g opacity="0.5">
          <circle cx={x} cy={y} r="3" fill="none" stroke={ink} strokeWidth="0.8" />
          <circle cx={x} cy={y} r="1" fill={p.accent} />
        </g>
      );
  }
}

// ---------------------------------------------------------------------------
// 6. Main Component: Professional Editorial Linear Vector Artwork
// ---------------------------------------------------------------------------
export function DoodleCardArt({
  id,
  title = '',
  type = 'COURSE',
  description = '',
  className = '',
}: DoodleCardArtProps) {
  const seedKey = `${id || 'arcade-course'}-${title || ''}`;

  const { palette, topic, mainPos, accents } = useMemo(() => {
    const rng = createRng(seedKey);

    // 1. Select Editorial Palette
    const paletteIndex = Math.floor(rng() * EDITORIAL_PALETTES.length);
    const palette = EDITORIAL_PALETTES[paletteIndex];

    // 2. Detect Editorial Subject Topic
    const topic = detectEditorialTopic(title || '', type || '', description || '');

    // 3. Crisp Asymmetric Placement
    const mainPos = {
      cx: 160 + (rng() - 0.5) * 16,
      cy: 88 + (rng() - 0.5) * 10,
    };

    // 4. Exactly 2-3 Subtle Technical Reticle Accents
    const accentCount = 2 + Math.floor(rng() * 2);
    const accents: { type: number; x: number; y: number }[] = [];

    const anchorPositions = [
      { x: mainPos.cx - 78 + (rng() - 0.5) * 12, y: mainPos.cy - 36 + (rng() - 0.5) * 10 },
      { x: mainPos.cx + 78 + (rng() - 0.5) * 12, y: mainPos.cy - 30 + (rng() - 0.5) * 10 },
      { x: mainPos.cx + 68 + (rng() - 0.5) * 12, y: mainPos.cy + 34 + (rng() - 0.5) * 10 },
      { x: mainPos.cx - 68 + (rng() - 0.5) * 12, y: mainPos.cy + 32 + (rng() - 0.5) * 10 },
    ];

    for (let i = 0; i < accentCount; i++) {
      const pos = anchorPositions[i % anchorPositions.length];
      accents.push({
        type: Math.floor(rng() * 4),
        x: pos.x,
        y: pos.y,
      });
    }

    return {
      palette,
      topic,
      mainPos,
      accents,
    };
  }, [seedKey, title, type, description]);

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none transition-colors duration-300 ${className}`}
      style={{ backgroundColor: palette.bg }}
    >
      {/* 100% Pure SVG Professional Editorial Line Art */}
      <svg
        className="w-full h-full block"
        viewBox="0 0 320 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Subtle Clean Ambient Depth Gradient */}
          <radialGradient id={`edit-ambient-${id}`} cx="50%" cy="48%" r="48%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Pure Off-White Professional Editorial Canvas */}
        <rect width="320" height="180" fill={palette.bg} />
        <rect width="320" height="180" fill={`url(#edit-ambient-${id})`} />

        {/* 2. Micro Technical Accents & Crosshairs */}
        {accents.map((acc, idx) => (
          <g key={`accent-${id}-${idx}`}>
            {renderEditorialAccents(acc.type, acc.x, acc.y, palette)}
          </g>
        ))}

        {/* 3. Central Professional Architectural Vector Illustration */}
        {renderEditorialSubject(topic, mainPos.cx, mainPos.cy, palette)}
      </svg>
    </div>
  );
}
