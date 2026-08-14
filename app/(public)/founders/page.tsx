"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Sparkles,
  X,
  Award,
  ShieldCheck,
  BadgeCheck,
  Users,
  Zap,
  CheckCircle2,
  Mail,
  ChevronRight,
  Layers,
  Compass,
  Rocket,
  Globe,
  Code2,
  Quote,
  Star,
  GraduationCap,
  Laptop,
  BookOpen,
  Lightbulb,
  Brain,
  MonitorPlay,
  Presentation,
  Headset,
  Library,
  PencilRuler,
  Video
} from "lucide-react";

import BlurText from "@/components/BlurText";
import MagicBento, { ParticleCard } from "@/components/ui/MagicBento";
import OrbitImages from "@/components/ui/OrbitImages";

import {
  FOUNDERS_DATA,
  TIMELINE_MILESTONES,
  ABOUT_ARCADE_HIGHLIGHTS,
  PHILOSOPHY_CARDS,
  Founder,
} from "./foundersData";
import FounderModal from "./FounderModal";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
    </svg>
  );
}

function FlourishLine({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <motion.path
        d="M 4 16 C 24 9, 42 21, 62 16 C 74 13, 78 4, 80 7 C 83 12, 75 19, 70 13 C 66 8, 74 7, 96 13 C 114 18, 118 5, 121 8 C 124 13, 116 20, 111 14 C 107 9, 117 8, 144 14 C 170 20, 196 9, 218 15 C 228 17, 234 14, 236 14"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: false, margin: "-50px" }}
        transition={{
          duration: 1.5,
          ease: "easeInOut"
        }}
      />
    </svg>
  );
}

const ERA_HEADERS: Record<number, string> = {
  0: "ERA ARCHITECTURE",
  1: "THE FOUNDATION",
  2: "THE EXPERIENCE",
  3: "THE HORIZON"
};

const ERA_TITLE_COLORS: Record<number, string> = {
  0: "text-rose-800",
  1: "text-amber-700",
  2: "text-purple-600",
  3: "text-emerald-600"
};

const ERA_OUTER_THEMES: Record<number, { mainCard: string; rightCard: string }> = {
  0: {
    mainCard: "bg-gradient-to-br from-blue-50/70 via-sky-50/40 to-slate-50/70 border-blue-100/90",
    rightCard: "bg-blue-50/40 border-blue-100/80"
  },
  1: {
    mainCard: "bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-slate-50/70 border-amber-100/90",
    rightCard: "bg-amber-50/40 border-amber-100/80"
  },
  2: {
    mainCard: "bg-gradient-to-br from-purple-50/70 via-fuchsia-50/40 to-slate-50/70 border-purple-100/90",
    rightCard: "bg-purple-50/40 border-purple-100/80"
  },
  3: {
    mainCard: "bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-50/70 border-emerald-100/90",
    rightCard: "bg-emerald-50/40 border-emerald-100/80"
  }
};

const PLACARD_THEMES = [
  {
    // 0: Vibrant Blue
    boxBg: "bg-gradient-to-r from-blue-100 via-sky-100 to-indigo-100",
    border: "border-blue-300",
    text: "text-blue-950 font-bold",
    numberColor: "text-blue-600",
    shadow: "shadow-xs hover:shadow-md hover:border-blue-400"
  },
  {
    // 1: Vibrant Warm Amber
    boxBg: "bg-gradient-to-r from-amber-100 via-orange-100 to-yellow-100",
    border: "border-amber-300",
    text: "text-amber-950 font-bold",
    numberColor: "text-amber-700",
    shadow: "shadow-xs hover:shadow-md hover:border-amber-400"
  },
  {
    // 2: Vibrant Purple
    boxBg: "bg-gradient-to-r from-purple-100 via-fuchsia-100 to-violet-100",
    border: "border-purple-300",
    text: "text-purple-950 font-bold",
    numberColor: "text-purple-600",
    shadow: "shadow-xs hover:shadow-md hover:border-purple-400"
  },
  {
    // 3: Vibrant Emerald Green
    boxBg: "bg-gradient-to-r from-emerald-100 via-teal-100 to-green-100",
    border: "border-emerald-300",
    text: "text-emerald-950 font-bold",
    numberColor: "text-emerald-600",
    shadow: "shadow-xs hover:shadow-md hover:border-emerald-400"
  }
];

