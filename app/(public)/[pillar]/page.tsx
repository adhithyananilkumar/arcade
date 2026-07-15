"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  Users,
  BarChart3,
  Trophy,
  Rocket,
  Sprout,
  Pencil,
  Mic,
  Layers,
  Share2,
  Grid,
  RotateCw,
  LineChart,
  Calendar,
  Clock,
  Compass,
  UserPlus,
  Shield,
  Calculator,
  Award,
  Briefcase,
  Lightbulb,
  FileText,
  TrendingUp,
  Share,
  Video,
  UserCheck,
  Map,
  Target,
  ChevronRight,
  Star,
  Play,
  VolumeX,
  Settings
} from "lucide-react";
import "./pillar.css";
import HeroNav from "@/components/landing/HeroNav";
import "@/styles/landing.css";

// ----------------------------------------------------
// Data Structure for the Six Pillars
// ----------------------------------------------------

interface ToolStep {
  title: string;
  sub: string;
  icon: any; // Lucide icon
}

interface ToolCard {
  badgeIcon: any;
  name: string;
  category: string; // Used for tab filtering
  skills: string;
  rating: number;
  reviews: number;
  ctaText: string;
  ctaHref: string;
  steps: ToolStep[];
}

interface QuickAction {
  label: string;
  icon: any;
  class: string;
  href: string;
}

interface Resource {
  title: string;
  description: string;
  category: string; // Used for tab filtering
  date: string;
}

interface SuccessStory {
  initials: string;
  name: string;
  role: string;
  quote: string;
}

interface PillarContent {
  slug: string;
  indexTag: string;
  title: string;
  subtitle: string;
  description: string;
  statBold: string;
  statLabel: string;
  statBold2: string;
  statLabel2: string;
  skillsLine: string;
  heroSvg: React.ReactNode;
  toolsTabs: string[];
  tools: ToolCard[];
  quickActionsTitle: string;
  quickActions: QuickAction[];
  resourceTabs: string[];
  resources: Resource[];
  successStories: SuccessStory[];
}

