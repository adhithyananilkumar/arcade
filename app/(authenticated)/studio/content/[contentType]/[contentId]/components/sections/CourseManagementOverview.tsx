"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  DollarSign,
  CreditCard,
  GraduationCap,
  FileText,
  Settings,
  BookOpen,
  Users,
  Award,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  X,
  Lock,
  ChevronRight,
} from "lucide-react";
import type { ContentTypeSegment } from "../../lib/contentTypeRouting";
import { editorHref } from "../../lib/contentTypeRouting";

export interface CoursePricingConfig {
  isPaid: boolean;
  currency: "INR" | "USD" | "EUR";
  price: number;
  discountPrice?: number;
}

export interface CourseExamLinkConfig {
  isLinked: boolean;
  examId: string;
  examTitle: string;
  passingScore: number;
  maxAttempts: number;
}

export function CourseManagementOverview({
  segment,
  contentId,
  courseTitle = "Course",
  onNavigateToTab,
}: {
  segment: ContentTypeSegment;
  contentId: string;
  courseTitle?: string;
  onNavigateToTab?: (tab: "overview" | "learners" | "exams" | "feedback" | "certificates" | "curriculum") => void;
}) {
  // ── 1. Pricing / Payable State ──────────────────────────────────────────
  const [pricing, setPricing] = useState<CoursePricingConfig>({
    isPaid: false,
    currency: "INR",
    price: 1999,
    discountPrice: undefined,
  });

  // ── 2. Modal & Approval State ───────────────────────────────────────────
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [draftPricing, setDraftPricing] = useState<CoursePricingConfig>({
    isPaid: false,
    currency: "INR",
    price: 1999,
    discountPrice: undefined,
  });
  const [hasAcknowledgedTerms, setHasAcknowledgedTerms] = useState(false);
  const [isSavingPricing, setIsSavingPricing] = useState(false);

  const openPricingModal = () => {
    setDraftPricing({ ...pricing });
    setHasAcknowledgedTerms(false);
    setIsPricingModalOpen(true);
  };

  const handleApprovePricing = () => {
    if (draftPricing.isPaid && (!draftPricing.price || draftPricing.price <= 0)) {
      toast.error("Please enter a valid price greater than 0");
      return;
    }
    setIsSavingPricing(true);
    setTimeout(() => {
      setPricing({ ...draftPricing });
      setIsSavingPricing(false);
      setIsPricingModalOpen(false);
      const symbol = draftPricing.currency === "INR" ? "₹" : draftPricing.currency === "USD" ? "$" : "€";
      toast.success(
        draftPricing.isPaid
          ? `Monetization policy updated: Paid (${symbol}${draftPricing.discountPrice || draftPricing.price})`
          : "Monetization policy updated: Free Public Access"
      );
    }, 400);
  };

  // ── 3. Exam Linking State ────────────────────────────────────────────────
  const [examLink, setExamLink] = useState<CourseExamLinkConfig>({
    isLinked: true,
    examId: "EX-8902",
    examTitle: "Final Comprehensive Certification Exam",
    passingScore: 80,
    maxAttempts: 3,
  });

  // Toggle Exam Linking
  const handleToggleExamLink = (linked: boolean) => {
    setExamLink((prev) => ({ ...prev, isLinked: linked }));
    toast.success(linked ? "Examination linked to course" : "Examination unlinked");
  };

  const currencySymbol = pricing.currency === "INR" ? "₹" : pricing.currency === "USD" ? "$" : "€";
  const draftCurrencySymbol = draftPricing.currency === "INR" ? "₹" : draftPricing.currency === "USD" ? "$" : "€";

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── 1. TOP METRICS ROW WITH UNIQUE SHAPE CUTS & LIGHT PASTEL COLORS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
        {/* Metric 1: Total Enrolled (Wave Arch Cut · Light Pastel Blue) */}
        <div
          onClick={() => onNavigateToTab?.("learners")}
          className="relative overflow-hidden p-5 rounded-tl-[34px] rounded-br-[34px] rounded-tr-[14px] rounded-bl-[14px] border border-blue-200/90 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/90 via-sky-50/40 to-white dark:from-blue-950/30 dark:via-neutral-900 dark:to-neutral-900 shadow-2xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-700 transition-all cursor-pointer flex flex-col justify-between group"
        >
          {/* Subtle Top-Right Arch Accent */}
          <div className="absolute top-0 right-0 w-16 h-8 rounded-bl-full bg-blue-500/10 dark:bg-blue-400/10 pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
              Total Enrolled
            </span>
            <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shadow-2xs">
              <Users size={15} />
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              1,240
            </span>
          </div>
        </div>

        {/* Metric 2: Pricing (Ticket Notched Cut · Light Pastel Mint) */}
        <div 
          onClick={openPricingModal}
          className="relative overflow-hidden p-5 rounded-2xl border border-emerald-200/90 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white dark:from-emerald-950/30 dark:via-neutral-900 dark:to-neutral-900 shadow-2xs hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-700 transition-all cursor-pointer flex flex-col justify-between group"
          title="Click to configure monetization policy"
        >
          {/* Ticket Edge Notches */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 size-4 rounded-full bg-[#f6f8fb] dark:bg-neutral-950 border border-emerald-200/90 dark:border-emerald-900/50 pointer-events-none" />
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 size-4 rounded-full bg-[#f6f8fb] dark:bg-neutral-950 border border-emerald-200/90 dark:border-emerald-900/50 pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Course Price
            </span>
            <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-2xs">
              <DollarSign size={15} />
            </div>
          </div>
          <div className="mt-3 relative z-10 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              {pricing.isPaid ? `${currencySymbol}${pricing.discountPrice || pricing.price}` : "Free"}
            </span>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 group-hover:underline flex items-center gap-0.5">
              Configure <ChevronRight size={12} />
            </span>
          </div>
        </div>

        {/* Metric 3: Exam Pass Rate (Inverse Diagonal Cut · Light Pastel Lavender) */}
        <div
          onClick={() => onNavigateToTab?.("exams")}
          className="relative overflow-hidden p-5 rounded-tr-[34px] rounded-bl-[34px] rounded-tl-[14px] rounded-br-[14px] border border-purple-200/90 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/90 via-fuchsia-50/40 to-white dark:from-purple-950/30 dark:via-neutral-900 dark:to-neutral-900 shadow-2xs hover:shadow-md hover:border-purple-400 dark:hover:border-purple-700 transition-all cursor-pointer flex flex-col justify-between group"
        >
          {/* Subtle Top-Left Arch Accent */}
          <div className="absolute top-0 left-0 w-16 h-8 rounded-br-full bg-purple-500/10 dark:bg-purple-400/10 pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
              Exam Pass Rate
            </span>
            <div className="size-8 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shadow-2xs">
              <GraduationCap size={15} />
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              88%
            </span>
          </div>
        </div>

        {/* Metric 4: Certificates Issued (Pill Crest Cut · Light Pastel Buttercup) */}
        <div
          onClick={() => onNavigateToTab?.("certificates")}
          className="relative overflow-hidden p-5 rounded-t-[34px] rounded-b-[14px] border border-amber-200/90 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/90 via-yellow-50/40 to-white dark:from-amber-950/30 dark:via-neutral-900 dark:to-neutral-900 shadow-2xs hover:shadow-md hover:border-amber-400 dark:hover:border-amber-700 transition-all cursor-pointer flex flex-col justify-between group"
        >
          {/* Subtle Bottom-Right Arch Accent */}
          <div className="absolute bottom-0 right-0 w-16 h-8 rounded-tl-full bg-amber-500/15 dark:bg-amber-400/15 pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              Certificates
            </span>
            <div className="size-8 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shadow-2xs">
              <Award size={15} />
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              342
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. TWO-COLUMN MAIN MANAGEMENT SECTION ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* ── CARD A: Course Pricing (Clean, Flat, Light Mint Wash) ─ */}
        <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50/30 via-white to-white dark:from-emerald-950/20 dark:via-neutral-900 dark:to-neutral-900 shadow-2xs p-5 sm:p-6 flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center shrink-0 shadow-2xs">
                  <CreditCard size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Course Pricing
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Manage enrollment fee and learner access
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Key-Value Stats */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">Current Price</span>
                <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {pricing.isPaid ? `${currencySymbol}${pricing.discountPrice || pricing.price}` : "Free"}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">Access Mode</span>
                <span className="text-xs font-bold text-slate-800 dark:text-neutral-200 mt-1">
                  {pricing.isPaid ? "Paid Enrollment" : "Free Open Access"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button: Edit Pricing in solid black by default */}
          <button
            type="button"
            onClick={openPricingModal}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-neutral-100 text-white text-xs font-semibold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <Settings size={14} />
            <span>Edit Pricing</span>
          </button>
        </div>

        {/* ── CARD B: Examination & Certification (Clean, Flat, Light Lavender Wash) */}
        <div className="rounded-2xl border border-purple-200/80 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/30 via-white to-white dark:from-purple-950/20 dark:via-neutral-900 dark:to-neutral-900 shadow-2xs p-5 sm:p-6 flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 flex items-center justify-center shrink-0 shadow-2xs">
                  <GraduationCap size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Examination & Certification
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Attach capstone exam to unlock certificates
                  </p>
                </div>
              </div>

              <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold tracking-wider ${
                examLink.isLinked
                  ? "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60"
                  : "bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-neutral-400 border border-slate-200 dark:border-neutral-700"
              }`}>
                {examLink.isLinked ? "LINKED" : "NO EXAM"}
              </span>
            </div>

            {/* Direct Exam Content */}
            {examLink.isLinked ? (
              <div className="flex flex-col gap-3 pt-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {examLink.examTitle}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                      Passing Score: <strong className="text-slate-700 dark:text-neutral-200">{examLink.passingScore}%</strong> · {examLink.maxAttempts} Attempts allowed
                    </span>
                  </div>

                  <Link
                    href="/exam"
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-neutral-100 text-white text-xs font-semibold shadow-2xs transition-all shrink-0 active:scale-95"
                  >
                    <span>Open Exam</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Link
                    href="/exam"
                    className="inline-flex items-center gap-1.5 text-xs text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-200 font-semibold transition-colors"
                  >
                    <FileText size={13} />
                    <span>Edit Questions</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleToggleExamLink(false)}
                    className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Unlink
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 dark:text-neutral-400">
                  No graduation exam linked.
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleExamLink(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-neutral-100 text-white text-xs font-semibold shadow-2xs cursor-pointer active:scale-95 transition-all"
                >
                  Link Exam
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. QUICK ACTIONS ROW ───────────── */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs p-5 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 flex items-center justify-center">
              <Settings size={15} />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Course Quick Actions
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Tile 1: Curriculum Editor */}
            <Link
              href={editorHref("course", contentId)}
              className="flex items-center justify-between p-3.5 rounded-xl border border-blue-200/80 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/25 to-white dark:from-blue-950/20 dark:to-neutral-900 hover:border-blue-400 dark:hover:border-blue-700 transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                  <BookOpen size={14} />
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Curriculum Editor
                </span>
              </div>
              <ArrowUpRight size={13} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            {/* Tile 2: Examination Hub */}
            <Link
              href="/exam"
              className="flex items-center justify-between p-3.5 rounded-xl border border-purple-200/80 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/25 to-white dark:from-purple-950/20 dark:to-neutral-900 hover:border-purple-400 dark:hover:border-purple-700 transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                  <GraduationCap size={14} />
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-neutral-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Examination Hub
                </span>
              </div>
              <ArrowUpRight size={13} className="text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            {/* Tile 3: Certificate Center */}
            <div
              onClick={() => onNavigateToTab?.("certificates")}
              className="flex items-center justify-between p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/25 to-white dark:from-amber-950/20 dark:to-neutral-900 hover:border-amber-400 dark:hover:border-amber-700 transition-all group shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <Award size={14} />
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-neutral-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Certificate Center
                </span>
              </div>
              <ArrowUpRight size={13} className="text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. COURSE PRICING MODAL ── */}
      {isPricingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl border border-emerald-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl p-6 sm:p-7 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-emerald-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center shrink-0 shadow-2xs">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Edit Course Pricing
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    Choose how learners access this course
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPricingModalOpen(false)}
                className="size-8 rounded-full bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 text-slate-500 dark:text-neutral-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Radio Options */}
            <div className="flex flex-col gap-2.5">
              {/* Free Option */}
              <label
                onClick={() => setDraftPricing((prev) => ({ ...prev, isPaid: false }))}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  !draftPricing.isPaid
                    ? "border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-blue-500/20"
                    : "border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-850"
                }`}
              >
                <input
                  type="radio"
                  name="pricingMode"
                  checked={!draftPricing.isPaid}
                  onChange={() => setDraftPricing((prev) => ({ ...prev, isPaid: false }))}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Free
                  </span>
                  <span className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                    Anyone can enroll in this course for free.
                  </span>
                </div>
              </label>

              {/* Paid Option */}
              <label
                onClick={() => setDraftPricing((prev) => ({ ...prev, isPaid: true }))}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  draftPricing.isPaid
                    ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20"
                    : "border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-850"
                }`}
              >
                <input
                  type="radio"
                  name="pricingMode"
                  checked={draftPricing.isPaid}
                  onChange={() => setDraftPricing((prev) => ({ ...prev, isPaid: true }))}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Paid
                  </span>
                  <span className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                    Learners pay a one-time fee to enroll.
                  </span>
                </div>
              </label>
            </div>

            {/* Pricing Input when Paid */}
            {draftPricing.isPaid && (
              <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-neutral-850 border border-emerald-200/80 dark:border-emerald-900/60 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-neutral-300 block mb-1">
                      Currency
                    </label>
                    <select
                      value={draftPricing.currency}
                      onChange={(e) => {
                        const newCurr = e.target.value as "INR" | "USD" | "EUR";
                        const defaultPresets: Record<string, number> = { INR: 1999, USD: 49, EUR: 45 };
                        setDraftPricing((prev) => ({
                          ...prev,
                          currency: newCurr,
                          price: defaultPresets[newCurr] || prev.price,
                        }));
                      }}
                      className="w-full rounded-xl border border-emerald-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-neutral-300 block mb-1">
                      Price ({draftCurrencySymbol})
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={draftPricing.price}
                      onChange={(e) => {
                        const val = Math.max(1, Number(e.target.value) || 0);
                        setDraftPricing((prev) => ({ ...prev, price: val }));
                      }}
                      className="w-full rounded-xl border border-emerald-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Checkbox */}
            <label className="flex items-start gap-2.5 pt-1 text-xs text-slate-700 dark:text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasAcknowledgedTerms}
                onChange={(e) => setHasAcknowledgedTerms(e.target.checked)}
                className="size-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer shrink-0"
              />
              <span>
                I confirm setting this course to{" "}
                <strong className="text-slate-900 dark:text-white">
                  {draftPricing.isPaid
                    ? `Paid (${draftCurrencySymbol}${draftPricing.price})`
                    : "Free"}
                </strong>
                .
              </span>
            </label>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsPricingModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!hasAcknowledgedTerms || isSavingPricing}
                onClick={handleApprovePricing}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                  hasAcknowledgedTerms && !isSavingPricing
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95"
                    : "bg-slate-100 text-slate-400 dark:bg-neutral-800 dark:text-neutral-600 cursor-not-allowed"
                }`}
              >
                {isSavingPricing ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
