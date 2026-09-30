'use client';

import React, { useMemo } from 'react';
import {
  Monitor,
  ListFilter,
  GraduationCap,
  Code2,
  Terminal,
  BookOpen,
  Cpu,
  Layers,
  Sparkles,
  Shield,
  FileText,
  Workflow,
  Compass,
  Database,
  Binary,
} from 'lucide-react';

export interface DoodleCardArtProps {
  id: string;
  title?: string | null;
  type?: string | null;
  description?: string | null;
  className?: string;
}

// Curated high-end minimal stripe palettes matching modern design systems
const MINIMAL_STRIPE_THEMES = [
  {
    bg: '#F5F8FD',
    darkBg: '#0B1324',
    stripeColor: 'rgba(219, 234, 254, 0.75)',
    darkStripeColor: 'rgba(30, 58, 102, 0.4)',
    podiumBg: 'rgba(255, 255, 255, 0.88)',
    darkPodiumBg: 'rgba(15, 23, 42, 0.85)',
    podiumBorder: 'rgba(191, 219, 254, 0.9)',
    darkPodiumBorder: 'rgba(59, 130, 246, 0.3)',
    iconColor: '#2563EB',
    darkIconColor: '#60A5FA',
    accentDot: '#3B82F6',
    ambientGlow: 'rgba(59, 130, 246, 0.08)',
  },
  {
    bg: '#F6F7FB',
    darkBg: '#0F1226',
    stripeColor: 'rgba(224, 231, 255, 0.75)',
    darkStripeColor: 'rgba(49, 46, 129, 0.35)',
    podiumBg: 'rgba(255, 255, 255, 0.88)',
    darkPodiumBg: 'rgba(17, 24, 39, 0.85)',
    podiumBorder: 'rgba(199, 210, 254, 0.9)',
    darkPodiumBorder: 'rgba(99, 102, 241, 0.3)',
    iconColor: '#4F46E5',
    darkIconColor: '#818CF8',
    accentDot: '#6366F1',
    ambientGlow: 'rgba(99, 102, 241, 0.08)',
  },
  {
    bg: '#F3FAF7',
    darkBg: '#081714',
    stripeColor: 'rgba(209, 250, 229, 0.75)',
    darkStripeColor: 'rgba(6, 78, 59, 0.35)',
    podiumBg: 'rgba(255, 255, 255, 0.88)',
    darkPodiumBg: 'rgba(6, 40, 32, 0.85)',
    podiumBorder: 'rgba(167, 243, 208, 0.9)',
    darkPodiumBorder: 'rgba(16, 185, 129, 0.3)',
    iconColor: '#059669',
    darkIconColor: '#34D399',
    accentDot: '#10B981',
    ambientGlow: 'rgba(16, 185, 129, 0.08)',
  },
  {
    bg: '#FDF7F4',
    darkBg: '#1C1009',
    stripeColor: 'rgba(254, 215, 170, 0.65)',
    darkStripeColor: 'rgba(124, 45, 18, 0.35)',
    podiumBg: 'rgba(255, 255, 255, 0.88)',
    darkPodiumBg: 'rgba(41, 22, 13, 0.85)',
    podiumBorder: 'rgba(253, 186, 116, 0.9)',
    darkPodiumBorder: 'rgba(249, 115, 22, 0.3)',
    iconColor: '#EA580C',
    darkIconColor: '#FB923C',
    accentDot: '#F97316',
    ambientGlow: 'rgba(249, 115, 22, 0.08)',
  },
  {
    bg: '#FAF6FC',
    darkBg: '#170B22',
    stripeColor: 'rgba(243, 232, 255, 0.75)',
    darkStripeColor: 'rgba(88, 28, 135, 0.35)',
    podiumBg: 'rgba(255, 255, 255, 0.88)',
    darkPodiumBg: 'rgba(36, 15, 52, 0.85)',
    podiumBorder: 'rgba(233, 213, 255, 0.9)',
    darkPodiumBorder: 'rgba(168, 85, 247, 0.3)',
    iconColor: '#9333EA',
    darkIconColor: '#C084FC',
    accentDot: '#A855F7',
    ambientGlow: 'rgba(168, 85, 247, 0.08)',
  },
  {
    bg: '#F3F9FC',
    darkBg: '#081720',
    stripeColor: 'rgba(207, 250, 254, 0.75)',
    darkStripeColor: 'rgba(22, 78, 99, 0.35)',
    podiumBg: 'rgba(255, 255, 255, 0.88)',
    darkPodiumBg: 'rgba(8, 38, 52, 0.85)',
    podiumBorder: 'rgba(165, 243, 252, 0.9)',
    darkPodiumBorder: 'rgba(6, 182, 212, 0.3)',
    iconColor: '#0891B2',
    darkIconColor: '#22D3EE',
    accentDot: '#06B6D4',
    ambientGlow: 'rgba(6, 182, 212, 0.08)',
  },
];

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function resolveTopicIcon(title: string, type: string, description: string) {
  const t = `${title} ${type} ${description}`.toLowerCase();

  if (t.includes('exam') || t.includes('certif') || t.includes('assess') || t.includes('test') || t.includes('grade')) {
    return GraduationCap;
  }
  if (t.includes('code') || t.includes('program') || t.includes('java') || t.includes('python') || t.includes('react') || t.includes('script') || t.includes('dev')) {
    return Code2;
  }
  if (t.includes('terminal') || t.includes('linux') || t.includes('cli') || t.includes('bash') || t.includes('devops')) {
    return Terminal;
  }
  if (t.includes('data') || t.includes('sql') || t.includes('database') || t.includes('postgres')) {
    return Database;
  }
  if (t.includes('ai') || t.includes('ml') || t.includes('neural') || t.includes('machine') || t.includes('model')) {
    return Cpu;
  }
  if (t.includes('security') || t.includes('auth') || t.includes('shield') || t.includes('crypto')) {
    return Shield;
  }
  if (t.includes('workshop') || t.includes('event') || t.includes('live') || t.includes('workflow')) {
    return Workflow;
  }
  if (t.includes('roadmap') || t.includes('explore') || t.includes('guide')) {
    return Compass;
  }
  if (t.includes('list') || t.includes('track') || t.includes('notes') || t.includes('standard')) {
    return ListFilter;
  }

  return Monitor;
}