const PILLARS_DATA: Record<string, PillarContent> = {
  study: {
    slug: "study",
    indexTag: "Pillar 1 of 6",
    title: "Study",
    subtitle: "If you like keeping notes organised, prepping for exams ahead of time, and never losing track of a deadline, this pillar is for you.",
    description: "Study brings your notes, flashcards, timetables, and past papers into one shelf. It syncs across every device you own, so revision picks up exactly where you left it.",
    statBold: "42",
    statLabel: "tools used weekly",
    statBold2: "1,200+",
    statLabel2: "AJCE students",
    skillsLine: "Notes, Flashcards, Timetable, Past papers, Study groups, Focus timer",
    heroSvg: (
      <svg viewBox="0 0 100 100" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-32 h-32">
        <path d="M15 25 L15 80 Q15 85 25 85 L50 85 L50 30 Q50 25 45 25 Z" />
        <path d="M85 25 L85 80 Q85 85 75 85 L50 85 L50 30 Q50 25 55 25 Z" />
        <line x1="50" y1="30" x2="50" y2="85" />
      </svg>
    ),
    toolsTabs: ["All tools", "Notes & planning", "Exam prep", "Collaboration"],
    tools: [
      {
        badgeIcon: FileText,
        name: "Smart Notes",
        category: "Notes & planning",
        skills: "Rich text, voice-to-note, tagging by subject, cross-device sync",
        rating: 4.8,
        reviews: 2140,
        ctaText: "Open Smart Notes",
        ctaHref: "/dashboard",
        steps: [
          { title: "Write & tag", sub: "Step 1", icon: Pencil },
          { title: "Voice capture", sub: "Step 2", icon: Mic },
          { title: "Turn into flashcards", sub: "Step 3", icon: Layers },
          { title: "Share with group", sub: "Step 4", icon: Share2 }
        ]
      },
      {
        badgeIcon: Layers,
        name: "Flashcard Decks",
        category: "Exam prep",
        skills: "Spaced repetition, shared decks, progress tracking",
        rating: 4.7,
        reviews: 1860,
        ctaText: "Open Flashcards",
        ctaHref: "/dashboard",
        steps: [
          { title: "Build a deck", sub: "Step 1", icon: Grid },
          { title: "Spaced review", sub: "Step 2", icon: RotateCw },
          { title: "Track recall", sub: "Step 3", icon: LineChart },
          { title: "Share deck", sub: "Step 4", icon: Users }
        ]
      }
    ],
    quickActionsTitle: "What brings you to Study today?",
    quickActions: [
      { label: "Start organising notes", icon: Rocket, class: "qa-1", href: "/dashboard" },
      { label: "Catch up before exams", icon: Clock, class: "qa-2", href: "/dashboard" },
      { label: "Plan my semester", icon: Calendar, class: "qa-3", href: "/dashboard" },
      { label: "Explore other pillars", icon: Compass, class: "qa-4", href: "/#explore" }
    ],
    resourceTabs: ["All", "Techniques", "Exam tips", "Guides"],
    resources: [
      {
        title: "How to build a revision timetable that actually holds up",
        description: "A simple week-by-week structure for spreading revision across subjects without burning out.",
        category: "Guides",
        date: "June 2, 2026 · 6 min read"
      },
      {
        title: "Spaced repetition, explained simply",
        description: "Why reviewing a flashcard right before you'd forget it works better than cramming the night before.",
        category: "Techniques",
        date: "May 18, 2026 · 4 min read"
      },
      {
        title: "Turning messy lecture notes into exam-ready summaries",
        description: "A three-pass method for cleaning up notes taken in a hurry during class.",
        category: "Techniques",
        date: "April 30, 2026 · 5 min read"
      },
      {
        title: "Is group study actually worth it?",
        description: "When study groups help retention, and when they just turn into a distraction.",
        category: "Exam tips",
        date: "April 9, 2026 · 7 min read"
      }
    ],
    successStories: [
      {
        initials: "AN",
        name: "Aditi N.",
        role: "3rd year, Computer Science",
        quote: "\"I used to keep notes in four different apps. Having them next to my timetable and flashcards means I actually open the app before exams instead of avoiding it.\""
      },
      {
        initials: "RK",
        name: "Rahul K.",
        role: "2nd year, Electronics",
        quote: "\"The spaced repetition reminders got me through my first semester without a single all-nighter. Small thing, big difference.\""
      }
    ]
  },
  connect: {
    slug: "connect",
    indexTag: "Pillar 2 of 6",
    title: "Connect",
    subtitle: "Connect with your classmates, department clubs, technical communities, and campus events.",
    description: "Connect bridges the communication gap. Find project collaborators, coordinate technical hackathons, keep up with campus event alerts, and exchange notes in peer forums.",
    statBold: "68",
    statLabel: "active student circles",
    statBold2: "1,500+",
    statLabel2: "daily discussions",
    skillsLine: "Class chats, Club directories, Event boards, Peer Q&A, Project matching",
    heroSvg: (
      <svg viewBox="0 0 100 100" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-32 h-32">
        <circle cx="50" cy="35" r="15" />
        <circle cx="25" cy="70" r="12" />
        <circle cx="75" cy="70" r="12" />
        <line x1="37" y1="62" x2="43" y2="48" />
        <line x1="63" y1="62" x2="57" y2="48" />
        <line x1="37" y1="70" x2="63" y2="70" />
      </svg>
    ),
    toolsTabs: ["All tools", "Student Clubs", "Collaboration", "Discussions"],
    tools: [
      {
        badgeIcon: Users,
        name: "Campus Circles",
        category: "Student Clubs",
        skills: "Find interest groups, department forums, and build cross-branch teams",
        rating: 4.9,
        reviews: 1220,
        ctaText: "Open Circles",
        ctaHref: "/forum",
        steps: [
          { title: "Pick interests", sub: "Step 1", icon: Compass },
          { title: "Join circles", sub: "Step 2", icon: UserPlus },
          { title: "Meet peers", sub: "Step 3", icon: Users },
          { title: "Start building", sub: "Step 4", icon: Rocket }
        ]
      },
      {
        badgeIcon: Calendar,
        name: "Event Board",
        category: "Collaboration",
        skills: "Track college hackathons, technical workshops, and club inductions",
        rating: 4.8,
        reviews: 980,
        ctaText: "Explore Events",
        ctaHref: "/forum",
        steps: [
          { title: "Browse listings", sub: "Step 1", icon: Grid },
          { title: "RSVP dynamically", sub: "Step 2", icon: Calendar },
          { title: "Attend event", sub: "Step 3", icon: Users },
          { title: "Earn credentials", sub: "Step 4", icon: Trophy }
        ]
      }
    ],
    quickActionsTitle: "Connect on campus today",
    quickActions: [
      { label: "Join student clubs", icon: Users, class: "qa-2", href: "/forum" },
      { label: "Find project partner", icon: UserPlus, class: "qa-1", href: "/forum" },
      { label: "Browse event board", icon: Calendar, class: "qa-3", href: "/forum" },
      { label: "Explore other pillars", icon: Compass, class: "qa-4", href: "/#explore" }
    ],
    resourceTabs: ["All", "Networking", "Events"],
    resources: [
      {
        title: "Networking on campus: A guide for engineering introverts",
        description: "Practical steps to meeting classmates, joining technical clubs, and finding project collaborators.",
        category: "Networking",
        date: "July 1, 2026 · 5 min read"
      },
      {
        title: "Organizing successful college hackathons & events",
        description: "A complete blueprint for student leaders planning high-impact campus workshops.",
        category: "Events",
        date: "June 20, 2026 · 8 min read"
      }
    ],
    successStories: [
      {
        initials: "SR",
        name: "Sneha R.",
        role: "4th year, Computer Science",
        quote: "\"Through Connect, I met mechanical students to build our smart agriculture drone. The interdisciplinary collaboration was super easy and fun.\""
      },
      {
        initials: "AM",
        name: "Arjun M.",
        role: "2nd year, Mechanical",
        quote: "\"I found out about the college robotics workshop just in time on the events board. Syncing it directly to my calendar made check-in seamless.\""
      }
    ]
  },
  track: {
    slug: "track",
    indexTag: "Pillar 3 of 6",
    title: "Track",
    subtitle: "Track your attendance requirements, marks, and coursework progress in one view.",
    description: "Track pulls data from college systems to display beautiful progress dials. Stay ahead of attendance limits, estimate target scores, and plan assignment submissions without logging into obsolete systems.",
    statBold: "98%",
    statLabel: "accuracy score",
    statBold2: "2,400+",
    statLabel2: "subjects monitored",
    skillsLine: "Attendance planner, Grade calculator, Assignment tracker, Course progress",
    heroSvg: (
      <svg viewBox="0 0 100 100" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-32 h-32">
        <circle cx="50" cy="50" r="40" />
        <path d="M50 20 A30 30 0 0 1 80 50" strokeWidth="4" />
        <line x1="50" y1="50" x2="50" y2="30" />
        <line x1="50" y1="50" x2="70" y2="50" />
      </svg>
    ),
    toolsTabs: ["All tools", "Attendance", "Grade Calculators"],
    tools: [
      {
        badgeIcon: Shield,
        name: "Attendance Monitor",
        category: "Attendance",
        skills: "Calculate bunk limits, set warning thresholds, and check dynamic status",
        rating: 4.7,
        reviews: 3100,
        ctaText: "Check Attendance",
        ctaHref: "/dashboard",
        steps: [
          { title: "Log timetables", sub: "Step 1", icon: Calendar },
          { title: "Check current stats", sub: "Step 2", icon: BarChart3 },
          { title: "Calculate margins", sub: "Step 3", icon: Calculator },
          { title: "Maintain safety", sub: "Step 4", icon: Shield }
        ]
      },
      {
        badgeIcon: Calculator,
        name: "GPA Simulator",
        category: "Grade Calculators",
        skills: "Project cumulative GPAs, run grade simulation, and map performance goals",
        rating: 4.6,
        reviews: 1550,
        ctaText: "Simulate Grades",
        ctaHref: "/dashboard",
        steps: [
          { title: "Enter midterms", sub: "Step 1", icon: Pencil },
          { title: "Set endsem goals", sub: "Step 2", icon: Target },
          { title: "Run calculator", sub: "Step 3", icon: Calculator },
          { title: "Review pathway", sub: "Step 4", icon: LineChart }
        ]
      }
    ],
    quickActionsTitle: "Check your academic status",
    quickActions: [
      { label: "Check my attendance", icon: BarChart3, class: "qa-3", href: "/dashboard" },
      { label: "Calculate target GPA", icon: Calculator, class: "qa-4", href: "/dashboard" },
      { label: "Add upcoming exam", icon: Calendar, class: "qa-1", href: "/dashboard" },
      { label: "Explore other pillars", icon: Compass, class: "qa-2", href: "/#explore" }
    ],
    resourceTabs: ["All", "Advisories", "Guides"],
    resources: [
      {
        title: "Keeping your attendance above 75% without stress",
        description: "A pragmatic guide to logging sessions, predicting holidays, and balancing study leaves.",
        category: "Advisories",
        date: "June 11, 2026 · 4 min read"
      },
      {
        title: "Understanding GPA calculations: A simple student manual",
        description: "Breaking down internal marks, external exams, course credits, and grade point averages.",
        category: "Guides",
        date: "May 29, 2026 · 5 min read"
      }
    ],
    successStories: [
      {
        initials: "DS",
        name: "Devika S.",
        role: "3rd year, Electrical",
        quote: "\"The attendance predictor saved me from getting blocked for finals. I knew exactly how many classes I could miss when I was down with the flu.\""
      },
      {
        initials: "KP",
        name: "Kevin P.",
        role: "4th year, Civil",
        quote: "\"Simulating my grades helped me prioritize my focus subjects, bringing my final semester GPA up by 0.5 points.\""
      }
    ]
  },
  achieve: {
    slug: "achieve",
    indexTag: "Pillar 4 of 6",
    title: "Achieve",
    subtitle: "Showcase verified certificates, badges, and academic milestones.",
    description: "Achieve gathers your accomplishments into a cryptographic showcase. Gain badges for completing technical labs, leadership roles, or online learning, and share verification links globally.",
    statBold: "5,000+",
    statLabel: "credentials issued",
    statBold2: "100%",
    statLabel2: "cryptographic validity",
    skillsLine: "Verifiable certificates, Badging system, Leaderboards, Achievement history",
    heroSvg: (
      <svg viewBox="0 0 100 100" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-32 h-32">
        <path d="M50 15 L60 38 L85 38 L65 53 L72 78 L50 63 L28 78 L35 53 L15 38 L40 38 Z" />
      </svg>
    ),
    toolsTabs: ["All tools", "Verifications", "Milestones"],
    tools: [
      {
        badgeIcon: Trophy,
        name: "Credential Vault",
        category: "Verifications",
        skills: "Issue cryptographic certificates, share directly to LinkedIn, and generate PDF awards",
        rating: 4.9,
        reviews: 1420,
        ctaText: "View Vault",
        ctaHref: "/dashboard",
        steps: [
          { title: "Complete labs", sub: "Step 1", icon: Calendar },
          { title: "Claim certificate", sub: "Step 2", icon: Award },
          { title: "Verify hash", sub: "Step 3", icon: Shield },
          { title: "Share to socials", sub: "Step 4", icon: Share2 }
        ]
      },
      {
        badgeIcon: Award,
        name: "Skill Badges",
        category: "Milestones",
        skills: "Earn profile badges, display technical achievements, and rank on class boards",
        rating: 4.8,
        reviews: 1120,
        ctaText: "Check Badges",
        ctaHref: "/dashboard",
        steps: [
          { title: "Join challenges", sub: "Step 1", icon: Grid },
          { title: "Earn badges", sub: "Step 2", icon: Award },
          { title: "Feature on profile", sub: "Step 3", icon: Users },
          { title: "Increase score", sub: "Step 4", icon: LineChart }
        ]
      }
    ],
    quickActionsTitle: "Verify your credentials",
    quickActions: [
      { label: "View my certificates", icon: FileText, class: "qa-4", href: "/dashboard" },
      { label: "Check class leaderboard", icon: TrendingUp, class: "qa-1", href: "/dashboard" },
      { label: "Share badge to LinkedIn", icon: Share, class: "qa-2", href: "/dashboard" },
      { label: "Explore other pillars", icon: Compass, class: "qa-3", href: "/#explore" }
    ],
    resourceTabs: ["All", "Career Tips", "Gamification"],
    resources: [
      {
        title: "Why verified digital credentials matter to modern recruiters",
        description: "How blockchain-based verification accelerates screening and adds authority to your student profile.",
        category: "Career Tips",
        date: "July 5, 2026 · 5 min read"
      },
      {
        title: "Setting up a standout digital portfolio",
        description: "A walkthrough of building, linking, and maintaining your academic portfolio for placement reviews.",
        category: "Career Tips",
        date: "June 12, 2026 · 6 min read"
      }
    ],
    successStories: [
      {
        initials: "MK",
        name: "Meera K.",
        role: "4th year, Information Technology",
        quote: "\"Recruiters loved that my node.js certification was verifiable in real time via the Arcade link on my resume. Got placed in two weeks!\""
      },
      {
        initials: "RJ",
        name: "Roshan J.",
        role: "3rd year, Mechanical",
        quote: "\"Earning the 'Solidworks Master' badge motivated me to complete all workshop modules. Friendly leaderboard competition helps!\""
      }
    ]
  },
  launch: {
    slug: "launch",
    indexTag: "Pillar 5 of 6",
    title: "Launch",
    subtitle: "Apply for internships, review placements, and pitch incubation projects.",
    description: "Launch handles transition steps to professional domains. Submit resumes to top-tier internship placements, practice mock coding trials, and apply for startup grants via the incubation board.",
    statBold: "120+",
    statLabel: "active recruiters",
    statBold2: "₹8.5L",
    statLabel2: "max stipend offered",
    skillsLine: "Job board, Interview prep, Portfolio builder, Incubation applications",
    heroSvg: (
      <svg viewBox="0 0 100 100" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-32 h-32">
        <path d="M50 15 L80 35 L80 85 L20 85 L20 35 Z" />
        <line x1="50" y1="15" x2="50" y2="85" />
        <path d="M35 50 L50 35 L65 50" />
      </svg>
    ),
    toolsTabs: ["All tools", "Placements", "Incubation"],
    tools: [
      {
        badgeIcon: Briefcase,
        name: "Placement Portal",
        category: "Placements",
        skills: "Filter internship boards, schedule interviews, and upload verified resumes",
        rating: 4.8,
        reviews: 1940,
        ctaText: "Browse Jobs",
        ctaHref: "/courses",
        steps: [
          { title: "Upload profile", sub: "Step 1", icon: Pencil },
          { title: "Match algorithm", sub: "Step 2", icon: Compass },
          { title: "Submit application", sub: "Step 3", icon: FileText },
          { title: "Schedule tests", sub: "Step 4", icon: Calendar }
        ]
      },
      {
        badgeIcon: Lightbulb,
        name: "Incubation Hub",
        category: "Incubation",
        skills: "Pitch start-up business structures, book mentoring slots, and check grant details",
        rating: 4.9,
        reviews: 680,
        ctaText: "Pitch Startup",
        ctaHref: "/forum",
        steps: [
          { title: "Draft pitches", sub: "Step 1", icon: Pencil },
          { title: "Pass screening", sub: "Step 2", icon: Shield },
          { title: "Match advisors", sub: "Step 3", icon: Users },
          { title: "Pitch panels", sub: "Step 4", icon: Rocket }
        ]
      }
    ],
    quickActionsTitle: "Kickstart your career",
    quickActions: [
      { label: "Apply for internships", icon: Briefcase, class: "qa-1", href: "/courses" },
      { label: "Practice mock interview", icon: Video, class: "qa-3", href: "/dashboard" },
      { label: "Pitch a startup idea", icon: Lightbulb, class: "qa-2", href: "/forum" },
      { label: "Explore other pillars", icon: Compass, class: "qa-4", href: "/#explore" }
    ],
    resourceTabs: ["All", "Preparation", "Pitch Guides"],
    resources: [
      {
        title: "Cracking the campus coding interview: 10 essential tips",
        description: "A compilation of data structures, system design basics, and HR preparation questions.",
        category: "Preparation",
        date: "July 10, 2026 · 7 min read"
      },
      {
        title: "How to draft a pitch deck that wins seed funding",
        description: "Key elements slides must contain, focusing on problem definitions, TAM, and cash projections.",
        category: "Pitch Guides",
        date: "June 28, 2026 · 8 min read"
      }
    ],
    successStories: [
      {
        initials: "SV",
        name: "Sidharth V.",
        role: "4th year, Computer Science",
        quote: "\"Applied to 5 internships through Launch, got selected by an AI startup, and transitioned to a full-time role before graduating.\""
      },
      {
        initials: "AC",
        name: "Anjali C.",
        role: "3rd year, Electronics & Comm.",
        quote: "\"We incubated our student venture 'GreenCharge' here. Got mentoring, workspace, and a seed grant of ₹50,000.\""
      }
    ]
  },
  grow: {
    slug: "grow",
    indexTag: "Pillar 6 of 6",
    title: "Grow",
    subtitle: "Grow your skill boundaries, map long-term targets, and book mentoring advice.",
    description: "Grow connects students with college alumni and verified industry paths. Explore curated technology roadmaps, book advice slots with alumni, and build career milestone trackers.",
    statBold: "350+",
    statLabel: "active alumni mentors",
    statBold2: "12",
    statLabel2: "tech roadmaps available",
    skillsLine: "Goal setting, Alumni mentoring, Skill roadmaps, Career pathways",
    heroSvg: (
      <svg viewBox="0 0 100 100" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-32 h-32">
        <path d="M50 85 L50 40" strokeWidth="3" />
        <path d="M50 50 Q30 40 25 20 Q50 30 50 50" />
        <path d="M50 60 Q70 50 75 30 Q50 40 50 60" />
      </svg>
    ),
    toolsTabs: ["All tools", "Mentorship", "Roadmaps"],
    tools: [
      {
        badgeIcon: UserCheck,
        name: "Alumni Mentors",
        category: "Mentorship",
        skills: "Consult industry experts, request mock reviews, and build professional networks",
        rating: 4.9,
        reviews: 1520,
        ctaText: "Book Mentor",
        ctaHref: "/forum",
        steps: [
          { title: "Select fields", sub: "Step 1", icon: Compass },
          { title: "Find mentors", sub: "Step 2", icon: Users },
          { title: "Confirm sessions", sub: "Step 3", icon: Calendar },
          { title: "Gain insights", sub: "Step 4", icon: UserCheck }
        ]
      },
      {
        badgeIcon: Map,
        name: "Tech Roadmaps",
        category: "Roadmaps",
        skills: "Map self-paced goals, select course tracks, and earn milestones",
        rating: 4.7,
        reviews: 2050,
        ctaText: "Explore Paths",
        ctaHref: "/courses",
        steps: [
          { title: "Select targets", sub: "Step 1", icon: Grid },
          { title: "Track path segments", sub: "Step 2", icon: Map },
          { title: "Review tasks", sub: "Step 3", icon: Pencil },
          { title: "Claim badges", sub: "Step 4", icon: Trophy }
        ]
      }
    ],
    quickActionsTitle: "Plan your development",
    quickActions: [
      { label: "Book mentor session", icon: UserCheck, class: "qa-2", href: "/forum" },
      { label: "Start a skill roadmap", icon: Map, class: "qa-4", href: "/courses" },
      { label: "Set semester goals", icon: Target, class: "qa-1", href: "/dashboard" },
      { label: "Explore other pillars", icon: Compass, class: "qa-3", href: "/#explore" }
    ],
    resourceTabs: ["All", "Career Growth", "Upskilling"],
    resources: [
      {
        title: "Choosing the right career path in engineering",
        description: "A strategic overview of software, core hardware, administration, and higher studies.",
        category: "Career Growth",
        date: "June 15, 2026 · 6 min read"
      },
      {
        title: "Making the most of your alumni mentor meetings",
        description: "How to draft questions, request resume advice, and follow up professionally.",
        category: "Career Growth",
        date: "May 30, 2026 · 5 min read"
      }
    ],
    successStories: [
      {
        initials: "KA",
        name: "Karthik A.",
        role: "4th year, Computer Science",
        quote: "\"Connected with an alumnus working at Microsoft who guided me on DSA prep. His mocks were the game-changer.\""
      },
      {
        initials: "RG",
        name: "Ritu G.",
        role: "2nd year, Civil Engineering",
        quote: "\"The Roadmap Builder kept me focused on learning BIM tools alongside my coursework, giving me a head start.\""
      }
    ]
  }
};

