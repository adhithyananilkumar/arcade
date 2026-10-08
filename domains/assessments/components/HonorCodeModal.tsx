"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SittingRule } from "../lib/sittingBaseline";

export interface HonorCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  platformName?: string;
  /** The rules the sitting runs under, listed before the candidate continues. */
  sittingRules?: SittingRule[];
  continueLabel?: string;
}

export function HonorCodeModal({
  isOpen,
  onClose,
  onContinue,
  platformName = "Arcade",
  sittingRules,
  continueLabel = "Continue",
}: HonorCodeModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 arcade-modal-backdrop"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="honor-code-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-h-[calc(100dvh-2rem)] max-w-[560px] overflow-y-auto arcade-modal-box rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface p-7 sm:p-8 shadow-2xl"
          >
            {/* Top Row: Title & Close Button */}
            <div className="flex items-start justify-between gap-4">
              <h2
                id="honor-code-title"
                className="text-[22px] sm:text-[24px] font-bold tracking-tight text-ink leading-snug"
              >
                {platformName} Honor Code
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-tl-lg rounded-br-lg rounded-tr-xs rounded-bl-xs p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink cursor-pointer dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 space-y-3.5 text-[14px] sm:text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
              <p>
                We’re dedicated to protecting the integrity of your work on {platformName}.
              </p>

              <p>
                As part of this effort, we’ve created an honor code that we ask everyone to
                follow.{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink underline inline-flex items-center"
                >
                  Learn more
                </Link>
              </p>

              <div className="pt-1.5">
                <p className="font-semibold text-ink">All learners should:</p>
                <ul className="mt-2.5 space-y-1.5 pl-5 list-disc marker:text-ink">
                  <li>Submit their own original work</li>
                  <li>Avoid sharing answers with others</li>
                  <li>Report suspected violations</li>
                </ul>
              </div>

              {sittingRules && sittingRules.length > 0 && (
                <div className="pt-1.5">
                  <p className="font-semibold text-ink">During this sitting:</p>
                  <ul className="mt-2.5 space-y-1.5 text-[13px] sm:text-[13.5px]">
                    {sittingRules.map((rule) => (
                      <li key={rule.title} className="flex gap-2">
                        <span className="shrink-0 font-semibold text-ink">{rule.title}.</span>
                        <span className="text-slate-600 dark:text-slate-400">{rule.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Row */}
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={onContinue}
                className="inline-flex items-center justify-center rounded-xl bg-ink px-6 py-2.5 sm:py-3 text-[14px] font-semibold text-on-ink shadow-sm transition-all duration-150 hover:bg-ink-hover cursor-pointer"
              >
                {continueLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