export function DoodleCardArt({
  id,
  title = '',
  type = 'COURSE',
  description = '',
  className = '',
}: DoodleCardArtProps) {
  const seedStr = `${id}-${title || ''}-${type || ''}`;
  const seed = useMemo(() => stringToSeed(seedStr), [seedStr]);

  const { theme, IconComponent, tagCode } = useMemo(() => {
    const theme = MINIMAL_STRIPE_THEMES[seed % MINIMAL_STRIPE_THEMES.length];
    const IconComponent = resolveTopicIcon(title || '', type || '', description || '');
    const tagCode = `REF.${((seed % 90) + 10)}`;

    return {
      theme,
      IconComponent,
      tagCode,
    };
  }, [seed, title, type, description]);

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none transition-colors duration-300 ${className}`}
      style={{
        backgroundColor: theme.bg,
      }}
    >
      {/* 1. Diagonal Striped Background Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80 dark:hidden"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 8px,
            ${theme.stripeColor} 8px,
            ${theme.stripeColor} 10px
          )`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-50 hidden dark:block"
        style={{
          backgroundColor: theme.darkBg,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 8px,
            ${theme.darkStripeColor} 8px,
            ${theme.darkStripeColor} 10px
          )`,
        }}
      />

      {/* 2. Rich Technical Vector Graphic & Blueprint Design Layer */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full opacity-55 z-0"
        viewBox="0 0 320 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Concentric Blueprint Orbit Rings */}
        <circle
          cx="160"
          cy="90"
          r="46"
          stroke={theme.accentDot}
          strokeWidth="1.2"
          strokeDasharray="4 5"
          opacity="0.75"
        />
        <circle
          cx="160"
          cy="90"
          r="68"
          stroke={theme.accentDot}
          strokeWidth="0.8"
          strokeDasharray="2 4"
          opacity="0.4"
        />

        {/* Diagonal Ray Accent Vectors */}
        <line x1="120" y1="50" x2="105" y2="35" stroke={theme.accentDot} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        <line x1="200" y1="130" x2="215" y2="145" stroke={theme.accentDot} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        <line x1="200" y1="50" x2="215" y2="35" stroke={theme.accentDot} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        <line x1="120" y1="130" x2="105" y2="145" stroke={theme.accentDot} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

        {/* Minimal Precision Axis Calibration Ticks */}
        <path
          d="M160 16 L160 26 M160 154 L160 164 M84 90 L94 90 M226 90 L236 90"
          stroke={theme.accentDot}
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Architectural Technical HUD Corner Brackets */}
        <path d="M16 26 L16 16 L26 16" stroke={theme.accentDot} strokeWidth="1.3" opacity="0.5" strokeLinecap="round" />
        <path d="M304 26 L304 16 L294 16" stroke={theme.accentDot} strokeWidth="1.3" opacity="0.5" strokeLinecap="round" />
        <path d="M16 154 L16 164 L26 164" stroke={theme.accentDot} strokeWidth="1.3" opacity="0.5" strokeLinecap="round" />
        <path d="M304 154 L304 164 L294 164" stroke={theme.accentDot} strokeWidth="1.3" opacity="0.5" strokeLinecap="round" />

        {/* Fine Calibration Measurement Ruler on Left */}
        <line x1="24" y1="65" x2="28" y2="65" stroke={theme.accentDot} strokeWidth="1" opacity="0.4" />
        <line x1="24" y1="75" x2="32" y2="75" stroke={theme.accentDot} strokeWidth="1" opacity="0.6" />
        <line x1="24" y1="85" x2="28" y2="85" stroke={theme.accentDot} strokeWidth="1" opacity="0.4" />
        <line x1="24" y1="95" x2="32" y2="95" stroke={theme.accentDot} strokeWidth="1" opacity="0.6" />
        <line x1="24" y1="105" x2="28" y2="105" stroke={theme.accentDot} strokeWidth="1" opacity="0.4" />
        <line x1="24" y1="115" x2="32" y2="115" stroke={theme.accentDot} strokeWidth="1" opacity="0.6" />

        {/* Geometric Spark Nodes */}
        <circle cx="282" cy="70" r="2" fill={theme.accentDot} opacity="0.5" />
        <circle cx="288" cy="82" r="1.5" fill={theme.accentDot} opacity="0.3" />
        <circle cx="278" cy="98" r="2" fill={theme.accentDot} opacity="0.5" />
      </svg>

      {/* 3. Top-Right Reference HUD Tag */}
      <div className="absolute top-2.5 right-3 flex items-center gap-1.5 opacity-70 pointer-events-none z-10 font-mono text-[8.5px] tracking-wider text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs px-1.5 py-0.5 rounded-sm border border-slate-200/50 dark:border-slate-800/50 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.accentDot }} />
        <span className="font-semibold">{tagCode}</span>
      </div>

      {/* 4. Bottom-Left Minimalist Topic Chip Pill */}
      <div className="absolute bottom-2.5 left-3 flex items-center gap-1 opacity-65 pointer-events-none z-10 font-mono text-[8px] tracking-widest uppercase text-slate-600 dark:text-slate-300">
        <span className="opacity-40">§</span>
        <span>{type || 'MODULE'}</span>
      </div>

      {/* 5. Centered Icon with Glass Podium & Subtle Ambient Halo */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Ambient Halo behind podium */}
        <div
          className="pointer-events-none absolute w-20 h-20 rounded-full blur-md opacity-40 transition-transform duration-500 group-hover:scale-125"
          style={{ backgroundColor: theme.ambientGlow }}
        />

        {/* Light Mode Podium */}
        <div
          className="dark:hidden relative flex items-center justify-center w-15 h-15 rounded-2xl backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.04)] border transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
          style={{
            backgroundColor: theme.podiumBg,
            borderColor: theme.podiumBorder,
          }}
        >
          <IconComponent
            size={28}
            strokeWidth={1.6}
            className="transition-transform duration-300 group-hover:scale-105"
            style={{ color: theme.iconColor }}
          />
        </div>

        {/* Dark Mode Podium */}
        <div
          className="hidden dark:flex relative items-center justify-center w-15 h-15 rounded-2xl backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.5)] border transition-all duration-300 group-hover:scale-110"
          style={{
            backgroundColor: theme.darkPodiumBg,
            borderColor: theme.darkPodiumBorder,
          }}
        >
          <IconComponent
            size={28}
            strokeWidth={1.6}
            className="transition-transform duration-300 group-hover:scale-105"
            style={{ color: theme.darkIconColor }}
          />
        </div>
      </div>

      {/* 6. Clean Bottom 1px Card Divider */}
      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-slate-200/60 dark:bg-slate-800/80" />
    </div>
  );
}











