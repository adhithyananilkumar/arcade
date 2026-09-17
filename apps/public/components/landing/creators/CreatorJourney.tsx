"use client";

import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Verify Identity",
    desc: "Complete a quick KYC verification to establish your creator profile and payment payout channel.",
  },
  {
    step: "02",
    title: "Build Course",
    desc: "Construct lessons, upload videos, attach project resources, and configure interactive playground terminals.",
  },
  {
    step: "03",
    title: "Content Review",
    desc: "Our quality team verifies curriculum integrity, streaming performance, and structure within 24 hours.",
  },
  {
    step: "04",
    title: "Launch & Grow",
    desc: "Go live to global students, issue tamper-proof verifiable certificates, and track analytics in real-time.",
  },
];

export default function CreatorJourney() {
  return (
    <section className="py-20 relative z-10" id="path">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-indigo-600 mb-2 inline-block">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 mb-4 font-serif">
            Your path from idea to published course
          </h2>
        </div>

        {/* 4-Step Text-Based Simple Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col"
            >
              <span className="text-3xl font-extrabold text-indigo-600 font-mono tracking-tight mb-3">
                {item.step}
              </span>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
