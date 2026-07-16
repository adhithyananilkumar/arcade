"use client";

import { useEffect } from "react";
import { motion, useReducedMotion, useAnimation } from "framer-motion";
import PinwheelToken from "./PinwheelToken";
import GradientText from "./GradientText";
import Link from "next/link";
import Image from "next/image";

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

// ─── Animated Gear Component ───────────────────────────────────────────────────
function AnimatedGear({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  const controls = useAnimation();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let isMounted = true;

    const safeStart = async (def: any) => {
      if (!isMounted) return;
      try {
        await controls.start(def);
      } catch (err) {
        // Safe check for unmounted state
      }
    };

    if (shouldReduceMotion) {
      controls.set({ opacity: 1, scale: 1, rotate: 0 });
      return;
    }

    const sequence = async () => {
      // 1. Initial entrance
      await safeStart({
        rotate: 0,
        scale: 1,
        opacity: 1,
        transition: {
          duration: 0.9,
          ease: [0.34, 1.56, 0.64, 1], // back.out
          delay: 0.7,
        },
      });

      if (!isMounted) return;

      // 2. Loop for random idle spin
      const playIdle = async () => {
        const delay = 3000 + Math.random() * 1000; // Randomly 3 to 4 seconds
        timeout = setTimeout(async () => {
          if (!isMounted) return;

          // Rotate backward a little
          await safeStart({
            rotate: -45,
            transition: { duration: 0.35, ease: "easeOut" },
          });

          if (!isMounted) return;

          // Spin forward fast
          await safeStart({
            rotate: 360,
            transition: { duration: 0.6, ease: "easeInOut" },
          });

          if (!isMounted) return;

          // Rest (reset to 0 invisibly for next loop)
          try {
            controls.set({ rotate: 0 });
          } catch (e) {}
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
  }, [controls, shouldReduceMotion]);

  return (
    <span key="to" style={{ display: 'inline-flex', alignItems: 'baseline' }}>
      t
      <motion.span
        style={{
          display: 'inline-block',
          width: '0.72em',
          height: '0.72em',
          marginLeft: '0.02em',
          transformOrigin: '50% 50%',
          position: 'relative',
          top: '0.07em', // Moved down slightly to match text baseline
        }}
        initial={shouldReduceMotion ? { opacity: 0 } : { rotate: -180, scale: 0, opacity: 0 }}
        animate={controls}
      >
        <Image
          src="/assets/lander/gear.svg"
          alt=""
          width={64}
          height={64}
          style={{ width: '100%', height: '100%', display: 'block' }}
          priority
        />
      </motion.span>
    </span>
  );
}

// ─── Animated Underline Component ────────────────────────────────────────────
function AnimatedUnderline({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  const controls = useAnimation();

  useEffect(() => {
    let isMounted = true;

    const safeStart = async (def: any) => {
      if (!isMounted) return;
      try {
        await controls.start(def);
      } catch (err) {
        // Safe check for unmounted state
      }
    };

    if (shouldReduceMotion) {
      try {
        controls.set({ scaleX: 1, opacity: 1 });
      } catch (e) {}
      return;
    }

    const sequence = async () => {
      // Wait for the word to reveal
      await new Promise(r => setTimeout(r, 1200));
      if (!isMounted) return;

      const loop = async () => {
        // Draw in from left
        try {
          controls.set({ transformOrigin: 'left' });
        } catch (e) {}
        await safeStart({
          scaleX: 1,
          transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] },
        });

        if (!isMounted) return;
        await new Promise(r => setTimeout(r, 3000)); // Stay visible
        if (!isMounted) return;

        // Erase out to the right (hides)
        try {
          controls.set({ transformOrigin: 'right' });
        } catch (e) {}
        await safeStart({
          scaleX: 0,
          transition: { duration: 0.8, ease: "easeInOut" },
        });

        if (!isMounted) return;
        await new Promise(r => setTimeout(r, 800)); // Wait before drawing again
        if (!isMounted) return;

        loop();
      };

      loop();
    };

    sequence();

    return () => {
      isMounted = false;
    };
  }, [controls, shouldReduceMotion]);

  return (
    <motion.span
      style={{
        position: 'absolute',
        bottom: '0',
        left: '-0.3em', // Starts immediately to the right of the 'p' stem
        right: '0',
        height: '0.08em',
        backgroundColor: '#F9C846', // Yellow
        borderRadius: '0px', // Perfectly straight
        zIndex: 0,
      }}
      initial={{ scaleX: 0 }}
      animate={controls}
    />
  );
}

// ─── Animated Mirror E Component ─────────────────────────────────────────────
function AnimatedMirrorE({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  const controls = useAnimation();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let isMounted = true;

    if (shouldReduceMotion) return;

    const sequence = async () => {
      // Wait for initial entrance to finish
      await new Promise(r => setTimeout(r, 1500));
      if (!isMounted) return;

      const loop = async (isFirst = false) => {
        // First flip happens quickly; subsequent flips wait 2 to 6 seconds
        const delay = isFirst ? 500 : 2000 + Math.random() * 4000;
        timeout = setTimeout(async () => {
          if (!isMounted) return;

          // Flip backwards (mirror)
          await controls.start({
            rotateY: 180,
            transition: { duration: 0.6, ease: "easeInOut" },
          });

          if (!isMounted) return;
          // Stay flipped for a very short time
          await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
          if (!isMounted) return;

          // Flip forwards (normal)
          await controls.start({
            rotateY: 0,
            transition: { duration: 0.6, ease: "easeInOut" },
          });

          if (!isMounted) return;
          loop(false);
        }, delay);
      };

      loop(true);
    };

    sequence();

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [controls, shouldReduceMotion]);

  return (
    <motion.span
      style={{
        display: 'inline-block',
        transformOrigin: 'center',
        fontSize: '1em',
        verticalAlign: 'baseline',
        lineHeight: 'inherit',
        letterSpacing: 'inherit',
      }}
      animate={controls}
    >
      e
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
                <span key="the" style={{ display: 'inline-flex' }}>
                  th<AnimatedMirrorE shouldReduceMotion={shouldReduceMotion} />
                </span>,
                <span key="path" style={{ display: 'inline-block' }}>
                  p
                  <span style={{ position: 'relative', display: 'inline-block' }}>
                    <span style={{ position: 'relative', zIndex: 1 }}>ath</span>
                    <AnimatedUnderline shouldReduceMotion={shouldReduceMotion} />
                  </span>
                </span>,
              ]}
              delay={0.25}
              shouldReduceMotion={shouldReduceMotion}
            />
          </span>

          {/* Line 2: mixed text and gradient */}
          {/* paddingBottom gives the 'y' descender room — do not remove */}
          <span className="l-headline__line" style={{ paddingBottom: '0.35em', overflow: 'visible' }}>
            <SplitWords
              wordsArray={[
                <AnimatedGear key="to" shouldReduceMotion={shouldReduceMotion} />,
                <GradientText
                  key="possibility"
                  colors={['#2563EB', '#0EA5E9', '#06B6D4', '#10B981', '#4F46E5', '#2563EB']}
                  animationSpeed={8}
                >
                  possibility.
                </GradientText>
              ]}
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
              href="/explore"
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
