"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Play, Volume2, Settings, Share2, Clock, ChevronDown,
  Star, Users, BookOpen, Award, ArrowLeft, Terminal, Code
} from "lucide-react";
import HeroNav from "@/components/landing/HeroNav";
import "@/styles/landing.css";

const AVATAR_COLORS = [
  { bg: "#DBEAFE", fg: "#1D4ED8" },
  { bg: "#FEF3C7", fg: "#B45309" },
  { bg: "#EDE9FE", fg: "#6D28D9" },
  { bg: "#D1FAE5", fg: "#047857" },
];

function Avatar({ initials, idx = 0, size = 36 }: { initials: string; idx?: number; size?: number }) {
  const c = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: c.bg, color: c.fg,
      display: "grid", placeItems: "center", fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
    }}>{initials}</div>
  );
}

const TABS = ["Overview", "Syllabus", "Instructor", "Certificate", "Reviews"];

const MODULES = [
  {
    title: "Foundations of interface design", lessons: 5, duration: "1h 10m", color: "#3B82F6",
    items: ["Visual hierarchy and grid systems", "Color theory for products", "Typography that scales", "Building your first component set", "Critique: heuristic review"],
  },
  {
    title: "Interaction and motion design", lessons: 4, duration: "58m", color: "#F59E0B",
    items: ["Micro-interactions that feel right", "Prototyping with real timing curves", "State changes and feedback", "Assignment: an animated onboarding flow"],
  },
  {
    title: "Design systems that scale", lessons: 6, duration: "1h 40m", color: "#6D5EF0",
    items: ["Tokens over hard-coded values", "Component variants and props", "Documentation your team will read", "Versioning a design system", "Handoff without the back-and-forth", "Case study teardown"],
  },
  {
    title: "Portfolio and case studies", lessons: 4, duration: "1h 02m", color: "#10B981",
    items: ["Choosing your strongest project", "Writing a case study people finish", "Presenting process, not just polish", "Final review with a mentor"],
  },
];

const REVIEWS = [
  { name: "Adam Wathan", role: "Founder, Tailwind", quote: "I've been using this course as a refresher for nearly a semester and keep coming back to the systems module.", dark: true, idx: 0 },
  { name: "Ian Callahan", role: "Harvard Art Museums", quote: "Genuinely the clearest explanation of design systems I've seen taught anywhere.", dark: false, idx: 1 },
  { name: "Aaron Francis", role: "Co-founder, Try Hard Studios", quote: "Takes the pain out of learning motion design — the pacing is exactly right.", dark: false, idx: 2 },
  { name: "Chandresh Patel", role: "CEO, Bacancy", quote: "Elegance, pacing, and student experience are completely unmatched.", dark: false, idx: 3 },
  { name: "Fathom Analytics", role: "Team account", quote: "This course has been integral to how we onboard new hires into design.", dark: true, idx: 2 },
];

const PARTNERS = [
  { name: "IEEE", color: "#00629B" }, { name: "edX", color: "#111111" },
  { name: "IBM Cloud", color: "#6D5EF0" }, { name: "GitHub", color: "#111111" },
  { name: "IBM", color: "#0F62FE" }, { name: "Oracle", color: "#C74634" },
];

