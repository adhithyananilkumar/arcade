"use client";

import React, { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Lightbulb, Wrench, Upload, Users, ClipboardCheck, Eye, Send, MessageCircle, BarChart3, TrendingUp
} from "lucide-react";
import VariableProximity from "@/apps/public/components/landing/VariableProximity";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CreatorEverythingInOnePlace() {
  const componentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const section2HeaderRef = useRef<HTMLDivElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [pathLength, setPathLength] = useState(4800);

  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      if (len > 0) {
        setPathLength(len);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const track = trackRef.current;
    const trigger = triggerRef.current;
    if (!track || !trigger) return;

    const ctx = gsap.context(() => {
      const getScrollDistance = () => track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: trigger,
          start: "top top",
          end: () => `+=${getScrollDistance()}`,
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setScrollProgress(self.progress);
          },
        },
      });
    }, componentRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const strokeDashoffset = pathLength * (1 - scrollProgress);

  const workflowSteps = [
    { step: '01', title: 'Plan', desc: 'Define your course structure, learning goals, and target audience.', color: '#3B82F6', left: '300px', nodeTop: '280px', cardTop: '95px', icon: Lightbulb },
    { step: '02', title: 'Draft & Build', desc: 'Construct lessons and organize your educational content.', color: '#6366F1', left: '720px', nodeTop: '60px', cardTop: '255px', icon: Wrench },
    { step: '03', title: 'Create Media', desc: 'Upload videos, documents, images, and other learning resources.', color: '#8B5CF6', left: '1140px', nodeTop: '280px', cardTop: '95px', icon: Upload },
    { step: '04', title: 'Collaborate', desc: 'Invite peers to co-author, review, and refine your content.', color: '#EC4899', left: '1560px', nodeTop: '60px', cardTop: '255px', icon: Users },
    { step: '05', title: 'Assess', desc: 'Add quizzes, coding challenges, and interactive assessments.', color: '#10B981', left: '1980px', nodeTop: '280px', cardTop: '95px', icon: ClipboardCheck },
    { step: '06', title: 'Review', desc: 'Preview your course and ensure everything is accurate and ready.', color: '#14B8A6', left: '2400px', nodeTop: '60px', cardTop: '255px', icon: Eye },
    { step: '07', title: 'Publish', desc: 'Make your course live on the Arcade global catalog.', color: '#06B6D4', left: '2820px', nodeTop: '280px', cardTop: '95px', icon: Send },
    { step: '08', title: 'Engage', desc: 'Interact with learners and support their learning journey.', color: '#F59E0B', left: '3240px', nodeTop: '60px', cardTop: '255px', icon: MessageCircle },
    { step: '09', title: 'Analyze', desc: 'Track learner progress, performance, and course engagement.', color: '#EF4444', left: '3660px', nodeTop: '280px', cardTop: '95px', icon: BarChart3 },
    { step: '10', title: 'Optimize', desc: 'Use insights and feedback to continuously improve your course.', color: '#8B5CF6', left: '4080px', nodeTop: '60px', cardTop: '255px', icon: TrendingUp },
  ];

  const waveD = "M 0,180 C 120,180 180,280 300,280 C 420,280 600,60 720,60 C 840,60 1020,280 1140,280 C 1260,280 1440,60 1560,60 C 1680,60 1860,280 1980,280 C 2100,280 2280,60 2400,60 C 2520,60 2700,280 2820,280 C 2940,280 3120,60 3240,60 C 3360,60 3540,280 3660,280 C 3780,280 3960,60 4080,60 C 4200,60 4380,180 4500,180";

  return (
    <section ref={componentRef} className="relative w-full bg-transparent z-10">
      {/* Pinned Viewport Container */}
      <div
        ref={triggerRef}
        className="h-screen w-full overflow-hidden flex flex-col justify-between py-6 md:py-10 select-none bg-transparent"
      >
        {/* Ambient Background Glows */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-visible flex items-center justify-center">
          <div
            className="w-[1000px] h-[500px] rounded-full opacity-60 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.07) 0%, rgba(16, 185, 129, 0.04) 45%, transparent 70%)",
              filter: "blur(100px)",
            }}
          />
        </div>

        {/* Section Header */}
        <div ref={section2HeaderRef} className="text-center space-y-3 max-w-xl mx-auto px-6 relative z-20 flex-shrink-0 pt-4 md:pt-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-none">
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

        {/* Horizontal Track Viewport */}
        <div className="relative w-full flex-1 flex items-center overflow-hidden my-auto">
          <div
            ref={trackRef}
            className="relative min-w-[4500px] h-[360px] w-[4500px] mx-auto bg-transparent will-change-transform"
          >
            {/* SVG Wave Line */}
            <svg
              viewBox="0 0 4500 360"
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
              {/* 1. Glow shadow along full length */}
              <path
                d={waveD}
                stroke="rgba(36, 81, 214, 0.12)"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
              />
              {/* 2. Base Guide Line across full 4500px track */}
              <path
                d={waveD}
                stroke="rgba(36, 81, 214, 0.22)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              {/* 3. Primary Scroll-Driven Blue Wave Path (Continuous across all 10 stages) */}
              <path
                ref={pathRef}
                d={waveD}
                stroke="#2451D6"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
                style={{
                  strokeDasharray: pathLength,
                  strokeDashoffset: strokeDashoffset,
                  transition: "stroke-dashoffset 0.08s ease-out",
                }}
              />
              {/* 4. Travelling Cyan Pulse & Beam Glow */}
              <path
                d={waveD}
                stroke="url(#wave-pulse-grad)"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
                className="wave-glow-pulse"
                style={{
                  filter: "drop-shadow(0 0 8px #38bdf8)",
                }}
              />
            </svg>

            {/* Step nodes */}
            {workflowSteps.map((node, idx) => {
              const Icon = node.icon;
              const nodeDelay = `${0.2 + idx * 0.15}s`;
              const cardDelay = `${0.35 + idx * 0.15}s`;

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
                    <div style={{ filter: `drop-shadow(0 6px 16px ${node.color}25)` }}>
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
                      {node.step}
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

        {/* Bottom spacing buffer */}
        <div className="h-2 flex-shrink-0" />
      </div>
    </section>
  );
}
