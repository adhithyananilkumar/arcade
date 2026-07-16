"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, Megaphone, Users, DollarSign, BarChart2, Blocks, Settings,
  ArrowLeft, Clock, BarChart, ChevronRight, MessageSquare
} from "lucide-react";
import HeroNav from "@/components/landing/HeroNav";
import "@/styles/landing.css";

const SIDEBAR_NAV = [
  { label: "Assignments", icon: FileText },
  { label: "Announcement", icon: Megaphone },
  { label: "Students", icon: Users },
  { label: "Earnings", icon: DollarSign },
  { label: "Reports", icon: BarChart2 },
  { label: "Add-Ons", icon: Blocks },
  { label: "Settings", icon: Settings },
];

export default function CoursePreviewDashboard() {
  const router = useRouter();
  const font = `'Inter', ui-sans-serif, system-ui`;

  return (
    <div style={{ minHeight: "100vh", background: "#F8F9FA", color: "#14161C", fontFamily: font }}>
      <HeroNav />
      <style>{`
        .dash-card { background: #FFFFFF; border-radius: 16px; border: 1px solid #F3F4F6; }
        .sidebar-link { transition: color 0.15s ease; color: #6B7280; }
        .sidebar-link:hover { color: #111827; }
        .back-btn { transition: opacity 0.15s ease; }
        .back-btn:hover { opacity: 0.7; }
      `}</style>

      {/* Spacer under fixed navbar */}
      <div style={{ height: "64px" }} />

      <div style={{ display: "flex", maxWidth: 1440, margin: "0 auto", padding: "20px 24px 80px", gap: 32 }}>
        
        {/* LEFT SIDEBAR */}
        <aside style={{ width: 200, flexShrink: 0, paddingRight: 24, paddingTop: 20 }}>
          <button 
            onClick={() => router.back()} 
            className="back-btn"
            style={{ 
              display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "#111827", 
              border: "none", background: "none", cursor: "pointer", marginBottom: 32, padding: 0 
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          
          <nav style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {SIDEBAR_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="sidebar-link" style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main style={{ flex: 1, display: "flex", gap: 32 }}>
          
          {/* MIDDLE COLUMN (Course Info) */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Image Placeholder */}
            <div style={{ 
              width: "100%", height: 320, borderRadius: 16, backgroundColor: "#E5E7EB", 
              backgroundImage: "url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop')",
              backgroundSize: "cover", backgroundPosition: "center"
            }} />
            
            <h1 style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, margin: 0, color: "#111827" }}>
              Creative Design Essentials - UI/UX<br/>Design Course Bundle
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 32, paddingBottom: 16, borderBottom: "1px solid #F3F4F6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid #D1D5DB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#6B7280" }}>$</div>
                <span style={{ fontSize: 14, fontWeight: 700 }}>$150</span>
                <span style={{ fontSize: 14, color: "#9CA3AF", textDecoration: "line-through" }}>$250</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#4B5563" }}>
                <BarChart size={16} color="#3B82F6" /> Expert
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#4B5563" }}>
                <Clock size={16} color="#6B7280" /> 20h 10m
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#111827" }}>Description</h3>
              <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6, margin: 0 }}>
                This introductory course covers all the basics of user experience and user interface design. You'll build a solid foundation of all necessary design terms you can see this. This introductory course like this text goes here.... <span style={{ textDecoration: "underline", cursor: "pointer", color: "#4B5563" }}>( Read more )</span>
              </p>
            </div>

            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#111827" }}>What's Included</h3>
              <div className="dash-card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ width: 100, height: 100, borderRadius: 12, background: "linear-gradient(135deg, #3B82F6, #1D4ED8)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                   <div style={{ width: 40, height: 40, background: "#fff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 24 }}>F</div>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>Master Design System In Figma</h4>
                  <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#4B5563", marginBottom: 12 }}>
                    <span>20h 10m</span>
                    <span>$150 Value</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#6B7280", margin: 0, lineHeight: 1.5 }}>
                    This introductory course covers all the basics of user experience and user interface design.
                  </p>
                </div>
                <ChevronRight size={20} color="#9CA3AF" />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (Stats & Questions) */}
          <div style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Enrollment Stats Card */}
            <div className="dash-card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, height: 100 }}>
                {/* Mock Chart */}
                <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: "100%", opacity: 0.8 }}>
                  <div style={{ width: 8, height: "40%", background: "#0EA5E9", borderRadius: 2 }}></div>
                  <div style={{ width: 8, height: "30%", background: "#3B82F6", borderRadius: 2 }}></div>
                  <div style={{ width: 8, height: "60%", background: "#10B981", borderRadius: 2 }}></div>
                  <div style={{ width: 8, height: "50%", background: "#0EA5E9", borderRadius: 2 }}></div>
                  <div style={{ width: 8, height: "70%", background: "#3B82F6", borderRadius: 2 }}></div>
                  <div style={{ width: 8, height: "85%", background: "#0EA5E9", borderRadius: 2 }}></div>
                  <div style={{ width: 8, height: "100%", background: "#10B981", borderRadius: 2 }}></div>
                  <div style={{ width: 8, height: "60%", background: "#3B82F6", borderRadius: 2 }}></div>
                  <div style={{ width: 8, height: "70%", background: "#0EA5E9", borderRadius: 2 }}></div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #F3F4F6", paddingTop: 16 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>12</div>
                  <div style={{ fontSize: 12, color: "#3B82F6" }}>Students</div>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>8</div>
                  <div style={{ fontSize: 12, color: "#10B981" }}>Enrolled</div>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>25</div>
                  <div style={{ fontSize: 12, color: "#14B8A6" }}>Visitors</div>
                </div>
              </div>
              <button style={{ width: "100%", marginTop: 20, padding: "10px 0", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                View Details
              </button>
            </div>

            {/* Stats List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Enrollment Statistics</div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 32, fontWeight: 400, color: "#2563EB" }}>96%</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Success Rate</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 32, fontWeight: 400, color: "#0D9488" }}>50</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>People Finished</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 32, fontWeight: 400, color: "#92400E" }}>12</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Haven't Finished</span>
              </div>
            </div>

            {/* Questions Section */}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Questions</div>
              
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
                <img src="https://i.pravatar.cc/100?img=11" alt="avatar" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Robert Shore</div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>Senior Lead Designer</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Hello! How do I export the Figma file?...</div>
                </div>
                <button style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 6, padding: 6, cursor: "pointer" }}>
                  <MessageSquare size={16} color="#6B7280" />
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <img src="https://i.pravatar.cc/100?img=12" alt="avatar" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Royal Parvej</div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>Senior Lead Designer</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>I am afraid I couldn't make it, please...</div>
                </div>
                <button style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 6, padding: 6, cursor: "pointer" }}>
                  <MessageSquare size={16} color="#6B7280" />
                </button>
              </div>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}
