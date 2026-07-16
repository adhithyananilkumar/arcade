"use client";

import { useState } from "react";
import { Play, VolumeX, Settings, Share2, Clock } from "lucide-react";
import Link from "next/link";

export default function CourseShowcase() {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  return (
    <section className="l-showcase" aria-label="Course showcase section">
      <div className="l-showcase__card">
        {/* Left Column: Info & Details */}
        <div className="l-showcase__info">
          <div className="l-showcase__badge">
            <div className="l-showcase__badge-icon" />
            <span>The Arcade Story</span>
          </div>

          <h2 className="l-showcase__title">
            Built to empower, educate, and connect the next generation of builders.
          </h2>

          <div className="l-showcase__subtitle-wrap">
            <span className="l-showcase__subtitle-text">Our Mission</span>
          </div>

          <p className="l-showcase__description">
            Arcade started with a simple idea: to build a unified online learning and collaboration ecosystem for Amal Jyothi College. We bring together high-quality courses, interactive workshops, student-led forums, and certified learning achievements under one roof. Designed by builders, for builders — Arcade is here to help you level up your skills, discover new opportunities, and connect with technical communities.
          </p>

          <Link href="/explore" className="l-showcase__btn">
            Explore Courses
          </Link>
        </div>

        {/* Right Column: Custom Interactive Video Player */}
        <div className="l-showcase__video-frame">
          {isPlaying ? (
            <iframe
              className="l-showcase__video"
              src="https://www.youtube.com/embed/zjhCUXDr1wo?autoplay=1&rel=0&modestbranding=1"
              title="Arcade Platform Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : null}

          {/* Interactive Cover (matches screenshot layout) */}
          <div
            className={`l-showcase__cover ${isPlaying ? "is-hidden" : ""}`}
            onClick={handlePlayClick}
          >
            {/* Top Bar Mock Overlays */}
            <div className="l-showcase__video-top">
              <div className="l-showcase__creator">
                <div className="l-showcase__creator-avatar" />
                <div className="l-showcase__creator-info">
                  <span className="l-showcase__video-title">Arcade — The Story of Our Platform</span>
                  <span className="l-showcase__video-author">Arcade Creators</span>
                </div>
              </div>
              <div className="l-showcase__video-controls-top">
                <VolumeX size={16} />
                <Settings size={16} />
              </div>
            </div>

            {/* Play Button Overlay */}
            <button className="l-showcase__play-btn" aria-label="Play video">
              <Play size={24} fill="#ffffff" style={{ marginLeft: "4px" }} />
            </button>

            {/* Bottom Bar Mock Overlays */}
            <div className="l-showcase__video-bottom">
              <div className="l-showcase__progress-bar">
                <div className="l-showcase__progress-fill" style={{ width: "100%" }} />
              </div>
              <div className="l-showcase__video-controls-bottom">
                <span className="l-showcase__time">1:30 / 1:30</span>
                <div className="l-showcase__actions-bottom">
                  <Share2 size={16} />
                  <Clock size={16} />
                  <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "-0.05em", opacity: 0.9 }}>YouTube</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
