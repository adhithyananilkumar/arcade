import React from "react";
import Link from "next/link";
import { CategoryWatermark } from "@/app/(public)/explore/data";

interface BootcampCardProps {
  title: string;
  desc: string;
  duration: string;
  cat: string;
  colors: { primary: string; secondary: string; };
  index: number;
}

export function BootcampCard({ title, desc, duration, cat, index, colors: _colors }: BootcampCardProps) {
  const cardColorPattern = [
    { primary: "#8B5CF6", secondary: "rgba(139, 92, 246, 0.08)" }, // Purple (CS)
    { primary: "#3B82F6", secondary: "rgba(59, 130, 246, 0.08)" },  // Blue (IT/Maths)
    { primary: "#10B981", secondary: "rgba(16, 185, 129, 0.08)" },  // Green (Pers. Dev)
    { primary: "#F59E0B", secondary: "rgba(245, 158, 11, 0.08)" },  // Amber/Orange (Business)
    { primary: "#14B8A6", secondary: "rgba(20, 184, 166, 0.08)" }   // Teal (Sciences)
  ];
  const cardColors = cardColorPattern[index % cardColorPattern.length];

  const watermarkCat = [
    "Computer Science",
    "Information Technology",
    "Basic Sciences",
    "Business & Management",
    "Personal Development"
  ][index % 5];

  return (
    <div
      style={{
        background: `linear-gradient(135deg, #FFFFFF 60%, ${cardColors.secondary} 100%)`,
        border: "1px solid #E5E7EB",
        borderLeft: `6px solid ${cardColors.primary}`,
        borderRadius: "16px",
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "220px",
        cursor: "default",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <CategoryWatermark category={watermarkCat} color={cardColors.primary} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "14px" }}>
          <span style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: "600" }}>{duration}</span>
        </div>
        <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#000000", marginBottom: "8px" }}>
          {title}
        </h3>
        <p style={{ fontSize: "0.85rem", color: "#4B5563", lineHeight: "1.5", margin: "0 0 16px" }}>
          {desc}
        </p>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", paddingTop: "14px", position: "relative", zIndex: 1 }}>
        <Link
          href="/login"
          className="explore-register-btn"
          style={{
            "--btn-primary": cardColors.primary,
            "--btn-secondary": cardColors.secondary
          } as React.CSSProperties}
        >
          Register
        </Link>
      </div>
    </div>
  );
}
