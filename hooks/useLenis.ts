"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Shared About-page Lenis — never create a second instance. */
let sharedLenis: Lenis | null = null;
let sharedSubscribers = 0;

export function getSharedLenis() {
  return sharedLenis;
}

type UseLenisOptions = {
  /** When false, Lenis is not started (e.g. reduced motion). */
  enabled?: boolean;
};

/**
 * Inertia smooth scroll synced with GSAP ScrollTrigger.
 * Call once from AboutPageMotion. Scroll-highlight hooks only consume ScrollTrigger updates.
 * Lenis base styles live in components/about/about.css.
 */
export function useLenis({ enabled = true }: UseLenisOptions = {}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    if (sharedLenis) {
      lenisRef.current = sharedLenis;
      sharedSubscribers += 1;
      return () => {
        sharedSubscribers = Math.max(0, sharedSubscribers - 1);
        lenisRef.current = null;
      };
    }

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      touchMultiplier: 1.5,
      autoRaf: false,
    });
    sharedLenis = lenis;
    sharedSubscribers = 1;
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      sharedSubscribers = Math.max(0, sharedSubscribers - 1);
      if (sharedSubscribers === 0 && sharedLenis === lenis) {
        gsap.ticker.remove(ticker);
        lenis.destroy();
        sharedLenis = null;
      }
      lenisRef.current = null;
    };
  }, [enabled]);

  return lenisRef;
}
