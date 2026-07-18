"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import TextReveal from "./TextReveal";
import GradientText from "@/components/landing/GradientText";
import AuroraBackground from "./AuroraBackground";

const HERO_COLORS = [
  "#2563EB",
  "#0EA5E9",
  "#06B6D4",
  "#10B981",
  "#4F46E5",
  "#2563EB",
];

const EASE = [0.16, 1, 0.3, 1] as const;
const STAGGER = 0.1;

export default function AboutHero() {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Keep SSR + first client paint identical to avoid hydration mismatch.
  const shouldReduceMotion = !mounted || prefersReduced === true;

  const item = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.3 : 0.55,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const arcadeReveal = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: "105%" },
    visible: {
      opacity: 1,
      y: 0,
      transition: shouldReduceMotion
        ? { duration: 0.3, delay: STAGGER }
        : { duration: 0.75, ease: EASE, delay: STAGGER },
    },
  };

  return (
    <header className="about-hero" aria-labelledby="about-hero-heading">
      <AuroraBackground />

      <motion.div
        className="about-hero__inner"
        initial="hidden"
        animate={mounted ? "visible" : "hidden"}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: shouldReduceMotion ? 0 : STAGGER,
              delayChildren: shouldReduceMotion ? 0 : 0.12,
            },
          },
        }}
      >
        <motion.div variants={item}>
          <h1
            id="about-hero-heading"
            className="about-hero__title"
            aria-label="About Arcade."
          >
            <span aria-hidden="true">
              {mounted ? (
                <>
                  <TextReveal text="About" delay={0} stagger={STAGGER} as="span" />{" "}
                  <span className="l-word-wrap" style={{ marginRight: 0 }}>
                    <motion.span
                      className="l-word about-hero__title-accent"
                      variants={arcadeReveal}
                      initial="hidden"
                      animate="visible"
                    >
                      {shouldReduceMotion ? (
                        <span className="l-gradient-text">Arcade.</span>
                      ) : (
                        <GradientText colors={HERO_COLORS} animationSpeed={10}>
                          Arcade.
                        </GradientText>
                      )}
                    </motion.span>
                  </span>
                </>
              ) : (
                <>
                  About{" "}
                  <span className="l-gradient-text">Arcade.</span>
                </>
              )}
            </span>
          </h1>
        </motion.div>

        <motion.div className="about-hero__ctas" variants={item}>
          <motion.div
            whileHover={
              shouldReduceMotion ? undefined : { scale: 1.03, y: -1 }
            }
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
          >
            <Link href="/explore" className="l-btn l-btn--solid-ink">
              Explore courses
            </Link>
          </motion.div>
          <motion.div
            whileHover={
              shouldReduceMotion ? undefined : { scale: 1.03, y: -1 }
            }
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
          >
            <Link href="#about-mission-heading" className="l-btn l-btn--ghost">
              Our mission
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </header>
  );
}
