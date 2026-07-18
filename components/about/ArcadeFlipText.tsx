"use client";

import { motion, useReducedMotion } from "framer-motion";

const WORD = "Arcade.";

const GRADIENT =
  "linear-gradient(90deg, #2563EB, #0EA5E9, #06B6D4, #10B981, #4F46E5, #2563EB)";

const FLIP_EASE = [0.34, 1.56, 0.64, 1] as const;

type ArcadeFlipTextProps = {
  /** Delay before the first letter starts (after "About" begins). */
  startDelay?: number;
  /** ms between letters — keep total ~600–900ms. */
  letterStagger?: number;
  reducedMotion?: boolean;
};

/**
 * Letter-by-letter 3D flip-in for "Arcade." only.
 * Outer wrapper stays inline-block + baseline-aligned so "About" layout is untouched.
 */
export default function ArcadeFlipText({
  startDelay = 0.28,
  letterStagger = 0.05,
  reducedMotion: reducedMotionProp,
}: ArcadeFlipTextProps) {
  const prefersReduced = useReducedMotion();
  const reduced =
    reducedMotionProp === true || prefersReduced === true;

  const chars = WORD.split("");

  if (reduced) {
    return (
      <span className="about-hero__arcade-flip about-hero__arcade-flip--static">
        <span className="sr-only">{WORD}</span>
        <span className="about-hero__arcade-flip__static" aria-hidden="true">
          {WORD}
        </span>
      </span>
    );
  }

  return (
    <span className="about-hero__arcade-flip">
      <span className="sr-only">{WORD}</span>
      <motion.span
        className="about-hero__arcade-flip__track"
        aria-hidden="true"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: letterStagger,
              delayChildren: startDelay,
            },
          },
        }}
      >
        {chars.map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            className="about-hero__arcade-flip__letter"
            style={{
              backgroundImage: GRADIENT,
              backgroundSize: `${chars.length * 100}% 100%`,
              backgroundPosition: `${
                chars.length === 1
                  ? 0
                  : (i / (chars.length - 1)) * 100
              }% 50%`,
            }}
            variants={{
              hidden: { opacity: 0, rotateX: -90 },
              visible: {
                opacity: 1,
                rotateX: 0,
                transition: {
                  duration: 0.45,
                  ease: FLIP_EASE,
                },
              },
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    </span>
  );
}
