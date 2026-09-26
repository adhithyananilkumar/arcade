"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion, Variants, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Check,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import "@/apps/public/landing.css";

import { api } from "@/infrastructure/http/api";
import { toast } from "sonner";

// Subtle stagger reveal variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.05,
      ease: [0.215, 0.61, 0.355, 1],
    },
  }),
};

const SUBJECT_OPTIONS = [
  "General Inquiry",
  "Courses & Events",
  "Hackathons & Events",
  "Technical Support",
  "Partnership / Creator Inquiry",
];

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
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectSubject = (val: string) => {
    setFormState((prev) => ({ ...prev, subject: val }));
    setIsSelectOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.subject) {
      toast.error("Please select a subject topic.");
      return;
    }
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
    <div className="relative min-h-[calc(100vh-120px)] flex flex-col justify-center text-[#0f172a] font-sans pt-32 sm:pt-36 lg:pt-40 pb-16 sm:pb-20 px-6 sm:px-12 lg:px-16 selection:bg-blue-100 selection:text-blue-900 bg-transparent">
      {/* EVENLY DISTRIBUTED CONTINUOUS PASTEL MESH (SKY BLUE, MINT, WARM YELLOW, LIGHT LAVENDER) */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden"
        style={{
          backgroundColor: "#FAFBFD",
          backgroundImage: `
            radial-gradient(ellipse 75% 55% at 15% 20%, rgba(224, 236, 255, 0.45) 0%, transparent 65%),
            radial-gradient(ellipse 75% 55% at 85% 20%, rgba(215, 248, 238, 0.45) 0%, transparent 65%),
            radial-gradient(ellipse 75% 55% at 50% 50%, rgba(254, 243, 199, 0.45) 0%, transparent 65%),
            radial-gradient(ellipse 75% 55% at 15% 80%, rgba(235, 228, 255, 0.42) 0%, transparent 65%),
            radial-gradient(ellipse 75% 55% at 85% 80%, rgba(220, 248, 228, 0.45) 0%, transparent 65%),
            linear-gradient(
              180deg,
              #FAFBFD 0%,
              #F8FBFA 50%,
              #FAF9FB 100%
            )
          `,
        }}
      />

      <div className="max-w-6xl mx-auto w-full my-auto relative z-10 pt-2 sm:pt-4">
        {/* BALANCED TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT SIDE — CONTACT INFO */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* STYLISH PROMINENT HEADING */}
            <motion.h1
              initial={shouldReduceMotion ? {} : "hidden"}
              animate="visible"
              custom={0}
              variants={fadeInUp as any}
              className="text-5xl sm:text-6xl lg:text-[62px] tracking-tight text-[#0B132B] leading-[1.02] font-serif"
            >
              <span className="font-bold text-[#0B132B]">Let's</span>{" "}
              <span className="italic font-normal bg-gradient-to-r from-[#205ca8] to-[#3b82f6] bg-clip-text text-transparent">
                talk.
              </span>
            </motion.h1>

            {/* INTRO PARAGRAPH */}
            <motion.p
              initial={shouldReduceMotion ? {} : "hidden"}
              animate="visible"
              custom={1}
              variants={fadeInUp as any}
              className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md font-normal"
            >
              Have a question, an idea, or something you'd like to explore? We'd love to hear from you.
            </motion.p>

            {/* CONTACT DETAILS LIST */}
            <div className="space-y-4 pt-1">
              {/* EMAIL */}
              <motion.div
                initial={shouldReduceMotion ? {} : "hidden"}
                animate="visible"
                custom={2}
                variants={fadeInUp as any}
                className="group"
              >
                <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400 mb-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#205ca8] transition-colors" />
                  <span>Email</span>
                </div>
                <a
                  href="mailto:arcade@amaljyothi.ac.in"
                  className="text-sm sm:text-base font-normal text-slate-700 hover:text-[#205ca8] transition-colors inline-flex items-center gap-1.5 group/link"
                >
                  <span className="group-hover/link:underline underline-offset-2">arcade@amaljyothi.ac.in</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-[#205ca8] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all shrink-0" />
                </a>
              </motion.div>

              {/* PHONE */}
              <motion.div
                initial={shouldReduceMotion ? {} : "hidden"}
                animate="visible"
                custom={3}
                variants={fadeInUp as any}
                className="group"
              >
                <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400 mb-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#205ca8] transition-colors" />
                  <span>Phone</span>
                </div>
                <a
                  href="tel:+914828251661"
                  className="text-sm sm:text-base font-normal text-slate-700 hover:text-[#205ca8] transition-colors inline-flex items-center gap-1.5 group/link"
                >
                  <span className="group-hover/link:underline underline-offset-2">+91 (04828) 251661</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-[#205ca8] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all shrink-0" />
                </a>
              </motion.div>

              {/* LOCATION */}
              <motion.div
                initial={shouldReduceMotion ? {} : "hidden"}
                animate="visible"
                custom={4}
                variants={fadeInUp as any}
                className="group pt-0.5"
              >
                <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400 mb-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#205ca8] transition-colors" />
                  <span>Location</span>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Amal+Jyothi+College+of+Engineering,+Kanjirappally,+Kottayam,+Kerala"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group/link"
                >
                  <p className="text-sm sm:text-base font-normal text-slate-700 group-hover/link:text-[#205ca8] transition-colors inline-flex items-center gap-1.5">
                    <span className="group-hover/link:underline underline-offset-2">Amal Jyothi College of Engineering</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-[#205ca8] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all shrink-0" />
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">
                    Kanjirappally, Kottayam, Kerala 686518
                  </p>
                </a>
              </motion.div>

              {/* WORKING HOURS */}
              <motion.div
                initial={shouldReduceMotion ? {} : "hidden"}
                animate="visible"
                custom={5}
                variants={fadeInUp as any}
                className="pt-0.5"
              >
                <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400 mb-0.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Office Hours</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-normal">
                  Monday – Friday · 9:00 AM – 5:00 PM IST
                </p>
              </motion.div>
            </div>

          </div>

          {/* RIGHT SIDE — FORM */}
          <div className="lg:col-span-7 lg:pl-6">
            <motion.div
              initial={shouldReduceMotion ? {} : "hidden"}
              animate="visible"
              custom={1}
              variants={fadeInUp as any}
              className="space-y-6"
            >
              {/* SUBMISSION CONFIRMATION */}
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-10 space-y-3"
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
                      className="text-xs uppercase tracking-wider text-[#205ca8] font-medium hover:underline"
                    >
                      ← Send another message
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* FORM */
                <form onSubmit={handleSubmit} className="space-y-5 pt-1">
                  
                  {/* NAME + EMAIL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <motion.div
                      custom={2}
                      variants={fadeInUp as any}
                      className="space-y-1.5"
                    >
                      <label
                        htmlFor="name"
                        className="block text-xs uppercase tracking-wider text-slate-500 font-medium"
                      >
                        Name <span className="text-blue-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formState.name}
                        onChange={handleChange}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-900 text-sm sm:text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#205ca8]/15 focus:border-[#205ca8] transition-all"
                      />
                    </motion.div>

                    <motion.div
                      custom={3}
                      variants={fadeInUp as any}
                      className="space-y-1.5"
                    >
                      <label
                        htmlFor="email"
                        className="block text-xs uppercase tracking-wider text-slate-500 font-medium"
                      >
                        Email <span className="text-blue-600">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formState.email}
                        onChange={handleChange}
                        placeholder="rahul@example.com"
                        className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-900 text-sm sm:text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#205ca8]/15 focus:border-[#205ca8] transition-all"
                      />
                    </motion.div>
                  </div>

                  {/* CUSTOM STYLED SUBJECT DROPDOWN */}
                  <motion.div
                    custom={4}
                    variants={fadeInUp as any}
                    className="space-y-1.5 relative"
                    ref={dropdownRef}
                  >
                    <label
                      className="block text-xs uppercase tracking-wider text-slate-500 font-medium"
                    >
                      Subject <span className="text-blue-600">*</span>
                    </label>

                    {/* Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setIsSelectOpen(!isSelectOpen)}
                      className={`w-full px-4 py-3 bg-white/70 border rounded-xl text-sm sm:text-base flex items-center justify-between text-left transition-all ${
                        isSelectOpen
                          ? "border-[#205ca8] ring-2 ring-[#205ca8]/15 bg-white"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className={formState.subject ? "text-slate-900 font-normal" : "text-slate-400"}>
                        {formState.subject || "Select a topic..."}
                      </span>
                      <ChevronDown
                        className={`w-4.5 h-4.5 text-slate-400 transition-transform duration-200 ${
                          isSelectOpen ? "rotate-180 text-[#205ca8]" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isSelectOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.98 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute z-40 top-full left-0 right-0 mt-1.5 p-1.5 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-xl shadow-xl shadow-slate-900/10 space-y-0.5 overflow-hidden"
                        >
                          {SUBJECT_OPTIONS.map((option) => {
                            const isSelected = formState.subject === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => handleSelectSubject(option)}
                                className={`w-full px-3.5 py-2.5 rounded-lg text-sm sm:text-base text-left flex items-center justify-between transition-colors ${
                                  isSelected
                                    ? "bg-blue-50/80 text-[#205ca8] font-medium"
                                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/70"
                                }`}
                              >
                                <span>{option}</span>
                                {isSelected && <Check className="w-4 h-4 text-[#205ca8]" />}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* MESSAGE */}
                  <motion.div
                    custom={5}
                    variants={fadeInUp as any}
                    className="space-y-1.5"
                  >
                    <label
                      htmlFor="message"
                      className="block text-xs uppercase tracking-wider text-slate-500 font-medium"
                    >
                      Message <span className="text-blue-600">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      value={formState.message}
                      onChange={handleChange}
                      placeholder="Tell us about your query or proposal..."
                      className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-900 text-sm sm:text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#205ca8]/15 focus:border-[#205ca8] transition-all resize-none min-h-[135px] h-[135px]"
                    />
                  </motion.div>

                  {/* SUBMIT BUTTON */}
                  <motion.div
                    custom={6}
                    variants={fadeInUp as any}
                    className="pt-2"
                  >
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#0B132B] hover:bg-[#205ca8] text-white font-medium text-sm sm:text-base tracking-wide shadow-sm hover:shadow-md transition-all duration-300 ease-out group disabled:opacity-70 disabled:cursor-not-allowed"
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
