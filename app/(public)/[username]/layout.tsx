'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function PublicProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#f8fafc] text-slate-900 font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-indigo-200/30 to-purple-200/30 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-200/20 to-emerald-200/20 blur-3xl pointer-events-none z-0" />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        {/* Top Navbar */}
        <nav className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white/70 px-6 md:px-8 backdrop-blur-md">
          {/* Left: Arcade Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/arcade.svg"
                alt="Arcade"
                width={90}
                height={26}
                className="h-6 w-auto transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </Link>
          </div>
          
          {/* Right: Login Button */}
          <div className="flex items-center gap-4">
            <Link
              href="/sign"
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer shadow-md"
              style={{ fontFamily: 'var(--font-geist-sans)' }}
            >
              Login
            </Link>
          </div>
        </nav>
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
