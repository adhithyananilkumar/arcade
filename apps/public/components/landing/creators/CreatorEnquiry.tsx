"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Send } from "lucide-react";

export default function CreatorEnquiry() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-transparent" id="enquiry">
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        
        {/* Centered Editorial Composition (No outer card/container) */}
        <div className="flex flex-col items-center justify-center text-center">
          
          {/* 1. Top Handwritten-Style Accent: "We're here for you" */}
          <div className="inline-flex flex-col items-center mb-3">
            <span className="font-serif italic text-lg sm:text-xl text-[#7A5AF8] tracking-wide font-normal">
              We’re here for you
            </span>
            
            {/* Hand-drawn SVG underline accent */}
            <svg
              className="w-28 h-2.5 text-[#7A5AF8]/70 mt-0.5 pointer-events-none"
              viewBox="0 0 110 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 3 6 C 28 2.5, 62 8, 106 3.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* 2. Main Heading: "Have a Question? Let's Connect" on one single line on desktop */}
          <h2 className="text-3xl sm:text-4xl md:text-[42px] lg:text-[46px] xl:text-5xl font-serif text-[#0B132B] font-semibold tracking-tight leading-[1.18] mb-4 max-w-4xl mx-auto sm:whitespace-nowrap">
            Have a Question?{" "}
            <span className="font-normal italic text-[#2E2EAB]">Let’s Connect</span>
          </h2>

          {/* 3. Supporting Description: Constrained width for balanced centered reading */}
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-8 max-w-2xl mx-auto">
            Whether it’s about courses, certifications, format options, or partnerships — our team is happy to help you.
          </p>

          {/* 4. Centered Outlined Reach Us Button */}
          <div className="inline-flex justify-center">
            <Link
              href="/reach-us"
              className="group relative inline-flex items-center gap-3.5 px-7 py-3.5 rounded-full bg-white/80 border border-[#7A5AF8]/35 hover:border-[#3B2FC9] hover:bg-[#3B2FC9] text-[#1C1C2E] hover:text-white font-medium text-base tracking-wide shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out"
            >
              {/* Purple circular icon badge on left */}
              <span className="w-8 h-8 rounded-full bg-[#7A5AF8]/10 group-hover:bg-white/20 flex items-center justify-center text-[#7A5AF8] group-hover:text-white transition-colors shrink-0">
                <Send className="w-3.5 h-3.5 -rotate-45 translate-x-[-0.5px] translate-y-[-0.5px]" />
              </span>

              <span>Reach Us</span>

              {/* Simple arrow on right */}
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          </div>

        </div>
      </div>

      {/* Creators page 192px smooth gradient transition into existing footer background */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 z-0"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(252, 252, 255, 0.2) 20%, rgba(244, 247, 251, 0.6) 55%, oklch(0.97 0.02 245) 100%)",
        }}
        aria-hidden="true"
      />
    </section>
  );
}



