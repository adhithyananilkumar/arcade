"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Code2,
  Terminal,
  Cpu,
  ArrowRight,
  Award,
  GraduationCap,
  MonitorPlay,
  Lightbulb,
  Laptop,
  Headset,
  Presentation,
  Library,
  Brain,
  PencilRuler,
  BookOpen,
  Video,
  X,
  CheckCircle2
} from "lucide-react";
import StrokeText from "@/components/StrokeText";
import FlowingTimeline from "@/components/ui/FlowingTimeline";

import { CONTRIBUTORS_DATA, OTHER_CONTRIBUTORS_DATA } from "./contributorsData";

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

export default function ContributorsPage() {
  const [selectedContributor, setSelectedContributor] = useState<any>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedContributor) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedContributor]);

  return (
    <main className="min-h-screen arcade-wash selection:bg-blue-100 selection:text-[#205ca8] flex flex-col relative">
      
      {/* Floating Decorative Icons (Educational Theme) - Fixed to viewport */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
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
      </div>

      {/* ── HERO SECTION WITH SOFT GRADIENT WASH ── */}
      <div className="relative w-full border-b border-slate-100/50 min-h-[70vh] flex flex-col items-center justify-center pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 w-full relative z-10">
          <div className="max-w-4xl mx-auto space-y-8 text-center">
            <div className="flex flex-col items-center justify-center w-full">
              <StrokeText
                text="Made Better"
                strokeColor="#1e293b"
                fillColor="#0f172a"
                strokeWidth={1.5}
                drawDuration={1.5}
                fillDelay={0.2}
                stagger={0.08}
                fontSize={120}
                fontWeight={700}
                style={{ fontFamily: "'Dancing Script', 'Satisfy', 'Caveat', 'Great Vibes', cursive", marginBottom: '-30px' }}
                className="w-full flex justify-center"
              />
              
              {/* SVG gradient definition */}
              <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
                <linearGradient id="togetherGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="50%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </svg>

              <StrokeText
                text="Together."
                strokeColor="#4f46e5"
                fillColor="url(#togetherGradient)"
                strokeWidth={1.5}
                drawDuration={1.5}
                fillDelay={0.2}
                stagger={0.08}
                fontSize={130}
                fontWeight={700}
                style={{ fontFamily: "'Dancing Script', 'Satisfy', 'Caveat', 'Great Vibes', cursive" }}
                className="w-full flex justify-center"
              />
            </div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto"
            >
              Meet the developers, designers, and visionaries who contribute their time and expertise to make Arcade the ultimate learning ecosystem.
            </motion.p>
          </div>
        </div>
      </div>

      {/* --- CONTRIBUTORS GRID --- */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-32 max-w-6xl mx-auto w-full z-10">
        
        <h2 
          className="text-5xl sm:text-6xl lg:text-7xl text-slate-900 text-center mb-16 sm:mb-20 tracking-normal"
          style={{ fontFamily: "'Dancing Script', 'Satisfy', 'Caveat', 'Great Vibes', cursive", fontWeight: 700 }}
        >
          The Ones Who Built With Us
        </h2>

        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8 md:gap-10">
          {CONTRIBUTORS_DATA.map((contributor, idx) => (
            <motion.div
              key={contributor.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: idx * 0.2, ease: "easeOut" }}
              className={`group relative w-52 sm:w-56 h-[340px] sm:h-[360px] rounded-full flex flex-col items-center pt-8 sm:pt-10 overflow-hidden shadow-2xl hover:-translate-y-4 transition-transform duration-500 cursor-pointer ${contributor.color} ${idx % 2 === 1 ? 'md:mt-16' : 'md:mt-0'}`}
              onClick={() => setSelectedContributor(contributor)}
            >
              <div className="text-center z-10 px-5">
                <h3 className="text-[1.05rem] sm:text-lg font-black text-slate-900 uppercase tracking-widest leading-tight group-hover:text-slate-800 transition-colors">{contributor.name}</h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-800/80 mt-1.5">{contributor.role}</p>
              </div>
              
              <div className="absolute bottom-0 w-full h-[250px] sm:h-[270px] [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_100%)]">
                <Image
                   src={contributor.avatar}
                   alt={contributor.name}
                   fill
                   className="object-cover object-top grayscale group-hover:grayscale-0 contrast-[1.1] group-hover:contrast-100 brightness-[1.05] group-hover:brightness-100 drop-shadow-2xl mix-blend-multiply group-hover:mix-blend-normal opacity-90 group-hover:opacity-100 transition-all duration-500"
                   unoptimized
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- OTHER CONTRIBUTORS GRID --- */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-32 max-w-7xl mx-auto w-full z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10 justify-items-center">
          {OTHER_CONTRIBUTORS_DATA.map((contributor, idx) => (
            <motion.div
              key={contributor.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="group flex flex-col items-center text-center max-w-[240px] cursor-pointer"
              onClick={() => setSelectedContributor(contributor)}
            >
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full overflow-hidden bg-white shadow-sm border-4 border-white transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md">
                <Image
                  src={contributor.avatar}
                  alt={contributor.name}
                  fill
                  className="object-cover grayscale contrast-105 group-hover:grayscale-0 transition-all duration-500"
                  sizes="200px"
                  unoptimized
                />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-sans mt-4 group-hover:text-indigo-600 transition-colors">
                {contributor.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {contributor.role}
              </p>
              
              <div className="flex items-center justify-center gap-3.5 mt-3 text-slate-400">
                {contributor.linkedin && (
                  <a
                    href={contributor.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-slate-900 transition-colors p-1"
                    title="LinkedIn"
                  >
                    <LinkedinIcon className="w-4 h-4" />
                  </a>
                )}
                {contributor.github && (
                  <a
                    href={contributor.github}
                    target="_blank"
                    rel="noopener noreferrer"
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
      </section>

      {/* --- ARCADE TIMELINE --- */}
      <section className="relative w-full z-10 bg-white border-t border-slate-100">
        <FlowingTimeline />
      </section>

      {/* Contributor Details Modal */}
      <AnimatePresence>
        {selectedContributor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedContributor(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              {/* Modal Header & Pattern Background */}
              <div className="relative pt-8 px-6 sm:px-10 pb-6 rounded-t-[2rem] overflow-hidden">
                {/* Subtle dot pattern/gradient in header */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50/30 -z-10" />
                <div className="absolute inset-0 opacity-[0.03] -z-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                
                <button 
                  onClick={() => setSelectedContributor(null)}
                  className="absolute top-6 right-6 w-10 h-10 bg-white/80 hover:bg-white flex items-center justify-center rounded-full shadow-sm text-slate-500 hover:text-slate-800 transition-colors z-10"
                >
                  <X size={20} strokeWidth={2} />
                </button>

                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start relative z-10">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl overflow-hidden shadow-lg border-4 border-white shrink-0 relative bg-slate-100">
                    <Image
                      src={selectedContributor.avatar}
                      alt={selectedContributor.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-col items-center sm:items-start pt-2 sm:pt-4 text-center sm:text-left">
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{selectedContributor.name}</h2>
                    <p className="text-blue-600 font-bold mt-1 text-lg">{selectedContributor.role}</p>
                    
                    <div className="flex items-center gap-3 mt-4">
                      {selectedContributor.linkedin && (
                        <a href={selectedContributor.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <LinkedinIcon />
                        </a>
                      )}
                      {selectedContributor.github && (
                        <a href={selectedContributor.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors">
                          <GithubIcon />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 sm:px-10 pb-10 pt-4">
                <div className="w-full h-px bg-slate-100 mb-8" />
                
                {selectedContributor.journey && (
                  <div className="mb-8">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                      Full Journey & Role
                    </h4>
                    <p className="text-slate-600 text-[1.05rem] leading-relaxed">
                      {selectedContributor.journey}
                    </p>
                  </div>
                )}

                {selectedContributor.milestones && selectedContributor.milestones.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                      <Award size={14} className="text-amber-500" />
                      Key Milestones & Impact
                    </h4>
                    <ul className="space-y-3.5">
                      {selectedContributor.milestones.map((milestone: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700 leading-snug text-base">
                          <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{milestone}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
