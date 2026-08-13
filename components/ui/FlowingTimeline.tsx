"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const TIMELINE_DATA = [
  {
    num: "01",
    title: "THE BEGINNING",
    desc: "Arcade begins as an initiative of Amal Jyothi College of Engineering to make quality learning more accessible."
  },
  {
    num: "02",
    title: "LEARNING WITHOUT LIMITS",
    desc: "Free video-based courses allow learners to explore professional skills and school subjects at their own pace."
  },
  {
    num: "03",
    title: "BEYOND THE INDIVIDUAL",
    desc: "Partner institutions begin using Arcade as a digital classroom to manage students, courses, batches and progress."
  },
  {
    num: "04",
    title: "LEARNING MEETS RECOGNITION",
    desc: "Professional learners can complete structured courses and earn industry-recognised certifications through examinations."
  },
  {
    num: "05",
    title: "LEARNING BECOMES PERSONAL",
    desc: "Machine-learning-driven recommendations adapt content based on quiz and examination performance."
  },
  {
    num: "06",
    title: "MAKING LEARNING PLAYFUL",
    desc: "Coins, avatars, challenges, badges and leaderboards bring a layer of gamification to younger learners."
  }
];

export default function FlowingTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end 80%"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="w-full max-w-5xl mx-auto py-24 px-4 sm:px-6 relative" ref={containerRef}>
      
      {/* Center Line Container (Desktop) / Left Line Container (Mobile) */}
      <div className="absolute left-[30px] md:left-1/2 top-24 bottom-24 w-[2px] bg-slate-200/50 -translate-x-1/2 overflow-hidden rounded-full">
        {/* Animated Glowing Line */}
        <motion.div 
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-blue-400 via-indigo-500 to-teal-400"
          style={{ height: lineHeight }}
        />
      </div>

      <div className="space-y-16 md:space-y-24 relative z-10">
        {TIMELINE_DATA.map((item, index) => {
          const isEven = index % 2 === 0;
          
          return (
            <motion.div 
              key={item.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`flex flex-col md:flex-row items-start md:items-center w-full ${isEven ? "md:flex-row-reverse" : ""}`}
            >
              
              {/* Empty space for alternating layout on desktop */}
              <div className="hidden md:block md:w-[45%]" />

              {/* Numbered Node */}
              <div className="md:w-[10%] flex justify-center shrink-0 mb-6 md:mb-0 ml-1 md:ml-0 relative z-20">
                <motion.div 
                  initial={{ scale: 0.8, backgroundColor: "#f8fafc" }}
                  whileInView={{ scale: 1.1, backgroundColor: "#ffffff" }}
                  viewport={{ once: false, margin: "-200px" }}
                  transition={{ duration: 0.4 }}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-slate-100 bg-white shadow-xl shadow-blue-500/10 flex items-center justify-center relative group"
                >
                  <span className="text-lg md:text-xl font-bold text-slate-800 font-sans tracking-tighter">
                    {item.num}
                  </span>
                  
                  {/* Subtle pulse ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-indigo-400/30"
                    initial={{ scale: 1, opacity: 0 }}
                    whileInView={{ scale: 1.4, opacity: 0 }}
                    viewport={{ once: false, margin: "-200px" }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "loop" }}
                  />
                </motion.div>
              </div>

              {/* Content Box */}
              <div className={`md:w-[45%] pl-16 md:pl-0 ${isEven ? "md:pr-12 md:text-right" : "md:pl-12 md:text-left"}`}>
                <div className="bg-white/60 backdrop-blur-sm border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 tracking-tight font-serif uppercase">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
