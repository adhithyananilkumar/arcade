"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Compass, Flame, Heart, Award, Map, FileText, 
  Search, Bell, ChevronDown, User, Check, Play, Sparkles,
  ArrowRight, Star, Layers, Laptop, Palette, Shield, Cpu,
  Cloud, TrendingUp, HelpCircle, Lock
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import HeroNav from "@/components/landing/HeroNav";
import TrueFocus from "@/components/landing/TrueFocus";
import "./courses.css";

/* ─── Mock Course Data ───────────────────────────────────────────── */
interface Course {
  id: string;
  title: string;
  category: string; // Programming, AI, Design, Web, etc.
  description: string;
  rating: number;
  ratingCount: string;
  lessons: number;
  students: number;
  price: string;
  badge?: string;
  author: {
    name: string;
    avatar: string;
  };
  illustration: "javascript" | "react" | "figma" | "python" | "security" | "cloud";
}

const COURSES_LIST: Course[] = [
  {
    id: "js",
    title: "Full Stack Modern JavaScript",
    category: "Programming",
    description: "Learn JavaScript, React, Node.js and build real world applications.",
    rating: 4.7,
    ratingCount: "2.1k",
    lessons: 12,
    students: 150,
    price: "$20",
    badge: "BEST SELLER",
    author: { name: "Colt Steele", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80" },
    illustration: "javascript"
  },
  {
    id: "react-design",
    title: "Design System with React",
    category: "Design",
    description: "Learn how to create scalable design systems with React and Storybook.",
    rating: 4.7,
    ratingCount: "1.3k",
    lessons: 15,
    students: 130,
    price: "$20",
    badge: "BEST SELLER",
    author: { name: "Colt Steele", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80" },
    illustration: "react"
  },
  {
    id: "figma-banner",
    title: "Design Banner with Figma",
    category: "Design",
    description: "Create stunning web banners and UI components using Figma.",
    rating: 4.7,
    ratingCount: "980",
    lessons: 12,
    students: 120,
    price: "$20",
    badge: "BEST SELLER",
    author: { name: "Colt Steele", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80" },
    illustration: "figma"
  },
  {
    id: "py-data",
    title: "Data Science with Python Masterclass",
    category: "Data Science",
    description: "Analyze, clean, and visualize complex datasets using NumPy, Pandas, and Matplotlib.",
    rating: 4.8,
    ratingCount: "1.5k",
    lessons: 18,
    students: 190,
    price: "$20",
    badge: "RECOMMENDED",
    author: { name: "Colt Steele", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80" },
    illustration: "python"
  },
  {
    id: "web-dev",
    title: "Responsive Web Development",
    category: "Web Development",
    description: "Build clean, pixel-perfect, mobile-first responsive web pages using modern CSS and Tailwind.",
    rating: 4.6,
    ratingCount: "870",
    lessons: 10,
    students: 110,
    price: "$20",
    author: { name: "Colt Steele", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80" },
    illustration: "javascript"
  },
  {
    id: "devops-ci",
    title: "DevOps & CI/CD Pipelines Lab",
    category: "DevOps",
    description: "Automate builds using GitHub Actions, configure Docker containers, and host dynamic cloud releases.",
    rating: 4.7,
    ratingCount: "640",
    lessons: 14,
    students: 95,
    price: "$20",
    author: { name: "Colt Steele", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80" },
    illustration: "cloud"
  }
];

const TRENDING_COURSES = [
  {
    title: "AI & Machine Learning Bootcamp",
    category: "AI & Machine Learning",
    duration: "Beginner • 24 Lessons",
    rating: "4.8 (3.2k)",
    icon: Cpu,
    color: "#8B5CF6",
    bgColor: "rgba(139, 92, 246, 0.08)",
  },
  {
    title: "AWS Certified Solutions Architect",
    category: "Cloud Computing",
    duration: "Intermediate • 18 Lessons",
    rating: "4.7 (1.6k)",
    icon: Cloud,
    color: "#3B82F6",
    bgColor: "rgba(59, 130, 246, 0.08)",
  },
  {
    title: "Cyber Security Fundamentals",
    category: "Cyber Security",
    duration: "Beginner • 20 Lessons",
    rating: "4.6 (980)",
    icon: Shield,
    color: "#EC4899",
    bgColor: "rgba(236, 72, 153, 0.08)",
  },
  {
    title: "Data Science with Python",
    category: "Data Science",
    duration: "Beginner • 22 Lessons",
    rating: "4.8 (2.4k)",
    icon: TrendingUp,
    color: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.08)",
  }
];

const SIDEBAR_CATEGORIES = [
  { name: "Programming", color: "#3B82F6" },
  { name: "AI & Machine Learning", color: "#2451D6" },
  { name: "Data Science", color: "#10B981" },
  { name: "Design", color: "#F59E0B" },
  { name: "Web Development", color: "#06B6D4" },
  { name: "Cyber Security", color: "#EC4899" },
  { name: "Cloud Computing", color: "#8B5CF6" },
  { name: "DevOps", color: "#EAB308" }
];

/* ─── Vector Cover Illustrations with Creative Floating Details ──── */
function CourseCoverIllustration({ type }: { type: Course["illustration"] }) {
  const lineStyle = { stroke: "rgba(255, 255, 255, 0.08)", strokeWidth: 1.2 };
  
  switch (type) {
    case "javascript":
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#374151] to-[#1F2937] flex items-center justify-center overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-30 animate-pulse">
            <path d="M-20,30 L260,110 M-20,50 L260,130 M30,-10 L190,130 M70,-10 L230,130" {...lineStyle} />
          </svg>
          <div className="relative z-10 flex flex-col items-center gap-2 animate-float-svg">
            <div className="w-16 h-12 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center shadow-[0_12px_24px_rgba(0,0,0,0.2)] backdrop-blur-md relative">
              <span className="font-mono text-xl font-bold text-yellow-400">JS</span>
            </div>
            <Laptop size={20} className="text-white/60" />
          </div>
        </div>
      );
    case "react":
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E40AF] to-[#2563EB] flex items-center justify-center overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-30">
            <path d="M-10,20 L240,100 M-10,40 L240,120 M40,-20 L180,100" {...lineStyle} />
          </svg>
          <div className="relative z-10 flex flex-col items-center gap-2 animate-float-svg">
            <div className="flex gap-1.5 bg-white/10 p-3 rounded-xl border border-white/20 shadow-[0_12px_24px_rgba(0,0,0,0.15)] backdrop-blur-md">
              <span className="w-2.5 h-6 bg-red-400 rounded-sm"></span>
              <span className="w-2.5 h-8 bg-yellow-400 rounded-sm"></span>
              <span className="w-2.5 h-5 bg-green-400 rounded-sm"></span>
            </div>
            <Palette size={16} className="text-white/80" />
          </div>
        </div>
      );
    case "figma":
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#6D28D9] to-[#7C3AED] flex items-center justify-center overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-35">
            <path d="M-20,40 L280,120 M-20,70 L280,150 M50,-10 L210,120" {...lineStyle} />
          </svg>
          <div className="relative z-10 flex flex-col items-center gap-2 animate-float-svg">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-[0_12px_24px_rgba(0,0,0,0.15)] border border-slate-100">
              <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
                <path d="M30 25C30 13.9543 38.9543 5 50 5C61.0457 5 70 13.9543 70 25C70 36.0457 61.0457 45 50 45H30V25Z" fill="#F24E1E"/>
                <path d="M30 45H50C61.0457 45 70 53.9543 70 65C70 76.0457 61.0457 85 50 85C38.9543 85 30 76.0457 30 65V45Z" fill="#0ACF83"/>
                <path d="M30 65C30 53.9543 38.9543 45 50 45C61.0457 45 70 53.9543 70 65C70 76.0457 61.0457 85 50 85C38.9543 85 30 76.0457 30 65Z" fill="#1ABC9C"/>
              </svg>
            </div>
            <Layers size={16} className="text-white/80 animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
        </div>
      );
    case "python":
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F766E] to-[#0F766E] flex items-center justify-center overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-30">
            <path d="M-10,30 L250,110 M10,-10 L150,130" {...lineStyle} />
          </svg>
          <div className="relative z-10 flex flex-col items-center gap-2 animate-float-svg">
            <div className="w-14 h-12 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center shadow-[0_12px_24px_rgba(0,0,0,0.15)] backdrop-blur-md">
              <span className="font-mono text-xl font-bold text-yellow-300">Py</span>
            </div>
            <TrendingUp size={16} className="text-white/80" />
          </div>
        </div>
      );
    case "security":
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#BE185D] to-[#9D174D] flex items-center justify-center overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-30">
            <path d="M-20,40 L280,120 M50,-10 L210,120" {...lineStyle} />
          </svg>
          <div className="relative z-10 flex flex-col items-center gap-2 animate-float-svg">
            <div className="w-12 h-12 bg-white/15 rounded-full border border-white/25 flex items-center justify-center shadow-lg backdrop-blur-sm">
              <Shield size={22} className="text-white" />
            </div>
          </div>
        </div>
      );
    case "cloud":
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#C2410C] to-[#9A3412] flex items-center justify-center overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-30">
            <path d="M-10,40 L260,110 M80,-20 L220,110" {...lineStyle} />
          </svg>
          <div className="relative z-10 flex flex-col items-center gap-2 animate-float-svg">
            <Cloud size={32} className="text-white/90 drop-shadow-md" />
          </div>
        </div>
      );
  }
}

