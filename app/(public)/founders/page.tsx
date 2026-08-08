"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  Variants,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
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
} from "lucide-react";

import {
  FOUNDERS_DATA,
  TIMELINE_MILESTONES,
  ABOUT_ARCADE_HIGHLIGHTS,
  PHILOSOPHY_CARDS,
  Founder,
} from "./foundersData";
import FounderModal from "./FounderModal";
import "@/apps/public/landing.css";

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

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

export default function FoundersPage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [selectedFounder, setSelectedFounder] = useState<Founder | null>(null);
  const [activeEraIndex, setActiveEraIndex] = useState<number>(0);
  const [founderCardModes, setFounderCardModes] = useState<Record<string, "vision" | "impact">>({
    "founder-1": "vision",
    "founder-2": "vision",
    "founder-3": "vision",
  });

  // Mouse Parallax values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 120 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  const bgX = useTransform(mouseXSpring, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-8, 8]);
  const bgY = useTransform(mouseYSpring, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const toggleFounderMode = (id: string, mode: "vision" | "impact") => {
    setFounderCardModes((prev) => ({ ...prev, [id]: mode }));
  };

  const activeMilestone = TIMELINE_MILESTONES[activeEraIndex];

  return (
    <div className="landing-root min-h-screen flex flex-col relative z-10 bg-slate-50 overflow-hidden font-sans text-slate-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&display=swap');

        @keyframes gradientShift15s {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-15s {
          background-size: 200% 200%;
          animation: gradientShift15s 15s ease-in-out infinite;
        }

        @keyframes floatPill {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-float-pill-1 { animation: floatPill 5s ease-in-out infinite; }
        .animate-float-pill-2 { animation: floatPill 6s ease-in-out 1s infinite; }
        .animate-float-pill-3 { animation: floatPill 7s ease-in-out 2s infinite; }
      `}</style>

      {/* Background Radial Glow Blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-100/60 rounded-full blur-[120px] opacity-70" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-indigo-50/60 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-teal-50/50 rounded-full blur-[100px]" />
      </div>

      {/* --- HERO SECTION: UNIQUE GEOMETRIC STACK CANVAS (LIGHT THEME) --- */}
      <section
        ref={headerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full min-h-[90vh] flex flex-col justify-center items-center text-center px-6 overflow-hidden z-10 bg-white/80 backdrop-blur-md pt-28 pb-16"
      >
        {/* Decorative Light Radial Rings (No recycled ink-dome trees) */}
        <motion.div
          style={{ x: bgX, y: bgY }}
          className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10 opacity-40"
        >
          <div className="w-[700px] h-[700px] sm:w-[950px] sm:h-[950px] rounded-full border border-blue-200/60 absolute" />
          <div className="w-[450px] h-[450px] sm:w-[680px] sm:h-[680px] rounded-full border border-teal-200/60 absolute" />
          <div className="w-[250px] h-[250px] sm:w-[420px] sm:h-[420px] rounded-full border border-indigo-200/60 absolute" />
        </motion.div>



        <div className="relative z-10 max-w-[920px] mx-auto text-center space-y-8 py-8">


          {/* HEADLINE */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[48px] sm:text-[68px] md:text-[80px] lg:text-[90px] tracking-tight leading-[1.05] text-[#0B132B] drop-shadow-sm text-center"
            style={{
              fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
              fontWeight: 600,
            }}
          >
            Minds Behind{" "}
            <span className="relative inline-block">
              <span
                className="inline-block animate-gradient-15s"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #0D9488 0%, #06B6D4 35%, #2563EB 70%, #7C3AED 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Arcade.
              </span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 -bottom-1 sm:-bottom-2 w-full h-[3px] sm:h-[4px] bg-[#EAB308] origin-left"
              />
            </span>
          </motion.h1>

          {/* SUBTITLE */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-[17px] sm:text-[19px] leading-[1.75] text-[#475569] max-w-[640px] mx-auto font-sans font-normal"
          >
            Meet the visionaries, educators, and engineers behind Arcade—redefining digital learning, verifiable credentials, and hands-on campus innovation at Amal Jyothi College of Engineering.
          </motion.p>

          {/* ACTION BUTTONS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
            className="pt-4 flex flex-wrap justify-center items-center gap-4"
          >
            <a
              href="#founders-deck"
              className="relative inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#0B132B] hover:bg-[#121E42] text-white font-medium text-base shadow-[0_10px_30px_-8px_rgba(11,19,43,0.35)] hover:shadow-[0_16px_36px_-6px_rgba(11,19,43,0.45)] border-t border-white/20 hover:-translate-y-[2px] transition-all duration-200 group"
            >
              <span>Meet Founders</span>
              <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-inner group-hover:translate-x-1 transition-transform">
                <ArrowUpRight className="w-4 h-4 text-[#0B132B] stroke-[2.5]" />
              </span>
            </a>

            <a
              href="#story-canvas"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-medium text-base shadow-sm hover:shadow transition-all duration-200"
            >
              <span>How It Started</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
          </motion.div>
        </div>
      </section>



      {/* --- HOW IT STARTED: UNIQUE INTERACTIVE ERA CANVAS (LIGHT THEME) --- */}
      <section id="story-canvas" className="py-24 px-6 bg-white relative z-10">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* SECTION HEADER */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-200/80">
              Interactive Story Canvas
            </span>
            <h2
              className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              How Arcade Started
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Select an era below to explore how Arcade evolved from a campus idea into an institutional education platform.
            </p>
          </div>

          {/* ERA SELECTION PILLS */}
          <div className="flex flex-wrap justify-center items-center gap-3">
            {TIMELINE_MILESTONES.map((m, idx) => {
              const isActive = activeEraIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveEraIndex(idx)}
                  className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 border ${
                    isActive
                      ? "bg-[#0B132B] text-white border-[#0B132B] shadow-lg"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                    {idx + 1}
                  </span>
                  <span>{m.badge}</span>
                  <span className="text-xs opacity-75 hidden sm:inline">({m.year.split(" - ")[0]})</span>
                </button>
              );
            })}
          </div>

          {/* ACTIVE ERA CARD DISPLAY */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeEraIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="p-8 sm:p-12 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center gap-3">
                  <span className="px-3.5 py-1 rounded-full text-xs font-mono bg-blue-100 text-blue-900 border border-blue-200">
                    {activeMilestone.year}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                    {activeMilestone.badge}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-4xl font-bold text-slate-900 font-serif leading-tight">
                  {activeMilestone.title}
                </h3>
                <p className="text-sm sm:text-base font-semibold text-blue-600">
                  {activeMilestone.subtitle}
                </p>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-sans pt-2">
                  {activeMilestone.description}
                </p>
              </div>

              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono border-b border-slate-100 pb-3">
                  <span>ERA ARCHITECTURE</span>
                  <span className="text-blue-600 font-bold">AJCE STANDARDS</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-700 leading-snug">
                      High scalability and verifiable credential pipelines built-in.
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-700 leading-snug">
                      Collaborative workshop engines for faculty mentors and student creators.
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* --- MEET THE FOUNDERS: SIGNATURE LIGHT DECK --- */}
      <section id="founders-deck" className="py-24 px-6 bg-slate-50 relative z-10">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* SECTION HEADER */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-200/80">
              Founding Leadership
            </span>
            <h2
              className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Meet The Founders
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              The engineers, educators, and creators who designed Arcade from the ground up to empower students and faculty.
            </p>
          </div>

          {/* FOUNDERS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FOUNDERS_DATA.map((founder) => {
              const currentMode = founderCardModes[founder.id] || "vision";
              return (
                <motion.div
                  key={founder.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Portrait Container */}
                    <div className="relative w-full h-72 overflow-hidden bg-slate-100">
                      <Image
                        src={founder.image}
                        alt={founder.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-80" />

                      <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                        <h3 className="text-2xl font-bold font-serif leading-tight">
                          {founder.name}
                        </h3>
                        <p className="text-xs font-medium text-teal-300 uppercase tracking-wider">
                          {founder.role}
                        </p>
                      </div>
                    </div>

                    {/* Mode Switcher Tabs */}
                    <div className="px-6 pt-4 flex border-b border-slate-100">
                      <button
                        onClick={() => toggleFounderMode(founder.id, "vision")}
                        className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 ${
                          currentMode === "vision"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-400 hover:text-slate-700"
                        }`}
                      >
                        Vision & Story
                      </button>
                      <button
                        onClick={() => toggleFounderMode(founder.id, "impact")}
                        className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 ${
                          currentMode === "impact"
                            ? "border-teal-600 text-teal-600"
                            : "border-transparent text-slate-400 hover:text-slate-700"
                        }`}
                      >
                        Impact & Stack
                      </button>
                    </div>

                    {/* Content View */}
                    <div className="p-6 space-y-4 min-h-[160px]">
                      {currentMode === "vision" ? (
                        <>
                          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed italic border-l-2 border-blue-500 pl-3">
                            "{founder.quote}"
                          </p>
                          <p className="text-slate-700 text-xs sm:text-sm leading-relaxed line-clamp-3">
                            {founder.bio}
                          </p>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <ul className="space-y-1.5">
                            {founder.achievements.slice(0, 2).map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {founder.skills.slice(0, 3).map((sk) => (
                              <span key={sk} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-6 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                    <div className="flex items-center gap-2">
                      {founder.social.linkedin && (
                        <a
                          href={founder.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 transition-colors"
                        >
                          <LinkedinIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {founder.social.github && (
                        <a
                          href={founder.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 transition-colors"
                        >
                          <GithubIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {founder.social.email && (
                        <a
                          href={`mailto:${founder.social.email}`}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-600 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedFounder(founder)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 group-hover:translate-x-1 transition-transform"
                    >
                      <span>Full Bio</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- FOUNDERS' PHILOSOPHY BENTO SECTION --- */}
      <section className="py-24 px-6 bg-white relative z-10">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
              Guiding Principles
            </span>
            <h2
              className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Our Core Philosophy
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Values that dictate every architectural decision, user interface, and academic partnership on Arcade.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PHILOSOPHY_CARDS.map((card, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${card.color}`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">
                  {card.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION BANNER --- */}
      <section className="py-20 px-6 relative z-10 bg-[#0B132B] text-white overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <h2
            className="text-4xl sm:text-6xl font-bold tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Ready to Experience the Future of Campus Learning?
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Explore certified courses, join student workshops, or become a creator on Arcade at Amal Jyothi College of Engineering.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-xl hover:shadow-blue-500/25 transition-all"
            >
              <span>Explore Courses</span>
              <ArrowUpRight className="w-5 h-5" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-base border border-slate-700 transition-all"
            >
              <span>About Platform</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Founder Details Modal */}
      <FounderModal
        founder={selectedFounder}
        onClose={() => setSelectedFounder(null)}
      />
    </div>
  );
}
