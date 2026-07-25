'use client';

import { useState, useEffect } from 'react';
import { useThemeStore } from '@/infrastructure/state/theme.store';
import { motion } from 'framer-motion';
import { Sun, Moon, Maximize2, Monitor } from 'lucide-react';
import { toast } from 'sonner';

export default function AppearancePage() {
  const { theme, toggleTheme } = useThemeStore();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        toast.info('Press F11 on your keyboard to enter fullscreen mode');
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Theme Preferences Row with Toggle Button */}
      <div className="py-3.5 px-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Theme Mode</h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Currently active: <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">{theme} Theme</span>
            </p>
          </div>
        </div>

        {/* Segmented Pill Toggle Switch */}
        <div className="flex items-center p-1 rounded-full bg-slate-100 dark:bg-neutral-800 border border-slate-200/60 dark:border-neutral-700 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (theme === 'dark') toggleTheme();
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
              theme === 'light'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sun size={14} className={theme === 'light' ? 'text-amber-500' : ''} />
            Light
          </button>

          <button
            type="button"
            onClick={() => {
              if (theme === 'light') toggleTheme();
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-neutral-900 text-white shadow-xs border border-neutral-700'
                : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Moon size={14} className={theme === 'dark' ? 'text-indigo-400' : ''} />
            Dark
          </button>
        </div>
      </div>

      {/* Fullscreen Experience / F11 Section */}
      <div className="py-3.5 px-4 rounded-2xl border border-indigo-200/70 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
            <Maximize2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Immersive Fullscreen Mode</h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Press <kbd className="px-2 py-0.5 text-xs font-mono font-bold bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded shadow-xs text-slate-800 dark:text-neutral-200">F11</kbd> for a better experience.
            </p>
          </div>
        </div>
        <button
          onClick={toggleFullscreen}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-2"
        >
          <Maximize2 size={13} />
          {isFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen'}
        </button>
      </div>
    </motion.div>
  );
}
