"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

export default function CreatorPublishingInfographic() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.4 });
  const [activeTab, setActiveTab] = useState<"solo" | "enterprise">("solo");
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-cycling storytelling effect: switches model every 4s when visible & not paused
  useEffect(() => {
    if (!isInView || isPaused) return;

    const timer = setInterval(() => {
      setActiveTab((prev) => (prev === "solo" ? "enterprise" : "solo"));
    }, 4000);

    return () => clearInterval(timer);
  }, [isInView, isPaused]);

  // Handle manual click: switch tab & pause auto-cycling for 8s
  const handleTabChange = (newTab: "solo" | "enterprise") => {
    if (activeTab === newTab) return;
    setActiveTab(newTab);

    setIsPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 8000);
  };

  // Step Data for Solo Creator (Icon-free, clean typography)
  const soloSteps = [
    {
      num: "01",
      title: "Personal Brand",
      desc: "Publish and verify courses under your own name to build industry authority.",
      hoverTitle: "group-hover:text-[#7A5AF8]",
      nodeBorder: "border-[#CDB8FF]",
      nodeShadow: "shadow-[0_4px_16px_rgba(205,184,255,0.35)]",
      badgeBg: "bg-[#F9F5FF]",
      badgeText: "text-[#7A5AF8]"
    },
    {
      num: "02",
      title: "Creative Control",
      desc: "Structure lessons, customize layouts, and configure browser terminals your way.",
      hoverTitle: "group-hover:text-[#E8368F]",
      nodeBorder: "border-[#FFC8D8]",
      nodeShadow: "shadow-[0_4px_16px_rgba(255,200,216,0.35)]",
      badgeBg: "bg-[#FFF0F4]",
      badgeText: "text-[#E8368F]"
    },
    {
      num: "03",
      title: "Set Your Own Pricing",
      desc: "Configure pricing tiers, promotions, and receive direct Stripe payouts.",
      hoverTitle: "group-hover:text-[#0D9488]",
      nodeBorder: "border-[#BFF3E3]",
      nodeShadow: "shadow-[0_4px_16px_rgba(191,243,227,0.35)]",
      badgeBg: "bg-[#F0FDF8]",
      badgeText: "text-[#0D9488]"
    }
  ];

  // Step Data for Enterprise (Icon-free, clean typography)
  const enterpriseSteps = [
    {
      num: "01",
      title: "Brand Identity",
      desc: "Brand certificates and syllabi with your corporate logo and color systems.",
      hoverTitle: "group-hover:text-[#7A5AF8]",
      nodeBorder: "border-[#CDB8FF]",
      nodeShadow: "shadow-[0_4px_16px_rgba(205,184,255,0.35)]",
      badgeBg: "bg-[#F9F5FF]",
      badgeText: "text-[#7A5AF8]"
    },
    {
      num: "02",
      title: "Shared Authors",
      desc: "Invite teammates, manage writer permissions, and review draft edits collaboratively.",
      hoverTitle: "group-hover:text-[#E8368F]",
      nodeBorder: "border-[#FFC8D8]",
      nodeShadow: "shadow-[0_4px_16px_rgba(255,200,216,0.35)]",
      badgeBg: "bg-[#FFF0F4]",
      badgeText: "text-[#E8368F]"
    },
    {
      num: "03",
      title: "Custom Domains",
      desc: "Host your custom workspace cockpit under a unique corporate subdomain.",
      hoverTitle: "group-hover:text-[#0D9488]",
      nodeBorder: "border-[#BFF3E3]",
      nodeShadow: "shadow-[0_4px_16px_rgba(191,243,227,0.35)]",
      badgeBg: "bg-[#F0FDF8]",
      badgeText: "text-[#0D9488]"
    }
  ];

  const currentSteps = activeTab === "solo" ? soloSteps : enterpriseSteps;

  return (
    <section
      ref={sectionRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="pubtab-infographic-sec pt-16 md:pt-20 pb-8 md:pb-12 -mt-8 lg:-mt-12 px-6 md:px-12 max-w-[1480px] mx-auto overflow-visible relative z-10"
      id="publish-infographic"
    >

      {/* Header (Section title) */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <span className="text-xs font-bold tracking-widest text-[#7A5AF8] uppercase flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7A5AF8] animate-pulse" />
          Infographic Pathway
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight">
          Publishing Process Outline
        </h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Watch the automated pathway showcase or toggle to inspect the step-by-step progress checklist for either model.
        </p>
      </div>

      {/* Main Infographic Wheel & Track container (1140px width, 490px height) */}
      <div className="hidden lg:block relative w-[1140px] h-[490px] mx-auto select-none mt-5">

        {/* SVG Branch Connector Paths with Sequential Light Pulse Animation */}
        <svg viewBox="0 0 1140 490" className="absolute left-0 top-0 w-full h-[490px] pointer-events-none z-0">
          <defs>
            <linearGradient id="line-gradient-1" x1="0%" y1="50%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFC8D8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7A5AF8" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="line-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFC8D8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#E8368F" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="line-gradient-3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFC8D8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0D9488" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Dotted Branch 01 Base & Sequential Light Traveler (Hub -> Point 01 X=575, Y=68) */}
          <path
            d="M 415,245 Q 490,105 575,68"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="2.2"
            strokeDasharray="5.5 5.5"
          />
          <motion.path
            key={activeTab + "-branch1"}
            d="M 415,245 Q 490,105 575,68"
            fill="none"
            stroke="url(#line-gradient-1)"
            strokeWidth="3.2"
            strokeDasharray="5.5 5.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0.3, 1, 0.75] }}
            transition={{ duration: 0.5, delay: 0.0, ease: "easeInOut" }}
          />

          {/* Dotted Branch 02 Base & Sequential Light Traveler (Hub -> Point 02 X=555, Y=245) */}
          <path
            d="M 415,245 L 555,245"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="2.2"
            strokeDasharray="5.5 5.5"
          />
          <motion.path
            key={activeTab + "-branch2"}
            d="M 415,245 L 555,245"
            fill="none"
            stroke="url(#line-gradient-2)"
            strokeWidth="3.2"
            strokeDasharray="5.5 5.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0.3, 1, 0.75] }}
            transition={{ duration: 0.5, delay: 0.12, ease: "easeInOut" }}
          />

          {/* Dotted Branch 03 Base & Sequential Light Traveler (Hub -> Point 03 X=575, Y=422) */}
          <path
            d="M 415,245 Q 490,385 575,422"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="2.2"
            strokeDasharray="5.5 5.5"
          />
          <motion.path
            key={activeTab + "-branch3"}
            d="M 415,245 Q 490,385 575,422"
            fill="none"
            stroke="url(#line-gradient-3)"
            strokeWidth="3.2"
            strokeDasharray="5.5 5.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0.3, 1, 0.75] }}
            transition={{ duration: 0.5, delay: 0.24, ease: "easeInOut" }}
          />

          {/* Connector Branch Endpoint Dots */}
          <motion.circle
            key={activeTab + "-dot1"}
            cx="575"
            cy="68"
            r="5"
            className="fill-[#7A5AF8]"
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 0.35, delay: 0.0 }}
          />
          <motion.circle
            key={activeTab + "-dot2"}
            cx="555"
            cy="245"
            r="5"
            className="fill-[#E8368F]"
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 0.35, delay: 0.12 }}
          />
          <motion.circle
            key={activeTab + "-dot3"}
            cx="575"
            cy="422"
            r="5"
            className="fill-[#0D9488]"
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 0.35, delay: 0.24 }}
          />
        </svg>

        {/* 1. Left Circular Control Hub (400px x 400px) */}
        <motion.div
          key={activeTab + "-wheel"}
          initial={{ scale: 1 }}
          animate={{
            y: [0, -3.5, 0],
          }}
          transition={{
            y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute left-[15px] top-[45px] w-[400px] h-[400px] rounded-full bg-white border border-slate-200/80 shadow-md p-10 flex flex-col items-center justify-center text-center z-10"
        >
          {/* Curved Soft Pastel Banner at top of circle */}
          <motion.div
            animate={{ rotate: activeTab === "solo" ? 0 : 14 }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 w-[355px] h-[178px] rounded-t-full pointer-events-none origin-bottom"
            style={{
              paddingTop: "9px",
              background: "linear-gradient(90deg, #CDB8FF 0%, #FFC8D8 50%, #BFF3E3 100%)",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              filter: "drop-shadow(0 5px 14px rgba(205, 184, 255, 0.35))"
            }}
          />

          {/* Model Selector Header */}
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2 mt-4">Choose Model</span>
          
          <AnimatePresence mode="wait">
            <motion.h3
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="font-serif text-2xl sm:text-[1.95rem] text-slate-800 tracking-tight mb-5"
            >
              {activeTab === "solo" ? "Solo Creator" : "Enterprise Hub"}
            </motion.h3>
          </AnimatePresence>

          {/* Animated Segmented Control Switch */}
          <div className="relative flex gap-1.5 p-1 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-[13px] font-bold text-slate-500 select-none">
            <button
              onClick={() => handleTabChange("solo")}
              className="relative px-4 py-2 rounded-lg z-10 transition-colors duration-300 cursor-pointer"
            >
              {activeTab === "solo" && (
                <motion.div
                  layoutId="activeModelPillDesktop"
                  transition={{ type: "spring", stiffness: 310, damping: 24 }}
                  className="absolute inset-0 bg-gradient-to-r from-[#7A5AF8] to-[#9E77ED] rounded-lg shadow-[0_3px_16px_rgba(122,90,248,0.4)] z-0"
                />
              )}
              <span className={`relative z-10 transition-colors duration-300 ${activeTab === "solo" ? "text-white font-extrabold" : "text-slate-500 hover:text-slate-800"}`}>
                Independent
              </span>
            </button>
            <button
              onClick={() => handleTabChange("enterprise")}
              className="relative px-4 py-2 rounded-lg z-10 transition-colors duration-300 cursor-pointer"
            >
              {activeTab === "enterprise" && (
                <motion.div
                  layoutId="activeModelPillDesktop"
                  transition={{ type: "spring", stiffness: 310, damping: 24 }}
                  className="absolute inset-0 bg-gradient-to-r from-[#7A5AF8] to-[#9E77ED] rounded-lg shadow-[0_3px_16px_rgba(122,90,248,0.4)] z-0"
                />
              )}
              <span className={`relative z-10 transition-colors duration-300 ${activeTab === "enterprise" ? "text-white font-extrabold" : "text-slate-500 hover:text-slate-800"}`}>
                Organization
              </span>
            </button>
          </div>
        </motion.div>

        {/* 2. Right Side: Organic Independent Feature Branches */}
        <div className="absolute left-[550px] top-0 w-[560px] h-[490px] select-none z-10">

          {/* FEATURE POINT 01 (Top) */}
          <div className="absolute top-[48px] left-[20px] w-[530px] z-10">
            <div className="relative flex items-start gap-5 group cursor-pointer py-1">
              {/* Badge 01 */}
              <motion.div
                key={activeTab + "-badge1"}
                animate={{
                  y: [0, -3.5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                }}
                className={`w-10 h-10 rounded-full border-2 ${currentSteps[0].nodeBorder} ${currentSteps[0].badgeBg} ${currentSteps[0].badgeText} flex items-center justify-center font-black text-xs flex-shrink-0 ${currentSteps[0].nodeShadow} z-10`}
              >
                01
              </motion.div>
              {/* Content 01 */}
              <div className="space-y-1 flex-1 pt-0.5">
                <AnimatePresence mode="wait">
                  <motion.h3
                    key={activeTab + "-title1"}
                    initial={{ opacity: 0, y: 7 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -7 }}
                    transition={{ duration: 0.26, ease: "easeOut" }}
                    className={`text-lg sm:text-xl font-bold text-slate-800 ${currentSteps[0].hoverTitle} transition-colors duration-300 leading-snug`}
                  >
                    {currentSteps[0].title}
                  </motion.h3>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeTab + "-desc1"}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.26, delay: 0.09, ease: "easeOut" }}
                    className="text-xs sm:text-[13.5px] text-slate-500 group-hover:text-slate-600 leading-relaxed transition-colors duration-300 max-w-lg"
                  >
                    {currentSteps[0].desc}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* FEATURE POINT 02 (Middle) */}
          <div className="absolute top-[225px] left-[0px] w-[550px] z-10">
            <div className="relative flex items-start gap-5 group cursor-pointer py-1">
              {/* Badge 02 */}
              <motion.div
                key={activeTab + "-badge2"}
                animate={{
                  y: [0, 3.5, 0],
                  boxShadow: [
                    "0 3px 14px rgba(255,200,216,0.3)",
                    "0 0 20px rgba(232,54,143,0.45)",
                    "0 3px 14px rgba(255,200,216,0.3)"
                  ]
                }}
                transition={{
                  y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                  boxShadow: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
                }}
                className={`w-10 h-10 rounded-full border-2 ${currentSteps[1].nodeBorder} ${currentSteps[1].badgeBg} ${currentSteps[1].badgeText} flex items-center justify-center font-black text-xs flex-shrink-0 z-10`}
              >
                02
              </motion.div>
              {/* Content 02 */}
              <div className="space-y-1 flex-1 pt-0.5">
                <AnimatePresence mode="wait">
                  <motion.h3
                    key={activeTab + "-title2"}
                    initial={{ opacity: 0, y: 7 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -7 }}
                    transition={{ duration: 0.26, delay: 0.10, ease: "easeOut" }}
                    className={`text-lg sm:text-xl font-bold text-slate-800 ${currentSteps[1].hoverTitle} transition-colors duration-300 leading-snug`}
                  >
                    {currentSteps[1].title}
                  </motion.h3>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeTab + "-desc2"}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.26, delay: 0.18, ease: "easeOut" }}
                    className="text-xs sm:text-[13.5px] text-slate-500 group-hover:text-slate-600 leading-relaxed transition-colors duration-300 max-w-lg"
                  >
                    {currentSteps[1].desc}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* FEATURE POINT 03 (Bottom) */}
          <div className="absolute top-[402px] left-[20px] w-[530px] z-10">
            <div className="relative flex items-start gap-5 group cursor-pointer py-1">
              {/* Badge 03 */}
              <motion.div
                key={activeTab + "-badge3"}
                animate={{
                  scale: [1, 1.04, 1],
                  boxShadow: [
                    "0 3px 14px rgba(191,243,227,0.3)",
                    "0 0 18px rgba(13,148,136,0.4)",
                    "0 3px 14px rgba(191,243,227,0.3)"
                  ]
                }}
                transition={{
                  scale: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
                  boxShadow: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
                }}
                className={`w-10 h-10 rounded-full border-2 ${currentSteps[2].nodeBorder} ${currentSteps[2].badgeBg} ${currentSteps[2].badgeText} flex items-center justify-center font-black text-xs flex-shrink-0 z-10`}
              >
                03
              </motion.div>
              {/* Content 03 */}
              <div className="space-y-1 flex-1 pt-0.5">
                <AnimatePresence mode="wait">
                  <motion.h3
                    key={activeTab + "-title3"}
                    initial={{ opacity: 0, y: 7 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -7 }}
                    transition={{ duration: 0.26, delay: 0.20, ease: "easeOut" }}
                    className={`text-lg sm:text-xl font-bold text-slate-800 ${currentSteps[2].hoverTitle} transition-colors duration-300 leading-snug`}
                  >
                    {currentSteps[2].title}
                  </motion.h3>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeTab + "-desc3"}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.26, delay: 0.28, ease: "easeOut" }}
                    className="text-xs sm:text-[13.5px] text-slate-500 group-hover:text-slate-600 leading-relaxed transition-colors duration-300 max-w-lg"
                  >
                    {currentSteps[2].desc}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================== */}
      {/* MOBILE/TABLET VIEW: Organic Independent Nodes */}
      {/* ========================================== */}
      <div className="block lg:hidden max-w-[480px] mx-auto space-y-6 text-left mt-8">

        {/* Selector Header */}
        <div className="relative flex p-1 bg-slate-50 border border-slate-200 rounded-2xl gap-1.5 text-xs font-bold text-slate-500 select-none">
          <button
            onClick={() => handleTabChange("solo")}
            className="relative flex-1 text-center py-2.5 rounded-xl z-10 transition-colors duration-300 cursor-pointer"
          >
            {activeTab === "solo" && (
              <motion.div
                layoutId="activeModelPillMobile"
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="absolute inset-0 bg-gradient-to-r from-[#7A5AF8] to-[#9E77ED] rounded-xl shadow-[0_4px_16px_rgba(122,90,248,0.3)] z-0"
              />
            )}
            <span className={`relative z-10 transition-colors duration-300 ${activeTab === "solo" ? "text-white font-extrabold" : "text-slate-500 hover:text-slate-800"}`}>
              Independent Creator
            </span>
          </button>
          <button
            onClick={() => handleTabChange("enterprise")}
            className="relative flex-1 text-center py-2.5 rounded-xl z-10 transition-colors duration-300 cursor-pointer"
          >
            {activeTab === "enterprise" && (
              <motion.div
                layoutId="activeModelPillMobile"
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="absolute inset-0 bg-gradient-to-r from-[#7A5AF8] to-[#9E77ED] rounded-xl shadow-[0_4px_16px_rgba(122,90,248,0.3)] z-0"
              />
            )}
            <span className={`relative z-10 transition-colors duration-300 ${activeTab === "enterprise" ? "text-white font-extrabold" : "text-slate-500 hover:text-slate-800"}`}>
              Organization
            </span>
          </button>
        </div>

        {/* Mobile Organic Timeline Stack */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} className="space-y-6 relative">
            {currentSteps.map((step, idx) => {
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.32, delay: idx * 0.12 }}
                  className="relative flex items-start gap-4 z-10 group cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-full border-2 ${step.nodeBorder} ${step.badgeBg} ${step.badgeText} flex items-center justify-center flex-shrink-0 font-black text-xs ${step.nodeShadow}`}>
                    {step.num}
                  </div>
                  <div className="space-y-1 flex-1 pt-0.5">
                    <h4 className={`text-base font-bold text-slate-800 ${step.hoverTitle} transition-colors duration-300 leading-snug`}>{step.title}</h4>
                    <p className="text-xs text-slate-550 group-hover:text-slate-600 leading-relaxed transition-colors duration-300">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

    </section>
  );
}
