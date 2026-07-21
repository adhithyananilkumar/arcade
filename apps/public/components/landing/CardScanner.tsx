"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, PanInfo, useMotionValue } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Scan, 
  ArrowRight, 
  Lock, 
  Unlock, 
  Cpu, 
  Sparkles, 
  RotateCw,
  CheckCircle,
  ShieldCheck,
  Wifi
} from "lucide-react";

export default function CardScanner() {
  const router = useRouter();
  const [scanState, setScanState] = useState<"idle" | "dragging" | "scanning" | "success">("idle");
  const [progress, setProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const cardRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const cardControls = useAnimation();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Handle tilt and holographic lighting spot overlay
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || scanState === "scanning" || scanState === "success") return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
    
    // Calculate rotation angles based on cursor relative to card center
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (centerY - y) / 8; // max 8 deg tilt
    const rotateY = (x - centerX) / 8;
    
    cardControls.set({ rotateX, rotateY, scale: 1.03 });
  };

  const handleMouseLeave = () => {
    if (scanState === "scanning" || scanState === "success") return;
    cardControls.start({ rotateX: 0, rotateY: 0, scale: 1, transition: { duration: 0.3 } });
  };

  // Drag handlers
  const handleDragStart = () => {
    setScanState("dragging");
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (!cardRef.current || !slotRef.current || !containerRef.current) return;

    const cardRect = cardRef.current.getBoundingClientRect();
    const slotRect = slotRef.current.getBoundingClientRect();

    // Check distance between card center and slot center
    const cardCenter = {
      x: cardRect.left + cardRect.width / 2,
      y: cardRect.top + cardRect.height / 2,
    };
    const slotCenter = {
      x: slotRect.left + slotRect.width / 2,
      y: slotRect.top + slotRect.height / 2,
    };

    const distance = Math.hypot(cardCenter.x - slotCenter.x, cardCenter.y - slotCenter.y);

    // If card is dropped within 130px of the slot, snap it and scan!
    if (distance < 130) {
      triggerScan();
    } else {
      setScanState("idle");
      cardControls.start({ 
        x: 0, 
        y: 0, 
        rotateX: 0, 
        rotateY: 0, 
        scale: 1, 
        transition: { type: "spring", stiffness: 300, damping: 20 } 
      });
    }
  };

  const triggerScan = () => {
    if (scanState === "scanning" || scanState === "success") return;
    setScanState("scanning");
    setProgress(0);

    if (cardRef.current && slotRef.current && containerRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect();
      const slotRect = slotRef.current.getBoundingClientRect();

      // Calculate translation offset needed to align card with scanner slot
      const currentX = x.get();
      const currentY = y.get();
      
      const targetX = slotRect.left - cardRect.left + currentX + (slotRect.width - cardRect.width) / 2;
      const targetY = slotRect.top - cardRect.top + currentY + (slotRect.height - cardRect.height) / 2;

      cardControls.start({
        x: targetX,
        y: targetY,
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 180, damping: 15 }
      });
    }
  };

  // Simulate scanning progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (scanState === "scanning") {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setScanState("success");
            return 100;
          }
          return prev + 5;
        });
      }, 70);
    }
    return () => clearInterval(interval);
  }, [scanState]);

  // Handle routing on scan success
  useEffect(() => {
    if (scanState === "success") {
      const timeout = setTimeout(() => {
        router.push("/sign?mode=signup");
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [scanState, router]);

  // Access check action on click (mobile-friendly)
  const handleCardClick = () => {
    if (scanState === "idle") {
      triggerScan();
    }
  };

  const resetScanner = () => {
    setScanState("idle");
    setProgress(0);
    cardControls.start({ x: 0, y: 0, rotateX: 0, rotateY: 0, scale: 1, transition: { duration: 0.3 } });
  };

  // Holographic style properties based on mouse hover position
  const holoStyle = scanState !== "scanning" && scanState !== "success" ? {
    background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 60%)`
  } : {};

  return (
    <div ref={containerRef} className="card-scanner-wrapper relative w-full max-w-[500px] mx-auto p-6 rounded-3xl border border-zinc-200/50 bg-white/60 backdrop-blur-xl shadow-2xl overflow-visible">
      
      {/* Dynamic scan states helper instruction */}
      <div className="flex items-center justify-between mb-6 border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${
            scanState === "success" ? "bg-emerald-500 animate-pulse" : 
            scanState === "scanning" ? "bg-amber-500 animate-pulse" : "bg-blue-600 animate-pulse"
          }`} />
          <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
            {scanState === "success" ? "System Access Granted" : 
             scanState === "scanning" ? "Scanning Credentials" : "Drag card to reader"}
          </span>
        </div>
        
        {scanState === "success" && (
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Redirecting...
          </span>
        )}

        {(scanState === "scanning" || scanState === "success") && (
          <button 
            onClick={resetScanner} 
            className="text-[10px] text-zinc-500 hover:text-zinc-800 flex items-center gap-1 font-medium transition-colors cursor-pointer"
          >
            <RotateCw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-center justify-between min-h-[300px]">
        
        {/* ACCESS CARD */}
        <div className="perspective-container relative w-[220px] h-[320px] flex-shrink-0">
          <motion.div
            ref={cardRef}
            drag={scanState === "idle" || scanState === "dragging"}
            dragConstraints={containerRef}
            dragElastic={0.1}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={handleCardClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={cardControls}
            style={{ touchAction: "none", x, y }}
            className={`access-card absolute w-full h-full rounded-2xl p-5 flex flex-col justify-between cursor-grab active:cursor-grabbing shadow-lg border border-white/20 select-none overflow-hidden ${
              scanState === "scanning" ? "scanning-glow" : ""
            } ${
              scanState === "success" ? "success-glow" : ""
            }`}
          >
            {/* Holographic light overlay */}
            <div className="holo-overlay absolute inset-0 pointer-events-none" style={holoStyle} />
            
            {/* Card Content Top */}
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h4 className="text-[11px] font-extrabold tracking-widest text-indigo-200 uppercase">Arcade Pass</h4>
                <p className="text-[8px] text-indigo-300 tracking-wider">Creator Network</p>
              </div>
              <Wifi className="w-4 h-4 text-indigo-300" />
            </div>

            {/* Holographic scanner target in the middle */}
            <div className="relative z-10 my-4 flex justify-center items-center h-28 bg-white/5 rounded-xl border border-white/10 overflow-hidden group">
              <div className="flex flex-col items-center gap-2 transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none">
                <div className="relative flex items-center justify-center">
                  {/* Glowing background circles */}
                  <div className="absolute w-12 h-12 rounded-full bg-indigo-500/10 blur-md animate-pulse" />
                  <Cpu className="w-10 h-10 text-indigo-300 drop-shadow-[0_0_8px_rgba(129,140,248,0.6)] relative z-10" />
                </div>
                <span className="text-[8px] font-mono tracking-[0.2em] text-indigo-300/60 uppercase">NFC SECURE</span>
              </div>
              {/* Scan laser sweeping down and up - only shown during scan */}
              {scanState === "scanning" && (
                <div className="absolute left-0 right-0 h-0.5 bg-green-400 shadow-[0_0_8px_rgba(74,222,128,1)] animate-laser-sweep" />
              )}
            </div>

            {/* Card Content Bottom */}
            <div className="relative z-10 flex justify-between items-end">
              <div>
                <p className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest">Cardholder</p>
                <h3 className="text-xs font-bold text-white tracking-wide">FUTURE CREATOR</h3>
                <p className="text-[8px] font-mono text-zinc-500 mt-1">ID: ARC-2026-NFC</p>
              </div>
              
              {/* Small contact chip representation */}
              <div className="w-8 h-6 rounded-md bg-gradient-to-tr from-amber-400 to-amber-200 border border-amber-300/40 relative flex items-center justify-center">
                <Cpu className="w-4 h-4 text-amber-900/60" />
              </div>
            </div>
            
            {/* Card Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1E1B4B] via-[#311A6B] to-[#1E1B4B] -z-10" />
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          </motion.div>
        </div>

        {/* SCANNER DEVICE DOCK */}
        <div 
          ref={slotRef}
          className={`scanner-dock w-full sm:w-[200px] h-[320px] rounded-2xl border-2 border-dashed flex flex-col justify-between p-5 relative transition-all duration-300 ${
            scanState === "success" 
              ? "border-emerald-500 bg-emerald-50/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]" 
              : scanState === "scanning" 
              ? "border-amber-400 bg-amber-50/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]" 
              : "border-zinc-300 bg-zinc-50/50"
          }`}
        >
          {/* LED light indicator */}
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">NFC Reader v2</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-semibold text-zinc-500">LED</span>
              <div className={`w-3 h-3 rounded-full border transition-all duration-300 ${
                scanState === "success" ? "bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,1)]" : 
                scanState === "scanning" ? "bg-amber-500 border-amber-400 animate-ping" : 
                "bg-red-500 border-red-400 shadow-[0_0_6px_rgba(239,68,68,0.5)]"
              }`} />
            </div>
          </div>

          {/* Dock visual center target */}
          <div className="my-auto flex flex-col items-center justify-center text-center p-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors duration-300 ${
              scanState === "success" ? "bg-emerald-100 text-emerald-600" :
              scanState === "scanning" ? "bg-amber-100 text-amber-600 animate-pulse" :
              "bg-zinc-100 text-zinc-400"
            }`}>
              {scanState === "success" ? (
                <CheckCircle className="w-8 h-8" />
              ) : (
                <Scan className="w-8 h-8" />
              )}
            </div>
            
            {/* Screen / Text instructions */}
            <div className="w-full bg-zinc-950 rounded-lg p-3 font-mono text-[10px] text-left leading-normal border border-zinc-800 shadow-inner">
              <div className="text-zinc-500">&gt;_ terminal</div>
              <div className={`font-semibold ${
                scanState === "success" ? "text-emerald-400" :
                scanState === "scanning" ? "text-amber-400" :
                "text-zinc-300"
              }`}>
                {scanState === "success" && "ACCESS GRANTED"}
                {scanState === "scanning" && `SCANNING... ${progress}%`}
                {scanState === "dragging" && "READY TO READ"}
                {scanState === "idle" && "PLACE CARD HERE"}
              </div>
              <div className="text-[9px] text-zinc-500 mt-1">
                {scanState === "success" && "Redirecting home..."}
                {scanState === "scanning" && "Verifying certificate..."}
                {scanState === "dragging" && "Approaching sensor"}
                {scanState === "idle" && "Scan to unlock page"}
              </div>
            </div>
          </div>

          {/* Progress loader at bottom of scanner */}
          <div className="w-full">
            <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-200 ${
                  scanState === "success" ? "bg-emerald-500" : "bg-amber-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2 text-[9px] text-zinc-400">
              <span>{scanState === "success" ? "Done" : `${progress}%`}</span>
              <span className="font-mono text-zinc-500">13.56 MHz</span>
            </div>
          </div>
        </div>

      </div>

      {/* Access card swipe instructions or hint */}
      {scanState === "idle" && (
        <div className="mt-4 flex items-center justify-center gap-2 p-2 bg-indigo-50/50 border border-indigo-100/30 rounded-xl text-[11px] text-indigo-700 text-center animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span><b>Tip:</b> Click the card to auto-scan, or drag it into the slot!</span>
        </div>
      )}
    </div>
  );
}
