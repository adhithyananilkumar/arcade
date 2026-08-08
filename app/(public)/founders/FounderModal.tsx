"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Mail, CheckCircle2, Quote, Award, Sparkles } from "lucide-react";
import { Founder } from "./foundersData";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
    </svg>
  );
}

interface FounderModalProps {
  founder: Founder | null;
  onClose: () => void;
}

export default function FounderModal({ founder, onClose }: FounderModalProps) {
  useEffect(() => {
    if (founder) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [founder]);

  return (
    <AnimatePresence>
      {founder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-3xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden z-10 my-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shadow-sm"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Banner Background */}
            <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>

            {/* Body */}
            <div className="px-6 sm:px-10 pb-8 -mt-16 relative z-10">
              {/* Image & Quick Info Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left pb-6 border-b border-slate-100">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-purple-50">
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                    <Sparkles className="w-3.5 h-3.5" /> Arcade Founder
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-serif">
                    {founder.name}
                  </h2>
                  <p className="text-sm font-medium text-blue-600">
                    {founder.role}
                  </p>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0">
                  {founder.social.linkedin && (
                    <a
                      href={founder.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition-all duration-200"
                    >
                      <LinkedinIcon className="w-4 h-4" />
                    </a>
                  )}
                  {founder.social.github && (
                    <a
                      href={founder.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all duration-200"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}
                  {founder.social.email && (
                    <a
                      href={`mailto:${founder.social.email}`}
                      className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-teal-600 hover:text-white transition-all duration-200"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Quote Banner */}
              <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 relative">
                <Quote className="w-8 h-8 text-blue-500/20 absolute top-3 right-4 pointer-events-none" />
                <p className="text-sm sm:text-base italic text-slate-700 font-serif leading-relaxed">
                  "{founder.quote}"
                </p>
              </div>

              {/* Story & Biography */}
              <div className="mt-6 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Full Journey & Role
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-slate-600 font-sans">
                  {founder.extendedBio}
                </p>
              </div>

              {/* Achievements */}
              <div className="mt-6 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" /> Key Milestones & Impact
                </h3>
                <ul className="space-y-2">
                  {founder.achievements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Core Skill Chips */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                {founder.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
