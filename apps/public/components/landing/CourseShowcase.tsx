"use client";

import { useState } from "react";
import { Play, VolumeX, Settings, Share2, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CourseShowcase() {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  return (
    <section className="bg-transparent py-16 px-4 md:px-8 flex justify-center relative z-10" aria-label="Course showcase section">
      <div className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-[0_20px_60px_rgba(15,23,42,0.08)] grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center px-6 py-12 md:px-16 md:py-16 w-full max-w-[1280px] overflow-hidden">
        
        {/* Left Column: Info & Details */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
          <div className="flex items-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Our Mission</span>
          </div>

          <h2 className="text-[36px] md:text-[44px] lg:text-[54px] font-bold text-[#0F172A] leading-[1.15] tracking-tight">
            Built to empower, educate, and connect the next generation of builders.
          </h2>

          <p className="text-[#475569] text-base md:text-[18px] leading-[1.8] font-normal">
            Arcade started with a simple idea: to build a unified online learning and collaboration ecosystem for Amal Jyothi College. We bring together high-quality courses, interactive workshops, student-led forums, and certified learning achievements under one roof. Designed by builders, for builders — Arcade is here to help you level up your skills, discover new opportunities, and connect with technical communities.
          </p>

          <div className="pt-2">
            <Link 
              href="/explore" 
              className="l-showcase__enterprise-btn text-[15px] text-center"
            >
              <span>Explore Courses</span>
              <ArrowRight size={16} className="arrow-icon" />
            </Link>
          </div>
        </div>

        {/* Right Column: Custom Interactive Video Player */}
        <div className="lg:col-span-6 w-full flex items-center justify-center">
          <div className="relative w-full aspect-video bg-[#000000] rounded-[18px] overflow-hidden shadow-[0_4px_20px_rgba(15,23,42,0.06)] border border-[#E5E7EB]">
            {isPlaying ? (
              <iframe
                className="absolute inset-0 w-full h-full border-none z-5"
                src="https://www.youtube.com/embed/zjhCUXDr1wo?autoplay=1&rel=0&modestbranding=1"
                title="Arcade Platform Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : null}

            {/* Interactive Cover Overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center z-10 cursor-pointer transition-opacity duration-300 ${isPlaying ? "opacity-0 pointer-events-none" : ""}`}
              onClick={handlePlayClick}
            >
              {/* Top Bar Mock Overlays */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-15 text-white pointer-events-none">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border border-white/30 overflow-hidden bg-slate-700 bg-[radial-gradient(circle,_#64748b_0%,_#334155_100%)]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white text-shadow-md">Arcade — The Story of Our Platform</span>
                    <span className="text-[10px] text-white/80 text-shadow-md">Arcade Creators</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <VolumeX size={16} />
                  <Settings size={16} />
                </div>
              </div>

              {/* Play Button Overlay */}
              <button
                type="button"
                className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 flex items-center justify-center text-white transition-all duration-200 shadow-lg scale-100 hover:scale-110"
                aria-label="Play video"
              >
                <Play size={24} fill="#ffffff" className="ml-1" />
              </button>

              {/* Bottom Bar Mock Overlays */}
              <div className="absolute bottom-4 left-4 right-4 z-15 text-white pointer-events-none">
                <div className="w-full h-1 bg-white/35 rounded-full mb-3 overflow-hidden">
                  <div className="bg-[#EF4444] h-full" style={{ width: "100%" }} />
                </div>
                <div className="flex items-center justify-between text-xs text-white/90">
                  <span className="font-medium text-shadow-md">1:30 / 1:30</span>
                  <div className="flex items-center gap-3">
                    <Share2 size={16} />
                    <Clock size={16} />
                    <span className="text-[10px] font-bold text-shadow-md">YouTube</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
