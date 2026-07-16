"use client";

import React from "react";
import {
  GraduationCap, School, Briefcase, HeartHandshake, UserCheck, BookOpen,
  Wrench, FolderOpen, Users, Building, ClipboardCheck, Award,
  BarChart3, DollarSign, CheckSquare, Send, ArrowRight, Play, Sparkles
} from "lucide-react";
import HeroNav from "@/components/landing/HeroNav";
import Footer from "@/components/landing/Footer";
import TrueFocus from "@/components/landing/TrueFocus";
import MagicBento from "@/components/landing/MagicBento";
import VariableProximity from "@/components/landing/VariableProximity";
import "../courses/courses.css";
import "./for-creators.css";

export default function ForCreatorsPage() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const circleRef = React.useRef<HTMLDivElement>(null);
  const heroHeaderRef = React.useRef<HTMLDivElement>(null);
  const section2HeaderRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [connections, setConnections] = React.useState<{ x1: number; y1: number; x2: number; y2: number; color: string }[]>([]);

  React.useEffect(() => {
    const updateCoords = () => {
      if (!containerRef.current || !circleRef.current) return;
      if (window.innerWidth <= 860) {
        setConnections([]);
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const circleRect = circleRef.current.getBoundingClientRect();

      const circleX = circleRect.left + circleRect.width / 2 - containerRect.left;
      const circleY = circleRect.top + circleRect.height / 2 - containerRect.top;

      const colors = ["#3557e8", "#6c3ce0", "#1f9e6d", "#d8425f", "#d18a1d", "#1097a3"];
      const newCoords = cardRefs.current.map((card, idx) => {
        if (!card) return null;
        const cardRect = card.getBoundingClientRect();
        const cardX = cardRect.left - containerRect.left;
        const cardY = cardRect.top + cardRect.height / 2 - containerRect.top;

        const angle = Math.atan2(cardY - circleY, cardX - circleX);
        const startRadius = 166; // 320px / 2 + 6px border thickness
        const x1 = circleX + startRadius * Math.cos(angle);
        const y1 = circleY + startRadius * Math.sin(angle);

        return {
          x1,
          y1,
          x2: cardX,
          y2: cardY,
          color: colors[idx % colors.length]
        };
      }).filter(Boolean) as { x1: number; y1: number; x2: number; y2: number; color: string }[];

      setConnections(newCoords);
    };

    updateCoords();

    window.addEventListener("resize", updateCoords);

    const timers = [
      setTimeout(updateCoords, 100),
      setTimeout(updateCoords, 300),
      setTimeout(updateCoords, 600),
      setTimeout(updateCoords, 1200)
    ];

    return () => {
      window.removeEventListener("resize", updateCoords);
      timers.forEach(clearTimeout);
    };
  }, []);



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
      <HeroNav />

      {/* Hero Intro Header Section */}
      <header ref={heroHeaderRef} className="max-w-[1200px] mx-auto w-full px-6 md:px-12 pt-36 pb-16 text-center space-y-6 relative z-10" style={{ position: 'relative' }}>
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
      <section className="max-w-[1200px] mx-auto w-full px-6 md:px-12 py-8 relative z-10">

        {/* Process Infographic Container - Wrapped in a card box with gradient and glow effects */}
        <div className="relative overflow-hidden max-w-[1020px] mx-auto rounded-[28px] p-[2px]" style={{ background: 'linear-gradient(135deg, #c7d7fa, #dbeafe, #e0f2fe, #d1fae5, #ede9fe)' }}>
          <div className="relative bg-white/80 backdrop-blur-2xl rounded-[26px] p-5 sm:p-8 overflow-hidden">
            {/* Decorative glow blobs */}
            <div className="pointer-events-none absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-35" style={{ background: 'radial-gradient(circle, #a5b4fc, transparent 70%)' }} />
            <div className="pointer-events-none absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, #6ee7b7, transparent 70%)' }} />
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(ellipse, #818cf8, transparent 70%)' }} />

            <div ref={containerRef} className="process-container relative z-10">

              {/* Dynamic dot-connector SVG lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden md:block">
                {connections.map((c, i) => (
                  <g key={i}>
                    <line
                      x1={c.x1}
                      y1={c.y1}
                      x2={c.x2}
                      y2={c.y2}
                      stroke={c.color}
                      strokeWidth="2.5"
                      strokeDasharray="5 5"
                      opacity="0.8"
                    />
                    <circle
                      cx={c.x2}
                      cy={c.y2}
                      r="4.5"
                      fill="#ffffff"
                      stroke={c.color}
                      strokeWidth="2"
                      opacity="0.6"
                    />
                    <circle
                      cx={c.x1}
                      cy={c.y1}
                      r="4.5"
                      fill="#ffffff"
                      stroke={c.color}
                      strokeWidth="2"
                      opacity="0.6"
                    />
                  </g>
                ))}
              </svg>

              {/* Left Column: Central Circle Hub */}
              <div className="process-circle-wrapper relative z-10">
                <div className="circle-ring-back" />

                <div ref={circleRef} className="process-circle" style={{ border: '6px solid #0f172a', fontFamily: 'Georgia, "Times New Roman", serif' }}>
                  <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>WHO ALL CAN</span>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '42px', fontWeight: 500, color: '#3547e0', lineHeight: 1, margin: '10px 0' }}>Contribute</h3>
                  <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>TO ARCADE.</span>
                </div>
              </div>

              {/* Right Column: Pill-shaped Cards Stack */}
              <div className="process-stack relative z-10">

                {/* Card 1 */}
                <div ref={(el) => { cardRefs.current[0] = el; }} className="process-card pastel-blue">
                  <div className="pill-container">
                    <div className="flex items-center">
                      <div className="number-badge">
                        01
                      </div>
                      <div className="flex flex-col">
                        <h4>Universities & Colleges</h4>
                        <p>Publish accredited academic programs, manage departments, and coordinate class semesters.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div ref={(el) => { cardRefs.current[1] = el; }} className="process-card pastel-indigo">
                  <div className="pill-container">
                    <div className="flex items-center">
                      <div className="number-badge">
                        02
                      </div>
                      <div className="flex flex-col">
                        <h4>Training Academies & Bootcamps</h4>
                        <p>Host hands-on training, manage student cohorts, and scale coding or technical bootcamps.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div ref={(el) => { cardRefs.current[2] = el; }} className="process-card pastel-green">
                  <div className="pill-container">
                    <div className="flex items-center">
                      <div className="number-badge">
                        03
                      </div>
                      <div className="flex flex-col">
                        <h4>Corporate Training Teams</h4>
                        <p>Onboard new employees, run skill assessments, and scale internal company training.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 4 */}
                <div ref={(el) => { cardRefs.current[3] = el; }} className="process-card pastel-pink">
                  <div className="pill-container">
                    <div className="flex items-center">
                      <div className="number-badge">
                        04
                      </div>
                      <div className="flex flex-col">
                        <h4>Nonprofits & Communities</h4>
                        <p>Deliver accessible public education, run social campaigns, and track community impact.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 5 */}
                <div ref={(el) => { cardRefs.current[4] = el; }} className="process-card pastel-amber">
                  <div className="pill-container">
                    <div className="flex items-center">
                      <div className="number-badge">
                        05
                      </div>
                      <div className="flex flex-col">
                        <h4>Industry Experts & Consultants</h4>
                        <p>Monetize professional insights, build a personal brand, and host interactive workshops.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 6 */}
                <div ref={(el) => { cardRefs.current[5] = el; }} className="process-card pastel-teal">
                  <div className="pill-container">
                    <div className="flex items-center">
                      <div className="number-badge">
                        06
                      </div>
                      <div className="flex flex-col">
                        <h4>Independent Content Creators</h4>
                        <p>Publish self-paced online courses, build online communities, and share learning resources.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* Closing Platform Statement Card */}
        <div className="bg-gradient-to-r from-blue-50/50 via-[#EAF7EF]/40 to-indigo-50/30 rounded-[24px] border border-blue-100/40 p-8 text-center max-w-3xl mx-auto shadow-[0_12px_40px_rgba(36,81,214,0.01)]">
          <p className="font-space text-base md:text-lg font-bold text-slate-800 leading-relaxed">
            "Arcade gives you a professional platform to create engaging learning experiences and reach learners everywhere."
          </p>
        </div>

      </section>

      {/* ── SECTION 2: Everything You Need in One Place ── */}
      <section className="max-w-[1200px] mx-auto w-full px-6 md:px-12 py-16 space-y-20 relative z-10">

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

        {/* Workflow Timeline — Horizontal Winding Road Design */}
        <div className="relative overflow-hidden rounded-[28px] p-[1.5px]" style={{ background: 'linear-gradient(135deg, #c7d7fa 0%, #dbeafe 50%, #ede9fe 100%)' }}>
          <div className="bg-white/80 backdrop-blur-xl rounded-[26px] px-8 sm:px-12 py-10 relative overflow-hidden">

            {/* Background blobs */}
            <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #818cf8, transparent 70%)' }} />
            <div className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #6ee7b7, transparent 70%)' }} />

            <span className="text-[10px] font-black text-[#2451D6] block tracking-[0.25em] uppercase mb-8 text-center">● CREATOR WORKFLOW LIFECYCLE ●</span>

            {/* Road + cards layout */}
            <div className="relative w-full" style={{ height: '320px' }}>

              {/* SVG winding road */}
              <svg
                viewBox="0 0 1000 200"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full"
                style={{ height: '100%' }}
                fill="none"
              >
                {/* Dark road surface */}
                <path
                  d="M0,120 C80,120 120,60 200,80 C280,100 320,140 400,120 C480,100 520,60 600,80 C680,100 720,140 800,120 C880,100 920,60 1000,80"
                  stroke="#1e293b"
                  strokeWidth="28"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Dashed center line */}
                <path
                  d="M0,120 C80,120 120,60 200,80 C280,100 320,140 400,120 C480,100 520,60 600,80 C680,100 720,140 800,120 C880,100 920,60 1000,80"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeDasharray="18 14"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.7"
                />
                {/* Road edge lines */}
                <path
                  d="M0,120 C80,120 120,60 200,80 C280,100 320,140 400,120 C480,100 520,60 600,80 C680,100 720,140 800,120 C880,100 920,60 1000,80"
                  stroke="white"
                  strokeWidth="28"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.05"
                />
              </svg>

              {/* Step nodes — positioned along the road path */}
              {[
                { left: '3%',  top: '42%', cardTop: true,  step: '01', title: 'Draft & Build',  desc: 'Construct lessons and upload high-fidelity media.' },
                { left: '23%', top: '22%', cardTop: false, step: '02', title: 'Collaborate',    desc: 'Invite peers to co-author and refine learning goals.' },
                { left: '43%', top: '42%', cardTop: true,  step: '03', title: 'Assess',         desc: 'Embed rich coding sandboxes and final quizzes.' },
                { left: '63%', top: '22%', cardTop: false, step: '04', title: 'Publish',        desc: 'Go live instantly on the Arcade global catalog.' },
                { left: '83%', top: '42%', cardTop: true,  step: '05', title: 'Analyze',        desc: 'Review insights and optimize student engagement.' },
              ].map((node, i) => (
                <div
                  key={i}
                  className="absolute flex flex-col items-center"
                  style={{ left: node.left, top: node.top, transform: 'translate(-50%, -50%)' }}
                >
                  {/* Card above the road */}
                  {node.cardTop && (
                    <div className="mb-2 bg-white border border-slate-200 rounded-2xl px-3 py-2.5 shadow-lg shadow-blue-100/50 w-36 text-center" style={{ marginBottom: '6px' }}>
                      <h4 className="text-[11px] font-black text-slate-900 leading-tight" style={{ fontFamily: 'Voyage, "Playfair", Georgia, serif' }}>{node.title}</h4>
                      <p className="text-[9px] text-slate-500 leading-tight mt-0.5" style={{ fontFamily: 'Voyage, "Playfair", Georgia, serif' }}>{node.desc}</p>
                    </div>
                  )}

                  {/* Connector dot on road */}
                  <div className={`relative z-20 flex items-center justify-center w-10 h-10 rounded-full border-3 shadow-lg shadow-blue-500/30 ${node.cardTop ? 'mt-0' : 'mb-0'}`}
                    style={{ background: 'linear-gradient(135deg, #2451D6, #4f76e8)', border: '3px solid white' }}>
                    <span className="text-[10px] font-black text-white">{node.step}</span>
                  </div>

                  {/* Card below the road */}
                  {!node.cardTop && (
                    <div className="mt-2 bg-white border border-slate-200 rounded-2xl px-3 py-2.5 shadow-lg shadow-blue-100/50 w-36 text-center" style={{ marginTop: '6px' }}>
                      <h4 className="text-[11px] font-black text-slate-900 leading-tight" style={{ fontFamily: 'Voyage, "Playfair", Georgia, serif' }}>{node.title}</h4>
                      <p className="text-[9px] text-slate-500 leading-tight mt-0.5" style={{ fontFamily: 'Voyage, "Playfair", Georgia, serif' }}>{node.desc}</p>
                    </div>
                  )}
                </div>
              ))}

            </div>

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
                  <span className="w-8 h-8 rounded-lg bg-[#EAF7EF] flex items-center justify-center font-bold text-[#10B981] text-xs">AI</span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800" style={{ fontFamily: 'Voyage, "Playfair", Georgia, serif', fontWeight: 600 }}>Deep Neural Networks</h5>
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
