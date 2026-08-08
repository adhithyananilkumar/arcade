'use client';

import { motion, useReducedMotion } from 'framer-motion';

/** Soft bouncing pebble dots — used for auth/onboarding transitions. */
export function PebbleLoader({
  label,
  tone = 'ink',
  size = 'md',
}: {
  label?: string;
  tone?: 'ink' | 'light';
  size?: 'sm' | 'md';
}) {
  const reduce = useReducedMotion();
  const color = tone === 'light' ? 'bg-white' : 'bg-[#14142b]';
  const dot = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5';
  const bounce = size === 'sm' ? -6 : -10;

  return (
    <div
      className={`flex flex-col items-center ${size === 'sm' ? 'gap-0' : 'gap-4'}`}
      role="status"
      aria-live="polite"
    >
      <div className={`flex items-end ${size === 'sm' ? 'gap-1.5' : 'gap-2'}`}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className={`block rounded-full ${dot} ${color}`}
            animate={
              reduce
                ? { opacity: [0.35, 1, 0.35] }
                : { y: [0, bounce, 0], opacity: [0.35, 1, 0.35], scale: [0.92, 1.05, 0.92] }
            }
            transition={{
              duration: 0.95,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.14,
            }}
          />
        ))}
      </div>
      {label && (
        <p className={`text-sm font-medium ${tone === 'light' ? 'text-white/80' : 'text-slate-500'}`}>
          {label}
        </p>
      )}
      <span className="sr-only">{label || 'Loading'}</span>
    </div>
  );
}
