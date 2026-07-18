"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

type UseScrollHighlightOptions = {
  enabled: boolean;
  containerRef: RefObject<HTMLElement | null>;
  rowRefs: RefObject<(HTMLElement | null)[]>;
  onActiveIndex?: (index: number) => void;
  onProgress?: (progress: number) => void;
};

/**
 * Scroll-driven "which row is closest to viewport center" highlight.
 * Relies on the page-level Lenis → ScrollTrigger.update wiring (useLenis).
 * Does not create its own Lenis instance.
 */
export function useScrollHighlight({
  enabled,
  containerRef,
  rowRefs,
  onActiveIndex,
  onProgress,
}: UseScrollHighlightOptions) {
  const onActiveRef = useRef(onActiveIndex);
  const onProgressRef = useRef(onProgress);
  onActiveRef.current = onActiveIndex;
  onProgressRef.current = onProgress;

  useGSAP(
    () => {
      if (!enabled || typeof window === "undefined") return;

      const container = containerRef.current;
      const rows = (rowRefs.current ?? []).filter(Boolean) as HTMLElement[];
      if (!container || rows.length === 0) return;

      let lastIndex = -1;

      const updateActive = () => {
        const viewMid = window.innerHeight * 0.45;
        let best = 0;
        let bestDist = Infinity;

        rows.forEach((row, i) => {
          const r = row.getBoundingClientRect();
          const mid = r.top + r.height / 2;
          const dist = Math.abs(mid - viewMid);
          if (dist < bestDist) {
            bestDist = dist;
            best = i;
          }
        });

        if (best !== lastIndex) {
          lastIndex = best;
          onActiveRef.current?.(best);
        }
      };

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: "top 75%",
        end: "bottom 35%",
        scrub: 0.65,
        onUpdate: (self) => {
          onProgressRef.current?.(self.progress);
          updateActive();
        },
        onRefresh: updateActive,
      });

      updateActive();

      return () => {
        trigger.kill();
      };
    },
    {
      scope: containerRef,
      dependencies: [enabled],
      revertOnUpdate: true,
    }
  );

  useEffect(() => {
    if (!enabled) return;
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled]);
}
