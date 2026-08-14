import React from "react";
import { categoriesList } from "@/app/(public)/explore/page";

export type ExploreFilters = {
  courseLevel: string;
  courseDuration: string;
  coursePrice: string;
  courseAuthor: string;
  eventStatus: string;
  articleType: string;
};

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "courses" | "events" | "articles";
  activeData: any;
  activeCategoryName: string;
  handleCategorySwitch: (category: string) => void;
  filters: ExploreFilters;
  setFilters: React.Dispatch<React.SetStateAction<ExploreFilters>>;
}

export default function FilterSidebar({
  isOpen,
  onClose,
  mode,
  activeData,
  activeCategoryName,
  handleCategorySwitch,
  filters,
  setFilters,
}: FilterSidebarProps) {
  if (!isOpen) return null;

  const updateFilter = (key: keyof ExploreFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setFilters({
      courseLevel: "All Levels",
      courseDuration: "All",
      coursePrice: "All",
      courseAuthor: "All",
      eventStatus: "All",
      articleType: "All",
    });
  };

  const selectStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(20, 23, 31, 0.1)",
    background: "#F9FAFB",
    color: "var(--l-ink)",
    fontSize: "0.95rem",
    fontWeight: "700",
    outline: "none",
    cursor: "pointer",
    appearance: "none" as any,
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
    transition: "all 0.2s",
  };

  const labelStyle = {
    fontSize: "0.85rem",
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase" as any,
    letterSpacing: "0.05em",
    marginBottom: "4px",
    display: "block",
  };

  const renderDropdown = (
    label: string,
    value: string,
    options: string[],
    onChange: (val: string) => void
  ) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={selectStyle}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div
          style={{
            position: "absolute",
            right: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: "#6B7280",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "300px",
          maxWidth: "85vw",
          background: "#FFFFFF",
          zIndex: 9999,
          boxShadow: "4px 0 24px rgba(0,0,0,0.1)",
          padding: "32px 24px",
          overflowY: "auto",
          transition: "transform 0.3s ease",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--l-ink)", margin: 0 }}>Filters</h3>
          <button
            onClick={onClose}
            style={{
              background: "rgba(20, 23, 31, 0.04)",
              border: "none",
              cursor: "pointer",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--l-ink)",
              transition: "background 0.2s",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Global Category Filter */}
          {renderDropdown("Category", activeCategoryName, categoriesList, handleCategorySwitch)}

          {/* Mode-specific Filters */}
          {mode === "courses" && (
            <>
              {renderDropdown("Course Level", filters.courseLevel, ["All Levels", "Beginner", "Intermediate", "Advanced"], (val) => updateFilter("courseLevel", val))}
              {renderDropdown("Duration", filters.courseDuration, ["All", "Short (1-4 Weeks)", "Medium (5-8 Weeks)", "Long (9+ Weeks)"], (val) => updateFilter("courseDuration", val))}
              {renderDropdown("Pricing", filters.coursePrice, ["All", "Free", "Paid"], (val) => updateFilter("coursePrice", val))}
              {renderDropdown("Author Name", filters.courseAuthor, ["All", "John Doe", "Jane Smith", "Alex Johnson"], (val) => updateFilter("courseAuthor", val))}
            </>
          )}

          {mode === "events" && (
            <>
              {renderDropdown("Event Status", filters.eventStatus, ["All", "Upcoming", "Live Today", "Recorded Video"], (val) => updateFilter("eventStatus", val))}
            </>
          )}

          {mode === "articles" && (
            <>
              {renderDropdown("Resource Type", filters.articleType, ["All", "Article", "Guide", "Docs"], (val) => updateFilter("articleType", val))}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: "40px", display: "flex", gap: "12px" }}>
          <button
            onClick={handleClear}
            style={{
              flex: 1,
              padding: "14px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(20, 23, 31, 0.1)",
              background: "#FFFFFF",
              color: "var(--l-ink)",
              fontSize: "0.95rem",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#F9FAFB"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#FFFFFF"}
          >
            Clear
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "14px 16px",
              borderRadius: "12px",
              border: "none",
              background: "var(--l-ink)",
              color: "#FFFFFF",
              fontSize: "0.95rem",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            Search
          </button>
        </div>
      </div>

      {/* Overlay to close sidebar when clicking outside */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(20, 23, 31, 0.3)",
          backdropFilter: "blur(2px)",
          zIndex: 9998,
          transition: "opacity 0.3s ease",
        }}
      />
    </>
  );
}
