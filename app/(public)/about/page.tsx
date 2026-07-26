"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, Variants, useScroll, useTransform, useInView, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Briefcase,
  Building,
  CheckCircle,
  Code,
  Globe,
  GraduationCap,
  Layout,
  Lightbulb,
  Medal,
  PlaySquare,
  Shield,
  ShieldCheck,
  Trophy,
  Users,
  Video,
  Zap,
  BadgeCheck,
  FileBadge,
  Building2,
  Handshake,
} from "lucide-react";
import Link from "next/link";

import VariableProximity from "@/apps/public/components/landing/VariableProximity";
import "@/apps/public/landing.css";

// Reusable Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function AboutPage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Mouse Parallax values (X ±6px, Y ±4px)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 120 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  const bgX = useTransform(mouseXSpring, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-6, 6]);
  const bgY = useTransform(mouseYSpring, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-4, 4]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const values = [
    {
      title: "Global Reach",
      description: "Empowering learners from every corner of the world with accessible education.",
      icon: Globe,
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      title: "Community First",
      description: "Built by educators for educators, fostering an active and supportive network.",
      icon: Users,
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    },
    {
      title: "Lightning Fast",
      description: "Experience uncompromised speed with our optimized learning delivery network.",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-50"
    },
    {
      title: "Secure & Reliable",
      description: "Enterprise-grade security protecting your intellectual property and data.",
      icon: Shield,
      color: "text-rose-500",
      bg: "bg-rose-50"
    },
  ];

  return (
    <div className="landing-root min-h-screen flex flex-col relative z-10 bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-100/50 rounded-full blur-[120px] opacity-70" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[100px]" />
      </div>

      {/* --- HERO SECTION (from aboutn) --- */}
      <section
        ref={headerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-[100vh] min-h-[100vh] flex flex-col justify-center items-center text-center px-6 overflow-hidden z-10 bg-white pt-24 md:pt-28"
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&display=swap');

          @keyframes gradientShift15s {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient-15s {
            background-size: 200% 200%;
            animation: gradientShift15s 15s ease-in-out infinite;
          }

          @keyframes floatBirds {
            0%, 100% { transform: translate(0px, 0px); }
            50% { transform: translate(6px, -4px); }
          }
          .animate-birds-float {
            animation: floatBirds 10s ease-in-out infinite;
          }
        `}</style>

        {/* Parallax Background Layer (Sharpened pen-line contrast & 4K edge clarity) */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            x: bgX,
            y: bgY,
            backgroundImage: "url('/ink-dome-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center 100px",
            backgroundRepeat: "no-repeat",
            imageRendering: "-webkit-optimize-contrast",
            filter: "contrast(1.06) brightness(1.01)",
            WebkitFilter: "contrast(1.06) brightness(1.01)",
          }}
        />

        {/* Seamless Anti-Banding Smooth Radial Gradient Dome Layer */}
        <div
          className="absolute top-[100px] left-1/2 -translate-x-1/2 w-[75vw] max-w-[1000px] h-[400px] pointer-events-none rounded-t-full opacity-50 mix-blend-multiply"
          style={{
            background: "radial-gradient(ellipse 100% 100% at 50% 100%, rgba(195, 218, 255, 0.4) 0%, rgba(215, 232, 255, 0.2) 50%, transparent 80%)",
          }}
        />

        {/* Gentle floating motion for birds (infinite 10s float, Y ±4px, X ±6px) */}
        <div className="absolute inset-0 pointer-events-none animate-birds-float opacity-30" />

        <div className="relative z-10 max-w-[800px] mx-auto text-center space-y-8 my-auto py-12">
          {/* HEADLINE */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[52px] sm:text-[68px] md:text-[76px] lg:text-[84px] tracking-tight leading-[1.05] text-[#0B132B] drop-shadow-[0_4px_16px_rgba(11,19,43,0.04)] text-center"
            style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif", fontWeight: 600 }}
          >
            <span className="block">
              Where{" "}
              <span className="relative inline-block">
                Ideas
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 -bottom-1 sm:-bottom-2 w-full h-[3px] sm:h-[4px] bg-[#EAB308] rounded-none origin-left"
                />
              </span>
            </span>
            <span className="block mt-1 sm:mt-2">
              Become{" "}
              <span
                className="inline-block animate-gradient-15s"
                style={{
                  backgroundImage: "linear-gradient(90deg, #0D9488 0%, #06B6D4 35%, #2563EB 70%, #7C3AED 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Impact.
              </span>
            </span>
          </motion.h1>

          {/* DESCRIPTION */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
            className="text-[18px] sm:text-[19px] leading-[1.75] text-[#475569] max-w-[560px] mx-auto font-sans font-normal drop-shadow-[0_2px_8px_rgba(11,19,43,0.02)]"
          >
            Arcade is AJCE's official platform for learning, innovation, and collaboration, offering certified webinars, hackathons, workshops, and engaging community experiences.
          </motion.p>

          {/* BUTTON */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
            className="pt-2 flex justify-center"
          >
            <Link
              href="/explore"
              className="relative inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#0B132B] hover:bg-[#121E42] text-white font-medium text-base shadow-[0_10px_30px_-8px_rgba(11,19,43,0.35)] hover:shadow-[0_16px_36px_-6px_rgba(11,19,43,0.45)] border-t border-white/20 hover:-translate-y-[3px] active:translate-y-0 transition-all duration-250 ease-out group"
            >
              <span>Learn More</span>
              <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-inner group-hover:translate-x-[4px] transition-transform duration-250 ease-out">
                <ArrowUpRight className="w-4 h-4 text-[#0B132B] stroke-[2.5]" />
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 1: WHY GET CERTIFIED? (from abel2) --- */}
      <section className="py-24 bg-white border-y border-slate-200/50">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <SectionHeader
            title="Why Get Certified?"
            description="An Arcade certificate is more than proof of participation—it is a verified record of your commitment to learning, issued through the academic ecosystem of Amal Jyothi College of Engineering."
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16"
          >
            {[
              { icon: ShieldCheck, title: "AJCE-Backed Recognition", desc: "Every certificate issued through Arcade is institutionally backed by Amal Jyothi College of Engineering, adding academic credibility to every achievement." },
              { icon: BadgeCheck, title: "Verified & Authentic", desc: "Certificates are securely generated through Arcade and can be verified online, making them reliable for employers, institutions, and professional networks." },
              { icon: Briefcase, title: "Strengthen Your Portfolio", desc: "Showcase your participation in webinars, hackathons, workshops, and competitions as evidence of continuous learning and practical engagement." },
              { icon: FileBadge, title: "Professional Profile Ready", desc: "Add your certificates to your résumé, LinkedIn profile, or personal portfolio to demonstrate your commitment to upskilling." },
              { icon: Trophy, title: "Recognize Every Achievement", desc: "Whether you attend a webinar or win a hackathon, every meaningful milestone is captured as a permanent digital credential." },
              { icon: GraduationCap, title: "Learn with Confidence", desc: "Participate in events knowing your accomplishments are recognized through a trusted academic platform, not just a generic event website." },
            ].map((feature, idx) => (
              <FeatureCard key={idx} {...feature} />
            ))}
          </motion.div>

          {/* Bottom Highlight Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100/50 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-8"
          >
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <Award className="w-64 h-64 text-blue-500" />
            </div>
            <div className="md:w-2/3 relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">Why an Arcade Certificate Matters</h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Unlike certificates generated by standalone event platforms, Arcade certificates are issued through the official learning ecosystem of Amal Jyothi College of Engineering. They represent verified participation in meaningful learning experiences and provide a trusted record of your academic and professional development.
              </p>
            </div>
            <div className="md:w-1/3 flex justify-center relative z-10">
              <motion.div
                whileHover={{ scale: 1.05, rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.5 }}
                className="w-32 h-32 bg-white rounded-full shadow-xl shadow-blue-500/10 flex items-center justify-center border-4 border-blue-50"
              >
                <Award className="w-16 h-16 text-blue-600" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- CORE VALUES (from abel2) --- */}
      <section className="max-w-[1200px] mx-auto w-full px-6 md:px-12 py-24 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Our Core Values
          </h2>
          <p className="text-base text-slate-500">
            Everything we build is guided by these core principles to ensure the best experience for our community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${val.bg} ${val.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{val.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{val.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- CTA (from abel2) --- */}
      <section className="max-w-[1200px] mx-auto w-full px-6 md:px-12 py-24 mb-12">
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-[32px] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Ready to transform the way you teach?
            </h2>
            <p className="text-blue-100/80 text-lg">
              Join thousands of educators and institutions already building on Arcade.
            </p>
            <div className="pt-4">
              <Link
                href="/creators"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white hover:bg-blue-50 text-slate-900 font-bold text-sm tracking-wide shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span>Become a Creator</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: POWERED BY AJCE (from abel2) --- */}
      <AJCESection />

      {/* --- SECTION 5: WHO IS ARCADE FOR? (from abel2) --- */}
      <section className="py-24 md:py-32 bg-slate-50 border-t border-slate-200/50 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <SectionHeader title="Who is Arcade For?" />
          <TimelineSection />
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="text-center space-y-4 max-w-2xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-slate-600 text-lg leading-relaxed font-medium">
          {description}
        </p>
      )}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-slate-200/70 hover:border-blue-500/30 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between group"
    >
      <div>
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors duration-300 mb-6">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
          {title}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed font-normal">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

function TimelineSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Subtle parallax for the whole block
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const yParallax = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const personas = [
    {
      label: "For Students & Learners",
      title: "Elevate your skills, prove your expertise",
      description: "Gain practical knowledge through curated courses, prove your skills in real-world hackathons, and earn verified credentials backed by AJCE to stand out in the job market.",
      features: [
        "Interactive workshops & live webinars",
        "Competitions with real-world impact",
        "Digitally verifiable certificates"
      ],
      icon: GraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-500/5",
      borderColor: "border-blue-500/20",
      glowColor: "rgba(37, 99, 235, 0.12)",
      ringColor: "rgba(37, 99, 235, 0.4)",
      iconBg: "bg-blue-50",
    },
    {
      label: "For Educators & Creators",
      title: "Inspire the next generation of innovators",
      description: "Publish your knowledge, host interactive events, and manage student growth with built-in tools for assessment, live sessions, and automated certification.",
      features: [
        "Simple course & event creation studio",
        "Automated grading & certificate generation",
        "Direct engagement with motivated learners"
      ],
      icon: Lightbulb,
      color: "text-amber-600",
      bgColor: "bg-amber-500/5",
      borderColor: "border-amber-500/20",
      glowColor: "rgba(217, 119, 6, 0.12)",
      ringColor: "rgba(217, 119, 6, 0.4)",
      iconBg: "bg-amber-50",
    },
    {
      label: "For Organizations & Orgs",
      title: "Discover talent and foster innovation",
      description: "Partner with AJCE to host branded hackathons, sponsor technical workshops, and connect directly with high-performing students ready to solve real challenges.",
      features: [
        "Branded hackathons & innovation challenges",
        "Access to a verified talent pool",
        "Collaborative learning partnerships"
      ],
      icon: Building2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/5",
      borderColor: "border-emerald-500/20",
      glowColor: "rgba(5, 150, 105, 0.12)",
      ringColor: "rgba(5, 150, 105, 0.4)",
      iconBg: "bg-emerald-50",
    }
  ];

  return (
    <div ref={containerRef} className="relative mt-20">
      {/* Curved Snake/S-Curve SVG Line (Desktop Only) */}
      <div className="hidden md:block absolute left-0 right-0 top-0 bottom-0 pointer-events-none z-0">
        <svg className="w-full h-full" preserveAspectRatio="none">
          {/* Subtle glow layer behind the main curve */}
          <path
            d="M 50% 0 C 15% 150, 15% 350, 50% 500 C 85% 650, 85% 850, 50% 1000"
            fill="none"
            stroke="url(#snakeGlowGrad)"
            strokeWidth="8"
            className="opacity-40"
          />
          {/* Main animated snake path */}
          <path
            d="M 50% 0 C 15% 150, 15% 350, 50% 500 C 85% 650, 85% 850, 50% 1000"
            fill="none"
            stroke="url(#snakeGrad)"
            strokeWidth="3"
            strokeDasharray="8 8"
            className="animate-pulse opacity-60"
          />
          <defs>
            <linearGradient id="snakeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="snakeGlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93C5FD" />
              <stop offset="50%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#6EE7B7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Vertical straight line for mobile */}
      <div className="md:hidden absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-amber-500 to-emerald-500 z-0" />

      {/* Alternating Persona Nodes */}
      <div className="relative z-10 space-y-24 md:space-y-32">
        {personas.map((persona, index) => (
          <PersonaTimelineNode key={index} persona={persona} index={index} />
        ))}
      </div>
    </div>
  );
}

function PersonaTimelineNode({ persona, index }: { persona: any; index: number }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-100px" });
  const isLeft = index % 2 === 0;

  return (
    <div className="relative w-full">
      <div
        className={`relative z-10 flex flex-col md:flex-row items-center w-full py-16 md:py-0 md:h-[500px] gap-12 md:gap-0 ${
          isLeft ? "" : "md:flex-row-reverse"
        }`}
      >
        {/* Icon Half */}
        <div ref={nodeRef} className="w-full md:w-1/2 flex justify-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`relative w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center border-2 ${persona.borderColor} shadow-2xl bg-white group cursor-pointer`}
            style={{
              boxShadow: `0 20px 50px -10px ${persona.glowColor}`,
            }}
          >
            {/* Background Tint */}
            <div className={`absolute inset-2 rounded-full ${persona.bgColor} transition-transform duration-500 group-hover:scale-105`} />

            {/* Ring flash — appears briefly then fades */}
            <motion.div
              className="absolute rounded-full border-2 pointer-events-none"
              style={{
                inset: "-8px",
                borderColor: persona.ringColor,
              }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={isInView
                ? { opacity: [0, 1, 0], scale: [0.85, 1.05, 1.15] }
                : {}
              }
              transition={{ duration: 0.7, ease: "easeOut" }}
            />

            <persona.icon
              className={`w-12 h-12 md:w-14 md:h-14 ${persona.color} relative z-10 transition-transform duration-500 group-hover:scale-110`}
            />
          </motion.div>
        </div>

        {/* Text Half */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className={`flex flex-col gap-6 w-full max-w-[420px] ${
              isLeft ? "md:mr-auto md:ml-16" : "md:ml-auto md:mr-16"
            } mx-auto md:mx-0`}
          >
            {/* Header */}
            <div className="flex flex-col gap-4 text-left">
              <span className={`text-sm font-bold tracking-widest uppercase ${persona.color}`}>
                {persona.label}
              </span>
              <h3 className="text-3xl md:text-4xl font-bold font-bricolage text-slate-900 leading-tight">
                {persona.title}
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                {persona.description}
              </p>
            </div>

            {/* Checklist */}
            <ul className="space-y-4 pt-2">
              {persona.features.map((feat: string, idx: number) => (
                <li key={idx} className="flex items-start gap-4 text-slate-700 font-medium text-base text-left">
                  <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${persona.iconBg}`}>
                    <CheckCircle className={`w-4 h-4 ${persona.color}`} />
                  </div>
                  <span className="leading-snug">{feat}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function AJCESection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax effect: moves up slowly as you scroll down
  const yParallax = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section ref={containerRef} className="relative py-32 overflow-hidden bg-white border-y border-slate-200/50">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10 flex flex-col lg:flex-row items-center min-h-[500px]">

        {/* Left Column (Content) - 55% */}
        <div className="w-full lg:w-[55%] pr-0 lg:pr-12 relative z-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold font-bricolage text-slate-900 tracking-tight leading-tight mb-6">
              Powered by Amal Jyothi College of Engineering
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed mb-10">
              Arcade is the official learning and event platform of Amal Jyothi College of Engineering, where every certificate is backed by an institution known for academic excellence, innovation, and industry engagement.
            </p>

            {/* Premium Trust Highlights */}
            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">State-of-the-Art Campus & Facilities</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Spanning 68 acres with over 1.26 lakh sq. m. of built-up area dedicated to learning, research, and innovation.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Autonomous Excellence</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">An Autonomous Institution recognized for maintaining rigorous academic standards and continuous innovation.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                  <BadgeCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">NAAC A+ & NBA Accredited</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Highly accredited with a NAAC A+ grade alongside NBA-accredited engineering programmes.</p>
                </div>
              </div>
            </div>

            {/* Compact Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900 mb-1">68</div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Acres</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900 mb-1">1.26L</div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sq. m. Area</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900 mb-1">#4</div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">KIRF Rank</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900 mb-1">A+</div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">NAAC Grade</div>
              </div>
            </div>

          </motion.div>
        </div>

        {/* Right Column (Background Illustration) - 45% */}
        <div className="absolute inset-0 lg:left-[45%] pointer-events-none select-none overflow-hidden flex items-center justify-end z-0">
          <motion.div
            style={{ y: yParallax }}
            className="w-full h-full relative flex items-center justify-end opacity-100"
          >
            <div
              className="w-full h-[140%] max-w-[1000px] absolute -right-20"
              style={{
                backgroundImage: 'url(/images/ajce-sketch2.png)',
                backgroundSize: 'contain',
                backgroundPosition: 'right center',
                backgroundRepeat: 'no-repeat',
                filter: "grayscale(100%)",
                maskImage: 'linear-gradient(to right, transparent 0%, black 30%, black 70%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 70%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%, black 70%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 70%, transparent 100%)',
                WebkitMaskComposite: 'source-in',
                maskComposite: 'intersect',
              }}
            />
          </motion.div>
        </div>

      </div>
    </section>
  );
}
