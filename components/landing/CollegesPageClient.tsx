"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Sparkles,
  Users,
  Award,
  HelpCircle
} from "lucide-react";
import Link from "next/link";
import CollegesEcosystem from "./CollegesEcosystem";

export default function CollegesPageClient() {
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

  // Highlights aligned with the CollegesEcosystem nodes
  const highlights = [
    "Self-hosted forums & technical clubs",
    "Comprehensive creator tools & analytics",
    "Integrated code playground & terminals",
    "Direct student certification & badges",
  ];

  const featureDetails = [
    {
      badge: "TEAMWORK",
      title: "Self-Hosted Forums & Clubs",
      description: "Connect student communities and foster professional technical networks.",
      icon: <Users className="w-5 h-5" />,
      color: "#4f46e5", // Indigo
    },
    {
      badge: "CREATIVE",
      title: "Comprehensive Creator Tools",
      description: "Build, curate, and scale professional educational tracks and resources.",
      icon: <Sparkles className="w-5 h-5" />,
      color: "#d97706", // Amber
    },
    {
      badge: "BUSINESS",
      title: "Integrated Coding Playgrounds",
      description: "Interactive terminals running direct workspace environments in the browser.",
      icon: <Cpu className="w-5 h-5" />,
      color: "#0d9488", // Teal
    },
    {
      badge: "IDEA",
      title: "Direct Student Certification",
      description: "Issue encrypted, tamper-proof certificates and verified skills achievements.",
      icon: <Award className="w-5 h-5" />,
      color: "#059669", // Emerald
    },
  ];

  return (
    <div className="font-sans antialiased overflow-x-hidden pt-28 lg:pt-36 bg-transparent relative">
      {/* Soft atmospheric overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-24 lg:pb-36 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start">

            {/* Badge */}
            <motion.div
              variants={fadeInVariant}
              initial="hidden"
              animate="visible"
              custom={0.1}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-zinc-200/60 text-zinc-800 shadow-sm mb-6 cursor-default"
            >
              <span>🎓</span>
              <span>Arcade for Creators</span>
            </motion.div>

            {/* Heading */}
            <motion.div
              variants={fadeInVariant}
              initial="hidden"
              animate="visible"
              custom={0.2}
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
              className="text-lg text-zinc-600 leading-relaxed mb-8 max-w-xl"
            >
              Empower your educators, organizations, and developers. Build, host, and scale professional courses and coding labs natively on Arcade. Provide hands-on learning experiences and certifications that help your community level up.
            </motion.p>

            {/* Features List with Interactivity */}
            <motion.div
              variants={fadeInVariant}
              initial="hidden"
              animate="visible"
              custom={0.4}
              className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 mb-8 w-full max-w-lg"
            >
              {highlights.map((item, idx) => {
                const isActive = activeFeature === idx;
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setActiveFeature(idx)}
                    onMouseLeave={() => setActiveFeature(null)}
                    className={`flex items-center gap-2.5 text-sm font-medium transition-all duration-300 cursor-pointer ${isActive
                        ? "text-zinc-950 scale-105 translate-x-1"
                        : "text-zinc-600 opacity-80"
                      }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 transition-colors duration-300 ${isActive ? "text-indigo-500 stroke-[3px]" : "text-emerald-500"
                      }`} />
                    <span>{item}</span>
                  </div>
                );
              })}
            </motion.div>

            {/* CTAs */}
            <motion.div
              variants={fadeInVariant}
              initial="hidden"
              animate="visible"
              custom={0.5}
              className="flex flex-wrap gap-4 items-center w-full sm:w-auto"
            >
              <Link
                href="/register?role=creator"
                className="w-full sm:w-auto text-center bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-7 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                <span>Become a Creator</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#learn-more"
                className="w-full sm:w-auto text-center bg-white hover:bg-zinc-50 text-zinc-700 font-medium px-7 py-4 rounded-xl border border-zinc-200 shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5 text-sm"
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
    </div>
  );
}
