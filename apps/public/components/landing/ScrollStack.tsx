"use client";

import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import "./ScrollStack.css";

export interface ScrollStackProps {
  children?: React.ReactNode;
  items?: React.ReactNode[];
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  className?: string;
}

export function ScrollStackItem({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`scroll-stack-card-inner ${className}`} style={style}>
      {children}
    </div>
  );
}

export default function ScrollStack({
  children,
  items,
  itemDistance = 20,
  itemScale = 0.02,
  itemStackDistance = 12,
  stackPosition = "18%",
  scaleEndPosition = "8%",
  baseScale = 0.95,
  scaleDuration = 0.15,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = true,
  className = "",
}: ScrollStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const rawItemList = items || React.Children.toArray(children);
  const totalItems = rawItemList.length;

  // Initialize Lenis with fast, responsive settings
  useEffect(() => {
    if (!useWindowScroll) return;

    let lenis: Lenis | null = null;
    try {
      lenis = new Lenis({
        duration: 0.45,
        lerp: 0.25,
        wheelMultiplier: 1.15,
        smoothWheel: true,
        syncTouch: true,
      });

      let rafId: number;
      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);

      return () => {
        cancelAnimationFrame(rafId);
        lenis?.destroy();
      };
    } catch (e) {
      console.warn("Lenis init error:", e);
    }
  }, [useWindowScroll]);

  // Sequential per-card scroll phase with dedicated reading time & strict single-card reveal
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      if (cards.length === 0) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Start stacking sequence when section top reaches 60% of viewport height
      const startTriggerTop = viewportHeight * 0.6;
      const scrolled = startTriggerTop - rect.top;

      // Total scroll runway for all card phases (110px per card phase = comfortable reading time)
      const phaseScrollPx = 110;
      const maxScrollDist = Math.max(1, (cards.length - 1) * phaseScrollPx);

      // Clamp progress P between 0.0 and 1.0
      const P = Math.max(0, Math.min(1, scrolled / maxScrollDist));

      // Each step interval width (5 steps for 6 cards)
      const numSteps = cards.length - 1;
      const stepWidth = 1 / numSteps;

      cards.forEach((card, i) => {
        if (i === 0) {
          // Card 0 (Base card): active from start. Steps back as P > 0
          const depth = P * numSteps;
          const scale = Math.max(baseScale, 1 - depth * itemScale);
          const translateY = -Math.min(depth * itemStackDistance, 60);

          card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
          card.style.opacity = "1";
          card.style.zIndex = "10";
          card.style.filter = "none";
        } else {
          // Card i (i >= 1): distinct scroll phase range [P_start, P_end]
          const P_start = (i - 1) * stepWidth;
          const P_end = i * stepWidth;

          if (P < P_start) {
            // Card has NOT reached its scroll phase yet — 100% INVISIBLE below frame
            card.style.transform = `translate3d(0, 85px, 0) scale(1)`;
            card.style.opacity = "0";
            card.style.zIndex = `${10 + i}`;
            card.style.filter = "none";
          } else if (P < P_end) {
            // Card i is currently in its active scroll phase [P_start, P_end]
            const phaseProgress = (P - P_start) / (P_end - P_start); // 0.0 to 1.0

            if (phaseProgress < 0.35) {
              // Sub-phase A (0.0 -> 0.35): Card enters UP into the stack
              const entryRatio = phaseProgress / 0.35; // 0 to 1
              const translateY = (1 - entryRatio) * 85;
              const opacity = Math.min(1, entryRatio * 2.5);

              card.style.transform = `translate3d(0, ${translateY}px, 0) scale(1)`;
              card.style.opacity = `${opacity}`;
            } else {
              // Sub-phase B (0.35 -> 1.0): Card stays stationary in front for READING
              card.style.transform = `translate3d(0, 0px, 0) scale(1)`;
              card.style.opacity = "1";
            }
            card.style.zIndex = `${10 + i}`;
            card.style.filter = "none";
          } else {
            // Card i has completed its front phase and stepped back (P >= P_end)
            const depth = (P - P_end) * numSteps;
            const scale = Math.max(baseScale, 1 - depth * itemScale);
            const translateY = -Math.min(depth * itemStackDistance, 60);

            card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
            card.style.opacity = "1";
            card.style.zIndex = `${10 + i}`;
            if (blurAmount > 0) {
              card.style.filter = `blur(${depth * blurAmount}px)`;
            } else {
              card.style.filter = "none";
            }
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [
    stackPosition,
    baseScale,
    itemScale,
    itemStackDistance,
    rotationAmount,
    blurAmount,
    totalItems,
  ]);

  // Exact compact container height: start trigger (40vh) + card height (120px) + total scroll runway + 3rem bottom breathing space
  const containerHeightStyle = `calc(40vh + 120px + ${(totalItems - 1) * 110}px + 3rem)`;

  return (
    <div
      ref={containerRef}
      className={`scroll-stack-container ${className}`}
      style={{ height: containerHeightStyle }}
    >
      <div
        className="scroll-stack-sticky-frame"
        style={{ top: stackPosition }}
      >
        {rawItemList.map((item, idx) => (
          <div
            key={idx}
            ref={(el) => {
              cardRefs.current[idx] = el;
            }}
            className="scroll-stack-card-wrapper"
            style={{
              transition: `transform ${scaleDuration}s cubic-bezier(0.16, 1, 0.3, 1), opacity ${scaleDuration}s ease`,
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
