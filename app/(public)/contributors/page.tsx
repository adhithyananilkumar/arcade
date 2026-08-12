"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Code2,
  Terminal,
  Cpu,
  ArrowRight
} from "lucide-react";
import BlurText from "@/components/BlurText";

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
  return (
    <main className="min-h-screen arcade-wash selection:bg-blue-100 selection:text-[#205ca8] flex flex-col relative overflow-hidden">
      
      {/* ── HERO SECTION WITH SOFT GRADIENT WASH ── */}
      <div className="w-full border-b border-slate-100/50 min-h-screen flex flex-col items-center justify-center">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 w-full">
          <div className="max-w-4xl mx-auto space-y-8 text-center -mt-16">
            <BlurText
              text="Made Better Together."
              delay={150}
              animateBy="words"
              direction="top"
              stepDuration={0.35}
              className="text-7xl sm:text-8xl lg:text-[9rem] tracking-normal text-slate-900 leading-[1.1] justify-center"
              style={{ fontFamily: "'Dancing Script', 'Satisfy', 'Caveat', 'Great Vibes', cursive", fontWeight: 700 }}
              wordClasses={{
                "Together.": "bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent pb-2"
              }}
            />
            
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
      <section className="relative px-4 sm:px-6 lg:px-8 pb-32 max-w-5xl mx-auto w-full z-10 -mt-10">
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8 md:gap-10">
          {CONTRIBUTORS_DATA.map((contributor, idx) => (
            <motion.div
              key={contributor.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: idx * 0.2, ease: "easeOut" }}
              className={`relative w-60 sm:w-64 h-[380px] sm:h-[400px] rounded-full flex flex-col items-center pt-10 sm:pt-12 overflow-hidden shadow-2xl hover:-translate-y-4 transition-transform duration-500 cursor-default ${contributor.color} ${idx % 2 === 1 ? 'md:mt-16' : 'md:mt-0'}`}
            >
              <div className="text-center z-10 px-5">
                <h3 className="text-[1.05rem] sm:text-lg font-black text-slate-900 uppercase tracking-widest leading-tight">{contributor.name}</h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-800/80 mt-1.5">{contributor.role}</p>
              </div>
              
              <div className="absolute bottom-0 w-full h-[280px] sm:h-[300px] [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_100%)]">
                <Image
                   src={contributor.avatar}
                   alt={contributor.name}
                   fill
                   className="object-cover object-top grayscale contrast-[1.1] brightness-[1.05] drop-shadow-2xl mix-blend-multiply opacity-90"
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
              className="group flex flex-col items-center text-center max-w-[240px]"
            >
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full overflow-hidden bg-slate-100 shadow-sm border-4 border-slate-50 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md">
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

    </main>
  );
}
