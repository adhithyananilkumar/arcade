"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CATEGORY_DATA, categoriesList, CategoryWatermark } from "@/app/(public)/explore/page";
import DotGrid from "@/apps/public/components/landing/DotGrid";

const CATEGORY_TOPICS: Record<string, string[]> = {
  "Computer Science": ["Programming Logic", "Algorithms", "Relational Databases", "Software Engineering"],
  "Artificial Intelligence": ["Machine Learning", "Neural Networks", "Deep Learning", "LLMs", "RAG Pipelines"],
  "Information Technology": ["IP Routing", "Cyber Security", "VPC Cloud", "Linux Bash", "DevOps CI/CD"],
  "Business & Management": ["Startup Valuation", "PPC SEO Marketing", "Corporate Accounting", "Product PRDs"],
  "Civil & Mechanical": ["CAD blueprints", "Fluid Dynamics", "Materials Stress", "Robotics Arms"],
  "Basic Sciences": ["Linear Algebra", "Vector Calculus", "Electromagnetism", "Chemical Dynamics"],
  "Humanities & Languages": ["Professional Writing", "Spoken English", "Public Speech", "Corporate Ethics"],
  "Personal Development": ["Time Management", "Financial IQ", "Personal Branding", "Public Speaking"]
};

const CATEGORY_HEADLINES: Record<string, { main: string; highlight: string }> = {
  "Computer Science": { main: "Build the Future of ", highlight: "Software" },
  "Artificial Intelligence": { main: "Harness the Power of ", highlight: "AI & ML" },
  "Information Technology": { main: "Secure & Scale Modern ", highlight: "Infrastructure" },
  "Business & Management": { main: "Lead Teams & Scale ", highlight: "Enterprises" },
  "Civil & Mechanical": { main: "Design & Engineer the ", highlight: "Physical World" },
  "Basic Sciences": { main: "Uncover the Laws of ", highlight: "Nature" },
  "Humanities & Languages": { main: "Express, Connect & ", highlight: "Communicate" },
  "Personal Development": { main: "Invest in Your Infinite ", highlight: "Potential" }
};

interface Token {
  text: string;
  type?: "kw" | "str" | "fn" | "com" | "var" | "num";
}

interface EditorLine {
  ln: number;
  tokens: Token[];
}

interface EditorContent {
  filename: string;
  language: string;
  matchedText: string;
  lines: EditorLine[];
}

