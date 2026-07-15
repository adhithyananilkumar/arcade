"use client";

import React, { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const FEATURES = [
  {
    title: "Courses",
    desc: "Self-paced learning from top educators.",
    bgColor: "rgba(139, 92, 246, 0.1)",
    iconColor: "#8B5CF6",
    bottomLink: "500+ Courses",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    )
  },
  {
    title: "Bootcamps/Workshops",
    desc: "Hands-on sessions with experts.",
    bgColor: "rgba(244, 169, 62, 0.1)",
    iconColor: "#C97A14",
    bottomLink: "Every Week",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  },
  {
    title: "Webinars",
    desc: "Live sessions on trending topics.",
    bgColor: "rgba(63, 191, 143, 0.1)",
    iconColor: "#23946A",
    bottomLink: "Join Instantly",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    )
  },
  {
    title: "Articles",
    desc: "Read insightful technical articles.",
    bgColor: "rgba(122, 148, 255, 0.1)",
    iconColor: "#3B5CD7",
    bottomLink: "New every day",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    )
  }
];

const orbColors = ["#FFEB00", "#FFD600", "#FFF9C4", "#FFF59D", "#FFE082"];

// Individual Feature Card Component
function FeatureCard({ f, onClick, isExpanded }: { f: typeof FEATURES[0]; onClick: () => void; isExpanded?: boolean }) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        padding: "32px 28px",
        borderRadius: "16px",
        background: "#FFFFFF",
        border: isExpanded ? "1px solid #000000" : "1px solid #E5E7EB",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "260px",
        textAlign: "left",
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s, box-shadow 0.4s",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        borderColor: isHovered ? "#000000" : (isExpanded ? "#000000" : "#E5E7EB"),
        boxShadow: isHovered
          ? "0 16px 36px -10px rgba(0, 0, 0, 0.06), 0 4px 15px rgba(0, 0, 0, 0.01)"
          : (isExpanded ? "0 4px 15px rgba(0, 0, 0, 0.02)" : "0 4px 15px rgba(0, 0, 0, 0.01)"),
        cursor: "pointer",
      }}
    >
      {/* Dynamic Cursor Spotlight Overlay */}
      {isHovered && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(280px circle at ${coords.x}px ${coords.y}px, rgba(255, 230, 0, 0.06), transparent 80%)`,
            zIndex: 0,
          }}
        />
      )}

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flexGrow: 1 }}>
        {/* Soft Pastel Rounded Icon Container */}
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: f.bgColor,
            color: f.iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          {f.icon}
        </div>

        <h3
          style={{
            margin: "0 0 10px",
            fontSize: "1.15rem",
            fontWeight: "700",
            color: "#000000",
          }}
        >
          {f.title}
        </h3>
        <p
          style={{
            margin: "0 0 24px",
            color: "#4B5563",
            fontSize: "0.88rem",
            lineHeight: "1.5",
            flexGrow: 1,
          }}
        >
          {f.desc}
        </p>
      </div>

      {/* Card Footer with Link and Arrow */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #F3F4F6",
          paddingTop: "12px",
        }}
      >
        <span
          style={{
            fontSize: "0.82rem",
            fontWeight: "700",
            color: isExpanded ? "#4B5563" : f.iconColor,
            transition: "opacity 0.2s",
            opacity: isHovered ? 1 : 0.85,
          }}
        >
          {isExpanded ? "← Go Back" : f.bottomLink}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            color: isExpanded ? "#4B5563" : "#9CA3AF",
            transform: isHovered ? (isExpanded ? "translateX(-4px)" : "translateX(4px)") : "translateX(0)",
            transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {isExpanded ? (
            <>
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </>
          ) : (
            <>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}

// Custom Details Panel matching each category
function DetailPanel({ activeTitle, iconColor }: { activeTitle: string; iconColor: string }) {
  switch (activeTitle) {
    case "Courses":
      return (
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          padding: "32px 28px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "260px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.01)"
        }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#000000", margin: "0 0 10px" }}>Courses Curriculum Details</h3>
            <p style={{ color: "#4B5563", fontSize: "0.88rem", margin: "0 0 24px", lineHeight: "1.5" }}>
              Explore self-paced learning paths curated by industry experts. Learn development fundamentals, system architectures, and build projects.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid #F3F4F6", paddingTop: "14px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#374151", marginBottom: "4px" }}>
                <span>Web Development Fundamentals</span>
                <span style={{ fontWeight: "700", color: iconColor }}>80% Complete</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "#E5E7EB", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "80%", height: "100%", background: iconColor }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#374151", marginBottom: "4px" }}>
                <span>Introduction to Python & AI</span>
                <span style={{ fontWeight: "700", color: iconColor }}>35% Complete</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "#E5E7EB", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "35%", height: "100%", background: iconColor }} />
              </div>
            </div>
          </div>
        </div>
      );
    case "Bootcamps/Workshops":
      return (
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          padding: "32px 28px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "260px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.01)"
        }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#000000", margin: "0 0 10px" }}>Active Bootcamps</h3>
            <p style={{ color: "#4B5563", fontSize: "0.88rem", margin: "0 0 24px", lineHeight: "1.5" }}>
              Join live, hands-on, mentor-led programs designed to level up your technical and design skills.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid #F3F4F6", paddingTop: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F9F9F6", padding: "8px 12px", borderRadius: "8px" }}>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#000000" }}>UI/UX Design Intensive</div>
                <div style={{ fontSize: "0.7rem", color: "#6B6E7D" }}>Starts Mon • 4 Weeks</div>
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: "700", color: iconColor, background: "#FFFFFF", border: `1px solid ${iconColor}`, padding: "4px 10px", borderRadius: "6px" }}>Register</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F9F9F6", padding: "8px 12px", borderRadius: "8px" }}>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#000000" }}>AI Engineering Bootcamp</div>
                <div style={{ fontSize: "0.7rem", color: "#6B6E7D" }}>Starts Sat • 2 Days</div>
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: "700", color: iconColor, background: "#FFFFFF", border: `1px solid ${iconColor}`, padding: "4px 10px", borderRadius: "6px" }}>Register</span>
            </div>
          </div>
        </div>
      );
    case "Webinars":
      return (
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          padding: "32px 28px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "260px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.01)"
        }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#000000", margin: "0 0 10px" }}>Live Webinars Schedule</h3>
            <p style={{ color: "#4B5563", fontSize: "0.88rem", margin: "0 0 24px", lineHeight: "1.5" }}>
              Participate in live-streamed sessions discussing state-of-the-art tech trends with industry leaders.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid #F3F4F6", paddingTop: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F9F9F6", padding: "8px 12px", borderRadius: "8px" }}>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#000000" }}>State of Generative AI</div>
                <div style={{ fontSize: "0.7rem", color: "#6B6E7D" }}>Tomorrow, 3:00 PM</div>
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#FFFFFF", background: iconColor, padding: "4px 10px", borderRadius: "6px", cursor: "pointer" }}>Join</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F9F9F6", padding: "8px 12px", borderRadius: "8px" }}>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#000000" }}>Scaling React Apps</div>
                <div style={{ fontSize: "0.7rem", color: "#6B6E7D" }}>Friday, 10:00 AM</div>
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#FFFFFF", background: iconColor, padding: "4px 10px", borderRadius: "6px", cursor: "pointer" }}>Join</span>
            </div>
          </div>
        </div>
      );
    case "Articles":
      return (
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          padding: "32px 28px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "260px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.01)"
        }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#000000", margin: "0 0 10px" }}>Insightful Library</h3>
            <p style={{ color: "#4B5563", fontSize: "0.88rem", margin: "0 0 24px", lineHeight: "1.5" }}>
              Expand your knowledge base with detailed write-ups, tutorials, and engineering articles.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid #F3F4F6", paddingTop: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F9F9F6", padding: "8px 12px", borderRadius: "8px" }}>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#000000" }}>Optimizing App Router</div>
                <div style={{ fontSize: "0.7rem", color: "#6B6E7D" }}>5 Min Read</div>
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: "700", color: iconColor, cursor: "pointer", textDecoration: "underline" }}>Read</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F9F9F6", padding: "8px 12px", borderRadius: "8px" }}>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#000000" }}>Modern CSS Layout Guides</div>
                <div style={{ fontSize: "0.7rem", color: "#6B6E7D" }}>8 Min Read</div>
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: "700", color: iconColor, cursor: "pointer", textDecoration: "underline" }}>Read</span>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function LanternSection() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      // 1. Floating Ambient Orbs
      if (!prefersReducedMotion) {
        const orbs = document.querySelectorAll(".lp-orb");
        orbs.forEach((orb, i) => {
          gsap.to(orb, {
            y: i % 2 === 0 ? -22 : 22,
            x: i % 3 === 0 ? 14 : -14,
            duration: 5 + i * 0.6,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
        });
      }

      // 2. SVG Path Drawing & Glowing Spark (Scroll-driven)
      const pathEl = document.getElementById("lightPath") as SVGPathElement | null;
      const sparkEl = document.getElementById("lightSpark") as SVGCircleElement | null;
      if (pathEl && sparkEl) {
        const pathLength = pathEl.getTotalLength();
        pathEl.style.strokeDasharray = `${pathLength}`;
        pathEl.style.strokeDashoffset = `${pathLength}`;

        const sparkObj = { progress: 0 };

        gsap.to(sparkObj, {
          progress: 1,
          scrollTrigger: {
            trigger: "#lantern-section",
            start: "top 75%",
            end: "bottom 30%",
            scrub: 1,
          },
          onUpdate: () => {
            const point = pathEl.getPointAtLength(sparkObj.progress * pathLength);
            sparkEl.setAttribute("cx", `${point.x}`);
            sparkEl.setAttribute("cy", `${point.y}`);
            pathEl.style.strokeDashoffset = `${pathLength * (1 - sparkObj.progress)}`;
          }
        });
      }

      // 3. Header & Cards Scroll Reveal
      const cardEls = document.querySelectorAll(".lp-card-wrap");
      
      gsap.fromTo("#lp-headline",
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#lantern-section",
            start: "top 75%",
            once: true
          }
        }
      );

      gsap.fromTo(cardEls,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#lantern-section",
            start: "top 70%",
            once: true
          }
        }
      );
    });

    return () => {
      ctx.revert();
    };
  }, []);

  const activeFeature = FEATURES.find(f => f.title === expandedCard);

  return (
    <section
      id="lantern-section"
      style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(to bottom, #FFFFFF 0%, #F9F9F6 180px, #F9F9F6 100%)",
        color: "#000000",
        padding: "80px 24px 100px",
        fontFamily: "'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Ambient Radial Mesh Background */}
      <div
        id="bg-wash"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: `radial-gradient(circle at 15% 25%, rgba(255,229,0,0.06), transparent 45%),
                      radial-gradient(circle at 85% 20%, rgba(255,229,0,0.04), transparent 45%)`,
          opacity: 0,
        }}
      />

      {/* Ambient Floating Orbs */}
      <div
        id="orb-layer"
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
      >
        {orbColors.map((color, i) => {
          const isEven = i % 2 === 0;
          return (
            <div
              key={i}
              className="lp-orb"
              style={{
                position: "absolute",
                top: `${10 + i * 16}%`,
                left: `${6 + i * 20}%`,
                width: isEven ? "130px" : "90px",
                height: isEven ? "130px" : "90px",
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 30%, ${color}28, transparent 70%)`,
                filter: "blur(8px)",
                opacity: 0.8,
              }}
            />
          );
        })}
      </div>

      {/* SVG Path with Dynamic Spark Particle */}
      <svg
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <defs>
          <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFD600" />
            <stop offset="50%" stopColor="#FFEB00" />
            <stop offset="100%" stopColor="#FFD600" />
          </linearGradient>
        </defs>
        <path
          id="lightPath"
          d="M 40 360 C 260 300, 320 440, 560 380 S 900 300, 1180 360"
          fill="none"
          stroke="url(#pathGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.25"
        />
        {/* Animated Spark Circle */}
        <circle
          id="lightSpark"
          r="6"
          fill="#FFEB00"
          style={{
            filter: "drop-shadow(0 0 6px #FFEB00) drop-shadow(0 0 12px #FFD600)",
          }}
        />
      </svg>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
        {/* Centered Headline */}
        <h2
          id="lp-headline"
          style={{
            fontSize: "clamp(2.1rem, 4.5vw, 2.8rem)",
            lineHeight: 1.2,
            fontWeight: 800,
            margin: "0 auto 48px",
            letterSpacing: "-0.01em",
            color: "#000000",
            display: "inline-block",
          }}
        >
          Everything you need to learn and grow.
        </h2>

        {/* Dynamic Card Display */}
        {activeFeature ? (
          /* Expanded View: Selected Card + its Details Panel */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "24px",
              maxWidth: "880px",
              margin: "32px auto 0",
              textAlign: "left"
            }}
          >
            <FeatureCard
              f={activeFeature}
              onClick={() => setExpandedCard(null)}
              isExpanded={true}
            />
            <DetailPanel
              activeTitle={activeFeature.title}
              iconColor={activeFeature.iconColor}
            />
          </div>
        ) : (
          /* Standard View: All 4 cards side-by-side */
          <div className="lp-grid-container">
            {FEATURES.map((f) => (
              <div key={f.title} className="lp-card-wrap">
                <FeatureCard
                  f={f}
                  onClick={() => setExpandedCard(f.title)}
                  isExpanded={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Inline helper for rgba to match user's custom template
function rgba(r: number, g: number, b: number, a: number): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
