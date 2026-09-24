"use client";

import { usePublishedEventCardsQuery } from '@/domains/events';
import React from "react";
import { useRouter } from "next/navigation";
import ExploreEmptyState from "./ExploreEmptyState";

/*
 * WEBINARS_DATA removed. It was five invented webinars with invented hosts ("Next.js Core Team",
 * "AWS Solution Architect") and invented times, rendered here instead of whatever channels had
 * actually published — so no real event ever appeared on this page.
 *
 * Real events now come from usePublishedEventCardsQuery.
 */

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
  const router = useRouter();
  const [currentPage, setCurrentPage] = React.useState(0);
  const [webinarsPage, setWebinarsPage] = React.useState(0);
  const [eventType, setEventType] = React.useState<"all" | "bootcamps" | "webinars">("all");
  const [sortBy, setSortBy] = React.useState<"upcoming" | "duration">("upcoming");

  React.useEffect(() => {
    setCurrentPage(0);
    setWebinarsPage(0);
  }, [activeCategoryName, eventType, courseSearchQuery]);

  const isAllCategory = activeCategoryName.toLowerCase() === "all";

  // Everything below comes from the server.
  //
  // Three separate fabrications used to live here. `activeData.bootcamps` was a fixed list of
  // three invented bootcamps; for any category other than "All" this *additionally* invented two
  // more named after whatever the visitor had clicked ("{category} Advanced Masterclass
  // Bootcamp"); and the webinar list was five invented webinars relabelled the same way. None of
  // it corresponded to anything a creator had published.
  //
  // Search is server-side now. It used to filter whichever page happened to be loaded, so a
  // learner searching for an event on page 3 of the catalogue was told it did not exist.
  const {
    data: eventsPage,
    isLoading: eventsLoading,
    isError: eventsFailed,
  } = usePublishedEventCardsQuery({
    category: isAllCategory ? undefined : activeCategoryName,
    search: courseSearchQuery.trim() || undefined,
    size: 60,
  });

  const allEvents = eventsPage?.content ?? [];

  // One list from the server, split by the event's own type rather than by two separate sources
  // that could disagree about what exists.
  const allBootcamps = allEvents.filter((e) => e.eventType === 'BOOTCAMP');
  const categoryWebinars = allEvents.filter((e) => e.eventType !== 'BOOTCAMP');

  let filteredBootcamps = allBootcamps;
  let filteredWebinars = categoryWebinars;

  // Sorting stays client-side: it reorders what is already on screen and does not change which
  // events match.
  if (sortBy === "duration") {
    filteredBootcamps = [...filteredBootcamps].sort((a, b) => (a.duration || "").localeCompare(b.duration || ""));
    filteredWebinars = [...filteredWebinars].sort((a, b) => (a.duration || "").localeCompare(b.duration || ""));
  }

  const showBootcamps = eventType === "all" || eventType === "bootcamps";
  const showWebinars = eventType === "all" || eventType === "webinars";
  const totalCount = (showBootcamps ? filteredBootcamps.length : 0) + (showWebinars ? filteredWebinars.length : 0);
  // The catalogue total for this filter, from the server -- not the size of the page in hand.
  const totalAvailable = eventsPage?.totalElements ?? 0;

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
                onClick={() => router.push(`/events/${bootcamp.slug || bootcamp.id}`)}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(20, 23, 31, 0.08)",
                  borderRadius: "20px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 8px 24px -6px rgba(0, 0, 0, 0.04)",
                  cursor: "pointer"
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
                onClick={() => router.push(`/events/${w.slug || w.id}`)}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(20, 23, 31, 0.08)",
                  borderRadius: "20px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 8px 24px -6px rgba(0, 0, 0, 0.04)",
                  cursor: "pointer"
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

  const headingTitle = React.useMemo(() => {
    const q = courseSearchQuery.trim();
    if (q) return `Results for "${q}"`;
    const isAll = !activeCategoryName || activeCategoryName.toLowerCase() === "all";
    if (!isAll) {
      if (eventType === "bootcamps") return `${activeCategoryName} Bootcamps`;
      if (eventType === "webinars") return `${activeCategoryName} Live Webinars`;
      return `${activeCategoryName} Events & Bootcamps`;
    }
    if (eventType === "bootcamps") return "Bootcamps";
    if (eventType === "webinars") return "Live Webinars";
    return "Events & Bootcamps";
  }, [courseSearchQuery, activeCategoryName, eventType]);

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
        {totalCount > 0 && (
          <span style={{ fontSize: "0.82rem", fontWeight: "600", color: "#6B7280" }}>
            {totalCount} {totalCount === 1 ? "event available" : "events available"}
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

      {eventsLoading ? (
        <div style={{ padding: "48px 24px", textAlign: "center", color: "#6B7280" }}>
          Loading events…
        </div>
      ) : eventsFailed ? (
        /* Distinct from "no events": one means the catalogue is empty, the other means we could
           not read it. Showing an empty state for a failed request tells the learner something
           false about the platform. */
        <div style={{ padding: "48px 24px", textAlign: "center" }}>
          <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--l-ink)", margin: "0 0 6px" }}>
            Could not load events
          </h4>
          <p style={{ color: "#6B7280", fontSize: "0.86rem" }}>
            Something went wrong reaching the server. Refresh to try again.
          </p>
        </div>
      ) : totalCount === 0 ? (
        <ExploreEmptyState
          title={courseSearchQuery.trim() ? "No matching events found" : "No events found"}
          description={
            courseSearchQuery.trim()
              ? `We couldn't find any events or bootcamps matching "${courseSearchQuery}". Try checking for spelling errors or searching with broader keywords.`
              : eventType !== "all"
                ? `There are currently no ${eventType} in ${activeCategoryName}. Try selecting "All Events" to view other sessions.`
                : "No events or bootcamps are currently scheduled for this category. Check back soon for new sessions."
          }
          actionLabel="Reset Filters"
          onAction={() => {
            if (setCourseSearchQuery) setCourseSearchQuery("");
            setEventType("all");
          }}
          accentColor={activeData.colors.primary}
        />
      ) : (
        <>
          {showBootcamps && renderBootcampsSection("Practical Bootcamps")}
          {showWebinars && renderLiveSessionsSection("Live Sessions & Webinars")}
        </>
      )}
    </section>
  );
}
