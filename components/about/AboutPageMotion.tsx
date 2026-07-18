"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { useLenis } from "@/hooks/useLenis";

/**
 * Lenis smooth scroll for the About page (synced with ScrollTrigger).
 * Single shared instance via useLenis — offerings scroll-highlight only consumes ScrollTrigger.
 */
export default function AboutPageMotion({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  useLenis({ enabled: shouldReduceMotion === false });

  return <div className="about-page">{children}</div>;
}
