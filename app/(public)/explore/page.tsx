"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import GradientText from "@/components/landing/GradientText";
import Link from "next/link";
import "@/styles/landing.css";

export const CATEGORY_DATA: Record<string, {
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
    gradient: "linear-gradient(135deg, #4B6189 0%, #2E4A72 100%)",
    colors: { primary: "#4B6189", secondary: "rgba(75, 97, 137, 0.08)" },
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

export const categoriesList = Object.keys(CATEGORY_DATA);

// Static Webinar Content
const WEBINARS_DATA = [
  { title: "Future of Generative AI in Production", category: "Artificial Intelligence", host: "Dr. Emily Stone", date: "Tomorrow, 3:00 PM", status: "Live Today", duration: "60 mins" },
  { title: "Scaling React & Next.js App Router Performance", category: "Computer Science", host: "Next.js Core Team", date: "Friday, 10:00 AM", status: "Upcoming", duration: "90 mins" },
  { title: "Building Secure & Resilient APIs", category: "Information Technology", host: "Security DevOps Lead", date: "Thursday, 2:00 PM", status: "Upcoming", duration: "75 mins" },
  { title: "Cloud Computing & Serverless AWS Architectures", category: "Information Technology", host: "AWS Solution Architect", date: "Recorded", status: "Recorded Video", duration: "120 mins" },
  { title: "Strategic Product Management Sprints", category: "Business & Management", host: "VP of Product", date: "Recorded", status: "Recorded Video", duration: "45 mins" },
  { title: "Structural Analysis & Materials Mechanics", category: "Civil & Mechanical", host: "Senior Civil Engineer", date: "Recorded", status: "Recorded Video", duration: "80 mins" }
];

const ILLUSTRATION_BGS: Record<string, string> = {
  "Computer Science": "#7C3AED", // Solid vibrant purple
  "Artificial Intelligence": "#DB2777", // Solid vibrant pink
  "Information Technology": "#2563EB", // Solid vibrant blue
  "Business & Management": "#EA580C", // Solid vibrant orange
  "Civil & Mechanical": "#059669", // Solid vibrant emerald
  "Basic Sciences": "#0D9488", // Solid vibrant teal
  "Humanities & Languages": "#4F46E5", // Solid vibrant indigo
  "Personal Development": "#65A30D" // Solid vibrant lime
};

export function CategoryWatermark({ category, color }: { category: string; color: string }) {
  const style = {
    position: "absolute" as const,
    bottom: "-8px",
    left: "8px",
    width: "120px",
    height: "120px",
    pointerEvents: "none" as const,
    opacity: 0.18,
    zIndex: 0
  };
  switch (category) {
    case "Computer Science":
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case "Artificial Intelligence":
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="M12 6v12M6 12h12" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "Information Technology":
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="2" />
          <line x1="6" y1="18" x2="6.01" y2="18" strokeWidth="2" />
        </svg>
      );
    case "Business & Management":
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" strokeWidth="2" />
          <line x1="12" y1="20" x2="12" y2="4" strokeWidth="2" />
          <line x1="6" y1="20" x2="6" y2="14" strokeWidth="2" />
          <path d="M4 20h16" />
        </svg>
      );
    case "Civil & Mechanical":
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case "Basic Sciences":
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <line x1="6" y1="2" x2="18" y2="2" />
          <line x1="6" y1="6" x2="18" y2="6" />
          <path d="M10 6v4l6 8a2 2 0 0 1-3.6 1.2L12 18H6.5a2.5 2.5 0 0 1-2.5-2.5V6h6z" />
        </svg>
      );
    case "Humanities & Languages":
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5v-15z" />
        </svg>
      );
    case "Personal Development":
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      );
    default:
      return null;
  }
}

function CategoryIllustration({ category }: { category: string }) {
  const bgFill = "transparent";
  switch (category) {
    case "Computer Science":
      return (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <rect width="100%" height="100%" fill={bgFill} />
          <path d="M-20,40 L300,140 M-20,70 L300,170 M-20,10 L300,110 M40,-20 L240,160 M90,-20 L290,160 M-10,-20 L190,160" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
          <rect x="140" y="25" width="130" height="80" rx="8" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }} />
          <circle cx="155" cy="38" r="3.5" fill="#EF4444" />
          <circle cx="166" cy="38" r="3.5" fill="#F59E0B" />
          <circle cx="177" cy="38" r="3.5" fill="#10B981" />
          <line x1="155" y1="54" x2="230" y2="54" stroke="rgba(255,255,255,0.9)" strokeWidth="3" strokeLinecap="round" />
          <line x1="155" y1="64" x2="250" y2="64" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round" />
          <line x1="155" y1="74" x2="210" y2="74" stroke="rgba(255,255,255,0.8)" strokeWidth="3" strokeLinecap="round" />
          <line x1="155" y1="84" x2="240" y2="84" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" />
          <text x="65" y="80" fill="rgba(255, 255, 255, 0.15)" fontSize="54" fontWeight="bold" fontFamily="monospace">{"{"}</text>
          <text x="235" y="105" fill="rgba(255, 255, 255, 0.15)" fontSize="48" fontWeight="bold" fontFamily="monospace">{"}"}</text>
        </svg>
      );
    case "Artificial Intelligence":
      return (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <rect width="100%" height="100%" fill={bgFill} />
          <g opacity="0.85">
            <line x1="120" y1="80" x2="180" y2="40" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" />
            <line x1="120" y1="80" x2="160" y2="95" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" />
            <line x1="180" y1="40" x2="230" y2="55" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" />
            <line x1="160" y1="95" x2="230" y2="55" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" />
            <line x1="180" y1="40" x2="220" y2="100" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" />
            <line x1="160" y1="95" x2="220" y2="100" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" />
            <line x1="230" y1="55" x2="270" y2="70" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" />
            <line x1="220" y1="100" x2="270" y2="70" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" />
            <circle cx="120" cy="80" r="5" fill="#FFFFFF" />
            <circle cx="180" cy="40" r="6" fill="#FFFFFF" />
            <circle cx="160" cy="95" r="5" fill="#FFFFFF" />
            <circle cx="230" cy="55" r="7" fill="#FFFFFF" />
            <circle cx="220" cy="100" r="5" fill="#FFFFFF" />
            <circle cx="270" cy="70" r="6" fill="#FFFFFF" />
          </g>
          <path d="M190,50 Q165,55 170,75 Q160,85 175,95 Q190,105 210,95 Q225,85 215,75 Q220,55 190,50 Z" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1.5" style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.03))" }} />
          <path d="M140,35 L143,42 L150,45 L143,48 L140,55 L137,48 L130,45 L137,42 Z" fill="#FFFFFF" />
          <path d="M250,90 L252,94 L257,96 L252,98 L250,102 L248,98 L243,96 L248,94 Z" fill="#FFFFFF" />
        </svg>
      );
    case "Information Technology":
      return (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <rect width="100%" height="100%" fill={bgFill} />
          <g transform="translate(160, 30)">
            <rect x="0" y="0" width="90" height="20" rx="4" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.02))" }} />
            <circle cx="10" cy="10" r="3" fill="#10B981" />
            <line x1="20" y1="10" x2="70" y2="10" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 3" />

            <rect x="0" y="26" width="90" height="20" rx="4" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.02))" }} />
            <circle cx="10" cy="36" r="3" fill="#10B981" />
            <line x1="20" y1="36" x2="70" y2="36" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 3" />

            <rect x="0" y="52" width="90" height="20" rx="4" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.02))" }} />
            <circle cx="10" cy="62" r="3" fill="#EF4444" />
            <line x1="20" y1="62" x2="70" y2="62" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 3" />
          </g>
          <g transform="translate(105, 50)" opacity="0.9">
            <path d="M12,2 L2,7 L2,14 C2,19.5 6.3,24.6 12,26 C17.7,24.6 22,19.5 22,14 L22,7 L12,2 Z" fill="rgba(255, 255, 255, 0.15)" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="12" cy="13" r="3" fill="#FFFFFF" />
            <path d="M12,16 L12,20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      );
    case "Business & Management":
      return (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <rect width="100%" height="100%" fill={bgFill} />
          <g transform="translate(150, 40)">
            <rect x="0" y="30" width="14" height="25" rx="2" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" />
            <rect x="20" y="15" width="14" height="40" rx="2" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" />
            <rect x="40" y="0" width="14" height="55" rx="2" fill="#FFFFFF" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1" />
            <path d="M-10,40 L7,30 L27,15 L52,5" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M42,5 L52,5 L52,15" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <circle cx="95" cy="85" r="22" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" />
          <circle cx="95" cy="85" r="14" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" />
          <circle cx="95" cy="85" r="6" fill="#FFFFFF" />
        </svg>
      );
    case "Civil & Mechanical":
      return (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <rect width="100%" height="100%" fill={bgFill} />
          <path d="M0,20 L300,20 M0,50 L300,50 M0,80 L300,80 M0,110 L300,110 M50,0 L50,120 M100,0 L100,120 M150,0 L150,120 M200,0 L200,120 M250,0 L250,120" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
          <circle cx="210" cy="60" r="34" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
          <g transform="translate(210, 60)">
            <circle cx="0" cy="0" r="20" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="8" fill="#FFFFFF" />
            {Array.from({ length: 8 }).map((_, idx) => {
              const angle = (idx * 360) / 8;
              return (
                <rect
                  key={idx}
                  x="-4"
                  y="-25"
                  width="8"
                  height="8"
                  rx="2"
                  fill="#FFFFFF"
                  transform={`rotate(${angle})`}
                />
              );
            })}
          </g>
          <path d="M120,80 L160,60 L160,95 L120,115 Z" fill="rgba(255, 255, 255, 0.15)" stroke="#FFFFFF" strokeWidth="1" />
          <path d="M160,60 L200,80 L200,115 L160,95 Z" fill="rgba(255, 255, 255, 0.08)" stroke="#FFFFFF" strokeWidth="1" />
          <path d="M120,80 L160,60 L200,80 L160,100 Z" fill="rgba(255, 255, 255, 0.2)" stroke="#FFFFFF" strokeWidth="1" />
        </svg>
      );
    case "Basic Sciences":
      return (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <rect width="100%" height="100%" fill={bgFill} />
          <g>
            <line x1="80" y1="90" x2="130" y2="70" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" />
            <line x1="130" y1="70" x2="160" y2="100" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" />
            <line x1="130" y1="70" x2="180" y2="50" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" />
            <circle cx="80" cy="90" r="5" fill="#FFFFFF" />
            <circle cx="130" cy="70" r="7" fill="#FFFFFF" />
            <circle cx="160" cy="100" r="5" fill="#FFFFFF" />
            <circle cx="180" cy="50" r="6" fill="#FFFFFF" />
          </g>
          <g transform="translate(210, 60)">
            <ellipse cx="0" cy="0" rx="36" ry="12" fill="none" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" transform="rotate(30)" />
            <ellipse cx="0" cy="0" rx="36" ry="12" fill="none" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" transform="rotate(-30)" />
            <circle cx="0" cy="0" r="10" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="5" fill="#FFFFFF" />
            <circle cx="-30" cy="-6" r="3.5" fill="#FFFFFF" />
            <circle cx="28" cy="10" r="3.5" fill="#FFFFFF" />
          </g>
        </svg>
      );
    case "Humanities & Languages":
      return (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <rect width="100%" height="100%" fill={bgFill} />
          <g transform="translate(170, 45)">
            <rect x="15" y="-10" width="70" height="14" rx="2" fill="rgba(255, 255, 255, 0.25)" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1" />
            <line x1="25" y1="-3" x2="75" y2="-3" stroke="#FFFFFF" strokeWidth="2" />

            <rect x="5" y="6" width="75" height="14" rx="2" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" />
            <line x1="15" y1="13" x2="70" y2="13" stroke="#FFFFFF" strokeWidth="2" />

            <rect x="0" y="22" width="85" height="14" rx="2" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" />
            <line x1="10" y1="29" x2="75" y2="29" stroke="#FFFFFF" strokeWidth="2" />
          </g>
          <g transform="translate(100, 40)" opacity="0.95">
            <rect x="0" y="0" width="45" height="28" rx="8" fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" />
            <path d="M10,28 L15,34 L20,28 Z" fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" />
            <text x="8" y="18" fill="#FFFFFF" fontSize="10" fontWeight="bold">Hello</text>
          </g>
        </svg>
      );
    case "Personal Development":
      return (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <rect width="100%" height="100%" fill={bgFill} />
          <path d="M80,120 L130,50 L170,95 L210,35 L270,120 Z" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" />
          <path d="M110,120 L160,65 L200,105 L230,55 L280,120 Z" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" />
          <g transform="translate(210, 50)">
            <path d="M0,-24 L5,-6 L22,-6 L8,4 L13,22 L0,11 L-13,22 L-8,4 L-22,-6 L-5,-6 Z" fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="5" fill="#FFFFFF" />
            <path d="M14,-15 L16,-10 L21,-10 L17,-7 L19,-2 L14,-5 L9,-2 L11,-7 L7,-10 L12,-10 Z" fill="#FFFFFF" />
          </g>
        </svg>
      );
    default:
      return null;
  }
}

