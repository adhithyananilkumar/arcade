'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Public
 *
 * Purpose:
 * What `domain/<handle>` shows when nothing lives at that address.
 *
 * Rules:
 * - Deliberately does not distinguish "never existed" from "renamed away" or
 *   "reserved by Arcade". All three are plain 404 to the visitor: telling them
 *   which would turn this page into a probe for whether a given account exists.
 *   So the handle is never echoed back and the copy is the generic 404 copy.
 * - Same page for guests and signed-in members.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import Link from 'next/link';

/**
 * Colourful doodle on a transparent background: a ghost searching with a magnifier.
 * It is drawn in stroke by stroke, then the question marks pop in; afterwards the
 * ghost blinks and its eyes follow its mood (happy, wide-eyed, squinting). The magnifier stays still, and nothing moves up and down.
 */
function LostGhostDoodle() {
  return (
    <svg
      viewBox="0 0 340 250"
      className="h-auto w-72 text-slate-800 sm:w-96"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <style>{`
        .nf-body   { stroke-dasharray: 1; animation: nf-draw 1.3s ease-out both, nf-fill .6s ease-out 1s both; }
        .nf-trail  { stroke-dasharray: 1; animation: nf-draw 1s ease-out .2s both; }
        .nf-lens   { animation: nf-appear .5s ease-out 1.3s both; }
        .nf-eyes   { animation: nf-look 9s ease-in-out 1.3s infinite both; }
        .nf-eye    { transform-box: fill-box; transform-origin: center; animation: nf-eye 9s ease-in-out 1.3s infinite both; }
        .nf-mouth  { opacity: 0; animation: nf-mouth 9s ease-in-out infinite both; }
        .nf-blink  { transform-box: fill-box; transform-origin: center; animation: nf-blink 4.8s ease-in-out 2s infinite; }
        .nf-q      { transform-box: fill-box; transform-origin: center; animation: nf-qpop .6s cubic-bezier(.34,1.56,.64,1) both, nf-wobble 3s ease-in-out infinite; }
        .nf-pop    { transform-box: fill-box; transform-origin: center; animation: nf-pop 2.8s ease-in-out infinite; }
        @keyframes nf-draw   { from { stroke-dashoffset: 1 } to { stroke-dashoffset: 0 } }
        @keyframes nf-fill   { from { fill-opacity: 0 } to { fill-opacity: 1 } }
        @keyframes nf-appear { from { opacity: 0 } to { opacity: 1 } }
        @keyframes nf-look   { 0%,33%,66%,100% { transform: translateX(0) } 8% { transform: translateX(-3px) } 18% { transform: translateX(3px) } 28% { transform: translateX(0) } 72% { transform: translateX(-4px) } 82% { transform: translateX(4px) } 92% { transform: translateX(-4px) } }
        @keyframes nf-eye    { 0%,33%,66%,100% { transform: scale(1,1) } 38%,58% { transform: scale(1.4,1.4) } 72%,92% { transform: scale(1,.55) } }
        @keyframes nf-mouth  { 0% { opacity: 0 } 4% { opacity: 1 } 30% { opacity: 1 } 34%,100% { opacity: 0 } }
        @keyframes nf-blink  { 0%,92%,100% { transform: scaleY(1) } 96% { transform: scaleY(.1) } }
        @keyframes nf-qpop   { from { transform: scale(0) rotate(-40deg); opacity: 0 } to { transform: scale(1) rotate(0); opacity: 1 } }
        @keyframes nf-wobble { 0%,100% { transform: rotate(0deg) } 25% { transform: rotate(-8deg) } 75% { transform: rotate(8deg) } }
        @keyframes nf-pop    { 0%,100% { transform: scale(.7); opacity: .45 } 50% { transform: scale(1.1); opacity: 1 } }
        @media (prefers-reduced-motion: reduce) {
          .nf-body, .nf-trail, .nf-lens, .nf-eyes, .nf-eye, .nf-mouth, .nf-blink, .nf-q, .nf-pop { animation: none }
          .nf-smile { opacity: 1 }
        }
      `}</style>

      <ellipse cx="160" cy="226" rx="62" ry="7" fill="currentColor" stroke="none" opacity="0.1" />

      {/* question marks: pop in one after another, then wobble in place */}
      <text className="nf-q" x="46" y="86" fontSize="40" fontWeight="800" fill="#6366f1" stroke="none" style={{ animationDelay: '0s, 0.6s' }}>?</text>
      <text className="nf-q" x="290" y="200" fontSize="28" fontWeight="800" fill="#06b6d4" stroke="none" style={{ animationDelay: '0.25s, 0.85s' }}>?</text>
      <text className="nf-q" x="36" y="186" fontSize="22" fontWeight="800" fill="#f472b6" stroke="none" style={{ animationDelay: '0.5s, 1.1s' }}>?</text>

      {/* sparkles */}
      <path className="nf-pop" d="M105 38 v18 M96 47 h18" stroke="#f59e0b" />
      <path className="nf-pop" d="M300 56 v14 M293 63 h14" stroke="#06b6d4" style={{ animationDelay: '-0.9s' }} />
      <path className="nf-pop" d="M244 22 v10 M239 27 h10" stroke="#f472b6" style={{ animationDelay: '-1.8s' }} />

      {/* squiggle trail, drawn in */}
      <path className="nf-trail" pathLength="1" d="M26 128 q8 -9 16 0 t16 0 t16 0" stroke="#8b5cf6" strokeWidth="3" />

      <g>
        {/* body, drawn in then filled */}
        <path
          className="nf-body"
          pathLength="1"
          d="M100 190 V110 C100 70 125 45 160 45 C195 45 220 70 220 110 V190 Q205 208 190 190 Q175 172 160 190 Q145 208 130 190 Q115 172 100 190 Z"
          fill="#e0e7ff"
        />

        {/* face */}
        <g className="nf-eyes">
          <g className="nf-blink">
            <circle className="nf-eye" cx="140" cy="104" r="6" fill="currentColor" stroke="none" />
            <circle className="nf-eye" cx="180" cy="104" r="6" fill="currentColor" stroke="none" />
          </g>
        </g>
        {/* mouth: smile, surprised, unsure; they cross-fade in turn */}
        <path className="nf-mouth nf-smile" d="M146 124 Q160 142 174 124" style={{ animationDelay: '1.3s' }} />
        <ellipse className="nf-mouth" cx="160" cy="130" rx="5.5" ry="7" fill="currentColor" stroke="none" style={{ animationDelay: '4.3s' }} />
        <path className="nf-mouth" d="M147 132 q6.5 -7 13 0 t13 0" style={{ animationDelay: '7.3s' }} />
        <ellipse cx="124" cy="122" rx="8" ry="4.5" fill="#f9a8d4" stroke="none" opacity="0.8" />
        <ellipse cx="196" cy="122" rx="8" ry="4.5" fill="#f9a8d4" stroke="none" opacity="0.8" />

        {/* arm + magnifier */}
        <g className="nf-lens">
          <path d="M218 138 Q232 142 238 152" />
          <path d="M238 152 L256 128" strokeWidth="7" stroke="#8b5cf6" />
          <circle cx="274" cy="98" r="31" fill="#cffafe" fillOpacity="0.85" />
          <text x="274" y="110" textAnchor="middle" fontSize="34" fontWeight="800" fill="#6366f1" stroke="none">?</text>
          <path d="M253 82 Q258 71 269 67" stroke="#ffffff" strokeWidth="3.5" />
        </g>
      </g>
    </svg>
  );
}

export function ProfileNotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 pb-20 pt-16 text-center">
      <LostGhostDoodle />

      <h1 className="mt-4 text-8xl font-black leading-none tracking-tight text-slate-900 md:text-9xl">404</h1>
      <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">Page not found</h2>
      <p className="mt-3 max-w-sm text-[14px] font-medium leading-relaxed text-slate-500">
        The page you&apos;re looking for doesn&apos;t exist or might have been moved.
      </p>

      <Link
        href="/"
        className="mt-9 rounded-full bg-slate-900 px-9 py-3.5 text-[13px] font-extrabold tracking-tight text-on-ink transition-all hover:bg-slate-800 active:scale-95"
      >
        Back to Home
      </Link>
    </div>
  );
}
