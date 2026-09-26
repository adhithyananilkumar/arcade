"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  CheckCircle2,
  X,
  MessageSquare,
  ArrowRight,
  Building2,
  User,
  Sparkles,
} from "lucide-react";

type UserType = "Individual" | "Organization";
type TopicType = "Fees & Pricing" | "Certifications" | "Duration" | "Schedules" | "Course Outline";

export default function CreatorEnquiry() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [userType, setUserType] = useState<UserType>("Individual");
  const [selectedTopics, setSelectedTopics] = useState<TopicType[]>(["Course Outline"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  const topicsList: TopicType[] = [
    "Fees & Pricing",
    "Certifications",
    "Duration",
    "Schedules",
    "Course Outline",
  ];

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleTopicToggle = (topic: TopicType) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!message.trim()) newErrors.message = "Message details are required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setMessage("");
    setUserType("Individual");
    setSelectedTopics(["Course Outline"]);
    setIsSubmitted(false);
    setErrors({});
  };

  return (
    <>
      {/* Centered Single Trigger Button */}
      <section className="pt-0 pb-6 sm:pb-8 -mt-4 sm:-mt-6 relative z-10 flex justify-center" id="enquiry">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#0B132B] hover:bg-[#205ca8] text-white font-medium text-xs sm:text-sm shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-blue-200 group-hover:text-white transition-colors" />
            <span>Have a Question? Let's Connect</span>
            <ArrowRight className="w-4 h-4 text-blue-200 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* Inquiry Desk Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* Modal Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-4xl bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 my-auto z-10 overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer z-20"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                
                {/* Left Column: Context & Editorial Copy */}
                <div className="lg:col-span-5 flex flex-col justify-start space-y-4 text-left pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span>Inquiry Desk</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-serif text-[#0B132B] tracking-tight leading-[1.12]">
                    Have a question? <br />
                    <span className="italic font-normal bg-gradient-to-r from-[#205ca8] to-[#3b82f6] bg-clip-text text-transparent">
                      Let's connect.
                    </span>
                  </h2>

                  <p className="text-sm text-slate-600 font-normal leading-relaxed">
                    Have questions about fees, course formats, or quality reviews? Reach out directly to our team with zero enrollment commitment.
                  </p>

                  <div className="pt-2 hidden lg:block text-xs text-slate-400 border-t border-slate-100 space-y-1.5">
                    <p className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Average response time: &lt; 2 hours</span>
                    </p>
                    <p>Monday – Friday · 9:00 AM – 5:00 PM IST</p>
                  </div>
                </div>

                {/* Right Column: Clean Form */}
                <div className="lg:col-span-7">
                  <AnimatePresence mode="wait">
                    {!isSubmitted ? (
                      <motion.form
                        key="enquiry-form"
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-4 text-left"
                      >
                        {/* 1. Identification: Name & Email */}
                        <div className="space-y-1.5">
                          <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium">
                            Your Information <span className="text-blue-600">*</span>
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Full Name"
                                className={`w-full px-3.5 py-2.5 bg-slate-50/70 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#205ca8]/15 focus:border-[#205ca8] transition-all ${
                                  errors.name ? "border-rose-300 ring-2 ring-rose-500/10" : "border-slate-200"
                                }`}
                              />
                              {errors.name && (
                                <p className="text-[11px] text-rose-500 mt-1 font-normal">{errors.name}</p>
                              )}
                            </div>

                            <div>
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                className={`w-full px-3.5 py-2.5 bg-slate-50/70 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#205ca8]/15 focus:border-[#205ca8] transition-all ${
                                  errors.email ? "border-rose-300 ring-2 ring-rose-500/10" : "border-slate-200"
                                }`}
                              />
                              {errors.email && (
                                <p className="text-[11px] text-rose-500 mt-1 font-normal">{errors.email}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 2. Account Profile Type (Segmented control) */}
                        <div className="space-y-1.5">
                          <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium">
                            Profile Type
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {(["Individual", "Organization"] as UserType[]).map((type) => {
                              const isSelected = userType === type;
                              return (
                                <button
                                  type="button"
                                  key={type}
                                  onClick={() => setUserType(type)}
                                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 border ${
                                    isSelected
                                      ? "bg-blue-50/80 border-blue-200 text-[#205ca8] shadow-2xs font-semibold"
                                      : "bg-slate-50/60 border-slate-200/90 text-slate-600 hover:bg-slate-100/70"
                                  }`}
                                >
                                  {type === "Individual" ? (
                                    <User className="w-3.5 h-3.5" />
                                  ) : (
                                    <Building2 className="w-3.5 h-3.5" />
                                  )}
                                  <span>{type}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 3. Topics (Clean Chips) */}
                        <div className="space-y-1.5">
                          <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium">
                            Topics of Interest
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {topicsList.map((topic) => {
                              const isSelected = selectedTopics.includes(topic);
                              return (
                                <button
                                  type="button"
                                  key={topic}
                                  onClick={() => handleTopicToggle(topic)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-normal transition-all duration-150 cursor-pointer border ${
                                    isSelected
                                      ? "bg-slate-900 border-slate-900 text-white font-medium shadow-2xs"
                                      : "bg-slate-50/70 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                                  }`}
                                >
                                  {topic}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 4. Query Message Textarea */}
                        <div className="space-y-1.5">
                          <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium">
                            Your Message <span className="text-blue-600">*</span>
                          </label>
                          <textarea
                            rows={3}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Tell us what you'd like to know..."
                            className={`w-full px-3.5 py-2.5 bg-slate-50/70 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#205ca8]/15 focus:border-[#205ca8] transition-all resize-none min-h-[95px] ${
                              errors.message ? "border-rose-300 ring-2 ring-rose-500/10" : "border-slate-200"
                            }`}
                          />
                          {errors.message && (
                            <p className="text-[11px] text-rose-500 font-normal">{errors.message}</p>
                          )}
                        </div>

                        {/* Submit Action */}
                        <div className="pt-1">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#0B132B] hover:bg-[#205ca8] disabled:opacity-60 text-white font-medium text-sm py-3 px-6 rounded-xl transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Submitting...</span>
                              </>
                            ) : (
                              <>
                                <span>Send Enquiry</span>
                                <Send className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </div>
                      </motion.form>
                    ) : (
                      /* Success Confirmation State */
                      <motion.div
                        key="success-ticket"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.25 }}
                        className="text-center flex flex-col items-center justify-center space-y-4 py-4"
                      >
                        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-xl font-serif text-[#0B132B]">
                            Enquiry Received
                          </h3>
                          <p className="text-xs text-slate-500">
                            Ticket #{Math.floor(100000 + Math.random() * 900000)}
                          </p>
                        </div>

                        <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
                          Thank you for reaching out. We will follow up with details at <span className="font-medium text-slate-900">{email}</span> within 2 hours.
                        </p>

                        <div className="flex items-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={handleReset}
                            className="text-xs font-medium text-[#205ca8] hover:underline"
                          >
                            Send another message
                          </button>
                          <span className="text-slate-300">·</span>
                          <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-xs font-medium text-slate-500 hover:text-slate-800"
                          >
                            Close
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
