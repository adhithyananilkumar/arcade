"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  Sliders,
  DollarSign,
  Award,
  Users,
  Globe2,
  Building2,
  User,
} from "lucide-react";

interface StepItem {
  num: string;
  title: string;
  desc: string;
  highlight: string;
  icon: React.ElementType;
  cardBg: string;
  borderStyle: string;
  tagColor: string;
  iconColor: string;
  iconBg: string;
  accentBar: string;
}

interface ModelConfig {
  id: "solo" | "enterprise";
  label: string;
  tagline: string;
  badge: string;
  badgeStyle: string;
  bannerBg: string;
  icon: React.ElementType;
  steps: StepItem[];
}

const models: Record<"solo" | "enterprise", ModelConfig> = {
  solo: {
    id: "solo",
    label: "Independent Creator",
    tagline: "Build your personal brand, monetize courses directly, and keep full ownership.",
    badge: "Solo Pathway",
    badgeStyle: "text-blue-700",
    bannerBg: "bg-blue-50/40 border-blue-100/80",
    icon: User,
    steps: [
      {
        num: "01",
        title: "Personal Brand",
        desc: "Publish and verify courses under your own name to build recognized industry authority and student trust.",
        highlight: "Verified Identity",
        icon: UserCheck,
        cardBg: "bg-[#F3F7FF]",
        borderStyle: "border-blue-100/90 hover:border-blue-200",
        tagColor: "text-blue-600",
        iconColor: "text-blue-600",
        iconBg: "bg-white border-blue-200/70",
        accentBar: "bg-blue-500",
      },
      {
        num: "02",
        title: "Creative Control",
        desc: "Structure lessons, customize curriculum layouts, and configure live browser terminals your way.",
        highlight: "Custom Playgrounds",
        icon: Sliders,
        cardBg: "bg-[#F8F4FF]",
        borderStyle: "border-purple-100/90 hover:border-purple-200",
        tagColor: "text-purple-600",
        iconColor: "text-purple-600",
        iconBg: "bg-white border-purple-200/70",
        accentBar: "bg-purple-500",
      },
      {
        num: "03",
        title: "Set Your Own Pricing",
        desc: "Configure pricing tiers, run seasonal promotions, and receive direct Stripe payouts with 0% platform fee.",
        highlight: "0% Platform Fee",
        icon: DollarSign,
        cardBg: "bg-[#F0FDF4]",
        borderStyle: "border-emerald-100/90 hover:border-emerald-200",
        tagColor: "text-emerald-600",
        iconColor: "text-emerald-600",
        iconBg: "bg-white border-emerald-200/70",
        accentBar: "bg-emerald-500",
      },
    ],
  },
  enterprise: {
    id: "enterprise",
    label: "Organization & Teams",
    tagline: "Scale technical education across departments, universities, and corporate institutions.",
    badge: "Enterprise Pathway",
    badgeStyle: "text-sky-700",
    bannerBg: "bg-sky-50/40 border-sky-100/80",
    icon: Building2,
    steps: [
      {
        num: "01",
        title: "Brand Identity",
        desc: "Issue certificates and syllabus blueprints formatted with your organization's logo and official branding.",
        highlight: "White-label Certs",
        icon: Award,
        cardBg: "bg-[#F0F9FF]",
        borderStyle: "border-sky-100/90 hover:border-sky-200",
        tagColor: "text-sky-600",
        iconColor: "text-sky-600",
        iconBg: "bg-white border-sky-200/70",
        accentBar: "bg-sky-500",
      },
      {
        num: "02",
        title: "Shared Authors & Roles",
        desc: "Invite teammates, manage instructor permissions, and review draft edits collaboratively in real-time.",
        highlight: "RBAC Collaboration",
        icon: Users,
        cardBg: "bg-[#F4F5FF]",
        borderStyle: "border-indigo-100/90 hover:border-indigo-200",
        tagColor: "text-indigo-600",
        iconColor: "text-indigo-600",
        iconBg: "bg-white border-indigo-200/70",
        accentBar: "bg-indigo-500",
      },
      {
        num: "03",
        title: "Custom Subdomains",
        desc: "Host your custom workspace cockpit and student portal under a dedicated organizational domain.",
        highlight: "Dedicated Portal",
        icon: Globe2,
        cardBg: "bg-[#F0FDF9]",
        borderStyle: "border-teal-100/90 hover:border-teal-200",
        tagColor: "text-teal-600",
        iconColor: "text-teal-600",
        iconBg: "bg-white border-teal-200/70",
        accentBar: "bg-teal-500",
      },
    ],
  },
};

