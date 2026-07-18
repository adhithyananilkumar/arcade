"use client";

import { motion, useReducedMotion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

type AnimatedPullQuoteProps = {
  quote: string;
  attribution?: string;
};

const EASE = [0.16, 1, 0.3, 1] as const;

export default function AnimatedPullQuote({
  quote,
  attribution,
}: AnimatedPullQuoteProps) {
  const shouldReduceMotion = useReducedMotion();
  const words = quote.split(" ");

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.045,
        delayChildren: shouldReduceMotion ? 0 : 0.12,
      },
    },
  };

  const word = {
    hidden: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 12, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: shouldReduceMotion
        ? { duration: 0.35 }
        : { duration: 0.55, ease: EASE },
    },
  };

  const mark = {
    hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.85 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: shouldReduceMotion
        ? { duration: 0.3 }
        : { type: "spring" as const, stiffness: 260, damping: 20, delay: 0.05 },
    },
  };

  return (
    <ScrollReveal as="blockquote" className="about-pull-quote" delay={0.1} y={28}>
      <motion.span
        className="about-pull-quote__mark"
        aria-hidden="true"
        variants={mark}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        “
      </motion.span>

      <motion.p
        className="about-pull-quote__text"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        aria-label={quote}
      >
        {words.map((w, i) => (
          <motion.span
            key={`${w}-${i}`}
            variants={word}
            className="about-pull-quote__word"
            aria-hidden="true"
            style={{ display: "inline-block", marginRight: "0.28em" }}
          >
            {w}
          </motion.span>
        ))}
      </motion.p>

      {attribution ? (
        <motion.footer
          className="about-pull-quote__attr"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.55, duration: 0.4 }}
        >
          {attribution}
        </motion.footer>
      ) : null}
    </ScrollReveal>
  );
}
