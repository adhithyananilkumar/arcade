"use client";

import { motion, useReducedMotion } from "framer-motion";
import PinwheelToken from "./PinwheelToken";
import Link from "next/link";

// ─── Word-split helper ──────────────────────────────────────────────────────
function SplitWords({
  text,
  wordsArray,
  delay = 0,
  shouldReduceMotion,
}: {
  text?: string;
  wordsArray?: React.ReactNode[];
  delay?: number;
  shouldReduceMotion: boolean | null;
}) {
  const words = wordsArray || (text ? text.split(" ") : []);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.07,
        delayChildren: shouldReduceMotion ? 0 : delay,
      },
    },
  };

  const wordVariants = {
    hidden: shouldReduceMotion
      ? { opacity: 0, y: 0 }
      : { opacity: 0, y: "110%" },
    visible: {
      opacity: 1,
      y: 0,
      transition: shouldReduceMotion
        ? { duration: 0.4 }
        : {
          duration: 0.85,
          ease: [0.16, 1, 0.3, 1] as const,
        },
    },
  };

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {words.map((word, i) => (
        <span
          key={i}
          className="l-word-wrap"
          aria-hidden="true"
          style={{ marginRight: i < words.length - 1 ? "0.28em" : 0 }}
        >
          <motion.span className="l-word" variants={wordVariants}>
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

// ─── Gradient line: reveals words staggered but the gradient spans the full text ─
function SplitWordsGradient({
  text,
  delay = 0,
  shouldReduceMotion,
}: {
  text: string;
  delay?: number;
  shouldReduceMotion: boolean | null;
}) {
  const words = text.split(" ");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.07,
        delayChildren: shouldReduceMotion ? 0 : delay,
      },
    },
  };

  const wordVariants = {
    hidden: shouldReduceMotion
      ? { opacity: 0, y: 0 }
      : { opacity: 0, y: "110%" },
    visible: {
      opacity: 1,
      y: 0,
      transition: shouldReduceMotion
        ? { duration: 0.4 }
        : {
          duration: 0.85,
          ease: [0.16, 1, 0.3, 1] as const,
        },
    },
  };

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label={text}
      style={{
        background:
          "linear-gradient(90deg, #4C6FFF 0%, #1DB876 33%, #FF6B4A 66%, #9B5DE5 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        display: "inline",
      }}
    >
      {words.map((word, i) => (
        <span
          key={i}
          className="l-word-wrap"
          aria-hidden="true"
          style={{ marginRight: i < words.length - 1 ? "0.28em" : 0 }}
        >
          <motion.span className="l-word" variants={wordVariants}>
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

// ─── Main Hero ───────────────────────────────────────────────────────────────
export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  const fadeRise = (delay: number) => ({
    hidden: shouldReduceMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.3 : 0.55,
        ease: [0.22, 1, 0.36, 1] as const,
        delay: shouldReduceMotion ? 0.05 : delay,
      },
    },
  });

  return (
    <section className="l-hero" aria-label="Hero section">
      <div className="l-hero__inner">
        {/* ── Headline ── */}
        <h1 className="l-headline" aria-label="Lighting the path to possibility">
          {/* Line 1 */}
          <span className="l-headline__line">
            <SplitWords
              wordsArray={[
                <span key="lighting">
                  L
                  <span style={{ position: "relative", display: "inline-block" }}>
                    ı
                    <span
                      style={{
                        position: "absolute",
                        top: "0.00em",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "0.4em",
                        height: "0.4em",
                      }}
                    >
                      <PinwheelToken className="is-inline-dot" />
                    </span>
                  </span>
                  ghting
                </span>,
                "the",
                "path",
                "to",
              ]}
              delay={0.25}
              shouldReduceMotion={shouldReduceMotion}
            />
          </span>

          {/* Line 2: gradient spanning full line */}
          <span className="l-headline__line">
            <SplitWordsGradient
              text="possibility"
              delay={0.45}
              shouldReduceMotion={shouldReduceMotion}
            />
          </span>
        </h1>


        {/* ── CTAs ── */}
        <div className="l-ctas">
          <motion.div
            variants={fadeRise(shouldReduceMotion ? 0.05 : 1.15)}
            initial="hidden"
            animate="visible"
          >
            <Link
              href="/courses"
              className="l-btn l-btn--solid-ink"
              id="hero-cta-explore"
            >
              Explore Courses
            </Link>
          </motion.div>

          <motion.div
            variants={fadeRise(shouldReduceMotion ? 0.08 : 1.28)}
            initial="hidden"
            animate="visible"
          >
            <Link
              href="#how-it-works"
              className="l-btn l-btn--ghost"
              id="hero-cta-how"
            >
              See how it works
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                style={{ opacity: 0.6 }}
              >
                <path
                  d="M2.5 7h9M7 2.5 11.5 7 7 11.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
