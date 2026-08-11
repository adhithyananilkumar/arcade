"use client";

import React from "react";

interface ArticlesViewProps {
  activeData: any;
  isEmbeddedHub: boolean;
}

export default function ArticlesView({
  activeData,
  isEmbeddedHub
}: ArticlesViewProps) {
  return (
    <section style={{ marginBottom: isEmbeddedHub ? "36px" : "56px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "4px", height: "24px", borderRadius: "2px", background: activeData.colors.primary }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--l-ink)", fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>
            Articles & Research
          </h2>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
        {activeData.resources.map((doc: any) => (
          <div
            key={doc.title}
            style={{
              background: "rgba(255, 255, 255, 0.65)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(20, 23, 31, 0.06)",
              borderRadius: "16px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "140px",
              boxShadow: "0 4px 12px rgba(20, 23, 31, 0.02)"
            }}
            className="hover-card-y"
          >
            <div>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: "800",
                  color: activeData.colors.primary,
                  background: activeData.colors.secondary,
                  padding: "3px 8px",
                  borderRadius: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                  display: "inline-block",
                  marginBottom: "12px"
                }}
              >
                {doc.type}
              </span>
              <h3 style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--l-ink)", margin: "0 0 8px", lineHeight: "1.4", fontFamily: "'Space Grotesk', sans-serif" }}>
                {doc.title}
              </h3>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(20, 23, 31, 0.06)", paddingTop: "12px" }}>
              <span style={{ fontSize: "0.75rem", color: "rgba(20, 20, 43, 0.45)", fontWeight: "600" }}>{doc.readTime}</span>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: "800",
                  color: activeData.colors.primary,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                Read Guide
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
