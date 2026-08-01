"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

export interface ArcCarouselProps {
  items: React.ReactNode[];
  onActiveIndexChange?: (index: number) => void;
  // Configuration
  xSpacing?: number;      // Horizontal spacing between cards
  yFalloff?: number;      // How much a card drops per offset step
  scaleFalloff?: number;  // How much a card scales down per offset step
  rotateZFactor?: number; // How much a card tilts (rotates Z) per offset step
  opacityFalloff?: number;// How much opacity drops per offset step
  cardWidth?: number;     // Physical width of a single card
  cardHeight?: number;    // Physical height of a single card
}

export function ArcCarousel({
  items,
  onActiveIndexChange,
  xSpacing = 260,
  yFalloff = 25,
  scaleFalloff = 0.1,
  rotateZFactor = 5,
  opacityFalloff = 0.3,
  cardWidth = 340,
  cardHeight = 320,
}: ArcCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const totalItems = items.length;

  const getOffset = (index: number, active: number, total: number) => {
    let diff = index - active;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 30; // drag threshold
    if (info.offset.x < -threshold) {
      next();
    } else if (info.offset.x > threshold) {
      prev();
    }
  };

  const next = () => {
    setActiveIndex((prevIdx) => {
      const nextIdx = (prevIdx + 1) % totalItems;
      if (onActiveIndexChange) onActiveIndexChange(nextIdx);
      return nextIdx;
    });
  };

  const prev = () => {
    setActiveIndex((prevIdx) => {
      const nextIdx = (prevIdx - 1 + totalItems) % totalItems;
      if (onActiveIndexChange) onActiveIndexChange(nextIdx);
      return nextIdx;
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalItems, onActiveIndexChange]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: `${cardHeight + yFalloff * 4 + 80}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
        padding: "20px 0",
      }}
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          cursor: "grab",
        }}
        whileTap={{ cursor: "grabbing" }}
      >
        <AnimatePresence initial={false}>
          {items.map((item, index) => {
            const offset = getOffset(index, activeIndex, totalItems);
            
            // Math for the arc
            const absOffset = Math.abs(offset);
            const x = offset * xSpacing;
            // Parabola-like drop for y to create the arc
            const y = Math.pow(absOffset, 1.4) * yFalloff; 
            const scale = 1 - absOffset * scaleFalloff;
            const rotateZ = offset * rotateZFactor;
            // Opacity falls off, but we keep the center (0) at 1
            const opacity = Math.max(0, 1 - absOffset * opacityFalloff);
            const zIndex = totalItems - absOffset;

            // Only render items if they have >0 opacity or are close to center
            if (absOffset > 2.5) {
                // If it's very far (in a large array), we can hide it.
                // But for 5 items, they will all be within [-2, 2]
            }

            return (
              <motion.div
                key={index}
                onClick={() => {
                  if (activeIndex !== index) {
                    setActiveIndex(index);
                    if (onActiveIndexChange) onActiveIndexChange(index);
                  }
                }}
                initial={false}
                animate={{
                  x,
                  y,
                  scale,
                  rotateZ,
                  opacity,
                  zIndex,
                }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 24,
                  mass: 0.8,
                }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  marginLeft: -(cardWidth / 2),
                  marginTop: -(cardHeight / 2),
                  width: cardWidth,
                  transformOrigin: "center bottom",
                  cursor: activeIndex === index ? "default" : "pointer",
                }}
              >
                {item}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
