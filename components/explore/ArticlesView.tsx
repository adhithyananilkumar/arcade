"use client";

import React from "react";
import { ExploreFilters } from "./FilterSidebar";

interface ArticlesViewProps {
  activeData: any;
  isEmbeddedHub: boolean;
  filters?: ExploreFilters;
}

export default function ArticlesView({
  activeData,
  isEmbeddedHub,
  filters
}: ArticlesViewProps) {
  const [articlesPage, setArticlesPage] = React.useState(0);
  const CARDS_PER_PAGE = 6;

  // Reset pagination when category changes
  React.useEffect(() => {
    setArticlesPage(0);
  }, [activeData]);

  let resources = activeData.resources || [];
  if (filters && filters.articleType !== "All") {
    resources = resources.filter((doc: any) => doc.type === filters.articleType);
  }

  const startIndex = articlesPage * CARDS_PER_PAGE;
  const endIndex = Math.min(startIndex + CARDS_PER_PAGE, resources.length);
  const currentCards = resources.slice(startIndex, endIndex);

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
        {currentCards.map((doc: any) => (
          <div
            key={doc.title}
            style={{
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.9)",
              borderRadius: "20px",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              aspectRatio: "4 / 3",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04), inset 0 2px 0 rgba(255,255,255,0.6)"
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
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--l-ink)", margin: "0 0 8px", lineHeight: "1.4", fontFamily: "'Space Grotesk', sans-serif" }}>
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

      {resources.length > CARDS_PER_PAGE && (
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px", marginTop: "24px" }}>
          <span style={{ fontSize: "0.85rem", color: "#6B7280", fontWeight: "600", fontFamily: "sans-serif" }}>
            {startIndex + 1} - {endIndex} of {resources.length}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setArticlesPage(prev => Math.max(prev - 1, 0))}
              disabled={articlesPage === 0}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "1px solid #E5E7EB",
                background: articlesPage === 0 ? "rgba(255, 255, 255, 0.4)" : "#FFFFFF",
                color: articlesPage === 0 ? "#9CA3AF" : "#1F2937",
                cursor: articlesPage === 0 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s"
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={() => setArticlesPage(prev => Math.min(prev + 1, Math.ceil(resources.length / CARDS_PER_PAGE) - 1))}
              disabled={endIndex >= resources.length}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "1px solid #E5E7EB",
                background: endIndex >= resources.length ? "rgba(255, 255, 255, 0.4)" : "#FFFFFF",
                color: endIndex >= resources.length ? "#9CA3AF" : "#1F2937",
                cursor: endIndex >= resources.length ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s"
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
