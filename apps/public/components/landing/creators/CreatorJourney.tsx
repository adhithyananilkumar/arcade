"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import BorderGlow from "@/apps/public/components/landing/BorderGlow";

export default function CreatorJourney() {
  const [activeMilestone, setActiveMilestone] = useState<number>(1);

  const journeySteps = [
    {
      num: "01",
      title: "Verify identity",
      desc: "Complete a secure KYC identity check in minutes.",
    },
    {
      num: "02",
      title: "Build course",
      desc: "Construct lessons, upload videos, and set playground terminals.",
    },
    {
      num: "03",
      title: "Content review",
      desc: "QA check validates lesson structure within 24 hours.",
    },
    {
      num: "04",
      title: "Track & optimize",
      desc: "Go live globally and monitor enrollment metrics.",
    },
  ];

  return (
    <section className="milestone-sec" id="path">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">How it works</span>
          <h2>Your <span className="yellow-underline">path</span> from idea to published course</h2>
          <p>Four simple stages take you from verification to a growing catalog of global learning experiences.</p>
        </div>

        <div className="milestones-track">
          {/* Dashed connector line */}
          <div className="milestones-line">
            <motion.div
              className="milestones-line-active"
              animate={{ width: `${(activeMilestone / (journeySteps.length - 1)) * 100}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
            />
          </div>

          {journeySteps.map((step, idx) => {
            const isCompleted = idx < activeMilestone;
            const isActive = idx === activeMilestone;
            const nodeColors = ["#6366f1", "#f59e0b", "#14b8a6", "#10b981"];
            const signatureColor = nodeColors[idx];

            return (
              <div
                key={idx}
                className={`milestone-item ${isActive ? "active" : ""}`}
                onClick={() => setActiveMilestone(idx)}
              >
                <motion.div
                  animate={{
                    backgroundColor: isActive || isCompleted
                      ? signatureColor
                      : "#ffffff",
                    borderColor: isActive || isCompleted
                      ? signatureColor
                      : "#e4e4e7",
                    color: (isActive || isCompleted) ? "#ffffff" : "#a1a1aa",
                    scale: isActive ? 1.12 : 1,
                    boxShadow: isActive
                      ? `0 0 0 4px #ffffff, 0 10px 20px ${signatureColor}40`
                      : isCompleted
                        ? `0 0 0 4px #ffffff, 0 8px 16px ${signatureColor}20`
                        : "0 0 0 4px #ffffff"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="milestone-node relative"
                >
                  {isCompleted ? (
                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <span>{step.num}</span>
                  )}

                  {/* Ping ripple effect only on active node */}
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-full border-2 animate-ping pointer-events-none"
                      style={{
                        borderColor: `${signatureColor}80`,
                        animationDuration: "2s"
                      }}
                    />
                  )}
                </motion.div>

                <div className="w-full">
                  <BorderGlow
                    edgeSensitivity={40}
                    glowColor={idx === 0 ? "243 75 60" : idx === 1 ? "38 95 50" : idx === 2 ? "174 80 40" : "160 80 45"}
                    backgroundColor="#ffffff"
                    borderRadius={16}
                    glowRadius={20}
                    glowIntensity={isActive ? 0.8 : 0.35}
                    coneSpread={25}
                    animated={isActive}
                    colors={
                      idx === 0
                        ? ['#818cf8', '#a5b4fc', '#c7d2fe']
                        : idx === 1
                          ? ['#fbbf24', '#fcd34d', '#fde68a']
                          : idx === 2
                            ? ['#2dd4bf', '#5eead4', '#99f6e4']
                            : ['#34d399', '#6ee7b7', '#a7f3d0']
                    }
                    fillOpacity={isActive ? 0.06 : 0.02}
                    className={`w-full cursor-pointer mt-4 transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-70 hover:opacity-90"
                      }`}
                  >
                    <div className="p-4 flex flex-col items-center justify-center text-center">
                      <h4 className={`text-sm font-extrabold mb-1 leading-snug ${isActive ? "text-zinc-950" : "text-zinc-500"
                        }`}>
                        {step.title}
                      </h4>
                      <p className={`text-[11px] leading-normal max-w-[155px] mx-auto font-medium ${isActive ? "text-zinc-500 font-medium" : "text-zinc-400"
                        }`}>
                        {step.desc}
                      </p>
                    </div>
                  </BorderGlow>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile timeline cards */}
        <div className="mobile-milestones">
          {journeySteps.map((step, idx) => {
            const isCompleted = idx < activeMilestone;
            const isActive = idx === activeMilestone;
            const nodeColors = ["#6366f1", "#f59e0b", "#14b8a6", "#10b981"];
            const signatureColor = nodeColors[idx];

            return (
              <div
                key={idx}
                onClick={() => setActiveMilestone(idx)}
                className="w-full animate-none"
              >
                <BorderGlow
                  edgeSensitivity={40}
                  glowColor={idx === 0 ? "243 75 60" : idx === 1 ? "38 95 50" : idx === 2 ? "174 80 40" : "160 80 45"}
                  backgroundColor="#ffffff"
                  borderRadius={16}
                  glowRadius={20}
                  glowIntensity={isActive ? 0.8 : 0.35}
                  coneSpread={25}
                  animated={isActive}
                  colors={
                    idx === 0
                      ? ['#818cf8', '#a5b4fc', '#c7d2fe']
                      : idx === 1
                        ? ['#fbbf24', '#fcd34d', '#fde68a']
                        : idx === 2
                          ? ['#2dd4bf', '#5eead4', '#99f6e4']
                          : ['#34d399', '#6ee7b7', '#a7f3d0']
                  }
                  fillOpacity={isActive ? 0.06 : 0.02}
                  className={`w-full mt-2 transition-opacity duration-300 ${isActive ? "active opacity-100" : "opacity-70 hover:opacity-90"
                    }`}
                >
                  <div className="p-4 flex gap-3.5 items-center">
                    <span
                      className={`mobile-milestone-num text-white transition-colors duration-300`}
                      style={{
                        backgroundColor: isCompleted || isActive ? signatureColor : "#e4e4e7",
                        color: isCompleted || isActive ? "#ffffff" : "#a1a1aa"
                      }}
                    >
                      {isCompleted ? (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : (
                        step.num
                      )}
                    </span>
                    <div className="mobile-milestone-info text-left">
                      <h4 className={`mobile-milestone-title ${isActive ? "text-zinc-950 font-bold" : "text-zinc-500"}`}>{step.title}</h4>
                      <p className={`mobile-milestone-desc ${isActive ? "text-zinc-600 font-medium" : "text-zinc-400"}`}>{step.desc}</p>
                    </div>
                  </div>
                </BorderGlow>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
