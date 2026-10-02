"use client";

import React, { useState, useDeferredValue, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ExamHubCardView,
  getAvailableHubExams,
  getPublicExams,
} from "@/domains/assessments";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import { examRoutes } from "@/shared/routes/content.routes";
import ExploreEmptyState from "./ExploreEmptyState";
import { ContentCardsGridSkeleton } from "./ContentCardsGridSkeleton";

export default function ExamsView({
  searchQuery,
  onClearSearch,
  categoryId,
  unmatchedCategory = false,
  activeCategoryName = "All",
  activeColor = "#2563EB",
}: {
  searchQuery: string;
  onClearSearch: () => void;
  /** Narrows to one Explore category; omitted for every category. */
  categoryId?: string;
  /** The selected category exists only as a built-in department, so no exam can be in it. */
  unmatchedCategory?: boolean;
  activeCategoryName?: string;
  activeColor?: string;
}) {
  const router = useRouter();
  const signedIn = Boolean(useAuthStore((s) => s.user));
  const q = useDeferredValue(searchQuery.trim());

  const [selectedType, setSelectedType] = useState<"all" | "certifications" | "exams">("all");
  const [sortBy, setSortBy] = useState<"popular" | "duration">("popular");

  const exams = useQuery({
    queryKey: ["exams", "catalogue", signedIn ? "learner" : "public", q, categoryId ?? "all"],
    queryFn: () => (signedIn ? getAvailableHubExams(q, categoryId) : getPublicExams(q, categoryId)),
    enabled: !unmatchedCategory,
  });

  const cards = useMemo(() => exams.data ?? [], [exams.data]);

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (selectedType === "certifications") return card.certification === true;
      if (selectedType === "exams") return card.certification !== true;
      return true;
    });
  }, [cards, selectedType]);

  const sortedCards = useMemo(() => {
    const copy = [...filteredCards];
    if (sortBy === "duration") {
      return copy.sort((a, b) => {
        const durA = a.plans.reduce((m, p) => Math.max(m, p.durationMinutes), 0);
        const durB = b.plans.reduce((m, p) => Math.max(m, p.durationMinutes), 0);
        return durA - durB;
      });
    }
    return copy;
  }, [filteredCards, sortBy]);

  const headingTitle = useMemo(() => {
    if (q) return `Results for "${q}"`;
    const isAll = !activeCategoryName || activeCategoryName.toLowerCase() === "all";
    if (!isAll) {
      if (selectedType === "certifications") return `${activeCategoryName} Certifications`;
      if (selectedType === "exams") return `${activeCategoryName} Exams`;
      return `${activeCategoryName} Exams & Certifications`;
    }
    if (selectedType === "certifications") return "Professional Certifications";
    if (selectedType === "exams") return "Assessment Exams";
    return "Exams & Certifications";
  }, [q, activeCategoryName, selectedType]);

  if (unmatchedCategory) {
    return (
      <section style={{ marginBottom: "20px" }}>
        <ExploreEmptyState
          title="No exams in this category yet"
          description="Exams appear here once creators publish them under this category."
          accentColor={activeColor}
        />
      </section>
    );
  }

  return (
    <section style={{ marginBottom: "20px" }}>
      {/* Section Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "4px", height: "24px", borderRadius: "2px", background: activeColor }} />
          <h2 style={{ fontSize: "1.45rem", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--l-ink)", fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>
            {headingTitle}
          </h2>
        </div>
        {!exams.isLoading && sortedCards.length > 0 && (
          <span style={{ fontSize: "0.82rem", fontWeight: "600", color: "#6B7280" }}>
            {sortedCards.length} {sortedCards.length === 1 ? "exam available" : "exams available"}
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
        {/* Left: Filter by Exam Type */}
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
            {[
              { id: "all", label: "All Exams" },
              { id: "certifications", label: "Certifications" },
              { id: "exams", label: "Standard Exams" }
            ].map((t) => {
              const isActive = selectedType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedType(t.id as any)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    fontWeight: isActive ? "700" : "600",
                    border: isActive ? `1.5px solid ${activeColor}` : "1px solid rgba(20, 23, 31, 0.08)",
                    background: isActive ? `${activeColor}18` : "#FFFFFF",
                    color: isActive ? activeColor : "#4B5563",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {t.label}
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
              { id: "popular", label: "Popular" },
              { id: "duration", label: "Duration" }
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
                    border: isActive ? `1.5px solid ${activeColor}` : "1px solid rgba(20, 23, 31, 0.08)",
                    background: isActive ? `${activeColor}18` : "#FFFFFF",
                    color: isActive ? activeColor : "#4B5563",
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

      {exams.isLoading ? (
        <ContentCardsGridSkeleton count={6} />
      ) : exams.isError ? (
        <ExploreEmptyState
          title="Exams could not be loaded"
          description="Something went wrong while fetching the exam catalogue."
          actionLabel="Try again"
          onAction={() => exams.refetch()}
          accentColor={activeColor}
        />
      ) : sortedCards.length === 0 ? (
        <ExploreEmptyState
          title={q ? "No matching exams" : categoryId ? "No exams in this category yet" : "No exams published yet"}
          description={
            q
              ? `No exams matched "${q}". Try a different search term.`
              : "Certifications and standalone exams appear here once creators publish them."
          }
          actionLabel={q ? "Clear search" : undefined}
          onAction={q ? onClearSearch : undefined}
          accentColor={activeColor}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedCards.map((card, idx) => (
            <ExamHubCardView
              key={card.examId}
              card={card}
              index={idx}
              onOpen={() => router.push(examRoutes.landing(card.examId))}
            />
          ))}
        </div>
      )}
    </section>
  );
}