const ERA_STANDARDS: Record<number, string[]> = {
  0: [
    "A learning space without boundaries",
    "Built around the learner",
    "Beyond the traditional classroom",
    "A vision for accessible education"
  ],
  1: [
    "Learning, structured for every journey",
    "One platform, many possibilities",
    "Learning beyond the lecture",
    "Designed to grow"
  ],
  2: [
    "Learn at your own pace",
    "Progress becomes visible",
    "Classrooms find a digital home",
    "Learning becomes engaging"
  ],
  3: [
    "Learning that understands you",
    "Every learner, a different journey",
    "A connected learning ecosystem",
    "From learning to possibility"
  ]
};

const PHILOSOPHY_THEMES = [
  {
    // Card 1: Vibrant Blue (Design Systems theme)
    heading: "text-blue-600",
    border: "border-blue-300/90 hover:border-blue-400",
    badge: "bg-blue-50/90 text-blue-600 border border-blue-200/80",
    glowColor: "37, 99, 235"
  },
  {
    // Card 2: Warm Amber (Interaction & Motion theme)
    heading: "text-amber-800",
    border: "border-amber-300/90 hover:border-amber-400",
    badge: "bg-amber-50/90 text-amber-800 border border-amber-200/80",
    glowColor: "180, 83, 9"
  },
  {
    // Card 3: Soft Purple (Figma theme)
    heading: "text-purple-600",
    border: "border-purple-300/90 hover:border-purple-400",
    badge: "bg-purple-50/90 text-purple-600 border border-purple-200/80",
    glowColor: "147, 51, 234"
  },
  {
    // Card 4: Mint / Emerald Green (Prototyping theme)
    heading: "text-emerald-700",
    border: "border-emerald-300/90 hover:border-emerald-400",
    badge: "bg-emerald-50/90 text-emerald-700 border border-emerald-200/80",
    glowColor: "4, 120, 87"
  }
];

