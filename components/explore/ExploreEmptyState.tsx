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

      {/* Classic Clean Search Vector Doodle */}
      <div
        style={{
          position: "relative",
          width: "110px",
          height: "110px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          userSelect: "none"
        }}
      >
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ animation: "exploreLensFloat 3.6s ease-in-out infinite" }}
        >
          {/* Ambient Glow */}
          <circle cx="48" cy="46" r="38" fill="#2962D6" fillOpacity="0.08" />

          {/* Sparkles */}
          <path d="M16 28L17.5 24L21 23L17.5 22L16 18L14.5 22L11 23L14.5 24Z" fill="#F59E0B" />
          <path d="M84 22L85.5 19L89 18L85.5 17L84 14L82.5 17L79 18L82.5 19Z" fill="#27C5D8" />
          <path d="M80 72L81.5 69L85 68L81.5 67L80 64L78.5 67L75 68L78.5 69Z" fill="#10B981" />

          {/* Magnifying Glass Lens */}
          <circle
            cx="44"
            cy="42"
            r="23"
            fill="#FFFFFF"
            stroke="var(--theme-ink, #0F172A)"
            strokeWidth="2.4"
          />

          {/* Lens Glass Glare Reflection */}
          <path
            d="M30 33 A 14 14 0 0 1 45 25"
            stroke="#2962D6"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Question Mark inside Magnifying Glass */}
          {/* Question Mark Upper Hook */}
          <path
            d="M38 37 C 38 32, 49 32, 49 38 C 49 42, 44 43, 44 47"
            stroke="var(--theme-ink, #0F172A)"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          {/* Question Mark Dot */}
          <circle cx="44" cy="52" r="1.6" fill="var(--theme-ink, #0F172A)" />

          {/* Magnifying Glass Straight Handle */}
          <line
            x1="61"
            y1="59"
            x2="78"
            y2="76"
            stroke="var(--theme-ink, #0F172A)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Heading & Subtext */}
      <h3
        style={{
          fontSize: "1.25rem",
          fontWeight: "700",
          color: "var(--l-ink, var(--theme-ink, #1F2937))",
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
          color: "var(--theme-n-500, #6B7280)",
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
