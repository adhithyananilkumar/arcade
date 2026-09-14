'use client';

import { useState } from 'react';
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  Calendar,
  AlertCircle,
  Star,
  Users,
  Lightbulb,
  Rocket,
  ArrowRight,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { EmptyState } from './EmptyState';

export interface AIInsightItem {
  id: string;
  type: 'WARNING' | 'SUCCESS' | 'TIP' | 'MAINTENANCE' | 'PROMOTION' | 'STAFF' | 'DEMAND' | 'GROWTH';
  title: string;
  insight: string;
  actionText: string;
  impact: string;
}

const mockInsights: AIInsightItem[] = [];

const styleMap = {
  WARNING: { bg: 'bg-rose-50/80 border-rose-200/80', icon: TrendingDown, color: 'text-rose-600', badge: 'bg-rose-100 text-rose-700' },
  SUCCESS: { bg: 'bg-emerald-50/80 border-emerald-200/80', icon: TrendingUp, color: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  TIP: { bg: 'bg-indigo-50/80 border-indigo-200/80', icon: Calendar, color: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700' },
  MAINTENANCE: { bg: 'bg-amber-50/80 border-amber-200/80', icon: AlertCircle, color: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
  PROMOTION: { bg: 'bg-purple-50/80 border-purple-200/80', icon: Star, color: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
  STAFF: { bg: 'bg-teal-50/80 border-teal-200/80', icon: Users, color: 'text-teal-600', badge: 'bg-teal-100 text-teal-700' },
  DEMAND: { bg: 'bg-sky-50/80 border-sky-200/80', icon: Lightbulb, color: 'text-sky-600', badge: 'bg-sky-100 text-sky-700' },
  GROWTH: { bg: 'bg-fuchsia-50/80 border-fuchsia-200/80', icon: Rocket, color: 'text-fuchsia-600', badge: 'bg-fuchsia-100 text-fuchsia-700' },
};

export function AIInsightsPanel() {
  const [insights, setInsights] = useState<AIInsightItem[]>(mockInsights);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const handleExecuteAction = (item: AIInsightItem) => {
    setCompletedIds([...completedIds, item.id]);
    toast.success(`Executing AI recommendation: "${item.actionText}"`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-900 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
            <Sparkles size={24} className="text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight">
                Arcade AI Copilot Insights & Recommendations
              </h2>
              <span className="rounded-full bg-indigo-500/30 px-2.5 py-0.5 text-[10px] font-bold border border-indigo-300/30 text-indigo-200">
                GPT-4o Engine
              </span>
            </div>
            <p className="mt-1 text-xs text-indigo-200/80 font-medium">
              Real-time automated optimization recommendations for content, staff allocation, and revenue growth
            </p>
          </div>
        </div>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
        {insights.length === 0 && <EmptyState title="No contents" message="No AI insights generated yet." />}
        {insights.length > 0 && insights.map((item) => {
          const config = styleMap[item.type];
          const Icon = config.icon;
          const isDone = completedIds.includes(item.id);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`group relative overflow-hidden rounded-3xl border ${config.bg} p-6 shadow-xs transition-all duration-300 hover:shadow-md flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-2xs border border-black/5 ${config.color}`}>
                      <Icon size={18} />
                    </span>
                    <h3 className="text-sm font-extrabold text-[#14142b]">{item.title}</h3>
                  </div>

                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${config.badge}`}>
                    {item.impact}
                  </span>
                </div>

                <p className="mt-3.5 text-xs font-medium leading-relaxed text-slate-700">
                  {item.insight}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">AI Confidence: 98%</span>
                <button
                  type="button"
                  disabled={isDone}
                  onClick={() => handleExecuteAction(item)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all active:scale-[0.98] ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#14142b] text-white hover:bg-indigo-900 shadow-xs'
                  }`}
                >
                  {isDone ? (
                    <>
                      <Check size={14} /> Applied
                    </>
                  ) : (
                    <>
                      <span>{item.actionText}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
