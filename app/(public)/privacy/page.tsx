"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Printer,
  ChevronDown,
  ExternalLink
} from "lucide-react";

// Types
interface PolicySection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function PrivacyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("intro");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // FAQs - Quick Summary of Policy
  const faqs: FAQItem[] = [
    {
      question: "Does Arcade AJCE sell my personal information?",
      answer: "No, Arcade AJCE never sells, rents, or trades your personal information to third parties. Your data is used exclusively to facilitate your learning, academic records, and peer collaboration within Amal Jyothi College of Engineering."
    },
    {
      question: "What student activity data is tracked?",
      answer: "We track course enrollment status, video completion progress, coding playground submissions, quizzes/assessment grades, and channel interactions to generate your learning analytics and award course completion certificates."
    },
    {
      question: "Who can see my profile and learning achievements?",
      answer: "By default, your basic profile (name, department, certificates) is visible to college instructors and fellow learners. You can configure your visibility and telemetry preferences inside the Data & Privacy section in settings."
    },
    {
      question: "How do I request a copy of my data or delete my account?",
      answer: "You can download a complete ZIP archive of your activity directly from your Account Settings. For account deletion, please contact the Arcade Administrator or the department head."
    }
  ];

  // Detailed Policy Sections
  const sections: PolicySection[] = useMemo(() => [
    {
      id: "intro",
      title: "1. Introduction",
      content: (
        <div className="space-y-3 text-neutral-650 dark:text-neutral-350">
          <p>
            Welcome to <strong>Arcade AJCE</strong>, the custom learning and collaboration platform designed for the students, faculty, and creators of <strong>Amal Jyothi College of Engineering (AJCE)</strong>. We value your intellectual curiosity and are fully committed to protecting your privacy.
          </p>
          <p>
            This Privacy Policy outlines how we collect, process, share, and protect your personal information when you use our website, mobile application, coding playgrounds, and community communication channels. By accessing or using Arcade, you consent to the practices described in this document.
          </p>
          <p className="text-xs text-neutral-500 font-medium">
            <strong>Scope:</strong> This policy applies to all registered students, guest learners, teaching faculty, content creators, and administrators using the platform under the `amaljyothi.ac.in` domain ecosystem.
          </p>
        </div>
      )
    },
    {
      id: "collect",
      title: "2. Information We Collect",
      content: (
        <div className="space-y-3 text-neutral-650 dark:text-neutral-350">
          <p>
            To provide a personalized educational experience, Arcade collects various types of data from you when you register, learn, or publish content:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Account Information:</strong> Full name, official AJCE email address, student/faculty ID number, department, academic batch, profile photo, and password.
            </li>
            <li>
              <strong>Learning & Performance Analytics:</strong> Courses enrolled, roadmap completion status, learning drawer progress, sandbox code submissions, quiz attempts, and scores.
            </li>
            <li>
              <strong>Collaboration Content:</strong> Public and private messages in channels, forum posts, content editor drafts, community upvotes, and collaborative project links.
            </li>
            <li>
              <strong>Technical Telemetry:</strong> IP address, device type, operating system, browser details, and anonymous activity logs used to monitor application performance and prevent abuse.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "use",
      title: "3. How We Use Your Data",
      content: (
        <div className="space-y-3 text-neutral-650 dark:text-neutral-350">
          <p>
            We process your information to deliver academic and technical value, adhering strictly to college educational standards:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Personalized Learning:</strong> Tracking your curriculum progress on roadmaps and resuming classes from where you left off.
            </li>
            <li>
              <strong>Credential Issuance:</strong> Validating course assessments to generate official, shareable certificates of achievement.
            </li>
            <li>
              <strong>Academic Support:</strong> Providing department instructors with aggregated progress reports to assist lagging students.
            </li>
            <li>
              <strong>Platform Enhancement:</strong> Fixing runtime errors, optimizing database queries, and debugging sandbox execution environments.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "share",
      title: "4. Sharing & Disclosure",
      content: (
        <div className="space-y-3 text-neutral-650 dark:text-neutral-350">
          <p>
            We believe in transparency. Your personal data is shared only under specific circumstances that facilitate education:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>With Instructors & Administrators:</strong> AJCE faculty members have access to student learning data, grades, and code submissions for grading and performance evaluation.
            </li>
            <li>
              <strong>With Fellow Students:</strong> When you join channels or forums, your name, profile status, and public contributions are visible to other members.
            </li>
            <li>
              <strong>Third-Party Processors:</strong> We use selected external services for database hosting (e.g., Supabase/PostgreSQL), authentication, and hosting video lessons. These services are contractually bound to protect your data.
            </li>
            <li>
              <strong>No Marketing Sharing:</strong> We do not share or sell your data with advertisers, commercial sponsors, or marketing firms.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "security",
      title: "5. Data Protection & Retention",
      content: (
        <div className="space-y-3 text-neutral-650 dark:text-neutral-350">
          <p>
            We implement robust security measures to protect your learning history and credentials from unauthorized access, alteration, or deletion:
          </p>
          <p>
            Data is encrypted both in transit (SSL/TLS) and at rest (AES-256 database encryption). Access to sensitive data is strictly restricted using Role-Based Access Control (RBAC).
          </p>
          <p>
            <strong>Retention Period:</strong> We retain account data as long as your student or faculty profile is active. Completed certificates and academic records are stored permanently in the university registry archives to support credential validation queries.
          </p>
        </div>
      )
    },
    {
      id: "rights",
      title: "6. Your Rights & Controls",
      content: (
        <div className="space-y-3 text-neutral-650 dark:text-neutral-350">
          <p>
            You hold key rights regarding your personal information, which can be managed directly via your dashboard settings:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Access & Export:</strong> You can download a complete structured ZIP archive of your user profile, channel messages, and completion logs at any time.
            </li>
            <li>
              <strong>Correction:</strong> Update your profile photo, display name, and department preferences directly. Official student identifiers (like register numbers) must be edited through the administrator.
            </li>
            <li>
              <strong>Telemetry Toggle:</strong> You can disable usage analytics and recommendations tracking in your Data Preferences.
            </li>
            <li>
              <strong>Account Deletion:</strong> You can initiate account deletion by contacting the site administrator. This will delete login access and scrub forum posts, though formal certificate logs are retained for college accreditation.
            </li>
          </ul>
        </div>
      )
    }
  ], []);

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const query = searchQuery.toLowerCase();
    return sections.filter((s) => {
      const titleMatches = s.title.toLowerCase().includes(query);
      const contentMatches = JSON.stringify(s.content).toLowerCase().includes(query);
      return titleMatches || contentMatches;
    });
  }, [searchQuery, sections]);

  // Scroll spy effect to highlight Table of Contents active item
  useEffect(() => {
    if (searchQuery.trim()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-25% 0px -55% 0px" }
    );

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  // Framer Motion Variants
  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 24
      }
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 relative z-10 bg-white font-sans text-neutral-800">
      
      {/* --- CENTERED FOCUS READING COLUMN --- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Page Header */}
        <div className="text-center mb-8 space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: -15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.01 }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              scale: { type: "spring", stiffness: 300, damping: 20 }
            }}
            className="inline-block text-5xl sm:text-6xl md:text-7xl cursor-default select-none transition-all duration-300 font-normal tracking-normal text-center"
            style={{
              fontFamily: '"Amira-Grace", "Amira Grace", cursive'
            }}
          >
            <span className="text-[#0f172a] dark:text-neutral-200">
              Privacy
            </span>
            {" "}
            <span 
              style={{
                backgroundImage: "linear-gradient(90deg, #2563eb 0%, #10b981 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Policy
            </span>
          </motion.h1>

          <div className="flex items-center justify-center gap-3 text-[10px] text-neutral-400 font-bold uppercase tracking-wider pt-1">
            <span>Last Updated: August 7, 2026</span>
            <span>•</span>
            <span>Version: 2.1.0</span>
          </div>
        </div>

        {/* --- ACTIONS & SEARCH BAR --- */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input
                type="text"
                placeholder="Search sections, terms, cookies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-neutral-200 focus:border-neutral-400 rounded-xl shadow-sm focus:ring-0 focus:outline-none transition-all text-xs text-neutral-800"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 shadow-sm transition-all"
              >
                <Printer size={14} /> Print
              </button>
              <a
                href="mailto:arcade@amaljyothi.ac.in"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-md transition-all justify-center"
              >
                Email Admin
              </a>
            </div>
          </div>
        </div>

        {/* --- TABLE OF CONTENTS (INLINE SCROLL SPY) --- */}
        {filteredSections.length > 0 && !searchQuery.trim() && (
          <div className="py-2.5 mb-8 text-sm">
            <h3 className="font-bold text-neutral-850 mb-3 text-[10px] uppercase tracking-wider">Table of Contents</h3>
            <div className="flex flex-wrap gap-1.5">
              {filteredSections.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveSection(sec.id);
                      document.getElementById(sec.id)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive ? "text-white animate-pulse" : "text-neutral-500 hover:text-neutral-950"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activePrivacyToc"
                        className="absolute inset-0 bg-neutral-900 rounded-lg -z-10"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                    <span>{sec.title.split(". ")[1] || sec.title}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Reading Sheet Card - Container Removed */}
        <div className="space-y-12">
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="space-y-10"
          >
            <AnimatePresence mode="wait">
              {filteredSections.length > 0 ? (
                filteredSections.map((sec) => {
                  const isActive = activeSection === sec.id && !searchQuery.trim();
                  return (
                    <motion.section
                      key={sec.id}
                      id={sec.id}
                      variants={itemVariants}
                      className="scroll-mt-24 relative"
                    >
                      {/* Section marker left accent */}
                      {isActive && (
                        <motion.div
                          layoutId="activeHeadingBarPrivacyFocus"
                          className="absolute -left-4 top-1.5 bottom-1.5 w-0.5 bg-indigo-600 rounded-full hidden sm:block"
                          transition={{ type: "spring", stiffness: 300, damping: 26 }}
                        />
                      )}
                      <h2 
                        className="text-base font-extrabold text-neutral-900 mb-3 pb-1.5 tracking-tight"
                        style={{ fontFamily: "var(--font-bricolage), var(--font-sans), sans-serif" }}
                      >
                        {sec.title}
                      </h2>
                      <div className="prose prose-neutral max-w-none text-xs leading-relaxed text-neutral-600">
                        {sec.content}
                      </div>
                    </motion.section>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-slate-400 py-10"
                >
                  <Search size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No matching sections found.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Try searching for keywords like 'data' or 'security'.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* FAQ Accordion */}
          <div className="pt-8 space-y-4">
            <div>
              <h3 
                className="text-base font-extrabold text-neutral-900"
                style={{ fontFamily: "var(--font-bricolage), var(--font-sans), sans-serif" }}
              >
                Privacy FAQs & Summaries
              </h3>
              <p className="text-neutral-500 text-xs mt-0.5">
                Quick, easy-to-understand summaries of our primary privacy commitments.
              </p>
            </div>

            <div className="space-y-2">
              {faqs.map((faq, index) => {
                const isOpen = expandedFaq === index;
                return (
                  <div
                    key={index}
                    className="pb-2.5 last:pb-0"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between text-left font-semibold text-xs text-neutral-800 hover:text-indigo-600 transition-colors py-1.5"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        size={14}
                        className={`text-neutral-450 transition-transform ${isOpen ? "rotate-180 text-indigo-650" : ""}`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.12 }}
                          className="overflow-hidden"
                        >
                          <p className="text-xs text-neutral-600 leading-relaxed mt-1 pl-1 font-sans">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact signature block */}
          <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <h4 
                className="font-extrabold text-neutral-900 text-xs"
                style={{ fontFamily: "var(--font-bricolage), var(--font-sans), sans-serif" }}
              >
                Amal Jyothi College of Engineering
              </h4>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Arcade AJCE is managed by the Department of Computer Science & Engineering in association with the College IT Cell.
              </p>
              <div className="flex flex-col gap-1 text-xs text-neutral-600 font-medium">
                <div>Address: Kanjirappally, Koovappally P.O., Kottayam, Kerala 686518</div>
                <div>Contact: arcade@amaljyothi.ac.in</div>
              </div>
            </div>

            <div className="flex flex-col gap-2 items-start bg-slate-50 p-4 rounded-2xl">
              <h5 
                className="text-xs font-extrabold text-neutral-900"
                style={{ fontFamily: "var(--font-bricolage), var(--font-sans), sans-serif" }}
              >
                Need specific data deletion queries?
              </h5>
              <p className="text-[11px] text-neutral-550 leading-relaxed font-sans">Official requests can be forwarded directly to the CSE department administration.</p>
              <a
                href="https://www.amaljyothi.ac.in"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 shadow-sm transition-all"
              >
                Visit AJCE Portal <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
