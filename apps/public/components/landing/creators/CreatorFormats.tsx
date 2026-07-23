"use client";

import React from "react";
import { BookOpen, Terminal, Play, Layers } from "lucide-react";
import { motion } from "framer-motion";

export default function CreatorFormats() {
  const steps = [
    {
      step: "01",
      title: "Course",
      desc: "Structured paths with video lessons, reading modules, and exams.",
      badge: "Step-by-step skills",
      icon: BookOpen,
      color: "#7A5AF8",
      lightBg: "#F5F6FE",
      ringColor: "#7A5AF8",
      glowColor: "rgba(122, 90, 248, 0.12)",
    },
    {
      step: "02",
      title: "Workshop",
      desc: "Focused interactive sandbox sessions built around practical outcomes.",
      badge: "One skill, fast",
      icon: Terminal,
      color: "#2451D6",
      lightBg: "#EFF6FF",
      ringColor: "#2451D6",
      glowColor: "rgba(36, 81, 214, 0.12)",
    },
    {
      step: "03",
      title: "Webinar",
      desc: "Live stream classes and broadcast recordings to massive student groups.",
      badge: "Broadcasting at scale",
      icon: Play,
      color: "#20B8CF",
      lightBg: "#E3F9F5",
      ringColor: "#20B8CF",
      glowColor: "rgba(32, 184, 207, 0.12)",
    },
    {
      step: "04",
      title: "Article",
      desc: "Self-paced written documentation guides and research reference logs.",
      badge: "Reference manuals",
      icon: Layers,
      color: "#F5A623",
      lightBg: "#FEF3C7",
      ringColor: "#F5A623",
      glowColor: "rgba(245, 166, 35, 0.12)",
    },
  ];

  return (
    <section className="format-sec py-16 lg:py-24 relative overflow-hidden bg-transparent" id="formats">
      <div className="wrap max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section Header */}
        <div className="sec-head text-center max-w-2xl mx-auto mb-14 space-y-3">
          {/* Color Dot Palette Bar */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-[#7A5AF8] shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-[#2451D6] shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-[#20B8CF] shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-[#F5A623] shadow-xs" />
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-[#7A5AF8] tracking-[0.2em] uppercase font-mono">
            <span className="w-5 h-[2px] bg-[#7A5AF8] rounded-full inline-block" />
            <span>FORMATS & MONETIZATION</span>
            <span className="w-5 h-[2px] bg-[#7A5AF8] rounded-full inline-block" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1C1C2E] tracking-tight font-serif">
            Flexible layouts, straightforward pricing
          </h2>

          <p className="text-sm sm:text-base text-zinc-500 font-medium max-w-xl mx-auto">
            Pick the media structure that fits what you teach, and select your enrollment tier.
          </p>
        </div>

        {/* 4 Connected Refined Circular Nodes (Horizontal Flow - Re-triggers on scroll sequentially) */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center relative z-10 mb-20"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.25,
                delayChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          {steps.map((item, idx) => {
            const Icon = item.icon;
            const isLast = idx === steps.length - 1;

            return (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, scale: 0.7, y: 35 },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 95,
                      damping: 14,
                    },
                  },
                }}
                className="relative flex flex-col items-center group w-full max-w-[240px]"
              >
                {/* Connector Arrow Pointer to next circle (Visible on desktop) */}
                {!isLast && (
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, scale: 0.5, x: -5 },
                      visible: { 
                        opacity: 1, 
                        scale: 1, 
                        x: 0,
                        transition: { duration: 0.3, delay: 0.15 } 
                      }
                    }}
                    className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-30 items-center justify-center pointer-events-none"
                  >
                    <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
                      <path
                        d="M 2 2 L 15 11 L 2 20 Z"
                        fill={item.ringColor}
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                )}

                {/* Outer Refined Circular Ring Container */}
                <div
                  className="w-[210px] h-[210px] sm:w-[220px] sm:h-[220px] rounded-full p-2.5 relative flex items-center justify-center text-center shadow-md transition-all duration-400 group-hover:scale-105 group-hover:shadow-xl"
                  style={{
                    border: `2.5px solid ${item.ringColor}`,
                    boxShadow: `0 8px 25px ${item.glowColor}`,
                    background: `linear-gradient(135deg, ${item.lightBg} 0%, #ffffff 100%)`,
                  }}
                >
                  {/* Inner Circular Card Body */}
                  <div className="bg-white/95 backdrop-blur-md rounded-full w-full h-full p-4 flex flex-col items-center justify-center text-center border border-white/80 shadow-inner">

                    {/* Icon Container */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white mb-2 shadow-sm transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
                      style={{ background: item.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Step Title */}
                    <h3
                      className="text-sm font-extrabold text-slate-900 leading-tight mb-1"
                      style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                    >
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[10.5px] text-slate-500 leading-snug font-medium max-w-[155px] mb-2">
                      {item.desc}
                    </p>

                    {/* Category Pill Tag */}
                    <span
                      className="text-[8.5px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
                      style={{
                        background: item.lightBg,
                        color: item.color,
                        borderColor: `${item.color}30`,
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>


        {/* PRICING BLOCK HEADER */}
        <div className="sec-head text-center max-w-2xl mx-auto mb-10 space-y-3 pt-4">
          <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-[#7A5AF8] tracking-[0.2em] uppercase font-mono">
            <span className="w-5 h-[2px] bg-[#7A5AF8] rounded-full inline-block" />
            <span>SET YOUR OWN TERMS</span>
            <span className="w-5 h-[2px] bg-[#7A5AF8] rounded-full inline-block" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1C1C2E] tracking-tight font-serif">
            Free or paid — you decide, course by course
          </h2>

          <p className="text-sm sm:text-base text-zinc-500 font-medium max-w-xl mx-auto">
            Both paths get the same review process and the same certificate.
          </p>
        </div>

        {/* Hexagonal Flow Pricing Cards Grid */}
        <div className="pricing-grid max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative items-center">
          
          {/* Central Connecting Flow Arrow for Desktop */}
          <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
              <motion.path
                d="M 5 20 L 42 20 L 50 20"
                stroke="#7A5AF8"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              <path
                d="M 42 13 L 52 20 L 42 27"
                stroke="#7A5AF8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* CARD 1: FREE (Simple Card) */}
          <div className="bg-white border border-indigo-100/90 rounded-2xl sm:rounded-3xl p-8 sm:p-10 flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#7A5AF8]/10 text-[#7A5AF8] border border-[#7A5AF8]/20">
                  01 OPTION — FREE
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#7A5AF8] animate-pulse" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-1">Open to everyone</h3>
              <p className="text-xs text-slate-500 mb-6 font-medium">No pricing setup required.</p>

              <ul className="space-y-3 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#7A5AF8]/15 text-[#7A5AF8] flex items-center justify-center text-[10px] flex-shrink-0 font-black">✓</span>
                  <span>Reach the widest possible audience</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#7A5AF8]/15 text-[#7A5AF8] flex items-center justify-center text-[10px] flex-shrink-0 font-black">✓</span>
                  <span>Great for building a community</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#7A5AF8]/15 text-[#7A5AF8] flex items-center justify-center text-[10px] flex-shrink-0 font-black">✓</span>
                  <span>Still fully reviewed and certified</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CARD 2: PAID (Simple Card) */}
          <div className="bg-white border border-indigo-100/90 rounded-2xl sm:rounded-3xl p-8 sm:p-10 flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#3B2FC9] text-white shadow-xs">
                  02 OPTION — PAID
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B2FC9] animate-pulse" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-1">Set your own price</h3>
              <p className="text-xs text-slate-500 mb-6 font-medium">Keep control of your offering.</p>

              <ul className="space-y-3 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#3B2FC9] text-white flex items-center justify-center text-[10px] flex-shrink-0 font-black">✓</span>
                  <span>Price each course on your own terms</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#3B2FC9] text-white flex items-center justify-center text-[10px] flex-shrink-0 font-black">✓</span>
                  <span>Ideal for professional training</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#3B2FC9] text-white flex items-center justify-center text-[10px] flex-shrink-0 font-black">✓</span>
                  <span>Same quality review, same certificate</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
