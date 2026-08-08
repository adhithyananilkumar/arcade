"use client";

import React from "react";

export const FeaturedKnowledgeIllustration: React.FC = () => {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <svg
        viewBox="30 40 440 280"
        width="100%"
        height="100%"
        style={{ overflow: "visible", display: "block", maxWidth: "750px" }}
      >
        <style>{`
          /* Entrance Animations */
          @keyframes drawPath {
            0% { stroke-dashoffset: 400; opacity: 0; }
            10% { opacity: 1; }
            100% { stroke-dashoffset: 0; opacity: 1; }
          }
          @keyframes fadeSlideUp {
            0% { opacity: 0; transform: translateY(15px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeSlideDown {
            0% { opacity: 0; transform: translateY(-15px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeSlideRight {
            0% { opacity: 0; transform: translateX(15px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          @keyframes revealLine {
            0% { opacity: 0; transform: scaleX(0.7); }
            100% { opacity: 1; transform: scaleX(1); }
          }
          @keyframes dropBookmark {
            0% { opacity: 0; transform: translateY(-10px) rotate(-6deg); }
            100% { opacity: 1; transform: translateY(0) rotate(0deg); }
          }
          @keyframes slideInGlass {
            0% { opacity: 0; transform: translate(-10px, 15px); }
            100% { opacity: 1; transform: translate(0, 0); }
          }
          
          /* Idle Animations */
          @keyframes floatArticle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes swayPlant {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(3deg); }
          }
          @keyframes scanGlass {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(5px, -3px); }
          }
          @keyframes popSparkle {
            0%, 100% { opacity: 0.3; transform: scale(0.9); }
            50% { opacity: 0.8; transform: scale(1.1); }
          }

          /* Element Assignments */
          .anim-path {
            stroke-dasharray: 400;
            stroke-dashoffset: 400;
            animation: drawPath 1.2s ease-out forwards;
          }
          .anim-guide {
            opacity: 0;
            animation: fadeSlideUp 0.8s ease-out 0.2s forwards;
          }
          .anim-docs {
            opacity: 0;
            animation: fadeSlideDown 0.8s ease-out 0.4s forwards;
          }
          .anim-article {
            opacity: 0;
            animation: fadeSlideUp 0.8s ease-out 0.6s forwards, floatArticle 4.5s ease-in-out 2.5s infinite;
          }
          .anim-line1 { opacity: 0; transform-origin: left; animation: revealLine 0.6s ease-out 0.9s forwards; }
          .anim-line2 { opacity: 0; transform-origin: left; animation: revealLine 0.6s ease-out 1.0s forwards; }
          .anim-line3 { opacity: 0; transform-origin: left; animation: revealLine 0.6s ease-out 1.1s forwards; }
          .anim-img { opacity: 0; animation: fadeSlideUp 0.6s ease-out 1.0s forwards; }
          
          .anim-bookmark {
            opacity: 0;
            transform-origin: top center;
            animation: dropBookmark 0.5s ease-out 1.2s forwards;
          }
          .anim-glass {
            opacity: 0;
            animation: slideInGlass 0.6s ease-out 1.4s forwards, scanGlass 5s ease-in-out 3s infinite;
          }
          .anim-book1 { opacity: 0; animation: fadeSlideUp 0.5s ease-out 1.6s forwards; }
          .anim-book2 { opacity: 0; animation: fadeSlideUp 0.5s ease-out 1.7s forwards; }
          .anim-book3 { opacity: 0; animation: fadeSlideUp 0.5s ease-out 1.8s forwards; }
          .anim-pencil {
            opacity: 0;
            animation: fadeSlideRight 0.6s ease-out 1.8s forwards;
          }
          .anim-plant {
            opacity: 0;
            animation: fadeSlideUp 0.6s ease-out 2.0s forwards;
          }
          .anim-plant-leaf {
            transform-origin: bottom center;
            animation: swayPlant 5s ease-in-out 2.5s infinite;
          }
          .anim-sparkle1 {
            opacity: 0;
            transform-origin: center;
            animation: fadeSlideUp 0.5s ease-out 2.2s forwards, popSparkle 3s ease-in-out 3s infinite;
          }
          .anim-sparkle2 {
            opacity: 0;
            transform-origin: center;
            animation: fadeSlideUp 0.5s ease-out 2.3s forwards, popSparkle 3.5s ease-in-out 3.2s infinite;
          }
          .anim-sparkle3 {
            opacity: 0;
            transform-origin: center;
            animation: fadeSlideUp 0.5s ease-out 2.4s forwards, popSparkle 4s ease-in-out 3.5s infinite;
          }
        `}</style>

        {/* Soft Background Accent Circles */}
        <circle cx="250" cy="160" r="130" fill="#F3E8FF" opacity="0.6" />
        <circle cx="160" cy="200" r="70" fill="#CCFBF1" opacity="0.5" />
        <circle cx="350" cy="130" r="80" fill="#E0F2FE" opacity="0.5" />

        {/* Background Dotted Paths (Exploration/Discovery) */}
        <path className="anim-path" d="M 80,120 C 130,50 200,60 250,90" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round" />
        <path className="anim-path" d="M 390,220 C 350,280 270,270 230,220" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round" />
        <path className="anim-path" d="M 330,80 C 380,100 420,160 380,240" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round" />

        {/* Base Surface Line */}
        <path d="M 50,275 Q 250,278 450,275" fill="none" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />

        {/* DOCS Document (Back Right) */}
        <g transform="translate(290, 150) rotate(8)">
          <g className="anim-docs">
            <rect x="-45" y="-60" width="90" height="120" rx="3" fill="#F0F9FF" stroke="#1E293B" strokeWidth="1.5" />
            <rect x="-35" y="-45" width="25" height="10" rx="2" fill="#38BDF8" />
            <text x="-31" y="-38" fontSize="6" fontWeight="bold" fill="#FFFFFF" fontFamily="'Space Grotesk', sans-serif">DOCS</text>
            <line x1="-35" y1="-25" x2="35" y2="-25" stroke="#BAE6FD" strokeWidth="2" strokeLinecap="round" />
            <line x1="-35" y1="-15" x2="25" y2="-15" stroke="#BAE6FD" strokeWidth="2" strokeLinecap="round" />
            <line x1="-35" y1="-5" x2="30" y2="-5" stroke="#BAE6FD" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>

        {/* GUIDE Document (Back Left) */}
        <g transform="translate(190, 160) rotate(-6)">
          <g className="anim-guide">
            <rect x="-50" y="-65" width="100" height="130" rx="3" fill="#F0FDFA" stroke="#1E293B" strokeWidth="1.5" />
            <rect x="-40" y="-50" width="30" height="10" rx="2" fill="#2DD4BF" />
            <text x="-36" y="-43" fontSize="6" fontWeight="bold" fill="#FFFFFF" fontFamily="'Space Grotesk', sans-serif">GUIDE</text>
            <rect x="-40" y="-30" width="80" height="30" rx="2" fill="#CCFBF1" stroke="#1E293B" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="-40" y1="10" x2="40" y2="10" stroke="#99F6E4" strokeWidth="2" strokeLinecap="round" />
            <line x1="-40" y1="20" x2="20" y2="20" stroke="#99F6E4" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>

        {/* MAIN ARTICLE Document (Center Front) */}
        <g transform="translate(250, 175)">
          <g className="anim-article">
            {/* Page Shadow */}
            <rect x="-60" y="-76" width="120" height="160" rx="4" fill="#E2E8F0" />
            {/* Page Base */}
            <rect x="-62" y="-78" width="120" height="160" rx="4" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />
            
            {/* Header / Label */}
            <rect x="-50" y="-65" width="40" height="12" rx="2" fill="#C084FC" />
            <text x="-45" y="-57" fontSize="6" fontWeight="bold" fill="#FFFFFF" fontFamily="'Space Grotesk', sans-serif">ARTICLE</text>
            
            {/* Content Lines */}
            <g transform="translate(0, 0)">
              <g className="anim-img">
                <rect x="-50" y="-45" width="100" height="40" rx="3" fill="#F8FAFC" stroke="#1E293B" strokeWidth="1.5" />
                {/* Simple image icon inside placeholder */}
                <circle cx="-35" cy="-35" r="4" fill="#CBD5E1" />
                <path d="M-50,-15 L-30,-30 L-10,-15 L10,-25 L50,0 L-50,0 Z" fill="#E2E8F0" />
              </g>
              <g className="anim-line1">
                <rect x="-50" y="5" width="100" height="4" rx="2" fill="#94A3B8" />
              </g>
              <g className="anim-line2">
                <rect x="-50" y="15" width="85" height="4" rx="2" fill="#CBD5E1" />
              </g>
              <g className="anim-line3">
                <rect x="-50" y="25" width="95" height="4" rx="2" fill="#CBD5E1" />
              </g>
              <g className="anim-line1" style={{ animationDelay: '1.2s' }}>
                <rect x="-50" y="35" width="70" height="4" rx="2" fill="#CBD5E1" />
              </g>
              <g className="anim-line2" style={{ animationDelay: '1.3s' }}>
                <rect x="-50" y="45" width="90" height="4" rx="2" fill="#CBD5E1" />
              </g>
              <g className="anim-line3" style={{ animationDelay: '1.4s' }}>
                <rect x="-50" y="55" width="60" height="4" rx="2" fill="#CBD5E1" />
              </g>
            </g>
            
            {/* Bookmark (Top Right) */}
            <g transform="translate(45, -78)">
              <g className="anim-bookmark">
                <path d="M-8,0 L8,0 L8,30 L0,23 L-8,30 Z" fill="#A855F7" stroke="#1E293B" strokeWidth="1.5" strokeLinejoin="round" />
              </g>
            </g>
          </g>
        </g>

        {/* Books (Bottom Right under documents) */}
        <g transform="translate(340, 275)">
          <g className="anim-book1">
            <rect x="-25" y="-12" width="50" height="12" rx="1.5" fill="#3B82F6" stroke="#1E293B" strokeWidth="1.5" />
            <line x1="-20" y1="-6" x2="-5" y2="-6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </g>
          <g className="anim-book2">
            <rect x="-22" y="-22" width="44" height="10" rx="1.5" fill="#F97316" stroke="#1E293B" strokeWidth="1.5" />
            <line x1="-17" y1="-17" x2="-5" y2="-17" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </g>
          <g className="anim-book3">
            <rect x="-24" y="-32" width="48" height="10" rx="1.5" fill="#14B8A6" stroke="#1E293B" strokeWidth="1.5" />
            <line x1="-19" y1="-27" x2="-2" y2="-27" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>

        {/* Pencil (Bottom Left under documents) */}
        <g transform="translate(180, 272)">
          <g className="anim-pencil">
            {/* Pencil body */}
            <rect x="-30" y="-3" width="60" height="6" fill="#FDE047" stroke="#1E293B" strokeWidth="1.5" />
            {/* Tip */}
            <path d="M-30,-3 L-40,0 L-30,3 Z" fill="#FDBA74" stroke="#1E293B" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M-37,-1 L-40,0 L-37,1 Z" fill="#1E293B" />
            {/* Eraser */}
            <rect x="30" y="-3" width="8" height="6" fill="#FCA5A5" stroke="#1E293B" strokeWidth="1.5" />
            {/* Metal band */}
            <rect x="26" y="-3" width="4" height="6" fill="#CBD5E1" stroke="#1E293B" strokeWidth="1.5" />
            {/* Yellow lines */}
            <line x1="-28" y1="0" x2="24" y2="0" stroke="#EAB308" strokeWidth="1" />
          </g>
        </g>

        {/* Magnifying Glass (Left front) */}
        <g transform="translate(160, 220)">
          <g className="anim-glass">
            {/* Handle */}
            <line x1="-12" y1="12" x2="-25" y2="25" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" />
            <line x1="-12" y1="12" x2="-25" y2="25" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
            {/* Rim */}
            <circle cx="0" cy="0" r="18" fill="#F8FAFC" stroke="#1E293B" strokeWidth="3" />
            {/* Glass reflection */}
            <path d="M-8,-8 A 12 12 0 0 1 8,-8" fill="none" stroke="#BAE6FD" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>

        {/* Plant (Far Right) */}
        <g transform="translate(410, 275)">
          <g className="anim-plant">
             <g className="anim-plant-leaf">
               <path d="M0,-15 Q-15,-25 -20,-45 Q-5,-35 0,-15" fill="#34D399" stroke="#1E293B" strokeWidth="1.5" strokeLinejoin="round" />
               <path d="M0,-15 Q15,-30 25,-40 Q10,-25 0,-15" fill="#2DD4BF" stroke="#1E293B" strokeWidth="1.5" strokeLinejoin="round" />
               <path d="M0,-15 Q-2,-40 5,-55 Q10,-35 0,-15" fill="#10B981" stroke="#1E293B" strokeWidth="1.5" strokeLinejoin="round" />
             </g>
             {/* Pot */}
             <path d="M-10,-15 L10,-15 L6,0 L-6,0 Z" fill="#FDE047" stroke="#1E293B" strokeWidth="1.5" strokeLinejoin="round" />
             <rect x="-12" y="-18" width="24" height="3" rx="1" fill="#F59E0B" stroke="#1E293B" strokeWidth="1.5" />
          </g>
        </g>

        {/* Subtle Sparkles/Stars */}
        <g transform="translate(130, 110)">
          <g className="anim-sparkle1">
            <path d="M0,-6 L2,-2 L6,0 L2,2 L0,6 L-2,2 L-6,0 L-2,-2 Z" fill="#FBBF24" />
          </g>
        </g>
        <g transform="translate(360, 90)">
          <g className="anim-sparkle2">
            <path d="M0,-8 L2,-2 L8,0 L2,2 L0,8 L-2,2 L-8,0 L-2,-2 Z" fill="#A855F7" />
          </g>
        </g>
        <g transform="translate(280, 70)">
          <g className="anim-sparkle3">
            <path d="M0,-5 L1,-1 L5,0 L1,1 L0,5 L-1,1 L-5,0 L-1,-1 Z" fill="#38BDF8" />
          </g>
        </g>
        
      </svg>
    </div>
  );
};