const CATEGORY_EDITOR_TABS: Record<string, EditorContent[]> = {
  "Computer Science": [
    {
      filename: "query.sql",
      language: "sql",
      matchedText: "4 rows matched",
      lines: [
        { ln: 1, tokens: [{ text: "-- find the right course for you", type: "com" }] },
        { ln: 2, tokens: [{ text: "SELECT ", type: "kw" }, { text: "title, level, duration", type: "var" }] },
        { ln: 3, tokens: [{ text: "FROM ", type: "kw" }, { text: "courses", type: "fn" }] },
        { ln: 4, tokens: [{ text: "WHERE ", type: "kw" }, { text: "category = ", type: "var" }, { text: "'computer_science'", type: "str" }] },
        { ln: 5, tokens: [{ text: "AND ", type: "kw" }, { text: "rating >= ", type: "var" }, { text: "4.7", type: "num" }] },
        { ln: 6, tokens: [{ text: "ORDER BY ", type: "kw" }, { text: "rating ", type: "var" }, { text: "DESC", type: "kw" }, { text: ";" }] }
      ]
    },
    {
      filename: "schema.ts",
      language: "typescript",
      matchedText: "Compiled successfully",
      lines: [
        { ln: 1, tokens: [{ text: "// database table schema definitions", type: "com" }] },
        { ln: 2, tokens: [{ text: "export const ", type: "kw" }, { text: "courses = ", type: "var" }, { text: "pgTable", type: "fn" }, { text: "(", type: "var" }, { text: '"courses"', type: "str" }, { text: ", {" }] },
        { ln: 3, tokens: [{ text: "  id: ", type: "var" }, { text: "uuid", type: "fn" }, { text: "(", type: "var" }, { text: '"id"', type: "str" }, { text: ").", type: "var" }, { text: "defaultRandom", type: "fn" }, { text: "().", type: "var" }, { text: "primaryKey", type: "fn" }, { text: "()," }] },
        { ln: 4, tokens: [{ text: "  title: ", type: "var" }, { text: "text", type: "fn" }, { text: "(", type: "var" }, { text: '"title"', type: "str" }, { text: ").", type: "var" }, { text: "notNull", type: "fn" }, { text: "()," }] },
        { ln: 5, tokens: [{ text: "  level: ", type: "var" }, { text: "text", type: "fn" }, { text: "(", type: "var" }, { text: '"level"', type: "str" }, { text: ").", type: "var" }, { text: "notNull", type: "fn" }, { text: "()" }] },
        { ln: 6, tokens: [{ text: "});", type: "var" }] }
      ]
    }
  ],
  "Artificial Intelligence": [
    {
      filename: "train.py",
      language: "python",
      matchedText: "Epoch 10/10 complete",
      lines: [
        { ln: 1, tokens: [{ text: "# train model to recommend learning paths", type: "com" }] },
        { ln: 2, tokens: [{ text: "import ", type: "kw" }, { text: "torch", type: "var" }] },
        { ln: 3, tokens: [{ text: "model = ", type: "var" }, { text: "TransformerModel", type: "fn" }, { text: "(vocab_size=", type: "var" }, { text: "2048", type: "num" }, { text: ")" }] },
        { ln: 4, tokens: [{ text: "model.", type: "var" }, { text: "train", type: "fn" }, { text: "(epochs=", type: "var" }, { text: "10", type: "num" }, { text: ", lr=", type: "var" }, { text: "0.001", type: "num" }, { text: ")" }] },
        { ln: 5, tokens: [{ text: "print", type: "kw" }, { text: "(", type: "var" }, { text: '"Optimization completed"', type: "str" }, { text: ")" }] }
      ]
    },
    {
      filename: "model.py",
      language: "python",
      matchedText: "Model loaded",
      lines: [
        { ln: 1, tokens: [{ text: "# model definition class", type: "com" }] },
        { ln: 2, tokens: [{ text: "class ", type: "kw" }, { text: "TransformerModel", type: "fn" }, { text: "(nn.Module):", type: "var" }] },
        { ln: 3, tokens: [{ text: "    def ", type: "kw" }, { text: "__init__", type: "fn" }, { text: "(self, vocab_size):", type: "var" }] },
        { ln: 4, tokens: [{ text: "        super().", type: "var" }, { text: "__init__", type: "fn" }, { text: "()", type: "var" }] },
        { ln: 5, tokens: [{ text: "        self.embed = nn.", type: "var" }, { text: "Embedding", type: "fn" }, { text: "(vocab_size, ", type: "var" }, { text: "256", type: "num" }, { text: ")" }] }
      ]
    }
  ],
  "Information Technology": [
    {
      filename: "deploy.yml",
      language: "yaml",
      matchedText: "playbook: ok=3 failed=0",
      lines: [
        { ln: 1, tokens: [{ text: "# provision modern cloud infrastructure", type: "com" }] },
        { ln: 2, tokens: [{ text: "- hosts: ", type: "kw" }, { text: "webservers", type: "str" }] },
        { ln: 3, tokens: [{ text: "  tasks:", type: "kw" }] },
        { ln: 4, tokens: [{ text: "    - name: ", type: "kw" }, { text: "start application backend", type: "str" }] },
        { ln: 5, tokens: [{ text: "      service: ", type: "kw" }, { text: "name=arcade state=started", type: "var" }] },
        { ln: 6, tokens: [{ text: "    - name: ", type: "kw" }, { text: "verify secure ssl routing", type: "str" }] }
      ]
    },
    {
      filename: "nginx.conf",
      language: "nginx",
      matchedText: "Syntax check OK",
      lines: [
        { ln: 1, tokens: [{ text: "# configure reverse proxy load balancer", type: "com" }] },
        { ln: 2, tokens: [{ text: "server {", type: "var" }] },
        { ln: 3, tokens: [{ text: "    listen ", type: "kw" }, { text: "80", type: "num" }, { text: ";", type: "var" }] },
        { ln: 4, tokens: [{ text: "    server_name ", type: "kw" }, { text: "arcade.college.edu", type: "str" }, { text: ";", type: "var" }] },
        { ln: 5, tokens: [{ text: "    location /api/ {", type: "var" }] },
        { ln: 6, tokens: [{ text: "        proxy_pass ", type: "kw" }, { text: "http://backend_upstream", type: "str" }, { text: ";", type: "var" }] }
      ]
    }
  ],
  "Business & Management": [
    {
      filename: "dashboard.gs",
      language: "javascript",
      matchedText: "Execution finished",
      lines: [
        { ln: 1, tokens: [{ text: "// calculate student cohort conversion", type: "com" }] },
        { ln: 2, tokens: [{ text: "function ", type: "kw" }, { text: "getConversionRate", type: "fn" }, { text: "(users, cohort) {", type: "var" }] },
        { ln: 3, tokens: [{ text: "  const active = users.", type: "var" }, { text: "filter", type: "fn" }, { text: "(u => u.isAcquired);", type: "var" }] },
        { ln: 4, tokens: [{ text: "  return ", type: "kw" }, { text: "(active.length / users.length) * ", type: "var" }, { text: "100", type: "num" }, { text: ";", type: "var" }] },
        { ln: 5, tokens: [{ text: "}", type: "var" }] }
      ]
    },
    {
      filename: "report.csv",
      language: "csv",
      matchedText: "3 cohorts parsed",
      lines: [
        { ln: 1, tokens: [{ text: "# marketing conversions report Q3", type: "com" }] },
        { ln: 2, tokens: [{ text: "Cohort,Impressions,AcquisitionRate", type: "var" }] },
        { ln: 3, tokens: [{ text: "AdWords_CS,", type: "var" }, { text: "14200", type: "num" }, { text: ",", type: "var" }, { text: "0.038", type: "num" }] },
        { ln: 4, tokens: [{ text: "LinkedIn_AI,", type: "var" }, { text: "8400", type: "num" }, { text: ",", type: "var" }, { text: "0.052", type: "num" }] },
        { ln: 5, tokens: [{ text: "Organic_Direct,", type: "var" }, { text: "45000", type: "num" }, { text: ",", type: "var" }, { text: "0.095", type: "num" }] }
      ]
    }
  ],
  "Civil & Mechanical": [
    {
      filename: "cad.gcode",
      language: "gcode",
      matchedText: "G-Code syntax OK",
      lines: [
        { ln: 1, tokens: [{ text: "; compute mechanical stress coordinates", type: "com" }] },
        { ln: 2, tokens: [{ text: "G21 ", type: "kw" }, { text: "; set units to millimeters", type: "com" }] },
        { ln: 3, tokens: [{ text: "G90 ", type: "kw" }, { text: "; absolute positioning", type: "com" }] },
        { ln: 4, tokens: [{ text: "G0 ", type: "kw" }, { text: "X0 Y0 Z10 ", type: "var" }, { text: "; lift nozzle", type: "com" }] },
        { ln: 5, tokens: [{ text: "G1 ", type: "kw" }, { text: "Z0.2 F3000 ", type: "var" }, { text: "; begin print layer", type: "com" }] }
      ]
    },
    {
      filename: "bridge.stl",
      language: "stl",
      matchedText: "Mesh verified",
      lines: [
        { ln: 1, tokens: [{ text: "# stl triangular mesh representation", type: "com" }] },
        { ln: 2, tokens: [{ text: "solid ", type: "kw" }, { text: "BridgeBearing", type: "fn" }] },
        { ln: 3, tokens: [{ text: "  facet normal ", type: "var" }, { text: "0 0 1", type: "num" }] },
        { ln: 4, tokens: [{ text: "    outer loop", type: "var" }] },
        { ln: 5, tokens: [{ text: "      vertex ", type: "var" }, { text: "0.0 0.0 0.0", type: "num" }] },
        { ln: 6, tokens: [{ text: "      vertex ", type: "var" }, { text: "10.0 0.0 0.0", type: "num" }] }
      ]
    }
  ],
  "Basic Sciences": [
    {
      filename: "math.py",
      language: "python",
      matchedText: "Determinant: -2.00",
      lines: [
        { ln: 1, tokens: [{ text: "# compute matrix transformation", type: "com" }] },
        { ln: 2, tokens: [{ text: "import ", type: "kw" }, { text: "numpy ", type: "var" }, { text: "as ", type: "kw" }, { text: "np", type: "var" }] },
        { ln: 3, tokens: [{ text: "A = np.", type: "var" }, { text: "array", type: "fn" }, { text: "([[", type: "var" }, { text: "1", type: "num" }, { text: ", ", type: "var" }, { text: "2", type: "num" }, { text: "], [", type: "var" }, { text: "3", type: "num" }, { text: ", ", type: "var" }, { text: "4", type: "num" }, { text: "]])", type: "var" }] },
        { ln: 4, tokens: [{ text: "vals, vecs = np.linalg.", type: "var" }, { text: "eig", type: "fn" }, { text: "(A)", type: "var" }] },
        { ln: 5, tokens: [{ text: "print", type: "kw" }, { text: "(", type: "var" }, { text: '"Eigenvalues:", vals', type: "str" }, { text: ")" }] }
      ]
    },
    {
      filename: "plot.m",
      language: "matlab",
      matchedText: "Render complete",
      lines: [
        { ln: 1, tokens: [{ text: "% plot differential equation field", type: "com" }] },
        { ln: 2, tokens: [{ text: "[X, Y] = ", type: "var" }, { text: "meshgrid", type: "fn" }, { text: "(", type: "var" }, { text: "-2:.2:2", type: "num" }, { text: ", ", type: "var" }, { text: "-2:.2:2", type: "num" }, { text: ");", type: "var" }] },
        { ln: 3, tokens: [{ text: "DY = X - Y.^", type: "var" }, { text: "2", type: "num" }, { text: ";", type: "var" }] },
        { ln: 4, tokens: [{ text: "DX = ", type: "var" }, { text: "ones", type: "fn" }, { text: "(", type: "var" }, { text: "size", type: "fn" }, { text: "(DY));", type: "var" }] },
        { ln: 5, tokens: [{ text: "quiver", type: "fn" }, { text: "(X, Y, DX, DY);", type: "var" }] }
      ]
    }
  ],
  "Humanities & Languages": [
    {
      filename: "essay.md",
      language: "markdown",
      matchedText: "Word count: 350",
      lines: [
        { ln: 1, tokens: [{ text: "# The Power of Rhetoric and Writing", type: "com" }] },
        { ln: 2, tokens: [{ text: "Professional communication bridges technical silos.", type: "var" }] },
        { ln: 3, tokens: [{ text: "* Active voice", type: "str" }] },
        { ln: 4, tokens: [{ text: "* Clear organization", type: "str" }] },
        { ln: 5, tokens: [{ text: "* Contextual vocabulary", type: "str" }] }
      ]
    },
    {
      filename: "dict.json",
      language: "json",
      matchedText: "3 terms loaded",
      lines: [
        { ln: 1, tokens: [{ text: "{", type: "var" }] },
        { ln: 2, tokens: [{ text: '  "vocab": ', type: "kw" }, { text: "{", type: "var" }] },
        { ln: 3, tokens: [{ text: '    "rhetoric": ', type: "kw" }, { text: '"persuasive speaking"', type: "str" }, { text: ",", type: "var" }] },
        { ln: 4, tokens: [{ text: '    "syntax": ', type: "kw" }, { text: '"word arrangement"', type: "str" }] },
        { ln: 5, tokens: [{ text: "  }", type: "var" }] },
        { ln: 6, tokens: [{ text: "}", type: "var" }] }
      ]
    }
  ],
  "Personal Development": [
    {
      filename: "goals.json",
      language: "json",
      matchedText: "Validated JSON",
      lines: [
        { ln: 1, tokens: [{ text: "{", type: "var" }] },
        { ln: 2, tokens: [{ text: '  "objective": ', type: "kw" }, { text: '"continuous_growth"', type: "str" }, { text: "," }] },
        { ln: 3, tokens: [{ text: '  "habits": ', type: "kw" }, { text: "[", type: "var" }] },
        { ln: 4, tokens: [{ text: '    "read_20_mins_daily"', type: "str" }, { text: ",", type: "var" }] },
        { ln: 5, tokens: [{ text: '    "code_practice"', type: "str" }] },
        { ln: 6, tokens: [{ text: '  ]', type: "var" }, { text: ",", type: "var" }] },
        { ln: 7, tokens: [{ text: '  "status": ', type: "kw" }, { text: '"in_progress"', type: "str" }] },
        { ln: 8, tokens: [{ text: "}", type: "var" }] }
      ]
    },
    {
      filename: "journal.txt",
      language: "text",
      matchedText: "Reflection logged",
      lines: [
        { ln: 1, tokens: [{ text: "-- weekly reflection & habit tracker", type: "com" }] },
        { ln: 2, tokens: [{ text: "1. Read 20 mins every morning [OK]", type: "var" }] },
        { ln: 3, tokens: [{ text: "2. Exercise 3 times a week [OK]", type: "var" }] },
        { ln: 4, tokens: [{ text: "3. Learn new coding skills daily [OK]", type: "var" }] }
      ]
    }
  ]
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Computer Science": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  "Artificial Intelligence": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="M12 6v12M6 12h12" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  "Information Technology": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  ),
  "Business & Management": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  "Civil & Mechanical": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  "Basic Sciences": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  "Humanities & Languages": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5v-15z" />
    </svg>
  ),
  "Personal Development": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  )
};

