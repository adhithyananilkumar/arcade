import React from "react";
import Link from "next/link";
import { WebinarCardHeader } from "@/app/(public)/explore/page";

interface WebinarCardProps {
  title: string;
  category: string;
  duration: string;
  status: string;
  host: string;
  date: string;
  index: number;
}

export function WebinarCard({ title, category, duration, status, host, date, index }: WebinarCardProps) {
  const isLive = status === "Live Today";
  const isUpcoming = status === "Upcoming";
  const ctaBg = isLive ? "#EF4444" : (isUpcoming ? "#F59E0B" : "#0A1931");
  const ctaHoverBg = isLive ? "#DC2626" : (isUpcoming ? "#D97706" : "#15305B");
  const ctaShadow = `0 4px 14px ${isLive ? "#EF4444" : (isUpcoming ? "#F59E0B" : "#0A1931")}30`;

  const statusColor = isLive ? "#EF4444" : (isUpcoming ? "#D97706" : "#0A1931");
  const titleColor = isLive ? "#991B1B" : (isUpcoming ? "#92400E" : "#1E3E62");

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: "20px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.05)"
      }}
      className="lp-webinar-card"
    >
      {/* Custom Topic Themed Header Graphic */}
      <WebinarCardHeader title={title} status={status} duration={duration} category={category} />

      {/* Card Content Body */}
      <div style={{ padding: "20px", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          {/* Upper category and status row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: "800", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {category} • {duration.toUpperCase()}
            </span>
          </div>

          {/* Webinar Title */}
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: "800",
              color: titleColor,
              marginBottom: "16px",
              lineHeight: "1.4",
              minHeight: "56px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              letterSpacing: "-0.01em"
            }}
          >
            {title}
          </h3>

          {/* Host Details */}
          <div style={{ fontSize: "0.82rem", color: "#6B7280", display: "flex", alignItems: "center", marginBottom: "20px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Hosted by <strong style={{ color: "#374151", fontWeight: "700" }}>{host}</strong></span>
          </div>
        </div>

        {/* Calendar timeline and Button row */}
        <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "16px", marginTop: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", color: statusColor }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span style={{ fontSize: "0.8rem", fontWeight: "700" }}>
                {date}
              </span>
            </div>

            <Link
              href="/login"
              className="lp-webinar-btn"
              style={{
                "--cta-bg": ctaBg,
                "--cta-shadow": ctaShadow
              } as React.CSSProperties}
            >
              {isLive ? "Join Broadcast" : (isUpcoming ? "Save Seat" : "Watch Video")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
