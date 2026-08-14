"use client";

import React from "react";

export default function WindmillAnimation() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes cloudDrift1 {
          from { transform: translateX(-80px); }
          to { transform: translateX(320px); }
        }
        @keyframes cloudDrift2 {
          from { transform: translateX(-120px); }
          to { transform: translateX(280px); }
        }
        @keyframes grassSway {
          0% { transform: skewX(-2deg); }
          50% { transform: skewX(3deg); }
          100% { transform: skewX(-2deg); }
        }
        @keyframes flowerNod1 {
          0% { transform: rotate(-5deg); }
          50% { transform: rotate(8deg); }
          100% { transform: rotate(-5deg); }
        }
        @keyframes flowerNod2 {
          0% { transform: rotate(4deg); }
          50% { transform: rotate(-6deg); }
          100% { transform: rotate(4deg); }
        }
        @keyframes windmillStartup {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes windmillSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .blade-assembly {
          animation: 
            windmillStartup 4s cubic-bezier(0.4, 0, 0.2, 1) forwards,
            windmillSpin 15s linear 4s infinite;
          transform-origin: 200px 120px; /* Center of the hub */
        }
        .cloud-1 {
          animation: cloudDrift1 40s linear infinite;
        }
        .cloud-2 {
          animation: cloudDrift2 30s linear infinite;
        }
        .grass-layer {
          transform-origin: bottom center;
          animation: grassSway 4s ease-in-out infinite;
        }
        .flower-group-1 {
          animation: flowerNod1 3.5s ease-in-out infinite;
        }
        .flower-group-2 {
          animation: flowerNod2 4.5s ease-in-out infinite;
        }
      `}</style>
      
      <svg
        viewBox="80 10 240 260"
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "400px",
          maxHeight: "400px",
          display: "block",
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="clayGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E8E2D6" />
            <stop offset="35%" stopColor="#D4CDC0" />
            <stop offset="75%" stopColor="#B3ACA0" />
            <stop offset="100%" stopColor="#8C8576" />
          </linearGradient>
          
          <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A26C42" />
            <stop offset="50%" stopColor="#C78A58" />
            <stop offset="100%" stopColor="#754724" />
          </linearGradient>

          <linearGradient id="mossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#166534" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>

          <linearGradient id="grassGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          
          <linearGradient id="grassGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>

          <linearGradient id="grassGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>

        {/* CLOUDS (TOP) */}
        <g className="cloud-1" opacity="0.6">
          <path d="M 100 50 Q 110 35 130 40 Q 150 20 170 40 Q 190 45 180 60 Q 190 70 170 70 L 110 70 Q 90 70 100 50 Z" fill="#FFFFFF" />
          <path d="M 280 30 Q 290 15 310 20 Q 330 10 340 25 Q 360 35 340 45 L 290 45 Q 270 45 280 30 Z" fill="#FFFFFF" opacity="0.8" />
        </g>
        <g className="cloud-2" opacity="0.5">
          <path d="M 180 80 Q 190 65 210 70 Q 230 55 245 70 Q 260 75 250 90 Q 260 100 240 100 L 190 100 Q 170 100 180 80 Z" fill="#FFFFFF" />
          <path d="M 80 90 Q 90 75 110 80 Q 130 65 145 80 Q 160 85 150 100 Q 160 110 140 110 L 90 110 Q 70 110 80 90 Z" fill="#FFFFFF" opacity="0.7" />
        </g>

        {/* CLAY/CEMENT WINDMILL BODY */}
        <g transform="translate(0, 5)">
          {/* Base / Tower Shadow */}
          <ellipse cx="200" cy="250" rx="45" ry="10" fill="#064e3b" opacity="0.4" />
          
          {/* Main Body (Smooth clay/cement look) */}
          <path d="M 168 250 L 185 120 L 215 120 L 232 250 Z" fill="url(#clayGrad)" stroke="#6F685B" strokeWidth="1.2" />
          
          {/* Reduced Algae & Moss creeping up the body */}
          <g fill="url(#mossGrad)" opacity="0.9">
            {/* Reduced Left side moss */}
            <path d="M 168 250 L 171 235 Q 173 230 175 235 Q 178 240 181 250 Z" />
            <circle cx="174" cy="225" r="0.8" />
            <circle cx="172" cy="218" r="0.5" />
            
            {/* Reduced Right side moss */}
            <path d="M 232 250 L 229 235 Q 227 230 225 235 Q 222 240 219 250 Z" />
            <circle cx="226" cy="225" r="0.8" />
            <circle cx="228" cy="218" r="0.5" />
            
            {/* Tiny bit around the door */}
            <circle cx="190" cy="245" r="0.8" />
            <circle cx="210" cy="246" r="0.8" />
          </g>
          
          {/* Subtle Stucco / Clay Texture */}
          <g stroke="#91897C" strokeWidth="1" strokeLinecap="round" opacity="0.6">
            <path d="M 175 235 Q 180 238 188 235" fill="none" />
            <path d="M 220 230 Q 215 227 210 232" fill="none" />
            <path d="M 180 200 Q 185 195 190 200" fill="none" />
            <path d="M 215 190 Q 205 185 200 192" fill="none" />
            <path d="M 185 160 Q 190 165 195 162" fill="none" />
            <path d="M 212 150 Q 210 145 205 148" fill="none" />
            
            <circle cx="178" cy="210" r="0.5" fill="#91897C" />
            <circle cx="218" cy="170" r="0.5" fill="#91897C" />
            <circle cx="190" cy="180" r="0.5" fill="#91897C" />
          </g>
          
          {/* Arched Wooden Door */}
          <path d="M 188 250 L 188 225 A 12 12 0 0 1 212 225 L 212 250 Z" fill="#451a03" stroke="#290f02" strokeWidth="1" />
          <rect x="188" y="240" width="24" height="2" fill="#290f02" opacity="0.8" />
          <rect x="188" y="228" width="24" height="2" fill="#290f02" opacity="0.8" />
          <line x1="200" y1="213" x2="200" y2="250" stroke="#290f02" strokeWidth="1" />
          
          {/* Simple Windows */}
          <rect x="196" y="175" width="8" height="12" rx="3" fill="#291F18" />
          <rect x="196" y="145" width="8" height="10" rx="3" fill="#291F18" />
          
          {/* Rounded Wooden Roof */}
          <path d="M 182 120 Q 200 80 218 120 Z" fill="url(#roofGrad)" stroke="#5E3F24" strokeWidth="1" />
          <path d="M 185 120 L 215 120 L 200 100 Z" fill="#5E3F24" opacity="0.3" /> {/* Roof shadow */}
        </g>

        {/* WINDMILL BLADES (ROTATING ASSEMBLY) */}
        <g className="blade-assembly">
          {/* Back connector cross */}
          <line x1="200" y1="20" x2="200" y2="220" stroke="#3D2611" strokeWidth="3" />
          <line x1="100" y1="120" x2="300" y2="120" stroke="#3D2611" strokeWidth="3" />
          
          {/* Blade 1 (Top) */}
          <g transform="translate(200, 120)">
            <rect x="-10" y="-90" width="25" height="80" fill="#E6DAC3" stroke="#8A765A" strokeWidth="1" opacity="0.85" />
            <line x1="-10" y1="-80" x2="15" y2="-80" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-70" x2="15" y2="-70" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-60" x2="15" y2="-60" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-50" x2="15" y2="-50" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-40" x2="15" y2="-40" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-30" x2="15" y2="-30" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-20" x2="15" y2="-20" stroke="#8A765A" strokeWidth="1" />
            <line x1="2.5" y1="-90" x2="2.5" y2="-10" stroke="#5E3F24" strokeWidth="2" />
            {/* Very subtle worn out details */}
            <path d="M -10 -75 L -6 -73 L -10 -71" stroke="#8A765A" fill="none" strokeWidth="0.8" opacity="0.7" />
          </g>

          {/* Blade 2 (Bottom) */}
          <g transform="translate(200, 120) rotate(180)">
            <rect x="-10" y="-90" width="25" height="80" fill="#E6DAC3" stroke="#8A765A" strokeWidth="1" opacity="0.85" />
            <line x1="-10" y1="-80" x2="15" y2="-80" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-70" x2="15" y2="-70" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-60" x2="15" y2="-60" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-50" x2="15" y2="-50" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-40" x2="15" y2="-40" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-30" x2="15" y2="-30" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-20" x2="15" y2="-20" stroke="#8A765A" strokeWidth="1" />
            <line x1="2.5" y1="-90" x2="2.5" y2="-10" stroke="#5E3F24" strokeWidth="2" />
            {/* Very subtle worn out details */}
            <path d="M 15 -42 L 12 -40 L 15 -38" stroke="#8A765A" fill="none" strokeWidth="0.8" opacity="0.7" />
          </g>

          {/* Blade 3 (Right) */}
          <g transform="translate(200, 120) rotate(90)">
            <rect x="-10" y="-90" width="25" height="80" fill="#E6DAC3" stroke="#8A765A" strokeWidth="1" opacity="0.85" />
            <line x1="-10" y1="-80" x2="15" y2="-80" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-70" x2="15" y2="-70" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-60" x2="15" y2="-60" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-50" x2="15" y2="-50" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-40" x2="15" y2="-40" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-30" x2="15" y2="-30" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-20" x2="15" y2="-20" stroke="#8A765A" strokeWidth="1" />
            <line x1="2.5" y1="-90" x2="2.5" y2="-10" stroke="#5E3F24" strokeWidth="2" />
            {/* Very subtle worn out details */}
            <path d="M -10 -65 L -6 -63 L -10 -61" stroke="#8A765A" fill="none" strokeWidth="0.8" opacity="0.7" />
          </g>

          {/* Blade 4 (Left) */}
          <g transform="translate(200, 120) rotate(270)">
            <rect x="-10" y="-90" width="25" height="80" fill="#E6DAC3" stroke="#8A765A" strokeWidth="1" opacity="0.85" />
            <line x1="-10" y1="-80" x2="15" y2="-80" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-70" x2="15" y2="-70" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-60" x2="15" y2="-60" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-50" x2="15" y2="-50" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-40" x2="15" y2="-40" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-30" x2="15" y2="-30" stroke="#8A765A" strokeWidth="1" />
            <line x1="-10" y1="-20" x2="15" y2="-20" stroke="#8A765A" strokeWidth="1" />
            <line x1="2.5" y1="-90" x2="2.5" y2="-10" stroke="#5E3F24" strokeWidth="2" />
            {/* Very subtle worn out details */}
            <path d="M 15 -75 L 12 -73 L 15 -71" stroke="#8A765A" fill="none" strokeWidth="0.8" opacity="0.7" />
          </g>

          {/* Central Hub */}
          <circle cx="200" cy="120" r="7" fill="#3D2611" />
          <circle cx="200" cy="120" r="3" fill="#221306" />
        </g>

        {/* LUSH GRASS (SURFACE BASE) */}
        <g className="grass-layer">
          {/* Back mound layer */}
          <path d="M 50 260 Q 200 230 350 260 L 350 290 L 50 290 Z" fill="url(#grassGrad1)" />
          {/* Middle mound layer */}
          <path d="M 40 270 Q 150 245 230 260 T 360 275 L 360 290 L 40 290 Z" fill="url(#grassGrad2)" />
          {/* Front foreground layer */}
          <path d="M 60 280 Q 200 265 330 280 L 330 290 L 60 290 Z" fill="url(#grassGrad3)" opacity="0.9" />
          
          {/* Beautiful sweeping grass stalks */}
          <path d="M 100 275 Q 110 250 125 255 Q 115 260 110 275 Z" fill="#15803d" />
          <path d="M 115 285 Q 120 255 135 260 Q 125 270 122 285 Z" fill="#166534" />
          <path d="M 130 290 Q 135 260 150 265 Q 140 275 137 290 Z" fill="#14532d" />

          <path d="M 270 275 Q 260 250 245 255 Q 255 260 260 275 Z" fill="#15803d" />
          <path d="M 290 285 Q 285 255 270 260 Q 280 270 283 285 Z" fill="#166534" />
          <path d="M 310 290 Q 305 260 290 265 Q 300 275 303 290 Z" fill="#14532d" />
          
          {/* Animated Flowers */}
          <g className="flower-group-1" style={{ transformOrigin: "120px 260px" }}>
            <line x1="120" y1="260" x2="117" y2="252" stroke="#15803d" strokeWidth="1" />
            <circle cx="117" cy="252" r="3" fill="#ef4444" /> {/* Red petals */}
            <circle cx="117" cy="252" r="1.5" fill="#fef08a" /> {/* Center */}
            
            <line x1="140" y1="270" x2="145" y2="262" stroke="#166534" strokeWidth="1" />
            <circle cx="145" cy="262" r="2.5" fill="#a855f7" /> {/* Purple petals */}
            <circle cx="145" cy="262" r="1" fill="#fef08a" />
          </g>

          <g className="flower-group-2" style={{ transformOrigin: "260px 260px" }}>
            <line x1="250" y1="262" x2="253" y2="254" stroke="#15803d" strokeWidth="1" />
            <circle cx="253" cy="254" r="2.5" fill="#3b82f6" /> {/* Blue petals */}
            <circle cx="253" cy="254" r="1" fill="#ffffff" />
            
            <line x1="280" y1="275" x2="277" y2="265" stroke="#166534" strokeWidth="1" />
            <circle cx="277" cy="265" r="3" fill="#eab308" /> {/* Yellow petals */}
            <circle cx="277" cy="265" r="1.5" fill="#78350f" />
          </g>
        </g>

      </svg>
    </div>
  );
}
