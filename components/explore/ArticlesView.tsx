"use client";

import React, { useState, useEffect } from "react";
import ExploreEmptyState from "./ExploreEmptyState";

interface ArticlesViewProps {
  activeData: any;
  isEmbeddedHub: boolean;
  courseSearchQuery?: string;
  setCourseSearchQuery?: (q: string) => void;
}

export default function ArticlesView({
  activeData,
  isEmbeddedHub,
  courseSearchQuery = "",
  setCourseSearchQuery
}: ArticlesViewProps) {
  const [articlesPage, setArticlesPage] = useState(0);
  const [selectedType, setSelectedType] = useState("All Types");
  const [sortBy, setSortBy] = useState<"latest" | "readTime">("latest");
  const CARDS_PER_PAGE = 6;

  // Reset pagination when category or filters change
  useEffect(() => {
    setArticlesPage(0);
  }, [activeData, selectedType, courseSearchQuery, sortBy]);

  const resources = activeData.resources || [];

  // Filter by search query and type
  const query = courseSearchQuery.trim().toLowerCase();
  const filteredResources = resources.filter((doc: any) => {
    const matchesSearch = !query ||
      (doc.title && doc.title.toLowerCase().includes(query)) ||
      (doc.category && doc.category.toLowerCase().includes(query)) ||
      (doc.type && doc.type.toLowerCase().includes(query));

    const matchesType = selectedType === "All Types" ||
      (doc.type && doc.type.toLowerCase().includes(selectedType.toLowerCase().replace(/s$/, "")));

    return matchesSearch && matchesType;
  });

  // Sort resources
  const sortedResources = [...filteredResources].sort((a: any, b: any) => {
    if (sortBy === "readTime") {
      const timeA = parseInt(a.readTime || "0", 10);
      const timeB = parseInt(b.readTime || "0", 10);
      return timeA - timeB;
    }
    return 0;
  });

  const startIndex = articlesPage * CARDS_PER_PAGE;
  const endIndex = Math.min(startIndex + CARDS_PER_PAGE, sortedResources.length);
  const currentCards = sortedResources.slice(startIndex, endIndex);

  const headingTitle = React.useMemo(() => {
    const q = courseSearchQuery.trim();
    if (q) return `Results for "${q}"`;
    if (selectedType !== "All Types") return `${selectedType} Articles`;
    return "Articles & Research";
  }, [courseSearchQuery, selectedType]);

  return (
    <section style={{ marginBottom: "20px" }}>
      {/* Section Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "4px", height: "24px", borderRadius: "2px", background: activeData.colors.primary }} />
          <h2 style={{ fontSize: "1.45rem", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--l-ink)", fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>
            {headingTitle}
          </h2>
        </div>
        {sortedResources.length > 0 && (
          <span style={{ fontSize: "0.82rem", fontWeight: "600", color: "#6B7280" }}>
            {sortedResources.length} {sortedResources.length === 1 ? "article available" : "articles available"}
          </span>
        )}
      </div>

      {/* Uniform Horizontal Filter & Sort Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "28px",
          padding: "10px 16px",
          background: "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "14px",
          border: "1px solid rgba(20, 23, 31, 0.08)",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)"
        }}
      >
        {/* Left: Filter by Resource Type */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.82rem",
              fontWeight: "800",
              color: "#4B5563",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              paddingRight: "4px"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Type:</span>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            {["All Types", "Guides", "Articles", "Research"].map((t) => {
              const isActive = selectedType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedType(t)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    fontWeight: isActive ? "700" : "600",
                    border: isActive ? `1.5px solid ${activeData.colors.primary}` : "1px solid rgba(20, 23, 31, 0.08)",
                    background: isActive ? `${activeData.colors.primary}18` : "#FFFFFF",
                    color: isActive ? activeData.colors.primary : "#4B5563",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Horizontal Sort */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.82rem",
              fontWeight: "800",
              color: "#4B5563",
              textTransform: "uppercase",
              letterSpacing: "0.04em"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Sort:</span>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            {[
              { id: "latest", label: "Latest" },
              { id: "readTime", label: "Shortest Read" }
            ].map((s) => {
              const isActive = sortBy === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSortBy(s.id as any)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    fontWeight: isActive ? "700" : "600",
                    border: isActive ? `1.5px solid ${activeData.colors.primary}` : "1px solid rgba(20, 23, 31, 0.08)",
                    background: isActive ? `${activeData.colors.primary}18` : "#FFFFFF",
                    color: isActive ? activeData.colors.primary : "#4B5563",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {sortedResources.length === 0 ? (
        <ExploreEmptyState
          title={query ? "No matching articles found" : "No articles found"}
          description={
            query
              ? `We couldn't find any articles matching "${courseSearchQuery}". Try checking for spelling errors or searching with broader keywords.`
              : selectedType !== "All Types"
                ? `There are currently no ${selectedType.toLowerCase()} articles in this section. Try selecting "All Types" to view other articles.`
                : "No articles or research documents are currently published in this section."
          }
          actionLabel="Reset Filters"
          onAction={() => {
            if (setCourseSearchQuery) setCourseSearchQuery("");
            setSelectedType("All Types");
          }}
          accentColor={activeData.colors.primary}
        />
      ) : (
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
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                  {doc.category && (
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: "700",
                        color: "#4B5563",
                        background: "rgba(20, 23, 31, 0.05)",
                        border: "1px solid rgba(20, 23, 31, 0.08)",
                        padding: "2px 7px",
                        borderRadius: "6px",
                        letterSpacing: "0.02em",
                        display: "inline-block"
                      }}
                    >
                      {doc.category}
                    </span>
                  )}
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
                      display: "inline-block"
                    }}
                  >
                    {doc.type}
                  </span>
                </div>
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
      )}

      {sortedResources.length > CARDS_PER_PAGE && (
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px", marginTop: "24px" }}>
          <span style={{ fontSize: "0.85rem", color: "#6B7280", fontWeight: "600", fontFamily: "sans-serif" }}>
            {startIndex + 1} - {endIndex} of {sortedResources.length}
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
              onClick={() => setArticlesPage(prev => Math.min(prev + 1, Math.ceil(sortedResources.length / CARDS_PER_PAGE) - 1))}
              disabled={endIndex >= sortedResources.length}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "1px solid #E5E7EB",
                background: endIndex >= sortedResources.length ? "rgba(255, 255, 255, 0.4)" : "#FFFFFF",
                color: endIndex >= sortedResources.length ? "#9CA3AF" : "#1F2937",
                cursor: endIndex >= sortedResources.length ? "not-allowed" : "pointer",
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
