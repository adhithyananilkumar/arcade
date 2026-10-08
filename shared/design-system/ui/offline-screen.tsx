/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Shared
 * Subsystem: Design System
 *
 * Purpose:
 * The "you're not connected to the internet" notice. Floats over the page the user was on — only a
 * light scrim, so that page stays visible behind it — rather than in place of it, so whatever they
 * were doing (a half-written lesson, a filled-in form) is untouched and carries on when the
 * connection comes back.
 *
 * Nothing blinks: the background re-checks (every few seconds, from the connectivity store) are
 * silent; only a retry the user asked for shows "Checking…".
 *
 * Rules:
 * - Pure UI: whoever mounts it decides when, and what "Try again" does.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Loader } from './loader';

export interface OfflineScreenProps {
  /** Re-check the connection now. */
  onRetry: () => Promise<unknown> | void;
}

export function OfflineScreen({ onRetry }: OfflineScreenProps) {
  const retryRef = useRef<HTMLButtonElement>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    retryRef.current?.focus();
  }, []);

  const retry = async () => {
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="offline-screen-title"
      aria-describedby="offline-screen-body"
      className="fixed inset-0 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-[2px] animate-in fade-in duration-300 dark:bg-black/35"
      style={{ zIndex: 2147483600 }}
    >
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-surface px-6 py-8 text-center shadow-[0_24px_60px_rgba(20,20,43,0.18)] sm:px-10 animate-in zoom-in-95 slide-in-from-bottom-2 duration-300">
        <OfflineDoodle />

        <h2 id="offline-screen-title" className="mt-4 text-xl font-bold tracking-tight text-slate-900">
          Oops — we can&apos;t reach Amal Jyothi
        </h2>
        <p id="offline-screen-body" className="mt-2 text-sm leading-relaxed text-slate-500">
          Our little cloud has come unplugged, and your Wi-Fi or mobile data seems to be taking a nap.
          Don&apos;t worry — everything you were doing is safe right where you left it. Plug back in
          and we&apos;ll carry on as if nothing happened.
        </p>

        <button
          ref={retryRef}
          type="button"
          onClick={() => void retry()}
          disabled={retrying}
          className="mt-6 inline-flex h-11 min-w-[148px] items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-on-ink transition-colors hover:bg-ink-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-default disabled:opacity-80"
        >
          {retrying ? (
            <>
              <Loader size="sm" tone="light" />
              <span>Knocking…</span>
            </>
          ) : (
            'Try again'
          )}
        </button>

        <p className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
          <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" />
          We&apos;ll reconnect on our own the moment you&apos;re back
        </p>
      </div>
    </div>
  );
}

/** Soft, slow, staggered — a twinkle, never a blink. */
function twinkle(reduce: boolean | null, delay: number, duration = 3.6) {
  if (reduce) return {};
  return {
    style: { transformBox: 'fill-box' as const, transformOrigin: 'center' },
    animate: { scale: [0.7, 1.15, 0.7], rotate: [0, 45, 90], opacity: [0.55, 1, 0.55] },
    transition: { duration, delay, repeat: Infinity, ease: 'easeInOut' as const },
  };
}

/**
 * A sleepy cloud whose plug has come out of the wall. The cloud bobs and its plug sways gently from
 * the cable's own top, well clear of the socket, so the two cords never cross; the socket and its
 * cord lie still on the ground.
 */
function OfflineDoodle() {
  const reduce = useReducedMotion();

  return (
    <svg
      viewBox="0 0 240 180"
      className="mx-auto h-40 w-auto text-slate-700"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* twinkling stars */}
      <g className="text-indigo-400" stroke="currentColor" strokeWidth={2}>
        <motion.path d="M40 36v12M34 42h12" {...twinkle(reduce, 0)} />
        <motion.path d="M200 26v10M195 31h10" {...twinkle(reduce, 1.2, 4.2)} />
        <motion.path d="M212 92v7M208.5 95.5h7" {...twinkle(reduce, 2.1, 3.2)} />
        <motion.path d="M24 108v6M21 111h6" {...twinkle(reduce, 0.7, 3.9)} />
      </g>

      {/* specks drifting slowly */}
      <motion.circle
        cx="30" cy="80" r="2" className="fill-slate-300" stroke="none"
        animate={reduce ? undefined : { y: [0, -5, 0], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="214" cy="62" r="2.5" className="fill-slate-300" stroke="none"
        animate={reduce ? undefined : { y: [0, 4, 0], opacity: [0.9, 0.5, 0.9] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* ground scribble */}
      <path d="M26 162c30-4 60 2 92-1s62-3 96 1" className="text-slate-300" stroke="currentColor" />

      {/* the wall socket on the ground, its cord lying still to the right (above the ground line) */}
      <path d="M164 150c14 0 22 4 44 4" />
      <rect x="142" y="140" width="22" height="18" rx="4" className="fill-slate-100" />
      <path d="M150 145v6M156 145v6" strokeWidth={2.2} />

      {/* sparks in the gap between plug and socket: a slow glow, not a flicker */}
      <motion.g
        className="text-amber-500"
        stroke="currentColor"
        strokeWidth={2.2}
        animate={reduce ? undefined : { opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path d="M128 136l5-4" />
        <path d="M127 145h6" />
        <path d="M128 154l5 4" />
      </motion.g>

      {/* the cloud bobs; its cable and plug hang from it and sway from the cable's top */}
      <motion.g
        animate={reduce ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.g
          style={{ transformOrigin: '112px 92px' }}
          animate={reduce ? undefined : { rotate: [-3, 3, -3] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M112 92c0 10-10 14-6 30" />
          <rect x="97" y="122" width="18" height="13" rx="3.5" className="fill-slate-100" />
          <path d="M102 135v7M110 135v7" />
        </motion.g>

        <path
          d="M72 92c-19 0-22-25-4-28-1-20 25-28 36-14 9-20 47-19 50 4 20-4 32 20 17 32 2 5-3 7-9 6z"
          className="fill-indigo-50 dark:fill-indigo-500/15"
        />
        {/* sleepy eyes, a small "oh", rosy cheeks */}
        <path d="M98 66q5 5 10 0M128 66q5 5 10 0" />
        <circle cx="118" cy="79" r="3" />
        <ellipse cx="92" cy="76" rx="5" ry="3" className="fill-rose-200 dark:fill-rose-400/30" stroke="none" />
        <ellipse cx="144" cy="76" rx="5" ry="3" className="fill-rose-200 dark:fill-rose-400/30" stroke="none" />
      </motion.g>

      {/* z's drifting up from the dozing cloud */}
      {!reduce &&
        [0, 1.4].map((delay, i) => (
          <motion.text
            key={i}
            x={176 + i * 8}
            y={46 - i * 6}
            className="fill-indigo-300 dark:fill-indigo-400"
            stroke="none"
            fontSize={i ? 11 : 14}
            fontWeight={700}
            fontFamily="ui-rounded, system-ui, sans-serif"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0], y: [6, -10] }}
            transition={{ duration: 2.8, delay, repeat: Infinity, ease: 'easeOut', repeatDelay: 0 }}
          >
            z
          </motion.text>
        ))}
    </svg>
  );
}
