"use client";

import React, { useRef, useEffect, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

// ============================================================
// FRAME CONSTANTS & ASSET URL BUILDERS
// ============================================================
const TOTAL_CLOUD_FRAMES = 270;
const TOTAL_CAMPUS_FRAMES = 300;
// Sample every 2nd frame for 60FPS fluid scrubbing & low RAM
const FRAME_STEP = 2;

function getCloudFrameUrl(frameNum: number): string {
  const padded = String(Math.max(1, Math.min(TOTAL_CLOUD_FRAMES, frameNum))).padStart(3, "0");
  return `/scrolleffectcloud/ezgif-frame-${padded}.jpg`;
}

function getCampusFrameUrl(frameNum: number): string {
  const padded = String(Math.max(1, Math.min(TOTAL_CAMPUS_FRAMES, frameNum))).padStart(3, "0");
  return `/scrolleffect%20images/ezgif-frame-${padded}.jpg`;
}

// Unified Radiant Ambient Gradient matching other Arcade public pages (no bg photo image)
const HERO_RADIANT_STYLE: React.CSSProperties = {
  backgroundColor: "#E9EEFB",
  backgroundImage:
    "radial-gradient(ellipse 75% 45% at 50% 0%, rgba(255, 255, 255, 0.95) 0%, transparent 65%), " +
    "radial-gradient(ellipse 65% 45% at 12% 15%, rgba(196, 181, 253, 0.35) 0%, transparent 60%), " +
    "radial-gradient(ellipse 60% 45% at 88% 20%, rgba(147, 197, 253, 0.38) 0%, transparent 60%), " +
    "radial-gradient(ellipse 70% 45% at 50% 40%, rgba(103, 232, 249, 0.22) 0%, transparent 60%), " +
    "linear-gradient(180deg, #E9EEFB 0%, #F2F5FD 35%, #F8FAFD 70%, #F2F5FD 100%)",
};

// Section 2 starts with identical solid radiant styling so canvas is 100% blocked until blend starts
const SECTION2_RADIANT_STYLE: React.CSSProperties = HERO_RADIANT_STYLE;

export default function HeroScrollExperience() {
  const stickyContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Mouse Parallax for hero text
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 100 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  const textX = useTransform(mouseXSpring, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-6, 6]);
  const textY = useTransform(mouseYSpring, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-4, 4]);

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

  // Scroll Progress across the 480vh sticky animation section
  const { scrollYProgress } = useScroll({
    target: stickyContainerRef,
    offset: ["start start", "end end"],
  });

  /*
  ============================================================
  SECTION 2 SCROLL TIMELINE (0.00 -> 1.00):
  [0.00 - 0.12]: Arcade Stats displayed over identical radiant ambient backdrop
  [0.10 - 0.24]: Radiant overlay blends smoothly into live 3D cloud flight canvas (1 -> 0)
  [0.10 - 0.22]: Arcade Stats dissolve & lift into the clouds
  [0.20 - 0.38]: "Powered by Amal Jyothi" appears in the cloud deck
  [0.34 - 0.58]: Clouds divide, swirl, and part as camera flies through (Frames 40 -> 270)
  [0.58 - 0.82]: Seamless cut to Campus Drone Flyover (Frames 1 -> 300)
  [0.82 - 1.00]: Locked at Frame 300 (entrance dwell zone), then normal page scroll
  ============================================================
  */

  // Radiant Background Blend Overlay: seamlessly blends into live cloud flight
  const bgBlendOpacity = useTransform(
    scrollYProgress,
    [0.10, 0.24],
    [1, 0]
  );
  const bgBlendDisplay = useTransform(
    scrollYProgress,
    (v) => (v >= 0.26 ? "none" : "block")
  );

  // Arcade Stats Section Dissolve Transition
  const statsOpacity = useTransform(
    scrollYProgress,
    [0.00, 0.10, 0.22],
    [1, 1, 0]
  );
  const statsY = useTransform(
    scrollYProgress,
    [0.10, 0.22],
    [0, -35]
  );
  const statsScale = useTransform(
    scrollYProgress,
    [0.10, 0.22],
    [1, 1.03]
  );
  const statsDisplay = useTransform(
    scrollYProgress,
    (v) => (v >= 0.24 ? "none" : "flex")
  );

  // "Powered by Amal Jyothi" Appearance & Dissolve
  const poweredOpacity = useTransform(
    scrollYProgress,
    [0.20, 0.26, 0.34, 0.40],
    [0, 1, 1, 0]
  );
  const poweredY = useTransform(
    scrollYProgress,
    [0.20, 0.26, 0.34, 0.40],
    [25, 0, 0, -25]
  );
  const poweredScale = useTransform(
    scrollYProgress,
    [0.20, 0.26, 0.34, 0.40],
    [0.94, 1, 1, 1.06]
  );
  const poweredDisplay = useTransform(
    scrollYProgress,
    (v) => (v < 0.18 || v >= 0.42 ? "none" : "flex")
  );

  // Direct Frame Index Transforms:
  // Clouds: scrub from 1 to 270 across [0.00, 0.58]
  const cloudFrameMotion = useTransform(
    scrollYProgress,
    [0.00, 0.14, 0.34, 0.58],
    [1, 25, 75, TOTAL_CLOUD_FRAMES]
  );

  // Campus: scrub from 1 to 300 across [0.58, 0.82], locked at 300 across [0.82, 1.00]
  const campusFrameMotion = useTransform(
    scrollYProgress,
    [0.58, 0.82, 1.00],
    [1, TOTAL_CAMPUS_FRAMES, TOTAL_CAMPUS_FRAMES]
  );

  // ============================================================
  // HIGH-PERFORMANCE DUAL-SEQUENCE PRE-CACHED CANVAS RENDERER
  // ============================================================
  const cloudCacheRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const campusCacheRef = useRef<Map<number, HTMLImageElement>>(new Map());

  const currentModeRef = useRef<"cloud" | "campus">("cloud");
  const currentFrameRef = useRef<number>(1);
  const renderedKeyRef = useRef<string>("");
  const rafIdRef = useRef<number>(0);

  // Draw image cover-fit to canvas
  const renderFrame = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || 1920;
    const ih = img.naturalHeight || 1080;

    const imgRatio = iw / ih;
    const canvasRatio = cw / ch;

    let rw = cw;
    let rh = ch;
    let ox = 0;
    let oy = 0;

    if (canvasRatio > imgRatio) {
      rh = cw / imgRatio;
      oy = (ch - rh) / 2;
    } else {
      rw = ch * imgRatio;
      ox = (cw - rw) / 2;
    }

    ctx.drawImage(img, ox, oy, rw, rh);
  }, []);

  // RAF render tick
  const tickRender = useCallback(() => {
    const mode = currentModeRef.current;
    const targetIdx = currentFrameRef.current;
    const renderKey = `${mode}-${targetIdx}`;

    if (renderKey !== renderedKeyRef.current) {
      const cache = mode === "cloud" ? cloudCacheRef.current : campusCacheRef.current;
      let img = cache.get(targetIdx);

      // Neighbor fallback if current frame is loading
      if (!img || !img.complete) {
        for (let diff = FRAME_STEP; diff <= 30; diff += FRAME_STEP) {
          const prev = cache.get(targetIdx - diff);
          if (prev && prev.complete) {
            img = prev;
            break;
          }
          const next = cache.get(targetIdx + diff);
          if (next && next.complete) {
            img = next;
            break;
          }
        }
      }

      if (img && img.complete && img.naturalWidth > 0) {
        renderFrame(img);
        renderedKeyRef.current = renderKey;
      }
    }
  }, [renderFrame]);

  // Preloader for Cloud & Campus sequences
  useEffect(() => {
    const cloudCache = cloudCacheRef.current;
    const campusCache = campusCacheRef.current;
    let isCancelled = false;

    // 1. Immediately preload and paint Cloud Frame 1
    const firstCloud = new window.Image();
    firstCloud.src = getCloudFrameUrl(1);
    firstCloud.onload = () => {
      if (isCancelled) return;
      cloudCache.set(1, firstCloud);
      if (currentModeRef.current === "cloud" && currentFrameRef.current === 1) {
        renderFrame(firstCloud);
        renderedKeyRef.current = "cloud-1";
      }
    };

    // 2. Preload Campus Frame 1
    const firstCampus = new window.Image();
    firstCampus.src = getCampusFrameUrl(1);
    firstCampus.onload = () => {
      if (isCancelled) return;
      campusCache.set(1, firstCampus);
    };

    // Prepare sampled index lists
    const cloudIndices: number[] = [];
    for (let i = 1; i <= TOTAL_CLOUD_FRAMES; i += FRAME_STEP) {
      cloudIndices.push(i);
    }
    if (!cloudIndices.includes(TOTAL_CLOUD_FRAMES)) cloudIndices.push(TOTAL_CLOUD_FRAMES);

    const campusIndices: number[] = [];
    for (let i = 1; i <= TOTAL_CAMPUS_FRAMES; i += FRAME_STEP) {
      campusIndices.push(i);
    }
    if (!campusIndices.includes(TOTAL_CAMPUS_FRAMES)) campusIndices.push(TOTAL_CAMPUS_FRAMES);

    // Staggered non-blocking loader
    let cloudCursor = 1;
    let campusCursor = 1;
    const batchSize = 10;

    const loadCloudBatch = () => {
      if (isCancelled || cloudCursor >= cloudIndices.length) {
        setTimeout(loadCampusBatch, 40);
        return;
      }

      const end = Math.min(cloudCursor + batchSize, cloudIndices.length);
      for (let i = cloudCursor; i < end; i++) {
        const frameNum = cloudIndices[i];
        const img = new window.Image();
        img.src = getCloudFrameUrl(frameNum);
        img.onload = () => {
          if (isCancelled) return;
          cloudCache.set(frameNum, img);
          if (currentModeRef.current === "cloud" && currentFrameRef.current === frameNum) {
            renderFrame(img);
            renderedKeyRef.current = `cloud-${frameNum}`;
          }
        };
      }
      cloudCursor = end;
      setTimeout(loadCloudBatch, 25);
    };

    const loadCampusBatch = () => {
      if (isCancelled || campusCursor >= campusIndices.length) return;

      const end = Math.min(campusCursor + batchSize, campusIndices.length);
      for (let i = campusCursor; i < end; i++) {
        const frameNum = campusIndices[i];
        const img = new window.Image();
        img.src = getCampusFrameUrl(frameNum);
        img.onload = () => {
          if (isCancelled) return;
          campusCache.set(frameNum, img);
          if (currentModeRef.current === "campus" && currentFrameRef.current === frameNum) {
            renderFrame(img);
            renderedKeyRef.current = `campus-${frameNum}`;
          }
        };
      }
      campusCursor = end;
      setTimeout(loadCampusBatch, 25);
    };

    const timer = setTimeout(loadCloudBatch, 60);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      cancelAnimationFrame(rafIdRef.current);
      for (const img of cloudCache.values()) img.src = "";
      for (const img of campusCache.values()) img.src = "";
      cloudCache.clear();
      campusCache.clear();
    };
  }, [renderFrame]);

  // Canvas resize with DPR clamping
  useEffect(() => {
    const updateSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width === 0 || height === 0) return;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      const ctx = canvas.getContext("2d", { alpha: false });
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "medium";
      }

      const mode = currentModeRef.current;
      const cache = mode === "cloud" ? cloudCacheRef.current : campusCacheRef.current;
      const currentImg = cache.get(currentFrameRef.current) || cache.get(1);
      if (currentImg && currentImg.complete) {
        renderFrame(currentImg);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [renderFrame]);

  // Synchronized Scroll Change Listener (0ms latency, zero re-renders)
  useEffect(() => {
    const updateFrame = (progress: number) => {
      let mode: "cloud" | "campus" = "cloud";
      let targetFrame = 1;

      if (progress < 0.58) {
        mode = "cloud";
        const raw = cloudFrameMotion.get();
        let target = Math.round(raw);
        if (target !== TOTAL_CLOUD_FRAMES && target % FRAME_STEP === 0) {
          target = target - 1;
        }
        targetFrame = Math.max(1, Math.min(TOTAL_CLOUD_FRAMES, target));
      } else {
        mode = "campus";
        const raw = campusFrameMotion.get();
        let target = Math.round(raw);
        if (target !== TOTAL_CAMPUS_FRAMES && target % FRAME_STEP === 0) {
          target = target - 1;
        }
        targetFrame = Math.max(1, Math.min(TOTAL_CAMPUS_FRAMES, target));
      }

      currentModeRef.current = mode;
      currentFrameRef.current = targetFrame;

      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(tickRender);
    };

    const unsubscribe = scrollYProgress.on("change", updateFrame);
    return () => {
      unsubscribe();
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [scrollYProgress, cloudFrameMotion, campusFrameMotion, tickRender]);

  return (
    <div className="w-full flex flex-col overflow-visible" style={HERO_RADIANT_STYLE}>
      {/* =========================================================
          SECTION 1: HERO SECTION (Radiant Gradient Color — NO bg image)
          Overlays Section 2 with an undetectable seamless transition
      ========================================================= */}
      <section
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative z-20 w-full min-h-screen flex flex-col justify-center items-center text-center px-6 overflow-visible select-none bg-transparent"
      >
        {/* Ambient luminous radiant mesh orbs */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[90vw] max-w-[1100px] h-[600px] bg-gradient-to-tr from-blue-200/40 via-sky-100/50 to-indigo-200/30 rounded-full blur-[130px] pointer-events-none -z-10" />
        <div className="absolute top-[25%] left-[5%] w-[450px] h-[450px] bg-purple-200/25 rounded-full blur-[110px] pointer-events-none -z-10" />
        <div className="absolute top-[35%] right-[5%] w-[450px] h-[450px] bg-teal-100/30 rounded-full blur-[110px] pointer-events-none -z-10" />

        {/* Floating birds animation */}
        <div className="absolute inset-0 pointer-events-none animate-birds-float opacity-30 -z-10" />

        {/* Hero Content */}
        <motion.div
          style={{ x: textX, y: textY }}
          className="relative z-10 max-w-[800px] mx-auto text-center space-y-8 my-auto py-20 sm:py-24"
        >
          {/* HEADLINE */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[52px] sm:text-[68px] md:text-[76px] lg:text-[84px] tracking-tight leading-[1.05] text-[#0B132B] drop-shadow-[0_4px_16px_rgba(11,19,43,0.04)] text-center"
            style={{
              fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
              fontWeight: 600,
            }}
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
                  backgroundImage:
                    "linear-gradient(90deg, #0D9488 0%, #06B6D4 35%, #2563EB 70%, #7C3AED 100%)",
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
            className="text-[18px] sm:text-[19px] leading-[1.75] text-[#334155] max-w-[560px] mx-auto font-sans font-normal"
          >
            Arcade is AJCE's official platform for learning, innovation, and collaboration, offering certified webinars, hackathons, workshops, and engaging community experiences.
          </motion.p>

          {/* BUTTONS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
            className="pt-2 flex flex-wrap justify-center items-center gap-4"
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
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-400 font-medium text-base cursor-not-allowed opacity-75 shadow-sm"
              title="Verification feature coming soon"
            >
              <ShieldCheck size={18} />
              <span>Verify Certificates</span>
            </button>
          </motion.div>
        </motion.div>

      </section>

      {/* =========================================================
          SECTION 2: CONTINUOUS SCROLL ANIMATION STAGE
          Starts tucked underneath Section 1 with matching radiant styling ->
          Blends smoothly into live 3D cloud flight -> "Powered by Amal Jyothi" ->
          Clouds Divide -> Campus Drone Flyover -> Frame 300 Dwell
      ========================================================= */}
      <div
        ref={stickyContainerRef}
        className="relative z-10 -mt-20 w-full h-[480vh] bg-transparent"
      >
        {/* Sticky Fullscreen Stage */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center select-none bg-transparent">
          {/* =========================================================
              LAYER 0: 60FPS CINEMATIC CANVAS (Cloud Flight & Drone Flyover)
          ========================================================= */}
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-full block object-cover"
            />
          </div>

          {/* =========================================================
              LAYER 1: RADIANT BACKGROUND BLEND OVERLAY
              Uses matching radiant gradient as Section 1; as you scroll,
              it blends smoothly (1 -> 0) into the live 3D cloud flight canvas
          ========================================================= */}
          <motion.div
            style={{
              opacity: bgBlendOpacity,
              display: bgBlendDisplay,
            }}
            className="absolute inset-0 z-10 pointer-events-none will-change-transform bg-white"
          >
            <div className="w-full h-full" style={SECTION2_RADIANT_STYLE} />
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[90vw] max-w-[1100px] h-[600px] bg-gradient-to-tr from-blue-200/35 via-sky-100/45 to-indigo-200/25 rounded-full blur-[120px] pointer-events-none" />
          </motion.div>

          {/* =========================================================
              LAYER 2: ARCADE STATS (Same Layout Format as Hero)
              Displayed over the blended background; dissolves as cloud flight begins
          ========================================================= */}
          <motion.div
            style={{
              opacity: statsOpacity,
              y: statsY,
              scale: statsScale,
              display: statsDisplay,
            }}
            className="absolute z-20 max-w-[850px] mx-auto text-center px-6 flex flex-col items-center pointer-events-none will-change-transform"
          >
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-[0_8px_24px_rgba(15,23,42,0.08)] mb-6">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-600" />
              </span>
              <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-slate-800 font-sans">
                The Arcade Ecosystem
              </span>
            </div>

            {/* HEADLINE (Same Format as Hero) */}
            <h2
              className="text-[52px] sm:text-[68px] md:text-[76px] lg:text-[84px] tracking-tight leading-[1.05] text-[#0B132B] drop-shadow-[0_4px_16px_rgba(11,19,43,0.04)] text-center"
              style={{
                fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                fontWeight: 600,
              }}
            >
              <span className="block">
                Driven by{" "}
                <span className="relative inline-block">
                  Curiosity.
                  <span className="absolute left-0 -bottom-1 sm:-bottom-2 w-full h-[3px] sm:h-[4px] bg-[#0284C7] rounded-none origin-left" />
                </span>
              </span>
              <span className="block mt-1 sm:mt-2">
                Built for{" "}
                <span
                  className="inline-block animate-gradient-15s"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #2563EB 0%, #06B6D4 50%, #0D9488 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Scale.
                </span>
              </span>
            </h2>

            {/* DESCRIPTION */}
            <p className="mt-5 text-[18px] sm:text-[19px] leading-[1.75] text-[#334155] max-w-[620px] mx-auto font-sans font-normal">
              Arcade powers Amal Jyothi's technological vanguard — combining industry certifications, high-stakes hackathons, and interdisciplinary student ventures under one unified ecosystem.
            </p>

            {/* STATS ROW (Same format / clean metric pills) */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-[760px] w-full">
              {/* Stat 1 */}
              <div className="px-5 py-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_8px_20px_-6px_rgba(15,23,42,0.08)] text-center flex flex-col items-center">
                <span className="text-[26px] sm:text-[28px] font-bold text-[#0B132B] font-sans tracking-tight">5,000+</span>
                <span className="text-xs text-slate-600 font-medium mt-0.5">Active Innovators</span>
              </div>

              {/* Stat 2 */}
              <div className="px-5 py-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_8px_20px_-6px_rgba(15,23,42,0.08)] text-center flex flex-col items-center">
                <span className="text-[26px] sm:text-[28px] font-bold text-blue-600 font-sans tracking-tight">120+</span>
                <span className="text-xs text-slate-600 font-medium mt-0.5">Workshops & Events</span>
              </div>

              {/* Stat 3 */}
              <div className="px-5 py-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_8px_20px_-6px_rgba(15,23,42,0.08)] text-center flex flex-col items-center">
                <span className="text-[26px] sm:text-[28px] font-bold text-teal-600 font-sans tracking-tight">40+</span>
                <span className="text-xs text-slate-600 font-medium mt-0.5">Hackathons Built</span>
              </div>

              {/* Stat 4 */}
              <div className="px-5 py-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_8px_20px_-6px_rgba(15,23,42,0.08)] text-center flex flex-col items-center">
                <span className="text-[26px] sm:text-[28px] font-bold text-indigo-600 font-sans tracking-tight">15K+</span>
                <span className="text-xs text-slate-600 font-medium mt-0.5">Verified Credentials</span>
              </div>
            </div>
          </motion.div>

          {/* =========================================================
              LAYER 3: "POWERED BY AMAL JYOTHI"
              Revealed as the live cloud flight gathers, then dissolves
              as the clouds divide and the camera dives through to campus
          ========================================================= */}
          <motion.div
            style={{
              opacity: poweredOpacity,
              y: poweredY,
              scale: poweredScale,
              display: poweredDisplay,
            }}
            className="absolute z-30 max-w-[850px] mx-auto text-center px-6 flex flex-col items-center pointer-events-none will-change-transform"
          >
            {/* Glowing Brand Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-[0_8px_24px_rgba(15,23,42,0.12)] mb-6">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
              </span>
              <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-slate-800 font-sans">
                Premier Autonomous Institution • Kerala
              </span>
            </div>

            {/* HEADLINE: "Powered by Amal Jyothi" */}
            <h2
              className="text-[54px] sm:text-[76px] md:text-[92px] lg:text-[100px] font-medium tracking-tight text-[#0B132B] leading-[1.02] drop-shadow-[0_4px_24px_rgba(255,255,255,0.9)]"
              style={{
                fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
              }}
            >
              <span className="italic text-[#334155] font-normal mr-3">Powered by</span>
              <span className="font-bold relative inline-block">
                <span
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #0B132B 0%, #1D4ED8 50%, #0284C7 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Amal Jyothi.
                </span>
              </span>
            </h2>

            {/* SUBTITLE */}
            <p className="mt-4 text-base sm:text-lg md:text-xl text-slate-700 max-w-[620px] font-sans font-normal leading-relaxed drop-shadow-[0_2px_12px_rgba(255,255,255,0.85)]">
              Amal Jyothi College of Engineering, Kanjirappally — Autonomous, NAAC 'A' Grade accredited, nurturing innovators and leaders for global technology.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
