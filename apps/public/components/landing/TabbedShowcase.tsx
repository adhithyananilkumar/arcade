'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface FeatureData {
  color: string;
  title: string;
  description: string;
  label: string;
  icon: React.ComponentType<any>;
  bgSvg?: React.ReactNode;
}

interface TabbedShowcaseProps {
  features: FeatureData[];
}

export const TabbedShowcase: React.FC<TabbedShowcaseProps> = ({ features }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!features || features.length === 0) return null;

  const activeFeature = features[activeIndex];
  const isLightBackground = !['#2451d6', '#12141c', '#000000', '#0f172a'].includes(activeFeature.color.toLowerCase());
  const textColorClass = isLightBackground ? 'text-slate-900' : 'text-white';
  const mutedTextColorClass = isLightBackground ? 'text-slate-700' : 'text-white/80';

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(36,81,214,0.1)] border border-slate-200/50 bg-white">
      
      {/* Main Content Area */}
      <div className="relative w-full overflow-hidden transition-colors duration-500" style={{ minHeight: '480px', backgroundColor: activeFeature.color }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className={`absolute inset-0 flex flex-col lg:flex-row items-center justify-between p-10 pb-20 md:p-16 md:pb-28 lg:p-20 lg:pb-32 ${textColorClass}`}
          >
            {/* Background SVG if any */}
            {activeFeature.bgSvg && (
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20 mix-blend-overlay">
                {activeFeature.bgSvg}
              </div>
            )}

            {/* Left Content */}
            <div className="relative z-10 w-full lg:w-[55%] flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isLightBackground ? 'bg-slate-900/5' : 'bg-white/10'} backdrop-blur-sm`}>
                  {activeFeature.icon && <activeFeature.icon className={`w-6 h-6 ${textColorClass}`} />}
                </div>
                <span className="font-semibold uppercase tracking-[0.15em] text-sm opacity-70">{activeFeature.label}</span>
              </div>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                {activeFeature.title}
              </h3>
              <p className={`text-lg md:text-xl leading-relaxed max-w-xl ${mutedTextColorClass}`}>
                {activeFeature.description}
              </p>
            </div>

            {/* Right Graphics/Visual */}
            <div className="relative z-10 w-full lg:w-[40%] flex justify-center items-center mt-12 lg:mt-0">
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
                 animate={{ scale: 1, opacity: 1, rotate: 0 }}
                 transition={{ delay: 0.2, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                 className={`relative w-64 h-64 md:w-80 md:h-80 lg:w-[380px] lg:h-[380px] rounded-full flex items-center justify-center shadow-2xl ${isLightBackground ? 'bg-white/40' : 'bg-slate-900/20'} backdrop-blur-xl border border-white/30`}
               >
                 {activeFeature.icon && <activeFeature.icon size={160} className={`${isLightBackground ? 'text-indigo-600' : 'text-white'} opacity-90 drop-shadow-xl`} strokeWidth={1} />}
               </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Magic Liquid Navigation Bar */}
      <div className="w-full bg-white flex relative z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-b-[2.5rem]">
        <div className="flex w-full items-center justify-between h-20 md:h-24 px-2 md:px-6 relative">
          {features.map((feature, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div 
                key={idx} 
                className="relative flex-1 h-full flex flex-col items-center justify-center cursor-pointer group" 
                onClick={() => setActiveIndex(idx)}
              >
                {/* Active Animated Indicator */}
                {isActive && (
                  <motion.div 
                    layoutId="magic-nav-indicator"
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  >
                    {/* The floating circle with dynamic border masking */}
                    <div 
                      className="absolute left-1/2 -translate-x-1/2 -top-8 md:-top-10 w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center z-30 transition-colors duration-500 border-[6px] md:border-[8px]"
                      style={{ borderColor: activeFeature.color }}
                    >
                      <feature.icon className="text-indigo-600 w-6 h-6 md:w-8 md:h-8 drop-shadow-md" />
                    </div>

                    {/* Left SVG Fillet */}
                    <svg width="24" height="24" className="absolute top-0 -translate-y-full left-[calc(50%-32px-24px)] md:left-[calc(50%-40px-24px)] fill-white transition-colors duration-300">
                      <path d="M 0 24 L 24 24 L 24 0 C 24 13, 13 24, 0 24 Z" />
                    </svg>
                    
                    {/* Right SVG Fillet */}
                    <svg width="24" height="24" className="absolute top-0 -translate-y-full right-[calc(50%-32px-24px)] md:right-[calc(50%-40px-24px)] fill-white transition-colors duration-300">
                      <path d="M 0 0 L 0 24 L 24 24 C 11 24, 0 13, 0 0 Z" />
                    </svg>
                  </motion.div>
                )}

                {/* Tab Label */}
                <div className={`transition-all duration-300 z-10 font-bold flex flex-col items-center justify-center ${isActive ? 'translate-y-2 md:translate-y-3 text-indigo-600 opacity-100' : 'translate-y-0 text-slate-400 group-hover:text-indigo-500'}`}>
                   {!isActive && <feature.icon className="w-5 h-5 md:w-6 md:h-6 mb-1 opacity-60 transition-transform duration-300 group-hover:-translate-y-1" />}
                   <span className="text-xs md:text-sm whitespace-nowrap hidden sm:block">{feature.label}</span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
