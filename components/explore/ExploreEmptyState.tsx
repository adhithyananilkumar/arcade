"use client";

import React from "react";

interface ExploreEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  accentColor?: string;
}

export default function ExploreEmptyState({
  title = "No results found",
  description = "Try adjusting your search terms or filters to find what you're looking for.",
  actionLabel = "Clear Filters",
  onAction,
  accentColor = "#1a73e8"
}: ExploreEmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "64px 20px 56px",
        margin: "0 auto",
        maxWidth: "520px",
        width: "100%",
        animation: "exploreFadeIn 0.35s ease-out"
      }}
    >
      <style>{`
        @keyframes exploreFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes exploreLensFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(-1.5deg); }
        }
        @keyframes exploreRingPulse {
          0% { transform: scale(0.92); opacity: 0.6; }
          50% { transform: scale(1.08); opacity: 0.2; }
          100% { transform: scale(0.92); opacity: 0.6; }
        }
        @keyframes exploreDotDrift {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

      {/* MNC Googlish Animated Vector Illustration — Open / No Box */}
      <div
        style={{
          position: "relative",
          width: "140px",
          height: "140px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {/* Soft Background Radial Rings */}
        <div
          style={{
            position: "absolute",
            width: "128px",
            height: "128px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(66, 133, 244, 0.08) 0%, rgba(66, 133, 244, 0.02) 65%, transparent 100%)",
            animation: "exploreRingPulse 4s ease-in-out infinite",
            pointerEvents: "none"
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "96px",
            height: "96px",
            borderRadius: "50%",
            border: "1.5px dashed rgba(66, 133, 244, 0.22)",
            animation: "exploreRingPulse 4s ease-in-out infinite reverse",
            pointerEvents: "none"
          }}
        />

        {/* Minimal Google Palette Accent Dots */}
        <div
          style={{
            position: "absolute",
            top: "14px",
            right: "24px",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#4285F4", // Google Blue
            opacity: 0.85,
            animation: "exploreDotDrift 3s ease-in-out infinite"
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "22px",
            left: "20px",
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: "#34A853", // Google Green
            opacity: 0.85,
            animation: "exploreDotDrift 2.6s ease-in-out 0.4s infinite"
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "32px",
            left: "22px",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#FBBC05", // Google Yellow
            opacity: 0.85,
            animation: "exploreDotDrift 3.2s ease-in-out 0.8s infinite"
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "18px",
            right: "26px",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#EA4335", // Google Red
            opacity: 0.85,
            animation: "exploreDotDrift 2.8s ease-in-out 1.2s infinite"
          }}
        />

        {/* Floating Magnifying Glass SVG */}
        <div
          style={{
            position: "relative",
            width: "84px",
            height: "84px",
            animation: "exploreLensFloat 3.5s ease-in-out infinite"
          }}
        >
          <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Search Glass Base Shadow */}
            <ellipse cx="40" cy="40" rx="26" ry="26" fill="url(#lensGradient)" />

            {/* Subtle Internal Reflection Arc */}
            <path
              d="M24 34 A18 18 0 0 1 44 20"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.75"
            />

            {/* Lens Outer Rim */}
            <circle
              cx="40"
              cy="40"
              r="24"
              stroke="#4285F4"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Handle Base & Bar */}
            <path
              d="M58 58 L72 72"
              stroke="#3B82F6"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <path
              d="M57 57 L63 63"
              stroke="#93C5FD"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Center question mark / inquiry dot */}
            <circle cx="40" cy="40" r="3.5" fill="#4285F4" opacity="0.9" />

            <defs>
              <linearGradient id="lensGradient" x1="20" y1="20" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                <stop stopColor="#EBF4FE" stopOpacity="0.95" />
                <stop offset="1" stopColor="#D2E3FC" stopOpacity="0.65" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Heading & Subtext */}
      <h3
        style={{
          fontSize: "1.25rem",
          fontWeight: "700",
          color: "var(--l-ink, #1F2937)",
          fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          letterSpacing: "-0.015em",
          margin: "0 0 8px 0"
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: "0.92rem",
          color: "#6B7280",
          lineHeight: "1.55",
          maxWidth: "420px",
          margin: "0 0 22px 0",
          fontWeight: "400"
        }}
      >
        {description}
      </p>

      {/* Clean MNC Google-style Action Button */}
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: accentColor || "#1a73e8",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "20px",
            padding: "9px 22px",
            fontSize: "0.85rem",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(26, 115, 232, 0.25)",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 3px 12px rgba(26, 115, 232, 0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(26, 115, 232, 0.25)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
