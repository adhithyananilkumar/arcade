"use client";

import React, { useEffect, useState } from "react";

export const DeveloperDesk: React.FC = () => {
  // To handle typing animation
  const [typingStep, setTypingStep] = useState(0);

  useEffect(() => {
    // Start typing after laptop entrance
    const timer1 = setTimeout(() => setTypingStep(1), 1200); // function buildFuture() {
    const timer2 = setTimeout(() => setTypingStep(2), 1700); //   learn();
    const timer3 = setTimeout(() => setTypingStep(3), 2200); //   build();
    const timer4 = setTimeout(() => setTypingStep(4), 2700); //   connect();
    const timer5 = setTimeout(() => setTypingStep(5), 3200); // }
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4); clearTimeout(timer5); };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <svg
        viewBox="40 40 420 280"
        width="100%"
        height="100%"
        style={{ overflow: "visible", display: "block", maxWidth: "750px" }}
      >
        <style>{`
          /* Entrance Animations */
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(15px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideInRight {
            0% { opacity: 0; transform: translate(15px, 10px) rotate(10deg); }
            100% { opacity: 1; transform: translate(0, 0) rotate(10deg); }
          }
          @keyframes stickyNoteIn {
            0% { opacity: 0; transform: translateY(10px) rotate(-10deg); }
            100% { opacity: 1; transform: translateY(0) rotate(-2deg); }
          }
          
          /* Idle Animations */
          @keyframes floatGentle {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-4px); }
          }
          @keyframes swayPlant {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(2deg); }
          }
          @keyframes steamRise {
            0% { opacity: 0; transform: translateY(0) scale(0.9); }
            20% { opacity: 0.6; }
            80% { opacity: 0.6; }
            100% { opacity: 0; transform: translateY(-15px) scale(1.1); }
          }
          @keyframes cursorBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          @keyframes floatSymbol {
            0%, 100% { transform: translateY(0px); opacity: 0.5; }
            50% { transform: translateY(-4px); opacity: 0.8; }
          }

          /* Assigning Entrance + Idle */
          .anim-laptop {
            animation: fadeInUp 0.8s ease-out forwards, floatGentle 4s ease-in-out 0.8s infinite;
            opacity: 0;
          }
          .anim-plant {
            animation: fadeInUp 0.8s ease-out 0.6s forwards;
            opacity: 0;
            transform-origin: bottom center;
          }
          .anim-plant-leaf {
            animation: swayPlant 5s ease-in-out infinite;
            transform-origin: bottom center;
          }
          .anim-mug {
            animation: fadeInUp 0.8s ease-out 0.9s forwards;
            opacity: 0;
          }
          .anim-steam {
            animation: steamRise 3s ease-in-out infinite;
            opacity: 0;
            animation-delay: 1.5s;
          }
          .anim-notebook {
            animation: slideInRight 0.8s ease-out 1.2s forwards;
            opacity: 0;
            transform-origin: bottom right;
          }
          .anim-book1 { animation: fadeInUp 0.6s ease-out 1.4s forwards; opacity: 0; }
          .anim-book2 { animation: fadeInUp 0.6s ease-out 1.55s forwards; opacity: 0; }
          .anim-book3 { animation: fadeInUp 0.6s ease-out 1.7s forwards; opacity: 0; }
          
          .anim-sticky {
            animation: stickyNoteIn 0.8s ease-out 1.9s forwards;
            opacity: 0;
            transform-origin: center;
          }
          .anim-floating-symbol {
            animation: fadeInUp 0.8s ease-out 2.2s forwards, floatSymbol 4s ease-in-out 3s infinite;
            opacity: 0;
          }
          
          .blinking-cursor {
            animation: cursorBlink 1s step-end infinite;
          }
          
          .code-text {
            font-family: 'Fira Code', 'Courier New', Courier, monospace;
            font-size: 10px;
            font-weight: 600;
            fill: #38BDF8;
          }
          .code-keyword { fill: #C084FC; }
          .code-function { fill: #34D399; }
          .code-punctuation { fill: #94A3B8; }
        `}</style>

        {/* Background Soft Accents (Lavender/Purple/Teal) */}
        <circle cx="260" cy="180" r="140" fill="#F3E8FF" opacity="0.5" />
        <circle cx="150" cy="220" r="80" fill="#CCFBF1" opacity="0.4" />
        <circle cx="380" cy="150" r="90" fill="#E0F2FE" opacity="0.5" />
        <circle cx="320" cy="240" r="60" fill="#FFEDD5" opacity="0.4" />

        {/* Base Desk Line */}
        <path d="M40,280 Q250,283 460,280" fill="none" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />

        {/* Books Stack (Back Right) */}
        <g transform="translate(380, 280)">
           <g className="anim-book1">
             <rect x="0" y="-14" width="60" height="14" rx="1.5" fill="#3B82F6" stroke="#1E293B" strokeWidth="1.5" />
             <line x1="5" y1="-7" x2="20" y2="-7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
           </g>
           <g className="anim-book2">
             <rect x="4" y="-26" width="52" height="12" rx="1.5" fill="#F97316" stroke="#1E293B" strokeWidth="1.5" />
             <line x1="9" y1="-20" x2="25" y2="-20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
           </g>
           <g className="anim-book3">
             <rect x="2" y="-38" width="56" height="12" rx="1.5" fill="#14B8A6" stroke="#1E293B" strokeWidth="1.5" />
             <line x1="7" y1="-32" x2="30" y2="-32" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
           </g>
        </g>

        {/* Notebook & Pen (Right side) */}
        <g transform="translate(320, 280)">
          <g className="anim-notebook">
            <g transform="rotate(10) translate(0, -60)">
              <rect x="0" y="0" width="45" height="60" rx="2" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />
              <rect x="-4" y="0" width="4" height="60" fill="#1E293B" /> {/* Spine */}
              <line x1="5" y1="10" x2="35" y2="10" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="5" y1="20" x2="35" y2="20" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="5" y1="30" x2="25" y2="30" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
              
              {/* Pen */}
              <g transform="translate(35, 10) rotate(-15)">
                 <rect x="0" y="0" width="4" height="40" rx="2" fill="#818CF8" stroke="#1E293B" strokeWidth="1.5" />
                 <path d="M0,40 L2,46 L4,40 Z" fill="#1E293B" stroke="#1E293B" strokeWidth="1" strokeLinejoin="round" />
                 <line x1="1" y1="4" x2="1" y2="12" stroke="#FFFFFF" strokeWidth="0.5" />
              </g>
            </g>
          </g>
        </g>

        {/* Plant (Left Side) */}
        <g transform="translate(100, 280)">
           <g className="anim-plant">
             {/* Leaves */}
             <g className="anim-plant-leaf">
               <path d="M0,-20 Q-20,-35 -25,-55 Q-5,-45 0,-20" fill="#34D399" stroke="#1E293B" strokeWidth="1.5" strokeLinejoin="round" />
               <path d="M0,-20 Q10,-40 30,-50 Q15,-30 0,-20" fill="#10B981" stroke="#1E293B" strokeWidth="1.5" strokeLinejoin="round" />
               <path d="M0,-20 Q-5,-50 5,-65 Q15,-40 0,-20" fill="#059669" stroke="#1E293B" strokeWidth="1.5" strokeLinejoin="round" />
             </g>
             {/* Pot */}
             <path d="M-12,-20 L12,-20 L8,0 L-8,0 Z" fill="#FCD34D" stroke="#1E293B" strokeWidth="1.5" strokeLinejoin="round" />
             <rect x="-14" y="-24" width="28" height="4" rx="1" fill="#B45309" stroke="#1E293B" strokeWidth="1.5" />
           </g>
        </g>

        {/* Coffee Mug (Left Side, front of plant) */}
        <g transform="translate(150, 280)">
           <g className="anim-mug">
             <rect x="-12" y="-24" width="24" height="24" rx="2" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />
             <path d="M12,-18 C18,-18 18,-6 12,-6" fill="none" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
             <text x="-6" y="-10" fontSize="8" fontWeight="bold" fill="#64748B" fontFamily="'Courier New', monospace">&lt;/&gt;</text>
             
             {/* Steam */}
             <g className="anim-steam" transform="translate(0, -28)">
               <path d="M-4,0 Q-8,-5 -4,-10 T-4,-20" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
               <path d="M4,2 Q0,-3 4,-8 T4,-18" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
             </g>
           </g>
        </g>

        {/* Laptop (Center) */}
        <g transform="translate(260, 280)">
           <g className="anim-laptop">
             {/* Base */}
             <path d="M-85,0 L85,0 C88,0 90,-2 88,-5 L80,-12 L-80,-12 L-88,-5 C-90,-2 -88,0 -85,0 Z" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1.5" strokeLinejoin="round" />
             {/* Trackpad */}
             <rect x="-15" y="-6" width="30" height="3" rx="1" fill="#CBD5E1" stroke="#1E293B" strokeWidth="1" />
             
             {/* Screen Lid */}
             <path d="M-75,-12 L75,-12 L70,-100 C70,-103 67,-105 64,-105 L-64,-105 C-67,-105 -70,-103 -70,-100 Z" fill="#1E293B" stroke="#1E293B" strokeWidth="1.5" strokeLinejoin="round" />
             {/* Screen Display */}
             <path d="M-70,-17 L70,-17 L66,-100 L-66,-100 Z" fill="#0F172A" />
             
             {/* Screen Content - Code Editor */}
             <g transform="translate(-55, -95)">
               {/* Window header */}
               <circle cx="0" cy="0" r="2" fill="#EF4444" />
               <circle cx="8" cy="0" r="2" fill="#FACC15" />
               <circle cx="16" cy="0" r="2" fill="#34D399" />
               
               {/* Code Lines with typing effect */}
               {typingStep >= 1 && (
                 <text x="-2" y="18" className="code-text">
                   <tspan className="code-keyword">function</tspan> <tspan className="code-function">buildFuture</tspan><tspan className="code-punctuation">() {'{'}</tspan>
                   {typingStep === 1 && <tspan className="blinking-cursor">_</tspan>}
                 </text>
               )}
               {typingStep >= 2 && (
                 <text x="8" y="32" className="code-text">
                   <tspan className="code-function">learn</tspan><tspan className="code-punctuation">();</tspan>
                   {typingStep === 2 && <tspan className="blinking-cursor">_</tspan>}
                 </text>
               )}
               {typingStep >= 3 && (
                 <text x="8" y="46" className="code-text">
                   <tspan className="code-function">build</tspan><tspan className="code-punctuation">();</tspan>
                   {typingStep === 3 && <tspan className="blinking-cursor">_</tspan>}
                 </text>
               )}
               {typingStep >= 4 && (
                 <text x="8" y="60" className="code-text">
                   <tspan className="code-function">connect</tspan><tspan className="code-punctuation">();</tspan>
                   {typingStep === 4 && <tspan className="blinking-cursor">_</tspan>}
                 </text>
               )}
               {typingStep >= 5 && (
                 <text x="-2" y="74" className="code-text">
                   <tspan className="code-punctuation">{'}'}</tspan>
                   {typingStep === 5 && <tspan className="blinking-cursor">_</tspan>}
                 </text>
               )}
             </g>
           </g>
        </g>

        {/* Sticky Note */}
        <g transform="translate(195, 230)">
           <g className="anim-sticky">
             <rect x="0" y="-30" width="30" height="30" fill="#FEF08A" stroke="#1E293B" strokeWidth="1" strokeLinejoin="round" />
             <text x="4" y="-18" fontSize="6" fontWeight="bold" fill="#1E293B" fontFamily="'Space Grotesk', sans-serif">Keep</text>
             <text x="4" y="-8" fontSize="6" fontWeight="bold" fill="#1E293B" fontFamily="'Space Grotesk', sans-serif">Building</text>
             {/* Pin */}
             <circle cx="15" cy="-26" r="1.5" fill="#EF4444" stroke="#1E293B" strokeWidth="0.5" />
           </g>
        </g>

        {/* Subtle Floating </> Symbol */}
        <g transform="translate(380, 160)">
           <g className="anim-floating-symbol">
             <text fontSize="24" fontWeight="800" fill="#C084FC" fontFamily="'Courier New', monospace">&lt;/&gt;</text>
           </g>
        </g>

      </svg>
    </div>
  );
};
