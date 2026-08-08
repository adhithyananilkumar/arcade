'use client';

import { useState } from 'react';
import {
  Zap,
  Plus,
  BookOpen,
  FileText,
  Video,
  Rocket,
  UserPlus,
  Download,
  BarChart3,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface QuickActionPanelProps {
  onAddCourse?: () => void;
  onAddArticle?: () => void;
  onScheduleWebinar?: () => void;
  onCreateBootcamp?: () => void;
  onInviteStaff?: () => void;
  onDownloadReport?: () => void;
  onGenerateAnalytics?: () => void;
}

export function QuickActionPanel({
  onAddCourse,
  onAddArticle,
  onScheduleWebinar,
  onCreateBootcamp,
  onInviteStaff,
  onDownloadReport,
  onGenerateAnalytics,
}: QuickActionPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: 'Add Course',
      icon: BookOpen,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      onClick: onAddCourse || (() => toast.info('Opening Studio Course Creator...')),
    },
    {
      label: 'Add Article',
      icon: FileText,
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: onAddArticle || (() => toast.info('Opening Article Editor...')),
    },
    {
      label: 'Schedule Webinar',
      icon: Video,
      color: 'bg-sky-600 hover:bg-sky-700',
      onClick: onScheduleWebinar || (() => toast.info('Opening Webinar Scheduler...')),
    },
    {
      label: 'Create Bootcamp',
      icon: Rocket,
      color: 'bg-fuchsia-600 hover:bg-fuchsia-700',
      onClick: onCreateBootcamp || (() => toast.info('Opening Bootcamp Creator...')),
    },
    {
      label: 'Invite Staff',
      icon: UserPlus,
      color: 'bg-teal-600 hover:bg-teal-700',
      onClick: onInviteStaff || (() => toast.info('Opening Staff Invite Modal...')),
    },
    {
      label: 'Download Report',
      icon: Download,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      onClick: onDownloadReport || (() => toast.success('Exporting Executive Report...')),
    },
    {
      label: 'Generate Analytics',
      icon: BarChart3,
      color: 'bg-[#14142b] hover:bg-indigo-900',
      onClick: onGenerateAnalytics || (() => toast.info('Generating AI Analytics Summary...')),
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-3 flex flex-col gap-2 rounded-3xl border border-slate-200/80 bg-white/95 p-3 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 min-w-[220px]"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Quick Actions
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-1">
              {actions.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.label}
                    type="button"
                    onClick={() => {
                      act.onClick();
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <span className={`flex h-7 w-7 items-center justify-center rounded-xl text-white ${act.color}`}>
                      <Icon size={14} />
                    </span>
                    <span>{act.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-indigo-500/20"
        title="Quick Actions Toolbar"
      >
        <Zap size={22} className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : 'group-hover:scale-110'}`} />
      </button>
    </div>
  );
}
