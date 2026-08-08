"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, Variants, useScroll, useTransform, useInView, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  BadgeCheck,
  Medal,
} from "lucide-react";
import Link from "next/link";

import VariableProximity from "@/apps/public/components/landing/VariableProximity";
import WhyGetCertifiedSection from "@/apps/public/components/landing/WhyGetCertifiedSection";
import "@/apps/public/landing.css";

// Reusable Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
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

  return (
    <div className="landing-root min-h-screen flex flex-col relative z-10 bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-100/50 rounded-full blur-[120px] opacity-70" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[100px]" />
      </div>

      {/* --- HERO SECTION --- */}
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
            <button
              disabled
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white border border-slate-200 text-slate-400 font-semibold text-base cursor-not-allowed opacity-70"
              title="Verification feature coming soon"
            >
              <ShieldCheck size={18} />
              <span>Verify Certificates</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* --- AJCE ANIMATION + WHY AJCE SECTION --- */}
      <AJCESection />

      {/* --- WHY GET CERTIFIED SECTION --- */}
      <WhyGetCertifiedSection />
    </div>
  );
}

function AJCESection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /*
  ============================================================
  SCROLL PROGRESS
  ============================================================
  */

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 90%", "start 10%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 15,
    restDelta: 0.001,
  });

  // Coordinates
  const initA = isMobile ? { x: "20%", y: "20%" } : { x: "15%", y: "25%" };
  const initJ = isMobile ? { x: "70%", y: "35%" } : { x: "35%", y: "55%" };
  const initC = isMobile ? { x: "20%", y: "50%" } : { x: "55%", y: "20%" };
  const initE = isMobile ? { x: "70%", y: "65%" } : { x: "75%", y: "50%" };

  const finalY = isMobile ? "15%" : "30%";
  const finalA = isMobile ? { x: "17%", y: finalY } : { x: "8%", y: finalY };
  const finalJ = isMobile ? { x: "39%", y: finalY } : { x: "17%", y: finalY };
  const finalC = isMobile ? { x: "61%", y: finalY } : { x: "26%", y: finalY };
  const finalE = isMobile ? { x: "83%", y: finalY } : { x: "35%", y: finalY };

  // Opacities for appearance sequence
  const opacityJ = useTransform(smoothProgress, [0.15, 0.20], [0, 1]);
  const opacityC = useTransform(smoothProgress, [0.30, 0.35], [0, 1]);
  const opacityE = useTransform(smoothProgress, [0.45, 0.50], [0, 1]);

  // Line paths (drawing)
  const pathAJ = useTransform(smoothProgress, [0.05, 0.15], [0, 1]);
  const pathJC = useTransform(smoothProgress, [0.20, 0.30], [0, 1]);
  const pathCE = useTransform(smoothProgress, [0.35, 0.45], [0, 1]);

  // Line fading out before reorganization
  const lineOpacity = useTransform(smoothProgress, [0.65, 0.70], [1, 0]);

  // Letters movement to final positions
  const xA = useTransform(smoothProgress, [0.70, 0.90], [initA.x, finalA.x]);
  const yA = useTransform(smoothProgress, [0.70, 0.90], [initA.y, finalA.y]);

  const xJ = useTransform(smoothProgress, [0.70, 0.90], [initJ.x, finalJ.x]);
  const yJ = useTransform(smoothProgress, [0.70, 0.90], [initJ.y, finalJ.y]);

  const xC = useTransform(smoothProgress, [0.70, 0.90], [initC.x, finalC.x]);
  const yC = useTransform(smoothProgress, [0.70, 0.90], [initC.y, finalC.y]);

  const xE = useTransform(smoothProgress, [0.70, 0.90], [initE.x, finalE.x]);
  const yE = useTransform(smoothProgress, [0.70, 0.90], [initE.y, finalE.y]);

  // Final content reveal (institution details and building becomes clear)
  const finalRevealOpacity = useTransform(smoothProgress, [0.80, 0.90], [0, 1]);

  // Building fades in slightly from blueprint style, and shifts to center
  const buildingOpacity = useTransform(smoothProgress, [0, 0.70, 0.90], [0.3, 0.3, 1]);
  const buildingX = useTransform(smoothProgress, [0.70, 0.90], ["0%", "5%"]);

  const highlights = [
    {
      number: "01",
      title: "KIRF Rank #4",
      description: "Ranked #4 among all engineering colleges in Kerala by the Kerala Institutional Ranking Framework (KIRF).",
      icon: Medal,
      colorClasses: {
        numberText: "text-amber-500",
        hoverBorder: "group-hover:border-amber-500",
        hoverBg: "group-hover:bg-amber-500",
        lineBg: "bg-amber-500",
      }
    },
    {
      number: "02",
      title: "Autonomous Excellence",
      description: "An Autonomous Institution recognized for maintaining rigorous academic standards and continuous innovation.",
      icon: ShieldCheck,
      colorClasses: {
        numberText: "text-emerald-500",
        hoverBorder: "group-hover:border-emerald-500",
        hoverBg: "group-hover:bg-emerald-500",
        lineBg: "bg-emerald-500",
      }
    },
    {
      number: "03",
      title: "NAAC A+ & NBA Accredited",
      description: "Highly accredited with a NAAC A+ grade alongside NBA-accredited engineering programmes.",
      icon: BadgeCheck,
      colorClasses: {
        numberText: "text-blue-600",
        hoverBorder: "group-hover:border-blue-600",
        hoverBg: "group-hover:bg-blue-600",
        lineBg: "bg-blue-600",
      }
    },
    {
      number: "04",
      title: "India 101 Rank",
      description: "Highly accredited with a NAAC A+ grade alongside NBA-accredited engineering programmes.",
      icon: BadgeCheck,
      colorClasses: {
        numberText: "text-purple-500",
        hoverBorder: "group-hover:border-purple-500",
        hoverBg: "group-hover:bg-purple-500",
        lineBg: "bg-purple-500",
      }
    }
  ];

  return (
    <section className="relative bg-gradient-to-b from-slate-50 via-blue-50/60 to-slate-50 text-[#0b1220]">
      <div ref={sectionRef} className="relative h-[100vh] min-h-[850px] overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 bg-transparent" />

        {/* Building Sketch background/interactive layer */}
        <motion.div
          style={{ opacity: buildingOpacity, x: buildingX }}
          className="absolute right-[-15%] top-[22%] z-10 h-[55vh] w-[80vw] sm:right-[-10%] sm:w-[70vw] lg:right-[1%] lg:top-[17%] lg:h-[70vh] lg:w-[60vw]"
        >
          <div className="absolute inset-0 bg-[#2563eb]/10 blur-[100px]" />
          
          {/* Base Layer: Static Building */}
          <Image
            src="/images/ajce-sketch2.png"
            alt="Amal Jyothi College of Engineering campus"
            fill
            priority
            className="object-contain object-right"
          />

          {/* Layer 2: Left Tree */}
          <motion.div
            className="absolute inset-0 z-10"
            style={{ transformOrigin: "50% 100%" }}
            animate={
              shouldReduceMotion ? {} : { rotate: [-1, 1.5, -1] }
            }
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
          >
            <Image
              src="/images/left-tree.png"
              alt=""
              fill
              priority
              className="object-contain object-right pointer-events-none"
            />
          </motion.div>

          {/* Layer 3: Right Tree */}
          <motion.div
            className="absolute inset-0 z-10"
            style={{ transformOrigin: "50% 100%" }}
            animate={
              shouldReduceMotion ? {} : { rotate: [1, -1.2, 1] }
            }
            transition={{
              duration: 6.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            <Image
              src="/images/right-tree.png"
              alt=""
              fill
              priority
              className="object-contain object-right pointer-events-none"
            />
          </motion.div>
        </motion.div>

        {/* SVG Overlay for Connections */}
        <svg className="absolute inset-0 h-full w-full pointer-events-none z-20">
          <motion.line
            x1={initA.x} y1={initA.y} x2={initJ.x} y2={initJ.y}
            stroke="#2563eb" strokeWidth={isMobile ? 2 : 3}
            style={{ pathLength: pathAJ, opacity: lineOpacity }}
          />
          <motion.line
            x1={initJ.x} y1={initJ.y} x2={initC.x} y2={initC.y}
            stroke="#2563eb" strokeWidth={isMobile ? 2 : 3}
            style={{ pathLength: pathJC, opacity: lineOpacity }}
          />
          <motion.line
            x1={initC.x} y1={initC.y} x2={initE.x} y2={initE.y}
            stroke="#2563eb" strokeWidth={isMobile ? 2 : 3}
            style={{ pathLength: pathCE, opacity: lineOpacity }}
          />

          {/* SVG circle nodes */}
          <motion.circle cx={initA.x} cy={initA.y} r="6" fill="white" stroke="#2563eb" strokeWidth="2" style={{ opacity: lineOpacity }} />
          <motion.circle cx={initJ.x} cy={initJ.y} r="6" fill="white" stroke="#2563eb" strokeWidth="2" style={{ opacity: lineOpacity }} />
          <motion.circle cx={initC.x} cy={initC.y} r="6" fill="white" stroke="#2563eb" strokeWidth="2" style={{ opacity: lineOpacity }} />
          <motion.circle cx={initE.x} cy={initE.y} r="6" fill="white" stroke="#2563eb" strokeWidth="2" style={{ opacity: lineOpacity }} />
        </svg>

        {/* Animated Typography */}
        <div className="absolute inset-0 z-30 pointer-events-none font-black text-[22vw] md:text-[12vw] tracking-[-0.05em] text-[#0b1220] leading-none">
          <motion.div style={{ left: xA, top: yA }} className="absolute -translate-x-1/2 -translate-y-1/2">
            A
          </motion.div>
          <motion.div style={{ left: xJ, top: yJ, opacity: opacityJ }} className="absolute -translate-x-1/2 -translate-y-1/2">
            J
          </motion.div>
          <motion.div style={{ left: xC, top: yC, opacity: opacityC }} className="absolute -translate-x-1/2 -translate-y-1/2">
            C
          </motion.div>
          <motion.div style={{ left: xE, top: yE, opacity: opacityE }} className="absolute -translate-x-1/2 -translate-y-1/2">
            E
          </motion.div>
        </div>

        {/* Final Reveal Institution Details */}
        <motion.div
          style={{ opacity: finalRevealOpacity }}
          className="absolute left-[8%] md:left-[8%] top-[45%] z-40 max-w-[520px] pr-8 lg:pr-12"
        >
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#2563eb]">
            Powered by Amal Jyothi
          </p>
          <h2 className="font-bricolage text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            College of<br />Engineering
          </h2>
          <p className="mt-6 max-w-[430px] text-base leading-7 text-[#64748b] pr-4">
            Arcade is the official learning and event platform of Amal
            Jyothi College of Engineering, where every certificate is
            backed by an institution known for academic excellence,
            innovation, and industry engagement.
          </p>
        </motion.div>

      </div>


      {/* ========================================================
          WHY AJCE
      ========================================================= */}

      <section className="relative overflow-hidden bg-[#f8fafc]">

        <div className="mx-auto max-w-[1400px] px-6 py-28 sm:px-10 lg:px-16 lg:py-40">

          {/* Section heading */}

          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >

              <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[#2563eb]">
                Why AJCE
              </p>

              <h3 className="font-bricolage text-4xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-6xl">
                Kerala's largest
                <br />
                infrastructure of
                <br />
                <span className="text-[#2563eb]">
                  Engineering Education.
                </span>
              </h3>

            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="flex items-center"
            >

              <p className="max-w-2xl text-base md:text-lg leading-8 text-[#64748b]">
                An institution shaped by academic excellence,
                innovation, accreditation, and a commitment to
                meaningful industry engagement.
              </p>

            </motion.div>

          </div>

          {/* ====================================================
              FEATURE LIST
          ========================================================= */}

          <div className="mt-24 border-t border-[#0b1220]/15">

            {highlights.map((item, index) => {

              const Icon = item.icon;

              return (

                <motion.div
                  key={item.number}
                  initial={{
                    opacity: 0,
                    y: 40,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    margin: "-80px",
                  }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.08,
                  }}
                  className="
                    group
                    relative
                    grid
                    gap-8
                    border-b
                    border-[#0b1220]/15
                    py-12
                    transition-colors
                    duration-500
                    hover:bg-white
                    lg:grid-cols-[100px_1fr_1fr_80px]
                    lg:items-center
                  "
                >

                  {/* Number */}

                  <div className="flex items-center h-full pl-8">
                    <div className={`text-[45px] font-bold tracking-widest -rotate-90 transform origin-center whitespace-nowrap ${item.colorClasses.numberText}`}>
                      {item.number}
                    </div>
                  </div>

                  {/* Title */}

                  <h4 className="text-2xl font-bold tracking-tight sm:text-3xl pl-6">
                    {item.title}
                  </h4>

                  {/* Description */}

                  <p className="max-w-md text-base leading-7 text-[#64748b]">
                    {item.description}
                  </p>

                  {/* Icon */}

                  <div className={`
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#0b1220]/15
                    transition-all
                    duration-500
                    ${item.colorClasses.hoverBorder}
                    ${item.colorClasses.hoverBg}
                    group-hover:text-white
                  `}>

                    <Icon className="h-5 w-5" />

                  </div>

                  {/* Hover line */}

                  <div className={`
                    absolute
                    bottom-0
                    left-0
                    h-[2px]
                    w-0
                    ${item.colorClasses.lineBg}
                    transition-all
                    duration-700
                    group-hover:w-full
                  `} />

                </motion.div>

              );

            })}

          </div>

        </div>

      </section>

    </section>
  );
}
