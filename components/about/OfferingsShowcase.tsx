"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  ClipboardCheck,
  Award,
  PenTool,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import ScrollReveal from "./ScrollReveal";
import { useScrollHighlight } from "@/hooks/useScrollHighlight";

export const PILLARS: {
  title: string;
  description: string;
  icon: LucideIcon;
  numeral: string;
  /** Active numeral highlight — from offerings accent gradient */
  accent: string;
}[] = [
  {
    numeral: "01",
    title: "Learning",
    description:
      "Structured courses and workshops delivered from published snapshots — clear paths, not drafts.",
    icon: BookOpen,
    accent: "#4A67AD",
  },
  {
    numeral: "02",
    title: "Assessment",
    description:
      "Quizzes, exams, and practice that measure progress with institutional rigor.",
    icon: ClipboardCheck,
    accent: "#4AA1A0",
  },
  {
    numeral: "03",
    title: "Certification",
    description:
      "Trusted credentials that recognize completed learning and verified achievement.",
    icon: Award,
    accent: "#78A36F",
  },
  {
    numeral: "04",
    title: "Creator Tools",
    description:
      "Authoring surfaces for educators to build, refine, and publish lasting learning experiences.",
    icon: PenTool,
    accent: "#BA7359",
  },
  {
    numeral: "05",
    title: "Institutional Collaboration",
    description:
      "Built for departments and campuses — shared catalogs, forums, and campus-wide discovery.",
    icon: Building2,
    accent: "#9D68AF",
  },
];

function SectionIntro() {
  return (
    <ScrollReveal className="about-section__intro about-offers-intro">
      <p className="about-eyebrow">What Arcade offers</p>
      <h2 id="about-offers-heading" className="about-heading">
        Five pillars of the platform.
      </h2>
      <p className="about-lede">
        A unified learning ecosystem — from study and assessment through
        certification and creation — designed for Amal Jyothi and peers who
        share that standard.
      </p>
    </ScrollReveal>
  );
}

function PillarRow({
  numeral,
  title,
  description,
  icon: Icon,
  accent,
  active,
  hovered,
  reducedMotion,
  onHoverChange,
  index,
  rowRef,
}: {
  numeral: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  active: boolean;
  hovered: boolean;
  reducedMotion: boolean;
  onHoverChange: (index: number | null) => void;
  index: number;
  rowRef: (el: HTMLElement | null) => void;
}) {
  const lit = reducedMotion || active || hovered;

  return (
    <motion.article
      ref={rowRef}
      className={`about-pillar-row${lit ? " is-active" : ""}${
        hovered && !active ? " is-hovered" : ""
      }`}
      style={{ ["--pillar-accent" as string]: accent }}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{
        duration: reducedMotion ? 0.3 : 0.55,
        delay: reducedMotion ? 0 : index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => {
        if (window.matchMedia("(hover: hover)").matches) {
          onHoverChange(index);
        }
      }}
      onMouseLeave={() => onHoverChange(null)}
      tabIndex={0}
      aria-label={`${numeral} — ${title}. ${description}`}
      onFocus={() => onHoverChange(index)}
      onBlur={() => onHoverChange(null)}
    >
      <div className="about-pillar-row__main">
        <motion.span
          className="about-pillar-row__numeral"
          animate={
            reducedMotion
              ? { scale: 1 }
              : active
                ? { scale: [1, 1.05, 1] }
                : { scale: 1 }
          }
          transition={
            active && !reducedMotion
              ? { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
              : { duration: 0.25 }
          }
          aria-hidden="true"
        >
          {numeral}
        </motion.span>

        <div className="about-pillar-row__copy">
          <h3 className="about-pillar-row__title">
            <Icon
              className="about-pillar-row__icon"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span>{title}</span>
          </h3>

          {/* Always in DOM for a11y — opacity/transform only */}
          <p
            className="about-pillar-row__desc"
            aria-hidden={false}
          >
            {description}
          </p>
        </div>
      </div>

      {index < PILLARS.length - 1 ? (
        <Separator className="about-pillar-row__rule" />
      ) : null}
    </motion.article>
  );
}

export default function OfferingsShowcase() {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  const listRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => setMounted(true), []);

  const reducedMotion = !mounted || prefersReduced === true;
  const highlightEnabled = mounted && prefersReduced === false;

  const setRowRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      rowsRef.current[index] = el;
    },
    []
  );

  useScrollHighlight({
    enabled: highlightEnabled,
    containerRef: listRef,
    rowRefs: rowsRef,
    onActiveIndex: setActiveIndex,
    onProgress: setProgress,
  });

  return (
    <section
      className="about-offers-section"
      aria-labelledby="about-offers-heading"
    >
      <div className="about-offers-section__intro-wrap">
        <SectionIntro />
      </div>

      <div className="about-offers-list-wrap">
        {!reducedMotion ? (
          <div
            className="about-offers-rail"
            aria-hidden="true"
          >
            <div
              className="about-offers-rail__fill"
              style={{ transform: `scaleY(${Math.max(progress, 0.04)})` }}
            />
          </div>
        ) : null}

        <div ref={listRef} className="about-offers-list" role="list">
          {PILLARS.map((pillar, index) => (
            <div key={pillar.title} role="listitem">
              <PillarRow
                {...pillar}
                index={index}
                active={reducedMotion || activeIndex === index}
                hovered={!reducedMotion && hoverIndex === index}
                reducedMotion={reducedMotion}
                onHoverChange={setHoverIndex}
                rowRef={setRowRef(index)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
