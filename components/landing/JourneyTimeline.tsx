"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import "./JourneyTimeline.css";

/* ─── Course data ────────────────────────────────────────────────── */
interface Course {
  id: string;
  title: string;          // The title in the white section
  author: string;
  duration: string;
  rating: number;
  reviewsCount: number;
  
  // Card Figure Properties
  cardTitle: string;      // Title inside the image
  cardSub: string;        // Subtitle/tagline inside the image
  cardTextColor: string;  // Color of the text inside the image
  cardAccentColor: string; // Color for rating star and borders
  description: string;    // Description of the course (shown on active card)
  badgeText?: string;     // "Top Rated"
  
  // Solid theme color for the bottom split background
  cardBg: string;
  
  // Image path and YouTube video ID for the course display
  imagePath: string;
  youtubeId: string;
}

const COURSES: Course[] = [
  {
    id: "uiux",
    title: "UI/UX Design Masterclass",
    author: "Dr. Neha Kapoor",
    duration: "5.2 hrs",
    rating: 4.6,
    reviewsCount: 120,
    cardTitle: "UI/UX Design",
    cardSub: "Learn prototyping, research, and wireframing.",
    cardTextColor: "#FFFFFF",
    cardAccentColor: "#8B5CF6",
    cardBg: "#8C7CA8", // Muted purple matching uiux.png
    description: "Master the art of user interface and user experience design. Learn prototyping, user research, wireframing, and interactive design in Figma.",
    imagePath: "/courses/uiux.png",
    youtubeId: "Hcqbo-M_9ow"
  },
  {
    id: "pm",
    title: "Intro to Product Management",
    author: "Kiran Pillai",
    duration: "4.8 hrs",
    rating: 4.7,
    reviewsCount: 96,
    cardTitle: "PRODUCT MANAGEMENT",
    cardSub: "Think like a PM",
    cardTextColor: "#FFFFFF",
    cardAccentColor: "#10B981",
    cardBg: "#7D938B", // Muted green matching pm.png
    description: "Master the product lifecycle: research user needs, write PRDs, manage launch roadmaps, design MVPs, and align engineering with business goals.",
    imagePath: "/courses/pm.png",
    youtubeId: "5P2nL3nKcfc"
  },
  {
    id: "bio",
    title: "Intro to Bioinformatics",
    author: "Dr. Laya Suresh",
    duration: "6.5 hrs",
    rating: 4.8,
    reviewsCount: 210,
    cardTitle: "Bioinformatics",
    cardSub: "Biology meets data",
    cardTextColor: "#FFFFFF",
    cardAccentColor: "#EC4899",
    cardBg: "#180510", // Dark purple/black matching bio.png
    description: "Explore the intersection of biology and data science. Learn how to collect, analyze, and interpret biological data using computational tools.",
    badgeText: "Top Rated",
    imagePath: "/courses/bio.png",
    youtubeId: "c0Uep35VvH0"
  },
  {
    id: "node",
    title: "Node.js & Backend APIs",
    author: "Rahul Dev",
    duration: "5.6 hrs",
    rating: 4.5,
    reviewsCount: 88,
    cardTitle: "Node.js & Backend APIs",
    cardSub: "Build fast, scalable backend APIs.",
    cardTextColor: "#FFFFFF",
    cardAccentColor: "#D97706",
    cardBg: "#8A7769", // Muted brown matching node.png
    description: "Build fast, scalable backend services. Learn RESTful routing, Express middleware, authentication, database integrations, and API testing.",
    imagePath: "/courses/node.png",
    youtubeId: "yEHCfGv0mYM"
  },
  {
    id: "react",
    title: "React Development",
    author: "Anita Verma",
    duration: "4.3 hrs",
    rating: 4.4,
    reviewsCount: 72,
    cardTitle: "React Development",
    cardSub: "Build responsive, dynamic interfaces.",
    cardTextColor: "#FFFFFF",
    cardAccentColor: "#2563EB",
    cardBg: "#4F5660", // Dark slate grey matching react.png
    description: "Build responsive, dynamic user interfaces. Learn hooks, state management, routing, component lifecycles, and modern React workflows.",
    imagePath: "/courses/react.png",
    youtubeId: "M988_fsOSxo"
  }
];

// Re-enable cycle loops to guarantee that there are ALWAYS two cards on each side of the active card
const VIRTUAL_COURSES = [...COURSES, ...COURSES, ...COURSES];

const AUTO_DURATION = 6000;
const PAUSE_DURATION = 10000;

// Dynamic sizing and uniform spacing
const CARD_GAP = 20;

