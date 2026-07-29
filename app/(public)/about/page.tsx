"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, Variants, useScroll, useTransform, useInView, useMotionValue, useSpring, useReducedMotion, useMotionValueEvent } from "framer-motion";
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

function ImageSequence({ progress }: { progress: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameCount = 300;

  useEffect(() => {
    // Preload images
    const images: HTMLImageElement[] = [];
    for (let i = 1; i <= frameCount; i++) {
      const img = new globalThis.Image();
      const frameNum = i.toString().padStart(3, '0');
      img.src = `/scroll animation/ezgif-frame-${frameNum}.jpg`;
      images.push(img);
    }
    imagesRef.current = images;

    // Draw first frame when loaded
    images[0].onload = () => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.drawImage(images[0], 0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    };
  }, []);

  useMotionValueEvent(progress, "change", (latest: number) => {
    const frameIndex = Math.min(
      frameCount - 1,
      Math.max(0, Math.floor(latest * frameCount))
    );
    
    if (imagesRef.current[frameIndex] && canvasRef.current) {
      const img = imagesRef.current[frameIndex];
      const ctx = canvasRef.current.getContext('2d');
      if (ctx && img.complete) {
        ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  });

  return (
    <canvas 
      ref={canvasRef}
      width={1920}
      height={1080}
      className="w-full h-full object-cover"
    />
  );
}

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100, mass: 0.5 });

  const navOpacity = useTransform(smoothProgress, [0, 0.05], [0, 1]);
  const imageScale = useTransform(smoothProgress, [0, 0.4, 0.85, 1], [1, 1.4, 1.1, 1]);
  const imageOpacity = useTransform(smoothProgress, [0, 0.15, 0.85, 1], [0.7, 1, 1, 0.7]);
  const imageY = useTransform(smoothProgress, [0, 1], ["0%", "10%"]);

  const p1Opacity = useTransform(smoothProgress, [0, 0.1, 0.15], [1, 1, 0]);
  const p1Y = useTransform(smoothProgress, [0.1, 0.15], [0, -50]);

  const p2Opacity = useTransform(smoothProgress, [0.15, 0.2, 0.35, 0.4], [0, 1, 1, 0]);
  const p2Y = useTransform(smoothProgress, [0.15, 0.2, 0.35, 0.4], [50, 0, 0, -50]);

  const p3Opacity = useTransform(smoothProgress, [0.4, 0.45, 0.6, 0.65], [0, 1, 1, 0]);
  const p3Y = useTransform(smoothProgress, [0.4, 0.45, 0.6, 0.65], [50, 0, 0, -50]);

  const p4Opacity = useTransform(smoothProgress, [0.65, 0.7, 0.8, 0.85], [0, 1, 1, 0]);
  const p4Y = useTransform(smoothProgress, [0.65, 0.7, 0.8, 0.85], [50, 0, 0, -50]);

  const p5Opacity = useTransform(smoothProgress, [0.85, 0.9, 1], [0, 1, 1]);
  const p5Y = useTransform(smoothProgress, [0.85, 0.9, 1], [50, 0, 0]);

  return (
    <div className="bg-[#050505] text-white/90 font-sans selection:bg-[#0050FF]/30">
      <motion.nav 
        style={{ opacity: navOpacity }}
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-8 bg-[#0A0A0C]/70 backdrop-blur-md border-b border-white/5"
      >
        <div className="text-xl font-bold tracking-tight text-white">WH-1000XM6</div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <Link href="#overview" className="hover:text-white transition-colors">Overview</Link>
          <Link href="#tech" className="hover:text-white transition-colors">Technology</Link>
          <Link href="#nc" className="hover:text-white transition-colors">Noise Cancelling</Link>
          <Link href="#specs" className="hover:text-white transition-colors">Specs</Link>
        </div>
        <button className="px-5 py-2 rounded-full bg-gradient-to-r from-[#0050FF] to-[#00D6FF] text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          Experience WH-1000XM6
        </button>
      </motion.nav>

      <div ref={containerRef} className="relative h-[400vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,8,21,1)_0%,rgba(5,5,5,1)_100%)] -z-20" />
          <div className="absolute inset-0 -z-10 opacity-80">
            <ImageSequence progress={smoothProgress} />
          </div>

          <motion.div 
            style={{ opacity: p1Opacity, y: p1Y }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-white">Sony WH-1000XM6</h1>
            <p className="text-2xl md:text-3xl text-white/80 font-medium tracking-tight mb-4">Silence, perfected.</p>
            <p className="text-lg text-white/50 max-w-lg">Flagship wireless noise cancelling, re-engineered for a world that never stops.</p>
          </motion.div>

          <motion.div 
            style={{ opacity: p2Opacity, y: p2Y }}
            className="absolute inset-0 flex flex-col items-start justify-center px-12 md:px-32 pointer-events-none"
          >
            <div className="max-w-md">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">Precision-engineered for silence.</h2>
              <p className="text-lg text-white/60">Custom 40mm drivers and sealed acoustic chambers work in perfect harmony to deliver uncompromising audio fidelity while blocking the outside world. Designed for all-day comfort with memory foam ear cushions.</p>
            </div>
          </motion.div>

          <motion.div 
            style={{ opacity: p3Opacity, y: p3Y }}
            className="absolute inset-0 flex flex-col items-end justify-center px-12 md:px-32 pointer-events-none text-right"
          >
            <div className="max-w-md ml-auto">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#0050FF] to-[#00D6FF]">Adaptive noise cancelling, redefined.</h2>
              <ul className="text-lg text-white/60 space-y-3 text-right">
                <li>Multi-microphone array listens in every direction.</li>
                <li>Real-time noise analysis adapts to your environment.</li>
                <li>Your music stays pure—planes, trains, and crowds fade away.</li>
              </ul>
            </div>
          </motion.div>

          <motion.div 
            style={{ opacity: p4Opacity, y: p4Y }}
            className="absolute inset-0 flex flex-col items-center justify-end pb-32 px-6 pointer-events-none text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">Immersive, lifelike sound.</h2>
            <p className="text-lg text-white/60 max-w-xl mx-auto">High-performance drivers with premium magnetic coils deliver a breathtakingly detailed soundstage. Our next-gen AI upscaling restores clarity and presence to compressed audio formats instantly.</p>
          </motion.div>

          <motion.div 
            style={{ opacity: p5Opacity, y: p5Y }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
          >
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-white">Hear everything.<br/>Feel nothing else.</h2>
            <p className="text-xl text-white/60 mb-10">WH-1000XM6. Designed for focus, crafted for comfort.</p>
            <div className="flex items-center gap-6 pointer-events-auto">
              <button className="px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:bg-white/90 transition-colors">
                Experience WH-1000XM6
              </button>
              <Link href="#specs" className="text-white/60 hover:text-white border-b border-transparent hover:border-white transition-all font-medium">
                See full specs
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="bg-white text-slate-900 rounded-t-[40px] relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <AJCESection />
        <WhyGetCertifiedSection />
      </div>
    </div>
  );
}

function AJCESection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

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
          <Image
            src="/images/ajce-sketch2.png"
            alt="Amal Jyothi College of Engineering campus"
            fill
            priority
            className="object-contain object-right"
          />
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

            <div>

              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#2563eb]">
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

            </div>

            <div className="flex items-center">

              <p className="max-w-2xl text-base md:text-lg leading-8 text-[#64748b]">
                An institution shaped by academic excellence,
                innovation, accreditation, and a commitment to
                meaningful industry engagement.
              </p>

            </div>

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

                  <div className={`text-sm font-bold tracking-[0.2em] ${item.colorClasses.numberText}`}>
                    {item.number}
                  </div>

                  {/* Title */}

                  <h4 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {item.title}
                  </h4>

                  {/* Description */}

                  <p className="max-w-md text-sm leading-6 text-[#64748b]">
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
