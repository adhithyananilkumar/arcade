"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring } from "framer-motion";
import { ShieldCheck, BadgeCheck, Medal, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import WhyGetCertifiedSection from "@/apps/public/components/landing/WhyGetCertifiedSection";

const FRAME_COUNT = 300;

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);

  // --- COMBINED SCROLL PROGRESS (500vh Total) ---
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 20,
    restDelta: 0.001
  });

  // 0% to 40% of scroll is Hero (200vh out of 500vh)
  const heroTextOpacity = useTransform(smoothProgress, [0, 0.1], [1, 0]);
  // Logo scales up massively. Start at 0.1, end at 0.4.
  const heroLogoScale = useTransform(smoothProgress, [0.1, 0.4], [1, 150]);
  // Hero wrapper opacity (disappear after 0.4 so it doesn't block clicks)
  const heroWrapperOpacity = useTransform(smoothProgress, [0.38, 0.4], [1, 0]);
  const heroPointerEvents = useTransform(smoothProgress, (p) => p > 0.4 ? "none" : "auto");

  // Preload images
  useEffect(() => {
    let isMounted = true;
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new window.Image();
      const paddedIndex = i.toString().padStart(3, "0");
      img.src = `/about-picture/ezgif-frame-${paddedIndex}.jpg`;
      img.onload = () => {
        if (!isMounted) return;
        loadedCount++;
        if (loadedCount === FRAME_COUNT) {
          setLoaded(true);
        }
      };
      loadedImages.push(img);
    }
    
    if (isMounted) {
      setImages(loadedImages);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Draw frame on canvas
  const drawImage = (index: number) => {
    if (!canvasRef.current || !images[index]) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = images[index];

    // Object-fit: cover logic
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;

    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

    if (canvasRatio > imgRatio) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgRatio;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawWidth = canvas.height * imgRatio;
      drawHeight = canvas.height;
      offsetX = (canvas.width - drawWidth) / 2;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        
        const latest = smoothProgress.get();
        let canvasProgress = 0;
        if (latest > 0.4) {
          const endScrollThreshold = 0.9;
          canvasProgress = (latest - 0.4) / (endScrollThreshold - 0.4);
          if (canvasProgress > 1) canvasProgress = 1;
          if (canvasProgress < 0) canvasProgress = 0;
        }
        
        const currentFrame = Math.floor(canvasProgress * (FRAME_COUNT - 1));
        if (loaded) drawImage(currentFrame);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [loaded, smoothProgress]);

  // Update canvas on scroll
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (!loaded) return;
    
    let canvasProgress = 0;
    if (latest > 0.4) {
      const endScrollThreshold = 0.9;
      canvasProgress = (latest - 0.4) / (endScrollThreshold - 0.4);
      if (canvasProgress > 1) canvasProgress = 1;
      if (canvasProgress < 0) canvasProgress = 0;
    }
    
    const frameIndex = Math.floor(canvasProgress * (FRAME_COUNT - 1));
    requestAnimationFrame(() => drawImage(frameIndex));
  });

  // Initial draw once loaded
  useEffect(() => {
    if (loaded) {
      drawImage(0);
    }
  }, [loaded]);

  // --- TEXT OVERLAY ANIMATIONS ---

  // 1. Hero Text (0 - 15% visible, fades out by 20%)
  const oldHeroOpacity = useTransform(smoothProgress, [0.4, 0.55, 0.61], [1, 1, 0]);
  const oldHeroY = useTransform(smoothProgress, [0.4, 0.55, 0.61], [0, 0, -50]);

  // 2. Intro Text (30% - 90% visible)
  const introOpacity = useTransform(smoothProgress, [0.58, 0.67, 0.94, 0.98], [0, 1, 1, 0]);
  const introY = useTransform(smoothProgress, [0.58, 0.67, 0.94, 0.98], [50, 0, 0, -50]);

  // Staggered text lines within intro text
  const introLine1Op = useTransform(smoothProgress, [0.59, 0.64], [0, 1]);
  const introLine1Y = useTransform(smoothProgress, [0.59, 0.64], [30, 0]);
  const introLine2Op = useTransform(smoothProgress, [0.63, 0.68], [0, 1]);
  const introLine2Y = useTransform(smoothProgress, [0.63, 0.68], [30, 0]);

  return (
    <div className="bg-[#050505] text-white min-h-screen relative font-sans selection:bg-white/20 selection:text-white">
      
      {/* COMBINED HERO & SCROLLYTELLING CONTAINER */}
      <div ref={containerRef} className="h-[500vh] relative w-full">
        
        {/* SCROLLYTELLING CANVAS (Sticky background layer) */}
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#050505] z-0">
          {/* Subtle Radial Gradient Background */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#050815] via-[#050505] to-[#050505] opacity-90 pointer-events-none" />
          
          <canvas
            ref={canvasRef}
            className="absolute inset-0 z-10 w-full h-full"
            style={{ filter: "contrast(1.05) brightness(0.9)" }}
          />
          
          <div className="absolute inset-0 z-20 bg-gradient-to-b from-[#050505]/60 via-transparent to-[#050505]/80 pointer-events-none" />
          
          {/* TEXT OVERLAYS */}
          <div className="absolute inset-0 z-30 pointer-events-none">
            {/* OLD HERO TEXT */}
            <motion.div 
              style={{ opacity: oldHeroOpacity, y: oldHeroY }} 
              className="absolute inset-0 flex flex-col justify-center items-start text-left mt-[-10vh] px-8 md:px-16 lg:px-[10%]"
            >
              {!loaded && (
                <div className="mt-10 text-[10px] font-bold text-white/40 tracking-[0.3em] uppercase animate-pulse">
                  Loading Experience...
                </div>
              )}
            </motion.div>

            {/* INTRO TEXT */}
            <motion.div
              style={{ opacity: introOpacity, y: introY }}
              className="absolute inset-0 flex flex-col justify-center items-start text-left px-8 md:px-16 lg:px-[10%]"
            >
            </motion.div>
          </div>
        </div>

        {/* HERO SECTION WITH SCROLL ZOOM (Sticky foreground layer) */}
        <motion.div 
          style={{ opacity: heroWrapperOpacity, pointerEvents: heroPointerEvents as any }}
          className="absolute top-0 left-0 w-full h-[200vh] z-50"
        >
          <div className="sticky top-0 h-screen w-full flex flex-col md:flex-row items-center justify-center md:justify-between px-8 md:px-16 lg:px-24 py-20 gap-12 overflow-hidden pointer-events-auto">
            
            {/* Left Side */}
            <motion.div style={{ opacity: heroTextOpacity }} className="flex-1 max-w-md text-white text-center md:text-left order-2 md:order-1 z-10 drop-shadow-md">
              <h2 className="font-bricolage text-3xl lg:text-4xl font-bold mb-4">Learn by Doing</h2>
              <p className="text-base lg:text-lg text-gray-200 leading-relaxed">
                Arcade provides an interactive learning environment where you gain practical experience through hands-on labs and real-world projects, bridging the gap between theory and industry.
              </p>
            </motion.div>

            {/* Center: Logo (Zooming) */}
            <motion.div 
              style={{ 
                scale: heroLogoScale, 
                transformOrigin: "51.93% 63.27%"
              }}
              className="flex-none order-1 md:order-2 z-10"
            >
              <Image 
                src="/arcade-navy.svg" 
                alt="Arcade Logo" 
                width={300} 
                height={300} 
                className="w-48 md:w-64 lg:w-80 h-auto brightness-0 invert drop-shadow-lg" 
              />
            </motion.div>

            {/* Right Side */}
            <motion.div style={{ opacity: heroTextOpacity }} className="flex-1 max-w-md text-white text-center md:text-right order-3 md:order-3 z-10 drop-shadow-md">
              <h2 className="font-bricolage text-3xl lg:text-4xl font-bold mb-4">Earn Credentials</h2>
              <p className="text-base lg:text-lg text-gray-200 leading-relaxed">
                Validate your skills with verifiable certificates backed by Amal Jyothi College of Engineering. Build a strong portfolio that showcases your technical expertise to future employers.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* --- WHY AJCE SECTION --- */}
      <WhyAJCESection />

      {/* --- WHY GET CERTIFIED SECTION --- */}
      <div className="relative z-40 bg-white">
        <WhyGetCertifiedSection />
      </div>

    </div>
  );
}

function WhyAJCESection() {
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
    <section className="relative overflow-hidden bg-[#f8fafc] text-[#0b1220] z-40">
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

        {/* FEATURE LIST */}
        <div className="mt-24 border-t border-[#0b1220]/15">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: index * 0.08 }}
                className="group relative grid gap-8 border-b border-[#0b1220]/15 py-12 transition-colors duration-500 hover:bg-white lg:grid-cols-[100px_1fr_1fr_80px] lg:items-center"
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
                <div className={`flex h-12 w-12 items-center justify-center rounded-full border border-[#0b1220]/15 transition-all duration-500 ${item.colorClasses.hoverBorder} ${item.colorClasses.hoverBg} group-hover:text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                {/* Hover line */}
                <div className={`absolute bottom-0 left-0 h-[2px] w-0 ${item.colorClasses.lineBg} transition-all duration-700 group-hover:w-full`} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