export default function JourneyTimeline() {
  const prefersReducedMotion = useReducedMotion();
  
  // Set initial index to point to Bioinformatics in the middle cycle (index 7)
  const [index, setIndex] = useState(COURSES.length + 2);
  const [isResetting, setIsResetting] = useState(false);
  const active = index % COURSES.length;

  const pauseUntilRef = useRef<number>(0);
  const frameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const progressRef = useRef(0);

  useEffect(() => {
    if (isResetting) {
      const frame = requestAnimationFrame(() => {
        setIsResetting(false);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [isResetting]);

  const handleAnimationComplete = () => {
    if (index >= COURSES.length * 2) {
      setIsResetting(true);
      setIndex(index - COURSES.length);
    } else if (index < COURSES.length) {
      setIsResetting(true);
      setIndex(index + COURSES.length);
    }
  };

  const goTo = useCallback((idx: number, isManual = false) => {
    setIndex(idx);
    progressRef.current = 0;
    lastTickRef.current = Date.now();
    if (isManual) pauseUntilRef.current = Date.now() + PAUSE_DURATION;
  }, []);

  useEffect(() => {
    const tick = () => {
      frameRef.current = requestAnimationFrame(tick);
      const now = Date.now();
      if (now < pauseUntilRef.current) { lastTickRef.current = now; return; }
      const elapsed = now - lastTickRef.current;
      lastTickRef.current = now;
      progressRef.current = Math.min(100, progressRef.current + (elapsed / AUTO_DURATION) * 100);
      if (progressRef.current >= 100) {
        progressRef.current = 0;
        setIndex((prev) => prev + 1);
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current !== null) cancelAnimationFrame(frameRef.current); };
  }, []);

  // Helper to determine exact width of any card in the slider dynamically
  const getCardWidth = (cardIdx: number, activeIdx: number) => {
    if (cardIdx === activeIdx) return 360;
    if (Math.abs(cardIdx - activeIdx) === 1) return 250;
    return 195; // Both outer side cards are the smallest (195px width)
  };

  // Compute precise track translation dynamically to center the active card perfectly
  const getTrackTranslation = () => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getCardWidth(i, index) + CARD_GAP;
    }
    offset += getCardWidth(index, index) / 2;
    return -offset; // Pure pixel number
  };

  return (
    <section className="jt-section">
      <div className="jt-container">

        {/* Header - Subtitle / Description completely removed */}
        <motion.div
          className="jt-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="jt-title">Top Rated Courses</h2>
        </motion.div>

        {/* Carousel Stage */}
        <div className="jt-stage">
          <motion.div
            className="jt-track"
            animate={{ x: getTrackTranslation() }} // Moves track dynamically
            transition={
              isResetting
                ? { type: "tween", duration: 0 }
                : { type: "tween", duration: 1.5, ease: [0.25, 1, 0.3, 1] } // Very smooth, slow glide over 1.5 seconds
            }
            onAnimationComplete={handleAnimationComplete}
          >
            {VIRTUAL_COURSES.map((course, idx) => {
              const isActive = idx === index;
              const offset = idx - index;
              const isAdjacent = Math.abs(offset) === 1;
              const isVisible = Math.abs(offset) <= 2;

              // Base layouts sizes
              const cardWidth = isActive ? 360 : (isAdjacent ? 250 : 195);
              const cardHeight = isActive ? 460 : (isAdjacent ? 330 : 260);
              
              // Central active card sits lower to form overlapping baseline,
              // while tops slope down to form a clean triangle peak shape
              const cardY = isActive ? 35 : 0;

              return (
                <motion.div
                  key={idx} // Stable layout key prevents DOM rebuilds and iframe reloads
                  className={`jt-card ${isActive ? "jt-card--active" : "jt-card--side"} ${isAdjacent ? "jt-card--adjacent" : "jt-card--outer"}`}
                  style={{
                    "--accent": course.cardAccentColor,
                    pointerEvents: isVisible ? "auto" : "none", // Prevent clicks on hidden cards
                  } as React.CSSProperties}
                  animate={
                    prefersReducedMotion
                      ? { opacity: isActive ? 1 : 0.4 }
                      : {
                          width: cardWidth,
                          height: cardHeight,
                          y: cardY,
                          opacity: isActive
                            ? 1
                            : isVisible
                            ? (isAdjacent ? 0.7 : 0.45) // Dimmable side card opacities
                            : 0, // Cards beyond offset ±2 are fully invisible (removed from display)
                        }
                  }
                  // Small hover scale popup effect using Framer Motion
                  whileHover={
                    prefersReducedMotion || !isVisible
                      ? {}
                      : {
                          scale: 1.025,
                          transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] }
                        }
                  }
                  transition={{ duration: 1.5, ease: [0.25, 1, 0.3, 1] }} // Synchronized with track horizontal slide duration (1.5 seconds)
                  onClick={() => !isActive && goTo(idx, true)}
                >
                  
                  {/* 1. TOP IMAGE/VIDEO FIGURE (Unified DOM nodes prevent unmounting & reload flicker) */}
                  <div 
                    className="jt-card__figure"
                    style={{
                      height: isActive ? "52%" : "68%",
                      transition: "height 1.5s cubic-bezier(0.25, 1, 0.3, 1)",
                    }}
                  >
                    {/* Fallback/Behind Background Image that zooms on hover */}
                    <div 
                      className="jt-card__figure-bg"
                      style={{
                        backgroundImage: `url(${course.imagePath})`,
                      }}
                    />

                    {/* YouTube IFrame Player (Only mounted when active to prevent browser autoplay blocks on low-opacity iframes) */}
                    {isActive && (
                      <iframe
                        className="jt-card__video"
                        src={`https://www.youtube.com/embed/${course.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${course.youtubeId}&controls=0&playsinline=1&rel=0&showinfo=0&modestbranding=1&enablejsapi=1`}
                        title={course.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          width: "140%",
                          height: "140%",
                          transform: "translate(-50%, -50%)",
                          pointerEvents: "none",
                          border: "none",
                          zIndex: 1,
                        }}
                      />
                    )}
                    
                    {/* Dark Overlay for title readability */}
                    <div 
                      className="jt-card__video-overlay"
                      style={{
                        opacity: isActive ? 1 : 0.15,
                        transition: "opacity 1.5s cubic-bezier(0.25, 1, 0.3, 1)",
                        zIndex: 2,
                      }}
                    />

                    {/* Top badge: Rating star and number removed in case of central card */}
                    {course.badgeText && isActive && (
                      <div className="jt-card__badge" style={{ zIndex: 10 }}>
                        {course.badgeText}
                      </div>
                    )}

                    {/* Big Branding Text inside Figure (only shown for active video view) */}
                    <div 
                      className="jt-card__figure-content"
                      style={{
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? "translateY(0)" : "translateY(10px)",
                        transition: "opacity 1s ease, transform 1s ease",
                        zIndex: 5,
                      }}
                    >
                      <h4 className="jt-card__figure-title">
                        {course.cardTitle}
                      </h4>
                      {course.cardSub && (
                        <p className="jt-card__figure-sub">
                          {course.cardSub}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 2. BOTTOM DETAILS SECTION (Unified container transitions bg & layouts smoothly) */}
                  <div 
                    className="jt-card__bottom-container"
                    style={{
                      height: isActive ? "48%" : "32%",
                      transition: "height 1.5s cubic-bezier(0.25, 1, 0.3, 1), background 1.5s ease",
                      position: "relative",
                      background: isActive ? "#ffffff" : course.cardBg,
                      zIndex: 3,
                    }}
                  >
                    {/* Active Bottom Content (Fades in when active) */}
                    <div 
                      className="jt-card__info"
                      style={{
                        opacity: isActive ? 1 : 0,
                        pointerEvents: isActive ? "auto" : "none",
                        transition: "opacity 1s ease",
                      }}
                    >
                      <h3 className="jt-card__info-title">{course.title}</h3>
                      
                      <div className="jt-card__info-meta">
                        <span className="jt-card__info-author">{course.author}</span>
                        <span className="jt-card__info-sep">•</span>
                        <span className="jt-card__info-duration">{course.duration}</span>
                      </div>

                      {/* Detailed course description paragraph */}
                      <p className="jt-card__info-desc">{course.description}</p>

                      {/* Reviews Line */}
                      <div className="jt-card__info-reviews">
                        <span className="jt-card__info-star" style={{ color: course.cardAccentColor }}>★</span>
                        <span className="jt-card__info-rating">{course.rating}</span>
                        <span className="jt-card__info-count">({course.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Side Bottom Content (Fades in when side card) */}
                    <div 
                      className="jt-side-info-bottom"
                      style={{
                        opacity: isActive ? 0 : 1,
                        pointerEvents: isActive ? "none" : "auto",
                        transition: "opacity 1s ease",
                      }}
                    >
                      <h5 className="jt-side-card-title">
                        {course.title}
                      </h5>
                      <div className="jt-side-meta">
                        <span>{course.author}</span>
                      </div>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
