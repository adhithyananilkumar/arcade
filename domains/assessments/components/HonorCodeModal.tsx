"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface HonorCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  platformName?: string;
}

export function HonorCodeModal({
  isOpen,
  onClose,
  onContinue,
  platformName = "Arcade",
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
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
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
            className="relative z-10 w-full max-w-[500px] rounded-3xl bg-white p-7 sm:p-8 shadow-2xl border border-slate-100"
          >
            {/* Top Row: Title & Close Button */}
            <div className="flex items-start justify-between gap-4">
              <h2
                id="honor-code-title"
                className="text-[22px] sm:text-[24px] font-bold tracking-tight text-slate-900 leading-snug"
              >
                {platformName} Honor Code
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-1.5 -mt-1.5 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 space-y-3.5 text-[14px] sm:text-[15px] leading-relaxed text-slate-700">
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
                  className="font-medium text-blue-600 hover:underline inline-flex items-center"
                >
                  Learn more
                </Link>
              </p>

              <div className="pt-1.5">
                <p className="font-semibold text-slate-900">All learners should:</p>
                <ul className="mt-2.5 space-y-1.5 pl-5 list-disc marker:text-slate-900">
                  <li>Submit their own original work</li>
                  <li>Avoid sharing answers with others</li>
                  <li>Report suspected violations</li>
                </ul>
              </div>
            </div>

            {/* Action Row */}
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={onContinue}
                className="inline-flex items-center justify-center rounded-xl bg-[#0056D2] px-6 py-2.5 sm:py-3 text-[14px] font-bold text-white shadow-xs transition-all duration-150 hover:bg-[#00419e] active:scale-[0.98] cursor-pointer"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
