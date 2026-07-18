"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

const CAMPUS_SRC = "/campus-amaljyothi-facade.png";

type CampusPhotoBackgroundProps = {
  /** When false, freeze ken-burns / drift (reduced motion). */
  animate?: boolean;
};

/**
 * Full-bleed AJCE campus photo with subtle Framer Motion ken-burns + drift.
 * Decorative — aria-hidden on the media layer.
 */
export default function CampusPhotoBackground({
  animate = true,
}: CampusPhotoBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const motionOn = animate && prefersReduced === false;

  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    motionOn ? [1.08, 1.18] : [1, 1]
  );
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    motionOn ? ["-4%", "4%"] : ["0%", "0%"]
  );

  return (
    <div ref={rootRef} className="about-campus-photo" aria-hidden="true">
      <motion.div
        className="about-campus-photo__media"
        style={{ scale, y }}
        initial={motionOn ? { opacity: 0, scale: 1.12 } : { opacity: 1 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: motionOn ? 1.1 : 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src={CAMPUS_SRC}
          alt=""
          fill
          sizes="100vw"
          className="about-campus-photo__img"
          priority={false}
          unoptimized
        />
      </motion.div>

      {/* Soft light wash drifting across the sky / facade */}
      {motionOn ? (
        <motion.div
          className="about-campus-photo__sheen"
          animate={{
            x: ["-12%", "18%", "-8%"],
            opacity: [0.15, 0.28, 0.15],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ) : (
        <div className="about-campus-photo__sheen about-campus-photo__sheen--static" />
      )}

      {/* Legibility gradient — moss green, denser where copy sits */}
      <div className="about-campus-photo__overlay" />
    </div>
  );
}
