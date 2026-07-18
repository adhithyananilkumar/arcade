"use client";

import { motion, useReducedMotion } from "framer-motion";

type TextRevealProps = {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "p" | "span";
};

const EASE = [0.16, 1, 0.3, 1] as const;

export default function TextReveal({
  text,
  className,
  delay = 0,
  stagger = 0.1,
  as = "span",
}: TextRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const words = text.split(" ");
  const MotionTag = motion[as];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : stagger,
        delayChildren: shouldReduceMotion ? 0 : delay,
      },
    },
  };

  const wordVariants = {
    hidden: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: "105%" },
    visible: {
      opacity: 1,
      y: 0,
      transition: shouldReduceMotion
        ? { duration: 0.3 }
        : { duration: 0.75, ease: EASE },
    },
  };

  return (
    <MotionTag
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="l-word-wrap"
          aria-hidden="true"
          style={{ marginRight: i < words.length - 1 ? "0.28em" : 0 }}
        >
          <motion.span className="l-word" variants={wordVariants}>
            {word}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
