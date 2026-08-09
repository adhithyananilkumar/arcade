"use client";

import React, { useState } from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import "@/apps/public/landing.css";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormState({ name: "", email: "", subject: "", message: "" });
    }, 800);
  };

  return (
    <div className="landing-root min-h-[calc(100vh-140px)] flex flex-col justify-center relative text-[#0f172a] font-sans pt-28 sm:pt-32 lg:pt-36 pb-16 lg:pb-20 px-6 sm:px-12 lg:px-20 selection:bg-blue-100 selection:text-blue-900">
      {/* EXTREMELY SUBTLE PASTEL ATMOSPHERIC BACKGROUND */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          backgroundColor: "#FAFBFD",
          backgroundImage: `
            radial-gradient(ellipse 70% 40% at 50% 0%, rgba(224, 236, 255, 0.25) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 10% 25%, rgba(233, 225, 254, 0.20) 0%, transparent 65%),
            radial-gradient(ellipse 60% 40% at 90% 75%, rgba(253, 232, 240, 0.18) 0%, transparent 65%),
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

      <div className="w-[84vw] max-w-[1400px] mx-auto w-full my-auto">
        {/* EDITORIAL TWO-COLUMN COMPOSITION (LEFT ~46% / RIGHT ~54%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* LEFT SIDE — SHIFTED UPWARD (~60PX) AS ONE COHESIVE GROUP (~46%) */}
          <div className="lg:col-span-5 -mt-4 lg:-mt-14">
            
            {/* SINGLE HORIZONTAL LINE HEADING: "Let's talk." (FIRST ELEMENT) */}
            <motion.h1
              initial={shouldReduceMotion ? {} : "hidden"}
              animate="visible"
              custom={0}
              variants={fadeInUp as any}
              className="text-4xl sm:text-5xl lg:text-[56px] tracking-tight text-[#0B132B] leading-[1.08] font-serif whitespace-nowrap mb-8"
            >
              <span className="font-bold text-[#0B132B]">Let's</span>{" "}
              <span className="italic font-normal text-[#205ca8]">talk.</span>
            </motion.h1>

            {/* INTRO PARAGRAPH */}
            <motion.p
              initial={shouldReduceMotion ? {} : "hidden"}
              animate="visible"
              custom={2}
              variants={fadeInUp as any}
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-[480px] font-normal mb-12"
            >
              Have a question, an idea, or something you'd like to explore? We'd love to hear from you.
            </motion.p>

            {/* SUBTLE HORIZONTAL SEPARATOR */}
            <motion.span
              initial={shouldReduceMotion ? {} : "hidden"}
              animate="visible"
              custom={3}
              variants={fadeInUp as any}
              className="block h-px w-full max-w-xs bg-slate-200/80 mb-8"
            />

            {/* PRIMARY EDITORIAL CONTACT LINKS (EMAIL & PHONE) */}
            <div className="mb-[52px]">
              {/* EMAIL */}
              <motion.div
                initial={shouldReduceMotion ? {} : "hidden"}
                animate="visible"
                custom={4}
                variants={fadeInUp as any}
                className="group mb-7"
              >
                <a
                  href="mailto:arcade@amaljyothi.ac.in"
                  className="text-base sm:text-lg font-bold text-[#0B132B] hover:text-[#205ca8] hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 font-bricolage leading-snug"
                >
                  <span>arcade@amaljyothi.ac.in</span>
                  <ArrowUpRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-[#205ca8] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </a>
              </motion.div>

              {/* PHONE */}
              <motion.div
                initial={shouldReduceMotion ? {} : "hidden"}
                animate="visible"
                custom={5}
                variants={fadeInUp as any}
                className="group"
              >
                <a
                  href="tel:+914828251661"
                  className="text-base sm:text-lg font-bold text-[#0B132B] hover:text-[#205ca8] hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 font-bricolage leading-snug"
                >
                  <span>+91 (04828) 251661</span>
                  <ArrowUpRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-[#205ca8] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </a>
              </motion.div>
            </div>

            {/* CLICKABLE LOCATION LINK ADDRESS & WORKING HOURS */}
            <motion.div
              initial={shouldReduceMotion ? {} : "hidden"}
              animate="visible"
              custom={6}
              variants={fadeInUp as any}
              className="space-y-0"
            >
              {/* CLICKABLE LOCATION LINK ADDRESS */}
              <a
                href="https://www.google.com/maps/search/?api=1&query=Amal+Jyothi+College+of+Engineering,+Kanjirappally,+Kottayam,+Kerala"
                target="_blank"
                rel="noopener noreferrer"
                className="group block transition-all hover:-translate-y-0.5 cursor-pointer space-y-0.5 mb-[30px]"
              >
                <p className="text-base sm:text-lg font-bold text-[#0B132B] group-hover:text-[#205ca8] font-bricolage leading-snug transition-colors inline-flex items-center gap-1.5">
                  <span>Amal Jyothi College of Engineering</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#205ca8] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Kanjirappally, Kottayam, Kerala 686518
                </p>
              </a>

              {/* SEPARATE WORKING HOURS */}
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-snug pt-6 border-t border-slate-200/60">
                Monday – Friday · 9:00 AM – 5:00 PM IST
              </p>
            </motion.div>

          </div>

          {/* RIGHT SIDE — EDITORIAL ACTION / FORM EXPERIENCE (~54%) — UNCHANGED */}
          <div className="lg:col-span-7 lg:pl-6">
            <motion.div
              initial={shouldReduceMotion ? {} : "hidden"}
              animate="visible"
              custom={2}
              variants={fadeInUp as any}
              className="space-y-8"
            >
              {/* FORM HEADING & SHORT SUPPORTING TEXT */}
              <div className="space-y-2.5 pb-5 border-b border-slate-200/70">
                <h2 className="text-3xl sm:text-4xl font-normal font-serif italic text-[#0B132B] tracking-tight leading-snug">
                  Tell us what's on your mind.
                </h2>
                <span className="block h-0.5 w-10 bg-[#205ca8]/60 rounded-full" />
                <p className="text-sm text-slate-500 leading-relaxed pt-0.5">
                  Tell us a little about what you need. We'll get back to you soon.
                </p>
              </div>

              {/* SUBMISSION CONFIRMATION */}
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-12 space-y-4"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-normal font-serif italic text-[#0B132B]">
                    Message Received.
                  </h3>
                  <p className="text-slate-600 text-sm max-w-sm leading-relaxed">
                    Thank you for contacting Arcade AJCE. We have received your inquiry and will follow up shortly via email.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="text-xs font-mono uppercase tracking-wider text-[#205ca8] font-bold hover:underline"
                    >
                      ← Send another message
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* OPEN EDITORIAL FORM (NO OUTER CARD) */
                <form onSubmit={handleSubmit} className="space-y-7">
                  
                  {/* NAME + EMAIL SAME ROW ON DESKTOP */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                    <motion.div
                      custom={3}
                      variants={fadeInUp as any}
                      className="space-y-2"
                    >
                      <label
                        htmlFor="name"
                        className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold"
                      >
                        YOUR NAME <span className="text-blue-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formState.name}
                        onChange={handleChange}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full py-3 bg-transparent border-b border-slate-300 text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:border-[#205ca8] transition-colors"
                      />
                    </motion.div>

                    <motion.div
                      custom={4}
                      variants={fadeInUp as any}
                      className="space-y-2"
                    >
                      <label
                        htmlFor="email"
                        className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold"
                      >
                        EMAIL ADDRESS <span className="text-blue-600">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formState.email}
                        onChange={handleChange}
                        placeholder="rahul@example.com"
                        className="w-full py-3 bg-transparent border-b border-slate-300 text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:border-[#205ca8] transition-colors"
                      />
                    </motion.div>
                  </div>

                  {/* SUBJECT */}
                  <motion.div
                    custom={5}
                    variants={fadeInUp as any}
                    className="space-y-2"
                  >
                    <label
                      htmlFor="subject"
                      className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold"
                    >
                      SUBJECT <span className="text-blue-600">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formState.subject}
                      onChange={handleChange}
                      className="w-full py-3 bg-transparent border-b border-slate-300 text-slate-900 text-base focus:outline-none focus:border-[#205ca8] transition-colors cursor-pointer"
                    >
                      <option value="" disabled className="text-slate-400">
                        Select a topic...
                      </option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Courses & Workshops">Courses & Workshops</option>
                      <option value="Hackathons & Events">Hackathons & Events</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Partnership / Creator Inquiry">
                        Partnership / Creator Inquiry
                      </option>
                    </select>
                  </motion.div>

                  {/* MESSAGE (CLEARLY VISIBLE TEXTAREA ~160PX) */}
                  <motion.div
                    custom={6}
                    variants={fadeInUp as any}
                    className="space-y-2"
                  >
                    <label
                      htmlFor="message"
                      className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold"
                    >
                      MESSAGE <span className="text-blue-600">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formState.message}
                      onChange={handleChange}
                      placeholder="Tell us about your query or proposal..."
                      className="w-full px-4 py-3 bg-white/50 border border-slate-300/80 rounded-xl text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#205ca8]/15 focus:border-[#205ca8] transition-all resize-none min-h-[160px] h-[160px]"
                    />
                  </motion.div>

                  {/* SEND MESSAGE BUTTON */}
                  <motion.div
                    custom={7}
                    variants={fadeInUp as any}
                    className="pt-4"
                  >
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#0B132B] hover:bg-[#205ca8] text-white font-medium text-sm tracking-wide shadow-sm hover:shadow-md transition-all duration-300 ease-out group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <span className="w-5 h-5 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                            <ArrowUpRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </span>
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
