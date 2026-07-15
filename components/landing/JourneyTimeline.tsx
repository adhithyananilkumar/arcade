"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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

const AUTO_DURATION = 5000;
const PAUSE_DURATION = 8000;

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
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  const pauseUntilRef = useRef<number>(0);
  const frameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const progressRef = useRef(0);
  const dirRef = useRef(1);
  const prevActiveRef = useRef(active);

  if (active !== prevActiveRef.current) {
    dirRef.current = active > prevActiveRef.current ? 1 : -1;
    prevActiveRef.current = active;
  }

  const goTo = useCallback((idx: number, isManual = false) => {
    setActive(idx);
    progressRef.current = 0;
    setProgress(0);
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
      setProgress(progressRef.current);
      if (progressRef.current >= 100) {
        progressRef.current = 0;
        setProgress(0);
        setActive((a) => (a + 1) % COURSES.length);
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current !== null) cancelAnimationFrame(frameRef.current); };
  }, []);

  const slideVariants = {
    enter: (dir: number) => ({ x: prefersReducedMotion ? 0 : dir * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (dir: number) => ({ x: prefersReducedMotion ? 0 : dir * -40, opacity: 0 }),
  };

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

        {/* Progress dots */}
        <div className="jt-dots" role="tablist" aria-label="Courses">
          {COURSES.map((c, i) => (
            <button
              key={i}
              className={`jt-dot-btn ${i === active ? "is-active" : ""}`}
              onClick={() => goTo(i, true)}
              role="tab"
              aria-selected={i === active}
              aria-label={c.title}
            >
              <div className="jt-dot-track">
                <div
                  className="jt-dot-fill"
                  style={{
                    width: i < active ? "100%" : i === active ? `${progress}%` : "0%",
                    background: c.accent,
                  }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Carousel */}
        <div className="jt-stage">
          <div className="jt-track">
            {[-1, 0, 1].map((offset) => {
              const idx = (active + offset + COURSES.length) % COURSES.length;
              const course = COURSES[idx];
              const isActive = offset === 0;

              return (
                <motion.div
                  key={`${offset}-${idx}`}
                  className={`jt-card ${isActive ? "jt-card--active" : "jt-card--side"}`}
                  style={{
                    "--accent": course.accent,
                    "--accent-light": course.accentLight,
                    gridColumn: offset === -1 ? 1 : offset === 0 ? 2 : 3,
                  } as React.CSSProperties}
                  animate={
                    prefersReducedMotion
                      ? { opacity: isActive ? 1 : 0.5 }
                      : { scale: isActive ? 1 : 0.91, opacity: isActive ? 1 : 0.5 }
                  }
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  onClick={() => !isActive && goTo(idx, true)}
                >
                  {isActive ? (
                    <AnimatePresence mode="wait" custom={dirRef.current}>
                      <motion.div
                        key={idx}
                        className="jt-course"
                        custom={dirRef.current}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
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
                    </AnimatePresence>
                  ) : (
                    /* Side card — full-bleed thumbnail with tint overlay */
                    <div className="jt-side-course">
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
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
