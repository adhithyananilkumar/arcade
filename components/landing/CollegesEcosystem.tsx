"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, Sparkles, Cpu, Award, X } from "lucide-react";

interface CollegesEcosystemProps {
  activeFeature: number | null;
  setActiveFeature: (index: number | null) => void;
}

export default function CollegesEcosystem({ activeFeature, setActiveFeature }: CollegesEcosystemProps) {
  const flaps = [
    {
      title: "Forums & Clubs",
      icon: <Users className="w-6 h-6 animate-none" />,
      badge: "TEAMWORK",
      description: "Connect student communities and foster professional technical networks.",
      color: "#6366F1",
      bgColor: "rgba(99, 102, 241, 0.08)",
      clipPath: "polygon(0% 0%, 100% 0%, 50% 50%)",
      gradient: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 60%, #E2E8F0 100%)",
      hoverAnim: { y: -8 },
      posStyle: {
        top: "22%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }
    },
    {
      title: "Creator Tools",
      icon: <Sparkles className="w-6 h-6 animate-none" />,
      badge: "CREATIVE",
      description: "Build, curate, and scale professional educational tracks and resources.",
      color: "#F59E0B",
      bgColor: "rgba(245, 158, 11, 0.08)",
      clipPath: "polygon(100% 0%, 100% 100%, 50% 50%)",
      gradient: "linear-gradient(270deg, #FFFFFF 0%, #F8FAFC 60%, #E2E8F0 100%)",
      hoverAnim: { x: 8 },
      posStyle: {
        top: "50%",
        left: "78%",
        transform: "translate(-50%, -50%)",
      }
    },
    {
      title: "Interactive Labs",
      icon: <Cpu className="w-6 h-6 animate-none" />,
      badge: "BUSINESS",
      description: "Interactive terminals running direct workspace environments in the browser.",
      color: "#0D9488",
      bgColor: "rgba(13, 148, 136, 0.08)",
      clipPath: "polygon(0% 0%, 0% 100%, 50% 50%)",
      gradient: "linear-gradient(90deg, #FFFFFF 0%, #F8FAFC 60%, #E2E8F0 100%)",
      hoverAnim: { x: -8 },
      posStyle: {
        top: "50%",
        left: "22%",
        transform: "translate(-50%, -50%)",
      }
    },
    {
      title: "Certifications",
      icon: <Award className="w-6 h-6 text-emerald-600 animate-none" />,
      badge: "IDEA",
      description: "Issue encrypted, tamper-proof certificates and verified skills achievements.",
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.08)",
      clipPath: "polygon(0% 100%, 100% 100%, 50% 50%)",
      gradient: "linear-gradient(0deg, #FFFFFF 0%, #F8FAFC 60%, #E2E8F0 100%)",
      hoverAnim: { y: 8 },
      posStyle: {
        top: "78%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }
    }
  ];

  return (
    <div className="w-full max-w-[420px] aspect-square relative select-none flex items-center justify-center">
      
      {/* 1. Spin-animation background outer circle framing */}
      <div 
        className="absolute w-[440px] h-[440px] rounded-full border-2 border-dashed border-indigo-200/50 -z-20 pointer-events-none opacity-80"
        style={{
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.04) 0%, transparent 70%)",
          animation: "spin 120s linear infinite"
        }}
      />

      {/* Decorative arrow graphics similar to cootie catcher diagram */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10" viewBox="0 0 420 420">
        <path d="M 360 80 Q 400 120 370 170" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 3" opacity="0.5" />
        <path d="M 370 170 L 364 162 M 370 170 L 376 166" stroke="#F59E0B" strokeWidth="2" opacity="0.5" />
        
        <path d="M 60 340 Q 20 300 50 250" fill="none" stroke="#6366F1" strokeWidth="2" strokeDasharray="3 3" opacity="0.5" />
        <path d="M 50 250 L 56 258 M 50 250 L 44 254" stroke="#6366F1" strokeWidth="2" opacity="0.5" />
      </svg>

      {/* 2. Paper Fortune Teller Main Container */}
      <div 
        className="w-[360px] h-[360px] relative bg-zinc-100 rounded-2xl p-0.5 overflow-hidden"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.12), inset 0 2px 4px rgba(255,255,255,0.8)"
        }}
      >
        {/* Crease lines overlay representing paper folds */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-30 opacity-20">
          <line x1="0" y1="0" x2="100" y2="100" stroke="#000" strokeWidth="0.4" />
          <line x1="100" y1="0" x2="0" y2="100" stroke="#000" strokeWidth="0.4" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#000" strokeWidth="0.2" strokeDasharray="2 2" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#000" strokeWidth="0.2" strokeDasharray="2 2" />
        </svg>

        {/* 3. The 4 Triangluar Flaps */}
        {flaps.map((flap, idx) => {
          const isSelected = activeFeature === idx;
          
          return (
            <motion.div
              key={idx}
              onClick={() => setActiveFeature(idx)}
              whileHover={activeFeature === null ? flap.hoverAnim : {}}
              animate={isSelected ? flap.hoverAnim : { x: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="absolute inset-0 cursor-pointer z-20"
              style={{
                clipPath: flap.clipPath,
                background: flap.gradient,
                boxShadow: isSelected ? "inset 0 0 20px rgba(0,0,0,0.04)" : "none",
                filter: isSelected ? "brightness(0.97)" : "brightness(1)",
                transition: "filter 0.3s"
              }}
            >
              {/* Content box positioned inside each flap */}
              <div 
                className="absolute flex flex-col items-center gap-1.5 select-none w-32"
                style={flap.posStyle}
              >
                {/* Round icon backing matching selected theme */}
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 shadow-sm"
                  style={{
                    backgroundColor: isSelected ? flap.color : "transparent",
                    borderColor: isSelected ? flap.color : "#E2E8F0",
                    color: isSelected ? "#FFFFFF" : flap.color,
                    boxShadow: isSelected ? `0 8px 16px ${flap.color}30` : "none"
                  }}
                >
                  <span className="transition-transform duration-300" style={{ transform: isSelected ? "scale(1.1)" : "scale(1)" }}>
                    {flap.icon}
                  </span>
                </div>

                {/* Text Title */}
                <span 
                  className="text-[10px] font-extrabold uppercase tracking-widest text-center transition-colors duration-300 mt-1"
                  style={{
                    color: isSelected ? flap.color : "#374151"
                  }}
                >
                  {flap.title}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Central folded button node representing core folded point */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
          <motion.div 
            animate={activeFeature !== null ? { rotate: 45, scale: 0.8, opacity: 0 } : { rotate: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-8 h-8 rounded-lg bg-white border border-zinc-200/80 shadow-md flex items-center justify-center rotate-45 bg-gradient-to-b from-white to-zinc-50"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-950" />
          </motion.div>
        </div>

        {/* 4. Interactive Detail Panel inside the square */}
        <AnimatePresence>
          {activeFeature !== null && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 24 }}
              className="absolute inset-3 bg-white/95 backdrop-blur-md rounded-2xl p-5 flex flex-col items-center justify-center text-center border border-zinc-200/80 shadow-xl z-50"
            >
              {/* Close Icon Button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveFeature(null);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Dynamic Icon */}
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-2.5 shadow-md transition-all duration-300"
                style={{ 
                  backgroundColor: flaps[activeFeature].color,
                  boxShadow: `0 8px 20px ${flaps[activeFeature].color}30`
                }}
              >
                {flaps[activeFeature].icon}
              </div>

              {/* Category Badge */}
              <div 
                className="text-[10px] font-extrabold tracking-widest uppercase mb-1" 
                style={{ color: flaps[activeFeature].color }}
              >
                {flaps[activeFeature].badge}
              </div>

              {/* Title */}
              <h4 className="text-sm font-extrabold text-zinc-900 leading-snug mb-1.5 px-2">
                {flaps[activeFeature].title}
              </h4>

              {/* Detailed Description */}
              <p className="text-xs text-zinc-500 leading-relaxed max-w-[240px] px-1.5">
                {flaps[activeFeature].description}
              </p>

              {/* Close Button Label */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveFeature(null);
                }}
                className="mt-3.5 text-[9px] font-bold text-zinc-400 hover:text-zinc-600 transition-colors uppercase tracking-widest flex items-center gap-1"
              >
                ← Back to flaps
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
