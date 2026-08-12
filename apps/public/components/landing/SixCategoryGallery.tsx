"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Landmark,
  UserCheck,
  Briefcase,
  GraduationCap,
  Heart,
  BookOpen,
} from "lucide-react";
import "./SixCategoryGallery.css";

export interface CategoryData {
  id: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  accentColor: string;
  pastelBg: string;
  targetX: number; // Offset X from center stage
  targetY: number; // Offset Y from center stage
  positionClass: string;
  textAlign: "text-center" | "text-left" | "text-right";
  flexAlign: "items-center" | "items-start" | "items-end";
}

const CATEGORIES: CategoryData[] = [
  {
    id: "universities",
    title: "Universities & colleges",
    desc: "Empower academic institutions to create and publish at scale.",
    icon: Landmark,
    accentColor: "#2563EB", // Soft blue
    pastelBg: "rgba(37, 99, 235, 0.08)",
    targetX: -330,
    targetY: -190,
    positionClass: "top-[40px] left-[50px]",
    textAlign: "text-right",
    flexAlign: "items-end",
  },
  {
    id: "freelancers",
    title: "Freelancers & experts",
    desc: "Share your expertise and monetize your knowledge with global reach.",
    icon: UserCheck,
    accentColor: "#0284C7", // Cyan / Slate blue
    pastelBg: "rgba(2, 132, 199, 0.08)",
    targetX: 330,
    targetY: -190,
    positionClass: "top-[40px] right-[50px]",
    textAlign: "text-left",
    flexAlign: "items-start",
  },
  {
    id: "enterprises",
    title: "Companies & enterprises",
    desc: "Onboard teams and build skills with enterprise-grade learning experiences.",
    icon: Briefcase,
    accentColor: "#4F46E5", // Muted Indigo
    pastelBg: "rgba(79, 70, 229, 0.08)",
    targetX: -360,
    targetY: 0,
    positionClass: "top-[230px] left-[50px]",
    textAlign: "text-right",
    flexAlign: "items-end",
  },
  {
    id: "institutes",
    title: "Training institutes",
    desc: "Deliver structured programs and track learner progress effortlessly.",
    icon: GraduationCap,
    accentColor: "#059669", // Soft Emerald
    pastelBg: "rgba(5, 150, 105, 0.08)",
    targetX: 360,
    targetY: 0,
    positionClass: "top-[230px] right-[50px]",
    textAlign: "text-left",
    flexAlign: "items-start",
  },
  {
    id: "creators",
    title: "Independent creators",
    desc: "Publish independently and grow your learning business your way.",
    icon: BookOpen,
    accentColor: "#3B82F6", // Royal Blue
    pastelBg: "rgba(59, 130, 246, 0.08)",
    targetX: -330,
    targetY: 190,
    positionClass: "top-[420px] left-[50px]",
    textAlign: "text-right",
    flexAlign: "items-end",
  },
  {
    id: "nonprofits",
    title: "Nonprofits & communities",
    desc: "Educate and uplift your community with impactful learning content.",
    icon: Heart,
    accentColor: "#64748B", // Slate
    pastelBg: "rgba(100, 116, 139, 0.08)",
    targetX: 330,
    targetY: 190,
    positionClass: "top-[420px] right-[50px]",
    textAlign: "text-left",
    flexAlign: "items-start",
  },
];

type ItemStepState =
  | "hidden"
  | "center-bouncing"
  | "center-visible"
  | "moving-to-final"
  | "final";

