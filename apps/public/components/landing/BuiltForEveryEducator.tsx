"use client";

import React from "react";
import SixCategoryGallery from "./SixCategoryGallery";

export default function BuiltForEveryEducator() {
  return (
    <section className="relative pt-10 pb-10 lg:pt-14 lg:pb-14 overflow-hidden bg-transparent select-none">
      {/* Soft Ambient Background Atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1150px] h-[550px] bg-gradient-to-r from-blue-50/30 via-teal-50/15 to-slate-100/20 blur-3xl rounded-full opacity-50" />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 lg:mb-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-2.5 text-xs sm:text-sm font-semibold tracking-[0.2em] text-[#6366F1] uppercase font-mono">
            <span className="w-5 h-[1.5px] bg-[#6366F1]/60" />
            BUILT FOR EVERY EDUCATOR
            <span className="w-5 h-[1.5px] bg-[#6366F1]/60" />
          </div>

          {/* Main Heading */}
          <h2 className="flex flex-col items-center justify-center text-center my-2.5 font-serif tracking-tight leading-snug">
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-serif font-medium text-slate-900 tracking-tight">
              A professional platform,
            </span>
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-[34px] font-serif italic font-normal text-[#1E1B4B]/90 mt-1 tracking-tight">
              whoever you are
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-[17.5px] text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto mt-2">
            Arcade powers educational creators with standard-setting publishing
            tools, sandboxes, and analytics.
          </p>
        </div>

        {/* ─── HANGING ARCADE CORE LANYARD PHYSICS ─── */}
        <SixCategoryGallery />
      </div>
    </section>
  );
}
