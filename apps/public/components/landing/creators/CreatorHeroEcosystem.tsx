"use client";

import React from "react";

export default function CreatorHeroEcosystem() {
  return (
    <div className="relative w-full max-w-[580px] mx-auto select-none mt-6 lg:mt-0">

      {/* 3D Isometric Triskelion SVG Graphic */}
      <svg viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.06)]">

        {/* Soft layout guideline circles & backdrop */}
        <circle cx="280" cy="270" r="160" stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="6 6" />
        <circle cx="280" cy="270" r="90" stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="6 6" />

        {/* 1. TOP BLOCK (Milestone 03 - Pink Theme) */}
        <g className="hover:opacity-95 transition-opacity duration-300 cursor-pointer">
          {/* Top Face */}
          <polygon points="220,150 278,120 336,150 278,180" fill="#F472B6" />
          {/* Front-Left Face */}
          <polygon points="220,150 278,180 278,280 220,250" fill="#EC4899" />
          {/* Front-Right Face */}
          <polygon points="278,180 336,150 336,250 278,280" fill="#BE185D" />
        </g>

        {/* 2. RIGHT BLOCK (Milestone 02 - Purple Theme) */}
        <g className="hover:opacity-95 transition-opacity duration-300 cursor-pointer">
          {/* Top Face */}
          <polygon points="278,310 336,280 416,320 358,350" fill="#C084FC" />
          {/* Front-Left Face */}
          <polygon points="278,310 358,350 358,390 278,350" fill="#8B5CF6" />
          {/* Front-Right Face */}
          <polygon points="358,350 416,320 416,360 358,390" fill="#6D28D9" />
        </g>

        {/* 3. LEFT BLOCK (Milestone 01 - Blue Theme) */}
        <g className="hover:opacity-95 transition-opacity duration-300 cursor-pointer">
          {/* Top Face */}
          <polygon points="140,320 220,280 278,310 198,350" fill="#93C5FD" />
          {/* Front-Left Face */}
          <polygon points="140,320 198,350 198,390 140,360" fill="#3B82F6" />
          {/* Front-Right Face */}
          <polygon points="198,350 278,310 278,350 198,390" fill="#1D4ED8" />
        </g>

        {/* Person silhouette walking on bottom-left block */}
        {/* Long Slanted Shadow */}
        <polygon points="186,324 230,332 235,334 188,326" fill="rgba(0,0,0,0.15)" />
        {/* Silhouette Stick Figure */}
        <g transform="translate(178, 290) scale(0.6)">
          <circle cx="10" cy="8" r="3.2" fill="#111827" />
          <path d="M 10,11 L 10,24 L 7,34 M 10,24 L 13,34 M 10,14 L 4.5,20 M 10,14 L 14.5,19" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* CALLOUT VECTOR LEADS */}
        {/* Lead 01 (Left) */}
        <path d="M 170,335 L 75,335 L 75,250" fill="none" stroke="#E2E8F0" strokeWidth="1.5" />
        <circle cx="170" cy="335" r="3.5" fill="#3B82F6" />

        {/* Lead 02 (Right) */}
        <path d="M 380,335 L 485,335 L 485,270" fill="none" stroke="#E2E8F0" strokeWidth="1.5" />
        <circle cx="380" cy="335" r="3.5" fill="#8B5CF6" />

        {/* Lead 03 (Top) */}
        <path d="M 300,180 L 515,180 L 515,120" fill="none" stroke="#E2E8F0" strokeWidth="1.5" />
        <circle cx="300" cy="180" r="3.5" fill="#EC4899" />

      </svg>

      {/* Bespoke Overlay Labels (Desktop only, hidden on mobile for clean fit) */}

      {/* Callout 01 (Left) */}
      <div className="absolute left-[-20px] top-[140px] w-[170px] space-y-1 text-left hidden sm:block">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-black text-[#3B82F6] leading-none">01</span>
          <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Video Modules</span>
        </div>
        <p className="text-[10.5px] text-slate-500 leading-relaxed">
          Alice Johnson drafts scripts, synchronizes audio, and uploads translations.
        </p>
      </div>

      {/* Callout 02 (Right) */}
      <div className="absolute right-[-20px] top-[180px] w-[170px] space-y-1 text-left hidden sm:block">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-black text-[#8B5CF6] leading-none">02</span>
          <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Coding Labs</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Robert Davis configures shell environments and writes unit verification tests.
        </p>
      </div>

      {/* Callout 03 (Top-Right) */}
      <div className="absolute right-[-40px] top-[30px] w-[170px] space-y-1 text-left hidden sm:block">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-black text-[#EC4899] leading-none">03</span>
          <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Syllabus Quizzes</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Clara Smith configures pass thresholds and locks competency credentials.
        </p>
      </div>

    </div>
  );
}