// Color presets for custom graphic header meshes
const HEADER_COLOR_MESHES: Record<string, string> = {
  "Computer Science": "radial-gradient(at 10% 20%, rgba(139, 92, 246, 0.15) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(59, 130, 246, 0.1) 0px, transparent 50%)",
  "Artificial Intelligence": "radial-gradient(at 10% 20%, rgba(236, 72, 153, 0.15) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(244, 63, 94, 0.1) 0px, transparent 50%)",
  "Information Technology": "radial-gradient(at 10% 20%, rgba(59, 130, 246, 0.15) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(6, 182, 212, 0.1) 0px, transparent 50%)",
  "Business & Management": "radial-gradient(at 10% 20%, rgba(245, 158, 11, 0.15) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(239, 68, 68, 0.1) 0px, transparent 50%)",
  "Civil & Mechanical": "radial-gradient(at 10% 20%, rgba(16, 185, 129, 0.15) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(14, 165, 233, 0.1) 0px, transparent 50%)",
  "Basic Sciences": "radial-gradient(at 10% 20%, rgba(20, 184, 166, 0.15) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(99, 102, 241, 0.1) 0px, transparent 50%)",
  "Humanities & Languages": "radial-gradient(at 10% 20%, rgba(79, 70, 229, 0.15) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(219, 39, 119, 0.1) 0px, transparent 50%)",
  "Personal Development": "radial-gradient(at 10% 20%, rgba(101, 163, 13, 0.15) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(234, 179, 8, 0.1) 0px, transparent 50%)"
};

