'use client';

/**
 * LetterVectorArt
 *
 * Lightweight, aesthetic vector artwork for course and event cards.
 * Generates dynamic letter monograms with smooth gradient backdrops
 * and geometric SVG vector decorations.
 */

export function initialsFor(title: string | null): string {
  if (!title) return 'A';
  const clean = title.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (words.length === 1 && words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return clean.slice(0, 1).toUpperCase() || 'A';
}

const PALETTES = [
  { from: '#2563EB', to: '#1D4ED8', text: '#FFFFFF', ring: '#93C5FD' },
  { from: '#059669', to: '#047857', text: '#FFFFFF', ring: '#6EE7B7' },
  { from: '#7C3AED', to: '#5B21B6', text: '#FFFFFF', ring: '#C4B5FD' },
  { from: '#DB2777', to: '#9D174D', text: '#FFFFFF', ring: '#F9A8D4' },
  { from: '#D97706', to: '#B45309', text: '#FFFFFF', ring: '#FDE68A' },
  { from: '#0891B2', to: '#0E7490', text: '#FFFFFF', ring: '#67E8F9' },
  { from: '#4F46E5', to: '#3730A3', text: '#FFFFFF', ring: '#A5B4FC' },
  { from: '#0D9488', to: '#115E59', text: '#FFFFFF', ring: '#5EEAD4' },
];

export function LetterVectorArt({
  title,
  id,
  className = '',
}: {
  title: string | null;
  id: string;
  className?: string;
}) {
  const letters = initialsFor(title);

  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  const palette = PALETTES[hash % PALETTES.length];

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none ${className}`}
      style={{
        background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
      }}
    >
      {/* Decorative Vector SVG Patterns */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 120"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="175" cy="20" r="42" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="175" cy="20" r="24" fill="#FFFFFF" fillOpacity="0.12" />
        <circle cx="25" cy="95" r="32" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="25" cy="95" r="16" fill="#FFFFFF" fillOpacity="0.08" />
        <path d="M-10,30 Q 80,75 210,15" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
        <path d="M-10,65 Q 90,115 210,45" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.4" />
      </svg>

      {/* Central Vector Letter Monogram */}
      <div className="relative z-10 flex items-center justify-center">
        <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/30 shadow-md">
          <span
            className="text-2xl sm:text-3xl font-black tracking-wider text-white font-sans"
            style={{ textShadow: '0 2px 6px rgba(0,0,0,0.25)' }}
          >
            {letters}
          </span>
        </div>
      </div>
    </div>
  );
}
