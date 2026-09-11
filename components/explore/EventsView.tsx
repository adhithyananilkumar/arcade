"use client";

import React from "react";

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
    switch (category) {
      case "Computer Science": return "linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)";
      case "Information Technology": return "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)";
      case "Business & Management": return "linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)";
      case "Civil & Mechanical": return "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)";
      default: return "linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)";
    }
  };

  const getAccentColor = () => {
    switch (category) {
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

export function ActionButton({ ctaBg, ctaColor, ctaShadow }: any) {
  return (
    <div
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: ctaBg,
        color: ctaColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: ctaShadow,
        cursor: "pointer",
        transition: "all 0.2s ease",
        marginRight: "9px"
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </div>
  );
}

interface EventsViewProps {
  activeData: any;
  activeCategoryName: string;
  isEmbeddedHub: boolean;
  courseSearchQuery?: string;
  setCourseSearchQuery?: (q: string) => void;
}

export default function EventsView({
  activeData,
  activeCategoryName,
  isEmbeddedHub,
  courseSearchQuery = "",
  setCourseSearchQuery
}: EventsViewProps) {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [webinarsPage, setWebinarsPage] = React.useState(0);
  const [eventType, setEventType] = React.useState<"all" | "bootcamps" | "webinars">("all");
  const [sortBy, setSortBy] = React.useState<"upcoming" | "duration">("upcoming");

  React.useEffect(() => {
    setCurrentPage(0);
    setWebinarsPage(0);
  }, [activeCategoryName, eventType, courseSearchQuery]);

  const isAllCategory = activeCategoryName.toLowerCase() === "all";

  let categoryWebinars = isAllCategory
    ? WEBINARS_DATA
    : WEBINARS_DATA.filter(w => w.category.toLowerCase() === activeCategoryName.toLowerCase());
  if (categoryWebinars.length === 0) {
    categoryWebinars = WEBINARS_DATA.map(w => ({ ...w, category: activeCategoryName }));
  }

  const allBootcamps = isAllCategory
    ? activeData.bootcamps
    : [
        ...activeData.bootcamps,
        {
          title: `${activeCategoryName} Advanced Masterclass Bootcamp`,
          duration: "10 Weeks",
          type: "Bootcamp",
          date: "Starts next Monday",
          desc: "Deep dive into industry-level practices, live coding labs, and professional certification prep."
        },
        {
          title: `${activeCategoryName} Career Acceleration Program`,
          duration: "14 Weeks",
          type: "Bootcamp",
          date: "Open for Admission",
          desc: "Guaranteed project portfolio building, mock technical interviews, and resume mentorship sessions."
        }
      ];

  // Search filtering
  const query = courseSearchQuery.trim().toLowerCase();
  let filteredBootcamps = allBootcamps.filter((b: any) => {
    if (!query) return true;
    return (
      (b.title && b.title.toLowerCase().includes(query)) ||
      (b.desc && b.desc.toLowerCase().includes(query)) ||
      (b.category && b.category.toLowerCase().includes(query))
    );
  });

  let filteredWebinars = categoryWebinars.filter((w: any) => {
    if (!query) return true;
    return (
      (w.title && w.title.toLowerCase().includes(query)) ||
      (w.host && w.host.toLowerCase().includes(query)) ||
      (w.category && w.category.toLowerCase().includes(query))
    );
  });

  // Sorting
  if (sortBy === "duration") {
    filteredBootcamps = [...filteredBootcamps].sort((a, b) => (a.duration || "").localeCompare(b.duration || ""));
    filteredWebinars = [...filteredWebinars].sort((a, b) => (a.duration || "").localeCompare(b.duration || ""));
  }

  const showBootcamps = eventType === "all" || eventType === "bootcamps";
  const showWebinars = eventType === "all" || eventType === "webinars";
  const totalCount = (showBootcamps ? filteredBootcamps.length : 0) + (showWebinars ? filteredWebinars.length : 0);
  const totalAvailable = (showBootcamps ? allBootcamps.length : 0) + (showWebinars ? categoryWebinars.length : 0);

  const renderBootcampsSection = (title: string = "Practical Bootcamps") => {
    const CARDS_PER_PAGE = 3;
    const startIndex = currentPage * CARDS_PER_PAGE;
    const endIndex = Math.min(startIndex + CARDS_PER_PAGE, filteredBootcamps.length);
    const visibleBootcamps = filteredBootcamps.slice(startIndex, endIndex);

    if (visibleBootcamps.length === 0) return null;

    return (
      <div style={{ marginBottom: isEmbeddedHub ? "32px" : "48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "3px", height: "18px", borderRadius: "2px", background: activeData.colors.primary }} />
            <h3 style={{ fontSize: "1.2rem", fontWeight: "800", letterSpacing: "-0.01em", color: "var(--l-ink)", margin: 0 }}>
              {title}
            </h3>
          </div>
          <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#6B7280" }}>
            {filteredBootcamps.length} bootcamps
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {visibleBootcamps.map((bootcamp: any, i: number) => {
            const itemCat = bootcamp.category || activeCategoryName;
            const ctaBg = activeData.colors.primary;
            const ctaColor = "#FFFFFF";
            const ctaShadow = `0 4px 14px ${activeData.colors.primary}30`;

            return (
              <div
                key={i}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(20, 23, 31, 0.08)",
                  borderRadius: "20px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 8px 24px -6px rgba(0, 0, 0, 0.04)"
                }}
                className="hover-card-y"
              >
                <WebinarCardHeader title={bootcamp.title} status={bootcamp.type} duration={bootcamp.duration} category={itemCat} />

                <div style={{ padding: "20px", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: "800", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {itemCat} • {bootcamp.duration.toUpperCase()}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "800",
                        color: "#1E3E62",
                        marginBottom: "12px",
                        lineHeight: "1.4",
                        letterSpacing: "-0.01em"
                      }}
                    >
                      {bootcamp.title}
                    </h3>

                    <p style={{ fontSize: "0.86rem", color: "#6B7280", lineHeight: "1.55", marginBottom: "20px" }}>
                      {bootcamp.desc}
                    </p>
                  </div>

                  <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "16px", marginTop: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", color: activeData.colors.primary }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span style={{ fontSize: "0.8rem", fontWeight: "700" }}>
                          {bootcamp.date}
                        </span>
                      </div>
                      <ActionButton ctaBg={ctaBg} ctaColor={ctaColor} ctaShadow={ctaShadow} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredBootcamps.length > CARDS_PER_PAGE && (
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px", marginTop: "24px" }}>
            <span style={{ fontSize: "0.85rem", color: "#6B7280", fontWeight: "600" }}>
              {startIndex + 1} - {endIndex} of {filteredBootcamps.length}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: "1px solid #E5E7EB",
                  background: currentPage === 0 ? "#F3F4F6" : "#FFFFFF",
                  color: currentPage === 0 ? "#9CA3AF" : "#1F2937",
                  cursor: currentPage === 0 ? "not-allowed" : "pointer",
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
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredBootcamps.length / CARDS_PER_PAGE) - 1))}
                disabled={endIndex >= filteredBootcamps.length}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: "1px solid #E5E7EB",
                  background: endIndex >= filteredBootcamps.length ? "#F3F4F6" : "#FFFFFF",
                  color: endIndex >= filteredBootcamps.length ? "#9CA3AF" : "#1F2937",
                  cursor: endIndex >= filteredBootcamps.length ? "not-allowed" : "pointer",
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
      </div>
    );
  };

  const renderLiveSessionsSection = (title: string = "Live Sessions & Webinars") => {
    const CARDS_PER_PAGE = 3;
    const startIndex = webinarsPage * CARDS_PER_PAGE;
    const endIndex = Math.min(startIndex + CARDS_PER_PAGE, filteredWebinars.length);
    const visibleWebinars = filteredWebinars.slice(startIndex, endIndex);

    if (visibleWebinars.length === 0) return null;

    return (
      <div style={{ marginBottom: isEmbeddedHub ? "32px" : "48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "3px", height: "18px", borderRadius: "2px", background: activeData.colors.primary }} />
            <h3 style={{ fontSize: "1.2rem", fontWeight: "800", letterSpacing: "-0.01em", color: "var(--l-ink)", margin: 0 }}>
              {title}
            </h3>
          </div>
          <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#6B7280" }}>
            {filteredWebinars.length} webinars
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {visibleWebinars.map((w, i) => {
            const isLive = w.status === "Live Today";
            const isUpcoming = w.status === "Upcoming";
            const ctaBg = isLive ? "#EF4444" : (isUpcoming ? "#F59E0B" : "#0A1931");
            const ctaColor = "#FFFFFF";
            const ctaShadow = `0 4px 14px ${isLive ? "#EF4444" : (isUpcoming ? "#F59E0B" : "#0A1931")}30`;
            const statusColor = isLive ? "#EF4444" : (isUpcoming ? "#D97706" : "#0A1931");
            const titleColor = isLive ? "#991B1B" : (isUpcoming ? "#92400E" : "#1E3E62");

            return (
              <div
                key={i}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(20, 23, 31, 0.08)",
                  borderRadius: "20px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 8px 24px -6px rgba(0, 0, 0, 0.04)"
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
                      <ActionButton ctaBg={ctaBg} ctaColor={ctaColor} ctaShadow={ctaShadow} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredWebinars.length > CARDS_PER_PAGE && (
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px", marginTop: "24px" }}>
            <span style={{ fontSize: "0.85rem", color: "#6B7280", fontWeight: "600" }}>
              {startIndex + 1} - {endIndex} of {filteredWebinars.length}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setWebinarsPage(prev => Math.max(prev - 1, 0))}
                disabled={webinarsPage === 0}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: "1px solid #E5E7EB",
                  background: webinarsPage === 0 ? "#F3F4F6" : "#FFFFFF",
                  color: webinarsPage === 0 ? "#9CA3AF" : "#1F2937",
                  cursor: webinarsPage === 0 ? "not-allowed" : "pointer",
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
                onClick={() => setWebinarsPage(prev => Math.min(prev + 1, Math.ceil(filteredWebinars.length / CARDS_PER_PAGE) - 1))}
                disabled={endIndex >= filteredWebinars.length}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: "1px solid #E5E7EB",
                  background: endIndex >= filteredWebinars.length ? "#F3F4F6" : "#FFFFFF",
                  color: endIndex >= filteredWebinars.length ? "#9CA3AF" : "#1F2937",
                  cursor: endIndex >= filteredWebinars.length ? "not-allowed" : "pointer",
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
      </div>
    );
  };

  return (
    <section style={{ marginBottom: isEmbeddedHub ? "36px" : "56px" }}>
      {/* Section Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "4px", height: "24px", borderRadius: "2px", background: activeData.colors.primary }} />
          <h2 style={{ fontSize: "1.45rem", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--l-ink)", fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>
            Events & Bootcamps
          </h2>
        </div>
        <span style={{ fontSize: "0.84rem", fontWeight: "700", color: activeData.colors.primary, background: `${activeData.colors.primary}12`, padding: "4px 12px", borderRadius: "20px" }}>
          Showing {totalCount} of {totalAvailable} events
        </span>
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
        {/* Left: Filter by Event Type */}
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
              { id: "all", label: "All Events" },
              { id: "bootcamps", label: "Bootcamps" },
              { id: "webinars", label: "Live Webinars" }
            ].map((t) => {
              const isActive = eventType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEventType(t.id as any)}
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
              { id: "upcoming", label: "Upcoming" },
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

      {totalCount === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "36px 20px",
            background: "rgba(255, 255, 255, 0.65)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: "16px",
            border: "1px dashed rgba(20, 23, 31, 0.15)",
            maxWidth: "460px",
            margin: "24px auto"
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: `${activeData.colors.primary}12`,
              color: activeData.colors.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px"
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h4 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--l-ink)", margin: "0 0 6px" }}>
            No events found
          </h4>
          <p style={{ color: "#6B7280", fontSize: "0.86rem", margin: "0 0 16px", lineHeight: "1.5" }}>
            {query ? `No events match "${courseSearchQuery}".` : "Try choosing a different event type or clearing the search."}
          </p>
          <button
            type="button"
            onClick={() => {
              if (setCourseSearchQuery) setCourseSearchQuery("");
              setEventType("all");
            }}
            style={{
              background: activeData.colors.primary,
              color: "#FFFFFF",
              border: "none",
              padding: "8px 18px",
              borderRadius: "10px",
              fontSize: "0.84rem",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: `0 4px 12px ${activeData.colors.primary}30`
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          {showBootcamps && renderBootcampsSection("Practical Bootcamps")}
          {showWebinars && renderLiveSessionsSection("Live Sessions & Webinars")}
        </>
      )}
    </section>
  );
}
