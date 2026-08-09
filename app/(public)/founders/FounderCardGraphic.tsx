"use client";

import React from "react";
import Image from "next/image";

interface FounderCardGraphicProps {
  imageSrc: string;
  name: string;
  index?: number;
}

export default function FounderCardGraphic({
  imageSrc,
  name,
}: FounderCardGraphicProps) {
  return (
    <div className="relative w-full h-56 sm:h-64 flex items-center justify-center my-2 group cursor-pointer select-none">
      {/* Subtle Soft Purple Glow behind portrait (Matching Reference) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-40 h-40 sm:w-48 sm:h-48 bg-purple-400/20 rounded-full blur-2xl group-hover:bg-purple-500/35 group-hover:scale-110 transition-all duration-500" />
      </div>

      {/* Clean B&W Studio Cutout Portrait without Background */}
      <div className="relative w-full h-full flex items-end justify-center z-10">
        <div className="relative w-full h-full">
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-contain object-bottom filter grayscale contrast-125 brightness-105 transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_12px_20px_rgba(124,58,237,0.18)]"
            priority
          />
        </div>
      </div>
    </div>
  );
}
