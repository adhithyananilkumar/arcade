"use client";

import React from "react";
import { motion } from "framer-motion";

export default function CreatorJourney() {
  const journeySteps = [
    {
      num: "01",
      title: "Verify identity",
      desc: "Fast KYC identity check to unlock publishing permissions.",
    },
    {
      num: "02",
      title: "Build curriculum",
      desc: "Assemble modular lessons, videos, and live coding sandboxes.",
    },
    {
      num: "03",
      title: "Quality review",
      desc: "24-hour QA review validating structure and stream quality.",
    },
    {
      num: "04",
      title: "Publish & scale",
      desc: "Instant global launch with Stripe payouts and live analytics.",
    },
  ];

  return (
    <section className="milestone-sec py-16 lg:py-20 relative z-10" id="path">
      <div className="wrap max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="sec-head text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold tracking-widest text-[#7A5AF8] uppercase font-mono flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7A5AF8]" />
            How it works
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight">
            Your path from idea to published course
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
            Four simple stages take you from initial verification to a live course catalog.
          </p>
        </div>

        {/* Spacious 4-column timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14">
          {journeySteps.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: idx * 0.08, ease: "easeOut" }}
              className="space-y-3 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-[#7A5AF8]">
                  {step.num}
                </span>
                <div className="h-[1px] flex-1 bg-slate-200/80" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight pt-1">
                {step.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed font-normal">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

