'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Bell, User, Tv, BookOpen, Settings, Compass, LogOut, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthService } from '@/infrastructure/auth/auth.service';

export default function LearnerNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, status } = useAuthStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Intelligent header scroll behavior
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Only hide after 150px of downward scroll to avoid triggering at the very top
    if (latest > 150 && latest > lastY) {
      setHidden(true);
      setMenuOpen(false);
    } else {
      setHidden(false);
    }
    setLastY(latest);
  });

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (/\/learn\/[^/]+\/exam\/(start|terminated)\/?$/.test(pathname)) {
    return null;
  }

  const handleSignOut = async () => {
    setMenuOpen(false);
    try {
      await AuthService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    useAuthStore.getState().clearAuth();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('arcade-auth-storage');
    }
    router.push('/');
  };

  const displayName = user?.email || user?.username || user?.firstName || user?.fullName || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <motion.div 
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: -20, opacity: 0 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-6 left-0 right-0 z-40 flex w-full items-center justify-between px-4 md:px-8 pointer-events-none"
    >
      {/* Left Island: Branding & Circular Back Button */}
      <div className="pointer-events-auto flex items-center gap-3">
        <div className="flex h-12 shrink-0 items-center rounded-full px-5 apple-glass-dock">
          <Link href="/" className="group flex cursor-pointer items-center">
            <Image
              src="/arcade.svg"
              alt="Arcade"
              width={85}
              height={24}
              className="h-6 w-auto transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </Link>
        </div>

        {pathname !== '/' && (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-12 w-12 items-center justify-center rounded-full apple-glass-dock text-slate-700 dark:text-neutral-200 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer select-none active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-neutral-300" strokeWidth={1.8} />
          </button>
        )}
      </div>

      {/* Right Island: Notifications & User Profile Menu */}
      <div className="pointer-events-auto flex items-center gap-3 relative" ref={menuRef}>
        {/* Notification Bell */}
        <Link
          href="/notifications"
          className="flex h-12 w-12 items-center justify-center rounded-full apple-glass-dock text-slate-700 dark:text-neutral-200 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer select-none active:scale-95"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-slate-700 dark:text-neutral-300" strokeWidth={1.8} />
        </Link>

        {/* User Pill Trigger */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex h-12 items-center gap-3 rounded-full apple-glass-dock pl-5 pr-1.5 py-1.5 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer select-none focus:outline-none"
          aria-expanded={menuOpen}
        >
          <span className="max-w-[140px] truncate text-sm font-semibold text-slate-800 dark:text-neutral-100">
            {displayName}
          </span>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8c6753] text-sm font-bold text-white overflow-hidden shadow-sm">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </div>
        </button>

        {/* Dropdown Floating Pills */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute right-0 top-14 mt-2 flex flex-col gap-2 z-50 w-56 select-none"
            >
              {/* Profile */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push('/profile');
                }}
                className="flex w-full items-center justify-between rounded-full bg-white dark:bg-neutral-900 px-5 py-3 border border-slate-200/80 dark:border-neutral-800 shadow-[0_4px_16px_rgba(0,0,0,0.06)] text-sm font-semibold text-slate-800 dark:text-neutral-100 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all cursor-pointer"
              >
                <span>Profile</span>
                <User className="h-4 w-4 text-emerald-600" strokeWidth={2} />
              </button>

              {/* My Channel */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push('/manage-channels');
                }}
                className="flex w-full items-center justify-between rounded-full bg-white dark:bg-neutral-900 px-5 py-3 border border-slate-200/80 dark:border-neutral-800 shadow-[0_4px_16px_rgba(0,0,0,0.06)] text-sm font-semibold text-slate-800 dark:text-neutral-100 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all cursor-pointer"
              >
                <span>My Channel</span>
                <Tv className="h-4 w-4 text-[#f97316]" strokeWidth={2} />
              </button>

              {/* Content Studio */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push('/studio');
                }}
                className="flex w-full items-center justify-between rounded-full bg-white dark:bg-neutral-900 px-5 py-3 border border-slate-200/80 dark:border-neutral-800 shadow-[0_4px_16px_rgba(0,0,0,0.06)] text-sm font-semibold text-slate-800 dark:text-neutral-100 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all cursor-pointer"
              >
                <span>Content Studio</span>
                <BookOpen className="h-4 w-4 text-slate-800 dark:text-neutral-200" strokeWidth={2} />
              </button>

              {/* Settings */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push('/settings');
                }}
                className="flex w-full items-center justify-between rounded-full bg-white dark:bg-neutral-900 px-5 py-3 border border-slate-200/80 dark:border-neutral-800 shadow-[0_4px_16px_rgba(0,0,0,0.06)] text-sm font-semibold text-slate-800 dark:text-neutral-100 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all cursor-pointer"
              >
                <span>Settings</span>
                <Settings className="h-4 w-4 text-slate-500" strokeWidth={2} />
              </button>

              {/* Go to website */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push('/');
                }}
                className="flex w-full items-center justify-between rounded-full bg-white dark:bg-neutral-900 px-5 py-3 border border-slate-200/80 dark:border-neutral-800 shadow-[0_4px_16px_rgba(0,0,0,0.06)] text-sm font-semibold text-slate-800 dark:text-neutral-100 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all cursor-pointer"
              >
                <span>Go to website</span>
                <Compass className="h-4 w-4 text-slate-700 dark:text-neutral-300" strokeWidth={2} />
              </button>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="flex w-full items-center justify-between rounded-full bg-white dark:bg-neutral-900 px-5 py-3 border border-slate-200/80 dark:border-neutral-800 shadow-[0_4px_16px_rgba(0,0,0,0.06)] text-sm font-semibold text-rose-600 hover:bg-rose-50/70 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
              >
                <span>Sign out</span>
                <LogOut className="h-4 w-4 text-rose-500" strokeWidth={2} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