export default function FoundersPage() {
  const [selectedFounder, setSelectedFounder] = useState<Founder | null>(null);
  const [activeEraIndex, setActiveEraIndex] = useState<number>(0);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const activeMilestone = TIMELINE_MILESTONES[activeEraIndex] || TIMELINE_MILESTONES[0];

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans relative">

      {/* ── HERO SECTION WITH SOFT GRADIENT WASH ── */}
      <div className="relative w-full arcade-wash border-b border-slate-100 min-h-[95vh] flex flex-col items-center justify-center pt-16 overflow-hidden">
        
        {/* Floating Decorative Icons (Educational Theme) - Contained within Hero */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0 }} className="absolute top-[20%] left-[10%] sm:left-[15%] text-slate-400/20">
            <GraduationCap size={64} strokeWidth={1.5} />
          </motion.div>
          <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-[60%] left-[5%] sm:left-[10%] text-slate-400/20">
            <Laptop size={56} strokeWidth={1.5} />
          </motion.div>
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-[15%] left-[20%] sm:left-[25%] text-slate-400/20">
            <BookOpen size={48} strokeWidth={1.5} />
          </motion.div>
          
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute top-[15%] right-[15%] sm:right-[20%] text-slate-400/20">
            <Lightbulb size={56} strokeWidth={1.5} />
          </motion.div>
          <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} className="absolute top-[50%] right-[5%] sm:right-[10%] text-slate-400/20">
            <Brain size={64} strokeWidth={1.5} />
          </motion.div>
          <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }} className="absolute bottom-[20%] right-[20%] sm:right-[25%] text-slate-400/20">
            <Award size={48} strokeWidth={1.5} />
          </motion.div>

          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-[30%] left-[25%] sm:left-[30%] text-slate-400/15">
            <Presentation size={40} strokeWidth={1.5} />
          </motion.div>
          <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute top-[35%] right-[30%] sm:right-[35%] text-slate-400/15">
            <MonitorPlay size={40} strokeWidth={1.5} />
          </motion.div>
          
          <motion.div animate={{ y: [0, 18, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }} className="absolute bottom-[40%] left-[15%] sm:left-[20%] text-slate-400/15">
            <Library size={44} strokeWidth={1.5} />
          </motion.div>
          <motion.div animate={{ y: [0, -18, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.8 }} className="absolute bottom-[35%] right-[10%] sm:right-[15%] text-slate-400/15">
            <PencilRuler size={44} strokeWidth={1.5} />
          </motion.div>
        </div>

        <div className="mx-auto max-w-6xl px-5 sm:px-8 w-full relative z-10">
          <div className="max-w-3xl mx-auto space-y-6 text-center">
            {/* Title with BlurText Animation from React Bits */}
            <BlurText
              text="The Minds Behind Arcade."
              delay={150}
              animateBy="words"
              direction="top"
              stepDuration={0.35}
              className="text-6xl sm:text-7xl lg:text-8xl tracking-normal text-slate-900 leading-[1.15] justify-center"
              style={{ fontFamily: "'Dancing Script', 'Satisfy', 'Caveat', 'Great Vibes', cursive", fontWeight: 700 }}
              wordClasses={{
                "Arcade.": "bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent pb-1"
              }}
            />

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
              Meet the 10 engineers, educators, and creators who designed Arcade at Amal Jyothi College of Engineering—building verifiable digital credentials, interactive workshops, and modern outcome-based learning.
            </p>


          </div>
        </div>
        
        {/* Decorative Center Icon */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 text-slate-300/30 z-10 pointer-events-none"
        >
          <GraduationCap size={120} strokeWidth={1} />
        </motion.div>
      </div>
      {/* ── MAIN BODY (PURE WHITE BACKGROUND) ── */}
      <div className="w-full bg-white">
        <div className="mx-auto max-w-6xl px-5 pt-10 sm:pt-12 pb-20 sm:px-8 space-y-28">
          {/* --- FOUNDERS CIRCULAR GRID SECTION (MATCHING REFERENCE IMAGE) --- */}
          <section className="space-y-16 pt-6 pb-4">
            {/* Section Header */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h2 className="text-4xl sm:text-6xl font-bold text-slate-900 tracking-tight font-['Dancing_Script']">
                The Ones Who Make It Possible
              </h2>
              <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed">
                Meet our outstanding team — a synergy of talent, creativity, and dedication, crafting success together.
              </p>
            </div>

            {/* Circular Team Cards Grid (Top 8 + Bottom 2 with Flourish Lines) */}
            <div className="space-y-12 max-w-6xl mx-auto">
              {/* First 8 Founders (4 per row) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6 sm:gap-x-10 items-start justify-items-center">
                {FOUNDERS_DATA.slice(0, 8).map((founder, index) => (
                  <motion.div
                    key={founder.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: (index % 4) * 0.1 }}
                    onClick={() => setSelectedFounder(founder)}
                    className="group flex flex-col items-center text-center cursor-pointer max-w-[240px]"
                  >
                    {/* Large Circular Portrait Image */}
                    <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full overflow-hidden bg-slate-100 shadow-sm border-4 border-slate-50 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md">
                      <Image
                        src={founder.image}
                        alt={founder.name}
                        fill
                        className="object-cover grayscale contrast-105 group-hover:grayscale-0 transition-all duration-500"
                        sizes="200px"
                        priority={index < 4}
                      />
                    </div>

                    {/* Name */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 font-sans mt-4 group-hover:text-indigo-600 transition-colors">
                      {founder.name}
                    </h3>

                    {/* Role */}
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                      {founder.role}
                    </p>

                    {/* Social Icons Row (Only LinkedIn & GitHub) */}
                    <div className="flex items-center justify-center gap-3.5 mt-3 text-slate-400">
                      {founder.social.linkedin && (
                        <a
                          href={founder.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-slate-900 transition-colors p-1"
                          title="LinkedIn"
                        >
                          <LinkedinIcon className="w-4 h-4" />
                        </a>
                      )}
                      {founder.social.github && (
                        <a
                          href={founder.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-slate-900 transition-colors p-1"
                          title="GitHub"
                        >
                          <GithubIcon className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bottom Row: Centered Founder Cards Flanked by Animated Flourish Lines */}
              <div className="relative flex items-center justify-center pt-4 w-full max-w-6xl mx-auto">
                {/* Left Flourish Line */}
                <div className="hidden lg:block absolute -left-8 xl:-left-20 top-[235px] -translate-y-1/2 group">
                  <FlourishLine className="w-[120px] xl:w-[220px] h-auto text-slate-700/60 drop-shadow-sm transition-all duration-700 group-hover:text-indigo-600 group-hover:opacity-100 group-hover:drop-shadow-md" />
                </div>

                {/* Centered Founders */}
                <div className="flex flex-wrap justify-center gap-y-12 gap-x-6 sm:gap-x-10 relative z-10">
                  {FOUNDERS_DATA.slice(8).map((founder, index) => (
                    <motion.div
                      key={founder.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      onClick={() => setSelectedFounder(founder)}
                      className="group flex flex-col items-center text-center cursor-pointer max-w-[240px]"
                    >
                      <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full overflow-hidden bg-slate-100 shadow-sm border-4 border-slate-50 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md">
                        <Image
                          src={founder.image}
                          alt={founder.name}
                          fill
                          className="object-cover grayscale contrast-105 group-hover:grayscale-0 transition-all duration-500"
                          sizes="200px"
                        />
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 font-sans mt-4 group-hover:text-indigo-600 transition-colors">
                        {founder.name}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                        {founder.role}
                      </p>

                      <div className="flex items-center justify-center gap-3.5 mt-3 text-slate-400">
                        {founder.social.linkedin && (
                          <a
                            href={founder.social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-slate-900 transition-colors p-1"
                            title="LinkedIn"
                          >
                            <LinkedinIcon className="w-4 h-4" />
                          </a>
                        )}
                        {founder.social.github && (
                          <a
                            href={founder.social.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-slate-900 transition-colors p-1"
                            title="GitHub"
                          >
                            <GithubIcon className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Right Flourish Line (Flipped) */}
                <div className="hidden lg:block absolute -right-8 xl:-right-20 top-[235px] -translate-y-1/2 group">
                  <FlourishLine className="w-[120px] xl:w-[220px] h-auto text-slate-700/60 drop-shadow-sm transition-all duration-700 group-hover:text-indigo-600 group-hover:opacity-100 group-hover:drop-shadow-md transform scale-x-[-1]" />
                </div>
              </div>
            </div>
          </section>



          {/* --- PLATFORM MILESTONES (HORIZONTAL CARDS) --- */}
          <section className="space-y-12 pt-4 pb-20 relative overflow-hidden">
            {/* Section Header */}
            <div className="text-left space-y-3 max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
              <h2 className="text-4xl sm:text-6xl font-bold text-slate-900 tracking-tight font-['Dancing_Script']">
                How Arcade Started ?
              </h2>
            </div>

            <div className="relative max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                <div className="lg:col-span-7 text-left space-y-6">
                  {TIMELINE_MILESTONES[0].description.split("\n\n").map((para, idx) => (
                    <p key={idx} className="text-base sm:text-lg text-slate-700 font-normal leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
                <div className="lg:col-span-5 relative">
                  <div className="w-full aspect-square sm:aspect-[4/3] relative overflow-visible flex items-center justify-center">
                    <div className="w-full h-full flex items-center justify-center scale-110 sm:scale-[1.25] lg:scale-[1.4] lg:translate-x-4">
                      <OrbitImages
                        items={FOUNDERS_DATA.slice(0, 6).map((founder) => (
                          <div 
                            key={founder.id}
                            className="w-full h-full cursor-pointer hover:scale-105 transition-transform duration-300 rounded-xl"
                            onClick={() => setFullScreenImage(founder.image)}
                          >
                            <img
                              src={founder.image}
                              alt={founder.name}
                              draggable={false}
                              className="orbit-image"
                            />
                          </div>
                        ))}
                        shape="ellipse"
                        radiusX={480}
                        radiusY={220}
                        rotation={-8}
                        duration={45}
                        itemSize={160}
                        showPath={true}
                        pathColor="rgba(15, 23, 42, 0.2)"
                        pathWidth={1}
                        responsive={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ── FOUNDER DETAILS MODAL ── */}
      <FounderModal
        founder={selectedFounder}
        onClose={() => setSelectedFounder(null)}
      />

      {/* ── FULL SCREEN IMAGE VIEWER ── */}
      <AnimatePresence>
        {fullScreenImage && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8 cursor-pointer"
            onClick={() => setFullScreenImage(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setFullScreenImage(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
              >
                <X className="w-6 h-6" />
              </button>
              <img 
                src={fullScreenImage} 
                alt="Full View" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