export default function CoursePreviewPage() {
  const [tab, setTab] = useState("Overview");
  const [openMod, setOpenMod] = useState(0);
  const font = `'Inter', ui-sans-serif, system-ui`;

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", color: "#14161C", fontFamily: font }}>
      <HeroNav />
      <style>{`
        .pill-btn { transition: transform .1s ease, background .1s ease; }
        .pill-btn:hover { transform: translateY(-1px); }
        .pill-btn:active { transform: scale(.98); }
        .tab-seg { transition: all .15s ease; }
        .mod-card:hover { border-color: #D7DAE3 !important; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px);} to {opacity:1; transform:none;} }
        .fade-in { animation: fadeUp .3s ease-out both; }
        .back-btn:hover { background: #F3F4F6 !important; }
      `}</style>

      {/* Spacer under fixed navbar */}
      <div style={{ height: "64px" }} />

      <div style={{ padding: "48px 48px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Back to Explore */}
          <Link
            href="/explore"
            className="back-btn"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 40,
              fontSize: 14, fontWeight: 500, color: "#4B5563", textDecoration: "none",
              border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 16px",
              background: "#fff", transition: "background .15s ease",
            }}
          >
            <ArrowLeft size={16} /> Back to courses
          </Link>

          {/* HERO */}
          <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", marginBottom: 64 }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8, background: "#F3F4F6",
                borderRadius: 6, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 24,
              }}>
                <Code size={16} /> UI / UX &amp; Product Design
              </div>

              <h1 style={{ fontSize: 48, lineHeight: 1.1, fontWeight: 800, margin: "0 0 24px", letterSpacing: "-0.02em" }}>
                Design interfaces people actually <span style={{ textDecoration: "underline", textDecorationColor: "#3B82F6", textUnderlineOffset: "6px" }}>love.</span>
              </h1>

              <p style={{ fontSize: 16, color: "#4B5563", lineHeight: 1.6, marginBottom: 32 }}>
                A hands-on path through interface design, motion, and design systems — built by working product designers, taught the way we wish someone had taught us.
              </p>

              <div style={{ display: "flex", gap: 24, marginBottom: 28, fontSize: 13, color: "#5B5E6B" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={15} /> 4h 30m</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><BookOpen size={15} /> 19 lessons</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Users size={15} /> 12,480 enrolled</span>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button id="course-enroll-btn" className="pill-btn" style={{ background: "#14161C", color: "#fff", border: "none", borderRadius: 999, padding: "13px 24px", fontSize: 14.5, fontWeight: 600, cursor: "pointer" }}>
                  Enroll now
                </button>
              </div>
            </div>

            {/* Dark video preview card */}
            <div style={{ background: "#14161C", borderRadius: 20, padding: 16, boxShadow: "0 20px 50px rgba(20,22,28,0.22)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#2A2D38" }} />
                  <div>
                    <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>Course preview</div>
                    <div style={{ fontSize: 11, color: "#8A8D99" }}>Product Design Studio</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Volume2 size={15} color="#8A8D99" />
                  <Settings size={15} color="#8A8D99" />
                </div>
              </div>
              <div style={{ position: "relative", height: 200, borderRadius: 12, background: "linear-gradient(135deg,#1D2130,#262A38)", display: "grid", placeItems: "center", marginBottom: 12 }}>
                <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "grid", placeItems: "center", cursor: "pointer" }}>
                  <Play size={20} color="#fff" fill="#fff" />
                </div>
              </div>
              <div style={{ height: 3, borderRadius: 2, background: "#2A2D38", marginBottom: 10 }}>
                <div style={{ width: "35%", height: "100%", borderRadius: 2, background: "#F5654F" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#8A8D99" }}>
                <span>0:42 / 2:00</span>
                <span style={{ display: "flex", gap: 12 }}><Share2 size={13} /><Clock size={13} /></span>
              </div>
            </div>
          </div>

          {/* PARTNERS / VERIFIED BY */}
          <div style={{ display: "flex", alignItems: "center", gap: 34, justifyContent: "center", flexWrap: "wrap", margin: "0 0 56px" }}>
            <span style={{ fontSize: 12, color: "#9A9CA8", marginRight: 6 }}>Skills verified by</span>
            {PARTNERS.map((p) => (
              <span key={p.name} style={{ fontSize: 16, fontWeight: 700, color: p.color, opacity: 0.85 }}>{p.name}</span>
            ))}
          </div>

          {/* TAB SEGMENT */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <div style={{ display: "inline-flex", background: "#fff", border: "1px solid #E7E9F1", borderRadius: 999, padding: 5, gap: 4 }}>
            {TABS.map((t) => (
              <button
                key={t}
                id={`course-tab-${t.toLowerCase()}`}
                onClick={() => setTab(t)}
                className="tab-seg"
                style={{
                  border: "none", cursor: "pointer", borderRadius: 999, padding: "9px 18px", fontSize: 13.5, fontWeight: 600,
                  background: tab === t ? "#14161C" : "transparent", color: tab === t ? "#fff" : "#5B5E6B",
                }}
              >
                {t}
              </button>
            ))}
            </div>
          </div>


          {/* TAB CONTENT */}
          <div key={tab} className="fade-in">

            {tab === "Overview" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>About this course</h3>
                  <p style={{ fontSize: 14, color: "#5B5E6B", lineHeight: 1.75 }}>
                    This course treats design as a craft you build in public — every module ends with a real assignment, reviewed by a working product designer. You&apos;ll leave with a portfolio piece, not just a certificate.
                  </p>
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>What you&apos;ll walk away with</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {["A working design system in Figma", "A recorded portfolio case study", "Feedback from a working designer", "A shareable certificate"].map((f) => (
                      <div key={f} style={{ display: "flex", gap: 9, fontSize: 13.5, color: "#33353F" }}>
                        <Flower size={13} /> {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "Syllabus" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {MODULES.map((m, idx) => (
                  <div key={m.title} className="mod-card" style={{ background: "#fff", border: "1px solid #ECEEF3", borderRadius: 16, overflow: "hidden" }}>
                    <div
                      onClick={() => setOpenMod(openMod === idx ? -1 : idx)}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", cursor: "pointer" }}
                    >
                      <div style={{ width: 6, height: 34, borderRadius: 3, background: m.color }} />
                      <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600 }}>{m.title}</span>
                      <span style={{ fontSize: 12.5, color: "#9A9CA8" }}>{m.lessons} lessons · {m.duration}</span>
                      <ChevronDown
                        size={16}
                        color="#9A9CA8"
                        style={{ transform: openMod === idx ? "rotate(180deg)" : "none", transition: "transform .2s ease" }}
                      />
                    </div>
                    {openMod === idx && (
                      <div style={{ padding: "0 20px 16px 40px", display: "flex", flexDirection: "column", gap: 8 }}>
                        {m.items.map((it) => (
                          <div key={it} style={{ fontSize: 13, color: "#5B5E6B" }}>— {it}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === "Instructor" && (
              <div style={{ background: "#fff", border: "1px solid #ECEEF3", borderRadius: 20, padding: 28, display: "flex", gap: 20 }}>
                <Avatar initials="MO" idx={2} size={56} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Maya Okafor</div>
                  <div style={{ fontSize: 12.5, color: "#9A9CA8", marginBottom: 12 }}>Senior product designer · ex-Meta, ex-Notion</div>
                  <p style={{ fontSize: 14, color: "#5B5E6B", lineHeight: 1.75, maxWidth: 520, marginBottom: 14 }}>
                    Maya has led design at two Series B startups and taught over 40,000 students how to think in systems, not screens.
                  </p>
                  <div style={{ display: "flex", gap: 22, fontSize: 12.5, color: "#5B5E6B" }}>
                    <span>5 courses</span><span>40,000 students</span><span>4.9 avg rating</span>
                  </div>
                </div>
              </div>
            )}

            {tab === "Certificate" && (
              <div style={{ background: "#fff", border: "1px solid #ECEEF3", borderRadius: 20, padding: 28, display: "flex", alignItems: "center", gap: 28 }}>
                <div style={{
                  width: 200, height: 140, borderRadius: 14,
                  background: "linear-gradient(135deg,#14161C,#2A2D38)",
                  flexShrink: 0, padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between",
                }}>
                  <Award size={20} color="#F5A623" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Certificate of completion</div>
                    <div style={{ fontSize: 10.5, color: "#8A8D99", marginTop: 4 }}>Verified · shareable</div>
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Finish strong, get recognized</h3>
                  <p style={{ fontSize: 14, color: "#5B5E6B", lineHeight: 1.7, maxWidth: 400, marginBottom: 14 }}>
                    Complete all four modules and your final case study to receive a certificate verified by our partner network — ready for your portfolio or LinkedIn.
                  </p>
                  <button id="course-sample-cert-btn" className="pill-btn" style={{ background: "#fff", border: "1px solid #E2E4EC", borderRadius: 999, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    View sample certificate
                  </button>
                </div>
              </div>
            )}

            {tab === "Reviews" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <span style={{ fontFamily: font, fontSize: 30 }}>4.9</span>
                  <div>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} fill="#F5A623" strokeWidth={0} />)}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#9A9CA8" }}>812 ratings</div>
                  </div>
                </div>
                <div style={{ columns: "2 260px", columnGap: 16 }}>
                  {REVIEWS.map((r) => (
                    <div key={r.name} style={{
                      breakInside: "avoid", marginBottom: 16, borderRadius: 18, padding: 22,
                      background: r.dark ? "#14161C" : "#fff", border: r.dark ? "none" : "1px solid #ECEEF3",
                    }}>
                      <p style={{ fontSize: 14, lineHeight: 1.6, color: r.dark ? "#fff" : "#22242C", margin: "0 0 16px", fontWeight: r.dark ? 600 : 400 }}>
                        &quot;{r.quote}&quot;
                      </p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${r.dark ? "#2A2D38" : "#F0F1F5"}` }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: r.dark ? "#fff" : "#14161C" }}>{r.name}</div>
                          <div style={{ fontSize: 11.5, color: r.dark ? "#8A8D99" : "#9A9CA8" }}>{r.role}</div>
                        </div>
                        <Avatar initials={r.name.split(" ").map((w) => w[0]).join("").slice(0, 2)} idx={r.idx} size={30} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ENROLLMENT STAT ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginTop: 44 }}>
            {[
              { label: "Students enrolled", value: "12,480", color: "#3B82F6" },
              { label: "Average rating", value: "4.9", color: "#F59E0B" },
              { label: "Completion rate", value: "78%", color: "#10B981" },
              { label: "Certified graduates", value: "9,720", color: "#6D5EF0" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#fff", border: "1px solid #ECEEF3", borderRadius: 16, padding: "18px 18px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, marginBottom: 10 }} />
                <div style={{ fontFamily: font, fontSize: 22, fontWeight: 700 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#9A9CA8" }}>{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
