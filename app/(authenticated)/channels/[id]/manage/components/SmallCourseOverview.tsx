'use client';

import { useState } from 'react';
import {
  BookOpen,
  Users,
  Star,
  TrendingUp,
  Award,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SmallCourseOverviewProps {
  onNavigateToCatalog: () => void;
  onAddCourse?: () => void;
}

export function SmallCourseOverview({ onNavigateToCatalog, onAddCourse }: SmallCourseOverviewProps) {
  const topCourses = [
    {
      id: 'c1',
      title: 'AI Agent Architecture & Tool Use Masterclass',
      category: 'AI & Data Science',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      addedByStaff: {
        name: 'Dr. Sarah Chen',
        role: 'Lead AI Scientist',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      },
      enrolled: '8,420 enrolled',
      completion: '98.4%',
      rating: 4.98,
    },
    {
      id: 'c2',
      title: 'Prompt Engineering & Context Window Optimization',
      category: 'Generative AI',
      thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80',
      addedByStaff: {
        name: 'Alex Rivera',
        role: 'Senior Prompt Engineer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      },
      enrolled: '12,400 enrolled',
      completion: '91.2%',
      rating: 4.92,
    },
    {
      id: 'c3',
      title: 'Neural Networks & Deep Learning from Scratch in Python',
      category: 'Educational Engineering',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
      addedByStaff: {
        name: 'Prof. Michael Vance',
        role: 'Head of Curriculum',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      },
      enrolled: '6,850 enrolled',
      completion: '88.5%',
      rating: 4.96,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Featured Courses Spotlight List */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-black text-[#14142b]">Top Performing Courses</h3>
            <p className="text-xs font-semibold text-slate-400">Highest enrolled & rated courses created by faculty</p>
          </div>

          <button
            type="button"
            onClick={onNavigateToCatalog}
            className="text-xs font-extrabold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <span>View All Courses</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {topCourses.map((c) => (
            <div
              key={c.id}
              onClick={onNavigateToCatalog}
              className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="relative h-32 w-full overflow-hidden rounded-xl bg-slate-900">
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                    {c.category}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-[#14142b] line-clamp-2 leading-snug">
                    {c.title}
                  </h4>
                </div>
              </div>

              {/* Staff Attribution Footer */}
              <div className="mt-4 border-t border-slate-200/60 pt-3 flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={c.addedByStaff.avatar}
                    alt=""
                    className="h-6 w-6 rounded-full object-cover border border-indigo-200 shrink-0"
                  />
                  <span className="truncate text-slate-600 font-bold text-[11px]">
                    {c.addedByStaff.name}
                  </span>
                </div>

                <div className="text-right shrink-0 text-[11px] font-extrabold">
                  <span className="text-emerald-600">{c.completion}</span>
                  <span className="text-slate-300 mx-1">·</span>
                  <span className="text-amber-600">{c.rating} ★</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
