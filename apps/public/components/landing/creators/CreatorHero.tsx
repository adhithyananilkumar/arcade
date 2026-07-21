"use client";

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import DotGrid from "@/apps/public/components/landing/DotGrid";
import CollegesEcosystem from "@/apps/public/components/landing/CollegesEcosystem";
import Link from "next/link";

export default function CreatorHero() {
  const shouldReduceMotion = useReducedMotion();
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  const fadeInVariant = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: (customDelay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as any,
        delay: customDelay,
      },
    }),
  } as any;

  return (
    <section className="hero relative z-10 bg-transparent pt-0 pb-8 lg:pb-12 overflow-hidden">
      {/* React Bits Interactive Dot Grid Canvas */}
      <DotGrid
        dotSize={2}
        gap={32}
        baseColor="rgba(99, 102, 241, 0.05)"
        activeColor="#6366F1"
        proximity={130}
        className="absolute inset-0 -z-1 pointer-events-none"
      />

      <div className="wrap grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Copy & CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Heading */}
          <motion.div
            variants={fadeInVariant}
            initial="hidden"
            animate="visible"
            custom={0.1}
            className="mb-8 select-none"
          >
            <div
              style={{ fontFamily: "'Caveat', cursive" }}
              className="text-3xl sm:text-4xl text-zinc-500 font-semibold mb-2"
            >
              Create. Teach. Inspire...
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 leading-[1.1] mb-2 uppercase">
              What Capability <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">Do you want?</span>
            </h1>
            {/* Handdrawn underline accent using SVG */}
            <svg width="220" height="12" viewBox="0 0 220 12" fill="none" className="mt-1">
              <path d="M4 8C45 4.5 125 1.5 216 4.5" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
              <path d="M12 9.5C65 7 130 5.5 192 7" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            </svg>
          </motion.div>

          {/* Description */}
          <motion.p
            variants={fadeInVariant}
            initial="hidden"
            animate="visible"
            custom={0.3}
            className="text-base sm:text-lg text-zinc-600 leading-relaxed mb-8 max-w-xl"
          >
            Empower your educators, organizations, and developers. Build, host, and scale professional courses and coding labs natively on Arcade. Provide hands-on learning experiences and certifications that help your community level up.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeInVariant}
            initial="hidden"
            animate="visible"
            custom={0.5}
            className="flex flex-wrap gap-3 items-center w-full sm:w-auto"
          >
            <Link
              href="/register?mode=signup"
              className="w-full sm:w-auto text-center bg-zinc-950 hover:bg-zinc-800 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-1.5 text-xs"
            >
              <span>Become a Creator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href="#faq"
              className="w-full sm:w-auto text-center bg-white hover:bg-zinc-50 text-zinc-700 font-medium px-5 py-2.5 rounded-lg border border-zinc-200 shadow-sm transition-all duration-200 flex items-center justify-center gap-1 text-xs"
            >
              <span>Learn More</span>
            </a>
          </motion.div>
        </div>

        {/* Right Column: Interactive Node Network Illustration */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative w-full pt-8 lg:pt-0">
          {/* Outer Decorative Glow */}
          <div className="absolute inset-0 bg-radial-gradient from-indigo-100/20 to-transparent blur-3xl -z-10" />

          <CollegesEcosystem
            activeFeature={activeFeature}
            setActiveFeature={setActiveFeature}
          />
        </div>
      </div>
    </section>
  );
}