function CategoryHeaderIllustration({ category }: { category: string }) {
  switch (category) {
    case "Computer Science":
      return (
        <svg viewBox="0 0 300 160" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background grid or elements */}
          <path d="M 30,120 H 270" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
          <path d="M 50,40 H 250 M 50,70 H 250" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="5 5" />

          {/* Plant on the left */}
          <rect x="50" y="95" width="20" height="25" rx="3" fill="#BACDEB" />
          <path d="M 60,95 Q 50,75 40,80 Q 50,90 60,95 Z" fill="#8C9CBF" />
          <path d="M 60,95 Q 60,70 65,75 Q 70,85 60,95 Z" fill="#4E608A" />
          <path d="M 60,95 Q 70,75 80,82 Q 70,90 60,95 Z" fill="#8C9CBF" />

          {/* Coffee cup */}
          <rect x="220" y="100" width="18" height="20" rx="2" fill="#E2ECF7" stroke="#8C9CBF" strokeWidth="1.5" />
          <path d="M 238,104 Q 244,104 244,110 Q 244,116 238,116" stroke="#8C9CBF" strokeWidth="1.5" fill="none" />

          {/* Code Window / Laptop */}
          {/* Base */}
          <rect x="85" y="55" width="130" height="80" rx="8" fill="#4E608A" />
          {/* Screen inside */}
          <rect x="92" y="62" width="116" height="66" rx="4" fill="#FFFFFF" stroke="#8C9CBF" strokeWidth="1" />
          {/* Laptop keyboard part */}
          <path d="M 70,135 H 230 L 220,140 H 80 Z" fill="#BACDEB" stroke="#4E608A" strokeWidth="1.5" strokeLinejoin="round" />
          <rect x="135" y="136" width="30" height="3" rx="1" fill="#4E608A" />

          {/* Code lines on screen */}
          <rect x="100" y="70" width="40" height="4" rx="2" fill="#BACDEB" />
          <rect x="100" y="80" width="60" height="4" rx="2" fill="#8C9CBF" />
          <rect x="110" y="90" width="50" height="4" rx="2" fill="#E2ECF7" stroke="#8C9CBF" strokeWidth="1" />
          <rect x="110" y="100" width="35" height="4" rx="2" fill="#BACDEB" />
          <rect x="100" y="110" width="25" height="4" rx="2" fill="#4E608A" />

          {/* Floating brackets */}
          <text x="75" y="75" fill="#BACDEB" fontSize="20" fontWeight="bold" fontFamily="monospace">{"{"}</text>
          <text x="210" y="110" fill="#BACDEB" fontSize="18" fontWeight="bold" fontFamily="monospace">{"}"}</text>
          <text x="215" y="65" fill="#8C9CBF" fontSize="14" fontWeight="bold" fontFamily="monospace">{"</>"}</text>
        </svg>
      );
    case "Artificial Intelligence":
      return (
        <svg viewBox="0 0 300 160" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Connecting grid line */}
          <path d="M 30,130 H 270" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

          {/* Background circles / network */}
          <g opacity="0.6">
            <circle cx="150" cy="80" r="60" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="150" cy="80" r="45" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
          </g>

          {/* Robotic Profile / Head */}
          <g transform="translate(30, 0)">
            {/* Neck */}
            <path d="M 105,100 L 105,130 L 125,130 L 125,112 Z" fill="#BACDEB" stroke="#4E608A" strokeWidth="1.5" />
            {/* Face/Head profile */}
            <path d="M 100,50 C 70,50 65,75 65,90 C 65,105 85,115 105,115 C 120,115 130,105 130,85 C 130,55 115,50 100,50 Z" fill="#E2ECF7" stroke="#4E608A" strokeWidth="1.5" />
            {/* Ear piece */}
            <circle cx="100" cy="85" r="12" fill="#BACDEB" stroke="#4E608A" strokeWidth="1.5" />
            <circle cx="100" cy="85" r="5" fill="#4E608A" />
            {/* Eye / visor */}
            <path d="M 66,75 H 85 L 82,85 H 66 Z" fill="#4E608A" rx="1" />
            {/* Head circuit lines/details */}
            <path d="M 100,50 L 100,30" stroke="#4E608A" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="100" cy="30" r="3" fill="#BACDEB" stroke="#4E608A" strokeWidth="1" />
          </g>

          {/* Network structure on the right */}
          <g transform="translate(145, 20)">
            {/* Lines */}
            <path d="M 30,60 L 70,30 L 100,50 L 80,90 L 30,60 Z" stroke="#BACDEB" strokeWidth="1.5" />
            <path d="M 70,30 L 80,90" stroke="#BACDEB" strokeWidth="1.5" />
            <path d="M 30,60 L 100,50" stroke="#BACDEB" strokeWidth="1" strokeDasharray="2 2" />

            {/* Nodes */}
            <circle cx="30" cy="60" r="6" fill="#4E608A" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="70" cy="30" r="7" fill="#BACDEB" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="100" cy="50" r="5" fill="#E2ECF7" stroke="#4E608A" strokeWidth="1.5" />
            <circle cx="80" cy="90" r="6" fill="#BACDEB" stroke="#FFFFFF" strokeWidth="1.5" />
          </g>

          {/* Brain circuits floating */}
          <path d="M 105,45 Q 120,35 130,45" stroke="#4E608A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 95,45 Q 85,35 75,50" stroke="#4E608A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <circle cx="130" cy="45" r="2.5" fill="#BACDEB" stroke="#4E608A" strokeWidth="1" />
          <circle cx="75" cy="50" r="2.5" fill="#BACDEB" stroke="#4E608A" strokeWidth="1" />
        </svg>
      );
    case "Information Technology":
      return (
        <svg viewBox="0 0 300 160" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Floor line */}
          <path d="M 30,130 H 270" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

          {/* Server rack on the left */}
          <rect x="60" y="80" width="45" height="42" rx="4" fill="#BACDEB" stroke="#4E608A" strokeWidth="1.5" />
          <line x1="68" y1="90" x2="97" y2="90" stroke="#4E608A" strokeWidth="2" strokeLinecap="round" />
          <circle cx="72" cy="90" r="1.5" fill="#E2ECF7" />
          <line x1="68" y1="100" x2="97" y2="100" stroke="#4E608A" strokeWidth="2" strokeLinecap="round" />
          <circle cx="72" cy="100" r="1.5" fill="#E2ECF7" />
          <line x1="68" y1="110" x2="97" y2="110" stroke="#4E608A" strokeWidth="2" strokeLinecap="round" />
          <circle cx="72" cy="110" r="1.5" fill="#E2ECF7" />

          {/* Database/Server rack on the right */}
          <rect x="195" y="80" width="45" height="42" rx="4" fill="#E2ECF7" stroke="#4E608A" strokeWidth="1.5" />
          <line x1="203" y1="90" x2="232" y2="90" stroke="#4E608A" strokeWidth="2" strokeLinecap="round" />
          <circle cx="207" cy="90" r="1.5" fill="#BACDEB" />
          <line x1="203" y1="100" x2="232" y2="100" stroke="#4E608A" strokeWidth="2" strokeLinecap="round" />
          <circle cx="207" cy="100" r="1.5" fill="#BACDEB" />
          <line x1="203" y1="110" x2="232" y2="110" stroke="#4E608A" strokeWidth="2" strokeLinecap="round" />
          <circle cx="207" cy="110" r="1.5" fill="#BACDEB" />

          {/* Big Cloud in the Center */}
          <path d="M 150,35 C 135,35 125,45 125,58 C 115,58 107,66 107,76 C 107,86 115,94 125,94 H 175 C 185,94 193,86 193,76 C 193,66 185,58 175,58 C 175,45 165,35 150,35 Z" fill="#E2ECF7" stroke="#4E608A" strokeWidth="1.5" strokeLinejoin="round" />

          {/* Network Connections */}
          {/* Cloud to Server Left */}
          <path d="M 125,85 L 82,85 L 82,80" stroke="#4E608A" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="3 3" />
          {/* Cloud to Server Right */}
          <path d="M 175,85 L 217,85 L 217,80" stroke="#4E608A" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="3 3" />
          {/* Cloud to Floor */}
          <path d="M 150,94 L 150,130" stroke="#4E608A" strokeWidth="1.5" strokeLinecap="round" fill="none" />

          {/* Small laptop/pc at the bottom middle */}
          <rect x="135" y="115" width="30" height="12" rx="2" fill="#BACDEB" stroke="#4E608A" strokeWidth="1" />
          <line x1="140" y1="127" x2="160" y2="127" stroke="#4E608A" strokeWidth="2" />

          {/* Arrows inside cloud or around */}
          <path d="M 145,55 L 150,50 L 155,55 M 150,50 L 150,68 M 155,73 L 150,78 L 145,73 M 150,78 L 150,60" stroke="#4E608A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Business & Management":
      return (
        <svg viewBox="0 0 300 160" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Floor line */}
          <path d="M 30,130 H 270" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

          {/* Briefcase */}
          <rect x="50" y="80" width="60" height="42" rx="6" fill="#BACDEB" stroke="#4E608A" strokeWidth="1.5" />
          {/* Handle */}
          <path d="M 68,80 V 73 C 68,70 72,68 76,68 H 84 C 88,68 92,70 92,73 V 80" stroke="#4E608A" strokeWidth="1.5" fill="none" />
          {/* Lock */}
          <rect x="74" y="92" width="12" height="8" rx="1" fill="#E2ECF7" stroke="#4E608A" strokeWidth="1" />

          {/* Pie Chart / Analytics */}
          <circle cx="205" cy="75" r="28" fill="#E2ECF7" stroke="#4E608A" strokeWidth="1.5" />
          <path d="M 205,75 L 205,47 A 28,28 0 0,1 231.5,84 Z" fill="#4E608A" stroke="#4E608A" strokeWidth="1" />
          <circle cx="205" cy="75" r="10" fill="#FFFFFF" stroke="#4E608A" strokeWidth="1" />

          {/* Calculator or Folder at the bottom right */}
          <rect x="215" y="105" width="22" height="22" rx="3" fill="#BACDEB" stroke="#4E608A" strokeWidth="1" />
          <circle cx="221" cy="111" r="1.5" fill="#4E608A" />
          <circle cx="226" cy="111" r="1.5" fill="#4E608A" />
          <circle cx="231" cy="111" r="1.5" fill="#4E608A" />
          <circle cx="221" cy="116" r="1.5" fill="#4E608A" />
          <circle cx="226" cy="116" r="1.5" fill="#4E608A" />
          <circle cx="231" cy="116" r="1.5" fill="#4E608A" />

          {/* Growing Trend Graph Arrow */}
          <path d="M 125,120 L 145,95 L 165,105 L 205,60" stroke="#4E608A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 195,60 H 205 V 70" stroke="#4E608A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Grid lines behind Graph */}
          <path d="M 125,120 H 205 M 125,100 H 205 M 125,80 H 205" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      );
    case "Civil & Mechanical":
      return (
        <svg viewBox="0 0 300 160" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Floor line */}
          <path d="M 30,130 H 270" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

          {/* Blueprint background details */}
          <path d="M 40,40 V 120 M 80,40 V 120 M 120,40 V 120 M 160,40 V 120 M 200,40 V 120 M 240,40 V 120" stroke="#F1F5F9" strokeWidth="1" />
          <path d="M 40,40 H 260 M 40,80 H 260 M 40,120 H 260" stroke="#F1F5F9" strokeWidth="1" />

          {/* Drafting Ruler / Triangle */}
          <path d="M 50,120 L 110,60 L 110,120 Z" fill="#E2ECF7" stroke="#8C9CBF" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M 65,112 L 95,82 L 95,112 Z" fill="#FFFFFF" stroke="#8C9CBF" strokeWidth="1" />

          {/* Hard Hat in the Center/Left */}
          <g transform="translate(30, 0)">
            {/* Hat cap */}
            <path d="M 85,105 C 85,75 135,75 135,105 Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
            {/* Brim */}
            <path d="M 75,105 H 145" stroke="#CA8A04" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 105,75 V 82" stroke="#CA8A04" strokeWidth="1.5" />
          </g>

          {/* Gears on the Right */}
          <g transform="translate(195, 75)">
            {/* Gear 1 */}
            <circle cx="0" cy="0" r="18" fill="#BACDEB" stroke="#4E608A" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="6" fill="#FFFFFF" stroke="#4E608A" strokeWidth="1.5" />
            {/* Teeth */}
            {Array.from({ length: 8 }).map((_, idx) => {
              const angle = (idx * 360) / 8;
              return (
                <rect
                  key={idx}
                  x="-3"
                  y="-22"
                  width="6"
                  height="5"
                  rx="1"
                  fill="#4E608A"
                  transform={`rotate(${angle})`}
                />
              );
            })}
          </g>

          <g transform="translate(230, 100)">
            {/* Gear 2 (Smaller, interlocking) */}
            <circle cx="0" cy="0" r="12" fill="#E2ECF7" stroke="#4E608A" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="4" fill="#FFFFFF" stroke="#4E608A" strokeWidth="1.5" />
            {/* Teeth */}
            {Array.from({ length: 6 }).map((_, idx) => {
              const angle = (idx * 360) / 6;
              return (
                <rect
                  key={idx}
                  x="-2"
                  y="-15"
                  width="4"
                  height="4"
                  rx="1"
                  fill="#4E608A"
                  transform={`rotate(${angle})`}
                />
              );
            })}
          </g>

          {/* Compass tool */}
          <path d="M 140,50 L 150,85 M 140,50 L 130,85" stroke="#4E608A" strokeWidth="2" strokeLinecap="round" />
          <circle cx="140" cy="50" r="3.5" fill="#BACDEB" stroke="#4E608A" strokeWidth="1" />
        </svg>
      );
    case "Basic Sciences":
      return (
        <svg viewBox="0 0 300 160" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Floor line */}
          <path d="M 30,130 H 270" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

          {/* Test Tubes Rack */}
          <g transform="translate(45, 75)">
            {/* Rack base & frame */}
            <rect x="0" y="45" width="60" height="8" rx="2" fill="#BACDEB" stroke="#4E608A" strokeWidth="1" />
            <line x1="8" y1="20" x2="8" y2="45" stroke="#4E608A" strokeWidth="1.5" />
            <line x1="52" y1="20" x2="52" y2="45" stroke="#4E608A" strokeWidth="1.5" />
            <line x1="0" y1="20" x2="60" y2="20" stroke="#4E608A" strokeWidth="1.5" />

            {/* Test Tube 1 (left) */}
            <path d="M 16,10 V 40 C 16,44 24,44 24,40 V 10" fill="#E2ECF7" stroke="#4E608A" strokeWidth="1.5" />
            <rect x="18" y="24" width="6" height="15" rx="2" fill="#93C5FD" />

            {/* Test Tube 2 (right) */}
            <path d="M 36,10 V 40 C 36,44 44,44 44,40 V 10" fill="#E2ECF7" stroke="#4E608A" strokeWidth="1.5" />
            <rect x="38" y="18" width="6" height="21" rx="2" fill="#FCA5A5" />
          </g>

          {/* Chemical Flask (Center/Right) */}
          <g transform="translate(130, 50)">
            {/* Flask body */}
            <path d="M 22,10 H 32 V 30 L 52,65 C 55,70 51,75 45,75 H 9 C 3,75 -1,70 2,65 L 22,30 Z" fill="#E2ECF7" stroke="#4E608A" strokeWidth="1.5" strokeLinejoin="round" />
            {/* Flask liquid */}
            <path d="M 5,68 L 19,45 H 35 L 49,68 C 50,70 48,73 45,73 H 9 C 6,73 4,70 5,68 Z" fill="#BACDEB" />
            {/* Bubbles */}
            <circle cx="20" cy="35" r="2.5" fill="#4E608A" />
            <circle cx="34" cy="22" r="3.5" fill="#BACDEB" stroke="#4E608A" strokeWidth="1" />
            <circle cx="27" cy="12" r="2" fill="#4E608A" />
          </g>

          {/* Atom Symbol Floating on Right */}
          <g transform="translate(225, 75)">
            <ellipse cx="0" cy="0" rx="30" ry="10" stroke="#BACDEB" strokeWidth="1" transform="rotate(30)" />
            <ellipse cx="0" cy="0" rx="30" ry="10" stroke="#BACDEB" strokeWidth="1" transform="rotate(-30)" />
            <circle cx="0" cy="0" r="8" fill="#4E608A" stroke="#FFFFFF" strokeWidth="2" />

            {/* Electrons */}
            <circle cx="-26" cy="-6" r="3" fill="#4E608A" />
            <circle cx="26" cy="6" r="3" fill="#BACDEB" />
          </g>
        </svg>
      );
    case "Humanities & Languages":
      return (
        <svg viewBox="0 0 300 160" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Floor line */}
          <path d="M 30,130 H 270" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

          {/* Column structure on Left */}
          <g transform="translate(45, 45)">
            <rect x="0" y="75" width="50" height="8" rx="2" fill="#BACDEB" stroke="#4E608A" strokeWidth="1.5" />
            <rect x="5" y="70" width="40" height="5" rx="1" fill="#E2ECF7" stroke="#4E608A" strokeWidth="1.5" />
            {/* Pillars */}
            <rect x="10" y="10" width="8" height="60" rx="1" fill="#BACDEB" stroke="#4E608A" strokeWidth="1.5" />
            <rect x="32" y="10" width="8" height="60" rx="1" fill="#BACDEB" stroke="#4E608A" strokeWidth="1.5" />
            {/* Top */}
            <path d="M 2,10 H 48 L 40,0 H 10 Z" fill="#E2ECF7" stroke="#4E608A" strokeWidth="1.5" strokeLinejoin="round" />
          </g>

          {/* Stack of books in center */}
          <g transform="translate(125, 75)">
            {/* Bottom Book */}
            <rect x="0" y="36" width="65" height="15" rx="2" fill="#BACDEB" stroke="#4E608A" strokeWidth="1.5" />
            <rect x="60" y="39" width="5" height="9" fill="#FFFFFF" />
            {/* Middle Book */}
            <rect x="8" y="22" width="55" height="14" rx="2" fill="#E2ECF7" stroke="#4E608A" strokeWidth="1.5" />
            <rect x="58" y="25" width="5" height="8" fill="#FFFFFF" />
            {/* Top Leaning Book */}
            <g transform="rotate(-15, 12, 10)">
              <rect x="10" y="0" width="50" height="12" rx="2" fill="#4E608A" stroke="#4E608A" strokeWidth="1.5" />
              <rect x="55" y="3" width="5" height="6" fill="#FFFFFF" />
            </g>
          </g>

          {/* Scroll and Quill on Right */}
          <g transform="translate(205, 65)">
            {/* Open Scroll / Document */}
            <path d="M 5,20 C 5,10 15,10 25,10 H 50 C 50,10 50,55 50,55 H 20 C 10,55 5,45 5,45 Z" fill="#E2ECF7" stroke="#4E608A" strokeWidth="1.5" />
            <path d="M 5,45 H 42" stroke="#4E608A" strokeWidth="1" />
            <path d="M 12,20 H 40 M 12,30 H 40 M 12,40 H 30" stroke="#BACDEB" strokeWidth="1.5" strokeLinecap="round" />

            {/* Quill Pen */}
            <path d="M 38,3 L 26,25 L 24,30 L 29,28 L 48,-2 Z" fill="#BACDEB" stroke="#4E608A" strokeWidth="1" />
            <path d="M 28,21 L 43,2" stroke="#4E608A" strokeWidth="1" />
          </g>
        </svg>
      );
    case "Personal Development":
      return (
        <svg viewBox="0 0 300 160" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Floor line */}
          <path d="M 30,130 H 270" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

          {/* Target with Dart on Left */}
          <g transform="translate(60, 80)">
            <circle cx="0" cy="0" r="28" fill="#E2ECF7" stroke="#4E608A" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="18" fill="#BACDEB" stroke="#4E608A" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="8" fill="#4E608A" stroke="#FFFFFF" strokeWidth="1.5" />

            {/* Dart */}
            <path d="M -8,-8 L -24,-24 M -22,-24 L -24,-24 L -24,-22" stroke="#4E608A" strokeWidth="2" strokeLinecap="round" />
            {/* Dart flights */}
            <path d="M -20,-24 L -26,-26 L -24,-20 Z" fill="#4E608A" />
          </g>

          {/* Staircase/Steps on Right */}
          <g transform="translate(150, 45)">
            {/* Steps outline */}
            <path d="M 0,85 H 90 V 45 H 65 V 25 H 40 V 5 H 15 V 85 Z" fill="#E2ECF7" stroke="#4E608A" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M 15,85 V 5 H 40 V 25 H 65 V 45 H 90 V 85" stroke="#BACDEB" strokeWidth="1" />

            {/* Person celebrating at the top step */}
            <g transform="translate(25, -20)">
              {/* Head */}
              <circle cx="0" cy="-6" r="4.5" fill="#4E608A" />
              {/* Body */}
              <path d="M 0,-1 L 0,10" stroke="#4E608A" strokeWidth="2.5" strokeLinecap="round" />
              {/* Arms */}
              <path d="M -8,-5 Q 0,-8 8,-5" fill="none" stroke="#4E608A" strokeWidth="2" strokeLinecap="round" />
              {/* Legs */}
              <path d="M 0,10 L -4,20 M 0,10 L 4,20" stroke="#4E608A" strokeWidth="2" strokeLinecap="round" />
            </g>
          </g>

          {/* Sparkles / Stars in the sky */}
          <path d="M 140,25 L 142,29 L 147,30 L 143,32 L 144,37 L 140,34 L 136,37 L 137,32 L 133,30 L 138,29 Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />
        </svg>
      );
    default:
      return null;
  }
}

