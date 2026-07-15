"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import HeroNav from "@/components/landing/HeroNav";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, FileText, ChevronRight } from "lucide-react";
import "@/styles/landing.css";

const CATEGORY_DATA: Record<string, {
  desc: string;
  coursesCount: number;
  gradient: string;
  courses: Array<{ title: string; duration: string; level: string; desc: string }>;
  bootcamps: Array<{ title: string; duration: string; type: string; date: string; desc: string }>;
  resources: Array<{ title: string; type: string; readTime: string }>;
  colors: { primary: string; secondary: string };
}> = {
  "Computer Science": {
    coursesCount: 12,
    gradient: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
    colors: { primary: "#8B5CF6", secondary: "rgba(139, 92, 246, 0.08)" },
    desc: "Gain foundational and advanced skills in software development, data structures, database design, and software engineering workflows.",
    courses: [
      { title: "Intro to Programming", duration: "6 Weeks", level: "Beginner", desc: "Learn programming logic and syntax fundamentals using modern languages." },
      { title: "Data Structures & Algorithms", duration: "10 Weeks", level: "Advanced", desc: "Master complexity analysis, sorting algorithms, trees, and dynamic programming." },
      { title: "Database Management Systems", duration: "8 Weeks", level: "Intermediate", desc: "Design relational databases, write queries, and optimize index schemas." },
      { title: "Software Engineering Principles", duration: "12 Weeks", level: "Advanced", desc: "Study system architecture patterns, automated tests, and agile collaboration." }
    ],
    bootcamps: [
      { title: "Fullstack Web Development", duration: "12 Weeks", type: "Part-time", date: "Starts Monday", desc: "Build enterprise React and Node applications from architectural design to cloud deployment." },
      { title: "React & Next.js Intensive", duration: "3 Days", type: "Intensive", date: "Starts Friday", desc: "Deep-dive into App Router, Server Components, and scale-up optimizations." },
      { title: "Git & Version Control Lab", duration: "1 Day", type: "Hands-on", date: "Starts Saturday", desc: "Master rebasing, cherry-picking, pull requests, and production branching strategies." }
    ],
    resources: [
      { title: "Optimizing Next.js App Router Performance", type: "Article", readTime: "5 min read" },
      { title: "State Management in React in 2026", type: "Guide", readTime: "8 min read" },
      { title: "Understanding Postgres Indexing & Querying", type: "Docs", readTime: "12 min read" }
    ]
  },
  "Artificial Intelligence": {
    coursesCount: 8,
    gradient: "linear-gradient(135deg, #EC4899 0%, #BE185D 100%)",
    colors: { primary: "#EC4899", secondary: "rgba(236, 72, 153, 0.08)" },
    desc: "Explore neural networks, machine learning models, training pipelines, fine-tuning large language models, and AI agent designs.",
    courses: [
      { title: "Intro to Machine Learning", duration: "8 Weeks", level: "Beginner", desc: "Understand supervised and unsupervised model training and evaluations." },
      { title: "Neural Networks & Deep Learning", duration: "12 Weeks", level: "Advanced", desc: "Build multi-layer neural networks using PyTorch and TensorFlow." },
      { title: "Natural Language Processing", duration: "10 Weeks", level: "Intermediate", desc: "Train model systems to parse and generate human texts." },
      { title: "Computer Vision & CNNs", duration: "10 Weeks", level: "Intermediate", desc: "Process visual data, detect objects, and design image architectures." }
    ],
    bootcamps: [
      { title: "AI Engineering Bootcamp", duration: "6 Weeks", type: "Full-time", date: "Starts Saturday", desc: "Integrate vector databases, construct dynamic RAG systems, and build autonomous agents." },
      { title: "Prompt Engineering Intensive", duration: "1 Day", type: "Workshop", date: "Starts Sunday", desc: "Learn few-shot learning, chain-of-thought prompting, and systemic system instructions." },
      { title: "Fine-tuning LLM Parameters", duration: "1 Week", type: "Advanced", date: "Starts next Month", desc: "Adapt transformer models on customized proprietary data libraries securely." }
    ],
    resources: [
      { title: "RAG Pipeline Architectures Explained", type: "Article", readTime: "6 min read" },
      { title: "Understanding Transformer Attention Mechanisms", type: "Guide", readTime: "10 min read" },
      { title: "Training Neural Nets from Absolute Scratch", type: "Docs", readTime: "15 min read" }
    ]
  },
  "Information Technology": {
    coursesCount: 10,
    gradient: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
    colors: { primary: "#3B82F6", secondary: "rgba(59, 130, 246, 0.08)" },
    desc: "Understand enterprise server configuration, cloud virtualization, cybersecurity models, and network protocol routing.",
    courses: [
      { title: "Computer Networks & Routing", duration: "8 Weeks", level: "Beginner", desc: "Learn IP subnetting, DNS, firewalls, and proxy setups." },
      { title: "Cyber Security Fundamentals", duration: "10 Weeks", level: "Intermediate", desc: "Explore ethical hacking protocols, cryptography, and server hardening." },
      { title: "Cloud Computing & AWS Architecture", duration: "8 Weeks", level: "Intermediate", desc: "Deploy scalable load balancers and VPC subnets on cloud hosting." },
      { title: "Linux Systems Administration", duration: "6 Weeks", level: "Beginner", desc: "Manage terminal configurations, users, services, and bash tools." }
    ],
    bootcamps: [
      { title: "DevOps & CI/CD Pipelines Lab", duration: "4 Weeks", type: "Part-time", date: "Starts Sunday", desc: "Automate builds using GitHub Actions, configure Docker, and scale release cycles." },
      { title: "Cyber Security Analyst Lab", duration: "2 Weeks", type: "Intensive", date: "Starts next Week", desc: "Practice real-time threat intelligence detection, system auditing, and incident responses." },
      { title: "Kubernetes Orchestration Hands-on", duration: "3 Days", type: "Interactive", date: "Starts Friday", desc: "Configure ingress controllers, manage secret files, and scale horizontal pods." }
    ],
    resources: [
      { title: "Configuring High-Performance Nginx Servers", type: "Article", readTime: "4 min read" },
      { title: "SSH Security Hardening Best Practices", type: "Guide", readTime: "7 min read" },
      { title: "An Introduction to Docker Compose configs", type: "Docs", readTime: "9 min read" }
    ]
  },
  "Business & Management": {
    coursesCount: 6,
    gradient: "linear-gradient(135deg, #F59E0B 0%, #C2410C 100%)",
    colors: { primary: "#F59E0B", secondary: "rgba(245, 158, 11, 0.08)" },
    desc: "Develop strategic startup frameworks, financial accounting competence, agile project leadership, and product marketing strategies.",
    courses: [
      { title: "Principles of Management", duration: "6 Weeks", level: "Beginner", desc: "Master organizational structures, planning strategies, and leadership." },
      { title: "Marketing & Growth Strategy", duration: "8 Weeks", level: "Intermediate", desc: "Analyze user cohorts, product positioning, and acquisition channels." },
      { title: "Financial & Corporate Accounting", duration: "8 Weeks", level: "Intermediate", desc: "Read company sheets, assess operating costs, and budget plans." },
      { title: "Entrepreneurship & Valuation", duration: "10 Weeks", level: "Beginner", desc: "Structure target pitches, test market bounds, and secure funding." }
    ],
    bootcamps: [
      { title: "MBA Case Study Masterclass", duration: "2 Days", type: "Interactive", date: "Starts Saturday", desc: "Evaluate real startup failures and model successful pivot options." },
      { title: "Product Management Intensive", duration: "6 Weeks", type: "Part-time", date: "Starts next Monday", desc: "Learn to write PRDs, manage backlogs, coordinate engineering, and track metrics." },
      { title: "Digital Marketing Strategy Lab", duration: "4 Weeks", type: "Part-time", date: "Starts Friday", desc: "Optimize SEO metrics, setup PPC campaigns, and track customer conversions." }
    ],
    resources: [
      { title: "Writing a Successful Startup Business Plan", type: "Article", readTime: "5 min read" },
      { title: "Understanding Cash Flow & Corporate Burn", type: "Guide", readTime: "8 min read" },
      { title: "How to Pitch Ideas to Angel Investors", type: "Docs", readTime: "11 min read" }
    ]
  },
  "Civil & Mechanical": {
    coursesCount: 7,
    gradient: "linear-gradient(135deg, #10B981 0%, #047857 100%)",
    colors: { primary: "#10B981", secondary: "rgba(16, 185, 129, 0.08)" },
    desc: "Gain dynamic engineering skills in mechanical stress calculations, structural analysis, materials composition, and CAD drafting.",
    courses: [
      { title: "Engineering Static Mechanics", duration: "8 Weeks", level: "Beginner", desc: "Formulate equilibrium equations for structures under heavy load." },
      { title: "Fluid Dynamics & Turbines", duration: "10 Weeks", level: "Intermediate", desc: "Analyze fluid flows, compression, and hydraulic power machines." },
      { title: "Surveying & Levelling Methods", duration: "6 Weeks", level: "Beginner", desc: "Determine geographic contours and plot foundation elevations." },
      { title: "Strength of Structural Materials", duration: "8 Weeks", level: "Advanced", desc: "Evaluate elasticity thresholds, torsion, and fracture models." }
    ],
    bootcamps: [
      { title: "AutoCAD Design Intensive", duration: "2 Weeks", type: "Intensive", date: "Starts Saturday", desc: "Master 2D & 3D computer-aided draft designs and blueprint exports." },
      { title: "Structural Analysis Hands-on", duration: "1 Week", type: "Interactive", date: "Starts Monday", desc: "Examine static load thresholds, materials deformation, and shear boundaries." },
      { title: "Robotics & Automation Lab", duration: "4 Weeks", type: "Part-time", date: "Starts Saturday", desc: "Program microcontrollers, design mechanical arms, and simulate automated assembly loops." }
    ],
    resources: [
      { title: "Concrete Mix Design & Setting Guides", type: "Article", readTime: "6 min read" },
      { title: "Intro to 3D Printing Mechanics & Torsion", type: "Guide", readTime: "10 min read" },
      { title: "Understanding Commercial HVAC Systems", type: "Docs", readTime: "15 min read" }
    ]
  },
  "Basic Sciences": {
    coursesCount: 5,
    gradient: "linear-gradient(135deg, #14B8A6 0%, #0F766E 100%)",
    colors: { primary: "#14B8A6", secondary: "rgba(20, 184, 166, 0.08)" },
    desc: "Strengthen academic foundations in mathematics, matrix dynamics, electromagnetics, and organic engineering structures.",
    courses: [
      { title: "Multivariable Vector Calculus", duration: "10 Weeks", level: "Advanced", desc: "Evaluate triple integrals, curl functions, and divergence theory." },
      { title: "Linear Algebra & Vectors", duration: "8 Weeks", level: "Intermediate", desc: "Master matrix transformations, eigenvalues, and computer mapping math." },
      { title: "Applied Electromagnetism", duration: "8 Weeks", level: "Beginner", desc: "Examine electrical fields, wave optics, and electromagnetic laws." },
      { title: "Chemical Bond Dynamics", duration: "8 Weeks", level: "Beginner", desc: "Explore chemical interactions, molecular configurations, and fuels." }
    ],
    bootcamps: [
      { title: "MATLAB Coding for Scientific Research", duration: "1 Week", type: "Interactive", date: "Starts Friday", desc: "Simulate numerical data sets, write equations, and plot matrices." },
      { title: "Physics Simulator Engines", duration: "3 Days", type: "Workshop", date: "Starts Saturday", desc: "Examine mechanical simulations, wave structures, and thermal limits." },
      { title: "Chemical Synthesis Lab Processes", duration: "2 Weeks", type: "Intensive", date: "Starts Monday", desc: "Model molecular reactions, setup safe test environments, and process syntheses." }
    ],
    resources: [
      { title: "Understanding Vector Fields & Integrals", type: "Article", readTime: "6 min read" },
      { title: "How Matrix Mathematics Powers Neural Nets", type: "Guide", readTime: "10 min read" },
      { title: "The Chemical Composition of Modern Batteries", type: "Docs", readTime: "15 min read" }
    ]
  },
  "Humanities & Languages": {
    coursesCount: 6,
    gradient: "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)",
    colors: { primary: "#6366F1", secondary: "rgba(99, 102, 241, 0.08)" },
    desc: "Develop professional competence in copywriting, tech documentation, legal corporate ethics, and vocal presentation skills.",
    courses: [
      { title: "Professional Communication", duration: "6 Weeks", level: "Beginner", desc: "Refine speech delivery, corporate email formats, and team syncs." },
      { title: "Technical Writing & Docs", duration: "8 Weeks", level: "Intermediate", desc: "Author markdown specifications, API references, and user walkthroughs." },
      { title: "Creative Storytelling & Copy", duration: "8 Weeks", level: "Beginner", desc: "Build narrative arcs, persuasive copy, and clear hook elements." },
      { title: "Corporate Ethics & Governance", duration: "6 Weeks", level: "Beginner", desc: "Evaluate moral choices in tech, resource handling, and legal compliance." }
    ],
    bootcamps: [
      { title: "Public Speaking Mastery", duration: "3 Days", type: "Interactive", date: "Starts Friday", desc: "Master posture, tone adjustments, slides integration, and stage confidence." },
      { title: "UX Writing & Copy Workshop", duration: "1 Week", type: "Interactive", date: "Starts Monday", desc: "Design button labels, warning messages, and setup style rules." },
      { title: "Vocal Presentation Studio", duration: "1 Day", type: "Intensive", date: "Starts Saturday", desc: "Refine verbal pacing, breathing control, and microphone setups." }
    ],
    resources: [
      { title: "How to Draft a High-Quality Technical Spec", type: "Article", readTime: "5 min read" },
      { title: "UX Writing: Best Practices for Interface Copy", type: "Guide", readTime: "8 min read" },
      { title: "Active Listening & Constructive Feedback Tools", type: "Docs", readTime: "10 min read" }
    ]
  },
  "Personal Development": {
    coursesCount: 5,
    gradient: "linear-gradient(135deg, #84CC16 0%, #4D7C0F 100%)",
    colors: { primary: "#84CC16", secondary: "rgba(132, 204, 22, 0.08)" },
    desc: "Build professional soft skills, goal planning techniques, stress resolution, and technical interview confidence.",
    courses: [
      { title: "Time Optimization & Focus Sprints", duration: "4 Weeks", level: "Beginner", desc: "Manage daily tasks, schedule pomodoros, and avoid burnout." },
      { title: "Leadership & Conflict Resolution", duration: "8 Weeks", level: "Intermediate", desc: "Learn delegation, active consensus mapping, and positive coaching." },
      { title: "Strategic Problem Solving", duration: "6 Weeks", level: "Beginner", desc: "Apply root-cause analysis models to address complex engineering bottlenecks." },
      { title: "Emotional Intelligence at Work", duration: "6 Weeks", level: "Beginner", desc: "Practice empathy, handle criticism constructively, and map stress." }
    ],
    bootcamps: [
      { title: "Goal Setting & Okrs Masterclass", duration: "1 Day", type: "Interactive", date: "Starts Saturday", desc: "Map quarterly team objectives and structure key performance metrics." },
      { title: "Tech Interview Prep & Leetcode Sprints", duration: "2 Weeks", type: "Intensive", date: "Starts Monday", desc: "Master algorithmic patterns, systems design, and behavioral pitch structures." },
      { title: "Resume & Portfolio Optimization Workshop", duration: "3 Hours", type: "Workshop", date: "Starts Friday", desc: "Design outstanding resumes, optimize LinkedIn SEO, and format github pages." }
    ],
    resources: [
      { title: "Strategies for Negotiating Your Tech Job Offer", type: "Article", readTime: "5 min read" },
      { title: "How to Build a Remarkable Developer Portfolio", type: "Guide", readTime: "10 min read" },
      { title: "Developing a Lifelong Growth Mindset Profile", type: "Docs", readTime: "15 min read" }
    ]
  }
};

