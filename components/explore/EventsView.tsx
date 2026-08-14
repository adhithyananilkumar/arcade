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
}

export default function EventsView({
  activeData,
  activeCategoryName,
  isEmbeddedHub
}: EventsViewProps) {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [webinarsPage, setWebinarsPage] = React.useState(0);

  React.useEffect(() => {
    setCurrentPage(0);
    setWebinarsPage(0);
  }, [activeCategoryName]);

  let categoryWebinars = WEBINARS_DATA.filter(w => w.category.toLowerCase() === activeCategoryName.toLowerCase());
  if (categoryWebinars.length === 0) {
    categoryWebinars = WEBINARS_DATA.map(w => ({ ...w, category: activeCategoryName }));
  }

  const renderBootcampsSection = (title: string = "Practical Bootcamps") => {
    const bootcampsToShow = [
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

    const CARDS_PER_PAGE = 3;
    const startIndex = currentPage * CARDS_PER_PAGE;
    const endIndex = Math.min(startIndex + CARDS_PER_PAGE, bootcampsToShow.length);
    const visibleBootcamps = bootcampsToShow.slice(startIndex, endIndex);

    return (
      <section style={{ marginBottom: isEmbeddedHub ? "36px" : "56px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "4px", height: "24px", borderRadius: "2px", background: activeData.colors.primary }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--l-ink)", fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>
              {title}
            </h2>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {visibleBootcamps.map((bootcamp: any, i: number) => {
            const ctaBg = activeData.colors.primary;
            const ctaColor = "#FFFFFF";
            const ctaShadow = `0 4px 14px ${activeData.colors.primary}30`;
            const statusColor = activeData.colors.primary;
            const titleColor = "#1E3E62";

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
                className="hover-card-y"
              >
                <WebinarCardHeader title={bootcamp.title} status={bootcamp.type} duration={bootcamp.duration} category={activeCategoryName} />

                <div style={{ padding: "20px", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: "800", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {activeCategoryName} • {bootcamp.duration.toUpperCase()}
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
                      {bootcamp.title}
                    </h3>

                    <div style={{ fontSize: "0.82rem", color: "#6B7280", display: "flex", alignItems: "center", marginBottom: "20px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>Structured <strong style={{ color: "#374151", fontWeight: "700" }}>Hands-on Learning</strong></span>
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
                          {bootcamp.date || "Cohort Open"}
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

        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px", marginTop: "24px" }}>
          <span style={{ fontSize: "0.85rem", color: "#6B7280", fontWeight: "600", fontFamily: "sans-serif" }}>
            {startIndex + 1} - {endIndex} of {bootcampsToShow.length}
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(bootcampsToShow.length / CARDS_PER_PAGE) - 1))}
              disabled={endIndex >= bootcampsToShow.length}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "1px solid #E5E7EB",
                background: endIndex >= bootcampsToShow.length ? "#F3F4F6" : "#FFFFFF",
                color: endIndex >= bootcampsToShow.length ? "#9CA3AF" : "#1F2937",
                cursor: endIndex >= bootcampsToShow.length ? "not-allowed" : "pointer",
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
      </section>
    );
  };

  const renderLiveSessionsSection = (title: string = "Live Sessions & Events") => {
    const CARDS_PER_PAGE = 3;
    const startIndex = webinarsPage * CARDS_PER_PAGE;
    const endIndex = Math.min(startIndex + CARDS_PER_PAGE, categoryWebinars.length);
    const visibleWebinars = categoryWebinars.slice(startIndex, endIndex);

    return (
      <section style={{ marginBottom: isEmbeddedHub ? "36px" : "56px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "4px", height: "24px", borderRadius: "2px", background: activeData.colors.primary }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--l-ink)", fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>
              {title}
            </h2>
          </div>
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
                      <ActionButton ctaBg={ctaBg} ctaColor={ctaColor} ctaShadow={ctaShadow} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px", marginTop: "24px" }}>
          <span style={{ fontSize: "0.85rem", color: "#6B7280", fontWeight: "600", fontFamily: "sans-serif" }}>
            {startIndex + 1} - {endIndex} of {categoryWebinars.length}
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
              onClick={() => setWebinarsPage(prev => Math.min(prev + 1, Math.ceil(categoryWebinars.length / CARDS_PER_PAGE) - 1))}
              disabled={endIndex >= categoryWebinars.length}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "1px solid #E5E7EB",
                background: endIndex >= categoryWebinars.length ? "#F3F4F6" : "#FFFFFF",
                color: endIndex >= categoryWebinars.length ? "#9CA3AF" : "#1F2937",
                cursor: endIndex >= categoryWebinars.length ? "not-allowed" : "pointer",
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
      </section>
    );
  };

  return (
    <>
      {renderBootcampsSection("Practical Bootcamps")}
      {renderLiveSessionsSection("Live Sessions & Events")}
    </>
  );
}
