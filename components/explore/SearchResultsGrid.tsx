"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORY_DATA, WEBINARS_DATA } from "@/app/(public)/explore/data";
import { useRouter } from "next/navigation";
import { CourseCard } from "./CategoryDetailedView";
import { BootcampCard } from "./BootcampCard";
import { WebinarCard } from "./WebinarCard";

interface SearchResultsGridProps {
  searchQuery: string;
  activeTab: "courses" | "live" | "articles";
}

export function SearchResultsGrid({ searchQuery, activeTab }: SearchResultsGridProps) {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const router = useRouter();

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  if (!debouncedQuery.trim()) return null;

  const query = debouncedQuery.toLowerCase();

  let results: any[] = [];

  if (activeTab === "courses") {
    Object.entries(CATEGORY_DATA).forEach(([categoryName, catData]) => {
      catData.courses.forEach(course => {
        if (
          course.title.toLowerCase().includes(query) ||
          course.desc.toLowerCase().includes(query) ||
          categoryName.toLowerCase().includes(query) ||
          course.level.toLowerCase().includes(query)
        ) {
          results.push({ ...course, categoryName, catData, type: "Course" });
        }
      });
    });
  } else if (activeTab === "live") {
    Object.entries(CATEGORY_DATA).forEach(([categoryName, catData]) => {
      catData.bootcamps.forEach(bootcamp => {
        if (
          bootcamp.title.toLowerCase().includes(query) ||
          bootcamp.desc.toLowerCase().includes(query) ||
          categoryName.toLowerCase().includes(query) ||
          bootcamp.type.toLowerCase().includes(query)
        ) {
          results.push({ ...bootcamp, categoryName, catData, type: "Bootcamp" });
        }
      });
    });
    WEBINARS_DATA.forEach(webinar => {
      if (
        webinar.title.toLowerCase().includes(query) ||
        webinar.category.toLowerCase().includes(query) ||
        webinar.host.toLowerCase().includes(query) ||
        webinar.status.toLowerCase().includes(query)
      ) {
        results.push({ ...webinar, categoryName: webinar.category, type: "Webinar" });
      }
    });
  } else if (activeTab === "articles") {
    Object.entries(CATEGORY_DATA).forEach(([categoryName, catData]) => {
      catData.resources.forEach(resource => {
        if (
          resource.title.toLowerCase().includes(query) ||
          categoryName.toLowerCase().includes(query) ||
          resource.type.toLowerCase().includes(query)
        ) {
          results.push({ ...resource, categoryName, catData, type: "Article" });
        }
      });
    });
  }

  const hasResults = results.length > 0;

  return (
    <div style={{ width: "100%" }}>
      {!hasResults ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          style={{ padding: "60px", textAlign: "center", background: "#FFFFFF", borderRadius: "16px", border: "1px solid #E5E7EB" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔍</div>
          <h4 style={{ margin: "0 0 12px", color: "#374151", fontSize: "1.25rem" }}>
            No matching {activeTab === "courses" ? "courses" : activeTab === "live" ? "sessions" : "articles"} found.
          </h4>
          <p style={{ margin: 0, color: "#9CA3AF", fontSize: "1rem" }}>Try a different keyword to find what you are looking for.</p>
        </motion.div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          <AnimatePresence>
            {results.map((result, index) => {
              
              if (result.type === "Course") {
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={result.title + index}
                  >
                    <CourseCard
                      course={result}
                      index={index}
                      activeCategoryName={result.categoryName}
                      activeData={result.catData}
                      router={router}
                      realRating={0.0}
                      realReviewsCount={0}
                    />
                  </motion.div>
                );
              }

              if (result.type === "Bootcamp") {
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={result.title + index}
                  >
                    <BootcampCard
                      title={result.title}
                      desc={result.desc}
                      duration={result.duration}
                      cat={result.categoryName}
                      index={index}
                      colors={result.catData.colors}
                    />
                  </motion.div>
                );
              }

              if (result.type === "Webinar") {
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={result.title + index}
                  >
                    <WebinarCard
                      title={result.title}
                      category={result.categoryName}
                      duration={result.duration}
                      status={result.status}
                      host={result.host}
                      date={result.date}
                      index={index}
                    />
                  </motion.div>
                );
              }

              if (result.type === "Article") {
                const doc = result;
                const activeData = result.catData;
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={doc.title + index}
                  >
                    <div
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
                        boxShadow: "0 4px 12px rgba(20, 23, 31, 0.02)",
                        height: "100%"
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
                  </motion.div>
                );
              }

              return null;
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
