'use client';

import { useEffect } from 'react';
import { motion, useAnimation, useReducedMotion } from 'framer-motion';

/**
 * Pinwheel full-stop for auth headings — Hero "i" vector, with the gear's
 * reverse-wind then forward-spin idle (auth-only, not used on the landing Hero).
 */
export function AuthPeriodGear({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion();
  const controls = useAnimation();

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const safeStart = async (def: Parameters<typeof controls.start>[0]) => {
      if (!isMounted) return;
      try {
        await controls.start(def);
      } catch {
        /* unmounted */
      }
    };

    if (reduce) {
      controls.set({ opacity: 1, scale: 1, rotate: 0 });
      return;
    }

    const sequence = async () => {
      await safeStart({
        rotate: 0,
        scale: 1,
        opacity: 1,
        transition: {
          duration: 0.55,
          ease: [0.34, 1.56, 0.64, 1],
          delay: 0.2,
        },
      });

      const playIdle = () => {
        const delay = 900 + Math.random() * 500;
        timeout = setTimeout(async () => {
          if (!isMounted) return;
          // Wind reverse (gear-style)
          await safeStart({
            rotate: -45,
            transition: { duration: 0.35, ease: 'easeOut' },
          });
          if (!isMounted) return;
          // Spin forward
          await safeStart({
            rotate: 360,
            transition: { duration: 0.6, ease: 'easeInOut' },
          });
          if (!isMounted) return;
          try {
            controls.set({ rotate: 0 });
          } catch {
            /* unmounted */
          }
          playIdle();
        }, delay);
      };

      playIdle();
    };

    sequence();

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [controls, reduce]);

  return (
    <motion.span
      aria-hidden
      className={`inline-block align-baseline ${className}`}
      style={{
        // Larger period, tucked down beside the trailing letter like a full stop
        width: '0.72em',
        height: '0.72em',
        marginLeft: '0.02em',
        transformOrigin: '50% 50%',
        position: 'relative',
        top: '0.22em',
      }}
      initial={reduce ? { opacity: 1, scale: 1 } : { rotate: -120, scale: 0, opacity: 0 }}
      animate={controls}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block"
      >
        <path
          d="M26 26 C26 14 38 14 38 26 C38 26 32 26 26 26Z"
          fill="#4C6FFF"
          opacity="0.95"
        />
        <path
          d="M26 26 C38 26 38 38 26 38 C26 38 26 32 26 26Z"
          fill="#FF6B4A"
          opacity="0.95"
        />
        <path
          d="M26 26 C26 38 14 38 14 26 C14 26 20 26 26 26Z"
          fill="#1DB876"
          opacity="0.95"
        />
        <path
          d="M26 26 C14 26 14 14 26 14 C26 14 26 20 26 26Z"
          fill="#9B5DE5"
          opacity="0.95"
        />
        <circle cx="26" cy="26" r="3.5" fill="white" />
      </svg>
    </motion.span>
  );
}
