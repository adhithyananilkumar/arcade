"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, University, BadgeCheck, FolderOpen, GraduationCap, Trophy, BookMarked } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CertCard {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  benefits: string[];      // 3 bullet points shown inline on the card
  gradFrom: string;
  gradTo: string;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  glowColor: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const CARDS: CertCard[] = [
  {
    id: "ajce-recognition",
    icon: University,
    title: "AJCE-Backed Recognition",
    description:
      "Every Arcade certificate is officially issued through the learning ecosystem of Amal Jyothi College of Engineering, providing trusted institutional recognition for your academic achievements.",
    benefits: [
      "Official institutional recognition",
      "Trusted academic record",
      "Strengthens academic credibility",
    ],
    gradFrom: "#EEF7FF", gradTo: "#D6ECFF",
    iconBg: "#C8E6FF", iconColor: "#2E7BC4",
    borderColor: "rgba(139,198,255,0.50)",
    glowColor: "rgba(139,198,255,0.50)",
  },
  {
    id: "verified-authentic",
    icon: BadgeCheck,
    title: "Verified & Authentic",
    description:
      "Each certificate is securely generated and independently verifiable online, making your credentials reliable for employers, institutions, and professional networks worldwide.",
    benefits: [
      "Instantly verifiable by employers",
      "Tamper-proof digital record",
      "Trusted across professional networks",
    ],
    gradFrom: "#F3EFFF", gradTo: "#E4DAFF",
    iconBg: "#DDD4FF", iconColor: "#6B4FCF",
    borderColor: "rgba(180,160,255,0.45)",
    glowColor: "rgba(180,160,255,0.50)",
  },
  {
    id: "strengthen-portfolio",
    icon: FolderOpen,
    title: "Strengthen Your Portfolio",
    description:
      "Showcase verified participation in webinars, hackathons, workshops, and competitions as concrete evidence of continuous learning and hands-on engagement.",
    benefits: [
      "Documents all learning milestones",
      "Highlights practical experience",
      "Differentiates you from peers",
    ],
    gradFrom: "#EEFAF6", gradTo: "#D5F2E9",
    iconBg: "#C0EBD9", iconColor: "#1E8A63",
    borderColor: "rgba(100,210,168,0.42)",
    glowColor: "rgba(100,210,168,0.48)",
  },
  {
    id: "professional-profile",
    icon: GraduationCap,
    title: "Professional Profile Ready",
    description:
      "Add your certificates directly to your résumé, LinkedIn profile, or personal portfolio to demonstrate a genuine commitment to upskilling and career growth.",
    benefits: [
      "LinkedIn-ready one-click export",
      "Enhances résumé credibility",
      "Shareable with recruiters instantly",
    ],
    gradFrom: "#EEF7FF", gradTo: "#D6ECFF",
    iconBg: "#C8E6FF", iconColor: "#2563EB",
    borderColor: "rgba(139,198,255,0.45)",
    glowColor: "rgba(139,198,255,0.50)",
  },
  {
    id: "recognize-achievement",
    icon: Trophy,
    title: "Recognize Every Achievement",
    description:
      "Whether you attend a seminar or win a national hackathon, every meaningful milestone is captured as a permanent, shareable digital credential.",
    benefits: [
      "Every participation is preserved",
      "Special recognition for wins",
      "Builds a lifetime achievement record",
    ],
    gradFrom: "#EDFBFB", gradTo: "#D2F4F4",
    iconBg: "#B8ECEC", iconColor: "#187676",
    borderColor: "rgba(90,210,210,0.42)",
    glowColor: "rgba(90,210,210,0.48)",
  },
  {
    id: "learn-confidence",
    icon: BookMarked,
    title: "Learn with Confidence",
    description:
      "Participate in events knowing your accomplishments are recognized through a trusted academic platform — not a generic website — backed by AJCE's academic standing.",
    benefits: [
      "Backed by a trusted institution",
      "Encourages continuous engagement",
      "Motivates lifelong learning",
    ],
    gradFrom: "#F0F0FF", gradTo: "#DFE0FF",
    iconBg: "#D0D1FF", iconColor: "#4145C4",
    borderColor: "rgba(140,144,255,0.42)",
    glowColor: "rgba(140,144,255,0.48)",
  },
];

