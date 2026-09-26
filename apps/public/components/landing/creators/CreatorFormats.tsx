"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

// Helper Component for Desktop Scroll-Driven Progress & Hover Micro Interactions
function DesktopTimelineRow({
  freeItem,
  paidItem,
  idx,
  scrollYProgress,
}: {
  freeItem: { text: string; desc: string };
  paidItem: { text: string; desc: string };
  idx: number;
  scrollYProgress: any;
}) {
  const startThreshold = 0.15 + idx * 0.22;
  const endThreshold = Math.min(0.95, startThreshold + 0.25);

  const opacityTransform = useTransform(
    scrollYProgress,
    [startThreshold, endThreshold],
    [0.65, 1]
  );

  return (
    <motion.div
      style={{ opacity: opacityTransform }}
      className="relative grid grid-cols-2 gap-12 lg:gap-20 items-center group/row"
    >
      {/* Timeline Center Node Dot */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: idx * 0.11 + 0.1 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#7A5AF8] z-20 shadow-xs transition-transform duration-300 group-hover/row:scale-125"
      />

      {/* Left Feature (Free) */}
      <div className="relative pr-8 flex items-center justify-end group/left cursor-pointer">
        {/* Connector line extending outward to left */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: idx * 0.11 + 0.12, ease: "easeOut" }}
          style={{ transformOrigin: "right" }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-6 lg:w-10 h-[1px] bg-gradient-to-l from-[#7A5AF8]/40 to-transparent group-hover/left:from-[#7A5AF8] group-hover/left:h-[1.5px] transition-all duration-300"
        />

        {/* Feature Text Block */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: idx * 0.11, ease: "easeOut" }}
          className="text-right space-y-1 max-w-sm"
        >
          <motion.h4
            whileHover={{ x: 6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-base sm:text-lg font-semibold text-[#1C1C2E] tracking-tight group-hover/left:text-[#7A5AF8] transition-colors duration-300"
          >
            {freeItem.text}
          </motion.h4>
          <p className="text-xs sm:text-sm text-zinc-500 font-normal leading-relaxed opacity-75 group-hover/left:opacity-100 transition-opacity duration-300">
            {freeItem.desc}
          </p>
        </motion.div>
      </div>

      {/* Right Feature (Paid) */}
      <div className="relative pl-8 flex items-center justify-start group/right cursor-pointer">
        {/* Connector line extending outward to right */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: idx * 0.11 + 0.15, ease: "easeOut" }}
          style={{ transformOrigin: "left" }}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-6 lg:w-10 h-[1px] bg-gradient-to-r from-[#7A5AF8]/40 to-transparent group-hover/right:from-[#7A5AF8] group-hover/right:h-[1.5px] transition-all duration-300"
        />

        {/* Feature Text Block */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: idx * 0.11 + 0.06, ease: "easeOut" }}
          className="text-left space-y-1 max-w-sm"
        >
          <motion.h4
            whileHover={{ x: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-base sm:text-lg font-semibold text-[#1C1C2E] tracking-tight group-hover/right:text-[#7A5AF8] transition-colors duration-300"
          >
            {paidItem.text}
          </motion.h4>
          <p className="text-xs sm:text-sm text-zinc-500 font-normal leading-relaxed opacity-75 group-hover/right:opacity-100 transition-opacity duration-300">
            {paidItem.desc}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function CreatorFormats() {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Scroll-driven timeline progress
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 75%", "end 45%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.001,
  });

  const freePoints = [
    {
      text: "Reach the widest possible audience",
      desc: "Open access drives viral discovery and maximum reach.",
    },
    {
      text: "Great for building a community",
      desc: "Nurture global student networks and brand affinity.",
    },
    {
      text: "Still fully reviewed and certified",
      desc: "Zero quality compromise—same verified credentials.",
    },
  ];

  const paidPoints = [
    {
      text: "Price each course on your own terms",
      desc: "Flexible tier pricing with instant automated payouts.",
    },
    {
      text: "Ideal for professional training",
      desc: "High-value specialized modules for career growth.",
    },
    {
      text: "Same quality review, same certificate",
      desc: "Rigorous QA check ensures official platform accreditation.",
    },
  ];

  const headingText = "Free or paid — you decide, course by course";
  const headingWords = headingText.split(" ");

  return (
    <section className="format-sec pt-0 pb-0 sm:pb-2 relative overflow-hidden bg-transparent" id="formats">
      <div className="wrap max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Pricing Options — Luxury Editorial Vertical Timeline Comparison ── */}
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full pt-2 pb-2 mt-0 bg-transparent overflow-hidden"
        >
          {/* Soft Drifting Radial Ambient Glow (< 4% Opacity) */}
          <motion.div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full pointer-events-none z-0"
            style={{
              background: "radial-gradient(circle, rgba(122, 90, 248, 0.035) 0%, rgba(205, 184, 255, 0.015) 55%, transparent 75%)",
            }}
            animate={{
              y: [-16, 16, -16],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Section Heading (Centered at top with Word-by-Word Reveal) */}
          <div className="text-center mb-20 sm:mb-24 space-y-3 relative z-10">
            <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-[#7A5AF8] tracking-[0.2em] uppercase font-mono">
              <span className="w-5 h-[2px] bg-[#7A5AF8] rounded-full inline-block" />
              <span>SET YOUR OWN TERMS</span>
              <span className="w-5 h-[2px] bg-[#7A5AF8] rounded-full inline-block" />
            </div>

            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.04 } },
              }}
              className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1C1C2E] tracking-tight font-serif flex flex-wrap justify-center gap-x-2.5 gap-y-1"
            >
              {headingWords.map((word, idx) => (
                <motion.span
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
                  }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
              className="text-sm sm:text-base text-zinc-500 font-medium max-w-xl mx-auto leading-relaxed"
            >
              Both paths get the same review process and the same certificate.
            </motion.p>
          </div>

          {/* Timeline Container */}
          <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 z-10">

            {/* ========================================================== */}
            {/* DESKTOP / TABLET: Two-Sided Vertical Timeline (md:block)  */}
            {/* ========================================================== */}
            <div className="hidden md:block relative">

              {/* Central Vertical Timeline (Scroll-driven growth top to bottom) */}
              <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[1.5px] pointer-events-none z-0">
                <motion.div
                  className="w-full h-full bg-gradient-to-b from-[#7A5AF8]/10 via-[#7A5AF8]/40 to-[#7A5AF8]/10"
                  style={{ scaleY: smoothProgress, transformOrigin: "top" }}
                />
              </div>

              {/* 1. Header Section Markers Row */}
              <div className="grid grid-cols-2 gap-12 lg:gap-20 items-start mb-16 relative z-10">
                {/* Left Header Marker: 01 FREE */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="pr-8 text-right flex flex-col items-end space-y-1.5"
                >
                  <motion.div
                    initial={{ opacity: 0, y: -8, filter: "drop-shadow(0 0 0px rgba(122, 90, 248, 0))" }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                      filter: [
                        "drop-shadow(0 0 0px rgba(122, 90, 248, 0))",
                        "drop-shadow(0 0 14px rgba(122, 90, 248, 0.5))",
                        "drop-shadow(0 0 0px rgba(122, 90, 248, 0))"
                      ]
                    }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.7,
                      filter: { duration: 1.2, times: [0, 0.4, 1] },
                      ease: "easeOut"
                    }}
                    className="flex items-center gap-2 select-none"
                  >
                    <span className="text-4xl font-extrabold text-[#7A5AF8]/20 font-mono tracking-tight">
                      01
                    </span>
                    <span className="text-xs font-bold text-[#7A5AF8] tracking-[0.2em] uppercase">
                      FREE
                    </span>
                  </motion.div>
                  <h3
                    className="text-2xl sm:text-3xl font-bold text-[#1C1C2E] leading-tight tracking-tight"
                    style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                  >
                    Open to everyone
                  </h3>
                  <p className="text-sm text-zinc-500 font-medium">
                    No pricing setup required.
                  </p>
                </motion.div>

                {/* Right Header Marker: 02 PAID */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                  className="pl-8 text-left flex flex-col items-start space-y-1.5"
                >
                  <motion.div
                    initial={{ opacity: 0, y: -8, filter: "drop-shadow(0 0 0px rgba(122, 90, 248, 0))" }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                      filter: [
                        "drop-shadow(0 0 0px rgba(122, 90, 248, 0))",
                        "drop-shadow(0 0 14px rgba(122, 90, 248, 0.5))",
                        "drop-shadow(0 0 0px rgba(122, 90, 248, 0))"
                      ]
                    }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.7,
                      delay: 0.1,
                      filter: { duration: 1.2, times: [0, 0.4, 1] },
                      ease: "easeOut"
                    }}
                    className="flex items-center gap-2 select-none"
                  >
                    <span className="text-4xl font-extrabold text-[#7A5AF8]/20 font-mono tracking-tight">
                      02
                    </span>
                    <span className="text-xs font-bold text-[#7A5AF8] tracking-[0.2em] uppercase">
                      PAID
                    </span>
                  </motion.div>
                  <h3
                    className="text-2xl sm:text-3xl font-bold text-[#1C1C2E] leading-tight tracking-tight"
                    style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                  >
                    Set your own price
                  </h3>
                  <p className="text-sm text-zinc-500 font-medium">
                    Keep control of your offering.
                  </p>
                </motion.div>
              </div>

              {/* 2. Feature Items Rows (Scroll progress indicator + Micro interactions) */}
              <div className="space-y-16 lg:space-y-20 relative z-10">
                {freePoints.map((freeItem, idx) => (
                  <DesktopTimelineRow
                    key={idx}
                    freeItem={freeItem}
                    paidItem={paidPoints[idx]}
                    idx={idx}
                    scrollYProgress={scrollYProgress}
                  />
                ))}
              </div>

            </div>


            {/* ========================================================== */}
            {/* MOBILE: Single Vertical Timeline (block md:hidden)        */}
            {/* ========================================================== */}
            <div className="block md:hidden relative pl-6 sm:pl-8">

              {/* Single Vertical Line on Left */}
              <div className="absolute left-2.5 sm:left-3.5 top-0 bottom-0 w-[1.5px] pointer-events-none z-0">
                <motion.div
                  className="w-full h-full bg-gradient-to-b from-[#7A5AF8]/10 via-[#7A5AF8]/35 to-[#7A5AF8]/10"
                  style={{ scaleY: smoothProgress, transformOrigin: "top" }}
                />
              </div>

              {/* Section 01: FREE */}
              <div className="space-y-8 mb-14 relative z-10">
                {/* Free Section Marker & Header */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="relative pl-4 space-y-1"
                >
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    className="absolute -left-[19.5px] sm:-left-[23.5px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#7A5AF8]"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8, filter: "drop-shadow(0 0 0px rgba(122, 90, 248, 0))" }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                      filter: [
                        "drop-shadow(0 0 0px rgba(122, 90, 248, 0))",
                        "drop-shadow(0 0 12px rgba(122, 90, 248, 0.4))",
                        "drop-shadow(0 0 0px rgba(122, 90, 248, 0))"
                      ]
                    }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="flex items-center gap-2 select-none"
                  >
                    <span className="text-3xl font-extrabold text-[#7A5AF8]/20 font-mono tracking-tight">
                      01
                    </span>
                    <span className="text-xs font-bold text-[#7A5AF8] tracking-[0.2em] uppercase">
                      FREE
                    </span>
                  </motion.div>
                  <h3 className="text-xl font-bold text-[#1C1C2E] leading-tight" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                    Open to everyone
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium">
                    No pricing setup required.
                  </p>
                </motion.div>

                {/* Free Feature Items */}
                <div className="space-y-7 pl-4">
                  {freePoints.map((item, idx) => (
                    <div key={item.text} className="relative group/mobile cursor-pointer">
                      {/* Connector Line */}
                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: idx * 0.11 + 0.1 }}
                        style={{ transformOrigin: "left" }}
                        className="absolute -left-4 top-2.5 w-3.5 h-[1px] bg-[#7A5AF8]/30 group-hover/mobile:bg-[#7A5AF8] transition-colors duration-300"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: idx * 0.11 }}
                        className="space-y-0.5 text-left"
                      >
                        <motion.h4
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm font-semibold text-[#1C1C2E] group-hover/mobile:text-[#7A5AF8] transition-colors duration-300"
                        >
                          {item.text}
                        </motion.h4>
                        <p className="text-xs text-zinc-500 leading-relaxed font-normal opacity-80 group-hover/mobile:opacity-100 transition-opacity duration-300">
                          {item.desc}
                        </p>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 02: PAID */}
              <div className="space-y-8 relative z-10">
                {/* Paid Section Marker & Header */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="relative pl-4 space-y-1"
                >
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    className="absolute -left-[19.5px] sm:-left-[23.5px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#7A5AF8]"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8, filter: "drop-shadow(0 0 0px rgba(122, 90, 248, 0))" }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                      filter: [
                        "drop-shadow(0 0 0px rgba(122, 90, 248, 0))",
                        "drop-shadow(0 0 12px rgba(122, 90, 248, 0.4))",
                        "drop-shadow(0 0 0px rgba(122, 90, 248, 0))"
                      ]
                    }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="flex items-center gap-2 select-none"
                  >
                    <span className="text-3xl font-extrabold text-[#7A5AF8]/20 font-mono tracking-tight">
                      02
                    </span>
                    <span className="text-xs font-bold text-[#7A5AF8] tracking-[0.2em] uppercase">
                      PAID
                    </span>
                  </motion.div>
                  <h3 className="text-xl font-bold text-[#1C1C2E] leading-tight" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                    Set your own price
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium">
                    Keep control of your offering.
                  </p>
                </motion.div>

                {/* Paid Feature Items */}
                <div className="space-y-7 pl-4">
                  {paidPoints.map((item, idx) => (
                    <div key={item.text} className="relative group/mobile cursor-pointer">
                      {/* Connector Line */}
                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: idx * 0.11 + 0.1 }}
                        style={{ transformOrigin: "left" }}
                        className="absolute -left-4 top-2.5 w-3.5 h-[1px] bg-[#7A5AF8]/30 group-hover/mobile:bg-[#7A5AF8] transition-colors duration-300"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: idx * 0.11 }}
                        className="space-y-0.5 text-left"
                      >
                        <motion.h4
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm font-semibold text-[#1C1C2E] group-hover/mobile:text-[#7A5AF8] transition-colors duration-300"
                        >
                          {item.text}
                        </motion.h4>
                        <p className="text-xs text-zinc-500 leading-relaxed font-normal opacity-80 group-hover/mobile:opacity-100 transition-opacity duration-300">
                          {item.desc}
                        </p>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </motion.div>

      </div>
    </section>
  );
}



