"use client";

import React from "react";
import { motion } from "framer-motion";

const capabilities = [
  {
    tag: "Identity & Trust",
    title: "Verified Creator Profile",
    desc: "Fast KYC verification to establish trusted author credentials and instant, direct payout channels.",
    pill: "Instant Payouts",
    pillColor: "text-emerald-700 bg-emerald-50 border-emerald-200/70",
    detail: "Zero impersonation • Stripe & bank ready",
  },
  {
    tag: "Course Studio",
    title: "Interactive Creation Engine",
    desc: "Construct rich curricula with integrated video streaming, project files, and live coding playground environments.",
    pill: "Full Studio",
    pillColor: "text-indigo-700 bg-indigo-50 border-indigo-200/70",
    detail: "Cloud sandboxes • Markdown & Video",
  },
  {
    tag: "Quality Assurance",
    title: "Rapid Content Audit",
    desc: "Automated and human review ensuring pristine streaming bitrates, structural clarity, and curriculum integrity.",
    pill: "< 24h SLA",
    pillColor: "text-blue-700 bg-blue-50 border-blue-200/70",
    detail: "Bitrate optimization • Structure checks",
  },
  {
    tag: "Scale & Reach",
    title: "Global Distribution & Growth",
    desc: "Reach worldwide learners, issue tamper-proof verifiable certificates, and track conversion analytics in real-time.",
    pill: "Worldwide CDN",
    pillColor: "text-purple-700 bg-purple-50 border-purple-200/70",
    detail: "Verifiable certificates • Real-time telemetry",
  },
];

export default function CreatorJourney() {
  return (
    <section className="py-20 sm:py-24 relative z-10" id="capabilities">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-indigo-600 mb-2 inline-block font-mono">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 mb-4 font-serif">
            Built for modern, frictionless publishing
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 max-w-lg mx-auto leading-relaxed">
            Everything you need to turn deep expertise into engaging, verifiable learning experiences.
          </p>
        </div>

        {/* 4-Card Modern Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white/75 backdrop-blur-xl border border-slate-200/80 hover:border-indigo-300 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.04)] hover:shadow-[0_16px_36px_-6px_rgba(99,102,241,0.12)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Sleek Top Glow Accent */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent group-hover:via-indigo-500 transition-all duration-500" />

              <div>
                {/* Tag & Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 font-mono">
                    {item.tag}
                  </span>
                  <span
                    className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full border ${item.pillColor}`}
                  >
                    {item.pill}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-zinc-900 mb-2.5 group-hover:text-indigo-950 transition-colors">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Bottom Feature Detail */}
              <div className="mt-6 pt-4 border-t border-slate-100/90 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                <span>{item.detail}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

