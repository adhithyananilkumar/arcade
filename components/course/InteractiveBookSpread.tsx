"use client"

import React from "react"
import { motion } from "framer-motion"

interface InteractiveBookSpreadProps {
  highlights: string[]
}

export default function InteractiveBookSpread({ highlights }: InteractiveBookSpreadProps) {
  return (
    <div className="relative mx-auto max-w-5xl select-none [perspective:1400px] my-6">
      {/* Outer Hardcover Frame Container */}
      <div className="relative rounded-[32px] bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-3.5 sm:p-4 shadow-[0_32px_80px_rgba(15,23,42,0.38)] border border-slate-700/60">
        
        {/* Hanging Crimson Silk Ribbon Bookmark */}
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          whileInView={{ scaleY: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="absolute -top-1 left-1/2 -translate-x-1/2 z-30 pointer-events-none hidden md:block origin-top"
        >
          <div className="w-5 h-22 bg-gradient-to-b from-rose-600 via-rose-700 to-rose-950 shadow-lg rounded-b-xs border-x border-rose-950/40 relative">
            <div className="absolute bottom-0 inset-x-0 h-3 bg-[#0F172A] clip-v-notch" />
          </div>
        </motion.div>

        {/* REALISTIC 3D STACKED BOOK PAGE EDGES (LEFT & RIGHT SIDES) */}
        {/* Left Stacked Book Pages Side */}
        <div className="absolute inset-y-4 left-0.5 w-3.5 sm:w-4.5 rounded-l-md overflow-hidden bg-[#F5EFE6] shadow-inner border-y border-l border-amber-900/20 hidden md:flex flex-col justify-between p-[2px]">
          <div className="size-full opacity-70 bg-[repeating-linear-gradient(0deg,#d4c5b3_0px,#d4c5b3_1px,transparent_1px,transparent_3px)]" />
        </div>

        {/* Right Stacked Book Pages Side */}
        <div className="absolute inset-y-4 right-0.5 w-3.5 sm:w-4.5 rounded-r-md overflow-hidden bg-[#F5EFE6] shadow-inner border-y border-r border-amber-900/20 hidden md:flex flex-col justify-between p-[2px]">
          <div className="size-full opacity-70 bg-[repeating-linear-gradient(0deg,#d4c5b3_0px,#d4c5b3_1px,transparent_1px,transparent_3px)]" />
        </div>

        {/* 3D SCROLL OPENING TWO-PAGE SPREAD */}
        <div className="relative overflow-hidden rounded-[24px] bg-[#FAF8F5] border border-amber-900/15 shadow-inner grid grid-cols-1 md:grid-cols-2">
          
          {/* Central Spine Shadow & Crease Shader */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-20 bg-gradient-to-r from-black/15 via-transparent to-black/15 pointer-events-none z-20 hidden md:block" />
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-amber-950/25 z-20 hidden md:block" />

          {/* LEFT PAGE: Opens 3D Outward from Right Center */}
          <motion.div
            initial={{ rotateY: -28, opacity: 0.6, scale: 0.96 }}
            whileInView={{ rotateY: 0, opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative p-7 sm:p-10 md:pr-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-amber-900/10 bg-[#FAF8F5] [transform-origin:right_center]"
          >
            {/* Header Watermark */}
            <div className="absolute top-4 left-6 text-[10px] font-serif tracking-widest text-amber-900/40 uppercase">
              Section 01 &bull; Course Overview
            </div>

            <div className="mt-4">
              <h3 className="font-serif text-2xl sm:text-3xl font-normal italic text-slate-900 tracking-tight">
                About this course
              </h3>
              <div className="my-3 h-[1px] w-12 bg-amber-800/30" />
              
              <p className="mt-4 font-serif text-[15px] sm:text-[16px] leading-relaxed text-slate-700">
                <span className="float-left mr-2.5 font-serif text-4xl font-bold leading-none text-amber-900">T</span>
                his course treats design as a craft you build in public — every module ends with a real
                assignment, reviewed by a working product designer. You&apos;ll leave with a portfolio piece, not
                just a certificate.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between text-[11px] font-serif text-slate-400 border-t border-amber-900/10 pt-4">
              <span>Arcade Curriculum</span>
              <span>&bull; 01 &bull;</span>
            </div>
          </motion.div>

          {/* RIGHT PAGE: Opens 3D Outward from Left Center */}
          <motion.div
            initial={{ rotateY: 28, opacity: 0.6, scale: 0.96 }}
            whileInView={{ rotateY: 0, opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative p-7 sm:p-10 md:pl-12 flex flex-col justify-between bg-[#FAF8F5] [transform-origin:left_center]"
          >
            {/* Realistic Dog-Ear Corner Fold */}
            <div className="absolute top-0 right-0 w-9 h-9 bg-gradient-to-bl from-slate-300/90 via-amber-100/60 to-transparent shadow-xs pointer-events-none rounded-bl-lg border-b border-l border-amber-900/15" />

            {/* Header Watermark */}
            <div className="absolute top-4 right-6 text-[10px] font-serif tracking-widest text-amber-900/40 uppercase">
              Section 02 &bull; Outcomes
            </div>

            <div className="mt-4">
              <h3 className="font-serif text-2xl sm:text-3xl font-normal italic text-slate-900 tracking-tight">
                What you&apos;ll walk away with
              </h3>
              <div className="my-3 h-[1px] w-12 bg-amber-800/30" />

              <ul className="mt-4 flex flex-col gap-3.5">
                {highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 font-serif text-[15px] text-slate-800">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-700 text-xs font-bold mt-0.5">
                      ✓
                    </span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex items-center justify-between text-[11px] font-serif text-slate-400 border-t border-amber-900/10 pt-4">
              <span>&bull; 02 &bull;</span>
              <span>Verified Certificate</span>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
