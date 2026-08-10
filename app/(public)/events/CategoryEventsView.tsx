"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Copied from ExploreHub dummy data
const WEBINARS_DATA = [
  { title: "Scaling React & Next.js App Router Performance", category: "Computer Science", host: "Next.js Core Team", date: "Friday, 10:00 AM", status: "Upcoming", duration: "90 mins" },
  { title: "Building Secure & Resilient APIs", category: "Information Technology", host: "Security DevOps Lead", date: "Thursday, 2:00 PM", status: "Upcoming", duration: "75 mins" },
  { title: "Cloud Computing & Serverless AWS Architectures", category: "Information Technology", host: "AWS Solution Architect", date: "Recorded", status: "Recorded Video", duration: "120 mins" },
  { title: "Strategic Product Management Sprints", category: "Business & Management", host: "VP of Product", date: "Recorded", status: "Recorded Video", duration: "45 mins" },
  { title: "Structural Analysis & Materials Mechanics", category: "Civil & Mechanical", host: "Senior Civil Engineer", date: "Recorded", status: "Recorded Video", duration: "80 mins" }
];

export function WebinarCardHeader({ title, status, duration, category }: any) {
  const isLive = status === "Live Today";
  const isUpcoming = status === "Upcoming";

  const getBgTheme = () => {
    switch(category) {
      case "Computer Science": return "linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)";
      case "Information Technology": return "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)";
      case "Business & Management": return "linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)";
      case "Civil & Mechanical": return "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)";
      default: return "linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)";
    }
  };

  const getAccentColor = () => {
    switch(category) {
      case "Computer Science": return "#4F46E5";
      case "Information Technology": return "#2563EB";
      case "Business & Management": return "#EA580C";
      case "Civil & Mechanical": return "#059669";
      default: return "#4B5563";
    }
  };

  return (
    <div style={{ height: "140px", background: getBgTheme(), position: "relative", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ position: "absolute", top: "-50px", right: "-50px", opacity: 0.1, color: getAccentColor() }}>
        <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="10 10" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M50 100 L150 100 M100 50 L100 150" stroke="currentColor" strokeWidth="2" />
      </svg>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
        <div style={{ display: "inline-block", padding: "4px 10px", background: "#FFFFFF", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "800", color: getAccentColor(), boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          {category}
        </div>
        <div style={{ display: "inline-block", padding: "4px 8px", background: isLive ? "#EF4444" : (isUpcoming ? "#F59E0B" : "#6B7280"), borderRadius: "6px", fontSize: "0.7rem", fontWeight: "700", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {status}
        </div>
      </div>
    </div>
  );
}

export function CategoryEventsView({ category }: { category: string }) {
  const router = useRouter();
  
  // Filter webinars by category, and fallback to all if none exactly match (just for demo purposes)
  let categoryWebinars = WEBINARS_DATA.filter(w => w.category.toLowerCase() === category.toLowerCase());
  
  // If no matching webinars for this dummy category, we just use a fallback copy so it doesn't look empty for the client.
  if (categoryWebinars.length === 0) {
    categoryWebinars = WEBINARS_DATA.map(w => ({ ...w, category: category }));
  }

  return (
    <div className="min-h-screen" style={{ background: "#F9FAFB", padding: "40px 20px" }}>
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => router.back()} 
          style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", color: "#4B5563", fontWeight: "600", cursor: "pointer", background: "none", border: "none" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Explore
        </button>

        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#111827", marginBottom: "8px" }}>
          {category} Events
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#6B7280", marginBottom: "40px" }}>
          Live learning, bootcamps, and webinars for {category}.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {categoryWebinars.map((w, i) => {
            const isLive = w.status === "Live Today";
            const isUpcoming = w.status === "Upcoming";
            const ctaBg = isLive ? "#EF4444" : (isUpcoming ? "#F59E0B" : "#0A1931");
            const ctaColor = "#FFFFFF";
            const ctaHoverBg = isLive ? "#DC2626" : (isUpcoming ? "#D97706" : "#15305B");
            const ctaShadow = `0 4px 14px ${isLive ? "#EF4444" : (isUpcoming ? "#F59E0B" : "#0A1931")}30`;
            const statusColor = isLive ? "#EF4444" : (isUpcoming ? "#D97706" : "#0A1931");
            const titleColor = isLive ? "#991B1B" : (isUpcoming ? "#92400E" : "#1E3E62");

            return (
              <div
                key={i}
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
              >
                <WebinarCardHeader title={w.title} status={w.status} duration={w.duration} category={w.category} />

                <div style={{ padding: "20px", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: "800", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {w.category} • {w.duration.toUpperCase()}
                      </span>
                    </div>

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
                      {w.title}
                    </h3>

                    <div style={{ fontSize: "0.82rem", color: "#6B7280", display: "flex", alignItems: "center", marginBottom: "20px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>Hosted by <strong style={{ color: "#374151", fontWeight: "700" }}>{w.host}</strong></span>
                    </div>
                  </div>

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
                          {w.date}
                        </span>
                      </div>
                      <Link
                        href="/sign"
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          background: ctaBg,
                          color: ctaColor,
                          fontSize: "0.82rem",
                          fontWeight: "700",
                          textDecoration: "none",
                          boxShadow: ctaShadow,
                          transition: "all 0.3s"
                        }}
                      >
                        {isLive ? "Join Now" : (isUpcoming ? "Register" : "Watch")}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
