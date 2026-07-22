import { NextRequest, NextResponse } from "next/server";

const CATEGORY_DATA: Record<string, {
  desc: string; coursesCount: number; gradient: string;
  courses: Array<{ title: string; duration: string; level: string; desc: string }>;
  bootcamps: Array<{ title: string; duration: string; type: string; date: string; desc: string }>;
  resources: Array<{ title: string; type: string; readTime: string }>;
  colors: { primary: string; secondary: string };
}> = {
  "Computer Science": {
    coursesCount: 12, gradient: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
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
    coursesCount: 8, gradient: "linear-gradient(135deg, #EC4899 0%, #BE185D 100%)",
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
    coursesCount: 10, gradient: "linear-gradient(135deg, #4B6189 0%, #2E4A72 100%)",
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
    coursesCount: 6, gradient: "linear-gradient(135deg, #F59E0B 0%, #C2410C 100%)",
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
    coursesCount: 7, gradient: "linear-gradient(135deg, #10B981 0%, #047857 100%)",
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
    coursesCount: 5, gradient: "linear-gradient(135deg, #14B8A6 0%, #0F766E 100%)",
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
    coursesCount: 6, gradient: "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)",
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
    coursesCount: 5, gradient: "linear-gradient(135deg, #84CC16 0%, #4D7C0F 100%)",
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

function slugify(str: string): string {
  return str.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sepIdx = id.indexOf("--");
  if (sepIdx === -1) return NextResponse.json({ error: "Invalid slug" }, { status: 404 });
  const catSlug = id.slice(0, sepIdx);
  const courseSlug = id.slice(sepIdx + 2);
  for (const [category, data] of Object.entries(CATEGORY_DATA)) {
    if (slugify(category) !== catSlug) continue;
    const course = data.courses.find((c) => slugify(c.title) === courseSlug);
    if (course) {
      return NextResponse.json({
        category,
        courseData: course,
        categoryData: { desc: data.desc, colors: data.colors, gradient: data.gradient, coursesCount: data.coursesCount, bootcamps: data.bootcamps, resources: data.resources },
      });
    }
  }
  return NextResponse.json({ error: "Course not found" }, { status: 404 });
}