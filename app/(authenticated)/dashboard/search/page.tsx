'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';

export default function SearchPage() {
  const [username, setUsername] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchUsername = username.trim();
    if (!searchUsername) return;
    
    setIsSearching(true);
    
    const currentUserUsername = user?.username || user?.email?.split('@')[0];
    
    // Add a tiny delay for aesthetic loading effect before routing
    // Tailwind JIT trigger comment
    setTimeout(() => {
      if (currentUserUsername && searchUsername.toLowerCase() === currentUserUsername.toLowerCase()) {
        router.push('/dashboard/profile');
      } else {
        router.push(`/${searchUsername}`);
      }
    }, 400);
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[70vh] px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      
      {/* Search Header Container */}
      <div className="text-center mb-10 max-w-xl w-full">
        <motion.div 
          className="mx-auto h-20 w-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-indigo-100/50"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, type: 'spring', stiffness: 200 }}
        >
          <Search size={32} className="text-indigo-600" />
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight mb-4">
          Find Developer Profiles
        </h1>
        <p className="text-slate-500 font-medium text-lg max-w-md mx-auto leading-relaxed">
          Search for other developers in the Arcade community by entering their exact username.
        </p>
      </div>

      {/* Search Input Container */}
      <motion.form 
        onSubmit={handleSearch}
        className="w-full max-w-2xl relative"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="relative group flex items-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl transition-all duration-300 hover:shadow-[0_8px_40px_rgb(99,102,241,0.12)]">
          
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <UserIcon size={22} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          </div>
          
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="block w-full pl-14 pr-32 py-5 sm:py-6 text-lg font-bold text-slate-800 bg-white border-2 border-transparent rounded-2xl ring-0 outline-none focus:border-indigo-100 focus:bg-indigo-50/10 transition-all placeholder:text-slate-300 placeholder:font-medium"
            placeholder="Type a username... (e.g. anandhu4)"
            autoComplete="off"
            autoFocus
          />
          
          <div className="absolute inset-y-0 right-2 flex items-center">
            <button
              type="submit"
              disabled={!username.trim() || isSearching}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-md shadow-indigo-200 cursor-pointer"
            >
              {isSearching ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Search
                  <ArrowRight size={18} className="hidden sm:block" />
                </>
              )}
            </button>
          </div>
          
        </div>
        
        {/* Glow behind the input */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[18px] blur opacity-0 group-focus-within:opacity-20 transition duration-1000 group-hover:duration-200 z-[-1]"></div>
      </motion.form>

      {/* Helper text */}
      <motion.div 
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Public profiles only
        </div>
      </motion.div>

    </motion.div>
  );
}
