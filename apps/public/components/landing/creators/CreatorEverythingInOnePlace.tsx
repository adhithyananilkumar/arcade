"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Wrench, Users, ClipboardCheck, Send, BarChart3, ArrowRight
} from "lucide-react";
import VariableProximity from "@/apps/public/components/landing/VariableProximity";
import Link from "next/link";
import { useAuthStore } from '@/infrastructure/auth/auth.store';

export default function CreatorEverythingInOnePlace() {
  const section2HeaderRef = useRef<HTMLDivElement>(null);
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const [animKey, setAnimKey] = useState(0);
  const { status } = useAuthStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimKey((prev) => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimKey((prev) => prev + 1);
          if (timelineScrollRef.current) {
            timelineScrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
          }
        }
      },
      { threshold: 0.15 }
    );
    if (timelineScrollRef.current) {
      observer.observe(timelineScrollRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const workflowSteps = [
    { step: '01', title: 'Draft & Build', desc: 'Construct lessons and upload high-fidelity media.', color: '#2451D6', left: '15%', nodeTop: '280px', cardTop: '95px', isLow: true, icon: Wrench },
    { step: '02', title: 'Collaborate', desc: 'Invite peers to co-author and refine learning goals.', color: '#10B981', left: '32.5%', nodeTop: '60px', cardTop: '255px', isLow: false, icon: Users },
    { step: '03', title: 'Assess', desc: 'Embed rich coding sandboxes and final quizzes.', color: '#6366F1', left: '50%', nodeTop: '240px', cardTop: '80px', isLow: true, icon: ClipboardCheck },
    { step: '04', title: 'Publish', desc: 'Go live instantly on the Arcade global catalog.', color: '#14B8A6', left: '67.5%', nodeTop: '110px', cardTop: '275px', isLow: false, icon: Send },
    { step: '05', title: 'Analyze', desc: 'Review insights and optimize student engagement.', color: '#F59E0B', left: '85%', nodeTop: '290px', cardTop: '100px', isLow: true, icon: BarChart3 },
  ];

  return (
    <section className="max-w-[1200px] mx-auto w-full px-6 md:px-12 pt-0 pb-16 space-y-10 relative z-10">

      {/* Section Header */}
      <div ref={section2HeaderRef} className="text-center space-y-4 max-w-xl mx-auto" style={{ position: 'relative' }}>
        <h2 className="text-4xl sm:text-5xl text-slate-900 tracking-tight leading-none">
          <VariableProximity
            label="Everything in One Place"
            fromFontVariationSettings="'wght' 300, 'opsz' 20"
            toFontVariationSettings="'wght' 900, 'opsz' 80"
            containerRef={section2HeaderRef}
            radius={200}
            falloff="linear"
            className="variable-proximity-serif text-slate-900 font-black"
          />
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 leading-relaxed">
          Manage your entire educational workflow from a single dashboard.
        </p>
      </div>

      {/* Workflow Wave Timeline */}
      <div ref={timelineScrollRef} className="w-screen relative left-1/2 right-1/2 -translate-x-1/2 overflow-x-auto pb-12 scrollbar-hide select-none my-8">
        <div key={animKey} className="relative min-w-[1200px] h-[360px] w-full">

          {/* Background blobs */}
          <div className="pointer-events-none absolute -top-12 left-1/4 w-72 h-72 rounded-full opacity-10 bg-indigo-300 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 w-72 h-72 rounded-full opacity-10 bg-emerald-300 blur-3xl" />

          {/* SVG Wave Line */}
          <svg
            viewBox="0 0 1200 360"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
          >
            <defs>
              <linearGradient id="wave-pulse-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2451D6" stopOpacity="0" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Glow shadow */}
            <path
              d="M 0,180 C 80,180 120,280 180,280 C 240,280 330,60 390,60 C 450,60 540,240 600,240 C 660,240 750,110 810,110 C 870,110 960,290 1020,290 C 1080,290 1120,190 1200,190"
              stroke="rgba(36, 81, 214, 0.08)"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />
            {/* Primary wave */}
            <path
              d="M 0,180 C 80,180 120,280 180,280 C 240,280 330,60 390,60 C 450,60 540,240 600,240 C 660,240 750,110 810,110 C 870,110 960,290 1020,290 C 1080,290 1120,190 1200,190"
              stroke="#2451D6"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              className="animated-wave-line"
            />
            {/* Travelling pulse */}
            <path
              d="M 0,180 C 80,180 120,280 180,280 C 240,280 330,60 390,60 C 450,60 540,240 600,240 C 660,240 750,110 810,110 C 870,110 960,290 1020,290 C 1080,290 1120,190 1200,190"
              stroke="url(#wave-pulse-grad)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              className="wave-glow-pulse"
            />
          </svg>

          {/* Step nodes */}
          {workflowSteps.map((node, idx) => {
            const Icon = node.icon;
            const nodeDelay = `${0.4 + idx * 0.35}s`;
            const cardDelay = `${0.6 + idx * 0.35}s`;

            return (
              <div key={idx}>
                {/* Pulsing ring */}
                <div
                  className="hexagon-pulse-ring"
                  style={{ left: node.left, top: node.nodeTop, animationDelay: nodeDelay }}
                />

                {/* Hexagonal Node */}
                <div
                  className="absolute z-20 animate-scale-in-hexagon"
                  style={{
                    left: node.left,
                    top: node.nodeTop,
                    transform: 'translate(-50%, -50%)',
                    animationDelay: nodeDelay,
                  }}
                >
                  <div style={{ filter: 'drop-shadow(0 6px 16px rgba(36, 81, 214, 0.12))' }}>
                    <div
                      className="flex items-center justify-center w-14 h-14 bg-white border border-slate-100 transition-all duration-500 hover:scale-110 hover:bg-[#2451D6] hover:border-[#2451D6] hover:shadow-[0_0_20px_rgba(36,81,214,0.3)] group/hex"
                      style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
                    >
                      <Icon className="w-5 h-5 text-[#2451D6] transition-colors duration-300 group-hover/hex:text-white" />
                    </div>
                  </div>
                </div>

                {/* Text Card */}
                <div
                  className="absolute z-10 w-64 text-center animate-fade-in-up-card group/card"
                  style={{
                    left: node.left,
                    top: node.cardTop,
                    transform: 'translate(-50%, -50%)',
                    animationDelay: cardDelay,
                  }}
                >
                  {/* Watermark Number */}
                  <span
                    className="absolute text-[110px] font-black text-slate-100/70 select-none z-0 pointer-events-none leading-none -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 transition-all duration-500 ease-out group-hover/card:scale-110 group-hover/card:-translate-y-[60%] group-hover/card:text-blue-500/10"
                    style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                  >
                    {idx + 1}
                  </span>
                  {/* Content */}
                  <div className="relative z-10 p-2 transition-all duration-300 group-hover/card:-translate-y-1">
                    <h4 className="text-[17px] sm:text-[18px] font-black text-slate-800 mb-1.5 transition-colors duration-300 group-hover/card:text-[#2451D6]">
                      {node.title}
                    </h4>
                    <p className="text-[13px] sm:text-[14px] font-semibold text-slate-500 leading-normal">
                      {node.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