const categoriesList = Object.keys(CATEGORY_DATA);

// Static Webinar Content
const WEBINARS_DATA = [
  { title: "Future of Generative AI in Production", category: "Artificial Intelligence", host: "Dr. Emily Stone", date: "Tomorrow, 3:00 PM", status: "Live Today", duration: "60 mins" },
  { title: "Scaling React & Next.js App Router Performance", category: "Computer Science", host: "Next.js Core Team", date: "Friday, 10:00 AM", status: "Upcoming", duration: "90 mins" },
  { title: "Building Secure & Resilient APIs", category: "Information Technology", host: "Security DevOps Lead", date: "Thursday, 2:00 PM", status: "Upcoming", duration: "75 mins" },
  { title: "Cloud Computing & Serverless AWS Architectures", category: "Information Technology", host: "AWS Solution Architect", date: "Recorded", status: "Recorded Video", duration: "120 mins" },
  { title: "Strategic Product Management Sprints", category: "Business & Management", host: "VP of Product", date: "Recorded", status: "Recorded Video", duration: "45 mins" },
  { title: "Structural Analysis & Materials Mechanics", category: "Civil & Mechanical", host: "Senior Civil Engineer", date: "Recorded", status: "Recorded Video", duration: "80 mins" }
];

function CoursesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Route selector
  const initialCategory = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<"courses" | "bootcamps" | "webinars">("courses");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (initialCategory && categoriesList.includes(initialCategory)) {
      setActiveCategory(initialCategory);
    } else {
      setActiveCategory(null);
    }
  }, [initialCategory]);

  const handleCategorySwitch = (category: string) => {
    setActiveCategory(category);
    router.push(`/courses?category=${encodeURIComponent(category)}`);
  };

  const handleGoBackToExplore = () => {
    setActiveCategory(null);
    router.push("/courses");
  };

  // RENDER OPTION A: Dedicated Category/Department Page
  if (activeCategory) {
    const activeData = CATEGORY_DATA[activeCategory] || CATEGORY_DATA["Computer Science"];
    return (
      <div className="landing-root" style={{ background: "linear-gradient(to bottom, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)", minHeight: "100vh" }}>
        <HeroNav />

        <main className="l-courses-detail">
          {/* Top Bar Navigation & Back to Explore */}
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
            <button
              onClick={handleGoBackToExplore}
              className="l-courses-detail__back"
            >
              <ArrowLeft size={16} /> Back to Explore
            </button>
          </div>

          {/* Department Hero Banner */}
          <div
            className="l-courses-detail__hero"
            style={{ background: activeData.gradient }}
          >
            {/* Hero Left Content */}
            <div className="l-courses-detail__hero-content">
              <span className="l-courses-detail__badge">
                Department Profile
              </span>
              <h1 className="l-courses-detail__title">
                {activeCategory}
              </h1>
              <p className="l-courses-detail__desc">
                {activeData.desc}
              </p>
            </div>

            {/* Hero Right Stats Card */}
            <div className="l-courses-detail__stats">
              <div className="l-courses-detail__stat-item">
                <span className="l-courses-detail__stat-label">Courses</span>
                <span className="l-courses-detail__stat-val">{activeData.courses.length}</span>
              </div>
              <div className="l-courses-detail__stat-item">
                <span className="l-courses-detail__stat-label">Bootcamps</span>
                <span className="l-courses-detail__stat-val">{activeData.bootcamps.length}</span>
              </div>
              <div className="l-courses-detail__stat-footer">
                <FileText size={16} /> {activeData.resources.length} Guides & Docs
              </div>
            </div>
          </div>

          {/* Courses section */}
          <div>
            <div className="l-courses-detail__section-header">
              <div className="l-courses-detail__indicator" style={{ background: activeData.colors.primary }} />
              <h2 className="l-courses-detail__section-title">
                Available Courses ({activeData.courses.length})
              </h2>
            </div>
            <div className="l-courses-detail__grid">
              {activeData.courses.map((course) => (
                <div
                  key={course.title}
                  className="l-courses-detail__card"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = activeData.colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(226, 232, 240, 0.8)";
                  }}
                >
                  <div>
                    <div className="l-courses-detail__card-header">
                      <span
                        className="l-courses-detail__card-badge"
                        style={{
                          color: activeData.colors.primary,
                          background: activeData.colors.secondary
                        }}
                      >
                        {course.level}
                      </span>
                      <span className="l-courses-detail__card-duration">
                        <Clock size={12} /> {course.duration}
                      </span>
                    </div>
                    <h3 className="l-courses-detail__card-title">
                      {course.title}
                    </h3>
                    <p className="l-courses-detail__card-desc">
                      {course.desc}
                    </p>
                  </div>
                  <div className="l-courses-detail__card-action" style={{ color: activeData.colors.primary }}>
                    <span>Enroll Now</span>
                    <ChevronRight size={16} style={{ marginLeft: "4px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bootcamps section */}
          <div>
            <div className="l-courses-detail__section-header">
              <div className="l-courses-detail__indicator" style={{ background: activeData.colors.primary }} />
              <h2 className="l-courses-detail__section-title">
                Practical Bootcamps & Workshops
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {activeData.bootcamps.map((bootcamp) => (
                <div
                  key={bootcamp.title}
                  className="l-courses-detail__row"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = activeData.colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(226, 232, 240, 0.8)";
                  }}
                >
                  <div>
                    <div className="l-courses-detail__row-meta">
                      <span
                        className="l-courses-detail__row-badge"
                        style={{
                          color: activeData.colors.primary,
                          background: activeData.colors.secondary
                        }}
                      >
                        {bootcamp.type}
                      </span>
                      <span className="l-courses-detail__row-info">
                        <Clock size={12} /> {bootcamp.duration}
                      </span>
                      <span className="l-courses-detail__row-info" style={{ color: activeData.colors.primary }}>
                        <Calendar size={12} /> {bootcamp.date}
                      </span>
                    </div>
                    <div className="l-courses-detail__row-title">
                      {bootcamp.title}
                    </div>
                    <p className="l-courses-detail__row-desc">
                      {bootcamp.desc}
                    </p>
                  </div>

                  <button
                    className="l-courses-detail__row-btn"
                    style={{
                      background: activeData.colors.primary,
                      boxShadow: `0 4px 12px ${activeData.colors.primary}26`
                    }}
                  >
                    Register Seat
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Resources section */}
          <div>
            <div className="l-courses-detail__section-header">
              <div className="l-courses-detail__indicator" style={{ background: activeData.colors.primary }} />
              <h2 className="l-courses-detail__section-title">
                Resource Libraries
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
              {activeData.resources.map((doc) => (
                <div
                  key={doc.title}
                  className="l-courses-detail__resource-card"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = activeData.colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(226, 232, 240, 0.8)";
                  }}
                >
                  <div>
                    <div className="l-courses-detail__resource-type">
                      <FileText size={12} /> {doc.type}
                    </div>
                    <h3 className="l-courses-detail__resource-title">
                      {doc.title}
                    </h3>
                  </div>
                  <div className="l-courses-detail__resource-footer">
                    <span className="l-courses-detail__resource-time">{doc.readTime}</span>
                    <span className="l-courses-detail__resource-link" style={{ color: activeData.colors.primary }}>
                      Read Guide <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // RENDER OPTION B: Main Explore Hub Dashboard
  return (
    <div
      className="explore-hub-page"
      style={{
        background: "linear-gradient(to bottom, #FFFFFF 0%, #F9F9F6 100%)",
        minHeight: "100vh",
        color: "#000000",
        fontFamily: "'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      <HeroNav />

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "120px 48px 100px" }}>

        {/* Title and Intro */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
              fontWeight: 900,
              color: "#000000",
              letterSpacing: "-0.03em",
              marginBottom: "16px"
            }}
          >
            Explore Arcade Hub
          </h1>
          <p style={{ fontSize: "1.15rem", color: "#4B5563", maxWidth: "600px", margin: "0 auto" }}>
            Access self-paced categories, practical masterclass bootcamps, and live expert webinars, all customized in one unified interface.
          </p>
        </div>

        {/* Tab Selection Cards (Top 3 Choices) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
            marginBottom: "48px"
          }}
        >
          {/* Card: Courses */}
          <div
            onClick={() => { setActiveTab("courses"); setSearchQuery(""); }}
            style={{
              background: activeTab === "courses" ? "#111827" : "#FFFFFF",
              border: activeTab === "courses" ? "2px solid #F59E0B" : "1px solid #E5E7EB",
              borderRadius: "16px",
              padding: "28px 24px",
              cursor: "pointer",
              textAlign: "left",
              transition: "transform 0.2s, border-color 0.2s",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.01)"
            }}
            className="lp-tab-card"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: activeTab === "courses" ? "#F59E0B" : "rgba(139, 92, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: activeTab === "courses" ? "#111827" : "#8B5CF6" }}>
                <svg style={{ margin: "auto" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: "700", color: activeTab === "courses" ? "#FFFFFF" : "#8B5CF6", background: activeTab === "courses" ? "rgba(255,255,255,0.1)" : "rgba(139, 92, 246, 0.08)", padding: "4px 10px", borderRadius: "20px" }}>
                8 Subjects
              </span>
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: activeTab === "courses" ? "#FFFFFF" : "#111827", margin: "0 0 6px" }}>
              Self-Paced Courses
            </h3>
            <p style={{ fontSize: "0.85rem", color: activeTab === "courses" ? "#9CA3AF" : "#6B7280", margin: 0, lineHeight: "1.4" }}>
              Explore available categories and select department tracks to see individual courses.
            </p>
          </div>

          {/* Card: Bootcamps */}
          <div
            onClick={() => { setActiveTab("bootcamps"); setSearchQuery(""); }}
            style={{
              background: activeTab === "bootcamps" ? "#111827" : "#FFFFFF",
              border: activeTab === "bootcamps" ? "2px solid #F59E0B" : "1px solid #E5E7EB",
              borderRadius: "16px",
              padding: "28px 24px",
              cursor: "pointer",
              textAlign: "left",
              transition: "transform 0.2s, border-color 0.2s",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.01)"
            }}
            className="lp-tab-card"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: activeTab === "bootcamps" ? "#F59E0B" : "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: activeTab === "bootcamps" ? "#111827" : "#C97A14" }}>
                <svg style={{ margin: "auto" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: "700", color: activeTab === "bootcamps" ? "#FFFFFF" : "#C97A14", background: activeTab === "bootcamps" ? "rgba(255,255,255,0.1)" : "rgba(245, 158, 11, 0.08)", padding: "4px 10px", borderRadius: "20px" }}>
                15+ Programs
              </span>
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: activeTab === "bootcamps" ? "#FFFFFF" : "#111827", margin: "0 0 6px" }}>
              Workshops & Bootcamps
            </h3>
            <p style={{ fontSize: "0.85rem", color: activeTab === "bootcamps" ? "#9CA3AF" : "#6B7280", margin: 0, lineHeight: "1.4" }}>
              Join live, interactive, mentor-led programs designed for technical skill development.
            </p>
          </div>

          {/* Card: Webinars */}
          <div
            onClick={() => { setActiveTab("webinars"); setSearchQuery(""); }}
            style={{
              background: activeTab === "webinars" ? "#111827" : "#FFFFFF",
              border: activeTab === "webinars" ? "2px solid #F59E0B" : "1px solid #E5E7EB",
              borderRadius: "16px",
              padding: "28px 24px",
              cursor: "pointer",
              textAlign: "left",
              transition: "transform 0.2s, border-color 0.2s",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.01)"
            }}
            className="lp-tab-card"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: activeTab === "webinars" ? "#F59E0B" : "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: activeTab === "webinars" ? "#111827" : "#10B981" }}>
                <svg style={{ margin: "auto" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: "700", color: activeTab === "webinars" ? "#FFFFFF" : "#10B981", background: activeTab === "webinars" ? "rgba(255,255,255,0.1)" : "rgba(16, 185, 129, 0.08)", padding: "4px 10px", borderRadius: "20px" }}>
                Live Stream
              </span>
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: activeTab === "webinars" ? "#FFFFFF" : "#111827", margin: "0 0 6px" }}>
              Expert Webinars
            </h3>
            <p style={{ fontSize: "0.85rem", color: activeTab === "webinars" ? "#9CA3AF" : "#6B7280", margin: 0, lineHeight: "1.4" }}>
              Watch recorded sessions or register for live-streamed presentations.
            </p>
          </div>
        </div>

        {/* Full-Width Search and Filters Row */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            width: "100%",
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            padding: "12px 18px",
            marginBottom: "40px"
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder={`Search available ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: "0.95rem",
              color: "#111827",
            }}
          />
        </div>

        {/* Tab content panels */}

        {/* 1. COURSES TAB CONTENT (GRID OF CATEGORIES) */}
        {activeTab === "courses" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
              {categoriesList
                .filter(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((cat) => {
                  const data = CATEGORY_DATA[cat];
                  return (
                    <div
                      key={cat}
                      onClick={() => handleCategorySwitch(cat)}
                      style={{
                        position: "relative",
                        borderRadius: "16px",
                        background: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        overflow: "hidden",
                        minHeight: "260px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s",
                      }}
                      className="lp-category-card"
                    >
                      {/* Artistic Gradient Top Card Section */}
                      <div
                        style={{
                          height: "120px",
                          background: data.gradient,
                          padding: "24px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#FFFFFF", margin: 0, textShadow: "0 2px 4px rgba(0,0,0,0.1)", letterSpacing: "-0.01em" }}>
                          {cat}
                        </h3>
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#111827", background: "#FFFFFF", padding: "4px 10px", borderRadius: "6px" }}>
                          {data.coursesCount} Courses
                        </span>
                      </div>

                      {/* Card Content Section */}
                      <div style={{ padding: "20px", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <p style={{ fontSize: "0.85rem", color: "#4B5563", lineHeight: "1.5", margin: "0 0 16px" }}>
                          {data.desc.slice(0, 105)}...
                        </p>
                        <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: data.colors.primary }}>Explore Category</span>
                          <span style={{ fontSize: "0.95rem", color: data.colors.primary }}>→</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* 2. BOOTCAMPS TAB CONTENT */}
        {activeTab === "bootcamps" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
              {categoriesList.flatMap(cat => {
                const data = CATEGORY_DATA[cat];
                return data.bootcamps.map(bootcamp => ({ ...bootcamp, cat, colors: data.colors }));
              })
                .filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((b, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E5E7EB",
                      borderRadius: "16px",
                      padding: "28px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: "220px",
                      transition: "transform 0.2s, border-color 0.2s"
                    }}
                    className="lp-course-card"
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", color: b.colors.primary, background: b.colors.secondary, padding: "3px 8px", borderRadius: "4px" }}>
                          {b.cat}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>{b.duration}</span>
                      </div>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#000000", marginBottom: "8px" }}>
                        {b.title}
                      </h3>
                      <p style={{ fontSize: "0.85rem", color: "#4B5563", lineHeight: "1.5", margin: "0 0 16px" }}>
                        {b.desc}
                      </p>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F3F4F6", paddingTop: "14px" }}>
                      <span style={{ fontSize: "0.75rem", color: b.colors.primary, fontWeight: "700" }}>{b.date}</span>
                      <button
                        onClick={() => handleCategorySwitch(b.cat)}
                        style={{
                          background: b.colors.primary,
                          border: "none",
                          color: "#FFFFFF",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: "700",
                          cursor: "pointer"
                        }}
                      >
                        Register
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 3. WEBINARS TAB CONTENT */}
        {activeTab === "webinars" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
              {WEBINARS_DATA
                .filter(w => w.title.toLowerCase().includes(searchQuery.toLowerCase()) || w.category.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((w, i) => {
                  const isLive = w.status === "Live Today";
                  const isUpcoming = w.status === "Upcoming";
                  const statusBg = isLive ? "rgba(239, 68, 68, 0.1)" : (isUpcoming ? "rgba(245, 158, 11, 0.1)" : "rgba(59, 130, 246, 0.1)");
                  const statusColor = isLive ? "#EF4444" : (isUpcoming ? "#F59E0B" : "#3B82F6");
                  return (
                    <div
                      key={i}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "16px",
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        minHeight: "200px"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <span style={{ fontSize: "0.7rem", fontWeight: "700", color: statusColor, background: statusBg, padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase" }}>
                            {w.status}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>{w.duration}</span>
                        </div>
                        <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#000000", marginBottom: "6px" }}>
                          {w.title}
                        </h3>
                        <div style={{ fontSize: "0.8rem", color: "#4B5563" }}>
                          Host: <strong style={{ color: "#111827" }}>{w.host}</strong> • {w.category}
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F3F4F6", paddingTop: "14px", marginTop: "14px" }}>
                        <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>{w.date}</span>
                        <button
                          style={{
                            background: "transparent",
                            border: `1.5px solid ${statusColor}`,
                            color: statusColor,
                            padding: "6px 14px",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            fontWeight: "700",
                            cursor: "pointer"
                          }}
                        >
                          {isLive ? "Join Stream" : (isUpcoming ? "Register" : "Watch Video")}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ExploreHubPage() {
  return (
    <Suspense fallback={<div style={{ padding: "100px", textAlign: "center", color: "#6B7280" }}>Loading explore hub...</div>}>
      <CoursesContent />
    </Suspense>
  );
}
