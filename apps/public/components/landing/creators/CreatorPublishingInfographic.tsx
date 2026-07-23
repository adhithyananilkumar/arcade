"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Building2,
  Sliders,
  Users,
  Tag,
  Link2
} from "lucide-react";

export default function CreatorPublishingInfographic() {
  const [activeTab, setActiveTab] = useState<"solo" | "enterprise">("solo");
  const [isAutoCycling, setIsAutoCycling] = useState(true);

  // Auto-cycling effect: switches pathways every 5 seconds
  useEffect(() => {
    if (!isAutoCycling) return;

    const interval = setInterval(() => {
      setActiveTab((prev) => (prev === "solo" ? "enterprise" : "solo"));
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoCycling]);

  // Step Data for Solo Creator
  const soloSteps = [
    {
      num: "01",
      title: "Personal Brand",
      desc: "Publish and verify courses under your own name to build industry authority.",
      icon: User
    },
    {
      num: "02",
      title: "Creative Control",
      desc: "Structure lessons, customize layouts, and configure browser terminals your way.",
      icon: Sliders
    },
    {
      num: "03",
      title: "Set Your Own Pricing",
      desc: "Configure pricing tiers, promotions, and receive direct Stripe payouts.",
      icon: Tag
    }
  ];

  // Step Data for Enterprise
  const enterpriseSteps = [
    {
      num: "01",
      title: "Brand Identity",
      desc: "Brand certificates and syllabi with your corporate logo and color systems.",
      icon: Building2
    },
    {
      num: "02",
      title: "Shared Authors",
      desc: "Invite teammates, manage writer permissions, and review draft edits collaboratively.",
      icon: Users
    },
    {
      num: "03",
      title: "Custom Domains",
      desc: "Host your custom workspace cockpit under a unique corporate subdomain.",
      icon: Link2
    }
  ];

  const currentSteps = activeTab === "solo" ? soloSteps : enterpriseSteps;

  return (
    <section className="pubtab-infographic-sec py-16 px-6 md:px-12 max-w-[1240px] mx-auto overflow-visible relative z-10" id="publish-infographic">

      {/* Header (Section title) */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <span className="text-xs font-bold tracking-widest text-[#4F46E5] uppercase flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse" />
          Infographic Pathway
        </span>
        <h2 className="font-serif text-3xl text-slate-900 tracking-tight">
          Publishing Process Outline
        </h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Toggle the central wheel to inspect the step-by-step progress checklist for either model.
        </p>
      </div>

      {/* Main Infographic Wheel & Track container (960px desktop width) */}
      <div className="hidden lg:block relative w-[960px] h-[550px] mx-auto select-none mt-6">

        {/* SVG Curved Connectors in background */}
        <svg viewBox="0 0 960 220" className="absolute left-0 top-[200px] w-full h-[220px] pointer-events-none z-0">
          <path
            d="M 200,30 Q 480,200 760,30"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="3.5"
          />
        </svg>

        {/* 1. Large Central Circle Wheel at the top */}
        <div className="absolute left-[320px] top-0 w-[320px] h-[320px] rounded-full bg-white border border-slate-200/80 shadow-md p-8 flex flex-col items-center justify-center text-center z-10">

          {/* Curved Amber Banner at the top of the circle */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[290px] h-[145px] border-t-8 border-amber-500/80 rounded-t-full pointer-events-none" />

          {/* Title and Switches */}
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 mt-4">Choose Model</span>
          <h3 className="font-serif text-2xl text-slate-800 tracking-tight mb-4">
            {activeTab === "solo" ? "Solo Creator" : "Enterprise Hub"}
          </h3>

          {/* Toggle Switch Tabs */}
          <div className="flex gap-2 p-1 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-500">
            <button
              onClick={() => {
                setActiveTab("solo");
                setIsAutoCycling(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === "solo" ? "bg-amber-500 text-white shadow-2xs" : "hover:text-slate-800"
                }`}
            >
              Independent
            </button>
            <button
              onClick={() => {
                setActiveTab("enterprise");
                setIsAutoCycling(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === "enterprise" ? "bg-amber-500 text-white shadow-2xs" : "hover:text-slate-800"
                }`}
            >
              Organization
            </button>
          </div>
        </div>

        {/* 2. Step Nodes & Description Drop Lists (Positioned along the smile track) */}

        {/* STEP 1: Left side (y-center approx 230px, x=200px) */}
        <div className="absolute left-[176px] top-[206px] w-[48px] h-[48px] rounded-full bg-white border-[4px] border-amber-500 shadow-md flex items-center justify-center font-black text-slate-800 text-xs z-20">
          01
        </div>
        <div className="absolute left-[199px] top-[256px] w-[1px] h-[60px] bg-slate-200/80 z-10" />
        <div className="absolute left-[90px] top-[326px] w-[220px] text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + "-step1"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <h4 className="text-[13.5px] font-extrabold text-slate-800">{currentSteps[0].title}</h4>
              <p className="text-[11.5px] text-slate-500 leading-relaxed">{currentSteps[0].desc}</p>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mt-2">
                {React.createElement(currentSteps[0].icon, { size: 13 })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* STEP 2: Middle bottom (y-center approx 370px, x=480px) */}
        <div className="absolute left-[456px] top-[346px] w-[48px] h-[48px] rounded-full bg-white border-[4px] border-amber-500 shadow-md flex items-center justify-center font-black text-slate-800 text-xs z-20">
          02
        </div>
        <div className="absolute left-[479px] top-[396px] w-[1px] h-[45px] bg-slate-200/80 z-10" />
        <div className="absolute left-[370px] top-[451px] w-[220px] text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + "-step2"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <h4 className="text-[13.5px] font-extrabold text-slate-800">{currentSteps[1].title}</h4>
              <p className="text-[11.5px] text-slate-500 leading-relaxed">{currentSteps[1].desc}</p>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mt-2">
                {React.createElement(currentSteps[1].icon, { size: 13 })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* STEP 3: Right side (y-center approx 230px, x=760px) */}
        <div className="absolute right-[176px] top-[206px] w-[48px] h-[48px] rounded-full bg-white border-[4px] border-amber-500 shadow-md flex items-center justify-center font-black text-slate-800 text-xs z-20">
          03
        </div>
        <div className="absolute right-[199px] top-[256px] w-[1px] h-[60px] bg-slate-200/80 z-10" />
        <div className="absolute right-[90px] top-[326px] w-[220px] text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + "-step3"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <h4 className="text-[13.5px] font-extrabold text-slate-800">{currentSteps[2].title}</h4>
              <p className="text-[11.5px] text-slate-500 leading-relaxed">{currentSteps[2].desc}</p>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mt-2">
                {React.createElement(currentSteps[2].icon, { size: 13 })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* ========================================== */}
      {/* MOBILE/TABLET VIEW: Simple Staggered Cards */}
      {/* ========================================== */}
      <div className="block lg:hidden max-w-[420px] mx-auto space-y-6 text-left mt-6">

        {/* Selector Header */}
        <div className="p-1 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-1.5 text-xs font-bold text-slate-500">
          <button
            onClick={() => {
              setActiveTab("solo");
              setIsAutoCycling(false);
            }}
            className={`flex-1 text-center py-2 rounded-xl transition-all ${activeTab === "solo" ? "bg-amber-500 text-white shadow-2xs" : "hover:text-slate-800"
              }`}
          >
            Independent Creator
          </button>
          <button
            onClick={() => {
              setActiveTab("enterprise");
              setIsAutoCycling(false);
            }}
            className={`flex-1 text-center py-2 rounded-xl transition-all ${activeTab === "enterprise" ? "bg-amber-500 text-white shadow-2xs" : "hover:text-slate-800"
              }`}
          >
            Organization
          </button>
        </div>

        {/* Mobile Cards Stack */}
        <div className="space-y-4">
          {currentSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white border border-slate-200 rounded-2xl p-4.5 flex items-start gap-3.5 shadow-3xs"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-800 leading-snug">{step.title}</h4>
                  <p className="text-[10.5px] text-slate-550 leading-relaxed mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
