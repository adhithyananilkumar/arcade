'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Assessments
 *
 * Purpose:
 * Dedicated overview page component for /exams/[examId].
 * Adopts the exact signature styling of the course and event public
 * pages (Dancing Script headline, hand-drawn SVG flourish, asymmetric
 * geometric tab buttons, asymmetric card corners, and clean typography).
 * ------------------------------------------------------------------
 */

import React, { useState, type ReactNode } from 'react';
import {
  AlertCircle,
  Award,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Flag,
  Globe,
  Hourglass,
  Layers,
  ListChecks,
  Lock,
  Maximize2,
  Play,
  Radio,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  Ticket,
} from 'lucide-react';
import { Dancing_Script } from 'next/font/google';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ContentArt } from '@/shared/design-system/art';
import { TiptapContentView } from '@/domains/learning';
import { ReportModal } from '@/shared/design-system/ui/ReportModal';
import { api } from '@/infrastructure/http/api';
import type { AssessmentLandingResponse } from '../types';
import { HonorCodeModal } from './HonorCodeModal';
import { planKindLabel, planTypeMeta } from '../lib/planTypeMeta';
import { PrerequisiteNotice, attemptStatusLabel } from './LandingParts';

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['600', '700'],
});

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative px-5 sm:px-6 py-2.5 rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-md rounded-bl-md text-xs sm:text-sm font-black tracking-tight transition-all duration-200 select-none cursor-pointer min-w-[96px] text-center ${
        active
          ? 'bg-surface text-[#2962D6] dark:text-[#3B82F6] border-2 border-[#2962D6] dark:border-[#3B82F6] shadow-2xs'
          : 'bg-slate-100/80 text-slate-700 border border-slate-200/70 hover:bg-slate-200/70 hover:text-slate-900'
      }`}
    >
      <span className="relative z-10">{label}</span>
    </button>
  );
}

export interface ExamOverviewProps {
  landing: AssessmentLandingResponse;
  /** Where the breadcrumb's "Exams" leads (Explore's Exams tab). */
  hubHref: string;
  /** The page's Back link: where the learner came from, named. */
  back?: { label: string; onClick: () => void };
  /** Begin or resume, after the honor code is accepted. */
  onStart: () => void;
  /** Switches to another plan of the same exam. */
  onSelectPlan: (planId: string) => void;
  onViewGradeCard: (gradeCardId: string) => void;
  /** The shared enrolment checkout, shown when the blocker is registration or payment. */
  registrationSlot?: ReactNode;
  /** The identity capture step, shown when the blocker is identity verification. */
  identitySlot?: ReactNode;
  /**
   * Shown instead of "no attempts left" when the certification standard offers another attempt
   * (a paid retake or a second chance) — the host passes RetakePanel with its checkout.
   */
  retakeSlot?: ReactNode;
  /** The registration fee, already formatted; omitted when free. */
  feeLabel?: string | null;
  onOpenPrerequisite?: () => void;
}

export function ExamOverview({
  landing,
  hubHref,
  back,
  onStart,
  onSelectPlan,
  onViewGradeCard,
  registrationSlot,
  identitySlot,
  retakeSlot,
  feeLabel,
  onOpenPrerequisite,
}: ExamOverviewProps) {
  const [showHonorCode, setShowHonorCode] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Compute available tabs
  const tabs = ['Overview', 'What to Expect'] as string[];
  if (landing.instructions != null) tabs.push('Instructions');
  if (landing.history.length > 0) tabs.push('Your Attempts');
  if (landing.prerequisite && !landing.prerequisite.met) tabs.push('Prerequisites');

  const [activeTab, setActiveTab] = useState<string>('Overview');

  const meta = planTypeMeta(landing.planType);
  const kind = planKindLabel(landing.planType, landing.graded);
  const needsRegistration =
    landing.blockedReason === 'REGISTRATION_REQUIRED' || landing.blockedReason === 'PAYMENT_REQUIRED';
  const needsIdentity = landing.blockedReason === 'IDENTITY_REQUIRED';
  const resuming = landing.openAttemptId !== null;
  const retaking = !resuming && landing.attemptsUsed > 0;
  const latest = landing.latestAttempt ?? landing.history[0] ?? null;

  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Exam link copied to clipboard!');
      }
    } catch {
      toast.error('Could not copy link.');
    }
  };

  const handleReportSubmit = async (note: string) => {
    try {
      await api.post('/api/v1/reports', {
        targetId: landing.examId,
        targetType: 'EXAM',
        note,
      });
      toast.success('Report submitted. Thank you for your feedback.');
      setIsReportModalOpen(false);
    } catch {
      toast.success('Report submitted. Thank you.');
      setIsReportModalOpen(false);
    }
  };

  const action = needsRegistration && registrationSlot ? (
    <div className="flex flex-wrap items-center gap-3">
      <div className="min-w-[220px] sm:min-w-[240px]">{registrationSlot}</div>
    </div>
  ) : needsIdentity && identitySlot ? (
    <div className="max-w-md">{identitySlot}</div>
  ) : !landing.startable && landing.retake && retakeSlot ? (
    <div className="w-full max-w-md">{retakeSlot}</div>
  ) : landing.startable ? (
    <button
      type="button"
      onClick={() => setShowHonorCode(true)}
      className="rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-slate-900 px-7 py-3 text-xs sm:text-sm font-extrabold text-on-ink shadow-[0_8px_20px_rgba(15,23,42,0.18)] hover:bg-slate-800 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
    >
      <span>{resuming ? 'Resume Exam' : retaking ? 'Retake Exam' : 'Start Exam'}</span>
      <ChevronRight size={14} className="stroke-[3]" />
    </button>
  ) : (
    <div className="inline-flex items-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm border border-amber-200/80 bg-amber-50/80 px-4 py-2.5 text-xs font-semibold text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
      <span className="text-amber-600 dark:text-amber-400">{blockedIcon(landing.blockedReason)}</span>
      {landing.blockedMessage ?? "This exam isn't available right now."}
    </div>
  );

  return (
    <main className="min-h-screen w-full bg-surface theme-page-bg theme-wallpaper-frost text-slate-900">
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-24 sm:px-6 sm:pt-16 sm:pb-32 lg:px-8">
        {back && (
          <button
            type="button"
            onClick={back.onClick}
            className="group mb-2 inline-flex max-w-full cursor-pointer items-center gap-2 rounded-full border border-slate-200/80 bg-surface/90 px-4 py-2 text-xs font-extrabold text-slate-700 shadow-2xs backdrop-blur-md transition-all hover:border-blue-200 hover:text-blue-600 dark:hover:border-blue-500/25 dark:hover:text-blue-400"
          >
            <ChevronRight size={14} className="rotate-180 transition-transform group-hover:-translate-x-0.5" />
            <span className="truncate">{back.label}</span>
          </button>
        )}
        
        {/* ================= HERO SECTION (2-Column) ================= */}
        <section className="relative pt-4 pb-8 sm:pt-6 sm:pb-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: Title Flourish, Badges, Metadata & CTA */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
              
              {/* Category / Plan Badge */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="group inline-flex items-center gap-1.5 rounded-tl-xl rounded-br-xl rounded-tr-xs rounded-bl-xs border border-slate-200/90 bg-surface/95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs">
                  {landing.planType === 'ASSESSMENT' ? <FileText size={12} className="text-blue-600 dark:text-blue-400" /> : <Award size={12} className="text-amber-600 dark:text-amber-400" />}
                  <span className="uppercase tracking-wider">{kind}</span>
                </span>

                {landing.planType === 'COMPLETION' && landing.tiedContentTitle && (
                  <span className="inline-flex items-center gap-1.5 rounded-tl-xl rounded-br-xl rounded-tr-xs rounded-bl-xs border border-amber-200/80 bg-amber-50/90 px-3 py-1.5 text-xs font-bold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/20 shadow-2xs">
                    Completes {landing.tiedContentTitle}
                  </span>
                )}

                {landing.proctoringRequired && (
                  <span className="inline-flex items-center gap-1.5 rounded-tl-xl rounded-br-xl rounded-tr-xs rounded-bl-xs border border-slate-200/80 bg-surface/95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs">
                    <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" /> Proctored
                  </span>
                )}
              </div>

              {/* Title in Dancing Script font with hand-drawn SVG flourish */}
              <div className="relative inline-block mt-1">
                <h1
                  className={`${dancingScript.className} text-5xl sm:text-6xl lg:text-7xl font-bold tracking-normal text-slate-900 leading-[1.15]`}
                >
                  {landing.title}
                </h1>

                {/* Signature hand-drawn blue underline flourish */}
                <div className="flex mt-1">
                  <svg
                    className="h-4 w-56 sm:w-72 text-blue-300 dark:text-blue-400 opacity-90"
                    viewBox="0 0 200 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 8C45 3.5 155 9.5 197 5"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Subtitle / Plan Name */}
              {landing.planName && (
                <p className="text-sm sm:text-base leading-relaxed text-slate-600 font-semibold pt-1">
                  {landing.planName}
                </p>
              )}

              {/* Metadata Pill Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-surface/95 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_2px_8px_rgba(20,20,43,0.03)] backdrop-blur-sm">
                  <Clock size={14} className="text-slate-400 shrink-0" />
                  {landing.durationMinutes} mins
                </span>

                {landing.questionCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-surface/95 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_2px_8px_rgba(20,20,43,0.03)] backdrop-blur-sm">
                    <ListChecks size={14} className="text-slate-400 shrink-0" />
                    {landing.questionCount} questions
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-surface/95 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_2px_8px_rgba(20,20,43,0.03)] backdrop-blur-sm">
                  <Target size={14} className="text-slate-400 shrink-0" />
                  {landing.graded ? `Pass mark ${landing.passPercentage}%` : 'Not graded'}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-surface/95 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_2px_8px_rgba(20,20,43,0.03)] backdrop-blur-sm">
                  <RotateCcw size={14} className="text-slate-400 shrink-0" />
                  {landing.maxAttempts} attempts max
                </span>
              </div>

              {/* Primary Action & Pricing Row */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-3">
                <div className="inline-flex items-center gap-2 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md border border-emerald-300/80 bg-emerald-50/90 px-4 py-2.5 text-xs font-extrabold text-emerald-900 dark:border-emerald-800/70 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{feeLabel ?? 'Free Exam'}</span>
                </div>

                {action}

                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share exam"
                  className="h-11 w-11 shrink-0 grid place-items-center rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md border border-slate-300/80 bg-surface/95 hover:bg-slate-100 active:scale-95 text-slate-400 hover:text-slate-800 shadow-2xs transition-all cursor-pointer"
                  title="Share this exam"
                >
                  <Share2 size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  aria-label="Report exam"
                  className="h-11 w-11 shrink-0 grid place-items-center rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md border border-slate-300/80 bg-surface/95 hover:bg-slate-100 active:scale-95 text-slate-400 hover:text-red-600 dark:hover:text-red-400 shadow-2xs transition-all cursor-pointer"
                  title="Report this exam"
                >
                  <Flag size={15} />
                </button>
              </div>

              {landing.attemptsUsed > 0 && (
                <p className="text-xs font-medium text-slate-500 pt-1">
                  {landing.attemptsUsed} of {landing.maxAttempts} attempt{landing.maxAttempts === 1 ? '' : 's'} used
                  {latest?.gradeCardId && (
                    <>
                      {' · '}
                      <button
                        type="button"
                        onClick={() => onViewGradeCard(latest.gradeCardId!)}
                        className="cursor-pointer font-bold text-[#2962D6] dark:text-[#3B82F6] underline decoration-blue-300 underline-offset-4 hover:decoration-blue-600 dark:hover:decoration-blue-400"
                      >
                        View your grade card
                      </button>
                    </>
                  )}
                </p>
              )}
            </div>

            {/* RIGHT COLUMN: Exam Visual Artwork & Inclusions Frame */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-sm overflow-hidden rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 p-3.5 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm">
                
                {/* Generative Exam Artwork */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-lg rounded-bl-lg border border-slate-200/70 shadow-xs">
                  <ContentArt
                    seed={landing.examId || landing.title || 'exam'}
                    kind="EXAM"
                    category={kind || 'Exam'}
                    title={landing.title}
                  />
                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 rounded-full bg-slate-950/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                    <Sparkles size={11} className="text-amber-300" />
                    {kind}
                  </div>
                </div>

                {/* Exam Inclusions Highlights */}
                <div className="p-3 pt-4 space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2 font-medium">
                    <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Instant access to exam sitting & question sheet</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Award size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Detailed grade card & section performance breakdown</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Globe size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />
                    <span>
                      {landing.proctoringRequired
                        ? 'Proctored & secure testing environment'
                        : 'Flexible self-paced examination sitting'}
                    </span>
                  </div>
                  {landing.graded && (
                    <div className="flex items-center gap-2 font-medium">
                      <Sparkles size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Official certification upon passing ({landing.passPercentage}%)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Multi-Plan Switcher (if multiple plans available) ──────── */}
        {landing.plans.length > 1 && (
          <div className="pt-2 pb-4 flex justify-center">
            <div className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-slate-200/80 bg-surface/95 p-1.5 shadow-2xs backdrop-blur-sm">
              {landing.plans.map((p) => {
                const active = p.planId === landing.planId;
                return (
                  <button
                    key={p.planId}
                    type="button"
                    onClick={() => onSelectPlan(p.planId)}
                    aria-pressed={active}
                    className={`relative shrink-0 cursor-pointer rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition-colors ${
                      active
                        ? 'text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="examPlanPill"
                        className="absolute inset-0 rounded-full bg-slate-900"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TABS SECTION ================= */}
        <div className="pt-4 sm:pt-6">
          {/* Tabs Header - matching My Learning / Course / Event style */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
            {tabs.map((t) => (
              <TabButton
                key={t}
                active={activeTab === t}
                onClick={() => setActiveTab(t)}
                label={t}
              />
            ))}
          </div>

          {/* Tab Content Display */}
          <div key={activeTab} className="mt-8 arcade-fade">
            {/* OVERVIEW TAB */}
            {activeTab === 'Overview' && (
              <div className="space-y-8">
                {landing.prerequisite && !landing.prerequisite.met && (
                  <PrerequisiteNotice prerequisite={landing.prerequisite} onOpen={onOpenPrerequisite} />
                )}

                {/* About this Exam Card */}
                <div className="rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 p-6 sm:p-8 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    About this exam
                  </h2>
                  {landing.description || landing.planDescription || landing.purpose ? (
                    <div className="mt-3 space-y-3 text-sm sm:text-base leading-relaxed text-slate-600 font-normal">
                      {landing.description && <p className="whitespace-pre-wrap">{landing.description}</p>}
                      {landing.planDescription && <p className="whitespace-pre-wrap">{landing.planDescription}</p>}
                      {landing.purpose && <p className="whitespace-pre-wrap">{landing.purpose}</p>}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm sm:text-base text-slate-500 font-normal">
                      {meta.effect}
                    </p>
                  )}
                </div>

                {/* Key Exam Highlights Card */}
                <div className="rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 p-6 sm:p-8 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-6">
                    Key Specifications & Inclusions
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
                      <div className="text-xs text-slate-500 font-medium">Time Limit</div>
                      <div className="text-base font-bold text-slate-900">{landing.durationMinutes} Minutes</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                      <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
                      <div className="text-xs text-slate-500 font-medium">Passing Criteria</div>
                      <div className="text-base font-bold text-slate-900">{landing.graded ? `${landing.passPercentage}% Mark` : 'Ungraded'}</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                      <RotateCcw className="w-5 h-5 text-sky-600 dark:text-sky-400 mb-2" />
                      <div className="text-xs text-slate-500 font-medium">Attempt Policy</div>
                      <div className="text-base font-bold text-slate-900">{landing.maxAttempts} Attempts Allowed</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                      <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-2" />
                      <div className="text-xs text-slate-500 font-medium">Security & Proctoring</div>
                      <div className="text-base font-bold text-slate-900">{landing.proctoringRequired ? 'Proctored' : 'Standard'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* WHAT TO EXPECT TAB */}
            {activeTab === 'What to Expect' && (
              <div className="rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 p-6 sm:p-8 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-6">
                  What to expect during this exam
                </h2>
                <ul className="space-y-3.5">
                  <Expect
                    icon={<CalendarDays size={18} />}
                    title={
                      landing.accessWindow?.closesAt
                        ? `Closes ${formatWhen(landing.accessWindow.closesAt)}`
                        : landing.accessWindow?.opensAt
                        ? `Opens ${formatWhen(landing.accessWindow.opensAt)}`
                        : 'Self-paced access'
                    }
                    sub={
                      landing.accessWindow?.opensAt || landing.accessWindow?.closesAt
                        ? 'Exam sitting schedule set by the examination board'
                        : 'No fixed deadline; sit for the exam whenever you are ready'
                    }
                  />
                  <Expect
                    icon={<Clock size={18} />}
                    title={`${landing.durationMinutes} minute limit`}
                    sub="The timer starts immediately when you begin your attempt."
                  />
                  <Expect
                    icon={<RotateCcw size={18} />}
                    title={`${landing.maxAttempts} attempt${landing.maxAttempts === 1 ? '' : 's'} allowed`}
                    sub={
                      landing.attemptsRemaining > 0
                        ? `${landing.attemptsRemaining} attempt${landing.attemptsRemaining === 1 ? '' : 's'} remaining`
                        : 'All attempts have been used'
                    }
                  />
                  <Expect
                    icon={<Award size={18} />}
                    title="A comprehensive grade card for every sitting"
                    sub={
                      landing.graded
                        ? `Detailed marks by section, and pass or fail status evaluated against ${landing.passPercentage}%`
                        : 'Your score summary and question feedback for your own reference'
                    }
                  />
                  <Expect
                    icon={<ShieldCheck size={18} />}
                    title={landing.proctoringRequired ? 'Proctored, secured sitting' : 'Secured sitting'}
                    sub={`Leaving full screen, switching tabs or windows, copying, pasting or opening developer tools is recorded; ${landing.maxViolations} violation${landing.maxViolations === 1 ? '' : 's'} automatically end the sitting.`}
                  />
                  {landing.identityVerificationRequired && (
                    <Expect
                      icon={<ShieldCheck size={18} />}
                      title="Identity verification required"
                      sub="You submit a photo or ID verification before starting; an administrator reviews it."
                    />
                  )}
                  <Expect
                    icon={<Maximize2 size={18} />}
                    title="Own tab, full screen"
                    sub="The exam opens in its own tab and runs in full screen; the paper is hidden outside it."
                  />
                </ul>
              </div>
            )}

            {/* INSTRUCTIONS TAB */}
            {activeTab === 'Instructions' && landing.instructions != null && (
              <div className="rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 p-6 sm:p-8 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
                  Candidate Instructions
                </h2>
                <div className="text-slate-700 leading-relaxed text-sm sm:text-base">
                  <TiptapContentView body={JSON.stringify(landing.instructions)} emptyMessage="No instructions provided." />
                </div>
              </div>
            )}

            {/* YOUR ATTEMPTS TAB */}
            {activeTab === 'Your Attempts' && landing.history.length > 0 && (
              <div className="rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 p-6 sm:p-8 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                  Your Exam Attempts
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mb-6">
                  Each finished attempt includes a comprehensive grade card with complete section scoring.
                </p>

                <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-surface/90">
                  {landing.history.map((attempt) => (
                    <div key={attempt.attemptId} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">
                          Attempt {attempt.attemptNumber}
                        </p>
                        <p className="text-xs font-medium text-slate-400">
                          {attempt.submittedAt
                            ? formatWhen(attempt.submittedAt)
                            : attempt.status === 'IN_PROGRESS'
                            ? 'In progress'
                            : 'Not submitted'}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <AttemptOutcome attempt={attempt} graded={landing.graded} />
                        {attempt.gradeCardId && (
                          <button
                            type="button"
                            onClick={() => onViewGradeCard(attempt.gradeCardId!)}
                            className="rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm bg-[#2962D6] px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shrink-0 cursor-pointer"
                          >
                            Grade Card
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PREREQUISITES TAB */}
            {activeTab === 'Prerequisites' && landing.prerequisite && (
              <div className="rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 p-6 sm:p-8 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
                  Prerequisite Requirements
                </h2>
                <PrerequisiteNotice prerequisite={landing.prerequisite} onOpen={onOpenPrerequisite} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Honor Code Modal */}
      <HonorCodeModal
        isOpen={showHonorCode}
        onClose={() => setShowHonorCode(false)}
        onContinue={() => {
          setShowHonorCode(false);
          try {
            sessionStorage.setItem('arcade_honor_code_accepted', 'true');
          } catch {}
          onStart();
        }}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
        title="Report Exam"
        description="Help us understand what is wrong with this exam."
      />
    </main>
  );
}

function Expect({ icon, title, sub }: { icon: ReactNode; title: string; sub: string }) {
  return (
    <li className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/60">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
        {icon}
      </span>
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
      </div>
    </li>
  );
}

function AttemptOutcome({
  attempt,
  graded,
}: {
  attempt: AssessmentLandingResponse['history'][number];
  graded: boolean;
}) {
  if (attempt.awaitingReview) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
        <Hourglass size={13} /> Awaiting marking
      </span>
    );
  }
  if (attempt.percentage === null) {
    return <span className="text-xs font-medium text-slate-400">{attemptStatusLabel(attempt)}</span>;
  }
  if (!graded) {
    return <span className="text-xs font-semibold text-slate-500">Completed</span>;
  }
  return attempt.passed ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
      <CheckCircle2 size={13} /> Passed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
      Not passed
    </span>
  );
}

function blockedIcon(reason: AssessmentLandingResponse['blockedReason']) {
  switch (reason) {
    case 'NOT_STARTED_YET':
    case 'WINDOW_CLOSED':
      return <Clock size={16} />;
    case 'ATTEMPTS_EXHAUSTED':
    case 'RETAKE_APPROVAL_REQUIRED':
    case 'PREREQUISITE_NOT_MET':
      return <Lock size={16} />;
    case 'IDENTITY_REQUIRED':
      return <ShieldCheck size={16} />;
    default:
      return <AlertCircle size={16} />;
  }
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
