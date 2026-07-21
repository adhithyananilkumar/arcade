"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Sparkles, Cpu, Award, ArrowLeft, X } from "lucide-react";

interface CollegesEcosystemProps {
  activeFeature: number | null;
  setActiveFeature: (index: number | null) => void;
}

// Separate SVG component so we can render it cleanly on both sliding doors
const BackgroundSVG = ({ activeFeature, isExpanded }: { activeFeature: number | null; isExpanded: boolean }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    {/* Opposing gyroscopic radar rotations for concentric dotted circles */}
    <motion.g
      animate={{ rotate: -360 }}
      transition={{ repeat: Infinity, duration: 50, ease: "linear" }}
      style={{ transformOrigin: "50% 50%" }}
    >
      <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#f1f1f4" strokeWidth="1.5" strokeDasharray="4 4" />
    </motion.g>
    <motion.g
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
      style={{ transformOrigin: "50% 50%" }}
    >
      <circle cx="50%" cy="50%" r="20%" fill="none" stroke="#f1f1f4" strokeWidth="1.5" strokeDasharray="4 4" />
    </motion.g>
    
    {/* Solid diagonal lines (corners to center) that grow dynamically when expanded */}
    <motion.line 
      x1="50%" y1="50%" 
      animate={{ x2: isExpanded ? "12%" : "50%", y2: isExpanded ? "12%" : "50%" }} 
      transition={{ type: "spring", stiffness: 100, damping: 16 }}
      stroke="#f1f1f4" strokeWidth="1.5" 
    />
    <motion.line 
      x1="50%" y1="50%" 
      animate={{ x2: isExpanded ? "88%" : "50%", y2: isExpanded ? "12%" : "50%" }} 
      transition={{ type: "spring", stiffness: 100, damping: 16 }}
      stroke="#f1f1f4" strokeWidth="1.5" 
    />
    <motion.line 
      x1="50%" y1="50%" 
      animate={{ x2: isExpanded ? "12%" : "50%", y2: isExpanded ? "88%" : "50%" }} 
      transition={{ type: "spring", stiffness: 100, damping: 16 }}
      stroke="#f1f1f4" strokeWidth="1.5" 
    />
    <motion.line 
      x1="50%" y1="50%" 
      animate={{ x2: isExpanded ? "88%" : "50%", y2: isExpanded ? "88%" : "50%" }} 
      transition={{ type: "spring", stiffness: 100, damping: 16 }}
      stroke="#f1f1f4" strokeWidth="1.5" 
    />

    {/* Continuous data pulses traveling along the diagonal solid lines when expanded */}
    {isExpanded && (
      <>
        <motion.line
          x1="50%" y1="50%" x2="12%" y2="12%"
          stroke="#e0e0e9"
          strokeWidth="1.5"
          strokeDasharray="15 120"
          animate={{ strokeDashoffset: [135, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
        />
        <motion.line
          x1="50%" y1="50%" x2="88%" y2="12%"
          stroke="#e0e0e9"
          strokeWidth="1.5"
          strokeDasharray="15 120"
          animate={{ strokeDashoffset: [135, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
        />
        <motion.line
          x1="50%" y1="50%" x2="12%" y2="88%"
          stroke="#e0e0e9"
          strokeWidth="1.5"
          strokeDasharray="15 120"
          animate={{ strokeDashoffset: [135, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
        />
        <motion.line
          x1="50%" y1="50%" x2="88%" y2="88%"
          stroke="#e0e0e9"
          strokeWidth="1.5"
          strokeDasharray="15 120"
          animate={{ strokeDashoffset: [135, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
        />
      </>
    )}
    
    {/* Dashed axial alignment guides */}
    <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#e4e4e7" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
    <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#e4e4e7" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

    {/* Static highlighted connector lines */}
    {activeFeature === 0 && <line x1="50%" y1="50%" x2="50%" y2="15%" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" className="animate-pulse" />}
    {activeFeature === 1 && <line x1="50%" y1="50%" x2="80%" y2="50%" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" className="animate-pulse" />}
    {activeFeature === 2 && <line x1="50%" y1="50%" x2="20%" y2="50%" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" className="animate-pulse" />}
    {activeFeature === 3 && <line x1="50%" y1="50%" x2="50%" y2="85%" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" className="animate-pulse" />}

    {/* Interactive glowing connector charges (lasers shooting from center dot to node when hovered) */}
    {isExpanded && (
      <>
        {/* Forums (Top Node 0) */}
        <motion.line
          x1="50%" y1="50%" x2="50%" y2="15%"
          stroke="#6366F1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="15 60"
          animate={activeFeature === 0 ? { strokeDashoffset: [75, 0] } : { strokeDashoffset: 75 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          opacity={activeFeature === 0 ? 0.9 : 0}
        />
        {/* Creator Tools (Right Node 1) */}
        <motion.line
          x1="50%" y1="50%" x2="80%" y2="50%"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="15 60"
          animate={activeFeature === 1 ? { strokeDashoffset: [75, 0] } : { strokeDashoffset: 75 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          opacity={activeFeature === 1 ? 0.9 : 0}
        />
        {/* Interactive Labs (Left Node 2) */}
        <motion.line
          x1="50%" y1="50%" x2="20%" y2="50%"
          stroke="#14B8A6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="15 60"
          animate={activeFeature === 2 ? { strokeDashoffset: [75, 0] } : { strokeDashoffset: 75 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          opacity={activeFeature === 2 ? 0.9 : 0}
        />
        {/* Certifications (Bottom Node 3) */}
        <motion.line
          x1="50%" y1="50%" x2="50%" y2="85%"
          stroke="#10B981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="15 60"
          animate={activeFeature === 3 ? { strokeDashoffset: [75, 0] } : { strokeDashoffset: 75 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          opacity={activeFeature === 3 ? 0.9 : 0}
        />
      </>
    )}
  </svg>
);

export default function CollegesEcosystem({ activeFeature, setActiveFeature }: CollegesEcosystemProps) {
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [cardMousePos, setCardMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({ rotateX: 0, rotateY: 0, scale: 1 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCardMousePos({ x, y });

    // Enable 3D tilt only when the drawer is closed to keep text readable
    if (selectedNode === null) {
      const maxTilt = 8;
      const rotateX = -((y - rect.height / 2) / rect.height) * maxTilt * 2;
      const rotateY = ((x - rect.width / 2) / rect.width) * maxTilt * 2;
      setTiltStyle({ rotateX, rotateY, scale: 1.025 });
    } else {
      setTiltStyle({ rotateX: 0, rotateY: 0, scale: 1 });
    }
  };

  const handleCardMouseLeave = () => {
    setIsHoveringCard(false);
    setTiltStyle({ rotateX: 0, rotateY: 0, scale: 1 });
  };

  const nodes = [
    {
      index: 0,
      title: "FORUMS & CLUBS",
      icon: <Users className="w-5 h-5" />,
      color: "#6366F1", // Indigo
      badge: "TEAMWORK",
      fullTitle: "Self-Hosted Forums & Clubs",
      description: "Connect student communities and foster professional technical networks natively on Arcade.",
      bgGradient: "linear-gradient(135deg, #F0F4FF 0%, #E0E7FF 100%)",
      activeClass: "text-indigo-600 border-indigo-200 bg-indigo-50/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]",
      badgeClass: "bg-indigo-100/70 text-indigo-700 border-indigo-200/50",
      textColor: "group-hover:text-indigo-600",
      activeText: "text-indigo-600 font-bold",
      targetX: 0,
      targetY: -147,
    },
    {
      index: 1,
      title: "CREATOR TOOLS",
      icon: <Sparkles className="w-5 h-5" />,
      color: "#F59E0B", // Amber
      badge: "CREATIVE",
      fullTitle: "Comprehensive Creator Tools",
      description: "Build, curate, and scale professional educational tracks and syllabus structures with ease.",
      bgGradient: "linear-gradient(135deg, #FFFDF0 0%, #FEF3C7 100%)",
      activeClass: "text-amber-600 border-amber-200 bg-amber-50/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
      badgeClass: "bg-amber-100/70 text-amber-700 border-amber-200/50",
      textColor: "group-hover:text-amber-600",
      activeText: "text-amber-600 font-bold",
      targetX: 126,
      targetY: 0,
    },
    {
      index: 2,
      title: "INTERACTIVE LABS",
      icon: <Cpu className="w-5 h-5" />,
      color: "#14B8A6", // Teal
      badge: "BUSINESS",
      fullTitle: "Integrated Coding Playgrounds",
      description: "Run interactive terminals and custom sandbox workspace environments directly in the browser.",
      bgGradient: "linear-gradient(135deg, #F0FDF4 0%, #CCFBF1 100%)",
      activeClass: "text-teal-600 border-teal-200 bg-teal-50/50 shadow-[0_0_15px_rgba(20,184,166,0.2)]",
      badgeClass: "bg-teal-100/70 text-teal-700 border-teal-200/50",
      textColor: "group-hover:text-teal-600",
      activeText: "text-teal-600 font-bold",
      targetX: -126,
      targetY: 0,
    },
    {
      index: 3,
      title: "CERTIFICATIONS",
      icon: <Award className="w-5 h-5" />,
      color: "#10B981", // Emerald
      badge: "IDEA",
      fullTitle: "Direct Student Certification",
      description: "Issue encrypted, tamper-proof certificates and verified skills achievements to students.",
      bgGradient: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
      activeClass: "text-emerald-600 border-emerald-200 bg-emerald-50/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
      badgeClass: "bg-emerald-100/70 text-emerald-700 border-emerald-200/50",
      textColor: "group-hover:text-emerald-600",
      activeText: "text-emerald-600 font-bold",
      targetX: 0,
      targetY: 147,
    },
  ];

  const activeNodeInfo = selectedNode !== null ? nodes[selectedNode] : null;

  return (
    <motion.div 
      style={{ 
        perspective: "1200px",
        transformStyle: "preserve-3d"
      }}
      animate={{
        rotateX: tiltStyle.rotateX,
        rotateY: tiltStyle.rotateY,
        scale: tiltStyle.scale
      }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      onMouseMove={handleCardMouseMove}
      onMouseEnter={() => setIsHoveringCard(true)}
      onMouseLeave={handleCardMouseLeave}
      className="relative w-full aspect-square max-w-[420px] bg-zinc-50/50 rounded-[32px] border border-zinc-200/50 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] select-none overflow-hidden cursor-default"
    >
      {/* 0. INTERACTIVE HOLOGRAPHIC CARD SPOTLIGHT */}
      {isHoveringCard && selectedNode === null && (
        <div 
          className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-500 opacity-70"
          style={{
            background: `radial-gradient(circle 220px at ${cardMousePos.x}px ${cardMousePos.y}px, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0) 100%)`,
            transform: "translateZ(0px)"
          }}
        />
      )}
      
      {/* 1. BACKGROUND DETAILED DRAWER (Revealed when card splits open) */}
      <AnimatePresence>
        {activeNodeInfo && (
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.1,
                }
              },
              exit: {
                opacity: 0,
                transition: { duration: 0.25 }
              }
            }}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ background: activeNodeInfo.bgGradient }}
            className="absolute inset-0 z-0 p-8 flex flex-col justify-between items-center text-center text-zinc-800"
          >
            {/* Header X Close Button */}
            <motion.button 
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                show: { opacity: 1, scale: 1 }
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNode(null);
              }}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-black/5 hover:bg-black/10 text-zinc-500 hover:text-zinc-800 transition-colors border border-zinc-200/40 cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </motion.button>

            {/* Top icon and category label */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.8, rotate: -10 },
                show: { opacity: 1, y: 0, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 260, damping: 20 } }
              }}
              className="flex flex-col items-center gap-3 mt-6 z-10"
            >
              <div 
                style={{ background: `${activeNodeInfo.color}15`, color: activeNodeInfo.color, borderColor: `${activeNodeInfo.color}30` }} 
                className="w-16 h-16 rounded-full flex items-center justify-center border border-zinc-200/30 shadow-md bg-white"
              >
                {activeNodeInfo.icon}
              </div>
              <span className={`text-[9px] font-extrabold tracking-widest px-2.5 py-0.5 rounded-full border ${activeNodeInfo.badgeClass}`}>
                {activeNodeInfo.badge}
              </span>
            </motion.div>

            {/* Middle detailed description */}
            <div className="flex flex-col items-center gap-2 px-3 z-10">
              <motion.h3 
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 22 } }
                }}
                className="text-xl font-bold text-zinc-900 tracking-wide leading-tight"
              >
                {activeNodeInfo.fullTitle}
              </motion.h3>
              <motion.p 
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
                }}
                className="text-xs text-zinc-600 leading-relaxed font-medium"
              >
                {activeNodeInfo.description}
              </motion.p>
            </div>

            {/* Bottom action button */}
            <motion.button
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 22 } }
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNode(null);
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-zinc-200/80 hover:bg-zinc-50/50 text-[11px] font-bold text-zinc-500 hover:text-zinc-800 transition-all shadow-sm cursor-pointer z-10"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. SPLITTING LEFT DOOR PANEL - 3D Vault Gate Swing */}
      <motion.div
        animate={{ 
          x: selectedNode !== null ? "-15%" : "0%",
          rotateY: selectedNode !== null ? -90 : 0,
          opacity: selectedNode !== null ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        style={{ 
          clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
          transformOrigin: "left center",
          backfaceVisibility: "hidden"
        }}
        className="absolute inset-0 w-full h-full bg-white z-10 pointer-events-none"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <BackgroundSVG activeFeature={activeFeature} isExpanded={isExpanded} />
        </div>
      </motion.div>

      {/* 3. SPLITTING RIGHT DOOR PANEL - 3D Vault Gate Swing */}
      <motion.div
        animate={{ 
          x: selectedNode !== null ? "15%" : "0%",
          rotateY: selectedNode !== null ? 90 : 0,
          opacity: selectedNode !== null ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        style={{ 
          clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)",
          transformOrigin: "right center",
          backfaceVisibility: "hidden"
        }}
        className="absolute inset-0 w-full h-full bg-white z-10 pointer-events-none"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <BackgroundSVG activeFeature={activeFeature} isExpanded={isExpanded} />
        </div>
      </motion.div>

      {/* 4. FOREGROUND FLOATING NODES */}
      <motion.div
        animate={{ 
          opacity: selectedNode !== null ? 0 : 1,
          scale: selectedNode !== null ? 0.95 : 1,
          pointerEvents: selectedNode !== null ? "none" : "auto"
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 w-full h-full z-20"
      >
        {/* Central Connector Dot Hub */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-zinc-200 shadow-md flex items-center justify-center z-30 cursor-pointer hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <motion.div 
            animate={{ rotate: isExpanded ? 45 : 0 }} 
            className="relative w-3.5 h-3.5 flex items-center justify-center"
          >
            {/* Inner dot / plus mark cross icon */}
            <div className="absolute w-2 h-2 rounded-full bg-zinc-900 transition-transform" />
          </motion.div>

          {/* Triple Sonar pulsing rings when collapsed */}
          {!isExpanded && (
            <>
              <span className="absolute inset-0 rounded-full border-2 border-indigo-400/60 animate-ping pointer-events-none" style={{ animationDuration: "2s" }} />
              <span className="absolute inset-0 rounded-full border-2 border-purple-400/40 animate-ping pointer-events-none" style={{ animationDuration: "3s", animationDelay: "0.5s" }} />
              <span className="absolute inset-0 rounded-full border border-indigo-300/30 animate-ping pointer-events-none" style={{ animationDuration: "4s", animationDelay: "1s" }} />
            </>
          )}
        </div>

        {/* Floating Quadrant Nodes */}
        {nodes.map((node) => {
          const isActive = activeFeature === node.index;
          return (
            <motion.div
              key={node.index}
              initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              animate={{ 
                x: isExpanded ? node.targetX : 0,
                y: isExpanded ? node.targetY : 0,
                scale: isExpanded ? 1 : 0,
                opacity: isExpanded ? 1 : 0,
              }}
              transition={{ 
                type: "spring", 
                stiffness: 150, 
                damping: 16, 
                delay: isExpanded ? node.index * 0.06 : 0 
              }}
              style={{ top: "50%", left: "50%" }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group cursor-pointer"
              onMouseEnter={() => {
                if (isExpanded) setActiveFeature(node.index);
              }}
              onMouseLeave={() => {
                if (isExpanded) setActiveFeature(null);
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (isExpanded) setSelectedNode(node.index);
              }}
            >
              {/* Floating satellite container - slow natural organic bobbing */}
              <motion.div
                animate={isExpanded ? {
                  y: [0, -5, 0],
                } : { y: 0 }}
                transition={{
                  repeat: Infinity,
                  duration: 2.8 + node.index * 0.8, // variant speeds so they float organically
                  ease: "easeInOut"
                }}
                className="flex flex-col items-center gap-2"
              >
                {/* Round Icon Badge */}
                <motion.div
                  animate={{ 
                    scale: isActive ? 1.15 : 1,
                    borderColor: isActive ? node.color : "rgb(244, 244, 245)"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center transition-all duration-300 shadow-md ${
                    isActive ? node.activeClass : "text-zinc-500 border-zinc-100 hover:border-zinc-200"
                  }`}
                >
                  <div style={{ color: isActive ? node.color : "inherit" }} className="transition-colors duration-300">
                    {node.icon}
                  </div>
                </motion.div>

                {/* Label text */}
                <span 
                  className={`text-[9px] font-bold tracking-wider transition-all duration-300 ${
                    isActive ? node.activeText : `text-zinc-400 ${node.textColor}`
                  }`}
                >
                  {node.title}
                </span>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Guide text overlay when collapsed */}
      {!isExpanded && (
        <div className="absolute bottom-6 left-0 right-0 text-center text-[10px] font-bold text-indigo-500/80 tracking-widest uppercase animate-pulse pointer-events-none">
          Click center to deploy
        </div>
      )}
    </motion.div>
  );
}
