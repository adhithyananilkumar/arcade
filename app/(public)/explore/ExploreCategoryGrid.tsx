"use client";

import React from "react";
import { CATEGORY_DATA, categoriesList, CategoryHeaderIllustration } from "./data";

export function ExploreCategoryGrid({
  activeTab,
  searchQuery,
  currentPage,
  setCurrentPage,
  categoriesPerPage,
  handleCategorySwitch,
  contentRef,
}: {
  activeTab: string;
  searchQuery: string;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  categoriesPerPage: number;
  handleCategorySwitch: (category: string) => void;
  contentRef: React.RefObject<HTMLDivElement | null>;
}) {
  const exploreText = 
    activeTab === "courses" ? "Explore Category" :
    activeTab === "live" ? "Explore Live Sessions" :
    activeTab === "articles" ? "Explore Articles" : "Explore";

  const filtered = categoriesList.filter(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / categoriesPerPage);

  return (
    <div className="tab-content-panel">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
        {filtered
          .slice((currentPage - 1) * categoriesPerPage, currentPage * categoriesPerPage)
          .map((cat) => {
            const data = CATEGORY_DATA[cat];
            return (
              <div
                key={cat}
                onClick={() => handleCategorySwitch(cat)}
                style={{
                  position: "relative",
                  borderRadius: "16px",
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  overflow: "hidden",
                  minHeight: "380px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  // Pass color parameters to static CSS variables for hover effects
                  ["--hover-color" as any]: data.colors.primary,
                  ["--hover-shadow" as any]: `${data.colors.primary}2A`, // with 16% opacity (Hex 2A)
                }}
                className="lp-category-card"
              >
                {/* Top Illustration Header */}
                <div
                  style={{
                    height: "160px",
                    width: "100%",
                    background: "#F8FAFC",
                    borderBottom: "1px solid #F1F5F9",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden"
                  }}
                >
                  <CategoryHeaderIllustration category={cat} variant={activeTab} />
                </div>

                {/* Card Content Section */}
                <div style={{ padding: "24px", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    {/* Title and Pill Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "12px" }}>
                      <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#1F2937", margin: 0, letterSpacing: "-0.01em", lineHeight: "1.3" }}>
                        {cat}
                      </h3>
                    </div>

                    <p style={{ fontSize: "0.85rem", color: "#4B5563", lineHeight: "1.6", margin: "0 0 24px" }}>
                      {data.desc}
                    </p>
                  </div>

                  {/* Card Bottom Row with Explore text and simple arrow */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: "700", color: data.colors.primary }}>
                      {exploreText}
                    </span>
                    <svg
                      className="lp-category-card-arrow"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9CA3AF"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ transition: "all 0.3s ease" }}
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "40px", paddingBottom: "20px" }}>
          <button
            onClick={() => {
              setCurrentPage(p => Math.max(1, p - 1));
              contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            disabled={currentPage === 1}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              background: currentPage === 1 ? "#F9FAFB" : "#FFFFFF",
              color: currentPage === 1 ? "#9CA3AF" : "#1F2937",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "0.9rem",
              transition: "all 0.2s",
              boxShadow: currentPage === 1 ? "none" : "0 2px 4px rgba(0,0,0,0.02)"
            }}
          >
            Previous
          </button>
          
          <div style={{ display: "flex", gap: "8px" }}>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => {
                    setCurrentPage(pageNum);
                    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  style={{
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    border: currentPage === pageNum ? "2px solid #2563EB" : "1px solid #E5E7EB",
                    background: currentPage === pageNum ? "#EFF6FF" : "#FFFFFF",
                    color: currentPage === pageNum ? "#1D4ED8" : "#4B5563",
                    fontWeight: "700",
                    fontSize: "0.9rem",
                    cursor: currentPage === pageNum ? "default" : "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => {
              setCurrentPage(p => Math.min(totalPages, p - -1));
              contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              background: currentPage === totalPages ? "#F9FAFB" : "#FFFFFF",
              color: currentPage === totalPages ? "#9CA3AF" : "#1F2937",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "0.9rem",
              transition: "all 0.2s",
              boxShadow: currentPage === totalPages ? "none" : "0 2px 4px rgba(0,0,0,0.02)"
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