export default function CreatorPublishingInfographic() {
  const [activeTab, setActiveTab] = useState<"solo" | "enterprise">("solo");
  const [timerKey, setTimerKey] = useState(0);
  const currentModel = models[activeTab];

  // Auto-switch between models every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev === "solo" ? "enterprise" : "solo"));
    }, 8000);
    return () => clearInterval(interval);
  }, [timerKey]);

  const handleTabChange = (tab: "solo" | "enterprise") => {
    setActiveTab(tab);
    setTimerKey((prev) => prev + 1); // Reset the 8s timer when user manually selects
  };

  return (
    <section className="py-16 relative z-10" id="publish-infographic">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-9">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-zinc-900 font-serif">
            Publishing Process Outline
          </h2>
        </div>

        {/* Minimal Segmented Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-slate-100/90 backdrop-blur-md border border-slate-200/80 rounded-xl shadow-xs">
            <button
              onClick={() => handleTabChange("solo")}
              className={`relative flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 cursor-pointer select-none z-10 ${
                activeTab === "solo" ? "text-slate-900 font-semibold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {activeTab === "solo" && (
                <motion.div
                  layoutId="activeModelPill"
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 28,
                    mass: 0.6,
                  }}
                  className="absolute inset-0 bg-white rounded-lg shadow-xs border border-slate-200/80 z-[-1]"
                />
              )}
              <User className={`w-3.5 h-3.5 transition-colors duration-200 ${activeTab === "solo" ? "text-blue-600" : "text-slate-400"}`} />
              <span>Independent Creator</span>
            </button>
            <button
              onClick={() => handleTabChange("enterprise")}
              className={`relative flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 cursor-pointer select-none z-10 ${
                activeTab === "enterprise" ? "text-slate-900 font-semibold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {activeTab === "enterprise" && (
                <motion.div
                  layoutId="activeModelPill"
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 28,
                    mass: 0.6,
                  }}
                  className="absolute inset-0 bg-white rounded-lg shadow-xs border border-slate-200/80 z-[-1]"
                />
              )}
              <Building2 className={`w-3.5 h-3.5 transition-colors duration-200 ${activeTab === "enterprise" ? "text-sky-600" : "text-slate-400"}`} />
              <span>Organization & Teams</span>
            </button>
          </div>
        </div>

        {/* Active Model Content Container with smooth transitions and stable height */}
        <div className="relative min-h-[360px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
              transition={{
                duration: 0.28,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-full"
            >
              {/* Model Subheading Banner */}
              <div className={`border rounded-xl px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors duration-300 ${currentModel.bannerBg}`}>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-zinc-900 tracking-tight">
                    {currentModel.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                    {currentModel.tagline}
                  </p>
                </div>
                <span className={`self-start sm:self-center text-xs font-medium shrink-0 ${currentModel.badgeStyle}`}>
                  {currentModel.badge}
                </span>
              </div>

              {/* 3 Step Sleek Cards with Light Shades */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {currentModel.steps.map((step, idx) => {
                  const StepIcon = step.icon;
                  return (
                    <motion.div
                      key={step.num}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: idx * 0.04,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className={`relative border rounded-xl p-5 sm:p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between ${step.cardBg} ${step.borderStyle}`}
                    >
                      <div>
                        {/* Top Bar: Step + Icon + Highlight */}
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg border shadow-2xs flex items-center justify-center transition-colors duration-200 ${step.iconBg} ${step.iconColor}`}>
                              <StepIcon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[11px] font-mono font-medium text-zinc-400">
                              STEP {step.num}
                            </span>
                          </div>

                          <span className={`text-[11px] font-medium ${step.tagColor}`}>
                            {step.highlight}
                          </span>
                        </div>

                        {/* Step Title */}
                        <h4 className="text-sm sm:text-base font-semibold text-zinc-900 mb-1.5">
                          {step.title}
                        </h4>

                        {/* Step Description */}
                        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>

                      {/* Bottom Progress Tag */}
                      <div className="mt-5 pt-3.5 border-t border-black/[0.06] flex items-center justify-between text-[11px] text-zinc-400">
                        <span>Stage {idx + 1} of 3</span>
                        <div className="flex items-center gap-1">
                          {[0, 1, 2].map((dotIdx) => (
                            <span
                              key={dotIdx}
                              className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                                dotIdx === idx
                                  ? step.accentBar
                                  : "bg-zinc-300/80"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