// ─── Cover Flow constants ─────────────────────────────────────────────────────

const STEP  = 270;
const DEPTH = 140;
const LEAN  = 38;

function cardTransform(offset: number) {
  const abs  = Math.abs(offset);
  const sign = offset < 0 ? -1 : 1;
  return {
    x:       offset * STEP,
    z:       abs === 0 ? 0 : -DEPTH - (abs - 1) * 40,
    rotateY: abs === 0 ? 0 : sign * -LEAN,
    scale:   abs === 0 ? 1.0 : abs === 1 ? 0.82 : 0.68,
    opacity: abs === 0 ? 1.0 : abs === 1 ? 0.75 : abs === 2 ? 0.50 : 0,
  };
}

const COVER_SPRING = { type: "spring" as const, stiffness: 260, damping: 32, mass: 0.9 };

// ─── CoverFlow component ──────────────────────────────────────────────────────

function CoverFlow({ cards }: { cards: CertCard[] }) {
  const n               = cards.length;
  const [active, setActive] = useState(0);
  const pausedRef       = useRef(false);
  const nRef            = useRef(n);          // always up-to-date inside the interval
  const dragStart       = useRef<number>(0);
  const dragging        = useRef(false);

  // Keep nRef current (n is stable here since CARDS is constant, but this is correct regardless)
  nRef.current = n;

  // ── Autoplay ─────────────────────────────────────────────────────────────
  // One interval for the lifetime of the component.
  // Reads pausedRef and nRef directly — no stale closures, no deps needed.
  useEffect(() => {
    const tick = () => {
      if (!pausedRef.current) {
        setActive((prev) => (prev + 1) % nRef.current);
      }
    };
    const id = setInterval(tick, 4000);
    return () => clearInterval(id);
  }, []); // empty array is correct: interval never needs to be recreated

  const handleMouseEnter = () => { pausedRef.current = true;  };
  const handleMouseLeave = () => { pausedRef.current = false; };

  const manualNavigate = (next: number) => setActive(next);

  // ── Drag / swipe ────────────────────────────────────────────────────────
  function handlePointerDown(e: React.PointerEvent) {
    dragStart.current = e.clientX;
    dragging.current  = false;
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (Math.abs(e.clientX - dragStart.current) > 6) dragging.current = true;
  }
  function handlePointerUp(e: React.PointerEvent) {
    const delta = e.clientX - dragStart.current;
    if (Math.abs(delta) > 48) {
      manualNavigate(delta < 0 ? (active + 1) % n : (active - 1 + n) % n);
    }
  }

  // ── Keyboard ────────────────────────────────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") manualNavigate((active + 1) % n);
    if (e.key === "ArrowLeft")  manualNavigate((active - 1 + n) % n);
  }

  // Shortest signed distance around the ring
  function wrappedOffset(idx: number) {
    let off = idx - active;
    if (off >  n / 2) off -= n;
    if (off < -n / 2) off += n;
    return off;
  }

  return (
    <div
      className="flex flex-col items-center gap-8 select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── 3-D stage ── */}
      <div
        className="relative w-full overflow-visible"
        style={{ height: 480, perspective: 1100 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Certification carousel — use arrow keys to navigate"
      >
        {/* Active-card glow blob */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[460px] rounded-[32px] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse, ${cards[active].glowColor} 0%, transparent 72%)`,
            filter: "blur(36px)",
            opacity: 0.65,
            zIndex: 0,
          }}
          aria-hidden="true"
        />

        {/* Cards */}
        {cards.map((card, idx) => {
          const offset   = wrappedOffset(idx);
          const abs      = Math.abs(offset);
          const tf       = cardTransform(offset);
          const isCenter = offset === 0;

          if (abs > 2) return null;

          const Icon = card.icon;

          return (
            <motion.div
              key={card.id}
              animate={{
                x:       tf.x,
                z:       tf.z,
                rotateY: tf.rotateY,
                scale:   tf.scale,
                opacity: tf.opacity,
                ...(isCenter ? {} : { y: 0 }),
              }}
              transition={COVER_SPRING}
              onClick={() => { if (!dragging.current && !isCenter) manualNavigate(idx); }}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !isCenter) {
                  e.stopPropagation();
                  manualNavigate(idx);
                }
              }}
              role={isCenter ? "article" : "button"}
              tabIndex={isCenter ? -1 : 0}
              aria-label={isCenter ? card.title : `Go to ${card.title}`}
              className="absolute top-0 left-1/2"
              style={{
                width: 300,
                marginLeft: -150,
                transformStyle: "preserve-3d",
                zIndex: 10 - abs,
                cursor: isCenter ? "default" : "pointer",
              }}
            >
              {/* Float wrapper — isolated from position/scale transitions */}
              <motion.div
                animate={isCenter ? { y: [0, -7, 0] } : { y: 0 }}
                transition={isCenter
                  ? { duration: 3.4, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.3 }
                }
              >
              <div
                className="w-full rounded-[24px] overflow-hidden flex flex-col"
                style={{
                  height: 460,
                  background: `linear-gradient(150deg, ${card.gradFrom} 0%, ${card.gradTo} 100%)`,
                  border: `1.5px solid ${card.borderColor}`,
                  boxShadow: isCenter
                    ? `0 24px 60px -8px ${card.glowColor}, 0 8px 24px rgba(30,58,95,0.10)`
                    : "0 8px 24px rgba(30,58,95,0.07)",
                  backdropFilter: "blur(4px)",
                  WebkitBackdropFilter: "blur(4px)",
                }}
              >
                {/* Top-edge glint */}
                <div
                  className="absolute inset-x-0 top-0 h-[1.5px] pointer-events-none rounded-t-[24px]"
                  style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.90),transparent)" }}
                  aria-hidden="true"
                />

                {/* Icon area */}
                <div
                  className="flex items-center justify-center pt-8 pb-5"
                  style={{ background: `linear-gradient(160deg, ${card.iconBg} 0%, rgba(255,255,255,0.25) 100%)` }}
                >
                  <Icon
                    size={64}
                    style={{ color: card.iconColor, opacity: 0.88 }}
                    strokeWidth={1.2}
                    aria-hidden="true"
                  />
                </div>

                {/* Text area */}
                <div
                  className="flex flex-col gap-3 px-6 pt-4 pb-6"
                  style={{ background: "rgba(255,255,255,0.58)", flex: 1 }}
                >
                  {/* Title */}
                  <h3
                    className="text-[16px] font-bold leading-snug tracking-tight"
                    style={{ color: "#1E3A5F" }}
                  >
                    {card.title}
                  </h3>

                  {/* Description — visible on all cards, line-clamp keeps side cards tidy */}
                  <p
                    className={`text-[12.5px] leading-[1.65] ${isCenter ? "" : "line-clamp-3"}`}
                    style={{ color: "#4A6A8A" }}
                  >
                    {card.description}
                  </p>

                  {/* Key Benefits — only fully rendered on centre card */}
                  {isCenter && (
                    <div className="mt-1">
                      <p
                        className="text-[10px] font-semibold uppercase tracking-[0.13em] mb-2"
                        style={{ color: card.iconColor, opacity: 0.75 }}
                      >
                        Key Benefits
                      </p>
                      <ul className="flex flex-col gap-1.5">
                        {card.benefits.map((b) => (
                          <li
                            key={b}
                            className="flex items-center gap-2 text-[12px] leading-snug"
                            style={{ color: "#334E6F" }}
                          >
                            <span
                              className="w-[5px] h-[5px] rounded-full shrink-0"
                              style={{ background: card.iconColor, opacity: 0.75 }}
                            />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Navigation row ── */}
      <div className="flex items-center gap-5">
        <button
          onClick={() => manualNavigate((active - 1 + n) % n)}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          style={{
            background: "rgba(255,255,255,0.70)",
            border: "1.5px solid rgba(139,198,255,0.45)",
            color: "#2E6FB4",
            boxShadow: "0 2px 8px rgba(30,58,95,0.07)",
          }}
          aria-label="Previous card"
        >
          <ChevronLeft size={17} strokeWidth={2.2} />
        </button>

        <div className="flex gap-2" role="tablist" aria-label="Carousel position">
          {cards.map((c, i) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={i === active}
              aria-label={`Go to ${c.title}`}
              onClick={() => manualNavigate(i)}
              className="transition-all duration-300 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              style={{
                width:  i === active ? 20 : 7,
                height: 7,
                background: i === active ? cards[active].iconColor : "rgba(139,198,255,0.45)",
              }}
            />
          ))}
        </div>

        <button
          onClick={() => manualNavigate((active + 1) % n)}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          style={{
            background: "rgba(255,255,255,0.70)",
            border: "1.5px solid rgba(139,198,255,0.45)",
            color: "#2E6FB4",
            boxShadow: "0 2px 8px rgba(30,58,95,0.07)",
          }}
          aria-label="Next card"
        >
          <ChevronRight size={17} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

// ─── Animation variants ───────────────────────────────────────────────────────

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
};

// Staggered children — heading, divider, paragraph each animate separately
const headingVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0 } },
};
const dividerVariants: Variants = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: { opacity: 1, scaleX: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 } },
};
const paraVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.3 } },
};

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.45 } },
};

// ─── Medal illustration ───────────────────────────────────────────────────────

function MedalIllustration() {
  return (
    <svg width="130" height="130" viewBox="0 0 136 136" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="68" cy="68" r="66" fill="#DCEEFF" opacity="0.6" />
      <circle cx="68" cy="68" r="52" fill="#C8E6FF" opacity="0.7" />
      <circle cx="68" cy="68" r="38" fill="#EEF7FF" />
      <path d="M53 40 L46 20 Q52 17 58 22 L64 40" stroke="#5BA3E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M83 40 L90 20 Q84 17 78 22 L72 40" stroke="#5BA3E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M58 22 L78 22" stroke="#8BC6FF" strokeWidth="2" strokeLinecap="round" />
      <circle cx="68" cy="76" r="24" stroke="#5BA3E0" strokeWidth="2" fill="white" />
      <circle cx="68" cy="76" r="18" stroke="#8BC6FF" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
      <path d="M68 62 L70.47 69.62 H78.52 L72.02 74.26 L74.49 81.88 L68 77.24 L61.51 81.88 L63.98 74.26 L57.48 69.62 H65.53 Z" fill="#3B82F6" opacity="0.75" />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WhyGetCertifiedSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView   = useInView(sectionRef, { once: true, margin: "0px" });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(165deg, #F4F9FF 0%, #EBF3FF 45%, #F2F7FF 100%)" }}
      aria-labelledby="why-certified-heading"
    >
      {/* ── Blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-48 -left-48 w-[750px] h-[750px] rounded-full"
          style={{ background: "radial-gradient(circle, #D6ECFF 0%, transparent 68%)", opacity: 0.75 }} />
        <div className="absolute -bottom-52 -right-40 w-[650px] h-[650px] rounded-full"
          style={{ background: "radial-gradient(circle, #C8E6FF 0%, transparent 68%)", opacity: 0.60 }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(220,238,255,0.90) 0%, transparent 65%)", opacity: 0.65 }} />
      </div>

      <div className="relative z-10 pt-24 pb-10 md:pt-32 md:pb-14">

        {/* ── Header ── */}
        <div className="text-center px-6 mb-16 max-w-[720px] mx-auto flex flex-col items-center relative">

          {/* Extra radial glow behind heading text for depth */}
          <div
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-[200px] rounded-full"
            style={{
              background: "radial-gradient(ellipse, rgba(99,165,255,0.18) 0%, transparent 70%)",
              filter: "blur(24px)",
            }}
            aria-hidden="true"
          />

          {/* Heading */}
          <motion.h2
            id="why-certified-heading"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={headingVariants}
            className="relative text-[2.9rem] sm:text-[3.4rem] md:text-[3.9rem] font-black tracking-tight leading-[1.06]"
            style={{
              background: "linear-gradient(130deg, #1A3356 0%, #1D4ED8 45%, #60A5FA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif",
              // Soft glow behind gradient text — uses a drop-shadow filter
              // (text-shadow doesn't work with gradient text, filter does)
              filter: "drop-shadow(0 2px 18px rgba(37,99,235,0.22))",
            }}
          >
            Why Get Certified?
          </motion.h2>

          {/* Animated divider — expands from center via scaleX */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={dividerVariants}
            aria-hidden="true"
            className="mt-5 mb-8"
            style={{ originX: "50%" }}  // pivot at center so scale grows outward both ways
          >
            <div
              className="h-[4px] w-20 rounded-full"
              style={{
                background: "linear-gradient(90deg, #93C5FD 0%, #2563EB 50%, #93C5FD 100%)",
                boxShadow: "0 2px 12px rgba(37,99,235,0.40)",
              }}
            />
          </motion.div>

          {/* Paragraph */}
          <motion.p
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={paraVariants}
            className="text-[17px] sm:text-[18.5px] md:text-[20px] mx-auto"
            style={{
              color: "#3D526B",          // darker slate — better contrast on light bg
              lineHeight: 1.9,
              fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif",
              fontWeight: 400,
              maxWidth: "660px",
              textAlign: "center",
              textWrap: "balance",
            } as React.CSSProperties}
          >
            Earn a{" "}
            <span style={{ color: "#1D4ED8", fontWeight: 600 }}>
              verified certificate
            </span>{" "}
            that showcases your achievements, strengthens your{" "}
            <span style={{ color: "#1D4ED8", fontWeight: 600 }}>
              professional profile
            </span>
            , and highlights your commitment to{" "}
            <span style={{ color: "#1D4ED8", fontWeight: 600 }}>
              continuous learning
            </span>{" "}
            through Amal Jyothi College of Engineering.
          </motion.p>
        </div>

        {/* ── Cover Flow Carousel ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="px-4 mb-8"
        >
          <CoverFlow cards={CARDS} />
        </motion.div>

        {/* ── Bottom panel ── */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={panelVariants}
          className="mx-6 md:mx-10 lg:mx-auto max-w-[1060px] mt-6 rounded-[24px] overflow-hidden"
          style={{
            background: "linear-gradient(145deg,#EEF7FF 0%,#DCEEFF 100%)",
            border: "1px solid rgba(139,198,255,0.45)",
            boxShadow: "0 8px 40px rgba(37,99,235,0.08),0 1px 4px rgba(30,58,95,0.05)",
          }}
        >
          <div className="flex flex-col md:flex-row items-center gap-8 px-10 py-10">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight leading-snug" style={{ color: "#1E3A5F" }}>
                Why an Arcade Certificate Matters
              </h3>
              <p className="text-sm md:text-[15px] leading-relaxed max-w-xl" style={{ color: "#4A6A8A" }}>
                Unlike certificates generated by standalone event platforms, Arcade
                certificates are issued through the official learning ecosystem of
                Amal Jyothi College of Engineering. They represent verified
                participation in meaningful learning experiences and provide a
                trusted record of your academic and professional development.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-1">
                {["AJCE Issued", "Verifiable Online", "Permanent Record"].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-semibold"
                    style={{ background: "rgba(255,255,255,0.82)", border: "1px solid #C8E6FF", color: "#2E6FB4" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#6AAEF7" }} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="shrink-0 flex items-center justify-center">
              <MedalIllustration />
            </div>
          </div>
        </motion.div>

        <div className="h-16 md:h-20" />
      </div>
    </section>
  );
}