/* ─── Main Content component ─────────────────────────────────────── */
function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Extract initial category from URL
  const initialCategory = searchParams.get("category");

  // Authentication State
  const { user, status } = useAuthStore();
  const isAuthenticated = status === "authenticated";

  // State Management
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlistedCourses, setWishlistedCourses] = useState<Record<string, boolean>>({});

  // Synchronize category selection with sidebar filters
  useEffect(() => {
    if (initialCategory) {
      if (initialCategory === "Computer Science") {
        setActiveCategory("Programming");
      } else if (initialCategory === "Artificial Intelligence") {
        setActiveCategory("AI & Machine Learning");
      } else if (initialCategory === "Information Technology") {
        setActiveCategory("Cloud Computing");
      } else if (initialCategory === "Business & Management") {
        setActiveCategory("Programming");
      } else {
        const matched = SIDEBAR_CATEGORIES.find(
          c => c.name.toLowerCase() === initialCategory.toLowerCase()
        );
        if (matched) {
          setActiveCategory(matched.name);
        } else {
          setActiveCategory(null);
        }
      }
    } else {
      setActiveCategory(null);
    }
  }, [initialCategory]);

  const toggleWishlist = (courseId: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to save wishlists!");
      router.push("/login");
      return;
    }
    setWishlistedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const handleEnrollClick = (courseTitle: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to enroll in courses!");
      router.push("/login");
    } else {
      toast.success(`Successfully enrolled in ${courseTitle}!`);
    }
  };

  // Filter courses based on active category and search queries
  const filteredCourses = COURSES_LIST.filter(course => {
    const matchesCategory = activeCategory ? course.category === activeCategory : true;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="courses-dashboard-root flex flex-col min-h-screen bg-[#F8F9FC] antialiased text-[#14142b] relative z-10">
      
      {/* ── 0. GLOBAL NAV HEADER (Unconditionally displayed like other pages) ── */}
      <HeroNav />

      <div className="flex flex-1 w-full pt-24">
        
        {/* ── 1. LEFT SIDEBAR (Only rendered for logged in users) ── */}
        {isAuthenticated && (
          <aside className="w-[280px] bg-white/75 backdrop-blur-xl border-r border-slate-100 flex flex-col p-6 shrink-0 h-[calc(100vh-96px)] sticky top-24 overflow-y-auto z-20">
            
            {/* Brand Logo Row in elegant Voyage Serif font */}
            <div className="flex items-center gap-3 mb-8">
              <Link href="/" className="font-voyage text-3xl text-[#2451D6] tracking-tight relative select-none">
                arcade<span className="text-[#ff6b4a]">.</span>
              </Link>
              <div className="ml-auto w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                <span className="text-[10px] text-slate-400">❮</span>
              </div>
            </div>

            {/* Menu Navigation List */}
            <nav className="space-y-1 mb-8">
              <span className="text-[10px] font-bold text-slate-400/80 tracking-wider block px-3 mb-2">MENU</span>
              
              <button 
                onClick={() => { setActiveCategory(null); router.push("/courses"); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                  !activeCategory ? "bg-blue-50/80 text-[#2451D6] shadow-[0_4px_12px_rgba(36,81,214,0.05)] font-bold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <BookOpen size={18} />
                <span>Courses</span>
              </button>
              
              <Link 
                href="/explore"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all text-left"
              >
                <Compass size={18} />
                <span>Explore</span>
              </Link>
              
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all text-left">
                <Flame size={18} />
                <span>Trending</span>
              </button>

              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all text-left">
                <Play size={18} />
                <span>My Learning</span>
              </button>

              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all text-left">
                <Heart size={18} />
                <span>Wishlist</span>
              </button>

              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all text-left">
                <Award size={18} />
                <span>Certificates</span>
              </button>

              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all text-left">
                <Map size={18} />
                <span>Career Paths</span>
              </button>

              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all text-left">
                <FileText size={18} />
                <span>Resources</span>
              </button>
            </nav>

            {/* Categories section */}
            <div className="mb-8">
              <span className="text-[10px] font-bold text-slate-400/80 tracking-wider block px-3 mb-3">CATEGORIES</span>
              <div className="space-y-1">
                {SIDEBAR_CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.name;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => {
                        setActiveCategory(cat.name);
                        router.push(`/courses?category=${encodeURIComponent(cat.name)}`);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                        isActive ? "bg-slate-50 text-slate-900" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <span 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ 
                          backgroundColor: cat.color,
                          boxShadow: isActive ? `0 0 6px ${cat.color}` : "none" 
                        }}
                      />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Learning Progress Card */}
            <div className="mt-auto bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-[24px] border border-blue-100/30 p-4 shadow-[0_8px_20px_rgba(36,81,214,0.02)]">
              <span className="text-xs font-bold text-slate-400 block mb-2.5">Learning Progress</span>
              
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3.2" />
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="16" 
                      fill="none" 
                      stroke="#2451D6" 
                      strokeWidth="3.2" 
                      strokeDasharray="100" 
                      strokeDashoffset="28" 
                      strokeLinecap="round"
                      style={{ filter: "drop-shadow(0 0 2px rgba(36,81,214,0.2))" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-black text-slate-800">72%</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-black text-slate-800 block">18 of 25 courses</span>
                  <button className="text-[10px] font-black text-[#2451D6] flex items-center gap-1 mt-1 hover:underline cursor-pointer">
                    Continue Learning <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            </div>

          </aside>
        )}

        {/* ── 2. MAIN HUB CONTENT ── */}
        <main className={`flex-grow p-8 overflow-y-auto relative z-10 ${!isAuthenticated ? "max-w-[1200px] mx-auto w-full px-6 md:px-12" : "max-w-[1200px]"}`}>
          
          {/* Top Header bar: Only visible for logged-in users with the sidebar layout */}
          {isAuthenticated && (
            <header className="flex items-center justify-between gap-6 mb-8">
              
              {/* Top Search bar wrapper */}
              <div className="flex-1 max-w-md relative flex items-center bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-[0_4px_16px_rgba(20,20,43,0.015)] focus-within:border-blue-400 focus-within:shadow-[0_4px_20px_rgba(36,81,214,0.06)] transition-all">
                <Search size={18} className="text-slate-400 mr-3" />
                <input 
                  type="text" 
                  placeholder="Search courses, topics or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-sm font-semibold text-slate-700 placeholder-slate-400"
                />
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 ml-2 select-none">⌘ K</span>
              </div>

              {/* User profile & notification */}
              <div className="flex items-center gap-4 shrink-0 animate-fade-in">
                <div className="relative w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors shadow-[0_4px_16px_rgba(20,20,43,0.015)]">
                  <Bell size={18} className="text-slate-500" />
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#2451D6] rounded-full border-2 border-white" />
                </div>

                <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-slate-50 transition-colors shadow-[0_4px_16px_rgba(20,20,43,0.015)]">
                  <img 
                    src={user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"} 
                    alt="Avatar" 
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                  <span className="text-xs font-bold text-slate-700">{user?.fullName || "Arun"}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
              </div>

            </header>
          )}

          {/* Hero Interactive Banner Card */}
          <section className="gradient-border-glow relative overflow-hidden rounded-[24px] bg-gradient-to-br from-blue-50/50 via-blue-100/30 to-[#EAF7EF]/20 border border-blue-100/40 p-8 sm:p-10 mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-pink-100/40 blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center relative z-10">
              
              {/* Left Content text */}
              <div className="md:col-span-3 space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black text-blue-700 bg-blue-50 border border-blue-100/50 tracking-wider uppercase">
                  🚀 Upgrade Your Skills
                </span>
                
                <h2 className="font-voyage text-5xl sm:text-6xl text-slate-900 tracking-tight leading-[1.05] mb-2">
                  <TrueFocus 
                    sentence="Discover. Learn. Grow."
                    manualMode={false}
                    blurAmount={3}
                    borderColor="#2451D6"
                    glowColor="rgba(36, 81, 214, 0.4)"
                    animationDuration={0.8}
                    pauseBetweenAnimations={1.5}
                  />
                </h2>
                
                <p className="text-xs sm:text-sm font-semibold text-slate-500 leading-relaxed max-w-sm">
                  Explore curated courses to accelerate your career and unlock new opportunities.
                </p>

                {/* In-banner dynamic search field */}
                <div className="flex items-center bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-[0_12px_24px_-10px_rgba(36,81,214,0.08)] max-w-md">
                  <Search size={18} className="text-slate-400 mr-3" />
                  <input 
                    type="text" 
                    placeholder="Search for courses, topics..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-700 placeholder-slate-400"
                  />
                </div>

                {/* Popular searches tags selection */}
                <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                  <span className="text-slate-400 font-bold">Popular Searches:</span>
                  {["React", "Python", "UI/UX", "AI", "Node.js"].map((tag) => (
                    <button 
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-3 py-1 rounded-lg bg-white border border-slate-100 hover:border-blue-400 hover:text-[#2451D6] font-semibold text-slate-500 shadow-sm transition-all cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Character Illustrator Graphic */}
              <div className="md:col-span-2 flex justify-center items-center relative min-h-[180px]">
                <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-2xl animate-float-svg">
                  <circle cx="160" cy="50" r="14" fill="#2451D6" opacity="0.8" />
                  <path d="M153,46 L167,54 M167,46 L153,54" stroke="#ffffff" strokeWidth="2.5" />
                  
                  <rect x="20" y="80" width="36" height="24" rx="4" fill="#ffffff" />
                  <line x1="26" y1="96" x2="26" y2="88" stroke="#10b981" strokeWidth="2.5" />
                  <line x1="32" y1="96" x2="32" y2="84" stroke="#10b981" strokeWidth="2.5" />
                  <line x1="38" y1="96" x2="38" y2="92" stroke="#10b981" strokeWidth="2.5" />

                  <rect x="50" y="70" width="100" height="66" rx="8" fill="#e2e8f0" />
                  <rect x="56" y="76" width="88" height="54" rx="4" fill="#1e1b4b" />
                  
                  <text x="62" y="88" fill="#ec4899" fontSize="6.5" fontFamily="monospace">const dev = () =&gt; &#123;</text>
                  <text x="68" y="96" fill="#60a5fa" fontSize="6.5" fontFamily="monospace">  learn();</text>
                  <text x="62" y="104" fill="#ec4899" fontSize="6.5" fontFamily="monospace">&#125;</text>

                  <circle cx="100" cy="50" r="18" fill="#fcd34d" />
                  <circle cx="95" cy="46" r="1.5" fill="#1e293b" />
                  <circle cx="105" cy="46" r="1.5" fill="#1e293b" />
                  <path d="M96,54 Q100,58 104,54" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M82,46 C82,34 94,30 100,32 C106,30 118,34 118,46 Z" fill="#1e293b" />
                </svg>
              </div>

            </div>
          </section>

          {/* Popular Courses Section */}
          <section className="mb-10">
            <div className="flex items-center justify-between gap-6 mb-6">
              <h3 className="font-voyage text-3xl text-slate-800 tracking-tight">Popular Courses</h3>
              <button 
                onClick={() => setSearchQuery("")}
                className="text-xs font-bold text-[#2451D6] hover:text-blue-700 flex items-center gap-1 hover:underline cursor-pointer font-sans"
              >
                Explore all courses <ArrowRight size={14} />
              </button>
            </div>

            {/* Courses grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="wait">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => {
                    const isWishlisted = !!wishlistedCourses[course.id];
                    return (
                      <motion.div
                        key={course.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="courses-card-item group bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(20,20,43,0.01)] overflow-hidden flex flex-col"
                      >
                        {/* Course Cover Graphic */}
                        <div className="h-44 relative overflow-hidden shrink-0">
                          <CourseCoverIllustration type={course.illustration} />
                          
                          {/* Wishlist toggle */}
                          <button 
                            onClick={() => toggleWishlist(course.id)}
                            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-100/50 shadow-md flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all z-10"
                          >
                            <Heart size={15} className={isWishlisted ? "fill-red-500 stroke-red-500 text-red-500" : "text-slate-400"} />
                          </button>

                          {/* Best seller badge */}
                          {course.badge && (
                            <span className="absolute top-4 left-4 px-2.5 py-1 rounded-md text-[8.5px] font-black tracking-wider text-white bg-gradient-to-r from-[#2451D6] to-[#6366F1] shadow-sm uppercase z-10">
                              {course.badge}
                            </span>
                          )}
                        </div>

                        {/* Course Info block */}
                        <div className="p-5 flex-grow flex flex-col justify-between">
                          <div>
                            <h4 className="font-voyage text-2xl text-slate-800 tracking-tight leading-snug group-hover:text-[#2451D6] transition-colors duration-200">
                              {course.title}
                            </h4>
                            <p className="text-xs text-slate-400 font-semibold leading-relaxed mt-2 line-clamp-2">
                              {course.description}
                            </p>

                            {/* Stats Row */}
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mt-4 pb-4 border-b border-slate-50 select-none">
                              <span className="flex items-center gap-1 text-slate-500">
                                <Star size={13} className="text-amber-500 fill-amber-500" />
                                {course.rating} <span className="text-slate-400">({course.ratingCount})</span>
                              </span>
                              <span>{course.lessons} Lessons</span>
                              <span>{course.students} Students</span>
                            </div>
                          </div>

                          {/* Author / Buy CTA row */}
                          <div className="flex items-center justify-between gap-4 mt-4">
                            <div className="flex items-center gap-2">
                              <img 
                                src={course.author.avatar} 
                                alt={course.author.name} 
                                className="w-6 h-6 rounded-full object-cover border border-slate-100"
                              />
                              <span className="text-[11px] font-bold text-slate-500">{course.author.name}</span>
                            </div>
                            <button 
                              onClick={() => handleEnrollClick(course.title)}
                              className="px-4 py-1.5 rounded-xl bg-blue-50 hover:bg-[#2451D6] text-[#2451D6] hover:text-white font-bold text-xs transition-colors duration-200 cursor-pointer shadow-sm"
                            >
                              {course.price}
                            </button>
                          </div>
                        </div>

                      </motion.div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-100 rounded-[24px] bg-slate-50/30 text-slate-400 font-semibold text-sm">
                    No courses found matching your selections.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Trending Now Section */}
          <section>
            <div className="flex items-center justify-between gap-6 mb-6">
              <h3 className="font-voyage text-3xl text-slate-800 tracking-tight">Trending Now</h3>
              <button className="text-xs font-bold text-[#2451D6] hover:text-blue-700 flex items-center gap-1 hover:underline cursor-pointer">
                View all <ArrowRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TRENDING_COURSES.map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <div 
                    key={idx} 
                    className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-[0_4px_24px_rgba(20,20,43,0.01)] hover:border-blue-100 hover:shadow-[0_8px_30px_rgba(36,81,214,0.04)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between min-h-[160px] cursor-default"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white shadow-sm"
                        style={{ backgroundColor: item.bgColor }}
                      >
                        <ItemIcon size={18} style={{ color: item.color }} />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 block tracking-wide uppercase">{item.category}</span>
                        <span className="text-[11px] font-bold text-slate-500 block mt-0.5">{item.duration}</span>
                      </div>
                    </div>

                  <div className="mt-4 flex-grow flex flex-col justify-between">
                    <h4 className="font-voyage text-xl text-slate-800 tracking-tight leading-snug">
                      {item.title}
                    </h4>
                    
                    <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400 mt-3 select-none">
                      <span className="flex items-center gap-1">
                        <Star size={11} className="text-amber-500 fill-amber-500" />
                        {item.rating}
                      </span>
                      <span 
                        onClick={() => handleEnrollClick(item.title)}
                        className="text-[#2451D6] cursor-pointer hover:underline"
                      >
                        Enroll Now
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

    </div>
  </div>
);
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center text-sm font-semibold text-slate-400">Loading courses dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
