"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Filter,
  Star,
  Map,
  Clock,
  Play,
  Sparkles,
  ChevronDown,
  Check,
} from "lucide-react";
import { roadmapTemplateService } from "@/domains/roadmaps";
import { roadmapService } from "@/domains/roadmaps";
import type { RoadmapTemplateData } from "@/domains/roadmaps";
import { CATEGORIES, DIFFICULTIES } from "@/domains/roadmaps";
import { motion, AnimatePresence } from "framer-motion";

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<RoadmapTemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [difficultyOpen, setDifficultyOpen] = useState(false);

  const fetchTemplates = () => {
    setLoading(true);
    roadmapTemplateService
      .getAllTemplates({ search, category, difficulty })
      .then((data) => {
        setTemplates(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTemplates();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, difficulty]);

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await roadmapTemplateService.toggleFavorite(id);
      setTemplates(templates.map((t) => (t.id === id ? { ...t, favorite: !t.favorite } : t)));
    } catch {
      alert("Failed to toggle favorite");
    }
  };

  const handleCreateFromTemplate = async (id: string) => {
    try {
      const roadmap = await roadmapService.createFromTemplate(id);
      router.push(`/studio/roadmap/${roadmap.id}/edit`);
    } catch {
      alert("Failed to create roadmap from template");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#121212] min-h-screen">
      {/* ── Sticky Navigation Header & Filter Bar ───────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-white dark:bg-[#121212] border-b border-[#dadce0] dark:border-[#3c4043]">
        <header className="bg-white dark:bg-[#202124]">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-4">
            <div>
              <Link
                href="/studio"
                className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#64748b] dark:text-[#9aa0a6] hover:text-[#a142f4] dark:hover:text-[#c084fc] transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Content Studio
              </Link>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#0f172a] via-[#a142f4] to-[#0284c7] dark:from-[#e2e8f0] dark:via-[#c084fc] dark:to-[#38bdf8] bg-clip-text text-transparent">
                  Template Library
                </h1>
                <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#f3e8ff] dark:bg-[#341d4a]/80 text-[#a142f4] dark:text-[#c084fc] border border-[#a142f4]/20 text-xs font-bold shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a142f4] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#a142f4]"></span>
                  </span>
                  <span>Pre-built Roadmaps</span>
                </div>
              </div>
              <p className="text-sm text-[#64748b] dark:text-[#9aa0a6] mt-1.5">
                Browse and clone industry-standard interactive roadmap templates for your course paths.
              </p>
            </div>

            {/* Search & Custom Popover Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex items-center">
                <Search size={18} className="absolute left-3.5 text-[#64748b] dark:text-[#9aa0a6]" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2.5 text-sm rounded-full bg-[#f1f3f4] dark:bg-[#2d2d2d] border border-transparent focus:border-[#a142f4] focus:bg-white dark:focus:bg-[#202124] text-[#0f172a] dark:text-[#e8eaed] outline-none transition-all"
                />
              </div>

              {/* Custom Category Filter Popover */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setCategoryOpen((v) => !v);
                    setDifficultyOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-full border border-[#cbd5e1] dark:border-[#5f6368] bg-white dark:bg-[#202124] px-4 py-2.5 text-sm font-semibold text-[#334155] dark:text-[#e8eaed] hover:bg-[#f8f9fa] dark:hover:bg-[#2d2d2d] shadow-2xs transition-all active:scale-[0.98]"
                >
                  <Filter size={15} className="text-[#a142f4]" />
                  <span>{category ? category : "All Categories"}</span>
                  <ChevronDown size={15} className={`transition-transform duration-200 text-gray-400 ${categoryOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {categoryOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setCategoryOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#202124] rounded-2xl shadow-xl border border-[#dadce0] dark:border-[#3c4043] p-1.5 z-40 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setCategory("");
                            setCategoryOpen(false);
                          }}
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                            !category
                              ? "bg-[#f3e8ff] dark:bg-[#341d4a]/50 text-[#a142f4] dark:text-[#c084fc]"
                              : "text-[#3c4043] dark:text-[#e8eaed] hover:bg-[#f1f3f4] dark:hover:bg-[#2d2d2d]"
                          }`}
                        >
                          <span>All Categories</span>
                          {!category && <Check size={14} className="text-[#a142f4]" />}
                        </button>
                        {CATEGORIES.map((c) => {
                          const isSel = category === c;
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                setCategory(c);
                                setCategoryOpen(false);
                              }}
                              className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                                isSel
                                  ? "bg-[#f3e8ff] dark:bg-[#341d4a]/50 text-[#a142f4] dark:text-[#c084fc]"
                                  : "text-[#3c4043] dark:text-[#e8eaed] hover:bg-[#f1f3f4] dark:hover:bg-[#2d2d2d]"
                              }`}
                            >
                              <span>{c}</span>
                              {isSel && <Check size={14} className="text-[#a142f4]" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Custom Difficulty Filter Popover */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setDifficultyOpen((v) => !v);
                    setCategoryOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-full border border-[#cbd5e1] dark:border-[#5f6368] bg-white dark:bg-[#202124] px-4 py-2.5 text-sm font-semibold text-[#334155] dark:text-[#e8eaed] hover:bg-[#f8f9fa] dark:hover:bg-[#2d2d2d] shadow-2xs transition-all active:scale-[0.98]"
                >
                  <Filter size={15} className="text-[#0284c7]" />
                  <span>{difficulty ? difficulty : "All Difficulties"}</span>
                  <ChevronDown size={15} className={`transition-transform duration-200 text-gray-400 ${difficultyOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {difficultyOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setDifficultyOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#202124] rounded-2xl shadow-xl border border-[#dadce0] dark:border-[#3c4043] p-1.5 z-40 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setDifficulty("");
                            setDifficultyOpen(false);
                          }}
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                            !difficulty
                              ? "bg-[#e0f2fe] dark:bg-[#0c4a6e]/50 text-[#0284c7] dark:text-[#38bdf8]"
                              : "text-[#3c4043] dark:text-[#e8eaed] hover:bg-[#f1f3f4] dark:hover:bg-[#2d2d2d]"
                          }`}
                        >
                          <span>All Difficulties</span>
                          {!difficulty && <Check size={14} className="text-[#0284c7]" />}
                        </button>
                        {DIFFICULTIES.map((d) => {
                          const isSel = difficulty === d;
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => {
                                setDifficulty(d);
                                setDifficultyOpen(false);
                              }}
                              className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                                isSel
                                  ? "bg-[#e0f2fe] dark:bg-[#0c4a6e]/50 text-[#0284c7] dark:text-[#38bdf8]"
                                  : "text-[#3c4043] dark:text-[#e8eaed] hover:bg-[#f1f3f4] dark:hover:bg-[#2d2d2d]"
                              }`}
                            >
                              <span>{d}</span>
                              {isSel && <Check size={14} className="text-[#0284c7]" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* ── Scrollable Main Templates Grid ──────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#202124] rounded-[28px] border border-[#dadce0] dark:border-[#3c4043] p-6 animate-pulse"
                >
                  <div className="h-4 bg-[#f1f3f4] dark:bg-[#303134] rounded-md mb-3 w-3/4" />
                  <div className="h-3 bg-[#f1f3f4] dark:bg-[#303134] rounded-md mb-2 w-full" />
                  <div className="h-3 bg-[#f1f3f4] dark:bg-[#303134] rounded-md mb-6 w-2/3" />
                  <div className="flex justify-between items-center pt-4 border-t border-[#f1f3f4] dark:border-[#303134]">
                    <div className="h-5 w-20 bg-[#f1f3f4] dark:bg-[#303134] rounded-full" />
                    <div className="h-8 w-28 bg-[#f1f3f4] dark:bg-[#303134] rounded-full" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-3xl p-6 text-center max-w-md mx-auto my-10 text-red-700 dark:text-red-300 text-sm font-semibold"
            >
              {error}
            </motion.div>
          ) : templates.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 15, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-md mx-auto"
            >
              <div className="w-16 h-16 rounded-3xl bg-[#f3e8ff] dark:bg-[#341d4a]/60 text-[#a142f4] dark:text-[#c084fc] flex items-center justify-center mb-5 ring-8 ring-[#f3e8ff]/40 dark:ring-[#341d4a]/40 border border-[#a142f4]/20 shadow-md">
                <Map size={30} />
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] dark:text-[#e8eaed]">
                No templates found
              </h3>
              <p className="text-sm text-[#64748b] dark:text-[#9aa0a6] mt-1.5 leading-relaxed">
                No pre-built templates matched your selected category or search filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("");
                  setDifficulty("");
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#a142f4] to-[#c084fc] text-white text-sm font-semibold px-6 py-3 shadow-md hover:shadow-purple-500/25 transition-all active:scale-[0.98]"
              >
                Clear All Filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group bg-white dark:bg-[#202124] rounded-[28px] border border-[#dadce0] dark:border-[#3c4043] hover:border-[#a142f4]/50 dark:hover:border-[#c084fc]/50 hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between relative overflow-hidden h-full"
                >
                  {/* Dynamic Top Gradient Accent Line */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#a142f4] via-[#0284c7] to-[#06b6d4]" />

                  {/* Favorite Star Icon Button */}
                  <button
                    onClick={(e) => handleToggleFavorite(template.id, e)}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-[#2d2d2d]/80 backdrop-blur-xs shadow-2xs hover:scale-110 active:scale-95 transition-all border border-[#dadce0]/50 dark:border-[#5f6368]"
                    title="Toggle Favorite"
                  >
                    <Star
                      size={17}
                      className={
                        template.favorite
                          ? "fill-[#f59e0b] text-[#f59e0b]"
                          : "text-gray-400 dark:text-gray-500 hover:text-gray-600"
                      }
                    />
                  </button>

                  <div>
                    {/* Category & Difficulty Badges */}
                    <div className="mb-3.5 flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#f3e8ff] text-[#a142f4] dark:bg-[#341d4a]/80 dark:text-[#c084fc] border border-[#a142f4]/20">
                        {template.category}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#e0f2fe] text-[#0284c7] dark:bg-[#0c4a6e]/80 dark:text-[#38bdf8] border border-[#0284c7]/20">
                        {template.difficulty}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#0f172a] dark:text-[#e8eaed] mb-2 leading-snug line-clamp-2 group-hover:text-[#a142f4] dark:group-hover:text-[#c084fc] transition-colors">
                      {template.name}
                    </h3>

                    {template.description && (
                      <p className="text-sm text-[#64748b] dark:text-[#9aa0a6] line-clamp-2 leading-relaxed mb-4">
                        {template.description}
                      </p>
                    )}

                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs font-medium px-3 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="text-xs font-medium px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-full">
                            +{template.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-[#64748b] dark:text-[#9aa0a6] pt-3.5 border-t border-[#f1f3f4] dark:border-[#303134] mb-4">
                      <span>By {template.createdByName || "Studio Community"}</span>
                    </div>

                    <button
                      onClick={() => handleCreateFromTemplate(template.id)}
                      className="flex items-center justify-center gap-2 w-full rounded-full bg-gradient-to-r from-[#a142f4] to-[#c084fc] hover:from-[#8b2fc9] hover:to-[#a855f7] text-white text-sm font-semibold py-3 shadow-md hover:shadow-purple-500/25 transition-all active:scale-[0.98]"
                    >
                      <Play size={14} className="fill-current" /> Use Template
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
