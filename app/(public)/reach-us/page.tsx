"use client";

import React, { useState } from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  Send,
  ArrowUpRight,
} from "lucide-react";
import "@/apps/public/landing.css";

import { api } from "@/infrastructure/http/api";
import { toast } from "sonner";

// Subtle stagger reveal variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: i * 0.07,
      ease: [0.215, 0.61, 0.355, 1],
    },
  }),
};

export default function ReachUsPage() {
  const shouldReduceMotion = useReducedMotion();

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post("/api/v1/public/contact", formState);
      setIsSubmitted(true);
      setFormState({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-root min-h-[calc(100vh-120px)] flex flex-col justify-center relative text-[#0f172a] font-sans pt-24 sm:pt-28 lg:pt-32 pb-16 px-6 sm:px-12 lg:px-16 selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      {/* EXTREMELY SUBTLE PASTEL ATMOSPHERIC BACKGROUND */}
      <div
        className="fixed inset-0 pointer-events-none -z-20"
        style={{
          backgroundColor: "#FAFBFD",
          backgroundImage: `
            radial-gradient(ellipse 70% 40% at 50% 0%, rgba(224, 236, 255, 0.35) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 10% 25%, rgba(233, 225, 254, 0.25) 0%, transparent 65%),
            radial-gradient(ellipse 60% 40% at 90% 75%, rgba(253, 232, 240, 0.20) 0%, transparent 65%),
            linear-gradient(
              180deg,
              #FAFBFD 0%,
              #F6F8FD 35%,
              #F8F6FD 70%,
              #FAF9FB 100%
            )
          `,
        }}
      />

      {/* TOP RIGHT DECORATIVE CONCENTRIC CIRCULAR ARCS */}
      <div className="absolute top-0 right-0 w-[420px] h-[420px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-80px] right-[-80px] w-[320px] h-[320px] rounded-full bg-blue-100/60 blur-3xl" />
        <svg
          className="w-full h-full text-blue-300/40"
          viewBox="0 0 420 420"
          fill="none"
        >
          <circle cx="420" cy="0" r="160" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="420" cy="0" r="230" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="420" cy="0" r="300" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="w-full max-w-[1240px] mx-auto my-auto relative z-10">
        {/* EDITORIAL TWO-COLUMN COMPOSITION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT SIDE — CONTACT EDITORIAL & INFO (5 COLS, LIFTED 2.5CM, SHIFTED RIGHT 0.2CM) */}
          <div className="lg:col-span-5 space-y-8 relative -mt-8 sm:-mt-10 lg:-mt-[2.5cm] translate-x-[0.2cm]">
            
            {/* TIER 1: HEADING & SUBTITLE */}
            <div>
              {/* HEADING: "Let's talk." */}
              <motion.h1
                initial={shouldReduceMotion ? {} : "hidden"}
                animate="visible"
                custom={1}
                variants={fadeInUp as any}
                className="text-5xl sm:text-6xl lg:text-[62px] tracking-tight text-[#0B132B] leading-none font-serif mb-4 sm:mb-5"
              >
                <span className="font-bold text-[#0B132B]">Let's</span>{" "}
                <span className="italic font-normal text-[#2563eb]">talk.</span>
              </motion.h1>

              {/* INTRO PARAGRAPH */}
              <motion.p
                initial={shouldReduceMotion ? {} : "hidden"}
                animate="visible"
                custom={2}
                variants={fadeInUp as any}
                className="text-sm sm:text-[15px] text-slate-500 font-medium leading-relaxed max-w-[390px] pl-2"
              >
                Have a question, an idea, or something you'd like to explore?
              </motion.p>
            </div>

            {/* TIER 2: CONTACT ITEMS */}
            <motion.div
              initial={shouldReduceMotion ? {} : "hidden"}
              animate="visible"
              custom={3}
              variants={fadeInUp as any}
              className="space-y-6 max-w-[440px]"
            >
              {/* EMAIL */}
              <div className="space-y-1 group">
                <span className="block text-xs font-sans font-semibold uppercase tracking-wider text-slate-500">
                  Email Us
                </span>
                <a
                  href="mailto:arcade@ajce.in"
                  className="inline-flex items-center gap-1.5 text-base sm:text-[17px] font-bold text-[#0B132B] hover:text-[#2563eb] transition-colors leading-tight"
                >
                  <span>arcade@ajce.in</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2563eb] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </a>
              </div>

              {/* LOCATION & SITE LINK */}
              <div className="space-y-1 group">
                <span className="block text-xs font-sans font-semibold uppercase tracking-wider text-slate-500">
                  Visit Us
                </span>
                <div>
                  <a
                    href="https://ajce.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-base sm:text-[17px] font-bold text-[#0B132B] hover:text-[#2563eb] transition-colors leading-tight"
                  >
                    <span>Amal Jyothi College of Engineering</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2563eb] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                  </a>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Amal+Jyothi+College+of+Engineering,+Kanjirappally,+Kottayam,+Kerala"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs sm:text-[13px] text-slate-600 font-normal leading-snug pt-1 hover:text-[#2563eb] transition-colors"
                  >
                    Kanjirappally, Kottayam, Kerala 686518
                  </a>
                </div>
              </div>

              {/* HOURS */}
              <div className="space-y-1">
                <span className="block text-xs font-sans font-semibold uppercase tracking-wider text-slate-500">
                  Office Hours
                </span>
                <p className="text-xs sm:text-sm text-slate-700 font-normal leading-tight">
                  Monday – Friday · 9:00 AM – 5:00 PM IST
                </p>
              </div>
            </motion.div>

          </div>

          {/* RIGHT SIDE — ENCLOSED LIGHT TRANSPARENT FORM CARD (7 COLS) */}
          <div className="lg:col-span-7">
            <motion.div
              initial={shouldReduceMotion ? {} : "hidden"}
              animate="visible"
              custom={2}
              variants={fadeInUp as any}
              className="relative z-10"
            >
              {/* SUBMISSION CONFIRMATION */}
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-12 space-y-4 text-center sm:text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 mx-auto sm:mx-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-normal font-serif italic text-[#0B132B]">
                    Message Received.
                  </h3>
                  <p className="text-slate-600 text-sm max-w-sm leading-relaxed mx-auto sm:mx-0">
                    Thank you for contacting Arcade AJCE. We have received your inquiry and will follow up shortly via email.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="text-xs font-sans uppercase tracking-wider text-[#2563eb] font-bold hover:underline cursor-pointer"
                    >
                      ← Send another message
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* CONTACT FORM (CLEAN UNDERLINE INPUTS, NO BOXES) */
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* NAME + EMAIL SAME ROW */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* YOUR NAME */}
                    <motion.div
                      custom={3}
                      variants={fadeInUp as any}
                      className="space-y-1"
                    >
                      <label
                        htmlFor="name"
                        className="block text-xs font-sans font-semibold uppercase tracking-wider text-slate-500"
                      >
                        YOUR NAME <span className="text-[#2563eb]">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formState.name}
                        onChange={handleChange}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full py-1 bg-transparent border-b border-slate-300 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#2563eb] transition-colors"
                      />
                    </motion.div>

                    {/* EMAIL ADDRESS */}
                    <motion.div
                      custom={4}
                      variants={fadeInUp as any}
                      className="space-y-1"
                    >
                      <label
                        htmlFor="email"
                        className="block text-xs font-sans font-semibold uppercase tracking-wider text-slate-500"
                      >
                        EMAIL ADDRESS <span className="text-[#2563eb]">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formState.email}
                        onChange={handleChange}
                        placeholder="rahul@example.com"
                        className="w-full py-1 bg-transparent border-b border-slate-300 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#2563eb] transition-colors"
                      />
                    </motion.div>
                  </div>

                  {/* SUBJECT */}
                  <motion.div
                    custom={5}
                    variants={fadeInUp as any}
                    className="space-y-1"
                  >
                    <label
                      htmlFor="subject"
                      className="block text-xs font-sans font-semibold uppercase tracking-wider text-slate-500"
                    >
                      SUBJECT <span className="text-[#2563eb]">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formState.subject}
                        onChange={handleChange}
                        className={`w-full py-1 pr-6 bg-transparent border-b border-slate-300 text-sm focus:outline-none focus:border-[#2563eb] transition-colors cursor-pointer appearance-none ${
                          formState.subject ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        <option value="" disabled className="text-slate-400">
                          Select a topic...
                        </option>
                        <option value="General Inquiry" className="text-slate-900">General Inquiry</option>
                        <option value="Courses & Events" className="text-slate-900">Courses & Events</option>
                        <option value="Hackathons & Events" className="text-slate-900">Hackathons & Events</option>
                        <option value="Technical Support" className="text-slate-900">Technical Support</option>
                        <option value="Partnership / Creator Inquiry" className="text-slate-900">
                          Partnership / Creator Inquiry
                        </option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-1" />
                    </div>
                  </motion.div>

                  {/* MESSAGE */}
                  <motion.div
                    custom={6}
                    variants={fadeInUp as any}
                    className="space-y-2 pt-1"
                  >
                    <label
                      htmlFor="message"
                      className="block text-xs font-sans font-semibold uppercase tracking-wider text-slate-500"
                    >
                      MESSAGE <span className="text-[#2563eb]">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formState.message}
                      onChange={handleChange}
                      placeholder="Tell us about your query or proposal..."
                      className="w-full p-4 bg-white/70 backdrop-blur-sm border border-slate-200/90 rounded-2xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/15 focus:border-[#2563eb] shadow-[0_2px_8px_rgba(15,23,42,0.02)] transition-all resize-none min-h-[130px]"
                    />
                  </motion.div>

                  {/* SEND MESSAGE BUTTON - LEFT-ALIGNED */}
                  <motion.div
                    custom={7}
                    variants={fadeInUp as any}
                    className="flex justify-start pt-2"
                  >
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="relative inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-black hover:bg-neutral-900 text-white font-medium text-sm tracking-wide shadow-sm hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300 ease-out group disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-white/90" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
