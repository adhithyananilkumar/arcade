"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Sparkles,
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
} from "lucide-react";

import BlurText from "@/components/BlurText";

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
    <motion.svg
      viewBox="0 0 240 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <motion.path
        d="M 4 16 C 24 9, 42 21, 62 16 C 74 13, 78 4, 80 7 C 83 12, 75 19, 70 13 C 66 8, 74 7, 96 13 C 114 18, 118 5, 121 8 C 124 13, 116 20, 111 14 C 107 9, 117 8, 144 14 C 170 20, 196 9, 218 15 C 228 17, 234 14, 236 14"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: 1.6,
          ease: [0.43, 0.13, 0.23, 0.96],
          delay: 0.2,
        }}
      />
    </motion.svg>
  );
}

const ERA_HEADERS: Record<number, string> = {
  0: "ERA ARCHITECTURE",
  1: "THE FOUNDATION",
  2: "THE EXPERIENCE",
  3: "THE HORIZON"
};

const ERA_TITLE_COLORS: Record<number, string> = {
  0: "text-blue-600",
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

export default function FoundersPage() {
  const [selectedFounder, setSelectedFounder] = useState<Founder | null>(null);
  const [activeEraIndex, setActiveEraIndex] = useState<number>(0);

  const activeMilestone = TIMELINE_MILESTONES[activeEraIndex] || TIMELINE_MILESTONES[0];

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">
      {/* ── HERO SECTION WITH SOFT GRADIENT WASH ── */}
      <div className="w-full arcade-wash border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-5 pt-48 pb-24 sm:px-8 sm:pt-56 sm:pb-32">
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
      </div>

      {/* ── MAIN BODY (PURE WHITE BACKGROUND) ── */}
      <div className="w-full bg-white">
        <div className="mx-auto max-w-6xl px-5 pt-20 sm:pt-28 pb-20 sm:px-8 space-y-28">
          {/* --- FOUNDERS CIRCULAR GRID SECTION (MATCHING REFERENCE IMAGE) --- */}
          <section className="space-y-16 pt-6 pb-4">
            {/* Section Header */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight font-sans">
                Our Exceptional Team
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

                    {/* Social Icons Row */}
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
                      {founder.social.email && (
                        <a
                          href={`mailto:${founder.social.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-slate-900 transition-colors p-1"
                          title="Email"
                        >
                          <Mail size={16} />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bottom Row: 2 Centered Founder Cards Flanked by Flourish Lines */}
              <div className="flex items-center justify-center gap-4 sm:gap-10 pt-4">
                {/* Left Flourish Line */}
                <FlourishLine className="w-24 sm:w-40 md:w-56 h-auto text-slate-900 shrink-0 hidden sm:block opacity-80" />

                {/* Centered Founders (Aloshy Antony & Anjali) */}
                <div className="flex flex-wrap justify-center gap-y-12 gap-x-6 sm:gap-x-10">
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
                        {founder.social.email && (
                          <a
                            href={`mailto:${founder.social.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-slate-900 transition-colors p-1"
                            title="Email"
                          >
                            <Mail size={16} />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Right Flourish Line (Flipped) */}
                <FlourishLine className="w-24 sm:w-40 md:w-56 h-auto text-slate-900 shrink-0 hidden sm:block opacity-80 transform scale-x-[-1]" />
              </div>
            </div>
          </section>

          {/* --- PLATFORM PHILOSOPHY HIGHLIGHTS --- */}
          <section className="space-y-10 pt-6">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-100">
                Guiding Principles
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-slate-900">
                Our Core Philosophy
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Arcade was architected around foundational values designed to give every student real-world engineering mastery.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PHILOSOPHY_CARDS.map((card, i) => (
                <div
                  key={i}
                  className="rounded-[20px] border border-slate-100 bg-white p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      {i + 1}
                    </div>
                    <h3 className="font-serif text-xl font-medium text-slate-900">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* --- PLATFORM MILESTONES TIMELINE (MATCHING REFERENCE DESIGN) --- */}
          <section className="space-y-8 pt-4">
            {/* Section Header */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-100">
                Our Evolution
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight">
                How Arcade Started ?
              </h2>
            </div>

            {/* Top Centered Era Navigation Pills */}
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 pt-2">
              {TIMELINE_MILESTONES.map((m, idx) => {
                const isActive = activeEraIndex === idx;
                const numberLabels = ["1", "2", "3", "4"];
                const eraTitles = ["Origin", "Architecture", "Beta Launch", "Future Vision"];

                return (
                  <button
                    key={m.year}
                    onClick={() => setActiveEraIndex(idx)}
                    className={`flex items-center gap-2.5 rounded-full px-5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#0B132B] text-white shadow-md"
                        : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 shadow-2xs"
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center w-4.5 h-4.5 rounded-full text-[11px] font-bold ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {numberLabels[idx]}
                    </span>
                    <span>{eraTitles[idx]}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Milestone Detail Card */}
            {(() => {
              const outerTheme = ERA_OUTER_THEMES[activeEraIndex] || ERA_OUTER_THEMES[0];

              return (
                <div className={`rounded-[28px] border p-8 sm:p-12 shadow-sm transition-all duration-500 ${outerTheme.mainCard}`}>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Left Detail Content */}
                    <div className="lg:col-span-7 space-y-4">

                      {/* Heading */}
                      <h3 className={`font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-tight transition-colors duration-300 ${ERA_TITLE_COLORS[activeEraIndex] || "text-slate-900"}`}>
                        {activeMilestone.title}
                      </h3>

                      {/* Subtitle */}
                      <p className="text-sm font-semibold text-blue-600 font-sans">
                        {activeMilestone.subtitle}
                      </p>

                      {/* Description */}
                      <div className="space-y-3">
                        {activeMilestone.description.split("\n\n").map((para, pIdx) => (
                          <p key={pIdx} className="text-sm text-slate-500 leading-relaxed font-normal">
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Right Standards Card */}
                    <div className={`lg:col-span-5 rounded-2xl border p-6 shadow-xs space-y-4 transition-all duration-500 ${outerTheme.rightCard}`}>
                      <div className="text-[11px] font-bold uppercase tracking-widest border-b border-slate-200/60 pb-3">
                        <span className="text-slate-500">{ERA_HEADERS[activeEraIndex] || "ERA ARCHITECTURE"}</span>
                      </div>

                  <div className="space-y-0 pt-1">
                    {ERA_STANDARDS[activeEraIndex]?.map((standardText, sIdx) => {
                      const theme = PLACARD_THEMES[sIdx % PLACARD_THEMES.length];

                      return (
                        <motion.div
                          key={`${activeEraIndex}-${sIdx}`}
                          initial={{ opacity: 0, y: 16, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{
                            duration: 0.4,
                            delay: sIdx * 0.12,
                            ease: [0.25, 0.1, 0.25, 1]
                          }}
                          className="relative flex flex-col items-center group w-full"
                        >
                          {/* If first board: Top Triangle Rope & Peg Pin */}
                          {sIdx === 0 ? (
                            <div className="flex justify-center -mb-1 z-10">
                              <svg className="w-16 h-5 overflow-visible" viewBox="0 0 60 20">
                                {/* Wall Pin / Peg */}
                                <circle cx="30" cy="3" r="3.5" fill="#475569" stroke="#334155" strokeWidth="1" />
                                <circle cx="30" cy="3" r="1.5" fill="#94A3B8" />
                                {/* Left & Right Hanging Strings */}
                                <line x1="30" y1="3" x2="16" y2="19" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 1.5" />
                                <line x1="30" y1="3" x2="44" y2="19" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 1.5" />
                              </svg>
                            </div>
                          ) : (
                            /* Connecting Vertical Left & Right Ropes (Centered Inward) */
                            <div className="h-4 w-full flex justify-between px-24 -my-0.5 z-10">
                              <div className="w-1.5 h-full bg-slate-300 rounded-sm border-x border-slate-400/60 shadow-2xs" />
                              <div className="w-1.5 h-full bg-slate-300 rounded-sm border-x border-slate-400/60 shadow-2xs" />
                            </div>
                          )}

                          {/* Reference Color Module Box */}
                          <div className={`w-full rounded-2xl ${theme.boxBg} border ${theme.border} p-4 ${theme.shadow} flex items-center gap-3.5 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 cursor-pointer z-20`}>
                            {/* White Round Circle Container for Number */}
                            <div className={`w-7 h-7 rounded-full bg-white/90 border ${theme.border} flex items-center justify-center text-xs font-bold ${theme.numberColor} shrink-0 shadow-2xs`}>
                              {sIdx + 1}
                            </div>

                            {/* Text Content Aligned Left */}
                            <span className={`text-xs font-bold ${theme.text} leading-snug tracking-wide`}>
                              {standardText}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </section>
        </div>
      </div>

      {/* ── FOUNDER DETAILS MODAL ── */}
      <FounderModal
        founder={selectedFounder}
        onClose={() => setSelectedFounder(null)}
      />
    </main>
  );
}
