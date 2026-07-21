"use client";

import React from "react";
import { BookOpen, Terminal, Play, Layers } from "lucide-react";

export default function CreatorFormats() {
  return (
    <section className="format-sec">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Formats & Monetization</span>
          <h2>Flexible layouts, straightforward pricing</h2>
          <p>Pick the media structure that fits what you teach, and select your enrollment tier.</p>
        </div>

        <div className="format-grid">
          <div className="format-card">
            <span className="ic" style={{ background: "linear-gradient(135deg,#2E2EAB,#4B47E6)" }}>
              <BookOpen className="w-5 h-5" />
            </span>
            <h3>Course</h3>
            <p>Structured paths with video lessons, reading modules, and exams.</p>
            <span className="best">Step-by-step skills</span>
          </div>

          <div className="format-card">
            <span className="ic" style={{ background: "linear-gradient(135deg,#F5A623,#E8890B)" }}>
              <Terminal className="w-5 h-5" />
            </span>
            <h3>Workshop</h3>
            <p>Focused interactive sandbox sessions built around practical outcomes.</p>
            <span className="best">One skill, fast</span>
          </div>

          <div className="format-card">
            <span className="ic" style={{ background: "linear-gradient(135deg,#20B8CF,#2E86AB)" }}>
              <Play className="w-5 h-5" />
            </span>
            <h3>Webinar</h3>
            <p>Live stream classes and broadcast recordings to massive student groups.</p>
            <span className="best">Broadcasting at scale</span>
          </div>

          <div className="format-card">
            <span className="ic" style={{ background: "linear-gradient(135deg,#7A5AF8,#4B47E6)" }}>
              <Layers className="w-5 h-5" />
            </span>
            <h3>Article</h3>
            <p>Self-paced written documentation guides and research reference logs.</p>
            <span className="best">Reference manuals</span>
          </div>
        </div>

        {/* PRICING BLOCK HEADER */}
        <div className="sec-head" style={{ marginTop: "64px", marginBottom: "32px" }}>
          <span className="eyebrow">Set your own terms</span>
          <h2>Free or paid — you decide, course by course</h2>
          <p>Both paths get the same review process and the same certificate.</p>
        </div>

        <div className="pricing-grid">
          <div className="price-card">
            <span className="tag">Free</span>
            <h3>Open to everyone</h3>
            <p>No pricing setup required.</p>
            <ul>
              <li>
                <span className="chk">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span>Reach the widest possible audience</span>
              </li>
              <li>
                <span className="chk">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span>Great for building a community</span>
              </li>
              <li>
                <span className="chk">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span>Still fully reviewed and certified</span>
              </li>
            </ul>
          </div>

          <div className="price-card highlight">
            <span className="tag" style={{ background: "#DEE0FA" }}>Paid</span>
            <h3>Set your own price</h3>
            <p>Keep control of your offering.</p>
            <ul>
              <li>
                <span className="chk">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span>Price each course on your own terms</span>
              </li>
              <li>
                <span className="chk">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span>Ideal for professional training</span>
              </li>
              <li>
                <span className="chk">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span>Same quality review, same certificate</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
