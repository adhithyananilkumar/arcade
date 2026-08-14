"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import DotGrid from "@/apps/public/components/landing/DotGrid";
import Link from "next/link";

export default function CreatorHero() {
  const shouldReduceMotion = useReducedMotion();

  const fadeInVariant = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: (customDelay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1] as any,
        delay: customDelay,
      },
    }),
  } as any;

  return (
    <section className="hero relative z-10 bg-transparent min-h-[calc(100vh-4.5rem)] flex flex-col justify-center items-center pt-20 sm:pt-24 pb-10 lg:pb-14 overflow-hidden text-center">
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
      {/* BACKGROUND SKETCH / DOODLE OBJECTS                           */}
      {/* ──────────────────────────────────────────────────────────── */}





      <div className="wrap w-full max-w-6xl mx-auto px-6 sm:px-12 relative z-10 flex flex-col items-center justify-center text-center my-auto py-2 overflow-visible">

        {/* Eyebrow Cursive Text */}
        <motion.div
          variants={fadeInVariant}
          initial="hidden"
          animate="visible"
          custom={0.1}
          style={{ fontFamily: "'Caveat', cursive" }}
          className="text-2xl sm:text-3xl lg:text-4xl text-[#7A5AF8] font-bold select-none text-center mb-2.5 sm:mb-3"
        >
          Create. Teach. Inspire...
        </motion.div>

        {/* Main Title */}
        <motion.div
          variants={fadeInVariant}
          initial="hidden"
          animate="visible"
          custom={0.2}
          className="flex flex-col items-center justify-center text-center select-none mb-3.5 sm:mb-4 w-full overflow-visible"
        >
          <h1
            className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight text-zinc-950 leading-[1.15] normal-case text-center px-4 overflow-visible"
            style={{ fontFamily: "'Dancing Script', 'Caveat', 'Satisfy', cursive" }}
          >
            What Capability <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent inline-block px-3 py-1">
              do you want ?
            </span>
          </h1>

          {/* Handdrawn underline accent */}
          <svg width="280" height="14" viewBox="0 0 220 12" fill="none" className="mt-3 mx-auto">
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
          className="text-sm sm:text-base text-zinc-600 leading-normal sm:leading-relaxed font-medium max-w-xl mx-auto text-center mb-5 sm:mb-6"
        >
          Empower your educators, organizations, and developers. Build, host, and scale professional courses and coding labs natively on Arcade. Provide hands-on learning experiences and certifications that help your community level up.
        </motion.p>

        {/* CTAs Button Group with Single Shared Continuous Flowing Gradient */}
        <motion.div
          variants={fadeInVariant}
          initial="hidden"
          animate="visible"
          custom={0.4}
          className="relative flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center w-full sm:w-auto"
        >
          {/* Shared Ambient Flowing Glow backdrop */}
          <div
            className="pointer-events-none absolute -inset-1 rounded-2xl opacity-20 filter blur-md animate-cta-gradient-flow"
            style={{
              background: "linear-gradient(90deg, #3b82f6, #6366f1, #ec4899, #8b5cf6, #3b82f6)",
              backgroundSize: "200% 100%",
            }}
          />

          {/* Button 1: BECOME A CREATOR → */}
          <Link
            href="/register?mode=signup"
            className="relative z-10 w-full sm:w-auto text-center bg-zinc-950 hover:bg-zinc-900 text-white font-bold px-7 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer overflow-hidden group/btn1"
          >
            {/* Surface Animated Gradient Layer */}
            <div
              className="pointer-events-none absolute inset-0 opacity-45 mix-blend-screen animate-cta-gradient-flow"
              style={{
                background: "linear-gradient(90deg, #3b82f6 0%, #6366f1 25%, #ec4899 50%, #8b5cf6 75%, #3b82f6 100%)",
                backgroundSize: "200% 100%",
              }}
            />
            <span className="relative z-10">Become a Creator</span>
            <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-200 group-hover/btn1:translate-x-0.5" />
          </Link>

          {/* Button 2: LEARN MORE */}
          <a
            href="#journey"
            className="relative z-10 w-full sm:w-auto text-center bg-white hover:bg-zinc-50 text-zinc-900 font-bold px-7 py-3 rounded-xl border border-zinc-200/80 shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer overflow-hidden group/btn2"
          >
            {/* Surface Animated Gradient Layer */}
            <div
              className="pointer-events-none absolute inset-0 opacity-20 mix-blend-multiply animate-cta-gradient-flow"
              style={{
                background: "linear-gradient(90deg, #3b82f6 0%, #6366f1 25%, #ec4899 50%, #8b5cf6 75%, #3b82f6 100%)",
                backgroundSize: "200% 100%",
              }}
            />
            <span className="relative z-10">Learn More</span>
          </a>
        </motion.div>

      </div>
    </section>
  );
}
