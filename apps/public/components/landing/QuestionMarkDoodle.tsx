"use client";

import React from "react";
import { motion } from "framer-motion";

export default function QuestionMarkDoodle() {
  return (
    <div className="relative w-full h-[400px] lg:h-[500px] flex items-center justify-center overflow-hidden rounded-3xl">
      {/* Spinning Rainbow Glow Background */}
      <motion.div
        className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full blur-[80px] opacity-80"
        style={{
          background: "conic-gradient(from 0deg, #ef4444, #f59e0b, #eab308, #22c55e, #3b82f6, #a855f7, #ef4444)"
        }}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      
      {/* Floating Question Mark */}
      <motion.div
        className="relative z-10 flex items-center justify-center text-[12rem] md:text-[16rem] font-black text-slate-900"
        style={{ 
          filter: "drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15))",
          WebkitTextStroke: "4px rgba(255, 255, 255, 0.8)",
          lineHeight: 1
        }}
        animate={{
          y: [-15, 15, -15],
          rotate: [-3, 3, -3],
        }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        ?
      </motion.div>
    </div>
  );
}
