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

import { CONTRIBUTORS_DATA } from "./contributorsData";

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
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-16 lg:pt-48 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-[100rem] mx-auto w-full flex flex-col items-center justify-center text-center">
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#205ca8]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 space-y-8"
        >
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-slate-900 font-['Dancing_Script'] tracking-normal pt-4 mb-4">
            The Ones Who Built With Us
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 leading-relaxed font-medium">
            Meet the developers, designers, and visionaries who contribute their time and expertise to make Arcade the ultimate learning ecosystem.
          </p>
        </motion.div>
      </section>

      {/* --- CONTRIBUTORS GRID --- */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-32 max-w-5xl mx-auto w-full z-10">
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8 md:gap-12">
          {CONTRIBUTORS_DATA.map((contributor, idx) => (
            <motion.div
              key={contributor.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: idx * 0.2, ease: "easeOut" }}
              className={`relative w-72 h-[480px] rounded-full flex flex-col items-center pt-14 overflow-hidden shadow-2xl hover:-translate-y-4 transition-transform duration-500 cursor-default ${contributor.color} ${idx % 2 === 1 ? 'md:mt-24' : 'md:mt-0'}`}
            >
              <div className="text-center z-10 px-6">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest leading-tight">{contributor.name}</h3>
                <p className="text-sm font-semibold text-slate-800/80 mt-2">{contributor.role}</p>
              </div>
              
              <div className="absolute bottom-0 w-full h-[360px]">
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

      {/* --- JOIN THE MISSION CTA --- */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-32 max-w-5xl mx-auto w-full z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-slate-900 rounded-[2.5rem] p-12 sm:p-20 relative overflow-hidden shadow-2xl"
        >
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#205ca8]/30 blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center mb-8 border border-white/20 backdrop-blur-xl shadow-inner">
              <Code2 className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
              Shape the Future of Learning
            </h2>
            <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Arcade is constantly evolving. Whether you're a frontend wizard, a backend architect, or a design enthusiast, there's a place for you to make an impact.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="https://github.com/arcade-platform" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 hover:shadow-xl hover:shadow-white/20 transition-all duration-300 w-full sm:w-auto">
                <GithubIcon className="w-5 h-5" />
                View Repository
              </Link>
              <Link href="/docs" className="flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 hover:scale-105 transition-all duration-300 w-full sm:w-auto backdrop-blur-sm">
                Developer API <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </main>
  );
}
