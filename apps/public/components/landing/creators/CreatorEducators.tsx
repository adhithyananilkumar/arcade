"use client";

import React from "react";
import { GraduationCap, Building2, Briefcase, Heart, User, UserCheck } from "lucide-react";

export default function CreatorEducators() {
  const steps = [
    {
      title: "Universities & colleges",
      desc: "Accredited-quality academic pathways and departments.",
      icon: GraduationCap,
      color: "#2E2EAB",
      align: "up",
    },
    {
      title: "Training institutes",
      desc: "Structured cohorts and certified bootcamp programs.",
      icon: Building2,
      color: "#20B8CF",
      align: "down",
    },
    {
      title: "Companies & enterprises",
      desc: "Professional internal onboarding and skill tracks at scale.",
      icon: Briefcase,
      color: "#F5A623",
      align: "up",
    },
    {
      title: "Nonprofits & communities",
      desc: "Mission-driven open education and public impact tracks.",
      icon: Heart,
      color: "#7A5AF8",
      align: "down",
    },
    {
      title: "Freelancers & experts",
      desc: "Monetize domain expertise and build personal brand value.",
      icon: User,
      color: "#1F8A9E",
      align: "up",
    },
    {
      title: "Independent creators",
      desc: "Publish self-paced learning paths on your own terms.",
      icon: UserCheck,
      color: "#2E2EAB",
      align: "down",
    },
  ];

  return (
    <section className="edu-sec py-16 lg:py-24 relative overflow-hidden bg-transparent" id="educators">
      <div className="wrap max-w-[1440px] mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="sec-head text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-[#7A5AF8] tracking-[0.2em] uppercase font-mono">
            <span className="w-5 h-[2px] bg-[#7A5AF8] rounded-full inline-block" />
            <span>BUILT FOR EVERY EDUCATOR</span>
            <span className="w-5 h-[2px] bg-[#7A5AF8] rounded-full inline-block" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1C1C2E] tracking-tight font-serif leading-[1.15]">
            A professional platform, whoever you are
          </h2>
          
          <p className="text-sm text-zinc-500 max-w-lg mx-auto font-medium">
            Arcade powers educational creators with standard-setting publishing tools, sandboxes, and analytics.
          </p>
        </div>

        {/* ── DESKTOP VIEW: Scaled-up Cards & Larger Circular Icons ── */}
        <div className="relative hidden lg:block w-full h-[500px] my-10 select-none">
          
          {/* Central Horizontal Axis Divider Line */}
          <div className="absolute left-0 right-0 top-[250px] h-[1.5px] bg-[#DEE0FA] z-0 pointer-events-none" />

          {/* 6 Step Columns Grid (max-w-[1400px]) */}
          <div className="grid grid-cols-6 h-full relative z-10 max-w-[1420px] mx-auto">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              const isUp = item.align === "up";

              return (
                <div key={idx} className="relative flex flex-col items-center h-full group">
                  
                  {/* Upgraded Large White Rectangular Card */}
                  <div
                    className="absolute w-[235px] h-[160px] bg-white border border-[#DEE0FA] rounded-[24px] p-6 shadow-[0_8px_24px_rgba(25,25,98,0.03)] hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center text-center group-hover:-translate-y-0.5"
                    style={{
                      top: isUp ? "0px" : "auto",
                      bottom: !isUp ? "0px" : "auto",
                    }}
                  >
                    <h4 
                      className="text-xs sm:text-sm font-black tracking-tight mb-1.5"
                      style={{ color: item.color }}
                    >
                      {item.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-zinc-500 font-semibold leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  {/* Vertical Connector Line linking Circle to Card */}
                  <div
                    className="absolute w-[2px] z-0 transition-opacity duration-300"
                    style={{
                      backgroundColor: item.color,
                      opacity: 0.85,
                      top: isUp ? "160px" : "278px",
                      bottom: isUp ? "278px" : "160px",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  />

                  {/* Enlarged Circular Icon Node (Axis Center Anchor) */}
                  <div 
                    className="absolute top-[250px] -translate-y-1/2 w-14 h-14 rounded-full border-4 border-white flex items-center justify-center shadow-md transition-all duration-400 group-hover:scale-110 z-10"
                    style={{ 
                      backgroundColor: item.color, 
                      boxShadow: "0 6px 16px rgba(25, 25, 98, 0.14)" 
                    }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* ── MOBILE VIEW: Stacking Cards ── */}
        <div className="relative block lg:hidden w-full space-y-4">
          {steps.map((item, idx) => {
            const Icon = item.icon;

            return (
              <div
                key={idx}
                className="bg-white border border-[#DEE0FA] hover:border-[#7A5AF8] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-md transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: item.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left space-y-0.5 flex-1 min-w-0">
                  <h4 
                    className="text-xs font-bold"
                    style={{ color: item.color }}
                  >
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
