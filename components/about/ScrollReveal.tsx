"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "article" | "blockquote" | "header";
};

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = "div",
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={
        shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22, margin: "0px 0px -48px 0px" }}
      transition={{
        duration: shouldReduceMotion ? 0.28 : 0.7,
        ease: EASE,
        delay: shouldReduceMotion ? 0 : delay,
      }}
    >
      {children}
    </MotionTag>
  );
}
