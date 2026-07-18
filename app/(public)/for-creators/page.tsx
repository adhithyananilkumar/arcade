"use client";

import React from "react";
import {
  GraduationCap, School, Briefcase, HeartHandshake, UserCheck, BookOpen,
  Wrench, FolderOpen, Users, Building, ClipboardCheck, Award,
  BarChart3, DollarSign, CheckSquare, Send, ArrowRight, Play, Sparkles
} from "lucide-react";
import Footer from "@/components/landing/Footer";
import TrueFocus from "@/components/landing/TrueFocus";
import MagicBento from "@/components/landing/MagicBento";
import VariableProximity from "@/components/landing/VariableProximity";
import "../courses/courses.css";
import "./for-creators.css";
import CollegesPageClient from "@/components/landing/CollegesPageClient";

export default function ForCreatorsPage() {
  const heroHeaderRef = React.useRef<HTMLDivElement>(null);
  const section2HeaderRef = React.useRef<HTMLDivElement>(null);
  const timelineScrollRef = React.useRef<HTMLDivElement>(null);
  const [animKey, setAnimKey] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setAnimKey((prev) => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimKey((prev) => prev + 1);
          if (timelineScrollRef.current) {
            timelineScrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
          }
        }
      },
      { threshold: 0.15 }
    );

    if (timelineScrollRef.current) {
      observer.observe(timelineScrollRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const contributionSteps = [
    {
      theme: "step-blue",
      title: "Universities & Colleges",
      description: "Publish accredited academic programs, manage departments, and coordinate class semesters.",
      icon: School,
    },
    {
      theme: "step-green",
      title: "Training Academies & Bootcamps",
      description: "Host hands-on training, manage student cohorts, and scale coding or technical bootcamps.",
      icon: Award,
    },
    {
      theme: "step-indigo",
      title: "Corporate Training Teams",
      description: "Onboard new employees, run skill assessments, and scale internal company training.",
      icon: Building,
    },
    {
      theme: "step-teal",
      title: "Nonprofits & Communities",
      description: "Deliver accessible public education, run social campaigns, and track community impact.",
      icon: HeartHandshake,
    },
    {
      theme: "step-amber",
      title: "Industry Experts & Consultants",
      description: "Monetize professional insights, build a personal brand, and host interactive workshops.",
      icon: UserCheck,
    },
    {
      theme: "step-purple",
      title: "Independent Content Creators",
      description: "Publish self-paced online courses, build online communities, and share learning resources.",
      icon: BookOpen,
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Draft & Build",
      description: "Construct lessons and upload high-fidelity media."
    },
    {
      step: "02",
      title: "Collaborate",
      description: "Invite peers to co-author and refine learning goals."
    },
    {
      step: "03",
      title: "Assess",
      description: "Embed rich coding sandboxes and final quizzes."
    },
    {
      step: "04",
      title: "Publish",
      description: "Go live instantly on the Arcade global catalog."
    },
    {
      step: "05",
      title: "Analyze",
      description: "Review insights and optimize student engagement."
    }
  ];

  const bentoCardData = [
    {
      color: '#0d0e1c',
      title: 'Course Builder',
      description: 'Design structural curriculum syllabi with drag-and-drop course building blocks.',
      label: 'Curriculum',
      icon: Wrench
    },
    {
      color: '#ffffff',
      title: 'Content Management',
      description: 'Upload videos, code sandbox files, slide decks, and rich articles.',
      label: 'Assets',
      icon: FolderOpen
    },
    {
      color: '#0d0e1c',
      title: 'Creator Collaboration',
      description: 'Invite guest co-authors, review drafts, and manage editing rights.',
      label: 'Teamwork',
      icon: Users
    },
    {
      color: '#ffffff',
      title: 'Organization Management',
      description: 'Configure custom white-label portals, branding, and team workspaces.',
      label: 'Portal',
      icon: Building
    },
    {
      color: '#0d0e1c',
      title: 'Assessments & Question Banks',
      description: 'Build graded quizzes, live coding assessments, and final examinations.',
      label: 'Grading',
      icon: ClipboardCheck
    },
    {
      color: '#ffffff',
      title: 'Certificates',
      description: 'Issue customized digital credentials upon successful course completion.',
      label: 'Credentials',
      icon: Award
    },
    {
      color: '#0d0e1c',
      title: 'Learner Analytics',
      description: 'Trace average completion rates, quiz scores, and dropoff charts.',
      label: 'Insights',
      icon: BarChart3
    },
    {
      color: '#ffffff',
      title: 'Revenue & Pricing',
      description: 'Establish single-payment pricing, bundles, or subscription tiers.',
      label: 'Billing',
      icon: DollarSign
    },
    {
      color: '#0d0e1c',
      title: 'Content Reviews',
      description: 'Monitor user feedback, compile flags, and verify course content quality.',
      label: 'Moderation',
      icon: CheckSquare
    },
    {
      color: '#ffffff',
      title: 'Course Publishing',
      description: 'Go live instantly with automated catalog listings on the Explore marketplace.',
      label: 'Deploy',
      icon: Send
    }
  ];

  return (
    <div className="landing-root min-h-screen flex flex-col relative z-10">

      {/* Capsule Navigation Header */}
      <CollegesPageClient />

      {/* Hero Intro Header Section */}
      <header ref={heroHeaderRef} className="max-w-[1200px] mx-auto w-full px-6 md:px-12 pt-20 pb-6 text-center space-y-6 relative z-10" style={{ position: 'relative' }}>
        <h1 className="text-5xl sm:text-7xl text-slate-900 tracking-tight leading-[1.05] max-w-4xl mx-auto">
          <VariableProximity
            label="Built for Every Educator"
            fromFontVariationSettings="'wght' 300, 'opsz' 20"
            toFontVariationSettings="'wght' 900, 'opsz' 80"
            containerRef={heroHeaderRef}
            radius={300}
            falloff="linear"
            className="variable-proximity-serif text-slate-900"
          />
        </h1>
        <p className="text-sm sm:text-base font-semibold text-slate-500 leading-relaxed max-w-2xl mx-auto">
          Create premium self-paced learning paths, manage team collaborations, and reach students globally with standard-setting publishing tools.
        </p>
      </header>

      {/* ── SECTION 1: Built for Every Educator ── */}
      <section className="max-w-[1200px] mx-auto w-full px-6 md:px-12 pt-0 pb-6 relative z-10">

        {/* Workflow Timeline — Circular Flight Path Layout */}
        <div className="relative w-full max-w-[960px] mx-auto select-none my-4">

          {/* Desktop/Tablet Layout: Symmetrical Circular Timeline */}
          <div className="hidden lg:block relative w-full h-[640px] z-10">
            {/* Trajectory Dotted Circle */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 960 640">
              <circle
                cx="480"
                cy="320"
                r="185"
                fill="none"
                stroke="#2451D6"
                strokeWidth="2"
                strokeDasharray="6 6"
                opacity="0.25"
                className="rotating-orbit-circle"
              />
            </svg>

            {/* Central Badge: "WHO CAN CONTRIBUTE" */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-52 h-52 rounded-full bg-white border border-slate-100/90 flex flex-col items-center justify-center text-center shadow-xl shadow-blue-500/5 p-6 center-pulse-badge">
              <span className="text-[10px] font-black text-[#2451D6] block tracking-[0.25em] uppercase mb-1">WHO CAN</span>
              <h3 className="text-2xl font-black text-slate-800 leading-tight font-space">CONTRIBUTE</h3>
              <div className="w-8 h-[2px] bg-[#2451D6] mt-2 opacity-50" />
            </div>

            {/* 6 Circularly Mapped Arrow Steps */}
            {[
              { title: 'Universities & Colleges', desc: 'Publish academic programs and coordinate semesters.', color: '#3b82f6', colorLight: '#93c5fd', colorDark: '#1d4ed8', left: '50%', top: '21.1%', cardLeft: '50%', cardTop: '6%', arrowAngle: 90 },
              { title: 'Training Bootcamps', desc: 'Host student cohorts and scale coding bootcamps.', color: '#10b981', colorLight: '#6ee7b7', colorDark: '#047857', left: '66.7%', top: '35.5%', cardLeft: '84.5%', cardTop: '35.5%', arrowAngle: 150 },
              { title: 'Corporate Teams', desc: 'Onboard employees and scale company training.', color: '#6366f1', colorLight: '#a5b4fc', colorDark: '#4338ca', left: '66.7%', top: '64.5%', cardLeft: '84.5%', cardTop: '64.5%', arrowAngle: 210 },
              { title: 'Nonprofits & Communities', desc: 'Deliver public education and track social impact.', color: '#14b8a6', colorLight: '#5eead4', colorDark: '#0f766e', left: '50%', top: '78.9%', cardLeft: '50%', cardTop: '94%', arrowAngle: 270 },
              { title: 'Industry Experts', desc: 'Monetize insights and host interactive workshops.', color: '#f59e0b', colorLight: '#fcd34d', colorDark: '#b45309', left: '33.3%', top: '64.5%', cardLeft: '15.5%', cardTop: '64.5%', arrowAngle: 330 },
              { title: 'Content Creators', desc: 'Publish courses and build online learning communities.', color: '#a855f7', colorLight: '#d8b4fe', colorDark: '#6b21a8', left: '33.3%', top: '35.5%', cardLeft: '15.5%', cardTop: '35.5%', arrowAngle: 30 }
            ].map((node, idx) => {
              return (
                <div key={idx} className="group">
                  {/* Floating 3D Arrow */}
                  <div
                    className="absolute z-20 transition-all duration-300 hover:scale-110 floating-arrow"
                    style={{
                      left: node.left,
                      top: node.top,
                      transform: 'translate(-50%, -50%)',
                      animationDelay: `${idx * 0.6}s`
                    }}
                  >
                    <svg
                      width="70"
                      height="70"
                      viewBox="0 0 120 120"
                      className="transition-transform duration-300 group-hover:-translate-y-1"
                      style={{ transform: `rotate(${node.arrowAngle}deg)` }}
                    >
                      <defs>
                        <linearGradient id={`arr-left-c-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={node.color} />
                          <stop offset="100%" stopColor={node.colorLight} />
                        </linearGradient>
                        <linearGradient id={`arr-right-c-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={node.colorDark} />
                          <stop offset="100%" stopColor={node.color} />
                        </linearGradient>
                      </defs>
                      {/* Left side of stealth arrow */}
                      <path d="M 60,15 L 20,90 L 60,70 Z" fill={`url(#arr-left-c-${idx})`} filter="drop-shadow(0 4px 6px rgba(0,0,0,0.12))" />
                      {/* Right side of stealth arrow */}
                      <path d="M 60,15 L 60,70 L 100,90 Z" fill={`url(#arr-right-c-${idx})`} filter="drop-shadow(0 4px 6px rgba(0,0,0,0.18))" />
                    </svg>
                  </div>

                  {/* Description Card */}
                  <div
                    className="absolute z-10 w-56 text-center transition-all duration-300 group-hover:scale-[1.03]"
                    style={{ left: node.cardLeft, top: node.cardTop, transform: 'translate(-50%, -50%)' }}
                  >
                    <h4 className="text-[16px] sm:text-[17px] font-black text-slate-800 mb-1.5" style={{ fontFamily: 'Voyage, "Playfair", Georgia, serif' }}>
                      {node.title}
                    </h4>
                    <p className="text-[12px] sm:text-[13px] font-semibold text-slate-500 leading-normal" style={{ fontFamily: 'Voyage, "Playfair", Georgia, serif' }}>
                      {node.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile/Tablet Layout: Clean Vertical List of Arrows */}
          <div className="lg:hidden flex flex-col gap-6 my-8 px-4">
            {[
              { title: 'Universities & Colleges', desc: 'Publish accredited academic programs, manage departments, and coordinate class semesters.', color: '#3b82f6', colorLight: '#93c5fd', colorDark: '#1d4ed8' },
              { title: 'Training Bootcamps', desc: 'Host student cohorts and scale coding or technical bootcamps.', color: '#10b981', colorLight: '#6ee7b7', colorDark: '#047857' },
              { title: 'Corporate Teams', desc: 'Onboard new employees, run skill assessments, and scale internal company training.', color: '#6366f1', colorLight: '#a5b4fc', colorDark: '#4338ca' },
              { title: 'Nonprofits & Communities', desc: 'Deliver accessible public education, run social campaigns, and track community impact.', color: '#14b8a6', colorLight: '#5eead4', colorDark: '#0f766e' },
              { title: 'Industry Experts', desc: 'Monetize professional insights, build a personal brand, and host interactive workshops.', color: '#f59e0b', colorLight: '#fcd34d', colorDark: '#b45309' },
              { title: 'Content Creators', desc: 'Publish self-paced online courses, build online communities, and share learning resources.', color: '#a855f7', colorLight: '#d8b4fe', colorDark: '#6b21a8' }
            ].map((node, idx) => (
              <div key={idx} className="flex gap-5 items-center bg-white border border-slate-100 p-4.5 rounded-2xl shadow-sm">
                <div className="flex-shrink-0">
                  <svg
                    width="54"
                    height="54"
                    viewBox="0 0 120 120"
                    style={{ transform: 'rotate(40deg)' }}
                  >
                    <defs>
                      <linearGradient id={`arr-left-mb-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={node.color} />
                        <stop offset="100%" stopColor={node.colorLight} />
                      </linearGradient>
                      <linearGradient id={`arr-right-mb-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={node.colorDark} />
                        <stop offset="100%" stopColor={node.color} />
                      </linearGradient>
                    </defs>
                    <path d="M 60,15 L 20,90 L 60,70 Z" fill={`url(#arr-left-mb-${idx})`} />
                    <path d="M 60,15 L 60,70 L 100,90 Z" fill={`url(#arr-right-mb-${idx})`} />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[15.5px] sm:text-base font-black text-slate-800 font-space mb-0.5">{node.title}</h4>
                  <p className="text-[12px] sm:text-[13px] font-semibold text-slate-400 leading-normal">{node.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Closing Platform Statement Card */}
        <div className="bg-gradient-to-r from-blue-50/50 via-[#EAF7EF]/40 to-indigo-50/30 rounded-[24px] border border-blue-100/40 p-8 text-center max-w-3xl mx-auto shadow-[0_12px_40px_rgba(36,81,214,0.01)] mt-12">
          <p className="font-space text-base md:text-lg font-bold text-slate-800 leading-relaxed">
            "Arcade gives you a professional platform to create engaging learning experiences and reach learners everywhere."
          </p>
        </div>

      </section>

      {/* ── SECTION 2: Everything You Need in One Place ── */}
      <section className="max-w-[1200px] mx-auto w-full px-6 md:px-12 pt-0 pb-16 space-y-10 relative z-10">

        {/* Subsection Header */}
        <div ref={section2HeaderRef} className="text-center space-y-4 max-w-xl mx-auto" style={{ position: 'relative' }}>
          <h2 className="text-4xl sm:text-5xl text-slate-900 tracking-tight leading-none">
            <VariableProximity
              label="Everything in One Place"
              fromFontVariationSettings="'wght' 300, 'opsz' 20"
              toFontVariationSettings="'wght' 900, 'opsz' 80"
              containerRef={section2HeaderRef}
              radius={200}
              falloff="linear"
              className="variable-proximity-serif text-slate-900 font-black"
            />
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 leading-relaxed">
            Manage your entire educational workflow from a single dashboard.
          </p>
        </div>

        {/* Workflow Timeline — Full-Width Curved Wave Timeline */}
        <div ref={timelineScrollRef} className="w-screen relative left-1/2 right-1/2 -translate-x-1/2 overflow-x-auto pb-12 scrollbar-hide select-none my-8">
          <div key={animKey} className="relative min-w-[1200px] h-[360px] w-full">

            {/* Background blobs inside timeline view */}
            <div className="pointer-events-none absolute -top-12 left-1/4 w-72 h-72 rounded-full opacity-10 bg-indigo-300 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-1/4 w-72 h-72 rounded-full opacity-10 bg-emerald-300 blur-3xl" />

            {/* SVG curve line stretching from X=0 to X=1200 */}
            <svg
              viewBox="0 0 1200 360"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
            >
              <defs>
                <linearGradient id="wave-pulse-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2451D6" stopOpacity="0" />
                  <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Soft glow shadow behind the line */}
              <path
                d="M 0,180 C 80,180 120,280 180,280 C 240,280 330,60 390,60 C 450,60 540,240 600,240 C 660,240 750,110 810,110 C 870,110 960,290 1020,290 C 1080,290 1120,190 1200,190"
                stroke="rgba(36, 81, 214, 0.08)"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
              />
              {/* Primary wave line */}
              <path
                d="M 0,180 C 80,180 120,280 180,280 C 240,280 330,60 390,60 C 450,60 540,240 600,240 C 660,240 750,110 810,110 C 870,110 960,290 1020,290 C 1080,290 1120,190 1200,190"
                stroke="#2451D6"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                className="animated-wave-line"
              />
              {/* Travelling light pulse along the wave */}
              <path
                d="M 0,180 C 80,180 120,280 180,280 C 240,280 330,60 390,60 C 450,60 540,240 600,240 C 660,240 750,110 810,110 C 870,110 960,290 1020,290 C 1080,290 1120,190 1200,190"
                stroke="url(#wave-pulse-grad)"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                className="wave-glow-pulse"
              />
            </svg>

            {/* Step elements mapped along the curve */}
            {[
              { step: '01', title: 'Draft & Build', desc: 'Construct lessons and upload high-fidelity media.', color: '#2451D6', left: '15%', nodeTop: '280px', cardTop: '95px', isLow: true, icon: Wrench },
              { step: '02', title: 'Collaborate', desc: 'Invite peers to co-author and refine learning goals.', color: '#10B981', left: '32.5%', nodeTop: '60px', cardTop: '255px', isLow: false, icon: Users },
              { step: '03', title: 'Assess', desc: 'Embed rich coding sandboxes and final quizzes.', color: '#6366F1', left: '50%', nodeTop: '240px', cardTop: '80px', isLow: true, icon: ClipboardCheck },
              { step: '04', title: 'Publish', desc: 'Go live instantly on the Arcade global catalog.', color: '#14B8A6', left: '67.5%', nodeTop: '110px', cardTop: '275px', isLow: false, icon: Send },
              { step: '05', title: 'Analyze', desc: 'Review insights and optimize student engagement.', color: '#F59E0B', left: '85%', nodeTop: '290px', cardTop: '100px', isLow: true, icon: BarChart3 },
            ].map((node, idx) => {
              const Icon = node.icon;
              const nodeDelay = `${0.4 + idx * 0.35}s`;
              const cardDelay = `${0.6 + idx * 0.35}s`;

              return (
                <div key={idx}>
                  {/* Pulsing ring behind the Hexagon */}
                  <div
                    className="hexagon-pulse-ring"
                    style={{
                      left: node.left,
                      top: node.nodeTop,
                      animationDelay: nodeDelay,
                    }}
                  />

                  {/* Hexagonal Node */}
                  <div
                    className="absolute z-20 animate-scale-in-hexagon"
                    style={{
                      left: node.left,
                      top: node.nodeTop,
                      transform: 'translate(-50%, -50%)',
                      animationDelay: nodeDelay,
                    }}
                  >
                    <div style={{ filter: 'drop-shadow(0 6px 16px rgba(36, 81, 214, 0.12))' }}>
                      <div
                        className="flex items-center justify-center w-14 h-14 bg-white border border-slate-100 transition-all duration-500 hover:scale-115 hover:bg-[#2451D6] hover:border-[#2451D6] hover:shadow-[0_0_20px_rgba(36,81,214,0.3)] group/hex"
                        style={{
                          clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                        }}
                      >
                        <Icon className="w-5 h-5 text-[#2451D6] transition-colors duration-300 group-hover/hex:text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Watermarked Text Card */}
                  <div
                    className="absolute z-10 w-64 text-center animate-fade-in-up-card group/card"
                    style={{
                      left: node.left,
                      top: node.cardTop,
                      transform: 'translate(-50%, -50%)',
                      animationDelay: cardDelay,
                    }}
                  >
                    {/* Watermark Number */}
                    <span
                      className="absolute text-[110px] font-black text-slate-100/70 select-none z-0 pointer-events-none leading-none -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 transition-all duration-500 ease-out group-hover/card:scale-110 group-hover/card:-translate-y-[60%] group-hover/card:text-blue-500/10"
                      style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                    >
                      {idx + 1}
                    </span>

                    {/* Content */}
                    <div className="relative z-10 p-2 transition-all duration-300 group-hover/card:-translate-y-1">
                      <h4 className="text-[17px] sm:text-[18px] font-black text-slate-800 mb-1.5 transition-colors duration-300 group-hover/card:text-[#2451D6]" style={{ fontFamily: 'Voyage, "Playfair", Georgia, serif' }}>
                        {node.title}
                      </h4>
                      <p className="text-[13px] sm:text-[14px] font-semibold text-slate-500 leading-normal" style={{ fontFamily: 'Voyage, "Playfair", Georgia, serif' }}>
                        {node.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        </div>

        {/* Dashboard Mockup Layout Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">

          {/* Mockup visual graphics panel */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-[24px] p-6 shadow-[0_20px_50px_rgba(36,81,214,0.03)] space-y-6 relative overflow-hidden">

            {/* Window dot controls */}
            <div className="flex gap-1.5 border-b border-slate-100 pb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-[9px] font-bold text-slate-400 ml-4">Workspace / Dashboard / Analytics</span>
            </div>

            {/* Simulated analytics widgets */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#F8F9FC] border border-slate-100 rounded-xl p-3.5 space-y-1">
                <span className="text-[9px] font-black text-slate-400 block tracking-wider uppercase">REVENUE</span>
                <span className="font-space text-base font-extrabold text-[#2451D6]">$12,840</span>
              </div>
              <div className="bg-[#F8F9FC] border border-slate-100 rounded-xl p-3.5 space-y-1">
                <span className="text-[9px] font-black text-slate-400 block tracking-wider uppercase">ENROLLMENTS</span>
                <span className="font-space text-base font-extrabold text-slate-800">1,480</span>
              </div>
              <div className="bg-[#F8F9FC] border border-slate-100 rounded-xl p-3.5 space-y-1">
                <span className="text-[9px] font-black text-slate-400 block tracking-wider uppercase">RATING</span>
                <span className="font-space text-base font-extrabold text-[#10B981]">4.9★</span>
              </div>
            </div>

            {/* Course draft rows */}
            <div className="space-y-3">
              <span className="text-[9px] font-black text-slate-400 block tracking-wider uppercase">ACTIVE CURRICULUM</span>

              <div className="flex items-center justify-between border border-slate-100 p-3 rounded-xl bg-white">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center font-bold text-[#2451D6] text-xs">JS</span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800" style={{ fontFamily: 'Voyage, "Playfair", Georgia, serif', fontWeight: 600 }}>Advanced JS Engine</h5>
                    <span className="text-[9px] font-semibold text-slate-400" style={{ fontFamily: 'Voyage, "Playfair", Georgia, serif' }}>12 Modules • 148 Graded Questions</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[8px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 uppercase tracking-wider">Active</span>
              </div>

              <div className="flex items-center justify-between border border-slate-100 p-3 rounded-xl bg-white/70">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#EAF7EF] flex items-center justify-center font-bold text-[#10B981] text-xs">TS</span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800" style={{ fontFamily: 'Voyage, "Playfair", Georgia, serif', fontWeight: 600 }}>Introduction to TypeScript</h5>
                    <span className="text-[9px] font-semibold text-slate-400" style={{ fontFamily: 'Voyage, "Playfair", Georgia, serif' }}>8 Modules • Draft Sandbox</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[8px] font-black text-amber-700 bg-amber-50 border border-amber-100 uppercase tracking-wider">Reviewing</span>
              </div>
            </div>

          </div>

          {/* Value proposition text on the side */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-space text-2xl font-bold text-slate-900 leading-tight" style={{ fontFamily: 'Voyage, "Playfair", Georgia, serif', fontWeight: 600 }}>
              A Complete Command Center
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 leading-relaxed" style={{ fontFamily: 'Voyage, "Playfair", Georgia, serif' }}>
              Skip complex integrations. Build courses, manage co-authors, review curriculum feedback, and configure custom billing cycles in a sleek, glassmorphic layout.
            </p>
            <div className="pt-4">
              <a
                href="/content-creator"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#2451D6] hover:bg-blue-700 text-white font-bold text-xs tracking-wider uppercase shadow-md shadow-blue-500/10 hover:shadow-lg transition-all duration-300"
              >
                <span>Get Started Now</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>

        </div>

        {/* Responsive Grid of Feature Cards (10 fields) using MagicBento */}
        <div className="space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] font-black text-slate-400 block tracking-wider uppercase">10 CORE CREATOR UTILITIES</span>
          </div>

          <div className="magic-bento-wrapper overflow-hidden rounded-[24px]">
            <MagicBento
              cardData={bentoCardData}
              textAutoHide={false}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={true}
              clickEffect={true}
              spotlightRadius={300}
              particleCount={12}
              glowColor="36, 81, 214"
            />
          </div>
        </div>

      </section>





    </div>
  );
}
