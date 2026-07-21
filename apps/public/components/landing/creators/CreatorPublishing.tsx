"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreatorPublishing() {
  const [activePubTab, setActivePubTab] = useState<"indep" | "org">("indep");
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  return (
    <section className="pubtab-sec" id="publish">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Two ways to publish</span>
          <h2>Go independent, or bring your organization</h2>
          <p>Switch between the two profiles dynamically as your workload expands.</p>
        </div>

        <div className="pubtabs">
          <div className="pubtab-switch relative">
            <button
              type="button"
              className={`relative z-10 transition-colors duration-300 font-semibold text-xs py-2 ${
                activePubTab === "indep" ? "text-white" : "text-zinc-500"
              }`}
              onClick={() => {
                setActivePubTab("indep");
                setHoveredFeature(null);
              }}
            >
              {activePubTab === "indep" && (
                <motion.span
                  layoutId="activePubTabIndicator"
                  className="absolute inset-0 bg-[#3b2fc9] rounded-full -z-10 shadow-sm"
                  transition={{ type: "spring", stiffness: 350, damping: 26 }}
                />
              )}
              Independent creator
            </button>
            <button
              type="button"
              className={`relative z-10 transition-colors duration-300 font-semibold text-xs py-2 ${
                activePubTab === "org" ? "text-white" : "text-zinc-500"
              }`}
              onClick={() => {
                setActivePubTab("org");
                setHoveredFeature(null);
              }}
            >
              {activePubTab === "org" && (
                <motion.span
                  layoutId="activePubTabIndicator"
                  className="absolute inset-0 bg-[#3b2fc9] rounded-full -z-10 shadow-sm"
                  transition={{ type: "spring", stiffness: 350, damping: 26 }}
                />
              )}
              Organization
            </button>
          </div>
          
          <div className="pubtabs-panel-wrap mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Column: Premium Feature Cards Grid */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {activePubTab === "indep" ? (
                    <motion.div
                      key="indep-panel"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.22 }}
                      className="h-full flex flex-col justify-center text-left"
                    >
                      <div className="mb-5">
                        <h3 className="text-base font-extrabold text-zinc-900 tracking-tight">Independent Creator Profile</h3>
                        <p className="text-[11px] text-zinc-500 mt-1">Publish under your personal brand and maintain complete creative control.</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <motion.div 
                          onMouseEnter={() => setHoveredFeature("brand")}
                          onMouseLeave={() => setHoveredFeature(null)}
                          whileHover={{ y: -2, borderColor: "#818cf8" }}
                          className={`bg-white/70 border rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300 ${
                            hoveredFeature === "brand" ? "border-indigo-500 shadow-md bg-indigo-50/10" : "border-zinc-200/60"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-2.5">
                            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                          </div>
                          <h4 className="text-[12.5px] font-extrabold text-zinc-900 leading-snug">Personal Brand</h4>
                          <p className="text-[10px] text-zinc-500 leading-normal mt-1">Publish and verify courses under your own name to build industry authority.</p>
                        </motion.div>

                        <motion.div 
                          onMouseEnter={() => setHoveredFeature("control")}
                          onMouseLeave={() => setHoveredFeature(null)}
                          whileHover={{ y: -2, borderColor: "#818cf8" }}
                          className={`bg-white/70 border rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300 ${
                            hoveredFeature === "control" ? "border-indigo-500 shadow-md bg-indigo-50/10" : "border-zinc-200/60"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-2.5">
                            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                            </svg>
                          </div>
                          <h4 className="text-[12.5px] font-extrabold text-zinc-900 leading-snug">Full Creative Control</h4>
                          <p className="text-[10px] text-zinc-500 leading-normal mt-1">Structure lessons, customize syllabus layouts, and define browser terminals your way.</p>
                        </motion.div>

                        <motion.div 
                          onMouseEnter={() => setHoveredFeature("pricing")}
                          onMouseLeave={() => setHoveredFeature(null)}
                          whileHover={{ y: -2, borderColor: "#818cf8" }}
                          className={`bg-white/70 border rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300 ${
                            hoveredFeature === "pricing" ? "border-indigo-500 shadow-md bg-indigo-50/10" : "border-zinc-200/60"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-2.5">
                            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a2.25 2.25 0 003.182 0l5.178-5.178a2.25 2.25 0 000-3.182l-9.58-9.581A2.25 2.25 0 009.568 3z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                            </svg>
                          </div>
                          <h4 className="text-[12.5px] font-extrabold text-zinc-900 leading-snug">Set Your Own Pricing</h4>
                          <p className="text-[10px] text-zinc-500 leading-normal mt-1">Configure pricing tiers, create promotion cycles, and receive direct Stripe transfers.</p>
                        </motion.div>

                        <motion.div 
                          onMouseEnter={() => setHoveredFeature("reach")}
                          onMouseLeave={() => setHoveredFeature(null)}
                          whileHover={{ y: -2, borderColor: "#818cf8" }}
                          className={`bg-white/70 border rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300 ${
                            hoveredFeature === "reach" ? "border-indigo-500 shadow-md bg-indigo-50/10" : "border-zinc-200/60"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-2.5">
                            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c-2.485 0-4.5 4.03-4.5 9s2.015 9 4.5 9" />
                            </svg>
                          </div>
                          <h4 className="text-[12.5px] font-extrabold text-zinc-900 leading-snug">Global Reach</h4>
                          <p className="text-[10px] text-zinc-500 leading-normal mt-1">Connect with students across international markets without platform friction.</p>
                        </motion.div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="org-panel"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.22 }}
                      className="h-full flex flex-col justify-center text-left"
                    >
                      <div className="mb-5">
                        <h3 className="text-base font-extrabold text-zinc-900 tracking-tight">Organization Workspace</h3>
                        <p className="text-[11px] text-zinc-500 mt-1">Co-author courses, configure custom domains, and manage institutional structures.</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <motion.div 
                          onMouseEnter={() => setHoveredFeature("brand")}
                          onMouseLeave={() => setHoveredFeature(null)}
                          whileHover={{ y: -2, borderColor: "#14b8a6" }}
                          className={`bg-white/70 border rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300 ${
                            hoveredFeature === "brand" ? "border-teal-500 shadow-md bg-teal-50/10" : "border-zinc-200/60"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-2.5">
                            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.33M3.75 10.33V21" />
                            </svg>
                          </div>
                          <h4 className="text-[12.5px] font-extrabold text-zinc-900 leading-snug">Unified Brand Identity</h4>
                          <p className="text-[10px] text-zinc-500 leading-normal mt-1">Brand certificates and syllabi with your corporate logo and color systems.</p>
                        </motion.div>

                        <motion.div 
                          onMouseEnter={() => setHoveredFeature("authors")}
                          onMouseLeave={() => setHoveredFeature(null)}
                          whileHover={{ y: -2, borderColor: "#14b8a6" }}
                          className={`bg-white/70 border rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300 ${
                            hoveredFeature === "authors" ? "border-teal-500 shadow-md bg-teal-50/10" : "border-zinc-200/60"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-2.5">
                            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0112 20.25a11.38 11.38 0 01-3-1.013v-.109c0-1.113.285-2.16.786-3.07M7.5 16.517a4.125 4.125 0 00-7.533 2.493 9.337 9.337 0 004.121.952 9.38 9.38 0 002.625-.372M7.5 16.517v-.003c0-1.113.285-2.16.786-3.07" />
                            </svg>
                          </div>
                          <h4 className="text-[12.5px] font-extrabold text-zinc-900 leading-snug">Multi-Author Editing</h4>
                          <p className="text-[10px] text-zinc-500 leading-normal mt-1">Add teammates, manage writer permissions, and review draft edits collaboratively.</p>
                        </motion.div>

                        <motion.div 
                          onMouseEnter={() => setHoveredFeature("domain")}
                          onMouseLeave={() => setHoveredFeature(null)}
                          whileHover={{ y: -2, borderColor: "#14b8a6" }}
                          className={`bg-white/70 border rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300 ${
                            hoveredFeature === "domain" ? "border-teal-500 shadow-md bg-teal-50/10" : "border-zinc-200/60"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-2.5">
                            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
                            </svg>
                          </div>
                          <h4 className="text-[12.5px] font-extrabold text-zinc-900 leading-snug">Custom Domains</h4>
                          <p className="text-[10px] text-zinc-500 leading-normal mt-1">Host your custom workspace cockpit under a unique corporate subdomain.</p>
                        </motion.div>

                        <motion.div 
                          onMouseEnter={() => setHoveredFeature("reach")}
                          onMouseLeave={() => setHoveredFeature(null)}
                          whileHover={{ y: -2, borderColor: "#14b8a6" }}
                          className={`bg-white/70 border rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300 ${
                            hoveredFeature === "reach" ? "border-teal-500 shadow-md bg-teal-50/10" : "border-zinc-200/60"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-2.5">
                            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                            </svg>
                          </div>
                          <h4 className="text-[12.5px] font-extrabold text-zinc-900 leading-snug">Consolidated Analytics</h4>
                          <p className="text-[10px] text-zinc-500 leading-normal mt-1">Aggregate registration and performance charts across all author tracks.</p>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Right Column: 3D Flipping Mockup UI Card */}
              <div className="lg:col-span-5 flex items-center justify-center pt-6 lg:pt-0">
                <div style={{ perspective: "1000px" }} className="w-full max-w-[340px] h-[280px] relative">
                  <motion.div
                    animate={{ rotateY: activePubTab === "indep" ? 0 : 180 }}
                    transition={{ type: "spring", stiffness: 100, damping: 18 }}
                    style={{ transformStyle: "preserve-3d" }}
                    className="w-full h-full relative"
                  >
                    {/* Front Side: Independent Creator Mockup */}
                    <div 
                      className="absolute inset-0 w-full h-full"
                      style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-indigo-50/90 via-purple-50/60 to-white border border-indigo-100 rounded-[28px] p-6 shadow-[0_15px_30px_rgba(99,102,241,0.06)] relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-4 right-4 bg-indigo-500/10 text-indigo-600 text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-0.5 rounded-full border border-indigo-200/50">
                          Independent
                        </div>

                        <div className={`flex items-center gap-3.5 mt-2 p-1 rounded-xl transition-all duration-300 ${
                          hoveredFeature === "brand" ? "ring-2 ring-indigo-500 ring-offset-2 scale-105 bg-indigo-50/30" : ""
                        }`}>
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-base font-bold shadow-sm">
                            AR
                          </div>
                          <div className="text-left">
                            <h4 className="text-sm font-extrabold text-zinc-900 leading-snug">Alex River</h4>
                            <p className="text-[10px] text-zinc-500 font-bold">@alexriver</p>
                            <div className="flex gap-1.5 mt-1">
                              <span className="text-[8px] font-bold px-1.5 py-0.5 bg-indigo-50/70 text-indigo-600 rounded border border-indigo-100/50">Instructor</span>
                              <span className="text-[8px] font-bold px-1.5 py-0.5 bg-purple-50/70 text-purple-600 rounded border border-purple-100/50">WebGL</span>
                            </div>
                          </div>
                        </div>

                        <div className={`grid grid-cols-2 gap-3.5 bg-white/70 border border-zinc-200/50 rounded-2xl p-3 my-3 transition-all duration-300 ${
                          hoveredFeature === "reach" ? "ring-2 ring-indigo-500 ring-offset-2 scale-105 bg-indigo-50/30" : ""
                        }`}>
                          <div className="text-center">
                            <span className="block text-sm font-black text-indigo-600">14.8k</span>
                            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">Students</span>
                          </div>
                          <div className="text-center border-l border-zinc-100">
                            <span className="block text-sm font-black text-indigo-600">4.9 ★</span>
                            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">Rating</span>
                          </div>
                        </div>

                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          className={`bg-white/95 border rounded-xl p-3 flex items-center gap-3 shadow-xs cursor-pointer transition-all duration-300 ${
                            hoveredFeature === "pricing" || hoveredFeature === "control" 
                              ? "ring-2 ring-indigo-500 ring-offset-2 scale-105 border-indigo-200" 
                              : "border-zinc-200/40"
                          }`}
                        >
                          <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center text-white text-[10px] font-black">
                            TS
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <h5 className="text-[10px] font-extrabold text-zinc-900 truncate">Advanced TS Architectures</h5>
                            <p className="text-[8.5px] font-bold text-indigo-600">$49.00 USD</p>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Back Side: Organization Mockup */}
                    <div 
                      className="absolute inset-0 w-full h-full"
                      style={{ 
                        backfaceVisibility: "hidden", 
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)" 
                      }}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-teal-50/90 via-indigo-50/60 to-white border border-teal-100 rounded-[28px] p-6 shadow-[0_15px_30px_rgba(20,184,166,0.06)] relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-4 right-4 bg-teal-500/10 text-teal-700 text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-0.5 rounded-full border border-teal-200/50">
                          Organization
                        </div>

                        <div className={`flex items-center gap-3.5 mt-2 p-1 rounded-xl transition-all duration-300 ${
                          hoveredFeature === "brand" ? "ring-2 ring-teal-500 ring-offset-2 scale-105 bg-teal-50/30" : ""
                        }`}>
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-sm">
                            CX
                          </div>
                          <div className="text-left">
                            <h4 className="text-sm font-extrabold text-zinc-900 leading-snug">Codex Academy</h4>
                            <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full mt-1 inline-block transition-all duration-300 ${
                              hoveredFeature === "domain" ? "bg-teal-500 text-white border-teal-500 scale-105" : "bg-teal-50/70 text-teal-700 border-teal-100/50"
                            }`}>academy.codex.io</span>
                          </div>
                        </div>

                        <div className={`flex flex-col gap-2 my-3 p-1.5 rounded-xl transition-all duration-300 ${
                          hoveredFeature === "authors" ? "ring-2 ring-teal-500 ring-offset-2 scale-105 bg-teal-50/30" : ""
                        }`}>
                          <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider text-left">Authors Directory</span>
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-[8px] font-extrabold text-white">AJ</div>
                              <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-[8px] font-extrabold text-white">RD</div>
                              <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] font-extrabold text-white">SC</div>
                            </div>
                            <span className="text-[9px] font-bold text-zinc-500">3 instructors managed</span>
                          </div>
                        </div>

                        <div className={`bg-white/95 border rounded-xl p-3 flex justify-between items-center gap-2 shadow-xs transition-all duration-300 ${
                          hoveredFeature === "reach" ? "ring-2 ring-teal-500 ring-offset-2 scale-105 border-teal-200" : "border-zinc-200/40"
                        }`}>
                          <div className="text-left">
                            <span className="text-[7.5px] font-bold text-zinc-400 uppercase tracking-wider block leading-none mb-1">Global Reach</span>
                            <span className="text-[10px] font-black text-teal-600">84,500 students enrolled</span>
                          </div>
                          <div className="flex gap-1 items-end h-7 justify-end">
                            <motion.div 
                              initial={{ height: "0%" }} 
                              animate={{ height: activePubTab === "org" ? "40%" : "0%" }} 
                              transition={{ delay: 0.1, type: "spring", stiffness: 80 }} 
                              className="w-1.5 bg-teal-400 rounded-full" 
                            />
                            <motion.div 
                              initial={{ height: "0%" }} 
                              animate={{ height: activePubTab === "org" ? "70%" : "0%" }} 
                              transition={{ delay: 0.2, type: "spring", stiffness: 80 }} 
                              className="w-1.5 bg-teal-500 rounded-full" 
                            />
                            <motion.div 
                              initial={{ height: "0%" }} 
                              animate={{ height: activePubTab === "org" ? "100%" : "0%" }} 
                              transition={{ delay: 0.3, type: "spring", stiffness: 80 }} 
                              className="w-1.5 bg-indigo-500 rounded-full" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
