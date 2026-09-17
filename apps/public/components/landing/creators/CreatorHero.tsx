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
    <section className="hero relative z-10 bg-transparent min-h-screen flex flex-col items-center justify-center pt-20 pb-16 overflow-hidden text-center">
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
        </motion.div>

        <motion.p
          variants={fadeInVariant}
          initial="hidden"
          animate="visible"
          custom={0.3}
          className="text-base sm:text-lg text-zinc-600 leading-relaxed font-medium max-w-xl mx-auto text-center"
        >
          Build, host, and scale professional courses and coding labs natively on Arcade. Empower your community with hands-on learning and certifications.
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
