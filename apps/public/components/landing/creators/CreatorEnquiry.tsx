"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, Mail, User, Clock, ArrowRight, HelpCircle, Layers, Building2, UserCheck } from "lucide-react";

type UserType = "Individual" | "Organization";
type TopicType = "Fees & Pricing" | "Certifications" | "Duration" | "Schedules" | "Course Outline";

export default function CreatorEnquiry() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [userType, setUserType] = useState<UserType>("Individual");
  const [selectedTopics, setSelectedTopics] = useState<TopicType[]>(["Course Outline"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  const topicsList: TopicType[] = [
    "Fees & Pricing",
    "Certifications",
    "Duration",
    "Schedules",
    "Course Outline"
  ];

  const handleTopicToggle = (topic: TopicType) => {
    setActiveStep(3);
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
    }, 1500);
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setMessage("");
    setUserType("Individual");
    setSelectedTopics(["Course Outline"]);
    setIsSubmitted(false);
    setErrors({});
    setActiveStep(1);
  };

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden bg-transparent" id="enquiry">
      {/* Background blobs for soft aura */}
      <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full opacity-10 bg-indigo-300 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 bg-purple-300 blur-3xl pointer-events-none -z-10" />

      {/* Grid container placed only on the central, fitting to the desktop */}
      <div className="max-w-5xl mx-auto px-6 relative z-10">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-center">

          {/* Left Column: Heading and Paragraph (Col 5) */}
          <div className="md:col-span-5 flex flex-col justify-center space-y-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#7A5AF8] tracking-widest uppercase font-mono">
              <span className="w-3 h-[2px] bg-[#7A5AF8] rounded-full inline-block" />
              <span>INQUIRY DESK</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-semibold text-[#1C1C2E] tracking-tight font-serif leading-tight">
              Have a Question<br />
              Lets Connect
            </h2>

            <p className="text-xs sm:text-sm text-zinc-500 font-medium leading-relaxed">
              Have questions about fees, formats, or certificate reviews? Get in touch directly with the administration team without any enrollment commitment.
            </p>
          </div>

          {/* Right Column: Interactive Form inputs with Timeline step indicators (Col 7) */}
          <div className="md:col-span-7">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="enquiry-form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col"
                >

                  {/* STEP 1: Identification */}
                  <div className="flex gap-4 group">
                    <div className="hidden sm:flex flex-col items-center">
                      <motion.div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${activeStep === 1
                          ? "bg-[#3B2FC9] border-[#3B2FC9] text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-400"
                          }`}
                        animate={{ scale: activeStep === 1 ? 1.1 : 1 }}
                      >
                        1
                      </motion.div>
                      <div className="w-[1.5px] flex-1 bg-slate-100 min-h-[35px] my-1" />
                    </div>

                    <div className="flex-1 pb-6" onClick={() => setActiveStep(1)}>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 transition-colors ${activeStep === 1 ? "text-[#7A5AF8]" : "text-slate-400"
                        }`}>
                        Identify Yourself
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onFocus={() => setActiveStep(1)}
                            placeholder="Full Name"
                            className={`w-full text-xs sm:text-sm font-semibold border-b bg-transparent py-2 px-0 outline-hidden transition-all placeholder:text-slate-300 text-slate-800 ${errors.name
                              ? "border-rose-400 text-rose-800"
                              : "border-slate-200 focus:border-[#3B2FC9]"
                              }`}
                          />
                          {errors.name && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.name}</p>}
                        </div>

                        <div className="relative">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setActiveStep(1)}
                            placeholder="Email Address"
                            className={`w-full text-xs sm:text-sm font-semibold border-b bg-transparent py-2 px-0 outline-hidden transition-all placeholder:text-slate-300 text-slate-800 ${errors.email
                              ? "border-rose-400 text-rose-800"
                              : "border-slate-200 focus:border-[#3B2FC9]"
                              }`}
                          />
                          {errors.email && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.email}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STEP 2: Individual or Organization */}
                  <div className="flex gap-4 group">
                    <div className="hidden sm:flex flex-col items-center">
                      <motion.div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${activeStep === 2
                          ? "bg-[#3B2FC9] border-[#3B2FC9] text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-400"
                          }`}
                        animate={{ scale: activeStep === 2 ? 1.1 : 1 }}
                      >
                        2
                      </motion.div>
                      <div className="w-[1.5px] flex-1 bg-slate-100 min-h-[35px] my-1" />
                    </div>

                    <div className="flex-1 pb-6" onClick={() => setActiveStep(2)}>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 transition-colors ${activeStep === 2 ? "text-[#7A5AF8]" : "text-slate-400"
                        }`}>
                        Individual or Organization
                      </label>
                      <div className="flex flex-wrap gap-2.5 pt-0.5">
                        {(["Individual", "Organization"] as UserType[]).map((type) => {
                          const isSelected = userType === type;
                          return (
                            <button
                              type="button"
                              key={type}
                              onClick={() => {
                                setUserType(type);
                                setActiveStep(2);
                              }}
                              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${isSelected
                                ? "bg-[#3B2FC9] border-[#3B2FC9] text-white shadow-md shadow-indigo-500/10 scale-[1.02]"
                                : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                                }`}
                            >
                              {type === "Individual" ? (
                                <UserCheck className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-500"}`} />
                              ) : (
                                <Building2 className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-500"}`} />
                              )}
                              <span>{type}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* STEP 3: Topic Selection */}
                  <div className="flex gap-4 group">
                    <div className="hidden sm:flex flex-col items-center">
                      <motion.div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${activeStep === 3
                          ? "bg-[#3B2FC9] border-[#3B2FC9] text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-400"
                          }`}
                        animate={{ scale: activeStep === 3 ? 1.1 : 1 }}
                      >
                        3
                      </motion.div>
                      <div className="w-[1.5px] flex-1 bg-slate-100 min-h-[35px] my-1" />
                    </div>

                    <div className="flex-1 pb-6" onClick={() => setActiveStep(3)}>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 transition-colors ${activeStep === 3 ? "text-[#7A5AF8]" : "text-slate-400"
                        }`}>
                        Enquiry Topics
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {topicsList.map((topic) => {
                          const selected = selectedTopics.includes(topic);
                          return (
                            <button
                              type="button"
                              key={topic}
                              onClick={() => handleTopicToggle(topic)}
                              className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all duration-200 cursor-pointer ${selected
                                ? "bg-[#3B2FC9]/10 border-[#3B2FC9] text-[#3B2FC9]"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800"
                                }`}
                            >
                              {topic}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* STEP 4: Details & Submission */}
                  <div className="flex gap-4 group">
                    <div className="hidden sm:flex flex-col items-center">
                      <motion.div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${activeStep === 4
                          ? "bg-[#3B2FC9] border-[#3B2FC9] text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-400"
                          }`}
                        animate={{ scale: activeStep === 4 ? 1.1 : 1 }}
                      >
                        4
                      </motion.div>
                    </div>

                    <div className="flex-1" onClick={() => setActiveStep(4)}>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 transition-colors ${activeStep === 4 ? "text-[#7A5AF8]" : "text-slate-400"
                        }`}>
                        Enquiry Details
                      </label>
                      <div className="space-y-4">
                        <textarea
                          rows={3}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onFocus={() => setActiveStep(4)}
                          placeholder="Write your query here. If looking for specific details, please specify..."
                          className={`w-full text-xs sm:text-sm font-medium border bg-white/50 rounded-xl p-3.5 outline-hidden transition-all placeholder:text-slate-300 text-slate-800 resize-none ${errors.message
                            ? "border-rose-400 focus:border-rose-500"
                            : "border-slate-200 focus:border-[#3B2FC9] focus:bg-white"
                            }`}
                        />
                        {errors.message && <p className="text-[10px] text-rose-500 font-bold">{errors.message}</p>}

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-[#3B2FC9] hover:bg-[#2C21B2] disabled:bg-indigo-300 text-white font-extrabold text-xs py-3 px-6 rounded-xl transition-all duration-300 shadow-md shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <span>Submit Enquiry</span>
                              <Send className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                </motion.form>
              ) : (
                /* Success Ticket State - Open Layout */
                <motion.div
                  key="success-ticket"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="text-center flex flex-col items-center justify-center space-y-5 py-4"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-md animate-pulse" />
                    <CheckCircle2 className="w-14 h-14 text-emerald-500 relative z-10" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900">Enquiry Registered!</h3>
                    <p className="text-[10px] font-semibold text-[#7A5AF8]">Ticket: #{Math.floor(100000 + Math.random() * 900000)}</p>
                  </div>

                  <div className="w-full max-w-sm border border-slate-100 bg-slate-50/50 rounded-2xl p-4 text-left text-[11px] text-slate-600 font-semibold space-y-2 relative overflow-hidden">
                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                      <span className="text-slate-400">Name:</span>
                      <span className="text-slate-800 font-bold">{name}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                      <span className="text-slate-400">Response Email:</span>
                      <span className="text-slate-800">{email}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                      <span className="text-slate-400">User Category:</span>
                      <span className="text-slate-800 font-bold">{userType}</span>
                    </div>
                    <div className="flex justify-between pb-0.5">
                      <span className="text-slate-400">Focus Topics:</span>
                      <span className="text-[#3B2FC9] font-bold">{selectedTopics.join(", ")}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 font-medium max-w-xs">
                    The administration team has received your inquiry. A reply will be sent to <span className="font-bold text-slate-700">{email}</span> within 2 hours.
                  </p>

                  <button
                    onClick={handleReset}
                    className="border border-slate-200 hover:border-slate-300 text-slate-600 font-bold text-[10px] px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer bg-white"
                  >
                    <span>Submit another inquiry</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