// ----------------------------------------------------
// Component Layout
// ----------------------------------------------------

export default function PillarPage({
  params
}: {
  params: Promise<{ pillar: string }>;
}) {
  const { pillar: rawPillar } = use(params);
  const pillarKey = rawPillar.toLowerCase();

  // Validate pillarKey exists, else trigger 404
  const activePillar = PILLARS_DATA[pillarKey];
  if (!activePillar) {
    notFound();
  }

  // Interactive tab filters state
  const [activeToolTab, setActiveToolTab] = useState("All tools");
  const [activeResourceTab, setActiveResourceTab] = useState("All");

  // Filtering Logic
  const filteredTools = activePillar.tools.filter(tool => {
    if (activeToolTab === "All tools") return true;
    return tool.category.toLowerCase() === activeToolTab.toLowerCase();
  });

  const filteredResources = activePillar.resources.filter(resource => {
    if (activeResourceTab === "All") return true;
    return resource.category.toLowerCase() === activeResourceTab.toLowerCase();
  });

  // Pillar List for the grid
  const PILLARS_LIST = [
    { name: "Study", slug: "study", bg: "var(--c-study)", desc: "Notes, flashcards, and timetables.", icon: BookOpen },
    { name: "Connect", slug: "connect", bg: "var(--c-connect)", desc: "Clubs, classmates, and events.", icon: Users },
    { name: "Track", slug: "track", bg: "var(--c-track)", desc: "Attendance and grades in one view.", icon: BarChart3 },
    { name: "Achieve", slug: "achieve", bg: "var(--c-achieve)", desc: "Certificates, badges, and milestones.", icon: Trophy },
    { name: "Launch", slug: "launch", bg: "var(--c-launch)", desc: "Internships and startup incubation.", icon: Rocket },
    { name: "Grow", slug: "grow", bg: "var(--c-grow)", desc: "Skills, roadmaps, and alumni mentors.", icon: Sprout }
  ];

  return (
    <div className="pillar-page" data-pillar={activePillar.slug}>
      {/* ---------- Header Navigation ---------- */}
      <HeroNav />

      {/* ---------- Breadcrumb ---------- */}
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <span style={{ color: "var(--ink-dim)" }}>Explore</span>
        <span className="sep">/</span>
        <span className="current">{activePillar.title}</span>
      </div>

      {/* ---------- Hero Section ---------- */}
      <section className="hero">
        <div className="hero-text">
          <span className="pillar-tag">
            {activePillar.slug === "study" && <BookOpen size={14} />}
            {activePillar.slug === "connect" && <Users size={14} />}
            {activePillar.slug === "track" && <BarChart3 size={14} />}
            {activePillar.slug === "achieve" && <Trophy size={14} />}
            {activePillar.slug === "launch" && <Rocket size={14} />}
            {activePillar.slug === "grow" && <Sprout size={14} />}
            {activePillar.indexTag}
          </span>
          <h1 className="hero-title">{activePillar.title}</h1>
          <p className="hero-sub">{activePillar.subtitle}</p>
          <p className="hero-desc">{activePillar.description}</p>
          
          <p className="hero-skills">
            <b>Tools included:</b>
            {activePillar.skillsLine.split(", ").map((skill, idx) => (
              <span key={idx}>
                {idx > 0 && ", "}
                <Link href="/dashboard">{skill}</Link>
              </span>
            ))}
          </p>
        </div>

        <div className="hero-visual">
          <div className="blob"></div>
          {activePillar.heroSvg}
          
          <div className="stat-chip">
            <b>{activePillar.statBold}</b>
            <span className="lbl">{activePillar.statLabel}</span>
            <span className="dot">·</span>
            <b>{activePillar.statBold2}</b>
            <span className="lbl">{activePillar.statLabel2}</span>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* ---------- Recommended Section ---------- */}
      <section className="pillar-section">
        <h2 className="section-title">Recommended for {activePillar.title}</h2>
        
        {/* Tool Filter Tabs */}
        <div className="tabs">
          {activePillar.toolsTabs.map((tab) => (
            <span
              key={tab}
              className={`tab ${activeToolTab === tab ? "active" : ""}`}
              onClick={() => setActiveToolTab(tab)}
            >
              {tab}
            </span>
          ))}
        </div>

        {/* Dynamic Tool Cards */}
        {filteredTools.map((tool, idx) => {
          const ToolBadgeIcon = tool.badgeIcon;
          return (
            <div className="tool-card" key={idx}>
              <div>
                <div className="tool-badge">
                  <ToolBadgeIcon size={20} />
                </div>
                <div className="tool-name">{tool.name}</div>
                <div className="tool-skills">
                  <b>Includes:</b> {tool.skills}
                </div>
                <div className="tool-meta">
                  <span className="stars">
                    {Array.from({ length: Math.floor(tool.rating) }).map((_, i) => "★").join("")}
                  </span>
                  <span className="rating-num">{tool.rating}</span>
                  <span>({tool.reviews.toLocaleString()} reviews)</span>
                </div>
                <div className="tool-cta-row">
                  <Link href={tool.ctaHref} className="tool-cta">
                    {tool.ctaText}
                  </Link>
                  <Link href={tool.ctaHref} className="tool-view">
                    View details
                  </Link>
                </div>
              </div>

              {/* Steps visual */}
              <div className="mini-steps">
                {tool.steps.map((step, sIdx) => {
                  const StepIcon = step.icon;
                  return (
                    <div className="mini-step" key={sIdx}>
                      <div className="mini-step-thumb">
                        <StepIcon size={22} />
                      </div>
                      <div className="mini-step-title">{step.title}</div>
                      <div className="mini-step-sub">{step.sub}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <div className="divider"></div>

      {/* ---------- Quick Action Bar ---------- */}
      <section className="pillar-section" style={{ paddingTop: "44px", paddingBottom: "44px" }}>
        <div className="quick-bar">
          <h3>{activePillar.quickActionsTitle}</h3>
          <div className="quick-actions">
            {activePillar.quickActions.map((qa, idx) => {
              const QAIcon = qa.icon;
              return (
                <Link href={qa.href} className="quick-action" key={idx}>
                  <span className={`qa-icon ${qa.class}`}>
                    <QAIcon size={14} />
                  </span>
                  {qa.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* ---------- Other Pillars Section ---------- */}
      <section className="pillar-section">
        <div className="pillars-intro">
          <h2 className="section-title" style={{ marginBottom: 0 }}>The other five pillars</h2>
          <p>Each pillar is part of your unified login. Jump to any section instantly without re-signing in.</p>
        </div>
        <div className="pillar-grid">
          {PILLARS_LIST.filter(p => p.slug !== activePillar.slug).map((p) => {
            const PIcon = p.icon;
            return (
              <Link href={`/${p.slug}`} className="pillar-card" key={p.slug}>
                <div className="pillar-icon" style={{ backgroundColor: p.bg }}>
                  <PIcon size={16} />
                </div>
                <h4>{p.name}</h4>
                <p>{p.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="divider"></div>

      {/* ---------- Resources Section ---------- */}
      <section className="pillar-section">
        <h2 className="section-title">{activePillar.title} resources</h2>
        
        {/* Resource Tabs */}
        <div className="tabs">
          {activePillar.resourceTabs.map((tab) => (
            <span
              key={tab}
              className={`tab ${activeResourceTab === tab ? "active" : ""}`}
              onClick={() => setActiveResourceTab(tab)}
            >
              {tab}
            </span>
          ))}
        </div>

        {/* Dynamic Resource Cards */}
        <div className="resource-grid">
          {filteredResources.map((resource, idx) => (
            <div className="resource-card" key={idx}>
              <h4>{resource.title}</h4>
              <p>{resource.description}</p>
              <div className="resource-date">{resource.date}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider"></div>

      {/* ---------- Success Stories ---------- */}
      <section className="pillar-section" style={{ paddingBottom: "64px" }}>
        <h2 className="section-title">Success stories</h2>
        <div className="story-grid">
          {activePillar.successStories.map((story, idx) => (
            <div className="story-card" key={idx}>
              <div className="story-head">
                <div className="story-avatar">{story.initials}</div>
                <div>
                  <div className="story-name">{story.name}</div>
                  <div className="story-role">{story.role}</div>
                </div>
              </div>
              <p className="story-quote">{story.quote}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Mini Footer ---------- */}
      <footer className="mini-footer">
        <span>© 2026 Arcade — AJCE. All rights reserved.</span>
        <span>{activePillar.title} is {activePillar.indexTag.split(" ")[1]} of 6 pillars in Arcade</span>
      </footer>
    </div>
  );
}
