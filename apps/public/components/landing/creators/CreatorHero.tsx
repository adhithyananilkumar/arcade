"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import DotGrid from "@/apps/public/components/landing/DotGrid";
import Link from "next/link";

export default function CreatorHero() {
  const shouldReduceMotion = useReducedMotion();

  const fadeInVariant = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 25 },
    visible: (customDelay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1] as any,
        delay: customDelay,
      },
    }),
  } as any;

  return (
    <section className="hero relative z-10 bg-transparent pt-12 pb-16 lg:pb-24 overflow-hidden text-center">
      {/* React Bits Interactive Dot Grid Canvas */}
      <DotGrid
        dotSize={2}
        gap={32}
        baseColor="rgba(99, 102, 241, 0.04)"
        activeColor="#6366F1"
        proximity={140}
        className="absolute inset-0 -z-1 pointer-events-none"
      />

      {/* Decorative Glow Aura Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/8 to-pink-500/8 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* ──────────────────────────────────────────────────────────── */}
      {/* BACKGROUND SKETCH / DOODLE OBJECTS (Matching Reference Image) */}
      {/* ──────────────────────────────────────────────────────────── */}

      {/* 1. Lightbulb Doodle with Rays (Reference Image 2) - Top Right */}
      <div className="absolute top-10 right-8 sm:right-16 lg:right-28 pointer-events-none opacity-35 z-0 select-none hidden sm:block">
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none" stroke="#7A5AF8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Bulb Outer Contour */}
          <path d="M 50 22 C 37 22 28 31 28 44 C 28 53 34 59 38 65 L 38 74 L 62 74 L 62 65 C 66 59 72 53 72 44 C 72 31 63 22 50 22 Z" />
          {/* Filament inner loops */}
          <path d="M 43 48 C 43 41 46 39 50 39 C 54 39 57 41 57 48 C 57 52 50 54 50 58" />
          {/* Screw Base */}
          <path d="M 40 78 L 60 78" />
          <path d="M 43 83 L 57 83" />
          {/* Radiating Light Rays (Matching Image 2 sketch) */}
          <path d="M 50 8 L 50 15" />
          <path d="M 22 22 L 27 27" />
          <path d="M 78 22 L 73 27" />
          <path d="M 10 48 L 17 48" />
          <path d="M 90 48 L 83 48" />
          <path d="M 20 74 L 26 68" />
          <path d="M 80 74 L 74 68" />
        </svg>
      </div>

      {/* 2. Code Brackets Sketch Doodle - Top Left */}
      <div className="absolute top-12 left-8 sm:left-16 lg:left-28 pointer-events-none opacity-35 z-0 select-none hidden sm:block">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="#6366F1" strokeWidth="2.2" strokeLinecap="round">
          {/* Left Bracket { */}
          <path d="M 35 25 C 27 25 24 28 24 35 L 24 43 C 24 47 21 50 16 50 C 21 50 24 53 24 57 L 24 65 C 24 72 27 75 35 75" />
          {/* Right Bracket } */}
          <path d="M 65 25 C 73 25 76 28 76 35 L 76 43 C 76 47 79 50 84 50 C 79 50 76 53 76 57 L 76 65 C 76 72 73 75 65 75" />
          {/* Floating Sparkles */}
          <circle cx="50" cy="18" r="2" fill="#6366F1" />
          <circle cx="50" cy="82" r="2" fill="#6366F1" />
        </svg>
      </div>

      {/* 3. Starburst & Sparkle Rays Doodle - Bottom Left */}
      <div className="absolute bottom-12 left-10 sm:left-20 lg:left-36 pointer-events-none opacity-30 z-0 select-none hidden sm:block">
        <svg width="90" height="90" viewBox="0 0 90 90" fill="none" stroke="#EC4899" strokeWidth="2" strokeLinecap="round">
          {/* Four-point hand-drawn starburst */}
          <path d="M 45 10 Q 45 45 10 45 Q 45 45 45 80 Q 45 45 80 45 Q 45 45 45 10 Z" fill="rgba(236,72,153,0.08)" />
          <path d="M 20 20 L 26 26" />
          <path d="M 70 70 L 64 64" />
          <circle cx="22" cy="68" r="2.5" fill="#EC4899" />
        </svg>
      </div>

      {/* 4. Graduation Cap Sketch Doodle - Bottom Right */}
      <div className="absolute bottom-12 right-10 sm:right-20 lg:right-36 pointer-events-none opacity-30 z-0 select-none hidden sm:block">
        <svg width="95" height="95" viewBox="0 0 90 90" fill="none" stroke="#7A5AF8" strokeWidth="2.2" strokeLinecap="round">
          {/* Mortarboard Graduation Cap */}
          <polygon points="45,18 82,34 45,50 8,34" />
          <path d="M 24 42 L 24 60 C 24 66 66 66 66 60 L 66 42" />
          <path d="M 74 38 L 74 65" />
          <circle cx="74" cy="67" r="2.5" fill="#7A5AF8" />
        </svg>
      </div>

      <div className="wrap max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center justify-center text-center space-y-6">

        {/* Eyebrow Cursive Text */}
        <motion.div
          variants={fadeInVariant}
          initial="hidden"
          animate="visible"
          custom={0.1}
          style={{ fontFamily: "'Caveat', cursive" }}
          className="text-3xl sm:text-4xl lg:text-5xl text-[#7A5AF8] font-bold select-none text-center"
        >
          Create. Teach. Inspire...
        </motion.div>

        {/* Main Title */}
        <motion.div
          variants={fadeInVariant}
          initial="hidden"
          animate="visible"
          custom={0.2}
          className="flex flex-col items-center justify-center text-center select-none"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 leading-[1.08] uppercase text-center">
            What Capability <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">Do you want?</span>
          </h1>

          {/* Handdrawn underline accent */}
          <svg width="220" height="12" viewBox="0 0 220 12" fill="none" className="mt-3 mx-auto">
            <path d="M4 8C45 4.5 125 1.5 216 4.5" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
            <path d="M12 9.5C65 7 130 5.5 192 7" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </svg>
        </motion.div>

        {/* Description Paragraph */}
        <motion.p
          variants={fadeInVariant}
          initial="hidden"
          animate="visible"
          custom={0.3}
          className="text-base sm:text-lg text-zinc-600 leading-relaxed font-medium max-w-2xl mx-auto text-center"
        >
          Empower your educators, organizations, and developers. Build, host, and scale professional courses and coding labs natively on Arcade. Provide hands-on learning experiences and certifications that help your community level up.
        </motion.p>

        {/* CTAs Button Group */}
        <motion.div
          variants={fadeInVariant}
          initial="hidden"
          animate="visible"
          custom={0.4}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto pt-2"
        >
          <Link
            href="/register?mode=signup"
            className="w-full sm:w-auto text-center bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
          >
            <span>Become a Creator</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#faq"
            className="w-full sm:w-auto text-center bg-white hover:bg-zinc-50 text-zinc-700 font-bold px-8 py-3.5 rounded-xl border border-zinc-200 shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer"
          >
            <span>Learn More</span>
          </a>
        </motion.div>

      </div>
    </section>
  );
}