function getCourseGlyph(title: string, index: number, color: string): React.ReactNode {
  const norm = title.toLowerCase();
  
  if (norm.includes("database") || norm.includes("sql") || norm.includes("query")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <rect x="4" y="3" width="16" height="12" rx="1.5"/>
        <line x1="9" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="15" x2="12" y2="21"/>
      </svg>
    );
  }
  if (norm.includes("structure") || norm.includes("algorithm")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <path d="M4 6h16M4 12h10M4 18h13"/>
        <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/>
      </svg>
    );
  }
  if (norm.includes("principle") || norm.includes("architecture") || norm.includes("design") || norm.includes("software")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/>
        <path d="M12 12v9M4 7.5l8 4.5 8-4.5"/>
      </svg>
    );
  }
  if (norm.includes("operating") || norm.includes("system") || norm.includes("concurrency") || norm.includes("network")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <rect x="4" y="4" width="16" height="7" rx="1.5"/>
        <rect x="4" y="13" width="16" height="7" rx="1.5"/>
        <circle cx="7.5" cy="7.5" r="0.9" fill="currentColor" stroke="none"/>
        <circle cx="7.5" cy="16.5" r="0.9" fill="currentColor" stroke="none"/>
      </svg>
    );
  }

  // Fallbacks by index
  const m = index % 4;
  if (m === 0) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <rect x="4" y="3" width="16" height="12" rx="1.5"/>
        <line x1="9" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="15" x2="12" y2="21"/>
      </svg>
    );
  }
  if (m === 1) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <path d="M4 6h16M4 12h10M4 18h13"/>
        <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/>
      </svg>
    );
  }
  if (m === 2) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/>
        <path d="M12 12v9M4 7.5l8 4.5 8-4.5"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
      <rect x="4" y="4" width="16" height="7" rx="1.5"/>
      <rect x="4" y="13" width="16" height="7" rx="1.5"/>
      <circle cx="7.5" cy="7.5" r="0.9" fill="currentColor" stroke="none"/>
      <circle cx="7.5" cy="16.5" r="0.9" fill="currentColor" stroke="none"/>
    </svg>
  );
}

