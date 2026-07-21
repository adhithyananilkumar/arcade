"use client";

import React, { useState, useRef } from "react";
import {
  BookOpen,
  Users,
  BarChart3,
  Play,
  ArrowRight,
  Terminal,
  Layers,
  ChevronDown,
  GraduationCap,
  Building2,
  Briefcase,
  Heart,
  User,
  UserCheck,
  Cpu,
  Sparkles,
  Award
} from "lucide-react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import DotGrid from "@/components/landing/DotGrid";
import VariableProximity from "@/components/landing/VariableProximity";
import CardScanner from "@/components/landing/CardScanner";
import CollegesEcosystem from "@/components/landing/CollegesEcosystem";
import BorderGlow from "@/components/landing/BorderGlow";
import "./for-creators.css";

export default function ForCreatorsPage() {
  const shouldReduceMotion = useReducedMotion();
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  const fadeInVariant = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: (customDelay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as any,
        delay: customDelay,
      },
    }),
  } as any;



  // Hero Container Ref for VariableProximity mouse tracking
  const heroContainerRef = useRef<HTMLDivElement>(null);

  // Creator Journey milestones
  const [activeMilestone, setActiveMilestone] = useState<number>(1);

  // Dashboard Capabilities active tab
  const [activeTab, setActiveTab] = useState<"builder" | "collaboration" | "analytics">("builder");

  // Two ways to publish profile tab
  const [activePubTab, setActivePubTab] = useState<"indep" | "org">("indep");

  // Linked highlight state for publication panels
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  // FAQ states
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({
    0: true, // open the first FAQ by default
  });

  const toggleFaq = (idx: number) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const journeySteps = [
    {
      num: "01",
      title: "Verify identity",
      desc: "Complete a secure KYC identity check in minutes.",
    },
    {
      num: "02",
      title: "Build course",
      desc: "Construct lessons, upload videos, and set playground terminals.",
    },
    {
      num: "03",
      title: "Content review",
      desc: "QA check validates lesson structure within 24 hours.",
    },
    {
      num: "04",
      title: "Track & optimize",
      desc: "Go live globally and monitor enrollment metrics.",
    },
  ];

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
    <div className="for-creators-root pt-2 lg:pt-4">

      {/* HERO SECTION WITH QUAD SELECTOR */}
      <section className="hero relative z-10 bg-transparent pt-0 pb-8 lg:pb-12 overflow-hidden">
        {/* React Bits Interactive Dot Grid Canvas */}
        <DotGrid
          dotSize={2}
          gap={32}
          baseColor="rgba(99, 102, 241, 0.05)"
          activeColor="#6366F1"
          proximity={130}
          className="absolute inset-0 -z-1 pointer-events-none"
        />

        <div className="wrap grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">

            {/* Heading */}
            <motion.div
              variants={fadeInVariant}
              initial="hidden"
              animate="visible"
              custom={0.1}
              className="mb-8 select-none"
            >
              <div
                style={{ fontFamily: "'Caveat', cursive" }}
                className="text-3xl sm:text-4xl text-zinc-500 font-semibold mb-2"
              >
                Create. Teach. Inspire...
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 leading-[1.1] mb-2 uppercase">
                What Capability <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">Do you want?</span>
              </h1>
              {/* Handdrawn underline accent using SVG */}
              <svg width="220" height="12" viewBox="0 0 220 12" fill="none" className="mt-1">
                <path d="M4 8C45 4.5 125 1.5 216 4.5" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
                <path d="M12 9.5C65 7 130 5.5 192 7" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              </svg>
            </motion.div>

            {/* Description */}
            <motion.p
              variants={fadeInVariant}
              initial="hidden"
              animate="visible"
              custom={0.3}
              className="text-base sm:text-lg text-zinc-600 leading-relaxed mb-8 max-w-xl"
            >
              Empower your educators, organizations, and developers. Build, host, and scale professional courses and coding labs natively on Arcade. Provide hands-on learning experiences and certifications that help your community level up.
            </motion.p>



            {/* CTAs */}
            <motion.div
              variants={fadeInVariant}
              initial="hidden"
              animate="visible"
              custom={0.5}
              className="flex flex-wrap gap-3 items-center w-full sm:w-auto"
            >
              <a
                href="/sign?mode=signup"
                className="w-full sm:w-auto text-center bg-zinc-950 hover:bg-zinc-800 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-1.5 text-xs"
              >
                <span>Become a Creator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <a
                href="#faq"
                className="w-full sm:w-auto text-center bg-white hover:bg-zinc-50 text-zinc-700 font-medium px-5 py-2.5 rounded-lg border border-zinc-200 shadow-sm transition-all duration-200 flex items-center justify-center gap-1 text-xs"
              >
                <span>Learn More</span>
              </a>
            </motion.div>
          </div>

          {/* Right Column: Interactive Node Network Illustration */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative w-full pt-8 lg:pt-0">
            {/* Outer Decorative Glow */}
            <div className="absolute inset-0 bg-radial-gradient from-indigo-100/20 to-transparent blur-3xl -z-10" />

            <CollegesEcosystem
              activeFeature={activeFeature}
              setActiveFeature={setActiveFeature}
            />
          </div>

        </div>
      </section>

      {/* STAT BAR */}
      <section className="statbar">
        <div className="wrap" style={{ padding: 0 }}>
          <div className="statbar-inner">
            <div className="statbar-item"><span className="num">4</span><span className="txt"><b>Content formats</b><span>Courses, workshops, webinars, articles</span></span></div>
            <div className="statbar-item"><span className="num">10</span><span className="txt"><b>Creator tools</b><span>All in one dashboard</span></span></div>
            <div className="statbar-item"><span className="num">6</span><span className="txt"><b>Educator types</b><span>Solo experts to institutions</span></span></div>
            <div className="statbar-item"><span className="num">2</span><span className="txt"><b>Trust checkpoints</b><span>Identity check, then content review</span></span></div>
          </div>
        </div>
      </section>

      {/* THE CREATOR JOURNEY ROAD (REDUNDANCY FIXED) */}
      <section className="milestone-sec" id="path">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">How it works</span>
            <h2>Your <span className="yellow-underline">path</span> from idea to published course</h2>
            <p>Four simple stages take you from verification to a growing catalog of global learning experiences.</p>
          </div>

          <div className="milestones-track">
            {/* Dashed connector line */}
            <div className="milestones-line">
              <motion.div
                className="milestones-line-active"
                animate={{ width: `${(activeMilestone / (journeySteps.length - 1)) * 100}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 15 }}
              />
            </div>

            {journeySteps.map((step, idx) => {
              const isCompleted = idx < activeMilestone;
              const isActive = idx === activeMilestone;
              const nodeColors = ["#6366f1", "#f59e0b", "#14b8a6", "#10b981"];
              const signatureColor = nodeColors[idx];

              return (
                <div
                  key={idx}
                  className={`milestone-item ${isActive ? "active" : ""}`}
                  onClick={() => setActiveMilestone(idx)}
                >
                  <motion.div
                    animate={{
                      backgroundColor: isActive || isCompleted
                        ? signatureColor
                        : "#ffffff",
                      borderColor: isActive || isCompleted
                        ? signatureColor
                        : "#e4e4e7",
                      color: (isActive || isCompleted) ? "#ffffff" : "#a1a1aa",
                      scale: isActive ? 1.12 : 1,
                      boxShadow: isActive
                        ? `0 0 0 4px #ffffff, 0 10px 20px ${signatureColor}40`
                        : isCompleted
                          ? `0 0 0 4px #ffffff, 0 8px 16px ${signatureColor}20`
                          : "0 0 0 4px #ffffff"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="milestone-node relative"
                  >
                    {isCompleted ? (
                      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <span>{step.num}</span>
                    )}

                    {/* Ping ripple effect only on active node */}
                    {isActive && (
                      <span
                        className="absolute inset-0 rounded-full border-2 animate-ping pointer-events-none"
                        style={{
                          borderColor: `${signatureColor}80`,
                          animationDuration: "2s"
                        }}
                      />
                    )}
                  </motion.div>

                  <div className="w-full">
                    <BorderGlow
                      edgeSensitivity={40}
                      glowColor={idx === 0 ? "243 75 60" : idx === 1 ? "38 95 50" : idx === 2 ? "174 80 40" : "160 80 45"}
                      backgroundColor="#ffffff"
                      borderRadius={16}
                      glowRadius={20}
                      glowIntensity={isActive ? 0.8 : 0.35}
                      coneSpread={25}
                      animated={isActive}
                      colors={
                        idx === 0
                          ? ['#818cf8', '#a5b4fc', '#c7d2fe']
                          : idx === 1
                            ? ['#fbbf24', '#fcd34d', '#fde68a']
                            : idx === 2
                              ? ['#2dd4bf', '#5eead4', '#99f6e4']
                              : ['#34d399', '#6ee7b7', '#a7f3d0']
                      }
                      fillOpacity={isActive ? 0.06 : 0.02}
                      className={`w-full cursor-pointer mt-4 transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-70 hover:opacity-90"
                        }`}
                    >
                      <div className="p-4 flex flex-col items-center justify-center text-center">
                        <h4 className={`text-sm font-extrabold mb-1 leading-snug ${isActive ? "text-zinc-950" : "text-zinc-500"
                          }`}>
                          {step.title}
                        </h4>
                        <p className={`text-[11px] leading-normal max-w-[155px] mx-auto font-medium ${isActive ? "text-zinc-500 font-medium" : "text-zinc-400"
                          }`}>
                          {step.desc}
                        </p>
                      </div>
                    </BorderGlow>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile timeline cards */}
          <div className="mobile-milestones">
            {journeySteps.map((step, idx) => {
              const isCompleted = idx < activeMilestone;
              const isActive = idx === activeMilestone;
              const nodeColors = ["#6366f1", "#f59e0b", "#14b8a6", "#10b981"];
              const signatureColor = nodeColors[idx];

              return (
                <div
                  key={idx}
                  onClick={() => setActiveMilestone(idx)}
                  className="w-full animate-none"
                >
                  <BorderGlow
                    edgeSensitivity={40}
                    glowColor={idx === 0 ? "243 75 60" : idx === 1 ? "38 95 50" : idx === 2 ? "174 80 40" : "160 80 45"}
                    backgroundColor="#ffffff"
                    borderRadius={16}
                    glowRadius={20}
                    glowIntensity={isActive ? 0.8 : 0.35}
                    coneSpread={25}
                    animated={isActive}
                    colors={
                      idx === 0
                        ? ['#818cf8', '#a5b4fc', '#c7d2fe']
                        : idx === 1
                          ? ['#fbbf24', '#fcd34d', '#fde68a']
                          : idx === 2
                            ? ['#2dd4bf', '#5eead4', '#99f6e4']
                            : ['#34d399', '#6ee7b7', '#a7f3d0']
                    }
                    fillOpacity={isActive ? 0.06 : 0.02}
                    className={`w-full mt-2 transition-opacity duration-300 ${isActive ? "active opacity-100" : "opacity-70 hover:opacity-90"
                      }`}
                  >
                    <div className="p-4 flex gap-3.5 items-center">
                      <span
                        className={`mobile-milestone-num text-white transition-colors duration-300`}
                        style={{
                          backgroundColor: isCompleted || isActive ? signatureColor : "#e4e4e7",
                          color: isCompleted || isActive ? "#ffffff" : "#a1a1aa"
                        }}
                      >
                        {isCompleted ? (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        ) : (
                          step.num
                        )}
                      </span>
                      <div className="mobile-milestone-info text-left">
                        <h4 className={`mobile-milestone-title ${isActive ? "text-zinc-950 font-bold" : "text-zinc-500"}`}>{step.title}</h4>
                        <p className={`mobile-milestone-desc ${isActive ? "text-zinc-600 font-medium" : "text-zinc-400"}`}>{step.desc}</p>
                      </div>
                    </div>
                  </BorderGlow>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* INTERACTIVE CAPABILITIES DASHBOARD */}
      <section className="dashboard-sec" id="tools">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Interactive Engine</span>
            <h2>Everything in one place</h2>
            <p>Your educational dashboard designed to manage drafts, author collaborations, and students metrics.</p>
          </div>

          <div className="dashboard-grid">
            {/* Left side Tab triggers */}
            <div className="dashboard-tabs-list">
              <button
                type="button"
                className={`dashboard-tab-trigger ${activeTab === "builder" ? "active" : ""}`}
                onClick={() => setActiveTab("builder")}
              >
                <span className="dashboard-tab-ic"><BookOpen className="w-5 h-5" /></span>
                <div className="dashboard-tab-text-wrap">
                  <h4 className="dashboard-tab-title">Course Builder</h4>
                  <span className="dashboard-tab-desc">Natively assemble lesson slides, video files, and drag-and-drop structures.</span>
                </div>
              </button>

              <button
                type="button"
                className={`dashboard-tab-trigger ${activeTab === "collaboration" ? "active" : ""}`}
                onClick={() => setActiveTab("collaboration")}
              >
                <span className="dashboard-tab-ic"><Users className="w-5 h-5" /></span>
                <div className="dashboard-tab-text-wrap">
                  <h4 className="dashboard-tab-title">Teammate Collaboration</h4>
                  <span className="dashboard-tab-desc">Add co-authors with edit authorization rights and co-author credit tags.</span>
                </div>
              </button>

              <button
                type="button"
                className={`dashboard-tab-trigger ${activeTab === "analytics" ? "active" : ""}`}
                onClick={() => setActiveTab("analytics")}
              >
                <span className="dashboard-tab-ic"><BarChart3 className="w-5 h-5" /></span>
                <div className="dashboard-tab-text-wrap">
                  <h4 className="dashboard-tab-title">Learner Analytics</h4>
                  <span className="dashboard-tab-desc">Track enrollment numbers, progress averages, and certificate credits in real-time.</span>
                </div>
              </button>
            </div>

            {/* Right side Dashboard Mock view */}
            <div className="dashboard-preview-window">
              <div className="dashboard-preview-header">
                <span className="dashboard-preview-title">
                  {activeTab === "builder" && "Workspace sandbox / Syllabus Draft"}
                  {activeTab === "collaboration" && "Co-Author Registry"}
                  {activeTab === "analytics" && "Metrics Console"}
                </span>
                <span className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="w-2 h-2 rounded-full bg-zinc-300"></span>
                </span>
              </div>

              <div className="dashboard-preview-body">
                {activeTab === "builder" && (
                  <div className="mock-syllabus-list">
                    <div className="mock-syllabus-item">
                      <span className="mock-syllabus-drag">☰</span>
                      <span>Module 1: Getting Started with Next.js Layouts</span>
                    </div>
                    <div className="mock-syllabus-item nested">
                      <span>✓ Lecture 1.1: Server vs Client Components</span>
                    </div>
                    <div className="mock-syllabus-item nested">
                      <span>✓ Video: Layout rendering demo (12:40)</span>
                    </div>
                    <div className="mock-syllabus-item">
                      <span className="mock-syllabus-drag">☰</span>
                      <span>Module 2: Custom React Hook setups</span>
                    </div>
                  </div>
                )}

                {activeTab === "collaboration" && (
                  <div className="mock-authors-list">
                    <div className="mock-author-row">
                      <div className="mock-author-profile">
                        <span className="mock-author-avatar">AJ</span>
                        <div className="mock-author-info">
                          <span className="mock-author-name">Adhithyan A.</span>
                          <span className="mock-author-role">Owner / Lead Architect</span>
                        </div>
                      </div>
                      <span className="mock-author-badge">Owner</span>
                    </div>

                    <div className="mock-author-row">
                      <div className="mock-author-profile">
                        <span className="mock-author-avatar">RD</span>
                        <div className="mock-author-info">
                          <span className="mock-author-name">Rahul Dev</span>
                          <span className="mock-author-role">Co-Author / Instructor</span>
                        </div>
                      </div>
                      <span className="mock-author-badge">Active</span>
                    </div>
                  </div>
                )}

                {activeTab === "analytics" && (
                  <div className="mock-chart-container">
                    <div className="mock-chart-grid">
                      <div className="mock-chart-card">
                        <span className="mock-chart-val">1,240</span>
                        <span className="mock-chart-lbl">Enrollments</span>
                      </div>
                      <div className="mock-chart-card">
                        <span className="mock-chart-val">84.6%</span>
                        <span className="mock-chart-lbl">Avg Progress</span>
                      </div>
                      <div className="mock-chart-card">
                        <span className="mock-chart-val">99.8%</span>
                        <span className="mock-chart-lbl">SLA Uptime</span>
                      </div>
                    </div>
                    <div className="mock-chart-graph">
                      <div className="mock-chart-bar" style={{ height: "40px" }}></div>
                      <div className="mock-chart-bar" style={{ height: "60px" }}></div>
                      <div className="mock-chart-bar active" style={{ height: "110px" }}></div>
                      <div className="mock-chart-bar" style={{ height: "80px" }}></div>
                      <div className="mock-chart-bar" style={{ height: "95px" }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TWO WAYS TO PUBLISH */}
      <section className="pubtab-sec" id="publish">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Two ways to publish</span>
            <h2>Go independent, or bring your organization</h2>
            <p>Switch between the two profiles dynamically as your workload expands.</p>
          </div>

          <div className="pubtabs">
            <div className="pubtab-switch relative">
              <button
                type="button"
                className={`relative z-10 transition-colors duration-300 font-semibold text-xs py-2 ${
                  activePubTab === "indep" ? "text-white" : "text-zinc-500"
                }`}
                onClick={() => {
                  setActivePubTab("indep");
                  setHoveredFeature(null);
                }}
              >
                {activePubTab === "indep" && (
                  <motion.span
                    layoutId="activePubTabIndicator"
                    className="absolute inset-0 bg-[#3b2fc9] rounded-full -z-10 shadow-sm"
                    transition={{ type: "spring", stiffness: 350, damping: 26 }}
                  />
                )}
                Independent creator
              </button>
              <button
                type="button"
                className={`relative z-10 transition-colors duration-300 font-semibold text-xs py-2 ${
                  activePubTab === "org" ? "text-white" : "text-zinc-500"
                }`}
                onClick={() => {
                  setActivePubTab("org");
                  setHoveredFeature(null);
                }}
              >
                {activePubTab === "org" && (
                  <motion.span
                    layoutId="activePubTabIndicator"
                    className="absolute inset-0 bg-[#3b2fc9] rounded-full -z-10 shadow-sm"
                    transition={{ type: "spring", stiffness: 350, damping: 26 }}
                  />
                )}
                Organization
              </button>
            </div>
            
            <div className="pubtabs-panel-wrap mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Left Column: Premium Feature Cards Grid */}
                <div className="lg:col-span-7 flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    {activePubTab === "indep" ? (
                      <motion.div
                        key="indep-panel"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.22 }}
                        className="h-full flex flex-col justify-center text-left"
                      >
                        <div className="mb-5">
                          <h3 className="text-base font-extrabold text-zinc-900 tracking-tight">Independent Creator Profile</h3>
                          <p className="text-[11px] text-zinc-500 mt-1">Publish under your personal brand and maintain complete creative control.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <motion.div 
                            onMouseEnter={() => setHoveredFeature("brand")}
                            onMouseLeave={() => setHoveredFeature(null)}
                            whileHover={{ y: -2, borderColor: "#818cf8" }}
                            className={`bg-white/70 border rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300 ${
                              hoveredFeature === "brand" ? "border-indigo-500 shadow-md bg-indigo-50/10" : "border-zinc-200/60"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-2.5">
                              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                              </svg>
                            </div>
                            <h4 className="text-[12.5px] font-extrabold text-zinc-900 leading-snug">Personal Brand</h4>
                            <p className="text-[10px] text-zinc-500 leading-normal mt-1">Publish and verify courses under your own name to build industry authority.</p>
                          </motion.div>

                          <motion.div 
                            onMouseEnter={() => setHoveredFeature("control")}
                            onMouseLeave={() => setHoveredFeature(null)}
                            whileHover={{ y: -2, borderColor: "#818cf8" }}
                            className={`bg-white/70 border rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300 ${
                              hoveredFeature === "control" ? "border-indigo-500 shadow-md bg-indigo-50/10" : "border-zinc-200/60"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-2.5">
                              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                              </svg>
                            </div>
                            <h4 className="text-[12.5px] font-extrabold text-zinc-900 leading-snug">Full Creative Control</h4>
                            <p className="text-[10px] text-zinc-500 leading-normal mt-1">Structure lessons, customize syllabus layouts, and define browser terminals your way.</p>
                          </motion.div>

                          <motion.div 
                            onMouseEnter={() => setHoveredFeature("pricing")}
                            onMouseLeave={() => setHoveredFeature(null)}
                            whileHover={{ y: -2, borderColor: "#818cf8" }}
                            className={`bg-white/70 border rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300 ${
                              hoveredFeature === "pricing" ? "border-indigo-500 shadow-md bg-indigo-50/10" : "border-zinc-200/60"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-2.5">
                              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a2.25 2.25 0 003.182 0l5.178-5.178a2.25 2.25 0 000-3.182l-9.58-9.581A2.25 2.25 0 009.568 3z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                              </svg>
                            </div>
                            <h4 className="text-[12.5px] font-extrabold text-zinc-900 leading-snug">Set Your Own Pricing</h4>
                            <p className="text-[10px] text-zinc-500 leading-normal mt-1">Configure pricing tiers, create promotion cycles, and receive direct Stripe transfers.</p>
                          </motion.div>

                          <motion.div 
                            onMouseEnter={() => setHoveredFeature("reach")}
                            onMouseLeave={() => setHoveredFeature(null)}
                            whileHover={{ y: -2, borderColor: "#818cf8" }}
                            className={`bg-white/70 border rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300 ${
                              hoveredFeature === "reach" ? "border-indigo-500 shadow-md bg-indigo-50/10" : "border-zinc-200/60"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-2.5">
                              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c-2.485 0-4.5 4.03-4.5 9s2.015 9 4.5 9" />
                              </svg>
                            </div>
                            <h4 className="text-[12.5px] font-extrabold text-zinc-900 leading-snug">Global Reach</h4>
                            <p className="text-[10px] text-zinc-500 leading-normal mt-1">Connect with students across international markets without platform friction.</p>
                          </motion.div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="org-panel"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.22 }}
                        className="h-full flex flex-col justify-center text-left"
                      >
                        <div className="mb-5">
                          <h3 className="text-base font-extrabold text-zinc-900 tracking-tight">Organization Workspace</h3>
                          <p className="text-[11px] text-zinc-500 mt-1">Co-author courses, configure custom domains, and manage institutional structures.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <motion.div 
                            onMouseEnter={() => setHoveredFeature("brand")}
                            onMouseLeave={() => setHoveredFeature(null)}
                            whileHover={{ y: -2, borderColor: "#14b8a6" }}
                            className={`bg-white/70 border rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300 ${
                              hoveredFeature === "brand" ? "border-teal-500 shadow-md bg-teal-50/10" : "border-zinc-200/60"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-2.5">
                              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.33M3.75 10.33V21" />
                              </svg>
                            </div>
                            <h4 className="text-[12.5px] font-extrabold text-zinc-900 leading-snug">Unified Brand Identity</h4>
                            <p className="text-[10px] text-zinc-500 leading-normal mt-1">Brand certificates and syllabi with your corporate logo and color systems.</p>
                          </motion.div>

                          <motion.div 
                            onMouseEnter={() => setHoveredFeature("authors")}
                            onMouseLeave={() => setHoveredFeature(null)}
                            whileHover={{ y: -2, borderColor: "#14b8a6" }}
                            className={`bg-white/70 border rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300 ${
                              hoveredFeature === "authors" ? "border-teal-500 shadow-md bg-teal-50/10" : "border-zinc-200/60"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-2.5">
                              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0112 20.25a11.38 11.38 0 01-3-1.013v-.109c0-1.113.285-2.16.786-3.07M7.5 16.517a4.125 4.125 0 00-7.533 2.493 9.337 9.337 0 004.121.952 9.38 9.38 0 002.625-.372M7.5 16.517v-.003c0-1.113.285-2.16.786-3.07" />
                              </svg>
                            </div>
                            <h4 className="text-[12.5px] font-extrabold text-zinc-900 leading-snug">Multi-Author Editing</h4>
                            <p className="text-[10px] text-zinc-500 leading-normal mt-1">Add teammates, manage writer permissions, and review draft edits collaboratively.</p>
                          </motion.div>

                          <motion.div 
                            onMouseEnter={() => setHoveredFeature("domain")}
                            onMouseLeave={() => setHoveredFeature(null)}
                            whileHover={{ y: -2, borderColor: "#14b8a6" }}
                            className={`bg-white/70 border rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300 ${
                              hoveredFeature === "domain" ? "border-teal-500 shadow-md bg-teal-50/10" : "border-zinc-200/60"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-2.5">
                              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
                              </svg>
                            </div>
                            <h4 className="text-[12.5px] font-extrabold text-zinc-900 leading-snug">Custom Domains</h4>
                            <p className="text-[10px] text-zinc-500 leading-normal mt-1">Host your custom workspace cockpit under a unique corporate subdomain.</p>
                          </motion.div>

                          <motion.div 
                            onMouseEnter={() => setHoveredFeature("reach")}
                            onMouseLeave={() => setHoveredFeature(null)}
                            whileHover={{ y: -2, borderColor: "#14b8a6" }}
                            className={`bg-white/70 border rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300 ${
                              hoveredFeature === "reach" ? "border-teal-500 shadow-md bg-teal-50/10" : "border-zinc-200/60"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-2.5">
                              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                              </svg>
                            </div>
                            <h4 className="text-[12.5px] font-extrabold text-zinc-900 leading-snug">Consolidated Analytics</h4>
                            <p className="text-[10px] text-zinc-500 leading-normal mt-1">Aggregate registration and performance charts across all author tracks.</p>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Right Column: 3D Flipping Mockup UI Card */}
                <div className="lg:col-span-5 flex items-center justify-center pt-6 lg:pt-0">
                  <div style={{ perspective: "1000px" }} className="w-full max-w-[340px] h-[280px] relative">
                    <motion.div
                      animate={{ rotateY: activePubTab === "indep" ? 0 : 180 }}
                      transition={{ type: "spring", stiffness: 100, damping: 18 }}
                      style={{ transformStyle: "preserve-3d" }}
                      className="w-full h-full relative"
                    >
                      {/* Front Side: Independent Creator Mockup */}
                      <div 
                        className="absolute inset-0 w-full h-full"
                        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                      >
                        <div className="w-full h-full bg-gradient-to-br from-indigo-50/90 via-purple-50/60 to-white border border-indigo-100 rounded-[28px] p-6 shadow-[0_15px_30px_rgba(99,102,241,0.06)] relative overflow-hidden flex flex-col justify-between">
                          <div className="absolute top-4 right-4 bg-indigo-500/10 text-indigo-600 text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-0.5 rounded-full border border-indigo-200/50">
                            Independent
                          </div>

                          <div className={`flex items-center gap-3.5 mt-2 p-1 rounded-xl transition-all duration-300 ${
                            hoveredFeature === "brand" ? "ring-2 ring-indigo-500 ring-offset-2 scale-105 bg-indigo-50/30" : ""
                          }`}>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-base font-bold shadow-sm">
                              AR
                            </div>
                            <div className="text-left">
                              <h4 className="text-sm font-extrabold text-zinc-900 leading-snug">Alex River</h4>
                              <p className="text-[10px] text-zinc-500 font-bold">@alexriver</p>
                              <div className="flex gap-1.5 mt-1">
                                <span className="text-[8px] font-bold px-1.5 py-0.5 bg-indigo-50/70 text-indigo-600 rounded border border-indigo-100/50">Instructor</span>
                                <span className="text-[8px] font-bold px-1.5 py-0.5 bg-purple-50/70 text-purple-600 rounded border border-purple-100/50">WebGL</span>
                              </div>
                            </div>
                          </div>

                          <div className={`grid grid-cols-2 gap-3.5 bg-white/70 border border-zinc-200/50 rounded-2xl p-3 my-3 transition-all duration-300 ${
                            hoveredFeature === "reach" ? "ring-2 ring-indigo-500 ring-offset-2 scale-105 bg-indigo-50/30" : ""
                          }`}>
                            <div className="text-center">
                              <span className="block text-sm font-black text-indigo-600">14.8k</span>
                              <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">Students</span>
                            </div>
                            <div className="text-center border-l border-zinc-100">
                              <span className="block text-sm font-black text-indigo-600">4.9 ★</span>
                              <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">Rating</span>
                            </div>
                          </div>

                          <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className={`bg-white/95 border rounded-xl p-3 flex items-center gap-3 shadow-xs cursor-pointer transition-all duration-300 ${
                              hoveredFeature === "pricing" || hoveredFeature === "control" 
                                ? "ring-2 ring-indigo-500 ring-offset-2 scale-105 border-indigo-200" 
                                : "border-zinc-200/40"
                            }`}
                          >
                            <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center text-white text-[10px] font-black">
                              TS
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <h5 className="text-[10px] font-extrabold text-zinc-900 truncate">Advanced TS Architectures</h5>
                              <p className="text-[8.5px] font-bold text-indigo-600">$49.00 USD</p>
                            </div>
                          </motion.div>
                        </div>
                      </div>

                      {/* Back Side: Organization Mockup */}
                      <div 
                        className="absolute inset-0 w-full h-full"
                        style={{ 
                          backfaceVisibility: "hidden", 
                          WebkitBackfaceVisibility: "hidden",
                          transform: "rotateY(180deg)" 
                        }}
                      >
                        <div className="w-full h-full bg-gradient-to-br from-teal-50/90 via-indigo-50/60 to-white border border-teal-100 rounded-[28px] p-6 shadow-[0_15px_30px_rgba(20,184,166,0.06)] relative overflow-hidden flex flex-col justify-between">
                          <div className="absolute top-4 right-4 bg-teal-500/10 text-teal-700 text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-0.5 rounded-full border border-teal-200/50">
                            Organization
                          </div>

                          <div className={`flex items-center gap-3.5 mt-2 p-1 rounded-xl transition-all duration-300 ${
                            hoveredFeature === "brand" ? "ring-2 ring-teal-500 ring-offset-2 scale-105 bg-teal-50/30" : ""
                          }`}>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-sm">
                              CX
                            </div>
                            <div className="text-left">
                              <h4 className="text-sm font-extrabold text-zinc-900 leading-snug">Codex Academy</h4>
                              <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full mt-1 inline-block transition-all duration-300 ${
                                hoveredFeature === "domain" ? "bg-teal-500 text-white border-teal-500 scale-105" : "bg-teal-50/70 text-teal-700 border-teal-100/50"
                              }`}>academy.codex.io</span>
                            </div>
                          </div>

                          <div className={`flex flex-col gap-2 my-3 p-1.5 rounded-xl transition-all duration-300 ${
                            hoveredFeature === "authors" ? "ring-2 ring-teal-500 ring-offset-2 scale-105 bg-teal-50/30" : ""
                          }`}>
                            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider text-left">Authors Directory</span>
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-[8px] font-extrabold text-white">AJ</div>
                                <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-[8px] font-extrabold text-white">RD</div>
                                <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] font-extrabold text-white">SC</div>
                              </div>
                              <span className="text-[9px] font-bold text-zinc-500">3 instructors managed</span>
                            </div>
                          </div>

                          <div className={`bg-white/95 border rounded-xl p-3 flex justify-between items-center gap-2 shadow-xs transition-all duration-300 ${
                            hoveredFeature === "reach" ? "ring-2 ring-teal-500 ring-offset-2 scale-105 border-teal-200" : "border-zinc-200/40"
                          }`}>
                            <div className="text-left">
                              <span className="text-[7.5px] font-bold text-zinc-400 uppercase tracking-wider block leading-none mb-1">Global Reach</span>
                              <span className="text-[10px] font-black text-teal-600">84,500 students enrolled</span>
                            </div>
                            <div className="flex gap-1 items-end h-7 justify-end">
                              <motion.div 
                                initial={{ height: "0%" }} 
                                animate={{ height: activePubTab === "org" ? "40%" : "0%" }} 
                                transition={{ delay: 0.1, type: "spring", stiffness: 80 }} 
                                className="w-1.5 bg-teal-400 rounded-full" 
                              />
                              <motion.div 
                                initial={{ height: "0%" }} 
                                animate={{ height: activePubTab === "org" ? "70%" : "0%" }} 
                                transition={{ delay: 0.2, type: "spring", stiffness: 80 }} 
                                className="w-1.5 bg-teal-500 rounded-full" 
                              />
                              <motion.div 
                                initial={{ height: "0%" }} 
                                animate={{ height: activePubTab === "org" ? "100%" : "0%" }} 
                                transition={{ delay: 0.3, type: "spring", stiffness: 80 }} 
                                className="w-1.5 bg-indigo-500 rounded-full" 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONSOLIDATED FORMATS & MONETIZATION */}
      <section className="format-sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Formats & Monetization</span>
            <h2>Flexible layouts, straightforward pricing</h2>
            <p>Pick the media structure that fits what you teach, and select your enrollment tier.</p>
          </div>

          <div className="format-grid">
            <div className="format-card">
              <span className="ic" style={{ background: "linear-gradient(135deg,#2E2EAB,#4B47E6)" }}>
                <BookOpen className="w-5 h-5" />
              </span>
              <h3>Course</h3>
              <p>Structured paths with video lessons, reading modules, and exams.</p>
              <span className="best">Step-by-step skills</span>
            </div>

            <div className="format-card">
              <span className="ic" style={{ background: "linear-gradient(135deg,#F5A623,#E8890B)" }}>
                <Terminal className="w-5 h-5" />
              </span>
              <h3>Workshop</h3>
              <p>Focused interactive sandbox sessions built around practical outcomes.</p>
              <span className="best">One skill, fast</span>
            </div>

            <div className="format-card">
              <span className="ic" style={{ background: "linear-gradient(135deg,#20B8CF,#2E86AB)" }}>
                <Play className="w-5 h-5" />
              </span>
              <h3>Webinar</h3>
              <p>Live stream classes and broadcast recordings to massive student groups.</p>
              <span className="best">Broadcasting at scale</span>
            </div>

            <div className="format-card">
              <span className="ic" style={{ background: "linear-gradient(135deg,#7A5AF8,#4B47E6)" }}>
                <Layers className="w-5 h-5" />
              </span>
              <h3>Article</h3>
              <p>Self-paced written documentation guides and research reference logs.</p>
              <span className="best">Reference manuals</span>
            </div>
          </div>

          {/* PRICING BLOCK HEADER */}
          <div className="sec-head" style={{ marginTop: "64px", marginBottom: "32px" }}>
            <span className="eyebrow">Set your own terms</span>
            <h2>Free or paid — you decide, course by course</h2>
            <p>Both paths get the same review process and the same certificate.</p>
          </div>

          <div className="pricing-grid">
            <div className="price-card">
              <span className="tag">Free</span>
              <h3>Open to everyone</h3>
              <p>No pricing setup required.</p>
              <ul>
                <li>
                  <span className="chk">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span>Reach the widest possible audience</span>
                </li>
                <li>
                  <span className="chk">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span>Great for building a community</span>
                </li>
                <li>
                  <span className="chk">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span>Still fully reviewed and certified</span>
                </li>
              </ul>
            </div>

            <div className="price-card highlight">
              <span className="tag" style={{ background: "#DEE0FA" }}>Paid</span>
              <h3>Set your own price</h3>
              <p>Keep control of your offering.</p>
              <ul>
                <li>
                  <span className="chk">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span>Price each course on your own terms</span>
                </li>
                <li>
                  <span className="chk">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span>Ideal for professional training</span>
                </li>
                <li>
                  <span className="chk">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span>Same quality review, same certificate</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* BUILT FOR EVERY EDUCATOR CHIPS */}
      <section className="edu-sec" id="educators">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Built for every educator</span>
            <h2>A professional platform, whoever you are</h2>
          </div>

          <div className="edu-grid">
            <div className="edu-chip">
              <span className="ic" style={{ background: "#2E2EAB" }}>
                <GraduationCap className="w-5 h-5 text-white" />
              </span>
              <div><b>Universities &amp; colleges</b><span>Accredited-quality learning</span></div>
            </div>
            <div className="edu-chip">
              <span className="ic" style={{ background: "#20B8CF" }}>
                <Building2 className="w-5 h-5 text-white" />
              </span>
              <div><b>Training institutes</b><span>Structured, certified programs</span></div>
            </div>
            <div className="edu-chip">
              <span className="ic" style={{ background: "#F5A623" }}>
                <Briefcase className="w-5 h-5 text-white" />
              </span>
              <div><b>Companies</b><span>Professional training at scale</span></div>
            </div>
            <div className="edu-chip">
              <span className="ic" style={{ background: "#7A5AF8" }}>
                <Heart className="w-5 h-5 text-white" />
              </span>
              <div><b>Nonprofits</b><span>Mission-driven education</span></div>
            </div>
            <div className="edu-chip">
              <span className="ic" style={{ background: "#1F8A9E" }}>
                <User className="w-5 h-5 text-white" />
              </span>
              <div><b>Freelancers &amp; experts</b><span>Turn expertise into income</span></div>
            </div>
            <div className="edu-chip">
              <span className="ic" style={{ background: "#2E2EAB" }}>
                <UserCheck className="w-5 h-5 text-white" />
              </span>
              <div><b>Independent educators</b><span>Publish on your own terms</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* PUZZLE & LABS */}
      <section className="puzzle-sec">
        <div className="wrap puzzle-grid">
          <div>
            <CardScanner />
          </div>
          <div>
            <span className="eyebrow">Collaborate &amp; Grow</span>
            <h2>Build great courses, piece by piece</h2>
            <p>Great learning is rarely a solo effort. Bring co-authors, teams, and whole organizations into one shared workspace — every piece its own contribution to something bigger.</p>
            <ul>
              <li>
                <span className="chk">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span><b>Multiple authors, one course.</b> Co-create lessons and split the work without losing consistency.</span>
              </li>
              <li>
                <span className="chk">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span><b>Publish under an organization.</b> Keep your institution's brand and roles in one place.</span>
              </li>
              <li>
                <span className="chk">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span><b>Shared analytics &amp; reviews.</b> Everyone sees engagement and review status as it happens.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="trust">
        <div className="wrap">
          <div className="trust-inner">
            <div>
              <span className="eyebrow" style={{ color: "#DDDEFB", borderBottom: "none" }}>Platform Trust</span>
              <h2 className="mt-4">Trusted Learning Starts Here</h2>
              <p>Every creator and organization completes identity verification before publishing content. Combined with Arcade's review process, this helps maintain a trusted ecosystem where learners can confidently enroll in high-quality educational content.</p>
            </div>

            <div className="trust-badges">
              <div className="tbadge">
                <span className="ic">👤</span>
                <div>
                  <b>Identity Verification</b>
                  <span>KYC check verifies credentials before public catalog access.</span>
                </div>
              </div>
              <div className="tbadge">
                <span className="ic">✔️</span>
                <div>
                  <b>Quality Content Reviews</b>
                  <span>QA team structural check on video, text, and assessments.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-sec" id="faq">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Got questions?</span>
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="faq-list">
            {faqItems.map((item, idx) => {
              const isOpen = !!openFaqs[idx];
              return (
                <div key={idx} className={`faq-item ${isOpen ? "open" : ""}`}>
                  <button
                    type="button"
                    className="faq-q"
                    onClick={() => toggleFaq(idx)}
                  >
                    <span>{item.q}</span>
                    <span className="chev">
                      <ChevronDown className="w-5 h-5" />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="faq-a">
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta" id="cta">
        <div className="wrap cta-inner">
          <span className="cta-cursive">Your next chapter starts here...</span>
          <h2 className="cta-title">
            START CREATING <span className="cta-highlight">TODAY</span>
          </h2>
          <p className="cta-desc">Join Arcade as a creator and start building learning experiences that educate, inspire, and create lasting impact.</p>
          <div className="cta-actions">
            <a href="/register?role=creator" className="btn btn-cta-primary">
              Become a Creator →
            </a>
            <a href="#tools" className="btn btn-cta-secondary">
              Explore the Tools
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
