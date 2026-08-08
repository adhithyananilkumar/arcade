"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Printer,
  ChevronRight,
  ChevronDown,
  ExternalLink
} from "lucide-react";

// Types
interface TermsSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function TermsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("acceptance");

  // Quick Rules Summary Grid
  const rules = {
    dos: [
      "Use your official @amaljyothi.ac.in email for registration.",
      "Respect faculty and classmates in learning channels and forums.",
      "Submit original code and solutions for assessments.",
      "Maintain the security of your account credentials."
    ],
    donts: [
      "Share password details or allow others to use your profile.",
      "Spam collaboration channels with unsolicited materials.",
      "Plagiarize project code or exploit compiler sandbox loops.",
      "Host copyright-infringing content on copyright holder pages."
    ]
  };

  // Detailed Terms Sections
  const sections: TermsSection[] = useMemo(() => [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: (
        <div className="space-y-3 text-neutral-650 dark:text-neutral-350 font-sans">
          <p>
            By registering for an account or using the <strong>Arcade AJCE</strong> learning platform, you agree to be bound by these Terms of Service. These Terms constitute a binding legal agreement between you and the administration of <strong>Amal Jyothi College of Engineering (AJCE)</strong>.
          </p>
          <p>
            If you are a student, faculty member, or guest creator, your access to the platform is also subject to the college's standard academic policies and IT usage rules. If you do not agree to these terms, you must not use or access Arcade.
          </p>
        </div>
      )
    },
    {
      id: "registration",
      title: "2. Account Registration & Eligibility",
      content: (
        <div className="space-y-3 text-neutral-650 dark:text-neutral-350 font-sans">
          <p>
            To use the learning tools, assessment modules, and workspace compilers, you must create a registered account:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Official Email:</strong> Students and faculty must register using their official college-issued email (ending in `@amaljyothi.ac.in`). Accounts created with personal emails may face limited access or verification requirements.
            </li>
            <li>
              <strong>Account Security:</strong> You are entirely responsible for protecting your password and login credentials. Any activity taking place on your profile is attributed to you.
            </li>
            <li>
              <strong>Profile Accuracy:</strong> You agree to provide correct name and student/faculty identifiers. Impersonation of another student or teacher will result in immediate suspension.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "conduct",
      title: "3. User Conduct & Code of Ethics",
      content: (
        <div className="space-y-3 text-neutral-650 dark:text-neutral-350 font-sans">
          <p>
            Arcade is designed as a collaborative, respectful community. We enforce a zero-tolerance policy against disruptive behavior:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Respectful Communication:</strong> All chat message communications, forum comments, and channel topics must remain academic and professional. Harassment, hate speech, and bullying are strictly forbidden.
            </li>
            <li>
              <strong>Academic Integrity:</strong> Plagiarism in playground assignments, assessment code copying, or sharing quiz answers defeats the purpose of learning and violates AJCE policies. Verified academic dishonesty will be escalated to department heads.
            </li>
            <li>
              <strong>Sandbox Safety:</strong> You must not attempt to execute malicious loops, run port scanners, or compromise the server runtime environments inside the coding playgrounds.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "ip",
      title: "4. Intellectual Property & Content Rights",
      content: (
        <div className="space-y-3 text-neutral-650 dark:text-neutral-350 font-sans">
          <p>
            Understanding content ownership on Arcade AJCE:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Student Submissions:</strong> You retain ownership of any original code, project documentation, or media you write or upload to the platform. By submitting them, you grant Arcade a non-exclusive license to present the code to grading instructors.
            </li>
            <li>
              <strong>Creator & Course Content:</strong> Courses, roadmap visuals, custom guides, slides, and videos published by verified instructors are protected under intellectual property rights. You may view and execute code examples for personal education but may not distribute or re-sell them.
            </li>
            <li>
              <strong>Platform Assets:</strong> Arcade branding, UI styles, logos, graphics, and system software are the property of the Arcade development team and Amal Jyothi College of Engineering.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "liability",
      title: "5. Disclaimers & Limitation of Liability",
      content: (
        <div className="space-y-3 text-neutral-650 dark:text-neutral-350 font-sans">
          <p>
            Arcade AJCE is provided on an "AS IS" and "AS AVAILABLE" basis. While we strive for 100% uptime:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>No Performance Guarantees:</strong> We do not guarantee that the platform will operate error-free or that database backups will capture every draft. Users are encouraged to save major code projects locally.
            </li>
            <li>
              <strong>Third-Party Material:</strong> We do not verify nor assume liability for links to external repositories, YouTube videos, or articles referenced in roadmap courses.
            </li>
            <li>
              <strong>Limitation of Liability:</strong> Amal Jyothi College of Engineering and the development contributors shall not be held liable for any direct or indirect loss of data, project deadlines missed, or grade disputes resulting from system downtime.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "termination",
      title: "6. Account Termination",
      content: (
        <div className="space-y-3 text-neutral-650 dark:text-neutral-350 font-sans">
          <p>
            Rules surrounding account closure and suspension:
          </p>
          <p>
            <strong>Violation of Conduct:</strong> Administrators reserve the right to suspend or block access to the platform immediately and without notice if you are found violating safety codes, sharing offensive materials, or hacking compiler sandboxes.
          </p>
          <p>
            <strong>Graduation & Inactivity:</strong> Registered student accounts are archived upon graduation or departure from AJCE. Inactive accounts may be clean-purged after two years of inactivity, though certificate hashes remain validated.
          </p>
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

  // Scroll spy observer
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
              Terms of
            </span>
            {" "}
            <span
              style={{
                backgroundImage: "linear-gradient(90deg, #2563eb 0%, #10b981 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Service
            </span>
          </motion.h1>

          <div className="flex items-center justify-center gap-3 text-[10px] text-neutral-400 font-bold uppercase tracking-wider pt-1">
            <span>Last Updated: August 7, 2026</span>
            <span>•</span>
            <span>Version: 1.4.0</span>
          </div>
        </div>

        {/* --- ACTIONS & SEARCH BAR --- */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input
                type="text"
                placeholder="Search legal terms, policies, codes..."
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
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-805 text-white rounded-xl text-xs font-semibold shadow-md transition-all justify-center"
              >
                Request Support
              </a>
            </div>
          </div>
        </div>

        {/* --- TABLE OF CONTENTS (INLINE SCROLL SPY) --- */}
        {filteredSections.length > 0 && !searchQuery.trim() && (
          <div className="py-2.5 mb-8 text-sm">
            <h3 className="font-bold text-neutral-855 mb-3 text-[10px] uppercase tracking-wider">Table of Contents</h3>
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
                    className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive ? "text-white animate-pulse" : "text-neutral-500 hover:text-neutral-955"
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTermsToc"
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

          {/* Do's and Don'ts grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            {/* Do's card */}
            <div className="space-y-3">
              <h3
                className="text-xs font-bold text-neutral-900 pb-2 uppercase tracking-wider"
                style={{ fontFamily: "var(--font-bricolage), var(--font-sans), sans-serif" }}
              >
                What We Ask (Do's)
              </h3>
              <ul className="space-y-2 mt-3">
                {rules.dos.map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start text-xs text-neutral-650">
                    <span className="text-indigo-500 font-mono select-none">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Don'ts card */}
            <div className="space-y-3">
              <h3
                className="text-xs font-bold text-neutral-950 pb-2 uppercase tracking-wider"
                style={{ fontFamily: "var(--font-bricolage), var(--font-sans), sans-serif" }}
              >
                What is Forbidden (Don't's)
              </h3>
              <ul className="space-y-2 mt-3">
                {rules.donts.map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start text-xs text-neutral-650">
                    <span className="text-indigo-500 font-mono select-none">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Document Content */}
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
                          layoutId="activeHeadingBarTermsFocus"
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
                  className="text-center text-neutral-450 py-10"
                >
                  <Search size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No matching sections found.</p>
                  <p className="text-[11px] text-neutral-450 mt-1">Try searching for keywords like 'acceptance' or 'conduct'.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Compliance Info Card */}
          <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2 space-y-2">
              <h4
                className="font-extrabold text-neutral-900 text-xs"
                style={{ fontFamily: "var(--font-bricolage), var(--font-sans), sans-serif" }}
              >
                Academic Honor Code & Compliance
              </h4>
              <p className="text-neutral-505 text-xs leading-relaxed font-sans">
                Arcade is a tool for professional student development. All workspace compilations and roadmap completions are monitored to ensure student credentials represent actual skill acquisition.
              </p>
            </div>

            <div className="flex flex-col gap-2 items-start bg-slate-50 p-4 rounded-2xl md:items-end md:text-right">
              <p className="text-xs font-bold text-neutral-900">Questions about these Terms?</p>
              <a
                href="mailto:arcade@amaljyothi.ac.in"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 shadow-sm transition-all"
              >
                Contact IT Cell <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