export default function CategoryDetailedView() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Route selector
  const initialCategory = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [wishlistedCourses, setWishlistedCourses] = useState<Record<string, boolean>>({});
  const [activeEditorTab, setActiveEditorTab] = useState<number>(0);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  useEffect(() => {
    if (initialCategory && categoriesList.includes(initialCategory)) {
      setActiveCategory(initialCategory);
    } else {
      setActiveCategory("Computer Science"); // Fallback default
    }
    setActiveEditorTab(0);
  }, [initialCategory]);

  const handleCategorySwitch = (category: string) => {
    setActiveCategory(category);
    setCourseSearchQuery("");
    setActiveEditorTab(0);
    router.push(`/explore?category=${encodeURIComponent(category)}`);
  };

  const toggleWishlist = (courseTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlistedCourses(prev => ({
      ...prev,
      [courseTitle]: !prev[courseTitle]
    }));
  };

  const activeCategoryName = activeCategory || "Computer Science";
  const activeData = CATEGORY_DATA[activeCategoryName];
  const topics = CATEGORY_TOPICS[activeCategoryName] || [];

  const filteredCourses = activeData.courses.filter(course =>
    course.title.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
    course.desc.toLowerCase().includes(courseSearchQuery.toLowerCase())
  );

  return (
    <div className="landing-root" style={{ minHeight: "100vh", paddingBottom: "100px" }}>
      <style>{`
        .course-card-premium {
          transition: all 0.18s ease !important;
        }
        .course-card-premium:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 14px 30px -18px rgba(20, 19, 30, 0.35) !important;
          border-color: var(--hover-color) !important;
        }
        .hover-card-y {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .hover-card-y:hover {
          transform: translateY(-4px) !important;
          background: rgba(255, 255, 255, 0.85) !important;
          box-shadow: 0 12px 30px -8px rgba(20, 23, 31, 0.06) !important;
          border-color: rgba(20, 23, 31, 0.12) !important;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hero-visual {
          background: #1b192a !important;
          display: flex;
          flex-direction: column;
          position: relative;
          min-height: 100%;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
          width: 100%;
        }
        .editor-topbar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          border-bottom: 1px solid #2c2a42;
        }
        .editor-dots {
          display: flex;
          gap: 6px;
        }
        .editor-dots span {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #3a3856;
        }
        .editor-tabs {
          display: flex;
          gap: 2px;
          margin-left: 14px;
        }
        .editor-tab {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.75rem;
          color: #8b88a8;
          padding: 6px 12px;
          border-radius: 7px 7px 0 0;
        }
        .editor-tab.active {
          background: #252340;
          color: #e3e1f5;
        }
        .editor-body {
          padding: 24px 24px 28px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.86rem;
          line-height: 1.9;
          flex: 1;
          overflow: hidden;
          color: #e3e1f5;
          text-align: left;
        }
        .editor-body .ln {
          color: #4c4a6b;
          display: inline-block;
          width: 22px;
          user-select: none;
        }
        .tok-kw { color: #c792ea; }
        .tok-str { color: #9ad189; }
        .tok-fn { color: #82aaff; }
        .tok-com { color: #5c5a7c; font-style: italic; }
        .tok-var { color: #e3e1f5; }
        .tok-num { color: #f2a65a; }
        .caret {
          display: inline-block;
          width: 7px;
          height: 16px;
          background: #e8a23a;
          vertical-align: middle;
          margin-left: 2px;
          animation: blink 1.1s steps(1) infinite;
        }
        @keyframes blink { 50% { opacity: 0; } }
        .editor-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
          border-top: 1px solid #2c2a42;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.72rem;
          color: #736f97;
        }
        .editor-status .ok { color: #9ad189; }
        .course-card-premium:hover .view-arrow {
          transform: translateX(3px) !important;
        }
      `}</style>

      {/* Main Container */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 24px 0", position: "relative", zIndex: 1 }}>
        
        {/* Sleek Top Breadcrumb Bar */}
        <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", marginBottom: "28px" }}>
          <div 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              fontSize: "0.85rem", 
              fontWeight: "600", 
              color: "rgba(20, 20, 43, 0.55)",
              background: "rgba(255, 255, 255, 0.65)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(20, 23, 31, 0.06)",
              padding: "10px 18px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.02)"
            }}
          >
            <span 
              onClick={() => {
                setActiveCategory(null);
                router.push("/explore");
              }}
              style={{ cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = activeData.colors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = "inherit"}
            >
              Explore
            </span>
            <span>/</span>
            <span 
              onClick={() => {
                setActiveCategory(null);
                router.push("/explore");
              }}
              style={{ cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = activeData.colors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = "inherit"}
            >
              Departments
            </span>
            <span>/</span>
            <span style={{ color: activeData.colors.primary, fontWeight: "700" }}>{activeCategoryName}</span>
          </div>
        </div>

        {/* Unique Mesh Category Selector - Sticky-friendly Horizontal Pill Navigation */}
        <div 
          style={{ 
            display: "flex", 
            gap: "10px", 
            overflowX: "auto", 
            paddingBottom: "16px",
            marginBottom: "32px"
          }}
          className="hide-scrollbar"
        >
          {categoriesList.map((item) => {
            const isActive = activeCategoryName === item;
            const itemData = CATEGORY_DATA[item];
            return (
              <button
                key={item}
                onClick={() => handleCategorySwitch(item)}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 20px",
                  borderRadius: "14px",
                  border: isActive ? `1.5px solid ${itemData.colors.primary}` : "1.5px solid rgba(20, 23, 31, 0.06)",
                  background: isActive ? itemData.colors.secondary : "rgba(255, 255, 255, 0.65)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  color: isActive ? itemData.colors.primary : "#5E606A",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: isActive 
                    ? `0 10px 20px -8px ${itemData.colors.primary}33` 
                    : "0 4px 10px -2px rgba(0,0,0,0.02)",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.85)";
                    e.currentTarget.style.borderColor = itemData.colors.primary;
                    e.currentTarget.style.color = "var(--l-ink)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.65)";
                    e.currentTarget.style.borderColor = "rgba(20, 23, 31, 0.06)";
                    e.currentTarget.style.color = "#5E606A";
                  }
                }}
              >
                <span style={{ opacity: isActive ? 1 : 0.6 }}>{CATEGORY_ICONS[item]}</span>
                {item}
              </button>
            );
          })}
        </div>

        {/* Premium Minimal Interactive Banner with Cursor Spotlight effect */}
        <div
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            position: "relative",
            background: "rgba(255, 255, 255, 0.65)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(20, 23, 31, 0.06)",
            borderRadius: "24px",
            padding: "48px 48px",
            color: "var(--l-ink)",
            overflow: "hidden",
            boxShadow: isHovered 
              ? `0 20px 45px -15px ${activeData.colors.primary}20, 0 8px 20px -8px rgba(20, 23, 31, 0.04)`
              : "0 12px 30px -10px rgba(20, 23, 31, 0.04), 0 4px 10px -4px rgba(20, 23, 31, 0.02)",
            marginBottom: "56px",
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            alignItems: "center",
            gap: "40px",
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          {/* Spotlight overlay effect following the cursor */}
          {isHovered && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${activeData.colors.primary}0D, transparent 70%)`,
                pointerEvents: "none",
                zIndex: 1,
                transition: "opacity 0.2s ease"
              }}
            />
          )}

          {/* Subtle dynamic grid and mesh details inside banner */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.8, pointerEvents: "none", zIndex: 0 }}>
            <DotGrid
              dotSize={6}
              gap={20}
              baseColor="#E2E8F0"
              activeColor={activeData.colors.primary}
              proximity={120}
              shockRadius={200}
              shockStrength={4}
              resistance={750}
              returnDuration={1.5}
            />
          </div>
          <div style={{ position: "absolute", top: "-20%", right: "-20%", width: "400px", height: "400px", borderRadius: "50%", background: `radial-gradient(circle, ${activeData.colors.primary}1A 0%, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none" }} />

          {/* Banner Left Info */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <h1
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3rem)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: "1.15",
                marginBottom: "16px",
                color: "var(--l-ink)",
                fontFamily: "'Space Grotesk', sans-serif"
              }}
            >
              {CATEGORY_HEADLINES[activeCategoryName]?.main || "Discover. Learn. "}<span style={{ color: activeData.colors.primary }}>{CATEGORY_HEADLINES[activeCategoryName]?.highlight || "Grow."}</span>
            </h1>
            <p
              style={{
                fontSize: "0.95rem",
                color: "rgba(20, 20, 43, 0.6)",
                lineHeight: "1.6",
                maxWidth: "600px",
                marginBottom: "28px",
                fontWeight: 500
              }}
            >
              {activeData.desc} Browse the courses, practical bootcamps, and resources curated to level up your career.
            </p>

            {/* Banner Inner Search */}
            <div style={{ position: "relative", maxWidth: "480px", marginBottom: "20px" }}>
              <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search courses under this category..."
                value={courseSearchQuery}
                onChange={(e) => setCourseSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 20px 14px 48px",
                  borderRadius: "14px",
                  border: "1px solid rgba(20, 23, 31, 0.06)",
                  background: "rgba(255, 255, 255, 0.8)",
                  color: "var(--l-ink)",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  outline: "none",
                  boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.02)",
                  transition: "all 0.3s ease"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = activeData.colors.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 4px ${activeData.colors.primary}1A`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(20, 23, 31, 0.06)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Popular Topics List */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "0.8rem", color: "rgba(20, 20, 43, 0.4)", fontWeight: "700" }}>Popular searches:</span>
              {topics.map(topic => (
                <button
                  key={topic}
                  onClick={() => setCourseSearchQuery(topic)}
                  style={{
                    background: "rgba(20, 23, 31, 0.03)",
                    border: "1px solid rgba(20, 23, 31, 0.05)",
                    color: "#4B5563",
                    padding: "4px 12px",
                    borderRadius: "10px",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = activeData.colors.secondary;
                    e.currentTarget.style.color = activeData.colors.primary;
                    e.currentTarget.style.borderColor = `${activeData.colors.primary}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(20, 23, 31, 0.03)";
                    e.currentTarget.style.color = "#4B5563";
                    e.currentTarget.style.borderColor = "rgba(20, 23, 31, 0.05)";
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Banner Right Panel: Dynamic Visual Code Editor mockup */}
          {(() => {
            const tabs = CATEGORY_EDITOR_TABS[activeCategoryName] || CATEGORY_EDITOR_TABS["Computer Science"];
            const editorMock = tabs[activeEditorTab] || tabs[0];
            return (
              <div className="hero-visual" style={{ zIndex: 2 }}>
                <div className="editor-topbar">
                  <div className="editor-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="editor-tabs">
                    {tabs.map((tab, idx) => (
                      <div
                        key={tab.filename}
                        className={`editor-tab ${activeEditorTab === idx ? "active" : ""}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setActiveEditorTab(idx)}
                      >
                        {tab.filename}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="editor-body">
                  {editorMock.lines.map((line) => (
                    <div key={line.ln}>
                      <span className="ln">{line.ln}</span>
                      {line.tokens.map((token, tokIdx) => (
                        <span
                          key={tokIdx}
                          className={token.type ? `tok-${token.type}` : undefined}
                        >
                          {token.text}
                        </span>
                      ))}
                      {line.ln === editorMock.lines.length && <span className="caret"></span>}
                    </div>
                  ))}
                </div>
                <div className="editor-status">
                  <span>{editorMock.matchedText}</span>
                  <span className="ok">● ready</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Section A: Popular / Available Courses */}
        <section style={{ marginBottom: "56px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "4px", height: "24px", borderRadius: "2px", background: activeData.colors.primary }} />
              <h2 style={{ fontSize: "1.5rem", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--l-ink)", fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>
                Popular Courses
              </h2>
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: activeData.colors.primary }}>
              Showing {filteredCourses.length} of {activeData.courses.length} courses
            </span>
          </div>

          {filteredCourses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", background: "rgba(255,255,255,0.65)", backdropFilter: "blur(12px)", borderRadius: "20px", border: "1px solid rgba(20, 23, 31, 0.06)" }}>
              <p style={{ color: "rgba(20, 20, 43, 0.5)", fontSize: "0.95rem" }}>No courses matching your search query were found.</p>
              <button 
                onClick={() => setCourseSearchQuery("")}
                style={{ marginTop: "12px", background: activeData.colors.primary, color: "#FFFFFF", border: "none", padding: "8px 16px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}
              >
                Reset search
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "30px" }}>
              {filteredCourses.map((course, index) => {
                const isWishlisted = !!wishlistedCourses[course.title];
                
                return (
                  <motion.div
                    key={course.title}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E6E3F1",
                      borderRadius: "14px",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      position: "relative",
                      ["--hover-color" as any]: activeData.colors.primary
                    }}
                    className="course-card-premium"
                  >
                    {/* Card Graphic Header - Matching clean flat design */}
                    <div
                      style={{
                        height: "120px",
                        position: "relative",
                        overflow: "hidden",
                        background: `
                          radial-gradient(circle at 25% 25%, ${activeData.colors.primary}29, transparent 55%),
                          repeating-linear-gradient(135deg, ${activeData.colors.primary}10 0 2px, transparent 2px 14px),
                          ${activeData.colors.secondary}
                        `,
                        borderBottom: "1px solid #E6E3F1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {/* Floating status badge */}
                      {index === 0 && (
                        <span
                          style={{
                            position: "absolute",
                            left: "12px",
                            top: "12px",
                            background: "#14131E",
                            color: "#FFFFFF",
                            padding: "5px 10px",
                            borderRadius: "999px",
                            fontSize: "0.68rem",
                            fontWeight: "700",
                            letterSpacing: "0.04em",
                            fontFamily: "'IBM Plex Mono', monospace"
                          }}
                        >
                          BEST SELLER
                        </span>
                      )}

                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => toggleWishlist(course.title, e)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "12px",
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          background: "#FFFFFF",
                          border: "1px solid #E6E3F1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
                          color: isWishlisted ? "#EF4444" : "#8886A0",
                          transition: "all 0.2s"
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>

                      {/* Accent outline category visual watermark */}
                      <div style={{ color: activeData.colors.primary, opacity: 0.85 }}>
                        {getCourseGlyph(course.title, index, activeData.colors.primary)}
                      </div>
                    </div>

                    {/* Card Body - Matching explore details layout */}
                    <div style={{ padding: "18px 18px 16px", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "8px" }}>
                      <div>
                        {/* Title and Badge Row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "4px" }}>
                          <h3
                            style={{
                              fontSize: "1rem",
                              fontWeight: "700",
                              color: "var(--l-ink)",
                              margin: 0,
                              lineHeight: "1.3",
                              fontFamily: "'Inter', sans-serif"
                            }}
                          >
                            {course.title}
                          </h3>
                          <span
                            style={{
                              background: activeData.colors.secondary,
                              color: activeData.colors.primary,
                              padding: "4px 9px",
                              borderRadius: "999px",
                              fontSize: "0.68rem",
                              fontWeight: "700",
                              fontFamily: "'IBM Plex Mono', monospace",
                              whiteSpace: "nowrap"
                            }}
                          >
                            {course.level}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: "0.86rem",
                            color: "#5A5870",
                            lineHeight: "1.5",
                            margin: 0
                          }}
                        >
                          {course.desc}
                        </p>
                      </div>

                      {/* Action & Stats Row - Explore theme style link */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E6E3F1", paddingTop: "12px", marginTop: "10px" }}>
                        <span
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: "700",
                            color: activeData.colors.primary,
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            cursor: "pointer"
                          }}
                        >
                          View Course
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="view-arrow" style={{ transition: "transform .15s" }}>
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </span>
                        
                        <span style={{ fontSize: "0.84rem", color: "#8886A0", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 2" />
                          </svg>
                          {course.duration}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Section B: Bootcamps ("Trending Now" Layout) */}
        <section style={{ marginBottom: "56px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "4px", height: "24px", borderRadius: "2px", background: activeData.colors.primary }} />
              <h2 style={{ fontSize: "1.5rem", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--l-ink)", fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>
                Practical Bootcamps
              </h2>
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: activeData.colors.primary, cursor: "pointer" }}>
              View all
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {activeData.bootcamps.map((bootcamp) => (
              <div
                key={bootcamp.title}
                style={{
                  background: "rgba(255, 255, 255, 0.65)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(20, 23, 31, 0.06)",
                  borderRadius: "16px",
                  padding: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  boxShadow: "0 4px 12px rgba(20, 23, 31, 0.02)",
                  position: "relative",
                  overflow: "hidden"
                }}
                className="hover-card-y"
              >
                {/* Accent Watermark */}
                <div style={{ position: "absolute", right: "-10px", bottom: "-10px", opacity: 0.05, transform: "scale(1.5)", color: activeData.colors.primary }}>
                  {CATEGORY_ICONS[activeCategoryName]}
                </div>

                {/* Left Mini Icon Graphic */}
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: `linear-gradient(135deg, ${activeData.colors.primary} 0%, #FFFFFF 200%)`,
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  {CATEGORY_ICONS[activeCategoryName]}
                </div>

                {/* Right Details */}
                <div style={{ flexGrow: 1, position: "relative", zIndex: 1 }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--l-ink)", margin: "0 0 4px", lineHeight: "1.3", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {bootcamp.title}
                  </h4>
                  <div style={{ fontSize: "0.75rem", color: "rgba(20, 20, 43, 0.5)", fontWeight: "600" }}>
                    {bootcamp.type} • {bootcamp.duration}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", fontWeight: "700", color: activeData.colors.primary, marginTop: "6px" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color: "#F59E0B" }}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    4.8 <span style={{ color: "rgba(20, 20, 43, 0.4)", fontWeight: "500" }}>(3.2k)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section C: Resources */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "4px", height: "24px", borderRadius: "2px", background: activeData.colors.primary }} />
              <h2 style={{ fontSize: "1.5rem", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--l-ink)", fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>
                Resource Libraries
              </h2>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {activeData.resources.map((doc) => (
              <div
                key={doc.title}
                style={{
                  background: "rgba(255, 255, 255, 0.65)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(20, 23, 31, 0.06)",
                  borderRadius: "16px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "140px",
                  boxShadow: "0 4px 12px rgba(20, 23, 31, 0.02)"
                }}
                className="hover-card-y"
              >
                <div>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: "800",
                      color: activeData.colors.primary,
                      background: activeData.colors.secondary,
                      padding: "3px 8px",
                      borderRadius: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      display: "inline-block",
                      marginBottom: "12px"
                    }}
                  >
                    {doc.type}
                  </span>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--l-ink)", margin: "0 0 8px", lineHeight: "1.4", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {doc.title}
                  </h3>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(20, 23, 31, 0.06)", paddingTop: "12px" }}>
                  <span style={{ fontSize: "0.75rem", color: "rgba(20, 20, 43, 0.45)", fontWeight: "600" }}>{doc.readTime}</span>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: "800",
                      color: activeData.colors.primary,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    Read Guide
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}