export default function SixCategoryGallery() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(wrapperRef, { amount: 0.25, once: false });

  // 6 Component Explicit States
  const [itemStates, setItemStates] = useState<ItemStepState[]>([
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
  ]);

  const [activeId, setActiveId] = useState<string>("enterprises");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isSequenceComplete, setIsSequenceComplete] = useState<boolean>(false);

  const [activeStep, setActiveStep] = useState<number>(0);
  const [bounceTriggerCount, setBounceTriggerCount] = useState<number>(0);

  // References for Canvas physics triggers & state machine timers
  const impulseRef = useRef<((dx: number, dy: number) => void) | null>(null);
  const triggerDropRef = useRef<(() => void) | null>(null);
  const sequenceTimersRef = useRef<NodeJS.Timeout[]>([]);

  // Clear all pending state machine timers
  const clearAllTimers = () => {
    sequenceTimersRef.current.forEach((t) => clearTimeout(t));
    sequenceTimersRef.current = [];
  };

  // 100% AUTOMATIC CONTINUOUS POINTER BOUNCE & CONTENT REVEAL STATE MACHINE
  useEffect(() => {
    if (!isInView) {
      clearAllTimers();
      setIsSequenceComplete(false);
      setItemStates(["hidden", "hidden", "hidden", "hidden", "hidden", "hidden"]);
      return;
    }

    clearAllTimers();
    setIsSequenceComplete(false);

    const addTimeout = (fn: () => void, ms: number) => {
      const timer = setTimeout(fn, ms);
      sequenceTimersRef.current.push(timer);
    };

    const STEP_BOUNCE_TIME = 800;  // 800ms clear 28px spring bounce
    const STEP_PAUSE_TIME = 1800;  // 1.8s pause between item bounces
    const TOTAL_STEP_TIME = STEP_BOUNCE_TIME + STEP_PAUSE_TIME; // 2.6s total step cycle

    const runStep = (stepIdx: number) => {
      setActiveStep(stepIdx);
      setActiveId(CATEGORIES[stepIdx].id);
      setBounceTriggerCount((prev) => prev + 1);

      // STEP 1: POINTER + CONTENT SYNCHRONIZED STRONG 28PX BOUNCE
      if (stepIdx === 0 && triggerDropRef.current) {
        triggerDropRef.current();
      } else if (impulseRef.current) {
        impulseRef.current(0, -18.0); // Upward vertical physical force on lanyard rope
      }

      setItemStates((prev) => {
        const next = [...prev];
        next[stepIdx] = "center-bouncing";
        return next;
      });

      // STEP 2: Transition to visible after bounce completes (800ms)
      addTimeout(() => {
        setItemStates((prev) => {
          const next = [...prev];
          if (next[stepIdx] === "center-bouncing") {
            next[stepIdx] = "center-visible";
          }
          return next;
        });
      }, STEP_BOUNCE_TIME);

      // STEP 3: Transition to final position and loop to next item after pause
      addTimeout(() => {
        setItemStates((prev) => {
          const next = [...prev];
          next[stepIdx] = "final";
          return next;
        });

        const nextStepIdx = (stepIdx + 1) % CATEGORIES.length;
        runStep(nextStepIdx);
      }, TOTAL_STEP_TIME);
    };

    // Start automatic loop immediately when section becomes visible on load
    runStep(0);

    return () => {
      clearAllTimers();
    };
  }, [isInView]);

  const handleAudienceHover = (id: string) => {
    setHoveredId(id);
    if (impulseRef.current) {
      impulseRef.current(0, -10.0);
    }
  };

  const handleAudienceClick = (id: string) => {
    setActiveId(id);
    if (impulseRef.current) {
      impulseRef.current(0, -18.0);
    }
  };

  return (
    <div ref={wrapperRef} className="orbit-ecosystem-wrapper select-none py-4">
      {/* ─── DESKTOP STAGE (STRONG VISIBLE TWO-BOUNCE IMPACT INTO CENTER) ─── */}
      <div className="hidden lg:block relative w-full max-w-[1020px] mx-auto h-[590px]">
        {/* ─── PHYSICAL HANGING ARCADE CORE EMBLEM ─── */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] h-[370px] z-20 pointer-events-auto flex items-center justify-center">
          <HangingLanyardEmblem
            isComplete={isSequenceComplete}
            bounceTriggerCount={bounceTriggerCount}
            onRegisterImpulse={(fn) => {
              impulseRef.current = fn;
            }}
            onRegisterDrop={(fn) => {
              triggerDropRef.current = fn;
            }}
          />
        </div>

        {/* ─── 6 REVEALED COMPONENTS (STRONG TWO-BOUNCE IMPACT: BOOM -> REBOUND -> SETTLE) ─── */}
        {CATEGORIES.map((cat, idx) => {
          const state = itemStates[idx];
          const isHidden = state === "hidden";
          const isCenterBouncing = state === "center-bouncing";
          const isCenterVisible = state === "center-visible";
          const isMovingToFinal = state === "moving-to-final";
          const isFinal = state === "final";

          const isHovered = hoveredId === cat.id;
          const isActive = activeId === cat.id && !hoveredId;
          const isSelected = isHovered || isActive;
          const Icon = cat.icon;

          if (isHidden) {
            return (
              <div
                key={cat.id}
                className="hidden pointer-events-none opacity-0"
                style={{ display: "none" }}
              />
            );
          }

          const isAtCenter = isCenterBouncing || isCenterVisible;
          const currentX = isAtCenter ? 0 : cat.targetX;
          const currentY = isAtCenter ? 0 : cat.targetY;

          return (
            <motion.div
              key={cat.id}
              initial={{
                x: 0,
                y: 70,
                scale: 0.65,
                opacity: 0,
              }}
              animate={
                isCenterBouncing
                  ? {
                      x: 0,
                      y: 0,
                      scale: 1,
                      opacity: 1,
                    }
                  : {
                      x: currentX,
                      y: currentY,
                      opacity: 1,
                      scale: isFinal && isSelected ? 1.02 : 1,
                    }
              }
              transition={
                isCenterBouncing
                  ? {
                      type: "spring",
                      stiffness: 500,
                      damping: 18,
                      mass: 0.8,
                    }
                  : {
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                    }
              }
              style={{ pointerEvents: isFinal ? "auto" : "none" }}
              onMouseEnter={() => isFinal && handleAudienceHover(cat.id)}
              onMouseLeave={() => isFinal && setHoveredId(null)}
              onClick={() => isFinal && handleAudienceClick(cat.id)}
              className={`absolute top-[230px] left-1/2 -translate-x-1/2 flex flex-col transition-colors duration-300 ${
                isAtCenter
                  ? "text-center items-center z-30 max-w-[310px]"
                  : `${cat.flexAlign} ${cat.textAlign} z-20 max-w-[260px] cursor-pointer group`
              }`}
            >
              {/* Floating Icon - Strong visible spring bounce animation (28px displacement) */}
              <motion.div
                initial={{ y: 0 }}
                animate={
                  isCenterBouncing
                    ? { y: [0, -28, 5, -2, 0] }
                    : { y: 0 }
                }
                transition={
                  isCenterBouncing
                    ? {
                        duration: 0.8,
                        times: [0, 0.28, 0.65, 0.85, 1],
                        ease: ["easeOut", "easeInOut", "easeInOut", "easeOut"],
                      }
                    : { duration: 0.3 }
                }
                className="relative mb-2"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 ${
                    isSelected || isAtCenter ? "scale-110" : "scale-100"
                  }`}
                  style={{
                    color: cat.accentColor,
                    backgroundColor: isSelected || isAtCenter ? cat.pastelBg : "transparent",
                  }}
                >
                  <Icon className="w-5.5 h-5.5 stroke-[1.8]" />
                </div>
              </motion.div>

              {/* Synchronized Content Reveal (Title + Description emerge during upward bounce peak) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isCenterBouncing || isCenterVisible || isMovingToFinal || isFinal
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 20 }
                }
                transition={
                  isCenterBouncing
                    ? {
                        delay: 0.14, // Reveal begins at ~140ms (as icon reaches peak upward bounce)
                        duration: 0.55, // Smoothly reaches full visibility as icon completes secondary bounce & settles
                        ease: [0.16, 1, 0.3, 1],
                      }
                    : {
                        duration: 0.3,
                        ease: "easeOut",
                      }
                }
                className={`flex flex-col ${
                  isAtCenter ? "items-center" : cat.flexAlign
                }`}
              >
                {/* Category Title - Floating Typography */}
                <h3
                  className={`text-[16.5px] tracking-tight transition-all duration-200 ${
                    isSelected || isAtCenter
                      ? "font-bold text-slate-900 scale-[1.01]"
                      : "font-semibold text-slate-800"
                  }`}
                  style={{
                    color: isSelected || isAtCenter ? cat.accentColor : "#0F172A",
                  }}
                >
                  {cat.title}
                </h3>

                {/* Description - Floating Typography */}
                <p
                  className={`text-xs sm:text-[13.5px] leading-relaxed transition-all duration-200 mt-1 max-w-[250px] ${
                    isSelected || isAtCenter
                      ? "text-slate-700 font-medium opacity-100"
                      : "text-slate-500 font-normal opacity-80"
                  }`}
                >
                  {cat.desc}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── MOBILE & TABLET RESPONSIVE LAYOUT (< lg) ─── */}
      <div className="block lg:hidden w-full max-w-lg mx-auto px-4 py-2">
        {/* Mobile Hanging Emblem Centerpiece */}
        <div className="relative w-full h-[220px] mb-6 flex items-center justify-center overflow-hidden">
          <HangingLanyardEmblem isComplete={isSequenceComplete} isMobile />
        </div>

        {/* Mobile Floating Audience List (1 Centered Column) */}
        <div className="flex flex-col items-center gap-8">
          {CATEGORIES.map((cat, idx) => {
            const state = itemStates[idx];
            const isVisible = state !== "hidden";
            const Icon = cat.icon;
            const isSelected = activeId === cat.id;

            return (
              <motion.div
                key={cat.id}
                onClick={() => isVisible && handleAudienceClick(cat.id)}
                className="flex flex-col items-center text-center max-w-xs cursor-pointer group"
                style={{ pointerEvents: isVisible ? "auto" : "none" }}
              >
                <motion.div
                  initial={{ y: 0 }}
                  animate={isVisible ? { y: [0, -26, 4, -2, 0] } : { y: 0 }}
                  transition={
                    isVisible
                      ? {
                          duration: 0.8,
                          times: [0, 0.28, 0.65, 0.85, 1],
                          ease: ["easeOut", "easeInOut", "easeInOut", "easeOut"],
                        }
                      : { duration: 0.3 }
                  }
                  className="mb-2.5"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300"
                    style={{
                      color: cat.accentColor,
                      backgroundColor: cat.pastelBg,
                    }}
                  >
                    <Icon className="w-5 h-5 stroke-[1.8]" />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                  transition={
                    isVisible
                      ? {
                          delay: 0.14,
                          duration: 0.55,
                          ease: [0.16, 1, 0.3, 1],
                        }
                      : { duration: 0.3 }
                  }
                  className="flex flex-col items-center text-center"
                >
                  <h3
                    className={`text-base tracking-tight transition-colors duration-200 ${
                      isSelected ? "font-bold text-slate-900" : "font-semibold text-slate-800"
                    }`}
                    style={{ color: isSelected ? cat.accentColor : undefined }}
                  >
                    {cat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed mt-1">
                    {cat.desc}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

{/* ─── CANVAS PHYSICS LANYARD EMBLEM ─── */}
interface HangingLanyardEmblemProps {
  isComplete?: boolean;
  bounceTriggerCount?: number;
  onRegisterImpulse?: (fn: (dx: number, dy: number) => void) => void;
  onRegisterDrop?: (fn: () => void) => void;
  isMobile?: boolean;
}

function HangingLanyardEmblem({
  isComplete = false,
  bounceTriggerCount = 0,
  onRegisterImpulse,
  onRegisterDrop,
  isMobile = false,
}: HangingLanyardEmblemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dragging & Physics State
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    // Dimensions
    const width = isMobile ? 260 : 340;
    const height = isMobile ? 220 : 370;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;

    const anchorX = width / 2;
    const anchorY = 0;
    const ropeLength = isMobile ? 120 : 185;
    const emblemRadius = isMobile ? 32 : 38;

    // Multi-segment Rope Physics Nodes
    const NUM_NODES = 8;
    const nodes = Array.from({ length: NUM_NODES }, (_, i) => ({
      x: anchorX,
      y: anchorY + (ropeLength / (NUM_NODES - 1)) * i,
      oldX: anchorX,
      oldY: anchorY + (ropeLength / (NUM_NODES - 1)) * i,
      vx: 0,
      vy: 0,
    }));

    if (onRegisterImpulse) {
      onRegisterImpulse((dx, dy) => {
        const lastNode = nodes[NUM_NODES - 1];
        lastNode.vx += dx;
        lastNode.vy += dy;
      });
    }

    // Drop Trigger Handler
    const triggerDrop = () => {
      const emblemNode = nodes[NUM_NODES - 1];
      emblemNode.y = anchorY + ropeLength * 0.45;
      emblemNode.oldY = emblemNode.y - 9.5;
      emblemNode.vy = 9.5;
    };

    if (onRegisterDrop) {
      onRegisterDrop(triggerDrop);
    }

    const gravity = 0.65;
    const damping = 0.93;
    const stiffness = 0.88;

    // Simulation Loop
    const render = () => {
      ctx.save();
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.clearRect(0, 0, width, height);

      // 1. Verlet Physics Update
      const emblemNode = nodes[NUM_NODES - 1];

      if (isDraggingRef.current) {
        emblemNode.x = mousePosRef.current.x - dragOffsetRef.current.x;
        emblemNode.y = mousePosRef.current.y - dragOffsetRef.current.y;
        emblemNode.vx = 0;
        emblemNode.vy = 0;
      }

      for (let i = 1; i < NUM_NODES; i++) {
        if (i === NUM_NODES - 1 && isDraggingRef.current) continue;

        const node = nodes[i];
        const currentDamping = isComplete ? 0.75 : damping;
        const currentGravity = isComplete ? 0.30 : gravity;

        node.vx = (node.x - node.oldX) * currentDamping;
        node.vy = (node.y - node.oldY) * currentDamping + currentGravity;

        node.oldX = node.x;
        node.oldY = node.y;

        node.x += node.vx;
        node.y += node.vy;
      }

      // 2. Distance Constraints
      const segmentLen = ropeLength / (NUM_NODES - 1);
      for (let iteration = 0; iteration < 7; iteration++) {
        nodes[0].x = anchorX;
        nodes[0].y = anchorY;

        for (let i = 0; i < NUM_NODES - 1; i++) {
          const n1 = nodes[i];
          const n2 = nodes[i + 1];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const diff = (dist - segmentLen) / dist;

          if (i !== 0) {
            n1.x += dx * 0.5 * diff * stiffness;
            n1.y += dy * 0.5 * diff * stiffness;
          }
          if (i + 1 !== NUM_NODES - 1 || !isDraggingRef.current) {
            n2.x -= dx * 0.5 * diff * stiffness;
            n2.y -= dy * 0.5 * diff * stiffness;
          }
        }
      }

      // 3. Draw Rope Strand
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);

      for (let i = 1; i < NUM_NODES - 1; i++) {
        const xc = (nodes[i].x + nodes[i + 1].x) / 2;
        const yc = (nodes[i].y + nodes[i + 1].y) / 2;
        ctx.quadraticCurveTo(nodes[i].x, nodes[i].y, xc, yc);
      }
      ctx.lineTo(nodes[NUM_NODES - 1].x, nodes[NUM_NODES - 1].y);

      const ropeGrad = ctx.createLinearGradient(0, 0, 0, height);
      ropeGrad.addColorStop(0, "#475569");
      ropeGrad.addColorStop(0.5, "#2563EB");
      ropeGrad.addColorStop(1, "#1E1B4B");

      ctx.strokeStyle = ropeGrad;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Top Hanging Bracket Ring
      ctx.beginPath();
      ctx.arc(anchorX, 4, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#1E293B";
      ctx.fill();

      // 4. Draw Physical Metallic 3D Arcade "A" Emblem
      const eX = nodes[NUM_NODES - 1].x;
      const eY = nodes[NUM_NODES - 1].y;

      // Soft Shadow under Emblem
      ctx.save();
      ctx.beginPath();
      ctx.arc(eX, eY + 6, emblemRadius + 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(15, 23, 42, 0.07)";
      ctx.filter = "blur(7px)";
      ctx.fill();
      ctx.restore();

      // Outer Metallic Ring
      ctx.beginPath();
      ctx.arc(eX, eY, emblemRadius, 0, Math.PI * 2);
      const ringGrad = ctx.createLinearGradient(
        eX - emblemRadius,
        eY - emblemRadius,
        eX + emblemRadius,
        eY + emblemRadius
      );
      ringGrad.addColorStop(0, "#FFFFFF");
      ringGrad.addColorStop(0.5, "#F1F5F9");
      ringGrad.addColorStop(1, "#E2E8F0");
      ctx.fillStyle = ringGrad;
      ctx.shadowColor = "rgba(0, 0, 0, 0.05)";
      ctx.shadowBlur = 10;
      ctx.fill();

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.stroke();

      // Inner Dark Navy Core Disc
      ctx.beginPath();
      ctx.arc(eX, eY, emblemRadius - 6, 0, Math.PI * 2);
      const innerGrad = ctx.createLinearGradient(
        eX - emblemRadius,
        eY - emblemRadius,
        eX + emblemRadius,
        eY + emblemRadius
      );
      innerGrad.addColorStop(0, "#1E1B4B");
      innerGrad.addColorStop(1, "#0F172A");
      ctx.fillStyle = innerGrad;
      ctx.fill();

      // Arcade "A" Logo Mark Vector
      ctx.save();
      ctx.translate(eX, eY);
      const scale = emblemRadius / 36;
      ctx.scale(scale, scale);

      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(-12.5, 10);
      ctx.lineTo(-5.8, 10);
      ctx.lineTo(0, -1.5);
      ctx.lineTo(5.8, 10);
      ctx.lineTo(12.5, 10);
      ctx.closePath();

      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.restore();

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile, isComplete, onRegisterImpulse, onRegisterDrop]);

  // Mouse & Touch Drag Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    mousePosRef.current = { x: px, y: py };
    dragOffsetRef.current = { x: 0, y: 0 };
    isDraggingRef.current = true;
    canvas.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      const canvas = canvasRef.current;
      if (canvas) canvas.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      <motion.div
        key={bounceTriggerCount}
        initial={{ y: 0 }}
        animate={{ y: [0, -28, 5, -2, 0] }}
        transition={{
          duration: 0.8,
          times: [0, 0.28, 0.65, 0.85, 1],
          ease: ["easeOut", "easeInOut", "easeInOut", "easeOut"],
        }}
        className="w-full h-full flex items-center justify-center"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="cursor-grab active:cursor-grabbing touch-none"
          style={{
            width: isMobile ? 260 : 340,
            height: isMobile ? 220 : 370,
          }}
        />
      </motion.div>
    </div>
  );
}
