"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";
import "./JourneyTimeline.css";

/* ─── Course data ────────────────────────────────────────────────── */
interface Course {
  title: string;
  author: string;
  duration: string;
  dept: string;
  accent: string;
  accentLight: string;
  cover: string;       // local /courses/x.png
  videoId: string;     // YouTube ID for click-to-play
}

const COURSES: Course[] = [
  {
    title: "React Mastery",
    author: "Arjun Menon",
    duration: "8.5 hrs",
    dept: "Computer Science",
    accent: "#2451D6",
    accentLight: "rgba(36,81,214,0.06)",
    cover: "/courses/react.png",
    videoId: "w7ejDZ8SWv8",
  },
  {
    title: "UI/UX Fundamentals",
    author: "Sarah Mathew",
    duration: "6 hrs",
    dept: "Design",
    accent: "#9b5de5",
    accentLight: "rgba(155,93,229,0.06)",
    cover: "/courses/uiux.png",
    videoId: "c9Wg6Cb_YlU",
  },
  {
    title: "CAD & SolidWorks Basics",
    author: "Prof. John Kurian",
    duration: "7.5 hrs",
    dept: "Mechanical",
    accent: "#e07b39",
    accentLight: "rgba(224,123,57,0.06)",
    cover: "/courses/cad.png",
    videoId: "A_mFQKFavCI",
  },
  {
    title: "Financial Modelling 101",
    author: "Neha Jacob",
    duration: "5 hrs",
    dept: "Business",
    accent: "#1db876",
    accentLight: "rgba(29,184,118,0.06)",
    cover: "/courses/finance.png",
    videoId: "a2aYAMNH1jU",
  },
  {
    title: "Intro to Product Management",
    author: "Kiran Pillai",
    duration: "4.5 hrs",
    dept: "Product",
    accent: "#0d9488",
    accentLight: "rgba(13,148,136,0.06)",
    cover: "/courses/pm.png",
    videoId: "hgSt3bBYUxU",
  },
  {
    title: "Intro to Bioinformatics",
    author: "Dr. Laya Suresh",
    duration: "6.5 hrs",
    dept: "Biotechnology",
    accent: "#d4537e",
    accentLight: "rgba(212,83,126,0.06)",
    cover: "/courses/bio.png",
    videoId: "JBNU1G8YNnE",
  },
  {
    title: "Node.js & Backend APIs",
    author: "Rahul Dev",
    duration: "9 hrs",
    dept: "Computer Science",
    accent: "#b45309",
    accentLight: "rgba(180,83,9,0.06)",
    cover: "/courses/node.png",
    videoId: "fBNz5xF-Kx4",
  },
];

const VIRTUAL_COURSES = [...COURSES, ...COURSES, ...COURSES];

const AUTO_DURATION = 5000;
const PAUSE_DURATION = 8000;

const CARD_WIDTH = 290;
const CARD_GAP = 20;

/* ── Course figure with click-to-play video ── */
function CourseFigure({ course, isActive }: { course: Course; isActive: boolean }) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setPlaying(false);
      return;
    }
    // Automatically play the video after a short delay (once slide transition finishes)
    const timer = setTimeout(() => {
      setPlaying(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isActive]);

  return (
    <div
      className="jt-course__figure"
      style={{ backgroundImage: `url(${course.cover})` }}
    >
      {playing ? (
        <iframe
          className="jt-course__iframe"
          src={`https://www.youtube.com/embed/${course.videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${course.videoId}&rel=0&modestbranding=1`}
          title={course.title}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      ) : (
        <>
          {/* Play button */}
          <button
            className="jt-course__play"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${course.title}`}
          >
            <Play size={20} fill="#ffffff" strokeWidth={0} />
          </button>
          {/* Dept label */}
          <span className="jt-course__fig-dept" style={{ color: course.accent }}>
            {course.dept}
          </span>
        </>
      )}
    </div>
  );
}

export default function JourneyTimeline() {
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(COURSES.length);
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



  return (
    <section className="jt-section">
      <div className="jt-container">

        {/* Header */}
        <motion.div
          className="jt-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="jt-title">Top Rated Courses</h2>
          <p className="jt-description">
            Handpicked by the Arcade team. Updated every semester.
          </p>
        </motion.div>
        {/* Carousel */}
        <div className="jt-stage">
          <motion.div
            className="jt-track"
            animate={{ x: -index * (CARD_WIDTH + CARD_GAP) }}
            transition={
              isResetting
                ? { type: "tween", duration: 0 }
                : { type: "spring", stiffness: 90, damping: 20 }
            }
            onAnimationComplete={handleAnimationComplete}
            style={{
              "--card-width": `${CARD_WIDTH}px`,
              "--card-gap": `${CARD_GAP}px`,
            } as React.CSSProperties}
          >
            {VIRTUAL_COURSES.map((course, idx) => {
              const realIdx = idx % COURSES.length;
              const isActive = idx === index;
              const offset = idx - index;
              const isVisible = Math.abs(offset) <= 3;

              return (
                <motion.div
                  key={`${idx}-${course.title}`}
                  className={`jt-card ${isActive ? "jt-card--active" : "jt-card--side"}`}
                  style={{
                    "--accent": course.accent,
                    "--accent-light": course.accentLight,
                  } as React.CSSProperties}
                  animate={
                    prefersReducedMotion
                      ? { opacity: isActive ? 1 : 0.4 }
                      : {
                          scale: isActive ? 1.06 : 0.88,
                          opacity: isActive
                            ? 1
                            : isVisible
                            ? Math.max(0.05, 0.55 - Math.abs(offset) * 0.15)
                            : 0,
                        }
                  }
                  transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                  whileHover={
                    !prefersReducedMotion && isActive
                      ? { scale: 1.09 }
                      : undefined
                  }
                  onClick={() => !isActive && goTo(idx, true)}
                >
                  {/* Active Card Content */}
                  <motion.div
                    className="jt-course"
                    initial={false}
                    animate={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? "auto" : "none" }}
                    transition={{ duration: 0.6 }}
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CourseFigure course={course} isActive={isActive} />
                    <div className="jt-course__info">
                      <h3 className="jt-course__title">{course.title}</h3>
                      <div className="jt-course__meta">
                        <span className="jt-course__author">{course.author}</span>
                        <span className="jt-course__sep">·</span>
                        <span className="jt-course__duration">{course.duration}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Side Card Content */}
                  <motion.div
                    className="jt-side-course"
                    initial={false}
                    animate={{ opacity: isActive ? 0 : 1, pointerEvents: isActive ? "none" : "auto" }}
                    transition={{ duration: 0.6 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                    }}
                  >
                    <div
                      className="jt-side-course__fig"
                      style={{ backgroundImage: `url(${course.cover})` }}
                    />
                    <div
                      className="jt-side-course__overlay"
                      style={{ background: `linear-gradient(to top, ${course.accent}ee 0%, ${course.accent}44 50%, transparent 100%)` }}
                    />
                    <div className="jt-side-course__info">
                      <p className="jt-side-course__title">{course.title}</p>
                      <p className="jt-side-course__author">{course.author}</p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
