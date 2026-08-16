"use client";

import React from "react";

export interface ChevronCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  accentColor?: string;
  className?: string;
}

/**
 * ChevronCard Component — Infographic Chevron Arrow Process Card
 * Custom polygon shape with left slim chevron accent ribbon & right chevron tip.
 */
export function ChevronCard({
  children,
  accentColor = "#ff6b4a",
  className = "",
  ...props
}: ChevronCardProps) {
  return (
    <div
      className={`group relative filter drop-shadow-[0_8px_20px_rgba(20,20,43,0.08)] transition-all duration-300 hover:-translate-y-1 hover:drop-shadow-[0_16px_32px_rgba(20,20,43,0.14)] ${className}`}
      {...props}
    >
      {/* Outer Chevron Card Container */}
      <div
        className="relative w-full border border-slate-200/80 bg-white"
        style={{
          clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)",
        }}
      >
        {/* Left Slim Chevron Accent Ribbon Stripe */}
        <div
          className="absolute top-0 bottom-0 left-0 w-3.5"
          style={{
            clipPath: "polygon(0 0, 100% 0, calc(100% + 12px) 50%, 100% 100%, 0 100%, 12px 50%)",
            backgroundColor: accentColor,
          }}
        />

        {/* Padded Content Area */}
        <div className="relative z-10 flex flex-col p-5 pl-7 pr-7">
          {children}
        </div>
      </div>
    </div>
  );
}
