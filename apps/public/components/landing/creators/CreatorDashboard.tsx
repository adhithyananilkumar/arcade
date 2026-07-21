"use client";

import React, { useState } from "react";
import { BookOpen, Users, BarChart3 } from "lucide-react";

export default function CreatorDashboard() {
  const [activeTab, setActiveTab] = useState<"builder" | "collaboration" | "analytics">("builder");

  return (
    <section className="dashboard-sec" id="tools">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Interactive Engine</span>
          <h2>Everything in one place</h2>
          <p>Your educational dashboard designed to manage drafts, author collaborations, and students metrics.</p>
        </div>

        <div className="dashboard-grid">
          {/* Left side Tab triggers */}
          <div className="dashboard-tabs-list">
            <button
              type="button"
              className={`dashboard-tab-trigger ${activeTab === "builder" ? "active" : ""}`}
              onClick={() => setActiveTab("builder")}
            >
              <span className="dashboard-tab-ic"><BookOpen className="w-5 h-5" /></span>
              <div className="dashboard-tab-text-wrap">
                <h4 className="dashboard-tab-title">Course Builder</h4>
                <span className="dashboard-tab-desc">Natively assemble lesson slides, video files, and drag-and-drop structures.</span>
              </div>
            </button>

            <button
              type="button"
              className={`dashboard-tab-trigger ${activeTab === "collaboration" ? "active" : ""}`}
              onClick={() => setActiveTab("collaboration")}
            >
              <span className="dashboard-tab-ic"><Users className="w-5 h-5" /></span>
              <div className="dashboard-tab-text-wrap">
                <h4 className="dashboard-tab-title">Teammate Collaboration</h4>
                <span className="dashboard-tab-desc">Add co-authors with edit authorization rights and co-author credit tags.</span>
              </div>
            </button>

            <button
              type="button"
              className={`dashboard-tab-trigger ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => setActiveTab("analytics")}
            >
              <span className="dashboard-tab-ic"><BarChart3 className="w-5 h-5" /></span>
              <div className="dashboard-tab-text-wrap">
                <h4 className="dashboard-tab-title">Learner Analytics</h4>
                <span className="dashboard-tab-desc">Track enrollment numbers, progress averages, and certificate credits in real-time.</span>
              </div>
            </button>
          </div>

          {/* Right side Dashboard Mock view */}
          <div className="dashboard-preview-window">
            <div className="dashboard-preview-header">
              <span className="dashboard-preview-title">
                {activeTab === "builder" && "Workspace sandbox / Syllabus Draft"}
                {activeTab === "collaboration" && "Co-Author Registry"}
                {activeTab === "analytics" && "Metrics Console"}
              </span>
              <span className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="w-2 h-2 rounded-full bg-zinc-300"></span>
              </span>
            </div>

            <div className="dashboard-preview-body">
              {activeTab === "builder" && (
                <div className="mock-syllabus-list">
                  <div className="mock-syllabus-item">
                    <span className="mock-syllabus-drag">☰</span>
                    <span>Module 1: Getting Started with Next.js Layouts</span>
                  </div>
                  <div className="mock-syllabus-item nested">
                    <span>✓ Lecture 1.1: Server vs Client Components</span>
                  </div>
                  <div className="mock-syllabus-item nested">
                    <span>✓ Video: Layout rendering demo (12:40)</span>
                  </div>
                  <div className="mock-syllabus-item">
                    <span className="mock-syllabus-drag">☰</span>
                    <span>Module 2: Custom React Hook setups</span>
                  </div>
                </div>
              )}

              {activeTab === "collaboration" && (
                <div className="mock-authors-list">
                  <div className="mock-author-row">
                    <div className="mock-author-profile">
                      <span className="mock-author-avatar">AJ</span>
                      <div className="mock-author-info">
                        <span className="mock-author-name">Adhithyan A.</span>
                        <span className="mock-author-role">Owner / Lead Architect</span>
                      </div>
                    </div>
                    <span className="mock-author-badge">Owner</span>
                  </div>

                  <div className="mock-author-row">
                    <div className="mock-author-profile">
                      <span className="mock-author-avatar">RD</span>
                      <div className="mock-author-info">
                        <span className="mock-author-name">Rahul Dev</span>
                        <span className="mock-author-role">Co-Author / Instructor</span>
                      </div>
                    </div>
                    <span className="mock-author-badge">Active</span>
                  </div>
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="mock-chart-container">
                  <div className="mock-chart-grid">
                    <div className="mock-chart-card">
                      <span className="mock-chart-val">1,240</span>
                      <span className="mock-chart-lbl">Enrollments</span>
                    </div>
                    <div className="mock-chart-card">
                      <span className="mock-chart-val">84.6%</span>
                      <span className="mock-chart-lbl">Avg Progress</span>
                    </div>
                    <div className="mock-chart-card">
                      <span className="mock-chart-val">99.8%</span>
                      <span className="mock-chart-lbl">SLA Uptime</span>
                    </div>
                  </div>
                  <div className="mock-chart-graph">
                    <div className="mock-chart-bar" style={{ height: "40px" }}></div>
                    <div className="mock-chart-bar" style={{ height: "60px" }}></div>
                    <div className="mock-chart-bar active" style={{ height: "110px" }}></div>
                    <div className="mock-chart-bar" style={{ height: "80px" }}></div>
                    <div className="mock-chart-bar" style={{ height: "95px" }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