function WebinarCardHeader({ title, status, duration, category }: { title: string; status: string; duration: string; category: string }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "150px", overflow: "hidden", background: "#FAF8F5", borderBottom: "2px solid #1A1A1A" }}>
      {/* Blueprint grid background */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 320 150">
        <defs>
          <pattern id="gridPattern" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(26,26,26,0.06)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gridPattern)" />
      </svg>

      {/* Visual illustration based on title */}
      {title.includes("Generative AI") && (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 320 150">
          <line x1="60" y1="35" x2="160" y2="75" stroke="#4B6189" strokeWidth="1.5" />
          <line x1="260" y1="35" x2="160" y2="75" stroke="#4B6189" strokeWidth="1.5" />
          <line x1="80" y1="115" x2="160" y2="75" stroke="#4B6189" strokeWidth="1.5" />
          <line x1="240" y1="115" x2="160" y2="75" stroke="#4B6189" strokeWidth="1.5" />
          <line x1="60" y1="35" x2="30" y2="75" stroke="#1A1A1A" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="260" y1="35" x2="290" y2="75" stroke="#1A1A1A" strokeWidth="1" strokeDasharray="2 2" />

          {/* Dotted concentric outer ring */}
          <circle cx="160" cy="75" r="32" stroke="#4B6189" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
          <circle cx="160" cy="75" r="12" fill="#4B6189" />
          <circle cx="160" cy="75" r="4" fill="#FFFFFF" />

          {/* Nodes */}
          <circle cx="60" cy="35" r="6" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="2" />
          <circle cx="260" cy="35" r="6" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="2" />
          <circle cx="80" cy="115" r="6" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="2" />
          <circle cx="240" cy="115" r="6" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="2" />
          <circle cx="30" cy="75" r="4" fill="#FFFFFF" stroke="#4B6189" strokeWidth="1.5" />
          <circle cx="290" cy="75" r="4" fill="#FFFFFF" stroke="#4B6189" strokeWidth="1.5" />
        </svg>
      )}

      {title.includes("React & Next.js") && (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 320 150">
          <g transform="translate(100, 75)">
            <path d="M -35,15 A 35,35 0 0,1 35,15" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M -35,15 A 35,35 0 0,1 15,-30" stroke="#4B6189" strokeWidth="4" strokeLinecap="round" fill="none" />
            <line x1="0" y1="10" x2="22" y2="-20" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="0" cy="10" r="4" fill="#4B6189" stroke="#1A1A1A" strokeWidth="1.5" />
          </g>
          <g transform="translate(220, 75)">
            <ellipse cx="0" cy="0" rx="36" ry="13" stroke="#4B6189" strokeWidth="2" fill="none" transform="rotate(30)" />
            <ellipse cx="0" cy="0" rx="36" ry="13" stroke="#1A1A1A" strokeWidth="1.5" strokeDasharray="3 3" fill="none" transform="rotate(-30)" />
            <circle cx="0" cy="0" r="6" fill="#4B6189" stroke="#1A1A1A" strokeWidth="1.5" />
          </g>
        </svg>
      )}

      {title.includes("Secure & Resilient APIs") && (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 320 150">
          {/* Schematic backdrop */}
          <text x="35" y="32" fill="#4B6189" fontSize="9.5" fontFamily="monospace" fontWeight="800" opacity="0.8" letterSpacing="0.02em">GET /api/v1/auth/session</text>
          <line x1="35" y1="40" x2="160" y2="40" stroke="#4B6189" strokeWidth="1" strokeDasharray="2 2" />

          <g transform="translate(160, 85)">
            {/* Outline shield */}
            <path d="M-18,-15 L18,-15 V5 C18,17 0,27 0,31 C0,27 -18,17 -18,5 Z" fill="none" stroke="#1A1A1A" strokeWidth="2.5" />
            <path d="M-12,-10 L12,-10 V5 C12,14 0,22 0,25 C0,22 -12,14 -12,5 Z" fill="none" stroke="#4B6189" strokeWidth="1.5" />
            <circle cx="0" cy="-2" r="3.5" fill="#1A1A1A" />
            <polygon points="-2.5,-2 2.5,-2 3.5,10 -3.5,10" fill="#1A1A1A" />
          </g>
          <text x="160" y="132" fill="#1A1A1A" fontSize="9" fontFamily="monospace" fontWeight="800" textAnchor="middle" letterSpacing="0.08em">SECURE LAYER ACTIVE</text>
        </svg>
      )}

      {title.includes("Cloud Computing") && (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 320 150">
          <g transform="translate(60, 40)">
            <rect x="0" y="0" width="48" height="68" rx="6" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="2" />
            <rect x="5" y="7" width="38" height="12" rx="2.5" fill="none" stroke="#4B6189" strokeWidth="1.5" />
            <circle cx="12" cy="13" r="2" fill="#1A1A1A" />
            <rect x="5" y="27" width="38" height="12" rx="2.5" fill="none" stroke="#4B6189" strokeWidth="1.5" />
            <circle cx="12" cy="33" r="2" fill="#1A1A1A" />
            <rect x="5" y="47" width="38" height="12" rx="2.5" fill="none" stroke="#4B6189" strokeWidth="1.5" />
            <circle cx="12" cy="53" r="2" fill="#1A1A1A" />
          </g>

          <path d="M 125,70 Q 140,60 155,70" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
          <polygon points="155,70 149,66 153,74" fill="#1A1A1A" />
          <path d="M 155,80 Q 140,90 125,80" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
          <polygon points="125,80 131,84 127,76" fill="#1A1A1A" />

          <g transform="translate(195, 45)">
            <path d="M 10,35 A 11,11 0 0,1 18,16 A 17,17 0 0,1 48,13 A 13,13 0 0,1 60,35 Z" fill="none" stroke="#4B6189" strokeWidth="2.5" />
            <line x1="10" y1="35" x2="60" y2="35" stroke="#4B6189" strokeWidth="2.5" />
          </g>
        </svg>
      )}

      {title.includes("Product Management") && (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 320 150">
          <g transform="translate(60, 45)">
            <rect x="0" y="0" width="18" height="18" rx="1.5" fill="none" stroke="#1A1A1A" strokeWidth="2" transform="rotate(-6, 0, 0)" />
            <line x1="3" y1="5" x2="15" y2="5" stroke="#4B6189" strokeWidth="1.5" transform="rotate(-6, 0, 0)" />
            <rect x="25" y="2" width="18" height="18" rx="1.5" fill="none" stroke="#1A1A1A" strokeWidth="2" transform="rotate(8, 25, 2)" />
            <line x1="28" y1="7" x2="40" y2="7" stroke="#4B6189" strokeWidth="1.5" transform="rotate(8, 25, 2)" />
          </g>
          <g transform="translate(210, 75)">
            <circle cx="0" cy="0" r="28" fill="none" stroke="#4B6189" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="0" cy="0" r="18" fill="none" stroke="#1A1A1A" strokeWidth="2" />
            <circle cx="0" cy="0" r="8" fill="#4B6189" />
            <line x1="28" y1="-28" x2="5" y2="-5" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="3,-3 5,-10 10,-5" fill="#1A1A1A" />
          </g>
        </svg>
      )}

      {title.includes("Structural Analysis") && (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 320 150">
          <g transform="translate(0, 10)">
            <line x1="50" y1="95" x2="270" y2="95" stroke="#1A1A1A" strokeWidth="2" />
            <polyline points="50,95 105,35 160,95 215,35 270,95" fill="none" stroke="#4B6189" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="105" y1="35" x2="105" y2="95" stroke="#1A1A1A" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1="160" y1="35" x2="160" y2="95" stroke="#1A1A1A" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1="215" y1="35" x2="215" y2="95" stroke="#1A1A1A" strokeWidth="1.5" strokeDasharray="2 2" />

            {/* Force load arrows */}
            <line x1="105" y1="8" x2="105" y2="28" stroke="#1A1A1A" strokeWidth="2.5" />
            <polygon points="105,31 101,24 109,24" fill="#1A1A1A" />

            <line x1="215" y1="8" x2="215" y2="28" stroke="#1A1A1A" strokeWidth="2.5" />
            <polygon points="215,31 211,24 219,24" fill="#1A1A1A" />
          </g>
        </svg>
      )}
    </div>
  );
}

function CoursesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Route selector
  const initialCategory = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<"courses" | "bootcamps" | "webinars">("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Ref for the content section — used to auto-scroll into view on tab switch
  const contentRef = React.useRef<HTMLDivElement>(null);

  const handleTabSwitch = (tab: "courses" | "bootcamps" | "webinars") => {
    setActiveTab(tab);
    setSearchQuery("");
    // Small delay lets React flush the state before scrolling
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

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
    router.push("/explore");
  };

  // RENDER OPTION A: Dedicated Category/Department Page
  if (activeCategory) {
    const activeData = CATEGORY_DATA[activeCategory] || CATEGORY_DATA["Computer Science"];
    return (
      <div
        style={{
          background: `
            radial-gradient(ellipse 55% 40% at 8% 12%, rgba(59, 130, 246, 0.16) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 92% 24%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 45% 35% at 5% 52%, rgba(155, 93, 229, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 6% 76%, rgba(14, 165, 233, 0.11) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 94% 76%, rgba(14, 165, 233, 0.11) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 48% 94%, rgba(249, 200, 70, 0.07) 0%, transparent 60%),
            linear-gradient(to bottom, #E9EEFB 0%, #F8FAFC 25%, #FFFFFF 50%, #FFFFFF 75%, #EAF7EF 100%)
          `,
          minHeight: "100vh",
          color: "#000000",
          fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
        }}
      >

        {/* Dynamic Category View (Full Screen Layout) */}
        <main
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "110px 48px 80px",
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "60px",
          }}
          className="lp-courses-layout"
        >
          {/* Sidebar */}
          <aside style={{ alignSelf: "start", position: "sticky", top: "96px" }}>
            <button
              onClick={handleGoBackToExplore}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0 0 20px",
                fontSize: "0.9rem",
                fontWeight: "700",
                color: "#6B7280",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              ← Back to Explore
            </button>
            <h3
              style={{
                fontSize: "0.85rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#6B7280",
                marginBottom: "20px"
              }}
            >
              Departments
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}
            >
              {categoriesList.map((item) => {
                const isActive = activeCategory === item;
                const catColor = CATEGORY_DATA[item].colors.primary;
                return (
                  <li key={item}>
                    <button
                      onClick={() => handleCategorySwitch(item)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        background: isActive ? CATEGORY_DATA[item].colors.secondary : "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        fontWeight: isActive ? "700" : "500",
                        color: isActive ? catColor : "#4B5563",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {isActive && (
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: catColor,
                            boxShadow: `0 0 6px ${catColor}`
                          }}
                        />
                      )}
                      {item}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Dynamic Content */}
          <section style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            <div>
              <h1
                style={{
                  fontSize: "clamp(2rem, 4vw, 2.5rem)",
                  fontWeight: 800,
                  color: "#000000",
                  marginBottom: "12px",
                  letterSpacing: "-0.02em"
                }}
              >
                {activeCategory} Courses
              </h1>
              <p
                style={{
                  fontSize: "1.05rem",
                  color: "#4B5563",
                  lineHeight: "1.6",
                  maxWidth: "860px",
                  margin: 0
                }}
              >
                {activeData.desc} Browse the courses, practical bootcamps, and resources curated to build your skills.
              </p>
            </div>

            {/* Courses section */}
            <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: "32px" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#000000", marginBottom: "20px" }}>
                Available Courses ({activeData.courses.length})
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
                {activeData.courses.map((course) => (
                  <div
                    key={course.title}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E5E7EB",
                      borderRadius: "12px",
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: "180px",
                      cursor: "default"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", color: activeData.colors.primary, background: activeData.colors.secondary, padding: "2px 8px", borderRadius: "4px" }}>
                          {course.level}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>{course.duration}</span>
                      </div>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#000000", marginBottom: "8px" }}>
                        {course.title}
                      </h3>
                      <p style={{ fontSize: "0.85rem", color: "#4B5563", lineHeight: "1.5", margin: 0 }}>
                        {course.desc}
                      </p>
                    </div>
                    <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#6B7280" }}>Syllabus Available</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bootcamps section */}
            <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: "32px" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#000000", marginBottom: "20px" }}>
                Practical Bootcamps & Workshops
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {activeData.bootcamps.map((bootcamp) => (
                  <div
                    key={bootcamp.title}
                    style={{
                      background: `linear-gradient(135deg, #FFFFFF 85%, ${activeData.colors.secondary} 100%)`,
                      border: "1px solid #E5E7EB",
                      borderLeft: `5px solid ${activeData.colors.primary}`,
                      borderRadius: "10px",
                      padding: "16px 20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      position: "relative",
                      overflow: "hidden"
                    }}
                  >
                    <CategoryWatermark category={activeCategory} color={activeData.colors.primary} />
                    <div style={{ position: "relative", zIndex: 1 }}>
                      <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#000000" }}>{bootcamp.title}</div>
                      <div style={{ fontSize: "0.8rem", color: "#6B7280", marginTop: "2px" }}>
                        {bootcamp.type} • {bootcamp.duration}
                      </div>
                    </div>
                    <Link
                      href="/login"
                      className="explore-register-btn"
                      style={{
                        "--btn-primary": activeData.colors.primary,
                        "--btn-secondary": activeData.colors.secondary,
                        position: "relative",
                        zIndex: 1
                      } as React.CSSProperties}
                    >
                      Register
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources section */}
            <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: "32px" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#000000", marginBottom: "20px" }}>
                Resource Libraries
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                {activeData.resources.map((doc) => (
                  <div
                    key={doc.title}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E5E7EB",
                      borderRadius: "10px",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: "120px"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", marginBottom: "8px" }}>
                        {doc.type}
                      </div>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#000000", margin: "0 0 8px", lineHeight: "1.4" }}>
                        {doc.title}
                      </h3>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{doc.readTime}</span>
                      <span style={{ fontSize: "0.8rem", fontWeight: "700", color: activeData.colors.primary, cursor: "pointer", textDecoration: "underline" }}>Read Link</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // RENDER OPTION B: Main Explore Hub Dashboard
  return (
    <div
      style={{
        background: `
          radial-gradient(ellipse 55% 40% at 8% 12%, rgba(59, 130, 246, 0.16) 0%, transparent 60%),
          radial-gradient(ellipse 50% 35% at 92% 24%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
          radial-gradient(ellipse 45% 35% at 5% 52%, rgba(155, 93, 229, 0.08) 0%, transparent 60%),
          radial-gradient(ellipse 50% 35% at 6% 76%, rgba(14, 165, 233, 0.11) 0%, transparent 60%),
          radial-gradient(ellipse 50% 35% at 94% 76%, rgba(14, 165, 233, 0.11) 0%, transparent 60%),
          radial-gradient(ellipse 40% 30% at 48% 94%, rgba(249, 200, 70, 0.07) 0%, transparent 60%),
          linear-gradient(to bottom, #E9EEFB 0%, #F8FAFC 25%, #FFFFFF 50%, #FFFFFF 75%, #EAF7EF 100%)
        `,
        minHeight: "100vh",
        color: "#000000",
        fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      <style>{`
        .lp-category-card {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .lp-category-card:hover {
          transform: translateY(-8px);
          border-color: var(--hover-color) !important;
          box-shadow: 0 20px 30px -10px var(--hover-shadow) !important;
        }
        .lp-category-card:hover .lp-category-card-arrow {
          stroke: var(--hover-color) !important;
          transform: translateX(6px);
        }
        .lp-bootcamp-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 32px -8px rgba(75, 97, 137, 0.2);
          border-left-color: #2563EB !important;
        }
        .lp-webinar-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.12);
        }
        @keyframes tabContentEnter {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tab-content-panel {
          animation: tabContentEnter 0.38s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

      {/* Spacer to prevent banner content/diagonal background from sliding under the fixed header navigation bar */}
      <div style={{ height: "64px" }} />

      {/* Neobrutalist Typography Header */}
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "80px 48px 24px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            fontWeight: 900,
            color: "#1A1A1A",
            letterSpacing: "-0.04em",
            marginBottom: "12px",
            lineHeight: "1.15",
            fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
          }}
        >
          EXPLORE{" "}
          <span
            style={{
              position: "relative",
              display: "inline-block",
              padding: "4px 16px",
              border: "2px solid #4B6189",
              borderRadius: "6px",
              marginLeft: "8px",
              background: "#FFFFFF"
            }}
          >
            <GradientText
              colors={['#2563EB', '#0EA5E9', '#06B6D4', '#10B981', '#4F46E5', '#2563EB']}
              animationSpeed={8}
            >
              Arcade Hub
            </GradientText>
            {/* Top-left handle stick and dot */}
            <span style={{ position: "absolute", left: "-2px", top: "-14px", width: "2px", height: "14px", background: "#4B6189" }}>
              <span style={{ position: "absolute", left: "-3px", top: "-6px", width: "8px", height: "8px", borderRadius: "50%", background: "#4B6189" }} />
            </span>
            {/* Bottom-right handle stick and dot */}
            <span style={{ position: "absolute", right: "-2px", bottom: "-14px", width: "2px", height: "14px", background: "#4B6189" }}>
              <span style={{ position: "absolute", right: "-3px", bottom: "-6px", width: "8px", height: "8px", borderRadius: "50%", background: "#4B6189" }} />
            </span>
            {/* Top-right corner handle */}
            <span style={{ position: "absolute", right: "-4px", top: "-4px", width: "8px", height: "8px", border: "1px solid #FFFFFF", background: "#4B6189" }} />
            {/* Bottom-left corner handle */}
            <span style={{ position: "absolute", left: "-4px", bottom: "-4px", width: "8px", height: "8px", border: "1px solid #FFFFFF", background: "#4B6189" }} />
          </span>
        </h1>
        <p
          style={{
            fontSize: "0.92rem",
            color: "#4B5563",
            maxWidth: "600px",
            margin: "18px auto 0",
            lineHeight: "1.6",
            textAlign: "center",
            fontWeight: 500
          }}
        >
          Access self-paced categories, practical masterclass bootcamps, and live expert webinars, all customized in one unified interface.
        </p>
      </div>

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 48px 100px" }}>

        {/* Tab Selection Cards (Top 3 Choices) - Neobrutalist design */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
            position: "relative",
            zIndex: 2,
            maxWidth: "1050px",
            width: "100%",
            margin: "32px auto 48px"
          }}
        >
          {/* Card: Courses */}
          <motion.div
            onClick={() => handleTabSwitch("courses")}
            whileHover={{ y: -6, scale: 1.02, opacity: 1 }}
            animate={{
              scale: activeTab === "courses" ? 1.03 : 0.97,
              opacity: activeTab === "courses" ? 1 : 0.7,
              rotate: activeTab === "courses" ? -1.5 : 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              position: "relative",
              background: activeTab === "courses" ? "#EFF6FF" : "#FFFFFF",
              border: activeTab === "courses" ? "3px solid #3B82F6" : "2px solid #E5E7EB",
              borderRadius: "20px",
              padding: "24px 20px",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: activeTab === "courses" ? "8px 8px 0px #3B82F6" : "2px 2px 0px rgba(0, 0, 0, 0.05)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "260px",
              zIndex: activeTab === "courses" ? 3 : 1,
              transition: "background-color 0.3s, border-color 0.3s, box-shadow 0.3s"
            }}
          >
            <div>
              <div style={{
                fontSize: "0.68rem",
                fontWeight: "800",
                color: activeTab === "courses" ? "#2563EB" : "#6B7280",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "10px",
                transition: "color 0.3s"
              }}>
                01 // SELF-PACED
              </div>
              <h3 style={{
                fontSize: "1.15rem",
                fontWeight: "800",
                color: activeTab === "courses" ? "#1E40AF" : "#1A1A1A",
                margin: "0 0 8px",
                lineHeight: "1.2",
                transition: "color 0.3s"
              }}>
                Self-Paced Courses
              </h3>
              <p style={{ fontSize: "0.78rem", color: "#4B5563", margin: "0 0 16px", lineHeight: "1.5" }}>
                Explore available categories and select department tracks to see individual courses.
              </p>
            </div>
            {/* Minimalist Sketch Illustration */}
            <motion.div
              animate={{
                scale: activeTab === "courses" ? 1.15 : 1,
                y: activeTab === "courses" ? -5 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              style={{ width: "100%", height: "65px" }}
            >
              <svg viewBox="0 0 160 120" width="100%" height="65" style={{ display: "block", margin: "0 auto", overflow: "visible" }}>
                <rect x="30" y="30" width="100" height="60" rx="8" fill="none" stroke={activeTab === "courses" ? "#3B82F6" : "#1A1A1A"} strokeWidth="2" style={{ transition: "stroke 0.3s" }} />
                <rect x="36" y="36" width="88" height="48" rx="4" fill={activeTab === "courses" ? "rgba(59, 130, 246, 0.05)" : "none"} stroke={activeTab === "courses" ? "#3B82F6" : "#1A1A1A"} strokeWidth="1.5" style={{ transition: "stroke 0.3s, fill 0.3s" }} />
                <path d="M 16,98 L 144,98 L 132,106 L 28,106 Z" fill="none" stroke={activeTab === "courses" ? "#3B82F6" : "#1A1A1A"} strokeWidth="2" strokeLinejoin="round" style={{ transition: "stroke 0.3s" }} />
                <rect x="68" y="100" width="24" height="4" rx="1" fill="none" stroke={activeTab === "courses" ? "#3B82F6" : "#1A1A1A"} strokeWidth="1.5" style={{ transition: "stroke 0.3s" }} />
                <motion.line x1="44" y1="44" x2="72" y2="44" stroke={activeTab === "courses" ? "#3B82F6" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" animate={activeTab === "courses" ? { x: [0, 4, 0] } : {}} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} style={{ transition: "stroke 0.3s" }} />
                <motion.line x1="44" y1="52" x2="88" y2="52" stroke={activeTab === "courses" ? "#3B82F6" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" animate={activeTab === "courses" ? { x: [0, 6, -2, 0] } : {}} transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }} style={{ transition: "stroke 0.3s" }} />
                <motion.line x1="44" y1="60" x2="64" y2="60" stroke={activeTab === "courses" ? "#3B82F6" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" animate={activeTab === "courses" ? { x: [0, -3, 3, 0] } : {}} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }} style={{ transition: "stroke 0.3s" }} />
                <motion.line x1="52" y1="68" x2="96" y2="68" stroke={activeTab === "courses" ? "#3B82F6" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" animate={activeTab === "courses" ? { x: [0, 5, 0] } : {}} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} style={{ transition: "stroke 0.3s" }} />
                <motion.line x1="52" y1="76" x2="80" y2="76" stroke={activeTab === "courses" ? "#3B82F6" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" animate={activeTab === "courses" ? { x: [0, -2, 2, 0] } : {}} transition={{ repeat: Infinity, duration: 2.1, ease: "easeInOut" }} style={{ transition: "stroke 0.3s" }} />
                <path d="M 12,28 Q 20,20 18,12" stroke={activeTab === "courses" ? "#3B82F6" : "#4B6189"} strokeWidth="1.5" strokeLinecap="round" fill="none" style={{ transition: "stroke 0.3s" }} />
                <motion.circle cx="140" cy="24" r="3" fill={activeTab === "courses" ? "#3B82F6" : "#4B6189"} animate={activeTab === "courses" ? { scale: [1, 1.4, 1] } : {}} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} style={{ transition: "fill 0.3s" }} />
                <motion.circle cx="148" cy="40" r="1.5" fill={activeTab === "courses" ? "#3B82F6" : "#4B6189"} animate={activeTab === "courses" ? { scale: [1, 1.6, 1] } : {}} transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.3 }} style={{ transition: "fill 0.3s" }} />
              </svg>
            </motion.div>
          </motion.div>

          {/* Card: Bootcamps */}
          <motion.div
            onClick={() => handleTabSwitch("bootcamps")}
            whileHover={{ y: -6, scale: 1.02, opacity: 1 }}
            animate={{
              scale: activeTab === "bootcamps" ? 1.03 : 0.97,
              opacity: activeTab === "bootcamps" ? 1 : 0.7,
              rotate: activeTab === "bootcamps" ? 0.5 : 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              position: "relative",
              background: activeTab === "bootcamps" ? "#F5F3FF" : "#FFFFFF",
              border: activeTab === "bootcamps" ? "3px solid #8B5CF6" : "2px solid #E5E7EB",
              borderRadius: "20px",
              padding: "24px 20px",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: activeTab === "bootcamps" ? "8px 8px 0px #8B5CF6" : "2px 2px 0px rgba(0, 0, 0, 0.05)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "260px",
              zIndex: activeTab === "bootcamps" ? 3 : 1,
              transition: "background-color 0.3s, border-color 0.3s, box-shadow 0.3s"
            }}
          >
            <div>
              <div style={{
                fontSize: "0.68rem",
                fontWeight: "800",
                color: activeTab === "bootcamps" ? "#7C3AED" : "#6B7280",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "10px",
                transition: "color 0.3s"
              }}>
                02 // INTERACTIVE
              </div>
              <h3 style={{
                fontSize: "1.15rem",
                fontWeight: "800",
                color: activeTab === "bootcamps" ? "#5B21B6" : "#1A1A1A",
                margin: "0 0 8px",
                lineHeight: "1.2",
                transition: "color 0.3s"
              }}>
                Workshops & Bootcamps
              </h3>
              <p style={{ fontSize: "0.78rem", color: "#4B5563", margin: "0 0 16px", lineHeight: "1.5" }}>
                Join live, interactive, mentor-led programs designed for technical skill development.
              </p>
            </div>
            {/* Minimalist Sketch Illustration */}
            <motion.div
              animate={{
                scale: activeTab === "bootcamps" ? 1.15 : 1,
                y: activeTab === "bootcamps" ? -5 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              style={{ width: "100%", height: "65px" }}
            >
              <svg viewBox="0 0 160 120" width="100%" height="65" style={{ display: "block", margin: "0 auto", overflow: "visible" }}>
                <rect x="25" y="85" width="22" height="20" rx="3" fill={activeTab === "bootcamps" ? "rgba(139, 92, 246, 0.05)" : "none"} stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="2" style={{ transition: "stroke 0.3s, fill 0.3s" }} />
                <rect x="47" y="65" width="22" height="40" rx="3" fill={activeTab === "bootcamps" ? "rgba(139, 92, 246, 0.05)" : "none"} stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="2" style={{ transition: "stroke 0.3s, fill 0.3s" }} />
                <rect x="69" y="45" width="22" height="60" rx="3" fill={activeTab === "bootcamps" ? "rgba(139, 92, 246, 0.05)" : "none"} stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="2" style={{ transition: "stroke 0.3s, fill 0.3s" }} />
                <motion.rect x="91" y="25" width="22" height="80" rx="3" fill={activeTab === "bootcamps" ? "rgba(139, 92, 246, 0.05)" : "none"} stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="2" animate={activeTab === "bootcamps" ? { height: [80, 85, 80], y: [25, 20, 25] } : {}} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.3 }} style={{ transition: "stroke 0.3s, fill 0.3s" }} />
                <motion.path d="M 125,25 L 128,31 L 135,32 L 130,36 L 132,43 L 125,39 L 118,43 L 120,36 L 115,32 L 122,31 Z" fill={activeTab === "bootcamps" ? "rgba(139, 92, 246, 0.2)" : "none"} stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#4B6189"} strokeWidth="1.5" strokeLinejoin="round" animate={activeTab === "bootcamps" ? { scale: [1, 1.25, 1], rotate: [0, 15, -15, 0] } : {}} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} style={{ transformOrigin: "125px 34px", transition: "stroke 0.3s, fill 0.3s" }} />
                <circle cx="58" cy="28" r="7" fill="none" stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="2" style={{ transition: "stroke 0.3s" }} />
                <path d="M 58,35 C 58,45 52,50 62,55" fill="none" stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 54,42 Q 68,36 82,30" fill="none" stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 82,30 L 102,15 Q 104,13 107,16 L 109,19 Q 111,22 108,24 L 88,39 Z" fill="none" stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="1.5" strokeLinejoin="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 102,15 L 108,24" stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="1.5" style={{ transition: "stroke 0.3s" }} />
                <path d="M 55,50 L 48,65" stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 60,51 L 69,45" stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
              </svg>
            </motion.div>
          </motion.div>

          {/* Card: Webinars */}
          <motion.div
            onClick={() => handleTabSwitch("webinars")}
            whileHover={{ y: -6, scale: 1.02, opacity: 1 }}
            animate={{
              scale: activeTab === "webinars" ? 1.03 : 0.97,
              opacity: activeTab === "webinars" ? 1 : 0.7,
              rotate: activeTab === "webinars" ? 1.5 : 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              position: "relative",
              background: activeTab === "webinars" ? "#EFF4FC" : "#FFFFFF",
              border: activeTab === "webinars" ? "3px solid #0A1931" : "2px solid #E5E7EB",
              borderRadius: "20px",
              padding: "24px 20px",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: activeTab === "webinars" ? "8px 8px 0px #0A1931" : "2px 2px 0px rgba(0, 0, 0, 0.05)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "260px",
              zIndex: activeTab === "webinars" ? 3 : 1,
              transition: "background-color 0.3s, border-color 0.3s, box-shadow 0.3s"
            }}
          >
            <div>
              <div style={{
                fontSize: "0.68rem",
                fontWeight: "800",
                color: activeTab === "webinars" ? "#1E3A8A" : "#6B7280",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "10px",
                transition: "color 0.3s"
              }}>
                03 // EXPERT LED
              </div>
              <h3 style={{
                fontSize: "1.15rem",
                fontWeight: "800",
                color: activeTab === "webinars" ? "#0F172A" : "#1A1A1A",
                margin: "0 0 8px",
                lineHeight: "1.2",
                transition: "color 0.3s"
              }}>
                Expert Webinars
              </h3>
              <p style={{ fontSize: "0.78rem", color: "#4B5563", margin: "0 0 16px", lineHeight: "1.5" }}>
                Watch recorded sessions or register for live-streamed presentations.
              </p>
            </div>
            {/* Minimalist Sketch Illustration */}
            <motion.div
              animate={{
                scale: activeTab === "webinars" ? 1.15 : 1,
                y: activeTab === "webinars" ? -5 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              style={{ width: "100%", height: "65px" }}
            >
              <svg viewBox="0 0 160 120" width="100%" height="65" style={{ display: "block", margin: "0 auto", overflow: "visible" }}>
                <motion.circle cx="45" cy="40" r="7" fill={activeTab === "webinars" ? "rgba(10, 25, 49, 0.05)" : "none"} stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" animate={activeTab === "webinars" ? { y: [0, -3, 0] } : {}} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} style={{ transition: "stroke 0.3s, fill 0.3s" }} />
                <path d="M 45,47 L 45,75" stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 45,55 L 30,65" stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 45,52 L 65,38" stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 45,75 L 35,95" stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 45,75 L 55,95" stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />

                <motion.circle cx="115" cy="40" r="7" fill={activeTab === "webinars" ? "rgba(10, 25, 49, 0.05)" : "none"} stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" animate={activeTab === "webinars" ? { y: [0, -3, 0] } : {}} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.3 }} style={{ transition: "stroke 0.3s, fill 0.3s" }} />
                <path d="M 115,47 L 115,75" stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 115,52 L 95,38" stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 115,55 L 130,65" stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 115,75 L 105,95" stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 115,75 L 125,95" stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />

                <motion.path d="M 80,30 L 80,24" stroke={activeTab === "webinars" ? "#0A1931" : "#4B6189"} strokeWidth="2" strokeLinecap="round" animate={activeTab === "webinars" ? { scaleY: [1, 1.5, 1], y: [0, -2, 0] } : {}} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} style={{ transformOrigin: "80px 30px", transition: "stroke 0.3s" }} />
                <motion.path d="M 75,34 L 69,30" stroke={activeTab === "webinars" ? "#0A1931" : "#4B6189"} strokeWidth="2" strokeLinecap="round" animate={activeTab === "webinars" ? { x: [0, -2, 0], y: [0, -1, 0] } : {}} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} style={{ transition: "stroke 0.3s" }} />
                <motion.path d="M 85,34 L 91,30" stroke={activeTab === "webinars" ? "#0A1931" : "#4B6189"} strokeWidth="2" strokeLinecap="round" animate={activeTab === "webinars" ? { x: [0, 2, 0], y: [0, -1, 0] } : {}} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} style={{ transition: "stroke 0.3s" }} />
              </svg>
            </motion.div>
          </motion.div>
        </div>

        {/* Full-Width Search and Filters Row */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            width: "100%",
            background: "#FFFFFF",
            border: isSearchFocused ? "2px solid #4B6189" : "1px solid #E5E7EB",
            borderRadius: "16px",
            padding: isSearchFocused ? "14px 22px" : "15px 23px",
            marginBottom: "40px",
            boxShadow: isSearchFocused
              ? "0 10px 25px -5px rgba(59, 130, 246, 0.15), 0 0 0 4px rgba(59, 130, 246, 0.1)"
              : "0 4px 12px rgba(0, 0, 0, 0.02)",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            cursor: "text"
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isSearchFocused ? "#4B6189" : "#9CA3AF"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: "stroke 0.3s ease" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder={`Search available ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            suppressHydrationWarning
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: "1rem",
              fontWeight: "500",
              color: "#111827",
              background: "transparent"
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9CA3AF",
                borderRadius: "50%",
                transition: "background 0.2s, color 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#F3F4F6";
                e.currentTarget.style.color = "#1F2937";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.color = "#9CA3AF";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Tab content panels — ref used for auto-scroll on tab switch */}
        <div
          ref={contentRef}
          style={{ scrollMarginTop: "100px" }}
        >
          {activeTab === "courses" && (
            <div className="tab-content-panel">
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
                          minHeight: "380px",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          // Pass color parameters to static CSS variables for hover effects
                          ["--hover-color" as any]: data.colors.primary,
                          ["--hover-shadow" as any]: `${data.colors.primary}2A`, // with 16% opacity (Hex 2A)
                        }}
                        className="lp-category-card"
                      >
                        {/* Top Illustration Header */}
                        <div
                          style={{
                            height: "160px",
                            width: "100%",
                            background: "#F8FAFC", // soft light slate background for illustration
                            borderBottom: "1px solid #F1F5F9",
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden"
                          }}
                        >
                          <CategoryHeaderIllustration category={cat} />
                        </div>

                        {/* Card Content Section */}
                        <div style={{ padding: "24px", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div>
                            {/* Title and Pill Row */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "12px" }}>
                              <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#1F2937", margin: 0, letterSpacing: "-0.01em", lineHeight: "1.3" }}>
                                {cat}
                              </h3>
                            </div>

                            <p style={{ fontSize: "0.85rem", color: "#4B5563", lineHeight: "1.6", margin: "0 0 24px" }}>
                              {data.desc}
                            </p>
                          </div>

                          {/* Card Bottom Row with Explore text and simple arrow */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: data.colors.primary }}>
                              Explore Category
                            </span>
                            <svg
                              className="lp-category-card-arrow"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#9CA3AF"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{ transition: "all 0.3s ease" }}
                            >
                              <line x1="5" y1="12" x2="19" y2="12" />
                              <polyline points="12 5 19 12 12 19" />
                            </svg>
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
            <div className="tab-content-panel">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
                {categoriesList.flatMap(cat => {
                  const data = CATEGORY_DATA[cat];
                  return data.bootcamps.map(bootcamp => ({ ...bootcamp, cat, colors: data.colors }));
                })
                  .filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 6)
                  .map((b, i) => {
                    const cardColorPattern = [
                      { primary: "#8B5CF6", secondary: "rgba(139, 92, 246, 0.08)" }, // Purple (CS)
                      { primary: "#3B82F6", secondary: "rgba(59, 130, 246, 0.08)" },  // Blue (IT/Maths)
                      { primary: "#10B981", secondary: "rgba(16, 185, 129, 0.08)" },  // Green (Pers. Dev)
                      { primary: "#EC4899", secondary: "rgba(236, 72, 153, 0.08)" }, // Pink (AI)
                      { primary: "#F59E0B", secondary: "rgba(245, 158, 11, 0.08)" },  // Amber/Orange (Business)
                      { primary: "#14B8A6", secondary: "rgba(20, 184, 166, 0.08)" }   // Teal (Sciences)
                    ];
                    const cardColors = cardColorPattern[i % cardColorPattern.length];

                    const watermarkCat = [
                      "Computer Science",
                      "Information Technology",
                      "Basic Sciences",
                      "Artificial Intelligence",
                      "Business & Management",
                      "Personal Development"
                    ][i % 6];

                    return (
                      <div
                        key={i}
                        style={{
                          background: `linear-gradient(135deg, #FFFFFF 60%, ${cardColors.secondary} 100%)`,
                          border: "1px solid #E5E7EB",
                          borderLeft: `6px solid ${cardColors.primary}`,
                          borderRadius: "16px",
                          padding: "28px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          minHeight: "220px",
                          cursor: "default",
                          position: "relative",
                          overflow: "hidden"
                        }}
                      >
                        <CategoryWatermark category={watermarkCat} color={cardColors.primary} />
                        <div style={{ position: "relative", zIndex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "14px" }}>
                            <span style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: "600" }}>{b.duration}</span>
                          </div>
                          <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#000000", marginBottom: "8px" }}>
                            {b.title}
                          </h3>
                          <p style={{ fontSize: "0.85rem", color: "#4B5563", lineHeight: "1.5", margin: "0 0 16px" }}>
                            {b.desc}
                          </p>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", paddingTop: "14px", position: "relative", zIndex: 1 }}>
                          <Link
                            href="/login"
                            className="explore-register-btn"
                            style={{
                              "--btn-primary": cardColors.primary,
                              "--btn-secondary": cardColors.secondary
                            } as React.CSSProperties}
                          >
                            Register
                          </Link>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 3. WEBINARS TAB CONTENT */}
          {activeTab === "webinars" && (
            <div className="tab-content-panel">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
                {WEBINARS_DATA
                  .filter(w => w.title.toLowerCase().includes(searchQuery.toLowerCase()) || w.category.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((w, i) => {
                    const isLive = w.status === "Live Today";
                    const isUpcoming = w.status === "Upcoming";
                    const ctaBg = isLive ? "#EF4444" : (isUpcoming ? "#F59E0B" : "#0A1931");
                    const ctaColor = "#FFFFFF";
                    const ctaHoverBg = isLive ? "#DC2626" : (isUpcoming ? "#D97706" : "#15305B");
                    const ctaShadow = `0 4px 14px ${isLive ? "#EF4444" : (isUpcoming ? "#F59E0B" : "#0A1931")}30`;

                    const statusColor = isLive ? "#EF4444" : (isUpcoming ? "#D97706" : "#0A1931");
                    const statusBg = isLive ? "#FEE2E2" : (isUpcoming ? "#FEF3C7" : "#EFF4FC");
                    const statusText = isLive ? "LIVE TODAY" : (isUpcoming ? "UPCOMING" : "RECORDED");

                    const titleColor = isLive ? "#991B1B" : (isUpcoming ? "#92400E" : "#1E3E62");

                    return (
                      <div
                        key={i}
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #E5E7EB",
                          borderRadius: "20px",
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          overflow: "hidden",
                          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.05)"
                        }}
                        className="lp-webinar-card"
                      >
                        {/* Custom Topic Themed Header Graphic */}
                        <WebinarCardHeader title={w.title} status={w.status} duration={w.duration} category={w.category} />

                        {/* Card Content Body */}
                        <div style={{ padding: "20px", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div>
                            {/* Upper category and status row */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                              <span style={{ fontSize: "0.72rem", fontWeight: "800", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                {w.category} • {w.duration.toUpperCase()}
                              </span>
                            </div>

                            {/* Webinar Title */}
                            <h3
                              style={{
                                fontSize: "1.1rem",
                                fontWeight: "800",
                                color: titleColor,
                                marginBottom: "16px",
                                lineHeight: "1.4",
                                minHeight: "56px",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                letterSpacing: "-0.01em"
                              }}
                            >
                              {w.title}
                            </h3>

                            {/* Host Details */}
                            <div style={{ fontSize: "0.82rem", color: "#6B7280", display: "flex", alignItems: "center", marginBottom: "20px" }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                              <span>Hosted by <strong style={{ color: "#374151", fontWeight: "700" }}>{w.host}</strong></span>
                            </div>
                          </div>

                          {/* Calendar timeline and Button row */}
                          <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "16px", marginTop: "10px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", color: statusColor }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                  <line x1="16" y1="2" x2="16" y2="6" />
                                  <line x1="8" y1="2" x2="8" y2="6" />
                                  <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                <span style={{ fontSize: "0.8rem", fontWeight: "700" }}>
                                  {w.date}
                                </span>
                              </div>

                              <Link
                                href="/login"
                                className="lp-webinar-btn"
                                style={{
                                  "--cta-bg": ctaBg,
                                  "--cta-shadow": ctaShadow
                                } as React.CSSProperties}
                              >
                                {isLive ? "Join Broadcast" : (isUpcoming ? "Save Seat" : "Watch Video")}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>{/* end contentRef wrapper */}
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
