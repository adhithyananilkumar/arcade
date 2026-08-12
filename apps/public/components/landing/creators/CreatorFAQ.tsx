"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function CreatorFAQ() {
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({
    0: true, // open first question by default
  });

  const toggleFaq = (idx: number) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const faqItems = [
    {
      q: "How does the quality review process work?",
      a: "Every course, workshop, or webinar goes through a brief structural check by our quality assurance team. We verify that video files stream correctly, assessments are validly formatted, and the syllabus matches the title before it goes live in the public catalog.",
    },
    {
      q: "Are there any fees for paid courses?",
      a: "Arcade charges a 0% platform fee on course transactions. You only cover standard Stripe credit card processing fees, leaving the remainder of your earnings directly in your account.",
    },
    {
      q: "Can multiple authors edit the same course?",
      a: "Yes! If you publish as an organization, you can add co-authors by entering their emails. They get full editing privileges on the course draft, and their profile is listed as co-creator on the published syllabus.",
    },
    {
      q: "Can I self-host coding playgrounds?",
      a: "Absolutely. Arcade integrates custom visual terminals. You configure the container specifications, define setup scripts, and students run safe terminal processes directly inside the web browser during lessons.",
    },
  ];

  return (
    <section className="faq-sec pt-6 pb-16 lg:pt-8 lg:pb-24 relative overflow-hidden bg-transparent" id="faq">
      <div className="wrap max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Section Header */}
        <div className="sec-head max-w-2xl mx-auto text-center mb-12 space-y-3">
          {/* Eyebrow Label: Smallest uppercase monospace tracking */}
          <div className="inline-flex items-center justify-center gap-2 text-[11px] font-bold text-[#7A5AF8] tracking-[0.2em] uppercase font-mono">
            <span className="w-4 h-[2px] bg-[#7A5AF8] rounded-full inline-block" />
            <span>GOT QUESTIONS?</span>
            <span className="w-4 h-[2px] bg-[#7A5AF8] rounded-full inline-block" />
          </div>

          {/* Main Heading: Largest serif text */}
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-semibold text-[#0B132B] tracking-tight font-serif leading-[1.18]">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Editorial FAQ List - Left Aligned Questions Without Numbers */}
        <div className="max-w-5xl mx-auto divide-y divide-slate-200/80 border-t border-b border-slate-200/80">
          {faqItems.map((item, idx) => {
            const isOpen = !!openFaqs[idx];

            return (
              <div key={idx} className="py-6 sm:py-7 transition-colors">
                
                {/* Question Trigger Row */}
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left flex items-start justify-between gap-4 sm:gap-6 group cursor-pointer"
                >
                  {/* Question Text: Consistent left starting position across all 4 items */}
                  <span className="flex-1 font-serif text-xl sm:text-2xl text-[#0B132B] group-hover:text-[#3B2FC9] font-semibold leading-snug transition-colors pt-0.5">
                    {item.q}
                  </span>

                  {/* Chevron indicator */}
                  <span className="shrink-0 w-8 h-8 rounded-full bg-slate-100/70 group-hover:bg-indigo-50 flex items-center justify-center text-slate-500 group-hover:text-[#3B2FC9] transition-colors mt-0.5">
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-[#3B2FC9]" : ""
                      }`}
                    />
                  </span>
                </button>

                {/* Expanded Answer - Aligned cleanly with question text */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 pb-1 pr-6 sm:pr-12">
                        <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-3xl">
                          {item.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}






