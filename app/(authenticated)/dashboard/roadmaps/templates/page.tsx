"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Filter, Star, Map, Clock, Play } from "lucide-react";
import { roadmapTemplateService } from "@/domains/roadmaps";
import { roadmapService } from "@/domains/roadmaps";
import type { RoadmapTemplateData } from "@/domains/roadmaps";
import { CATEGORIES, DIFFICULTIES } from "@/domains/roadmaps";

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<RoadmapTemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");

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
      setTemplates(templates.map(t => t.id === id ? { ...t, favorite: !t.favorite } : t));
    } catch (e) {
      alert("Failed to toggle favorite");
    }
  };

  const handleCreateFromTemplate = async (id: string) => {
    try {
      const roadmap = await roadmapService.createFromTemplate(id);
      router.push(`/dashboard/roadmaps/${roadmap.id}/edit`);
    } catch (e) {
      alert("Failed to create roadmap from template");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Link href="/dashboard/roadmaps" className="text-gray-400 hover:text-gray-600">
               <ArrowLeft size={20} />
             </Link>
             <div>
              <h1 className="text-xl font-bold text-gray-900">Template Library</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Browse and use pre-built roadmap templates
              </p>
             </div>
          </div>
        </div>
      </header>

      <div className="border-b border-gray-200 bg-gray-50/50 px-8 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search templates..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none bg-white"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none bg-white"
            >
              <option value="">All Difficulties</option>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      <main className="flex-1 px-8 py-8 max-w-6xl mx-auto w-full">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse h-48" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md mx-auto mt-10 text-red-700">
            {error}
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Map size={24} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">No templates found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search query.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <div key={template.id} className="group bg-white rounded-2xl border border-gray-200 hover:border-indigo-200 hover:shadow-lg transition-all p-5 flex flex-col relative overflow-hidden">
                <button 
                  onClick={(e) => handleToggleFavorite(template.id, e)}
                  className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur shadow-sm hover:bg-gray-50"
                >
                  <Star size={16} className={template.favorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"} />
                </button>
                <div className="mb-3 flex gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                    {template.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-700">
                    {template.difficulty}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight">{template.name}</h3>
                {template.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed flex-1">
                    {template.description}
                  </p>
                )}
                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-600 border border-gray-100 rounded">
                        #{tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 rounded">
                        +{template.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex flex-col text-[10px] text-gray-400">
                    <span>By {template.createdByName}</span>
                  </div>
                  <button 
                    onClick={() => handleCreateFromTemplate(template.id)}
                    className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    <Play size={12} className="fill-current" /> Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
